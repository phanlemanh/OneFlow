---
schema_version: 2
feature_slug: roadmap-drift-guard
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 65949db8aca0ef788299c66b1a6078ff99f3294e
human_signoff: Manh 2026-08-27
---

# Evidence Report: roadmap-drift-guard

**Vòng 4 — phạm vi ĐÃ THU HẸP.** AC-10 / E10 (`check-roadmap-alias-cited.sh`, alias
`roadmap:check-alias`, khoá `roadmap_alias_cited_true`) đã rời hồ sơ này sang
`roadmap-alias-guard`. Bộ eval vòng này là **10**, không phải 11; id `E10` **cố ý bỏ
trống** trong `evals.yaml` vì `run-log.jsonl` đã mang ba vòng dòng E10 và tái dùng id sẽ
hoà lẫn hai lịch sử. Người kiểm đã thẩm định riêng việc cắt này — xem *Thẩm định vết cắt*.

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
| E11 | AC-4 (nửa suppression) | script | PASS |

Đối chiếu phủ: 10 eval ↔ 10 khoá `executors.script.roadmap_*` — không khoá thừa, không
khoá thiếu. AC-1..AC-9 mỗi tiêu chí có ít nhất một eval; không eval nào trỏ tới một tiêu
chí đã bị gỡ.

## Evidence

- eval: E1
  run_id: roadmap-drift-guard-r4-e1-20260827T170959
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_adr_uncited
  verified_at: 2026-08-27T17:09:59+07:00
  output: |
    → răng: case adr-uncited
      ✓ CASE adr-uncited: PASS
    Token nhãn của riêng case có mặt đúng một lần. Khẳng định nội dung AC-1
    (`ADR-0099 … — "<tiêu đề khác rỗng>"`) nằm trong thân case và đã chạy qua.

- eval: E2
  run_id: roadmap-drift-guard-r4-e2-20260827T170959
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_superseded_bare
  verified_at: 2026-08-27T17:09:59+07:00
  output: |
    → răng: case superseded-bare
      ✓ CASE superseded-bare: PASS
    Case khẳng định cả `viện dẫn ADR-0005 (đã bị ADR-0011 thay thế)` lẫn trích
    dẫn khối phạm lỗi khác rỗng và ≤ 110 ký tự (kiểm bằng heredoc python trong case).

- eval: E3
  run_id: roadmap-drift-guard-r4-e3-20260827T170959
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_superseded_paired
  verified_at: 2026-08-27T17:09:59+07:00
  output: |
    → răng: case superseded-paired
      ✓ CASE superseded-paired: PASS
    Nửa suppression: case bắt buộc nửa ĐỎ đứng vững trước, rồi áp đúng bản sửa
    guard đòi, rồi đòi guard chuyển XANH — nên xanh ở đây không phải xanh rỗng.

- eval: E4
  run_id: roadmap-drift-guard-r4-e4-20260827T170959
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_ledger_missing
  verified_at: 2026-08-27T17:09:59+07:00
  output: |
    → răng: case ledger-missing
      ✓ CASE ledger-missing: PASS
    Khẳng định gọi đúng tên slug `local-cpu-plugins` kèm cụm
    `chưa được phân loại trong sổ cái`.

- eval: E5
  run_id: roadmap-drift-guard-r4-e5-20260827T170959
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_ledger_stale
  verified_at: 2026-08-27T17:09:59+07:00
  output: |
    → răng: case ledger-stale
      ✓ CASE ledger-stale: PASS
    Chiều ngược của E4: khẳng định tên `a-feature-that-never-shipped` kèm cụm
    `không còn ở trạng thái ký`.

- eval: E6
  run_id: roadmap-drift-guard-r4-e6-20260827T170959
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_historical
  verified_at: 2026-08-27T17:09:59+07:00
  output: |
    → răng: case historical-244cb0b
      ✓ CASE historical-244cb0b: PASS
    Người kiểm dựng lại Given độc lập và xác nhận cú ĐỎ hôm nay là cú trôi THẬT,
    không phải đỏ vì lý do khác — guard trên roadmap @ 244cb0b in đúng hai phát hiện:
      [A/adr-coverage] ADR-0011 không được nhắc lần nào trong docs/roadmap.md — "…"
      [B/superseded-citation] viện dẫn ADR-0005 (đã bị ADR-0011 thay thế) mà không
      nhắc ADR thay nó: "1. **Shared deployment mode** ([ADR-0005](…)): …"

- eval: E7
  run_id: roadmap-drift-guard-r4-e7-20260827T170959
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_case_isolation
  verified_at: 2026-08-27T17:09:59+07:00
  output: |
    → răng: case case-isolation
      ✓ CASE case-isolation: PASS
    Người kiểm đối chứng thời gian để chắc case này KHÔNG đi tắt: một case đơn lẻ
    mất 0,188 s; case-isolation mất 1,767 s ≈ 9 × 0,188 s — đúng 9 case anh em
    được gọi thật, mỗi case một tiến trình riêng. Nửa (b) `--case <tên lạ>` và nửa
    (c) `--selftest-fail` đều được người kiểm chạy lại độc lập và đều từ chối/ báo
    hỏng ồn ào đúng như case khẳng định.

- eval: E8
  run_id: roadmap-drift-guard-r4-e8-20260827T170959
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_drift_green
  verified_at: 2026-08-27T17:09:59+07:00
  output: |
    → kiểm tra trôi giữa docs/roadmap.md, docs/adr/ và _acceptance/
       sổ cái: 21 hạng mục đã ký, 21 dòng trong sổ
    ✅ docs/roadmap.md khớp với docs/adr/ và _acceptance/ — không có trôi.
    Dòng đếm CÓ MẶT, hai số BẰNG NHAU (21 = 21) và KHÁC 0 — đúng ba điều
    `expected` của E8 đòi, không chỉ mã thoát.

- eval: E9
  run_id: roadmap-drift-guard-r4-e9-20260827T170959
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_supersede_source_single
  verified_at: 2026-08-27T17:09:59+07:00
  output: |
    → răng: case supersede-source-single
      ✓ CASE supersede-source-single: PASS
    Case lấy nền XANH trước, rồi thêm MỘT dòng thay-thế vào bảng
    `docs/adr/README.md` của bản sao vứt đi và đòi guard nhận ra quan hệ mới mà
    không sửa gì trong guard — chống hồi quy về nguồn-sự-thật-thứ-hai.

- eval: E11
  run_id: roadmap-drift-guard-r4-e11-20260827T170959
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_ledger_paired
  verified_at: 2026-08-27T17:09:59+07:00
  output: |
    → răng: case ledger-paired
      ✓ CASE ledger-paired: PASS
    Nửa suppression của cặp đếm hai chiều AC-4/AC-5: slug vừa `signed-off` vừa có
    dòng sổ cái thì kiểm C phải im.

## Thẩm định lỗ E6 (ưu tiên 1) — ĐÃ ĐÓNG

Người kiểm dựng bản sao đầy đủ của cây, **loại `.git`** (`shutil.ignore_patterns(
"node_modules", ".git")`) đúng như bài học vòng 3, và xác nhận từ trong bản sao rằng git
không tìm thấy kho nào (`fatal: not a git repository`). Bốn phép đo, hai nhánh × hai bản:

| Đường rìa | Bản vòng 3 (`fded31d`) | Bản vòng 4 (`65949db`) |
|---|---|---|
| `git show` KHÔNG phân giải được | in PASS, thoát 0 — **fail-open** | báo hỏng, thoát khác 0, kèm lý do `(Given chưa dựng được: … không phân giải — clone nông?)` |
| `git` trả về 0 nhưng ra **0 byte** | in PASS, thoát 0 — **fail-open**, im lặng hoàn toàn | báo hỏng, thoát khác 0, kèm lý do `(Given chưa dựng được: roadmap lịch sử rỗng)` |

Nhánh 0-byte là nhánh nguy hiểm hơn: bản cũ không in cả một dòng cảnh báo. Cả hai nhánh
nay fail-closed, và cả hai đều **phân biệt được** so với bản cũ — tức bản vá có tác dụng
thật, không phải chép lại hành vi sẵn có.

## Thẩm định vết cắt — SẠCH, có một ngoại lệ đã truy nguyên

- `scripts/roadmap/check-roadmap-alias-cited.sh` — không còn trong cây, không còn được
  git theo dõi. `scripts/roadmap/` còn đúng ba file.
- `package.json` — chỉ còn `roadmap:check` và `roadmap:teeth`.
- `_acceptance/config.yaml` — không còn khoá `roadmap_alias_cited_true`; còn đúng 10 khoá
  khớp 10 eval.
- `evals.yaml` — không còn E10; chỗ của nó là một comment giải thích vì sao id bỏ trống.
- `contract.md` — AC-10 đã rời mục **Criteria**; còn AC-1..AC-9.

**Câu hỏi trọng yếu — vết cắt có tái tạo lại đúng con bug cả tính năng này sinh ra để
bắt không?** Câu trả lời đo được: **không**, nhưng phải nói rõ vì sao.

Hôm nay trong kho còn **một** chuỗi `pnpm roadmap:*` trỏ tới lệnh `package.json` không
khai: `pnpm roadmap:check-alias`. Nó nằm ở bốn chỗ, **tất cả bên trong
`_acceptance/roadmap-drift-guard/`** (ba dòng Amendment lịch sử của `contract.md`, một
dòng trong báo cáo bằng chứng cũ). Guard đã bị cắt quét
`SCAN_DIRS = ["scripts/roadmap", "docs"]` — **không** quét `_acceptance/`. Nên bốn chỗ này
chưa bao giờ nằm trong tầm với của nó: giữ guard lại cũng không bắt được chúng, và cắt
guard đi cũng không làm chúng lọt qua thứ gì đang canh. Bốn dòng đó là **văn tự sự lịch
sử** (thuật lại trạng thái vòng 2/vòng 3), không phải chỉ dẫn bảo người đọc chạy lệnh.

Con bug gốc — `docs/assets/oneflow-roadmap-status.html` bảo người đọc chạy `pnpm
roadmap:check` khi lệnh đó chưa tồn tại — **đã đóng và vẫn đóng**: hai chỗ viện dẫn trong
file HTML đó, cùng ba chỗ trong `scripts/roadmap/`, đều trỏ tới `roadmap:check` /
`roadmap:teeth`, và cả hai đều được `package.json` khai. Nói cách khác, nếu guard đã cắt
còn ở đây hôm nay thì nó XANH.

Kết luận: vết cắt **sạch và trung thực**. Cái mất đi là **năng lực canh về sau**, không
phải một lỗi đang tồn tại — và `decisions.jsonl` đã khai thẳng đúng điều đó
(*"Ho so nay khong con bao dam lenh `pnpm roadmap:*` duoc vien dan la co that"*).

## Analyst

Không eval nào xanh-trên-cả-hai: `scripts/roadmap/` **không tồn tại** ở merge-base
(`068aa40`), nên cả 10 executor đều không chạy được trên cây diffBase — do đó
`baseline: n-a` cho toàn bộ, và đây là giới hạn môi trường thật chứ không phải né tránh.
Hệ quả cần người đọc biết: A/B không chứng minh được tính phân biệt của bộ eval theo
đường baseline. Bù lại, tính phân biệt được chứng minh **trực tiếp** ở mục thẩm định lỗ
E6 (bản cũ vs bản mới trên cùng một đường rìa) và ở chín đột biến các vòng trước.

## Variance

none — mọi eval đều tất định (`runs: 1`), chạy một lần, kết quả đồng nhất. Người kiểm chạy
lại E7 và toàn bộ suite thêm một lần nữa: kết quả không đổi, không có dấu hiệu flaky.

## Iterations

Round 1 (`91f0f25`): PASS 11/11 — nhưng người kiểm chỉ ra bộ eval YẾU HƠN hợp đồng nó chứng minh (không khẳng định nội dung thông điệp; E10 chưa từng chạy qua `pnpm`; AC-7 đọc được hai nghĩa). Trả lại thi công.
Round 2 (`c342d25`): PASS 11/11, ba điểm vòng 1 đóng — nhưng người kiểm tìm hai lỗ fail-open thật ở `check-roadmap-alias-cited.sh` (quét ra 0 chỗ vẫn in ✅; tự nhận diện bằng khớp chuỗi tên file → đổi tên gây đệ quy). Trả lại thi công.
Round 3 (`fded31d`): PASS 11/11, hai điểm vòng 2 đóng — nhưng người kiểm tìm HAI lỗ nữa: E6 fail-open khi `git show` hỏng, và hai alias trùng gây đệ quy không chặn (đo được 78 tiến trình đồng thời). Trả lại thi công.
Round 4 (`65949db`, vòng này): **phạm vi thu hẹp** — AC-10/E10 và file alias-guard tách sang hồ sơ riêng; chỉ lỗ E6 được vá tại chỗ. PASS 10/10 trên phạm vi đã thu hẹp. Vết cắt được thẩm định riêng và kết luận sạch. Người kiểm tìm thêm ba lỗ đường rìa MỚI — không lỗ nào làm hỏng một eval hiện có, cả ba ghi ở *Known limits* để hồ sơ kế tiếp nhận.

## Known limits

Ba phát hiện mới của vòng 4. Không phát hiện nào làm một eval hiện có hỏng — chúng nằm
**ngoài** những gì AC-1..AC-9 và 10 `expected` khẳng định — nên verdict vẫn PASS. Chúng
được ghi ra vì cùng đúng một họ fail-open mà bốn vòng qua đã đuổi theo.

1. **`historical-244cb0b` khẳng định "khác 0", không khẳng định "khác 0 VÌ ĐÂU".**
   Vòng 4 vá phía *Given* của case này (không dựng được fixture thì báo hỏng). Phía *Then*
   vẫn để ngỏ: người kiểm làm `roadmap-drift.mjs` ném lỗi vì một lý do hoàn toàn không
   liên quan tới trôi lộ trình, và case vẫn in PASS. Tám case anh em còn lại đều fail-closed
   trước cùng đột biến đó — nhờ khẳng định nội dung (vòng 2) hoặc nhờ một nửa XANH — nên
   `historical-244cb0b` là case DUY NHẤT còn hở. Đây đúng là hình dạng mà chính Amendment
   vòng 4 mô tả: *"mỗi bản vá lại đóng một cửa rồi để ngỏ cửa bên cạnh"* — lần này quan sát
   được ở phần code ĐƯỢC GIỮ LẠI, không phải ở file đã cắt. Bản vá gợi ý rẻ: thêm một
   `out_has` đòi thông điệp nêu ADR-0011 và ADR-0005, đúng khuôn bốn case kia đã dùng.
   *Lưu ý cho người ký:* AC-6 hôm nay VẪN được thoả thật — người kiểm đã dựng lại Given
   độc lập và xác nhận cú đỏ là cú trôi thật (xem khối E6). Lỗ này là chuyện eval yếu hơn
   tiêu chí, không phải tiêu chí không đạt.

2. **Quét ra 0 ADR thì lõi in ✅.** Với `docs/adr/README.md` còn nguyên nhưng **không có
   file ADR đánh số nào**, kiểm A và kiểm B lặng lẽ thành no-op và `roadmap-drift.mjs`
   thoát 0 kèm dòng "không có trôi". Trong kho này 0 ADR không thể là sự thật, nên 0 nghĩa
   là đường quét hỏng — **đúng cùng một lỗ** mà vòng 3 đã bắt và đã vá trong guard alias
   ("quét ra 0 chỗ viện dẫn nay ĐỎ"), nhưng chưa ai vá bản sao của nó trong lõi. Không case
   răng nào canh chiều này: `clean` đặt sàn khác 0 cho **sổ cái** chứ không cho **ADR**.
   Điều này cũng làm nhẹ bớt một câu trong Amendment vòng 4 — *"`roadmap-drift.mjs` … qua
   ba vòng và chín đột biến không lỗi nào"* — vốn là một trong hai căn cứ biện minh cho
   vết cắt. Câu đó đúng với những gì đã được thử, không đúng như một lời khẳng định chung.

3. **Hai đường rìa tham số của bộ răng.** (a) `--list` đứng ở BẤT KỲ đâu sẽ ngắn mạch:
   `--case adr-uncited --list` thoát 0 mà **không chạy case nào** — đúng họ "typo biến eval
   thành no-op xanh vĩnh viễn" mà nửa (b) của AC-7 sinh ra để chặn, chỉ khác cửa vào.
   (b) `--case a --case b` lặng lẽ chỉ chạy `b`, bỏ `a` không một lời cảnh báo. Cả hai là
   **tiềm ẩn**, không đang kích hoạt: 10 lệnh đã phân giải trong `_acceptance/config.yaml`
   đều mang đúng một `--case` và không mang `--list`. Người kiểm đã đối chứng lại các đường
   rìa vòng trước (`--case` tên lạ, `--case` không có giá trị, cờ lạ, tham số thừa sau
   `--case`, tên case rỗng) — tất cả vẫn từ chối ồn ào đúng như trước.

Giới hạn môi trường còn nguyên từ vòng 2, không vá được bằng code trong nhánh này:
`baseline: n-a` toàn bộ (merge-base chưa có `scripts/roadmap/`), và E6 phụ thuộc
`git show 244cb0b` phân giải được — nay ít nguy hiểm hơn vì đã fail-closed, nhưng vẫn
nghĩa là E6 sẽ ĐỎ trên clone nông, tức trên năm trong sáu job CI của kho.

## Ngoài hợp đồng

Ba mục thuộc về hồ sơ khác hoặc PR khác, ghi lại để không rơi:

1. **`_acceptance/roadmap-drift-guard/contract.md` dòng 81 vẫn nhắc AC-10.** Mục
   **Coverage**, trục *đường gọi*, còn viết ``alias `pnpm` (AC-10)`` trong khi AC-10 đã rời
   mục Criteria. Không eval nào trỏ vào đó và Coverage là biên bản quét chứ không phải danh
   sách tiêu chí, nên nó không làm hỏng gì — nhưng nó là một tham chiếu treo tới một tiêu
   chí không còn tồn tại, và người đọc sau sẽ mất thì giờ. Sửa văn bản một dòng.
2. **Hồ sơ `roadmap-alias-guard` thừa hưởng hai lỗ CHƯA VÁ.** Vòng 3 tìm ra chúng ở
   `check-roadmap-alias-cited.sh` và vòng 4 chuyển file đi thay vì vá: hai alias cùng trỏ
   một file gây đệ quy không chặn (đo được 78 tiến trình đồng thời trong 60 giây), và lỗ
   thứ hai đi kèm. Hồ sơ nhận phải mở vòng nghiệm thu với chúng nằm sẵn trên bàn, không
   được coi là bắt đầu từ nền sạch.
3. **Nối guard vào CI vẫn là PR riêng.** Amendment vòng 4 nói PR đó "đã lên kế hoạch". Khi
   nó tới, giới hạn `fetch-depth` ở trên là việc phải xử lý trước, không phải sau: chỉ job
   Acceptance Gate khai `fetch-depth: 0`, năm job còn lại dùng checkout nông, và E6 nay
   fail-closed nên nó sẽ báo hỏng ở đó — đúng như thiết kế, nhưng phải chuẩn bị.

## Gate 2 checklist (human)

- [ ] Đọc bảng + soi ngẫu nhiên 1-2 khối bằng chứng
- [ ] Đọc mục **Thẩm định vết cắt** — đây là thứ vòng này khác mọi vòng trước: xác nhận
      bạn đồng ý rằng đánh đổi "mất năng lực canh `pnpm roadmap:*`" là chấp nhận được, và
      rằng hồ sơ `roadmap-alias-guard` thật sự sẽ được mở
- [ ] Đọc **Known limits** mục 1 và 2 — hai lỗ fail-open MỚI trong code được giữ lại; quyết
      định vá ngay trong nhánh này hay ghi nợ sang hồ sơ kế tiếp
- [ ] Không có hạng mục judgment nào cần `human_override` (cả 10 eval đều là `script`)
- [x] Điền `human_signoff` trong frontmatter
