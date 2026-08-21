# Review Findings: normalize-text-vi — round 4

## Trong hợp đồng

### 1. Uppercase "Đ" is invisible to the money guard — spaced uppercase prices lose the currency word with ok=True
- file: `sdk/tongflow/text/normalize_vi.py:88`
- severity: high
- AC: AC-6
- source: bugs

`_MONEY` (line 88) and `_SPACED_DONG` (line 46) both anchor only on lowercase `đ` / `đồng`, even though the sibling patterns deliberately cover uppercase (`VNĐ`, `VND`, and `vi_dictionary._UPPER`). Measured against the pinned vietnormalizer==0.2.3:

    normalize_vi('GIÁ 1.999.000 Đ/THÁNG')
      → ok=True, residual=(), text='giá một triệu chín trăm chín mươi chín nghìn đ/tháng'
    normalize_vi('Giá 500 Đ')
      → ok=True, residual=(), text='giá năm trăm đ'
    has_money('Giá 500 Đ') → False   # has_money('giá 500 đ') → True

Three layers miss it at once: `has_money` returns False so the relational money-loss rule never runs; `_SPACED_DONG` does not rewrite the spaced unit so the library never expands it; `_RESIDUAL` never flags a stray currency letter. The result is a bare letter 'đ' handed to a voice, with ok=True and an empty residual — exactly the silent money-loss class the module's docstring says it exists to catch (the lowercase form 'Giá 500 đ' is caught and rewritten correctly). ALL-CAPS price copy is normal in the BĐS/sales domain the contract names. Fix: make the đ/đồng anchors case-insensitive (or add Đ to the classes) in both `_MONEY` and `_SPACED_DONG`.

Vì sao thuộc phạm vi: AC-6 liệt kê 'đ' là một trong bốn dấu hiệu tiền bắt buộc phải đọc ra thành từ chỉ tiền tương ứng; Đ hoa chỉ là dạng viết hoa của cùng chữ đó trong nội dung BĐS/bán hàng mà hợp đồng gọi tên, và đầu ra mất chữ tiền vi phạm đúng luật quan hệ của AC-6.

### 2. Residual colon rule rejects ordinary prose whenever a colon is not followed by a space
- file: `sdk/tongflow/text/normalize_vi.py:79`
- severity: medium
- AC: AC-8
- source: bugs

`_RESIDUAL`'s third alternative `:(?=\S)` was narrowed to catch mangled clocks, but it also matches a colon glued to a word in digit-free prose, which fails the entire node:

    normalize_vi('Ghi chú:Xem thêm')          → ok=False, residual=(':',), error='Chưa đọc được: :'
    normalize_vi('Nội dung:Khai trương hôm nay') → ok=False, residual=(':',)

A missing space after a colon is a common typo in user-authored copy, and the input contains nothing unreadable. Since the node returns ok=False, the whole TTS chain is blocked on text that has no number, price or date in it. The rule needs a stronger anchor (e.g. require a word/digit character before the colon in the mangled-clock shape) rather than any non-space follower.

Vì sao thuộc phạm vi: AC-8 liệt kê 'văn bản thuần chữ không có số' là một ca biên phải đi qua gần như nguyên vẹn (chỉ hạ chữ thường), nhưng câu prose không số bị ép success:false chỉ vì một dấu hai chấm dính chữ, đúng vào ca AC-8 đã hứa phải thành công.

### 3. Hình dạng 5 — tuyên quét LỚP "hai đầu mang hậu tố đơn vị" nhưng corpus chỉ có điểm-case trùng đúng hai mỏ neo hardcode của code
- file: `sdk/tests/test_normalize_vi.py:457`
- severity: high
- AC: AC-5
- source: measurement

AC-5 (contract.md:90-91) hứa một LỚP: "Chốt khoảng áp cả khi hai đầu mang hậu tố đơn vị… đọc '… đến …', không bao giờ thành 'trừ'/'âm'". CORPUS_AMBIGUOUS (dòng 457-478) chỉ pin 5 điểm-case: 5%-10%, 5% - 10%, 1.000 đ-2.000 đ, 1.000 ₫ - 2.000 ₫, 1.000 đồng - 2.000 đồng. Năm ca đó trùng KHÍT hai mỏ neo viết cứng trong bên đọc: _RANGE lookbehind `[\d%₫đ]` và _RANGE_AFTER_WORD_UNIT `(?<=đồng)` (sdk/tongflow/text/normalize_vi.py). Nghĩa là corpus không thể bắt được phần tử tiếp theo của chính lớp nó tuyên. Đo trên cây này (vietnormalizer==0.2.3, pin của pyproject): '5 triệu - 10 triệu' → 'năm triệu mười triệu' (ok=True, residual=()), 'giá 5 tỷ - 10 tỷ' → 'giá năm tỷ mười tỷ' (ok=True), '5kg-10kg' → 'năm ki lô gam mười ki lô gam' (ok=True), '5 người - 10 người' → 'năm người mười người' (ok=True) — chữ nối 'đến' biến mất im lặng, đúng cái hình dạng mà lần nâng phạm vi Cổng 2 vòng 3 tồn tại để giết ('mất hẳn chữ nối, ok=True'), và 'tỷ/triệu' là hậu tố mà chính CORPUS_MONEY đã coi là hạng nhất ('3 tỷ 2', '2,5 tỷ', '25 triệu'). Khác biệt về khuôn đo so với phần còn lại của file là nhìn thấy được ngay: CORPUS_MONEY/CORPUS_TIME/CORPUS_ID đều có trục khai TRƯỚC, dict ô, danh sách DELIBERATELY_UNCOVERED_* kèm lý do, và assert `missing == []` nêu tên ô; CORPUS_AMBIGUOUS không có trục nào, không có ô cố-ý-bỏ, và cũng không có `assert len(CORPUS_AMBIGUOUS) == literal` (ba corpus kia đều có MONEY_COUNT/TIME_COUNT/ID_COUNT) — nên một ca có thể bị rút mà không phép đo nào đỏ.

Vì sao thuộc phạm vi: AC-5 tuyên một lớp chung 'hai đầu mang hậu tố đơn vị', không giới hạn ở %/đ, và finding đo được ngay trên cây này rằng hậu tố tỷ/triệu/kg/người làm mất chữ 'đến' với ok=True — đúng hành vi AC-5 hứa hiện đang sai cho lớp đó.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Golden corpus is measured against an unpinned vietnormalizer — the exact drift run-normalize-plugin-tests.sh was rewritten to prevent**
  Người dùng thấy gì: Bộ kiểm tra chấm điểm tính năng này đang cài thư viện đọc tiếng Việt bản mới nhất từ kho công khai thay vì bản đã chốt, nên hôm nay vẫn đúng nhưng khi thư viện đó ra bản mới, các phép kiểm đọc số/giá/ngày có thể báo đạt trong khi app thực tế lại dùng một phiên bản khác hẳn.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

- **SDK slot errors are hardcoded Vietnamese and reach every locale's UI verbatim**
  Người dùng thấy gì: Khi tính năng đọc thất bại, thông điệp lỗi luôn hiện bằng tiếng Việt cho mọi người dùng, kể cả người đang dùng giao diện tiếng Anh, Trung, Nhật hay Hàn, thay vì hiện bằng ngôn ngữ họ đang chọn.
  file: `sdk/tongflow/text/normalize_vi.py`
  severity: low
  Đề xuất: new-contract

- **Export-time diagnostics are persisted into the saved/downloaded executable workflow**
  Người dùng thấy gì: File workflow đã lưu hoặc tải về có thể mang theo một cảnh báo cũ (ví dụ thiếu bước đọc số trước khi đọc thành tiếng) dù người dùng đã sửa lại đồ thị và cảnh báo đó không còn đúng nữa, dễ gây hiểu nhầm khi mở lại file sau này.
  file: `src/lib/workflow/exporter.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 — "registers … when mounted" nhưng chính test tự gọi registerAbiNode; không có round-trip mount→registry**
  Người dùng thấy gì: Không có phép kiểm nào thực sự bật node lên trên canvas rồi kiểm tra nó tự đăng ký đúng — nếu bước tự-đăng-ký-khi-gắn-node bị hỏng sau này, hiện chưa có cách nào phát hiện, và workflow có thể xuất ra file rỗng mà vẫn trông hợp lệ mà không ai biết.
  file: `src/components/workspace/nodes/transfer/normalize-text-vi.test.tsx`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 4/7 lỗi rơi vào file không bộ đo nào phủ (_acceptance/config.yaml, sdk/tongflow/text/normalize_vi.py) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
