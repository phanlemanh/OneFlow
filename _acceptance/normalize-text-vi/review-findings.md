## Trong hợp đồng

### Hình dạng 3 — Quan hệ hai chiều với ABI bị rút gọn: vế trừ MUSIC_SLOTS là hằng của chính module bị đo, không được ghim ở đâu
- file: `src/lib/workflow/tts-order-guard.test.ts:218`
- severity: medium
- AC: AC-10
- detail: E10c hứa quan hệ: 'không slot nào trong ABI thoả tiêu chí (text vào, audio ra) mà vắng khỏi guard'. Test `keeps the speech allowlist in step with the ABI` hiện thực quan hệ đó bằng `derived = ABI_NODES lọc text→audio TRỪ MUSIC_SLOTS` (dòng 218: `!MUSIC_SLOTS.includes(slot as never)`) rồi so với TTS_SLOTS — nhưng CẢ TTS_SLOTS lẫn MUSIC_SLOTS đều import từ src/lib/workflow/exporter.ts (dòng 44-59), module đang bị đo. ABI chỉ ràng được HỢP của hai danh sách; ranh giới giữa chúng không được đo ở đâu: 6 slot nhạc chỉ tồn tại trong prose của E10b's expected, không test nào ghim membership của MUSIC_SLOTS. Kịch bản hỏng cụ thể: thêm slot TTS mới (hạng mục 1.4 ElevenLabs mà chính eval nhắc) vào ABI nhưng bỏ nhầm vào MUSIC_SLOTS → two-way vẫn xanh (derived cũng loại nó), `it.each(MUSIC_SLOTS)` ở dòng 190 còn assert nó export sạch warnings — biến chính ca vi phạm thành đối chứng âm xanh. Quan hệ được assert thực tế là giữa hai hằng nội bộ, yếu hơn quan hệ được hứa với ABI.
- source: measurement

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

<<<OOC-ITEM-TEMPLATE
- **Acceptance eval executors install vietnormalizer unpinned — the exact drift this PR's own S4-r2 finding fixed elsewhere**
  Người dùng thấy gì: Quy trình kiểm tra tự động khi nghiệm thu tính năng này có thể chạy trên một phiên bản thư viện đọc số khác với phiên bản chính thức sản phẩm dùng, nên kết quả nghiệm thu có thể không phản ánh đúng bản thực tế nếu thư viện ngoài có bản cập nhật mới.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits
OOC-ITEM-TEMPLATE>>>

<<<OOC-ITEM-TEMPLATE
- **Percent/currency ranges misread as minus or silently lose the range word — passes all post-checks**
  Người dùng thấy gì: Khi câu chứa khoảng phần trăm hoặc khoảng giá viết liền dấu gạch ngang (ví dụ '5%-10%' hoặc '1.000₫-2.000₫'), giọng đọc có thể đọc sai thành 'trừ' thay vì đúng nghĩa khoảng, hoặc bỏ mất từ 'đến', khiến người nghe hiểu sai số liệu hoặc giá tiền.
  file: `sdk/tongflow/text/normalize_vi.py`
  severity: high
  Đề xuất: known-limits
OOC-ITEM-TEMPLATE>>>

<<<OOC-ITEM-TEMPLATE
- **Space-separated price form 'N đ' is guaranteed to fail: has_money claims it, no layer expands it**
  Người dùng thấy gì: Nếu người dùng gõ giá có khoảng trắng trước chữ 'đ' (ví dụ '500 đ' thay vì '500đ'), tính năng sẽ luôn báo lỗi thay vì đọc được giá đó, dù đây là cách viết giá rất phổ biến.
  file: `sdk/tongflow/text/normalize_vi.py`
  severity: medium
  Đề xuất: known-limits
OOC-ITEM-TEMPLATE>>>

<<<OOC-ITEM-TEMPLATE
- **Hình dạng 1 — Đo bước arrange của chính test thay vì ĐẦU RA (đăng ký lúc mount)**
  Người dùng thấy gì: Bài kiểm tra tự động cho việc node tự đăng ký khi thêm vào workflow có thể báo đạt dù chức năng đăng ký thực sự đã bị gỡ, nên lỗi ẩn này có thể lọt qua đến khi workflow chạy thật mới bị phát hiện.
  file: `src/components/workspace/nodes/transfer/normalize-text-vi.test.tsx`
  severity: high
  Đề xuất: known-limits
OOC-ITEM-TEMPLATE>>>

<<<OOC-ITEM-TEMPLATE
- **Hình dạng 2 — Khối workflow của fixture conformance viết tay đúng khuôn bên đọc, không round-trip từ exportWorkflow**
  Người dùng thấy gì: Bài kiểm tra đối chiếu giữa giao diện và máy chủ dùng dữ liệu mẫu viết tay đúng ý bên đọc, không lấy từ đầu ra thật của giao diện, nên nếu định dạng xuất workflow thay đổi sau này, sai lệch có thể không bị phát hiện cho đến khi chạy thật.
  file: `sdk/tests/conformance/fixtures/normalize-text-vi.json`
  severity: low
  Đề xuất: known-limits
OOC-ITEM-TEMPLATE>>>

⚠ Cụm ngoài vùng phủ: 4/6 lỗi rơi vào file không bộ đo nào phủ (_acceptance/config.yaml, sdk/tongflow/text/normalize_vi.py, sdk/tests/conformance/fixtures/normalize-text-vi.json) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.