# ADR-0009: TTS tiếng Việt dùng ElevenLabs `eleven_v3`; điều kiện MOS của G0 đóng bằng phán quyết vận hành

- **Ngày:** 2026-07-27 · **Trạng thái:** Chấp nhận (quyết định của founder)
- **Nguồn:** kinh nghiệm thực địa lặp lại nhiều lần của founder trên chính bài toán TTS tiếng Việt,
  phát biểu 27/07/2026. Không phải kết quả của một panel MOS mù chạy trong repo này.

## Bối cảnh

Lộ trình đặt điều kiện Gate G0: *"MOS TTS-vi đạt ngưỡng chấp nhận"*, và
[`_acceptance/measure-harness/`](../../_acceptance/measure-harness/) đã ship công cụ chấm mù
(`scripts/measure/mos.ts`) để trả lời câu đó bằng số.

Công cụ ấy giải quyết phần **dễ làm sai** của một phép đo MOS: giấu nhãn hệ thống khỏi người
chấm, và báo cáo độ phân tán thay vì một trung bình trần trụi. Nó **không** sinh audio — dòng
đầu file ghi rõ việc sinh mẫu là bước của người vận hành.

Câu hỏi mà panel đó nhằm trả lời — *giọng/model nào đọc tiếng Việt, đặc biệt là số và giá, đủ
tốt để ship* — đã được founder trả lời bằng thử nghiệm lặp lại trước khi repo này tồn tại.

## Quyết định

- **TTS tiếng Việt chặng 1 dùng ElevenLabs, model `eleven_v3`.** Đây là lựa chọn mặc định cho
  plugin TTS ở Phase 1 mục 4 của [lộ trình](../roadmap.md).
- **Điều kiện MOS của G0 đóng bằng phán quyết vận hành, không bằng panel mù.** Lý do: panel sẽ
  tiêu credit và thời gian để tái lập một kết luận người ra quyết định đã có độ tin cao. Với đội
  một người, đo lại thứ đã biết là chi phí không mua thêm thông tin.
- **Công cụ `mos.ts` được giữ nguyên, không xoá.** Nó là hạ tầng cho lần cần đo thật: thêm nhà
  cung cấp mới, đổi model, hoặc khi có tranh chấp về chất lượng giọng.

## Hệ quả

- G0 còn lại **ba** điều kiện cần dữ liệu mới: WER thực địa, COGS, và chốt ngách. Xem
  [STATUS.md](../../STATUS.md).
- Đánh đổi được chấp nhận có ý thức: điều kiện MOS của G0 **không có số trong repo**. Nếu sau
  này chất lượng giọng bị nghi ngờ — khiếu nại người dùng, đổi model, thêm nhà cung cấp — thì
  phán quyết này không có bằng chứng để bảo vệ, và phải chạy panel thật. Đó là lúc `mos.ts`
  trả lại công đã bỏ ra.
- Nguyên tắc *"không xây gì trước khi đo"* của lộ trình vẫn giữ cho WER và COGS. Ngoại lệ ở
  đây hẹp và có phạm vi: **một** điều kiện, **một** quyết định, ghi lại tại chỗ.
- Ràng buộc kỹ thuật kéo theo: `eleven_v3` là model của ElevenLabs, nên plugin TTS chặng 1 là
  **API plugin** (không GPU), và chi phí TTS vào COGS dưới dạng giá API chứ không phải
  GPU-giây.
