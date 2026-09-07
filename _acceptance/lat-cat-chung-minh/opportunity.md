---
schema_version: 1
slug: lat-cat-chung-minh
feature: Lát cắt chứng minh — kế hoạch hợp nhất, luật đóng băng và guard
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-09-04T00:00:00Z
prototype:
  base_commit:
  disposition: archive
---

## Vấn đề & ai gặp

Owner (04/09): bốn nguồn kế hoạch (roadmap, STATUS.md, hồ sơ, nhánh) kể bốn chuyện; STATUS.md
đề ngày 17/08 ghi 17 hồ sơ trong khi 36 đã ký; hơn một chục hồ sơ/nợ được đặt tên rồi không ai
mở; 7 nhánh treo; một ADR chấp nhận 26/08 chưa về main. Trong 15 hồ sơ ký từ 27/08, 7 là hạ
tầng quy trình. Cỗ máy đã có, chưa có tính năng nào người dùng dùng được. Bằng chứng: phiên
điều tra 04/09, §1 của thiết kế `docs/superpowers/specs/2026-09-04-lat-cat-chung-minh-design.md`.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Một khối máy-đọc duy nhất + guard trong CI đủ để ba tài liệu ngừng trôi | STATUS/roadmap lại lệch trong 2 tuần | check-plan-docs.sh + tỉ lệ in mỗi lần CI | Chưa thử |
| 2 | Đóng băng có răng không làm nghẹt sửa lỗi thật | ngoại lệ mất-dữ-liệu/bảo-mật không mở được | case ngoai-le-tran chiều xanh (lý do hợp lệ) | Chưa thử |
| 3 | Băng tan được khi đủ ★ | guard thành khoá vĩnh viễn | case go-bang | Chưa thử |

## Ngưỡng chết / ngưỡng UAT

Không đo được — việc nội bộ của bộ công cụ, không có người dùng cuối; giá trị của lát cắt đo tại Cổng Giá trị của cơ hội skill-1-footage-kho-clip, không phải qua hồ sơ này.

## Cổng 0

- **decision = build.** Căn cứ: quyết định owner 04/09 (§11 thiết kế); hạng mục mới cuối cùng được nhận trước băng.
- **disposition = archive.** Không có prototype — hồ sơ hạ tầng quy trình.
- **Ngưỡng UAT chốt cùng lúc ký:** Không đo được (dòng trên).

## Out of scope từ khám phá

- Hạ cánh D0, b01, B4–B10 — mỗi cái một hồ sơ riêng theo khối kế hoạch.
- Sửa `scripts/pre-merge-check.sh` (đường vendor); chặn nhánh hay plan nháp.
- Mục "Làn D" và số ADR Director trong roadmap — việc của B3.
