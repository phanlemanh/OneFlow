## Trong hợp đồng

### Config-target check accepts handle-bound ABI fields (e.g. `video`), and the new control test proves exactly that case
- file: `src/lib/skills/integrity.ts:40`
- severity: medium
- source: conventions
- AC: AC-1

The new check passes any key of `ABI_NODES[slot].inputs.properties`. It never asks whether that field is a config field. The repo already classifies ABI input fields as handle or config in `getAbiTopology` (src/lib/abi/handle-introspect.ts, `FieldClass`), and CLAUDE.md names that path plus the node's resolved sourceSpec as the one source of truth for how a field is fed. Every template also records it in `executableNodes[i].bindings[field].kind`.

Confirmed with a throwaway vitest probe, since deleted. A param `{kind:"config", nodeId:"s1", field:"video"}` on cat-canh-video, or on node `a1` of tach-tieng-video, returns `[]` violations. In both templates `video` is a `kind:"handle"` binding fed by edge v1→`in:video`.

At run time, `instantiate.ts:61` runs `exec.bindings[field] = { kind: "config", value }` and replaces that edge binding with a scalar. The skill passes integrity but sends the plugin a number where a VideoRef belongs.

The new control test in src/lib/skills/registry.test.ts (around line 105) picks `Object.keys(ABI_NODES[slot].inputs.properties)[0]` as its "real ABI field". For both registered skills that key is `video`, the handle field. So the test locks in the loose behaviour instead of covering a real config field such as `threshold`.

Fix direction: take the classification from `getAbiTopology(slot).inputs[field].kind === "config"`, or from the template's own binding kind. Point the control at a config-class field, and add a break for a handle-class field.

Rationale: probe xác nhận check chấp nhận target kind=config trỏ vào field đang được bind bằng handle (video) trong template — vi phạm trực tiếp điều khoản AC-1 rằng target phải trỏ tới một ô cấu hình có thật của template.

### The config-target check accepts fields wired by an edge, and the new control test locks that in
- file: `src/lib/skills/integrity.ts:46`
- severity: medium
- source: bugs
- AC: AC-1

The new check treats a config target as valid when `target.field` is any key of `ABI_NODES[slot].inputs.properties`. That list also includes Asset inputs that the template fills through an edge (`bindings[field].kind === "handle"`). A config target on such a field is not a real config knob. At run time, instantiate.ts line 61 runs `exec.bindings[field] = { kind: "config", value }`, which overwrites the edge binding. The node then gets a scalar (for example a number) as its `video` Asset, and the canvas edge in originalFlow no longer matches the executable.

Concrete case: in cat-canh-video, node s1 has slot split-video. Its ABI inputs are `video` (an Asset) and `threshold`, and the template binds `video` as `{kind:"handle", sources:[v1.fileKeys]}`. A manifest param `{kind:"config", nodeId:"s1", field:"video"}` passes `param-target-exists`, yet running the skill breaks the video wiring. tach-tieng-video is the same: its nodes a1 and r1 have only a handle-bound `video` input.

The new control test in registry.test.ts (around lines 106–118) makes this worse. It takes the FIRST ABI field of the first node's slot, which is `video` (handle-bound) for both registered skills. It then asserts that a config probe on that field gives no violations. So the test certifies exactly this broken case as "a real ABI field passes".

Fix: accept a config target only when the node's binding for that field is absent or already `kind: "config"`, not `"handle"`. Point the control probe at a real config field such as s1.threshold.

Rationale: cùng một lỗi được xác nhận bằng probe: config target được chấp nhận trên field đã có binding kind:handle, đúng vi phạm điều khoản AC-1 về target hợp lệ trỏ tới ô cấu hình có thật.

### Shape 3 (checks that a string is present when the promise is a relation): the control test marks a config target on a handle input as passing
- file: `src/lib/skills/registry.test.ts:110`
- severity: high
- source: measurement
- AC: AC-1

The control picks `const [field] = Object.keys(ABI_NODES[slot].inputs.properties ?? {})` for the first executable node. In the generated ABI, split-video lists its inputs as {video, threshold} and extract-audio lists only {video}, so the field is `video` for both skills. The test then expects `checkSkillIntegrity(...)` to return []. In both templates `video` is a handle binding: cat-canh-video/template.json has `bindings.video.kind: "handle"`, and tach-tieng-video/template.json lines 98 and 132 do the same. At runtime, instantiate.ts:61 runs `exec.bindings[field] = { kind: "config", value }`, which overwrites the handle that brings the upstream video into the node. The rule actually needs a relation to hold: the field must be one this node takes as config, not one fed by an edge. The test only checks that the name appears among the slot's ABI input keys. So the control now pins as green the exact case that breaks the graph when the skill runs. The only real config field in either skill is `threshold` on s1, and the control never picks it.

Rationale: AC-1 đòi hỏi phá từng luật trên bản sao phải làm phép kiểm đỏ; control test này lại xác nhận (pin xanh) đúng trường hợp phá luật target-hợp-lệ mà lẽ ra phải đỏ, cùng một hành vi đã được finding #1 xác nhận bằng probe.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Shape 3 (checks that a string is present when the promise is a relation): the config-field break never tests "this node's slot"**
  Người dùng thấy gì: Nếu sau này có người lỡ trỏ một tham số vào đúng tên trường nhưng thuộc một bước khác trong quy trình, bài kiểm tra tự động hiện tại chưa chắc phát hiện được lỗi cấu hình đó.
  file: `src/lib/skills/registry.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 5 (claims to sweep a class but has only point cases): the "covers every target kind" test compares a constant with a literal from the same file**
  Người dùng thấy gì: Nếu sau này hệ thống có thêm một loại tham số mới, bài kiểm tra tự động hiện tại sẽ không tự phát hiện ra thiếu sót, nên một lỗi cấu hình liên quan có thể lọt qua mà không ai được cảnh báo.
  file: `src/lib/skills/registry.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Reopening the skill panel runs an in-flight skill a second time (SSE opened without reconnect=true) (r1)**
  Người dùng thấy gì: Nếu người dùng đóng rồi mở lại ngăn Skill trong khi một lượt chạy đang xử lý, lượt đó có thể bị chạy lại từ đầu một lần nữa, gây tốn thời gian chờ và có thể cho kết quả không nhất quán.
  file: `src/components/workspace/skills/use-skill-run.ts`
  severity: high
  Đề xuất: known-limits

- **The skill client skips the shared API client, and a non-JSON or failed response throws inside startRun (r1)**
  Người dùng thấy gì: Khi máy chủ gặp sự cố nội bộ lúc gửi yêu cầu chạy skill, người dùng có thể thấy biểu mẫu đứng yên không phản hồi gì, không có thông báo lỗi, không biết chuyện gì đã xảy ra.
  file: `src/lib/api/skills.ts`
  severity: medium
  Đề xuất: known-limits

- **The concurrency limit is copied instead of shared with the workflow execute route (r1)**
  Người dùng thấy gì: Đây là vấn đề nội bộ về cách mã nguồn tổ chức, không ảnh hưởng trực tiếp tới trải nghiệm người dùng hiện tại, nhưng có nguy cơ khiến giới hạn số lượt chạy đồng thời bị lệch giữa hai tính năng nếu chỉnh sửa sau này.
  file: `src/lib/skills/run.server.ts`
  severity: low
  Đề xuất: known-limits

- **Reopening the panel during a run starts the same skill task a second time (r1)**
  Người dùng thấy gì: Nếu người dùng đóng rồi mở lại ngăn Skill trong khi một lượt chạy đang xử lý, lượt đó có thể bị chạy lại từ đầu một lần nữa, gây tốn thời gian chờ và có thể cho kết quả không nhất quán.
  file: `src/components/workspace/skills/use-skill-run.ts`
  severity: high
  Đề xuất: known-limits

- **A failed run marks steps that never ran, or that failed without a node id, as "done" (r1)**
  Người dùng thấy gì: Khi một lượt chạy thất bại, một số bước chưa từng chạy hoặc lỗi không rõ bước nào có thể vẫn hiển thị dấu tích 'đã xong', khiến người dùng hiểu nhầm về việc bước nào thực sự chạy được.
  file: `src/lib/skills/run.server.ts`
  severity: medium
  Đề xuất: known-limits

- **A submit response without a JSON body crashes startRun and the user sees nothing (r1)**
  Người dùng thấy gì: Khi máy chủ trả lỗi mà không kèm nội dung mô tả, biểu mẫu chạy skill có thể đứng im, không hiện thông báo lỗi và không cho người dùng biết cần làm gì tiếp theo.
  file: `src/components/workspace/skills/skill-sheet.tsx`
  severity: medium
  Đề xuất: known-limits

- **Upload failures are only logged; the file field quietly goes back to empty (r1)**
  Người dùng thấy gì: Nếu tải tệp lên thất bại (sai định dạng hoặc lỗi mạng), ô chọn tệp chỉ lặng lẽ quay về trạng thái trống mà không nói cho người dùng biết vì sao, khiến họ tưởng chưa chọn tệp.
  file: `src/components/workspace/skills/skill-sheet.tsx`
  severity: medium
  Đề xuất: known-limits

- **The run view can get stuck on "running" because there is no retry after the one refresh (r1)**
  Người dùng thấy gì: Trong một số tình huống mất kết nối ngắn hoặc lệch thời điểm cập nhật, màn theo dõi tiến trình có thể bị kẹt ở trạng thái 'đang chạy' mãi dù lượt chạy đã thực sự xong hoặc lỗi, cho tới khi người dùng đóng rồi mở lại ngăn.
  file: `src/components/workspace/skills/use-skill-run.ts`
  severity: medium
  Đề xuất: known-limits

- **A failed skill list load shows an empty list, or a skeleton that never stops (r1)**
  Người dùng thấy gì: Nếu việc tải danh sách skill gặp lỗi, ngăn skill có thể hiện danh sách trống không một lời giải thích, hoặc bị kẹt ở trạng thái đang tải mãi mãi.
  file: `src/components/workspace/skills/skill-sheet.tsx`
  severity: low
  Đề xuất: known-limits

- **The a11y guard's default port 3198 is already taken by the media-library guard (r1)**
  Người dùng thấy gì: Đây là xung đột hạ tầng kiểm thử nội bộ (hai kịch bản kiểm tra khả năng tiếp cận dùng chung một cổng mạng), không ảnh hưởng tới người dùng cuối.
  file: `scripts/skills/check-a11y-proto.sh`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): kết quả engine của split-video trong E10 là gõ tay (r1)**
  Người dùng thấy gì: Nếu quy trình xử lý cho ra nhiều tệp kết quả (ví dụ cắt video thành nhiều đoạn) theo khuôn dữ liệu khác với giả định hiện tại của phép kiểm, người dùng có thể thấy thiếu tệp hoặc liên kết tải sai mà không phép đo nào phát hiện trước khi phát hành.
  file: `src/components/workspace/skills/skill-sheet-run-states.test.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert «có mặt» trong khi lời hứa là quan hệ): steps chỉ được đếm và kiểm tập khoá, không đối chiếu với node của instance (r1)**
  Người dùng thấy gì: Việc kiểm tra tiến trình từng bước hiện chỉ xác nhận có đủ số trường dữ liệu, chưa đối chiếu đúng bước nào ứng với đúng node nào — một sai lệch trong việc gán trạng thái từng bước có thể lọt qua mà không bị phát hiện.
  file: `src/app/api/skills/runs-collect.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (assert «có mặt» thay vì quan hệ deep-equal): «Huỷ» chỉ kiểm danh sách id node (r1)**
  Người dùng thấy gì: Nút 'Huỷ' khi mở lại kế hoạch trên canvas hiện chỉ được xác nhận là giữ đúng danh sách node, chưa chắc giữ nguyên các đường nối hay vị trí/tham số — một lỗi làm mất các chi tiết này có thể lọt qua mà không bị phát hiện.
  file: `src/components/workspace/skills/view-plan.test.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (thiếu ma trận toàn phần, số assert không ghim bằng số phần tử): instantiate lặng lẽ bỏ qua tham số không có trong sampleParams (r1)**
  Người dùng thấy gì: Nếu một skill trong tương lai thiếu giá trị mẫu cho một tham số tuỳ chọn, việc kiểm tra tham số đó có được truyền đúng hay không sẽ tự động bị bỏ qua mà không ai nhận ra.
  file: `src/lib/skills/instantiate.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (số assert gõ tay, không đọc từ manifest): e2e kiểm đầu ra theo danh sách cố định tieng/video-cam (r1)**
  Người dùng thấy gì: Nếu tính năng tách tiếng video sau này có thêm một đầu ra mới, kịch bản kiểm tra tự động hiện tại sẽ không kiểm tra đầu ra mới đó, khiến một đầu ra hỏng có thể lọt qua mà không bị phát hiện.
  file: `scripts/skills/e2e-tach-tieng.sh`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).