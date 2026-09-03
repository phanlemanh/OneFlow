## Trong hợp đồng

- **Node retry is neither disabled nor de-bounced; the "one click stays one read" invariant only holds on the settings dialog**
  file: `src/components/workspace/nodes/base/abi-node-shell.tsx:201`
  severity: medium
  source: conventions
  AC: AC-6
  `ReadStateNotice` documents `retrying` as "Retry is in flight. Disables the button so one click stays one read", and `store-read-states-retry.test.tsx:80` pins that ("two clicks while the read is in flight still read once") — but only through `SettingsDialog`, which is the one surface that passes `retrying={loading}`.

  `NodeKeyGateSurface` (abi-node-shell.tsx:193-203) passes `onRetry={gate.retry}` and no `retrying`, so it defaults to `false`. `useNodeKeyGate.retry` (line 306) also sets no in-flight phase — it awaits `readEnvForBrowser()` and only then calls `setState`. So on a node the button stays enabled and gives no feedback for the whole read; N clicks fire N concurrent reads, and the last one to resolve wins. That is exactly the shape the retry suite claims is closed, and the guard for it is a stand-in surface away from the real mount site — the same "a stand-in surface proves things about the stand-in" failure the `NodeKeyGateSurface` export was introduced to fix.

  The third surface, `MediaLibraryConfigPanel`, passes `retrying={saving}` but clears `blocked` before calling `save()`, so the card unmounts and the prop never takes effect there either.

  Rationale: AC-6 áp dụng cho "một bề mặt" bất kỳ đang ở state không-ok, không giới hạn riêng màn Cài đặt; finding cho thấy trên node, bấm đúp Thử lại gây nhiều lượt đọc song song thay vì đúng một lượt và nút không tắt trong lúc đọc.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Write-timeout copy drops the {seconds} placeholder in all five locales**
  Người dùng thấy gì: Khi lưu khoá bị time-out, người dùng có thể thấy một dòng thông báo lỗi là mã kỹ thuật khó hiểu (kiểu tên khoá dịch thuật thô) thay vì câu giải thích rõ ràng bằng ngôn ngữ của họ, ở cả năm ngôn ngữ hỗ trợ.
  file: `src/lib/settings/read-failure-text.ts`
  severity: high
  Đề xuất: known-limits

- **PUT 409 still concludes "store-unreadable" with no positive signal, contradicting the taxonomy this change introduces**
  Người dùng thấy gì: Nếu có sự cố ở một hệ thống trung gian (không phải máy chủ chính) khi người dùng ghi đè kho khoá, họ có thể bị báo nhầm rằng kho khoá của mình đã hỏng và được mời xoá sạch kho khoá — dù kho khoá thực ra vẫn bình thường.
  file: `src/lib/settings/env-client.ts`
  severity: medium
  Đề xuất: new-contract

- **Write-path timeout copy renders as a raw i18n key (missing {seconds} value)**
  Người dùng thấy gì: Cả ở màn Cài đặt lẫn trên node, khi lưu khoá bị time-out, người dùng thấy một chuỗi mã kỹ thuật thay vì câu thông báo dễ hiểu, ở mọi ngôn ngữ hỗ trợ.
  file: `src/lib/settings/read-failure-text.ts`
  severity: high
  Đề xuất: known-limits

- **Any 409 without the refusal code is reported as "store store-unreadable" — including a non-JSON 409**
  Người dùng thấy gì: Một phản hồi lỗi không đúng định dạng mong đợi (ví dụ từ một hệ thống trung gian) khi ghi đè kho khoá cũng có thể khiến người dùng bị báo nhầm kho khoá đã hỏng và được mời xoá sạch một kho khoá đang hoàn toàn bình thường.
  file: `src/lib/settings/env-client.ts`
  severity: medium
  Đề xuất: new-contract

- **Tuyên quét LỚP nhưng chỉ có điểm-case: "all three surfaces" không mount bề mặt nào**
  Người dùng thấy gì: Người dùng có nguy cơ gặp lại lỗi bấm Thử lại nhiều lần trên giao diện node mà không bị chặn, vì bộ kiểm thử hiện tại tự nhận đã kiểm tra đủ ba nơi hiển thị lỗi nhưng thực chất chỉ kiểm tra được một nơi.
  file: `src/components/workspace/store-read-states-retry.test.tsx`
  severity: medium
  Đề xuất: known-limits

- **Assert "nút có mặt" trên một prop do CHÍNH harness bơm vào**
  Người dùng thấy gì: Trên giao diện node, không có gì thật sự đảm bảo nút Thử lại luôn xuất hiện khi kho khoá gặp lỗi — bằng chứng hiện có là do chính bộ kiểm thử tự dựng lên, không lấy từ mã đang chạy thật.
  file: `src/components/workspace/nodes/store-unreadable-refusal.test.tsx`
  severity: medium
  Đề xuất: known-limits

- **Assert "chuỗi có mặt" trong khi lời hứa là QUAN HỆ state → khoá catalogue**
  Người dùng thấy gì: Nếu một dòng chữ trên màn hình bị gán nhầm từ một trạng thái lỗi khác có chữ tình cờ giống nhau (ví dụ nhãn của lỗi chưa đăng nhập bị dùng nhầm cho lỗi không kết nối được), bộ kiểm tra hiện tại có thể không phát hiện ra.
  file: `src/components/workspace/store-read-states-i18n.test.tsx`
  severity: medium
  Đề xuất: known-limits

- **Sàn a11y đo trên thẻ dựng TAY trong proto, dấu nhận dạng chỉ chứng minh vỏ trong**
  Người dùng thấy gì: Sàn kiểm tra khả năng tiếp cận cho hai loại thông báo lỗi mới được đo trên một trang dựng tay riêng, không phải trên đúng thành phần sẽ hiển thị cho người dùng thật — nếu màu sắc/độ tương phản thật khác bản dựng tay, người dùng có thể gặp thẻ thông báo khó đọc mà không ai phát hiện qua vòng kiểm tra này.
  file: `scripts/settings/check-a11y-read-states.sh`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 3/9 lỗi rơi vào file không bộ đo nào phủ (src/lib/settings/read-failure-text.ts, src/components/workspace/nodes/store-unreadable-refusal.test.tsx) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.