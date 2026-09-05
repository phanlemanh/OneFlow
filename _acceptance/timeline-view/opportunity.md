---
schema_version: 1
slug: timeline-view
feature: Timeline như một cách nhìn trên đồ thị — sắp clip, trim, xuất phim dài
owner: Manh
stage: decided
decision: park
decided_by: Phan Le Manh
decided_at: 2026-09-04
prototype:
  base_commit:
  disposition:
---

## Vấn đề & ai gặp

Người dùng OneFlow muốn ghép nhiều clip đã sinh thành một phim có trình tự phải
tự nối tay chuỗi node `concat-videos` / `merge-video-audio` trên canvas — không
có chỗ nào nhìn thấy TRÌNH TỰ THỜI GIAN, kéo-sắp, trim đầu đuôi, preview cả
chuỗi. Đối thủ đã có: Scenebuilder của Google Flow là timeline thực thụ (kéo
clip, trim handle, extend, xuất ~60s); LTX Director chứng minh hướng đúng cho
sản phẩm node-graph — timeline mã nguồn mở chạy như custom node TRONG ComfyUI,
lưu JSON, tức timeline là một VIEW trên đồ thị chứ không phải editor riêng.
Bằng chứng thực địa: research 26/08/2026, xem
[../director-v2/research-google-flow-2026-08.md](../director-v2/research-google-flow-2026-08.md).

Nguyên liệu đã có trong ABI: `concat-videos`, `split-video`, `merge-video-audio`,
`arrange-group`, `video-edit` — việc này là MẶT UI sinh/đọc lại chuỗi node,
không thêm slot, không đụng `sdk/**` (giữ ngoài đường T3).

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Một chuỗi timeline (sắp thứ tự + trim) ánh xạ 1-1 được sang chuỗi node concat/split hiện có, hai chiều | Timeline thành editor riêng có state riêng — drift với canvas, đúng cái LTX Director tránh | Vẽ tay ánh xạ cho 1 phim 4 clip + 1 lần trim, kiểm bằng exporter JSON | Chưa thử |
| 2 | Trim biểu đạt được bằng `split-video` + tham số hiện có (không cần field ABI mới) | Phải sửa ABI → gen:abi → SDK → T3 cả chuỗi | Đọc schema `split-video`/`video-edit` trong tongflow.abi.json | Chưa thử |
| 3 | Người dùng cần XEM trình tự hơn là cần editor chuyên nghiệp (DaVinci/CapCut đã làm phần sau) | Ngưỡng "đủ dùng" đặt sai, xây mãi không tới | Hỏi người dùng đang ghép clip tay: thiếu gì nhất — preview, trim, hay transition | Chưa thử |
| 4 | Chỉ đáng làm SAU khi director-v2 ship (timeline không có agent phía sau = editor thường) | Làm sớm thì cạnh tranh trực diện với editor truyền thống — thua | Quyết định trình tự tại Cổng Đáng, không cần thử | Chưa thử |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: …
- Kết quả nào là SỐNG: …
- Kết quả nào là CHẾT: …
- Timebox: …

## Kết quả prototype

(chưa dựng — điền sau khi có prototype trong timebox)

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Kiến trúc timeline-là-view-trên-đồ-thị, lưu JSON | LTX Director (ai.miraheze.org/wiki/LTX_Director) | triết-lý/logic | có | |
| Research so sánh Flow vs Director | [../director-v2/research-google-flow-2026-08.md](../director-v2/research-google-flow-2026-08.md) | triết-lý/logic | có | |
| Giao diện Scenebuilder (trim handle, layout timeline) | support.google.com/flow/answer/16935718 | ngôn-ngữ-thiết-kế/hình-thái | KHÔNG — chuẩn repo thắng | |

## Cổng 0

- **decision = …** Căn cứ: …
- **disposition = …** Căn cứ: …
- **Ngưỡng UAT chốt cùng lúc ký:** …

## Thước đo thành công → ứng viên criterion

- Số phim ≥3 clip được ghép qua timeline so với ghép node tay — sau ship.
- Tỷ lệ chuỗi timeline xuất ra chạy được qua backend runner không sửa tay.

## Out of scope từ khám phá

- Editor video chuyên nghiệp (multi-track, keyframe, color grade) — DaVinci/CapCut đã có, không đánh. (bác 26/08)
- Slot ABI mới hoặc field mới cho trim/transition — nếu giả định 2 sai thì QUAY LẠI Cổng Đáng, không lặng lẽ mở rộng. (bác 26/08)
- Timeline cho audio/nhạc (kiểu Flow Music) — chưa có tín hiệu.

## Cổng 0 — 04/09

- **decision = park.** Căn cứ: khối kế hoạch lát cắt chứng minh (docs/roadmap.md) đóng băng việc mở hạng mục mới; hồ sơ này không nằm trên đường ★. Mở lại khi gỡ băng, hoặc qua bảng Ngoại lệ với lý do có tên.
