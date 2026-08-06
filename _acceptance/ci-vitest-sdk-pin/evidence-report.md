---
schema_version: 2
feature_slug: ci-vitest-sdk-pin
verdict: PASS
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c1da607c0432afa8ddf52c2ef56d99db9b8edc0b
human_signoff:
---

# Evidence Report: ci-vitest-sdk-pin

Round 4, authorised by the owner beyond the kit's 3-round cap after round 3 escalated.
All 13 evals executed at `c1da607`; all 13 exit 0. The one eval that failed in rounds 1-3
(E11) now passes, and this round's job was to establish that it passes for the RIGHT
reason rather than because the guard went blind. Four probes below do that.

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
| E11 | AC-11 | script | PASS |
| E12 | AC-12 | script | PASS |
| E13 | AC-12 | script | PASS |

## Evidence

- eval: E1
  run_id: ci-vitest-sdk-pin-e1-1785984448
  exit_code: 0
  baseline: red
  verifier: config:executors.script.civ_job_shape
  verified_at: 2026-08-06T02:47:28Z
  output: |
    $ bash scripts/ci/check-vitest-job.sh shape
    OK: one 'Unit Tests (vitest)' job runs pnpm test with the shared setup; both triggers intact
    -- baseline, re-derived independently this round: the CURRENT guard copied into a fresh
       detached worktree at origin/main (= 65b5529), not carried over from an earlier round --
    FAIL: expected exactly 1 step running 'pnpm test', found 0
    -> baseline refused (nonzero)
    Corroborating counts on that tree: `grep -c 'unit-tests:' .github/workflows/ci.yml` = 0,
    `grep -c 'pnpm test' .github/workflows/ci.yml` = 0.

- eval: E2
  run_id: ci-vitest-sdk-pin-e2-1785984448
  exit_code: 0
  baseline: red
  verifier: config:executors.script.civ_job_no_softening
  verified_at: 2026-08-06T02:47:28Z
  output: |
    $ bash scripts/ci/check-vitest-job.sh no-softening
    OK: no continue-on-error / || true / set +e / if: inside the unit-tests job
    -- baseline (same origin/main worktree, guard copied in, re-derived this round) --
    FAIL: no 'unit-tests:' job in .github/workflows/ci.yml
    -> baseline refused (nonzero)

- eval: E3
  run_id: ci-vitest-sdk-pin-e3-1785984475
  exit_code: 0
  baseline: red
  verifier: config:executors.script.civ_job_teeth
  verified_at: 2026-08-06T02:47:55Z
  output: |
    $ bash scripts/ci/check-vitest-job.sh teeth
    job command under test (read from .github/workflows/ci.yml): pnpm test
    OK: 'pnpm test' (from .github/workflows/ci.yml) fails with the probe present and
    passes once removed — the job has teeth
    -- post-run tree check (the perturbation must not survive) --
    $ git status --porcelain
     M _acceptance/ci-vitest-sdk-pin/run-log.jsonl
    $ find . -name '*__civ_teeth_probe*' -not -path './node_modules/*' -not -path './.git/*'
    (no matches)
    No probe file survived. The only dirty path is this round's run-log, written by the
    verifier itself.
    -- DISCRIMINATION RE-ESTABLISHED FROM SCRATCH (the round-1 finding, checked a third time) --
    The round-1 defect was that this eval ran `pnpm test` directly, so it stayed green on a
    tree with no CI job at all; a1bc936 rewired it to read the command out of ci.yml. Probed
    again this round rather than inherited: the CURRENT guard, copied into the origin/main
    worktree whose ci.yml has zero vitest jobs, refuses —
    FAIL: no 'unit-tests:' job in .github/workflows/ci.yml — nothing to prove teeth about
    -> baseline refused (nonzero)
    So the teeth mode is red on a tree with no vitest job, not merely green on this one.

- eval: E4
  run_id: ci-vitest-sdk-pin-e4-1785984486
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.civ_run_jobs_green
  verified_at: 2026-08-06T02:48:06Z
  output: |
    $ ACCEPTANCE_SLUG=ci-vitest-sdk-pin bash scripts/ci/check-run-jobs.sh ci Lint 'Type Check' Build 'SDK Tests (Python)' 'Unit Tests (vitest)'
    run https://github.com/phanlemanh/OneFlow/actions/runs/31066543171 @ c1da607c0432afa8ddf52c2ef56d99db9b8edc0b
    ok job 'Lint': success
    ok job 'Type Check': success
    ok job 'Build': success
    ok job 'SDK Tests (Python)': success
    ok job 'Unit Tests (vitest)': success
    all requested jobs succeeded at c1da607c0432afa8ddf52c2ef56d99db9b8edc0b
    The run is at THIS commit — headSha c1da607c0432afa8ddf52c2ef56d99db9b8edc0b — not an
    older one carried forward.
    baseline rationale: the guard is scoped to this slug's own pull request, which does not
    exist on origin/main, so there is no honest red/green to record on the other side.
    -- DISCLOSURE, CARRIED FORWARD AND RE-MEASURED: AC-4 is only PARTLY covered --
    AC-4's text names SIX jobs including "Acceptance Gate"; the resolved command lists FIVE,
    following the narrowing config.yaml already documents for ci-actions-bump's ci_jobs_green
    ("the gate job's colour is dominated by acceptance bookkeeping"). Independently queried
    this round for the full list:
    $ gh run view 31066543171 --json headSha,status,conclusion,jobs
    c1da607c0432afa8ddf52c2ef56d99db9b8edc0b   completed   failure
    Build                 completed   success
    Unit Tests (vitest)   completed   success
    Lint                  completed   success
    Acceptance Gate       completed   failure
    SDK Tests (Python)    completed   success
    Type Check            completed   success
    All six jobs are PRESENT; five are green; Acceptance Gate is red. Its logged cause at
    this commit was read rather than assumed:
    $ gh run view 31066543171 --log-failed | grep -E 'VIOLATION|merge blocked'
    Acceptance Gate  Pre-merge acceptance check  VIOLATION [ci-vitest-sdk-pin]: verdict=REJECT (must be PASS to merge)
    Acceptance Gate  Pre-merge acceptance check  pre-merge-check: 1 violation(s) - merge blocked
    ONE violation, and it is this feature's own report on disk still carrying round 3's
    verdict. That is the pure self-reference shape round 2 described and round 3 did NOT have
    (round 3's gate job carried eleven violations, ten of them other features' staleness).
    The wave is now clear, so the gate job's redness is exactly the branch's own pending
    signature — legitimate at this point in the gate, and the reason AC-4's sixth job still
    needs a post-signature spot-check at Gate 2.

- eval: E5
  run_id: ci-vitest-sdk-pin-e5-1785984454
  exit_code: 0
  baseline: red
  verifier: config:executors.script.civ_pin_derived
  verified_at: 2026-08-06T02:47:34Z
  output: |
    $ bash scripts/plugins/check-overlay-pin-derived.sh shape
    OK: no literal pin; resolves oneflow-sdk==0.2.18 before the cd (line 22 < 32) and
    from inside a foreign git repo
    -- baseline A, the committed pre-fix capture evidence/baseline-prefix-pin-guards.txt
       (taken on 65b5529 before any production edit), re-read this round --
    18:SDK_SPEC="${OVERLAY_SDK_SPEC:-oneflow-sdk==0.2.18}"
    FAIL: scripts/plugins/run-overlay-plugin-tests.sh still carries a hardcoded version specifier
    -> baseline refused (nonzero)
    -- baseline B, re-derived this round: the CURRENT guard copied into an origin/main
       worktree aborts before it can assert anything --
    scripts/plugins/check-overlay-pin-derived.sh: line 14: scripts/lib/sdk-version.sh: No such file or directory
    -> baseline refused (nonzero)
    Baseline A is the load-bearing one: it shows the literal pin the feature removed.

- eval: E6
  run_id: ci-vitest-sdk-pin-e6-1785984454
  exit_code: 0
  baseline: red
  verifier: config:executors.script.civ_pin_teeth
  verified_at: 2026-08-06T02:47:34Z
  output: |
    $ bash scripts/plugins/check-overlay-pin-derived.sh teeth
    OK: perturbed pyproject (9.9.9) moved the spec; real tree still resolves 0.2.18
    -- baseline, evidence/baseline-prefix-pin-guards.txt on 65b5529 --
    python -m pytest: error: unrecognized arguments: --print-spec
    -> baseline refused (nonzero)
    This is exactly the fail-open the feature exists to close: pre-fix, perturbing
    sdk/pyproject.toml did not move the spec.

- eval: E7
  run_id: ci-vitest-sdk-pin-e7-1785984454
  exit_code: 0
  baseline: red
  verifier: config:executors.script.civ_pin_override
  verified_at: 2026-08-06T02:47:34Z
  output: |
    $ bash scripts/plugins/check-overlay-pin-derived.sh override
    OK: OVERLAY_SDK_SPEC takes precedence over the derived pin
    -- baseline (current guard copied into an origin/main worktree, re-derived this round) --
    scripts/plugins/check-overlay-pin-derived.sh: line 14: scripts/lib/sdk-version.sh: No such file or directory
    -> baseline refused (nonzero)
    HONEST CAVEAT, CARRIED FORWARD FROM ROUNDS 1-3, RE-CONFIRMED, DELIBERATELY NOT UPGRADED:
    this baseline red is "the shared library does not exist yet", i.e. the guard aborts on a
    missing file — it is NOT a demonstration that origin/main lost the override. On
    origin/main the `${OVERLAY_SDK_SPEC:-...}` default already honoured the variable, so the
    A/B here proves less than a red usually does. E7 is a should-NOT-break assertion and it
    holds on the branch; that is the whole of what it establishes.

- eval: E8
  run_id: ci-vitest-sdk-pin-e8-1785984454
  exit_code: 0
  baseline: red
  verifier: config:executors.script.civ_pin_single_impl
  verified_at: 2026-08-06T02:47:34Z
  output: |
    $ bash scripts/plugins/check-overlay-pin-derived.sh single-impl
    OK: one parsing law in scripts/lib/sdk-version.sh; both
    scripts/plugins/run-overlay-plugin-tests.sh and scripts/abi/check-overlay-sdk-train.sh source it
    -- baseline (origin/main worktree, re-derived this round) --
    scripts/plugins/check-overlay-pin-derived.sh: line 14: scripts/lib/sdk-version.sh: No such file or directory
    -> baseline refused (nonzero)
    Same "file absent" shape as E7's baseline. For AC-8 that absence IS the failure mode
    under test (there was no single place, because there was no shared file), so the red
    reads straighter here than it does for E7.
    AC-8 is satisfied via the shared-script route named in contract Notes; scripts/lib/ is
    outside risk_tiers.t3_paths, so the tier stays T2 (see Boundary below).

- eval: E9
  run_id: ci-vitest-sdk-pin-e9-1785984454
  exit_code: 0
  baseline: red
  verifier: config:executors.script.civ_docs_guard_synced
  verified_at: 2026-08-06T02:47:34Z
  output: |
    $ bash scripts/plugins/check-manifest-doc-synced.sh
    OK: CLAUDE.md describes scripts/plugins/check-manifest-unmoved.sh as it behaves — 38 plain strings + 1 origin entry
    -- baseline: the committed capture on 65b5529 and a fresh origin/main worktree run this
       round agree --
    FAIL: CLAUDE.md still tells the reader to bump `expected_count`, a knob
    scripts/plugins/check-manifest-unmoved.sh no longer has
    -> baseline refused (nonzero)

- eval: E10
  run_id: ci-vitest-sdk-pin-e10-1785984461
  exit_code: 0
  baseline: green
  verifier: config:executors.script.b1_anchored_green
  verified_at: 2026-08-06T02:47:41Z
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
    The anchors hold: ci.yml gained a job on this branch and check-workflow-drift.sh still
    scores only ci-actions-bump's own range. Green on both sides is the designed shape of a
    should-NOT-fire eval — see Analyst.

- eval: E11
  run_id: ci-vitest-sdk-pin-e11-1785984495
  exit_code: 0
  baseline: green
  verifier: config:executors.script.civ_gate_residual
  verified_at: 2026-08-06T02:48:15Z
  output: |
    $ bash scripts/acceptance/check-gate-residual.sh ci-vitest-sdk-pin origin/main
    OK: every feature other than ci-vitest-sdk-pin is clean; forgave 1 own violation(s) —
    a previous round's REJECT verdict, not yet rewritten

    -- IS IT PASSING FOR THE RIGHT REASON? Read the source it reads, do not infer. --
    $ bash scripts/pre-merge-check.sh . --base origin/main | grep -E '^(OK \[|VIOLATION)'
    OK [cache-l1-fingerprint]: PASS, signed off by Manh 2026-07-30
    OK [cache-l2-store]: PASS, signed off by Manh 2026-08-04
    OK [cache-l3-tier-b]: PASS, signed off by Manh 2026-08-04
    OK [cache-l4-eviction]: PASS, signed off by Manh 2026-08-04
    OK [ci-actions-bump]: PASS, signed off by Manh 2026-07-26
    VIOLATION [ci-vitest-sdk-pin]: verdict=REJECT (must be PASS to merge)
    OK [compose-overlay]: PASS, signed off by Manh 2026-08-03
    OK [conformance-l0]: PASS, signed off by Manh 2026-08-03
    OK [dependency-refresh-2026-07]: PASS, signed off by Manh 2026-07-26
    OK [gate-scope-anchors]: PASS, signed off by Manh 2026-08-04
    OK [measure-harness]: PASS, signed off by Manh 2026-08-04
    OK [oneflow-plugin-prefix]: PASS, signed off by Manh 2026-07-29
    OK [per-plugin-origin]: PASS, signed off by Manh 2026-08-03
    OK [sdk-distribution-rename]: PASS, signed off by Manh 2026-08-04
    OK [stale-scope-by-paths]: PASS, signed off by Manh 2026-07-29
    OK [task-metering]: PASS, signed off by Manh 2026-08-04
    pre-merge-check: rules ran=3 declared-off=0 expected=3
    pre-merge-check: 1 violation(s) - merge blocked
    FIFTEEN features are OK and signed. The single violation belongs to this slug, and it is
    the class the amendment lists as forgivable ("verdict=REJECT — a previous round's verdict,
    rewritten by this one"), which is literally true: the report on disk when E11 ran was
    round 3's REJECT, and this file is the rewrite. The guard NAMED that class rather than
    calling it "pending Gate-2 signature", which is the round-3 defect 9fcfc33 fixed.
    This is what changed since round 3: the ten staleness violations are gone, because
    c38b939 / 1b37024 / c1da607 re-pinned the wave. Nothing was forgiven that shouldn't be.

    -- IS THE GUARD STILL DISCRIMINATING AFTER FOUR ROUNDS OF FIXES? Probed, not assumed. --
    All probes ran in a throwaway detached worktree at c1da607 under the session scratchpad;
    the real tree was never touched. Each restore was verified with `git status --porcelain`
    in the worktree, which returned empty (byte-identical restore).
    A. Unperturbed there: same OK line as above -> exit_code: 0.
    B. Blanked task-metering's human_signoff (line 11, `human_signoff: Manh 2026-08-04`
       -> `human_signoff:`):
       VIOLATION [task-metering]: verdict PASS but human_signoff is empty (Gate 2 pending)
       FAIL: violations outside 'ci-vitest-sdk-pin' (above) — the re-sign wave has not cleared
       -> refused, and it NAMED task-metering. Restored -> back to exit_code: 0.
    C. Repointed compose-overlay's verified_commit from c38b939 to the stale 65b5529:
       VIOLATION [compose-overlay]: evidence is stale — code changed after verify (verified_commit 65b5529); re-run verify before merge. Changed:
       FAIL: violations outside 'ci-vitest-sdk-pin' (above) — the re-sign wave has not cleared
       -> refused, and it NAMED compose-overlay. Restored -> back to exit_code: 0.
    D. Gave the IN-FLIGHT slug a violation OUTSIDE the forgiven set (own report set to
       verdict PASS with a signature string no human ever committed):
       VIOLATION [ci-vitest-sdk-pin]: human_signoff present but not found in any commit of
       _acceptance/ci-vitest-sdk-pin//evidence-report.md — the reviewer must COMMIT the
       signoff themselves (signoff.require_human_commit)
       FAIL: 'ci-vitest-sdk-pin' violation is not an unfinished-Gate-2 class (above)
       -> refused. The own half does not blanket-forgive by slug name.
    E. Re-confirmed the KNOWN BLIND SPOT rather than taking round 3's word: own report set to
       verdict PASS + empty human_signoff + a deliberately stale verified_commit (65b5529).
       pre-merge-check emitted ONLY the empty-signoff violation, so the guard printed
       "forgave 1 own violation(s) — PASS awaiting the human's Gate-2 signature" -> exit_code: 0.
       The in-flight feature's own staleness is invisible to E11 while the signature is
       pending. Recorded in Known limits; not a hole this guard opened.
    Conclusion: the foreign half refuses and names the feature in both perturbation shapes and
    recovers exactly on restore; the own half refuses on a non-forgiven class. The guard has
    teeth, and probe E marks precisely where it does not.

    -- baseline (current guard copied into an origin/main worktree, re-derived this round) --
    OK: gate clean — no violation at all, including ci-vitest-sdk-pin
    -> baseline exit_code: 0
    Green on BOTH sides this round, unlike round 3. The baseline green is uninformative
    (origin/main carries no in-flight feature and no unpinned wave), so it is the probe suite
    above — not the A/B — that establishes discrimination. E11 is therefore also listed in
    Analyst, per this round's rule about evals green on both sides.

- eval: E11
  run_id: ci-vitest-sdk-pin-e11-1785984851
  exit_code: 0
  baseline: green
  verifier: config:executors.script.civ_gate_residual
  verified_at: 2026-08-06T02:54:11Z
  output: |
    $ bash scripts/acceptance/check-gate-residual.sh ci-vitest-sdk-pin origin/main
    OK: every feature other than ci-vitest-sdk-pin is clean; forgave 1 own violation(s) —
    PASS awaiting the human's Gate-2 signature
    SECOND RUN OF E11, DELIBERATELY AFTER THIS REPORT WAS WRITTEN. The guard reads every
    evidence-report.md including this one, so the first run saw round 3's REJECT on disk and
    this file changes what it sees. Same verdict either way, and the forgiven class correctly
    moves from "a previous round's REJECT verdict" to "PASS awaiting the human's Gate-2
    signature" — the guard tracks the real state of the report rather than a fixed string.
    Both runs are separate lines in run-log.jsonl with their real exit codes.

- eval: E12
  run_id: ci-vitest-sdk-pin-e12-1785984461
  exit_code: 0
  baseline: green
  verifier: config:executors.script.civ_eval_keys_intact
  verified_at: 2026-08-06T02:47:41Z
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
  run_id: ci-vitest-sdk-pin-e13-1785984467
  exit_code: 0
  baseline: green
  verifier: config:executors.script.verify_plugins
  verified_at: 2026-08-06T02:47:47Z
  output: |
    $ pnpm verify:plugins
    > oneflow@0.2.1 verify:plugins /Users/manhphan/dev/oneflow
    > tsx scripts/verify-plugins-scan.ts
    [verify-plugins-scan] OK
    -- baseline note --
    The scanner does not read _acceptance/config.yaml; green on origin/main as well.

## Findings

1. **E11 passes, and it passes for the reason the amendment intended.** Fifteen features are
   PASS-and-signed under `pre-merge-check`; the single remaining violation is this slug's own
   `verdict=REJECT` (round 3's report, rewritten by this file). The ten staleness violations
   that caused the round-3 REJECT are gone — the wave was re-pinned at `c38b939` / `1b37024`
   and re-verified at `c1da607`. The guard also names the forgiven class correctly now,
   which is the round-3 message defect closed.
2. **The guard is still discriminating after four rounds of edits.** Probes B and C made two
   different foreign features violate in two different ways (blank signature; stale
   `verified_commit`); the guard refused each time and printed the offending feature's name.
   Probe D shows the in-flight slug gets no blanket pardon. Probe E shows exactly where the
   teeth stop. All perturbations were done in a throwaway worktree and restored byte-identical.
3. **AC-4 remains half-covered, and the shape of the gap has improved.** Six jobs exist on run
   31066543171 at this exact commit; five are checked by the resolved command and all five are
   green. Acceptance Gate is red for ONE logged violation — this feature's own pending verdict.
   In round 3 the same job was red for eleven violations, ten of them other features. The
   remaining redness is the self-reference the amendment predicted, so the sixth job stays a
   post-signature spot-check rather than an unresolved defect.
4. **E7's baseline red is still weak, and is not upgraded here.** It is "the shared library
   does not exist on origin/main", not "origin/main lost the override". Disclosed in rounds
   1-3 and re-confirmed this round; the eval establishes only that the override path holds on
   the branch.
5. **E11's baseline is now green on both sides.** In round 3 the branch-vs-baseline A/B was
   informative because the branch was red. It no longer is, so the probe suite is what carries
   the discrimination claim, and E11 is listed in Analyst as an eval whose A/B proves nothing
   by itself. Stating this rather than letting the green A/B read as evidence.

## Analyst

E10, E11, E12, E13 are green on BOTH the branch and the origin/main baseline — their A/B
proves the harness, not the feature.

- E10 (anchored guards): a should-NOT-fire eval; green on both is its intended shape. It
  carries no positive evidence about this feature — only the absence of collateral damage to
  gate-scope-anchors' anchoring.
- E11 (gate residual): the baseline green is uninformative — origin/main has no in-flight
  feature and no unpinned wave, so the guard trivially finds nothing to forgive. The five
  probes in the E11 block, not this A/B, are the evidence that the guard would refuse.
- E12 (eval keys intact): compares config.yaml against origin/main; on the baseline that is a
  self-comparison and passes vacuously. Re-derived this round rather than assumed.
- E13 (verify:plugins): the plugin scanner does not read `_acceptance/config.yaml`, so no
  change in this feature could have moved it either way.
- E1, E2, E3, E5, E6, E8, E9 stay OUT of this section: each was re-derived from scratch this
  round against origin/main and went red there. E3 in particular — the round-1
  non-discrimination finding — was re-probed a third time and still refuses on a tree with no
  vitest job. E7 is out of this section too, but see Finding 4 for how little its red means.

Boundary check performed independently of the evals, and re-measured at this commit rather
than copied from round 3. `git diff --name-only origin/main...HEAD` outside `_acceptance/`
returns TWELVE paths:
.github/workflows/ci.yml, CLAUDE.md, scripts/abi/check-overlay-sdk-train.sh,
scripts/acceptance/check-gate-residual.sh, scripts/acceptance/check-stale-golden.sh,
scripts/ci/check-action-pins.sh, scripts/ci/check-eval-keys-intact.sh,
scripts/ci/check-vitest-job.sh, scripts/lib/sdk-version.sh,
scripts/plugins/check-manifest-doc-synced.sh, scripts/plugins/check-overlay-pin-derived.sh,
scripts/plugins/run-overlay-plugin-tests.sh.
None is under `risk_tiers.t3_paths` — in particular the AC-8 shared rule landed in
`scripts/lib/`, not `sdk/` — so the T2 tier declared in the contract still holds and no
escalation is required.

**The count has moved again, in both directions.** The contract Amendment's correction says
13 paths at `01ee88c`; at `c1da607` the real answer is 12. Two of the Amendment's named files
(`STATUS.md`, `docs/roadmap.md`) no longer appear in the range at all, and one file the
Amendment does not name (`scripts/acceptance/check-stale-golden.sh`, touched by the `c38b939`
fix) does. This is the third different number for the same question across four rounds — the
Amendment already flags "correcting a wrong number with another wrong number" as the thing
worth writing down, and it has happened once more. It changes no conclusion: nothing here is
a `t3_paths` file, so **T2 still holds**. Disclosure, not escalation.

## Known limits

Recorded for Gate 2, NOT fixed in this round.

- **`sdk-version.sh` anchors its default root with `BASH_SOURCE`.** It is only correct when
  sourced from bash; under zsh it resolves the root to `/` and reports
  `sdk-version: no such file: //sdk/pyproject.toml`. It fails **closed** and loudly, never
  silently to a wrong version. Every consumer in the repo is a `#!/usr/bin/env bash` script,
  so this is not a defect today — it is a trap for the first consumer written for another shell.
- **Blind spot inherited from `pre-merge-check`'s per-feature short-circuit.** When the
  in-flight slug's report is PASS with an empty signature, `pre-merge-check` reports only that,
  even if the same report's `verified_commit` is stale. During a verify round this feature's own
  staleness is therefore invisible to E11. Re-demonstrated this round as probe E, not inherited
  as an assertion. It becomes visible the moment the human signs.
- **The guard forgives three violation classes, not one.** `check-gate-residual.sh` tolerates
  `no evidence-report.md`, `verdict=REJECT`, and `human_signoff is empty` for the in-flight
  slug. All three are needed because E11 runs BEFORE the round's report is written, so the
  report on disk is the previous round's. The consequence is that E11 is structurally incapable
  of going red on account of this feature's own verdict — acceptable only because
  `pre-merge-check` reads that verdict directly, not through E11, so nothing false-greens the
  merge gate. Since 9fcfc33 the success message names which class it actually forgave, which is
  what makes this readable rather than misleading.
- **AC-4 covers 5 of the 6 jobs it names.** The criterion lists six including Acceptance Gate;
  the resolved command lists five. The gate job's colour is dominated by acceptance
  bookkeeping (config.yaml documents the same narrowing for ci-actions-bump), so the
  "Acceptance Gate green on a real runner" half needs a post-signature spot-check.
- **The `t1_skip_globs` treadmill.** `t1_skip_globs` exempts four gate-tooling paths BY EXACT
  NAME, so every acceptance feature that lands a fifth guard under `scripts/` re-stales every
  previously pinned feature. This feature proved it twice: `01ee88c` added
  `check-gate-residual.sh` and staled ten features (the round-3 REJECT), and the re-pin waves
  since then have each had to be re-run after each fix commit. It belongs to the queue as one
  scoping item alongside "pre-merge-check clean as a criterion", not as a per-feature patch.
- The wave-ownership rule ("owned file set = the merge commit's diff") still cannot separate
  `compose-overlay` from `gate-scope-anchors`, which share `landed_merge` 7976bd8. Disclosed in
  contract.md Context; unchanged by this round.
- Only 5 of 15 contracts carry `landed_merge`, so for the other ten the owned file set cannot
  be computed and the wave must treat them conservatively as re-verify.

## Variance

none — no eval declares runs > 1

## Iterations

**Round 1 (commit b2462f4)** — REJECT on [E4, E11].
- E4: no CI run existed for the branch, which was unpushed. `gh` was installed and
  authenticated, so the executor ran and returned a real answer — a genuine failure, not BLOCKED.
- E11: 10 violations. Nine were staleness across a re-sign wave that had not been run yet; the
  tenth was this feature's own missing evidence report.
- Round 1 also filed E3 as **non-discriminating** — it ran `pnpm test` directly, so it stayed
  green on a tree with no CI job at all — and disclosed that E7's baseline red is weak.
- Cause: work genuinely unfinished (branch unpushed, wave not run) plus one eval written to
  measure the wrong thing.

**Between rounds 1 and 2** (not this verifier's work, recorded from the log): `a1bc936` rewired
E3's teeth mode to read the job command out of `ci.yml`; the branch was pushed and CI ran; a
separate re-verification wave found two REAL defects — `sdk_version()` resolved its repo root at
call time, so the overlay runner died after cd-ing into the plugin clone and all 13
compose-overlay render evals were dead while this feature's own guards stayed green; and
`check-action-pins.sh` needed its checkout-site snapshot re-numbered 7 -> 8 because the new
vitest job adds a site. Both fixed in `28c1a7d`; `556c799` re-pinned nine features at `28c1a7d`.

**Round 2 (commit 556c799)** — REJECT on [E11] alone; 12 of 13 passed.
- Cause: AC-11 as written was **unsatisfiable**, not merely unsatisfied. `pre-merge-check.sh`
  violates on the in-flight feature in all three states it can occupy during S4 (no report;
  verdict not PASS; verdict PASS with an empty `human_signoff` the verifier is forbidden to
  fill), so no verify round of a signoff-required feature could ever reach the word `clean`.
- Between rounds 2 and 3: `01ee88c` amended AC-11 in the contract (approved in place by the
  owner), pointed E11 at the new `scripts/acceptance/check-gate-residual.sh`, and moved the
  post-signature `clean` to the Gate-2 checklist.

**Round 3 (commit 01ee88c)** — REJECT on [E11] again; 12 of 13 passed.
- Cause: the amendment commit itself added a guard under `scripts/acceptance/`, a path outside
  `_acceptance/` and outside the four exact gate-tooling names in `t1_skip_globs`. That single
  file re-staled the nine re-pinned features plus `stale-scope-by-paths`. The guard written to
  assert "every other feature is clean" was the file that made them unclean.
- Round 3 also found that the new guard's success message misdescribed which violation class it
  forgave (it said "pending Gate-2 signature" in all three cases). Fixed in `9fcfc33`.

**Between rounds 3 and 4:** a wave at `9fcfc33` came back 139/140, with `stale-scope-by-paths`
E3 red because its golden had frozen a pin-dependent verdict; `c38b939` narrowed that golden's
comparison; the wave at `c38b939` still left that E3 red for a deeper reason and the owner
descoped it (`1b37024`); `c1da607` re-verified that feature at 15/15 and corrected an
overstatement in its amendment. No further code changes are planned.

**Round 4 (commit c1da607, enforcement strict, no bypass)** — PASS. All 13 evals executed; all
13 exit 0. This round's specific job was not to re-run the greens but to test whether E11's new
green is real: five probes (E11 block) establish that the guard refuses and names the feature
when a foreign feature is made to violate in two different ways, refuses on a non-forgiven
in-flight class, and stops exactly at the documented blind spot. Round 1's E3 finding was
re-derived from scratch a third time and stays closed. Round 2's E7 disclosure is carried
forward verbatim and deliberately NOT upgraded. AC-4's six-vs-five gap is re-measured, with the
gate job's cause now reduced to this branch's own pending signature.

No production file, guard script, contract, `config.yaml`, or `evals.yaml` was modified during
this round. Two throwaway detached worktrees were created under the session scratchpad — one at
`c1da607` to probe the guard, one at `origin/main` (65b5529) to re-derive baselines, with the
current guards copied in as untracked files. Both were removed with `git worktree remove` and
`git worktree prune`. HEAD remains `c1da607` with only `run-log.jsonl` and this report modified.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Read the E11 probe suite (probes B and C are the ones that show the guard has teeth;
      probe E is the one that shows where it does not)
- [ ] Note Known limit: while the signature is pending, the in-flight slug's OWN staleness is
      invisible to E11 (`pre-merge-check` short-circuits per feature)
- [ ] Note Known limit: `check-gate-residual.sh` forgives three classes, not one, and this is
      load-bearing because E11 runs before the round's report is written
- [ ] Spot-check the FIRST CI run after the signature commit: confirm the Acceptance Gate job is
      green there (the AC-4 half no verify round can observe — see E4, Finding 3)
- [ ] **AC-11's other half, still manual:** after signing, run
      `bash scripts/pre-merge-check.sh . --base origin/main` and confirm it prints `clean`
- [ ] Queue item (outside this feature): "pre-merge-check clean" as a criterion, and gate tooling
      under `scripts/` staling signed evidence, are one `t1_skip_globs` scoping problem
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
