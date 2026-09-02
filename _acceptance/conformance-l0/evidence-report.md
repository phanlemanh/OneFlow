---
schema_version: 2
feature_slug: conformance-l0
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: fe711ecd5cf7821f582dcc11d7ff7818cfb7162f
human_signoff:
---

# Evidence Report: conformance-l0

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E14 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | script | PASS |
| E9 | AC-8 | test | PASS |
| E15 | AC-8 | script | PASS |
| E10 | AC-9 | test | PASS |
| E11 | AC-9 | test | PASS |
| E12 | AC-10 | test | PASS |
| E13 | AC-11 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-conformance-l0-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-09-02T22:48:40Z
  output: |
    ................................................................        [100%]
    16 passed in 0.26s
    (one run of tests/test_engine_batch.py serves E1, E2, E4, E5 and E13)

- eval: E2
  run_id: minted-conformance-l0-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-09-02T22:48:40Z
  output: |
    16 passed in 0.26s

- eval: E3
  run_id: minted-conformance-l0-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest
  verified_at: 2026-09-02T22:48:41Z
  output: |
    ........................................................................ [ 98%]
    ....                                                                     [100%]
    292 passed in 14.66s

- eval: E14
  run_id: minted-conformance-l0-E14-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_conformance
  verified_at: 2026-09-02T22:48:42Z
  output: |
    ........                                                                 [100%]
    8 passed in 0.24s
    (one run of tests/conformance serves E14 and E6)

- eval: E4
  run_id: minted-conformance-l0-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-09-02T22:48:40Z
  output: |
    16 passed in 0.26s

- eval: E5
  run_id: minted-conformance-l0-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-09-02T22:48:40Z
  output: |
    16 passed in 0.26s

- eval: E6
  run_id: minted-conformance-l0-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_conformance
  verified_at: 2026-09-02T22:48:42Z
  output: |
    ........                                                                 [100%]
    8 passed in 0.24s

- eval: E7
  run_id: minted-conformance-l0-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_conformance
  verified_at: 2026-09-02T22:48:47Z
  output: |
         Tests  13 passed (13)
      Start at  22:48:47
      Duration  185ms (transform 75ms, setup 0ms, import 94ms, tests 4ms, environment 0ms)

- eval: E8
  run_id: minted-conformance-l0-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.conformance_discriminating
  verified_at: 2026-09-02T22:48:50Z
  output: |
    ==> revert: both halves must be GREEN again
        green
    OK: the conformance suite discriminates on all three perturbation kinds

- eval: E9
  run_id: minted-conformance-l0-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_plugin_rev
  verified_at: 2026-09-02T22:48:43Z
  output: |
    .......                                                                  [100%]
    7 passed in 1.13s
    (one run of tests/test_plugin_rev.py serves E9 and E10)

- eval: E15
  run_id: minted-conformance-l0-E15-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.plugin_rev_joined_path
  verified_at: 2026-09-02T22:48:52Z
  output: |
    Already up to date
    Done in 164ms using pnpm v11.5.1
    OK: TypeScript install -> Python scan preserved pluginRev 305a69612d49762e11be787bde4d407e657689a4

- eval: E10
  run_id: minted-conformance-l0-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_plugin_rev
  verified_at: 2026-09-02T22:48:43Z
  output: |
    7 passed in 1.13s

- eval: E11
  run_id: minted-conformance-l0-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_plugin_rev
  verified_at: 2026-09-02T22:48:48Z
  output: |
          Tests  3 passed (3)
       Start at  22:48:48
       Duration  138ms (transform 19ms, setup 0ms, import 61ms, tests 4ms, environment 0ms)

- eval: E12
  run_id: minted-conformance-l0-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_node_cached
  verified_at: 2026-09-02T22:48:49Z
  output: |
         Tests  11 passed (11)
      Start at  22:48:49
      Duration  126ms (transform 23ms, setup 0ms, import 31ms, tests 26ms, environment 0ms)

- eval: E13
  run_id: minted-conformance-l0-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-09-02T22:48:40Z
  output: |
    16 passed in 0.26s

### Lệnh suite (hồi quy)

- cmd: bash scripts/acceptance/preflight-verify-env.sh
  run_id: minted-conformance-l0-SUITE-bash_scripts_acceptance_preflight_verify-r2
  exit_code: 0
  verified_at: 2026-09-02T22:48:39Z

- cmd: pnpm build && pnpm typecheck
  run_id: minted-conformance-l0-SUITE-build_typecheck-r2
  exit_code: 0
  verified_at: 2026-09-02T22:48:53Z

- cmd: pnpm lint:check
  run_id: minted-conformance-l0-SUITE-lint_check-r2
  exit_code: 0
  verified_at: 2026-09-02T22:48:55Z

- cmd: pnpm test
  run_id: minted-conformance-l0-SUITE-test-r2
  exit_code: 0
  verified_at: 2026-09-02T22:48:57Z

- cmd: pnpm verify:plugins
  run_id: minted-conformance-l0-SUITE-verify_plugins-r2
  exit_code: 0
  verified_at: 2026-09-02T22:49:10Z

- cmd: pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json
  run_id: minted-conformance-l0-SUITE-gen_abi-r2
  exit_code: 0
  verified_at: 2026-09-02T22:49:12Z

## Known limits

1. **Vòng này là verify LẠI, không phải một vòng phát triển.** Mã của
   `conformance-l0` không đổi kể từ chữ ký 07/08; vòng chạy vì hồ sơ
   `chong-mat-khoa-byo-giao-dien` sửa `src/app/api/media-library/route.test.ts`,
   nằm trong `paths` của E12 (`src/app/api/**`). Ô E12 xanh 11/11.

2. **`paths` của E12 khai quá rộng so với điều nó đo.** Nó đo `node_cached` đi qua
   ba tầng, nhưng khai cả `src/app/api/**` — nên BẤT KỲ PR nào chạm bất kỳ route
   nào, vì bất kỳ lý do gì, đều làm hồ sơ này ôi. Vòng verify này làm mới
   `verified_commit` nhưng KHÔNG thu cái glob đó lại; PR kế tiếp chạm route sẽ đỏ
   y hệt. Thu nó là việc của một hồ sơ riêng, không phải một lượt sửa lén trong
   lúc gỡ CI.

3. **Bộ tổng hợp của kit trả `runLogWriteFailed: true`** (lần thứ tư trong ngày):
   báo cáo và 23 dòng run-log tính xong nhưng không ghi được, phiên điều phối ghi
   tay. Nó cũng kể SAI lý do vòng chạy — viết «sau khi fork plugin OpenAI —
   dang-ky-fork-openai», không liên quan; câu đó đã sửa lại theo lý do thật.

## Ngoài hợp đồng — đã định đoạt ở hồ sơ khác

Mười finding dưới đây là về mã của `chong-mat-khoa-byo-giao-dien`, không phải về
`conformance-l0` — lớp review của vòng này đọc diff của cả nhánh nên gặp lại chúng.
Cả mười **đã được owner định đoạt ở Cổng 2 ngày 02/09** trong hồ sơ đó; chi tiết và
lựa chọn từng mục ở
[`../chong-mat-khoa-byo-giao-dien/evidence-report.md`](../chong-mat-khoa-byo-giao-dien/evidence-report.md).
Không xử lại ở đây.

| # | Phát hiện | Owner chọn |
|---|---|---|
| Ngoài-1 | Write failure is rendered as "key saved" in the node key prompt (high) | **đã quyết ở hồ sơ kia** |
| Ngoài-2 | env-client hand-rolls fetch, bypassing the repo's shared API client (timeout + shell 401 seam) (medium) | **đã quyết ở hồ sơ kia** |
| Ngoài-3 | New STORE_UNREADABLE code was not added to the media-library route STATUS maps (medium) | **đã quyết ở hồ sơ kia** |
| Ngoài-4 | Orphaned i18n key readFailed left in all five locale files (low) | **đã quyết ở hồ sơ kia** |
| Ngoài-5 | Failed key write is reported to the user as "key saved" (high) | **đã quyết ở hồ sơ kia** |
| Ngoài-6 | Destructive "replace key store" is offered for transient read failures and is honoured even on a healthy store (medium) | **đã quyết ở hồ sơ kia** |
| Ngoài-7 | STORE_UNREADABLE is missing from the media-library route status maps, so a local fault answers 502 (low) | **đã quyết ở hồ sơ kia** |
| Ngoài-8 | Hình dạng 2 — bề mặt `abi-node-shell` trong E6 là bản LẮP TAY trong test (hook thật + `NodeKeyPrompt` + `PROMPT_LABELS` do test tự viết), không phải bề mặt sản phẩm (medium) | **đã quyết ở hồ sơ kia** |
| Ngoài-9 | Hình dạng 4 — ca răng 1c ("prose không được làm guard đỏ") là assert âm-tính rỗng: needle không thể khớp văn xuôi, nên ca xanh kể cả khi bộ lọc bỏ-dòng-chú-thích bị xoá (medium) | **đã quyết ở hồ sơ kia** |
| Ngoài-10 | Hình dạng 5 — E12 tuyên "copy đến từ catalogue" cho cả tấm chặn nhưng chỉ ghim 2/15 khoá; toàn bộ copy hộp xác nhận huỷ-diệt chỉ được đo bằng literal tiếng Việt ghi cứng trong E4 (medium) | **đã quyết ở hồ sơ kia** |

## Analyst

carried tu round trước — baseline không đo lại round này. evals.yaml của
conformance-l0 không đổi kể từ lần đo baseline gần nhất (P2), nên vòng này không
di chuyển working tree sang diffBase và mọi eval máy ở trên mang `baseline: n-a`.
Không có eval nào để liệt vào danh sách không-phân-biệt round này vì không có
phép đo baseline nào chạy.

none — round này không đo baseline nên không có eval nào được xếp là
non-discriminating.

Sáu lệnh suite (preflight, build+typecheck, lint:check, test, verify:plugins,
gen:abi diff) đều xanh trên HEAD hiện tại; đây là các regression-guard tiêu
chuẩn chạy mỗi vòng, không gắn AC nào, nên không liệt vào Analyst.

## Variance

none — mọi eval trong feature này đều deterministic (không khai `runs` > 1,
không executor nào băng qua provider hay LLM).

## Iterations

Round 1 (re-verification after upstream code change): all fifteen evals clean at
a788985.
Round 2 (verify lại vì hồ sơ chong-mat-khoa-byo-giao-dien chạm phạm vi ôi của E12): toàn bộ
mười lăm eval máy + sáu lệnh suite (preflight-verify-env, build+typecheck,
lint:check, test, verify:plugins, gen:abi diff) xanh sạch tại fe711ecd — lệnh
suite thứ bảy (sdk pytest) trùng byte-với-byte lệnh của E3 nên workflow gộp lại;
bằng chứng của nó nằm dưới E3. Không có
thay đổi nào trong evals.yaml so với round trước nên baseline không đo lại (xem
Analyst).

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] No judgment items in this feature — nothing to override
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
