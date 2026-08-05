---
schema_version: 2
feature_slug: measure-harness
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: f39723a228be90031eb1e3e423664c84829851db
human_signoff: Manh 2026-08-04
---

# Evidence Report: measure-harness

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-8 | test | PASS |
| E10 | AC-9 | test | PASS |
| E11 | AC-10 | test | PASS |
| E12 | AC-15 | script | PASS |
| E13 | AC-11 | test | PASS |
| E14 | AC-12 | test | PASS |
| E15 | AC-13 | test | PASS |
| E16 | AC-14 | script | PASS |
| E17 | AC-16 | test | PASS |
| E18 | AC-16 | test | PASS |
| E19 | AC-16 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-measure-harness-E1-r16
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_measure
  verified_at: 2026-08-04T11:39:23Z
  output: |
    Tests  33 passed (33)
    Start at  11:39:23
    Duration  320ms (transform 327ms, setup 0ms, import 577ms, tests 11ms, environment 0ms)

- eval: E2
  run_id: minted-measure-harness-E2-r16
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_measure
  verified_at: 2026-08-04T11:39:23Z
  output: |
    Tests  33 passed (33)
    Start at  11:39:23
    Duration  320ms (transform 327ms, setup 0ms, import 577ms, tests 11ms, environment 0ms)

- eval: E3
  run_id: minted-measure-harness-E3-r16
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_measure
  verified_at: 2026-08-04T11:39:23Z
  output: |
    Tests  33 passed (33)
    Start at  11:39:23
    Duration  320ms (transform 327ms, setup 0ms, import 577ms, tests 11ms, environment 0ms)

- eval: E4
  run_id: minted-measure-harness-E4-r16
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_measure
  verified_at: 2026-08-04T11:39:23Z
  output: |
    Tests  33 passed (33)
    Start at  11:39:23
    Duration  320ms (transform 327ms, setup 0ms, import 577ms, tests 11ms, environment 0ms)

- eval: E5
  run_id: minted-measure-harness-E5-r16
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_measure
  verified_at: 2026-08-04T11:39:23Z
  output: |
    Tests  33 passed (33)
    Start at  11:39:23
    Duration  320ms (transform 327ms, setup 0ms, import 577ms, tests 11ms, environment 0ms)

- eval: E6
  run_id: minted-measure-harness-E6-r16
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.smoke_measure_wer
  verified_at: 2026-08-04T11:39:23Z
  output: |
    26 reference words. "digit" counts edits where either side's token contains a digit —
    numbers are never converted automatically, so a price read aloud shows up here for a human to judge.

- eval: E7
  run_id: minted-measure-harness-E7-r16
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_measure
  verified_at: 2026-08-04T11:39:23Z
  output: |
    Tests  33 passed (33)
    Start at  11:39:23
    Duration  320ms (transform 327ms, setup 0ms, import 577ms, tests 11ms, environment 0ms)

- eval: E8
  run_id: minted-measure-harness-E8-r16
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_measure
  verified_at: 2026-08-04T11:39:23Z
  output: |
    Tests  33 passed (33)
    Start at  11:39:23
    Duration  320ms (transform 327ms, setup 0ms, import 577ms, tests 11ms, environment 0ms)

- eval: E9
  run_id: minted-measure-harness-E9-r16
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_measure
  verified_at: 2026-08-04T11:39:23Z
  output: |
    Tests  33 passed (33)
    Start at  11:39:23
    Duration  320ms (transform 327ms, setup 0ms, import 577ms, tests 11ms, environment 0ms)

- eval: E10
  run_id: minted-measure-harness-E10-r16
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_measure
  verified_at: 2026-08-04T11:39:23Z
  output: |
    Tests  33 passed (33)
    Start at  11:39:23
    Duration  320ms (transform 327ms, setup 0ms, import 577ms, tests 11ms, environment 0ms)

- eval: E11
  run_id: minted-measure-harness-E11-r16
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_measure
  verified_at: 2026-08-04T11:39:23Z
  output: |
    Tests  33 passed (33)
    Start at  11:39:23
    Duration  320ms (transform 327ms, setup 0ms, import 577ms, tests 11ms, environment 0ms)

- eval: E12
  run_id: minted-measure-harness-E12-r16
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.smoke_measure_mos
  verified_at: 2026-08-04T11:39:23Z
  output: |
    At this sample size the interval is wide by construction — read n before the mean.

    selftest-mos: ok

- eval: E13
  run_id: minted-measure-harness-E13-r16
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_measure
  verified_at: 2026-08-04T11:39:23Z
  output: |
    Tests  33 passed (33)
    Start at  11:39:23
    Duration  320ms (transform 327ms, setup 0ms, import 577ms, tests 11ms, environment 0ms)

- eval: E14
  run_id: minted-measure-harness-E14-r16
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_measure
  verified_at: 2026-08-04T11:39:23Z
  output: |
    Tests  33 passed (33)
    Start at  11:39:23
    Duration  320ms (transform 327ms, setup 0ms, import 577ms, tests 11ms, environment 0ms)

- eval: E15
  run_id: minted-measure-harness-E15-r16
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_measure
  verified_at: 2026-08-04T11:39:23Z
  output: |
    Tests  33 passed (33)
    Start at  11:39:23
    Duration  320ms (transform 327ms, setup 0ms, import 577ms, tests 11ms, environment 0ms)

- eval: E16
  run_id: minted-measure-harness-E16-r16
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.smoke_measure_cogs
  verified_at: 2026-08-04T11:39:23Z
  output: |
    {"<pluginId>": <usdPerSecond>}

    selftest-cogs: ok

- eval: E17
  run_id: minted-measure-harness-E17-r16
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit
  verified_at: 2026-08-04T11:39:22Z
  output: |
    Tests  413 passed (413)
    Start at  11:39:22
    Duration  2.85s (transform 5.18s, setup 0ms, import 8.81s, tests 2.03s, environment 1.00s)

- eval: E18
  run_id: minted-measure-harness-E18-r16
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.build_typecheck
  verified_at: 2026-08-04T11:39:23Z
  output: |
    [WARN] The "pnpm" field in package.json is no longer read by pnpm. The following keys were ignored: "pnpm.onlyBuiltDependencies". See https://pnpm.io/settings for the new home of each setting.
    $ tsc --noEmit

- eval: E19
  run_id: minted-measure-harness-E19-r16
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lint
  verified_at: 2026-08-04T11:39:23Z
  output: |
    $ pnpm exec biome check --error-on-warnings .
    [WARN] The "pnpm" field in package.json is no longer read by pnpm. The following keys were ignored: "pnpm.onlyBuiltDependencies". See https://pnpm.io/settings for the new home of each setting.
    Checked 426 files in 124ms. No fixes applied.

## Analyst

carried tu round truoc — baseline khong do lai round nay

none — every feature eval's baseline is n-a this round (not re-measured per P2); no evals flagged non-discriminating.

## Variance

none — every multi-run eval is uniform (no eval in this round carries runs > 1)

## Iterations

Round 16: E1-E19 all green on the final tree — measure-harness (WER/MOS/COGS) verified end-to-end via `pnpm vitest run src/lib/measure` (33/33), the WER/MOS/COGS smoke scripts, alongside the full repo vitest suite (413/413), SDK pytest (193/193), `pnpm verify:plugins`, and a diff-clean `pnpm gen:abi`.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract

## Vòng kiểm lại 2026-08-04 (sau hạng mục 0.6 `gate-scope-anchors`)

Hợp đồng `gate-scope-anchors` chạm `scripts/**`, nên bằng chứng của hồ sơ này
thành cũ theo cơ chế staleness. Đã chạy lại: **19/19 eval xanh** ở
`5acc982e7690`, trong một đợt chạy chung 194 eval / 131 lệnh duy nhất của cả 13 hồ
sơ bị ảnh hưởng — không hồ sơ nào đỏ.

Chi phí này đã khai trước ở Cổng 1 của `gate-scope-anchors`.

## Ghim lại 2026-08-05 (nhánh `chore/landed-merge-anchors`)

Nhánh điền `landed_merge` chạm `scripts/**` (sửa test + hoàn nguyên golden), nên
bằng chứng lại thành cũ. Đã chạy lại đợt chung 139 eval / 85 lệnh của 10 hồ sơ
bị ảnh hưởng ở `f39723a228be` — **0 hồ sơ đỏ**.
