# Review Findings: conformance-l0 (round 4)

Informational — adversarial-verified findings from code review against `verified_commit: d1b73c2c38c960925e6ef8c63f617d89030a8ec9`. Not hook-enforced; does not gate the evidence-report verdict. All findings below were confirmed by direct reproduction/reading (adversarial-verify survived). Round-1, round-2, and round-3 findings are in git history for this file; the round-1 high-severity findings, the round-2 findings (`NODE_CACHED` missing from two client switches, `pluginRev` blind to a dirty working tree), and the round-3 high finding (the `scan.py` / `engine` import cycle) were fixed in commits `bff647b`, `43d2e3c`, and `d1b73c2` respectively, and are not repeated here.

1. **Node-only test adapter placed in a client-reachable `src/lib/abi` module, with neither the `.server.ts` suffix nor `import "server-only"`**
   - file: `src/lib/abi/conformance.ts:1`
   - severity: high
   - source: conventions
   - detail: CLAUDE.md: "Server-only files are suffixed `.server.ts` and live under a domain subdir". The repo's actual practice for non-suffixed server modules is an explicit `import "server-only";` guard — see `src/lib/plugins/python-lite.ts:1` and `src/lib/plugin-executor/runners/generic.ts:1`, the only other non-`.server.ts` files under `src/lib` that touch Node APIs.

     `conformance.ts` imports `node:crypto` (line 1) and uses `Buffer` (`digestValue`), yet has neither marker. It sits in `src/lib/abi/`, a directory whose siblings (`resolve.ts`, `node-feature-registry.ts`) are imported directly by ~20 client canvas components under `src/components/workspace/nodes/**`. `normalizeCall` and `callLogForFixture` are exported, so a future import from a node component silently pulls `node:crypto` into the Next client bundle. Today nothing but `conformance.test.ts` imports it, so typecheck/build stay green — which is exactly why the guard matters.

     Also a directory-convention question: CLAUDE.md defines `src/lib/` as "business code". This module is pure test scaffolding (fixture loader + call-log adapter) and reads more naturally as a `.server.ts` file or a co-located test helper. Note the sibling `src/lib/task/engine-events.ts` documents why it omits `server-only` ("a server-only module cannot be imported from a test") — that reasoning holds there because it is genuinely isomorphic; it does not hold for a module importing `node:crypto`.

2. **Empty batch clears the engine's data-node state but leaves the canvas showing the previous run's output**
   - file: `sdk/tongflow/engine/batch.py:122`
   - severity: high
   - source: bugs
   - detail: `merge_fanout_views` deliberately emits every channel with `values: []` when a batched node fans out to zero calls, and `runner.py:407-412` uses that to reset `data_node_state` — the stated goal being that "leaving it makes a re-run serve stale output as if it were fresh". But the browser is fed by a different value: `merge_fanout_results([])` returns `{}` (`batch.py:122-123`), which `runner.py:424` puts in the `node_completed` event. On the client, `use-workflow-execution.ts:253` does `if (output)` — `{}` is truthy, so `applyNodeOutput` runs — and `applyResolvedOutputRoutes` (`src/lib/task/payload.ts:87`, `if (raw == null) continue;`) then skips every route because no source field is present. Net effect: nothing is cleared on the canvas.

     Failure scenario: data node D feeds a batched node B (e.g. `linkGenTextNode`, `url: batchOn(...)`, or any of the ~30 `batchOn()` mounts) which writes to data node E; E currently holds last run's values. On a re-run D resolves to `[]` (upstream produced nothing). B issues zero plugin calls, the engine sets E's internal state to `[]` and emits `node_completed` with `output={}`. The node flips to "completed" and E still displays last run's values on the canvas, while any further downstream executable in the same run reads E as empty from `data_node_state`. The user sees a successful run whose visible output is from the previous run, and the engine and canvas now disagree about E — precisely the divergence this slice exists to remove. Nothing raises and nothing is logged.

     Note `/api/workflow/execute` only validates plugin presence (`route.ts:117-142`), not required inputs, so there is no upstream guard: the zero-call node also reports success rather than `node_failed`. Fix direction: have the empty-batch case emit explicit empty values for the node's routed output fields instead of `{}`, so `applyResolvedOutputRoutes` clears the same channels the engine just cleared.
   - short_summary: Empty batch: engine clears downstream state, canvas keeps stale values

3. **Empty-batch fan-out clears downstream data in the engine but not on the canvas — a new engine/canvas divergence of exactly the class this slice removes**
   - file: `sdk/tongflow/engine/runner.py:393`
   - severity: medium
   - source: conventions
   - detail: `merge_fanout_views` (`sdk/tongflow/engine/batch.py:91-100`) now deliberately emits a channel with `values: []` when there were zero calls, so the runner's route loop (`runner.py:406`) passes the `if not channel` guard and resets `data_node_state[target]` to empty. `batch.py`'s docstring states the intent: "leaving it makes a re-run serve stale output as if it were fresh."

     The canvas does not do this. `merge_fanout_results([])` returns `{}` (`batch.py:465`), so `node_completed` carries `output: {}`. `use-workflow-execution.ts:253-259` sees `{}` as truthy and calls `applyNodeOutput`, which reaches `applyResolvedOutputRoutes` (`src/lib/task/payload.ts:90`): `const raw = payload?.[route.sourceField]; if (raw == null) continue;`. Every channel is absent, so every route is skipped and the downstream data node keeps the previous run's values.

     Repro: a batched node whose upstream text node is emptied, re-run. Engine-side downstream state is cleared; the browser still shows the prior run's images/text. Before this change both sides left stale state (`compute_output_view` dropped empty channels too), so the two agreed — the change introduced the asymmetry. Either the canvas should clear on an empty output for a batched node, or the engine's empty-channel reset needs a matching signal on the wire.

     Note: this is the same underlying divergence as finding 2 above (independently reached via the "conventions" review pass, cross-referencing the runner's route loop rather than the batch-merge function directly); the two write-ups corroborate each other.

4. **CI never runs vitest, so the entire TypeScript half of the conformance suite is unenforced**
   - file: `.github/workflows/ci.yml:13`
   - severity: medium
   - source: bugs
   - detail: The diff adds three vitest files — `src/lib/abi/conformance.test.ts` (the canvas half of the TS↔Python conformance suite), `src/lib/plugins/plugin-rev.test.ts`, and `src/lib/task/node-cached.test.ts` (which also carries the cross-file guard asserting every `case NodeStatus.NODE_COMPLETED:` switch also handles `NODE_CACHED`). `package.json` has `"test": "vitest run"`, but `.github/workflows/ci.yml` defines only `lint`, `typecheck`, `build`, `sdk-tests`, and `acceptance-gate` — no job invokes it, and `.githooks/` has no vitest hook either. The `acceptance-gate` job runs `scripts/pre-merge-check.sh`, which only re-validates committed evidence artifacts (existence, PASS verdict, signoff, staleness); it does not execute `executors.test.unit`.

     Failure scenario: someone remounts `genTextNode` from `textBatch()` to a scalar handle, or drops the `NODE_CACHED` case from `use-workflow-recovery.ts`. The Python half stays green (it reads the same fixtures but exercises the engine only), `pnpm typecheck` and `pnpm build` pass because `message.status` is a plain string with no exhaustiveness check and the switches have no `default:` arm, and CI is green. The drift the suite was written to catch reaches main unreported; it only surfaces if a human happens to run `pnpm test` or the full acceptance gate locally. The Python guards are protected by the `sdk-tests` job; the TS guards are not.
   - short_summary: No vitest job in CI — new TS conformance guards never run

5. **New SSE payload fields `fingerprint`/`tier` bypass the centralized SSEMessageData declaration; MappedEngineEvent.status typed as bare `string`**
   - file: `src/lib/task/engine-events.ts:15`
   - severity: medium
   - source: conventions
   - detail: `src/types/sse.ts` states its own purpose: "Centralized here so consumers … stop relying on locally-typed JSON.parse results, which previously required `as any` casts." The `node_cached` payload adds two new fields (`engine-events.ts:42-43`: `fingerprint`, `tier`) and neither was added to `SSEMessageData`. They typecheck only because of the open-ended `[key: string]: unknown` escape hatch at `src/types/sse.ts:64` — the same hatch every other declared field (`output`, `label`, `feature`, `thinking`, …) was added rather than relying on. `node-cached.test.ts:67-68` asserts on them through `unknown`, so a rename on the engine side would not be caught by tsc anywhere.

     Separately, `MappedEngineEvent.status: string` (line 15) widens a value that has a canonical union — `NodeStatusType` / `SSEStatus` from `@/constants/task-status`. `notifyTask` also takes `status: string` (`src/ext-default/task-events.ts:88`), so nothing narrows it at any point on this path; returning `NodeStatusType` here would restore the check for free.

6. **pluginRev boundary validation is asymmetric: producer enforces 40 lowercase hex, consumer schema enforces length only**
   - file: `src/lib/plugins/plugins-registry-schema.ts:42`
   - severity: low
   - source: conventions
   - detail: `sdk/tongflow/scan.py`'s `read_plugin_rev` rejects anything that is not 40 chars drawn from `0123456789abcdef`, and its comment reasons explicitly about format: "A short sha, an abbreviated `core.abbrev`, or a ref name rather than a sha would all get through otherwise." The TypeScript consumer is `z.string().length(40).optional()` — length only. A 40-character non-sha (a long branch name, a tag, a hand-edited manifest) parses cleanly on the TS side.

     The scanner is the only writer today so the gap is defence-in-depth, not a live bug. But the field's own doc-comment says "L1 folds it into the cache key", and the manifest is a file boundary the app reads un-guarded elsewhere. `z.string().regex(/^[0-9a-f]{40}$/)` costs nothing and makes the two halves state the same rule. `src/lib/plugins/plugin-rev.test.ts` pins the short-sha rejection but not the non-hex case.

7. **`check-rev-joined-path.ts` hardcodes `python3`, diverging from the PYTHON/PYTHON3 override pattern the sibling scanner script already uses**
   - file: `scripts/plugins/check-rev-joined-path.ts:94`
   - severity: low
   - source: conventions
   - detail: `scripts/verify-plugins-scan.ts:14-17` — the other TS script that shells out to the bundled scanner — defines `pickPython()` honouring `process.env.PYTHON` / `process.env.PYTHON3` before falling back to `"python3"`. The new check spawns a bare `"python3"` with no override.

     CONTRIBUTING.md documents that the ambient macOS `python3` is a known hazard for this repo (PEP 668 / Homebrew), which is why every Python entry in `_acceptance/config.yaml` goes through `uv run --no-project --with …`. This check is wired into that same config (`script.plugin_rev_joined_path`) but is the one Python invocation there that neither uses uv nor accepts an interpreter override. I ran it locally and it passes — `import tongflow` happens to need no third-party deps on the scan path — so this is portability/consistency, not a current failure. Reusing `pickPython()` (or exporting it) would align the two.

8. **Conformance fixture adapter silently yields no upstream values for any source it cannot resolve**
   - file: `src/lib/abi/conformance.ts:361`
   - severity: low
   - source: bugs
   - detail: `upstreamValues` resolves a binding's sources with `const dn = dataNodes.get(src.fromNodeId); if (!dn?.staticData) continue;` and then picks `src.fromField === "texts" ? dn.staticData.texts : dn.staticData.fileKeys`. Any source that is not a fixture data node carrying `staticData` — a typo'd `fromNodeId`, an upstream *executable* node (real exported workflows wire exec→exec with `fromField` set to an ABI source field such as `"image"`), or a `fromField` that is neither `texts` nor `fileKeys` — contributes nothing, with no error.

     Failure scenario: a future fixture is added with a mistyped `fromNodeId` (or the three-tier exec→data→exec shape that `sdk/tests/test_engine_batch.py::test_three_items_reach_the_node_after_the_batching_one` covers on the Python side) and `expectedCalls: []`. The TS half produces `[]` because the wiring silently resolved to nothing, matches, and reports agreement — while the fixture is in fact testing nothing about the graph it claims to describe. The existing `batch-empty` fixture already sits in exactly this shape: its assertion passes regardless of whether `fromNodeId: "dn-src"` actually resolves. Throwing on an unresolvable source (rather than `continue`) would make the adapter fail loudly the way `discoverCases` and `loadFixture` already do.
   - short_summary: Unresolvable fixture source silently yields [] instead of throwing

## Chua adversarial-verify (refuter chet)

None — all 8 findings above survived adversarial-verify this round.
