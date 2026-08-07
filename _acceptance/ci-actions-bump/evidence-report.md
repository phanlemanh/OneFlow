---
schema_version: 2
feature_slug: ci-actions-bump
verdict: PASS
failed_evals: []
reason: >-
  Re-verification round at HEAD a788985 (branch feat/local-first-adr-and-s2-plan).
  The previously signed evidence was pinned to c38b939; code landed after that
  commit, so this round re-establishes all eight evals on the current tree.
  8/8 machine evals green, no judgment eval in this contract.
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a788985b3b30c7072dcfd95bc65db1f83b940984
human_signoff: Manh 2026-08-07
---

# Evidence Report: ci-actions-bump

All eight evals are `script` executors; every `cmd` was resolved line by line
against `_acceptance/config.yaml` and run from the repo root at HEAD
`a788985b3b30c7072dcfd95bc65db1f83b940984`. Five of them (E2, E3, E5, E6, E7)
query real GitHub Actions runs through `gh`; `gh auth status` reported an active
token for account `phanlemanh` with `repo` + `workflow` scopes, so none of them
was blocked. The run-anchored evals resolve their range from the contract's
`landed_merge: 8477f8a` via `scripts/acceptance/own-range.sh`, which is why they
still grade this feature's own diff on a much later branch.

No source file, test, script, config or git state was modified by this round.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |

## Evidence

- eval: E1
  run_id: ci-actions-bump-E1-20260807T012630Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ci_actions_pinned
  verified_at: 2026-08-07T01:26:30Z
  output: |
    ok actions/checkout: 8 site(s), all >= v7
    ok docker/login-action: 1 site(s), all >= v4
    action pins: at or above the contracted floor at every site

- eval: E2
  run_id: ci-actions-bump-E2-20260807T012639Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ci_gate_plumbing
  verified_at: 2026-08-07T01:26:44Z
  output: |
    run https://github.com/phanlemanh/OneFlow/actions/runs/30196332819 @ 60c4797d3c0ff9aaa3335690ddecdb9bbc9eace7
    ok  checkout ran with fetch-depth: 0
    ok  the checkout under test is v7
    ok  pre-merge-check emitted 5 per-feature verdict line(s)
    ok  no shallow-history or unresolvable-base complaint anywhere in the log
    fetch-depth: 0 under checkout@v7 gave pre-merge-check.sh a usable base at 60c4797d

- eval: E3
  run_id: ci-actions-bump-E3-20260807T012654Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ci_jobs_green
  verified_at: 2026-08-07T01:26:57Z
  output: |
    run https://github.com/phanlemanh/OneFlow/actions/runs/30196332819 @ 60c4797d3c0ff9aaa3335690ddecdb9bbc9eace7
    ok job 'Lint': success
    ok job 'Type Check': success
    ok job 'Build': success
    ok job 'SDK Tests (Python)': success
    all requested jobs succeeded at 60c4797d3c0ff9aaa3335690ddecdb9bbc9eace7

- eval: E4
  run_id: ci-actions-bump-E4-20260807T012708Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ci_docker_dryrun_guard
  verified_at: 2026-08-07T01:27:08Z
  output: |
    dry-run guard present:          push: ${{ github.ref_type == 'tag' }}
    a workflow_dispatch run builds both platforms and publishes nothing

- eval: E5
  run_id: ci-actions-bump-E5-20260807T012715Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ci_docker_dispatch_green
  verified_at: 2026-08-07T01:27:29Z
  output: |
    dispatched run https://github.com/phanlemanh/OneFlow/actions/runs/30190339168
      workflow tree matches 8477f8a08f26b792b313ff4461a978591024c33e: c2bd8c61cfc2a159cd3287783e750dfd72ce02b9
    ok job 'Build & push (amd64 + arm64)': success
       ok step 'Set up QEMU': success
       ok step 'Log in to GHCR': success
       ok step 'Build & push': success
    ok  linux/amd64 build stages present in the log
    ok  linux/arm64 build stages present in the log
    dispatched docker dry run succeeded, and reached every step that carries a bumped action

- eval: E6
  run_id: ci-actions-bump-E6-20260807T012737Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ci_ghcr_untouched
  verified_at: 2026-08-07T01:27:54Z
  output: |
    dispatched run https://github.com/phanlemanh/OneFlow/actions/runs/30190339168 (started 2026-07-26T06:01:26Z)
    ok  run's workflow tree matches 8477f8a08f26b792b313ff4461a978591024c33e
    ok  runner resolved 'push: false'
    ok  no registry write anywhere in 3575 log lines
    ok  buildx invoked without --push
    --  registry cross-check unavailable: the token cannot read packages.
        Not treated as evidence either way.
    no publish occurred during the dry run

- eval: E7
  run_id: ci-actions-bump-E7-20260807T012801Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ci_desktop_dispatch_green
  verified_at: 2026-08-07T01:28:14Z
  output: |
    dispatched run https://github.com/phanlemanh/OneFlow/actions/runs/30190355369
      workflow tree matches 8477f8a08f26b792b313ff4461a978591024c33e: c2bd8c61cfc2a159cd3287783e750dfd72ce02b9
    ok job 'build (macos-14, --targets universal ...)': success
       ok step 'Cache cargo registry': success   ok step 'Sanity-check installer': success
       ok step 'Upload as Actions artifact (dry run)': success
       ok step 'Upload to draft GitHub Release': not taken on a dispatch
    ok job 'build (windows-latest, --targets x64, *.msi, TongFlow-win-x64.msi)': success
       ok step 'Cache cargo registry': success   ok step 'Sanity-check installer': success
       ok step 'Upload as Actions artifact (dry run)': success
       ok step 'Upload to draft GitHub Release': not taken on a dispatch
    -- job 'prepare': skipped (tag-only path, expected on a dispatch)
    -- job 'publish': skipped (tag-only path, expected on a dispatch)
    dispatched desktop dry run succeeded, and reached every step that carries a bumped action

- eval: E8
  run_id: ci-actions-bump-E8-20260807T012824Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ci_no_behaviour_drift
  verified_at: 2026-08-07T01:28:24Z
  output: |
    workflow drift vs the range ci-actions-bump owns
    (4d89b584fcfd3dfafd03823a14c9b81406db6e9b..8477f8a08f26b792b313ff4461a978591024c33e):
    16 declared pin line(s), comments, and the dry-run guard (-1 +1);
    no file added, deleted or renamed

## Analyst

Baseline is `n-a` on every eval in this round, by instruction: an A/B baseline
would require moving the working tree to the diffBase, and this re-verification
was run under a hard no-git-operations constraint. The discriminating power of
these evals was established in the original rounds (the contract's "Known limits
of the guards" section records six rounds of adversarial mutation of the guards
themselves); this round re-establishes only that they are still green on the
current tree.

Two observations worth a human eye at Gate 2, neither a failure:

1. **E1 now counts eight `actions/checkout` sites, not the seven the contract
   text names.** The eighth is the `Unit Tests (vitest)` job added later by the
   `ci-vitest-sdk-pin` feature; the guard was renumbered to 8 at that time. The
   criterion AC-1 is a floor ("no `checkout@v` below 7, no `login-action@v` below
   4") and holds at every site, so the count drift does not weaken it — but the
   prose in the contract's Context section still says seven.

2. **E5, E6 and E7 read GitHub Actions runs dispatched on 2026-07-26**, not runs
   dispatched today. That is by design: each of those scripts pins the run to the
   workflow tree at `landed_merge` 8477f8a (`workflow tree matches ...:
   c2bd8c61...`), so a later branch cannot launder a green from a workflow file
   that has since changed. Since `.github/workflows` has not changed inside this
   feature's owned range, the historical runs remain the right evidence. E6 also
   reports that the local token cannot read the GHCR packages endpoint, so its
   registry cross-check is unavailable; the suppression claim rests on the run
   log (`push: false` resolved, no registry write in 3575 lines, buildx invoked
   without `--push`) rather than on the registry API.

## Variance

none — every eval in this contract is deterministic (runs: 1) and uniform.

## Iterations

Round 1 (re-verification after upstream code change): all eight evals ran at
HEAD a788985 and all eight exited zero. No round 2 needed.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] No judgment items in this contract — nothing to override
- [ ] Note Analyst item 1 (contract prose says seven checkout sites; there are
      now eight, all at or above the floor) and decide whether to amend the prose
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
