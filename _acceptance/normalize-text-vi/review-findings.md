## Trong hợp đồng

### Hình dạng 3 — assert "chuỗi có mặt" trong khi lời hứa là QUAN HỆ giữa các giá trị (expected khai rồi vứt)
- file: `sdk/tests/test_normalize_vi.py:273`
- severity: high
- AC: AC-2
- source: measurement

Vòng lặp `for raw, expected in (("Giá 5 TỶ Đ", "giá năm tỷ đồng"), ("GIÁ 500 TRIỆU Đ", "giá năm trăm triệu đồng")):` unpack biến `expected` nhưng KHÔNG BAO GIỜ dùng nó — hai assert duy nhất là `got.ok is True` (dòng 278) và `"đồng" in got.text` (dòng 279). Đã kiểm bằng AST: đây là vòng lặp DUY NHẤT trong file có biến vòng lặp không được dùng.

Vì sao là hình dạng 3: cả file này (matrix ở dòng 262-270 ngay phía trên, CORPUS_MONEY, CORPUS_TIME, VN_AMOUNT_MATRIX...) đều assert `got.text == expected` — tức QUAN HỆ giữa đầu vào và đúng một cách đọc. Riêng nhánh CHỮ HOA hạ xuống thành "có mặt chuỗi con 'đồng'". Hệ quả đo được: "Giá 5 TỶ Đ" đọc ra "giá năm đồng tỷ", "giá đồng", hay mất hẳn số tiền mà vẫn còn chữ "đồng" thì assert vẫn XANH. Đúng lớp lỗi mà chính comment dòng 265-267 nói là lý do phải tách assert ("stated separately so a wrong expected string cannot hide a MISSING currency word") — nhưng ở đây làm ngược lại: giữ vế yếu, bỏ vế mạnh. Chuỗi expected đã viết sẵn ngay tại chỗ, chỉ thiếu dòng so sánh.

Rationale (AC): Quy tắc chung của Criteria bắt buộc mọi tiêu chí đọc-thành-chữ đo "verbatim — từng ký tự"; ca tiền tệ chữ HOA này chỉ assert substring "đồng" thay vì so khớp chuỗi expected đã khai sẵn, tức không đo đúng thứ AC-2 yêu cầu.

### Hình dạng 2 (biến thể oracle) — phép đối chiếu "hai chiều" với ABI trừ đi một hằng của chính module đang bị đo
- file: `src/lib/workflow/tts-order-guard.test.ts:274`
- severity: low
- AC: AC-10
- source: measurement

Test `keeps the speech allowlist in step with the ABI` (dòng 259-278) dựng tập `derived` = {slot trong ABI_NODES có `text` ở inputs và `audio` ở outputs} \ MUSIC_SLOTS, rồi assert `TTS_SLOTS == derived`. Nhưng CẢ HAI hằng — TTS_SLOTS (exporter.ts:44-49) và MUSIC_SLOTS (exporter.ts:77-84) — đều là literal viết tay trong chính file bị đo, và đo được: tập ABI thoả tiêu chí text-in/audio-out đúng bằng hợp của hai literal đó, không dư slot nào.

Hệ quả: phép đo chỉ bắt được chiều "ABI thêm slot mới" (đúng mục đích khai cho hạng mục 1.4 ElevenLabs). Chiều phân loại sai thì không: chuyển "text-gen-speech-clone" từ TTS_SLOTS sang MUSIC_SLOTS làm `derived` co lại đúng bằng TTS_SLOTS mới → test này xanh, `it.each(TTS_SLOTS)` ở describe "violation" ngừng phủ slot đó, `it.each(MUSIC_SLOTS)` ở describe "compliant" chủ động khẳng định nó KHÔNG được cảnh báo — không assert nào đỏ, trong khi guard đã im lặng ngừng cảnh báo cho một slot giọng đọc thật. Không có mỏ neo độc lập nào ghim MUSIC_SLOTS (ví dụ theo một cờ/thuộc tính trong ABI) để chặn việc trừ nhầm.

Rationale (AC): AC-10 yêu cầu rõ danh sách "họ TTS" đối chiếu HAI CHIỀU với ABI sao cho lệch slot phải làm phép đo đỏ; finding chứng minh chiều phân loại-sai (chuyển một slot từ TTS sang MUSIC) không bị bắt vì cả hai literal đều nằm trong chính file bị đo, tức phép đo không thực sự hai chiều như AC-10 hứa.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Comma-chain rule silently rescales English-formatted amounts (undeclared, not a known limit)**
  Người dùng thấy gì: Giá viết theo kiểu Mỹ có nhiều dấu phẩy (ví dụ 1,234,567 VND) có thể bị đọc thành một chuỗi số liệt kê sai hoàn toàn, khiến giá đọc ra lệch rất xa so với thực tế mà hệ thống vẫn báo đọc thành công.
  file: `sdk/tongflow/text/normalize_vi.py`
  severity: high
  Đề xuất: known-limits

- **Reader algorithm + exact third-party pin live in the shared SDK, not in the plugin**
  Người dùng thấy gì: Mọi plugin AI khác trong hệ thống giờ đều phải cài kèm một thư viện xử lý tiếng Việt mà chúng không dùng tới, làm tăng dung lượng cài đặt không cần thiết cho các tính năng không liên quan.
  file: `sdk/pyproject.toml`
  severity: medium
  Đề xuất: known-limits

- **Export warning instructs an action the shipped product cannot perform**
  Người dùng thấy gì: Khi lưu hoặc xuất một luồng có bước đọc-giọng-nói nhưng thiếu bước chuẩn hoá số/tiền phía trước, hệ thống nhắc người dùng thêm một khối chức năng mà hiện tại họ không có cách nào cài được, khiến hướng dẫn đưa ra không thể làm theo.
  file: `src/lib/workflow/exporter.ts`
  severity: medium
  Đề xuất: known-limits

- **Vietnamese comments in sdk test file, including a garbled bilingual sentence**
  Người dùng thấy gì: Một số ghi chú kỹ thuật trong file kiểm thử vẫn còn lẫn tiếng Việt và tiếng Anh; không ảnh hưởng tới người dùng sản phẩm, chỉ gây khó đọc cho đội kỹ thuật sau này.
  file: `sdk/tests/test_normalize_vi.py`
  severity: medium
  Đề xuất: known-limits

- **Manifest guard header contradicts CLAUDE.md on its own edition count**
  Người dùng thấy gì: Một ghi chú nội bộ về lịch sử cập nhật của một công cụ kiểm tra ghi hai con số khác nhau ở hai chỗ, có thể gây hiểu nhầm cho người bảo trì sau này — không ảnh hưởng tới người dùng sản phẩm.
  file: `scripts/plugins/check-manifest-unmoved.sh`
  severity: low
  Đề xuất: known-limits

- **Leading-zero decimal fraction is spoken at the wrong scale, with ok=True and every guard silent**
  Người dùng thấy gì: Giá có phần thập phân bắt đầu bằng số 0 (ví dụ 7,05%) có thể bị đọc lệch giá trị — đọc thành một số lớn hơn thực tế — mà hệ thống vẫn báo đọc thành công.
  file: `sdk/tongflow/text/normalize_vi.py`
  severity: high
  Đề xuất: known-limits

- **Shared machine-cleared × signature rule is dead code; the only live enforcement is a bash re-implementation**
  Người dùng thấy gì: Một quy tắc kiểm tra nội bộ dùng để phát hiện xung đột trong hồ sơ nghiệm thu đã được viết ra nhưng chưa được gắn vào luồng kiểm tra nào đang chạy thật — đây là công cụ nội bộ của đội kỹ thuật, không ảnh hưởng người dùng sản phẩm.
  file: `lib/workspace-record.cjs`
  severity: medium
  Đề xuất: known-limits

- **ui-capture reports stale frames as removed even when the removal threw**
  Người dùng thấy gì: Công cụ chụp màn hình nội bộ dùng để kiểm tra giao diện có thể báo đã dọn xong ảnh cũ ngay cả khi việc dọn đó thất bại, khiến người kiểm tra nhầm tưởng đang xem ảnh mới — đây là công cụ nội bộ, không ảnh hưởng người dùng sản phẩm.
  file: `scripts/ui-capture.mjs`
  severity: low
  Đề xuất: known-limits

- **has_money docstring documents an address-stripping step the function does not perform**
  Người dùng thấy gì: Một đoạn ghi chú kỹ thuật mô tả sai cách một hàm nội bộ hoạt động; kết quả thực tế người dùng nhận được không bị ảnh hưởng vì đã được lớp khác xử lý đúng, nhưng ghi chú sai có thể khiến người sửa mã sau này hiểu nhầm.
  file: `sdk/tongflow/text/normalize_vi.py`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 6 (biến thể) — E17a/E17b/E14b đo cây plugin CỤC BỘ của tác giả, không phải cây đang kiểm**
  Người dùng thấy gì: Bộ kiểm thử cho vỏ plugin đọc-số hiện chỉ chạy được trên máy phát triển gốc vì kho mã công khai của plugin chưa tồn tại; ở máy khác các phép kiểm này không chạy được — đây là hạn chế đã được ghi nhận, chờ khi plugin được công khai.
  file: `scripts/plugins/run-normalize-plugin-tests.sh`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — fixture conformance viết tay đúng khuôn cả hai bên đọc, không round-trip từ exportWorkflow**
  Người dùng thấy gì: Bài kiểm chứng minh hai đường xử lý (giao diện và máy chủ) cho ra kết quả khớp nhau đang dùng dữ liệu mẫu viết tay thay vì lấy trực tiếp từ luồng xuất thật; nếu cách xuất thật thay đổi, bài kiểm này có thể vẫn báo ổn dù thực tế đã lệch — hạn chế này đã được ghi nhận trong hồ sơ nghiệm thu.
  file: `sdk/tests/conformance/fixtures/normalize-text-vi.json`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
