## Trong hợp đồng

(không có finding nào map được vào AC của conformance-l0)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **alsoAccepts bỏ sót tầng director — compose-overlay chặn video bằng MODALITY_MISMATCH giả**
  Người dùng thấy gì: Trợ lý AI dựng workflow tự động sẽ không bao giờ đưa video vào ô ghép ảnh/video của overlay; nếu người dùng tự ép nối video, hệ thống báo lỗi sai kiểu và từ chối chạy.
  file: `src/lib/director/compile.ts`
  severity: high
  Đề xuất: new-contract

- **evidence-page.html commit ở HEAD là bản round 4 chưa ký, mâu thuẫn với evidence-report.md round 7 đã ký**
  Người dùng thấy gì: Trang bằng chứng nghiệm thu cho tính năng ghép overlay hiện đang cho thấy tính năng CHƯA được duyệt, dù thực tế đã được ký duyệt — người xem có thể hiểu nhầm tính năng chưa sẵn sàng dùng.
  file: `_acceptance/compose-overlay/evidence-page.html`
  severity: medium
  Đề xuất: known-limits

- **Node 3-handle N→1 đặt vào transfer/ + TRANSFORM thay vì compose/**
  Người dùng thấy gì: Node ghép overlay bị xếp nhầm nhóm trên bảng chọn node, khiến người dùng khó tìm thấy nó ở đúng danh mục khi build workflow.
  file: `src/components/workspace/nodes/transfer/compose-overlay.tsx`
  severity: medium
  Đề xuất: known-limits

- **check-manifest-unmoved.sh trùng assertion với check-overlay-registration.sh và mâu thuẫn comment của chính script kia**
  Người dùng thấy gì: Một tập lệnh kiểm tra nội bộ đang trùng lặp và có nguy cơ báo lỗi khi có plugin không liên quan được thêm vào sau này — có thể chặn nhầm việc phát hành các tính năng khác.
  file: `scripts/plugins/check-manifest-unmoved.sh`
  severity: low
  Đề xuất: known-limits

- **canSwapOntoHandle/getEdgeTargetOptions chỉ đọc mount registry, không dùng fallback spec tĩnh mà chính diff này thiết lập**
  Người dùng thấy gì: Khi vừa mở lại một workflow, việc đổi hướng nối dây cho node overlay có thể bị từ chối âm thầm dù thao tác hợp lệ — không có thông báo giải thích, ô chọn chỉ tự nhảy về giá trị cũ.
  file: `src/lib/abi/edge-target-options.ts`
  severity: low
  Đề xuất: known-limits

- **Overlay x/y coordinate inputs silently coerce to 0 — decimals cannot be typed**
  Người dùng thấy gì: Nhập toạ độ thập phân (ví dụ 0.35) cho vị trí overlay trên ảnh/video bị tự động xoá về 0 ngay khi gõ — người dùng không thể đặt vị trí chính xác bằng số thập phân.
  file: `/Users/manh-macmini/dev/oneflow/src/components/workspace/nodes/transfer/compose-overlay-op-form.tsx`
  severity: high
  Đề xuất: new-contract

- **`media` and `logo` handle labels missing from all five locales**
  Người dùng thấy gì: Tên hai đầu nối dây mới của node overlay (ảnh/video nền và logo) hiển thị bằng tiếng Anh thô thay vì được dịch, ở tất cả năm ngôn ngữ hỗ trợ.
  file: `/Users/manh-macmini/dev/oneflow/src/i18n/messages/en.json`
  severity: medium
  Đề xuất: known-limits

- **Unresolvable upstream modality silently classified as image, hiding video time controls**
  Người dùng thấy gì: Nếu hệ thống không xác định được loại media nối vào overlay, nó âm thầm coi là ảnh tĩnh và ẩn các tuỳ chọn thời gian video — người dùng không biết hệ thống đã đoán sai loại media.
  file: `/Users/manh-macmini/dev/oneflow/src/components/workspace/nodes/transfer/compose-overlay.tsx`
  severity: low
  Đề xuất: known-limits

- **SelectField renders a selected option that does not match the underlying value**
  Người dùng thấy gì: Với một số tuỳ chọn overlay chưa được người dùng chọn, giao diện lại hiển thị sẵn một lựa chọn như thể đã chọn, dù bản chạy thực tế không dùng lựa chọn đó — dễ gây hiểu nhầm giữa cái nhìn thấy và cái thực thi.
  file: `/Users/manh-macmini/dev/oneflow/src/components/workspace/nodes/transfer/compose-overlay-op-form.tsx`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 8/9 lỗi rơi vào file không bộ đo nào phủ (src/lib/director/compile.ts, _acceptance/compose-overlay/evidence-page.html, src/components/workspace/nodes/transfer/compose-overlay.tsx, src/lib/abi/edge-target-options.ts, src/components/workspace/nodes/transfer/compose-overlay-op-form.tsx, src/i18n/messages/en.json) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
