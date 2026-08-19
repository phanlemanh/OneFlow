phân loại phạm vi không chạy được — không lỗi nào bị máy tự sửa, người xem lại toàn bộ.

## Trong hợp đồng

### First-run strip never exits the "provisioning" state on a failed/cancelled workflow
- file: `src/components/workspace/first-run-strip-container.tsx:49`
- severity: high
- AC: AC-8
- detail: TERMINAL_STATUSES is {"COMPLETED","FAILED","CANCELLED"} — task-level statuses. But the bundled first-run example runs as a WORKFLOW, and use-workflow-execution.ts re-emits the raw SSE status onto the same bus: WORKFLOW_STARTED / NODE_STARTED / NODE_FAILED / WORKFLOW_COMPLETED / WORKFLOW_FAILED / WORKFLOW_CANCELLED (src/constants/task-status.ts:29-49). None of those is in the set, so the branch at line 90 never runs on the workflow path.

  Failure scenario: user presses Run on the bundled example, provisioning milestones arrive (generic.ts notifyTask(..., RUNNING, {provisioning})) and set override={phase:"provisioning"}. The workflow then fails — use-workflow-execution.ts:341 sets workflowExecutionStatus="failed", so the dismiss effect at line 115 (`if (workflowStatus !== "completed") return`) does nothing, and the terminal-status branch never fires. The strip stays on screen showing a spinner, the milestone trail, and an elapsed counter that keeps ticking forever for work that already ended — exactly the "hang" the AC-8 comment says the counter exists to rule out. Same for WORKFLOW_CANCELLED.

  Second effect of the same miss: provisioningStartRef.current is never reset to null (line 91), so a later provisioning session on the same page reports elapsed time measured from the first one.
- source: bugs

### Partial plugin-install failure discards the successful installs from the client registry
- file: `src/components/workspace/first-run-strip-container.tsx:140`
- severity: medium
- AC: AC-6
- detail: /api/plugins/install-missing returns 502 whenever `result.failed.length > 0` (src/app/api/plugins/install-missing/route.ts:23), even when other plugins in the same call installed successfully — installMissingForExample keeps going after a failure and reports {installed, skipped, failed}.

  On that 502 the client does `if (!res.ok) throw` at line 140, which skips `refreshPluginsRegistry()` at line 143 and jumps to the `blocked` state. The plugins that really did install are now present on disk and in the server registry but invisible to the client store the node pickers and useFirstRunReadiness read, until a full page reload — the exact "no restart, no reload" property (AC-6) the code comment claims. The response body carrying `installed`/`failed` is also thrown away, so the blocked message says "could not download" even for a run that installed 2 of 3.

  Failure scenario: example needs oneflow-api-pyscenedetect + oneflow-api-ffmpeg; the second clone fails on a flaky network. pyscenedetect is installed but the strip still says missing/blocked and the node picker does not list it until reload.
- source: bugs

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Hardcoded Vietnamese UI copy bypasses the repo's next-intl i18n (5 locales, default zh)**
  Người dùng thấy gì: Người dùng chọn giao diện tiếng Anh, Trung, Nhật hoặc Hàn vẫn thấy nhiều dòng chữ tiếng Việt xen lẫn trên đúng những màn hình được thiết kế để dễ tiếp cận nhất với người mới, gây khó hiểu ngay từ lần dùng đầu tiên.
  file: `src/components/workspace/nodes/base/abi-node-shell.tsx:41`
  severity: high
  Đề xuất: new-contract

- **Executor now gates every run on `tongflow.plugin.json`, contradicting that manifest's documented "Settings UI only" invariant**
  Người dùng thấy gì: Một số plugin cài sẵn có thể ngừng chạy hoàn toàn nếu tác giả plugin từng đánh dấu một trường là 'bắt buộc' chỉ để hiển thị đẹp trên màn hình cài đặt, dù người dùng chưa từng thực sự cần đến trường đó khi chạy.
  file: `src/lib/plugin-executor/runners/generic.ts:64`
  severity: high
  Đề xuất: known-limits

- **Node key prompt bypasses the shared API client used everywhere else for the same endpoint**
  Người dùng thấy gì: Nếu máy chủ phản hồi chậm khi kiểm tra khoá API ngay tại node, ô nhập khoá có thể treo vô thời hạn không có cách tự thoát, trong khi những nơi khác trong ứng dụng có giới hạn thời gian chờ để tránh việc này.
  file: `src/components/workspace/nodes/base/abi-node-shell.tsx:107`
  severity: medium
  Đề xuất: known-limits

- **Second concurrent whole-map writer to /api/settings/env creates a lost-update race**
  Người dùng thấy gì: Nếu người dùng mở cả hộp thoại Cài đặt và ô nhập khoá trên node cùng lúc rồi lưu gần như đồng thời, các khoá API đã lưu trước đó có thể bị âm thầm xoá mất mà không có cảnh báo nào.
  file: `src/components/workspace/nodes/base/abi-node-shell.tsx:105`
  severity: medium
  Đề xuất: known-limits

- **seedExampleAsset rethrows on most errnos, so an unwritable uploads dir 500s the whole /workspace page**
  Người dùng thấy gì: Nếu ổ đĩa máy chủ bị đầy hoặc thư mục lưu file không có quyền ghi, toàn bộ trang không gian làm việc có thể sập thành trang lỗi chỉ vì một file mẫu trang trí không sao chép được.
  file: `src/lib/onboarding/seed-example-asset.server.ts:76`
  severity: medium
  Đề xuất: known-limits

- **Magic number 1 in place of constants.COPYFILE_EXCL**
  Người dùng thấy gì: Đây là vấn đề văn phong mã nguồn nội bộ, không ảnh hưởng trực tiếp tới trải nghiệm của người dùng.
  file: `src/lib/onboarding/seed-example-asset.server.ts:63`
  severity: medium
  Đề xuất: known-limits

- **Recovery-action labels leak plugin ids and env var names into user copy the feature explicitly bans**
  Người dùng thấy gì: Khi một bước bị lỗi, nút gợi ý khắc phục hiển thị tên kỹ thuật khó hiểu (tên gói cài đặt hoặc tên biến môi trường) thay vì tên dễ hiểu, khiến người dùng không rành kỹ thuật không biết phải bấm gì.
  file: `src/components/workspace/task-failure-toaster.tsx:42`
  severity: low
  Đề xuất: known-limits

- **check-t3-untouched.sh aborts on every invocation without --allow/--require (bash 3.2)**
  Người dùng thấy gì: Đây là lỗi trong công cụ kiểm tra nội bộ dùng khi phát triển, không ảnh hưởng tới người dùng cuối của sản phẩm.
  file: `scripts/acceptance/check-t3-untouched.sh:62`
  severity: high
  Đề xuất: known-limits

- **example.json fetch has no error handling — unhandled rejection, and a non-ok response silently disables the strip**
  Người dùng thấy gì: Nếu mạng chập chờn hoặc máy chủ đang khởi động, toàn bộ dải hướng dẫn lần đầu có thể biến mất hoàn toàn mà không có bất kỳ thông báo lỗi nào, khiến người dùng mới không biết phải bắt đầu từ đâu.
  file: `src/hooks/use-first-run-readiness.ts:81`
  severity: medium
  Đề xuất: known-limits

- **saveAndVerifyKey does not check the GET response, and `?? {}` turns a bad read into a full env-store replacement**
  Người dùng thấy gì: Nếu việc đọc danh sách khoá hiện có gặp lỗi bất thường, thao tác lưu một khoá API mới có thể âm thầm xoá sạch mọi khoá API khác đã lưu trước đó, trong khi màn hình vẫn báo lưu thành công.
  file: `src/components/workspace/nodes/base/abi-node-shell.tsx:107`
  severity: medium
  Đề xuất: known-limits

- **Task.error is now populated from data.message on non-failure SSE messages**
  Người dùng thấy gì: Đây là một cờ trạng thái nội bộ hiện chưa được bất kỳ màn hình nào hiển thị ra cho người dùng, nên hiện chưa gây hậu quả thấy được.
  file: `src/hooks/use-task.ts:409`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 — fixture viết tay đúng khuôn bên đọc: chuỗi "No plugin installed for nodeSlot=…" không có producer nào phát ra**
  Người dùng thấy gì: Đây là lỗ hổng trong bộ kiểm thử nội bộ (một câu thông báo lỗi trong bài test được gõ tay thay vì lấy từ mã nguồn thật sinh ra nó) — không phải hành vi người dùng gặp phải, nhưng có nghĩa lỗi phân loại nguyên nhân sự cố có thể lọt qua mà không bị test bắt được.
  file: `src/lib/onboarding/failure-actions.test.ts:7`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 — assertion âm-tính-một-mình: nửa "răng" (fixture đỏ) của E17 không được nối vào bất kỳ lệnh nào**
  Người dùng thấy gì: Đây là lỗ hổng trong quy trình kiểm thử nội bộ dùng để xác nhận tính năng — bài kiểm tra 'phải phát hiện được rò rỉ dữ liệu theo dõi' chưa từng thực sự được chạy để tự kiểm chứng, không phải hành vi người dùng gặp phải trực tiếp.
  file: `_acceptance/byo-key-onboarding/evals.yaml:193`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 1 — đo seam tiêm được thay vì đường save thật: E13 hứa "saving a key performs a real outbound verification" nhưng test không chạm đường lưu**
  Người dùng thấy gì: Đây là vấn đề về độ tin cậy của bằng chứng kiểm thử nội bộ cho bước 'lưu khoá có thực sự kiểm tra khoá đó hay không' — chưa chứng minh được đường lưu khoá thật trong sản phẩm có gọi bước kiểm tra hay không, dù bản thân sản phẩm không nhất thiết đang lỗi.
  file: `src/lib/onboarding/key-verify.test.ts:5`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 — assertion âm-tính-một-mình: test fallback-label chỉ assert "không bắt đầu bằng p-", pass rỗng-vacuous, và không chạm nhánh nó đặt tên**
  Người dùng thấy gì: Đây là một bài kiểm thử nội bộ có thể báo đạt ngay cả khi tính năng nhãn dự phòng bị hỏng hoàn toàn, không phải hành vi người dùng gặp phải trực tiếp.
  file: `src/hooks/use-first-run-readiness.test.ts:69`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — assertion âm-tính-một-mình: nửa suppression của E22 không ghim trạng thái lỗi, và vòng lặp assert rỗng trong đúng trường hợp mong đợi**
  Người dùng thấy gì: Đây là một bài kiểm thử nội bộ cho tình huống 'chạy lỗi không được để lại kết quả giả trông như thành công' có thể báo đạt mà không thực sự kiểm chứng điều đó, không phải hành vi người dùng gặp phải trực tiếp.
  file: `src/lib/onboarding/example-run.test.ts:200`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên quét lớp "all ten states x light+dark" nhưng danh sách state là bản sao hardcode trong shell, không ràng buộc với nguồn sự thật**
  Người dùng thấy gì: Đây là lỗ hổng trong quy trình kiểm thử khả năng tiếp cận nội bộ — danh sách các màn hình cần quét có thể lệch khỏi thực tế mà không ai nhận ra, không phải hành vi người dùng gặp phải trực tiếp.
  file: `scripts/onboarding/check-a11y-proto.sh:40`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên quét lớp "transport shapes" nhưng fixture răng chỉ phủ 3/5 bộ dò**
  Người dùng thấy gì: Đây là lỗ hổng trong bộ kiểm thử nội bộ dùng để đảm bảo sản phẩm không âm thầm gửi dữ liệu hành vi đi đâu — chỉ một phần các kiểu rò rỉ có thể xảy ra được kiểm tra, không phải hành vi người dùng gặp phải trực tiếp.
  file: `scripts/onboarding/telemetry-fixture/beacon.ts:10`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 — E3 hứa "suppression survives a reload" nhưng cmd chỉ chạy test hàm thuần computeReadiness**
  Người dùng thấy gì: Đây là lỗ hổng trong bằng chứng kiểm thử nội bộ cho việc 'đã làm xong ví dụ một lần thì không hỏi lại nữa kể cả sau khi tải lại trang' — chưa có bằng chứng máy thực sự xác nhận điều đó, không phải hành vi người dùng gặp phải trực tiếp.
  file: `_acceptance/byo-key-onboarding/evals.yaml:50`
  severity: medium
  Đề xuất: known-limits

## Chưa phân loại (triage-failed)

phân loại phạm vi không chạy được — không lỗi nào bị máy tự sửa, người xem lại toàn bộ.

### seedExampleAsset rethrows non-ENOENT errno and 500s the whole /workspace page
- file: `src/lib/onboarding/seed-example-asset.server.ts:75`
- severity: low
- detail: The function's own contract says "Null rather than a throw: a missing sample must never take the workspace down with it", but only EEXIST and ENOENT are handled; line 75 rethrows everything else. It is awaited unguarded in a Server Component (src/app/workspace/page.tsx:20) on every render.

  Failure scenario: the scoped data dir is read-only or the volume is full — `mkdir` or `copyFile` fails with EACCES / EPERM / ENOSPC / EROFS, the throw propagates out of WorkspacePage, and the entire workspace renders as an error page. The user loses the whole canvas because a decorative sample clip could not be copied. Catch-all → `logger.warn` + `return null` matches the stated intent.
- source: bugs

⚠ Cụm ngoài vùng phủ: 5/22 lỗi rơi vào file không bộ đo nào phủ (scripts/acceptance/check-t3-untouched.sh, _acceptance/byo-key-onboarding/evals.yaml, scripts/onboarding/check-a11y-proto.sh, scripts/onboarding/telemetry-fixture/beacon.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.