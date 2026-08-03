## Trong hợp đồng

(none — no findings mapped to an AC this round.)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **New i18n coherence guard omits vi.json (repo ships 5 locales)**
  Người dùng thấy gì: Bộ kiểm tra tự động cho nhãn hiển thị của node hiện chỉ theo dõi 4 trong 5 ngôn ngữ đang có trong sản phẩm; nếu sau này ai đó vô tình làm sai lệch bản tiếng Việt, hệ thống sẽ không tự phát hiện được, dù hiện tại bản dịch tiếng Việt vẫn đầy đủ và đúng.
  file: `/Users/manh-macmini/dev/oneflow/scripts/plugins/check-overlay-registration.sh`
  severity: low
  Đề xuất: known-limits

- **Registration guard duplicates manifest invariants already pinned in check-manifest-unmoved.sh**
  Người dùng thấy gì: Khi đội phát triển đăng ký một plugin mới trong tương lai, họ sẽ phải sửa cùng lúc hai kịch bản kiểm tra trùng lặp nhau thay vì một, làm tăng khả năng một thay đổi không liên quan bị báo lỗi nhầm.
  file: `/Users/manh-macmini/dev/oneflow/scripts/plugins/check-overlay-registration.sh`
  severity: low
  Đề xuất: known-limits

- **Video sources can never connect to compose-overlay in:media — video half of the feature is unreachable**
  Người dùng thấy gì: Người dùng không thể nối một nguồn video vào ô nhận nội dung của node dán chữ/khung giá/logo — mọi kết nối video vào node này đều bị hệ thống từ chối ngay khi kéo dây, khiến tính năng dán overlay lên video mà sản phẩm đã hứa không dùng được trong thực tế dù phần ảnh vẫn hoạt động.
  file: `src/lib/abi/node-feature-registry.ts`
  severity: high
  Đề xuất: new-contract

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).