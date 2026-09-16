## Trong hợp đồng

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có một điểm-case): luật param-target-exists chỉ bị phá ở target kiểu input**
  file: `src/lib/skills/registry.test.ts:22`
  severity: medium
  detail: AC-1/E1 hứa luật «mọi target của tham số trỏ tới một nút dữ liệu đầu vào HOẶC một ô cấu hình có thật», tức lớp target có hai kiểu. BREAKS["param-target-exists"] chỉ đặt `d.manifest.params[0].target = { kind: "input", name: "input_nope" }`, mà params[0] của cả hai skill đều là input `video`. Kiểu `config` (ví dụ `do-nhay` → s1.threshold) không có ca phá nào. Nhánh config trong integrity.ts (dòng 40-42) chỉ kiểm `nodeId` có tồn tại, không kiểm `field`, nên một target config trỏ vào ô cấu hình không có thật vẫn lọt, và không phép đo nào đỏ. Ma trận phá không được viết theo đủ các phần tử của lớp target.
  source: measurement
  AC: AC-1

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Reopening the skill panel runs an in-flight skill a second time (SSE opened without reconnect=true)**
  Người dùng thấy gì: Nếu người dùng đóng rồi mở lại ngăn Skill trong khi một lượt chạy đang xử lý, lượt đó có thể bị chạy lại từ đầu một lần nữa, gây tốn thời gian chờ và có thể cho kết quả không nhất quán.
  file: `src/components/workspace/skills/use-skill-run.ts`
  severity: high
  Đề xuất: known-limits

- **The skill client skips the shared API client, and a non-JSON or failed response throws inside startRun**
  Người dùng thấy gì: Khi máy chủ gặp sự cố nội bộ lúc gửi yêu cầu chạy skill, người dùng có thể thấy biểu mẫu đứng yên không phản hồi gì, không có thông báo lỗi, không biết chuyện gì đã xảy ra.
  file: `src/lib/api/skills.ts`
  severity: medium
  Đề xuất: known-limits

- **The concurrency limit is copied instead of shared with the workflow execute route**
  Người dùng thấy gì: Đây là vấn đề nội bộ về cách mã nguồn tổ chức, không ảnh hưởng trực tiếp tới trải nghiệm người dùng hiện tại, nhưng có nguy cơ khiến giới hạn số lượt chạy đồng thời bị lệch giữa hai tính năng nếu chỉnh sửa sau này.
  file: `src/lib/skills/run.server.ts`
  severity: low
  Đề xuất: known-limits

- **Reopening the panel during a run starts the same skill task a second time**
  Người dùng thấy gì: Nếu người dùng đóng rồi mở lại ngăn Skill trong khi một lượt chạy đang xử lý, lượt đó có thể bị chạy lại từ đầu một lần nữa, gây tốn thời gian chờ và có thể cho kết quả không nhất quán.
  file: `src/components/workspace/skills/use-skill-run.ts`
  severity: high
  Đề xuất: known-limits

- **A failed run marks steps that never ran, or that failed without a node id, as "done"**
  Người dùng thấy gì: Khi một lượt chạy thất bại, một số bước chưa từng chạy hoặc lỗi không rõ bước nào có thể vẫn hiển thị dấu tích 'đã xong', khiến người dùng hiểu nhầm về việc bước nào thực sự chạy được.
  file: `src/lib/skills/run.server.ts`
  severity: medium
  Đề xuất: known-limits

- **A submit response without a JSON body crashes startRun and the user sees nothing**
  Người dùng thấy gì: Khi máy chủ trả lỗi mà không kèm nội dung mô tả, biểu mẫu chạy skill có thể đứng im, không hiện thông báo lỗi và không cho người dùng biết cần làm gì tiếp theo.
  file: `src/components/workspace/skills/skill-sheet.tsx`
  severity: medium
  Đề xuất: known-limits

- **Upload failures are only logged; the file field quietly goes back to empty**
  Người dùng thấy gì: Nếu tải tệp lên thất bại (sai định dạng hoặc lỗi mạng), ô chọn tệp chỉ lặng lẽ quay về trạng thái trống mà không nói cho người dùng biết vì sao, khiến họ tưởng chưa chọn tệp.
  file: `src/components/workspace/skills/skill-sheet.tsx`
  severity: medium
  Đề xuất: known-limits

- **The run view can get stuck on "running" because there is no retry after the one refresh**
  Người dùng thấy gì: Trong một số tình huống mất kết nối ngắn hoặc lệch thời điểm cập nhật, màn theo dõi tiến trình có thể bị kẹt ở trạng thái 'đang chạy' mãi dù lượt chạy đã thực sự xong hoặc lỗi, cho tới khi người dùng đóng rồi mở lại ngăn.
  file: `src/components/workspace/skills/use-skill-run.ts`
  severity: medium
  Đề xuất: known-limits

- **A failed skill list load shows an empty list, or a skeleton that never stops**
  Người dùng thấy gì: Nếu việc tải danh sách skill gặp lỗi, ngăn skill có thể hiện danh sách trống không một lời giải thích, hoặc bị kẹt ở trạng thái đang tải mãi mãi.
  file: `src/components/workspace/skills/skill-sheet.tsx`
  severity: low
  Đề xuất: known-limits

- **The a11y guard's default port 3198 is already taken by the media-library guard**
  Người dùng thấy gì: Đây là xung đột hạ tầng kiểm thử nội bộ (hai kịch bản kiểm tra khả năng tiếp cận dùng chung một cổng mạng), không ảnh hưởng tới người dùng cuối.
  file: `scripts/skills/check-a11y-proto.sh`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): kết quả engine của split-video trong E10 là gõ tay**
  Người dùng thấy gì: Nếu quy trình xử lý cho ra nhiều tệp kết quả (ví dụ cắt video thành nhiều đoạn) theo khuôn dữ liệu khác với giả định hiện tại của phép kiểm, người dùng có thể thấy thiếu tệp hoặc liên kết tải sai mà không phép đo nào phát hiện trước khi phát hành.
  file: `src/components/workspace/skills/skill-sheet-run-states.test.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert «có mặt» trong khi lời hứa là quan hệ): steps chỉ được đếm và kiểm tập khoá, không đối chiếu với node của instance**
  Người dùng thấy gì: Việc kiểm tra tiến trình từng bước hiện chỉ xác nhận có đủ số trường dữ liệu, chưa đối chiếu đúng bước nào ứng với đúng node nào — một sai lệch trong việc gán trạng thái từng bước có thể lọt qua mà không bị phát hiện.
  file: `src/app/api/skills/runs-collect.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (assert «có mặt» thay vì quan hệ deep-equal): «Huỷ» chỉ kiểm danh sách id node**
  Người dùng thấy gì: Nút 'Huỷ' khi mở lại kế hoạch trên canvas hiện chỉ được xác nhận là giữ đúng danh sách node, chưa chắc giữ nguyên các đường nối hay vị trí/tham số — một lỗi làm mất các chi tiết này có thể lọt qua mà không bị phát hiện.
  file: `src/components/workspace/skills/view-plan.test.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (thiếu ma trận toàn phần, số assert không ghim bằng số phần tử): instantiate lặng lẽ bỏ qua tham số không có trong sampleParams**
  Người dùng thấy gì: Nếu một skill trong tương lai thiếu giá trị mẫu cho một tham số tuỳ chọn, việc kiểm tra tham số đó có được truyền đúng hay không sẽ tự động bị bỏ qua mà không ai nhận ra.
  file: `src/lib/skills/instantiate.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (số assert gõ tay, không đọc từ manifest): e2e kiểm đầu ra theo danh sách cố định tieng/video-cam**
  Người dùng thấy gì: Nếu tính năng tách tiếng video sau này có thêm một đầu ra mới, kịch bản kiểm tra tự động hiện tại sẽ không kiểm tra đầu ra mới đó, khiến một đầu ra hỏng có thể lọt qua mà không bị phát hiện.
  file: `scripts/skills/e2e-tach-tieng.sh`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
