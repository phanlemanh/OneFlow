---
slug: cache-l2-store
at: 2026-07-30T06:30:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

# Phản biện context sạch — cache-l2-store

Một subagent context-sạch, chỉ được đọc 4 artifact (design doc · contract · evals · decisions), **bị cấm đọc code repo**. Cap 5 finding. Controller kiểm chứng lại từng cái trước khi định đoạt — hai finding phải điều chỉnh vì giả định về code của critic sai một phần, và điều đó chỉ phát hiện được vì controller *được* đọc code trong khi critic thì không.

## Bốn cross-check bắt buộc

| Cross-check | Kết quả |
|---|---|
| AC nào không có eval đo? | Không. 14 AC ↔ 15 eval lúc quét (nay 16 ↔ 18) |
| GWT nào không đo được như đang viết? | **Có** — AC-1 để hở chữ "chuẩn hoá" mà nó lại là tiêu chí DoD → finding 2 |
| Trục Coverage nào không có AC? | **Có hai** — trục A giá trị "`plugin_rev` thiếu" (AC-10 chỉ phủ *dirty*) và trục D giá trị "batch rỗng" → finding 3 |
| Criterion nào đi qua backend mà thiếu tag `(cross-layer)` / chỉ có eval lớp UI? | Không sai tag. Nhưng **thiếu hẳn** một tiêu chí xuyên lớp: độ bền của `data_dir` → finding 4 |

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| **P0** | contract | Không có AC nào cho **độ nhạy với input** — tức chính ca partial re-render mà spec cha lấy làm tên | `node_cache.py` dựng fingerprint từ `params` mức NODE thay vì `call_params` per-call, làm rơi trường nghiệp vụ. Người dùng sửa `text` một node `combine-text` rồi chạy lại: khoá không đổi → phục vụ output CŨ, âm thầm, 0 lời gọi. AC-1/AC-6/AC-13/AC-11 đều vẫn xanh — AC-11 *gieo sẵn* entry chứ không dẫn xuất từ input khác nhau | AC mới: ≥3 node đã trúng, đổi đúng một param → invoker gọi đúng 1 lần cho node đó + hạ nguồn, các node khác 0; cộng nửa "hai lời gọi trong cùng batch khác một param → khoá khác" | **fixed** — thành **AC-15** + eval **E16**, kèm nguyên văn kịch bản fail vào rationale |
| P1 | contract | AC-1 để hở "sau khi chuẩn hoá"; không tiêu chí nào khẳng định bytes giải ra là bytes ĐÚNG | Verifier strip mọi handle asset (chúng khác nhau hợp lệ) rồi chỉ so bộ xương JSON. Implementation cắt sai shard prefix trả về blob KHÁC nhưng hợp lệ → E1 xanh, E2 xanh, E12 xanh, một video sai ship ra dưới danh nghĩa cache hit | AC-1 phải định nghĩa phép chuẩn hoá: chỉ handle đục của store được chuẩn hoá; mọi asset phải giải qua store của lần chạy tương ứng và so byte-for-byte | **fixed** — AC-1 viết lại, và câu định nghĩa được nhân bản vào `expected` của E1 |
| P1 | contract | `plugin_rev` **vắng** (không `.git`) không có AC; và không artifact nào ghi giá trị thật cho một plugin cài bình thường | (a) production cài plugin không có `.git` → mọi eval xanh (fixture `git init`) mà tính năng cache **không gì cả**, DoD 100% chỉ đúng trên bench. (b) implementation thay `None` bằng placeholder để "có cái mà cache" → hai phiên bản plugin dùng chung khoá | AC: thư mục plugin không phải checkout gì cả → không đọc không ghi, cả hai chiều. Và ghi vào Notes giá trị thật, như một fact đã kiểm | **fixed, kịch bản (a) BỊ BÁC** — controller đọc code: cả hai đường cài đều tạo `.git` thật (installer trong app dùng `isomorphic-git`; engine dùng `git clone --depth 1`). Ghi thành fact đã kiểm trong Notes, không phải rủi ro. Nửa (b) → thành **ca (b) của AC-10** |
| P1 | contract | Không tiêu chí xuyên lớp nào bảo host cấp một `data_dir` **bền** giữa các run; mọi eval tự kiểm soát `data_dir` | `data_dir` biến thiên theo run → `node-cache/` là cây rỗng mới ở mọi task; 15/15 eval xanh, bằng chứng Cổng 2 nói DoD đã chứng minh, desktop trúng 0% vĩnh viễn | AC `(cross-layer)`: hai task run liên tiếp cùng scope → `data_dir` byte-identical và dẫn xuất từ `scopedDataDirFor()`; ghép một eval TS với eval backend-effect | **fixed, kịch bản đã sửa** — controller đọc code: `dataDir()` là `TONGFLOW_DATA_DIR` hoặc `path.resolve(process.cwd(), "data")`, **không** phải per-task. Nhưng mặc định **neo vào `process.cwd()`** mới là hiểm thật (khởi động từ cwd khác = cache rỗng). Thành **AC-16** + **E17** (TS) + **E18** (backend-effect), rationale ghi hiểm đúng |
| P2 | design + contract | Atomicity chỉ đặc tả cho `result.json`; blob tồn-tại-nhưng-cụt nằm ngoài AC-4 | Run bị SIGKILL giữa lúc ghi blob để lại file cụt ở đúng tên sha. Run sau trúng, `put` bytes cụt, slot ffmpeg hạ nguồn sinh output hỏng — rồi output hỏng đó lại được cache. AC-4 xanh (blob tồn tại, `result.json` parse được), AC-5 xanh | AC-4 thêm ca (c): blob có mà bytes không băm ra tên nó → miss + ghi lại; design ghi blob cũng temp + `os.replace` | **fixed, thước đo đã đổi** — controller chọn **so KÍCH THƯỚC (O(1))** thay vì băm lại: băm lại một video 200MB trên MỖI lần trúng là đúng thứ cache sinh ra để tránh. Design §4 nay đòi atomic cho cả blob; AC-4 có ca (c); E4 `expected` nói ba ca kiểm riêng |

## Ghi chú về giá trị của bước này

Finding P0 là thứ đáng nhất: nó chỉ ra rằng bộ artifact đã **quên đúng cái tiêu chí mang tên của spec cha** (`engine-cache-partial-rerender`), và bốn eval khác đều xanh trong kịch bản đó. Không bước phản biện nào thì Cổng 1 được duyệt với niềm tin DoD đã phủ.

Đồng thời hai finding P1 cho thấy giới hạn của việc cấm critic đọc code: nó phải *giả định* về `read_plugin_rev` và `dataDir()`, và cả hai giả định đều lệch. Cách xử đúng không phải nới luật cho critic đọc code — mà là controller kiểm chứng từng finding trước khi định đoạt, rồi ghi cả phần bị bác vào đây. Một finding bị bác vẫn để lại vết.

One-pass: sửa artifact xong **không** re-probe (phần code còn 3 round S4 phía sau).
