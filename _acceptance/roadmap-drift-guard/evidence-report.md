---
schema_version: 2
feature_slug: roadmap-drift-guard
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c342d258487ff028dedd16cd6d18d5ba2fb3524e
human_signoff:
---

# Evidence Report: roadmap-drift-guard

Vòng 2. Bản này **thay thế** hồ sơ vòng 1 (PASS 11/11 tại `91f0f25`), không bổ sung
vào nó: sau vòng 1 thi công đã ĐỔI CODE để vá ba chỗ bộ eval yếu hơn hợp đồng, nên
mọi bằng chứng vòng 1 đã ôi. Toàn bộ 11 eval dưới đây chạy lại từ đầu trên
`c342d25`, cộng năm đột biến do người kiểm tự dựng để phản-chứng ba lời tuyên bố vá.

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
| E11 | AC-4 | script | PASS |

## Evidence

- eval: E1
  run_id: roadmap-drift-guard-r2-E1-20260827T091251Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_adr_uncited
  verified_at: 2026-08-27T09:12:51Z
  output: |
    → răng: case adr-uncited
      ✓ CASE adr-uncited: PASS
    # Token nhãn khớp `expected`. Nửa NỘI DUNG của `expected` (id kèm tiêu đề khác
    # rỗng) được phản-chứng bằng đột biến M-A — xem `## Ngoài hợp đồng`.

- eval: E2
  run_id: roadmap-drift-guard-r2-E2-20260827T091251Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_superseded_bare
  verified_at: 2026-08-27T09:12:51Z
  output: |
    → răng: case superseded-bare
      ✓ CASE superseded-bare: PASS
    # Nửa "trích dẫn ≤ 110 ký tự" được phản-chứng bằng M-B(i) và M-B(ii). M-B(ii)
    # nới cắt chuỗi 110 → 500 mà KHÔNG đổi hành vi đỏ/xanh, và case đã nêu đích
    # danh `trích dẫn 490 ký tự — vượt 110`. Ngưỡng 110 là ngưỡng thật.

- eval: E3
  run_id: roadmap-drift-guard-r2-E3-20260827T091251Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_superseded_paired
  verified_at: 2026-08-27T09:12:51Z
  output: |
    → răng: case superseded-paired
      ✓ CASE superseded-paired: PASS
    # Nửa suppression: case tự khẳng định nửa ĐỎ trước rồi mới vá khối và đòi XANH,
    # nên một guard hằng-số không qua được cả hai chiều.

- eval: E4
  run_id: roadmap-drift-guard-r2-E4-20260827T091252Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_ledger_missing
  verified_at: 2026-08-27T09:12:52Z
  output: |
    → răng: case ledger-missing
      ✓ CASE ledger-missing: PASS
    # `expected` đòi thông điệp gọi đúng tên `local-cpu-plugins` kèm cụm
    # `chưa được phân loại trong sổ cái`; đột biến M-C xoá tên slug khỏi thông điệp
    # (giữ nguyên đỏ/xanh) và case này đã bắt được.

- eval: E5
  run_id: roadmap-drift-guard-r2-E5-20260827T091252Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_ledger_stale
  verified_at: 2026-08-27T09:12:52Z
  output: |
    → răng: case ledger-stale
      ✓ CASE ledger-stale: PASS
    # Chiều ngược của E4; cùng đột biến M-C cũng làm case này ĐỎ.

- eval: E6
  run_id: roadmap-drift-guard-r2-E6-20260827T091252Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_historical
  verified_at: 2026-08-27T09:12:52Z
  output: |
    → răng: case historical-244cb0b
      ✓ CASE historical-244cb0b: PASS
    # Nhiễu không synthetic: `git show 244cb0b:docs/roadmap.md` phân giải được trong
    # worktree này, nên case dựng đúng cây có cú trôi ADR-0005/0011 hai tuần.

- eval: E7
  run_id: roadmap-drift-guard-r2-E7-20260827T091252Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_case_isolation
  verified_at: 2026-08-27T09:12:52Z
  output: |
    → răng: case case-isolation
      ✓ CASE case-isolation: PASS
    # Nửa (a): case này gọi riêng chín case anh em và đòi token nhãn của từng cái.
    # Nửa (b): `--case khong-ton-tai` bị từ chối ồn ào (mã thoát khác 0 + in danh
    # sách case hợp lệ), người kiểm đã chạy tay để không tin lời harness tự khai.
    # Nửa "case hỏng phải dừng khác 0" của AC-7 không có eval nào giữ; người kiểm
    # chứng minh bằng M-A: adr-uncited hoá ĐỎ trong khi ledger-missing vẫn XANH ở
    # cùng một cây — hai case không dùng chung mã thoát.

- eval: E8
  run_id: roadmap-drift-guard-r2-E8-20260827T091254Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_drift_green
  verified_at: 2026-08-27T09:12:54Z
  output: |
    → kiểm tra trôi giữa docs/roadmap.md, docs/adr/ và _acceptance/
       sổ cái: 21 hạng mục đã ký, 21 dòng trong sổ
    ✅ docs/roadmap.md khớp với docs/adr/ và _acceptance/ — không có trôi.
    # Dòng đếm CÓ MẶT, hai số BẰNG NHAU (21 = 21) và khác 0 — đúng ba điều
    # `expected` đòi. Đây là chốt chặn chống guard nổ vô điều kiện.

- eval: E9
  run_id: roadmap-drift-guard-r2-E9-20260827T091254Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_supersede_source_single
  verified_at: 2026-08-27T09:12:54Z
  output: |
    → răng: case supersede-source-single
      ✓ CASE supersede-source-single: PASS
    # Người kiểm dựng thêm đột biến M-E (thay khối đọc bảng README bằng một Map
    # cứng) — đúng hồi quy AC-9 sinh ra để chặn. Chỉ case này ĐỎ; superseded-bare
    # và superseded-paired vẫn XANH, tức nó là cái duy nhất sẽ kêu.

- eval: E10
  run_id: roadmap-drift-guard-r2-E10-20260827T091254Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_alias_cited_true
  verified_at: 2026-08-27T09:12:54Z
  output: |
    → kiểm mọi lệnh `pnpm roadmap:*` được viện dẫn đều có thật
       ✓ pnpm roadmap:check → bash scripts/roadmap/check-roadmap-fresh.sh  (viện dẫn ở 3 chỗ)
       ✓ pnpm roadmap:check-alias → bash scripts/roadmap/check-roadmap-alias-cited.sh  (viện dẫn ở 1 chỗ)
       ✓ pnpm roadmap:teeth → bash scripts/roadmap/check-roadmap-guard-teeth.sh  (viện dẫn ở 2 chỗ)
    ✅ 3 lệnh được viện dẫn, tất cả đều được khai và trỏ đúng file.
    → nửa (b): chạy thật qua pnpm (bỏ qua `roadmap:check-alias` — đệ quy)
       ✓ pnpm roadmap:check chạy tới cùng, exit 0
       ✓ pnpm roadmap:teeth chạy tới cùng, exit 0
    ✅ mọi alias được viện dẫn đều khai đúng VÀ chạy được.
    # Nửa (b) THẬT SỰ chạy qua `pnpm`, không chỉ đọc khai báo — phản-chứng bằng M-D.

- eval: E11
  run_id: roadmap-drift-guard-r2-E11-20260827T091258Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_ledger_paired
  verified_at: 2026-08-27T09:12:58Z
  output: |
    → răng: case ledger-paired
      ✓ CASE ledger-paired: PASS
    # Nửa KHÔNG-nổ của cặp E4/E5: một slug vừa ký vừa có dòng sổ cái, kiểm C im.

## Analyst

Không có nhánh baseline chạy được. Merge-base với `main` là `068aa40`, và trên cây
đó **`scripts/roadmap/` chưa tồn tại** cùng **không alias `roadmap:*` nào trong
`package.json`** — mọi executor của 11 eval đều vắng mặt, nên `baseline: n-a` là sự
thật chứ không phải né tránh. Hệ quả đọc được: không eval nào "xanh trên cả hai cây",
vì trên cây cũ không eval nào chạy nổi.

Sức phân biệt được đo bằng đường khác, mạnh hơn A/B: người kiểm dựng năm đột biến
trên chính cây này (M-A, M-B(i), M-B(ii), M-C, M-D) cộng một đột biến tự nghĩ (M-E).
Bốn đột biến đầu **chỉ làm nghèo thông điệp, không đổi hành vi đỏ/xanh của guard** —
đã kiểm riêng: với cả ba thông điệp bị làm nghèo cùng lúc, guard vẫn dừng ở mã khác 0
và vẫn nêu `ADR-0099 không được nhắc lần nào trong docs/roadmap.md` (chỉ mất phần
tiêu đề). Mỗi đột biến làm ĐÚNG case tương ứng hoá ĐỎ trong khi các case anh em vẫn
XANH. Đó là bằng chứng trực tiếp cho cả AC-7 (mã thoát không dùng chung) lẫn cho lời
tuyên bố vòng 2 rằng bộ răng nay khẳng định nội dung.

Ba chỗ vòng 1 nêu, phán quyết vòng 2:
1. **Răng khẳng định nội dung — ĐÃ ĐÓNG.** M-A / M-B(i) / M-B(ii) / M-C đều làm case
   liên quan hoá đỏ. Riêng câu hỏi "một trích dẫn 500 ký tự có lọt không": KHÔNG —
   M-B(ii) nới 110 → 500 và case nêu đích danh `trích dẫn 490 ký tự — vượt 110`.
   Đọc thẳng phần khẳng định (`check-roadmap-guard-teeth.sh` ~dòng 206–213): regex
   không tham lam bắt tới `…"` rồi `len(...) > 110` chặn — đó là ràng buộc thật, không
   phải khẳng định trang trí.
2. **E10 chạy thật qua pnpm — ĐÃ ĐÓNG.** M-D làm `check-roadmap-fresh.sh` chết lúc
   chạy trong khi `package.json` vẫn khai đúng và file vẫn tồn tại: nửa (a) in ✅ như
   cũ, nửa (b) hoá đỏ và gọi đích danh `pnpm roadmap:check`.
3. **Câu chữ AC-7 — ĐÃ ĐÓNG.** Câu mới nói thẳng cả nghĩa khẳng định ("mỗi nhiễu có
   một lần gọi riêng và mã thoát của lần gọi đó chỉ nói về nó", kèm "case đạt thoát 0,
   case hỏng thoát khác 0") lẫn nghĩa phủ định ("KHÔNG có nghĩa mỗi case một giá trị
   số khác nhau"). Cách đọc số học không còn chỗ đứng.

## Variance

none — không eval nào khai `runs > 1`; cả 11 eval là script tất định, mỗi eval chạy
đúng một lần.

## Iterations

Round 1 (`91f0f25`): 11/11 đạt, nhưng người kiểm nêu ba chỗ bộ eval yếu hơn hợp đồng
(răng chỉ đo đỏ/xanh; E10 chỉ đọc khai báo; câu chữ AC-7 hai nghĩa). Thi công đổi
code → hồ sơ vòng 1 ôi và bị thay, không phải bổ sung.
Round 2 (`c342d25`): 11/11 đạt; ba chỗ trên được phản-chứng bằng năm đột biến do
người kiểm tự dựng, cả ba đều đóng. Cây làm việc để lại sạch.

## Known limits

- **Nửa (b) của E10 tự nhận diện alias của chính nó bằng cách so chuỗi lệnh với
  `check-roadmap-alias-cited.sh`.** Đổi tên file script sẽ làm `self_alias` rỗng và
  vòng lặp gọi lại chính nó — đệ quy không đáy. Không eval nào giữ chỗ này.
- **Nửa (b) fail-open khi không có chỗ nào viện dẫn.** Lớp node thoát sớm (mã 0) khi
  `cited.size === 0` và không ghi `$ALIAS_LIST`, nên lớp bash lặp trên file rỗng rồi
  in ✅. Một cây đã xoá sạch mọi câu "chạy `pnpm roadmap:*`" sẽ xanh một cách rỗng.
  Hợp đồng không đòi khác, nhưng đây là khe fail-open đúng loại mà AC-10 sinh ra để
  chặn.
- **`case-isolation` khẳng định token nhãn CÓ MẶT, không khẳng định "đúng một".**
  AC-7 viết "kèm **đúng một** token nhãn"; assertion thật là `grep -q`, tức có ≥ 1 là
  đủ. Một bản sửa in token hai lần vẫn xanh. Lệch nhỏ giữa câu chữ và phép đo.
- **Nửa "case hỏng phải dừng khác 0" của AC-7 không có eval nào giữ.** `case-isolation`
  chỉ chạy các case ĐẠT. Người kiểm phải tự dựng M-A mới chứng minh được chiều này.
- **`baseline: n-a` cho cả 11 eval** — executor không tồn tại trên merge-base
  `068aa40`, nên không có đối chứng A/B; sức phân biệt suy ra từ đột biến, không từ
  diffBase.
- **E6 phụ thuộc `git show 244cb0b` phân giải được.** Một clone nông làm eval này
  *không chạy được*, chứ không phải *hỏng* — CI shallow sẽ báo sai loại.
- **E10 kéo theo cả bộ răng.** Nửa (b) chạy `pnpm roadmap:teeth` đầy đủ (10 case,
  trong đó `case-isolation` gọi lồng chín lần), nên chi phí E10 tăng theo bộ răng và
  không có mốc thời gian chặn.

## Ngoài hợp đồng

Sáu đột biến do người kiểm tự dựng để phản-chứng lời tuyên bố vá; tất cả chạy trong
worktree rồi khôi phục bằng `git checkout --`, cây làm việc để lại sạch (`git status
--porcelain` chỉ còn hai file trong `_acceptance/roadmap-drift-guard/`: run-log được
nối thêm 11 dòng vòng 2, và chính báo cáo này).

- **M-A** — bỏ `— "${title}"` khỏi thông điệp kiểm A. Guard vẫn ĐỎ và vẫn nêu ADR-0099
  (đã kiểm riêng bằng fixture dựng tay). `adr-uncited` hoá ĐỎ; `ledger-missing` vẫn
  XANH.
- **M-B(i)** — bỏ hẳn phần trích dẫn khỏi thông điệp kiểm B. `superseded-bare` hoá ĐỎ
  với lý do `thông điệp thiếu trích dẫn khối phạm lỗi`.
- **M-B(ii)** — giữ trích dẫn nhưng nới cắt chuỗi 110 → 500. `superseded-bare` hoá ĐỎ
  với lý do `trích dẫn 490 ký tự — vượt 110`. Trả lời thẳng câu hỏi "500 ký tự có lọt
  không": không.
- **M-C** — xoá tên slug khỏi cả hai thông điệp kiểm C. `ledger-missing` và
  `ledger-stale` cùng hoá ĐỎ; `adr-uncited` vẫn XANH.
- **M-D** — `check-roadmap-fresh.sh` chết lúc chạy, `package.json` không đụng tới,
  file vẫn tồn tại. Nửa (a) của E10 vẫn in ✅; nửa (b) hoá ĐỎ và gọi đích danh
  `pnpm roadmap:check`.
- **M-E** (người kiểm tự nghĩ, ngoài ba lời tuyên bố) — thay khối đọc bảng
  `docs/adr/README.md` bằng một Map quan hệ cứng trong `roadmap-drift.mjs`. Chỉ
  `supersede-source-single` hoá ĐỎ; `superseded-bare` và `superseded-paired` vẫn XANH.
  Đúng như E9 tự mô tả: nó là eval duy nhất sẽ kêu khi ai đó dựng nguồn sự thật thứ hai.

Ngoài ra: `--list` và `--case` không kèm tên cũng được thử lại; cả hai xử lý đúng như
header script mô tả. Nằm ngoài `expected` của E7.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line  (không có judgment item trong bộ này)
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each  (hợp đồng này là T2 — không áp dụng)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS  (không áp dụng)
- [ ] Đọc `## Known limits` — bốn mục đầu là khe hở CÒN LẠI sau vòng 2, không phải
      mục vá cho đủ: đệ quy khi đổi tên file, fail-open khi không ai viện dẫn,
      `grep -q` thay cho "đúng một token", và chiều "case hỏng" không có eval giữ.
- [ ] Fill `human_signoff` in frontmatter
