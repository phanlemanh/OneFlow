---
schema_version: 1
slug: director-sinh-instance
feature: Director sinh instance skill từ prompt — gõ một câu, nhận đúng skill với tham số đã điền sẵn (B8 ★ của lát cắt chứng minh)
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-14T08:42:55Z
prototype:
  base_commit:
  disposition: archive
---

## Vấn đề & ai gặp

Người bán hàng hoặc môi giới (người dùng đại diện của lát cắt, cơ hội
[`skill-1-footage-kho-clip`](../skill-1-footage-kho-clip/opportunity.md)) hôm nay có hai cửa vào
OneFlow, và không cửa nào là "nói việc mình muốn":

1. **Ngăn Skill** (B5 [`skill-system-v1`](../skill-system-v1/contract.md), ký 17/09): người dùng phải
   tự biết skill nào hợp việc mình, mở biểu mẫu trắng, tự điền từng tham số.
2. **Director** (v1 + nền D0 [`director-wire-shape`](../director-wire-shape/opportunity.md), ký
   Cổng Giá trị 08/09): gõ một câu thì nhận một **đồ thị tự do** dựng từ DSL rồi thay sạch canvas —
   đúng thứ ADR-0002 dời ra sau "xem/sửa kế hoạch". Director không biết skill tồn tại.

[ADR-0002](../../docs/adr/0002-skill-template-orchestrator.md) đã quyết từ 27/07: «**Director chỉ sinh
instance của skill** — không sinh cấu trúc điều khiển». Lằn ranh đỏ 5 của
[ADR-0013](../../docs/adr/0013-director-truong-ky.md) giữ cùng điều ấy: skill là whole-plan, không
mở DSL. Nửa còn thiếu của vế "agent là giao diện" (vision.md, thiết kế lát cắt §3 dòng B8) là đường
nối hai cửa: **câu gõ → chọn skill → điền tham số → người xem lại → bấm chạy**.

Nguồn: [roadmap.md](../../docs/roadmap.md) khối plan-freeze dòng B8 ★ (T3, "có thể hạ Should ở mốc
09/10" — mốc đã qua với B5 đã ký, nên theo §6.3 của
[thiết kế lát cắt](../../docs/superpowers/specs/2026-09-04-lat-cat-chung-minh-design.md) B8 giữ ★);
B5 Out of scope «Director sinh instance skill từ prompt (B8) và phép thử cache-key của D3 đi kèm nó»
cùng dòng sổ `d-20260916T115020Z-4` chuyển phép thử D3 sang hồ sơ này; gói đợt `of1`
(`docs/dieu-phoi/dot-of1/`, PR #139) xếp B8 là dãy P2, vòng code 20–22/10, mốc 24/10.

Vật liệu nền trong kho: `src/lib/skills/` (catalog, manifest, instantiate, integrity — B5),
`src/lib/director/` (director-core, dsl, vocabulary, events, request-body — v1 + D0), tên và mô tả
tiếng Việt của từng skill trong `src/i18n/messages/vi.json` (khoá `skills.<id>.name/description`).

## Giả định chốt sinh tử

Phép thử #3 đã chạy (đọc kho, không dựng) — xem cột Trạng thái. Xếp hạng: nguy hiểm nhất lên trước.

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Đổi `DirectorPlanSchema` / `output_config` để thêm nhánh skill-instance **không** làm mất prompt cache của vocabulary (phép thử bắt buộc D3 của ADR-0013, chuyển từ B5) | Mỗi lượt Director trả lại trọn giá đọc vocabulary; p95 vốn đã 75,1s (EVAL-0 26/08) — có thể phải tách nhánh chọn-skill thành lời gọi riêng, thiết kế đổi hình | Hai lời gọi thật cùng prefix, khác schema, đọc `cache_read_input_tokens` (~30 phút, ADR-0013 §Hệ quả) | Chưa thử |
| 2 | Có đủ tham số **không phải tệp** để "điền từ câu gõ" mang giá trị — không chỉ là nút chọn skill bằng lời | B8 co lại thành "gõ câu → mở đúng biểu mẫu"; ngưỡng tham số vô nghĩa, giá trị lát cắt đến từ B7 chứ không từ B8 | Đếm tham số trong manifest của registry hiện có và bản nháp skill #1 (B7) | **Đã thử 14/10, một nửa:** registry có 2 skill · 3 tham số · 2 là tệp video bắt buộc · đúng **1** tham số điền được từ chữ (`cat-canh-video.do-nhay`, số, tuỳ chọn). Giá trị thật phụ thuộc tham số không-tệp của skill #1 (giá, phụ đề…) mà B7 chưa có hợp đồng |
| 3 | Director chọn skill đúng chỉ từ tên + mô tả tiếng Việt sẵn có trong i18n, không cần thêm trường mô tả vào `SkillManifest` | Phải sửa manifest của hai skill B5 — chạm phép đối chiếu đường dẫn AC-12 của B5 (`check-second-skill-paths.sh`) | Đọc `vi.json` khoá `skills.*` | **Đã thử 14/10:** cả hai skill có `name` + `description` tiếng Việt một câu nói rõ khi nào dùng — đủ làm đầu vào chọn; chưa đo độ chính xác |
| 4 | B8 đo được độc lập dù skill #1 (B7, dãy P1) hạ cánh **song song** trong cùng đợt | Với 2 skill khác hẳn nhau, "chọn đúng skill" gần như tầm thường — phép đo xanh mà không chứng gì; hoặc B8 phải chờ B7 | Bộ prompt vàng có ca "không skill nào hợp" và ca mơ hồ giữa hai skill; một nhánh đo lại khi skill #1 vào registry | Chưa thử |
| 5 | Nhánh skill-instance đi qua wire D0 (`{planJson, runId, dslVersion}`) và `director_events` mà không đổi trường cũ, không tự chạy | Phá Cổng Giá trị D0 đã release 08/09, hoặc vi phạm lằn ranh đỏ 1 (không tự chạy làm mặc định) | Đọc `route.test.ts` + `report-outcome` — trường thêm, không trường đổi; kind sự kiện mới hay tái dùng | Chưa thử |

## Ngưỡng chết / ngưỡng UAT

> Thiết kế lát cắt §12 viết "B5/B6/B8 là đường B trỏ về" cơ hội skill #1, không khai ngưỡng riêng.
> Ô này mở vì gói đợt `of1` cần quyết `build` trước 20/10 (chủ kho chọn lối (i) ngày 14/10), nên
> máy đề xuất ngưỡng riêng — đo cùng phiên UAT B10, không mở phiên thứ hai. Chủ kho có thể gạch
> cả khối và giữ đường B (xem Cổng 0).
> **14/10:** chủ kho giữ ngưỡng riêng — bốn bullet dưới đã gỡ tiền tố đề xuất lúc ký Cổng Đáng.

- Câu hỏi phép đo trả lời: một người dùng đại diện gõ một câu tiếng Việt tả việc mình muốn có được đúng skill với các tham số chữ/số đã điền, chỉ còn đính tệp và bấm chạy — không mở biểu mẫu trắng, không thấy canvas, và Director không bao giờ tự chạy?
- Kết quả nào là SỐNG: trên bộ ≥ 20 prompt tiếng Việt vàng (ghim, có ca không-skill-nào và ca mơ hồ): chọn đúng skill ≥ 90% · tham số không-tệp điền đúng ≥ 80% · ca không-skill-nào được nói rõ là không có skill hợp, 100% · instance sinh ra qua được bộ kiểm tham số của B5 100% · 0 lượt tự chạy · tại phiên UAT B10 ≥ 2/3 người dùng đi từ câu gõ tới kết quả mà không mở biểu mẫu trắng
- Kết quả nào là CHẾT: chọn đúng skill < 70% trên bộ vàng · hoặc > 10% instance bị máy chủ B5 từ chối vì tham số sai · hoặc bất kỳ lượt nào tự chạy · hoặc p95 lượt Director vượt 75,1s (mốc EVAL-0) vì nhánh mới làm mất prompt cache
- Timebox: vòng code 20–22/10 trong đợt of1 (dãy P2), mốc 24/10; ngưỡng UAT đo ở B10 (02–08/11). Tới 24/10 chưa ký Cổng Bằng chứng → hạ Should (bỏ ★, giữ dòng) ở lần tái hoạch kế, không kéo dài đợt

## Kết quả prototype

Không dựng prototype — không có code trước ô. Hai phép thử không-cần-dựng (#2, #3) đã chạy ngày
14/10 bằng đọc kho; kết quả ở bảng giả định.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Cơ chế prompt cache và khoá cache của Messages API (đầu vào phép thử #1) | tài liệu Anthropic, prompt caching | triết-lý/logic | có (chỉ để đo, không chép mã) | |
| Mẫu "Confirm before generating" của Flow Agent | `_acceptance/director-v2/research-google-flow-2026-08.md` | triết-lý/logic | có — chỉ phần "hỏi trước khi chạy" (trùng lằn ranh đỏ 1) | |
| Giao diện panel chat của Flow Agent | blog.google flow-updates (qua research director-v2) | ngôn-ngữ-thiết-kế/hình-thái | KHÔNG — chuẩn kho thắng (ngăn Skill của B5, panel Director hiện có) | |

## Cổng 0

- **decision = build.** Chủ kho (Phan Le Manh) gõ «build» trong phiên ngày 14/10/2026, trả lời câu hỏi Cổng Đáng; ba ô còn lại của dòng lệnh máy điền sẵn (disposition, ngưỡng, người ký) được nhận nguyên, không sửa. Căn cứ máy trình khi hỏi: B8 là dòng ★ của khối kế hoạch đóng băng; mốc §6.3 đã qua với B5 đã ký nên B8 giữ ★; nền cả hai phía đã hạ cánh trên `main` (B5 ký 17/09, D0 release 08/09); ADR-0002 đã quyết hướng từ 27/07 nên ô không mở câu hỏi kiến trúc mới; gói đợt of1 cần `build` trước 20/10 để dãy P2 chạy.
- **disposition = archive.** Không có prototype trước ô.
- **Ngưỡng UAT chốt cùng lúc ký:** ngưỡng riêng — bốn bullet ở mục Ngưỡng, đã gỡ [đề xuất]; đo cùng phiên UAT B10, không mở phiên thứ hai.

## Thước đo thành công → ứng viên criterion

- Tỉ lệ chọn đúng skill trên bộ prompt vàng ghim → AC "chọn skill" (eval script trên bộ vàng, chạy bằng model thật, đo lại khi skill #1 vào registry).
- Tỉ lệ tham số không-tệp điền đúng → AC "điền tham số" (cùng bộ vàng, so với đáp án ghim).
- Ca không-skill-nào → AC "nói không có" (Director không bịa id skill, không lặng lẽ rơi về đồ thị tự do khi người dùng đang ở cửa skill).
- Instance qua bộ kiểm tham số B5 → AC xuyên lớp (cross-layer): instance từ Director đi đúng đường `/api/skills` của B5, máy chủ nhận.
- 0 lượt tự chạy → AC bất biến (lằn ranh đỏ 1): lượt Director chỉ dàn sẵn, chạy là một cú bấm của người.
- p95 không vượt 75,1s và `cache_read_input_tokens` > 0 sau đổi schema → AC hiệu năng, kèm kết quả phép thử D3.
- `director_events` ghi được lượt skill-instance mà không đổi trường cũ → AC wire, giữ Cổng Giá trị D0.

## Out of scope từ khám phá

- Director vá đồ thị / đọc canvas (director-v2 D2, park 04/09) — B8 chỉ chọn skill và điền tham số, không sửa đồ thị đang có.
- Skill làm một bước trong DSL Director, hay Director ghép nhiều skill thành chuỗi — lằn ranh đỏ 5 của ADR-0013, muốn khác phải supersede bằng ADR mới. (bác)
- Tự chạy instance sau khi sinh, kể cả opt-in — director-v2 hạng mục 4, park; B8 giữ mặc định hỏi trước. (bác)
- Trí nhớ / few-shot cá nhân cho việc chọn skill (D1, D4 — park sau lát cắt).
- Director tự điền tham số tệp (chọn video từ media-library theo câu gõ) — cần 1.7 KG và ủy quyền media-library; ngoài lát cắt.
- Viết thêm skill mới cho Director chọn — skill #1 là việc của B7.
