# Hình tại điểm quyết định — skill-system-v1 (Cổng 1, T3)

Kê từ artifact cuối S1: 10 dòng sổ chờ seal · 1 chỗ lệch spec gốc (ADR-0002 «UI mặc định là nút skill», v1 vẫn vào từ canvas) · 1 dòng `[GIẢ ĐỊNH]` trong Coverage (trùng điểm lệch spec) · 0 finding gap-probe `human-gate1`. Ngưỡng N5: từ ba bước nối tiếp, hoặc từ hai nhánh rẽ.

| Điểm | Đếm | Hình |
|---|---|---|
| d-…-1 lượt skill là một hàng tasks, instantiate lại lúc chạy (loại: hàng workflows mỗi lượt) | 5 bước nối tiếp + 1 nhánh rẽ (version lệch) | `duong-chay-mot-luot.html` |
| d-…-2 ghi tham số vào hai chỗ + đo tương đương bằng exporter thật (loại: exporter phía server) | 2 nhánh rẽ | `instantiate-hai-cho.html` |
| d-…-10 tiền đề dry-run 8/10 — TD-10 thiếu uv | 3 nhánh rẽ (cài uv · không làm gì = kẹt BLOCKED · bỏ khoá sdk_pytest khỏi suite của vòng) | `tien-de-uv.html` |
| d-…-3 không ẩn canvas làm màn mặc định (= dòng [GIẢ ĐỊNH] + lệch ADR-0002) | dưới ngưỡng: 1 bước, không rẽ | — |
| d-…-4 phép thử cache-key D3 chuyển sang B8 | dưới ngưỡng: 1 bước | — |
| d-…-5 không có hook estimate | dưới ngưỡng: 1 bước | — |
| d-…-6 chạy thật đầu-cuối đo trên tach-tieng-video | dưới ngưỡng: 1 bước | — |
| d-…-7 design gate khai not-run | dưới ngưỡng: 1 bước | — |
| d-…-8 brainstorm không hỏi người | dưới ngưỡng: 1 bước | — |
| d-…-9 chạy design-pass | dưới ngưỡng: 1 bước | — |

## Đề bài

### duong-chay-mot-luot
- Loại: sequence (hoặc flowchart dọc) · AC-5, AC-6, AC-7, AC-10
- Nút: Ngăn skill → POST /api/skills/<id>/run (kiểm tham số · instantiate để bắt thiếu plugin · giới hạn 3 lượt) → hàng tasks feature=skill, prompt = skillId + skillVersion + params → GET /api/task/wait (SSE) → runner: instantiate lại từ prompt → engine delegate có sẵn (engine KHÔNG đổi) → tasks.result / tasks.error.failures → GET /api/skills/runs/<taskId> (steps + outputs)
- Nhánh rẽ ở runner: skillVersion ≠ version đang đăng ký → task failed mã SKILL_VERSION_CHANGED, không gọi engine
- Nhãn phụ: sự kiện NODE_STARTED/COMPLETED/FAILED chảy về ngăn trong lúc chạy
- Chú thích phương án đã loại: «mỗi lượt một hàng workflows + cột provenance» (mờ, gạch)

### instantiate-hai-cho
- Loại: flowchart ngang · AC-1, AC-3
- Nút: template.json (originalFlow + executable, cả hai sinh bằng exporter thật) + tham số → instantiate (hàm thuần) → ghi CÙNG giá trị vào executable (staticData · binding config) VÀ originalFlow (node.data)
- Nhánh đo: exportWorkflow(instance.originalFlow) == instance.executable → xanh; lệch → đỏ ghim nodeId + field
- Nhánh đã loại: gọi exporter phía server → registry node toàn cục (Map theo nodeId) → hai lượt đồng thời ghi đè nhau (mờ, gạch)
- Ý chính: «xem/sửa kế hoạch» mở đúng đồ thị engine đã chạy

### tien-de-uv
- Loại: cây quyết định nhỏ · không AC (tiền đề TD-10)
- Gốc: dry-run 16/09 — không có uv trên máy
- Nhánh A (máy khuyên): người chạy `brew install uv` trước S4 → ô suite sdk_pytest chạy thật mỗi lượt → S4 đi được tới Cổng 2
- Nhánh B: không cài, không đổi gì → ô suite thoát 127 → workflow S4 xếp 127 vào hạ tầng hỏng → MỌI lượt BLOCKED → vòng kẹt trước Cổng 2 (nhánh cụt, tô đỏ)
- Nhánh C: không cài, người chỉ định bỏ khoá sdk_pytest khỏi suite của vòng này → S4 chạy được; mất một lưới SDK (vòng không chạm sdk/, AC-12) → một nhát «thước:» trong sổ
