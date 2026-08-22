# Review Findings: normalize-text-vi (round 6)

## Trong hợp đồng

### Tuyên quét LỚP nhưng chỉ có điểm-case — ALL_CORPUS bỏ sót hai ma trận mới nhất (AC-7/AC-8)
- file: `sdk/tests/test_normalize_vi.py:856`
- severity: medium
- source: measurement
- AC: AC-8

`ALL_CORPUS = CORPUS_MONEY + CORPUS_TIME + CORPUS_ID + CORPUS_AMBIGUOUS` là toàn bộ đầu vào của hai phép quét lớp: `test_idempotent_and_byte_identical` (dòng 859-864) và vòng NFC/NFD + `has_money` parity trong `test_edge_inputs` (dòng 895-909). Nhưng ba tập ca mới thêm ở Cổng 2 KHÔNG nằm trong ALL_CORPUS: `MAGNITUDE_DONG_MATRIX` (dòng 189, 'Giá 5 tỷ đ' … 10 ô), `VN_AMOUNT_MATRIX` + `VN_AMOUNT_NEGATIVE` (dòng 252, 281, 'Giá 3.000.000,00 đ' …), và các mỏ neo CHỮ HOA trong `MONEY_POSITIVE_ANCHORS` (dòng 805-807, 'Giá 500 Đ', 'GIÁ 1.999.000 Đ', 'Giá 125.000 ĐỒNG'). Comment tiêu đề của khối lại tuyên là "determinism and idempotence over the WHOLE corpus" và eval E7/E8 tuyên "trên TOÀN corpus"/"với mọi ca corpus có dấu". Đây đúng là chỗ nguy hiểm nhất về Unicode: 'đ'/'Đ'/'₫' là ký tự có dấu, luật tiền là literal NFC, và assert `got_nfd.ok == got.ok` + `has_money(NFD) == has_money(NFC)` (dòng 906-908) — chính hai assert sinh ra để bịt lỗ NFD của luật tiền — không bao giờ chạm tới nhóm ca tiền viết HOA và nhóm '<số> <đơn vị lớn> đ' vừa mới sinh ra. Kịch bản hỏng: gõ NFD (Đ = D + U+0300…) làm luật uppercase-đồng trượt, `has_money` trả False cho 'Giá 500 Đ' ở dạng NFD trong khi NFC vẫn True → phép đo vẫn xanh vì ca đó không có trong ALL_CORPUS. Tương tự, một luật mới không idempotent trên 'Giá 3.000.000,00 đ' (đọc lần hai ra khác) cũng không có assert nào bắt.

Rationale: AC-8 hứa "normalize(NFD(x)) == normalize(NFC(x)) byte-identical với MỌI ca corpus có dấu", nhưng ALL_CORPUS dùng cho phép quét này bỏ sót các ma trận tiền tệ/chữ HOA mới thêm — đúng chữ của AC-8 đang không được giữ trên toàn corpus như đã hứa.

### Tuyên quét LỚP 13 khoá nhưng phép đo chỉ là điểm-case ≥1 + một cách viết duy nhất
- file: `scripts/acceptance/check-measuring-instruments-refuse.sh:74`
- severity: medium
- source: measurement
- AC: AC-16

E18 khai `expected` là "(b) KHÔNG khoá executor nào còn suy pin bằng thay-thẳng `--with $(...)` — đo cả LỚP 13 khoá, không riêng khoá vừa lộ". Phép đo thực tế gồm hai nửa và cả hai đều không phủ lớp: (1) nửa âm dòng 74-78 grep literal `--with \$(` — đã kiểm chứng: dòng viết dạng có ngoặc kép `--with \"$(grep -oE 'vietnormalizer==…' pyproject.toml | head -1)\"` (cách viết tự nhiên nhất, và cũng là cách các khoá hiện tại đang viết chỉ khác ở chỗ có `${pin:?}`) KHÔNG khớp mẫu vì có dấu `\"` chen giữa `--with ` và `$(`; (2) nửa dương dòng 80-82 chỉ đòi `grep -c 'pin:?' >= 1` — một mỏ neo duy nhất còn sống là đủ xanh cho một lời hứa về 13 khoá. Kịch bản hỏng cụ thể: sửa 12/13 khoá về dạng `--with \"$(grep … )\"` (mất `${pin:?}`), giữ nguyên 1 khoá có mỏ neo → `unguarded` rỗng, `guarded_count`=1 → script in OK, trong khi 12 khoá đã quay lại đúng hình dạng mà E18 sinh ra để cấm (pin không tìm thấy ⇒ chuỗi rỗng ⇒ `--with` nuốt tham số `python` kế tiếp). Phép đo lớp đúng phải đếm số khoá suy pin và đòi mọi khoá đó đều mang mỏ neo.

Rationale: AC-16 hứa đo "theo LỚP 13 khoá, không theo khoá vừa lộ" cho phép kiểm chặn suy-pin-bằng-thay-thẳng; phép đo hiện tại chỉ bắt đúng một cách viết và chỉ cần ≥1 mỏ neo sống sót, đúng hình dạng điểm-case mà AC-16 nói là không đủ.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Địa chỉ "Đ." (Đường) bị đọc thành "đồng" — đọc sai êm ru, ok=True**
  Người dùng thấy gì: Địa chỉ viết tắt kiểu 'Đ. Lê Lợi' (nghĩa là 'Đường') có thể bị đọc nhầm thành có chứa số tiền, khiến giọng đọc phát ra thông tin sai trong khi hệ thống vẫn báo là đọc thành công, không có cảnh báo nào cho người dùng.
  file: `sdk/tongflow/text/normalize_vi.py`
  severity: high
  Đề xuất: known-limits

- **_MAGNITUDE claims to be the single shared magnitude list, but _SPACED_DONG re-lists it inline**
  Người dùng thấy gì: Nếu sau này có người thêm một đơn vị tiền mới vào danh sách chính mà quên cập nhật chỗ tương ứng, hệ thống có thể từ chối đọc một số giá hợp lệ thay vì đọc đúng — nhưng đây là rủi ro cho lần sửa sau, chưa xảy ra ở phiên bản hiện tại.
  file: `sdk/tongflow/text/normalize_vi.py`
  severity: medium
  Đề xuất: known-limits

- **_SPACED_DONG chép tay lại danh sách magnitude thay vì dùng _MAGNITUDE — bất biến mà chính comment tuyên bố là sai**
  Người dùng thấy gì: Nếu sau này có người thêm một đơn vị tiền mới vào danh sách chính mà quên cập nhật chỗ tương ứng, hệ thống có thể từ chối đọc một số giá hợp lệ (báo lỗi) thay vì đọc đúng — an toàn nhưng gây khó chịu, và chưa xảy ra ở phiên bản hiện tại.
  file: `sdk/tongflow/text/normalize_vi.py`
  severity: low
  Đề xuất: known-limits

- **Vietnamese code comments in SDK tests violate the English-only rule**
  Người dùng thấy gì: Một số ghi chú giải thích trong mã kiểm thử được viết bằng tiếng Việt thay vì tiếng Anh theo quy ước dự án; điều này không ảnh hưởng gì tới người dùng cuối cùng của tính năng.
  file: `sdk/tests/test_normalize_vi.py`
  severity: medium
  Đề xuất: known-limits

- **Guard đăng ký thoát im lặng (không in FAIL) khi đếm call site về 0**
  Người dùng thấy gì: Nếu công cụ kiểm tra tự động nội bộ gặp một số trường hợp bất thường, nó có thể dừng đột ngột mà không hiện rõ lý do, khiến người xem kết quả khó phân biệt đây là lỗi thật hay trục trặc hạ tầng — đây là vấn đề về công cụ kiểm tra nội bộ, không ảnh hưởng tới người dùng cuối của tính năng.
  file: `scripts/plugins/check-normalize-registration.sh`
  severity: low
  Đề xuất: known-limits

- **test_node_cache_normalize.py module docstring contradicts what the file now asserts**
  Người dùng thấy gì: Một dòng mô tả ở đầu file kiểm thử nội bộ vẫn nói tính năng có bộ nhớ đệm thông minh dù thực tế đã đổi hành vi; đây chỉ là tài liệu dành cho lập trình viên, không ảnh hưởng tới người dùng.
  file: `sdk/tests/test_node_cache_normalize.py`
  severity: low
  Đề xuất: known-limits

- **Fixture viết tay đúng khuôn bên đọc — không round-trip từ writer (exportWorkflow)**
  Người dùng thấy gì: Phép kiểm đối chiếu hai hệ thống dùng dữ liệu mẫu viết tay thay vì dữ liệu do chính công cụ xuất workflow tạo ra, nên chưa chứng minh được rằng giao diện thật khi lưu và xuất workflow luôn đúng định dạng mong đợi.
  file: `sdk/tests/conformance/fixtures/normalize-text-vi.json`
  severity: low
  Đề xuất: known-limits

- **.claude/settings.json committed with a personal plugin marketplace, unrelated to the feature**
  Người dùng thấy gì: Bản vá này kèm theo một thay đổi cấu hình công cụ nội bộ không liên quan tới tính năng đọc chữ tiếng Việt, khiến mọi người tải lại mã nguồn tự động nhận một cấu hình cá nhân của một thành viên mà không ai được thông báo trước.
  file: `.gitignore`
  severity: low
  Đề xuất: new-contract

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
