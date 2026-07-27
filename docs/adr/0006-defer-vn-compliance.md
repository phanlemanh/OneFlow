# ADR-0006: Hoãn compliance luật VN — chuẩn bị, không xây

- **Ngày:** 2026-07-27 · **Trạng thái:** Chấp nhận (quyết định của founder, 07/2026)
- **Nguồn:** phiên soát điểm mù của [Hội đồng 07/2026](../strategy/council-2026-07.md) nêu rủi ro; founder quyết định phạm vi

## Bối cảnh

Từ 01/01/2026 các luật liên quan đã hiệu lực (Luật sửa đổi Luật Quảng cáo — siết TPCN/mỹ
phẩm và trách nhiệm người chuyển tải; Luật Công nghiệp Công nghệ số — nội dung AI phải mang
dấu nhận dạng). Tuy nhiên nghị định hướng dẫn chưa rõ ràng và đang trong quá trình lấy ý
kiến — xây tính năng compliance bây giờ là xây trên cát.

## Quyết định

- **Không** đưa tính năng compliance (gắn nhãn AI tự động, ràng buộc ngành hàng, KYC) vào
  pipeline hay bề mặt sản phẩm ở giai đoạn này.
- **Giữ thế sẵn sàng bằng thiết kế** (chi phí ~0): provenance đang xây vốn đủ làm nền truy
  vết nội dung AI; overlay engine phải render được nhãn "AI" bằng **một tham số** khi cần
  (bài kiểm tra thiết kế ở Phase 3 lộ trình).
- **Rà lại mỗi quý** theo tiến độ ban hành nghị định. Khi có văn bản hướng dẫn cụ thể →
  viết ADR mới supersede file này.

## Hệ quả

- Tốc độ phát triển không bị chặn bởi biến định chế chưa rõ.
- Khi luật rõ, chi phí bật compliance là thấp (bật tham số + policy), không phải làm lại
  kiến trúc — đây chính là "lợi thế khi luật chính thức áp dụng" được chuẩn bị trước.
- Rủi ro chấp nhận: nếu nghị định ra sớm và gắt hơn dự kiến, có một khoảng trễ tuân thủ.
