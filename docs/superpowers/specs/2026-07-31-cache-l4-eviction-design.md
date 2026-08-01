# cache-l4-eviction — Design

> Slice L4 of the cache track ([spec §6](../../spec/prd/engine-cache-partial-rerender.md)).
> Closes the tier-B "monotonic orphan generator" known limit recorded on the
> cache-l3-tier-b Gate 2 card. Status: draft, pending Gate 1.

## 1. Problem

L2/L3 gave the node-cache real reads and writes but no mechanism ever deletes
anything. Five prompt edits on a tier-B node = five media-sized entries, one
reachable, zero eviction — disk grows monotonically (L3 card, item L4-a).
Separately, the DoD for the whole 1.1 track requires the partial-render ratio
to be *measurable* ("đo được % partial"), and today the engine never emits the
`node_cached` event the L0 pipe was built for: a cache hit dissolves silently
into `node_completed`, and nothing is persisted anywhere queryable.

## 2. Decisions (approved in brainstorm, 2026-07-31)

| # | Decision | Rejected alternatives |
|---|---|---|
| D-L4-1 | **Per-entry sidecar `meta.json` + end-of-run sweep.** Filesystem stays the single source of truth. | SQLite index (second source of truth that drifts from disk; multi-process locking); scope-encoding directory layout (breaks existing entries, tenant strings as path segments, still needs recency + blob GC anyway) |
| D-L4-2 | **Telemetry persists to the `tasks` table** (2 nullable integer columns, task-metering pattern) so `% partial` is one SQL query — the G1 demo and G2 gate read from here. | Engine-only counters (SSE events are not persisted; DoD "measurable" only half-met) |
| D-L4-3 | **`reuse=` ships `"auto"`/`"off"` only; `"force"` is descoped** (ledger entry, spec §7 amendment). | Full trio per spec D7 (force changes tier-B key computation for a debug feature with no user yet) |
| D-L4-4 | **No cross-process sweep locking.** Sweep/purge are best-effort; racing readers already treat any unusable entry as a miss. ccache-style lockfiles rejected. | Lockfile serialization (complexity; a stale lock would disable eviction silently) |

## 3. On-disk format

Current: `<root>/<key[:2]>/<key>/result.json` + shared `<root>/blobs/<sha[:2]>/<sha>`.

Added: `meta.json` next to `result.json`:

```json
{"v": 1, "tenant": "user:42", "workflow_scope": "wf:41:node:n7" }
```

- `workflow_scope` is `null` for tier A. It is the *same string* passed to
  `node_fingerprint` — written at `put()` time, since the opaque sha256 key
  cannot be reversed into scopes.
- **Blob references are NOT stored in meta.** They are derivable by walking
  `result.json` for `__cache_blob` keys — one derivation, no second copy to
  drift. (This is also what makes legacy entries GC-able.)
- Entry size = `stat()` of the entry dir's files; blob sizes counted once from
  the `blobs/` tree. No size field to go stale.
- **Legacy entries** (L2/L3-era, no `meta.json`): sweepable normally (recency =
  `result.json` mtime, blob refs from `result.json`); **purge skips them**
  (tenant unknown — documented limitation, they age out via LRU).

## 4. Sweep (LRU, size-capped)

`NodeCache.sweep(max_bytes, log)` — called once at the end of `run_workflow`
when the cache is active (`reuse="auto"` and tenant present). Runs even after a
failed run (maintenance is independent of run outcome).

Algorithm (refcount-simulated mark-and-sweep):

1. Walk entries: collect `(entry_dir, mtime(result.json), entry_bytes, blob_shas)`.
   Unreadable entry → victim candidate with `mtime=0` (evict first, never crash).
2. Build `blob → refcount` and `blob → size` from the `blobs/` tree. Blobs on
   disk referenced by *no* entry start at refcount 0 (pre-existing orphans —
   this is what retroactively closes the L3 orphan generator).
3. `usage = Σ entry_bytes + Σ blob sizes`. While `usage > max_bytes` and
   entries remain: evict the least-recently-used entry; `usage -=` its entry
   bytes plus every blob whose refcount drops to 0.
4. Physically delete evicted entry dirs, then every blob with refcount 0.
   **Orphan-blob GC is unconditional** — it runs on every sweep, including an
   under-cap sweep that evicts nothing (pre-existing orphans must not survive
   behind the cap condition; AC-2's no-op clause covers entries and referenced
   blobs only).
5. Any exception at any step: swallow, emit one `log` line, leave the run
   result untouched. The cache is never the source of truth.

**Logged swallow branches (closed list)**: (1) `get` finds an unusable entry
(miss), (2) `put` refused, (3) `sweep` failed, (4) `purge` failed — one log
line each per activation. **Explicit exemption**: the recency `os.utime` touch
failing on a hit stays silent — a read-only root would otherwise log once per
hit, and recency is advisory.

**Wired, not just written**: sweep being *called* is itself an acceptance
criterion (AC-16): an over-cap cache + `run_workflow(reuse="auto")` must leave
disk ≤ cap after the call returns — success and mid-run-failure cases — and the
cap chain must prove all three rungs (param beats env beats 20 GiB default).
Every other sweep eval drives `sweep()` unit-level; without this one, an
implementation that forgets the call site stays green (the L3 I1 lesson).

**Recency**: `get()` hit → `os.utime(result.json)` (failure ignored — see
exemption above). LRU is
least-recently-*used*, not FIFO — a hit must move an entry to the back of the
eviction queue, and the test proves the survivor set differs from insertion
order.

**Cap resolution**: `run_workflow(cache_max_bytes=...)` param → env
`TONGFLOW_CACHE_MAX_BYTES` → default `20 * 1024**3` (spec R2). The TS delegate
sends nothing (defaults apply on desktop).

## 5. Purge

`NodeCache.purge(tenant, workflow_id, log)` — engine-level Python API only (no
app/UI wiring in this slice). Walks entries, reads `meta.json`, deletes those
where `meta.tenant == tenant` and `workflow_scope` starts with
`"wf:<workflow_id>:"`, then runs the same blob GC. Best-effort: unreadable
meta → skip; second call → no error, nothing to do. Tier A (`workflow_scope:
null`), other workflows, other tenants: untouched.

## 6. `reuse=` API

`run_workflow(..., reuse="auto")`:

- `"auto"` (default): behavior as today + sweep at end.
- `"off"`: no `get`, no `put`, no sweep — the cache directory is byte-identical
  before and after; used by benchmarks (measure-harness) and forced regeneration.
  The result carries **no `cache` block** (columns stay NULL): a benchmark batch
  must not dilute the `% partial` denominator with fake 0% rows.
- Anything else: `ValueError` before any node executes (fail loud at the
  boundary, not a silent fallback to auto).
- `"force"` (spec D7): **descoped** — see D-L4-3.
- Not exposed through the TS delegate or UI (spec: "không phơi ra UI").

## 7. Telemetry — the `% partial` pipeline

**Engine (Python):**
- Per-call counters in the run loop: `calls_total` += 1 per plugin-call
  considered; `calls_cached` += 1 per call served from cache. A failed call is
  never counted cached (D8 already forbids caching it). Counting happens on
  both success and failure paths — the result block is present either way.
- Run result gains `"cache": {"calls_total": N, "calls_cached": M}`.
- **`node_cached` event, emitted for the first time**: when ALL of a node's
  calls hit the cache, emit the L0-pinned shape (`nodeId`, `feature`, `label`,
  `fingerprint` (first call's key), `tier`, `output` = merged results) *in
  addition to* `node_completed` (the existing completion flow stays untouched;
  `node_cached` is the signal layer). Partially-hit batch nodes emit only
  `node_completed` — partiality lives in the counters. The stale L2 comment in
  `runner.py` claiming emission already happens gets corrected by making it true.

**Delegate (TS):** `executeWorkflowViaEngine` reads `finalResult.cache` and
persists `cacheCallsTotal` / `cacheCallsCached` onto the task row in both
terminal updates (success and failure). Block absent (older engine, cache
off) → columns stay `NULL` — "not measured" stays distinguishable from
"measured zero" (same rule as `cost_usd`).

**DB:** `tasks` gains `cache_calls_total`, `cache_calls_cached` (nullable
integers; drizzle migration, task-metering pattern). The queryable metric:

```sql
SELECT SUM(cache_calls_cached) * 1.0 / SUM(cache_calls_total)
FROM tasks WHERE cache_calls_total IS NOT NULL;
```

## 8. Bundled L3 debts

1. **Test file split**: `sdk/tests/test_node_cache.py` (1101 lines) splits into
   `test_node_cache.py` (tier A / store, L2) + `test_node_cache_tier_b.py`
   (L3); new L4 tests land in `test_cache_sweep.py`. Config.yaml command
   *values* for moved node-ids update; eval ref *keys* stay unchanged
   (measure-harness precedent). A small guard asserts every declared cache
   node-id selects exactly one test and every cache test file is ≤ 800 lines.
2. **Stale comment fix** in `runner.py` (the L0 `node_cached` block) — made
   true by §7 rather than reworded.
3. **ABI drift guard both directions**: guard reddens when an ABI slot with
   nondeterminism knobs is missing from `TIER_B_SLOTS ∪ DESCOPED_GENERATIVE_SLOTS`
   *and* when a listed slot no longer exists in the ABI (today only the first
   direction is proven).
4. **L2 "cache swallows errors silently"**: `get`/`put`/`sweep`/`purge` accept
   an optional log callback; every swallowed exception emits one line.

## 9. Error handling summary

Every cache-side failure degrades to "behave as if there were no cache", now
with one log line instead of silence. The only loud failure in the whole slice
is `reuse=` validation (caller bug, not cache state). Sweep racing another
process: deletions vs. reads resolve as misses (existing `get()` contract);
a blob deleted between another process's mark and its entry-write self-heals on
the next run (miss → re-run → `put` rewrites the blob).

## 10. Re-signature cost (priced for Gate 1)

This slice edits files owned by cache-l1-fingerprint (`fingerprint.py` —
untouched actually; only if needed), cache-l2-store (`node_cache.py`,
`runner.py`, `test_node_cache.py`, `engine-delegate.server.ts`),
cache-l3-tier-b (same files + `test_node_cache.py` split), conformance-l0
(`runner.py`), task-metering (`workspace.schema.ts`, `metering-schema.test.ts`).
Expected: **fresh signatures for L2, L3, conformance-l0, task-metering** (and
L1 if `fingerprint.py`/its tests are touched by the split), carry-forward for
the rest — same shape as the L3 re-pin wave.

## 11. Out of scope

- `reuse="force"` (descoped, D-L4-3) · app/UI wiring for purge · cross-process
  sweep locking (D-L4-4) · per-tenant cap fairness (one global cap; a shared
  cloud disk lets one tenant's churn evict another's entries — known limit,
  revisit with cloud P2) · seed-pinning to move upscale slots to tier A ·
  TTL (Q3 closed it) · `mime`/`filename` in the digest (queue 1.1-L1b) ·
  `file_key_base` caching (queue 1.1-L2b).
