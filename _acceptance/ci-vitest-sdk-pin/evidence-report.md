---
schema_version: 2
feature_slug: ci-vitest-sdk-pin
verdict: REJECT
failed_evals: [E4, E11]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b2462f4c256140d4ad5939b03d34a659372bd481
human_signoff:
---

# Evidence Report: ci-vitest-sdk-pin

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | FAIL |
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
  run_id: ci-vitest-sdk-pin-e1-1785920766
  exit_code: 0
  baseline: red
  verifier: config:executors.script.civ_job_shape
  verified_at: 2026-08-05T09:06:06Z
  output: |
    $ bash scripts/ci/check-vitest-job.sh shape
    OK: one 'Unit Tests (vitest)' job runs pnpm test with the shared setup; both triggers intact
    -- baseline (same guard copied into a detached worktree at origin/main) --
    FAIL: expected exactly 1 step running 'pnpm test', found 0
    -> baseline exit_code: 1

- eval: E2
  run_id: ci-vitest-sdk-pin-e2-1785920766
  exit_code: 0
  baseline: red
  verifier: config:executors.script.civ_job_no_softening
  verified_at: 2026-08-05T09:06:06Z
  output: |
    $ bash scripts/ci/check-vitest-job.sh no-softening
    OK: no continue-on-error / || true / set +e / if: inside the unit-tests job
    -- baseline (origin/main worktree) --
    FAIL: no 'unit-tests:' job in .github/workflows/ci.yml
    -> baseline exit_code: 1

- eval: E3
  run_id: ci-vitest-sdk-pin-e3-1785920793
  exit_code: 0
  baseline: green
  verifier: config:executors.script.civ_job_teeth
  verified_at: 2026-08-05T09:06:33Z
  output: |
    $ bash scripts/ci/check-vitest-job.sh teeth
    OK: pnpm test fails with the probe present and passes once removed — the job has teeth
    -- post-run tree check (probe must not survive) --
    $ git status --porcelain
    ?? _acceptance/ci-vitest-sdk-pin/run-log.jsonl
    $ find src -name '*__civ_teeth*'   # (no matches)
    Tree is clean of src/__civ_teeth_probe.test.ts; the only untracked path is this
    round's run-log, written by the verifier itself.
    -- baseline note --
    teeth mode never reads .github/workflows/ci.yml; it only exercises `pnpm test`,
    which is byte-identical on origin/main. Green on both branches by construction.

- eval: E4
  run_id: ci-vitest-sdk-pin-e4-1785920809
  exit_code: 2
  baseline: n-a
  verifier: config:executors.script.civ_run_jobs_green
  verified_at: 2026-08-05T09:06:49Z
  output: |
    $ ACCEPTANCE_SLUG=ci-vitest-sdk-pin bash scripts/ci/check-run-jobs.sh ci Lint 'Type Check' Build 'SDK Tests (Python)' 'Unit Tests (vitest)'
    no ci.yml run found at any commit of ci-vitest-sdk-pin's pull request
    the workflow must actually have run before this eval can say anything
    (GitHub deletes runs on its retention schedule; a genuinely expired run is an honest exit 2, not a pass)
    -> exit_code: 2
    FAIL. The executor itself ran fine — `gh` is on PATH (/opt/homebrew/bin/gh) and
    authenticated as phanlemanh — so this is not a cannotRun/BLOCKED. The branch
    feat/ci-vitest-sdk-pin has not been pushed and has no pull request, so no real CI
    run exists. AC-4 ("dây thật, không phải dây trên giấy") is therefore unproven:
    the six-job green wall has never been observed on a runner. A missing run is not
    a pass.
    baseline rationale: the guard is scoped to this slug's own PR, which does not
    exist on either side of the A/B, so there is no honest red/green to record.

- eval: E5
  run_id: ci-vitest-sdk-pin-e5-1785920832
  exit_code: 0
  baseline: red
  verifier: config:executors.script.civ_pin_derived
  verified_at: 2026-08-05T09:07:12Z
  output: |
    $ bash scripts/plugins/check-overlay-pin-derived.sh shape
    OK: no literal pin; runner resolves oneflow-sdk==0.2.18 from sdk/pyproject.toml
    -- baseline, evidence/baseline-prefix-pin-guards.txt captured on 65b5529 --
    18:SDK_SPEC="${OVERLAY_SDK_SPEC:-oneflow-sdk==0.2.18}"
    FAIL: scripts/plugins/run-overlay-plugin-tests.sh still carries a hardcoded version specifier
    -> baseline exit_code: 1

- eval: E6
  run_id: ci-vitest-sdk-pin-e6-1785920832
  exit_code: 0
  baseline: red
  verifier: config:executors.script.civ_pin_teeth
  verified_at: 2026-08-05T09:07:12Z
  output: |
    $ bash scripts/plugins/check-overlay-pin-derived.sh teeth
    OK: perturbed pyproject (9.9.9) moved the spec; real tree still resolves 0.2.18
    -- baseline, evidence/baseline-prefix-pin-guards.txt on 65b5529 --
    python -m pytest: error: unrecognized arguments: --print-spec
    -> baseline exit_code: 4
    This is exactly the fail-open the feature exists to close: pre-fix, perturbing
    sdk/pyproject.toml did not move the spec.

- eval: E7
  run_id: ci-vitest-sdk-pin-e7-1785920832
  exit_code: 0
  baseline: red
  verifier: config:executors.script.civ_pin_override
  verified_at: 2026-08-05T09:07:12Z
  output: |
    $ bash scripts/plugins/check-overlay-pin-derived.sh override
    OK: OVERLAY_SDK_SPEC takes precedence over the derived pin
    -- baseline (same guard copied into an origin/main worktree) --
    scripts/plugins/check-overlay-pin-derived.sh: line 14: scripts/lib/sdk-version.sh: No such file or directory
    -> baseline exit_code: 1
    Honest caveat: the baseline red here is "shared lib absent", not a demonstrated
    loss of the override path — origin/main's `${OVERLAY_SDK_SPEC:-...}` default
    already honoured the variable. This eval is a should-NOT-break assertion, and it
    holds on the branch.

- eval: E8
  run_id: ci-vitest-sdk-pin-e8-1785920832
  exit_code: 0
  baseline: red
  verifier: config:executors.script.civ_pin_single_impl
  verified_at: 2026-08-05T09:07:12Z
  output: |
    $ bash scripts/plugins/check-overlay-pin-derived.sh single-impl
    OK: one parsing law in scripts/lib/sdk-version.sh; both
    scripts/plugins/run-overlay-plugin-tests.sh and scripts/abi/check-overlay-sdk-train.sh source it
    -- baseline (origin/main worktree) --
    scripts/plugins/check-overlay-pin-derived.sh: line 14: scripts/lib/sdk-version.sh: No such file or directory
    -> baseline exit_code: 1
    AC-8 satisfied via the shared-script route named in contract Notes; scripts/lib/
    is outside risk_tiers.t3_paths, so the tier stays T2 (see Boundary below).

- eval: E9
  run_id: ci-vitest-sdk-pin-e9-1785920857
  exit_code: 0
  baseline: red
  verifier: config:executors.script.civ_docs_guard_synced
  verified_at: 2026-08-05T09:07:37Z
  output: |
    $ bash scripts/plugins/check-manifest-doc-synced.sh
    OK: CLAUDE.md describes scripts/plugins/check-manifest-unmoved.sh as it behaves — 38 plain strings + 1 origin entry
    -- spot-check of the doc text itself (CLAUDE.md:64) --
    "asserts the manifest holds exactly 38 plain string entries under the upstream org
    plus exactly one origin entry — oneflow-modal-compose-overlay under phanlemanh ...
    (there is no expected_count variable any more)"
    -- baseline, evidence/baseline-prefix-pin-guards.txt on 65b5529 --
    FAIL: CLAUDE.md still tells the reader to bump `expected_count`, a knob
    scripts/plugins/check-manifest-unmoved.sh no longer has
    -> baseline exit_code: 1

- eval: E10
  run_id: ci-vitest-sdk-pin-e10-1785920857
  exit_code: 0
  baseline: green
  verifier: config:executors.script.b1_anchored_green
  verified_at: 2026-08-05T09:07:37Z
  output: |
    $ ACCEPTANCE_SLUG=oneflow-plugin-prefix bash scripts/plugins/check-no-config-drift.sh \
      && ACCEPTANCE_SLUG=dependency-refresh-2026-07 bash scripts/deps/check-no-t3-drift.sh \
      && ACCEPTANCE_SLUG=ci-actions-bump bash scripts/ci/check-workflow-drift.sh
    no drift vs the range oneflow-plugin-prefix owns (8477f8a..dd39da8): config
      src/lib/plugins/plugins-registry-schema.ts src/lib/plugins/plugins-registry.server.ts src/db untouched
    manifest intact: 39 plugins, org still https://github.com/tong-io
    no T3 drift: src/lib/abi src/app/api untouched vs the range dependency-refresh-2026-07 owns (1e81ac2..4d89b58)
    -- baseline (origin/main worktree) --
    -> baseline exit_code: 0
    The anchors hold: ci.yml gained a job on this branch and check-workflow-drift.sh
    still scores only ci-actions-bump's own range. Green on both sides is the designed
    shape of a should-NOT-fire eval — see Analyst.

- eval: E11
  run_id: ci-vitest-sdk-pin-e11-1785920882
  exit_code: 1
  baseline: green
  verifier: config:executors.script.civ_gate_clean
  verified_at: 2026-08-05T09:08:02Z
  output: |
    $ bash scripts/pre-merge-check.sh . --base origin/main
    VIOLATION [ci-actions-bump]: evidence is stale — code changed after verify ... re-run verify before merge
    VIOLATION [compose-overlay]: evidence is stale — code changed after verify ... re-run verify before merge
    VIOLATION [conformance-l0]: evidence is stale — code changed after verify
    VIOLATION [dependency-refresh-2026-07]: evidence is stale — code changed after verify
    VIOLATION [measure-harness]: evidence is stale — code changed after verify
    VIOLATION [oneflow-plugin-prefix]: evidence is stale — code changed after verify
    VIOLATION [per-plugin-origin]: evidence is stale — code changed after verify
    VIOLATION [sdk-distribution-rename]: evidence is stale — code changed after verify
    VIOLATION [task-metering]: evidence is stale — code changed after verify
    VIOLATION [ci-vitest-sdk-pin]: status=implemented but no evidence-report.md
    NOTE [ci-vitest-sdk-pin]: chưa qua phản biện context sạch (gap-probe) — advisory, không chặn merge
    OK [cache-l1-fingerprint] / OK [cache-l2-store] / OK [cache-l3-tier-b] /
    OK [cache-l4-eviction] / OK [gate-scope-anchors] / OK [stale-scope-by-paths]
    pre-merge-check: rules ran=3 declared-off=0 expected=3
    pre-merge-check: 10 violation(s) — merge blocked
    -> exit_code: 1
    -- baseline (origin/main worktree) --
    pre-merge-check: clean
    -> baseline exit_code: 0

    JUDGMENT — AC-11 is HALF met, and half is not met.
    * MET (composition): the wave matches the Gate-1 quote exactly, feature for
      feature. 2 re-verify + re-sign = ci-actions-bump, compose-overlay (they own
      .github/workflows/ci.yml and scripts/plugins/run-overlay-plugin-tests.sh, so
      carry-forward is refused). 7 carry-forward re-pin = conformance-l0,
      dependency-refresh-2026-07, measure-harness, oneflow-plugin-prefix,
      per-plugin-origin, sdk-distribution-rename, task-metering. 6 untouched and
      still OK = cache-l1-fingerprint, cache-l2-store, cache-l3-tier-b,
      cache-l4-eviction, gate-scope-anchors, stale-scope-by-paths. No scope was
      silently widened; no feature outside the quote went red.
    * NOT MET (state): AC-11 conjoins the composition with the word `clean`. The
      guard printed "10 violation(s) — merge blocked". The branch is not in the
      state AC-11 describes, so the criterion is not satisfied at this commit.
    Because AC-11 is a conjunction and one conjunct is false, this eval is FAIL, and
    the verdict is REJECT. The re-verify/re-pin wave being scheduled after this round
    explains the failure; it does not convert it into a pass.

    DEVIATION the contract did not anticipate: the count is 10, not the 9 quoted at
    Gate 1. The extra one is ci-vitest-sdk-pin's own "status=implemented but no
    evidence-report.md" — the gate's bookkeeping about THIS feature, which clears the
    moment this report lands. It is not an eleventh affected feature and not a scope
    expansion, but the quoted number in the contract is off by one against what the
    guard actually prints in this window.

- eval: E12
  run_id: ci-vitest-sdk-pin-e12-1785920927
  exit_code: 0
  baseline: green
  verifier: config:executors.script.civ_eval_keys_intact
  verified_at: 2026-08-05T09:08:47Z
  output: |
    $ bash scripts/ci/check-eval-keys-intact.sh origin/main
    OK: 15 overlay_* keys and feature_loop.suite_keys byte-identical to origin/main
    -- baseline note --
    Run against origin/main the comparison is main-vs-main and passes trivially, so
    this eval is green on both sides. See Analyst.

- eval: E13
  run_id: ci-vitest-sdk-pin-e13-1785920927
  exit_code: 0
  baseline: green
  verifier: config:executors.script.verify_plugins
  verified_at: 2026-08-05T09:08:47Z
  output: |
    $ pnpm verify:plugins
    > oneflow@0.2.1 verify:plugins /Users/manhphan/dev/oneflow
    > tsx scripts/verify-plugins-scan.ts
    [verify-plugins-scan] OK
    -- baseline note --
    The scanner does not read _acceptance/config.yaml; green on origin/main as well.

## Analyst

E3, E10, E12, E13 are green on BOTH the branch and the origin/main baseline — they
prove the harness, not the feature.

- E3 (teeth): the guard's teeth mode never opens .github/workflows/ci.yml. It writes
  a failing spec and runs `pnpm test`, a command unchanged from origin/main, so it
  passes on a tree that has no CI job at all. It proves `pnpm test` discriminates;
  it does not prove CI runs it. That second half rests entirely on E1 (config shape,
  red on baseline) and E4 (real runner — currently FAILING). With E4 unproven, AC-3's
  "dây" claim has no observed runner behind it.
- E10 (anchored guards): a should-NOT-fire eval; green on both is its intended shape.
  It carries no positive evidence about this feature — only the absence of collateral
  damage to gate-scope-anchors' anchoring.
- E12 (eval keys intact): compares config.yaml against origin/main; on the baseline
  that is a self-comparison and passes vacuously.
- E13 (verify:plugins): the plugin scanner does not read _acceptance/config.yaml, so
  no change in this feature could have moved it either way.

Boundary check performed independently of the evals: `git diff --name-only origin/main`
touches .github/workflows/ci.yml, scripts/abi/check-overlay-sdk-train.sh,
scripts/ci/check-eval-keys-intact.sh, scripts/ci/check-vitest-job.sh,
scripts/lib/sdk-version.sh, scripts/plugins/check-manifest-doc-synced.sh,
scripts/plugins/check-overlay-pin-derived.sh,
scripts/plugins/run-overlay-plugin-tests.sh (per the stale lists E11 printed) plus
CLAUDE.md, _acceptance/config.yaml and this feature's own _acceptance/ files — the
last group being t1_skip_globs-exempt gate bookkeeping, not product code. None of
these paths is under risk_tiers.t3_paths — in particular the AC-8 shared
rule landed in scripts/lib/, not sdk/ — so the T2 tier declared in the contract still
holds and no escalation is required.

## Variance

none — no eval declares runs > 1

## Iterations

Round 1: All 13 evals executed at commit b2462f4 on branch feat/ci-vitest-sdk-pin,
enforcement strict, no bypass. 11 passed, 2 failed.

E4 failed with exit 2: no CI run exists for this branch. `gh` was present and
authenticated, so the executor ran and returned a real verdict — this is a FAIL, not
a BLOCKED/cannotRun. AC-4 is the only criterion asserting the job is green on a real
runner, and it is unproven. It becomes provable only after the branch is pushed and a
ci.yml run completes.

E3's perturbation cleanup was audited as instructed: after the run, `git status
--porcelain` showed only the verifier's own run-log.jsonl, and a `find src` for the
probe name returned nothing. No probe file survived.

E11 failed with exit 1: 10 violations. The wave's composition matches the Gate-1
quote exactly (2 + 7 + 6, feature for feature), but AC-11 also requires the word
`clean`, and the tree is not clean at this commit. Judged as not met — see the E11
evidence block for the full reasoning and for the off-by-one against the quoted count
(the 10th violation is this feature's own missing evidence-report, self-clearing).

No production file, guard script, contract, or evals.yaml was modified during this
round. Two throwaway detached worktrees at origin/main were created to obtain real
baseline exit codes for E1, E2, E7, E8, E10, E11; both were removed and
`git worktree prune` run, leaving HEAD at b2462f4 with a clean tree.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
