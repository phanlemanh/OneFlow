---
schema_version: 2
feature_slug: mo-hoa-b01
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: bb2b05d89c7cbb49dd7d8589a1f09d5e50fb1609
human_signoff: Phan Le Manh 2026-09-07
---

# Evidence Report: mo-hoa-b01

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
  run_id: minted-mo-hoa-b01-E1-r7
  exit_code: 0
  verifier: config:executors.script.mhb_teeth_image
  verified_at: 2026-09-07T14:45:06Z
  carried_from_round: 7
  output: |
    carry-forward tu round 7 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-mo-hoa-b01-E2-r7
  exit_code: 0
  verifier: config:executors.script.mhb_teeth_compose_build
  verified_at: 2026-09-07T14:45:06Z
  carried_from_round: 7
  output: |
    carry-forward tu round 7 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-mo-hoa-b01-E3-r7
  exit_code: 0
  verifier: config:executors.script.mhb_teeth_release
  verified_at: 2026-09-07T14:45:06Z
  carried_from_round: 7
  output: |
    carry-forward tu round 7 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-mo-hoa-b01-E4-r7
  exit_code: 0
  verifier: config:executors.script.mhb_teeth_community
  verified_at: 2026-09-07T14:45:06Z
  carried_from_round: 7
  output: |
    carry-forward tu round 7 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-mo-hoa-b01-E5-r7
  exit_code: 0
  verifier: config:executors.script.mhb_teeth_badges
  verified_at: 2026-09-07T14:45:06Z
  carried_from_round: 7
  output: |
    carry-forward tu round 7 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-mo-hoa-b01-E6-r7
  exit_code: 0
  verifier: config:executors.script.mhb_teeth_ratchet
  verified_at: 2026-09-07T14:45:06Z
  carried_from_round: 7
  output: |
    carry-forward tu round 7 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-mo-hoa-b01-E7-r7
  exit_code: 0
  verifier: config:executors.script.mhb_teeth_all
  verified_at: 2026-09-07T14:45:06Z
  carried_from_round: 7
  output: |
    carry-forward tu round 7 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-mo-hoa-b01-E8-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mhb_wiring
  verified_at: 2026-09-07T15:28:49Z
  output: |
    OK: executors.script.fork_identity là suite key và gọi check-fork-identity.sh (9 khoá trong làn máy)
    CASE suite-key-dangling: PASS

- eval: E9
  run_id: minted-mo-hoa-b01-E9-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mhb_existing_guards
  verified_at: 2026-09-07T15:28:49Z
  output: |
    xếp lại sau: 3 hồ sơ, 3 mục trên bản đồ, nút mermaid 3
    chờ phiên nghiệm thu: 3 · đang làm: 0 · chờ duyệt phạm vi: 0
    ✅ PRODUCT-MAP.md khớp với _acceptance/ — không có trôi.

- eval: E10
  run_id: minted-mo-hoa-b01-E10-r7
  exit_code: 0
  verifier: config:executors.script.mhb_teeth_notice
  verified_at: 2026-09-07T14:45:06Z
  carried_from_round: 7
  output: |
    carry-forward tu round 7 — delta khong cham paths cua eval

- eval: E11
  run_id: minted-mo-hoa-b01-E11-r7
  exit_code: 0
  verifier: config:executors.script.mhb_prototype_lane
  verified_at: 2026-09-07T14:45:06Z
  carried_from_round: 7
  output: |
    carry-forward tu round 7 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: bash scripts/acceptance/preflight-verify-env.sh
  run_id: minted-mo-hoa-b01-SUITE-bash_scripts_acceptance_preflight_verify-r8
  exit_code: 0
  verified_at: 2026-09-07T15:28:49Z

- cmd: node scripts/roadmap/check-plan-freeze.mjs
  run_id: minted-mo-hoa-b01-SUITE-node_scripts_roadmap_check_plan_freeze_m-r8
  exit_code: 0
  verified_at: 2026-09-07T15:28:49Z

- cmd: pnpm build && pnpm typecheck
  run_id: minted-mo-hoa-b01-SUITE-build_typecheck-r8
  exit_code: 0
  verified_at: 2026-09-07T15:28:49Z

- cmd: pnpm lint:check
  run_id: minted-mo-hoa-b01-SUITE-lint_check-r8
  exit_code: 0
  verified_at: 2026-09-07T15:28:49Z

- cmd: pnpm test
  run_id: minted-mo-hoa-b01-SUITE-test-r8
  exit_code: 0
  verified_at: 2026-09-07T15:28:49Z

- cmd: cd sdk && . ../scripts/lib/sdk-version.sh && pin=$(reader_pin) && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions --with \"${pin:?no vietnormalizer pin derived from sdk/pyproject.toml}\" python -m pytest -q
  run_id: minted-mo-hoa-b01-SUITE-scripts_lib_sdk_version_sh_pin_reader_pi-r8
  exit_code: 0
  verified_at: 2026-09-07T15:28:49Z

- cmd: pnpm verify:plugins
  run_id: minted-mo-hoa-b01-SUITE-verify_plugins-r8
  exit_code: 0
  verified_at: 2026-09-07T15:28:49Z

- cmd: pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json
  run_id: minted-mo-hoa-b01-SUITE-gen_abi-r8
  exit_code: 0
  verified_at: 2026-09-07T15:28:49Z

- cmd: bash scripts/fork/check-fork-identity.sh
  run_id: minted-mo-hoa-b01-SUITE-bash_scripts_fork_check_fork_identity_sh-r8
  exit_code: 0
  verified_at: 2026-09-07T15:28:49Z

## Known limits

Bảy mục người ký chấp nhận tại Cổng 2 (07/09, chữ «Ký»), giữ nguyên qua các lần ký lại:

1. Liên kết cộng đồng trỏ tới trang Thảo luận chưa bật cho kho này, người bấm gặp trang không tồn tại — known-limits
2. `check-fork-identity.sh` âm thầm quay về conf/allow-list thật khi đường dẫn ghi đè không tồn tại — known-limits
3. `fixture()` để sót thư mục tạm ở ca có vòng lặp; chỉ probe cuối được dọn — wont-fix
4. E10/E5 hứa QUAN HỆ (tên gói đọc từ `pyproject`) nhưng ca răng chỉ assert chuỗi vắng — known-limits
5. E7/E8 ghim những phép kiểm mà lệnh không chạy; verifier chỉ «đạt» bằng cách đọc mã — known-limits
6. `check-suite-key.sh` khẳng định «executor GỌI script» bằng phép chứa-chuỗi — wont-fix
7. Ba ca răng còn ghi cứng `phanlemanh/OneFlow` dù đã suy REPO_RAW từ conf — wont-fix

Nợ có tên thêm ở các vòng 4–8 (người ký chấp nhận theo luật chặn xoáy duyệt trước vòng 7; nguồn: mục Amendment của contract):

- [vòng 4] guard định danh fork đỏ trên mọi fork của contributor (so conf với remote origin) — known-limits
- [vòng 4] `check-prototype-lane.sh` ưu tiên `main` cục bộ trước `origin/main`, main cũ cho FAIL sai — known-limits
- [vòng 5] hai dòng decisions.jsonl mang giờ địa phương gắn hậu tố Z — sử liệu, không sửa lùi
- [vòng 5] hình 3: quan hệ conf → tên ảnh chưa có ca răng đổi conf — known-limits
- [vòng 5] hình 3: tip của dòng Diff trong opportunity.md là hằng, guard không ràng với HEAD — known-limits
- [vòng 6] năm dòng miễn trừ `app.tongflow.com` không ghim ngữ cảnh — known-limits
- [vòng 7] hình 5 treo: ba dòng miễn trừ tối thiểu chỉ đếm N=3 và ghim một tên; vế đỏ «miễn trừ tối thiểu vắng» chưa có ca răng — known-limits
- [vòng 7] `if expect_red …; fi || return 1` — vế `|| return 1` chết, vòng class-matrix không dừng sớm — wont-fix
- [vòng 7] AC-5: răng badge phủ 2/3 điều kiện mỗi README — known-limits
- [vòng 7] `docker compose up -d --build` đo bằng grep toàn file, không neo vào khối lệnh — known-limits
- [vòng 7] «đúng một hàng» đếm bằng grep trên toàn opportunity.md, không giới hạn trong bảng — known-limits
- [vòng 8] SECURITY.md declares private vulnerability reporting as the ONLY route, but it is disabled on the repo — CÀI ĐẶT KHO, việc của owner trước merge: bật Private vulnerability reporting (Settings → Security), không cần commit
- [vòng 8] Every community link now points to GitHub Discussions, which is not enabled (404) — CÀI ĐẶT KHO, việc của owner trước merge: bật Discussions (Settings → Features), không cần commit; trùng Known limit #1
- [vòng 8] CODE_OF_CONDUCT.md still routes enforcement reports to upstream's business@tongflow.com — nợ có tên — CODE_OF_CONDUCT.md không thuộc diện miễn T1 nên sửa là evidence ôi; sửa ở lượt kế cùng việc đưa file vào FILES của guard
- [vòng 8] Teeth suite leaks a scratch dir per extra fixture() call (measured 8 dirs / class-matrix, ~22 per full run) — wont-fix
- [vòng 8] Hình 5 — class-matrix quét đủ 8 mẫu nhưng chỉ trên MỘT file; chiều FILES của lớp không có ma trận, gỡ file khỏi FILES răng vẫn 32/32 — known-limits
- [vòng 8] Hình 2 — fixture tag-trigger-back viết tay đúng khuôn awk/grep của guard; trigger tags dạng flow-style hợp lệ vẫn xanh — known-limits
- [vòng 8] Hình 4 — E8 expected ghim token `RED của check-fork-identity.sh: ảnh container` mà không script nào in; vế đỏ của needle mới chỉ còn mã thoát + dòng tổng — known-limits
- [vòng 8] Hình 4 — nhánh đỏ `ghi công upstream mất khỏi NOTICE.md` không ca răng nào ghim; notice-attribution-gone kích cả hai FAIL nhưng chỉ ghim bánh cóc — known-limits
- [vòng 8] Hình 1 — check-suite-key.sh khẳng định «executor GỌI script» bằng `script not in str(cmd)`; đo chỉ dẫn, không chạy (đã ghi review-findings, wont-fix) — wont-fix
- [vòng 8] Hình 5 — case_clean đếm N=3 + ghim MỘT tên trong khi E6 hứa BA dòng miễn trừ có tên «không phải một con số N» (đã ghi review-findings, chưa phân loại) — new-contract
- [vòng 8] Hình 6 — răng ghim cứng `phanlemanh/OneFlow` ở ba ca dù đã đọc REPO_RAW từ conf (đã ghi review-findings, wont-fix) — wont-fix

## Ngoài hợp đồng

Mọi mục dưới đây nằm ngoài phạm vi duyệt ở Cổng 1; định đoạt ghi cạnh từng mục, chi tiết trong `review-findings.md`:

- [medium] Community links redirect to GitHub Discussions, but Discussions is disabled on phanlemanh/OneFlow — known-limits
- [medium] check-fork-identity.sh silently falls back to the real conf/allow-list when an explicit override path does not exist — known-limits
- [low] fixture() leaks temp dirs in looping cases — only the last probe of a case is cleaned — wont-fix
- [medium] Hình 3 — E10/E5 hứa QUAN HỆ (tên gói đọc từ pyproject) nhưng ca răng chỉ assert chuỗi vắng; guard ghim hằng `oneflow-sdk` vẫn qua răng — known-limits
- [medium] Hình 1 — E7/E8 expected ghim những phép kiểm mà cmd không hề chạy (`--case bogus`, `--selftest-fail`, gỡ phần tử CASES → 27/27, gỡ needle khỏi GUARD_NEEDLES); verifier chỉ có thể «đạt» bằng cách đọc mã nguồn — known-limits
- [medium] Hình 3 (gần Hình 1) — check-suite-key.sh khẳng định «executor GỌI script» bằng phép chứa-chuỗi trên văn bản lệnh; executor chỉ NHẮC tên script vẫn xanh — wont-fix
- [low] Hình 6 (gần nhất) — răng ghim cứng định danh fork của tác giả `phanlemanh/OneFlow` ở ba ca dù đã suy REPO_RAW từ conf — wont-fix
- [high] [ĐÃ SỬA 07/09 — `6cb2253`] Đổi khoá volume compose `tongflow-*` → `oneflow-*` làm người đang tự host mất sạch dữ liệu khi `git pull && docker compose up -d` — đã sửa
- [medium] [VÒNG 4 — ĐÃ SỬA 07/09 `b8ca06a`] Đổi tên service compose `tongflow` → `oneflow` làm self-host cũ không lên được (container mồ côi giữ cổng 3000) — đã sửa
- [low] [VÒNG 4] Guard định danh fork đỏ trên mọi fork của contributor (đối chiếu conf ↔ remote origin) — known-limits
- [low] [VÒNG 4] check-prototype-lane.sh ưu tiên `main` cục bộ trước `origin/main` — main cũ cho FAIL exit 1 sai thay vì exit 2 — known-limits
- [high] [VÒNG 5 — sổ sách] Signed dossier whose evidence report carries no human_signoff and empty Known-limits sections — pre-merge gate misclassifies it as machine-cleared and skips the staleness rule — fix ở lượt ghi evidence cuối: điền `human_signoff` và hai mục Known limits / Ngoài hợp đồng vào evidence-report từ contract và file này
- [low] [VÒNG 5] decisions.jsonl timestamps are non-monotonic — two entries carry local time with a Z suffix — known-limits
- [medium] [VÒNG 5 — máy không phân loại được] Hình 3: quan hệ conf → tên ảnh (AC-1) không được đo — token đỏ của E1 bỏ phần `$IMAGE` và không ca nào đổi conf rồi đòi ảnh suy ra đổi theo — known-limits
- [low] [VÒNG 5 — máy không phân loại được] Hình 3 (quan hệ chưa đo): tip của dòng `Diff: <base>...<tip>` là hằng viết tay, guard chỉ đối chiếu base, không đối chiếu tip với nhánh đang kiểm — known-limits
- [medium] [VÒNG 6] Five `app\.tongflow\.com` exemptions pin no context, so any new hosted-service link in README/CLAUDE passes — known-limits
- [high] [VÒNG 7] Evidence ghim cd15d1d nhưng bốn file code có cổng đổi sau đó — bằng chứng không mô tả cây đang merge — đã xử ở lượt ghi này
- [high] [VÒNG 7] evidence-report.md bỏ trống human_signoff + Known limits + Ngoài hợp đồng → cổng đi nhánh «xanh-sạch, KHÔNG mời ký» và bỏ qua luôn phép kiểm staleness — đã xử ở lượt ghi này
- [low] [VÒNG 7] Dòng sổ cái roadmap ghi «bộ răng 28 ca» / «24/28 ca» trong khi CASES hiện có 32 ca — đã sửa ở lượt ghi này
- [medium] [VÒNG 7] Env override FORK_IDENTITY_CONF/FORK_IDENTITY_ALLOW trỏ file không tồn tại → âm thầm rơi về mặc định và PASS — trùng Known limit #2 đã ký
- [low] [VÒNG 7] Răng gọi `fixture` lặp trong vòng for mà không dọn probe cũ — rò 19 thư mục tạm mỗi lần chạy — trùng Known limit #3 đã ký
- [low] [VÒNG 7] `if expect_red …; then …; fi || return 1` — vế `|| return 1` chết, vòng class-matrix không dừng ở mẫu hỏng đầu tiên — wont-fix
- [medium] [VÒNG 7] Hình 3/5 — case_clean assert đếm N=3 + một tên, trong khi E6 hứa BA dòng miễn trừ tối thiểu CÓ TÊN và vế đỏ «miễn trừ tối thiểu vắng» không có ca răng — trùng hình 5 treo
- [medium] [VÒNG 7] Hình 5 — E7/E8 tuyên chiều đỏ của phép đếm và của needle mà không lệnh nào trong executor chạy — trùng Known limit #5 đã ký
- [low] [VÒNG 7] Hình 5 — AC-5 hứa MỖI README ba điều kiện badge, răng chỉ có điểm-case cho 2 trong 3 điều kiện — known-limits
- [low] [VÒNG 7] Hình 6 — răng ghi cứng `phanlemanh/OneFlow` dù đã suy REPO_RAW từ conf — trùng Known limit #7 đã ký
- [low] [VÒNG 7] Hình 3 — «docker compose up -d --build» là đường chạy được, guard đo bằng grep -F toàn file — known-limits
- [low] [VÒNG 7] Hình 3 — «đúng một hàng trong bảng nợ» đếm bằng grep chuỗi trên toàn opportunity.md, không giới hạn vào bảng — known-limits
- [high] [VÒNG 8] SECURITY.md declares private vulnerability reporting as the ONLY route, but it is disabled on the repo — CÀI ĐẶT KHO, việc của owner trước merge: bật Private vulnerability reporting
- [high] [VÒNG 8] Every community link now points to GitHub Discussions, which is not enabled (404) — CÀI ĐẶT KHO, việc của owner trước merge: bật Discussions
- [medium] [VÒNG 8] New ledger row is separated from the roadmap-ledger table by a blank line — it renders outside the table — đã sửa ở lượt ghi này
- [medium] [VÒNG 8] CODE_OF_CONDUCT.md still routes enforcement reports to upstream's business@tongflow.com — nợ có tên
- [medium] [VÒNG 8] Teeth suite leaks a scratch dir per extra fixture() call (measured 8 dirs / class-matrix, ~22 per full run) — wont-fix
- [low] [VÒNG 8] Ledger prose says the teeth suite has 28 cases; the script declares and runs 32 — đã sửa ở lượt ghi này
- [high] [VÒNG 8] Hình 5 — class-matrix quét đủ 8 mẫu nhưng chỉ trên MỘT file; chiều FILES của lớp không có ma trận, gỡ file khỏi FILES răng vẫn 32/32 — known-limits
- [medium] [VÒNG 8] Hình 2 — fixture tag-trigger-back viết tay đúng khuôn awk/grep của guard; trigger tags dạng flow-style hợp lệ vẫn xanh — known-limits
- [medium] [VÒNG 8] Hình 4 — E8 expected ghim token `RED của check-fork-identity.sh: ảnh container` mà không script nào in; vế đỏ của needle mới chỉ còn mã thoát + dòng tổng — known-limits
- [low] [VÒNG 8] Hình 4 — nhánh đỏ `ghi công upstream mất khỏi NOTICE.md` không ca răng nào ghim; notice-attribution-gone kích cả hai FAIL nhưng chỉ ghim bánh cóc — known-limits
- [medium] [VÒNG 8] Hình 1 — check-suite-key.sh khẳng định «executor GỌI script» bằng `script not in str(cmd)`; đo chỉ dẫn, không chạy (đã ghi review-findings, wont-fix) — wont-fix
- [medium] [VÒNG 8] Hình 5 — case_clean đếm N=3 + ghim MỘT tên trong khi E6 hứa BA dòng miễn trừ có tên «không phải một con số N» (đã ghi review-findings, chưa phân loại) — new-contract
- [low] [VÒNG 8] Hình 6 — răng ghim cứng `phanlemanh/OneFlow` ở ba ca dù đã đọc REPO_RAW từ conf (đã ghi review-findings, wont-fix) — wont-fix

## Analyst

carried tu round truoc — baseline khong do lai round nay

none — baseline không đo lại round này (mọi eval mới đo trong vòng này đều baseline: n-a)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 8: E8 (wiring) và E9 (existing-guards) chạy mới và PASS; E1–E7, E10, E11 carry-forward nguyên trạng từ round 7 (delta round này không chạm paths của các eval đó). Toàn bộ lệnh suite hồi quy (preflight, plan-freeze, build/typecheck, lint, test, sdk pytest, verify:plugins, gen:abi, fork-identity) chạy lại và PASS. Verdict: PASS.

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

**Mục nặng ấy đã xử 07/09 tại `6cb2253`** sau khi người ký chọn lối «giữ khoá volume cũ» (mục
trong `review-findings.md` đánh dấu ĐÃ SỬA). Lối `name: tongflow-data` mà bàn giao gợi ý bị loại vì
Compose đặt tên volume thật là `<project>_<khoá>`, nên `name:` trần không khớp volume cũ. Đo lại
sau sửa: `check-fork-identity.sh` PASS, răng 28/28 exit 0, E2 exit 0. Phán quyết máy vẫn là của
vòng 3 (REJECT) cho tới khi vòng 4 chạy trên `6cb2253`.

## Vòng 4 — PASS tại `cd15d1d`

`verdict: PASS`, 11/11 ô đo exit 0, 9 lệnh suite exit 0, 20 lệnh phân biệt, 38 agent, không
BLOCKED, không phương sai, không ô hội đồng (T2, lane máy thuần). Chạy sau chữ ký lại 07/09 nên
evidence ghim đúng HEAD cuối.

**`run_log_write_failed: true` lần nữa, nhưng lần này workflow nói rõ là theo thiết kế:** «Run-log:
21 dòng trong result.runLog — main loop TỰ append trước Gate 2». 21 dòng vòng 4 trong
`run-log.jsonl` (run_id `minted-mo-hoa-b01-E*-r4` + một dòng `round-tally`) do phiên điều phối
append NGUYÊN VĂN từ kết quả workflow, không viết tay.

**Bảy finding ngoài hợp đồng, không finding trong hợp đồng.** Bốn mục trùng Known limits đã ký
(#2 hình 6, #3 fixture rò, hình 5 treo) — giữ nguyên định đoạt. Ba mục mới (ghi thêm vào
`review-findings.md`, đánh dấu VÒNG 4):

| Mức | Nội dung | Xử |
|---|---|---|
| medium | đổi tên service compose `tongflow` → `oneflow`: self-host cũ `git pull && docker compose up -d` để lại container mồ côi giữ cổng 3000, bản mới không lên (hai agent cùng tìm ra, gộp một) | **đã sửa tại `b8ca06a`** — người ký chọn giữ tên service `tongflow`, cùng lối với khoá volume ở `6cb2253`; vòng 5 chạy sau |
| low | guard định danh fork đỏ trên mọi fork của contributor (so conf với remote origin) | known-limits (đề xuất máy) |
| low | `check-prototype-lane.sh` ưu tiên `main` cục bộ trước `origin/main`, main cũ cho FAIL sai thay vì exit 2 | known-limits (đề xuất máy) |

## Vòng 5 — PENDING-JUDGMENT vì phân loại thiếu mục, và một lỗi TRONG hợp đồng

Chạy trên `fbe0df7` (sau sửa tên service). 11/11 ô đo exit 0, 20 lệnh, 40 agent, không BLOCKED.
Verdict **PENDING-JUDGMENT**: bước phân loại phạm vi trả thiếu mục ở ba finding (bộ tổng hợp
coi là «phân loại không đầy đủ», không ai REJECT). 21 dòng run-log append nguyên văn từ kết quả
(commit `bfe8817` chỉ chứa các dòng ấy; sổ chữ ghi ở commit kế).

**Một finding TRONG hợp đồng (AC-6, high), phiên điều phối đã tái hiện:** guard so miễn trừ với
cả dòng, nên mention thượng nguồn thứ hai chèn lên dòng ghi công đã miễn trừ vẫn xanh. Người ký
chọn sửa: `40dc80c` cắt đoạn đã miễn trừ rồi quét lại phần còn lại của dòng; thêm ca răng
`exempt-line-smuggle`; E7 ghim 29/29. Chiều đỏ đo trên bản sao: FAIL đúng thông điệp, exit 1.

**Ngoài hợp đồng, mới ở vòng này:** (1) evidence-report thiếu `human_signoff` và hai mục
Known limits / Ngoài hợp đồng rỗng nên lưới trước merge đọc hồ sơ là «xanh-sạch, không mời ký»
— lỗi bộ tổng hợp kit, xử bằng tay ở lượt ghi evidence cuối; (2) hai dòng decisions.jsonl mang
giờ địa phương gắn hậu tố Z — giữ làm sử liệu, known-limits; (3) hình 3: quan hệ conf → tên ảnh
chưa có ca răng đổi conf; (4) hình 3: tip của dòng Diff trong opportunity.md là hằng, guard không
ràng với HEAD. Hai mục sau máy không phân loại được; đề xuất known-limits. Bảy finding còn lại
trùng Known limits đã ký.

Người ký đã nói vòng 6 là vòng chốt: finding ngoài hợp đồng còn lại sau vòng 6 ghi known-limits
có tên rồi điền chữ ký, không vòng 7.

## Vòng 6 — BLOCKED vì một agent chết, và ba lỗi TRONG hợp đồng

Chạy trên `d2201cd`. 19/20 lệnh về, exit 0 cả; lệnh E8 không có kết quả vì agent chạy nó kết thúc
mà không nộp StructuredOutput (sự cố hạ tầng agent, dòng run-log `kind: vang-mat`). Phiên điều
phối chạy tay đúng lệnh E8 trên HEAD: exit 0. Không phương sai. 21 dòng run-log append nguyên văn.

**Ba finding TRONG hợp đồng** (phiên điều phối tái hiện hai, mục thứ ba đọc mã): AC-6 lớp quét
phân biệt hoa thường; AC-11 chỉ kiểm có mặt không đếm «đúng một hàng»; AC-1 chuỗi ảnh không neo
vào lệnh docker run. Người ký chọn sửa cả ba tại `0d3c124` kèm ba ca răng, E7 ghim 32/32.

**Luật chặn xoáy, người ký duyệt 07/09 trước vòng 7:** sau vòng 7, mọi finding TRONG hợp đồng còn
lại chuyển thành amendment nợ có tên trong contract và ký; mọi finding NGOÀI hợp đồng thành
known-limits có tên; không vòng 8. Lý do: vòng 4, 5, 6 mỗi vòng lộ thêm lỗi mới của chính phép đo
(«vòng xoáy guard-của-guard»), lối ra là thu phạm vi với nợ có tên, không phải vá tiếp.

**Ngoài hợp đồng, mới:** năm dòng miễn trừ `app.tongflow.com` không ghim ngữ cảnh — known-limits.
Ba mục còn lại trùng Known limits đã ký (hình 5, suite-key, fixture rò).

## Vòng 7 và vòng 8 — luật chặn xoáy áp dụng, PASS tại `bb2b05d`

**Vòng 7** (`bb2b05d`): 12 finding, KHÔNG mục nào trong hợp đồng — tất cả thành nợ có tên
(mục Amendment trong contract, mục [VÒNG 7] trong review-findings). Phán quyết máy BLOCKED vì
hạ tầng: agent E9 chết không nộp kết quả; agent E8 báo exit 1 dưới tải 20 lệnh song song trong
khi output nó dán cho thấy nó đọc «8 đỏ trên cây đã phá» của bộ răng thành 8 lỗi. Chạy tuần tự
cùng HEAD: E8 exit 0, E9 exit 0.

**Vòng 8** (cực gọn, cùng HEAD `bb2b05d`, mang theo 9 ô xanh của vòng 7 bằng `carriedEvals`, chỉ
chạy lại E8, E9 và suite): verdict `PASS`, failed `[]`, blocked `0`.
Run-log vòng 7 và 8 append nguyên văn từ kết quả workflow (bộ tổng hợp vẫn `run_log_write_failed`).

**Lượt ghi này** điền `human_signoff`, Known limits (7 mục đã ký + nợ có tên từ Amendment) và
Ngoài hợp đồng (từ review-findings) vào evidence — hai mục mà bộ tổng hợp kit luôn để rỗng khiến
lưới trước merge đọc hồ sơ là «xanh-sạch, không mời ký».
