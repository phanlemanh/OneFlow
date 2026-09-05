---
schema_version: 1
slug: skill-1-footage-kho-clip
feature: Skill #1 Footage → kho clip 9:16 — lát cắt chứng minh đầu tiên của nền tảng
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-09-05
prototype:
  base_commit:
  disposition:
---

## Vấn đề & ai gặp

Người bán hàng hoặc môi giới có livestream / tour quay điện thoại nhưng không có clip 9:16 có
phụ đề và khung giá đúng để đăng. Hôm nay OneFlow có đủ mắt xích (split, transcribe, overlay)
nhưng phải tự nối 6–7 node và cần tài khoản Modal cho overlay. Bằng chứng: phiên điều tra
04/09 (§1 thiết kế lat-cat-chung-minh), feature-index 17/08.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Người dùng đại diện tự nhập được key (ADR-0011) | managed quay lại làm mặc định (Phase 2) | phiên UAT, đếm ≥ 2/3 | Chưa thử |
| 2 | WER thực địa ≤ 10% qua đường API hiện có | wedge chuyển sang phụ đề có bước sửa tay | B9 trên corpus A3 | Chưa thử |
| 3 | Đổi giá chỉ chạy lại overlay (cache tầng B giữ transcribe) | lời hứa "sửa rẻ" không đứng | telemetry cache_calls_* ở G1 | Chưa thử |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: một người dùng đại diện, không phải tác giả, trên máy trắng, có đưa footage vào và nhận về kho clip 9:16 đúng phụ đề đúng giá, và đổi giá mà chỉ overlay chạy lại không?
- Kết quả nào là SỐNG: U1 cài + tự nhập key ≤ 30 phút, ≥ 2/3 người tự làm được · U2 một nút · U3 WER ≤ 10% và lỗi token chữ số trên câu có giá = 0 · U4 50 clip liên tiếp không lỗi dấu/giá · U5 đổi giá → chỉ overlay + merge chạy lại · U6 headless = canvas · U7 COGS ≤ $11/seller/tháng · U8 không cần Modal
- Kết quả nào là CHẾT: < 1/3 người tự nhập được key (đảo chiều ADR-0011) · WER > 15% (vùng chết hội đồng) · đổi giá làm transcribe chạy lại
- Timebox: UAT trước 11.11.2026 (T14); tái hoạch 09/10 theo §6.3 thiết kế lat-cat-chung-minh

## Cổng 0

- **decision = build.** Căn cứ: đây là lát cắt chứng minh đầu tiên của định vị ba tầng (vision.md 04/09); sáu mắt xích đã có trên máy dev, chỉ còn overlay chạy đám mây (B6); ba con số G0 chốt trước mọi phép đo — WER ≤ 10%, lỗi chữ số trên câu có giá = 0, COGS ≤ $11/seller/tháng. Ký ngày 05/09/2026 bởi Phan Le Manh, ủy quyền tường minh trong phiên («Ký A1 luôn đi»); máy gõ thay. Đây là A1 của khối kế hoạch.
- **disposition = archive.** Không có prototype trước hợp đồng.
- **Ngưỡng UAT chốt cùng lúc ký:** ba bullet trên sau khi gỡ [đề xuất].

## Out of scope từ khám phá

- TTS/lồng tiếng (1.4), ingest ngược về media-library (Should S3), Skill #2, judge.
- Bộ nhớ Director (D1–D4, park).
