---
schema_version: 2
feature_slug: conformance-l0
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d1331546558e3ba13f3e77ef557f1393a44cffa9
human_signoff: Phan Le Manh 2026-09-02
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

### Re-pin lần 1 — 2026-08-27, do fork `STALE-DIFF-SCOPE-GUARD` được thu hẹp (hồ sơ `gate-tooling-t1`): feature khai đủ `paths` nay lại bị soi staleness, làm lộ bản ghi cũ này. Mã của gói này không đổi — mọi suite chạy lại đều exit 0
run_id: repin-conformance-l0-20260827T101500Z
sha: d919b5eb51a0a3dfa70b5718113c935b39099ab0 · suites: 9 lệnh exit 0

### Re-pin lần 2 — 2026-08-28, do nhánh `fix/scoping-fixtures-diff-shape` thu hẹp fork `STALE-DIFF-SCOPE-GUARD` và thêm guard dưới `scripts/acceptance/**`: feature khai `paths` nay bị soi, và thay đổi gated của nhánh rơi vào vùng eval của hồ sơ này chạy qua. Mã sản phẩm không đổi — mọi suite chạy lại đều exit 0
run_id: repin-conformance-l0-20260828T053000Z
sha: 8512c6e98c48ab3f4cab75dafa9493a0b1e36868 · suites: 9 lệnh exit 0

### Re-pin lần 3 — 2026-08-28, do nhánh `draft/chong-doc-sai-em-ru` sửa `sdk/tongflow/text/normalize_vi.py` và `sdk/tests/test_normalize_vi.py`: hồ sơ này khai `sdk/**` trong `paths` của một eval, nên thay đổi đó rơi vào vùng soi staleness. Chỉ lộ ra SAU khi merge `main` (PR #83) vào nhánh — trước merge cả hai cổng đều xanh, đúng lý do "cổng chạy trên cây đã merge main mới là cổng thật". Mã của gói này không đổi một byte; một phiên tươi chạy lại cả 9 lệnh, preflight GREEN, mọi lệnh exit 0
run_id: repin-conformance-l0-20260828T124500Z
sha: 9caa25568b35132ab0387e09e5aa0b503c8a8deb · suites: 9 lệnh exit 0

### Re-pin lần 4 — 2026-08-29, do nhánh `feat/add-media-library` thêm ba route API dưới `src/app/api/media-library/`: hồ sơ này khai `src/app/api/**` trong `paths` của một eval, nên ba file đó rơi vào vùng soi staleness. Chỉ lộ ra SAU khi merge `main` vào nhánh — trên chính `main` thì cổng sạch, staleness sinh ra từ nhánh chứ không phải từ `main`. Mã của gói này không đổi một byte; một phiên tươi chạy lại cả 9 lệnh trong worktree của nhánh, preflight GREEN, mọi lệnh exit 0. Lane chạy LẠI ở mốc cuối sau khi hai file `scripts/acceptance/` bỏ dở trong worktree được commit — một ghim chỉ được dời sau một lane đã thật sự chạy tại đúng mốc đó
run_id: repin-conformance-l0-20260829T025815Z
sha: 1406d9686404e9924c19797908b00bc2f40d524a · suites: 9 lệnh exit 0

### Re-pin lần 5 — 2026-08-29, do nhánh `feat/add-media-library` đi tiếp tới chữ ký Cổng 2: sau lần re-pin 4 nhánh còn commit thêm bảy lượt (hai lỗi nặng của vòng 7, khai thư mục dist trong `tsconfig.json`, bỏ bước khôi phục phá dữ liệu khỏi guard a11y, và bộ hồ sơ nghiệm thu). Hồ sơ này khai `src/**` và `sdk/**` trong `paths`, nên các commit đó rơi vào vùng soi staleness. Mã của gói này không đổi một byte; một phiên tươi chạy lại cả 9 lệnh trong worktree của nhánh, preflight GREEN ở mọi agent kiểm nó, mọi lệnh exit 0. Ghim dời **sau** khi mọi commit ngoài `_acceptance/**` đã xong — đúng bài học lần 4: ghim trước rồi commit tiếp là tự huỷ ghim vừa lấy. Hai lệnh pytest đỏ ở lượt đầu là **lỗi gọi của người dựng lane**, không phải hồ sơ đỏ: exit 4 là mã *usage error* của pytest (target không tồn tại) chứ không phải mã test trượt — target thật là `tests/test_engine_batch.py` và `tests/conformance`, sai vì bản liệt kê config bị cắt ở 110 ký tự rồi bị coi là nguồn. Sửa target, chạy lại: 9/9 exit 0.
run_id: repin-conformance-l0-20260829T134252Z
sha: 31968535286d7800678c5f9af0e2aa0a33c4c54a · suites: 9 lệnh exit 0

### Re-pin lần 6 — 2026-08-31, do `chong-mat-khoa-byo` chạm `src/app/api/**` mà hồ sơ này khai trong `paths`
run_id: repin-20260831T022203Z-2767
sha: 292d740129ec49e46dda86ecef6b6f0a51b5080e · suites: 7 lệnh exit 0

Lane máy thuần chạy bởi một agent tươi tại HEAD: preflight GREEN · build+typecheck ·
lint · vitest 708 · sdk pytest 292 · verify:plugins · gen:abi sạch. Cây sạch trước và
sau. Không chữ ký người nào bị đụng.

### Re-pin lần 7 — 2026-09-01, do dang-ky-fork-openai chạm scripts/plugins/** trong phạm vi hẹp của hồ sơ này
run_id: repin-20260901T093702Z-3535
sha: bb85560ca1337e308b1e06f5be7234dd64a0be2a · suites: 8 lệnh exit 0

### Re-pin lần 8 — 2026-09-01, do dang-ky-fork-openai chạm scripts/plugins/** thêm ở vòng sửa
run_id: repin-20260901T151335Z-6351
sha: 35b24ee4cb06dd97020f13aee913777c3255d00f · suites: 8 lệnh exit 0

### Re-pin lần 9 — 2026-09-01, do noi-thuoc-tai-lieu-vao-ci chạm .github/workflows/ci.yml và scripts/plugins/**
run_id: repin-20260902T020812Z-5668
sha: e0eb0a92d5ca672e2af4f372bbdede9260727d74 · suites: 8 lệnh exit 0

### Re-pin lần 10 — 2026-09-02, do noi-thuoc-tai-lieu-vao-ci chạm ci.yml, scripts/ci/**, scripts/plugins/** và package.json
run_id: repin-20260902T093055Z-6608
sha: 10e50bdad103b8d9c80efe6ba2b5ebddc4f34ebf · suites: 8 lệnh exit 0

### Re-pin lần 11 — 2026-09-02, do noi-thuoc-tai-lieu-vao-ci rút chế độ exit-propagates và khôi phục dòng in số id
run_id: repin-20260902T102111Z-4002
sha: 0110e2a557c1e5524d7e5a91db39023da23b5df8 · suites: 8 lệnh exit 0 (làn chạy TUẦN TỰ, không tung bầy — vòng trước BLOCKED vì agent chết)

### Re-pin lần 12 — 2026-09-02, do repin-khong-chay-lai-eval chạm scripts/ci/**
run_id: repin-20260902T162209Z-29839
sha: ddea746f4269130b59797ea4236f2ec9a44a6c61 · suites: 8 lệnh exit 0 (làn tuần tự; dòng repin ghi bằng chế độ `write`, mang `prev_sha`)

### Re-pin lần 13 — 2026-09-02, do nhánh thêm hai phép từ chối cho `write` và một guard điểm vào
run_id: rkce-repin-20260902T221339Z
sha: 3c859a4998c875a1032d76ee6529b263474d3b20 · suites: 8 lệnh exit 0

### Re-pin lần 14 — 2026-09-03, do nhánh gom mọi lượt đọc/ghi run-log về một cửa
run_id: rkce-repin-20260903T023014Z
sha: 71449d00fb483e1ef48b95a7da0e4adbb156fb45 · suites: 8 lệnh exit 0

### Re-pin lần 15 — 2026-09-03, do nhánh buộc mọi con số viết tay vào vật nó mô tả
run_id: rkce-repin-20260903T054659Z
sha: c1fae946b9185354407bcf5b080748cadac35488 · suites: 8 lệnh exit 0

### Re-pin lần 16 — 2026-09-03, do vòng soi xác nhận bác một phép sửa và nhánh sửa lại
run_id: rkce-repin-20260903T065011Z
sha: e68cdd61b0e7108753431434216e4343e0117e77 · suites: 8 lệnh exit 0

### Re-pin lần 17 — 2026-09-03, do hợp nhất `origin/main` (33 commit) vào nhánh
run_id: merge-repin-20260903T074652Z
sha: 5b440efdc75859cc700b7564e76b42e6a3e73fd9 · suites: 8 lệnh exit 0

### Re-pin lần 18 — 2026-09-04, do thêm `scripts/acceptance/check-eval-key-dupes.sh` và sửa `scripts/ci/repin-eval-coverage.mjs` cho hồ sơ `hang-rao-doc-nham-loi-thanh-khong-co-gi` — cả hai nằm trong union `paths` của gói này. Mã của gói này không đổi; lane máy 7 lệnh exit 0
run_id: repin-hang-rao-doc-nham-loi-20260903T220954Z
sha: 57c10c950893239c57559730ecdba193e75b0aab · suites: 7 lệnh exit 0

### Re-pin lần 19 — 2026-09-04, do sửa `modePlan` của `scripts/ci/repin-eval-coverage.mjs` (AC-12, owner nâng phạm vi ở Cổng 2 vòng 1) và bộ răng lên 30 ca — cả hai nằm trong union `paths` của gói này. Mã của gói này không đổi; lane máy 7 lệnh exit 0
run_id: repin-hang-rao-doc-nham-loi-20260903T231351Z
sha: d1331546558e3ba13f3e77ef557f1393a44cffa9 · suites: 7 lệnh exit 0
