---
slug: scan-scope-diagnostics
at: 2026-08-18T05:38:00Z
verdict: findings
p0: 2
p1: 2
p2: 1
---

# Phản biện context sạch — scan-scope-diagnostics

Một subagent tươi, chỉ đọc 5 tệp (design · contract · evals · decisions · claims từ
`claim-scan.mjs`), không đọc mã kho (mã chưa tồn tại). One-pass: sửa artifact xong KHÔNG
re-probe — phần mã đã có 3 vòng S4.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | contract | Trục A giá trị «module trần» không có AC nào. Dòng Coverage khai «Phủ bởi AC-1..AC-5» nhưng AC-1/AC-2/AC-3 đều lồng trong khối, AC-4 closure, AC-5 thân class — hình dạng phổ biến nhất (def ở cột 0) không được khẳng định ở đâu. Cha cũng đã descope nhánh này ở Cổng 2 [d-20260818T050720Z-28869] nên không có ai đỡ phía trên | Người viết mã dựng tập module-scope CHỈ từ câu lệnh nằm BÊN TRONG khối không mở phạm vi — đúng hình dạng mà mọi eval mới đều chạm. E1–E6 xanh, E15 (răng) xanh vì hoàn nguyên về tree.body vẫn làm các ca trong-khối đỏ, E13 chỉ đỏ khi noise TĂNG nên một chẩn đoán bị MẤT là vô hình. Lỗi soạn plugin phổ biến nhất tụt lại về câu chung chung và ship kèm 17 eval xanh | AC ghim hình dạng module trần thành cặp hai chiều, kèm eval khẳng định def hỏng ở cột 0 vẫn nêu dòng và tên method, def lành ở cột 0 vẫn 0 problem | **fixed:** thêm AC-15 + eval E18 + khoá `sdk_pytest_diag_bare_module`; dòng Coverage trục A ghi rõ ô này trống cho tới lượt phản biện |
| P0 | evals | AC-6 khai bốn ca thu-thập-không-đổi (module trần · trong khối · trong `def` · trong `class`) nhưng E6b chỉ đo hai ca ÂM. Nửa còn lại là sàn thật, và sửa đổi rơi đúng vào `_walk_module_scope` — hàm lõi của gói cha, vừa được memoise trên nhánh nền | `take(child)` viết kèm chặn đệ quy vào khối không mở phạm vi. Ma trận mười từ khoá DƯƠNG của cha gãy, nhưng không eval nào ở đây chạy nó: E6 chỉ đo hành vi mới, E6b chỉ đo hai ca âm. Cổng 2 ký trên bằng chứng xanh trong khi bằng chứng của gói cha bị vô hiệu âm thầm, CI mới đỏ lúc mở PR | Eval chạy đủ bốn ca AC-6 nêu, xanh trên CẢ mã đã vá lẫn chưa vá | **fixed một nửa, rejected một nửa:** E6b đổi sang khoá mới `sdk_pytest_diag_import_floor` chạy đủ 5 node-id (ma trận 10 từ khoá · nested · module trần + try · hai ca âm). Nửa «không eval nào chạy full SDK suite» → **rejected:** `feature_loop.suite_keys` đã có `executors.test.sdk_pytest` nên toàn bộ pytest SDK chạy mỗi vòng S4 như suite command; critic chỉ đọc 5 tệp nên không thấy `config.yaml` |
| P1 | evals | AC-6 hứa một QUAN HỆ — một hàm dùng bởi CẢ HAI bộ đọc — nhưng E6 chỉ đo hành vi của walker khi đứng riêng. Chiều đỏ nó tự khai («đỏ ngay khi hai câu trả lời được tính ở hai nơi») là thứ một unit test của walker không thể đạt. AC-10 đã được xử bằng mutation cho đúng lớp lời hứa này, AC-6 thì chưa | Người viết mã sửa `_walk_module_scope` đúng thiết kế VÀ viết thêm một `_module_scope_ids()` riêng bên trong `scan.py` liệt kê thân khối, không bao giờ gọi hàm chung. E6 xanh, E1–E5 xanh, E15 xanh. Quan hệ một-nguồn không được chứng minh và hai nửa lại tự do lệch nhau — đúng lớp lỗi gói này sinh ra để diệt | Soi gương E10: trên bản sao, vô hiệu hàm chung tại một điểm và đòi CẢ cổng từ chối trong `scan.py` LẪN bộ thu import đổi hành vi | **fixed:** AC-6 viết lại nêu rõ quan hệ chứng minh bằng mutation; thêm E6c + khoá `diag_shared_walker_teeth` |
| P1 | evals | E13 là thước duy nhất của AC-13 và nó đọc cây `plugins/` vốn gitignore, dựng lúc chạy — không skip có tên, không có bản luôn-chạy đi kèm. Cha đã vấp đúng hình dạng này và tách đôi [scan-with-block-imports#F2]; ở đây mới bê sang một nửa | Verifier chạy trên checkout sạch hoặc máy chưa cài plugin nào. Tập ở base và tập ở HEAD đều rỗng, delta rỗng, E13 exit 0, evidence ghi AC-13 đã verified. Trong khi đó cổng mở rộng khiến plugin deploy-first thật báo handler lồng khối ngoài đời — E5 không bắt được vì nó chạy trên fixture một-plugin tổng hợp | E13 khẳng định số plugin quét được khác 0 và SKIP có tên khi bằng 0, cộng một bản luôn-chạy trên cây fixture đã commit | **fixed:** AC-13 gộp hai vế trong một tiêu chí nhưng đo bằng HAI eval exit code riêng — E13 (`diag_noise_fixture`, không bao giờ skip, đòi count khác 0) và E13b (`diag_noise_real`, skip có tên); cắt script riêng thay vì sửa `check-scan-noise.sh` của cha |
| P2 | evals | E14 không ghim commit nền chuẩn tắc. Nó giải `merge-base(HEAD, ${DIAG_BASE_REF:-origin/main})`, hợp đồng chỉ nói «merge base», ledger nói đỉnh nhánh cha — ba câu trả lời, không câu nào được ghim, và eval không hề khẳng định nền giải ra là tổ tiên thật sự khác HEAD. Cùng hình dạng lỗi với [stale-scope-by-paths#F2] | Verifier export `DIAG_BASE_REF` trỏ đúng đỉnh nhánh hiện tại, hoặc một ref đã trôi lên HEAD sau khi nhánh cha stacked bị rebase — thứ chính Notes của hợp đồng ghi là ĐÃ xảy ra một lần. Diff rỗng, E14 exit 0, AC-14 báo bán kính sạch và version SDK chưa bump mà chưa từng so gì | E14 in SHA nền đã giải vào evidence, khẳng định nó là tổ tiên NGHIÊM NGẶT của HEAD và diff KHÔNG rỗng; hợp đồng ghim nền là đỉnh nhánh cha, `origin/main` chỉ được dùng như cửa sổ rộng có ghi nhận | **fixed:** AC-14 ghim nền + đòi in SHA, tổ tiên nghiêm ngặt, diff khác rỗng; `expected` của E14 viết lại theo |

## Ghi chú

- Không finding nào lật quyết định đã seal hoặc `descope` trong ledger.
- Không tiêu chí nào mang tag `(cross-layer)`: toàn bộ gói là Python trong cùng một tiến
  trình, không có seam UI/backend — critic xác nhận tag không áp dụng thay vì bịa ra nhu cầu.
- `claim-scan.mjs` exit 0, corpus có nội dung → truyền làm input thứ 5. Hai finding có cite
  id nguyên văn (`[d-20260818T050720Z-28869]`, `[scan-with-block-imports#F2]`,
  `[stale-scope-by-paths#F2]`).
- Sau sửa: 15 AC, 21 eval, mọi AC có ≥1 eval, không eval nào trỏ AC không tồn tại.
