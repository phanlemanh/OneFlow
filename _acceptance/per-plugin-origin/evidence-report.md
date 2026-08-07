---
schema_version: 2
feature_slug: per-plugin-origin
verdict: REJECT
failed_evals: [E7]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a788985b3b30c7072dcfd95bc65db1f83b940984
human_signoff:
---

# Evidence Report: per-plugin-origin

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-4 | test | PASS |
| E4 | AC-5 | test | PASS |
| E5 | AC-3 | script | PASS |
| E6 | AC-3 | script | PASS |
| E7 | AC-6 | script | REJECT — see below |
| E8 | AC-6 | test | PASS |
| E9 | AC-1 | test | PASS |
| E10 | AC-3 | test | PASS |
| E11 | AC-3 | test | PASS |
| E12 | AC-3 | script | PASS |

## Evidence

- eval: E1
  run_id: per-plugin-origin-E1-20260807T012628Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-08-07T01:26:28Z
  output: |
    RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
    Test Files  1 passed (1)
         Tests  59 passed (59)
      Duration  148ms

- eval: E2
  run_id: per-plugin-origin-E2-20260807T012628Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-08-07T01:26:28Z
  output: |
    RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
    Test Files  1 passed (1)
         Tests  59 passed (59)
    (same file as E1 — one run serves the four blocks E1..E4 assert)

- eval: E3
  run_id: per-plugin-origin-E3-20260807T012628Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-08-07T01:26:28Z
  output: |
    RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
    Test Files  1 passed (1)
         Tests  59 passed (59)

- eval: E4
  run_id: per-plugin-origin-E4-20260807T012628Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-08-07T01:26:28Z
  output: |
    RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
    Test Files  1 passed (1)
         Tests  59 passed (59)

- eval: E5
  run_id: per-plugin-origin-E5-20260807T012636Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.origin_single_impl
  verified_at: 2026-08-07T01:26:36Z
  output: |
    OK: one URL rule across src/ and scripts/, in src/lib/plugins/official-manifest.ts;
    the CLI installer imports it (the SDK engine's Python copy is out of this scan's
    scope — see the contract's known limits)

- eval: E6
  run_id: per-plugin-origin-E6-20260807T012638Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.origin_installer_parity
  verified_at: 2026-08-07T01:26:38Z
  output: |
    OK: the CLI installer, the in-app install path and the update checker agree;
    both pull paths use the resolved origin and refuse a non-fast-forward

- eval: E7
  run_id: per-plugin-origin-E7-20260807T012640Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.origin_manifest_unmoved
  verified_at: 2026-08-07T01:26:40Z
  output: |
    OK: 36 plain strings under default org + 3 origin entries
    (oneflow-api-ffmpeg, oneflow-api-pyscenedetect, oneflow-modal-compose-overlay)
  note: |
    The command returns clean, but it no longer asserts what this eval's `expected`
    asserts, so E7 does not pass on the evidence it is supposed to produce.

    `expected` (evals.yaml, unchanged since sign-off) reads: "no pre-existing plugin
    was repointed: the 38 original entries are still plain strings under the same
    default org (second-edition guard also pins the single origin entry that
    compose-overlay landed)".

    At this HEAD the guard is in its THIRD edition and asserts 36 plain strings plus
    THREE origin entries. The two missing plain strings are not a recount — commit
    981d92c ("feat(plugins): register the two local CPU plugins as oneflow-api-*")
    deletes `tongflow-modal-ffmpeg` and `tongflow-modal-pyscenedetect`, both entries
    that existed at this feature's sign-off, and replaces them with
    `oneflow-api-ffmpeg` / `oneflow-api-pyscenedetect` under
    `https://github.com/phanlemanh`. Two pre-existing plugins have therefore been
    repointed away from the default org, which is exactly the state AC-6's
    suppression half forbids and the first-edition guard was written to detect.

    The guard was rewritten (by local-cpu-plugins, per the header comment in
    scripts/plugins/check-manifest-unmoved.sh) to record the new manifest state.
    Rewriting the measuring stick means its exit code no longer answers AC-6's
    question, so a clean exit here is not evidence for AC-6.

    This is a contract/tree divergence for a human to resolve, not something a
    verifier may resolve. The precedent is in this contract already: when
    compose-overlay landed the first origin entry, AC-6 was formally AMENDED
    (2026-08-03) and Gate 1 re-approved before the guard's second edition was
    accepted. No equivalent amendment exists for the ffmpeg / pyscenedetect move —
    contract AC-6 and evals.yaml E7 both still say "38 original entries ... still
    plain strings". No code, script, manifest or eval was modified by this
    verification round.

- eval: E8
  run_id: per-plugin-origin-E8-20260807T012641Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_plugin_id
  verified_at: 2026-08-07T01:26:41Z
  output: |
    RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
    Test Files  1 passed (1)
         Tests  76 passed (76)

- eval: E9
  run_id: per-plugin-origin-E9-20260807T012744Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit
  verified_at: 2026-08-07T01:27:44Z
  output: |
    RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
    Test Files  32 passed (32)
         Tests  427 passed (427)

- eval: E10
  run_id: per-plugin-origin-E10-20260807T012830Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.build_typecheck
  verified_at: 2026-08-07T01:28:30Z
  output: |
    (next build) First Load JS shared by all  103 kB
    ƒ  (Dynamic)  server-rendered on demand
    $ tsc --noEmit
    (no diagnostics)

- eval: E11
  run_id: per-plugin-origin-E11-20260807T012746Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lint
  verified_at: 2026-08-07T01:27:46Z
  output: |
    $ pnpm exec biome check --error-on-warnings .
    Checked 429 files in 87ms. No fixes applied.

- eval: E12
  run_id: per-plugin-origin-E12-20260807T012748Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.verify_plugins
  verified_at: 2026-08-07T01:27:48Z
  output: |
    $ tsx scripts/verify-plugins-scan.ts
    [verify-plugins-scan] OK

## Analyst

No A/B baseline was taken: establishing one requires moving the working tree to the
diffBase, which this re-verification round is explicitly forbidden to do (no git
operations of any kind). Every eval therefore carries `baseline: n-a`, and no claim
is made here about which evals discriminate.

E7 is the finding of this round, and it is not drift. The branch edited
`config/official-plugins.json` — the exact artifact AC-6 exists to freeze — and the
edit repointed two plugins that existed at this feature's sign-off. The guard that
was supposed to catch that was rewritten in the same wave to describe the new state,
so it went green over a change it was built to refuse. AC-6's INTENT ("the
per-plugin-origin capability itself repoints nothing") is arguably still intact,
since the mover was a later, separately-approved feature; but deciding that is a
Gate-1 amendment, identical in shape to the 2026-08-03 one already recorded in this
contract, and it has not been made. Until it is, this feature's AC-6 evidence cannot
be re-established at this HEAD.

No judgment executors appear in this feature's evals.yaml, so nothing here is left
unscored for a judge.

## Variance

none — every eval in this feature is deterministic (no `runs` declared, no executor
crossing a provider or LLM).

## Iterations

Round 1 (re-verification after upstream code change): E7 failed — the manifest guard
its criterion depends on was rewritten to a third edition that records two
pre-existing plugins repointed to `phanlemanh`, which AC-6's suppression half
forbids; contract and evals.yaml were not amended to match. Eleven other evals clean.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Decide E7: amend AC-6 (and evals.yaml E7's `expected`) to cover ADR-0011's
      ffmpeg / pyscenedetect move the way the 2026-08-03 amendment covered
      compose-overlay — or treat the move as an unapproved repointing and revert it
- [ ] Re-run the VERIFY phase after that decision; this report is REJECT and carries
      no signature
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
      only once a later round returns PASS
