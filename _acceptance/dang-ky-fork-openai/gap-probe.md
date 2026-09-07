---
slug: dang-ky-fork-openai
at: 2026-09-01T09:20:00Z
verdict: findings
p0: 1
p1: 4
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract AC-7 ↔ evals E7 | AC-7 hứa `pre-merge-check … 0 violation` nhưng E7 cố ý đo `check-resign-wave`. Vế người duyệt đọc thấy không ô nào đo. | Cổng 1 ký vì tin chốt chặn độc lập sẽ chứng minh; Cổng 2 chỉ có resign-wave, còn pre-merge trên nhánh này vẫn đỏ theo thiết kế. Bản ghi tuyên bố sai điều máy đã chứng minh. | Mọi mệnh đề Then của AC phải xuất hiện trong `expected` của một eval. | **fixed:** AC-7 cũ viết lại thành AC-8, phát biểu ĐÚNG câu E8 trả lời được. Vế pre-merge chuyển sang Notes làm việc-của-người ở Cổng 2. |
| P1 | contract AC-3 ↔ evals E3 | AC-3 đòi `CLAUDE.md` nêu con số **4** cho nửa origin, nhưng thước có sẵn chỉ đòi CỤM TỪ `origin entr(y|ies)` xuất hiện — con số và tập id không được khẳng định. | Vá `CLAUDE.md` đổi 36→35, quên vế "exactly three origin entries" liệt kê ba id cũ. E3 xanh. Phiên agent sau đọc thấy ba id, kết luận manifest thừa một mục rồi "sửa" ngược. | Rút CẢ hai con số ra khỏi hàng rào, hoặc tách mệnh đề origin sang ô riêng. | **fixed:** AC-3 thu hẹp đúng bằng điều thước có sẵn enforce; mệnh đề tập-id-origin tách thành **AC-6 mới** với thước riêng, tránh chạm guard `civ_*` của hồ sơ khác (chạm nó là mở lại staleness của hồ sơ đó). |
| P1 | contract AC-6 ↔ evals E6 | Given của AC-6 kê `public/plugins/` nhưng `expected` của E6 tự giới hạn bốn file văn bản. Nơi thứ năm không nằm trong phép đo. | Icon mới là "bản sao icon cũ" nên `tongflow-api-openai.svg` còn nguyên. E6 xanh vì không mở thư mục đó; người duyệt kết luận id cũ tuyệt tích trong khi một asset SỐNG vẫn trỏ nó. | Tập file eval thực sự mở phải bằng tập nơi AC liệt kê. | **fixed:** ĐO XÁC NHẬN đúng — `tongflow-api-openai.svg` còn trên đĩa (base có sẵn BA orphan khác; con số 4 tôi viết ban đầu là sai, sửa ở commit 0c80f8d). Tách thành **AC-7 mới**: orphan không được TĂNG so với `origin/main` (luật delta, không phạt 4 lỗi có sẵn). Và xoá orphan của chính nhánh này. |
| P1 | evals E6 | Khẳng định âm tính không có đối chứng dương; regex dòng README rút được **0 id** từ `CLAUDE.md` nên nhánh đó xanh vĩnh viễn. [normalize-text-vi#F2] [chong-doc-sai-em-ru#F1] | `CLAUDE.md` viết id trong nháy ngược, không theo `- [<id>](url)`. 0 phần tử rút được → vòng lặp 0 lần → exit 0. Một id cũ sót trong file mọi agent đọc đầu phiên không bị bắt. | Thêm ca dương chèn id lạ vào bản sao `CLAUDE.md`; `expected` ghim SỐ id rút được trên mỗi file. | **fixed:** ĐO XÁC NHẬN — `CLAUDE.md` chỉ có id dạng nháy ngược. AC-6 mới dùng bộ rút RIÊNG cho `CLAUDE.md` và `expected` ghim literal count; teeth thêm ca `claude-stale-id`. |
| P1 | contract AC-5 ↔ evals E5 | Vế org có HAI luật (chuỗi trần → org mặc định; mục object → org của `origin`) nhưng chỉ một phép phá. Nửa không được phá chính là nửa feature này sinh ra để phục vụ. [normalize-text-vi#F2] | Hàng rào cài nhánh object thành no-op; ca phá chọn mục chuỗi trần nên vẫn đỏ. Tất cả xanh trong khi dòng README của `oneflow-api-openai` có thể trỏ `tong-io` — đúng org mà cả hồ sơ này tồn tại để rời bỏ. | Ma trận có tên ô: `org-sai-chuoi-tran` VÀ `org-sai-muc-origin`. | **fixed:** AC-5 nâng lên ma trận **bảy ca có tên** (1 đối chứng dương + 6 phép phá), gồm cả hai nửa của luật org. |
