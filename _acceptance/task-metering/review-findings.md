## Trong hợp đồng

_Không có phát hiện nào ánh xạ được vào AC vòng này._

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **ABI `ops` items are an undiscriminated bag — the compile-time gate carries nothing about op kinds**
  Người dùng thấy gì: Khi người dùng thêm nhiều loại lớp phủ (logo, vùng an toàn, nhãn giá...) vào một nút ghép ảnh, hệ thống không phát hiện thiếu thông tin bắt buộc hoặc thuộc tính sai loại ngay lúc thiết kế — lỗi chỉ lộ ra khi chạy thật, có thể khiến kết quả ảnh bị sai hoặc thiếu nội dung.
  file: `config/tongflow.abi.json`
  Đề xuất: new-contract

- **Python model generator silently drops `enum`; compose-overlay introduces the ABI's first enums**
  Người dùng thấy gì: Khi một plugin xử lý các lựa chọn cố định (loại lớp phủ, vị trí neo, căn lề...), hệ thống không còn phát hiện giá trị gõ sai hoặc không hợp lệ trước khi chạy — lỗi chỉ xuất hiện khi người dùng thực sự chạy tác vụ, thay vì được chặn sớm.
  file: `sdk/tongflow/gen_models.py`
  Đề xuất: new-contract

- **`check-manifest-unmoved.sh` rewritten to a new contract, but CLAUDE.md's instructions for it were not updated**
  Người dùng thấy gì: Người tiếp theo đăng ký một plugin chính thức sẽ gặp thông báo lỗi khó hiểu và tài liệu hướng dẫn không còn khớp với cách sửa thực tế, khiến họ mất thời gian tự mò cách vượt qua.
  file: `scripts/plugins/check-manifest-unmoved.sh`
  Đề xuất: known-limits

- **SDK version hardcoded a third time in run-overlay-plugin-tests.sh, outside the drift guard**
  Người dùng thấy gì: Khi nâng cấp phiên bản SDK, bộ kiểm thử cho plugin ghép ảnh có thể âm thầm chạy trên phiên bản SDK cũ, khiến kết quả kiểm thử báo đạt dù thực tế đang kiểm tra sai phiên bản — rủi ro lọt lỗi ra bản phát hành.
  file: `scripts/plugins/run-overlay-plugin-tests.sh`
  Đề xuất: known-limits

- **compose-overlay node placed under transfer/ although it combines multiple asset handles (N→1)**
  Người dùng thấy gì: Đây là vấn đề tổ chức mã nguồn nội bộ, không ảnh hưởng đến trải nghiệm hay kết quả mà người dùng cuối nhìn thấy.
  file: `src/components/workspace/nodes/transfer/compose-overlay.tsx`
  Đề xuất: known-limits

- **Refused edge swap is a silent no-op with no user feedback**
  Người dùng thấy gì: Khi người dùng cố đổi một kết nối sang một điểm nối không hợp lệ, giao diện chỉ lặng lẽ hoàn tác lựa chọn mà không giải thích gì, khiến người dùng tưởng thao tác bị treo hoặc có lỗi ẩn.
  file: `src/components/workspace/edges/custom-edge.tsx`
  Đề xuất: known-limits

- **Inline edge target-select silently no-ops on a refused swap**
  Người dùng thấy gì: Trên nút ghép ảnh mới, khi người dùng chọn đổi điểm nối trong danh sách thả xuống mà lựa chọn đó thực ra không hợp lệ, giao diện vẫn cho chọn nhưng sau đó không có gì xảy ra và không giải thích gì — người dùng dễ nghĩ ứng dụng bị treo hoặc lỗi.
  file: `src/components/workspace/edges/custom-edge.tsx`
  Đề xuất: new-contract

- **Exporter still pins a widened slot's workflow output to the first declared route**
  Người dùng thấy gì: Khi một nút ghép ảnh nhận video làm đầu vào nhưng không nối tiếp ra nút nào khác, thông tin mô tả kết quả xuất ra ghi sai loại (báo là ảnh thay vì video) dù kết quả thực tế trên canvas vẫn đúng — có thể gây nhầm lẫn cho công cụ đọc bản xuất workflow.
  file: `src/lib/workflow/exporter.ts`
  Đề xuất: known-limits

