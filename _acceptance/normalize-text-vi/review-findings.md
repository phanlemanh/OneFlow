## Trong hợp đồng

### Hình dạng 5 — họ "Đ nhập nhằng" tuyên quét LỚP nhưng chỉ có điểm-case, không có ma trận viết-trước
- file: `sdk/tests/test_normalize_vi.py:311`
- severity: medium
- source: measurement
- AC: AC-6

`CORPUS_AMBIGUOUS_D` (dòng 311-350) tự khai là một LỚP: chú thích viết "the reader refuses the whole family", rồi kể tên đúng hai trục của lớp đó — trục DẤU NGĂN ("the refusal rule anchored on `[ \t]` while the two money rewrites ... anchor on `\s`, so every separator that is not a space or a tab leaked": space, tab, \n, \xa0, không có gì) và trục TOKEN THEO SAU ("the letter-only lookahead read all four of these as prices": chữ, chữ số, dấu phẩy, kết chuỗi). Nhưng phép đo (`test_ambiguous_undotted_d_refuses_rather_than_guessing`, dòng 414-425) chỉ là một vòng `for raw in CORPUS_AMBIGUOUS_D` trên một tuple phẳng 17 phần tử: không có dict khai ô (kiểu, dấu ngăn) → ca, không có assert `missing == []` nêu ĐÚNG TÊN Ô còn trống, không có `DELIBERATELY_UNCOVERED_*` kèm lý do. Đây chính là hình dạng 5, và nó tương phản trực tiếp với sáu họ anh em TRONG CÙNG FILE — `MONEY_MATRIX_CELLS` (dòng 60), `TIME_MATRIX_CELLS` (dòng 947), `ID_POSITION_CELLS` (dòng ~1000), `RANGE_MATRIX` (dòng ~938), `MAGNITUDE_DONG_MATRIX` (dòng 194), `VN_AMOUNT_MATRIX` (dòng ~460) — tất cả đều khai ô TRƯỚC và đều đỏ theo TÊN Ô. Hệ quả đã ghi ngay trong file: chú thích thừa nhận vòng 17 (bốn dòng \n / \xa0 / dính) và vòng 19 (bốn dòng 3/2, 30/4, 2/9, dấu phẩy) mỗi lần đều phát hiện một PHẦN TỬ MỚI của cùng lớp này bằng mắt người trong khi mọi test vẫn xanh — đúng kịch bản mà ma trận toàn phần sinh ra để chặn. Thêm một dấu ngăn hay một hình dạng token theo sau chưa ai nghĩ tới thì corpus lại lớn thêm một CA và tiêu chí vẫn được viết theo LỚP.

Rationale (vì sao trong hợp đồng): đây đúng là hình dạng "corpus tuyên lớp mà chỉ có điểm-case" mà bản thân hợp đồng gọi tên là lỗi phép-đo phải sửa trong vòng, và họ "Đ nhập nhằng" mà nó nhắm tới chính là corpus AC-6 đã bị sửa lặp lại nhiều lần (vòng 6/11/13/15), mỗi lần ô còn trống chỉ được phát hiện bằng review của người.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Eval script clones a repository the sibling guard asserts does not exist — green only on the author's machine**
  Người dùng thấy gì: Bài kiểm chức năng của plugin đọc số phụ thuộc vào một bản mã chưa công khai, nên nó chỉ chạy đúng trên máy của người phát triển tính năng; ở máy khác, bài kiểm này sẽ luôn báo lỗi dù bản thân tính năng vẫn hoạt động bình thường.
  file: `scripts/plugins/run-normalize-plugin-tests.sh`
  severity: high
  Đề xuất: known-limits

- **SDK returns hardcoded Vietnamese user-facing error text into the ABI `error` output, contradicting the i18n pattern this PR establishes**
  Người dùng thấy gì: Khi không đọc được một chuỗi, thông điệp lỗi hiển thị luôn bằng tiếng Việt, nên người dùng đang dùng giao diện tiếng Anh, Trung, Nhật hay Hàn sẽ thấy lỗi hiện bằng tiếng Việt thay vì ngôn ngữ họ đã chọn.
  file: `sdk/tongflow/text/normalize_vi.py`
  severity: medium
  Đề xuất: new-contract

- **Manifest guard headers left inconsistent after the plugin withdrawal**
  Người dùng thấy gì: Một vài ghi chú giải thích trong tệp kiểm tra danh sách plugin chính thức bị lỗi thời sau khi một plugin được rút khỏi danh sách; đây chỉ là nhầm lẫn trong tài liệu kỹ thuật nội bộ, không ảnh hưởng gì tới người dùng sản phẩm.
  file: `scripts/plugins/check-manifest-unmoved.sh`
  severity: low
  Đề xuất: known-limits

- **`has_money()` docstring documents a step the function does not perform**
  Người dùng thấy gì: Một đoạn ghi chú kỹ thuật giải thích sai một chi tiết nhỏ trong cách bộ đọc phân biệt địa chỉ với giá tiền; hiện tại không gây ra lỗi đọc sai nào cho người dùng, chỉ có thể gây nhầm lẫn cho người bảo trì mã sau này.
  file: `sdk/tongflow/text/normalize_vi.py`
  severity: low
  Đề xuất: known-limits

- **TTS-order rationale JSDoc is attached to MUSIC_SLOTS instead of the constant it explains**
  Người dùng thấy gì: Một đoạn giải thích quan trọng về lý do cảnh báo thứ tự node bị đặt nhầm vị trí trong mã nguồn; điều này không ảnh hưởng tới người dùng, nhưng có thể khiến người bảo trì sau này vô tình bỏ đúng phần bảo vệ mà đoạn ghi chú đó đang cảnh báo.
  file: `src/lib/workflow/exporter.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 — fixture conformance viết tay đúng khuôn hai BÊN ĐỌC, không round-trip qua exportWorkflow**
  Người dùng thấy gì: Bài kiểm đối chiếu kết quả giữa hai hệ thống dùng một kịch bản mẫu viết tay thay vì kịch bản do luồng thật sinh ra, nên nếu cách xuất luồng thật thay đổi hình dạng, bài kiểm này có thể không phát hiện ra sự khác biệt — hạn chế này đã được ghi nhận từ trước.
  file: `sdk/tests/conformance/fixtures/normalize-text-vi.json`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 — hai assert đo CHÍNH LỜI KHAI, không thể đỏ vì hằng tự sinh ra nhau**
  Người dùng thấy gì: Hai dòng kiểm tra nội bộ trong bộ kiểm thử không thể phát hiện lỗi vì chúng so sánh một giá trị với chính nó; đây chỉ là kiểm thử thừa, không ảnh hưởng gì tới việc đọc số hay giá tiền cho người dùng.
  file: `sdk/tests/test_normalize_vi.py`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
