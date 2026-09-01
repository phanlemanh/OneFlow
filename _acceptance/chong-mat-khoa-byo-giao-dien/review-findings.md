## Trong hợp đồng

### Locale-parity guard freezes a COUNT, not a set — one swap keeps it green
- file: `src/i18n/locale-parity.test.ts:26`
- severity: low
- AC: AC-13
- source: bugs
- detail: `JA_DEBT_COUNT = 76` is asserted with `toBe`, and the comment claims it is "checked in BOTH directions" so the debt "can shrink; it can never silently grow". But `jaDebt` is recomputed from the current files each run, so translating one existing debt key while adding one new untranslated key leaves the count at exactly 76 and the suite passes — a new untranslated string ships green.

  The second test closes this only for `Settings.storeUnreadable.*` / `Workspace.storeUnreadable.*`; every other namespace is unguarded. Freezing the actual key list (a sorted array compared with `toEqual`) rather than its length would make the claim true.
- rationale: AC-13 tuyên bố nguyên văn rằng allowlist đóng băng khiến "khoá mới đặt nhầm namespace vẫn bị bắt"; finding chứng minh guard chỉ so đếm nên một hoán đổi (dịch một khoá nợ cũ, thêm một khoá mới chưa dịch) vẫn giữ nguyên số đếm và lọt qua — trực tiếp phủ nhận đúng mệnh đề Then đó.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **env-client.ts vi phạm chính invariant nó tự khai: literal tiếng Việt trong shared lib rò ra 4 locale**
  Người dùng thấy gì: Trong một số ít trường hợp phản hồi máy chủ hỏng bất thường, người dùng dùng giao diện tiếng Anh, Nhật, Hàn hoặc Trung có thể thấy một câu tiếng Việt lẫn vào thông báo lỗi khi lưu cài đặt.
  file: `src/lib/settings/env-client.ts`
  severity: high
  Đề xuất: known-limits

- **Client bỏ mất mã 409 ENV_STORE_UNREADABLE của server, đẩy ngược người dùng vào đúng cái bẫy feature này định gỡ**
  Người dùng thấy gì: Nếu kho khoá bị hỏng đúng lúc người dùng bấm Lưu, hệ thống có thể báo nhầm rằng khoá họ nhập sai và mời họ gõ lại, trong khi khoá vẫn đúng và vấn đề thực ra nằm ở kho lưu trữ.
  file: `src/lib/settings/env-client.ts`
  severity: medium
  Đề xuất: known-limits

- **settings-dialog save() nuốt lỗi ghi: chỉ logger.error, không có toast/inline error nào cho người dùng**
  Người dùng thấy gì: Khi lưu Cài đặt thất bại (mất mạng, lỗi máy chủ), màn hình không báo gì cả — người dùng tưởng đã lưu thành công trong khi thực tế các thay đổi bị mất.
  file: `src/components/workspace/settings-dialog.tsx`
  severity: medium
  Đề xuất: new-contract

- **Bằng chứng a11y về thứ bậc heading được đo trên prototype có cấu trúc khác hàng thật**
  Người dùng thấy gì: Bằng chứng về khả năng tiếp cận (đúng thứ bậc tiêu đề cho người dùng đọc màn hình) mới được đo trên bản mẫu, chưa được xác nhận trên đúng giao diện thật người dùng nhìn thấy.
  file: `src/components/workspace/node-key-prompt.tsx`
  severity: medium
  Đề xuất: known-limits

- **Label readFailed đã chết sau refactor nhưng vẫn bắt buộc trong type, vẫn truyền, vẫn dịch 5 locale**
  Người dùng thấy gì: Không ảnh hưởng người dùng — đây là một nhãn nội bộ không còn được dùng ở đâu trong sản phẩm, không gây ra thông báo sai nào trên thực tế.
  file: `src/components/workspace/nodes/add/media-library-config-panel.tsx`
  severity: low
  Đề xuất: wont-fix

- **Guard one-env-reader chỉ khớp literal nháy kép, teeth cũng chỉ thử một dạng**
  Người dùng thấy gì: Đây là công cụ kiểm tra nội bộ dùng lúc phát triển, không ảnh hưởng trực tiếp người dùng cuối; rủi ro là một cách viết mã khác trong tương lai né được vòng kiểm tra mà không bị phát hiện.
  file: `scripts/settings/check-one-env-reader.sh`
  severity: low
  Đề xuất: known-limits

- **Settings save failure is swallowed into logger.error — no user feedback at all**
  Người dùng thấy gì: Khi lưu Cài đặt thất bại (mất mạng, lỗi máy chủ), màn hình không báo gì cả — người dùng tưởng đã lưu thành công trong khi thực tế các thay đổi bị mất.
  file: `src/components/workspace/settings-dialog.tsx`
  severity: medium
  Đề xuất: new-contract

- **A failed WRITE is rendered on the node as "key is invalid", inviting a retype**
  Người dùng thấy gì: Nếu việc lưu khoá thất bại đúng lúc kho khoá bị hỏng, người dùng bị báo nhầm là khoá của họ không hợp lệ và bị mời nhập lại, dù khoá không có vấn đề gì.
  file: `src/components/workspace/nodes/base/abi-node-shell.tsx`
  severity: medium
  Đề xuất: known-limits

- **Untranslated Vietnamese literal in `put()` leaks into localized copy**
  Người dùng thấy gì: Trong một số ít trường hợp phản hồi máy chủ hỏng bất thường, người dùng dùng giao diện tiếng Anh, Nhật, Hàn hoặc Trung có thể thấy một câu tiếng Việt lẫn vào thông báo lỗi khi lưu cài đặt.
  file: `src/lib/settings/env-client.ts`
  severity: low
  Đề xuất: known-limits

- **New STORE_UNREADABLE code missing from both media-library route STATUS maps → answered as 502**
  Người dùng thấy gì: Khi kho khoá bị hỏng, chức năng tìm kiếm hoặc nhập thư viện media có thể báo nhầm đây là lỗi từ dịch vụ bên ngoài, khiến người dùng đi kiểm tra sai chỗ thay vì được biết đúng nguyên nhân.
  file: `src/app/api/media-library/search/route.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên quét LỚP nhưng chỉ có điểm-case: E12 chỉ ghim 2/8 khoá của MỘT namespace, bỏ trắng cả hai bề mặt node**
  Người dùng thấy gì: Một số câu chữ hiển thị trên node có thể vẫn sót tiếng Việt chưa dịch khi đổi sang ngôn ngữ khác mà không bị phát hiện trước khi phát hành, vì phép kiểm tra tự động hiện chỉ soát một phần nhỏ số câu liên quan.
  file: `src/components/workspace/settings-i18n-render.test.tsx`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 2 — fixture nhãn VIẾT TAY đúng khuôn bên đọc: hàng "abi-node-shell" của ma trận 2×5 không bao giờ dựng abi-node-shell**
  Người dùng thấy gì: Chưa có bằng chứng tự động xác nhận đầy đủ rằng ô nhập khoá trên node thực sự từ chối lưu đúng như thiết kế khi kho khoá hỏng; phép kiểm tra hiện tại có thể báo đạt dù mối nối thật trên sản phẩm bị sai.
  file: `src/components/workspace/nodes/store-unreadable-refusal.test.tsx`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 3 — assert "chuỗi có mặt" trong khi lời hứa là QUAN HỆ: `toContain("bg-destructive")` không phân biệt được biến thể thật với class chép tay**
  Người dùng thấy gì: Chưa có bằng chứng đầy đủ rằng nút cảnh báo vẫn giữ đủ các kiểu hiển thị cần thiết (bao gồm viền focus cho người dùng bàn phím) ở giao diện tối.
  file: `src/components/workspace/settings-dialog.replace.test.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — khẳng định bị vô hiệu hoá bằng early-return: `kind` không được ghim, ba ca báo PASS sau khi kiểm đúng một điều**
  Người dùng thấy gì: Nếu tính năng phân biệt 'kho hỏng' và 'chưa cấu hình khoá' bị lỗi trong tương lai, hệ thống kiểm tra tự động hiện tại có thể không phát hiện ra, khiến lỗi cũ có nguy cơ quay lại mà không ai biết trước khi phát hành.
  file: `src/lib/media-library/config.server.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — khẳng định âm-tính dựa trên regex viết tay, không có đối chứng dương rằng regex khớp được gì**
  Người dùng thấy gì: Chưa có bằng chứng chắc chắn rằng hai bảng cấu hình trên node thực sự không có nút thoát khi kho khoá hỏng; cách dò tên nút hiện tại có thể bỏ sót nếu chữ trên nút đổi khác đi.
  file: `src/components/workspace/nodes/store-unreadable-refusal.test.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — "về trạng thái bình thường" chỉ đo sự VẮNG MẶT của tấm chặn, không có vế dương mà chính evals.yaml đòi**
  Người dùng thấy gì: Phép kiểm tra tự động cho việc 'màn hình trở lại bình thường sau khi thay kho khoá' hiện chỉ xác nhận không còn cảnh báo, chứ chưa xác nhận ô nhập khoá đã thực sự hiện trở lại, nên một màn hình trống trơn cũng có thể bị coi là đạt.
  file: `src/components/workspace/settings-dialog.replace.test.tsx`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 11/17 lỗi rơi vào file không bộ đo nào phủ (src/components/workspace/node-key-prompt.tsx, src/components/workspace/nodes/add/media-library-config-panel.tsx, scripts/settings/check-one-env-reader.sh, src/app/api/media-library/search/route.ts, src/i18n/locale-parity.test.ts, src/components/workspace/settings-i18n-render.test.tsx, src/components/workspace/nodes/store-unreadable-refusal.test.tsx, src/components/workspace/settings-dialog.replace.test.tsx, src/lib/media-library/config.server.test.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
