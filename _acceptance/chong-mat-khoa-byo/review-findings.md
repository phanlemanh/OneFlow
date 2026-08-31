## Trong hợp đồng

### Tuyên quét LỚP (sáng × tối) nhưng chỉ có điểm-case: cột "sáng" chưa bao giờ được chụp — cả 6 bản chụp đều ở chế độ tối
- file: `_acceptance/chong-mat-khoa-byo/evals.yaml:292`
- severity: high
- source: measurement
- AC: AC-14

E17 tuyên "axe-core... quét 6 trang (3 trạng thái × sáng/tối)" và design-pass.md:14 khai `themes: [light, dark]` với bảng 12 dòng chụp. Nhưng ma trận theme không tồn tại về mặt cơ chế: `src/app/proto/[slug]/page.tsx` chỉ làm `theme === "dark" ? <div className="dark">{body}</div> : body` — tham số URL chỉ có thể THÊM dark, không có đường nào ép sáng; còn theme thật do script trong `src/app/layout.tsx:38-39` gắn `class="dark"` lên `<html>` theo localStorage/prefers-color-scheme của trình duyệt chụp. Bằng chứng trong chính diff xác nhận điều đó đã xảy ra: cả 6 file `evidence/design-pass/*.html` — kể cả ba file tên `--light.html` — đều mở bằng `<html lang="vi" class="dark">` (file `--dark` chỉ khác ở chỗ có thêm một div `.dark` lồng bên trong, không đổi token nào); và các PNG light/dark trùng byte: `panel-unreadable--light.png` = `--dark.png` = `--desktop--light.png` = `--desktop--dark.png` (md5 3412b679…), tương tự cho store-unreadable (3e2740ea…) và store-unreadable-confirm (f7134b76…). Nên 12 dòng bảng chụp thực chất là 6 khung phân biệt (3 trạng thái × 2 viewport), và cả a11y.json (6 URL, violations rỗng) lẫn E18 đều không nói gì về tương phản/token ở theme sáng. Đáng chú ý: design-pass.md:75-77 ghi một phát hiện về nhánh `dark:` bị đánh rơi — phát hiện đó đến từ đọc mã, không từ phép đo, vì phép đo chưa từng dựng bản sáng.

### Assertion âm-tính-một-mình: "không có nút bỏ kho" không có đối chứng dương, và ma trận hai panel chỉ đo một panel
- file: `src/components/workspace/nodes/add/media-library-config-panel.test.tsx:90`
- severity: medium
- source: measurement
- AC: AC-12

Test `offers no way to drop the store` chỉ assert `screen.queryAllByRole("button", { name: /bỏ kho cũ|nhập lại|discard/i }).toHaveLength(0)` (dòng 96-101). Không nơi nào trong bộ đo chứng minh truy vấn ĐÓ có thể trả về khác 0: grep toàn repo cho thấy regex này chỉ xuất hiện đúng một lần, còn settings-dialog.test.tsx:120,143 dùng tên chính xác `en.Settings.dropStore` chứ không dùng cùng regex — nghĩa là một regex viết sai (sai chính tả, sai ngôn ngữ, đổi role) sẽ cho 0 ở mọi nơi và ô này vẫn xanh. Đây đúng thứ evals.yaml E14 vế 2 yêu cầu chặn bằng chữ: "ĐỐI CHỨNG DƯƠNG là cùng truy vấn đó trên settings-dialog phải === 1 — không có đối chứng thì một truy vấn sai chính tả cũng cho 0 ở mọi nơi", và đối chứng đó không được cài. Cùng ô còn hụt nửa ma trận: E14 vế 2 khai "ma trận hai panel (số assert bằng số panel)", nhưng abi-node-shell.test.tsx và node-key-prompt.test.tsx không có assert nào về nút bỏ-kho — chỉ 1/2 phần tử được đo.

### Fixture VIẾT TAY đúng khuôn bên đọc: nhãn của node prompt do chính test cấp, nên mặc định chuỗi rỗng trong mã ship không phép đo nào bắt được
- file: `src/components/workspace/node-key-prompt.test.tsx:17`
- severity: medium
- source: measurement
- AC: AC-12

Test dựng `LABELS` viết tay (dòng 17-30) rồi assert `getByText(/không đọc được kho khoá/i)` và `getByText(/mở cài đặt/i)` — tức là khớp lại đúng chuỗi mà chính test vừa truyền vào, không round-trip từ writer thật. Writer thật là `src/components/workspace/nodes/base/abi-node-shell.tsx:63-64`, nơi `KEY_PROMPT_LABELS.storeUnreadable` và `.openSettings` được đặt là chuỗi RỖNG `""` và chỉ được ghi đè trong `useMemo` của `AbiNodeShell` (dòng 320-330). Không test nào mount `AbiNodeShell` (grep `<AbiNodeShell` trong *.test.tsx: không kết quả; abi-node-shell.test.tsx chỉ import `saveAndVerifyKey`/`useNodeKeyGate`), nên nếu phần ghi đè đó biến mất, người dùng thấy một khối alert rỗng còn cả ba file test vẫn xanh. E14 vế 3 tuyên đo "màn hiện câu đã dịch + lối sang Cài đặt", nhưng câu được đo là câu của test, không phải câu từ bundle đi qua shell.

### Đo hằng số của chính bài đo thay vì đầu ra: "keeps the four reasons distinct" không gọi mã sản phẩm lần nào
- file: `src/lib/settings/env-store.server.test.ts:163`
- severity: medium
- source: measurement
- AC: AC-3

Test dựng `const seen = new Set()`, đổ vào đó `reason` lấy từ chính mảng literal `BLOB_CAUSES` khai ở dòng 105-109 của file test, cộng thêm hai chuỗi gõ tay `seen.add("io")` / `seen.add("decode")`, rồi assert `expect([...seen].sort()).toEqual(["decode","io","parse","shape"])`. Không có lời gọi `readEnvStore()` nào trong test này (`void blob;` cho thấy fixture bị bỏ đi luôn), nên nó chỉ có thể đỏ khi ai đó sửa chính bảng literal trong file test — mọi thay đổi ở `src/lib/settings/env-store.server.ts` đều vô hình với nó. Nó nằm trong ô E3, ô tuyên "MA TRẬN TOÀN PHẦN bốn nguyên nhân... `reason` PHÂN BIỆT được bốn ca", nên nó đọc như bằng chứng cho tính phân biệt trong khi bằng chứng thật chỉ nằm ở bốn assert kia.

### Ma trận thiếu phần tử viết-trước: danh sách WRITER của phép đo parity bỏ sót đúng file mà gói việc này thêm t() vào
- file: `src/i18n/locale-parity.test.ts:23`
- severity: medium
- source: measurement
- AC: AC-13

File tự nêu nguyên tắc "key list is DERIVED from the writers, never hand-listed", nhưng TẬP WRITER lại là hằng viết tay gồm đúng hai đường dẫn (dòng 23-27: settings-dialog.tsx, add-media-library-node.tsx). Gói việc này còn thêm một writer thứ ba: `src/components/workspace/nodes/base/abi-node-shell.tsx:326-327` gọi `tSettings("saveBlockedUnreadable")` và `tSettings("openSettingsHint")`, và file đó không có trong WRITERS. Evals.yaml E16 mô tả phạm vi rộng hơn hiện trạng — "đúng tập file mà gói việc này khai (settings-dialog, hai panel node, proto)" — trong khi chỉ một panel node được quét. Hai khoá kể trên hiện được phủ tình cờ vì add-media-library-node.tsx cũng dùng chúng; một khoá mới chỉ xuất hiện trong abi-node-shell.tsx sẽ không bao giờ làm ô này đỏ, tức đúng chiều (b) mà E16 tuyên là lý do nó được viết lại ("thêm một t(\"khoa.moi\") vào mã mà không dịch → PHẢI đỏ").

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Unreadable key store now disables media-library even when the vars come from process.env**
  Người dùng thấy gì: Nếu thư viện media được cấu hình qua biến môi trường thay vì màn Cài đặt, một file cấu hình không liên quan bị hỏng vẫn có thể làm tính năng ngừng hoạt động và chỉ người dùng vào Cài đặt — nơi không có gì để sửa.
  file: `src/lib/media-library/config.server.ts`
  severity: high
  Đề xuất: new-contract

- **Server's hardcoded Vietnamese error sentence is rendered to the user under a translated label**
  Người dùng thấy gì: Người dùng dùng giao diện tiếng Anh, Nhật, Hàn hoặc Trung có thể thấy một câu lỗi tiếng Việt xen trong màn Cài đặt khi kho khoá không đọc được, thay vì một thông báo bằng đúng ngôn ngữ họ đang dùng.
  file: `src/app/api/settings/env/route.ts`
  severity: medium
  Đề xuất: new-contract

- **New user-facing throws in abi-node-shell are hardcoded Vietnamese and surface as the prompt's reason line**
  Người dùng thấy gì: Khi việc đọc khoá gặp một lỗi bất ngờ khác với 'kho hỏng' chuẩn, người dùng ở mọi ngôn ngữ khác tiếng Việt có thể thấy một câu báo lỗi tiếng Việt ngay trên node, thay vì một thông báo đã được dịch.
  file: `src/components/workspace/nodes/base/abi-node-shell.tsx`
  severity: medium
  Đề xuất: new-contract

- **ENV_STORE_UNREADABLE is exported as the contract but every caller branches on the raw 503 instead**
  Người dùng thấy gì: Không ảnh hưởng đến những gì người dùng thấy hôm nay — đây là một khoản nợ kỹ thuật nội bộ khiến việc bảo trì về sau rủi ro hơn, không phải một lỗi người dùng gặp phải.
  file: `src/lib/settings/env-store.server.ts`
  severity: medium
  Đề xuất: known-limits

- **dropStoreAndSave iterates customRows that the 503 branch has already cleared**
  Người dùng thấy gì: Không ảnh hưởng người dùng hôm nay vì hành vi hiện tại đúng như mong đợi (xác nhận sẽ xoá sạch kho); đây là một rủi ro tiềm ẩn nếu màn hình này được sửa sau này mà không để ý đến đoạn mã đó.
  file: `src/components/workspace/settings-dialog.tsx`
  severity: low
  Đề xuất: known-limits

- **Domain error type and internals exported from a component file for test access**
  Người dùng thấy gì: Không ảnh hưởng người dùng — đây là cách tổ chức mã nguồn nội bộ, không làm thay đổi những gì người dùng thấy hoặc có thể làm.
  file: `src/components/workspace/nodes/base/abi-node-shell.tsx`
  severity: low
  Đề xuất: known-limits

- **Settings dialog only guards HTTP 503 — any other failed GET still leaves an empty, savable form that wipes the store**
  Người dùng thấy gì: Nếu màn Cài đặt tải lỗi vì một nguyên nhân khác với kho khoá bị hỏng, người dùng vẫn thấy form lưu khoá bình thường và có thể bấm Lưu — thao tác đó có thể xoá sạch mọi khoá đã lưu mà không có cảnh báo nào trước đó.
  file: `src/components/workspace/settings-dialog.tsx`
  severity: high
  Đề xuất: new-contract

- **resolveConfig short-circuits before the process.env fallback, so an env-var-configured media library breaks on an unrelated corrupt settings.json**
  Người dùng thấy gì: Một cài đặt dùng biến môi trường cho thư viện media (không qua màn Cài đặt) có thể ngừng hoạt động chỉ vì một file cấu hình không liên quan bị hỏng, dù bản thân cấu hình thư viện media hoàn toàn bình thường.
  file: `src/lib/media-library/config.server.ts`
  severity: medium
  Đề xuất: new-contract

- **writeSettingsBlob is a non-atomic truncate-then-write, so an interrupted save is what creates the unreadable state this feature now only offers 'discard everything' to escape**
  Người dùng thấy gì: Nếu ứng dụng bị tắt đột ngột hoặc hết dung lượng đĩa đúng lúc đang lưu Cài đặt, file khoá có thể bị hỏng — và lối thoát duy nhất hiện có là xoá sạch toàn bộ khoá đã lưu để nhập lại từ đầu.
  file: `src/ext-default/settings-store.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
