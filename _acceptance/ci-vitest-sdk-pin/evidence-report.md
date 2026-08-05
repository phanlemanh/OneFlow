---
schema_version: 2
feature_slug: ci-vitest-sdk-pin
verdict: REJECT
failed_evals: [E11]
reason: "E11 (bash scripts/pre-merge-check.sh . --base origin/main) does not print `clean` and exits 1, both before and after this report reached its verdict. AC-11 requires `clean`. The pre-report run tripped this feature's own round-1 REJECT; the post-report run trips `verdict PASS but human_signoff is empty (Gate 2 pending)`. The second is not a defect in the three code changes — it is a structural property of the eval, which cannot be satisfied by any S4 verify round of a signoff-required feature (see the E11 block and Findings). Reported, not worked around."
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 556c79956035c14337c98bfa04606b938dbe237e
human_signoff:
---

# Evidence Report: ci-vitest-sdk-pin

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
| E9 | AC-9 | script | PASS |
| E10 | AC-10 | script | PASS |
| E11 | AC-11 | script | FAIL |
| E12 | AC-12 | script | PASS |
| E13 | AC-12 | script | PASS |

## Evidence

- eval: E1
  run_id: ci-vitest-sdk-pin-e1-1785934930
  exit_code: 0
  baseline: red
  verifier: config:executors.script.civ_job_shape
  verified_at: 2026-08-05T13:02:10Z
  output: |
    $ bash scripts/ci/check-vitest-job.sh shape
    OK: one 'Unit Tests (vitest)' job runs pnpm test with the shared setup; both triggers intact
    -- baseline (same guard copied into a detached worktree at origin/main, re-derived
       independently this round, not carried over from round 1) --
    FAIL: expected exactly 1 step running 'pnpm test', found 0
    -> baseline exit_code: 1

- eval: E2
  run_id: ci-vitest-sdk-pin-e2-1785934930
  exit_code: 0
  baseline: red
  verifier: config:executors.script.civ_job_no_softening
  verified_at: 2026-08-05T13:02:10Z
  output: |
    $ bash scripts/ci/check-vitest-job.sh no-softening
    OK: no continue-on-error / || true / set +e / if: inside the unit-tests job
    -- baseline (origin/main worktree, re-derived this round) --
    FAIL: no 'unit-tests:' job in .github/workflows/ci.yml
    -> baseline exit_code: 1

- eval: E3
  run_id: ci-vitest-sdk-pin-e3-1785934959
  exit_code: 0
  baseline: red
  verifier: config:executors.script.civ_job_teeth
  verified_at: 2026-08-05T13:02:39Z
  output: |
    $ bash scripts/ci/check-vitest-job.sh teeth
    job command under test (read from .github/workflows/ci.yml): pnpm test
    OK: 'pnpm test' (from .github/workflows/ci.yml) fails with the probe present and
    passes once removed — the job has teeth
    -- post-run tree check (the probe must not survive) --
    $ git status --porcelain
     M _acceptance/ci-vitest-sdk-pin/run-log.jsonl
    $ ls src/__civ_teeth_probe.test.ts
    ls: src/__civ_teeth_probe.test.ts: No such file or directory
    $ find . -name '*__civ_teeth_probe*' -not -path './node_modules/*'   # (no matches)
    No probe file survived. The only dirty path is this round's run-log, written by the
    verifier itself.
    -- baseline: DISCRIMINATION RE-CHECK of the round-1 finding --
    Round 1 found this eval non-discriminating: teeth ran `pnpm test` directly and so
    stayed green on a tree with no CI job at all. Commit a1bc936 changed teeth to read
    the command out of the `unit-tests` job in ci.yml. That claim was re-tested here
    rather than taken on trust: the CURRENT guard was copied into a detached worktree at
    origin/main (a tree whose ci.yml has no `unit-tests:` job — grep confirmed) and run:
    FAIL: no 'unit-tests:' job in .github/workflows/ci.yml — nothing to prove teeth about
    -> baseline exit_code: 1
    The claim HOLDS. E3 now fails when the job is absent, so it is discriminating and no
    longer belongs in Analyst.

- eval: E4
  run_id: ci-vitest-sdk-pin-e4-1785935025
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.civ_run_jobs_green
  verified_at: 2026-08-05T13:03:45Z
  output: |
    $ ACCEPTANCE_SLUG=ci-vitest-sdk-pin bash scripts/ci/check-run-jobs.sh ci Lint 'Type Check' Build 'SDK Tests (Python)' 'Unit Tests (vitest)'
    run https://github.com/phanlemanh/OneFlow/actions/runs/31007360274 @ 556c79956035c14337c98bfa04606b938dbe237e
    ok job 'Lint': success
    ok job 'Type Check': success
    ok job 'Build': success
    ok job 'SDK Tests (Python)': success
    ok job 'Unit Tests (vitest)': success
    all requested jobs succeeded at 556c79956035c14337c98bfa04606b938dbe237e
    The round-1 blocker is gone: the branch is pushed and a real run exists, pinned to
    the exact commit under verification.
    baseline rationale: the guard is scoped to this slug's own pull request, which does
    not exist on origin/main, so there is no honest red/green to record on the other side.
    -- DISCLOSURE: AC-4 is only PARTLY covered by this eval --
    AC-4's text names six jobs: the vitest job plus five older ones, INCLUDING
    "Acceptance Gate". The resolved command lists only five (it omits Acceptance Gate),
    following the narrowing config.yaml already documents for ci-actions-bump's
    ci_jobs_green: "the gate job's colour is dominated by acceptance bookkeeping, so it
    cannot serve as evidence about a checkout bump". Independently queried, that run's
    full job list is:
    $ gh run view 31007360274 --json jobs
    Acceptance Gate       completed   failure
    Lint                  completed   success
    Type Check            completed   success
    Unit Tests (vitest)   completed   success
    SDK Tests (Python)    completed   success
    Build                 completed   success
    All six jobs are PRESENT. Five are green. The Acceptance Gate job is not, and its
    only logged cause is this feature's own acceptance bookkeeping:
      VIOLATION [ci-vitest-sdk-pin]: verdict=REJECT (must be PASS to merge)
      pre-merge-check: 1 violation(s) — merge blocked
    That is the same self-reference as E11, and it inherits E11's structural problem too:
    the gate job runs pre-merge-check, which cannot go green for an in-flight
    signoff-required feature before Gate 2. The "Acceptance Gate is green on a real
    runner" half of AC-4 is therefore NOT proven at 556c799, and cannot be proven by any
    verify round. It must be spot-checked at Gate 2, on the first run after the human
    signature lands.

- eval: E5
  run_id: ci-vitest-sdk-pin-e5-1785935038
  exit_code: 0
  baseline: red
  verifier: config:executors.script.civ_pin_derived
  verified_at: 2026-08-05T13:03:58Z
  output: |
    $ bash scripts/plugins/check-overlay-pin-derived.sh shape
    OK: no literal pin; resolves oneflow-sdk==0.2.18 before the cd (line 22 < 32) and
    from inside a foreign git repo
    -- baseline, evidence/baseline-prefix-pin-guards.txt captured on 65b5529 --
    18:SDK_SPEC="${OVERLAY_SDK_SPEC:-oneflow-sdk==0.2.18}"
    FAIL: scripts/plugins/run-overlay-plugin-tests.sh still carries a hardcoded version specifier
    -> baseline exit_code: 1
    The guard grew two assertions since round 1 (resolution happens BEFORE the cd into
    the plugin clone, and survives being run from inside a foreign git repo) — those are
    the two halves of the defect the compose-overlay re-verification found and 28c1a7d
    fixed.

- eval: E6
  run_id: ci-vitest-sdk-pin-e6-1785935038
  exit_code: 0
  baseline: red
  verifier: config:executors.script.civ_pin_teeth
  verified_at: 2026-08-05T13:03:58Z
  output: |
    $ bash scripts/plugins/check-overlay-pin-derived.sh teeth
    OK: perturbed pyproject (9.9.9) moved the spec; real tree still resolves 0.2.18
    -- baseline, evidence/baseline-prefix-pin-guards.txt on 65b5529 --
    python -m pytest: error: unrecognized arguments: --print-spec
    -> baseline exit_code: 4
    This is exactly the fail-open the feature exists to close: pre-fix, perturbing
    sdk/pyproject.toml did not move the spec.

- eval: E7
  run_id: ci-vitest-sdk-pin-e7-1785935038
  exit_code: 0
  baseline: red
  verifier: config:executors.script.civ_pin_override
  verified_at: 2026-08-05T13:03:58Z
  output: |
    $ bash scripts/plugins/check-overlay-pin-derived.sh override
    OK: OVERLAY_SDK_SPEC takes precedence over the derived pin
    -- baseline (same guard copied into an origin/main worktree, re-derived this round) --
    scripts/plugins/check-overlay-pin-derived.sh: line 14: scripts/lib/sdk-version.sh: No such file or directory
    -> baseline exit_code: 1
    HONEST CAVEAT, CARRIED FORWARD FROM ROUND 1 AND RE-CONFIRMED, NOT UPGRADED: this
    baseline red is "the shared library does not exist yet", i.e. the guard aborts on a
    missing file — it is NOT a demonstration that origin/main lost the override. On
    origin/main the `${OVERLAY_SDK_SPEC:-...}` default already honoured the variable, so
    the A/B here proves less than a red usually does. E7 is a should-NOT-break assertion
    and it holds on the branch; that is the whole of what it establishes.

- eval: E8
  run_id: ci-vitest-sdk-pin-e8-1785935038
  exit_code: 0
  baseline: red
  verifier: config:executors.script.civ_pin_single_impl
  verified_at: 2026-08-05T13:03:58Z
  output: |
    $ bash scripts/plugins/check-overlay-pin-derived.sh single-impl
    OK: one parsing law in scripts/lib/sdk-version.sh; both
    scripts/plugins/run-overlay-plugin-tests.sh and scripts/abi/check-overlay-sdk-train.sh source it
    -- baseline (origin/main worktree, re-derived this round) --
    scripts/plugins/check-overlay-pin-derived.sh: line 14: scripts/lib/sdk-version.sh: No such file or directory
    -> baseline exit_code: 1
    Same "file absent" shape as E7's baseline. For AC-8 that absence IS the failure mode
    under test (there was no single place, because there was no shared file), so the red
    reads straighter here than it does for E7.
    AC-8 is satisfied via the shared-script route named in contract Notes; scripts/lib/
    is outside risk_tiers.t3_paths, so the tier stays T2 (see Boundary below).

- eval: E9
  run_id: ci-vitest-sdk-pin-e9-1785935059
  exit_code: 0
  baseline: red
  verifier: config:executors.script.civ_docs_guard_synced
  verified_at: 2026-08-05T13:04:19Z
  output: |
    $ bash scripts/plugins/check-manifest-doc-synced.sh
    OK: CLAUDE.md describes scripts/plugins/check-manifest-unmoved.sh as it behaves — 38 plain strings + 1 origin entry
    -- baseline, evidence/baseline-prefix-pin-guards.txt on 65b5529 --
    FAIL: CLAUDE.md still tells the reader to bump `expected_count`, a knob
    scripts/plugins/check-manifest-unmoved.sh no longer has
    -> baseline exit_code: 1

- eval: E10
  run_id: ci-vitest-sdk-pin-e10-1785935059
  exit_code: 0
  baseline: green
  verifier: config:executors.script.b1_anchored_green
  verified_at: 2026-08-05T13:04:19Z
  output: |
    $ ACCEPTANCE_SLUG=oneflow-plugin-prefix bash scripts/plugins/check-no-config-drift.sh \
      && ACCEPTANCE_SLUG=dependency-refresh-2026-07 bash scripts/deps/check-no-t3-drift.sh \
      && ACCEPTANCE_SLUG=ci-actions-bump bash scripts/ci/check-workflow-drift.sh
    no drift vs the range oneflow-plugin-prefix owns (8477f8a..dd39da8): config
      src/lib/plugins/plugins-registry-schema.ts src/lib/plugins/plugins-registry.server.ts src/db untouched
    manifest intact: 39 plugins, org still https://github.com/tong-io
    no T3 drift: src/lib/abi src/app/api untouched vs the range dependency-refresh-2026-07 owns (1e81ac2..4d89b58)
    workflow drift vs the range ci-actions-bump owns (4d89b58..8477f8a): 16 declared pin
      line(s), comments, and the dry-run guard (-1 +1); no file added, deleted or renamed
    -- baseline (origin/main worktree, re-derived this round) --
    -> baseline exit_code: 0
    The anchors hold: ci.yml gained a job on this branch and check-workflow-drift.sh
    still scores only ci-actions-bump's own range. Green on both sides is the designed
    shape of a should-NOT-fire eval — see Analyst.

- eval: E11
  run_id: ci-vitest-sdk-pin-e11-1785935474
  exit_code: 1
  baseline: green
  verifier: config:executors.script.civ_gate_clean
  verified_at: 2026-08-05T13:11:14Z
  output: |
    THIS BLOCK RECORDS TWO RUNS OF THE SAME COMMAND, BECAUSE THE CHECK INCLUDES THIS
    FEATURE'S OWN VERDICT. scripts/pre-merge-check.sh inspects every
    _acceptance/<slug>/evidence-report.md, including this one, so its result depends on
    what this very file says. Both runs are in run-log.jsonl as separate lines with their
    real exit codes; neither is hidden.

    RUN 1 — before this report was written.
    run_id: ci-vitest-sdk-pin-e11-1785934911   verified_at: 2026-08-05T13:01:51Z
    $ bash scripts/pre-merge-check.sh . --base origin/main
    VIOLATION [ci-vitest-sdk-pin]: verdict=REJECT (must be PASS to merge)
    pre-merge-check: rules ran=3 declared-off=0 expected=3
    pre-merge-check: 1 violation(s) — merge blocked
    -> exit_code: 1
    Exactly one violation, and it was this feature's own round-1 verdict. Every other
    feature printed OK. The nine round-1 staleness violations are gone: 28c1a7d fixed two
    real defects and 556c799 re-pinned nine features' evidence, so the re-sign wave is
    complete and the only thing left standing was this report's own verdict.

    RUN 2 — re-run AFTER this report reached its verdict, because the check includes this
    feature's own verdict and could not clear until the round-2 result was written. The
    intermediate state was a fully-written PASS report; the re-run below was made against
    it, and its result is what turned this report into a REJECT.
    run_id: ci-vitest-sdk-pin-e11-1785935474   verified_at: 2026-08-05T13:11:14Z
    $ bash scripts/pre-merge-check.sh . --base origin/main
    VIOLATION [ci-vitest-sdk-pin]: verdict PASS but human_signoff is empty (Gate 2 pending)
    pre-merge-check: rules ran=3 declared-off=0 expected=3
    pre-merge-check: 1 violation(s) — merge blocked
    -> exit_code: 1
    Still not `clean`. AC-11 demands the word `clean`; the guard prints "merge blocked".
    The criterion is not met at this commit, so E11 FAILS and the verdict is REJECT.

    WHY IT FAILED IS NOT WHAT ROUND 1 EXPECTED, and this is the important part.
    scripts/pre-merge-check.sh:1005-1036 gates every feature whose contract status is
    `implemented` through three consecutive checks, in this order:
      1. no evidence-report.md            -> VIOLATION
      2. verdict != PASS                  -> VIOLATION
      3. verdict == PASS, signoff empty   -> VIOLATION  (signoff.required_for: [T2, T3])
    A feature being verified is, by definition, in exactly one of those three states. The
    first is where it starts, the second is a REJECT round, the third is every PASS round
    before Gate 2 — and the verifier is forbidden to fill human_signoff, which is a
    human-owned field that must land in its own commit
    (signoff.require_human_commit: true). E11 therefore cannot print `clean` in ANY S4
    verify round of a signoff-required feature. It is not measuring this branch; it is
    measuring whether Gate 2 has already happened. See Findings.

    -- WAVE COMPOSITION (AC-11's other half), verified independently of the guard --
    $ git diff --stat origin/main...HEAD -- _acceptance/   (+ per-feature verified_commit)
    9 features carry evidence re-pinned at 28c1a7d; 6 are untouched at older commits:
      re-verify + re-sign (2): ci-actions-bump, compose-overlay
      carry-forward re-pin (7): conformance-l0, dependency-refresh-2026-07,
        measure-harness, oneflow-plugin-prefix, per-plugin-origin,
        sdk-distribution-rename, task-metering
      not touched (6): cache-l1-fingerprint, cache-l2-store, cache-l3-tier-b,
        cache-l4-eviction, gate-scope-anchors, stale-scope-by-paths
    2 + 7 + 6 = 15, feature for feature identical to the Gate-1 quote in contract.md. No
    scope was silently widened; no feature outside the quote moved. This half of AC-11 is
    MET. The `clean` half is not.

    -- baseline (origin/main worktree, re-derived this round) --
    pre-merge-check: clean
    -> baseline exit_code: 0
    The baseline is green only because origin/main carries no in-flight feature. It is
    not evidence that this branch could ever reach `clean` before Gate 2.

- eval: E12
  run_id: ci-vitest-sdk-pin-e12-1785935072
  exit_code: 0
  baseline: green
  verifier: config:executors.script.civ_eval_keys_intact
  verified_at: 2026-08-05T13:04:32Z
  output: |
    $ bash scripts/ci/check-eval-keys-intact.sh origin/main
    OK: 15 overlay_* keys and feature_loop.suite_keys byte-identical to origin/main
    (13 overlay_* render keys + overlay_registration_synced + overlay_sdk_train = 15,
    matching what config.yaml declares.)
    -- baseline note --
    Run against origin/main the comparison is main-vs-main and passes trivially, so this
    eval is green on both sides. See Analyst.

- eval: E13
  run_id: ci-vitest-sdk-pin-e13-1785935072
  exit_code: 0
  baseline: green
  verifier: config:executors.script.verify_plugins
  verified_at: 2026-08-05T13:04:32Z
  output: |
    $ pnpm verify:plugins
    > oneflow@0.2.1 verify:plugins /Users/manhphan/dev/oneflow
    > tsx scripts/verify-plugins-scan.ts
    [verify-plugins-scan] OK
    -- baseline note --
    The scanner does not read _acceptance/config.yaml; green on origin/main as well.

## Findings

1. **E11 / AC-11 is unsatisfiable by any verify round** (the reason for this REJECT).
   `scripts/pre-merge-check.sh` violates on an in-flight signoff-required feature in all
   three states it can occupy during S4: no report, verdict != PASS, or verdict == PASS
   with an empty `human_signoff`. The third is the state this report is in, and the
   verifier must not leave it — `human_signoff` is human-owned and, under
   `signoff.require_human_commit: true`, must arrive in its own commit signed by a human.
   AC-11's premise ("given this branch in a merge-ready state") is only true AFTER Gate 2,
   but the eval runs BEFORE it. Round 1 read the failure as "the re-sign wave has not run
   yet", which was true then and hid this; the wave has since run, and the residue is the
   structural half. Two honest resolutions exist, both outside a verifier's authority:
   re-scope the eval to the OTHER features (e.g. assert no violation for any slug except
   this one), or move it to a Gate-2 post-signature check. Reported, not fixed — the
   instructions for this round forbid touching evals.yaml, contract.md, or guard scripts,
   and rightly so.
2. **AC-4's "Acceptance Gate job is green" half has the same shape.** The eval's command
   omits that job on purpose, and the job itself runs pre-merge-check, so it inherits
   finding 1. Recorded in the E4 block; it needs a Gate-2 spot-check, not another verify
   round.
3. **The Gate-1 file-count quote is off.** contract.md quotes "diff dự kiến chạm đúng 3
   file"; the branch touches 10 outside `_acceptance/`. The extra seven are guard scripts
   created or adjusted to make the criteria checkable (plus `check-action-pins.sh`, whose
   checkout-site snapshot the new job forced from 7 to 8). All are inside `scripts/` and
   `.github/`, none is under `risk_tiers.t3_paths`, and the re-sign wave is unchanged —
   so this is a disclosure, not a tier escalation.

## Analyst

E10, E12, E13 are green on BOTH the branch and the origin/main baseline — they prove the
harness, not the feature.

- E10 (anchored guards): a should-NOT-fire eval; green on both is its intended shape. It
  carries no positive evidence about this feature — only the absence of collateral damage
  to gate-scope-anchors' anchoring.
- E12 (eval keys intact): compares config.yaml against origin/main; on the baseline that
  is a self-comparison and passes vacuously.
- E13 (verify:plugins): the plugin scanner does not read `_acceptance/config.yaml`, so no
  change in this feature could have moved it either way.
- E11 is green on the baseline and red here, but that is not discrimination in the useful
  direction: the baseline is green because origin/main has no in-flight feature at all.
  See Findings 1.

E3 has MOVED OUT of this section since round 1. Round 1 filed it as non-discriminating;
a1bc936 rewired teeth to read the job command out of ci.yml, and the claim was re-tested
from scratch this round (current guard, origin/main tree, no unit-tests job) — it goes
red. The A/B is now real.

Boundary check performed independently of the evals:
`git diff --name-only origin/main...HEAD` outside `_acceptance/` touches exactly
.github/workflows/ci.yml, CLAUDE.md, scripts/abi/check-overlay-sdk-train.sh,
scripts/ci/check-action-pins.sh, scripts/ci/check-eval-keys-intact.sh,
scripts/ci/check-vitest-job.sh, scripts/lib/sdk-version.sh,
scripts/plugins/check-manifest-doc-synced.sh,
scripts/plugins/check-overlay-pin-derived.sh,
scripts/plugins/run-overlay-plugin-tests.sh. None is under `risk_tiers.t3_paths` — in
particular the AC-8 shared rule landed in `scripts/lib/`, not `sdk/` — so the T2 tier
declared in the contract still holds and no escalation is required.

## Known limits

- `scripts/lib/sdk-version.sh` anchors its default root with `BASH_SOURCE[0]`, so it is
  only correct when sourced FROM BASH. Verified this round rather than assumed: sourcing
  it under zsh from /tmp resolves the root to `/` and then reports
  `sdk-version: no such file: //sdk/pyproject.toml` (exit 2), whereas the same source
  under bash resolves the repo root and yields `oneflow-sdk==0.2.18`. It fails CLOSED and
  loudly, not silently to a wrong version. Every consumer in the repo is a
  `#!/usr/bin/env bash` script, so this is not a defect today; it is a trap for the first
  consumer written for a different shell. Recorded, not fixed — no production file was
  touched in this round.
- The wave-ownership rule ("owned file set = the merge commit's diff") still cannot
  separate `compose-overlay` from `gate-scope-anchors`, which share `landed_merge`
  7976bd8. Already disclosed in contract.md Context; unchanged by this round.

## Variance

none — no eval declares runs > 1

## Iterations

Round 1 (commit b2462f4) returned REJECT on [E4, E11].
- E4: no CI run existed for the branch, which was unpushed. `gh` was installed and
  authenticated, so the executor ran and returned a real answer — a genuine failure, not
  a BLOCKED.
- E11: 10 violations. Nine were staleness across the re-sign wave (the wave had not been
  run yet); the tenth was this feature's own missing evidence-report.
- Round 1 also filed E3 as non-discriminating and disclosed that E7's baseline red is
  weaker than it appears.

Between rounds (not this verifier's work, recorded from the log): a1bc936 rewired the E3
teeth mode to read the job command out of ci.yml; the branch was pushed and CI ran;
28c1a7d fixed two real defects found by a separate re-verification wave (the SDK-version
root was being resolved at call time, which killed all 13 compose-overlay render evals
once the runner cd'd into the plugin clone; and check-action-pins.sh needed its
checkout-site snapshot re-numbered 7 -> 8 because the new vitest job adds a site);
556c799 re-pinned nine features' evidence at 28c1a7d.

Round 2 (commit 556c799, enforcement strict, no bypass): all 13 evals executed. 12
passed; E11 failed. Order was fixed in advance for the self-referential eval — E11 was
run FIRST, as-is, before anything was written; then every other eval was run; then the
report was written (as PASS, since at that moment E11's only known violation was the
self-reference that the write clears); then E11 was re-run, came back with a DIFFERENT
violation that no write of this report can clear, and the verdict was changed to REJECT
to match the run. Both E11 runs are in run-log.jsonl as separate lines with their real
exit codes.

Round-1 findings re-checked rather than inherited:
- E3's discrimination claim HOLDS (see the E3 block). E3 leaves Analyst.
- E4 now passes on a real runner, with the Acceptance-Gate caveat disclosed in its block.
- E7's weak baseline SURVIVES as a disclosure, not upgraded (see the E7 block).
- E3's perturbation cleanup was audited again: after the run, `git status --porcelain`
  showed only the verifier's own run-log.jsonl, and a repo-wide find for the probe name
  returned nothing. No probe file survived.

No production file, guard script, contract, or evals.yaml was modified during this round.
One throwaway detached worktree at origin/main was created to re-derive real baselines
for E1, E2, E3, E7, E8, E10, E11; it was removed and `git worktree prune` run, leaving
HEAD at 556c799 with only run-log.jsonl and this report modified.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Decide Finding 1: E11/AC-11 as written cannot pass in a verify round. Either
      re-scope the eval (assert no violation for any slug OTHER than this one), move it
      to a post-signature Gate-2 check, or accept the criterion as human-judged here.
- [ ] Spot-check the FIRST CI run after the signature commit: confirm the Acceptance Gate
      job is green there (the AC-4 half no verify round can observe — see E4, Finding 2)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
