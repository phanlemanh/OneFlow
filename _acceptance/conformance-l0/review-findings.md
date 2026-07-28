# Review Findings: conformance-l0 (round 2)

Informational — adversarial-verified findings from code review against `verified_commit: 153fcb486e1a3400e7345c8462a18b718e630883`. Not hook-enforced; does not gate the evidence-report verdict. All findings below were confirmed by direct reproduction/reading (adversarial-verify survived). Round-1 findings are in git history for this file; the three high-severity round-1 findings (`read_plugin_rev` crash on missing git, `merge_fanout_views` wiping downstream state, `node_completed` dropping N-1 fan-out results) were fixed in commit `bff647b` and are not repeated here.

1. **NODE_CACHED wired into only one of the three client-side NodeStatus switches**
   - file: `src/hooks/use-workflow-recovery.ts:111`
   - severity: high
   - source: conventions
   - detail: The slice's stated invariant is that the engine → SSE → canvas path for `node_cached` is fully proven before L2 fills it in (comments in `src/constants/task-status.ts:43-47` and `src/lib/task/engine-events.ts:26-31` say exactly this). But only `use-workflow-execution.ts:244` got the new `case NodeStatus.NODE_CACHED:` fallthrough. Two other consumers of the same SSE stream were missed and neither has a `default:` clause, so the status silently falls through:

     - `src/hooks/use-workflow-recovery.ts:111` — the reconnect/replay path, wired in `src/components/workspace/workspace.tsx:194`. Its `NODE_COMPLETED` arm is what calls `setNodeExecutionStatus(nodeId, "completed")` and `onNodeDataUpdate(...)`. After a page reload mid-run, a cached node stays visually "running" forever and its reused output is never applied — the exact failure the new comment in `task-status.ts` claims to prevent ("Anything else leaves the canvas spinning on a node that already has its answer").
     - `src/components/workspace/execution-status-line.tsx:76` — `NODE_COMPLETED` increments `completed`; a cache hit never counts, so the progress line reads e.g. "3/5" for the rest of the run.

     `mapSSEStatusToTaskStatus` returning "COMPLETED" does not help either site: both switch on `message.status` (the raw NodeStatus), not the mapped task status. `src/lib/task/node-cached.test.ts` stays green because it only exercises `mapEngineEvent`, JSON round-trip, and `mapSSEStatusToTaskStatus` — never the recovery hook or the status line. Since `message.status` is typed as a plain string, TypeScript gives no exhaustiveness signal; adding a new NodeStatus member is unguarded by design here.

2. **pluginRev records HEAD only, so a locally modified plugin keeps the same rev — the exact hazard the field is documented to prevent**
   - file: `sdk/tongflow/scan.py:274`
   - severity: medium
   - source: bugs
   - detail: `read_plugin_rev` returns `git rev-parse HEAD`, which is blind to the working tree. `src/lib/plugins/plugins-registry-schema.ts:37-42` states the purpose as "L1 folds it into the cache key — a plugin whose code changed while its key did not would serve the old version's output forever", and `sdk/tests/test_plugin_rev.py` repeats it. Any uncommitted edit (dev iteration, a hand patch, a partially-applied update that left the checkout dirty) changes the code while `pluginRev` stays identical.

     Verified on HEAD:
     ```
     same rev after rewriting the plugin: True 294c21c0a1a35100ce70d3eda5d5b24e6faaf365
     ```
     (entry.py fully rewritten and extra.py added after the commit; rev unchanged.)

     The repo's own fixture demonstrates the gap without noticing it: `test_one_unreadable_checkout_does_not_take_down_the_whole_scan` writes `entry.py` with the `@node_slot` handler *after* `_git_repo` commits, then asserts `plugins["oneflow-api-healthy"]["pluginRev"] == healthy_sha` — i.e. the recorded rev describes a tree that does not contain the code the scanner just registered. `git rev-parse HEAD` needs to be combined with a dirty check (`git status --porcelain`) or a content hash for the field to mean what the docs claim.

3. **Empty batch clears downstream state in the engine but not on the canvas — a new engine/canvas divergence**
   - file: `sdk/tongflow/engine/batch.py:91`
   - severity: medium
   - source: conventions
   - detail: The round-1 fix made `merge_fanout_views` emit an empty channel only when there were no calls at all (`if not values and results: continue`). For an empty batch (`results == []`) the channel IS emitted with `values: []`, so `runner.py:400` passes the `if not channel` guard and sets `slot_state["texts"|"fileKeys"] = []` — the engine's downstream data node is refreshed to empty, which is what AC-11 asks for.

     The canvas is not. For the same run the engine emits `node_completed` with `output = merge_fanout_results([]) == {}` (`runner.py:424`). On the client, `use-workflow-execution.ts:255` does `if (output) applyNodeOutput(...)` — `{}` is truthy, so it proceeds — and `applyResolvedOutputRoutes` (`src/lib/task/payload.ts:88`) starts each route with `const raw = payload?.[route.sourceField]; if (raw == null) continue;`. Nothing is cleared. So after an empty-batch run the browser keeps showing the previous run's content in a downstream data node that the engine has just emptied, and every engine node downstream computed against `[]`.

     This is the same class of canvas/engine disagreement the slice exists to remove, and it is introduced by this diff: before the fan-out change the empty batch produced one real plugin call whose result travelled to both sides. AC-11/E13 pin only the engine half, so no eval sees it.

4. **Both conformance halves hardcode the fixture list instead of reading the fixtures directory**
   - file: `sdk/tests/conformance/test_conformance.py:22`
   - severity: low
   - source: conventions
   - detail: `CASES` is written out literally in two places: `sdk/tests/conformance/test_conformance.py:22` and `src/lib/abi/conformance.test.ts:18`. Adding a fifth fixture requires editing both by hand; editing only one leaves the new case running on a single runtime, and a suite that runs a fixture on one side only reports nothing about agreement while looking like it does.

     This is the inverse of the failure both files explicitly guard against — `conformance.test.ts:20-24` and `harness.py:load_fixture` both go out of their way to fail loudly on a *missing* fixture, on the stated grounds that "a silently absent fixture shrinks the suite to whatever happens to be on disk." A present-but-unlisted fixture shrinks it the same way, silently. `scripts/conformance/check-suite-discriminating.sh` does not catch it either: its three perturbations all target cases that are already in both lists. Globbing `fixtures/*.json` on both sides (and asserting the two sides see the same set) removes the hand-sync.

5. **run_workflow's public outputs shape changed for batched nodes without an SDK version bump**
   - file: `sdk/tongflow/engine/runner.py:388`
   - severity: low
   - source: conventions
   - detail: `node_outputs[node_id] = results[0] if batch_field_of(node) is None else results` changes the type of `run_workflow(...)["outputs"][nodeId]` from `dict` to `list[dict]` for every node mounted with `batchOn()` (roughly 30 slots per `src/lib/abi/node-feature-registry.ts`). That value is part of the SDK's published return contract, is re-emitted in the `workflow_completed` event, and is persisted verbatim into `tasks.result` by `src/lib/task/engine-delegate.server.ts:313`.

     `sdk/pyproject.toml` and `sdk/tongflow/__init__.py` both still read 0.2.17 and neither is touched by this diff, and `CHANGELOG.md` is unchanged. CLAUDE.md's release checklist requires bumping both files in lockstep whenever the SDK changes, and calls drift between them a recurring bug. The behaviour change is intentional and documented in the code comment; it is the version/changelog half that is missing, so a consumer pinned to `oneflow-sdk==0.2.17` can get either shape depending on when they installed.

6. **pluginRev format is unvalidated on the Python side but strictly length-checked on the TS side; a non-40-char rev empties the entire registry**
   - file: `src/lib/plugins/plugins-registry-schema.ts:42`
   - severity: low
   - source: bugs
   - detail: `scan.py:315` writes whatever `git rev-parse HEAD` prints, with no format guard. The consumer declares `pluginRev: z.string().length(40).optional()`, and `runPluginsScanner` (`src/lib/plugins/plugins-scanner.server.ts:56`) calls `PluginsRegistrySchema.parse(raw)` un-guarded — a single out-of-format value throws, `scanAndCache` (`src/ext-default/plugin-registry.ts:38-47`) catches it and returns `emptyRegistry(message)`, so *every* plugin disappears, not just the offending one.

     Concrete trigger: a plugin checkout created with `git init --object-format=sha256` (or cloned from a SHA-256 repo) makes `rev-parse HEAD` return 64 hex chars. The Python side happily writes it; the TS side rejects the whole manifest. This is also inconsistent with `read_plugin_rev`'s own stated contract, which classifies problems as either "no rev, no complaint" or "raise and record a per-plugin error" — an out-of-format rev is neither.

     Either validate/normalize in `read_plugin_rev` (only emit a 40-hex sha, otherwise treat as no-rev + scan error) or relax the Zod rule to `z.string().regex(/^[0-9a-f]{40,64}$/)` so one plugin cannot cost all of them.
