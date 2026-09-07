# Tầm nhìn OneFlow

> **Nhịp cập nhật:** review mỗi quý, hoặc khi (a) benchmark OF-CB-1 có verdict, (b) đối thủ có
> nước đi cấu trúc lớn. Bản này: **07/2026**. Trạng thái thực thi xem [STATUS.md](../../STATUS.md);
> lộ trình xem [docs/roadmap.md](../roadmap.md); quyết định bất biến xem [docs/adr/](../adr/).

## Một câu

**OneFlow là studio quảng cáo AI có bộ nhớ: sản phẩm, nhân vật, giọng nói của khách hàng sống
trong một vũ trụ dữ liệu mở — sửa một chỗ không phải trả tiền làm lại cả bài, chữ và giá tuyệt
đối chính xác, và toàn bộ vũ trụ đó thuộc về khách hàng, không phải về nền tảng.**

## Định vị — bổ sung 04/09

Ba tầng, ba tốc độ thay đổi khác nhau:

| Tầng | Nội dung | Thay đổi được? |
|---|---|---|
| **Định vị** | OneFlow là **công cụ nền tảng đa mục đích cho sáng tạo**; thế mạnh hướng đến: *studio quảng cáo AI có bộ nhớ*, tối ưu cho mọi nhu cầu sáng tạo, làm thiết kế đơn giản, **tiếp cận được với bất kỳ ai** | Bất biến — đổi bằng ADR mới |
| **Trụ cột** | ① footage thật trước generative · ② dữ liệu **và thực thi** thuộc về người dùng · ③ sửa rẻ gần bằng không · ④ chữ và giá vẽ tất định · ⑤ tiếp cận được với bất kỳ ai (một nút, tự cài, tự nhập key) · ⑥ bộ nhớ — uỷ quyền media-library | Ít đổi |
| **Lát cắt** | Một tính năng end-to-end chứng minh các trụ cột trên máy người dùng. Lát cắt đầu tiên: Skill #1 "Footage → kho clip" | Thay đổi được |

Tính năng là **bằng chứng** của nền tảng, không phải định nghĩa của nó: thay lát cắt thì kế hoạch
không đổi hình. Kế hoạch lát cắt chứng minh và luật đóng băng: [roadmap.md](../roadmap.md).

## Năm niềm tin nền

1. **Model đang commoditize** — cả ngành bán lại cùng một rổ frontier model; giá trị bền dồn về
   tầng workflow và tầng dữ liệu, không nằm ở chất lượng sinh thô.
2. **Sửa phải rẻ gần bằng không.** Vết thương lớn nhất của ngành (bằng chứng: Trustpilot của cả
   ba đối thủ đầu ngành) là mọi thay đổi đều bị tính tiền render lại từ đầu. Kiến trúc graph +
   cache content-addressed biến "sửa" thành thao tác biên.
3. **Chữ và giá không được phép sinh ra** — chúng phải được vẽ deterministic. Với quảng cáo,
   sai một con số là chết chiến dịch; với tiếng Việt có dấu, image model là điểm mù của mọi
   đối thủ phương Tây.
4. **Footage thật trước generative.** Livestream, tour quay điện thoại — nguyên liệu thật cho
   fidelity miễn phí, né cuộc đua avatar realism mà kẻ ít vốn không thể thắng.
5. **Dữ liệu thuộc về người dùng.** Đối lập với mô hình nhốt asset (Soul ID, avatar per-platform):
   Universe của khách export được, self-host được. Switching cost đến từ giá trị tích luỹ
   (provenance + hiệu quả theo phiên bản thực thể), không đến từ nhà tù.

## Hai chặng, một schema

**Chặng 1 — Seller / nhà quảng cáo trực tiếp (đang thực thi).** Ma trận creative từ link sản
phẩm hoặc footage thật; overlay giá/phụ đề deterministic; giọng Việt; vòng lặp hiệu quả.
Universe KG giới hạn **3 thực thể** (Product/Brand/Voice — ngách BĐS thì Project/Listing/Broker;
đổi ngách chỉ đổi bộ thực thể gieo, không đổi kiến trúc — quyết định ngách chốt ở Gate G0).

**Chặng 2 — TVC / short-drama quảng cáo (gate bằng số, không gate bằng niềm tin).** Nhân vật
và thế giới nhất quán xuyên shot/tập nhờ Universe KG (Character/Location + ràng buộc continuity).
Chỉ mở thiết kế khi benchmark **OF-CB-1** cho verdict GO. Đường ít rủi ro nhất đã xác định:
arm E — thay thế/điều khiển nhân vật trên footage thật (wan-animate), không phụ thuộc trần
model sinh.

## Kiến trúc ý định

> "Graph là moat, skill là sản phẩm, agent là giao diện."

| Tầng | Vai trò |
|---|---|
| **Universe KG** (bộ nhớ) | Thực thể bền vững + anchor assets + quan hệ + provenance. Tài sản compound của khách. |
| **Skill + Agent** (sản phẩm) | Skill = ExecutableWorkflow template + orchestrator; agent hẹp chọn skill, điền tham số, chạy vòng judge. Người dùng thấy nút và kết quả — graph chỉ lộ khi bấm "xem/sửa kế hoạch". |
| **Workflow graph** (cỗ máy) | Thực thi typed (ABI compile-time), cache content-addressed, re-render từng phần. |

Vòng khép kín: agent đọc Universe → compile skill → engine chạy → judge chấm so anchor →
kết quả + provenance ghi ngược lại → (về sau) dữ liệu hiệu quả làm agent khôn dần theo campaign.

## Những điều không làm

- **Không đấu avatar realism** (Arcads có thư viện actor licensed + mocap — cuộc đua vốn).
- **Không đấu camera-control** (Higgsfield). **Không đấu "URL→ad toàn cầu"** trên sân Topview.
- **Không general agent** — agent hẹp trên ~6 skill có contract chặt.
- **Không bán credit theo render.** Kinh tế sản phẩm: sửa miễn phí, sinh mới giá niêm yết.
- **Không xây compliance luật VN vào pipeline** khi nghị định chưa rõ ([ADR-0006](../adr/0006-defer-vn-compliance.md)) —
  chỉ giữ thế sẵn sàng bằng provenance + tham số overlay.

## Tài liệu liên quan

- Định vị cạnh tranh (đầy đủ, có nguồn): artifact `oneflow-positioning` —
  https://claude.ai/code/artifact/54ef24b6-1574-4732-ba0f-345e92a43f5c
- Bằng chứng thẩm định: [council-2026-07.md](council-2026-07.md) (biên bản hội đồng 9 phiên)
- Lộ trình 24 tuần: [docs/roadmap.md](../roadmap.md)
- Quyết định bất biến: [docs/adr/](../adr/)
