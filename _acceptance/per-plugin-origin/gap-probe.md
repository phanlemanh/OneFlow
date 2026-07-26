---
slug: per-plugin-origin
at: 2026-07-26T22:11:57Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

# Gap probe — per-plugin-origin

Fresh-context critic, one pass, artifacts only (contract + evals). The critic was
given no repository access by design: at Gate 1 the code does not exist yet, so
the only thing that can be judged is whether the criteria would let a wrong
implementation through.

Disposition column decided in the main loop after checking the two P0 claims
against the real call sites. Both P0s were confirmed and fixed in the artifacts
rather than pushed to the human, because each was an ambiguity that made a wrong
implementation pass every eval — not a scope question.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Không chốt ngữ nghĩa ghép URL của `origin` cấp entry — base để nối `/{id}.git`, hay chính là clone URL đầy đủ | Entry với origin `https://github.com/phanlemanh` có hai cách hiểu; AC-5 gọi origin là "clone target" còn Notes gọi `org` là base URL. E2 chỉ đòi "resolves to it" nên fixture viết theo hướng nào cũng exit 0, E6 so installer với resolver cũng khớp vì cùng một hàm sai. Gate 1 duyệt, đến khi fork thật thì clone sai địa chỉ mà mọi eval vẫn xanh | AC-2 ghi literal URL kỳ vọng và E2 assert đúng chuỗi đó cho entry override, đồng thời assert sibling vẫn ra `${org}/${id}.git` | fixed: AC-2 nay ghi rõ `origin` là base URL cùng ngữ nghĩa với `org`, kèm literal `https://github.com/phanlemanh/<id>.git`; E2 assert đúng chuỗi đó. Xác nhận bằng code: `officialGitUrl` là `` `${org}/${id}.git` `` với `org` = `https://github.com/tong-io` |
| P0 | contract | Trục Coverage "người tiêu thụ" khai ba giá trị nhưng AC-3 chỉ nói manager trong app và installer CLI; trình kiểm tra cập nhật không AC nào phủ, không eval nào đo | Trình kiểm tra cập nhật dựng remote theo đường riêng. E5 đếm template vẫn thấy đúng một lần, E6 chỉ so installer với resolver, E9 đến E12 là gate chung — tất cả exit 0. Plugin đã override origin vẫn bị kiểm tra cập nhật từ upstream, đúng kịch bản "nobody noticing" mà chính thước CE cảnh báo | Thêm eval so nguồn mà trình kiểm tra cập nhật thực sự dùng, cho mọi id trong manifest thật và cho fixture có override; AC-3 nêu đích danh cả ba consumer | fixed: XÁC NHẬN bằng code — `checkOfficialPluginUpdates` truyền `manifest.org` đơn lẻ cho mọi plugin rồi gọi `officialGitUrl` để ls-remote. AC-3 nay nêu cả ba consumer; E6 mở rộng thành parity ba đường thay vì hai |
| P1 | evals | E6 không nói nó gọi vào code path thật của installer hay chỉ import lại resolver, nên phép so có thể là tautology | Script import resolver rồi so kết quả với chính nó, luôn exit 0, trong khi installer thật còn hậu xử lý remote sau khi gọi resolver. AC-3 xanh nhưng CLI vẫn clone khác manager trong app | E6 phải chạy installer ở chế độ dry-run in ra remote thật sự dùng để clone, rồi mới so với resolver | fixed: E6 expected nay đòi dry-run in ra remote thật của từng đường, cấm so resolver với chính nó |
| P1 | evals | E5 không định nghĩa phạm vi quét và danh sách loại trừ cho tiêu chí "xuất hiện đúng một lần" | Quét cả repo thì chính script check và test fixture đều chứa template nên đếm ra 3 và E5 đỏ oan, chặn nhầm. Chỉ quét `src/` thì bản sao còn sót trong `scripts/` vẫn lọt, AC-3 xanh giả | E5 expected ghi rõ thư mục quét, phần mở rộng, đường dẫn loại trừ, và assert `install-official-plugins.mjs` không còn tồn tại sau khi chuyển sang TypeScript | fixed: E5 expected nay khai phạm vi quét, loại trừ, và đòi file `.mjs` cũ biến mất |
| P1 | contract | Trục "hình dạng entry" thiếu một giá trị: entry dạng object nhưng không có `origin` — hợp lệ và fallback về `org`, hay bị coi là malformed | AC-2 chỉ mô tả object có origin, AC-4 không liệt kê case này. Implementer chọn hướng nào thì E2 và E3 cũng xanh. Sau này ai thêm entry dạng đó sẽ làm manifest fail ngay lúc load mà không eval nào chặn được | Chốt một hướng trong AC-2 hoặc AC-4 rồi thêm assert tương ứng | fixed: chốt hướng khoan dung — object thiếu `origin` là HỢP LỆ và rơi về `org` mặc định; ghi vào AC-2 và assert trong E2. Lý do: tương thích ngược, và từ chối nó là khắt khe tuỳ tiện. Điểm này được nêu riêng cho human ở Cổng 1 vì là lựa chọn sản phẩm nhỏ |
