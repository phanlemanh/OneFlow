---
schema_version: 2
feature_slug: hai-duong-chay-mot-venv
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 80b4cbec60ace54e1dad8d09a74c9fb365899b74
human_signoff: Phan Le Manh 2026-09-09
---

# Evidence Report: hai-duong-chay-mot-venv

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E2b | AC-2 | test | PASS |
| E3a | AC-3 | test | PASS |
| E14 | AC-12 | test | PASS |
| E3b | AC-3 | test | PASS |
| E15 | AC-12 | test | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-4 | script | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-8 | test | PASS |
| E10 | AC-9 | test | PASS |
| E10b | AC-9 | test | PASS |
| E11 | AC-10 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-hai-duong-chay-mot-venv-E1-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_venv_per_plugin
  verified_at: 2026-09-09T08:05:00+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.03s

- eval: E2
  run_id: minted-hai-duong-chay-mot-venv-E2-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_legacy_shared_removed
  verified_at: 2026-09-09T08:05:00+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.23s

- eval: E2b
  run_id: minted-hai-duong-chay-mot-venv-E2b-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_legacy_removal_failure_raises
  verified_at: 2026-09-09T08:05:00+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E3a
  run_id: minted-hai-duong-chay-mot-venv-E3a-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_engine_leaves_per_plugin_layout
  verified_at: 2026-09-09T08:05:00+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.32s

- eval: E14
  run_id: minted-hai-duong-chay-mot-venv-E14-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_engine_leaves_per_plugin_layout
  verified_at: 2026-09-09T08:05:00+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.32s

- eval: E3b
  run_id: minted-hai-duong-chay-mot-venv-E3b-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_ts_keeps_per_plugin_venvs
  verified_at: 2026-09-09T08:05:00+07:00
  output: |
    Tests  1 passed | 13 skipped (14)
    Start at  07:14:30
    Duration  265ms (transform 30ms, setup 0ms, import 26ms, tests 18ms, environment 0ms)

- eval: E15
  run_id: minted-hai-duong-chay-mot-venv-E15-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_ts_keeps_per_plugin_venvs
  verified_at: 2026-09-09T08:05:00+07:00
  output: |
    Tests  1 passed | 13 skipped (14)
    Start at  07:14:30
    Duration  265ms (transform 30ms, setup 0ms, import 26ms, tests 18ms, environment 0ms)

- eval: E4
  run_id: minted-hai-duong-chay-mot-venv-E4-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hdc_layout_constant_pinned
  verified_at: 2026-09-09T08:05:00+07:00
  output: |
    python:     .tongflow,plugin-venv
    typescript: .tongflow,plugin-venv
    OK: both runtimes pin the same venv root

- eval: E5
  run_id: minted-hai-duong-chay-mot-venv-E5-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hdc_layout_constant_teeth
  verified_at: 2026-09-09T08:05:00+07:00
  output: |
    PASS [python-file-missing]
    PASS [ts-file-missing]
    6/6 PASS

- eval: E6
  run_id: minted-hai-duong-chay-mot-venv-E6-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_sdk_from_checkout
  verified_at: 2026-09-09T08:05:00+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.24s

- eval: E7
  run_id: minted-hai-duong-chay-mot-venv-E7-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_sdk_from_pypi_pin
  verified_at: 2026-09-09T08:05:00+07:00
  output: |
    1 passed in 0.17s

- eval: E8
  run_id: minted-hai-duong-chay-mot-venv-E8-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_provision_failure_raises
  verified_at: 2026-09-09T08:05:00+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.13s

- eval: E9
  run_id: minted-hai-duong-chay-mot-venv-E9-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_auto_install_false_keeps_ambient
  verified_at: 2026-09-09T08:05:00+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E10
  run_id: minted-hai-duong-chay-mot-venv-E10-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_interpreter_per_plugin
  verified_at: 2026-09-09T08:05:00+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E10b
  run_id: minted-hai-duong-chay-mot-venv-E10b-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_runner_uses_plugin_interpreter
  verified_at: 2026-09-09T08:05:00+07:00
  output: |
    1 passed in 0.12s

- eval: E11
  run_id: minted-hai-duong-chay-mot-venv-E11-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_unsafe_plugin_id_rejected
  verified_at: 2026-09-09T08:05:00+07:00
  output: |
    .....                                                                    [100%]
    5 passed in 0.02s

### Lệnh suite (hồi quy)

- cmd: bash scripts/acceptance/preflight-verify-env.sh
  run_id: minted-hai-duong-chay-mot-venv-SUITE-bash_scripts_acceptance_preflight_verify-r8
  exit_code: 0
  verified_at: 2026-09-09T08:05:00+07:00

- cmd: node scripts/roadmap/check-plan-freeze.mjs
  run_id: minted-hai-duong-chay-mot-venv-SUITE-node_scripts_roadmap_check_plan_freeze_m-r8
  exit_code: 0
  verified_at: 2026-09-09T08:05:00+07:00

- cmd: pnpm build && pnpm typecheck
  run_id: minted-hai-duong-chay-mot-venv-SUITE-build_typecheck-r8
  exit_code: 0
  verified_at: 2026-09-09T08:05:00+07:00

- cmd: pnpm lint:check
  run_id: minted-hai-duong-chay-mot-venv-SUITE-lint_check-r8
  exit_code: 0
  verified_at: 2026-09-09T08:05:00+07:00

- cmd: pnpm test
  run_id: minted-hai-duong-chay-mot-venv-SUITE-test-r8
  exit_code: 0
  verified_at: 2026-09-09T08:05:00+07:00

- cmd: cd sdk && . ../scripts/lib/sdk-version.sh && pin=$(reader_pin) && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions --with "${pin:?no vietnormalizer pin derived from sdk/pyproject.toml}" python -m pytest -q
  run_id: minted-hai-duong-chay-mot-venv-SUITE-scripts_lib_sdk_version_sh_pin_reader_pi-r8
  exit_code: 0
  verified_at: 2026-09-09T08:05:00+07:00

- cmd: pnpm verify:plugins
  run_id: minted-hai-duong-chay-mot-venv-SUITE-verify_plugins-r8
  exit_code: 0
  verified_at: 2026-09-09T08:05:00+07:00

- cmd: pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json
  run_id: minted-hai-duong-chay-mot-venv-SUITE-gen_abi-r8
  exit_code: 0
  verified_at: 2026-09-09T08:05:00+07:00

- cmd: bash scripts/fork/check-fork-identity.sh
  run_id: minted-hai-duong-chay-mot-venv-SUITE-bash_scripts_fork_check_fork_identity_sh-r8
  exit_code: 0
  verified_at: 2026-09-09T08:05:00+07:00

### Re-pin lần 1 — 09/09/2026, do bump hằng số ăn khớp `scripts/ci/check-eval-filters-teeth.sh` (38 → 39, Ngoài-1 của vòng 8, owner định đoạt «nâng phạm vi sửa ngay») SAU mốc verify `fa92162`, và chữ ký Cổng 2 cùng lượt. File ấy không thuộc `paths` của ô đo nào trong hồ sơ này nên luật eval-lane không đòi chạy lại ô nào; mã sản phẩm của gói không đổi. Lane máy 9 lệnh suite chạy trên cây đã ký, mọi lệnh exit 0

run_id: repin-hai-duong-chay-mot-venv-20260909T004305Z
sha: 80b4cbec60ace54e1dad8d09a74c9fb365899b74 · prev_sha: fa92162064b30a54f09c722c2a0a3ed2ba1ee9f7 · suites: 9 lệnh exit 0

## Known limits

## Ngoài hợp đồng

## Analyst

carried từ round trước — baseline không đo lại round này (P2: evals.yaml không đổi từ lần đo baseline cuối). Mọi field `baseline:` ở trên ghi `n-a` vì round này không đo lại — không kết luận được eval nào không-phân-biệt ở chính round 8; kết luận không-phân-biệt gần nhất (nếu có) thuộc round baseline trước, không lặp lại ở đây.

none — không có eval nào được đo baseline ở round này để xếp vào danh sách không-phân-biệt.

## Variance

none — không có eval nào mang field runs > 1 trong vòng này; mọi eval là deterministic (0/1 hoặc 1/1).

## Iterations

Round 1: 13/13 ô đo và 9/9 suite hồi quy xanh nhưng REJECT vì 4 finding trong hợp đồng — `shutil.rmtree(ignore_errors=True)` nuốt lỗi dọn venv đời cũ (HIGH, vòng phá nhau tái vũ trang trên đường thất-bại-một-phần); `re.match` với `$` nhận id có xuống dòng cuối trong khi luật TS từ chối; guard chỉ grep tên hàm nên xoá riêng chỗ gọi vẫn xanh; thiếu ca thử cho hai lỗ trên. Sửa cả bốn, thêm E2b và 2 ca răng, quay lại implementation.

Round 2: tại Cổng 2 owner nâng phạm vi thêm AC-11/AC-12/AC-13 (khi đó AC-3/AC-4 mới là khẳng định chứ chưa chứng minh). Thi công xong ba tiêu chí (AC-13 anchor hai cụm, AC-11 nối vào ci.yml kèm tự khẳng định, AC-12 lấy `relative_dir` từ hàm tính đường dẫn thay vì tên thư mục) — bằng chứng chuyển sang vòng verify kế tiếp.

Round 3: REJECT với đúng 2 finding trong hợp đồng, cả hai cùng một lớp fail-open với finding HIGH của round 1 — guard AC-11 tự tắt trong im lặng khi `ci.yml` vắng. Luật chặn xoáy được áp lần đầu tại đây: không tự dispatch round 4, đưa ba lối lên cho owner quyết.

Round 4 (khai VÒNG CUỐI theo trần T3 trước khi dispatch): sửa đúng một khuyết điểm (fail-closed guard AC-11 + đối chiếu lại expected của E5/E8/E13) rồi trả REJECT với 4 finding trong hợp đồng — 3 trong 4 lộ ra rằng chính AC-11/AC-13 (hai tiêu chí mở rộng để chứng minh AC-3/AC-4 có răng) tự chúng lại là phép đo không có răng; finding thứ 4 là lần thứ ba của lớp fail-open. Số finding trong hợp đồng đi 4 → 0 → 2 → 4, không hội tụ — hết trần T3, owner quyết ở Cổng 2: descope AC-11/AC-13 (gỡ E12/E13/E16, còn 11 tiêu chí/16 ô đo); AC-12 ở lại vì chiều đỏ của nó đã đo tận tay.

Round 5 (lượt phát biểu lại owner cho phép trên đúng cây `ec9849c`, mã không đổi — không tính là round review thứ năm theo trần): phát biểu lại phán quyết cho khớp hợp đồng đã rút. Lộ ra ca thử AC-9 dùng khẳng định chuỗi-có-mặt (`pid in py`) thay vì quan hệ đẳng thức. Owner cho thêm một round (round 6) sửa đúng gốc này, ràng buộc: finding khác gốc thì dừng hẳn.

Round 6: sửa AC-9 sang đẳng thức đường dẫn ở cả hai ca thử (Python + TypeScript), thêm đối chứng dương. Cùng round này còn phải sửa gốc guard "đếm-chú-thích-là-chỗ-gọi" lộ trước đó, vì thẻ Cổng 2 từ chối ký lên evidence còn mang verdict REJECT tồn đọng — cắt cả chú thích đầu dòng lẫn cuối dòng, thêm ca răng thứ 13. Hết finding trong hợp đồng, ca răng 13/13.

Round 7: REJECT với 2 finding HIGH trong hợp đồng, cùng hình dạng với round 6 nhưng khác dạng văn bản — guard đếm tên hàm trong docstring/string literal (Python) và trong JSDoc một dòng/string literal (TypeScript, chưa từng có ca răng nào) là chỗ gọi sống. Bảy round, bảy lỗ khác nhau trong cùng một guard dựng bằng `grep` trên văn bản — máy không tự chạy và không khuyên round 8, khuyến nghị duy nhất là rút AC-4.

Round 8 (lượt phát biểu lại "lối A" — owner chọn sau round 7, khai trước khi dispatch: finding trong hợp đồng nếu có quay lại owner, máy không tự vá): guard AC-4 bị cắt về so hằng đường dẫn hai phía, rút ba khẳng định text-grep ("hàm dọn còn được gọi", "docstring đúng", "CI có chạy guard") khỏi cả AC-4 lẫn guard; ca răng rút từ 13 xuống còn 6 ca hằng-số (đổi giá trị · xoá hằng · xoá tệp, mỗi ca hai phía). Vòng dispatch thứ 8 này: toàn bộ 16 eval máy (E1, E2, E2b, E3a, E14, E3b, E15, E4, E5, E6, E7, E8, E9, E10, E10b, E11) PASS (exit 0), và toàn bộ 9 lệnh suite hồi quy PASS (exit 0). Hội đồng vẫn tìm ra 1 finding trong hợp đồng (medium, AC-7 — eval E8 chỉ phủ MỘT nhánh của lời hứa lớp "pip trả khác 0", thiếu ba nhánh còn lại) và 4 finding ngoài hợp đồng (1 high — hằng số ăn khớp trong `check-eval-filters-teeth.sh` chưa bump theo bộ lọc `-t` thứ 39 vừa thêm; 3 low). Theo ràng buộc đã khai trước dispatch, finding ngoài hợp đồng vào Known limits/review-findings; finding trong hợp đồng về owner tại Cổng 2, không tự vá thêm. Không eval nào đỏ, không judgment item nào UNCERTAIN — verdict PASS.