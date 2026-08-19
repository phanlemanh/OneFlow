## Trong hợp đồng

### Seeding an optional demo asset can take down the entire /workspace route
- file: `src/lib/onboarding/seed-example-asset.server.ts:76`
- severity: medium
- source: conventions
- AC: AC-13
- detail: seedExampleAsset() handles EEXIST and ENOENT but rethrows every other errno (EACCES, EROFS, ENOSPC, EPERM on the uploads dir), and src/app/workspace/page.tsx line 20 awaits it unguarded on every render of the workspace page. A permissions or disk problem while copying a *sample clip* therefore 500s the whole workspace — contradicting both the function's own stated intent ("a missing sample must never take the workspace down with it") and the feature's "guidance, never a gate" principle (AC-13), as well as the global error-handling rule. The catch should log-and-return-null for any failure (or the page call site should try/catch), reserving nothing as fatal.
- rationale: An optional onboarding aid causing the whole workspace page to fail is exactly the "guidance, never a gate" promise AC-13 makes, breached by a non-essential seeding step.

### Shape 2 — fixture viết tay đúng khuôn bên đọc: message "No plugin installed for nodeSlot=…" không có producer nào phát ra
- file: `src/lib/onboarding/failure-actions.test.ts:7`
- severity: high
- source: measurement
- AC: AC-11
- detail: Test đầu classify chuỗi tay viết "No plugin installed for nodeSlot=split-video (oneflow-api-pyscenedetect)" và pass vì nó khớp regex MISSING_PLUGIN của chính bên đọc (failure-actions.ts:23). Grep toàn src/ + sdk/: KHÔNG file nào phát ra chuỗi này; message thật khi slot không có plugin là `[feature-registry] No plugins in nodePluginMap for nodeSlot="X"; using type=function=unregistered` (feature-registry.server.ts:52) — không khớp regex đó. Tức test chứng minh bên đọc đọc được phương ngữ do chính nó bịa, không round-trip từ producer thật; E15 xanh trong khi lỗi missing-plugin thật của registry không được route. Cùng file, dòng 31 hand-copy literal "Set ANTHROPIC_API_KEY in Settings" từ director.server.ts:182 thay vì round-trip/producer-derived — producer đổi câu là classifier chết im mà test vẫn xanh. Đối chiếu: required-env.test.ts:57 làm ĐÚNG mẫu round-trip (missingRequiredEnvMessage → classifyFailure), chứng tỏ seam để round-trip tồn tại.
- rationale: The classifier's pattern for "missing plugin" does not match the real error string the plugin registry actually emits, so a genuine missing-plugin failure in production would not be classified as such and would not trigger AC-11's required "plugin manager filtered to that plugin" action.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Hardcoded Vietnamese UI strings bypass the repo's next-intl i18n system**
  Người dùng thấy gì: Người dùng chọn giao diện tiếng Anh, Nhật, Hàn hoặc Trung vẫn sẽ thấy một số nhãn nút và thông báo lỗi ở bước nhập khoá API hiện bằng tiếng Việt thay vì ngôn ngữ họ đã chọn.
  file: `src/components/workspace/nodes/base/abi-node-shell.tsx`
  severity: high
  Đề xuất: known-limits

- **Unhandled promise rejection on the /example.json fetch**
  Người dùng thấy gì: Nếu mạng chập chờn đúng lúc mở workspace lần đầu, dải hướng dẫn có thể lặng lẽ không bao giờ hiện ra, dù người dùng vẫn dùng canvas bình thường.
  file: `src/hooks/use-first-run-readiness.ts`
  severity: low
  Đề xuất: known-limits

- **Magic number 1 used instead of fs constants.COPYFILE_EXCL**
  Người dùng thấy gì: Không có tác động nào tới người dùng; đây thuần là cách viết mã nội bộ khi sao chép file mẫu.
  file: `src/lib/onboarding/seed-example-asset.server.ts`
  severity: low
  Đề xuất: known-limits

- **Provider key probe has no timeout, so PUT /api/settings/env can hang on save**
  Người dùng thấy gì: Nếu máy chủ của nhà cung cấp API phản hồi rất chậm, việc lưu khoá API có thể bị treo vài phút thay vì báo kết quả nhanh.
  file: `src/lib/onboarding/key-verify.ts`
  severity: low
  Đề xuất: known-limits

- **installMissingForExample swallows install errors with no log or detail**
  Người dùng thấy gì: Khi một plugin cài đặt thất bại lúc chuẩn bị workflow mẫu, người dùng chỉ thấy thông báo lỗi chung chung, không có manh mối để biết vì sao, và đội vận hành cũng không có nhật ký để tra cứu.
  file: `src/lib/onboarding/install-missing.server.ts`
  severity: medium
  Đề xuất: known-limits

- **Readiness hook's fetch of /example.json has no rejection handler**
  Người dùng thấy gì: Nếu việc tải cấu hình workflow mẫu thất bại (mất mạng, máy chủ dev khởi động lại), dải hướng dẫn first-run có thể biến mất vĩnh viễn mà không có dấu hiệu nào cho người dùng hay đội ngũ biết lý do.
  file: `src/hooks/use-first-run-readiness.ts`
  severity: medium
  Đề xuất: known-limits

- **Prepare button reports 'check your connection' for per-plugin failures and drops partial-install results**
  Người dùng thấy gì: Khi việc cài plugin thất bại một phần, người dùng có thể thấy thông báo "kiểm tra kết nối mạng" dù mạng vẫn ổn, và danh sách công cụ đã cài chưa cập nhật cho tới khi thử lại hoặc tải lại trang.
  file: `src/components/workspace/first-run-strip-container.tsx`
  severity: low
  Đề xuất: known-limits

- **Key-verification probe has no timeout, so PUT /api/settings/env can hang for minutes**
  Người dùng thấy gì: Nếu máy chủ của nhà cung cấp API treo kết nối, việc lưu khoá API có thể bị treo tới vài phút thay vì báo kết quả nhanh, và khung nhập khoá vẫn bị khoá trong lúc đó.
  file: `src/lib/onboarding/key-verify.ts`
  severity: low
  Đề xuất: known-limits

- **Shape 4 — assertion âm-tính-một-mình: E17 chỉ chạy nửa xanh, nửa răng (fixture đỏ) không được nối vào lệnh nào**
  Người dùng thấy gì: Bài kiểm tra tự động cho việc "không gửi dữ liệu theo dõi" hiện chưa từng chạy thử trên một đoạn mã cố tình có cài theo dõi để chắc chắn công cụ kiểm tra thực sự bắt được lỗi loại đó — nếu công cụ kiểm tra có lỗi thầm lặng, sẽ không ai biết.
  file: `_acceptance/byo-key-onboarding/evals.yaml`
  severity: high
  Đề xuất: known-limits

- **Shape 4 — assertion âm-tính-một-mình: test fallback-label chỉ assert 'không bắt đầu bằng p-', không ghim nhãn dương, pass rỗng-vacuous**
  Người dùng thấy gì: Một bài kiểm tra tự động cho nhãn hiển thị khi một công cụ không có tên hiện đo sai điều kiện: nếu mã sản phẩm bị lỗi khiến danh sách nhãn trống rỗng, bài kiểm tra vẫn có thể báo "qua", nên lỗi loại đó không bị phát hiện.
  file: `src/hooks/use-first-run-readiness.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 1 — đo chỉ dẫn thay vì đầu ra: E3 hứa 'suppression survives a reload' nhưng cmd chỉ chạy test hàm thuần computeReadiness**
  Người dùng thấy gì: Bằng chứng tự động cho việc "dải hướng dẫn không hiện lại sau khi tải lại trang" hiện chỉ kiểm tra logic khi được báo trước là đã hoàn tất, chưa thực sự kiểm tra việc ghi nhớ trạng thái đó qua một lần tải lại trang thật — một lỗi làm mất trạng thái sau khi tải lại có thể không bị phát hiện.
  file: `_acceptance/byo-key-onboarding/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Shape 1 — đo chỉ dẫn thay vì đầu ra: E13 hứa 'saving a key performs a real outbound verification' nhưng test không chạm đường save**
  Người dùng thấy gì: Bằng chứng tự động cho việc "lưu khoá API sẽ thực sự gọi kiểm tra khoá" hiện chỉ kiểm tra hàm kiểm tra độc lập, chưa kiểm tra đường lưu khoá thật có gọi tới bước đó hay không — một lỗi làm mất bước gọi kiểm tra khi lưu có thể không bị phát hiện.
  file: `_acceptance/byo-key-onboarding/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Shape 5 — tuyên quét lớp 'transport shapes' nhưng fixture răng chỉ có 3/5 phần tử: EXTERNAL_XHR và ANALYTICS_DEP chưa từng thấy đỏ**
  Người dùng thấy gì: Bộ kiểm tra tự động cho "không gửi dữ liệu theo dõi ra ngoài" hiện chỉ có ví dụ thử cho 2 trong 5 kiểu rò rỉ mà công cụ quét tuyên bố bao phủ, nên lỗi trong phần quét ba kiểu còn lại có thể không bao giờ bị phát hiện.
  file: `scripts/onboarding/telemetry-fixture/beacon.ts`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 4/15 lỗi rơi vào file không bộ đo nào phủ (_acceptance/byo-key-onboarding/evals.yaml, scripts/onboarding/telemetry-fixture/beacon.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
