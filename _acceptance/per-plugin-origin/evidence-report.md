---
schema_version: 2
feature_slug: per-plugin-origin
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 28c1a7d6202ce2a8cd40eeae7eb55a8145264891
human_signoff: Manh 2026-08-03
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
| E7 | AC-6 | script | PASS |
| E8 | AC-6 | test | PASS |
| E9 | AC-1 | test | PASS |
| E10 | AC-3 | test | PASS |
| E11 | AC-3 | test | PASS |
| E12 | AC-3 | script | PASS |

## Evidence

- eval: E1
  run_id: per-plugin-origin-E1-20260805124019
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-08-05T12:40:19Z
  output: |
     RUN  v4.1.10 /Users/manhphan/dev/oneflow
     Test Files  1 passed (1)
          Tests  59 passed (59)
       Start at  17:32:33
       Duration  92ms (transform 19ms, setup 0ms, import 27ms, tests 6ms, environment 0ms)

- eval: E2
  run_id: per-plugin-origin-E2-20260805124019
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-08-05T12:40:19Z
  output: |
     RUN  v4.1.10 /Users/manhphan/dev/oneflow
     Test Files  1 passed (1)
          Tests  59 passed (59)
       Start at  17:32:33
       Duration  92ms (transform 19ms, setup 0ms, import 27ms, tests 6ms, environment 0ms)

- eval: E3
  run_id: per-plugin-origin-E3-20260805124019
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-08-05T12:40:19Z
  output: |
     RUN  v4.1.10 /Users/manhphan/dev/oneflow
     Test Files  1 passed (1)
          Tests  59 passed (59)
       Start at  17:32:33
       Duration  92ms (transform 19ms, setup 0ms, import 27ms, tests 6ms, environment 0ms)

- eval: E4
  run_id: per-plugin-origin-E4-20260805124019
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-08-05T12:40:19Z
  output: |
     RUN  v4.1.10 /Users/manhphan/dev/oneflow
     Test Files  1 passed (1)
          Tests  59 passed (59)
       Start at  17:32:33
       Duration  92ms (transform 19ms, setup 0ms, import 27ms, tests 6ms, environment 0ms)

- eval: E5
  run_id: per-plugin-origin-E5-20260805124010
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.origin_single_impl
  verified_at: 2026-08-05T12:40:10Z
  output: |
    OK: one URL rule across src/ and scripts/, in src/lib/plugins/official-manifest.ts; the CLI installer imports it (the SDK engine's Python copy is out of this scan's scope — see the contract's known limits)

- eval: E6
  run_id: per-plugin-origin-E6-20260805124010
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.origin_installer_parity
  verified_at: 2026-08-05T12:40:10Z
  output: |
    OK: the CLI installer, the in-app install path and the update checker agree; both pull paths use the resolved origin and refuse a non-fast-forward

- eval: E7
  run_id: per-plugin-origin-E7-20260805124012
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.origin_manifest_unmoved
  verified_at: 2026-08-05T12:40:12Z
  output: |
    OK: 38 plain strings under default org + 1 origin entry (compose-overlay)

- eval: E8
  run_id: per-plugin-origin-E8-20260805124019
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_plugin_id
  verified_at: 2026-08-05T12:40:19Z
  output: |
     RUN  v4.1.10 /Users/manhphan/dev/oneflow
     Test Files  1 passed (1)
          Tests  76 passed (76)
       Start at  17:32:33
       Duration  87ms (transform 17ms, setup 0ms, import 25ms, tests 3ms, environment 0ms)

- eval: E9
  run_id: per-plugin-origin-E9-20260805124036
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit
  verified_at: 2026-08-05T12:40:36Z
  output: |
    > vitest run
     RUN  v4.1.10 /Users/manhphan/dev/oneflow
     Test Files  31 passed (31)
          Tests  413 passed (413)
       Start at  17:32:35
       Duration  1.32s (transform 1.81s, setup 0ms, import 3.19s, tests 1.31s, environment 512ms)

- eval: E10
  run_id: per-plugin-origin-E10-20260805124038
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.build_typecheck
  verified_at: 2026-08-05T12:40:38Z
  output: |
      ├ chunks/620846f1-92c416bf2f09796f.js  54.2 kB
      ├ chunks/8336-0e84acaf04d00d35.js      46.2 kB
      └ other shared chunks (total)          2.19 kB
    ƒ  (Dynamic)  server-rendered on demand
    > oneflow@0.2.1 typecheck /Users/manhphan/dev/oneflow
    > tsc --noEmit

- eval: E11
  run_id: per-plugin-origin-E11-20260805124035
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lint
  verified_at: 2026-08-05T12:40:35Z
  output: |
    > oneflow@0.2.1 lint:check /Users/manhphan/dev/oneflow
    > pnpm exec biome check --error-on-warnings .
    Checked 425 files in 101ms. No fixes applied.

- eval: E12
  run_id: per-plugin-origin-E12-20260805124015
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.verify_plugins
  verified_at: 2026-08-05T12:40:15Z
  output: |
    > oneflow@0.2.1 verify:plugins /Users/manhphan/dev/oneflow
    > tsx scripts/verify-plugins-scan.ts
    [verify-plugins-scan] OK

## Analyst

carried tu round truoc — baseline khong do lai round nay
none — baseline not re-measured this round (see prior round's evidence report for the baseline classification)

## Variance

none — no stochastic evals this round (no eval carries runs > 1)

## Iterations

Round 10: all 12 machine evals (E1-E12) passed on first run, zero failures, zero judgment items pending; baseline not re-measured this round (carried from prior round per P2).

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
thành cũ theo cơ chế staleness. Đã chạy lại: **12/12 eval xanh** ở
`5acc982e7690`, trong một đợt chạy chung 194 eval / 131 lệnh duy nhất của cả 13 hồ
sơ bị ảnh hưởng — không hồ sơ nào đỏ.

Chi phí này đã khai trước ở Cổng 1 của `gate-scope-anchors`.

## Ghim lại 2026-08-05 (nhánh `chore/landed-merge-anchors`)

Nhánh điền `landed_merge` chạm `scripts/**` (sửa test + hoàn nguyên golden), nên
bằng chứng lại thành cũ. Đã chạy lại đợt chung 139 eval / 85 lệnh của 10 hồ sơ
bị ảnh hưởng ở `f39723a228be` — **0 hồ sơ đỏ**.

## Ghim lại 2026-08-05 (nhánh `feat/ci-vitest-sdk-pin`, CI-a)

Nhánh CI-a làm ba việc cho hạ tầng verify, không thêm tính năng sản phẩm nào:
thêm job `Unit Tests (vitest)` vào `.github/workflows/ci.yml`; gỡ pin SDK ghi
cứng trong `scripts/plugins/run-overlay-plugin-tests.sh` (nay rút từ
`sdk/pyproject.toml` qua `scripts/lib/sdk-version.sh`); và thêm các guard đi kèm.
Vì nó chạm `.github/workflows/**` và `scripts/**`, `pre-merge-check.sh` báo hồ sơ
này cũ.

**Quyền sở hữu, tự tính lại chứ không thừa kế.** Contract này **không có**
`landed_merge:` trong frontmatter — toàn repo chỉ có năm hồ sơ mang trường đó
(`ci-actions-bump`, `compose-overlay`, `dependency-refresh-2026-07`,
`oneflow-plugin-prefix`, `gate-scope-anchors`), và đây không phải một trong số
đó. Không dựng được tập file sở hữu thì cũng không chứng minh được carry-forward
là hợp lệ, nên theo nguyên tắc thận trọng hồ sơ này đi đường re-verify: chạy lại
toàn bộ eval, không ghi công thừa kế cho eval nào.

**Hai lượt chạy trong cùng một đợt.** Lượt thứ nhất chạy ở `a1bc936` và cho
**12/12 eval xanh** cho hồ sơ này. Lượt đó phát hiện hai lỗi thật ở chỗ khác
trong đợt — `scripts/lib/sdk-version.sh` giải gốc repo bằng
`git rev-parse --show-toplevel` lúc gọi nên chết khi caller đã `cd` vào bản clone
plugin, và `check-action-pins.sh` còn chốt `EXPECTED_CHECKOUT_SITES=7` trong khi
job vitest mới nâng số điểm checkout lên 8 (eval E1 của `ci-actions-bump` đỏ vì
việc này). Commit `28c1a7d` sửa cả hai.

**Lượt chạy này, ở `28c1a7d`: 12/12 eval xanh**, tất cả thoát 0. Mỗi `cmd` được
giải lại từng dòng theo `_acceptance/config.yaml` trước khi chạy; các lệnh dùng
chung được chạy **một lần** và ghi công cho mọi eval ràng buộc nó, mỗi eval một
`run_id` riêng, còn `verified_at` của các eval chung lệnh cố tình trùng nhau vì
chúng ghi lại cùng một lần chạy. `verified_commit` chuyển sang `28c1a7d6202c`.
Dòng chữ ký người trong frontmatter không bị đụng tới.
