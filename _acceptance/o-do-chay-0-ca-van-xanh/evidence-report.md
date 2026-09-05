---
schema_version: 2
feature_slug: o-do-chay-0-ca-van-xanh
verdict: PASS
failed_evals: []
reason:
verified_by: machine-lane (owner chốt bỏ lớp hội đồng, 31/08)
enforcement_mode: strict
bypass_used: false
verified_commit: 96ee9b89c428b5ce0d64c8f49ba29eb7bd65727e
human_signoff: Phan Le Manh 2026-09-01
---

# Evidence Report: o-do-chay-0-ca-van-xanh

**17/17 ô đo PASS · 0 UNCERTAIN · 0 bypass.** Làn máy thuần, run_id `odo-machine-20260831T234133Z`.

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
| E11 | AC-10 | script | PASS |
| E12 | AC-11 | script | PASS |
| E13 | AC-11 | script | PASS |
| E14 | AC-12 | script | PASS |
| E15 | AC-13 | script | PASS |
| E16 | AC-2 | script | PASS |
| E17 | AC-12 | script | PASS |

## Baseline: gói này là hàng rào, không phải bản sửa

Đo trước khi thiết kế, **cả hai nhóm**:

| Khuôn lệnh | Số ô | Ô chạy ≥ 1 ca |
|---|---:|---:|
| gọi thẳng `vitest run <file> -t` | 23 | **23** |
| qua bộ bọc `run-one-test.sh` | 10 | **10** |
| **tổng** | **33** | **33** |

Bộ kiểm trên cây thật in đúng ba con số ấy: `đã kiểm 33 ô đo lọc theo tên — 23 gọi
thẳng, 10 qua bộ bọc`. Ghim SỐ chứ không chỉ đòi "lớn hơn 0", vì trạng thái nguy hiểm
hơn ca 0 ô là **ca đếm THIẾU** — nó in một con số trông hợp lý rồi thoát 0.

## Ma trận regex — đo bằng chính vitest, bốn ô

Chuẩn đối chiếu là **hành vi thật của `vitest -t`**, không phải lời hứa trong văn xuôi:

| bộ lọc | vitest chạy | bộ kiểm phải | kết quả |
|---|---:|---|---|
| `answers 503 .* code` | 1 ca | XANH | ✓ |
| `answers 503 (code` | 0 ca | ĐỎ | ✓ |
| `unreadable` | 1 ca | XANH | ✓ |
| `khong-ton-tai-o-dau` | 0 ca | ĐỎ | ✓ |

Dòng đầu là dòng quan trọng nhất: nó khớp theo **regex** mà **không** khớp theo chuỗi
con. Cài bằng so-chuỗi-con thì bộ kiểm kết luận một ô đo THẬT là rỗng rồi làm CI đỏ
trên mọi PR — hướng thất bại bào mòn niềm tin vào một guard nhanh nhất.

## Evidence

- eval: E1
  run_id: odo-machine-20260831T234133Z-E1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.evalfilter_teeth_no_match
  verified_at: 2026-08-31T23:41:33Z
  output: |
    → răng: no-match
    CASE no-match: PASS
    cây chung sạch: _acceptance/config.yaml và scripts/ci/check-gate-guards-job.sh không đổi một byte
    ✅ răng: 1/1 case — mỗi case một mã thoát riêng

- eval: E2
  run_id: odo-machine-20260831T234133Z-E2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.evalfilter_check
  verified_at: 2026-08-31T23:41:33Z
  output: |
       đã kiểm 33 ô đo lọc theo tên — 23 gọi thẳng, 10 qua bộ bọc
    ✅ mọi ô đo đều khớp ít nhất một ca thử.

- eval: E3
  run_id: odo-machine-20260831T234133Z-E3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.evalfilter_teeth_empty
  verified_at: 2026-08-31T23:41:33Z
  output: |
    → răng: zero-executors
    CASE zero-executors: PASS
    cây chung sạch: _acceptance/config.yaml và scripts/ci/check-gate-guards-job.sh không đổi một byte
    ✅ răng: 1/1 case — mỗi case một mã thoát riêng

- eval: E4
  run_id: odo-machine-20260831T234133Z-E4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.evalfilter_teeth_unparsable
  verified_at: 2026-08-31T23:41:33Z
  output: |
    → răng: unparsable
    CASE unparsable: PASS
    cây chung sạch: _acceptance/config.yaml và scripts/ci/check-gate-guards-job.sh không đổi một byte
    ✅ răng: 1/1 case — mỗi case một mã thoát riêng

- eval: E5
  run_id: odo-machine-20260831T234133Z-E5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.evalfilter_teeth_list_broken
  verified_at: 2026-08-31T23:41:33Z
  output: |
    → răng: list-broken
    CASE list-broken: PASS
    cây chung sạch: _acceptance/config.yaml và scripts/ci/check-gate-guards-job.sh không đổi một byte
    ✅ răng: 1/1 case — mỗi case một mã thoát riêng

- eval: E6
  run_id: odo-machine-20260831T234133Z-E6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.evalfilter_both_shapes
  verified_at: 2026-08-31T23:41:33Z
  output: |
      direct     1 ca  test.unit_venv_lite_fallback_kept
      direct     1 ca  test.unit_venv_per_plugin
      direct     6 ca  test.unit_venv_unsafe_id
       đã kiểm 33 ô đo lọc theo tên — 23 gọi thẳng, 10 qua bộ bọc
    ✅ mọi ô đo đều khớp ít nhất một ca thử.

- eval: E7
  run_id: odo-machine-20260831T234133Z-E7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.evalfilter_teeth_regex
  verified_at: 2026-08-31T23:41:33Z
  output: |
        lọc unreadable               vitest=1 ca → bộ kiểm phải XANH (rc=0)
        lọc khong-ton-tai-o-dau      vitest=0 ca → bộ kiểm phải ĐỎ (rc=1)
    CASE regex-semantics: PASS
    cây chung sạch: _acceptance/config.yaml và scripts/ci/check-gate-guards-job.sh không đổi một byte
    ✅ răng: 1/1 case — mỗi case một mã thoát riêng

- eval: E8
  run_id: odo-machine-20260831T234133Z-E8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gate_guards_job_teeth
  verified_at: 2026-08-31T23:41:33Z
  output: |
    lệnh dưới phép thử (rút từ .github/workflows/ci.yml): bash scripts/roadmap/check-roadmap-fresh.sh
    lệnh dưới phép thử (rút từ .github/workflows/ci.yml): node scripts/ci/check-product-map.mjs
    lệnh dưới phép thử (rút từ .github/workflows/ci.yml): node scripts/ci/check-eval-filters.mjs
    OK: 3 lệnh (rút từ .github/workflows/ci.yml) xanh trên cây lành và đỏ trên cây đã phá; cờ rác bị từ chối

- eval: E9
  run_id: odo-machine-20260831T234133Z-E9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gate_guards_job_reachable
  verified_at: 2026-08-31T23:41:33Z
  output: |
    OK: trigger pull_request không lọc đường dẫn; step và job không mang if: hay needs:

- eval: E10
  run_id: odo-machine-20260831T234133Z-E10
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gate_guards_job_shape
  verified_at: 2026-08-31T23:41:33Z
  output: |
    OK: cả hai guard nằm trong job acceptance-gate; fetch-depth 0, Node 24, hai trigger còn nguyên
    OK: không có continue-on-error / || true / set +e trong job acceptance-gate

- eval: E11
  run_id: odo-machine-20260831T234133Z-E11
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.evalfilter_teeth_needle
  verified_at: 2026-08-31T23:41:33Z
  output: |
    → răng: needle-missing
    CASE needle-missing: PASS
    cây chung sạch: _acceptance/config.yaml và scripts/ci/check-gate-guards-job.sh không đổi một byte
    ✅ răng: 1/1 case — mỗi case một mã thoát riêng

- eval: E12
  run_id: odo-machine-20260831T234133Z-E12
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gate_guards_job_no_new_job
  verified_at: 2026-08-31T23:41:33Z
  output: |
    OK: đúng 6 job, đúng tập tên đã biết
    OK: năm job còn lại deep-equal với merge-base 2dda3cc2

- eval: E13
  run_id: odo-machine-20260831T234133Z-E13
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.action_pins
  verified_at: 2026-08-31T23:41:33Z
  output: |
    ok actions/checkout: 8 site(s), all >= v7
    ok docker/login-action: 1 site(s), all >= v4
    action pins: at or above the contracted floor at every site

- eval: E14
  run_id: odo-machine-20260831T234133Z-E14
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.evalfilter_teeth_all
  verified_at: 2026-08-31T23:41:33Z
  output: |
    CASE regex-semantics: PASS
    CASE unknown-wrapper: PASS
    CASE needle-missing: PASS
    cây chung sạch: _acceptance/config.yaml và scripts/ci/check-gate-guards-job.sh không đổi một byte
    ✅ răng: 9/9 case — mỗi case một mã thoát riêng

- eval: E15
  run_id: odo-machine-20260831T234133Z-E15
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.evalfilter_teeth_unknown_wrapper
  verified_at: 2026-08-31T23:41:33Z
  output: |
    → răng: unknown-wrapper
    CASE unknown-wrapper: PASS
    cây chung sạch: _acceptance/config.yaml và scripts/ci/check-gate-guards-job.sh không đổi một byte
    ✅ răng: 1/1 case — mỗi case một mã thoát riêng

- eval: E16
  run_id: odo-machine-20260831T234133Z-E16
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.evalfilter_teeth_undercount
  verified_at: 2026-08-31T23:41:33Z
  output: |
    → răng: undercount
    CASE undercount: PASS
    cây chung sạch: _acceptance/config.yaml và scripts/ci/check-gate-guards-job.sh không đổi một byte
    ✅ răng: 1/1 case — mỗi case một mã thoát riêng

- eval: E17
  run_id: odo-machine-20260831T234133Z-E17
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.evalfilter_teeth_clean
  verified_at: 2026-08-31T23:41:33Z
  output: |
    → răng: clean
    CASE clean: PASS
    cây chung sạch: _acceptance/config.yaml và scripts/ci/check-gate-guards-job.sh không đổi một byte
    ✅ răng: 1/1 case — mỗi case một mã thoát riêng

## Chiều đỏ — bộ răng biết nói FAIL

Chín ca, mỗi ca một mã thoát riêng, danh sách tên **ghim trong hợp đồng** chứ không lấy
từ `--list` của chính script (hỏi công cụ xem nó có bao nhiêu ca là phép đo hằng đúng).

Đã chứng minh bộ răng biết nói FAIL: thay bản vá của ca `no-match` bằng một no-op thì
nó báo **FAIL** đúng như phải thế, rồi khôi phục lại **PASS**.

Cách ly được **chứng minh, không hứa**: bản sao chỉ chứa hai thứ các ca động vào; tên ca
lấy từ cây thật qua `--vitest-root`; kết thúc so **hash trước/sau** của hai file phạm vi.

## Ngoài hợp đồng — owner đã quyết 01/09

Chi tiết ở `review-findings.md`.

| # | Phát hiện | Owner chọn |
|---|---|---|
| Ngoài-1 | Bộ đọc cấu hình bỏ sót giá trị dạng khối YAML mà không báo gì | **ghi Known limits** (mục 6 dưới) |

## Known limits

1. **Không có lớp hội đồng.** Owner chốt làn máy thuần từ gói trước và giữ cho gói này.
   Mọi khẳng định đứng trên mã thoát của 17 lệnh cộng chín ca răng.

2. **Ô đo vẫn báo đạt trong một vòng nghiệm thu chạy trên mã chưa merge.** Đánh đổi đã
   khai của đường được chọn: chốt CI chặn **merge**, nhưng nó không làm chính ô đo đỏ
   trong một vòng verify. Đường bọc-từng-ô làm được điều đó nhưng bị loại ở Cổng 1 —
   nó đổi 23 dòng cấu hình ở vùng nhiều hồ sơ đã ký, và ô viết sau này vẫn có thể quên
   dùng bọc, tức hàng rào tự có lỗ.

3. **`pnpm install` thêm vào job `Acceptance Gate`.** Job từ ~19s lên khoảng một phút.
   Không đổi thời gian tổng của workflow (`Build` vẫn 1m17s chạy song song), nhưng là
   chi phí thật trả trên mọi PR, và nó tồn tại **chỉ vì** chỗ đặt rẻ hơn — job
   `unit-tests`, nơi đã sẵn `node_modules` — sẽ làm đỏ một guard mà chính phiên này viết.

4. **Chế độ `teeth` chạy lệnh thứ ba KHÔNG byte-identical với CI.** Cây phá không có mã
   nguồn (symlink `src` phá module resolution của vitest, hard-link chỉ đẩy lỗi sang
   `config/`), nên lệnh rút từ `ci.yml` được **thêm `--vitest-root`** trỏ về cây thật
   trong khi vẫn đọc **cấu hình đã phá**. Không có nó, lệnh đỏ vì *thiếu công cụ* chứ
   không vì *bộ lọc hỏng* — đã chứng minh bằng cách gỡ phép phá ra: mode vẫn xanh. Sau
   khi sửa, gỡ phép phá thì mode **đỏ** đúng như phải thế.

5. **`vitest list` cần `node_modules`.** Bộ kiểm không chạy được ở nơi không có phụ
   thuộc — đó là hành vi đúng (nó báo đỏ nêu nguyên nhân, không kết luận "không có gì để
   kiểm"), nhưng nghĩa là nó **không** dùng được như một guard nhẹ ở môi trường tối giản.

6. **Bộ đọc cấu hình là bộ đọc dòng, không phải bộ phân tích YAML.** Kho không có `yaml`
   lẫn `js-yaml`. Đo: không executor nào dùng giá trị dạng khối (`|`/`>`), nên ba biến
   thể trích dẫn là đủ, và ca `undercount` chứng minh cả ba đều đếm được. Một ngày nào
   đó ai đó viết một giá trị dạng khối thì bộ đọc sẽ bỏ sót nó **im lặng** — đây là chỗ
   hở duy nhất còn lại trong khâu gom, và nó chưa có phép đo.

7. **Tiêu chí gom dựa trên hai dấu hiệu đo được, không phải một danh sách ngoại lệ.**
   Điều đó tốt hơn danh sách viết tay, nhưng nó vẫn là một heuristic: một bộ bọc tương
   lai chuyển tiếp bộ lọc qua biến môi trường thay vì đối số sẽ không khớp dấu hiệu nào
   và bị bỏ qua im lặng. AC-13 đóng cửa "bộ bọc lạ được gọi kèm chuỗi trần"; nó không
   đóng được mọi hình dạng chưa ai nghĩ ra.

### Re-pin — 05/09/2026, hợp nhất PR #97 vào `main`

run_id: repin-merge-20260905T101500Z
sha: 96ee9b89c428b5ce0d64c8f49ba29eb7bd65727e · suites: 8 lệnh exit 0

Commit merge `96ee9b8` kéo mọi hồ sơ đã ký ra khỏi mốc của chúng theo đường dẫn. Một lượt làn
máy chung cho cả đợt, 8 ô đo bị chạm, cả 8 chạy lại và exit 0.

Đợt này KHÔNG re-pin SÁU hồ sơ — `add-media-library`, `byo-key-onboarding`, `chong-doc-sai-em-ru`,
`cong-tu-canh-minh`, `gate-scope-anchors`, `normalize-text-vi` — vì ô đo bị chạm của chúng ĐỎ, hoặc
KHÔNG KẾT LUẬN ĐƯỢC (cửa sổ diff rỗng khi nhánh đứng ngay tại `main`; hoặc ô `ui-check` không chạy
được ngoài luồng verify). Dời mốc khi ấy là khai rằng bằng chứng còn đúng trong khi chưa chứng
minh được.
