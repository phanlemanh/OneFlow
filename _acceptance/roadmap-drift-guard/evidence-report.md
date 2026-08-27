---
schema_version: 2
feature_slug: roadmap-drift-guard
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: fded31d37ec4d63cee30a4b3bb8ffb7ec51940fd
human_signoff:
---

# Evidence Report: roadmap-drift-guard

Vòng 3 — vòng CUỐI được phép. Bản này **thay thế** hồ sơ vòng 2 (PASS 11/11 tại
`c342d25`): sau vòng 2 thi công đã đổi code trong `check-roadmap-alias-cited.sh` và
`check-roadmap-guard-teeth.sh`, nên bằng chứng vòng 2 đã ôi. Cả 11 eval dưới đây chạy
lại từ đầu trên `fded31d`, cộng mười phản-chứng do người kiểm tự dựng: bốn để phản-bác
bốn lời tuyên bố vá của vòng 3, sáu để dò **đường rìa chưa ai đi**.

Kết quả hai phần, đọc cả hai trước khi ký:

- **Bốn tuyên bố vòng 3 đều ĐỨNG.** Quét-rỗng nay đỏ; tự-nhận-diện đi bằng đường dẫn
  đã phân giải và đỏ khi không nhận ra; `case-isolation` đòi đúng một token (chứng minh
  bằng đột biến M-E); `--selftest-fail` đủ bốn phần.
- **Nhưng vòng này lại tìm ra hai lỗ mới, cả hai ở đường rìa** — đúng khuôn mà cả ba
  vòng đã lặp lại. Không lỗ nào làm eval nào đỏ hôm nay, nên verdict vẫn PASS; cả hai
  ghi đủ ở `## Known limits` và **không** eval nào canh chúng.

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
  run_id: roadmap-drift-guard-r3-e1-20260827T163658
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_adr_uncited
  verified_at: 2026-08-27T16:36:58+07:00
  output: |
    → răng: case adr-uncited
      ✓ CASE adr-uncited: PASS
    # Token nhãn khớp `expected`. Nửa NỘI DUNG (id KÈM tiêu đề khác rỗng) được
    # người kiểm vòng 3 quan sát trực tiếp trên thông điệp thật của guard khi
    # dựng lại fixture bằng tay — xem T-4 trong `## Ngoài hợp đồng`, dòng
    # `[A/adr-coverage] ADR-0001 … — "ADR-0001: Cache content-addressed …"`.

- eval: E2
  run_id: roadmap-drift-guard-r3-e2-20260827T163658
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_superseded_bare
  verified_at: 2026-08-27T16:36:58+07:00
  output: |
    → răng: case superseded-bare
      ✓ CASE superseded-bare: PASS
    # Nửa "trích dẫn ≤ 110 ký tự" nằm trong heredoc `EXCERPT` của case, đọc lại
    # nguyên văn ở vòng này; ngưỡng 110 do chính case tính bằng `len()`, không
    # phải do regex đoán. Vòng 2 đã phản-chứng bằng M-B, vòng 3 không đụng tới
    # đoạn code đó (xem diff `c342d25..fded31d`).

- eval: E3
  run_id: roadmap-drift-guard-r3-e3-20260827T163659
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_superseded_paired
  verified_at: 2026-08-27T16:36:59+07:00
  output: |
    → răng: case superseded-paired
      ✓ CASE superseded-paired: PASS
    # Nửa suppression: case tự đòi ĐỎ trước rồi mới đòi XANH sau khi vá, nên một
    # guard `exit 1` vô điều kiện không qua được nó.

- eval: E4
  run_id: roadmap-drift-guard-r3-e4-20260827T163709
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_ledger_missing
  verified_at: 2026-08-27T16:37:09+07:00
  output: |
    → răng: case ledger-missing
      ✓ CASE ledger-missing: PASS
    # Case đòi cả tên slug `local-cpu-plugins` lẫn cụm `chưa được phân loại
    # trong sổ cái`, không chỉ đỏ/xanh.

- eval: E5
  run_id: roadmap-drift-guard-r3-e5-20260827T163709
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_ledger_stale
  verified_at: 2026-08-27T16:37:09+07:00
  output: |
    → răng: case ledger-stale
      ✓ CASE ledger-stale: PASS
    # Chiều ngược của E4: đòi tên `a-feature-that-never-shipped` kèm cụm
    # `không còn ở trạng thái ký`.

- eval: E6
  run_id: roadmap-drift-guard-r3-e6-20260827T163709
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_historical
  verified_at: 2026-08-27T16:37:09+07:00
  output: |
    → răng: case historical-244cb0b
      ✓ CASE historical-244cb0b: PASS
    # Trên CÂY NÀY nhiễu là thật: `git cat-file -t 244cb0b` trả `commit` và
    # `git show 244cb0b:docs/roadmap.md` cho 8516 byte (bản HEAD là 20636 byte),
    # nên fixture đúng là lộ trình như nó đứng trên `main @ 244cb0b`.
    # CẢNH BÁO đọc kèm: case KHÔNG tự kiểm được điều đó — xem Known limits #1.

- eval: E7
  run_id: roadmap-drift-guard-r3-e7-20260827T163718
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_case_isolation
  verified_at: 2026-08-27T16:37:18+07:00
  output: |
    → răng: case case-isolation
      ✓ CASE case-isolation: PASS
    # Ba nửa đều được người kiểm chạy tay lại, tách rời khỏi case:
    #   (a) `--list` in đúng 10 tên, KHÔNG có `selftest-fail`;
    #   (b) `--case khong-ton-tai` và `--case selftest-fail` đều bị TỪ CHỐI ồn ào
    #       kèm danh sách case hợp lệ (mã thoát khác 0 — `selftest-fail` thật sự
    #       nằm ngoài mảng `CASES`);
    #   (c) `--selftest-fail` thoát khác 0 và in token `CASE selftest-fail: FAIL`.
    # Đột biến M-E (một case in token nhãn của mình HAI lần) làm case-isolation
    # đỏ — tức `grep -c … -eq 1` có răng thật, `grep -q` đã lọt.

- eval: E8
  run_id: roadmap-drift-guard-r3-e8-20260827T163718
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_drift_green
  verified_at: 2026-08-27T16:37:18+07:00
  output: |
    → kiểm tra trôi giữa docs/roadmap.md, docs/adr/ và _acceptance/
       sổ cái: 21 hạng mục đã ký, 21 dòng trong sổ
    ✅ docs/roadmap.md khớp với docs/adr/ và _acceptance/ — không có trôi.
    # `expected` đòi hai số BẰNG NHAU và khác 0: 21 = 21. Chốt chặn chống
    # `exit 1` vô điều kiện.

- eval: E9
  run_id: roadmap-drift-guard-r3-e9-20260827T163710
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_supersede_source_single
  verified_at: 2026-08-27T16:37:10+07:00
  output: |
    → răng: case supersede-source-single
      ✓ CASE supersede-source-single: PASS
    # Case tự lấy nền XANH trước khi thêm dòng thay-thế vào bảng
    # `docs/adr/README.md`, nên nó không thể xanh nhờ một cây vốn đã đỏ.
    # Phản-chứng T-7: bảng bị gỡ SẠCH mọi dòng → case FAIL-CLOSED (đỏ), không
    # lặng lẽ xanh.

- eval: E10
  run_id: roadmap-drift-guard-r3-e10-20260827T163730
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_alias_cited_true
  verified_at: 2026-08-27T16:37:30+07:00
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
    # Cả hai nửa hiện diện trong output thật; nửa (b) chạy qua `pnpm` thật
    # (pnpm 11.5.1), không phải đọc khai báo.

- eval: E11
  run_id: roadmap-drift-guard-r3-e11-20260827T163710
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_ledger_paired
  verified_at: 2026-08-27T16:37:10+07:00
  output: |
    → răng: case ledger-paired
      ✓ CASE ledger-paired: PASS
    # Nửa KHÔNG-nổ của cặp đếm hai chiều AC-4/AC-5.

## Analyst

Không eval nào xanh-trên-cả-hai: `baseline: n-a` cho cả 11. Merge-base với `main` là
`068aa40` và `git ls-tree` cho thấy cây đó **không có** `scripts/roadmap/` — không
executor nào tồn tại để chạy, nên A/B không phán được. Đây là giới hạn môi trường
(tính năng này SINH RA thư mục đó), không phải eval không phân biệt.

Đối trọng thay cho baseline, do người kiểm vòng 3 tự dựng: mười phản-chứng ở
`## Ngoài hợp đồng`. Bốn cái phản-bác trực tiếp bốn tuyên bố vá; hai cái tìm ra lỗ mới.

## Variance

Không eval nào có `runs > 1` — cả 11 đều tất định (script, không chạm LLM). Chạy lặp
trong lúc dò (bộ răng đầy đủ chạy thêm ba lần) cho cùng kết quả 10/10, không thấy chớp.

## Iterations

Round 1 (`91f0f25`): PASS 11/11 — người kiểm nêu ba chỗ BỘ EVAL yếu hơn hợp đồng (răng chỉ đo đỏ/xanh, E10 không chạy qua pnpm, AC-7 đa nghĩa). Trả lại thi công.
Round 2 (`c342d25`): PASS 11/11, ba điểm vòng 1 CLOSED — nhưng người kiểm tìm hai lỗ fail-open thật ở `check-roadmap-alias-cited.sh` (quét-rỗng xanh; tự-nhận-diện bằng khớp tên file). Trả lại thi công.
Round 3 (`fded31d`): PASS 11/11, cả bốn tuyên bố vá đều tự tay phản-chứng và ĐỨNG — nhưng lại lộ hai lỗ đường-rìa MỚI (Known limits #1 và #2) mà không eval nào canh. Đây là vòng cuối được phép: hai lỗ đó đi lên bàn người ký, không đi lên vòng 4.

## Known limits

1. **`historical-244cb0b` (E6) fail-open khi `git show` hỏng — LỖ MỚI, chưa có eval nào canh.**
   Dòng `git show 244cb0b:docs/roadmap.md > "$tmp/t/docs/roadmap.md"` không được kiểm mã
   trả về. Vì case chạy trong ngữ cảnh `if "$fn"` nên `set -e` bị vô hiệu trong toàn thân
   hàm: `git show` hỏng → chuyển hướng vẫn tạo file **0 byte** → guard đỏ vì lý do hoàn
   toàn khác (mọi ADR không được nhắc, không có khối sổ cái) → case in PASS. Người kiểm
   tái hiện hai lần: (a) bản sao cây không có `.git` → `fatal: not a git repository`, case
   vẫn PASS; (b) bản sao đổi SHA thành `deadbee` → `fatal: invalid object name`, case vẫn
   PASS, fixture đo được đúng 0 byte và guard nêu 13 phát hiện không liên quan gì tới cú
   trôi ADR-0005/0011. Trên cây đang ký thì nhiễu là THẬT (8516 byte, đã kiểm riêng), nên
   E6 hôm nay đạt thật; nhưng ở clone nông (`actions/checkout` mặc định depth 1) hay sau
   một lần viết lại lịch sử, AC-6 — tiêu chí DUY NHẤT neo vào cú trôi ngoài đời — biến
   thành no-op xanh vĩnh viễn. Vá một dòng: `git show … > file || return 1`, hoặc khẳng
   định fixture khác rỗng trước khi chạy guard. Lỗ này có từ vòng 1, không phải hồi quy
   của vòng 3.
2. **Hai alias cùng trỏ một file → đệ quy không giới hạn — LỖ MỚI, chưa có eval nào canh.**
   Vòng 3 vá đúng chiều "đổi tên", nhưng `self_alias` vẫn chỉ giữ **một** tên: vòng lặp
   nhận diện gán đè, nên nếu hai alias cùng phân giải về guard này thì chỉ tên cuối được
   loại, tên kia được **chạy** — và mỗi tầng lại làm y hệt. Tái hiện: thêm
   `roadmap:check-alias-2` trỏ cùng file + viện dẫn nó trong header một script; guard chạy
   tới `bỏ qua roadmap:check-alias-2` rồi tự gọi `roadmap:check-alias`; sau 60 giây đo được
   **78 tiến trình guard đồng thời** và người kiểm phải giết cả nhóm. Đây đúng hình dạng
   hỏng mà vòng 2 gọi tên ("guard tự gọi chính nó không giới hạn"), chỉ tới bằng cửa khác;
   nó có từ vòng 2 (bản cũ cũng chỉ giữ một tên). Vá: bỏ qua MỌI alias có
   `realpath == $self_real` ngay trong vòng chạy, thay vì nhớ một tên.
3. **`baseline: n-a` cho cả 11** — merge-base `068aa40` không có `scripts/roadmap/`, nên
   không đo được A/B. Giới hạn môi trường, không vá được trong nhánh này.
4. **E6 phụ thuộc lịch sử git cục bộ** (`244cb0b` phải với tới được). Độc lập với #1: kể
   cả khi vá #1, eval vẫn không chạy được trên clone nông — chỉ khác là nó sẽ ĐỎ thay vì
   xanh giả.
5. **`self` được tính SAU `cd`** trong `check-roadmap-alias-cited.sh`, nên gọi guard bằng
   đường dẫn tương đối từ thư mục con (ví dụ `cd docs && bash ../scripts/roadmap/…`) làm
   `realpath` trỏ ra ngoài repo và guard ĐỎ oan. Fail-closed nên không nguy hiểm, nhưng là
   đúng loại đỏ-oan khiến người ta học cách bỏ qua guard. Bộ răng không có tật này (nó
   tính `self` từ `repo_root` sau `cd`).
6. **`grep -c` đếm DÒNG, không đếm lần xuất hiện.** Hai token nhãn trên cùng một dòng vẫn
   được đếm là 1, nên `case-isolation` bắt được "in hai dòng" (đã chứng minh bằng M-E)
   nhưng không bắt được "in hai lần trên một dòng". Khe hẹp, ghi ra để lần sửa sau biết.
7. **E10 bao trùm E1..E9/E11.** Nửa (b) chạy `pnpm roadmap:teeth`, tức toàn bộ 10 case.
   Một hồi quy trong bộ răng làm ĐỎ cả E7 lẫn E10 — hai eval này không độc lập, đừng đọc
   "2/11 đỏ" như hai bằng chứng riêng.
8. **Chưa nối CI** — đã khai ở `## Out of scope` của hợp đồng, có lý do (bẫy đếm site của
   `check-action-pins.sh`). Nghĩa là mọi thứ ở đây chạy theo yêu cầu, không tự chạy.

## Ngoài hợp đồng

Mười phản-chứng người kiểm vòng 3 tự dựng, đều trên **bản sao vứt đi** của cây; không cái
nào là tiêu chí trong hợp đồng.

- **T-1 (tuyên bố 1 — quét rỗng): CLOSED.** Gỡ chuỗi `pnpm roadmap:*` khỏi **mọi** file
  trong cả hai đường quét (10 chỗ / 4 file) → guard ĐỎ đúng nhánh mới, in "quét
  scripts/roadmap, docs không thấy chuỗi `pnpm roadmap:*` nào… 0 nghĩa là đường quét
  hỏng". Gỡ một file lẻ thì không chạm được nhánh này — đúng cái bẫy hồ sơ vòng 3 tự cảnh
  báo.
- **T-2 (tuyên bố 2 — đổi tên): CLOSED.** Trên bản sao ĐẦY ĐỦ (có `docs/`, `_acceptance/`,
  `.git`): đổi tên guard thành `zz-renamed-alias-guard.sh` + trỏ lại `package.json` → guard
  nhận đúng chính mình, in "bỏ qua `roadmap:check-alias` — đệ quy", chạy hết trong 8,1 giây,
  thoát 0. Không treo, không đệ quy (chạy dưới `subprocess` có tràn 240 giây).
- **T-3 (tuyên bố 2, nửa ĐỎ): CLOSED.** Khai alias thành `bash ./scripts/roadmap/…` để
  vòng nhận diện không khớp được → guard ĐỎ trong 0,2 giây với "không alias nào phân giải
  về chính guard này (…)", không chạy tiếp. Tức "không nhận ra chính mình" thật sự là đỏ,
  không phải chạy liều.
- **T-4 (tuyên bố 4 — răng biết nói hỏng): CLOSED cả bốn phần.** `--list` in đúng 10 tên
  không có `selftest-fail`; `--case selftest-fail` bị từ chối như case lạ (nên nó thật sự
  nằm ngoài `CASES`); `--selftest-fail` thoát khác 0 và in `CASE selftest-fail: FAIL`; lần
  chạy đầy đủ vẫn `✅ răng: 10/10 case`, không dính gì tới cờ ẩn.
- **M-E (tuyên bố 3 — đúng một token): CLOSED.** Sửa `run_case` để case `clean` in token
  nhãn của mình hai lần → `--case clean` vẫn xanh (đúng), còn `case-isolation` chuyển ĐỎ.
  `grep -q` sẽ vẫn xanh ở đột biến này; `grep -c … -eq 1` thì không.
- **T-5 (lỗ mới #2 — hai alias một file).** Xem Known limits #2. 78 tiến trình đồng thời
  sau 60 giây.
- **T-6 (lỗ mới #1 — `git show` hỏng).** Xem Known limits #1. Hai cách tái hiện, fixture
  đo được 0 byte.
- **T-7 (bảng ADR rỗng):** gỡ SẠCH mọi dòng `|` khỏi `docs/adr/README.md` →
  `supersede-source-single` FAIL-CLOSED (python nêu `ValueError: max() … is empty`, case
  báo hỏng). Không phải fail-open.
- **T-8 (`package.json` không có khoá `scripts`):** guard alias ĐỎ, gọi tên đủ ba lệnh bị
  viện dẫn mà không được khai. Fail-closed.
- **T-9 (`mktemp` không cấp được — `TMPDIR` không tồn tại):** guard alias ĐỎ ở nửa (b)
  ("2 alias được khai mà chạy không tới cùng"). Fail-closed, tuy thông điệp đổ lỗi cho
  alias chứ không cho môi trường.
- **T-10 (đường tham số):** `--case` trống và `--case ""` đều bị từ chối kèm danh sách case
  hợp lệ. `--case A --case B` thì **B thắng lặng lẽ** — không được từ chối; vô hại trên
  thực tế vì eval grep đúng token nhãn của case mình gọi, nên một lệnh gõ nhầm kiểu này
  vẫn ngã ở lớp eval chứ không hoá xanh.

Ghi thêm cho minh bạch quy trình: một lệnh `git mv` thăm dò chạy **trong bản sao** đã với
ngược vào INDEX của worktree kiểm (bản sao mang theo file `.git` trỏ về gitdir thật). Người
kiểm phát hiện ngay ở lần `git status` kế tiếp, đã đối chiếu file trên đĩa **trùng khớp
từng byte với HEAD** rồi `git restore --staged scripts/roadmap/`; cây trở lại sạch và E10
được chạy lại để xác nhận guard còn nguyên. Kho chính `/Users/manh-macmini/dev/oneflow`
không bị đụng (`git status --porcelain` rỗng). Mọi eval trong hồ sơ này đã chạy XONG trước
sự cố đó.

## Gate 2 checklist (human)

- [ ] Đọc bảng + soi 1-2 khối bằng chứng
- [ ] **Đọc Known limits #1 và #2 trước khi ký.** Cả hai là lỗ đường-rìa có thật, tái hiện
      được, và **không eval nào canh** — ký PASS nghĩa là chấp nhận cho hai lỗ đó đi kèm
      tính năng, chứ không phải chúng không tồn tại. Vá mỗi cái một dòng; quyết định là
      của người ký.
- [ ] Không có hạng mục judgment nào cần override (bộ này 11/11 là `script`)
- [ ] Điền `human_signoff` trong frontmatter
