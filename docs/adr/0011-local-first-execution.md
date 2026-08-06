# ADR-0011: Máy của người dùng là nền thực thi mặc định; managed cloud là tier

- **Ngày:** 2026-08-05 · **Trạng thái:** Chấp nhận (quyết định của founder)
- **Nguồn:** founder, 05/08/2026, trong phiên khảo sát 38 plugin để trả lời câu "có dùng
  thẳng API OpenAI thay Modal được không".
- **Quan hệ:** **thay thế** nửa *"managed cloud là mặc định"* của
  [ADR-0005](0005-managed-cloud-default.md). Nối tiếp và mở rộng
  [ADR-0010](0010-mainstream-infra-and-models.md) — ADR đó gỡ Modal khỏi vai *nền tính toán*
  nhưng giữ nguyên vai của cloud; ADR này gỡ nốt cloud khỏi vai mặc định.

## Bối cảnh

Ba dữ kiện đo được trong cùng một phiên khảo sát, không phải phỏng đoán:

1. **Năm plugin Modal không xin GPU nào cả.** `ffmpeg`, `pyscenedetect`, `crawl4ai`,
   `scrapling`, `docling` đều `gpu=NONE`. Chúng là công việc CPU thuần đang trả tiền cloud,
   cold start và phụ thuộc tài khoản Modal — cho những thứ một máy tính cá nhân làm được
   ngay. Tám slot trong nhóm này (`SPLIT_VIDEO`, toàn bộ ffmpeg, `LINK`) nằm **trên đường
   tới hạn của skill #1**, tức wedge P0.
2. **Thực thi vốn đã là local.** [`runners/generic.ts`](../../src/lib/plugin-executor/runners/generic.ts)
   spawn `entry.py` của plugin như một subprocess trên chính máy chạy server; plugin Modal
   chỉ là *cầu nối* từ đó gọi lên GPU cloud. Bỏ Modal không cần xây lại executor.
3. **Hạ tầng BYO key đã có sẵn và được thiết kế đúng cho hướng này.**
   [`env-store.server.ts`](../../src/lib/settings/env-store.server.ts) tự mô tả: *"OneFlow
   itself declares no specific keys… a flat key → value map that the user fills in"*, trộn
   vào env của process plugin lúc chạy. Store, API route và dialog đều đã tồn tại.

Điểm thứ ba là điểm quyết định: **thượng nguồn vốn được xây theo hướng BYO/local.**
ADR-0005 mới là cái đi ngược grain — và **chưa được hiện thực dòng nào**: shared deployment
mode, Modal workspace gộp, key phía server đều nằm ở Phase 2, chưa bắt đầu. Nên đảo chiều
tốn 0 dòng code phải gỡ.

## Quyết định

- **Máy của người dùng là nền thực thi mặc định.** Việc CPU (I/O video, cắt cảnh, ffmpeg,
  scrape) chạy tại chỗ. Việc cần model chạy qua API của nhà cung cấp phổ biến
  ([ADR-0010](0010-mainstream-infra-and-models.md)).
- **BYO key là mặc định, không phải tier.** Người dùng nhập key của chính họ vào workspace
  settings; OneFlow không đứng giữa và không ôm chi phí suy luận.
- **Managed cloud trở thành một tier**, đảo đúng chiều với ADR-0005. Nó không biến mất —
  nó là lựa chọn cho người không muốn cầm key.
- **Modal không còn là nền cho bất kỳ slot nào có đường local hoặc API tương đương.** Plugin
  Modal giữ lại như phương án thay thế cho slot chưa có đường khác (ADR-0007: fork tuần tự
  theo nhu cầu, không mirror cả 38).

## Rủi ro đã chấp nhận, và điều kiện đảo chiều

ADR-0005 sinh ra để xử lý **rủi ro critical #1** của giám khảo GTM trong hội đồng 07/2026:

> ICP đã chọn (seller VN) phần lớn **không có thẻ quốc tế, không biết Modal là gì** — người
> hưởng luận điểm "BYO key = minh bạch chi phí" không phải người bấm nút mua.

ADR này **đảo ngược quyết định đó mà không có bằng chứng thị trường mới** — nó đổi một rủi
ro kỹ thuật/chi phí lấy một rủi ro tiếp cận thị trường. Ghi thẳng ra vì đó là đánh đổi thật,
không phải chi tiết kỹ thuật:

- **Được:** COGS suy luận về gần 0 ở tier mặc định · không nuôi GPU · không cold start ·
  không phụ thuộc tài khoản Modal trên đường tới hạn · trụ *"dữ liệu thuộc về người dùng"*
  (niềm tin nền #5 của [tầm nhìn](../strategy/vision.md)) mạnh lên từ khẩu hiệu thành kiến trúc.
- **Mất:** người dùng phải tự có key. Với ICP đã chốt ở hội đồng, đó là rào cản mua hàng
  thật, không phải rào cản kỹ thuật.

**Điều kiện đảo chiều (falsifiable, chốt trước khi đo):** nếu ở phiên nghiệm thu đầu tiên
với người dùng đại diện, **≥ 1/3 số người không tự hoàn tất được bước nhập key** trong
onboarding, thì tier managed phải quay lại làm mặc định và ADR này bị supersede. Vạch chốt
ở đây, trước khi thấy số — cùng luật với các gate khác trong repo.

## Hệ quả

- **[ADR-0005](0005-managed-cloud-default.md) bị thay thế ở nửa "managed là mặc định".** Phần
  còn giữ nguyên hiệu lực: metering phân biệt *"lượt sinh mới" vs "lượt sửa"* là cơ chế sản
  phẩm, và thông điệp *"Sửa miễn phí — Sinh mới giá niêm yết — Không bị nhốt"* — thông điệp
  thứ ba nay **đúng theo nghĩa đen**.
- **Mô hình 3 tier phải viết lại.** Tier Seller không còn là "gói phẳng, OneFlow ôm GPU".
  Bảng giá nằm ngoài phạm vi product plan, nhưng cơ chế thì đổi và roadmap Phase 2 mục 4
  (*metering → gating theo quota workspace*) mất tiền đề.
- **Phase 2 co lại.** Mục 1 (shared deployment mode, Modal workspace gộp + secret server-side)
  **bỏ**. Mục 2 (Postgres + org/membership) hoãn tới khi có tier managed thật.
- **Desktop app đổi bản chất.** Hiện là vỏ Pake trỏ `app.tongflow.com`
  ([desktop/README.md](../../desktop/README.md)) — tức một cloud shell. Local-first cần app
  chạy server tại máy. Đây là hạng mục riêng, chưa lên lịch ở ADR này.
- **[ADR-0001](0001-cache-before-cloud.md) mạnh thêm.** Cache content-addressed vốn là điều
  kiện chặn GA của managed cloud; ở local nó vẫn là thứ khiến "sửa rẻ gần bằng không" đúng,
  và tầng B của nó đã chạy theo tenant nên không phải sửa gì.
- **G0 không đổi.** Bốn chặn của G0 (ngưỡng số, corpus WER, COGS, chốt ngách) không phụ thuộc
  ADR này. COGS thì **dễ đo hơn**: giá API minh bạch hơn hoá đơn GPU.
- **Thứ tự fork plugin đổi.** [ADR-0007](0007-sequential-plugin-forking.md) giữ nguyên luật
  (tuần tự theo nhu cầu), nhưng thứ tự nhu cầu nay bắt đầu từ 5 plugin `gpu=NONE`.
