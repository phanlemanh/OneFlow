---
schema_version: 2
feature_slug: gate-scope-anchors
verdict: PASS
failed_evals: []
reason:
verified_by: acceptance-verify workflow, 3 rounds of fresh-context agents + a final re-run on the signed tree
enforcement_mode: strict
bypass_used: false
verified_commit: 9cebc5682ef51ff21a657118b83ff2581160407b
rounds: 3
human_signoff: Manh 2026-08-04
network_dependent_evals: [E9, E11]
---

# Evidence Report: gate-scope-anchors (hạng mục 0.6)

13/13 eval xanh trên cây cuối; 12/12 tiêu chí có eval đo. Ngoài eval:
`case-completeness` của cả hai harness, `pnpm lint:check`, `pnpm typecheck`
xanh; không hồi quy 14/14 case của `check-stale-scoping.sh` và
`check-stale-real-repo.sh`.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-7 | script | PASS |
| E9 | AC-8 | script | PASS |
| E10 | AC-10 | script | PASS |
| E11 | AC-9 | script | PASS |
| E12 | AC-11 | script | PASS |
| E13 | AC-12 | script | PASS |

## Evidence

- eval: E1
  run_id: gsa-final-01
  exit_code: 0
  baseline: red
  verifier: config:executors.script.gate_ns_exempt_refused
  verified_at: 2026-08-04T15:03:20Z
  output: |
    CASE exempt-refused: PASS

- eval: E2
  run_id: gsa-final-02
  exit_code: 0
  baseline: red
  verifier: config:executors.script.gate_ns_variants_red
  verified_at: 2026-08-04T15:03:20Z
  output: |
    CASE variants-discriminating: PASS

- eval: E3
  run_id: gsa-final-03
  exit_code: 0
  baseline: red
  verifier: config:executors.script.gate_ns_legit_granted
  verified_at: 2026-08-04T15:03:20Z
  output: |
    CASE legit-granted: PASS

- eval: E4
  run_id: gsa-final-04
  exit_code: 0
  baseline: red
  verifier: config:executors.script.own_range_anchored
  verified_at: 2026-08-04T15:03:20Z
  output: |
    CASE anchored: PASS

- eval: E5
  run_id: gsa-final-05
  exit_code: 0
  baseline: red
  verifier: config:executors.script.own_range_unlanded
  verified_at: 2026-08-04T15:03:20Z
  output: |
    CASE unlanded: PASS

- eval: E6
  run_id: gsa-final-06
  exit_code: 0
  baseline: red
  verifier: config:executors.script.own_range_malformed
  verified_at: 2026-08-04T15:03:20Z
  output: |
    CASE malformed: PASS

- eval: E7
  run_id: gsa-final-07
  exit_code: 0
  baseline: red
  verifier: config:executors.script.b1_anchored_green
  verified_at: 2026-08-04T15:03:20Z
  output: |
    workflow drift vs the range ci-actions-bump owns (4d89b584fcfd3dfafd03823a14c9b81406db6e9b..8477f8a08f26b792b3

- eval: E8
  run_id: gsa-final-08
  exit_code: 0
  baseline: red
  verifier: config:executors.script.b1_violation_red
  verified_at: 2026-08-04T15:03:20Z
  output: |
    CASE b1-red: PASS

- eval: E9
  run_id: gsa-final-09
  exit_code: 0
  baseline: red
  verifier: config:executors.script.b2_runs_found
  verified_at: 2026-08-04T15:03:20Z
  output: |
    dispatched desktop dry run succeeded, and reached every step that carries a bumped action

- eval: E10
  run_id: gsa-final-10
  exit_code: 0
  baseline: red
  verifier: config:executors.script.b2_no_run_exit2
  verified_at: 2026-08-04T15:03:20Z
  output: |
    CASE no-run-exit2: PASS

- eval: E11
  run_id: gsa-final-11
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ghcr_anchored
  verified_at: 2026-08-04T15:03:20Z
  output: |
    no publish occurred during the dry run

- eval: E12
  run_id: gsa-final-12
  exit_code: 0
  baseline: red
  verifier: config:executors.script.anchors_backfilled
  verified_at: 2026-08-04T15:03:20Z
  output: |
    CASE backfill-integration: PASS

- eval: E13
  run_id: gsa-final-13
  exit_code: 0
  baseline: red
  verifier: config:executors.script.b1_unanchored_compat
  verified_at: 2026-08-04T15:03:20Z
  output: |
    CASE unanchored-compat: PASS


## Ba vòng, ba lỗi thật — cùng MỘT họ

Mỗi vòng nghiệm thu tìm đúng một lỗi trong code của chính hợp đồng này. Cả ba
là cùng một sai lầm tư duy: **gắn một câu hỏi vào điều kiện GẦN ĐÚNG thay vì
điều kiện thật.**

| Vòng | Lỗi | Điều kiện gần đúng đã dùng | Điều kiện thật |
|---|---|---|---|
| 1 | `anchor_tip` lui về HEAD cục bộ; `anchor_commits` trả rỗng (đọc thành "chưa neo") | "kết quả có rỗng không" | "có hỏi neo không" |
| 2 | Lỗi `gh` thoáng qua ở commit A → chấm run của commit B là xanh | "chuỗi trả về có rỗng không" | "gh hỏng, hay gh nhìn rồi không thấy" |
| 3 | Cửa sổ GHCR rỗng cho feature đã neo nhưng chưa merge → in `ok` | "có slug không" | "đã hạ cánh chưa" |

Vòng 1 và 2 không phải fail-open sống (mọi caller chạy dưới `set -euo
pipefail`); vòng 3 là latent (hai chỗ gọi đang neo vào `ci-actions-bump` đã
merge, và nửa quyết định bằng log không bị ảnh hưởng). Cả ba đã sửa và
**mutation-test hai chiều**: đưa lỗi quay lại thì đúng case đó đỏ.

Họ lỗi này nay có guard thi hành, không còn dựa vào trí nhớ:

- Ba giá trị độc — `UNKNOWN_WORKFLOW_KEY` (có sẵn), `ANCHOR_UNRESOLVED`,
  `LOOKUP_FAILED` — vì `exit` trong subshell chỉ giết subshell đó, nên lời từ
  chối phải đi như **dữ liệu** mới tới được chỗ ra quyết định.
- `assert_window_sane`: cửa sổ kết thúc trước khi bắt đầu = câu hỏi không trả
  lời được = exit 2, không phải "không có gì xảy ra".
- E6 assert mọi script `source` `gh-run-lib.sh` phải khai `set -e` — biến bất
  biến đi mượn thành bất biến được kiểm.

## Bằng chứng then chốt

**Neo phải là TẬP commit, không phải một sha.** Mutation: chỉ thử commit mới
nhất → tra run dispatch exit 2. PR #17 có run CI ở `60c4797` nhưng hai run
dispatch ở `b48699c6`. Một neo-một-sha sẽ trông đúng khi review và hỏng đúng
chỗ này.

**Ba guard từng chặn merge nay chạy trung thực.** `check-workflow-drift`
anchored chấm đúng diff của PR #17 (16 dòng pin + guard dry-run ±1) thay vì
xanh rỗng vì compose-overlay không đụng `.github/workflows`.

**Phép kiểm tích hợp không grep cả file.** `anchored-keys.py` giải đúng những
key mà `evals.yaml` của ba hồ sơ tham chiếu, và tách `&&` — vì key của chính
hợp đồng này cũng chứa chuỗi `ACCEPTANCE_SLUG=<slug>`, nên một `grep` cả file
sẽ xanh trong khi key thật vẫn chạy không neo.

## Hai con số phải sửa so với báo giá ở Cổng 1

1. **13 hồ sơ stale, không phải 6–7.** Nhóm cache KHÔNG thoát nhờ scope hẹp:
   `_acceptance/<slug>/` của chúng nằm trong diff của PR này, nên cross-check
   độ phủ kích hoạt và đòi glob khai báo phủ toàn bộ gated diff. Eval của
   chúng là pytest local nên vẫn rẻ.
2. **`check-stale-golden.sh` đã đỏ TRƯỚC mọi thay đổi của hợp đồng này**
   (xác minh bằng `git stash`): golden thiếu 4 dòng NOTE gap-probe do bản kit
   mới sinh. Vòng re-verify của `stale-scope-by-paths` vì thế không hoàn toàn
   cơ học — phải regen golden trước. Việc của hồ sơ đó.

## Giới hạn đã biết

- **E9/E11 phụ thuộc mạng + `gh` auth** — không wire vào CI, đúng tiền lệ
  guard clone-plugin của compose-overlay. Hết retention run của GitHub thì
  exit 2 là hành vi đúng và trung thực.
- **Nửa đối chứng registry của E11 là "không nhìn được"** với token hiện tại
  (thiếu `read:packages`) — hành vi có sẵn, không do hợp đồng này gây ra.
  Verdict tựa trên nửa quyết định (log của run). Logic cửa sổ vì thế được
  chứng minh bằng `assert_window_sane` + đối chứng jq, không phải end-to-end.
- **`head_sha` và `run_json`** (có trước hợp đồng này) vẫn dùng `exit` trần
  trong ngữ cảnh subshell; an toàn vì mọi consumer khai `set -e`, và nay có
  guard kiểm chính điều đó. Sửa chúng nằm ngoài phạm vi 0.6.
- **Sau vòng 3** còn một finding LOW trong hợp đồng được đóng thêm:
  `scope_has_any_match` đọc `ls-files` không đặt `core.quotePath=false` nên
  đánh vần đường dẫn phi-ASCII khác `stale_files`. Hướng lệch là fail-closed
  (từ chối scope oan), nhưng chính chú thích của hàm khẳng định hai bên hỏi
  cùng một không gian — đã sửa + E3 phủ + mutation-test.
- **Vòng 4 không chạy** — quyết định của Manh 04/08 sau khi cân chi phí
  (~2.8M token/vòng) với việc cả ba lỗi đã quy về một họ nay có guard.
