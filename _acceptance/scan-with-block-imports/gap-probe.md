---
slug: scan-with-block-imports
at: 2026-08-18T00:00:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

# Gap probe — scan-with-block-imports

Một lượt, context sạch, chỉ đọc design + contract + evals + sổ quyết định + corpus bài
học. Không đọc mã repo (mã chưa tồn tại).

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | Không phép đo nào phân biệt được "ranh giới phạm vi" với "liệt kê thêm vài loại khối". E1–E6 chỉ chạm `with`/`if`/`try`; E14 hoàn nguyên về dạng chỉ-biết-`Try` nên bản liệt-kê-ba-loại cũng làm nó đỏ. Coverage đẩy `while`/`match` sang Later kèm điều kiện "nếu bản vá đi đường liệt kê thì tách ra" — không máy nào đọc được bản vá đi đường nào. Cùng lớp [stale-scope-by-paths#F1] | Implementer viết `isinstance(node, (ast.Try, ast.With, ast.If))`. 15/15 xanh, Cổng 2 ký. Plugin đặt import trong `for`/`while`/`match`/`else`/`except` tái hiện y nguyên triệu chứng gốc | Ma trận toàn phần viết trước: một assert cho mỗi từ khoá khối không mở phạm vi, số assert = số phần tử, cộng hai chân âm `def`/`class` | **fixed:** AC-3 viết lại thành ma trận toàn phần 10 từ khoá; E3 đổi thành ca liệt kê từng phần tử. KHÔNG lấy nửa "assert cấu trúc trên mã nguồn" — đó lại là đo-chuỗi-có-mặt, và ma trận hành vi đã đủ giết đúng kịch bản fail |
| P0 | evals | E12 là câu hỏi sản phẩm DUY NHẤT nhưng được phép SKIP khi `plugins/` chưa cài — mà thư mục đó gitignore, dựng lúc chạy. ROOT lại neo theo cwd thay vì vị trí script, và phép đo dựng lại lời gọi của server bằng tay, không assert `tongflow` nạp từ `sdk/` repo hay từ site-packages 0.2.18. Cùng lớp "viết đúng nhưng chưa nối dây" [cache-l4-eviction#F1] | Verifier chạy từ worktree khác → `plugins` không phân giải → 0 plugin → nhánh skip → mọi eval xanh, câu hỏi sản phẩm chưa từng được trả lời | Bỏ nhánh skip: fixture cây plugin round-trip rút từ `deploy.py` thật, ghim hash; ROOT suy từ vị trí script; assert `tongflow.__file__` nằm dưới `<repo>/sdk/` | **fixed:** AC-12 tách đôi — E12 chạy trên fixture round-trip, LUÔN chạy, kèm assert xuất xứ SDK; E12b chạy trên cây `plugins/` thật và bỏ qua có-tên khi chưa cài, nhưng nó không còn là phép đo sản phẩm duy nhất |
| P1 | contract | AC-7 đòi problem "nêu file, dòng, method, lý do" — đó là đo chuỗi-có-mặt, trong khi lời hứa của Lớp 2 là QUAN HỆ: file được nêu phải là file ĐỊNH NGHĨA method (`deploy.py`), không phải file đang quét (`entry.py`) | Bộ quét phát "…/entry.py:1: node_slot method rejected: annotation is not an SDK model type". E7 xanh vì đủ bốn mảnh chuỗi — người vận hành lại bị chỉ sang `entry.py`, đúng phiên gỡ lỗi mà feature này sinh ra để giết | AC-7 thành quan hệ; E7 assert `problem.file` = file chứa `def`, `problem.line` = dòng của `def`, trên fixture đặt method ở `deploy.py` còn đường quét bắt đầu từ `entry.py` | **fixed:** AC-7 viết lại thành quan hệ, thêm mệnh đề "khác `entry.py`"; E7 đổi phép đo |
| P1 | evals | E10 tuyên đo "một cách diễn đạt duy nhất" nhưng so hai chuỗi bằng nhau — phép đó không phân biệt một-nguồn với hai-bản-sao-giống-nhau. Câu "copy-paste sẽ làm test đỏ" là điều phép đo đã mô tả KHÔNG làm được | Implementer để literal ở cả hai bên đọc. E10 xanh, E15 xanh, AC-10 đạt, mà rủi ro design §2 nêu vẫn còn nguyên | Mutation: đổi văn bản lý do trong `_ast_utils.py` thành token sentinel trên bản sao, đòi sentinel xuất hiện ở CẢ HAI đầu ra | **fixed:** E10 đổi từ equality sang mutation-sentinel |
| P1 | evals | E11 đo khác AC-11: AC nói chạy TRƯỚC và SAU thay đổi rồi so, còn E11 so một lần chạy với tập literal ghim từ máy hiện tại — phụ thuộc cây `plugins/` gitignore mà chính contract thừa nhận còn hai thư mục mồ côi | Máy nghiệm thu có số plugin khác → E11 đỏ vì môi trường chứ không vì code; cách chữa rẻ nhất là sửa tập ghim, phép đo mất răng vĩnh viễn | Chạy scanner ở merge base và ở HEAD trên CÙNG cây, so TẬP plugin id có problem; đỏ khi và chỉ khi HEAD có id vắng ở base | **fixed:** E11 đổi sang đo delta hai mốc code, bỏ literal ghim |
