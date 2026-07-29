---
slug: conformance-l0
at: 2026-07-28T00:10:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

# Gap-probe — phản biện context sạch trước Cổng 1

Một subagent context sạch đọc đúng 4 artifact (design doc, contract, evals,
decisions) và không đọc code. One-pass: artifact đã sửa theo các finding dưới
đây, không re-probe.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract + evals | "Normalized call-log" không được định nghĩa ở đâu — phạm vi so sánh là biến tự do của người viết adapter | Adapter TS xuất input chỉ gồm batchField, adapter Python lọc theo khoá có trong fixture; suite xanh cả 4 ca. Một phía sau đó bơm default (duration từ picker, file_key vs bytesBase64) mà phía kia không có — đúng loại lệch L0 sinh ra để chặn — suite vẫn xanh | Contract liệt kê tường minh call-log giữ gì; thêm eval âm đục một field KHÁC batchField và khẳng định suite đỏ | fixed: D5 của design định nghĩa chuẩn hoá đầy đủ; AC-6 viết lại nêu rõ phạm vi; AC-7 mở rộng sang field ngoài batchField; E8 đòi mutation cả hai loại |
| P0 | contract | Ô Zwicky A(gộp kết quả) × B(biên/rỗng) trống — không AC nào chốt output_views và data_node_state bằng gì khi N=0 | Workflow 3 node, node giữa batch rỗng. Bước gộp lấy metadata route từ results[0] → IndexError; hoặc output_views thiếu khoá nodeId → node thứ ba nổ lúc resolve params. E2 chỉ assert zero-invocation và "node giữa không lỗi" (đúng — node SAU mới nổ) nên vẫn xanh | AC riêng cho N=0: values == [] với metadata route giữ nguyên; eval chạy workflow 3 node tới hết, node cuối nhận danh sách rỗng, run thành công | fixed: thêm AC-11 + eval E13; Coverage ghi nhận ô này |
| P1 | contract + evals | AC-3 đòi "byte-identical input" nhưng không baseline nào được chụp trước khi sửa; E3 hạ xuống "đúng một lời gọi" | Bước fan-out chèn thêm một lần copy/normalize dict làm rụng key None hoặc đổi kiểu field. Vẫn đúng 1 lời gọi, test_engine.py không assert toàn bộ dict → E3 xanh, AC-3 tuyên PASS trong khi plugin đang chạy được bắt đầu nhận thiếu field | Chụp call-log không-batch TRƯỚC khi sửa thành fixture baseline trong repo; eval so khớp toàn bộ dict sau khi sửa, diff phải rỗng | fixed: AC-3 viết lại quanh baseline chụp trước; E3 tách thành E3 (suite cũ) + E14 (so baseline) |
| P1 | evals | AC-10 hứa "notification tới client" nhưng E12 chỉ chạy unit của delegate — tầng SSE và phía nhận không nằm trong paths lẫn expected | Delegate map đúng nhưng type mới không vào union sự kiện SSE hoặc rơi nhánh mặc định ở client → fingerprint/tier không bao giờ tới UI. E12 xanh, L0 tuyên "ống đã thông"; L2 mới lộ phải mở lại xuyên ba tầng đúng lúc đang làm phần khó — mất chính lợi ích D2 lấy làm lý do tồn tại | Eval xuyên tầng: bơm node_cached giả, đọc payload đã serialize ở route SSE, cho parser client tiêu thụ, assert fingerprint và tier còn nguyên | fixed: AC-10 nêu rõ ba tầng; E12 mở rộng paths + expected sang route SSE và parser client |
| P1 | contract + evals | AC-8 nói "either path" nhưng manifest chỉ do scanner Python sinh; không AC/eval nào đo đường ghép cài-bằng-TS rồi scan | Plugin cài qua UI bằng isomorphic-git; scanner shell ra git rev-parse nhưng desktop không có git CLI, hoặc checkout isomorphic-git để lại CLI không đọc được → entry thiếu pluginRev. AC-9 định nghĩa "thiếu rev là hợp lệ" nên sự cố không phân biệt được với thành công. L1 lấy rev làm khoá sẽ thấy đường cài phổ biến nhất không có rev | Eval đường ghép: cài qua đúng code path TS vào thư mục tạm, chạy scanner thật, assert entry có pluginRev khớp; tách "không phải git repo" (được phép trống) khỏi "là git repo nhưng đọc rev thất bại" (phải fail) | fixed: AC-8 viết lại quanh đường ghép; AC-9 tách hai trạng thái; E10/E11 đổi theo, thêm E15 |
