---
schema_version: 2
feature_slug: mo-hoa-b01
verdict: PENDING-JUDGMENT
triage_failed: true
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b24bd890997a214e4d014065d31af8260a90f80f
human_signoff:
---

# Evidence Report: mo-hoa-b01

⚠ phân loại phạm vi KHÔNG chạy được — không lỗi nào được máy tự sửa, danh sách đầy đủ nằm trong review-findings.md, người xem lại toàn bộ trước khi ký.

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

## Evidence

- eval: E1
  run_id: minted-mo-hoa-b01-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mhb_teeth_image
  verified_at: 2026-09-05T09:30:00Z
  output: |
    CASE image-upstream: PASS
    CASE conf-remote-lech: PASS
    CASE readme-image-missing: PASS

- eval: E2
  run_id: minted-mo-hoa-b01-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mhb_teeth_compose_build
  verified_at: 2026-09-05T09:30:00Z
  output: |
    CASE compose-no-build: PASS
    CASE readme-no-build-cmd: PASS

- eval: E3
  run_id: minted-mo-hoa-b01-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mhb_teeth_release
  verified_at: 2026-09-05T09:30:00Z
  output: |
    CASE disarmed-header-gone: PASS
    CASE claude-not-released-gone: PASS
    CASE claude-builds-line-back: PASS

- eval: E4
  run_id: minted-mo-hoa-b01-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mhb_teeth_community
  verified_at: 2026-09-05T09:30:00Z
  output: |
    CASE funding-back: PASS
    CASE clone-upstream: PASS
    CASE issue-template-not-fork: PASS

- eval: E5
  run_id: minted-mo-hoa-b01-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mhb_teeth_badges
  verified_at: 2026-09-05T09:30:00Z
  output: |
    CASE release-badge-back: PASS
    CASE ci-badge-gone: PASS
    CASE pypi-badge-wrong-dist: PASS

- eval: E6
  run_id: minted-mo-hoa-b01-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mhb_teeth_ratchet
  verified_at: 2026-09-05T09:30:00Z
  output: |
    class-matrix: 8/8 mẫu
    CASE class-matrix: PASS
    CASE stale-exemption: PASS

- eval: E7
  run_id: minted-mo-hoa-b01-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mhb_teeth_all
  verified_at: 2026-09-05T09:30:00Z
  output: |
    CASE suite-key-dangling: PASS
    CASE debt-table-missing: PASS
    PASS: 28/28 ca

- eval: E8
  run_id: minted-mo-hoa-b01-E8-r1
  exit_code: 0
  verifier: config:executors.script.mhb_wiring
  verified_at: 2026-09-05T07:59:21Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-mo-hoa-b01-E9-r1
  exit_code: 0
  verifier: config:executors.script.mhb_existing_guards
  verified_at: 2026-09-05T07:59:21Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-mo-hoa-b01-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mhb_teeth_notice
  verified_at: 2026-09-05T09:30:00Z
  output: |
    CASE notice-dist-gone: PASS
    CASE notice-unchanged-back: PASS
    CASE notice-attribution-gone: PASS

- eval: E11
  run_id: minted-mo-hoa-b01-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mhb_prototype_lane
  verified_at: 2026-09-05T09:30:00Z
  output: |
    OK: 13/13 file của diff có hàng trong bảng nợ
    PASS: làn prototype keep của mo-hoa-b01 khớp
    CASE debt-table-missing: PASS

### Lệnh suite (hồi quy)

- cmd: bash scripts/acceptance/preflight-verify-env.sh
  run_id: minted-mo-hoa-b01-SUITE-bash_scripts_acceptance_preflight_verify-r2
  exit_code: 0
  verified_at: 2026-09-05T09:30:00Z

- cmd: node scripts/roadmap/check-plan-freeze.mjs
  run_id: minted-mo-hoa-b01-SUITE-node_scripts_roadmap_check_plan_freeze_m-r2
  exit_code: 0
  verified_at: 2026-09-05T09:30:00Z

- cmd: pnpm build && pnpm typecheck
  run_id: minted-mo-hoa-b01-SUITE-build_typecheck-r2
  exit_code: 0
  verified_at: 2026-09-05T09:30:00Z

- cmd: pnpm lint:check
  run_id: minted-mo-hoa-b01-SUITE-lint_check-r2
  exit_code: 0
  verified_at: 2026-09-05T09:30:00Z

- cmd: pnpm test
  run_id: minted-mo-hoa-b01-SUITE-test-r2
  exit_code: 0
  verified_at: 2026-09-05T09:30:00Z

- cmd: cd sdk && . ../scripts/lib/sdk-version.sh && pin=$(reader_pin) && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions --with "${pin:?no vietnormalizer pin derived from sdk/pyproject.toml}" python -m pytest -q
  run_id: minted-mo-hoa-b01-SUITE-scripts_lib_sdk_version_sh_pin_reader_pi-r2
  exit_code: 0
  verified_at: 2026-09-05T09:30:00Z

- cmd: pnpm verify:plugins
  run_id: minted-mo-hoa-b01-SUITE-verify_plugins-r2
  exit_code: 0
  verified_at: 2026-09-05T09:30:00Z

- cmd: pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json
  run_id: minted-mo-hoa-b01-SUITE-gen_abi-r2
  exit_code: 0
  verified_at: 2026-09-05T09:30:00Z

- cmd: bash scripts/fork/check-fork-identity.sh
  run_id: minted-mo-hoa-b01-SUITE-bash_scripts_fork_check_fork_identity_sh-r2
  exit_code: 0
  verified_at: 2026-09-05T09:30:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round truoc — baseline khong do lai round nay
none — mọi eval baseline round này là n-a (không đo lại); không có eval nào phân biệt được để đánh giá.

## Variance

none — không có eval nào có runs > 1 round này.

## Iterations

Round 1: E1-E7, E10, E11 xanh trên fixture teeth; E8, E9 xanh — carry-forward sang round 2 vì delta không chạm paths của hai eval này.
Round 2: bước phân loại phạm vi (scope-triage) không chạy được — toàn bộ finding chuyển sang mục "Chưa phân loại" trong review-findings.md, verdict giữ PENDING-JUDGMENT chờ người xem lại thủ công.
Round 3 (07/09): sửa finding HIGH «Trong hợp đồng» của AC-7 rồi chạy lại cả 11 ô đo — 11/11 exit 0 tại `b24bd89`.

## Round 3 — đóng finding nuốt lỗi của bộ răng

**Finding:** `run_one` gọi mỗi ca bằng `if "case_$name"; then`. Bash bỏ qua errexit trong TOÀN THÂN một hàm chạy ở vị trí điều kiện, nên `return 1` của `green_control` không dừng ca lại: ca vẫn phá fixture, guard vẫn đỏ (vì lý do khác), `expect_red` vẫn thấy token, và ca được đếm PASS. 24 trên 28 ca mang bệnh này.

**Bệnh thứ hai cùng gốc, đo thêm khi sửa:** 5 lời gọi `expect_red` nằm TRONG vòng `for` không phải lệnh cuối hàm, nên một vòng thất bại bị vòng sau ghi đè.

**Sửa:** thêm `|| return 1` vào 25 lời gọi `green_control` + 5 `expect_red` trong vòng lặp. 18 `expect_red` là lệnh cuối hàm giữ nguyên — giá trị trả về của chúng đã là giá trị trả về của hàm, không có bệnh.

**Đối chứng hai chiều, đo thật:**

| Chiều | Trước sửa | Sau sửa |
|---|---|---|
| cây lành, cả bộ răng | 28/28 PASS, exit 0 | 28/28 PASS, exit 0 |
| conf phá (`repo=ai-do/kho-khac`), ca `image-upstream` | exit 0, in `CASE image-upstream: PASS` | exit 1, không in PASS |
| cùng conf phá, ca `hit-outside` | exit 0, in PASS | exit 1, không in PASS |
| cùng conf phá, ca `readme-image-missing` | — | exit 1, không in PASS |

Chiều đỏ trước đây không cắn; nay cắn, và chiều xanh không đổi.

**Known limit còn lại:** ai thêm một lệnh SAU một `expect_red` cuối hàm sẽ tái tạo đúng bệnh này ở chỗ đó. Phạm vi sửa cố ý hẹp theo đúng chỗ đo được là hỏng.

## Vòng 3 — phán quyết REJECT, và nó đúng

`verdict: REJECT`, `failed_evals: [E8, E9]`, `triage_failed: false`. Bước phân loại phạm vi
**chạy được** ở vòng này — đó là điều vòng 2 không làm được, và là lý do vòng 2 dừng ở
PENDING-JUDGMENT. Nguyên nhân khác nhau, không cùng lớp lỗi với ô hội đồng.

**Bốn phát hiện kéo REJECT đều cùng một gốc: chữ ký được ghi mà sổ sách đi theo thì không.**
Ký `status: signed-off` làm bốn guard đang chạy trong cổng đỏ ngay:

| Guard | Lệch gì |
|---|---|
| `check-product-map.mjs` | hồ sơ còn ở nhóm «Đang làm», vắng ở «chờ phiên nghiệm thu» |
| `check-roadmap-fresh.sh` | sổ cái thiếu hàng cho hồ sơ vừa ký; dòng B2 còn ⬜ |
| `check-plan-docs.sh` | STATUS.md đề ngày cũ hơn hồ sơ; hai con số 37 còn lạc hậu |
| `check-gate-guards-job.sh teeth` | dừng ở needle đầu vì cây không lành, nên bộ răng mới **chưa từng được chạy trong cổng** |

Điểm cuối đáng ghi riêng: bộ răng fork-identity mà vòng này dựng ra **không hề được chứng minh
trong cổng** ở HEAD đó — nó bị chặn trước khi tới lượt. Độ phủ mà hồ sơ quảng cáo là chưa có thật.

**Đã sửa 07/09, năm chỗ:** bản đồ dời hồ sơ sang nhóm đúng và sửa hai nút mermaid · sổ cái thêm
một hàng · dòng B2 tick ✅ · STATUS.md gạch nợ B2 kèm ngày ký và cập nhật ngày + số đếm · đoạn
tỉ lệ trong lộ trình đổi 37 → 38. Đo lại: E8 exit 0, E9 exit 0, và bốn guard trên đều exit 0.

**`run_log_write_failed: true`** ở vòng này — bộ tổng hợp tính xong rồi không ghi được sổ chạy.
Các dòng của vòng 3 dưới đây do phiên điều phối ghi tay, không phải do workflow ghi.

**Còn 10 phát hiện chưa xử**, trong đó một mục nặng nằm ngoài hợp đồng và chưa từng được người ký
xem: đổi tên volume trong `docker-compose.yml` làm người đang tự host mất sạch dữ liệu khi họ
`git pull && docker compose up -d`. Xem mục Known limits và tin mời cổng.

