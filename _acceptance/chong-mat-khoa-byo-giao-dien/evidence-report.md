---
schema_version: 2
feature_slug: chong-mat-khoa-byo-giao-dien
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 4d8dd32cf734bcc668e1d465850d97f88be737bb
human_signoff: Phan Le Manh 2026-09-02
---

# Evidence Report: chong-mat-khoa-byo-giao-dien

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-9 | test | PASS |
| E13 | AC-10 | test | PASS |
| E2 | AC-10 | test | PASS |
| E3 | AC-10 | test | PASS |
| E4 | AC-11 | test | PASS |
| E5 | AC-11 | test | PASS |
| E6 | AC-12 | test | PASS |
| E7 | AC-12 | test | PASS |
| E11 | AC-12 | script | PASS |
| E14 | AC-12 | script | PASS |
| E8 | AC-13 | test | PASS |
| E12 | AC-13 | test | PASS |
| E9 | AC-14 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-chong-mat-khoa-byo-giao-dien-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_resolve_config
  verified_at: 2026-09-02T16:43:28Z
  output: |
    Tests  5 passed (5)
    Start at  16:43:28
    Duration  262ms (transform 130ms, setup 0ms, import 41ms, tests 129ms, environment 0ms)

- eval: E13
  run_id: minted-chong-mat-khoa-byo-giao-dien-E13-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_env_client
  verified_at: 2026-09-02T16:43:29Z
  output: |
    Tests  14 passed (14)
    Start at  16:43:29
    Duration  169ms (transform 61ms, setup 0ms, import 71ms, tests 15ms, environment 0ms)

- eval: E2
  run_id: minted-chong-mat-khoa-byo-giao-dien-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_settings_ui
  verified_at: 2026-09-02T16:43:32Z
  output: |
    Tests  6 passed (6)
    Start at  16:43:32
    Duration  1.25s (transform 146ms, setup 0ms, import 507ms, tests 199ms, environment 452ms)

- eval: E3
  run_id: minted-chong-mat-khoa-byo-giao-dien-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_settings_wire
  verified_at: 2026-09-02T16:43:30Z
  output: |
    Tests  6 passed (6)
    Start at  16:43:30
    Duration  1.63s (transform 138ms, setup 0ms, import 433ms, tests 274ms, environment 818ms)

- eval: E4
  run_id: minted-chong-mat-khoa-byo-giao-dien-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_replace_ui
  verified_at: 2026-09-02T16:43:30Z
  output: |
    Test Files  1 passed (1)
    Tests  4 passed (4)
    Start at  16:43:30
    Duration  1.57s (transform 130ms, setup 0ms, import 417ms, tests 280ms, environment 711ms)

- eval: E5
  run_id: minted-chong-mat-khoa-byo-giao-dien-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_replace_wire
  verified_at: 2026-09-02T16:43:31Z
  output: |
    Tests  4 passed (4)
    Start at  16:43:31
    Duration  1.61s (transform 222ms, setup 0ms, import 535ms, tests 382ms, environment 569ms)

- eval: E6
  run_id: minted-chong-mat-khoa-byo-giao-dien-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_panels_ui
  verified_at: 2026-09-02T16:43:32Z
  output: |
    Tests  12 passed (12)
    Start at  16:43:32
    Duration  1.36s (transform 306ms, setup 0ms, import 706ms, tests 120ms, environment 441ms)

- eval: E7
  run_id: minted-chong-mat-khoa-byo-giao-dien-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_panels_wire
  verified_at: 2026-09-02T16:43:31Z
  output: |
    Tests  13 passed (13)
    Start at  16:43:31
    Duration  2.03s (transform 800ms, setup 0ms, import 1.36s, tests 114ms, environment 476ms)

- eval: E11
  run_id: minted-chong-mat-khoa-byo-giao-dien-E11-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kkt_gd_one_reader
  verified_at: 2026-09-02T16:43:33Z
  output: |
    OK: the key endpoint has exactly one non-test caller (src/lib/settings/env-client.ts)

- eval: E14
  run_id: minted-chong-mat-khoa-byo-giao-dien-E14-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kkt_gd_one_reader_teeth
  verified_at: 2026-09-02T16:43:34Z
  output: |
    ok   case 'a prose mention does NOT trip the guard' exited 0
    ok   case 'an emptied reader is rejected' exited 2
    OK: guard bites on both perturbations and is green on the real tree

- eval: E8
  run_id: minted-chong-mat-khoa-byo-giao-dien-E8-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_locale_parity
  verified_at: 2026-09-02T16:43:28Z
  output: |
    Tests  10 passed (10)
    Start at  16:43:28
    Duration  226ms (transform 110ms, setup 0ms, import 135ms, tests 3ms, environment 0ms)

- eval: E12
  run_id: minted-chong-mat-khoa-byo-giao-dien-E12-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_i18n_render
  verified_at: 2026-09-02T16:43:31Z
  output: |
    Tests  4 passed (4)
    Start at  16:43:31
    Duration  1.40s (transform 180ms, setup 0ms, import 460ms, tests 199ms, environment 619ms)

- eval: E9
  run_id: minted-chong-mat-khoa-byo-giao-dien-E9-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kkt_gd_a11y_proto
  verified_at: 2026-09-02T16:43:35Z
  output: |
    "verdict": "PASS"
    6/6 pages scanned AND 6/6 rendered the state AND the theme they were asked for

### Lệnh suite (hồi quy)

- cmd: bash scripts/acceptance/preflight-verify-env.sh
  run_id: minted-chong-mat-khoa-byo-giao-dien-SUITE-bash_scripts_acceptance_preflight_verify-r3
  exit_code: 0
  verified_at: 2026-09-02T16:43:36Z

- cmd: pnpm build && pnpm typecheck
  run_id: minted-chong-mat-khoa-byo-giao-dien-SUITE-build_typecheck-r3
  exit_code: 0
  verified_at: 2026-09-02T16:43:40Z

- cmd: pnpm lint:check
  run_id: minted-chong-mat-khoa-byo-giao-dien-SUITE-lint_check-r3
  exit_code: 0
  verified_at: 2026-09-02T16:43:42Z

- cmd: pnpm test
  run_id: minted-chong-mat-khoa-byo-giao-dien-SUITE-test-r3
  exit_code: 0
  verified_at: 2026-09-02T16:43:44Z

- cmd: cd sdk && . ../scripts/lib/sdk-version.sh && pin=$(reader_pin) && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions --with \"${pin:?no vietnormalizer pin derived from sdk/pyproject.toml}\" python -m pytest -q
  run_id: minted-chong-mat-khoa-byo-giao-dien-SUITE-scripts_lib_sdk_version_sh_pin_reader_pi-r3
  exit_code: 0
  verified_at: 2026-09-02T16:43:58Z

- cmd: pnpm verify:plugins
  run_id: minted-chong-mat-khoa-byo-giao-dien-SUITE-verify_plugins-r3
  exit_code: 0
  verified_at: 2026-09-02T16:44:00Z

- cmd: pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json
  run_id: minted-chong-mat-khoa-byo-giao-dien-SUITE-gen_abi-r3
  exit_code: 0
  verified_at: 2026-09-02T16:44:02Z

## Known limits

1. **Thước đo yếu hơn chữ nó tự nhận — ba mục, đều TRONG hợp đồng.** (a) Năm hình dạng
   lỗi đọc bị thu về MỘT BIT ở tầng khẳng định, nên quan hệ (hình dạng → lý do hiển thị)
   không được đo — một bản vá trả cùng một lý do cho cả năm vẫn xanh. (b) Nửa sau của
   AC-13 («không khoá nào để nguyên tiếng Anh») đo bằng sự CÓ MẶT của khoá thay vì quan
   hệ giữa chuỗi hiển thị và tệp thông điệp. (c) Một nhánh thoát sớm trong
   `config.server.test.ts` nuốt trọn assertion của ca «names what is missing»: trả về sai
   `kind` thì ca `return` sớm và vitest báo PASS với 0 khẳng định chạy. Verdict PASS đứng,
   nhưng nó đứng trên ba ô yếu hơn mô tả của chúng.

2. **`pluginEnv` bị cast mù trong khi `env` được kiểm dương, và `fetchEnv` mất `try/catch`**
   (Ngoài-4, Ngoài-9). `readEnvForBrowser` khẳng định dương cho `env` rồi
   `(body as {pluginEnv?: …}).pluginEnv ?? []` không kiểm hình dạng; `settings-dialog.tsx`
   không còn bọc `fetchEnv`. Một thân trả về có `pluginEnv` không phải mảng sẽ ném TRONG
   `applyEnv`, SAU khi `setBlocked(null)` đã chạy — màn hiện form bình thường với ô rỗng và
   nút Lưu bấm được, tức mở LẠI chính đường form-rỗng-ghi-đè mà hồ sơ này đóng.

3. **Lượt ghi THÀNH CÔNG mà thân trả về không parse được thì báo là «chưa đổi gì»**
   (Ngoài-8). Đối xứng với Ngoài-3/7 và cùng gốc: `put()` không phân biệt được «2xx nhưng
   thân lạ» với «không tới nơi».

4. **E12 tuyên quét LỚP «copy đến từ catalogue» nhưng chỉ có hai điểm-case** (Ngoài-10).
   Nó ghim quan hệ cho hai khoá của tấm chặn, không cho mọi nhãn — nhãn thứ ba ghi cứng
   vẫn lọt.

5. **Node media-library ở trạng thái `STORE_UNREADABLE` không có lối đi tiếp** (Ngoài-5).
   `search()` chỉ định tuyến `MISSING_CONFIG` sang panel cấu hình; mã mới rơi vào nhánh
   chung, render một câu kết thúc bằng «mở Cài đặt» mà không có nút mở Cài đặt. Cùng một
   điều kiện, ba bề mặt, hai kiểu lối thoát.

6. **`Workspace.nodes.addMediaLibrary.readFailed` nay là khoá chết ở cả năm locale**
   (Ngoài-6). `locale-parity.test.ts` chỉ đo parity nên một khoá không dùng không bao giờ
   đỏ được — nó sẽ được dịch mãi.

7. **Cuộc đua `build/**` ↔ typecheck: đã đóng, nhưng cách đóng nằm ngoài phạm vi Cổng 1.**
   Hai sửa hạ tầng repo-wide (`tsconfig.json` exclude, và gộp `executors.test.build_typecheck`
   trong `feature_loop.suite_keys`) hạ cánh trong hồ sơ T2 này. Chi tiết ở `contract.md`
   §Known limits và `decisions.jsonl`.

8. **Bộ tổng hợp của kit không ghi được bằng chứng ở cả ba vòng** (`runLogWriteFailed: true`),
   và ở vòng 3 nó để mục «Ngoài hợp đồng» RỖNG dù triage giữ 10 mục — mà `pre-merge-check.sh`
   đọc thân rỗng là lời khai «không có gì», nên vòng này suýt đi tiếp KHÔNG mời ký. Báo cáo,
   run-log và bảng Ngoài đều do phiên điều phối ghi tay nguyên văn. Cổng KHÔNG fail-open ở
   chỗ này (nó phân biệt vắng ≠ rỗng có chủ đích); chỗ hỏng là bộ tổng hợp.

9. **`t1-escape` của cổng thì fail-open THẬT, và đó là lớp khác.** Nó chỉ báo vi phạm khi
   `gate_touched -eq 0`, mà mọi PR chạm `_acceptance/` đều làm nó tắt — kể cả PR này. Đo
   bởi phiên `amazing-kapitsa-45dd7a`: một commit CHỈ sửa `_acceptance/config.yaml` biến
   cổng từ «merge blocked» thành «clean».

## Ngoài hợp đồng — owner đã quyết 02/09

Chi tiết ở `review-findings.md`. Owner định đoạt từng mục ở Cổng 2.

| # | Phát hiện | Owner chọn |
|---|---|---|
| Ngoài-1 | Destructive store wipe is authorized by a client-side read failure, and the server never re-checks the store is really unreadable (high) |  **mở hợp đồng mới** → `_acceptance/khong-noi-sai-ve-kho-khoa/` |
| Ngoài-2 | Settings screen dropped the shared API client, losing the 401 sign-in seam and the request timeout (high) |  **mở hợp đồng mới** → `_acceptance/khong-noi-sai-ve-kho-khoa/` |
| Ngoài-3 | A failed write is reported to the user as "key saved" (high) |  **mở hợp đồng mới** → `_acceptance/khong-noi-sai-ve-kho-khoa/` |
| Ngoài-4 | `pluginEnv` is blind-cast while `env` is positively validated, and the catch that used to absorb the mismatch is gone (medium) |  **ghi Known limits** (mục 2 trên) |
| Ngoài-5 | STORE_UNREADABLE in the media-library node offers no way forward, unlike the other two surfaces (low) |  **ghi Known limits** (mục 5 trên) |
| Ngoài-6 | `Workspace.nodes.addMediaLibrary.readFailed` is now dead in all five locales (low) |  **ghi Known limits** (mục 6 trên) |
| Ngoài-7 | A failed key WRITE is shown to the user as "key saved" (high) |  **mở hợp đồng mới** → `_acceptance/khong-noi-sai-ve-kho-khoa/` |
| Ngoài-8 | A successful write whose response body will not parse is reported as "nothing has been changed" (medium) |  **ghi Known limits** (mục 3 trên) |
| Ngoài-9 | `pluginEnv` is cast unchecked and `fetchEnv` lost its catch — a throw re-opens the empty-saveable-form bug (medium) |  **ghi Known limits** (mục 2 trên) |
| Ngoài-10 | Hình dạng #5 — E12 tuyên quét LỚP "copy đến từ catalogue" nhưng chỉ có 2 điểm-case trên 22 khoá mới (medium) |  **ghi Known limits** (mục 4 trên) |

## Analyst

carried từ round trước — baseline không đo lại round này

Không có eval nào được đánh dấu green-on-both round này: `evals.yaml` không đổi từ lần đo baseline cuối nên mọi khối eval ở trên ghi `baseline: n-a` — con số này không do lại, không phải kết quả "khớp cả hai phía".

## Variance

none — round này không có eval nào mang field `runs` > 1 (không có eval ngẫu nhiên).

## Iterations

Round 1: 14/14 eval PASS (E1, E13, E2, E3, E4, E5, E6, E7, E11, E14, E8, E12, E9, E10) nhưng `pnpm typecheck` — lệnh suite bắt buộc không gắn eval — exit 2 (TS6053: hai file thiếu dưới `build/kkt-gate/types/**` bị tsconfig include pattern quét trúng). Verdict REJECT. Trả về implementation để dọn build tạm / loại trừ khỏi tsconfig include trước khi verify lại.
Round 2: 13/13 eval đo được ở round này PASS (E10 không có trong dữ liệu round này) nhưng `pnpm typecheck` vẫn exit 2 — lần này TS6053 báo bốn file thiếu dưới `.next/types/**` của worktree (`app/workspace/page.ts`, `cache-life.d.ts`, `routes.d.ts`, `validator.ts`), một nguyên nhân khác round 1 (build output/`.next` chưa sinh đủ hoặc bị dọn giữa chừng, không phải cùng lỗi include pattern của round 1). Verdict REJECT. Trả về implementation: đảm bảo `.next` được build/generate types đầy đủ trước khi `tsc --noEmit` chạy trong cùng worktree, rồi verify lại.
Round 3: 13/13 eval PASS, và `pnpm build && pnpm typecheck` cùng toàn bộ lệnh suite khác đều exit 0 — TS6053 đã được sửa. Verdict PASS.
