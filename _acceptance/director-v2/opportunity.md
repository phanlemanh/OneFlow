---
schema_version: 1
slug: director-v2
feature: Director v2 — trí nhớ canvas, vá đồ thị, ước tính chi phí, option tự-chạy
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

Người dùng OneFlow gõ một prompt cho Director và nhận một đồ thị — nhưng muốn
sửa tiếp ("thêm bước lồng tiếng vào cái này") thì phải mô tả lại TỪ ĐẦU, và
thành công đồng nghĩa THAY SẠCH canvas đang có (director-prompt.tsx: "never
triggers execution; only stages a graph… replace-confirm dialog"). Trong khi đó
Flow Agent của Google (I/O 19/05/2026) có trí nhớ dự án + hội thoại nhiều lượt,
và có setting "Confirm before generating" (mặc định hỏi trước, opt-in tự chạy,
kèm ước tính credit trước khi tiêu) — người dùng Flow vẫn phàn nàn credit không
minh bạch. Bằng chứng thực địa: research 26/08/2026, xem
[research-google-flow-2026-08.md](research-google-flow-2026-08.md).

Bốn hạng mục, thứ tự phát triển 1 → 2 → 5 → 3:

1. Director đọc đồ thị đang có trên canvas (trí nhớ ngữ cảnh).
2. Director vá đồ thị thay vì thay sạch.
3. Ước tính chi phí hiển thị trên node trước khi bấm chạy (nền: task-metering đã ký).
4. Option tự-chạy: mặc định hỏi trước, opt-in auto, kèm cost estimate — giữ
   nguyên bất biến "Director không bao giờ tự thực thi" làm MẶC ĐỊNH.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Serialize đồ thị canvas hiện tại vào turns đủ nhỏ để không phá prompt cache byte-stable của vocabulary | Trí nhớ ngữ cảnh làm chi phí/latency tăng vọt, mục 1–2 chết | Đếm token một đồ thị 20 node serialize thử, so với budget 16k MAX_TOKENS | Chưa thử |
| 2 | Vá đồ thị biểu đạt được trong DSL v1 (thêm/sửa/xoá bước) mà không cần DSL v2 | Phải nâng version DSL — việc phình sang compiler + few-shot + schema | Viết tay 3 kế hoạch "vá" bằng DSL hiện tại, xem compile được không | Chưa thử |
| 3 | task-metering chiếu ngược được thành ước-tính-trước-khi-chạy (không chỉ đo-sau) | Mục 5 phải tự dựng bảng giá riêng — nặng hơn nhiều | Đọc schema task-metering, kiểm có đủ (slot, plugin) → chi phí không | Chưa thử |
| 4 | Người dùng thật sự muốn opt-in tự chạy (không chỉ là feature parity) | Mục 3 là việc thừa, giữ mặc định hỏi là đủ | Hỏi 3–5 người dùng OneFlow đang trả tiền API của mình | Chưa thử |

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
| Mẫu "Confirm before generating: Always/Never" + cost estimate của Flow Agent | support.google.com/flow/answer/17093911 | triết-lý/logic | có (mẫu hành vi, không chép UI) | |
| Research so sánh Flow vs Director | [research-google-flow-2026-08.md](research-google-flow-2026-08.md) | triết-lý/logic | có | |
| UI/giao diện Flow Agent (panel chat, asset grid) | blog.google flow-updates | ngôn-ngữ-thiết-kế/hình-thái | KHÔNG — chuẩn repo thắng | |

## Cổng 0

- **decision = …** Căn cứ: …
- **disposition = …** Căn cứ: …
- **Ngưỡng UAT chốt cùng lúc ký:** …

## Thước đo thành công → ứng viên criterion

- Tỷ lệ lượt Director là "sửa tiếp đồ thị đang có" (so với dựng mới từ trắng) — đo được sau khi mục 1–2 ship.
- Sai số ước tính chi phí so với chi phí thật per-task — đo bằng chính task-metering.
- Số lượt người dùng bật opt-in tự chạy rồi TẮT lại (tín hiệu hối hận).

## Out of scope từ khám phá

- Đua chất lượng model với Veo 3.1 / Nano Banana Pro — sân của Google, không đánh. (bác 26/08)
- Trợ lý sáng tạo nội dung (gợi thoại, cốt truyện) kiểu Flow Agent — Director là trình dịch ý định → quy trình, không phải writer. (bác 26/08)
- Tự chạy làm MẶC ĐỊNH — bất biến không-tự-chạy giữ nguyên, auto chỉ là opt-in. (bác 26/08)
- Timeline view — tách sang ô `timeline-view`, ngưỡng chết khác hẳn. (tách 26/08)
- App di động — chưa có tín hiệu người dùng cần.

## Cổng 0 — 04/09

- **decision = park.** Căn cứ: khối kế hoạch lát cắt chứng minh (docs/roadmap.md) đóng băng việc mở hạng mục mới; hồ sơ này không nằm trên đường ★. Mở lại khi gỡ băng, hoặc qua bảng Ngoại lệ với lý do có tên.
