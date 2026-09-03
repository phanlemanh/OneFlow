---
slug: khong-noi-sai-ve-kho-khoa
at: 2026-09-03T06:40:54Z
verdict: findings
p0: 0
p1: 2
p2: 3
claims_input: ok
---

# Gap-probe — khong-noi-sai-ve-kho-khoa

Phiên tươi, năm input (design · contract · evals · sổ quyết định · bài học xuyên hồ sơ),
không đọc code. Định đoạt one-pass; không re-probe.

## Cross-check

- AC không eval: không thấy.
- GWT không đo được: AC-4 «không node nào kẹt ở đang-kiểm» chỉ đo promise, không đo bề mặt (F1); AC-5 «cùng một component» đo bằng testid, không đo quan hệ (chấp nhận — E13 sau khi sửa F5 đo marker component trên bản mẫu; bề mặt thật đo qua E5 testid, Known limit nhỏ).
- Trục Coverage: đủ. Lệch: E6 `paths` thiếu `media-library-config-panel.tsx` — đã sửa.
- Cross-layer: AC-1 có tag + backend-effect. AC-7 mock body 409 viết tay — hằng `ENV_STORE_REPLACE_REFUSED` ghim ở E1 phía server; chấp nhận, ghi Known limit «E7 không round-trip body từ route».
- Chuẩn UI/plugin: không vi phạm. Skill: design-pass đang chạy song song (S1-D), bản bấm được sẽ kèm thẻ Cổng 1.
- Lớp đo-lường: ba danh sách «9 tín hiệu» lệch nhau (F3); E5(3) âm tính đo sai chuỗi (F2); E8 đếm tệp thay vì lần (F4); E13 không khẳng định mount component thật (F5).

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | design §4 + evals E4 | Hợp đồng thất bại của `put()` khi quá trần không xác định (ném hay trả); AC-4 hứa «không node nào kẹt» nhưng không ô nào dựng bề mặt — cùng lớp [chong-mat-khoa-byo#F1] | Implementer cho `put()` RESOLVE `{state: unavailable}` → caller try/catch không thấy throw → `saveEnvKeys` «thành công» → node rời `verifying` bằng nhánh saved, khoá chưa ghi. Hoặc `put()` ném mà node await promise khác → vẫn kẹt. E4 xanh cả hai. | Design §4: `put()` NÉM Error mang `code: "timeout"` — giữ đường throw để nhánh `writeFailed` cũ bắt. E4(d): render `abi-node-shell` với fetch treo, 30 001 ms → phase ≠ `verifying` VÀ ≠ `verified` (KHÔNG khẳng định về `saved-unverified` — đó là Ngoài-3/7 đã descope). Chiều đỏ: throw→return → (d) đỏ «phase verified after timeout» | fixed: design §4 + AC-4 + E4(d) |
| P1 | evals E5 (3) | Âm tính đo sai chuỗi («kho khoá» thay vì «kho hỏng»), không ghim locale; chiều đỏ không trúng chuỗi kiểm | Tái dùng khoá `storeUnreadable.title` cho state mới; render `en` → substring tiếng Việt luôn vắng → xanh; người dùng `vi` thấy «Không đọc được kho khoá đã lưu» khi hết phiên — đúng lỗi hồ sơ này chống | (3) thành quan hệ: `title === messages[locale][khoá của state]` VÀ `!== messages[locale][storeUnreadable.title]`, locale ghim tường minh (en và vi). Chiều đỏ: trỏ state mới về khoá cũ → 3 ca đỏ nêu state + khoá | fixed: E5(3) + chiều đỏ |
| P2 | contract AC-2 + design §Đo + evals E2 | Ba danh sách «9 tín hiệu» khác nhau (AC-2 liệt kê 10; design thiếu `no-env`; E2 thiếu `timeout`) — cùng lớp [normalize-text-vi#F2] | Fixture dựng theo bảng design (thiếu no-env), ghim 9 bằng cách thêm timeout → `env: []` không vào ma trận → mảng bị coi là object → `ok` với env rỗng | AC-2: MƯỜI tín hiệu; chín đo ở E2, quá-trần đo ở E4; tổng ghim 10. Design bảng thêm `no-env`. E2 giữ 9, ghi rõ không gồm timeout | fixed: AC-2 + design + E2 |
| P2 | evals E8 + E3 | E8 đếm TỆP chứa CustomEvent = 1, không đếm LẦN; E3 chỉ spy env-client — «một chỗ định nghĩa» không được đo — lớp [normalize-text-vi#F1] | Thêm helper export nhưng để nguyên khối inline trong `apiClient` → client.ts có 2 CustomEvent → E8 vẫn 1 tệp → xanh | E8: `grep -c` CustomEvent trong client.ts = 1, in số đếm. E3(e): `apiClient` nhận 401 → helper gọi đúng 1 lần. E9(5): chèn CustomEvent thứ hai vào client.ts → exit 1 nêu số 2 | fixed: E8 + E3(e) + E9(5) |
| P2 | evals E13 | Bản mẫu a11y không khẳng định proto MOUNT `StoreUnreadableNotice` thật — [add-media-library#F1] «paths là gợi ý» | Proto vẽ markup riêng aria đầy đủ; component thật ở dark có nút thiếu accessible name → axe proto 0, bề mặt thật serious | Component thật phát `data-proto-component="store-unreadable-notice"`; wrapper đọc lại trên cả 4 trang cùng vòng `data-proto-state`. Chiều đỏ: markup inline thay import → đỏ «component marker missing on page N» | fixed: E13 + Notes |
