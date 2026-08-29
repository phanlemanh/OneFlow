---
schema_version: 2
feature_slug: chong-doc-sai-em-ru
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context machine lane (không hội đồng — xem §Vì sao LANE thay cho VÒNG)
enforcement_mode: strict
bypass_used: false
verified_commit: 665ff72bf34a07fc6156be70360d7dcf5dfc0592
human_signoff: Phan Le Manh 2026-08-29
---

# Evidence Report: chống đọc sai êm ru

| Eval | Tiêu chí | Executor | Verdict |
|---|---|---|---|
| E1 | AC-8 | script | PASS |
| E2 | AC-11 | test | PASS |
| E3 | AC-5 | test | PASS |
| E4 | AC-1 | test | PASS |
| E5 | AC-3 | test | PASS |
| E6 | AC-9 | test | PASS |
| E7 | AC-10 | test | PASS |
| E8 | AC-4 | test | PASS |
| E9 | AC-2 | test | PASS |
| E10 | AC-6 | test | PASS |
| E14 | AC-12 | test | PASS |
| E16 | AC-12 | test | PASS |

**E12, E13 — HOÃN cùng AC-7** sang hạng mục lộ trình 1.4 (bước dò T0, 2026-08-27). Không có
lệnh trong `evals.yaml`; ô này **cố ý trống**, lý do ở `contract.md` mục AC-7.

## Evidence

- eval: E1
  run_id: minted-chong-doc-sai-em-ru-E1-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.measuring_instruments_refuse
  verified_at: 2026-08-28T23:47:36Z
  output: |
      (checked 17 executor keys whose tests need the engine; each must carry the ${pin:?…} guard)
    OK: capture refuses a wrong locale and clears the stale frame · shared executor reports a legible pin error

- eval: E2
  run_id: minted-chong-doc-sai-em-ru-E2-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_ambiguous
  verified_at: 2026-08-28T23:47:36Z
  output: |
    ....                                                                     [100%]
    4 passed, 40 deselected in 0.09s

- eval: E3
  run_id: minted-chong-doc-sai-em-ru-E3-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_dictionary_matrix
  verified_at: 2026-08-28T23:47:43Z
  output: |
    ...                                                                      [100%]
    3 passed, 41 deselected in 0.04s

- eval: E4
  run_id: minted-chong-doc-sai-em-ru-E4-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_typographic_dash
  verified_at: 2026-08-28T23:47:43Z
  output: |
    ...                                                                      [100%]
    3 passed, 41 deselected in 0.04s

- eval: E5
  run_id: minted-chong-doc-sai-em-ru-E5-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_range_shapes
  verified_at: 2026-08-28T23:47:43Z
  output: |
    ...                                                                      [100%]
    3 passed, 41 deselected in 0.04s

- eval: E6
  run_id: minted-chong-doc-sai-em-ru-E6-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_day_word
  verified_at: 2026-08-28T23:47:43Z
  output: |
    ..                                                                       [100%]
    2 passed, 42 deselected in 0.04s

- eval: E7
  run_id: minted-chong-doc-sai-em-ru-E7-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_slash
  verified_at: 2026-08-28T23:47:44Z
  output: |
    ...                                                                      [100%]
    3 passed, 41 deselected in 0.04s

- eval: E8
  run_id: minted-chong-doc-sai-em-ru-E8-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_brand
  verified_at: 2026-08-28T23:47:44Z
  output: |
    ...                                                                      [100%]
    3 passed, 41 deselected in 0.08s

- eval: E9
  run_id: minted-chong-doc-sai-em-ru-E9-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_url
  verified_at: 2026-08-28T23:47:50Z
  output: |
    ..                                                                       [100%]
    2 passed, 42 deselected in 0.09s

- eval: E10
  run_id: minted-chong-doc-sai-em-ru-E10-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_error_codes
  verified_at: 2026-08-28T23:47:50Z
  output: |
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E14
  run_id: minted-chong-doc-sai-em-ru-E14-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_tts_order_violation
  verified_at: 2026-08-28T23:47:53Z
  output: |
       Start at  06:47:53
       Duration  328ms (transform 90ms, setup 0ms, import 254ms, tests 4ms, environment 0ms)

- eval: E16
  run_id: minted-chong-doc-sai-em-ru-E16-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_tts_warning_call_site
  verified_at: 2026-08-28T23:47:56Z
  output: |
       Start at  06:47:55
       Duration  688ms (transform 80ms, setup 0ms, import 187ms, tests 10ms, environment 429ms)

## Lệnh suite

Bảy khoá trong `feature_loop.suite_keys`, tất cả exit 0.

- cmd: config:executors.script.preflight_env — exit_code: 0 — verified_at: 2026-08-28T23:48:08Z
  output: |
    [PASS] pnpm-foreign-tree    sổ sách không nhắc worktree lạ (agk-baseline)
    [PASS] pnpm-live-links      76 liên kết node_modules cấp 1 đều giải được
    VERDICT: GREEN — không bẫy hạ tầng nào đang hoạt động.
- cmd: config:executors.test.build_typecheck — exit_code: 0 — verified_at: 2026-08-28T23:52:21Z
- cmd: config:executors.test.lint — exit_code: 0 — verified_at: 2026-08-28T23:52:32Z
  output: |
    Checked 474 files in 114ms. No fixes applied.
- cmd: config:executors.test.unit — exit_code: 0 — verified_at: 2026-08-28T23:52:44Z
  output: |
       Duration  11.03s (transform 2.01s, setup 0ms, import 4.43s, tests 12.55s, environment 1.44s)
- cmd: config:executors.test.sdk_pytest — exit_code: 0 — verified_at: 2026-08-28T23:54:21Z
  output: |
    292 passed in 90.80s (0:01:30)
- cmd: config:executors.script.verify_plugins — exit_code: 0 — verified_at: 2026-08-28T23:54:23Z
  output: |
    [verify-plugins-scan] OK
- cmd: config:executors.script.gen_abi_clean — exit_code: 0 — verified_at: 2026-08-28T23:54:24Z

Số đo tại mốc ký: **292 pytest · 537 vitest** · lint · typecheck · build · verify:plugins ·
gen:abi không trôi · roadmap 24/24 · preflight GREEN.

*Ghi chú về mốc thời gian: máy chạy ở UTC+0700; các mốc trên là **UTC**, đọc từ `stat` trên
file stdout đã bắt của chính lượt chạy. Ba lệnh tự in giờ (`Start at` của vitest) dùng làm đối
chứng chéo và hai phép đo khớp nhau. Cây lúc chạy chỉ khác HEAD ở hai dòng `decisions.jsonl`
ghi trước khi gọi lane — lane tự phát hiện và tự chứng minh chúng đến từ ngoài nó.*

## Vì sao LANE thay cho VÒNG

*Owner chốt 2026-08-28 — `decisions.jsonl` `d-20260828T131030Z-4429`.*

Hồ sơ đã qua **sáu vòng** verify đầy đủ. Nhìn theo lớp thì hai lớp hội tụ ngược nhau:

| Lớp | Vòng 4 | Vòng 5 | Vòng 6 |
|---|---|---|---|
| Phép đo — `failedEvals` | rỗng | rỗng | rỗng |
| Lệnh suite — `failedCommands` | rỗng | rỗng | rỗng |
| Hội đồng review | 5 phát hiện | 5 | 5 |

Lớp phép đo **đã hội tụ ba vòng liên tiếp**. Lớp hội đồng **không hội tụ theo thiết kế** — 38
agent đối kháng mỗi vòng, được giao việc luôn tìm ra, và tỉ lệ phát hiện không giảm qua sáu
vòng. Để verdict của lớp không-hội-tụ quyết định thay cho lớp đã-hội-tụ là một điều kiện dừng
**không bao giờ thoả**.

Bằng chứng để ký, theo chính kit này, là **exit code từng eval + giới hạn khai rõ + chữ ký
người** — không phải "hội đồng hết ý kiến". Nên lượt chấm cuối là một lane máy thuần: cùng 12
eval, cùng 7 lệnh suite, một phiên tươi, không panels không review. Tiền lệ cùng ngày: lane
re-pin `conformance-l0` chạy đúng kiểu này và cổng chấp nhận.

Đầu ra của sáu vòng hội đồng **không bị vứt** — nó đã thành: sáu giới hạn có tên owner ký sau
khi xem chuỗi đầu ra thật, hai lần thu hẹp phạm vi, và một hợp đồng con cho gốc chung.

## Hai lần thu hẹp đã ký

- **AC-6** — nửa *hiển thị* (câu từ chối theo ngôn ngữ người dùng) **hoãn**, ở lại hạng mục 1.3.
  Hai điều kiện tiên quyết đo được nằm ngoài phạm vi: chưa plugin nào phục vụ slot (bản cũ rút
  khỏi manifest 26/08), và `sdk/tongflow/engine/runner.py` đổi node `success=False` thành chuỗi
  lỗi **trước khi** ghi `node_outputs` — nuốt mất mã máy đọc được. Giữ nửa SDK: mã ổn định, E10.
- **AC-10** — thu về *"một cấu trúc gạch chéo tiền/tỷ-lệ trong chuỗi thì phải từ chối"*.

## Sáu giới hạn có tên

Owner xem **chuỗi đầu ra thật** của từng cái rồi mới ký. Cả sáu ghim bằng phép đo
tự-đỏ-khi-lành — ngày nào một giới hạn lành, phép đo **đỏ** và buộc gỡ nó khỏi hồ sơ.

**Bậc MẤT DỮ LIỆU** *(bản đọc SAI, nói ra với `ok=True`)*

1. `ngày 12/25/2026, tốc độ 100km/h` → **đọc**. Số 25 biến mất, tháng đọc thành 2. Chính chuỗi
   đó không có `100km/h` thì từ chối đúng.

**Bậc TỰ MÂU THUẪN**

2. `Giá 100đ/kg và/hoặc 200đ/lít` → `ok=True`; đọc lại **chính đầu ra** → `ok=False`, `text`
   không đổi. Node chạy trong mọi dây và có thể chạy hai lượt.
3. `Mua iPhone qua vndirect nhé` → từ chối, **nêu tên sai token**: `iPhone` ổn định, thủ phạm là
   `vndirect`.

**Bậc TỪ CHỐI OAN** *(đọc đúng rồi vẫn chặn)*

4. `Giá 1,05-2,5 triệu` → từ chối, nêu `('05-2',)` — một cụm người dùng không hề gõ.

**Bậc SÓT MỘT DẤU** *(bản đọc đúng, một ký tự thô tới giọng đọc)*

5. `Tốc độ 100km/h, lãi 5%/năm` và `Giá 100đ/kg và/hoặc 200đ/lít` → đọc.
6. `Mở /home/user/file.txt` → `mở /hôm/u xơ/phai.txt`; `Truy cập oneflow.vn/gia` →
   `truy cập o nép lô.vn/gia` *(AC-2)*.

Cộng hai giới hạn cũ: khi `ok=False` trường `text` vẫn mang bản đọc sai; lưới thương hiệu đo
**tính ổn định** chứ không đo **bảo toàn** nên `Mã AbCd` → `mã a` với `ok=True` vẫn lọt.

**KHÔNG phải giới hạn:** `Tỉ lệ 50/50` → từ chối là **đúng** chữ của AC-10 (đầu ra còn gạch chéo
thô). Ghi ở đây để lần sau không ai "sửa" nó rồi mở lại lỗ.

## Gốc chung → hợp đồng con

`_NUM_LEFT_OF_SLASH` là một phân loại **từ vựng**. Bốn vòng sửa bốn phạm vi khác nhau của cùng
một luật và **mỗi lần lại lộ một họ ca mới**, vì gốc không đổi. Đóng thật cần **bộ phân loại
token** (tiền · đơn vị · đường dẫn · thành ngữ) — hợp đồng riêng `bo-phan-loai-token`, bản nháp
trên nhánh `draft/bo-phan-loai-token`, **cố ý không nằm trong PR này** (một hồ sơ `status: draft`
đi kèm PR đổi mã thì cổng không chấm được nó — cổng bắt đúng, xem `decisions.jsonl`).

## Đã đổi gì so với lần trình trước

Nhánh đã **merge `main`** (PR #83). Việc đó làm lộ một vi phạm staleness mà trước merge không
thấy: `conformance-l0` khai `sdk/**` trong `paths`, mà nhánh này sửa `sdk/tongflow/text/` và
`sdk/tests/`. Đã re-pin bằng một phiên tươi chạy lại cả 9 lệnh của hồ sơ đó tại `9caa255` —
preflight GREEN, tất cả exit 0, mã gói đó không đổi một byte.

## Re-pin

### Lane chốt — 2026-08-28, lane máy thuần thay cho vòng verify thứ bảy; 12 eval + 7 lệnh suite tại HEAD, preflight GREEN, tất cả exit 0. Lý do dùng lane thay vòng ở §Vì sao LANE thay cho VÒNG
run_id: lane-chong-doc-sai-em-ru-20260828T133500Z
sha: 665ff72bf34a07fc6156be70360d7dcf5dfc0592 · suites: 7 lệnh exit 0
