# Review Findings: conformance-l0 (round 3)

Informational — adversarial-verified findings from code review against `verified_commit: 43d2e3c37e1100db31db86a0618d9b5fc6705da4`. Not hook-enforced; does not gate the evidence-report verdict. All findings below were confirmed by direct reproduction/reading (adversarial-verify survived). Round-1 and round-2 findings are in git history for this file; the three high-severity round-1 findings and the round-2 findings (`NODE_CACHED` missing from two client switches, `pluginRev` blind to a dirty working tree) were fixed in commits `bff647b` and `43d2e3c` and are not repeated here.

1. **`scan.py` now closes an import cycle with the engine package (scanner breaks on any `__init__` reorder)**
   - file: `sdk/tongflow/scan.py:11`
   - severity: high
   - source: conventions
   - detail: `from .engine._subproc import utf8_env` makes `tongflow.scan` depend on `tongflow.engine`. But `sdk/tongflow/engine/plugins.py:25` already does `from ..scan import scan` — scan is the *lower* layer. Importing `tongflow.engine._subproc` executes `tongflow/engine/__init__.py` -> `runner.py` -> `plugins.py` -> back into the half-initialised `tongflow.scan`.

     It only works today by accident: `tongflow/__init__.py` imports `.serve`, which pulls in `tongflow.engine` before anything reaches `.scan`. Proved by removing that one import from a scratch copy of the SDK:

     ```
     ImportError: cannot import name 'scan' from partially initialized module 'tongflow.scan'
       (most likely due to a circular import) .../tongflow/scan.py
     ```

     So trimming/reordering `tongflow/__init__.py`, or any consumer that reaches `tongflow.scan` without the full package `__init__` having run, kills the entire plugin scanner (`python -m tongflow`, `scan_manifest`, `pnpm verify:plugins`) — not just the rev feature. All of this to reuse a 6-line env helper.

     Fix: move `utf8_env` to a top-level `tongflow/_subproc.py` (engine can keep re-exporting it), or set the two env vars inline in `read_plugin_rev`.

2. **`run_workflow`'s documented `outputs` shape is now a list for batched nodes, and disagrees with the `node_completed` payload**
   - file: `sdk/tongflow/engine/runner.py:388`
   - severity: medium
   - source: conventions
   - detail: `node_outputs[node_id] = results[0] if batch_field_of(node) is None else results` makes `outputs[nodeId]` a `list[dict]` for every node with `batchField` — ~30 mounted slots (`node-feature-registry.ts:158-283`), i.e. the common case in real exported workflows.

     Two problems:

     1. The public docstring at `runner.py:220` still says `` outputs `` maps node id -> raw plugin output, and was not updated. `run_workflow` is the SDK's published entry point, so an embedder reading `result["outputs"][nodeId]["image"]` (exactly the pattern in `sdk/tests/test_engine.py:731,788`) now gets a `TypeError: list indices must be integers` the moment the node batches. No CHANGELOG entry, no version bump in `sdk/pyproject.toml`.
     2. The same node's output is emitted in two different shapes on two channels: `node_completed` carries `merge_fanout_results(results)` (a merged dict) while `outputs[nodeId]` carries the raw list. The inline comment claims `outputs[nodeId]` stays what existing consumers expect, which is only true for the unbatched path.

     Pick one shape (the merged dict is the one the canvas already consumes) or update the docstring and the comment to state the list contract explicitly.

3. **Merged batch output no longer conforms to the slot's declared ABI output schema**
   - file: `sdk/tongflow/engine/batch.py:122`
   - severity: medium
   - source: conventions
   - detail: `merge_fanout_results` concatenates every non-meta output field across N calls: `bucket.extend(value if isinstance(value, list) else [value])`. For `gen-text`, `config/tongflow.abi.json` declares `outputs.properties.text = {"type": "string"}`, so a 3-item batch now emits `{"success": true, "text": ["a","b","c"]}` on `node_completed` — a scalar-typed ABI field carrying an array.

     CLAUDE.md makes the ABI the contract and states enforcement is compile-time only with no runtime validator, so nothing catches this: the generated `GenTextOutput` Pydantic model and the generated TS types both describe `text` as a string, while the engine puts a `string[]` on the wire. It survives today only because `SSEMessageData.output` is typed `Record<string, unknown>` and `compute_output_view` happens to flatten lists.

     Either the ABI needs a declared "batched output" shape, or the merge needs to stay inside the projected `output_views` (which is already array-shaped by design) rather than reshaping the raw slot payload.

4. **Test-only adapter placed in the business layer with Node-only APIs and no `.server.ts` suffix**
   - file: `src/lib/abi/conformance.ts:1`
   - severity: medium
   - source: conventions
   - detail: This module exists solely to feed `conformance.test.ts`: it reads fixtures off disk from a `process.cwd()`-relative `sdk/tests/conformance/fixtures`, and uses `node:crypto` (`createHash`) plus `Buffer`.

     CLAUDE.md: "Server-only files are suffixed `.server.ts`". This one is not, and it sits in `src/lib/abi/` alongside `resolve.ts` and `node-feature-registry.ts` — modules the canvas node components import directly on the client. An accidental import from any client component pulls `node:crypto` and a filesystem read into the browser bundle, and `pnpm build` is the only thing that would catch it.

     Also note the fixture path is cwd-relative, so `pnpm vitest` run from anywhere but the repo root throws at module load rather than skipping.

     Either suffix it `.server.ts`, or move it next to the test (e.g. `src/lib/abi/__tests__/`), which is the more honest home given nothing in production imports it.

5. **Empty batch clears downstream state in the engine but leaves stale values on the canvas**
   - file: `sdk/tongflow/engine/runner.py:424`
   - severity: medium
   - source: bugs
   - detail: On a zero-call fan-out, `merge_fanout_views(routes, [])` deliberately emits every channel with `values: []`, so the engine resets `data_node_state[target]` to empty (runner.py ~line 400-412) — the docstring in `batch.py` explicitly calls this out as the point: "leaving it makes a re-run serve stale output as if it were fresh."

     The canvas does not get the same treatment. The `node_completed` event carries `merge_fanout_results([])` == `{}`. In `use-workflow-execution.ts` `applyNodeOutput` the check is `if (!output) return;` — `{}` is truthy, so it proceeds — and `applyResolvedOutputRoutes` (`src/lib/task/payload.ts:91`) does `const raw = payload?.[route.sourceField]; if (raw == null) continue;` for every route. Nothing is written and nothing is cleared.

     Failure scenario: empty-batch re-run. The engine's own downstream chain sees `[]`; the browser keeps rendering the previous run's images/texts in the downstream data nodes, and `mapSSEStatusToTaskStatus` marks the run COMPLETED. The user is shown stale artifacts as the fresh result of a successful run — the exact canvas/engine divergence this slice was written to remove, reintroduced on the other side.

6. **New hardcoded magic count guard of the shape CLAUDE.md already flags as a recurring foot-gun**
   - file: `src/lib/task/node-cached.test.ts:104`
   - severity: low
   - source: conventions
   - detail: `expect(consumers.length).toBe(4)` asserts exactly four files in `src` contain the literal `case NodeStatus.NODE_COMPLETED:`. CLAUDE.md explicitly calls out `scripts/plugins/check-manifest-unmoved.sh`'s `expected_count` as a snapshot-not-invariant that "turns red" on unrelated PRs and wastes debugging time. This is the same construction, and it will fire on any PR that adds a fifth SSE consumer or reformats one of the existing switches.

     Secondary: `walk("src")` and `THIS_FILE = "src/lib/task/node-cached.test.ts"` are cwd-relative — the test only passes when vitest runs from the repo root.

     If the count guard stays, add the same "bump this, don't debug it" note CLAUDE.md prescribes, and resolve the paths from `import.meta.dirname`.

7. **`merge_fanout_results` discards per-call `error` and forces `success=True`**
   - file: `sdk/tongflow/engine/batch.py:127`
   - severity: low
   - source: bugs
   - detail: For N>1 results, `merged` is seeded `{"success": True}` and `_META_OUTPUT_FIELDS = {"success", "error"}` are skipped for every result. Only `one.get("success") is False` raises in the runner (runner.py ~line 380), so a plugin that reports a soft failure any other way — `success: None`, `success` omitted, or `success: True` alongside a populated `error` string — has that signal dropped entirely from the `node_completed` payload the canvas receives.

     Secondary effect in the same function: a scalar-declared ABI output (e.g. `mainText: string`, or a scalar `$ref` like `video: VideoRef`) is collapsed into a list of N values via `bucket.extend(...)`. `applyResolvedOutputRoutes` happens to tolerate arrays for scalar routes, so this is currently harmless on the canvas, but any consumer reading the field by its ABI-declared scalar shape gets an array instead.

8. **TS conformance adapter silently models fewer binding shapes than the Python half**
   - file: `src/lib/abi/conformance.ts:210`
   - severity: low
   - source: conventions
   - detail: Two asymmetries between the two halves of a suite whose entire job is proving they agree:

     1. `ConformanceFixture` (line 103) has no `inputs` field, but `sdk/tests/conformance/harness.py` passes `fixture.get("inputs")` into `run_workflow`. Any fixture using workflow inputs is honoured by Python and invisible to TS.
     2. `callLogForFixture` treats every non-handle binding as config: `configValues[field] = binding.value`. For `kind: "input"` bindings the fixture carries `inputName`, not `value`, so the TS side produces `undefined` while `resolve_node_params` (`bindings.py`) resolves `inputs[binding["inputName"]]`.
     3. `upstreamValues` (line 168) only looks in `fixture.workflow.dataNodes`, so an executable->executable chain yields empty values on the TS side while Python resolves the real `output_views`.

     None of these bites today (all four fixtures are single-stage, data-node-fed, input-free) and a mismatch would go red rather than green — but it would read as an engine bug, not an adapter gap. Worth either supporting the shapes or throwing an explicit "adapter does not model X" error in `callLogForFixture` so the failure names itself.

9. **Conformance TS adapter silently resolves unknown fixture sources to nothing**
   - file: `src/lib/abi/conformance.ts:175`
   - severity: low
   - source: bugs
   - detail: `upstreamValues` does `const dn = dataNodes.get(src.fromNodeId); if (!dn?.staticData) continue;` and then `src.fromField === "texts" ? dn.staticData.texts : dn.staticData.fileKeys`. Two silent fallbacks in a helper whose entire job is to feed the discrimination suite:

     1. A `fromNodeId` that names an executable node (not a data node) or a typo'd id yields no values, with no error. The Python side's `read_source` also returns `[]` for an unknown id, so both halves quietly agree on nothing and the fixture goes green while proving nothing.
     2. Any `fromField` other than `"texts"` is treated as `fileKeys`. An upstream executable's ABI source field (e.g. `images`) would be mis-read as `fileKeys` — undefined — rather than rejected.

     All four current fixtures use only data-node sources with `fromField: "texts"`, so neither branch fires today; the exposure is the next fixture added. `specForFixtureNode` in the same file already throws loudly on an unresolvable spec — `upstreamValues` should throw on an unresolvable source for the same reason.

## Chua adversarial-verify (refuter chet)

None — every finding above completed adversarial verification (direct reproduction or source-level confirmation) before being listed.
