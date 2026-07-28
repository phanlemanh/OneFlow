# Review Findings: conformance-l0 (round 1)

Informational — adversarial-verified findings from code review. Not hook-enforced; does not gate the evidence-report verdict. All findings below were confirmed by direct reproduction/reading (adversarial-verify survived).

1. **read_plugin_rev shells out to `git`, crashing the whole plugin scan on hosts with no git binary**
   - file: `sdk/tongflow/scan.py:286`
   - severity: high
   - source: conventions
   - detail: `read_plugin_rev` runs `subprocess.run(["git", "rev-parse", "HEAD"], ...)` whenever `plugin_dir/.git` exists. If the git executable is absent, `subprocess.run` raises `FileNotFoundError` — not a non-zero returncode — so the `if r.returncode != 0` branch is never reached and the exception propagates out of `scan()`, aborting registry generation for EVERY plugin, not just the affected one.

     Verified locally:
     ```
     $ PATH=/nonexistent python3 -c 'read_plugin_rev(dir_with_dotgit)'
     RAISED: FileNotFoundError [Errno 2] No such file or directory: 'git'
     ```

     This is reachable on exactly the platform the repo designs for: `src/lib/plugins/plugins-install.server.ts:22` states the installer clones with isomorphic-git "so the host does not need a system git binary". Such an install leaves a real `.git` directory on a machine that may have no git at all — a Windows desktop build being the obvious case. The new guard's own docstring (`scripts/plugins/check-rev-joined-path.ts:7-10`) names "a desktop build with no git binary at all" as a case that should "yield an entry with no rev"; the implementation crashes instead.

     The `.git`-exists check is also not sufficient on its own — a checkout can exist without git being installed. Catching `OSError` alongside the returncode check would restore the documented behaviour.

2. **merge_fanout_views emits empty channels for unpopulated outputs, wiping downstream data-node state on multi-output slots**
   - file: `sdk/tongflow/engine/batch.py:73`
   - severity: high
   - source: conventions
   - detail: `merge_fanout_views` unconditionally writes `merged[source_field]` for every route, including `values: []`. `compute_output_view` (the function it replaces at `runner.py:379`) deliberately dropped empty channels. The runner's downstream guard at `runner.py:392` (`if not channel: continue`) is therefore now dead for empty channels — it sees a non-empty dict and falls through to `slot_state["texts"|"fileKeys"] = channel["values"]`, i.e. `[]`.

     The commit message frames this as an empty-batch fix, but it applies to every node, batched or not, and the exporter emits a route for EVERY ABI output field of the slot regardless of whether it is connected (`src/lib/workflow/exporter.ts:609-620`, `baseRoutes = getAbiOutputRoutesBySlot(...)`).

     Four slots in `config/tongflow.abi.json` declare more than one output field: `link` (mainText/thinking/image/video/audio/extractedTexts), `music-brief` (6), `separate-sound` (2), `transcribe-timestamp` (2). Reproduced directly:
     ```
     routes = [image-route, mainText-route];  result = {'success': True, 'mainText': 'hello'}
     old compute_output_view -> {'mainText': {...values: ['hello']}}
     new merge_fanout_views  -> {'image': {...values: []}, 'mainText': {...values: ['hello']}}
     ```
     So a `link` node that returns only text now resets the connected image data node's `fileKeys` to `[]` mid-run; any node downstream of that data node reads an empty slot instead of the content it previously held. Previously that state was preserved. `_map_workflow_outputs` (`runner.py:152`) is affected the same way — a workflow output now resolves to `[]` instead of falling through.

     The added test `test_merge_of_a_single_result_matches_the_unbatched_view` does not catch this: its single result populates the route, which is the one case where the two functions still agree.

3. **node_completed emits only the last fan-out result, so the canvas sees 1 of N batch outputs**
   - file: `sdk/tongflow/engine/runner.py:405`
   - severity: high
   - source: conventions
   - detail: After fan-out the runner emits `"output": results[-1] if results else {}`. That event is the only channel by which an executable node's own result reaches the browser: `engine-delegate.server.ts:97-104` forwards it as `NODE_COMPLETED { output }`, and `use-workflow-execution.ts:255` passes it to `applyNodeOutput`, which projects it into the downstream data node on the canvas via `applyResolvedOutputRoutes`.

     So for a node mounted with `batchOn()` (roughly 30 slots per `src/lib/abi/node-feature-registry.ts`), the engine correctly computes all N results into `output_views` / `data_node_state` for subsequent engine nodes, while the canvas receives only result N. A 5-item batch renders 1 image.

     This contradicts the reasoning written into `merge_fanout_views`' own docstring — "keeping only the last result would silently drop four fifths of a five-item batch, and nothing anywhere would raise" — which is exactly what this emit does. It also reintroduces the canvas/engine disagreement the slice exists to remove. The merged view (`view`, already computed on line 379) or the full `results` list is what the event should carry.

4. **read_plugin_rev raises out of the per-plugin loop instead of recording a scan error**
   - file: `sdk/tongflow/scan.py:296`
   - severity: medium
   - source: conventions
   - detail: Every other per-plugin failure inside `scan()`'s `for pdir in _iter_plugin_dirs(...)` loop appends to the `errors` list and `continue`s — runner detection (line 318), missing `@node_slot` handlers (line 356), unknown slot idents, `TONGFLOW_SLOT_MODELS` problems, default-claim problems. `read_plugin_rev` is the only call that raises, and it is invoked from the `plugins[plugin_id] = {...}` dict literal on line 446, so one plugin with an unreadable checkout takes down registry generation for all of them.

     The docstring argues a failed rev read must not be silently swallowed, which is right, but the established pattern for surfacing that is `errors.append({"pluginId": ..., "message": ...})` plus omitting the field — the registry consumer already reads `errors`. As written, the failure mode is strictly worse than the one it guards against: no registry at all rather than one plugin flagged.

5. **Conformance fixtures hand-write sourceSpec instead of reading the single declaration site**
   - file: `sdk/tests/conformance/fixtures/batch-basic.json:5`
   - severity: medium
   - source: conventions
   - detail: Each fixture carries its own literal `sourceSpec` (e.g. `{"text": {"kind": "handle", "nodeType": "textNode", "path": "texts", "batch": true}}`) plus a hand-written `batchField` on the executable node, and `src/lib/abi/conformance.ts:159` feeds that literal into `resolveSpec` as the override.

     `src/lib/abi/node-feature-registry.ts:158` already declares the real mount — `genTextNode: { text: textBatch() }` — and its own comment calls `NODE_TYPE_SOURCE_SPEC` "the single declaration site for every ABI node's field classification", with `node-feature-registry.test.ts` failing the build when a node redeclares one inline. CLAUDE.md states the same rule ("a node's `sourceSpec` is the single source of truth — never hand-maintain `bindings` / `paramMappings`").

     The consequence is concrete: if `genTextNode` were remounted from `textBatch()` to `textScalar()`, the canvas and exporter would change while all four fixtures and both halves of the conformance suite stay green — the suite would certify agreement on a mount that no longer exists. The fixture already names `"type": "genTextNode"`, so the TS adapter could look the spec up from `NODE_TYPE_SOURCE_SPEC` rather than trusting the JSON copy.

6. **Inconsistent batchField truthiness between fan_out_inputs and the runner**
   - file: `sdk/tongflow/engine/runner.py:375`
   - severity: low
   - source: conventions
   - detail: `fan_out_inputs` treats the field as absent with `if not field:` (`batch.py:32`), while the runner decides the output shape with `node.get("batchField") is None` (`runner.py:375`) and `bindings.py:62` compares `field == batch_field` by equality.

     For `batchField: ""` the three disagree: `fan_out_inputs` returns a single un-fanned call, but the runner wraps that single result in a list because `"" is not None`, producing the list output shape for a node that did not batch. The exporter only ever emits the key when `ns.spec.batchField` is set (`exporter.ts:648`), so this is not reachable today — but the two checks are written three lines apart from each other's semantics and will diverge again on the next edit. One helper (`is_batched(node)`) used by all three sites would remove the question.

7. **node_completed drops N-1 fan-out results — canvas only ever sees the last batch item**
   - file: `sdk/tongflow/engine/runner.py:405`
   - severity: high
   - source: bugs
   - detail: After the fan-out change a batched node makes N plugin calls and collects them in `results`, but the progress event still carries a single payload: `"output": results[-1] if results else {}`. That event is the ONLY channel by which a node's own output reaches the browser — `engine-delegate.server.ts` `case "node_completed"` forwards `ev.output` verbatim, and `use-workflow-execution.ts:255` feeds it to `applyNodeOutput` → `applyResolvedOutputRoutes`. So a 3-item batch renders exactly 1 result on the canvas; results 1..N-1 are computed, paid for, written to the store, and then silently discarded on the way to the UI. Nothing raises and the workflow reports success. The merged value already exists two lines above (`view = merge_fanout_views(routes, results)`, which concatenates every value in batch order) and is what downstream *engine* nodes read — only the browser gets the truncated version, so the bug is invisible to the Python-side tests in `sdk/tests/test_engine_batch.py`, which assert on the downstream call, not on the emitted event. Before this diff the engine issued one call holding the whole array, so the single payload carried everything; this is a regression introduced by the fan-out.

8. **read_plugin_rev aborts the entire plugin scan — a missing git binary or one bad checkout wipes out every plugin**
   - file: `sdk/tongflow/scan.py:446`
   - severity: high
   - source: bugs
   - detail: `read_plugin_rev` is called inline in the per-plugin dict literal inside `scan()`'s loop, and it raises. There is no try/except in the loop, none in `scan()`, and none around `scan(root, abi)` in `main()` (`scan.py:531`) — contrast the missing-ABI path right above it, which prints a well-formed `{version, errors:[...]}` payload and returns 0. Every other per-plugin problem in that same loop is appended to `errors` and skipped; this one is the outlier that kills the whole registry. Two confirmed triggers, both reproduced: (1) no `git` on PATH → `subprocess.run(["git", ...])` raises an uncaught `FileNotFoundError: [Errno 2] No such file or directory: 'git'` — not the intended RuntimeError, and note the install path deliberately uses isomorphic-git precisely "so the host does not need a system git binary" (`plugins-install.server.ts:22`), so a desktop machine with app-installed plugins (which DO have a `.git`) and no git binary loses 100% of its plugins; (2) a `.git` present with no commits (or any git failure: dubious-ownership, corrupted index) → `RuntimeError: cannot read plugin rev for <dir>`. In both cases `execFileSync` in `runPluginsScanner` (`plugins-scanner.server.ts:31`) throws, so there is no manifest at all — and `run_workflow` calls `scan_manifest` before executing anything, so every workflow fails with an opaque error attributed to nothing.

9. **Conformance suite passes on a run that crashed — harness never checks run_workflow's status**
   - file: `sdk/tests/conformance/harness.py:82`
   - severity: medium
   - source: bugs
   - detail: `call_log()` calls `run_workflow(...)` and discards the return value. `run_workflow` does not raise on node failure — it catches per-node exceptions, records them in `errors`/`failures`, and returns `{"status": "failed", ...}`. So the recorded call list is compared to `expectedCalls` regardless of whether the run succeeded. This is not theoretical: I copied `sdk/`, blanked `pluginId` in `fixtures/batch-empty.json` so the node raises "Missing pluginId for nodeSlot=gen-text", and `pytest tests/conformance/test_conformance.py::test_python_call_log_matches_fixture[batch-empty]` still PASSED — because a crashed node and a fan-out to zero calls both produce `calls == []`. The batch-empty case, whose entire purpose is pinning zero-call semantics, cannot currently distinguish "fanned out to nothing" from "the engine exploded". Fix: assert `result["status"] == "success"` (or return it and let the test assert) in `call_log`. Note `scripts/conformance/check-suite-discriminating.sh` does not catch this either — its perturbations change call counts/fields, not run status.

10. **node_cached carries an `output` the engine never sets — a cache hit will mark the node done with a blank result**
    - file: `src/lib/task/engine-events.ts:44`
    - severity: medium
    - source: bugs
    - detail: The whole stated point of this slice is that the engine→SSE→canvas path for `node_cached` is proven wired before L2 fills it in. But the two ends disagree about the one field the UI needs. The declared event shape in `runner.py:241-243` is `{type, nodeId, feature, label, fingerprint, tier}` — no `output`. `mapEngineEvent` reads `output: ev.output` (undefined → dropped by `JSON.stringify` on the SSE wire), and the client branch at `use-workflow-execution.ts:253-260` does `const output = message.data?.output; if (output) applyNodeOutput(...)`. So when L2 emits the event exactly as declared, the node flips to "completed" on the canvas with no result applied — a cache hit renders as an empty finished node. The end-to-end test (`src/lib/task/node-cached.test.ts`) asserts fingerprint and tier survive all three layers but never asserts `output` does, so it stays green against this hole. Either add `output` to the declared engine shape or have the canvas resolve a cached node's output some other way — but as written the "proven wired" claim excludes the payload that matters.

11. **merge_fanout_views always emits the channel, so a successful call with an empty payload now wipes the downstream data node**
    - file: `sdk/tongflow/engine/batch.py:73`
    - severity: medium
    - source: bugs
    - detail: `compute_output_view` drops a channel whose values are empty (`if not values: continue`); `merge_fanout_views` unconditionally writes `merged[source_field] = {..., "values": values}` even when `values == []`. The runner's guard at `runner.py:392` (`if not channel: continue`) therefore never fires anymore — the dict is truthy — and the next lines set `slot_state["texts"] = []` / `slot_state["fileKeys"] = []` on the downstream data node. The comment justifies this only for the empty-batch case, but it applies to every case, including a non-batched node whose plugin returned `success: true` with the output field absent, null, or holding values that all extract to None. Before this diff that left the data node's previous content (seeded staticData or the last run's result) in place; now it is silently cleared, and because the plugin reported success nothing is logged or raised. If the intent is really "always refresh, even to empty", it should be stated for the successful-but-empty case too, since that is a different and much more common path than an empty batch.

12. **node_outputs shape and fan-out disagree on what a falsy batchField means**
    - file: `sdk/tongflow/engine/runner.py:374`
    - severity: low
    - source: bugs
    - detail: `fan_out_inputs` treats the batch field as absent when it is falsy (`if not field: return [params]`), so `batchField: ""` produces one call and one result. The runner decides the persisted shape with a different test: `results[0] if node.get("batchField") is None else results`. With `batchField: ""` the two disagree — one call was made, but `node_outputs[node_id]` becomes a one-element *list* instead of the dict every existing consumer of `result["outputs"]` expects. Same class of mismatch for any falsy-but-not-None value the exporter might emit. Use one predicate in both places (either `is None` or truthiness) so the call shape and the output shape cannot drift.

## Chua adversarial-verify (refuter chet)

None — all findings above completed adversarial verification (direct reproduction or direct source read confirming the claim).
