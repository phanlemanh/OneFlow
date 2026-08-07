---
schema_version: 2
feature_slug: oneflow-plugin-prefix
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a788985b3b30c7072dcfd95bc65db1f83b940984
human_signoff:
---

# Evidence Report: oneflow-plugin-prefix

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-1 | test | PASS |
| E8 | AC-3 | test | PASS |
| E9 | AC-4 | test | PASS |
| E10 | AC-7 | test | PASS |
| E11 | AC-7 | test | PASS |

## Evidence

- eval: E1
  run_id: oneflow-plugin-prefix-E1-20260807T013001Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_plugin_id
  verified_at: 2026-08-07T01:30:01Z
  output: |
    RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
    Test Files  1 passed (1)
         Tests  76 passed (76)
      Duration  154ms

- eval: E2
  run_id: oneflow-plugin-prefix-E2-20260807T013001Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_plugin_id
  verified_at: 2026-08-07T01:30:01Z
  output: |
    Test Files  1 passed (1)
         Tests  76 passed (76)
    (one run of plugin-id.test.ts serves the four blocks E1..E4 assert)
  note: |
    Checked that this eval's subject survived the branch's manifest edits: the test
    still reads the REAL config/official-plugins.json through
    normalizeOfficialManifest and maps entry.id, so the three object-form entries
    the branch introduced are validated like the plain strings. It also still
    asserts manifest.org === https://github.com/tong-io, which holds.

- eval: E3
  run_id: oneflow-plugin-prefix-E3-20260807T013001Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_plugin_id
  verified_at: 2026-08-07T01:30:01Z
  output: |
    Test Files  1 passed (1)
         Tests  76 passed (76)

- eval: E4
  run_id: oneflow-plugin-prefix-E4-20260807T013001Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_plugin_id
  verified_at: 2026-08-07T01:30:01Z
  output: |
    Test Files  1 passed (1)
         Tests  76 passed (76)

- eval: E5
  run_id: oneflow-plugin-prefix-E5-20260807T013005Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.docs_plugin_prefix
  verified_at: 2026-08-07T01:30:05Z
  output: |
    ok  state the oneflow-api convention
    ok  state the oneflow-modal convention
    ok  record that the legacy tongflow form is still accepted
    ok  give the reason — the upstream repos are not ours
    ok  keep the lowercase rule
    ok  keep the no-hardware rule
    ok  the primary convention bullet leads with oneflow-
    docs/plugins.md: documents the oneflow convention and the legacy exception, with its reason

- eval: E6
  run_id: oneflow-plugin-prefix-E6-20260807T013008Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.prefix_no_config_drift
  verified_at: 2026-08-07T01:30:08Z
  output: |
    no drift vs the range oneflow-plugin-prefix owns
    (8477f8a08f26b792b313ff4461a978591024c33e..dd39da82b8aaedb17729c0022aa2b146a8219c12):
    config src/lib/plugins/plugins-registry-schema.ts src/lib/plugins/plugins-registry.server.ts
    src/db untouched
    manifest intact: 39 plugins, org still https://github.com/tong-io
  note: |
    This is the guard the contract's Known limits flagged as a landing-time check
    that graded the wrong PR on a later branch. The gate-scope-anchors work has
    since fixed that: the frontmatter's landed_merge anchor resolves to the range
    this feature actually owns, so on this branch it grades this feature's own diff
    rather than the branch's. That is why it is green here and was red during the
    conformance-l0 round.

- eval: E7
  run_id: oneflow-plugin-prefix-E7-20260807T013140Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.build_typecheck
  verified_at: 2026-08-07T01:31:40Z
  output: |
    (next build) First Load JS shared by all  103 kB
    ƒ  (Dynamic)  server-rendered on demand
    $ tsc --noEmit
    (no diagnostics)

- eval: E8
  run_id: oneflow-plugin-prefix-E8-20260807T013035Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit
  verified_at: 2026-08-07T01:30:35Z
  output: |
    RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
    Test Files  32 passed (32)
         Tests  427 passed (427)

- eval: E9
  run_id: oneflow-plugin-prefix-E9-20260807T013038Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lint
  verified_at: 2026-08-07T01:30:38Z
  output: |
    $ pnpm exec biome check --error-on-warnings .
    Checked 429 files in 137ms. No fixes applied.

- eval: E10
  run_id: oneflow-plugin-prefix-E10-20260807T013020Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_scan_prefix
  verified_at: 2026-08-07T01:30:20Z
  output: |
    .......................                                        [100%]
    23 passed in 0.14s

- eval: E11
  run_id: oneflow-plugin-prefix-E11-20260807T013026Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest
  verified_at: 2026-08-07T01:30:26Z
  output: |
    ........................................................................ [ 37%]
    ........................................................................ [ 74%]
    .................................................                        [100%]
    193 passed in 4.56s

## Analyst

No A/B baseline was taken: establishing one requires moving the working tree to the
diffBase, which this re-verification round is explicitly forbidden to do (no git
operations of any kind). Every eval therefore carries `baseline: n-a`, and no claim
is made here about which evals discriminate.

Two of this feature's evals sit directly on ground the branch disturbed, and both
were checked rather than assumed. E6's guard reads `config/` — the branch edited
`config/official-plugins.json` — but the anchored range keeps its question scoped to
this feature's own merge, so the branch's edit is correctly outside it. E2 reads the
shipped manifest live, and the branch changed that manifest's shape by adding
object-form entries; the normalizer path means those ids are still validated, so the
eval did not quietly stop testing anything.

No judgment executors appear in this feature's evals.yaml, so nothing here is left
unscored for a judge.

## Variance

none — every eval in this feature is deterministic (no `runs` declared, no executor
crossing a provider or LLM).

## Iterations

Round 1 (re-verification after upstream code change): all eleven evals clean at
a788985.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] No judgment items in this feature — nothing to override
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
