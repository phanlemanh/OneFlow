---
schema_version: 2
feature_slug: ci-vitest-sdk-pin
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 96ee9b89c428b5ce0d64c8f49ba29eb7bd65727e
human_signoff: Manh 2026-08-07
---

# Evidence Report: ci-vitest-sdk-pin

Verify round 2. Round 1 returned REJECT on E4 and E11; both causes changed
outside this report's control — the branch was pushed (PR #51) so CI has now
executed on these commits, and AC-11 was amended by the human (Amendment 2,
2026-08-07) to bind `check-resign-wave.sh`. Judged against the contract text as
it stands on disk at the pinned commit. All 13 evals are `script`; there is no
`judgment` executor in `evals.yaml`, so nothing is left UNSCORED.

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
  run_id: ci-vitest-sdk-pin-E1-20260807T021600Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.civ_job_shape
  verified_at: 2026-08-07T02:16:00Z
  output: |
    OK: one 'Unit Tests (vitest)' job runs pnpm test with the shared setup; both triggers intact

- eval: E2
  run_id: ci-vitest-sdk-pin-E2-20260807T021600Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.civ_job_no_softening
  verified_at: 2026-08-07T02:16:00Z
  output: |
    OK: no continue-on-error / || true / set +e / if: inside the unit-tests job

- eval: E3
  run_id: ci-vitest-sdk-pin-E3-20260807T021600Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.civ_job_teeth
  verified_at: 2026-08-07T02:16:00Z
  output: |
    job command under test (read from .github/workflows/ci.yml): pnpm test
    OK: 'pnpm test' (from .github/workflows/ci.yml) is red with the probe present
    and green once it is removed — the job has teeth
    (verbatim wording sanitized per template: the runner prints the red/green
    pair as a single OK line)

- eval: E4
  run_id: ci-vitest-sdk-pin-E4-20260807T021604Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.civ_run_jobs_green
  verified_at: 2026-08-07T02:16:04Z
  output: |
    run https://github.com/phanlemanh/OneFlow/actions/runs/31140315224 @ 91da1a4e32ce3da92f5ab52d3a43d8b2aeb1a507
    ok job 'Lint': success
    ok job 'Type Check': success
    ok job 'Build': success
    ok job 'SDK Tests (Python)': success
    ok job 'Unit Tests (vitest)': success
    all requested jobs succeeded at 91da1a4e32ce3da92f5ab52d3a43d8b2aeb1a507

- eval: E5
  run_id: ci-vitest-sdk-pin-E5-20260807T021607Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.civ_pin_derived
  verified_at: 2026-08-07T02:16:07Z
  output: |
    OK: no literal pin; resolves oneflow-sdk==0.2.18 before the cd (line 22 < 32)
    and from inside a foreign git repo

- eval: E6
  run_id: ci-vitest-sdk-pin-E6-20260807T021607Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.civ_pin_teeth
  verified_at: 2026-08-07T02:16:07Z
  output: |
    OK: perturbed pyproject (9.9.9) moved the spec; real tree still resolves 0.2.18

- eval: E7
  run_id: ci-vitest-sdk-pin-E7-20260807T021607Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.civ_pin_override
  verified_at: 2026-08-07T02:16:07Z
  output: |
    OK: OVERLAY_SDK_SPEC takes precedence over the derived pin

- eval: E8
  run_id: ci-vitest-sdk-pin-E8-20260807T021607Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.civ_pin_single_impl
  verified_at: 2026-08-07T02:16:07Z
  output: |
    OK: one parsing law in scripts/lib/sdk-version.sh; both
    scripts/plugins/run-overlay-plugin-tests.sh and
    scripts/abi/check-overlay-sdk-train.sh source it

- eval: E9
  run_id: ci-vitest-sdk-pin-E9-20260807T021607Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.civ_docs_guard_synced
  verified_at: 2026-08-07T02:16:07Z
  output: |
    OK: CLAUDE.md describes scripts/plugins/check-manifest-unmoved.sh as it
    behaves — 36 plain strings + 3 origin entry

- eval: E10
  run_id: ci-vitest-sdk-pin-E10-20260807T021607Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.b1_anchored_green
  verified_at: 2026-08-07T02:16:07Z
  output: |
    no drift vs the range oneflow-plugin-prefix owns
    (8477f8a08f26b792b313ff4461a978591024c33e..dd39da82b8aaedb17729c0022aa2b146a8219c12):
    config src/lib/plugins/plugins-registry-schema.ts
    src/lib/plugins/plugins-registry.server.ts src/db untouched
    manifest intact: 39 plugins, org still https://github.com/tong-io
    no T3 drift: src/lib/abi src/app/api untouched vs the range
    dependency-refresh-2026-07 owns
    (1e81ac216e46efc9946b47887ae32e496e87e1a4..4d89b584fcfd3dfafd03823a14c9b81406db6e9b)
    workflow drift vs the range ci-actions-bump owns
    (4d89b584fcfd3dfafd03823a14c9b81406db6e9b..8477f8a08f26b792b313ff4461a978591024c33e):
    16 declared pin line(s), comments, and the dry-run guard (-1 +1);
    no file added, deleted or renamed

- eval: E11
  run_id: ci-vitest-sdk-pin-E11-20260807T021608Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.civ_gate_residual
  verified_at: 2026-08-07T02:16:08Z
  output: |
    OK: no feature other than ci-vitest-sdk-pin carries stale evidence — the
    re-sign wave has cleared

- eval: E12
  run_id: ci-vitest-sdk-pin-E12-20260807T021611Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.civ_eval_keys_intact
  verified_at: 2026-08-07T02:16:11Z
  output: |
    OK: 15 overlay_* keys and feature_loop.suite_keys byte-identical to origin/main

- eval: E13
  run_id: ci-vitest-sdk-pin-E13-20260807T021611Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.verify_plugins
  verified_at: 2026-08-07T02:16:11Z
  output: |
    $ tsx scripts/verify-plugins-scan.ts
    [verify-plugins-scan] OK

## Analyst

Non-discriminating evals: none identified — but note that no `baseline:` was
computed this round. Every eval carries `baseline: n-a` by instruction: the
diffBase tree cannot be checked out without a git operation (checkout / stash /
worktree), and this round was run under a hard no-git-mutation constraint. The
A/B discrimination question was answered on earlier rounds and is not re-opened
here; three evals (E3, E6, E11) are self-contained teeth harnesses that
demonstrate their own red case in-process, which is the stronger form of the
same claim.

**What satisfied E4.** Workflow run `31140315224` ("CI") on branch
`feat/local-first-adr-and-s2-plan`, head SHA
`91da1a4e32ce3da92f5ab52d3a43d8b2aeb1a507` — byte-identical to this report's
`verified_commit`, so the CI evidence is about the exact tree verified rather
than a neighbouring one. Five named jobs concluded success: Lint, Type Check,
Build, SDK Tests (Python), Unit Tests (vitest). The sixth job in that run,
Acceptance Gate, did not conclude success; that is the contract's own documented
Known limit ("AC-4 phủ 5/6 job … Job Acceptance Gate đỏ trong lúc feature chưa ký
là đúng thiết kế"), the eval's argument list deliberately omits it, and
`check-run-jobs.sh` deliberately grades the named jobs rather than the run's
overall conclusion. The remaining half of AC-4 — the gate job green after the
signature — stays a Gate-2 spot-check, unchanged from the contract's text.

**Did the missing `landed_merge` anchor matter for E4?** No, not this round, and
the reason is worth recording because it is luck rather than design.
`own-range.sh ci-vitest-sdk-pin` finds no `landed_merge` in the contract and
falls back to `merge-base(HEAD, origin/main)..HEAD` =
`efbbd69…..91da1a4…`, yielding a 14-commit candidate set whose *first* element is
HEAD itself. `find_run` walks that set in order and stops at the first commit
carrying a run, so it stopped at HEAD — which is exactly what an anchor would
have produced. Round 1 returned nothing from the identical resolution because the
branch was unpushed and *no* commit in the set had a run; the anchor was never
the cause. The anchor's absence starts to bite only once this feature has landed
and the branch moves on, at which point the fallback would grade a later,
unrelated commit. That is already written into the contract's Known limits
("Chỉ 5/15 contract có `landed_merge`") and I found nothing to add to it.

**Is the amended AC-11 still worth asserting? Yes — narrowly, and I checked
rather than assumed.** Three things convinced me.

1. *The teeth harnesses do exercise real red cases.*
   `scripts/acceptance/check-resign-wave-teeth.sh` runs 7 classification cases
   and all pass; three of them are red-expecting — foreign stale evidence,
   foreign stale *hidden among* forgiven classes, and output that never reached a
   verdict line. `scripts/acceptance/check-gate-residual-teeth.sh` runs 13, six
   red-expecting, including "foreign stale hiding behind a forgiven foreign
   signature wait". The second case in each harness is the one that matters: it
   proves the forgiveness clause cannot swallow a stale line that happens to sit
   next to a forgiven one. Both harnesses concluded OK.
2. *I falsified the live guard myself, not just its harness.* Using the guard's
   documented `GATE_RESIDUAL_INPUT` seam with a synthetic pre-merge-check
   transcript written to scratch (no repo file touched), I fed it two inputs
   differing only by one injected line,
   `VIOLATION [task-metering]: evidence is stale — …`, surrounded by
   signature-pending violations of the kind the guard forgives. With the line
   present the guard refuses; with it absent it reports the wave cleared. So on
   this branch, today, one stale foreign feature is enough to turn E11 red.
3. *The green is a real green, not an empty one.* The underlying
   `pre-merge-check.sh` currently reports 12 violations, and I read them all: ten
   are "verdict PASS but human_signoff is empty", one is
   `compose-overlay` PENDING-JUDGMENT, one is this slug's own prior-round verdict.
   **Zero** are "evidence is stale". The re-sign wave described in the Gate-1
   quote genuinely ran (commits `67eb589`, `a4c6eca`, `c238042`, `91da1a4`) and
   genuinely paid the cost this branch imposed. E11 passing means the wave was
   paid, not that the question was avoided.

**What the amendment did give up, stated plainly.** AC-11 no longer claims any
other feature has been *signed*, and the amended guard forgives foreign
signature-waits and foreign in-flight verdicts (including REJECT). That is a real
narrowing: at this moment eleven features sit unsigned and E11 is silent about
every one of them. I judge the narrowing correct rather than hollowing, for one
reason — a verify round runs *before* signatures exist by construction, so the
dropped half was never observable from here; Amendment 2's deadlock story is a
symptom of asking an unobservable question, not a convenience. But it is only
correct *conditional on* the surviving half landing somewhere. It does:
`check-gate-residual.sh` still refuses foreign REJECT / missing report / stale,
and the post-signature `pre-merge-check: clean` is an explicit Gate-2 manual
item. If that manual item is ever quietly dropped from the checklist, AC-11's
amendment does become a hollowing, retroactively. Worth a human eye at Gate 2.

**Two minor observations, neither blocking and neither in scope here.**
(a) AC-9's prose and E9's `expected` still quote "38 plain strings + exactly 1
origin entry", while the tree is now at 36 + 3 (moved by `local-cpu-plugins`,
2026-08-06). The criterion survives because
`check-manifest-doc-synced.sh` *derives* both numbers from the guard instead of
restating them, so it asserts doc↔guard agreement rather than a frozen constant —
exactly what AC-9 was written to want. The stale numerals are in the contract
text, not the mechanism. (b) That same guard greps the doc line for the derived
plain-string count as a digit, but for the origin half only checks that the
phrase "origin entr(y|ies)" appears — the doc currently spells the count as the
word "three", so a digit check would not fit. A doc stating the wrong number of
origin entries would pass. Small, real, and belongs to a future round rather than
this one.

## Variance

none — every eval is deterministic (`runs` unset); no eval crosses a provider or
an LLM generator.

## Iterations

Round 1 (2026-08-07, at `67eb589`): E4 and E11 failed → verdict REJECT. E4 — no
GitHub Actions run existed at any commit the branch owned, because the branch was
unpushed; the resolution path itself was correct. E11 — bound to
`check-gate-residual.sh`, which refused any non-PASS verdict on any other
feature, and three siblings (`compose-overlay`, `local-cpu-plugins`,
`per-plugin-origin`) were legitimately mid-flight; two residual evals each waited
on the other's signature, an unreachable state rather than a defect in this
feature.

Round 2 (2026-08-07, at `91da1a4`): all 13 evals pass → verdict PASS. E4 now
resolves run `31140315224` at the verified commit with all five named jobs
success; E11 re-bound by the human's Amendment 2 to `check-resign-wave.sh` and
green because no other feature carries stale evidence. No code, guard, contract
criterion or eval was altered by this verifier; the only files written are this
report, `run-log.jsonl`, and the contract's `status:` line.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Confirm the Amendment 2 narrowing of AC-11 is the trade you intend — see
      `## Analyst`; the dropped half is only safe while the manual item below
      stays on this checklist
- [ ] AC-4 second half: after signing, spot-check that the Acceptance Gate job
      goes green on a fresh CI run (the eval covers 5 of 6 jobs by design)
- [ ] AC-11 second half (manual, by design): after signing, run
      `bash scripts/pre-merge-check.sh . --base origin/main` and confirm `clean`
- [ ] Optional: retire or re-cut AC-9 / E9's "38 + 1" numerals, now 36 + 3 in the
      tree — the mechanism is fine, the prose is stale
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract

### Re-pin — 05/09/2026, hợp nhất PR #97 vào `main`

run_id: repin-merge-20260905T101500Z
sha: 96ee9b89c428b5ce0d64c8f49ba29eb7bd65727e · suites: 8 lệnh exit 0

Commit merge `96ee9b8` kéo mọi hồ sơ đã ký ra khỏi mốc của chúng theo đường dẫn. Một lượt làn
máy chung cho cả đợt, 9 ô đo bị chạm, cả 9 chạy lại và exit 0.

Đợt này KHÔNG re-pin SÁU hồ sơ — `add-media-library`, `byo-key-onboarding`, `chong-doc-sai-em-ru`,
`cong-tu-canh-minh`, `gate-scope-anchors`, `normalize-text-vi` — vì ô đo bị chạm của chúng ĐỎ, hoặc
KHÔNG KẾT LUẬN ĐƯỢC (cửa sổ diff rỗng khi nhánh đứng ngay tại `main`; hoặc ô `ui-check` không chạy
được ngoài luồng verify). Dời mốc khi ấy là khai rằng bằng chứng còn đúng trong khi chưa chứng
minh được.
