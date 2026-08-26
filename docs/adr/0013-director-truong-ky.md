# ADR-0013: Director trường kỳ — nền trạng thái bốn tầng, memory hai chủ quyền, học derived-first

- **Ngày:** 2026-08-26 · **Trạng thái:** Chấp nhận (quyết định của founder)
- **Nguồn:** khảo sát 26/08 ([research-director-truong-ky-2026-08.md](../strategy/research-director-truong-ky-2026-08.md),
  14 agent + vòng phản biện đối kháng + rà soát 17 phát hiện); bốn trả lời của Manh 26/08
  cho bốn câu hỏi mở của khảo sát.
- **Quan hệ:** cụ thể hoá vế "agent là giao diện" của [vision](../strategy/vision.md);
  tôn trọng nguyên vẹn [ADR-0002](0002-skill-template-orchestrator.md) (skill whole-plan,
  không mở DSL), [ADR-0011](0011-local-first-execution.md) (local-first, BYO key),
  [ADR-0012](0012-media-library-boundary.md) (entity uỷ quyền media-library).
  Không supersede ADR nào.

## Bối cảnh

Director v1 stateless tuyệt đối: mỗi request dựng turns mới (`director-core.ts:133`), plan
được accept **không bao giờ rời server** (`director-core.ts:176-183` vứt `DirectorPlan`, route
chỉ trả nodes/edges), không event log, không memory, body `{prompt}` trần 2.000 ký tự
(`route.ts:6`). Trong khi tầm nhìn định nghĩa sản phẩm là "studio quảng cáo AI **có bộ nhớ**",
và ô khám phá [`_acceptance/director-v2/`](../../_acceptance/director-v2/opportunity.md)
(26/08) đã đặt bốn hạng mục: trí nhớ canvas, vá đồ thị, ước tính chi phí, opt-in tự chạy.
Muốn Director thành trợ lý dài hạn hiểu và tối ưu cho người dùng, phải quyết **memory sống ở
đâu, ai được ghi, và ranh giới nào không bao giờ vượt** — trước khi viết dòng code đầu tiên,
vì "retrofit provenance về sau rất đau" ([ADR-0004](0004-universe-kg-three-entities.md)).

## Quyết định

1. **Memory hai chủ quyền.** Director SỞ HỮU memory về hành vi và sở thích người dùng
   (event log, sở thích, smart defaults) — sống trong SQLite workspace, hoạt động offline,
   export được. Media-library SỞ HỮU memory về thế giới (Product/Brand/Voice) — OneFlow chỉ
   giữ ref `{entityId, version}` + digest cache (key gồm `contracts_version`, bảo đảm #7
   ADR-0012). Preference/event memory **không bao giờ** uỷ quyền media-library; thiếu cấu
   hình library, Director vẫn đủ chức năng memory.

2. **Nền trạng thái bốn tầng, Director vẫn stateless per-request:**
   - **M1 canvas** — client gửi kèm request (server mù localStorage); canvas là nguồn sự
     thật, plan replay chỉ là ngữ cảnh ý định.
   - **M2 hội thoại** — client replay turns; server không lưu session.
   - **M3 kết cục** — bảng `director_events` append-only, **code ghi chứ không phải model**
     (generated/accepted/replaced/discarded/failed + errorCode + attempts + usedMemory).
   - **M4 sở thích** — (4a) smart defaults *derived* mỗi lần đọc, không lưu số suy diễn,
     plugin thắng phải thuộc tập đang cài; (4b) bảng `memories` trạng thái
     proposed→confirmed→archived, provenance `sourceRunId`, **chỉ confirmed vào prompt**.

3. **Học derived-first, không ML.** Memory dài hạn là aggregate tất định (GROUP BY/median)
   trên event log do code ghi. Nội dung model sinh chỉ vào pool few-shot qua ba cửa: user
   accept tường minh → compile 0-issue → sanitize chuỗi dạng-chỉ-thị. Decay = cửa sổ truy
   vấn; quên = xoá event nguồn; migrate = filter theo `dslVersion`.

4. **Wire-shape trước dữ liệu.** Ba wire-shape gộp MỘT slug acceptance riêng
   [`director-wire-shape`](../../_acceptance/director-wire-shape/opportunity.md): (a) wire
   thành công trả `{planJson, runId, dslVersion}`; (b) bảng `director_events` + endpoint
   feedback (state machine một chiều từ `generated`, mỗi runId vá một lần); (c) body
   versioned `{prompt, turns?, canvas?, options?}` trần theo từng trường.
   **Cổng 0 của `director-v2` giữ nguyên nghĩa sản phẩm, mở riêng** — hạ tầng wire-shape
   không ăn chung slug (quyết định Manh 26/08).

5. **Chấp nhận rủi ro thành văn — plan replay không HMAC** (quyết định Manh 26/08).
   Client có thể tiêm assistant turn tự chế vào `turns`. Chấp nhận vì: local-first
   single-user, kẻ tấn công kiểm soát client thì đã kiểm soát cả SQLite. Giảm nhẹ: pool
   few-shot chỉ nhận plan qua ba cửa của quyết định 3; mọi bản ghi mang provenance.
   **Điều kiện xét lại:** khi có chế độ multi-user/collaboration, hoặc khi few-shot pool
   được chia sẻ giữa máy — lúc đó phải quay lại phương án chữ ký server.

6. **Media-library entity endpoint theo `{entityId, version}` mặc định LÀ CÓ** (quyết định
   Manh 26/08 — library đang chạy ở repo độc lập và được thiết kế cho OneFlow). Boundary
   spec chi tiết xác nhận khi làm 1.7; nếu thực tế lệch, 1.7 mở boundary spec hai phía
   trước khi viết code, đúng bảo đảm #7.

7. **Mười lằn ranh đỏ** (bất biến vận hành):
   1. Không bao giờ tự chạy làm mặc định — auto-run chỉ opt-in, kèm estimate, log cặp on/off.
   2. Memory không rời máy user — ngoại lệ duy nhất: lời gọi suy luận BYO-key do chính user
      cấu hình. Không bao giờ lên server OneFlow, telemetry, hay bên thứ ba.
   3. Không đường ghi memory bền nào thiếu accept tường minh; mọi bản ghi mang provenance.
   4. Không auto-capture vô hình — mọi suy luận vật chất hoá thành bản ghi xem/sửa/xoá được.
   5. Không mở DSL thành ngôn ngữ điều khiển — skill là whole-plan (ADR-0002); muốn khác
      phải supersede bằng ADR mới.
   6. Preference/event memory không bao giờ uỷ quyền media-library.
   7. Không fine-tune — mọi cá nhân hoá liệt kê được toàn bộ đầu vào bằng một truy vấn SQL
      trên máy user.
   8. Memory không chèn vào RULES/vocabulary — chỉ sau cache breakpoint; khối mang
      breakpoint phải byte-stable; churn per-request không bao giờ mang breakpoint.
   9. Số bịa không vào ledger — trường suy diễn nullable, NULL ≠ 0 đo được.
   10. Không nhét dữ liệu có cấu trúc vào env-store — env-store chỉ cho key/URL cấu hình.

## Hệ quả

- **Làn D xen vào roadmap** (xen kẽ, không nối đuôi — xem [roadmap.md](../roadmap.md) mục
  "Làn D"): D0 wire-shape → D1 smart defaults + đo giả định → D2 trí nhớ canvas/vá →
  D3 phụ lục manifest skill trước 1.5 → D4 memories UI + few-shot + auto-run sau 1.7.
- **Phép thử bắt buộc trước phụ lục ADR-0002** (Manh đồng ý 26/08): xác định
  `output_config`/schema có nằm trong khoá prompt-cache của Anthropic không (~30 phút);
  nếu có, đổi DirectorPlanSchema là mất toàn bộ cache — ảnh hưởng thiết kế nhánh
  skill-instance.
- **Incognito phải là incognito thật**: `options.useMemory:false` ngăn cả ĐỌC lẫn GHI
  event của lượt đó; Settings có "xoá lịch sử Director".
- Chi phí quy trình: mỗi bảng/cột mới là t3_path (`src/db/**`), mỗi migration phải qua
  phép thử migrator-thật trên db người dùng cũ (tiền lệ `metering-schema.test.ts`);
  bảng mới phải export qua barrel `src/db/schema.ts`.
- Rủi ro đặt tên: "skill" OneFlow (quy trình đóng gói chạy trên engine) ≠ "skill" thị
  trường (SKILL.md instruction pack) — một câu định nghĩa phân biệt bắt buộc ở lần đầu
  dùng từ trong docs công khai.
