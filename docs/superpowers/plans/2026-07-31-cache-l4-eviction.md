# cache-l4-eviction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Size-capped LRU eviction + blob GC for the node-cache, `purge(tenant, workflow_id)`, `reuse=auto/off`, and the first real `% partial` telemetry (engine counters → `node_cached` event → two `tasks` columns).

**Architecture:** Per-entry sidecar `meta.json` (v1: tenant + workflow_scope) written at `put()`; recency = `result.json` mtime touched on hit; end-of-run `sweep()` does refcount-simulated mark-and-sweep over entries + shared blobs. Runner gains `reuse`/`cache_max_bytes` params, per-call counters, and full-hit `node_cached` emission; the TS delegate persists the counters. Contract: [_acceptance/cache-l4-eviction/contract.md](../../../_acceptance/cache-l4-eviction/contract.md) (16 AC), design: [2026-07-31-cache-l4-eviction-design.md](../specs/2026-07-31-cache-l4-eviction-design.md).

**Tech Stack:** Python (sdk engine, pytest via uv), TypeScript (Next.js, vitest, drizzle/SQLite).

## Global Constraints

- **Shapes come from real files, not transcribed snippets** (L3 preflight rule — L2's three fixture bugs all came from snippets). Fixture/helper shapes: read `sdk/tests/test_node_cache.py` (fake invoker + workflow builders) before writing any new test.
- **Every new test needs a mutation proof**: revert/mutate the guarded behavior → exactly that test reddens (record the mutation in the task's completion note).
- Code comments **English only**. No dict shims in plugins/SDK. Immutability defaults per repo style.
- SDK pytest runs via uv: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q <target>` — abbreviated below as `UVPY <target>`.
- Never `pnpm install` without `--frozen-lockfile`. Never run vitest from `sdk/` cwd (subshell rule, config.yaml:105).
- Eval refs in `_acceptance/config.yaml` are **keys** — values may change (measure-harness precedent), keys must not.
- `KEY_SCHEMA_VERSION` in `fingerprint.py` does **not** change in this slice (meta.json is storage-side, not key-side). Do not touch `test_fingerprint*.py` (keeps L1 on the carry-forward path).

---

### Task 1: Split cache test files + layout guard (AC-14)

**Files:**
- Modify: `sdk/tests/test_node_cache.py` (1101 lines → keep L2/tier-A/store tests)
- Create: `sdk/tests/test_node_cache_tier_b.py` (move L3/tier-B tests)
- Create: `scripts/cache/check-test-layout.sh`
- Modify: `_acceptance/config.yaml` (values of moved `sdk_pytest_l3_*` keys + `sdk_pytest_l3_l2_full_rerun`)

**Interfaces:**
- Produces: `test_node_cache_tier_b.py` holding every test whose config key starts `sdk_pytest_l3_` and lives in `test_node_cache.py` today, plus `test_tier_lists_are_disjoint_and_pinned` and the shared helpers they need (import from `test_node_cache.py` where possible; move helpers only if both files need them → then extract to `sdk/tests/cache_helpers.py`).
- Produces: guard script other tasks re-run after adding tests.

- [ ] **Step 1: Enumerate the move set.** `grep "sdk_pytest_l3_" _acceptance/config.yaml` → node-ids currently pointing at `tests/test_node_cache.py`. Move exactly those test functions (plus `test_git_status_failure_reads_as_dirty` which is l3-owned) into `test_node_cache_tier_b.py`. Shared fixtures/helpers: if used by both files, extract to `sdk/tests/cache_helpers.py` (plain module, no pytest magic) and import from both.
- [ ] **Step 2: Update config.yaml values** for each moved key: `tests/test_node_cache.py::X` → `tests/test_node_cache_tier_b.py::X`. Update `sdk_pytest_l3_l2_full_rerun` to run both files. Keys unchanged.
- [ ] **Step 3: Full suite green.** Run: `UVPY tests/` → same test count as before the split (~170), 0 failures. Also spot-run 3 moved node-ids via their exact config commands.
- [ ] **Step 4: Write the guard** `scripts/cache/check-test-layout.sh`:

```bash
#!/usr/bin/env bash
# AC-14 (cache-l4-eviction): cache test files stay <=800 lines, and every
# cache pytest node-id declared in _acceptance/config.yaml selects exactly
# one test. Discriminating by construction: --case options simulate both
# failure modes against a temp tree (see AC-14 for why nine-behind-one-exit
# is forbidden).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
fail() { echo "VIOLATION: $*" >&2; exit 1; }
# 1) line caps
for f in "$ROOT"/sdk/tests/test_node_cache.py "$ROOT"/sdk/tests/test_node_cache_tier_b.py "$ROOT"/sdk/tests/test_cache_sweep.py; do
  [ -f "$f" ] || continue
  lines=$(wc -l < "$f")
  [ "$lines" -le 800 ] || fail "$f has $lines lines (>800)"
done
# 2) every l2/l3/l4 node-id collects exactly one test
ids=$(grep -oE 'tests/[a-z_/]+\.py::[a-z_0-9]+' "$ROOT/_acceptance/config.yaml" | grep -E 'test_(node_cache|node_cache_tier_b|cache_sweep)' | sort -u)
cd "$ROOT/sdk"
while IFS= read -r id; do
  n=$(PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions \
      python -m pytest -q --collect-only "$id" 2>/dev/null | grep -c '::' || true)
  [ "$n" -eq 1 ] || fail "$id collects $n tests (want exactly 1)"
done <<< "$ids"
echo "OK: cache test layout"
```

- [ ] **Step 5: Guard mutations** (both must redden, then revert): (a) append 900 blank lines to a copy... no — mutate for real: temporarily add 801-line padding comment block to `test_node_cache_tier_b.py` → guard exits 1 with "lines"; (b) temporarily typo one node-id in a scratch copy of config — instead point the guard at a temp config containing a bogus id → exits 1 with "collects 0". Record both.
- [ ] **Step 6: Commit** `test: split cache tests into tier-A/tier-B files + layout guard (AC-14)`

**Verify:** `UVPY tests/` · `bash scripts/cache/check-test-layout.sh` · serves **E17** (plus keeps every `sdk_pytest_l2_*`/`l3_*` eval resolvable). `independent: false` (must land first — later tasks add tests under the caps).

---

### Task 2: `meta.json` + `NodeCache.sweep()` core (AC-1..AC-5)

**Files:**
- Modify: `sdk/tongflow/engine/node_cache.py`
- Create: `sdk/tests/test_cache_sweep.py`
- Test commands: config keys `sdk_pytest_l4_lru_recency` … `sdk_pytest_l4_legacy_entry`

**Interfaces:**
- Produces: `NodeCache.put(key, result, store, *, tenant: str | None = None, workflow_scope: str | None = None)` (backward-compatible keywords; writes `meta.json` `{"v":1,"tenant":...,"workflow_scope":...}` atomically next to `result.json`).
- Produces: `NodeCache.get(key, store, *, log=None)` touches `os.utime` on the hit's `result.json` (touch failure silent — AC-6 exemption).
- Produces: `NodeCache.sweep(max_bytes: int, log=None) -> None` — never raises.
- Produces module constant `DEFAULT_CACHE_MAX_BYTES = 20 * 1024**3` and helper `resolve_cache_max_bytes(param: int | None) -> int` (param → env `TONGFLOW_CACHE_MAX_BYTES` → default; non-int/≤0 env value → ignore env, log via caller at wiring time).

- [ ] **Step 1: Failing tests first** in `test_cache_sweep.py`. Build entries through the real `NodeCache` API (not hand-written JSON) — warm a store via `put()` with distinct keys/blobs, exactly as `test_node_cache.py` builds fixtures (read it first). Six tests:
  - `test_sweep_evicts_least_recently_used_first` — 3 entries over cap; oldest-created gets a `get()` (hit) after the others; assert survivor set = {recently-hit-old, newest}, evicted = the cold middle one. Assert via **disk stat** (entry dir existence), per contract rule.
  - `test_sweep_brings_usage_under_cap` — total bytes (entries+blobs walk) ≤ cap after sweep.
  - `test_sweep_under_cap_deletes_nothing` — fixture includes 1 orphan blob; after sweep: all entries + referenced blobs byte-identical (path+size listing equal), orphan **gone**.
  - `test_shared_blob_survives_eviction_of_one_referrer` — two entries share one blob (same bytes asset); evict one via cap pressure + recency; blob file remains; surviving entry `get()` returns bytes equal to original.
  - `test_orphan_blobs_deleted_including_pre_l4` — write a blob with no entry (simulate L2/L3 leftovers by `put()` then `shutil.rmtree` the entry dir); under-cap sweep removes it; over-cap sweep also removes orphans created by its own evictions.
  - `test_legacy_entry_without_meta_sweepable_and_purge_skips` — `put()` then delete `meta.json`; sweep evicts it cleanly when over cap; `purge()` (Task 3 — here just assert sweep half; extend in Task 3) leaves it alone. For Task 2 assert only the sweep half; mark the purge half TODO-free by asserting file survives a purge call once Task 3 lands (write the assertion in Task 3, not here).
- [ ] **Step 2: Run** `UVPY tests/test_cache_sweep.py` → all fail (`sweep` not defined / meta missing).
- [ ] **Step 3: Implement** in `node_cache.py`:

```python
_META_NAME = "meta.json"
DEFAULT_CACHE_MAX_BYTES = 20 * 1024**3

def resolve_cache_max_bytes(param: Optional[int]) -> int:
    if isinstance(param, int) and param > 0:
        return param
    env = os.environ.get("TONGFLOW_CACHE_MAX_BYTES", "").strip()
    if env.isdigit() and int(env) > 0:
        return int(env)
    return DEFAULT_CACHE_MAX_BYTES
```

  `put()` additionally writes meta via `_atomic_write(entry_dir / _META_NAME, json.dumps({"v": 1, "tenant": tenant, "workflow_scope": workflow_scope}).encode())` — inside the same try (a failed meta write refuses the entry: an entry purge can never see is worse than a miss). `get()` on success: `try: os.utime(entry_path) except OSError: pass`.

  `sweep(max_bytes, log=None)` (whole body inside `try/except Exception: _log_once(log, "sweep failed: ...")`):

```python
def sweep(self, max_bytes: int, log: Optional[Callable[[str], None]] = None) -> None:
    try:
        entries = []  # (mtime, entry_dir, entry_bytes, blob_shas)
        for result_json in self.root.glob("[0-9a-f][0-9a-f]/*/result.json"):
            entry_dir = result_json.parent
            try:
                payload = json.loads(result_json.read_text(encoding="utf-8"))
                shas = _blob_shas_of(payload)          # walk for _BLOB_KEY
                stat = result_json.stat()
                size = sum(p.stat().st_size for p in entry_dir.iterdir())
                entries.append((stat.st_mtime, entry_dir, size, shas))
            except Exception:
                entries.append((0.0, entry_dir, 0, ()))  # unreadable: evict first
        blob_sizes, refcount = {}, {}
        for blob in self.root.glob("blobs/[0-9a-f][0-9a-f]/*"):
            blob_sizes[blob.name] = blob.stat().st_size
            refcount[blob.name] = 0
        for _, _, _, shas in entries:
            for s in shas:
                if s in refcount:
                    refcount[s] += 1
        usage = sum(e[2] for e in entries) + sum(blob_sizes.values())
        victims = []
        entries.sort(key=lambda e: e[0])               # oldest mtime first
        for mtime, entry_dir, size, shas in entries:
            if usage <= max_bytes:
                break
            victims.append(entry_dir)
            usage -= size
            for s in shas:
                if s in refcount:
                    refcount[s] -= 1
                    if refcount[s] == 0:
                        usage -= blob_sizes.get(s, 0)
        for entry_dir in victims:
            shutil.rmtree(entry_dir, ignore_errors=True)
        surviving = set()
        for result_json in self.root.glob("[0-9a-f][0-9a-f]/*/result.json"):
            try:
                surviving.update(_blob_shas_of(json.loads(result_json.read_text(encoding="utf-8"))))
            except Exception:
                pass
        for blob in self.root.glob("blobs/[0-9a-f][0-9a-f]/*"):
            if blob.name not in surviving:            # unconditional orphan GC
                try: blob.unlink()
                except OSError: pass
    except Exception as e:
        if log is not None:
            log(f"cache sweep failed: {e}")
```

  `_blob_shas_of(node)` recursively collects `node[_BLOB_KEY]` strings (dict/list walk, same shape as `_rehydrate`).
- [ ] **Step 4: Run** `UVPY tests/test_cache_sweep.py` → PASS; `UVPY tests/` full suite green (existing `put()` callers use positional args — new params are keyword-only with defaults).
- [ ] **Step 5: Mutations** (each reddens exactly one test, then revert): (a) sort by `-mtime` (newest first) → recency test red; (b) skip orphan pass when `victims` empty → orphan test red; (c) gate orphan pass behind `usage > max_bytes` → under-cap-noop test red (orphan survives); (d) delete blobs unconditionally in victim loop ignoring refcount → shared-blob test red.
- [ ] **Step 6: Commit** `feat(sdk): node-cache meta sidecar + size-capped LRU sweep with blob GC (AC-1..5)`

**Verify:** `UVPY tests/test_cache_sweep.py` + full sdk suite + `bash scripts/cache/check-test-layout.sh`. Serves **E1–E6**. `independent: false`.

---

### Task 3: `purge()` + closed-list logging (AC-6, AC-7, AC-8)

**Files:**
- Modify: `sdk/tongflow/engine/node_cache.py`
- Modify: `sdk/tests/test_cache_sweep.py`

**Interfaces:**
- Produces: `NodeCache.purge(tenant: str, workflow_id: str, log=None) -> None` — never raises; deletes entries whose `meta.json` has `tenant == tenant` and `workflow_scope` startswith `f"wf:{workflow_id}:"`; then the same orphan-blob GC pass as sweep (extract shared helper `_collect_orphan_blobs()`; DRY, both callers).
- Produces: the four logged swallow branches (get-unusable→miss, put-refused, sweep-failed, purge-failed) each emit exactly one `log(...)` line per activation; `get`/`put` gain optional keyword `log=None`.

- [ ] **Step 1: Failing tests** — four:
  - `test_purge_removes_only_matching_workflow_entries` — one data_dir, entries: tier-B wf-1, tier-B wf-2 (same tenant), tier-A (scope None, same tenant), tier-B wf-1 (other tenant). Purge(tenant, "1") → only the first gone; the other three still **hit** via `get()` (positive check, per AC-7).
  - `test_purge_twice_safe_and_collects_orphans` — second call no raise, no further deletions (tree snapshot equal); blob solely referenced by the purged entry is gone after call 1.
  - `test_sweep_failure_never_breaks_the_run` — chmod 000 root (skip on Windows), sweep + purge return normally; restore perms.
  - `test_swallowed_cache_errors_emit_one_log_line` — a recording `log` callback: corrupt entry `get()` → 1 line; `put()` onto read-only root → 1 line; sweep/purge on broken root → 1 line each; a **hit with utime blocked** → 0 lines (exemption).
  Extend `test_legacy_entry_without_meta_sweepable_and_purge_skips` with the purge half (legacy entry survives purge).
- [ ] **Step 2: Run** → fail (`purge` undefined; no log lines).
- [ ] **Step 3: Implement.** `purge` mirrors sweep's walk; meta read failure → skip that entry (best-effort), log once per purge call at the end only if the call itself failed — per-entry skips are silent misses of the walk, not the closed-list branches. Wire `log` into `get`'s `except` (one line, still return None) and `put`'s `except` (one line, still return).
- [ ] **Step 4: Run** → PASS; full sdk suite green.
- [ ] **Step 5: Mutations:** (a) match scope with `in` instead of prefix (`"wf:1:" in scope`) — craft wf ids "1" vs "11": scope test red; (b) drop the second orphan-GC call in purge → idempotent/orphan test red; (c) log twice in `put` except → log-count test red.
- [ ] **Step 6: Commit** `feat(sdk): node-cache purge(tenant, workflow_id) + closed-list error logging (AC-6..8)`

**Verify:** `UVPY tests/test_cache_sweep.py` + full suite + layout guard. Serves **E7–E10** (+E6 purge half). `independent: false`.

---

### Task 4: Runner wiring — `reuse`, cap chain, counters, `node_cached`, end-of-run sweep (AC-9..12 engine half, AC-16)

**Files:**
- Modify: `sdk/tongflow/engine/runner.py`
- Modify: `sdk/tongflow/engine/__main__.py`
- Modify: `sdk/tests/test_cache_sweep.py`

**Interfaces:**
- Produces: `run_workflow(..., reuse: str = "auto", cache_max_bytes: Optional[int] = None)`. `reuse not in ("auto","off")` → `ValueError` raised **before** the preflight section. `"off"` → `node_cache = None` (single kill point — no get/put/sweep anywhere) **and** no `cache` block in the result.
- Produces: result key `"cache": {"calls_total": int, "calls_cached": int}` present iff `node_cache is not None`.
- Produces: `node_cached` emission — after a node's per-call loop, if `results` non-empty and **every** call was a hit, emit the L0 shape (`fingerprint` = first hit's key, `tier` = "A"/"B" by which branch computed the key, `output` = `merge_fanout_results(results)`), then the existing `node_completed` as today.
- Produces: end-of-run `node_cache.sweep(resolve_cache_max_bytes(cache_max_bytes), log)` — executed on both the success path and the `error_summaries` path, just before the final emit; `__main__.py` forwards `reuse=opts.get("reuse") or "auto"` and `cache_max_bytes=opts.get("cache_max_bytes")`.
- Fixes the stale L0 comment block (runner.py:286-298) by making it true — reword to describe the now-real emission.

- [ ] **Step 1: Failing tests** — five (all through `run_workflow` with the fake invoker pattern from `test_node_cache.py`):
  - `test_reuse_off_touches_nothing` — warm with auto; snapshot tree (relpath→size map); run with `reuse="off"`: invoker called for every call, tree snapshot identical, results correct.
  - `test_invalid_reuse_value_raises` — `pytest.raises(ValueError)` for `"force"` and `""`; invoker never called.
  - `test_cache_counters_full_partial_miss_and_failure` — five sub-scenarios asserting exact `(calls_total, calls_cached)`: full hit; batch partial hit; all miss; mid-run failure (block present, failed call not cached); `reuse="off"` → `"cache" not in result`.
  - `test_full_hit_emits_node_cached_partial_does_not` — capture events; full-hit node: exactly one `node_cached` with all six fields + one `node_completed`; partial-hit batch node and cold node: zero `node_cached`.
  - `test_run_workflow_auto_sweeps_to_cap_param_env_default` — over-cap warm cache; `run_workflow(reuse="auto", cache_max_bytes=small)` → disk ≤ small after return (success case AND a failing-workflow case); env-only run (monkeypatch `TONGFLOW_CACHE_MAX_BYTES`) obeys env; param beats env; neither → `DEFAULT_CACHE_MAX_BYTES` returned by `resolve_cache_max_bytes(None)` (assert the constant — do not build 20GB fixtures).
- [ ] **Step 2: Run** → fail. **Step 3: Implement** (validation at the top of `run_workflow`; counters as two local ints incremented in the per-call loop; pass `tenant`/`scope` into `node_cache.put(...)` — the Task 2 keywords; sweep call in a `finally`-style block before the final emit). **Step 4: Run** → PASS; full sdk suite + **all** `sdk_pytest_l2_*`/`l3_*` config commands green (AC-10's "auto unchanged" clause).
- [ ] **Step 5: Mutations:** (a) delete the sweep call → E19 test red, all unit sweep tests still green (proves E19 discriminates wiring); (b) count failed call as cached → counters red; (c) emit `node_cached` on partial hit → event test red; (d) treat unknown reuse as auto → ValueError test red.
- [ ] **Step 6: Commit** `feat(sdk): reuse=auto/off, cache counters, node_cached emission, end-of-run sweep (AC-9..12, AC-16)`

**Verify:** `UVPY tests/` + layout guard. Serves **E11–E14, E19**. `independent: false` (needs Tasks 2–3).

---

### Task 5: TS/DB — schema columns, migration, delegate persistence, consumer guard (AC-13 + AC-12 TS half)

**Files:**
- Modify: `src/db/workspace.schema.ts` (after `gpuType`), `src/db/metering-schema.test.ts`
- Create: drizzle migration via `pnpm db:generate` (commit the generated `drizzle/*.sql` + meta)
- Modify: `src/lib/task/engine-delegate.server.ts`, `src/lib/task/engine-delegate.test.ts`, `src/lib/task/node-cached.test.ts`

**Interfaces:**
- Consumes: engine result `"cache": {"calls_total", "calls_cached"}` (Task 4 shape — code against the contract, not the Python).
- Produces schema:

```ts
// % partial telemetry (cache-l4-eviction). NULL = engine reported nothing
// (older engine, cache off, reuse="off") — never conflate with measured 0.
cacheCallsTotal: integer("cache_calls_total"),
cacheCallsCached: integer("cache_calls_cached"),
```

- Produces delegate helper (exported for the test, same seam style as `engineOptionsFor`):

```ts
/** Cache-counter columns from an engine final result. Absent/malformed block
 *  → both null (NULL ≠ 0 — see workspace.schema.ts). */
export function cacheColumnsFrom(result: Record<string, unknown> | null): {
    cacheCallsTotal: number | null;
    cacheCallsCached: number | null;
} {
    const c = result ? asRecord(result.cache) : null;
    const total = c ? num(c.calls_total) : undefined;
    const cached = c ? num(c.calls_cached) : undefined;
    return {
        cacheCallsTotal: total ?? null,
        cacheCallsCached: cached ?? null,
    };
}
```

  spread into **both** terminal `db.update(tasks).set({...})` calls (success and failed — the `finalResult` branches only; the no-result/finalError branches have no block by construction and must not fabricate zeros).

- [ ] **Step 1: Failing tests.** `engine-delegate.test.ts` describe `'cache counters'`: block present → numbers; block absent → both null; malformed (`cache: "x"`, `calls_total: "3"`) → null. `metering-schema.test.ts` `'cache counters'`: columns exist, integer type, nullable (mirror the existing metering column assertions in that file). `node-cached.test.ts` `'applies output once'`: feed `mapEngineEvent` a `node_cached` then the same node's `node_completed` through the existing mapping path used by the L0 tests in that file — assert the cached event maps to `NODE_CACHED` (not `NODE_COMPLETED`) carrying output verbatim, and the completed event still maps through the delegate switch — i.e. exactly one completion-status notification per node, no throw on a merged-results output shape (array for batch).
- [ ] **Step 2: Run** `pnpm vitest run src/lib/task/engine-delegate.test.ts src/db/metering-schema.test.ts src/lib/task/node-cached.test.ts` → new tests fail.
- [ ] **Step 3: Implement** schema + `pnpm db:generate` + delegate helper + wiring. **Step 4: Run** → PASS; `pnpm test` (full vitest) green; `pnpm build && pnpm typecheck` green.
- [ ] **Step 5: Mutations:** (a) `?? null` → `?? 0` in helper → absent-block test red (NULL≠0 proven); (b) remove the spread from the *failed* terminal update only → the failed-branch test red (both branches guarded).
- [ ] **Step 6: Commit** `feat(db,task): persist cache counters on tasks + node_cached consumer guard (AC-13, AC-12/TS)`

**Verify:** `pnpm vitest run` targets above + `pnpm build && pnpm typecheck`. Serves **E15, E16, E20**. `independent: true` (codes against the Task-4 result contract; no file overlap with Tasks 2–4).

---

### Task 6: ABI guard both directions + spec amendment + evidence reruns (AC-15 + bookkeeping)

**Files:**
- Modify: `sdk/tests/test_node_cache_tier_b.py`
- Modify: `docs/spec/prd/engine-cache-partial-rerender.md` (§7 amendment line)
- No product code.

- [ ] **Step 1: Failing test** `test_abi_guard_catches_both_directions` — loads the ABI exactly like the existing tier-list test in `test_node_cache_tier_b.py` (moved in Task 1; it reads via `resolve_abi_path(None)` — keep that convention, recorded at L3 Gate 2): direction (a) every knobbed ABI slot ∈ `TIER_B_SLOTS ∪ DESCOPED_GENERATIVE_SLOTS` (exists — assert it still holds); direction (b) **new**: every name in `TIER_A_SLOTS | TIER_B_SLOTS | DESCOPED_GENERATIVE_SLOTS` is a slot present in the ABI.
- [ ] **Step 2:** Run → (b) may already pass; prove it discriminates by mutation instead: add `"ghost-slot"` to a copied frozenset inside the test's mutation harness — simplest honest form: the test itself iterates the real constants; mutation = temporarily add `"ghost-slot"` to `DESCOPED_GENERATIVE_SLOTS` in `node_cache.py` → test red; revert. Direction (a) mutation: temporarily remove one knobbed slot from `TIER_B_SLOTS` → red; revert.
- [ ] **Step 3: Spec §7 amendment** — one line under D7/Q-table: `reuse="force"` deferred (descoped at cache-l4-eviction Gate 1, ledger d-…32155; auto/off shipped).
- [ ] **Step 4: Evidence reruns for the re-pin wave** (exact-extraction, exit 0 each — record outputs): `sdk_pytest_l3_l1_l2_evals_on_new_tree` (L1) · `sdk_pytest_l3_l2_full_rerun` (L2) · `l3_conformance_l0_full_rerun` (conformance-l0) · task-metering unit keys (`unit_metering_schema`, `unit_metering_runner`) · every `sdk_pytest_l3_*` node-id (L3, now under the split paths).
- [ ] **Step 5: Commit** `test(sdk): bidirectional ABI tier guard; docs: spec §7 force amendment (AC-15)`

**Verify:** `UVPY tests/test_node_cache_tier_b.py` + layout guard + the rerun set. Serves **E18**. `independent: false` (last — needs the split files and final tree).

---

## Suite verify (every task's implicit tail)

`pnpm lint:check` · `pnpm build && pnpm typecheck` · `pnpm test` · full sdk pytest · `pnpm verify:plugins` · `gen_abi_clean` — the config.yaml `feature_loop.suite_keys` set. S4 runs them per round regardless; tasks touching only `sdk/` may defer the TS trio to the task commit boundary.

## Self-review notes

- Spec coverage: AC-1..16 ↔ Tasks 1(14), 2(1–5), 3(6–8), 4(9–12,16), 5(12TS,13), 6(15). All 20 evals served: E1–E6(T2), E7–E10(T3), E11–E14+E19(T4), E15/E16/E20(T5), E17(T1), E18(T6).
- Type consistency: `put(..., tenant=, workflow_scope=)` defined T2, consumed T4; `resolve_cache_max_bytes` defined T2, consumed T4; `cacheColumnsFrom` defined and consumed in T5 only; result block name `cache` consistent T4/T5.
- No fixture transcription: tests reference real helpers in `test_node_cache.py` per the global constraint.
