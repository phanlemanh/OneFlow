---
schema_version: 2
feature_slug: cong-tu-canh-minh
verdict: PASS
failed_evals: []
reason:
verified_by: machine-lane (owner chốt bỏ lớp hội đồng, 31/08)
enforcement_mode: strict
bypass_used: false
verified_commit: 94760ccd44ae4ad456eef73c846f0e5a8b863fb0
human_signoff: Phan Le Manh 2026-08-31
---

# Evidence Report: cong-tu-canh-minh

**16/16 ô đo PASS · 0 UNCERTAIN · 0 bypass.** Làn máy thuần, run_id `ctcm-machine-20260831T090207Z`.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-1 | script | PASS |
| E6 | AC-5 | script | PASS |
| E7 | AC-5 | script | PASS |
| E8 | AC-6 | script | PASS |
| E9 | AC-6 | script | PASS |
| E10 | AC-7 | script | PASS |
| E11 | AC-8 | script | PASS |
| E12 | AC-9 | script | PASS |
| E13 | AC-10 | script | PASS |
| E14 | AC-11 | script | PASS |
| E15 | AC-12 | script | PASS |
| E16 | AC-13 | script | PASS |

## Vì sao làn máy thuần

Cả 16 ô đo đều là `executor: script`: không ô nào cần phán đoán người, ảnh chụp,
hay đọc giao diện. Lớp hội đồng ở đây chỉ đọc lại đúng những mã thoát mà làn máy
vừa sinh, nên nó không thêm tín hiệu — chỉ thêm vòng. Owner chốt làn này 31/08.
Đây là một **giới hạn đã khai**, không phải một phép đo bị bỏ.

## Evidence

- eval: E1
  run_id: ctcm-machine-20260831T090207Z-E1
  exit_code: 0
  baseline: n-a
  verifier: bash scripts/ci/check-product-map-teeth.sh --case missing-slug
  verified_at: 2026-08-31T09:02:07Z
  output: |
    → răng: missing-slug
    CASE missing-slug: PASS
    ✅ răng: 1/1 case — mỗi case một mã thoát riêng

- eval: E2
  run_id: ctcm-machine-20260831T090207Z-E2
  exit_code: 0
  baseline: n-a
  verifier: bash scripts/ci/check-product-map-teeth.sh --case count-mismatch
  verified_at: 2026-08-31T09:02:07Z
  output: |
    → răng: count-mismatch
    CASE count-mismatch: PASS
    ✅ răng: 1/1 case — mỗi case một mã thoát riêng

- eval: E3
  run_id: ctcm-machine-20260831T090207Z-E3
  exit_code: 0
  baseline: n-a
  verifier: bash scripts/ci/check-product-map-teeth.sh --case opportunity-mismatch
  verified_at: 2026-08-31T09:02:07Z
  output: |
    → răng: opportunity-mismatch
    CASE opportunity-mismatch: PASS
    ✅ răng: 1/1 case — mỗi case một mã thoát riêng

- eval: E4
  run_id: ctcm-machine-20260831T090207Z-E4
  exit_code: 0
  baseline: n-a
  verifier: bash scripts/ci/check-product-map-teeth.sh --case artifact-missing --case artifact-unreadable
  verified_at: 2026-08-31T09:02:07Z
  output: |
    → răng: artifact-missing artifact-unreadable
    CASE artifact-missing: PASS
    CASE artifact-unreadable: PASS
    ✅ răng: 2/2 case — mỗi case một mã thoát riêng

- eval: E5
  run_id: ctcm-machine-20260831T090207Z-E5
  exit_code: 0
  baseline: n-a
  verifier: node scripts/ci/check-product-map.mjs
  verified_at: 2026-08-31T09:02:07Z
  output: |
       đã giao: 27 hồ sơ ký, 27 mục trên bản đồ, nút mermaid 27
       cơ hội: 2 hồ sơ, 2 mục trên bản đồ, nút mermaid 2
    ✅ PRODUCT-MAP.md khớp với _acceptance/ — không có trôi.

- eval: E6
  run_id: ctcm-machine-20260831T090207Z-E6
  exit_code: 0
  baseline: n-a
  verifier: bash scripts/roadmap/check-roadmap-guard-teeth.sh --case ledger-duplicate
  verified_at: 2026-08-31T09:02:07Z
  output: |
    → răng: case ledger-duplicate
      ✓ CASE ledger-duplicate: PASS

- eval: E7
  run_id: ctcm-machine-20260831T090207Z-E7
  exit_code: 0
  baseline: n-a
  verifier: bash scripts/roadmap/check-roadmap-fresh.sh
  verified_at: 2026-08-31T09:02:07Z
  output: |
    → kiểm tra trôi giữa docs/roadmap.md, docs/adr/ và _acceptance/
       sổ cái: 27 hạng mục đã ký, 27 dòng trong sổ
    ✅ docs/roadmap.md khớp với docs/adr/ và _acceptance/ — không có trôi.

- eval: E8
  run_id: ctcm-machine-20260831T090207Z-E8
  exit_code: 0
  baseline: n-a
  verifier: bash scripts/ci/check-gate-guards-job.sh teeth
  verified_at: 2026-08-31T09:02:07Z
  output: |
    lệnh dưới phép thử (rút từ .github/workflows/ci.yml): bash scripts/roadmap/check-roadmap-fresh.sh
    lệnh dưới phép thử (rút từ .github/workflows/ci.yml): node scripts/ci/check-product-map.mjs
    OK: cả hai lệnh (rút từ .github/workflows/ci.yml) xanh trên cây lành và đỏ trên cây đã phá; cờ rác bị từ chối

- eval: E9
  run_id: ctcm-machine-20260831T090207Z-E9
  exit_code: 0
  baseline: n-a
  verifier: bash scripts/ci/check-gate-guards-job.sh shape && bash scripts/ci/check-gate-guards-job.sh no-softening
  verified_at: 2026-08-31T09:02:07Z
  output: |
    OK: cả hai guard nằm trong job acceptance-gate; fetch-depth 0, Node 24, hai trigger còn nguyên
    OK: không có continue-on-error / || true / set +e trong job acceptance-gate

- eval: E10
  run_id: ctcm-machine-20260831T090207Z-E10
  exit_code: 0
  baseline: n-a
  verifier: bash scripts/ci/check-gate-guards-job.sh job-count
  verified_at: 2026-08-31T09:02:07Z
  output: |
    OK: đúng 6 job, đúng tập tên đã biết
    OK: năm job còn lại deep-equal với merge-base a5289bc7

- eval: E11
  run_id: ctcm-machine-20260831T090207Z-E11
  exit_code: 0
  baseline: n-a
  verifier: bash scripts/ci/check-gate-guards-job.sh suite-keys
  verified_at: 2026-08-31T09:02:07Z
  output: |
    OK: suite_keys dùng build + typecheck rời, và khoá gộp vẫn còn trong executors

- eval: E12
  run_id: ctcm-machine-20260831T090207Z-E12
  exit_code: 0
  baseline: n-a
  verifier: bash scripts/ci/check-gate-guards-job.sh a11y-dist-dir
  verified_at: 2026-08-31T09:02:07Z
  output: |
      ok  scripts/media-library/check-a11y-proto.sh
      ok  scripts/onboarding/check-a11y-proto.sh
    OK: 2/2 wrapper a11y đặt NEXT_DIST_DIR riêng

- eval: E13
  run_id: ctcm-machine-20260831T090207Z-E13
  exit_code: 0
  baseline: n-a
  verifier: bash scripts/ci/check-product-map-teeth.sh
  verified_at: 2026-08-31T09:02:07Z
  output: |
    CASE extra-slug: PASS
    CASE status-downgraded: PASS
    CASE contract-unparsable: PASS
    CASE status-unknown: PASS
    CASE dir-empty: PASS
    ✅ răng: 11/11 case — mỗi case một mã thoát riêng

- eval: E14
  run_id: ctcm-machine-20260831T090207Z-E14
  exit_code: 0
  baseline: n-a
  verifier: bash scripts/ci/check-product-map-teeth.sh --case extra-slug --case status-downgraded
  verified_at: 2026-08-31T09:02:07Z
  output: |
    → răng: extra-slug status-downgraded
    CASE extra-slug: PASS
    CASE status-downgraded: PASS
    ✅ răng: 2/2 case — mỗi case một mã thoát riêng

- eval: E15
  run_id: ctcm-machine-20260831T090207Z-E15
  exit_code: 0
  baseline: n-a
  verifier: bash scripts/ci/check-product-map-teeth.sh --case contract-unparsable --case status-unknown --case dir-empty
  verified_at: 2026-08-31T09:02:07Z
  output: |
    → răng: contract-unparsable status-unknown dir-empty
    CASE contract-unparsable: PASS
    CASE status-unknown: PASS
    CASE dir-empty: PASS
    ✅ răng: 3/3 case — mỗi case một mã thoát riêng

- eval: E16
  run_id: ctcm-machine-20260831T090207Z-E16
  exit_code: 0
  baseline: n-a
  verifier: bash scripts/ci/check-gate-guards-job.sh reachable
  verified_at: 2026-08-31T09:02:07Z
  output: |
    OK: trigger pull_request không lọc đường dẫn; step và job không mang if: hay needs:

## Chiều đỏ — đo thật, không suy luận

Bốn phép thử đỏ chạy trên bản sao `ci.yml` rồi khôi phục bằng cách chép từ bản
sao lưu (**không** dùng `git checkout` để hoàn tác — cách đó từng xoá mất việc
chưa commit ở hồ sơ trước):

| Phá cái gì | shape | no-softening | job-count | reachable |
|---|---|---|---|---|
| cắm `if:` vào step guard | xanh | xanh | xanh | **ĐỎ** |
| thêm job thứ bảy | — | — | **ĐỎ** (nêu tên job) | — |
| `continue-on-error` trên job `lint` | — | — | **ĐỎ** (nêu job + khoá) | — |
| làm mềm step guard bằng or-true | — | **ĐỎ** | — | — |

Dòng đầu là bằng chứng thực nghiệm cho phát hiện P0-2 của vòng phản biện: ba ô
kia **mù hoàn toàn** với kịch bản guard-được-cắm-điện-nhưng-không-bao-giờ-chạy.

Chiều đỏ của bộ kiểm bản đồ và guard lộ trình nằm trong 22 ca răng (E1–E4, E6,
E13–E15): mỗi ca dựng một bản sao đã phá rồi đòi ĐỎ **nêu đích danh** slug hoặc
cả hai con số — không chấp nhận mã thoát trần.

## Ngoài hợp đồng — owner đã quyết 31/08

Chi tiết ở `review-findings.md`.

| # | Phát hiện | Owner chọn |
|---|---|---|
| Ngoài-1 | Guard lộ trình nuốt tham số lạ rồi báo sạch | **ghi Known limits** (mục 6 dưới) |
| Ngoài-2 | Nghi vấn chốt chặn trước-merge bỏ qua kiểm bằng chứng lỗi thời | **mở hợp đồng mới** → `_acceptance/staleness-ho-so-thieu-paths/` |

## Known limits

1. **Không có lớp hội đồng.** Owner chốt làn máy thuần 31/08. Đổi lại: không có
   phản biện độc lập trên chính bằng chứng này; mọi khẳng định đứng trên mã thoát
   của 16 lệnh và bốn phép thử đỏ ở trên.
2. **Ô E13 hứa nhiều hơn lệnh nó chạy.** `expected` của nó đòi case-completeness
   cho **cả hai** teeth script cộng phép thử `--case` lạ, nhưng executor đã khai
   (`pmap_teeth_all`) chỉ chạy một script. Ba phần thiếu đã đo tay và đều đạt —
   11 khai / 11 PASS ở cả hai script, cả hai thoát 2 với tên ca lạ; xem
   `evidence/E13-supplementary.txt`. **Nhưng chúng không nằm trong lệnh đã ký.**
3. **Vế deep-equal của AC-7 phụ thuộc `origin/main` phân giải được.** Trên clone
   nông nó in một dòng bỏ qua thay vì đỏ — hướng an toàn (thiếu phép so không bao
   giờ bịa ra một cái đạt), nhưng ở môi trường đó vế "năm job không đổi định
   nghĩa" **không được đo**. Lượt này nó CÓ chạy (merge-base `a5289bc7`).
4. **Số lượt đóng dấu lại đo được là 1, không phải 3 như thiết kế dự đoán.**
   `normalize-text-vi` thoát vì `_acceptance/**` miễn T1 — giải thích được.
   `ci-vitest-sdk-pin` thoát thì chưa — đó chính là Ngoài-2.
5. **Guard mới chưa từng chạy trên runner CI thật.** Mọi phép đo ở đây chạy trên
   máy này. Lượt CI đầu tiên của PR là bằng chứng còn thiếu, và là chỗ duy nhất
   chứng minh được hai script chạy không cần `node_modules`.
6. **Hai chốt nay từ chối tham số lạ — sửa nằm ngoài 13 tiêu chí.** Owner nhận
   vào ở Cổng 2 (Ngoài-1). Không tiêu chí nào đo trực tiếp hành vi từ chối đó;
   nó được giữ gián tiếp bởi vế guard-of-the-guard của E8, vốn sẽ đỏ nếu hành vi
   này mất đi.
