---
schema_version: 1
slug: cong-tu-canh-minh
risk_tier: T2
verdict: PASS
verified_commit: 94760ccd44ae4ad456eef73c846f0e5a8b863fb0
run_id: ctcm-machine-20260831T090207Z
lane: machine-only
verified_at: 2026-08-31
verifier: machine-lane
human_signoff:
---

# Bằng chứng — `cong-tu-canh-minh`

**16/16 ô đo PASS · 0 UNCERTAIN · 0 bypass.** Làn máy thuần, không có lớp hội đồng.

## Vì sao làn máy thuần

Cả 16 ô đo đều là `executor: script`: không ô nào cần phán đoán người, ảnh chụp,
hay đọc giao diện. Lớp hội đồng ở đây chỉ đọc lại đúng những mã thoát mà làn máy
vừa sinh, nên nó không thêm tín hiệu — chỉ thêm vòng. Owner chốt làn này 31/08.
Đây là một **giới hạn đã khai**, không phải một phép đo bị bỏ: xem *Known limits*.

## Bảng ô đo

| Eval | Tiêu chí | Lệnh (rút từ `_acceptance/config.yaml`) | exit | Verdict |
|---|---|---|---:|---|
| E1 | AC-1 | `bash scripts/ci/check-product-map-teeth.sh --case missing-slug` | 0 | PASS |
| E2 | AC-2 | `bash scripts/ci/check-product-map-teeth.sh --case count-mismatch` | 0 | PASS |
| E3 | AC-3 | `bash scripts/ci/check-product-map-teeth.sh --case opportunity-mismatch` | 0 | PASS |
| E4 | AC-4 | `bash scripts/ci/check-product-map-teeth.sh --case artifact-missing --case artifact-unreadable` | 0 | PASS |
| E5 | AC-1 | `node scripts/ci/check-product-map.mjs` | 0 | PASS |
| E6 | AC-5 | `bash scripts/roadmap/check-roadmap-guard-teeth.sh --case ledger-duplicate` | 0 | PASS |
| E7 | AC-5 | `bash scripts/roadmap/check-roadmap-fresh.sh` | 0 | PASS |
| E8 | AC-6 | `bash scripts/ci/check-gate-guards-job.sh teeth` | 0 | PASS |
| E9 | AC-6 | `bash scripts/ci/check-gate-guards-job.sh shape && bash scripts/ci/check-gate-guards-job.sh no-softening` | 0 | PASS |
| E10 | AC-7 | `bash scripts/ci/check-gate-guards-job.sh job-count` | 0 | PASS |
| E11 | AC-8 | `bash scripts/ci/check-gate-guards-job.sh suite-keys` | 0 | PASS |
| E12 | AC-9 | `bash scripts/ci/check-gate-guards-job.sh a11y-dist-dir` | 0 | PASS |
| E14 | AC-11 | `bash scripts/ci/check-product-map-teeth.sh --case extra-slug --case status-downgraded` | 0 | PASS |
| E15 | AC-12 | `bash scripts/ci/check-product-map-teeth.sh --case contract-unparsable --case status-unknown --case dir-empty` | 0 | PASS |
| E16 | AC-13 | `bash scripts/ci/check-gate-guards-job.sh reachable` | 0 | PASS |
| E13 | AC-10 | `bash scripts/ci/check-product-map-teeth.sh` | 0 | PASS |

Đầu ra đầy đủ từng ô: `evidence/<id>-output.txt`.

## Chiều đỏ — đo thật, không suy luận

Mọi bộ kiểm mới đều có cặp hai chiều. Bốn phép thử đỏ chạy trên bản sao `ci.yml`
rồi khôi phục (chép từ bản sao lưu, **không** `git checkout` — cách đó từng xoá
mất việc chưa commit):

| Phá cái gì | shape | no-softening | job-count | **reachable** |
|---|---|---|---|---|
| cắm `if:` vào step guard | xanh | xanh | xanh | **ĐỎ** |
| thêm job thứ bảy | — | — | **ĐỎ** (nêu tên job) | — |
| `continue-on-error` trên job `lint` | — | — | **ĐỎ** (nêu job + khoá) | — |
| `|| true` trên step guard | — | **ĐỎ** | — | — |

Dòng đầu là bằng chứng thực nghiệm cho phát hiện P0-2 của vòng phản biện: ba ô cũ
**mù hoàn toàn** với kịch bản guard-được-cắm-điện-nhưng-không-bao-giờ-chạy.

Chiều đỏ của bộ kiểm bản đồ và guard lộ trình nằm ngay trong 22 ca răng
(E1–E4, E6, E13–E15): mỗi ca dựng một bản sao đã phá rồi đòi ĐỎ **nêu đích danh**
slug hoặc cả hai con số — không chấp nhận mã thoát trần.

## Ngoài hợp đồng

**1. `check-roadmap-fresh.sh` nuốt tham số lạ rồi thoát 0.** Bắt được bởi chính vế
guard-of-the-guard của E8. Cùng lớp fail-open mà repo đã cấm cho `--case`, nhưng
chưa áp cho bản thân guard. **Đã sửa trong lượt này** (cả nó lẫn
`check-product-map.mjs` nay từ chối tham số không biết) — nằm ngoài 13 tiêu chí,
nên ghi ở đây để người quyết.

**2. Nghi vấn fail-open trong chốt chặn trước-merge.** `ci-vitest-sdk-pin` khai
`.github/workflows/ci.yml` trong `paths`, file đó đổi trong PR này, mốc verify của
nó LÀ tổ tiên thật của HEAD — mà cổng in `OK`, không VIOLATION, không cả dòng NOTE.
Hồ sơ đối chứng `roadmap-drift-guard` thì bị bắt đúng ba file. Khác biệt duy nhất
quan sát được: hồ sơ kia có hai ô đo khai `paths: null`. **Đây mới là giả thuyết —
chưa kiểm chứng.** Nếu đúng, những hồ sơ khai thiếu `paths` không bao giờ bị đòi
đóng dấu lại. Đã dựng việc riêng để điều tra; **không** sửa `pre-merge-check.sh`
trong PR này vì nó là chốt chặn CI, sửa mù sẽ chặn nhầm mọi PR.

## Known limits

1. **Không có lớp hội đồng.** Owner chốt làn máy thuần 31/08. Đổi lại: không có
   phản biện độc lập trên chính bằng chứng này; mọi khẳng định dưới đây đứng trên
   mã thoát của 16 lệnh và bốn phép thử đỏ ở trên.
2. **Ô E13 hứa nhiều hơn lệnh nó chạy.** `expected` của nó đòi case-completeness
   cho **cả hai** teeth script cộng phép thử `--case` lạ, nhưng executor đã khai
   (`pmap_teeth_all`) chỉ chạy một script. Ba phần thiếu đã đo tay và đều đạt —
   11 khai / 11 PASS ở cả hai script, cả hai thoát 2 với tên ca lạ; xem
   `evidence/E13-supplementary.txt`. **Nhưng chúng không nằm trong lệnh đã ký**,
   nên vòng sau sửa executor hoặc thu hẹp `expected` mới đóng được chỗ hở này.
3. **Vế deep-equal của AC-7 phụ thuộc `origin/main` phân giải được.** Trên clone
   nông nó in một dòng bỏ qua thay vì đỏ — hướng an toàn (thiếu phép so không bao
   giờ bịa ra một cái đạt), nhưng nghĩa là ở môi trường đó vế "năm job không đổi
   định nghĩa" **không được đo**. Lượt này nó CÓ chạy (merge-base `a5289bc7`).
4. **Số lượt đóng dấu lại đo được là 1, không phải 3 như thiết kế dự đoán.**
   `normalize-text-vi` thoát vì `_acceptance/**` miễn T1 — giải thích được.
   `ci-vitest-sdk-pin` thoát thì chưa — xem *Ngoài hợp đồng* mục 2.
5. **Guard mới chưa từng chạy trên runner CI thật.** Mọi phép đo ở đây chạy trên
   máy này. Lượt CI đầu tiên của PR là bằng chứng còn thiếu, và nó là chỗ duy nhất
   chứng minh được hai script chạy không cần `node_modules`.
