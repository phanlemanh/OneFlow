## Trong hợp đồng

- **Regex fallback mounts the key prompt for failures the classifier deliberately rejects**
  file: `src/components/workspace/nodes/base/abi-node-shell.tsx:55`
  severity: medium
  source: conventions
  AC: AC-11
  detail: `failure-actions.ts` states the rule for this feature explicitly: an unrecognised failure gets no action, because "a plausible-looking action for an unknown cause is worse than none", and its tests pin that (`classifyFailure("Plugin X does not implement nodeSlot=...") === {kind:"none"}`).

  `envKeyFromFailure` then reinstates the opposite behaviour: when `classifyFailure` returns `none`, it falls through to `KEY_FAILURE_PATTERN` (`missing|invalid|unauthorized|not set|401|403|...`) plus `ENV_KEY_PATTERN`. Any FAILED message that merely contains one of those words *and* a token shaped like `*_KEY`/`*_TOKEN`/`*_SECRET` mounts a key-entry form on the node — e.g. a plugin stderr line such as "invalid value for HF_TOKEN header" or a 403 from an unrelated storage call. The two rules cannot both hold; either delete the fallback or teach the shared classifier the extra provider-worded shapes so there is one place that decides.

  rationale: AC-11 quy định rõ: khi lỗi không phân loại được thì phải là "thông báo hiện tại, không hành động bịa ra"; finding chỉ ra một đường vòng regex vẫn dựng form nhập khoá cho đúng trường hợp classifier đã trả về "none", tức hành động đưa ra không khớp nguyên nhân — vi phạm trực tiếp câu chữ của AC-11.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **UI copy hardcoded in Vietnamese, bypassing the repo's next-intl layer**
  Người dùng thấy gì: Người dùng chọn ngôn ngữ khác tiếng Việt vẫn thấy nhãn ô nhập khoá và một số nút hiện bằng tiếng Việt, gây khó hiểu cho người không biết tiếng Việt.
  file: `src/components/workspace/nodes/base/abi-node-shell.tsx`
  severity: high
  Đề xuất: new-contract

- **User-facing presentation strings placed in server-side lib, unreachable by i18n**
  Người dùng thấy gì: Các dòng thông báo tiến độ cài đặt và kết quả kiểm tra khoá hiện luôn hiển thị bằng tiếng Việt, không đổi theo ngôn ngữ mà người dùng đã chọn cho ứng dụng.
  file: `src/lib/plugin-executor/provisioning-events.ts`
  severity: high
  Đề xuất: new-contract

- **taskErrorFromSSE treats running-progress text as a task error**
  Người dùng thấy gì: Trong một số phiên chạy bình thường, hệ thống có thể lưu tạm một dòng tiến độ vào đúng chỗ dành cho thông báo lỗi, nhưng hiện chưa có màn hình nào hiển thị nó nên người dùng không thấy ảnh hưởng.
  file: `src/lib/task/sse-error.ts`
  severity: medium
  Đề xuất: known-limits

- **Outbound key probe has no timeout; the settings save awaits it**
  Người dùng thấy gì: Nếu nhà cung cấp dịch vụ mà người dùng nhập khoá không phản hồi, ô nhập khoá có thể bị kẹt ở trạng thái đang kiểm tra không có thời hạn, buộc người dùng phải tải lại trang.
  file: `src/lib/onboarding/key-verify.ts`
  severity: medium
  Đề xuất: known-limits

- **Node key prompt read-modify-writes the whole env map, racing the settings dialog**
  Người dùng thấy gì: Nếu người dùng lưu khoá tại một node đúng lúc hộp thoại cài đặt cũng đang lưu khoá khác, một trong hai khoá có thể bị ghi đè mất mà không có cảnh báo nào.
  file: `src/components/workspace/nodes/base/abi-node-shell.tsx`
  severity: medium
  Đề xuất: known-limits

- **Magic number 1 instead of constants.COPYFILE_EXCL**
  Người dùng thấy gì: Đây là vấn đề phong cách viết mã nội bộ của đội phát triển, không ảnh hưởng gì tới trải nghiệm của người dùng.
  file: `src/lib/onboarding/seed-example-asset.server.ts`
  severity: low
  Đề xuất: known-limits

- **Install progress counter is frozen at 0**
  Người dùng thấy gì: Trong suốt vài phút tải công cụ, màn hình luôn hiện số đếm 0 trên tổng số rồi biến mất đột ngột, khiến người dùng khó phân biệt với việc máy bị treo.
  file: `src/components/workspace/first-run-strip-container.tsx`
  severity: low
  Đề xuất: new-contract

- **check-t3-untouched.sh crashes on every call without --allow/--require (bash 3.2 + set -u)**
  Người dùng thấy gì: Đây là lỗi trong công cụ kiểm tra nội bộ của đội phát triển, không phải hành vi mà người dùng cuối gặp phải khi dùng sản phẩm.
  file: `scripts/acceptance/check-t3-untouched.sh`
  severity: high
  Đề xuất: known-limits

- **Documented flag-only invocation is impossible: base-ref positional swallows the first flag**
  Người dùng thấy gì: Đây cũng là lỗi trong công cụ kiểm tra nội bộ, không ảnh hưởng tới sản phẩm mà người dùng thực sự sử dụng.
  file: `scripts/acceptance/check-t3-untouched.sh`
  severity: medium
  Đề xuất: known-limits

- **Bare catch collapses every install failure into a wrong network message and discards the server's reasons**
  Người dùng thấy gì: Khi việc tải công cụ thất bại vì một lý do cụ thể khác, người dùng luôn nhận một thông báo chung là "kiểm tra kết nối mạng", kể cả khi mạng vẫn tốt và nguyên nhân thật sự khác hẳn.
  file: `src/components/workspace/first-run-strip-container.tsx`
  severity: medium
  Đề xuất: known-limits

- **Provider key probe has no timeout — PUT /api/settings/env and the node key prompt can hang forever**
  Người dùng thấy gì: Cùng vấn đề với việc lệnh hỏi nhà cung cấp không có hạn giờ: ô nhập khoá có thể kẹt ở trạng thái đang kiểm tra mãi không xong nếu nhà cung cấp không phản hồi.
  file: `src/lib/onboarding/key-verify.ts`
  severity: medium
  Đề xuất: known-limits

- **taskErrorFromSSE stores progress text as task.error on healthy RUNNING tasks**
  Người dùng thấy gì: Giống lỗi tương tự, một dòng tiến độ chạy bình thường có thể bị ghi nhầm vào chỗ lưu lỗi trong hệ thống, nhưng hiện chưa có màn hình nào cho người dùng thấy nó.
  file: `src/lib/task/sse-error.ts`
  severity: medium
  Đề xuất: known-limits

- **Unhandled rejection on /example.json fetch; readiness silently stays null and the strip never renders**
  Người dùng thấy gì: Nếu việc tải dữ liệu ví dụ mẫu gặp trục trặc mạng, dải hướng dẫn cho người dùng lần đầu có thể không bao giờ xuất hiện, mà không có cảnh báo nào để đội phát triển nhận biết.
  file: `src/hooks/use-first-run-readiness.ts`
  severity: medium
  Đề xuất: known-limits

- **execution-status-line still prefers the generic headline over the specific error**
  Người dùng thấy gì: Khi một tác vụ thất bại, dòng trạng thái dưới canvas có thể hiện câu chung chung trong khi thông báo bật lên cạnh đó đã nói rõ nguyên nhân thật — hai nơi nói hai điều khác nhau về cùng một lỗi.
  file: `src/components/workspace/execution-status-line.tsx`
  severity: low
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình: nửa ĐỎ của E1 chỉ ghim exit-code, không ghim thông điệp — hiện đang đỏ vì lý do sai**
  Người dùng thấy gì: Đây là vấn đề trong công cụ kiểm thử nội bộ đo lường tiêu chí đã duyệt, không phải hành vi mà người dùng gặp phải trong sản phẩm.
  file: `scripts/onboarding/check-example-needs-no-keys.sh`
  severity: high
  Đề xuất: known-limits

- **Fixture viết tay đúng khuôn bên đọc — AC-3 hứa "không tái xuất sau khi mở lại" nhưng không có round-trip writer→reader**
  Người dùng thấy gì: Đây là vấn đề trong công cụ kiểm thử nội bộ, không phải bằng chứng cho thấy dải hướng dẫn thực sự tái xuất hiện khi người dùng mở lại ứng dụng.
  file: `src/hooks/use-first-run-readiness.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình: test nhãn fallback chỉ khẳng định "không phải id", không ghim nhãn và rỗng-thì-đúng**
  Người dùng thấy gì: Đây cũng là vấn đề trong bộ kiểm thử nội bộ, không ảnh hưởng tới trải nghiệm thực tế của người dùng.
  file: `src/hooks/use-first-run-readiness.test.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

(không có)

⚠ Cụm ngoài vùng phủ: 15/18 lỗi rơi vào file không bộ đo nào phủ (src/components/workspace/nodes/base/abi-node-shell.tsx, src/lib/plugin-executor/provisioning-events.ts, src/lib/task/sse-error.ts, src/components/workspace/first-run-strip-container.tsx, scripts/acceptance/check-t3-untouched.sh, src/hooks/use-first-run-readiness.ts, src/components/workspace/execution-status-line.tsx, scripts/onboarding/check-example-needs-no-keys.sh, src/hooks/use-first-run-readiness.test.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
