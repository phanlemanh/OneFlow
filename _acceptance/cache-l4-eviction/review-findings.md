## Trong hợp đồng

_Không có phát hiện nào ánh xạ được vào AC vòng này._

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **pnpm build-script allowlist moved to an untracked pnpm-workspace.yaml; package.json's pnpm.onlyBuiltDependencies is now dead config**
  Người dùng thấy gì: Trên máy build sạch (như CI), một số thư viện cần biên dịch phần gốc có thể không được cài đặt đầy đủ vì file cấu hình cho phép bước biên dịch đó chưa được đưa vào kho mã nguồn — rủi ro là bản dựng phần mềm không ổn định hoặc lỗi ngầm mà không ai hay.
  file: `package.json`
  Đề xuất: new-contract

- **compose-overlay is an N→1 node but is filed under nodes/transfer/ (1→1 transforms)**
  Người dùng thấy gì: Tính năng ghép nhiều đầu vào (ảnh nền, chữ, logo) thành một kết quả đang bị xếp nhầm nhóm trên giao diện chọn khối, khiến người dùng tìm nó sai chỗ so với các tính năng ghép tương tự khác.
  file: `src/components/workspace/nodes/transfer/compose-overlay.tsx`
  Đề xuất: new-contract

- **Overlay op numeric inputs accept any value; ABI ranges (0–1 coords, opacity, size) are never enforced anywhere**
  Người dùng thấy gì: Người dùng có thể nhập các giá trị vô lý (như vị trí ngoài khung hình hoặc độ trong suốt vượt mức cho phép) vào tính năng chèn overlay mà không có cảnh báo nào, dẫn tới kết quả ảnh/video bị lỗi hoặc không như ý mà không rõ nguyên nhân.
  file: `src/components/workspace/nodes/transfer/compose-overlay-op-form.tsx`
  Đề xuất: new-contract

- **Refused edge swap is a silent no-op with no user feedback**
  Người dùng thấy gì: Khi người dùng chọn nối lại một kết nối trên sơ đồ workflow theo cách không hợp lệ, giao diện lặng lẽ trả về trạng thái cũ mà không giải thích vì sao — người dùng thấy như thao tác của mình bị bỏ qua vô cớ.
  file: `src/components/workspace/edges/custom-edge.tsx`
  Đề xuất: new-contract

- **ABI ops schema mixes four op kinds into one object, forcing inert required fields and a platform-specific preset enum**
  Người dùng thấy gì: Một số kiểu hiệu ứng chèn overlay bắt buộc phải điền toạ độ dù chúng không có ý nghĩa gì với kiểu hiệu ứng đó, gây khó hiểu khi cấu hình; đồng thời có một tuỳ chọn bố cục chỉ dành riêng cho TikTok bị trộn chung vào cấu hình dùng cho mọi nền tảng.
  file: `config/tongflow.abi.json`
  Đề xuất: known-limits

- **Vietnamese comments added to tracked code in lib/evidence-core.js**
  Người dùng thấy gì: Một phần chú thích trong công cụ nội bộ dùng tiếng Việt thay vì tiếng Anh theo quy ước chung của dự án — không ảnh hưởng người dùng cuối, chỉ là vấn đề nhất quán mã nguồn nội bộ.
  file: `lib/evidence-core.js`
  Đề xuất: known-limits

- **conformance.ts detects asset handles by source path while the Python engine detects them by ABI $ref — an unenforced equivalence**
  Người dùng thấy gì: Có hai cách khác nhau để nhận diện đâu là dữ liệu tệp/ảnh trong một số tính năng; hiện tại chúng cho cùng kết quả một cách tình cờ, nhưng nếu không được thống nhất, một tính năng mới trong tương lai có thể khiến hai bên xử lý sai dữ liệu tệp mà không ai phát hiện ra.
  file: `src/lib/abi/conformance.ts`
  Đề xuất: known-limits

- **CLAUDE.md still documents the first edition of check-manifest-unmoved.sh**
  Người dùng thấy gì: Một đoạn tài liệu hướng dẫn nội bộ cho lập trình viên mô tả một cơ chế kiểm tra đã cũ, có thể khiến người đọc sau này bối rối — không ảnh hưởng tới người dùng sản phẩm.
  file: `CLAUDE.md`
  Đề xuất: known-limits

- **Freshly added ops share the module-level NEW_OP object by reference**
  Người dùng thấy gì: Hiện chưa có ảnh hưởng thấy được, nhưng cách lưu giá trị mặc định khi thêm hiệu ứng overlay mới tiềm ẩn nguy cơ: một thay đổi nhỏ trong tương lai có thể âm thầm làm thay đổi giá trị mặc định cho mọi node overlay khác, kể cả những cái người dùng đã tự cấu hình.
  file: `src/components/workspace/nodes/transfer/compose-overlay-ops-editor.tsx`
  Đề xuất: known-limits

- **Plugin-test guard hardcodes a fourth copy of the SDK version that nothing checks**
  Người dùng thấy gì: Quy trình kiểm tra tự động cho plugin overlay có thể báo 'đạt' ngay cả khi plugin thực ra đang được kiểm tra với một phiên bản phần mềm nền cũ hơn bản mới nhất đã phát hành, khiến đội phát triển tin nhầm rằng plugin đã được xác nhận hoạt động đúng.
  file: `scripts/plugins/run-overlay-plugin-tests.sh`
  Đề xuất: new-contract

- **Both plugin-repo guards reuse one clone cache dir that is not keyed by the repo URL**
  Người dùng thấy gì: Trong một số trường hợp vận hành, quy trình kiểm tra tự động có thể vô tình kiểm tra nhầm một bản sao mã nguồn khác (ví dụ một bản fork) thay vì kho chính thức, rồi vẫn báo cáo kết quả 'đạt' như bình thường — làm bằng chứng kiểm thử không còn đáng tin.
  file: `scripts/plugins/run-overlay-plugin-tests.sh`
  Đề xuất: new-contract

- **frontmatterField quote-stripping fix leaks a stray opening quote for quoted values containing ' #'**
  Người dùng thấy gì: Khi một dòng tiêu đề trong báo cáo có chứa dấu ngoặc kép và dấu thăng, công cụ tạo báo cáo có thể hiển thị sai một dấu ngoặc kép thừa cho người đọc báo cáo — một biến thể của chính lỗi mà bản sửa này định khắc phục.
  file: `lib/evidence-core.js`
  Đề xuất: known-limits

