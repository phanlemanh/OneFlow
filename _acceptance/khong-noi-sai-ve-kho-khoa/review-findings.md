## Trong hợp đồng

- **MediaLibraryConfigPanel's retry runs a WRITE, while the shared card's retry contract is "read the store again"**
  file: `src/components/workspace/nodes/add/media-library-config-panel.tsx:104`
  severity: medium
  AC: AC-5
  `ReadStateNotice` gom nut Thu lai vao trong component de "every non-ok cell offers a way to try again" dung by construction (read-state-notice.tsx:22-27), va hop dong cua no duoc phat bieu o hai cho: `NodeKeyPromptProps.onRetry` = "Ask the surface to read again" (node-key-prompt.tsx:67) va `NodeKeyGate.retry` = "Read the store again from a blocked card" (abi-node-shell.tsx). Hai be mat kia goi `readEnvForBrowser()`.

  Be mat thu ba noi `void save()` — tuc doc-roi-GHI. Cung mot nut, cung mot nhan `retry`, ngay duoi cau load-bearing "Chua co gi bi thay doi." (`unchanged`, store-unreadable-notice.tsx:43-49), nhung tren panel nay bam vao co the ghi that vao kho khoa. Do la ba be mat lai phan ung khac nhau tren cung mot control — dung co che ma dossier nay dua the ve mot component de dong lai. Neu "retry = thu luu lai" la chu y that thi no can nhan/hop dong rieng, khong dung chung o cua so noi hai be mat kia chi doc.
  rationale: AC-5 yêu cầu PUT = 0 ở toàn bộ chín ô không-ok, kể cả khi bấm Thử lại; panel này bấm Thử lại lại kích hoạt một lượt ghi (PUT).
  source: conventions

- **"Try again" on the media-library blocked card performs a write, not a read**
  file: `src/components/workspace/nodes/add/media-library-config-panel.tsx:104`
  severity: low
  AC: AC-5
  `ReadStateNotice`'s `onRetry` is documented as "Ask the surface to read again" (read-state-notice.tsx:77) and both other callers honour that: settings-dialog passes `fetchEnv`, abi-node-shell passes `useNodeKeyGate.retry` (a `readEnvForBrowser` call). This panel passes `void save()`, which runs the full read-then-PUT. So pressing "Thử lại" on a card whose load-bearing sentence is "Chưa có gì bị thay đổi" can write to the key store and, on success, call `onSaved()` and dismiss the panel. The user's prior action was a save, so it is defensible, but the button label and the card's promise say otherwise, and the three surfaces now mean different things by the same control.
  rationale: Cùng khuyết tật với finding về nút Thử lại ở trên: AC-5 yêu cầu PUT = 0 ở cả chín ô không-ok, nhưng nút Thử lại trên panel này thực hiện ghi.
  source: bugs

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **A failed WRITE still renders as "saved-unverified" — the node tells the user the key was stored when nothing was written**
  Người dùng thấy gì: Nếu việc lưu khoá API thất bại (lỗi máy chủ, mất mạng, hết giờ), node vẫn hiện dấu tích xanh "Đã lưu khoá" — người dùng tưởng khoá đã lưu thành công dù thực ra không có gì được ghi vào kho.
  file: `src/components/workspace/nodes/base/abi-node-shell.tsx`
  severity: high
  Đề xuất: new-contract

- **confirmReplace fabricates a fake network ReadFailure and leaks an internal state name into localized copy; the sibling handler in the same file does it right**
  Người dùng thấy gì: Khi thao tác "Thay kho bằng kho rỗng" gặp một lỗi hiếm gặp, hộp thoại có thể hiện một câu báo lỗi mạng chung chung kèm theo mã trạng thái nội bộ khó hiểu, thay vì một thông báo rõ ràng.
  file: `src/components/workspace/settings-dialog.tsx`
  severity: medium
  Đề xuất: known-limits

- **useKeyPromptLabels is now a hook that calls no hooks, and its doc-comment points readers at behaviour it no longer has**
  Người dùng thấy gì: Đây là một ghi chú kỹ thuật trong mã nguồn không còn khớp với thực tế — không ảnh hưởng gì tới những gì người dùng nhìn thấy hay trải nghiệm.
  file: `src/components/workspace/nodes/base/abi-node-shell.tsx`
  severity: low
  Đề xuất: known-limits

- **replaceError survives a state change and can render a red replace-failure line under the quiet card**
  Người dùng thấy gì: Sau một lần thao tác "Thay kho" thất bại rồi phiên đăng nhập hết hạn ngay sau đó, người dùng có thể thấy dòng chữ đỏ báo lỗi thay-kho cũ còn sót lại bên dưới thông báo "Phiên đăng nhập đã hết", gây nhầm lẫn về nguyên nhân thật sự.
  file: `src/components/workspace/settings-dialog.tsx`
  severity: low
  Đề xuất: known-limits

- **Teeth guard's header comment claims five perturbations; it runs four**
  Người dùng thấy gì: Đây là một lỗi ghi chú trong công cụ kiểm tra nội bộ của đội phát triển, không ảnh hưởng gì đến người dùng sản phẩm.
  file: `scripts/settings/check-unauthorized-seam-teeth.sh`
  severity: low
  Đề xuất: known-limits

- **A failed write is rendered on the node as "key saved" (green check)**
  Người dùng thấy gì: Nếu việc lưu khoá API thất bại (lỗi máy chủ, mất mạng, hết giờ, hoặc bị từ chối), node vẫn hiện dấu tích xanh "Đã lưu khoá" — người dùng tưởng khoá đã lưu thành công dù thực ra không có gì được ghi.
  file: `src/components/workspace/nodes/base/abi-node-shell.tsx`
  severity: high
  Đề xuất: new-contract

- **Client-side 30s abort reported as "Nothing has been changed" although the server write may have completed**
  Người dùng thấy gì: Khi thao tác lưu hoặc "Thay kho bằng kho rỗng" bị treo quá 30 giây và tự huỷ ở trình duyệt, ứng dụng báo "Chưa có gì bị thay đổi" — nhưng máy chủ có thể đã âm thầm hoàn tất việc ghi, kể cả xoá sạch toàn bộ khoá, khiến người dùng tin nhầm là chưa có gì xảy ra.
  file: `src/lib/settings/env-client.ts`
  severity: medium
  Đề xuất: new-contract

- **`replaceError` is never cleared and is rendered under every read-state card**
  Người dùng thấy gì: Sau một lần thao tác "Thay kho" thất bại rồi phiên đăng nhập hết hạn, người dùng có thể thấy dòng chữ đỏ báo lỗi thay-kho cũ còn sót lại bên dưới thẻ "Phiên đăng nhập đã hết", gây nhầm lẫn về nguyên nhân sự cố.
  file: `src/components/workspace/settings-dialog.tsx`
  severity: medium
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình: đếm PUT trên bề mặt Cài đặt không có đối chứng dương**
  Người dùng thấy gì: Bộ kiểm tra tự động chưa thực sự chứng minh được rằng màn Cài đặt không gửi yêu cầu ghi khi bị chặn — đây là khoảng trống trong việc kiểm tra nội bộ, không phải điều người dùng gặp phải.
  file: `src/components/workspace/store-read-states.test.tsx`
  severity: medium
  Đề xuất: known-limits

- **Assert GIÁ TRỊ hằng trong khi lời hứa là QUAN HỆ giữa hai module**
  Người dùng thấy gì: Bộ kiểm tra tự động chưa thực sự xác nhận rằng hai phần của hệ thống dùng chung một giới hạn thời gian — đây là khoảng trống kiểm tra nội bộ, không phải điều người dùng gặp phải.
  file: `src/lib/settings/env-client.timeout.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Tuyên cả hai chiều nhưng chỉ đo điểm-case một chiều (trần «không sớm»)**
  Người dùng thấy gì: Bộ kiểm tra tự động chưa xác nhận đầy đủ rằng giới hạn 30 giây áp dụng đúng cho cả thao tác lưu — đây là khoảng trống kiểm tra nội bộ, không phải điều người dùng trực tiếp gặp.
  file: `src/lib/settings/env-client.timeout.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Ca «đua» không dựng được tình huống đua — trùng khít ca ok**
  Người dùng thấy gì: Bộ kiểm tra tự động cho tình huống tranh chấp thời điểm giữa đọc và ghi kho khoá chưa thực sự dựng được tình huống đó — đây là khoảng trống trong việc kiểm tra, không phải lỗi người dùng gặp phải.
  file: `src/app/api/settings/env/route.replace-premise.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).