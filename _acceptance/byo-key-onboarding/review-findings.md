# Review Findings: byo-key-onboarding — round 4

## Trong hợp đồng

### 1. installMissingForExample reports success for a plugin the scanner did not recognize
- file: `src/lib/onboarding/install-missing.server.ts:39`
- severity: medium
- AC: AC-6
- source: bugs
- detail: `installPlugin` returns `{ id, action, recognized }` and does NOT throw when `recognized === false` (see `src/lib/plugins/plugins-install.server.ts:202` — `recognized = Boolean(registry.plugins[id])` after the rescan). `installMissingForExample` discards the return value entirely and pushes the id into `installed`.

  So a plugin that clones successfully but that the scanner cannot register (bad manifest, missing `@node_slot`, python3 unavailable for the rescan) is reported as installed, the route returns 200, and the strip clears — while the example still cannot run. Check `recognized` and route it to `failed` (or a third bucket) so the caller can say what actually happened.

  Rationale for AC mapping: AC-6 quy định given một plugin vừa được cài, when registry được truy vấn, then plugin đó phải xuất hiện đã đăng ký; ở đây plugin được báo "đã cài" nhưng registry truy vấn lại KHÔNG thấy nó (recognized=false), trực tiếp vi phạm đúng given/when/then của AC-6.

### 2. Fixture viết tay đúng khuôn bên đọc — E13 đo verifyKey bằng probe do chính test bơm vào, không round-trip đường lưu thật
- file: `src/lib/onboarding/key-verify.test.ts:15`
- severity: high
- AC: AC-10
- source: measurement
- detail: 4/5 assert trong file truyền thẳng `probe` mock vào `verifyKey(...)` (dòng 6-15, 20-33, 36-45, 48-57); assert còn lại (dòng 59-64) dùng `SOME_UNKNOWN_KEY` tức nhánh KHÔNG có prober. Hệ quả kiểm chứng được: nếu bảng `PROBES` trong src/lib/onboarding/key-verify.ts (dòng 24-30) rỗng — tức sản phẩm khi lưu khoá không gọi ra nhà cung cấp nào cả — cả 5 test vẫn xanh nguyên. Câu `expect(probe).toHaveBeenCalledTimes(1)` chỉ chứng minh verifyKey gọi tham số thứ ba của chính nó, không chứng minh có một request thật đi ra. Nặng hơn vì E13 mang nhãn `layer: backend-effect` cho AC-10 (cross-layer, evals.yaml:151-158) và `expected` khai 'saving a key performs a real outbound verification': bên WRITER của quan hệ — PUT /api/settings/env → `verifyChangedKeys` (src/app/api/settings/env/route.ts:25-49, gồm logic chọn key nào được probe theo danh sách `verify` và so sánh giá trị cũ/mới) — không có một assert nào chạm tới. Không có round-trip writer→reader; chỉ có reader được hand-feed đúng khuôn nó chờ.

  Rationale for AC mapping: Finding tự trích dẫn rõ "E13 mang nhãn layer: backend-effect cho AC-10 (cross-layer, evals.yaml:151-158)" và chỉ ra phía writer thật (PUT → verifyChangedKeys) không được assert chạm tới, tức phép đo cross-layer của đúng AC-10 chưa thực sự chứng minh được điều AC-10 yêu cầu.

### 3. Assertion âm-tính-một-mình — E17 chỉ nối nửa xanh; teeth fixture telemetry không nằm trong lệnh eval nào
- file: `_acceptance/config.yaml:332`
- severity: medium
- AC: AC-12
- source: measurement
- detail: `bko_no_telemetry_sinks: "bash scripts/onboarding/check-no-telemetry-sinks.sh"` gọi script KHÔNG kèm tham số, nên telemetry-scan.mjs chạy trên `src` với `isRealTree=true` và bỏ qua cả thư mục `telemetry-fixture` (dòng 39-41) lẫn mọi file `*.test.*` (dòng 59). Nửa đối chứng dương mà `expected` của E17 khai bằng chữ hoa ('TEETH: the guard is re-run against a fixture containing a sendBeacon call and MUST exit non-zero', evals.yaml:194) không tồn tại dưới dạng lệnh: không có key executor thứ hai chạy `check-no-telemetry-sinks.sh scripts/onboarding/telemetry-fixture`, trong khi chính file config này dùng đúng mẫu hai-key cho guard khác (`lcp_manifest_counts` + `lcp_manifest_guard_teeth`, dòng 325-326). Vậy thứ một vòng sau re-run được chỉ là lời khẳng định âm "không tìm thấy sink nào" — nếu các regex (BEACON/ANALYTICS_IMPORT/EXTERNAL_FETCH) mục ruỗng hoặc walk() trượt thư mục, kết quả vẫn là exit 0 và không có gì phát hiện ra.

  Rationale for AC mapping: Contract's Known limits section tự đặt tên "Phép đo bằng quét mã (E17, có nửa phá-thử) xanh ở cả hai vòng" ngay dưới mục bàn về AC-12; finding chỉ ra nửa phá-thử (teeth) đó thực chất không được nối vào lệnh eval nào, tức tuyên bố đã kiểm chứng AC-12 bằng E17 không đứng vững như hồ sơ đã ký.

### 4. Assertion âm-tính-một-mình — nửa RED của E1 khai trong expected nhưng không nối lệnh và không có fixture trong cây
- file: `_acceptance/byo-key-onboarding/evals.yaml:20`
- severity: low
- AC: AC-1
- source: measurement
- detail: `expected` của E1 khai 'SUPPRESSION half: re-run against the pre-2026-08-07 Modal example must go RED', nhưng cmd `config:executors.script.bko_example_needs_no_keys` chạy `check-example-needs-no-keys.sh` không tham số, và script mặc định `WORKFLOW="${1:-public/example.json}"` (dòng 11) tức luôn là ví dụ mới. Bản ví dụ Modal cũ đã bị ghi đè trong chính diff này (public/example.json) và không có fixture workflow nào được commit lại, nên một vòng sau không có đường nào re-run được nửa đỏ ngoài việc tự `git show` commit cũ. Phần chống-rỗng duy nhất còn lại là sàn `ids.length < 2` trong example-needs-no-keys.mjs (dòng 24-30) — nó chặn tập rỗng, nhưng không chứng minh checker CÓ THỂ đỏ khi manifest thật sự khai `required: true`.

  Rationale for AC mapping: Executor "bko_example_needs_no_keys" kiểm đúng nội dung AC-1 ('bundled example workflow requires zero API keys... no node resolves to a plugin whose manifest declares a required env key'); finding chỉ ra nửa phá-thử (RED khi ví dụ cũ đòi key) không có đường chạy lại được, nên phép kiểm chứng AC-1 chưa chứng minh được checker CÓ THỂ bắt lỗi khi vi phạm thật xảy ra.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **UI copy hardcoded in Vietnamese, bypassing the repo's next-intl layer**
  Người dùng thấy gì: Người dùng chọn ngôn ngữ khác tiếng Việt sẽ thấy nhãn khoá API và một số thông báo lỗi hiện bằng tiếng Việt thay vì ngôn ngữ họ đã chọn.
  file: `src/components/workspace/nodes/base/abi-node-shell.tsx`
  severity: high
  Đề xuất: known-limits

- **Provisioning milestone copy lives in src/lib and is streamed to the client untranslated, duplicating existing i18n keys**
  Người dùng thấy gì: Trong lúc máy đang chuẩn bị môi trường chạy, người dùng dùng ngôn ngữ khác tiếng Việt có thể thấy dòng chữ trạng thái hiện bằng tiếng Việt.
  file: `src/lib/plugin-executor/provisioning-events.ts`
  severity: high
  Đề xuất: known-limits

- **Node status line still uses the error precedence that taskErrorFromSSE was written to fix**
  Người dùng thấy gì: Khi một node bị lỗi, dòng trạng thái ngay trên node có thể hiện một câu chung chung không rõ nguyên nhân, trong khi thông báo bật lên cạnh đó lại nêu đúng lý do — khiến người dùng nhận hai lời giải thích khác nhau cho cùng một lỗi.
  file: `src/components/workspace/execution-status-line.tsx`
  severity: medium
  Đề xuất: known-limits

- **Install progress counter is structurally frozen at 0**
  Người dùng thấy gì: Trong lúc tải các công cụ còn thiếu — có thể mất vài phút — màn hình luôn hiện đúng '0 trên tổng số' rồi biến mất đột ngột, khiến người dùng tưởng máy bị treo dù việc tải vẫn đang diễn ra.
  file: `src/components/workspace/first-run-strip-container.tsx`
  severity: medium
  Đề xuất: known-limits

- **Node key prompt does a raw read-modify-write of the whole env store, bypassing the shared API client**
  Người dùng thấy gì: Nếu người dùng lưu một khoá API ở node đúng lúc một nơi khác trong ứng dụng cũng đang lưu khoá, một trong hai lần lưu có thể bị ghi đè mất mà không có cảnh báo.
  file: `src/components/workspace/nodes/base/abi-node-shell.tsx`
  severity: medium
  Đề xuất: known-limits

- **Provider key verification has no timeout, so PUT /api/settings/env can hang after it has already written to disk**
  Người dùng thấy gì: Nếu nhà cung cấp dịch vụ phản hồi chậm hoặc không phản hồi, màn hình lưu khoá API có thể treo vô thời hạn dù khoá đã được lưu thành công, khiến người dùng không biết thao tác đã xong hay chưa.
  file: `src/lib/onboarding/key-verify.ts`
  severity: medium
  Đề xuất: known-limits

- **Unhandled promise rejection when the bundled example workflow cannot be fetched**
  Người dùng thấy gì: Nếu tệp ví dụ mẫu không tải được, dải hướng dẫn lần đầu có thể im lặng không xuất hiện mà không báo lỗi gì, khiến người dùng mới không biết cần làm gì tiếp theo.
  file: `src/hooks/use-first-run-readiness.ts`
  severity: low
  Đề xuất: known-limits

- **COPYFILE_EXCL passed as the literal 1 instead of the node:constants symbol**
  Người dùng thấy gì: Đây là vấn đề kỹ thuật nội bộ về cách viết mã, không ảnh hưởng trực tiếp tới trải nghiệm người dùng.
  file: `src/lib/onboarding/seed-example-asset.server.ts`
  severity: low
  Đề xuất: known-limits

- **taskErrorFromSSE populates Task.error on non-failed SSE messages (progress text becomes an "error")**
  Người dùng thấy gì: Trong lúc một tác vụ đang chạy bình thường, hệ thống có thể tạm thời gắn nhãn giống như 'lỗi' lên các dòng tiến độ bình thường, tạo nguy cơ một nơi khác trong ứng dụng hiển thị một tác vụ đang chạy tốt như thể nó đã hỏng.
  file: `src/lib/task/sse-error.ts`
  severity: high
  Đề xuất: known-limits

- **Failed plugin installs are swallowed: the exception is discarded, only the id survives**
  Người dùng thấy gì: Khi việc tải một công cụ bị thiếu thất bại vì bất kỳ lý do gì — hết dung lượng, lỗi máy chủ, plugin sai — người dùng luôn chỉ thấy đúng một thông báo 'kiểm tra kết nối mạng', kể cả khi mạng không phải là nguyên nhân thật.
  file: `src/lib/onboarding/install-missing.server.ts`
  severity: high
  Đề xuất: known-limits

- **saveAndVerifyKey can wipe the entire stored env map when the GET response lacks `env`**
  Người dùng thấy gì: Trong một số trường hợp lỗi mạng hoặc phản hồi bất thường từ máy chủ, việc lưu một khoá API mới có thể xoá mất toàn bộ các khoá API khác mà người dùng đã lưu trước đó.
  file: `src/components/workspace/nodes/base/abi-node-shell.tsx`
  severity: medium
  Đề xuất: known-limits

- **seedExampleAsset throws on any non-ENOENT/EEXIST error, taking the workspace page down with it**
  Người dùng thấy gì: Trên một số máy có quyền truy cập ổ đĩa bị hạn chế, toàn bộ trang không gian làm việc có thể không mở lên được, thay vì chỉ thiếu mỗi tệp ví dụ mẫu.
  file: `src/lib/onboarding/seed-example-asset.server.ts`
  severity: medium
  Đề xuất: known-limits

- **useFirstRunReadiness fetches /example.json with no rejection handler**
  Người dùng thấy gì: Nếu tệp ví dụ mẫu không tải được, dải hướng dẫn lần đầu có thể im lặng không xuất hiện mà không báo lỗi gì, khiến người dùng mới không biết cần làm gì tiếp theo.
  file: `src/hooks/use-first-run-readiness.ts`
  severity: medium
  Đề xuất: known-limits

- **verifyKey issues an outbound provider request with no timeout while the PUT handler awaits it**
  Người dùng thấy gì: Nếu nhà cung cấp dịch vụ phản hồi chậm hoặc không phản hồi, màn hình lưu khoá API có thể treo vô thời hạn dù khoá đã được lưu thành công, khiến người dùng không biết thao tác đã xong hay chưa.
  file: `src/lib/onboarding/key-verify.ts`
  severity: low
  Đề xuất: known-limits

- **check-t3-untouched.sh consumes the first flag as the base ref, so its documented usage does not work**
  Người dùng thấy gì: Đây là công cụ kiểm tra nội bộ dùng khi phát triển, không ảnh hưởng tới người dùng sản phẩm.
  file: `scripts/acceptance/check-t3-untouched.sh`
  severity: low
  Đề xuất: known-limits

- **a11y-scan.mjs calls process.exit inside try, skipping the finally that closes the browser**
  Người dùng thấy gì: Đây là công cụ kiểm tra nội bộ dùng khi phát triển, không ảnh hưởng tới người dùng sản phẩm.
  file: `scripts/a11y-scan.mjs`
  severity: low
  Đề xuất: known-limits

- **Tuyên quét LỚP nhưng chỉ có assert tổng — E19 khai '10 trạng thái x 2 theme' mà không ghim từng phần tử thật sự được render**
  Người dùng thấy gì: Đây là điểm yếu trong cách đo kiểm nội bộ — bộ kiểm khả năng tiếp cận có thể báo đạt dù trang không thật sự hiển thị đúng thành phần cần kiểm — không phải một lỗi người dùng gặp trực tiếp trong sản phẩm.
  file: `scripts/onboarding/check-a11y-proto.sh`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

(không có finding nào ở mục này)

⚠ Cụm ngoài vùng phủ: 5/21 lỗi rơi vào file không bộ đo nào phủ (scripts/acceptance/check-t3-untouched.sh, scripts/a11y-scan.mjs, _acceptance/config.yaml, scripts/onboarding/check-a11y-proto.sh, _acceptance/byo-key-onboarding/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
