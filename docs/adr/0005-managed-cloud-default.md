# ADR-0005: Managed cloud là mặc định; BYO-key là tier, không phải kiến trúc

- **Ngày:** 2026-07-27 · **Trạng thái:** Chấp nhận
- **Nguồn:** [Hội đồng 07/2026](../strategy/council-2026-07.md) — giám khảo GTM (rủi ro critical #1); phiên chất vấn nghịch lý hạ tầng

## Bối cảnh

Kiến trúc gốc mặc định người dùng tự deploy Modal worker + tự cầm API key. ICP đã chọn
(seller/nhà quảng cáo trực tiếp VN) phần lớn không có thẻ quốc tế, không biết Modal là gì —
người hưởng luận điểm "BYO key = minh bạch chi phí" không phải người bấm nút mua. Đồng thời
tuyệt đối hoá "không credit" là không giữ được khi OneFlow ôm chi phí GPU ở tier managed.

## Quyết định

- **Managed cloud là mặc định**: Modal workspace gộp + key phía server (shared deployment
  mode — flag gỡ cache-dir per-scope trong plugin-executor); người dùng cuối không thấy
  Modal/API key.
- **Ba tier về cơ chế** (bảng giá cụ thể ngoài phạm vi product plan): Seller (gói phẳng,
  sửa không giới hạn) · Growth (meter theo "lượt sinh mới", sửa vẫn miễn phí) · Agency/Pro
  (BYO key, self-host, team).
- Metering phân biệt **"lượt sinh mới" vs "lượt sửa"** ở tầng sản phẩm — đây là cơ chế,
  không phải chính sách giá.
- Thông điệp kinh tế thay thế: **"Sửa miễn phí — Sinh mới giá niêm yết — Không bị nhốt"**
  (bỏ tuyệt đối hoá "không credit").

## Hệ quả

- Self-host/BYO không biến mất — nó thành tier power-user và tài sản định vị (chống nhốt).
- COGS tier managed phụ thuộc [ADR-0001](0001-cache-before-cloud.md): cache là điều kiện
  chặn GA, không phải tối ưu về sau.
- Cloud multi-user kéo theo Postgres + org/membership (Phase 2 lộ trình).
