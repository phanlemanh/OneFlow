---
schema_version: 2
feature_slug: ci-vitest-sdk-pin
verdict: REJECT
failed_evals: [E4, E11]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 67eb589a5c70f0543312ebfd13b11ca10463979b
human_signoff:
---

# Evidence Report: ci-vitest-sdk-pin

Re-verification at the current HEAD after an upstream code change invalidated the
previously signed evidence. Eleventh (last) of the re-verify wave.

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
  run_id: ci-vitest-sdk-pin-E1-20260807T014048Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.civ_job_shape
  verified_at: 2026-08-07T01:40:48Z
  output: |
    OK: one 'Unit Tests (vitest)' job runs pnpm test with the shared setup; both triggers intact

- eval: E2
  run_id: ci-vitest-sdk-pin-E2-20260807T014055Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.civ_job_no_softening
  verified_at: 2026-08-07T01:40:55Z
  output: |
    OK: no continue-on-error / || true / set +e / if: inside the unit-tests job

- eval: E3
  run_id: ci-vitest-sdk-pin-E3-20260807T014059Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.civ_job_teeth
  verified_at: 2026-08-07T01:40:59Z
  output: |
    job command under test (read from .github/workflows/ci.yml): pnpm test
    OK: 'pnpm test' (from .github/workflows/ci.yml) fails with the probe present
    and passes once removed — the job has teeth

- eval: E4
  run_id: ci-vitest-sdk-pin-E4-20260807T014112Z
  exit_code: 2
  baseline: n-a
  verifier: config:executors.script.civ_run_jobs_green
  verified_at: 2026-08-07T01:41:12Z
  output: |
    no ci.yml run found at any commit of ci-vitest-sdk-pin's pull request
    the workflow must actually have run before this eval can say anything
    (GitHub deletes runs on its retention schedule; a genuinely expired run is
    an honest exit 2, not a pass)

- eval: E5
  run_id: ci-vitest-sdk-pin-E5-20260807T014229Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.civ_pin_derived
  verified_at: 2026-08-07T01:42:29Z
  output: |
    OK: no literal pin; resolves oneflow-sdk==0.2.18 before the cd (line 22 < 32)
    and from inside a foreign git repo

- eval: E6
  run_id: ci-vitest-sdk-pin-E6-20260807T014233Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.civ_pin_teeth
  verified_at: 2026-08-07T01:42:33Z
  output: |
    OK: perturbed pyproject (9.9.9) moved the spec; real tree still resolves 0.2.18

- eval: E7
  run_id: ci-vitest-sdk-pin-E7-20260807T014241Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.civ_pin_override
  verified_at: 2026-08-07T01:42:41Z
  output: |
    OK: OVERLAY_SDK_SPEC takes precedence over the derived pin

- eval: E8
  run_id: ci-vitest-sdk-pin-E8-20260807T014245Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.civ_pin_single_impl
  verified_at: 2026-08-07T01:42:45Z
  output: |
    OK: one parsing law in scripts/lib/sdk-version.sh; both
    scripts/plugins/run-overlay-plugin-tests.sh and
    scripts/abi/check-overlay-sdk-train.sh source it

- eval: E9
  run_id: ci-vitest-sdk-pin-E9-20260807T014257Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.civ_docs_guard_synced
  verified_at: 2026-08-07T01:42:57Z
  output: |
    OK: CLAUDE.md describes scripts/plugins/check-manifest-unmoved.sh as it
    behaves — 36 plain strings + 3 origin entry

- eval: E10
  run_id: ci-vitest-sdk-pin-E10-20260807T014302Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.b1_anchored_green
  verified_at: 2026-08-07T01:43:02Z
  output: |
    no drift vs the range oneflow-plugin-prefix owns (8477f8a..dd39da8):
    config src/lib/plugins/plugins-registry-schema.ts
    src/lib/plugins/plugins-registry.server.ts src/db untouched
    manifest intact: 39 plugins, org still https://github.com/tong-io
    no T3 drift: src/lib/abi src/app/api untouched vs the range
    dependency-refresh-2026-07 owns (1e81ac2..4d89b58)
    workflow drift vs the range ci-actions-bump owns (4d89b58..8477f8a):
    16 declared pin line(s), comments, and the dry-run guard (-1 +1);
    no file added, deleted or renamed

- eval: E11
  run_id: ci-vitest-sdk-pin-E11-20260807T014310Z
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.civ_gate_residual
  verified_at: 2026-08-07T01:43:10Z
  output: |
    VIOLATION [compose-overlay]: verdict=PENDING-JUDGMENT (must be PASS to merge)
    VIOLATION [local-cpu-plugins]: verdict=REJECT (must be PASS to merge)
    VIOLATION [per-plugin-origin]: verdict=REJECT (must be PASS to merge)
    FAIL: violations outside 'ci-vitest-sdk-pin' that are not merely awaiting a
    signature (above) — the re-sign wave has not cleared

- eval: E12
  run_id: ci-vitest-sdk-pin-E12-20260807T014325Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.civ_eval_keys_intact
  verified_at: 2026-08-07T01:43:25Z
  output: |
    OK: 15 overlay_* keys and feature_loop.suite_keys byte-identical to origin/main

- eval: E13
  run_id: ci-vitest-sdk-pin-E13-20260807T014329Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.verify_plugins
  verified_at: 2026-08-07T01:43:29Z
  output: |
    $ tsx scripts/verify-plugins-scan.ts
    [verify-plugins-scan] OK

## Analyst

Baseline is `n-a` on every eval: this is a re-verification round at the current
HEAD, not an A/B against the feature's diffBase. No baseline tree was checked out
(the round is under a hard no-git-operations constraint — no checkout, no fetch,
no stash), so no eval could be run on the pre-feature tree. Discrimination for
these evals was established in the original signing round and is not re-derived
here.

**E4 (AC-4) — no CI run exists for any commit this branch owns.** `gh` is present
(v2.89.0), authenticated, and answered every query; this is not a BLOCKED
environment, it is an honest "looked and found nothing". Two facts compound:

1. `ci-vitest-sdk-pin`'s contract has **no `landed_merge` frontmatter key** — the
   string appears only in prose. So `own-range.sh` cannot anchor the slug and
   falls back to `merge-base(HEAD, origin/main)..HEAD`, which on the current
   branch `feat/local-first-adr-and-s2-plan` resolves to that branch's own ten
   commits (`67eb589` … `6a42162`), **not** the ci-vitest-sdk-pin pull request.
   This is verbatim the Known limit the contract itself records: *"Chỉ 5/15
   contract có `landed_merge` → … nếu một trong số đó về sau có guard neo, nó sẽ
   chấm diff của nhánh khác."* It is now no longer hypothetical.
2. `origin/feat/local-first-adr-and-s2-plan` sits at `efbbd691` — the merge-base
   — so the ten local commits are unpushed and no workflow has ever run on them.
   `gh run list --workflow ci.yml --commit 67eb589…` returns an empty list.

The vitest job itself is intact and demonstrably has teeth on this tree (E1, E2,
E3 all green, E3 by in-process perturbation). What E4 cannot establish at this
HEAD is the *real-runner* half of AC-4. Fixing it means either pushing this branch
so CI runs, or backfilling `landed_merge` into the contract so the eval reads the
feature's own historical run again — both are changes outside a verify round's
authority, so neither was done.

**E11 (AC-11) — the merge gate is not clear.** `check-gate-residual.sh` named
three features other than this one, and none of them falls into the three classes
the guard forgives (no report / REJECT / PASS-awaiting-signature) *for the
in-flight slug*:

| Feature named | State the guard read |
|---|---|
| `compose-overlay` | `verdict=PENDING-JUDGMENT` |
| `local-cpu-plugins` | `verdict=REJECT` |
| `per-plugin-origin` | `verdict=REJECT` |

The guard behaved exactly as designed and as the Amendment describes: it forgives
only the in-flight slug's own pending signature, and refuses when any *other*
feature carries a non-PASS verdict. Three other features are legitimately in
flight right now, so the assertion AC-11 makes — "the wave matched the Gate-1
quote; every other feature is clean" — is false at this HEAD. No guard, eval, or
contract text was modified to make it pass.

Note this is the same structural shape the Amendment already named for the
original AC-11: an eval that asks a question about a world state (a fully cleared
gate) that cannot exist while sibling features are mid-flight. The Amendment
narrowed the question once; `local-cpu-plugins` has since introduced
`lcp_resign_wave` for precisely the narrower "did the re-sign wave clear"
question. Whether `civ_gate_residual` should be re-narrowed the same way is a
contract decision for Gate 2, not a verifier decision.

Non-discriminating evals: not assessable this round — baseline is `n-a`
throughout (see above).

## Variance

none — every eval is deterministic (`runs: 1`); no eval carries `runs > 1`.

## Iterations

Round 1 (re-verification after upstream code change): E4 and E11 failed. E4 — no
GitHub Actions run exists at any commit this branch owns, because the contract
carries no `landed_merge` anchor and the branch is unpushed. E11 — the merge gate
is not clear: `compose-overlay` (PENDING-JUDGMENT), `local-cpu-plugins` (REJECT),
and `per-plugin-origin` (REJECT) are all in flight and unsigned. Verdict REJECT;
no code, guard, or contract text was altered to soften either result.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line — *(none this round: there is no
      `judgment` executor in this feature's evals.yaml; all 13 evals are
      `script`)*
- [ ] Decide E4: push this branch so CI runs at its HEAD, or backfill
      `landed_merge` into the contract so the eval re-reads the feature's own
      historical run
- [ ] Decide E11: land/sign the three named features, or re-scope AC-11 the way
      `local-cpu-plugins` re-scoped it to a "did the re-sign wave clear" question
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS — *(not applicable;
      this round is REJECT)*
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
