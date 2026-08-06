---
schema_version: 2
feature_slug: ci-vitest-sdk-pin
verdict: REJECT
failed_evals: [E11]
reason: "E11 (bash scripts/acceptance/check-gate-residual.sh ci-vitest-sdk-pin origin/main) exits 1 at 01ee88c, naming TEN other features as stale. The amendment's new guard is sound and discriminating — it is refusing for a true reason. The reason is that commit 01ee88c, the amendment commit itself, added scripts/acceptance/check-gate-residual.sh: a file outside _acceptance/ and outside t1_skip_globs, which re-staled the nine features re-pinned at 28c1a7d plus stale-scope-by-paths (whose declared scope covers scripts/acceptance/**). The re-sign wave the guard exists to assert is therefore incomplete again at HEAD. Twelve evals pass. Fixing this is a fresh re-pin wave at 01ee88c, or a config decision about gate tooling under scripts/acceptance/ — neither is a verifier's call."
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 01ee88c75ed52b63dc982443e7f471ac870d943c
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
  run_id: ci-vitest-sdk-pin-e1-1785938498
  exit_code: 0
  baseline: red
  verifier: config:executors.script.civ_job_shape
  verified_at: 2026-08-05T14:01:38Z
  output: |
    $ bash scripts/ci/check-vitest-job.sh shape
    OK: one 'Unit Tests (vitest)' job runs pnpm test with the shared setup; both triggers intact
    -- baseline (current guard copied into a fresh detached worktree at origin/main = 65b5529,
       re-derived independently this round, not carried over) --
    FAIL: expected exactly 1 step running 'pnpm test', found 0
    -> baseline exit_code: 1

- eval: E2
  run_id: ci-vitest-sdk-pin-e2-1785938508
  exit_code: 0
  baseline: red
  verifier: config:executors.script.civ_job_no_softening
  verified_at: 2026-08-05T14:01:48Z
  output: |
    $ bash scripts/ci/check-vitest-job.sh no-softening
    OK: no continue-on-error / || true / set +e / if: inside the unit-tests job
    -- baseline (origin/main worktree, re-derived this round) --
    FAIL: no 'unit-tests:' job in .github/workflows/ci.yml
    -> baseline exit_code: 1

- eval: E3
  run_id: ci-vitest-sdk-pin-e3-1785938516
  exit_code: 0
  baseline: red
  verifier: config:executors.script.civ_job_teeth
  verified_at: 2026-08-05T14:02:00Z
  output: |
    $ bash scripts/ci/check-vitest-job.sh teeth
    job command under test (read from .github/workflows/ci.yml): pnpm test
    OK: 'pnpm test' (from .github/workflows/ci.yml) fails with the probe present and
    passes once removed — the job has teeth
    -- post-run tree check (the probe must not survive) --
    $ git status --porcelain
     M _acceptance/ci-vitest-sdk-pin/run-log.jsonl
    $ find . -name '*__civ_teeth_probe*' -not -path './node_modules/*'
    (no matches)
    No probe file survived. The only dirty path is this round's run-log, written by the
    verifier itself.
    -- baseline (current guard, origin/main worktree; that tree has no 'unit-tests:' job —
       grep -c 'unit-tests:' returned 0) --
    FAIL: no 'unit-tests:' job in .github/workflows/ci.yml — nothing to prove teeth about
    -> baseline exit_code: 1
    The round-1 non-discrimination finding stays closed: re-derived from scratch a second
    time here, the teeth mode still refuses on a tree with no job.

- eval: E4
  run_id: ci-vitest-sdk-pin-e4-1785938533
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.civ_run_jobs_green
  verified_at: 2026-08-05T14:02:17Z
  output: |
    $ ACCEPTANCE_SLUG=ci-vitest-sdk-pin bash scripts/ci/check-run-jobs.sh ci Lint 'Type Check' Build 'SDK Tests (Python)' 'Unit Tests (vitest)'
    run https://github.com/phanlemanh/OneFlow/actions/runs/31012949660 @ 01ee88c75ed52b63dc982443e7f471ac870d943c
    ok job 'Lint': success
    ok job 'Type Check': success
    ok job 'Build': success
    ok job 'SDK Tests (Python)': success
    ok job 'Unit Tests (vitest)': success
    all requested jobs succeeded at 01ee88c75ed52b63dc982443e7f471ac870d943c
    baseline rationale: the guard is scoped to this slug's own pull request, which does
    not exist on origin/main, so there is no honest red/green to record on the other side.
    -- DISCLOSURE, CARRIED FORWARD AND RE-MEASURED: AC-4 is only PARTLY covered --
    AC-4's text names SIX jobs including "Acceptance Gate"; the resolved command lists
    FIVE, following the narrowing config.yaml already documents for ci-actions-bump's
    ci_jobs_green ("the gate job's colour is dominated by acceptance bookkeeping").
    Independently queried this round:
    $ gh run view 31012949660 --json jobs
    Build                 completed   success
    SDK Tests (Python)    completed   success
    Unit Tests (vitest)   completed   success
    Type Check            completed   success
    Lint                  completed   success
    Acceptance Gate       completed   failure
    All six jobs are PRESENT; five are green; Acceptance Gate is red. Its logged cause at
    this commit is NOT only this feature's pending signature — it is eleven violations,
    ten of them the same staleness E11 reports (see the E11 block):
      VIOLATION [ci-actions-bump]: evidence is stale ... (verified_commit 28c1a7d...)
      VIOLATION [ci-vitest-sdk-pin]: verdict=REJECT (must be PASS to merge)
      ... eight more staleness violations ...
      pre-merge-check: 11 violation(s) - merge blocked
    Round 2 recorded this job as red for the single self-reference reason. At 01ee88c that
    is no longer the whole story, and the difference is the finding of this round.

- eval: E5
  run_id: ci-vitest-sdk-pin-e5-1785938617
  exit_code: 0
  baseline: red
  verifier: config:executors.script.civ_pin_derived
  verified_at: 2026-08-05T14:03:37Z
  output: |
    $ bash scripts/plugins/check-overlay-pin-derived.sh shape
    OK: no literal pin; resolves oneflow-sdk==0.2.18 before the cd (line 22 < 32) and
    from inside a foreign git repo
    -- baseline A, the committed pre-fix capture evidence/baseline-prefix-pin-guards.txt
       (taken on 65b5529 before any production edit) --
    18:SDK_SPEC="${OVERLAY_SDK_SPEC:-oneflow-sdk==0.2.18}"
    FAIL: scripts/plugins/run-overlay-plugin-tests.sh still carries a hardcoded version specifier
    -> baseline exit_code: 1
    -- baseline B, re-derived this round: the CURRENT guard copied into an origin/main
       worktree aborts before it can assert anything --
    scripts/plugins/check-overlay-pin-derived.sh: line 14: scripts/lib/sdk-version.sh: No such file or directory
    -> baseline exit_code: 1
    Baseline A is the load-bearing one: it shows the literal pin the feature removed.

- eval: E6
  run_id: ci-vitest-sdk-pin-e6-1785938617
  exit_code: 0
  baseline: red
  verifier: config:executors.script.civ_pin_teeth
  verified_at: 2026-08-05T14:03:37Z
  output: |
    $ bash scripts/plugins/check-overlay-pin-derived.sh teeth
    OK: perturbed pyproject (9.9.9) moved the spec; real tree still resolves 0.2.18
    -- baseline, evidence/baseline-prefix-pin-guards.txt on 65b5529 --
    python -m pytest: error: unrecognized arguments: --print-spec
    -> baseline exit_code: 4
    This is exactly the fail-open the feature exists to close: pre-fix, perturbing
    sdk/pyproject.toml did not move the spec.

- eval: E7
  run_id: ci-vitest-sdk-pin-e7-1785938617
  exit_code: 0
  baseline: red
  verifier: config:executors.script.civ_pin_override
  verified_at: 2026-08-05T14:03:37Z
  output: |
    $ bash scripts/plugins/check-overlay-pin-derived.sh override
    OK: OVERLAY_SDK_SPEC takes precedence over the derived pin
    -- baseline (current guard copied into an origin/main worktree, re-derived this round) --
    scripts/plugins/check-overlay-pin-derived.sh: line 14: scripts/lib/sdk-version.sh: No such file or directory
    -> baseline exit_code: 1
    HONEST CAVEAT, CARRIED FORWARD FROM ROUNDS 1 AND 2, RE-CONFIRMED, NOT UPGRADED: this
    baseline red is "the shared library does not exist yet", i.e. the guard aborts on a
    missing file — it is NOT a demonstration that origin/main lost the override. On
    origin/main the `${OVERLAY_SDK_SPEC:-...}` default already honoured the variable, so
    the A/B here proves less than a red usually does. E7 is a should-NOT-break assertion
    and it holds on the branch; that is the whole of what it establishes.

- eval: E8
  run_id: ci-vitest-sdk-pin-e8-1785938617
  exit_code: 0
  baseline: red
  verifier: config:executors.script.civ_pin_single_impl
  verified_at: 2026-08-05T14:03:37Z
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
  run_id: ci-vitest-sdk-pin-e9-1785938628
  exit_code: 0
  baseline: red
  verifier: config:executors.script.civ_docs_guard_synced
  verified_at: 2026-08-05T14:03:48Z
  output: |
    $ bash scripts/plugins/check-manifest-doc-synced.sh
    OK: CLAUDE.md describes scripts/plugins/check-manifest-unmoved.sh as it behaves — 38 plain strings + 1 origin entry
    -- baseline, both the committed capture on 65b5529 and a fresh origin/main worktree
       run this round agree --
    FAIL: CLAUDE.md still tells the reader to bump `expected_count`, a knob
    scripts/plugins/check-manifest-unmoved.sh no longer has
    -> baseline exit_code: 1

- eval: E10
  run_id: ci-vitest-sdk-pin-e10-1785938628
  exit_code: 0
  baseline: green
  verifier: config:executors.script.b1_anchored_green
  verified_at: 2026-08-05T14:03:49Z
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
  run_id: ci-vitest-sdk-pin-e11-1785938577
  exit_code: 1
  baseline: green
  verifier: config:executors.script.civ_gate_residual
  verified_at: 2026-08-05T14:03:01Z
  output: |
    $ bash scripts/acceptance/check-gate-residual.sh ci-vitest-sdk-pin origin/main
    VIOLATION [ci-actions-bump]: evidence is stale — code changed after verify (verified_commit 28c1a7d...); re-run verify before merge. Changed:
    VIOLATION [compose-overlay]: evidence is stale — code changed after verify (verified_commit 28c1a7d...); re-run verify before merge. Changed:
    VIOLATION [conformance-l0]: evidence is stale — code changed after verify (verified_commit 28c1a7d...); re-run verify before merge. Changed:
    VIOLATION [dependency-refresh-2026-07]: evidence is stale — code changed after verify (verified_commit 28c1a7d...); re-run verify before merge. Changed:
    VIOLATION [measure-harness]: evidence is stale — code changed after verify (verified_commit 28c1a7d...); re-run verify before merge. Changed:
    VIOLATION [oneflow-plugin-prefix]: evidence is stale — code changed after verify (verified_commit 28c1a7d...); re-run verify before merge. Changed:
    VIOLATION [per-plugin-origin]: evidence is stale — code changed after verify (verified_commit 28c1a7d...); re-run verify before merge. Changed:
    VIOLATION [sdk-distribution-rename]: evidence is stale — code changed after verify (verified_commit 28c1a7d...); re-run verify before merge. Changed:
    VIOLATION [stale-scope-by-paths]: evidence is stale — code changed after verify (verified_commit f39723a...); re-run verify before merge. Changed:
    VIOLATION [task-metering]: evidence is stale — code changed after verify (verified_commit 28c1a7d...); re-run verify before merge. Changed:
    FAIL: violations outside 'ci-vitest-sdk-pin' (above) — the re-sign wave has not cleared
    -> exit_code: 1

    ROOT CAUSE, established rather than inferred. Every one of the ten violations names the
    SAME single changed file:
    $ bash scripts/pre-merge-check.sh . --base origin/main | grep -A1 'VIOLATION \[task-metering\]'
    VIOLATION [task-metering]: evidence is stale — code changed after verify (verified_commit 28c1a7d...); re-run verify before merge. Changed:
        scripts/acceptance/check-gate-residual.sh
    $ git diff --name-only 28c1a7d HEAD | grep -v '^_acceptance/'
    scripts/acceptance/check-gate-residual.sh
    Commit 01ee88c — the amendment commit — created that guard. It lives outside
    _acceptance/ and is not one of the four exact paths t1_skip_globs exempts for gate
    tooling (scripts/pre-merge-check.sh, scripts/recheck-evidence.js, lib/evidence-core.js,
    lib/gap-probe.js), so it stales every feature whose evidence was pinned at 28c1a7d by
    556c799 — the nine of the re-sign wave — plus stale-scope-by-paths, whose narrow
    declared scope includes scripts/acceptance/**. The guard written to assert "every other
    feature is clean" is itself the file that made every other feature unclean.

    The criterion is NOT met at 01ee88c and E11 correctly says so. This is not the round-2
    failure returning: round 2's E11 was unsatisfiable in principle; this one is satisfiable
    and simply unsatisfied — a fresh re-pin wave at 01ee88c would clear it, as would a
    decision to exempt scripts/acceptance/ gate tooling in t1_skip_globs. Both are owner
    calls; neither is a verifier's, and no file was changed to chase it.

    -- IS THE NEW GUARD DISCRIMINATING, OR DOES IT RUBBER-STAMP? Probed, not assumed. --
    Probes ran in a throwaway detached worktree at 556c799 (the last commit where the wave
    WAS clean) with the current guard copied in as an untracked file; the real tree was
    never touched. Restoration was verified with git status after each probe.
    A. Unperturbed there: "OK: the only violation(s) are ci-vitest-sdk-pin's own pending
       Gate-2 signature (1); every other feature is clean" -> exit 0.
    B. Blanked task-metering's human_signoff:
       VIOLATION [task-metering]: verdict PASS but human_signoff is empty (Gate 2 pending)
       FAIL: violations outside 'ci-vitest-sdk-pin' (above) — the re-sign wave has not cleared
       -> exit 1. Restored -> back to exit 0.
    C. Repointed compose-overlay's verified_commit at 65b5529:
       VIOLATION [compose-overlay]: evidence is stale — code changed after verify (verified_commit 65b5529)
       FAIL: violations outside 'ci-vitest-sdk-pin' (above) — the re-sign wave has not cleared
       -> exit 1. Restored -> back to exit 0.
    D. Gave the IN-FLIGHT slug a violation outside the forgiven set (own report set to
       verdict PASS with a signature never committed by a human):
       VIOLATION [ci-vitest-sdk-pin]: human_signoff present but not found in any commit ...
       FAIL: 'ci-vitest-sdk-pin' violation is not the pending-signature class (above)
       -> exit 1.
    The foreign half REFUSES when it should, names the feature, and recovers on restore.
    The own half does not blanket-forgive. Two caveats on the own half are recorded in
    Findings 2 and 3 — it forgives one class more than the amendment's wording promises,
    and it inherits a blind spot from pre-merge-check's per-feature short-circuit.

    -- baseline (current guard copied into an origin/main worktree, re-derived this round) --
    OK: gate clean — no violation at all, including ci-vitest-sdk-pin
    -> baseline exit_code: 0
    The baseline is green only because origin/main carries no in-flight feature and no
    unpinned wave. It is not evidence about this branch either way.

    Re-run AFTER this report was written, because the check reads every evidence-report.md
    including this one — same result, no dependence on what this file says:
    run_id: ci-vitest-sdk-pin-e11-1785939018   verified_at: 2026-08-05T14:10:22Z
    FAIL: violations outside 'ci-vitest-sdk-pin' (above) — the re-sign wave has not cleared
    -> exit_code: 1
    Both runs are separate lines in run-log.jsonl with their real exit codes.

- eval: E12
  run_id: ci-vitest-sdk-pin-e12-1785938638
  exit_code: 0
  baseline: green
  verifier: config:executors.script.civ_eval_keys_intact
  verified_at: 2026-08-05T14:03:58Z
  output: |
    $ bash scripts/ci/check-eval-keys-intact.sh origin/main
    OK: 15 overlay_* keys and feature_loop.suite_keys byte-identical to origin/main
    (13 overlay_* render keys + overlay_registration_synced + overlay_sdk_train = 15,
    matching what config.yaml declares.)
    -- baseline note (re-derived this round in the origin/main worktree) --
    OK: 15 overlay_* keys and feature_loop.suite_keys byte-identical to origin/main
    -> baseline exit_code: 0
    On the baseline the comparison is main-vs-main and passes trivially, so this eval is
    green on both sides. See Analyst.

- eval: E13
  run_id: ci-vitest-sdk-pin-e13-1785938638
  exit_code: 0
  baseline: green
  verifier: config:executors.script.verify_plugins
  verified_at: 2026-08-05T14:04:00Z
  output: |
    $ pnpm verify:plugins
    > oneflow@0.2.1 verify:plugins /Users/manhphan/dev/oneflow
    > tsx scripts/verify-plugins-scan.ts
    [verify-plugins-scan] OK
    -- baseline note --
    The scanner does not read _acceptance/config.yaml; green on origin/main as well.

## Findings

1. **The amendment commit re-staled the re-sign wave, and E11 caught it** (the reason for
   this REJECT). `01ee88c` added `scripts/acceptance/check-gate-residual.sh`, a file
   outside `_acceptance/` and outside the four exact gate-tooling paths `t1_skip_globs`
   exempts. That one file stales all nine features whose evidence `556c799` pinned at
   `28c1a7d`, plus `stale-scope-by-paths` (declared scope covers `scripts/acceptance/**`).
   The same eleven violations are what turns the Acceptance Gate job red on the real CI
   run at this commit (see E4). Two honest exits, both owner decisions: re-pin the wave at
   `01ee88c` (mechanical, the tenth feature's own scope makes it cheap), or add
   `scripts/acceptance/**` — or at least this guard — to `t1_skip_globs` on the same
   "measuring stick, not product code" reasoning the four existing entries already carry,
   and accept that gate tooling then stops staling evidence. Not fixed here: the round's
   instructions forbid touching guard scripts, contracts, `evals.yaml`, and config, and
   the second option is a policy change that belongs to a contract of its own.
   *Structural note for the queue: this is a treadmill, not a one-off. Every future
   acceptance-gate feature that lands a new guard under `scripts/` re-stales every feature
   pinned before it, so the wave must be re-run once per fix commit. `stale-scope-by-paths`
   named this family; the exemption list is where it was meant to be answered.*
2. **`check-gate-residual.sh` forgives one class more than the amendment promises.**
   The amendment says it tolerates only "the in-flight slug's pending Gate-2 signature";
   the code's own comment says "a red eval or stale evidence belonging to this slug is a
   real failure and must not hide behind its own name". But the `case` at lines 56-61
   forgives three strings: `human_signoff is empty`, **`verdict=REJECT`**, and
   **`no evidence-report.md`**. Probe A demonstrates the gap concretely: at `556c799` the
   only violation was `VIOLATION [ci-vitest-sdk-pin]: verdict=REJECT`, and the guard
   printed *"the only violation(s) are ci-vitest-sdk-pin's own pending Gate-2 signature"*
   — a green verdict, with a message that misdescribes what it forgave. There IS a defensible
   reason for the wider set (E11 runs before the round's report is written, so the report on
   disk is the previous round's), but the effect is that E11 is structurally incapable of
   going red on account of this feature's own verdict. That is acceptable only because the
   verdict is read from the report directly by `pre-merge-check`, not through E11 — nothing
   false-greens the gate. Recorded for Gate 2 as a wording-vs-behaviour mismatch to settle
   in one direction or the other; the message string is wrong either way.
3. **A blind spot inherited from `pre-merge-check`'s per-feature short-circuit.**
   Probe D2: with the in-flight report set to `verdict: PASS`, empty `human_signoff`, AND a
   deliberately stale `verified_commit`, `pre-merge-check` emitted only the empty-signoff
   violation — the staleness of the in-flight feature's own evidence was never printed, so
   `check-gate-residual.sh` returned exit 0. While the signature is pending (i.e. during
   every verify round), the in-flight slug's own staleness is invisible to this guard. It
   is not a hole the guard opened; it is the shape of the source it reads. Whether that
   matters is a Gate-2 judgement — the same run has already proved the tree fresh through
   E1..E10/E12/E13 — but it should be known rather than assumed away.
4. **AC-4 six-vs-five, re-measured.** The criterion names six jobs; the resolved command
   checks five. All six exist on run 31012949660; the five checked are green; Acceptance
   Gate is `failure`. At `556c799` its only cause was this feature's own verdict; at
   `01ee88c` its causes are the eleven violations of Finding 1, i.e. mostly OTHER features.
   The "Acceptance Gate is green on a real runner" half of AC-4 remains unproven, and after
   Finding 1 is fixed it will still need a post-signature spot-check.
5. **The Gate-1 file-count correction in the contract is itself now short by one.**
   The Amendment's "Đính chính" lists 10 files outside `_acceptance/`, naming seven guard
   scripts. `git diff --name-only origin/main...HEAD` outside `_acceptance/` at 01ee88c
   returns 13 paths — the 10 plus `STATUS.md` and `docs/roadmap.md` (both t1-exempt docs)
   and `scripts/acceptance/check-gate-residual.sh` (the eighth guard, added by the
   amendment itself). Still nothing under `risk_tiers.t3_paths`, so **T2 still holds**.
   Disclosure, not escalation.

## Analyst

E10, E12, E13 are green on BOTH the branch and the origin/main baseline — they prove the
harness, not the feature.

- E10 (anchored guards): a should-NOT-fire eval; green on both is its intended shape. It
  carries no positive evidence about this feature — only the absence of collateral damage
  to gate-scope-anchors' anchoring.
- E12 (eval keys intact): compares config.yaml against origin/main; on the baseline that
  is a self-comparison and passes vacuously. Re-derived this round rather than assumed.
- E13 (verify:plugins): the plugin scanner does not read `_acceptance/config.yaml`, so no
  change in this feature could have moved it either way.
- E11 is green on the origin/main baseline and red here. Unlike round 2, that IS
  discrimination in the useful direction this round: the branch genuinely carries an
  uncleared wave and the guard says so. The baseline green remains uninformative (no
  in-flight feature there), so it is the probe suite in the E11 block — not the baseline —
  that establishes the guard has teeth.
- E3 stays OUT of this section, as in round 2: re-derived from scratch again this round
  (current guard, origin/main tree, no unit-tests job) it goes red. The A/B is real.

Boundary check performed independently of the evals:
`git diff --name-only origin/main...HEAD` outside `_acceptance/` touches
.github/workflows/ci.yml, CLAUDE.md, STATUS.md, docs/roadmap.md,
scripts/abi/check-overlay-sdk-train.sh, scripts/acceptance/check-gate-residual.sh,
scripts/ci/check-action-pins.sh, scripts/ci/check-eval-keys-intact.sh,
scripts/ci/check-vitest-job.sh, scripts/lib/sdk-version.sh,
scripts/plugins/check-manifest-doc-synced.sh,
scripts/plugins/check-overlay-pin-derived.sh,
scripts/plugins/run-overlay-plugin-tests.sh. None is under `risk_tiers.t3_paths` — in
particular the AC-8 shared rule landed in `scripts/lib/`, not `sdk/` — so the T2 tier
declared in the contract still holds and no escalation is required.

## Known limits

- `scripts/lib/sdk-version.sh` anchors its default root with `BASH_SOURCE[0]`, so it is
  only correct when sourced FROM BASH. Verified in round 2 rather than assumed: sourced
  under zsh from /tmp it resolves the root to `/` and reports
  `sdk-version: no such file: //sdk/pyproject.toml` (exit 2), whereas the same source
  under bash resolves the repo root and yields `oneflow-sdk==0.2.18`. It fails CLOSED and
  loudly, not silently to a wrong version. Every consumer in the repo is a
  `#!/usr/bin/env bash` script, so this is not a defect today; it is a trap for the first
  consumer written for a different shell. Carried forward unchanged.
- **The AC-11 unsatisfiability is a general trap, and it now has a sibling.** Any future
  contract with a "pre-merge-check clean" criterion hits the same wall round 2 documented.
  Round 3 adds the second half: any feature that lands a new guard file under `scripts/`
  re-stales every already-pinned feature, so "the re-sign wave is clean" is a moving target
  that must be re-hit after every fix commit. Both belong in the repo's queue as one item
  about how gate tooling is scoped (`t1_skip_globs`), not as per-feature patches.
- The wave-ownership rule ("owned file set = the merge commit's diff") still cannot
  separate `compose-overlay` from `gate-scope-anchors`, which share `landed_merge`
  7976bd8. Already disclosed in contract.md Context; unchanged by this round.
- `check-gate-residual.sh`'s forgiveness set and its success message disagree with each
  other and with the Amendment's wording (Finding 2); and it cannot see the in-flight
  slug's own staleness while the signature is pending (Finding 3).

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

Between rounds 1 and 2 (not this verifier's work, recorded from the log): a1bc936 rewired
the E3 teeth mode to read the job command out of ci.yml; the branch was pushed and CI ran;
28c1a7d fixed two real defects found by a separate re-verification wave (the SDK-version
root was being resolved at call time, which killed all 13 compose-overlay render evals
once the runner cd'd into the plugin clone; and check-action-pins.sh needed its
checkout-site snapshot re-numbered 7 -> 8 because the new vitest job adds a site);
556c799 re-pinned nine features' evidence at 28c1a7d.

Round 2 (commit 556c799, enforcement strict, no bypass) returned REJECT on [E11] alone.
12 of 13 evals passed. The finding was not "the wave has not run" — the wave HAD run — but
that AC-11 as originally written was **unsatisfiable**: `pre-merge-check.sh` violates on the
in-flight feature in all three states it can occupy during S4 (no report; verdict not PASS;
verdict PASS with an empty `human_signoff` the verifier is forbidden to fill), so no verify
round of a signoff-required feature could ever reach the word `clean`. E11 was run before
the report was written and again after; both runs are in run-log.jsonl.

Between rounds 2 and 3: 01ee88c amended AC-11 in the contract (approved in place by the
owner), re-pointed E11 at the new `scripts/acceptance/check-gate-residual.sh`, and moved
the post-signature `clean` to the Gate-2 checklist.

Round 3 (commit 01ee88c, enforcement strict, no bypass): all 13 evals executed. 12 passed;
E11 failed — for a NEW and satisfiable reason. The amendment is sound and its guard is
discriminating (four probes in a throwaway worktree, recorded in the E11 block), but the
amendment commit itself created a guard file outside the gate-tooling exemption list,
re-staling the nine re-pinned features plus stale-scope-by-paths. The gate is red because
the wave is uncleared again, not because a criterion is unanswerable. This is round 3 —
the last the kit allows — so the escalation goes to the human at Gate 2.

Round-1 and round-2 findings re-checked rather than inherited:
- E3's discrimination claim HOLDS, re-derived a second time from scratch.
- E7's weak baseline SURVIVES as a disclosure, not upgraded.
- E4's six-vs-five gap re-measured on the run at this commit; the Acceptance Gate job's
  cause has CHANGED since round 2 and is recorded honestly (Finding 4).
- E3's perturbation cleanup was audited again: after the run, `git status --porcelain`
  showed only the verifier's own run-log.jsonl, and a repo-wide find for
  `__civ_teeth_probe` returned nothing. No probe file survived.

No production file, guard script, contract, config.yaml, or evals.yaml was modified during
this round. Two throwaway detached worktrees were created under the session scratchpad —
one at 556c799 to probe the new guard, one at origin/main to re-derive baselines — with the
current guards copied in as untracked files; both were removed with `git worktree remove`
and `git worktree prune`, leaving HEAD at 01ee88c with only run-log.jsonl and this report
modified.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] **Decide Finding 1 — the reason for this REJECT.** Either re-pin the nine features
      (plus stale-scope-by-paths) at 01ee88c and re-run E11, or exempt
      `scripts/acceptance/**` gate tooling in `t1_skip_globs` so a new guard stops staling
      signed evidence. The second is the standing fix; the first is what unblocks today.
- [ ] Decide Finding 2: `check-gate-residual.sh` forgives `verdict=REJECT` and
      `no evidence-report.md` in addition to the pending signature, and its OK message
      calls all three "pending Gate-2 signature". Narrow the set, or widen the wording —
      but the message string is inaccurate as it stands.
- [ ] Note Finding 3: while the signature is pending, the in-flight slug's OWN staleness is
      invisible to the guard (pre-merge-check short-circuits per feature).
- [ ] Spot-check the FIRST CI run after the signature commit: confirm the Acceptance Gate
      job is green there (the AC-4 half no verify round can observe — see E4, Finding 4)
- [ ] **AC-11's other half, still manual:** after signing, run
      `bash scripts/pre-merge-check.sh . --base origin/main` and confirm it prints `clean`
- [ ] Queue item (outside this feature): "pre-merge-check clean" as a criterion, and gate
      tooling staling signed evidence, are one scoping problem — see Known limits
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
