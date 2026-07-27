# ADR-0003: `media-judge` là ranker cho tới khi FPR < 5%

- **Ngày:** 2026-07-27 · **Trạng thái:** Chấp nhận
- **Nguồn:** [Hội đồng 07/2026](../strategy/council-2026-07.md) — giám khảo AI engineering; phiên chất vấn trần consistency

## Bối cảnh

Vòng QA tự động ("sinh N → chấm → giao bản tốt nhất") định xây trên các slot describe hiện
có là sai hình dạng: `image-describe` nhận một ảnh và trả văn xuôi tự do — không biểu diễn
được phép so anchor-vs-candidate ("đúng SKU? giá đọc được?"), và parse văn xuôi làm điểm số
là brittle. FPR của VLM trên nhãn/logo/giá tiếng Việt chưa từng được đo. Judge làm gatekeeper
tự động khi chưa đo FPR sẽ hoặc giao hàng lỗi (false positive) hoặc regen vô hạn đốt GPU
(false negative).

## Quyết định

- Thêm slot ABI mới **`media-judge`** structured-output: nhận `anchors[]` + `candidate`,
  trả JSON điểm theo từng tiêu chí + evidence. Không parse văn xuôi.
- Gắn nhãn tay **≥ 200 mẫu ads thật** để đo FPR/FNR per-tiêu-chí (tận dụng nhãn MOS từ
  benchmark OF-CB-1).
- Judge tham gia skill ở vai **ranker** (xếp hạng, người chọn). Chỉ nâng lên **auto-gate**
  khi FPR < 5% trên từng tiêu chí.

## Hệ quả

- Chất lượng giao đến tay tăng bằng selection pressure ngay cả khi model sinh ngang đối thủ.
- Có một bộ dữ liệu gắn nhãn nội bộ — tài sản không đối thủ nào copy được bằng fork.
