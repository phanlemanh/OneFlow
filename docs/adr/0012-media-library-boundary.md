# ADR-0012: Media-library là nền kho + tri thức chung; OneFlow là khách qua hợp đồng, với tám bảo đảm ranh giới

- **Ngày:** 2026-08-19 · **Trạng thái:** Chấp nhận (quyết định của founder)
- **Nguồn:** chỉ đạo của Manh 19/08/2026, sau phân tích tích hợp OneFlow ↔ media-library
  (sơ đồ ranh giới: [oneflow-media-library-boundary.html](../assets/oneflow-media-library-boundary.html)).
- **Quan hệ:** cụ thể hoá cách hiện thực [ADR-0004](0004-universe-kg-three-entities.md)
  (KG chặng 1 — phần kho và đồ thị vật lý được uỷ quyền, giới hạn 3 thực thể giữ nguyên ở
  phía tiêu thụ); tương thích [ADR-0011](0011-local-first-execution.md) (library là dịch vụ
  BYO-URL/BYO-key, không phải phụ thuộc cứng); gánh hộ phần chuẩn bị compliance của
  [ADR-0006](0006-defer-vn-compliance.md) ở tầng kho (provenance + nhãn AI).

## Bối cảnh

1. **media-library đã tồn tại và đã chạy** — service headless độc lập (REST + MCP,
   multi-tenant, repo riêng), L0→L3a đã ship: search trả Media Card lọc cứng 8 luật, ingest
   3 bước, đồ thị thực thể, provenance 6 nấc + nhãn AI NĐ142, telemetry có chữ ký. Khách #1
   là OneHub (artifact-platform) qua strangler.
2. **Chiến lược của founder:** media-library là **lợi thế cạnh tranh chung** cho các sản phẩm
   của hệ (Artifact Platform, OneFlow); quy hoạch của nó **không dừng ở BĐS** — mở sang tài
   chính, bảo hiểm và các lĩnh vực khác; khi cần, có thể dựng instance phục vụ riêng OneFlow.
3. **Hai hệ bù nhau đúng chỗ ranh giới:** library tự cấm mình render video hoàn chỉnh;
   OneFlow là máy render. OneFlow Phase 1.6–1.7 cần kho footage + KG; library là đúng thứ đó,
   kèm luật đã trả giá 12 vòng đo.

Không có bảo đảm ranh giới thành văn, quan hệ này trôi về một trong hai kết cục tồi: OneFlow
nhúng library như thư viện (khoá chặt hai release train vào nhau), hoặc OneFlow xây kho/KG
riêng (nguồn sự thật thứ hai cho cùng một cây thực thể — loại lỗi cả hai repo đều có luật chống).

## Quyết định — tám bảo đảm ranh giới

1. **Quan hệ khách–dịch vụ, không phải thư viện nhúng.** OneFlow nói chuyện với media-library
   DUY NHẤT qua REST + API key theo scope (MCP cho ngả agent). Không import code của nhau,
   không đọc DB của nhau, không đụng storage trực tiếp — bytes chỉ đi qua URL ký. OneFlow
   đứng cùng địa vị khách như OneHub, không có đường ưu tiên ngầm.
2. **Không phụ thuộc cứng — local-first giữ nguyên.** OneFlow chạy đủ chức năng khi không
   cấu hình library. `MEDIA_LIBRARY_URL` / `MEDIA_LIBRARY_API_KEY` là hai entry trong kho
   khoá BYO ([ADR-0011](0011-local-first-execution.md)); thiếu thì node nạp-từ-kho báo thiếu
   cấu hình **gọi đúng tên**, mọi phần còn lại của studio không suy suyển — cùng triết lý
   "kho nghèo không chặn video" của chính library.
3. **Lĩnh vực là dữ liệu, không phải code.** Adapter phía OneFlow chỉ tiêu thụ hợp đồng
   generic: Media Card, search, ingest, telemetry, `contracts_version`. Từ vựng lĩnh vực
   (loại thực thể, nhãn provenance, vai beat) đi qua như **dữ liệu**. Library mở sang tài
   chính/bảo hiểm thì OneFlow thừa hưởng bằng 0 dòng code; **cấm hardcode ngữ vựng BĐS**
   vào bất kỳ file nào phía OneFlow.
4. **Không nguồn sự thật thứ hai.** OneFlow không xây kho asset có tri thức và không xây đồ
   thị thực thể riêng cho dữ liệu mà library quản. KG v0 (Phase 1.7) hiện thực bằng uỷ quyền:
   `tasks.entity_refs` trỏ `entity_id` của library; `FieldBinding kind:"entity"` resolve qua
   API. Giới hạn 3 loại thực thể của ADR-0004 giữ nguyên — nó thành **bộ lọc tiêu thụ** phía
   OneFlow, không phải schema phải xây.
5. **Chiều ghi ngược có chữ ký + provenance.** Mọi output OneFlow đưa vào kho đi qua ingest
   chuẩn với `provenance: generated` + nhãn AI, chữ ký system-actor `provider:oneflow`.
   Không có ghi vô danh (luật vàng #3 của library). Lượt dùng asset báo về telemetry.
6. **Topology là vận hành, không phải kiến trúc.** Shared tenant hay instance riêng cho
   OneFlow chỉ khác nhau ở cặp URL + key. Không dòng code nào phía OneFlow được giả định
   topology; quyết định dựng instance riêng là quyết định vận hành/chi phí, đổi lúc nào
   cũng được mà không chạm code.
7. **Ranh giới có phiên bản.** Adapter pin `contracts_version`; lệch major → từ chối gọi
   đúng tên, không đoán. Mọi thay đổi hợp đồng vượt ranh giới cần boundary spec ở CẢ hai
   repo trước khi code (tiền lệ: `onehub-boundary-two-way-sync` phía library).
8. **Render sống ở OneFlow.** Library giữ luật không-render của nó. Nếu GĐ2 của library cần
   render worker, OneFlow engine là ứng viên — qua đúng ranh giới này (API, workflow đã
   export sẵn), không phải bằng cách nhúng engine vào library.

## Rủi ro đã chấp nhận, và điều kiện thoát

- **Được:** kho + tri thức + compliance dùng chung cho nhiều sản phẩm, trả giá một lần ·
  OneFlow không nuôi hệ kho/KG riêng · ngách chọn ở G0 co giãn được (đổi lĩnh vực = đổi gói
  dữ liệu phía library, không đổi kiến trúc phía OneFlow) · hai release train độc lập.
- **Mất / rủi ro:** đường tới hạn của Skill #1–#2 phía OneFlow gắn thêm một dịch vụ ngoài
  (dù không cứng); tốc độ mở lĩnh vực mới của library trở thành ràng buộc lịch cho ngách
  tương ứng của OneFlow; hai repo cùng một người vận hành hôm nay — ranh giới phải sống bằng
  văn bản + guard, không bằng trí nhớ.
- **Điều kiện thoát (chốt trước, falsifiable):** nếu tại thời điểm ngách được chốt ở G0,
  library **chưa phục vụ được lĩnh vực đó** (chưa có gói thực thể/provenance tương ứng dùng
  được qua đúng hợp đồng generic), OneFlow được phép xây **kho tối thiểu cục bộ** — chỉ
  `file_key` + tag phẳng, tường minh KHÔNG có đồ thị thực thể — như giải pháp giữ nhịp;
  bảo đảm #4 khi đó thu hẹp thành "không xây KG", và việc quay lại uỷ quyền là hạng mục
  phải có trong phase kế tiếp.

## Hệ quả

- Roadmap Phase 1.7 đổi cách hiện thực (uỷ quyền thay vì bảng riêng) — lộ trình và gate
  không đổi. Node nạp-từ-kho (giai đoạn A của sơ đồ ranh giới) trở thành hạng mục hợp lệ
  làm được trước G0.
- ADR-0004 không bị thay thế: giới hạn 3 thực thể và anchor vẫn là luật phía tiêu thụ;
  thứ thay đổi là *ai giữ bảng*.
- Phiên nghiệm thu kiểm chứng ADR-0011 (điều kiện đảo chiều BYO key) không bị ảnh hưởng —
  library là một entry key nữa trong cùng một UX onboarding đang đo.
