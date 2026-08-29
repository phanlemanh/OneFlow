---
schema_version: 1
feature: Node nạp-từ-kho — tìm trong media-library và nạp một asset về kho file thành file_key
slug: add-media-library
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ui, api]
status: signed-off
approved_by: Phan Le Manh
approved_at: 2026-08-19T14:58:44Z
human_signoff: Phan Le Manh 2026-08-29
---

# Acceptance Contract: add-media-library

## Context

[ADR-0012](../../docs/adr/0012-media-library-boundary.md) chốt rằng kho footage +
đồ thị thực thể + provenance của hệ sống ở **media-library**, và OneFlow là **khách
qua hợp đồng** — REST + API key, bytes chỉ qua URL ký, không import code, không đọc
DB của nhau. Hạng mục roadmap **1.3b** là **giai đoạn A** của ranh giới đó: chỉ đọc.
Nó mở input cho skill #1 "Footage → kho clip" (1.6) và làm được **trước G0**.

Bốn trong tám bảo đảm ranh giới rơi vào phạm vi giai đoạn A, và mỗi bảo đảm phải
**chứng minh được**, không phải hứa trong văn bản:

- **#1** chỉ REST + API key; bytes chỉ đi qua URL ký.
- **#2** không phụ thuộc cứng — thiếu cấu hình thì node báo **gọi đúng tên**, phần
  còn lại của studio không suy suyển.
- **#3** lĩnh vực là **dữ liệu, không phải code** — cấm hardcode ngữ vựng BĐS.
- **#7** ranh giới có phiên bản — lệch thì **từ chối gọi đúng tên**, không đoán.

Bảo đảm #4 (uỷ quyền KG), #5 (ghi ngược + telemetry) và #8 (render) thuộc giai đoạn
B/C, nằm ngoài hợp đồng này.

Nguồn: [thiết kế](../../docs/superpowers/specs/2026-08-19-add-media-library-design.md) ·
[ADR-0012](../../docs/adr/0012-media-library-boundary.md) · [roadmap 1.3b](../../docs/roadmap.md) ·
hợp đồng thật của media-library (`packages/contracts/src/`, đã đọc 19/08).

## Criteria

### A. Không phụ thuộc cứng (bảo đảm #2)

- AC-1: **(cross-layer)** Given kho khoá BYO thiếu `MEDIA_LIBRARY_URL` hoặc
  `MEDIA_LIBRARY_API_KEY`, When người dùng mở node nạp-từ-kho và bấm tìm, Then node
  hiện trạng thái thiếu-cấu-hình **nêu đích danh biến còn thiếu** (chuỗi chứa đúng
  tên biến, không phải "chưa cấu hình dịch vụ"); **không một lời gọi mạng nào** rời
  khỏi máy — đo ở mức route, nơi lời gọi đó thật sự có thể xảy ra; và từ chính trạng
  thái đó người dùng **tới được chỗ nhập hai khoá** rồi quay lại tìm thành công, mà
  không lần nào phải đặt biến môi trường ngoài giao diện.
- AC-2: Given OneFlow chạy trên máy **chưa từng** cấu hình media-library, When người
  dùng dùng studio như thường (mở workspace, thêm node khác, lưu workflow), Then mọi
  thứ hoạt động y như trước — không lỗi khởi động, không cảnh báo toàn cục, không
  route nào hỏng.

### B. Tìm trong kho

- AC-3: **(cross-layer)** Given cấu hình đủ và kho có video khớp, When người dùng gõ
  một câu mô tả và bấm tìm, Then request rời OneFlow đúng hình dạng hợp đồng
  (`POST /v1/search`, header `Authorization: Bearer <key>`, body có `intent` và ghim
  `media_type: "video"`, `limit` ≤ 20), và các thẻ trả về hiện trên node.
- AC-4: Given kho trả `cards: []` nhưng `candidates > 0` (kệ mỏng — đã qua lọc cứng
  nhưng không dựng được thẻ nào), When kết quả hiện ra, Then node nói **kệ mỏng**
  bằng ngôn ngữ khác hẳn thông điệp lỗi — người dùng phải phân biệt được "không có
  gì hợp" với "hỏng".
- AC-5: **(cross-layer)** Given response mang `warnings` chứa `embedding_unavailable`,
  When kết quả hiện ra, Then node nói rõ kết quả **không được xếp hạng theo ngữ
  nghĩa** — một 200 kèm cảnh báo không được trình như một 200 sạch.
- AC-6: **(cross-layer)** Given **tám** cách hỏng có thật của ranh giới này — 401 khoá
  sai · 403 thiếu scope `search` · 400 body sai · 404 asset không thấy · 500 lỗi trần
  · 501 dịch vụ chưa nối phụ thuộc · thân trả về không phải JSON · đứt mạng — When mỗi
  ca xảy ra, Then node hiện thông điệp **phân biệt được cho từng ca** (số assert bằng
  số ca), mỗi thông điệp gọi đúng tên nguyên nhân; **không ca nào trong tám ca được
  hiện ra như "kệ mỏng"**; và việc phân loại dựa trên **mã HTTP + trường `error`**,
  không bao giờ regex vào câu chữ tiếng Việt của dịch vụ.

### C. Thẻ Media Card (bảo đảm #3)

- AC-7: Given các thẻ mang từ vựng lĩnh vực của library (`provenance` — kể cả dạng
  mở `generated:<provider>@<hash>` —, `scene_kind`, `entity.kind`,
  `entity.specificity`, `energy`, `interior_state`), When node render chúng, Then
  mọi giá trị đi qua như **chuỗi mờ**: không union đóng, không `switch`, không bảng
  dịch phía OneFlow; một giá trị library **chưa từng có** vẫn hiện được và không
  làm hỏng thẻ. Thẻ có `entity: null` (media stock) vẫn render bình thường.
- AC-8: Given một thẻ có `license_label`, When thẻ hiện trên node, Then nhãn đó
  **hiển thị** — đây là công bố pháp lý bắt buộc theo hợp đồng của library, bỏ đi là
  lỗi tuân thủ chứ không phải lược bớt cho gọn.

### D. Nạp bytes về kho (bảo đảm #1)

- AC-9: **(cross-layer)** Given người dùng chọn một thẻ, When lệnh nạp chạy xong,
  Then OneFlow đã gọi `GET /v1/assets/:id`, tải bytes **qua `urls.original`**, và
  tồn tại một `file_key` **đọc lại được từ kho file** với nội dung đúng bằng bytes
  đã tải — không đường nào chạm storage của library trực tiếp.
- AC-10: Given `urls.original` trỏ tới một scheme không phải
  `https:` hoặc tới một host nội bộ (ví dụ `http://169.254.169.254/...`) khi cấu hình
  không phải localhost, When lệnh nạp chạy **qua chính route `POST /api/media-library/import`**
  — không phải qua lời gọi hàm trực tiếp — Then nó **từ chối tải, gọi đúng tên lý do**;
  một phản hồi vượt trần kích thước hoặc quá hạn chờ bị cắt thay vì nuốt hết bộ nhớ;
  và `downloadAndSave()` (đường tải **không** kiểm scheme/host/kích thước sẵn có trong
  `src/lib/file/file-utils.ts`) vẫn **không có caller nào** trong cây sau thay đổi.
  Đây là tiêu chí về **call-site**: một hàm viết đúng mà route không gọi tới không
  bịt được lỗ nào. (Không mang tag `(cross-layer)` dù là một quan hệ: quan hệ ở đây
  là route↔thư viện, **cả hai đều phía server**, nên bằng chứng không cần nửa UI —
  đúng luật tag viết ở đầu `evals.yaml`.)
- AC-11: Given hợp đồng của library **không trả** `mime`, `size_bytes` hay
  `filename`, When bytes được lưu, Then đuôi file được suy theo bậc (đường dẫn URL →
  `Content-Type` → mặc định `mp4`) và `file_key` mang **đuôi đúng**, đủ để
  `/api/uploads/<key>` trả Content-Type phát được trên canvas.

### E. Giao cho canvas

- AC-12: **(cross-layer)** Given một asset vừa nạp xong, When node hoàn tất, Then nó
  nở ra một `videoNode` mang `fileKeys` (đúng khuôn mọi add node sẵn có), cạnh giữa
  hai node hợp lệ theo validator, và workflow export ra được với node dữ liệu đó;
  **không** trường hợp nào nở ra node sai modality.

### F. Ranh giới có phiên bản (bảo đảm #7)

- AC-13: **(cross-layer)** Given dịch vụ trả `contracts_version` ngoài dòng adapter
  ghim (`0.2`), When bất kỳ lời gọi nào chạy, Then adapter **từ chối, gọi đúng tên**
  (nêu cả phiên bản ghim lẫn phiên bản nhận được) và **không** cố đọc dữ liệu theo
  hình dạng cũ.

### G. Ranh giới hạng và giao diện

- AC-14: Given lời hứa của roadmap "add node không ABI-driven nên không đụng
  ABI/SDK", When xem toàn bộ diff của nhánh, Then **không** file nào dưới
  `config/tongflow.abi.json`, `src/generated/abi/**`, `sdk/**`, `src/db/**` bị chạm.
- AC-15: Given **tám** trạng thái của node — thiếu cấu hình · rỗng chờ gõ · đang tìm
  · có kết quả · kệ mỏng · kết quả không xếp hạng · đang nạp · lỗi có tên — When từng
  trạng thái hiện ra ở cả nền sáng lẫn nền tối, Then mỗi trạng thái có hình hài rõ
  ràng và đạt sàn tiếp cận (axe-core: **0 lỗi mức critical/serious**, gồm cả tương
  phản). ("Xong" **không** nằm trong danh sách vì nó không phải trạng thái của node
  này: nạp xong thì kết quả là một node video MỚI trên canvas, đúng khuôn mọi add
  node sẵn có — AC-12 đo điều đó.)

## Coverage

Quét bằng `morphological-scan` (preset entity-feature + risk-premortem), hộp
**chặng nạp × hạng kết quả** = 25 ô; tám bảo đảm ADR-0012 làm lớp cross-cutting.

- **Trục A — chặng nạp:** cấu hình | tìm | chọn thẻ | nạp bytes | giao canvas.
  *Thước CE:* năm chặng khai trong [roadmap 1.3b] và sơ đồ ranh giới của ADR-0012;
  đối chiếu với hợp đồng thật (`POST /v1/search`, `GET /v1/assets/:id`) — không
  chặng nào của hợp đồng nằm ngoài trục.
- **Trục B — hạng kết quả:** thành công (AC-3, AC-9, AC-12) | rỗng hợp lệ (AC-4) |
  từ chối CÓ TÊN (AC-1, AC-6, AC-10, AC-13) | **hỏng ngoài dự kiến** (AC-6, ma trận
  tám ca — ô này ban đầu TRỐNG, lấp sau lượt phản biện context sạch) | **suy giảm
  ngầm** (AC-5). *Thước CE:* bảng mã lỗi thật của library
  (401/403/400/404/501/500 — và **không có 429**, đã kiểm: dịch vụ không có rate
  limit) + tri-state `KeyVerdict` sẵn có của repo (`src/lib/onboarding/key-verify.ts`),
  nơi "không ai hỏi được" khác "sai".
- *[NGÀNH: Adobe Stock panel trong Premiere / Adobe CC Libraries]* — khuôn chuẩn của
  loại "tìm trong kho ngoài rồi chèn vào trình biên tập": proxy có hạn, nhãn quyền
  phải hiện, chèn xong là tài sản cục bộ. Ba ô Core đến từ đối chiếu này: AC-8
  (nhãn quyền), giới hạn thumb hết hạn (§Notes), AC-11 (chèn xong phải phát được).
- *[NGÀNH: ComfyUI-Manager]* — chuẩn "nêu thứ còn thiếu trước khi người dùng bấm",
  đã là tiền lệ trong repo (contract `byo-key-onboarding`); sinh AC-1.

**Ô Core vượt ngưỡng 20% của skill (12/25 ô có nghĩa) — có chủ ý:** bốn bảo đảm
ranh giới của ADR-0012 tự chúng là tiêu chí phải chứng minh, nên các ô "từ chối có
tên" và "suy giảm ngầm" không được gộp vào ô thành công. Đã cắt bằng cách **hợp
nhất ô thành một AC** (12 ô → 15 AC gồm cả a11y và ranh giới hạng), không phải bằng
cách bỏ ô.

## Out of scope

- **Ingest ghi ngược + telemetry lượt dùng** (bảo đảm #5) — giai đoạn B, thuộc hạng
  mục 1.6. Giai đoạn A **chỉ đọc**.
- **`entity_id` / đồ thị thực thể / `entity_refs`** (bảo đảm #4) — hạng mục 1.7.
- **Ảnh, audio, floorplan** — giai đoạn A khoá `media_type: "video"` vì
  `ADD_NODE_OUTPUT_TYPE` là bảng tĩnh và footage là thứ skill #1 cần. *Mở lại khi*
  skill #2 cần ảnh, hoặc khi có lý do thật để cho add node handle động.
- **Phân trang quá ~50 kết quả** — hợp đồng không diễn đạt được (`limit` ≤ 20,
  `exclude_ids` ≤ 50, không cursor/offset). Cần đổi hợp đồng ở cả hai repo.
- **Nạp nhiều asset một lượt** — một thẻ một lần ở giai đoạn A.
- **Dựng instance media-library riêng cho OneFlow** — bảo đảm #6 nói rõ đó là quyết
  định vận hành, chỉ khác nhau ở cặp URL + key, không chạm code.

## Known limits (người ký nhận trước khi phát hành)

- **Bộ eval chưa từng chạm instance media-library thật.** Toàn bộ 29 eval chạy trên
  một máy chủ giả cục bộ dựng tay theo `packages/contracts/src/` đọc ngày 19/08.
  E28 canh fixture không trôi (xuất xứ + tập tên trường), nhưng nó **không** thay
  được việc chạy zod của chính library — nạp `packages/contracts` vào harness của
  OneFlow chính là nhập code của nhau, trái bảo đảm #1. **Tiền đề Cổng 2, khai
  trước:** hoặc chạy một lượt smoke tay trên instance thật rồi mới ký, hoặc ký kèm
  đúng giới hạn này. Người ký chọn; máy không chọn hộ.
- **Chốt an toàn địa chỉ phán trên host CHỮ VIẾT, không phán trên địa chỉ thật.**
  (bổ sung sau dấu niêm Cổng 1 — vòng sửa S4-r1, xem `decisions.jsonl`)
  `url-safety.ts` nhận diện đủ mọi cách VIẾT một địa chỉ nội bộ mà một URL có thể
  mang (21 dòng trong bảng thử, gồm IPv6 ánh xạ ở cả hai dạng và dải CGNAT), nhưng
  nó **không** phân giải DNS: một tên miền công khai trỏ về địa chỉ nội bộ
  (`internal.example.com` → `10.0.0.5`) vẫn đi lọt mọi chặng. Phân giải rồi kiểm
  cũng không đóng kín được — vẫn còn khe giữa lúc tra và lúc nối. Đóng thật thì
  phải móc ở tầng socket, lớn hơn giai đoạn A; khai ra đây thay vì để vắng mặt
  im lặng.
- **Thẻ tìm kiếm hết hạn im lặng sau 15 phút.** `renditions.thumb_url` được ký với
  cùng TTL 900 giây nhưng response tìm kiếm **không** trả `expires_in_s`, nên bên
  đọc không có tín hiệu nào để biết. Giai đoạn A **không** làm mới thẻ tự động —
  người dùng để node mở quá 15 phút sẽ thấy ảnh vỡ và phải tìm lại. (Có thể sửa
  bằng một hạn tự làm mới đặt cứng ngắn hơn TTL; không làm hôm nay vì chưa AC nào
  đòi, và một hạn đặt cứng theo hằng số của bên kia là thứ trôi lặng lẽ.)

### Đợt đóng băng sau S4 vòng 8 (owner chốt 29/08/2026)

Vòng 8 xanh cả 29 eval. Lớp phản biện vẫn ra 12 phát hiện, tỉ lệ **tăng** so với
vòng 7 (2 nặng → 4 nặng) — đúng dấu hiệu lớp không hội tụ theo thiết kế. Một cái
đã sửa (phép đo locale đo chỉ dẫn thay vì đầu ra). Mười một cái còn lại nằm dưới
đây, **không** cái nào được đo bởi một AC nào; người ký nhận chúng trước khi phát
hành. Chúng không bị vứt: hai thứ có cấu tính đi vào hợp đồng con
(xem `decisions.jsonl` d-20260829T123449Z-8004).

**Khuyết tật sản phẩm**

- **Payload của library chỉ được kiểm MỘT tầng.** `client.server.ts` trả
  `body as T`; `readResults` kiểm `Array.isArray(record.cards)` rồi ép sang
  `MediaCard[]`. `media-card-list.tsx` sau đó đọc thẳng `card.renditions.thumb_url`.
  Một 200 mang card thiếu `renditions` ném TypeError **trong lúc React render**,
  thay vì rơi về trạng thái `BAD_RESPONSE` mà chính bảng phân loại đã định nghĩa.
  Đây là cùng lớp lỗi đã sửa ở nhánh 2xx của `pick()` vòng 7, chỉ thấp hơn một
  tầng — và chính vì thế nó **không** được vá tiếp ở đây: điều lệ ngừng-vá cấm mở
  vòng thứ ba trên cùng một lớp. Cách sửa đúng là kiểm một lần ở biên, đã đưa sang
  hợp đồng con. Lưu ý luật "hợp đồng chỉ ép lúc biên dịch" của `CLAUDE.md` áp cho
  biên ABI/plugin; media-library là dịch vụ REST **ngoài**, nơi luật chung
  "kiểm ở biên hệ thống, không tin dữ liệu ngoài" mới là luật áp.
- **`.mkv` nhập được nhưng không bao giờ phát được.** `MIME_TO_EXT` ánh xạ
  `video/x-matroska` → `mkv`, nhưng bảng `MIME_TYPES` của
  `/api/uploads/[...path]/route.ts` không có mục `.mkv`, nên file phát ra dưới
  `application/octet-stream`; trong khi `task/completion.ts` lại xếp `mkv` là video
  nên canvas vẫn dựng thẻ `<video>`. Người dùng thấy "nhập thành công" rồi nhận một
  clip câm không lỗi ở đâu cả. **Đây đúng thứ mà chú thích đầu `extension.ts` nói
  module đó sinh ra để chặn.** Gỡ bằng cách thêm `.mkv` vào bảng MIME của uploads,
  hoặc bỏ `mkv` khỏi `MIME_TO_EXT` — một dòng, nhưng nằm ngoài đóng băng.
- **Nhập lần hai từ cùng một node ghi đè lần một.** `pick()` gọi `expands` với
  DUY NHẤT khoá vừa nhập, và `addMediaLibraryNode` không nằm trong `DATA_NODE_TYPES`
  nên `use-flow` gom con theo kiểu và tái dùng: `{...node.data, ...data}` thay
  `fileKeys` nguyên khối. Clip A biến mất khỏi canvas, không một câu nào. Mọi node
  `add/*` khác truyền cả danh sách tích luỹ của mình, nên ngữ nghĩa "thay" đúng ở
  đó và sai ở đây.
- **Băng "kết quả chưa xếp theo nghĩa" tắt ngay khi bấm chọn.** `isUnranked()` chỉ
  đúng khi `kind === "results"`. Biến thể `importing` được cấp `warnings` chính là
  để giữ băng đó suốt lượt nhập, và node có mang nó sang — nhưng không ai đọc.
  Trường `warnings` trên `importing` là mã chết như đang viết.
- **Phím Enter mở được lượt tìm thứ hai khi lượt một chưa xong.** Nút Tìm có khoá
  theo `outcome.kind === "searching"`, ô nhập thì không; hai phản hồi về không theo
  thứ tự thì cái cũ ghi đè cái mới.

**Vệ sinh mã**

- **Bảng cấu hình dùng id DOM tĩnh.** `id="media-library-url"` là hằng, trong khi
  mọi node `add/*` khác gắn id theo node (`file-upload-${id}`) đúng vì một canvas
  chứa được nhiều bản. Hai node chưa cấu hình trên cùng canvas phát id trùng và
  cả hai `<Label htmlFor>` trỏ về ô của node thứ nhất. Guard a11y của chính tính
  năng chạy trên trang proto một-bản nên **không thể** thấy điều này.
- **Thân phản hồi không được xả trên nhánh chuyển hướng thủ công.** `fetchGuarded`
  dùng `redirect: "manual"` và chỉ đọc header `location`; nhánh không-OK của
  `importAsset` cũng trả về mà không đọc thân. Dưới undici, thân chưa đọc giữ kết
  nối ngoài pool tới lúc GC.

**Lỗ thủng của chính bộ đo — nợ kỹ thuật có tên**

- **E18/AC-11 tuyên quét cả LỚP nhưng chỉ có điểm-case.**
  `extension-serving.server.test.ts` nói "phục vụ đúng kiểu video cho **mỗi** đuôi
  mà đường nhập có thể chọn" nhưng chỉ chạy `webm` và `mp4`; `mkv` và `mov` chưa
  từng đi vòng qua route. Phần tử bị bỏ chính là lỗi `.mkv` ở trên. **Một ô PASS
  chứng minh được là không thể nhìn thấy khuyết tật thật thì không phải bằng
  chứng** — owner đã đọc câu này và vẫn chọn đóng băng.
- **Assertion âm-tính-một-mình.** `import-roundtrip.server.test.ts` ca "URL ký
  không tải được" thực ra chết ở nhánh malformed, chưa từng chạm đường tải; nó
  khẳng định *không* xảy ra điều gì mà không ghim *vì sao*.
- **Kịch bản đo E4 không có assert và luôn `exit 0`.** Đối chứng dương được thu
  nhưng không bao giờ được so.
- **Guard đồ thị import chỉ thấy khai báo `import`.** `import-graph.mjs` bỏ qua
  re-export và `import()` động, nên `check-no-boot-dependency` /
  `check-no-dormant-fetch` đi lọt hai lối.

### Lane máy thuần sau đóng băng (29/08/2026) — verdict PASS

Lane chạy lại 19 eval máy + 7 lệnh suite tại HEAD, gánh 9 eval ui-check từ vòng 8
(không mã giao diện nào đổi sau `5a181df`, đo bằng `git diff`). **Không ô nào đỏ.**
Lớp phản biện vẫn chạy — args của kit không có cờ tắt nó — và ra thêm **13** phát
hiện, lần thứ ba liên tiếp không giảm. Một cái đã sửa (xoá `git checkout` phá dữ
liệu khỏi guard a11y). Mười hai cái còn lại nhận trước khi phát hành:

- **Kho khoá có thể bị xoá sạch khi lưu cấu hình — NHƯNG đây là nợ sẵn của `main`,
  không phải của nhánh này.** `loadEnvStore()` nuốt **mọi** lỗi bằng `catch { return {} }`
  và `GET /api/settings/env` trả 200 với `{env:{}}`, nên không bên gọi nào phân biệt
  được "kho rỗng" với "kho đọc không nổi"; `PUT` thì thay nguyên bản đồ. Blob
  `settings.json` hỏng hoặc codec giải mã thất bại → người dùng lưu hai khoá
  media-library và mất toàn bộ khoá còn lại, không một thông báo nào.
  **Đo được:** `src/lib/settings/env-store.server.ts` và route của nó **không đổi
  một dòng nào** trên nhánh (`git diff main...HEAD` rỗng), và
  `abi-node-shell.tsx:110` trên `main` làm cùng thao tác PUT mà **không có tấm chắn
  nào cả** — bảng cấu hình của nhánh này là bên gọi cẩn thận hơn, không phải bên
  gây ra. Sửa thật phải ở phía máy chủ (phân biệt rỗng với không-đọc-được, thêm
  điểm cuối chỉ-gộp), tức ngoài phạm vi hồ sơ này; đã tách thành việc riêng.
- **Trạng thái `imported` được thiết kế, quét a11y và duyệt — nhưng không tồn tại
  trong sản phẩm.** Proto vẽ nó và guard E24 quét đúng mười trạng thái gồm nó, còn
  node thật sau khi nạp xong gọi `expands(...)` rồi `setOutcome({kind:"idle"})`,
  xoá danh sách và không hiện gì. Không có nhánh `imported` trong `Outcome`, không
  khoá `imported` trong cả năm file ngôn ngữ. Guard proto **không thể** đỏ vì việc
  này — nó chỉ đo proto.
- **Tải nửa chừng bị đứt bị báo là `LOCAL_FAILURE` ("máy của bạn").** `readCapped()`
  không bọc `try/catch`, nên timeout sau khi đã có header hoặc `TypeError: terminated`
  của undici thoát ra tới catch của route và thành 500 `LOCAL_FAILURE` — đẩy người
  dùng đi soi đĩa của mình vì một sự cố hoàn toàn ở phía trên.
- **Tải về 0 byte vẫn được lưu và báo nhập thành công.**
- **`message` đi xuyên bốn tầng rồi không ai đọc.** Được điền tiếng Việt cứng ở
  `errors.ts`, `config.server.ts`, `client.server.ts`, `import.server.ts`, tuần tự
  hoá qua cả hai route, parse lại ở `readFailure`, lưu vào `Outcome` — và cả hai
  chỗ hiển thị đều cố ý dùng `t(...)`. Quyết định "câu của máy chủ chỉ để ghi log"
  không có gì cưỡng chế: bên đọc kế tiếp render nó là người dùng en/ja/ko/zh lại
  gặp tiếng Việt.
- **Ba README không được cập nhật.** `CLAUDE.md` nói thẳng chúng trôi lặng lẽ và
  bắt sửa cả ba khi có năng lực mới; nhánh này thêm một add node người dùng thấy
  được và hai khoá env mà không chạm file nào.

Và **sáu lỗ thủng nữa của chính bộ đo**, cùng năm hình dạng đã đặt tên:
`import.server.test.ts:104` (assertion âm-tính-một-mình: ca "không tải được URL ký"
bị guard host chặn trước, chưa từng tới chặng tải) · `provenance.test.ts:21` (E28
hứa quét cả lớp, code chỉ bắt trường thừa) · `client.server.test.ts:192` ("sinh tám
mã phân biệt" tính trên bảng kỳ vọng của chính test, không đọc đầu ra nào) ·
`e4-verify.mjs:31` (tiền đề "kho khoá RỖNG" dựng bằng profile trình duyệt mới, trong
khi kho khoá nằm phía máy chủ) · `add-media-library-node.test.tsx:339` (cặp
kệ-mỏng-vs-lỗi chỉ so trên `en`) · và `client.server.ts:171` (payload ép kiểu không
kiểm — cùng cái đã nêu ở đợt trước, lần này chỉ đúng địa chỉ).

**Đây là dữ liệu xác nhận, không phải thất bại:** ba vòng liên tiếp (7, 8, lane) lớp
phép đo hội tụ còn lớp phản biện thì không. Điều kiện dừng đặt ở lớp thứ hai là điều
kiện không bao giờ thoả — nên nó không được quyền quyết định.

### Lượt đo lại E24 tại HEAD (29/08/2026) — verdict PASS, và 17 phát hiện nữa

Delta `6ba9902..HEAD` đúng **một** file, và file đó là dụng cụ đo của E24, nên chỉ
E24 chạy lại; 27 eval còn lại gánh sang. **Không ô nào đỏ.** Lớp phản biện ra thêm
**17** phát hiện. Cộng ba lượt: **12 → 13 → 17**. Không giảm, lần thứ ba.

Ba cái owner cần thấy tên đầy đủ:

- **Chuyển hướng trên đường API đi vòng qua `url-safety.ts` — lỗ SSRF mà chính tính
  năng này tuyên đã bịt.** `call()` (`client.server.ts:38`) gọi `fetch` **không đặt
  `redirect`**, tức mặc định `"follow"`. Mọi tấm chắn trong `url-safety.ts` chỉ được
  áp trên đường **tải byte** (`fetchGuarded`, `redirect: "manual"`, guard lại từng
  chặng). Docstring của `url-safety.ts` tự nhận là *"nơi DUY NHẤT quyết định OneFlow
  có được nạp một URL hay không"*, và docstring của `fetchGuarded` gọi đích danh
  đúng khuyết tật này (*"guard đã viết, chỉ là không bao giờ tới được sau chặng
  một"*) — nhưng bản sửa chỉ áp cho **một trong hai** đường nhận URL từ phía kia.
  Một 302 từ library trên `/v1/search` đẩy chính request của OneFlow tới host bất
  kỳ, gồm `169.254.169.254` và dải RFC1918, không giới hạn số chặng.
  **Đã kiểm tại nguồn:** `grep 'redirect:' src/lib/media-library/*.ts` chỉ ra một
  chỗ duy nhất, ở `import.server.ts:97`. Mức độ có giới hạn — theo chuẩn fetch,
  header `Authorization` bị gỡ khi chuyển hướng khác origin, và `contracts_version`
  chặn phần lớn đường đọc ngược — nên đây là SSRF **mù/dò**, không phải đọc được dữ
  liệu. Nhưng request vẫn được phát đi, và bất biến kiến trúc thì gãy. Sửa là một
  dòng mỗi chỗ gọi, hoặc nâng `fetchGuarded` lên dùng chung.
- **`MEDIA_LIBRARY_URL` không được kiểm — khoá API đi được qua `http` trần.**
  `resolveConfig()` chỉ trim và bỏ dấu `/` cuối, không `new URL()`, không ép scheme;
  `call()` thì gắn `authorization: Bearer <apiKey>` vào mọi request. Cùng tính năng
  đó **từ chối** URL ký không phải https ở đường tải byte, nên hai nửa của một biên
  bất đồng về cùng một luật, và nửa yếu hơn lại là nửa mang bí mật.
- **Nhánh chẩn đoán của guard a11y là mã chết.** Script chạy dưới `set -euo pipefail`;
  dòng gán `got=$(... | grep -o 'data-proto-state=...' | ...)` khi trang **không**
  đóng dấu — đúng ca guard sinh ra để bắt — thì `grep` trả 1, `pipefail` đẩy lên,
  `set -e` giết script ngay tại đó. Câu `FAIL: rendered state '<none>'` và cả bộ đếm
  `MISSING` không bao giờ chạy. **Tái lập được trên bash 3.2.57 (mặc định macOS):**
  heredoc lặp lại đúng bốn dòng đó thoát 1 và không in gì. Hệ quả: E24 đỏ thì báo
  cáo ghi một exit 1 trần không lời giải thích, thay vì nêu tên trạng thái lệch.
  PASS của E24 **không** bị yếu đi vì thế — nhánh chết chỉ chạm tới khi đã có lỗi —
  nhưng lần đỏ kế tiếp sẽ khó đọc.

Mười bốn cái còn lại: `MEDIA_LIBRARY_URL=""` lưu trong kho khoá âm thầm che mất giá
trị hợp lệ trong `process.env` · bảng cấu hình in nguyên văn `SyntaxError` /
`"Failed to fetch"` ra mặt người dùng · `Location` dị dạng bị báo là hỏng ở máy mình ·
nhập thành công mà `id` vắng thì `fileKey` bị vứt lặng lẽ · Enter đi vòng qua khoá
nút Tìm · một chú thích tiếng Việt trong `.env.example` phạm luật *English only* ·
và bảy lỗ thủng nữa của bộ đo, gồm cái **sáu ui-check chụp hằng viết cứng trong file
prototype chứ không phải câu node thật render qua `t()`** — chính là điều owner đã
đọc và ký nhận ở mục E25 dưới đây.

### E25 / AC-15 — owner ký ĐẠT kèm một chặng khai rõ là KHÔNG đạt (29/08/2026)

Owner xem lại mười lăm khung sau khi được trình đúng ba sự thật, **trước** khi ký:

1. **Sáu trên chín khung ui là bản mô phỏng** (`/proto/add-media-library?state=…`),
   ba khung là sản phẩm thật (E4, E20, E29). Lượt đo cuối độc lập xác nhận cùng
   điều đó theo đường khác: sáu ui-check khẳng định trên **hằng viết cứng trong file
   prototype**, không phải câu node thật render qua `t()`.
2. **Khung `E16-step2` — băng xanh "Đã nạp xong…" kèm thẻ "Node video mới trên
   canvas / file_key: …" — KHÔNG tồn tại trong sản phẩm.** Kiểm bốn chỗ độc lập:
   hợp `Outcome` không có nhánh `imported`; sau khi nạp node gọi `expands(...)` rồi
   `setOutcome({kind:"idle"})`; không file nào trong năm file ngôn ngữ có khoá
   `imported`; và `outcomeMessageKey` trả `"idle"` — một khoá **không được render ở
   đâu cả**, nó chỉ dùng để so với `thinShelf`.
3. **Chặng sau-khi-nạp trong sản phẩm: node trở về một ô tìm kiếm trống.** Phản hồi
   thật duy nhất là node video xuất hiện trên canvas, và **không khung nào trong bộ
   bằng chứng này chụp được điều đó** — E20 chụp chính node "Nạp từ kho" ở trạng
   thái rỗng, không phải node video sau khi nạp.

**Phán quyết của người ký:** E25 **ĐẠT** cho tám chặng còn lại — chưa-cấu-hình, lối
thoát ngay tại chỗ hỏng, đang-tìm, có-kết-quả, kệ-mỏng, chưa-xếp-theo-nghĩa,
đang-nạp, lệch-phiên-bản — mỗi chặng đọc khác các chặng kia và kết quả suy giảm
không bao giờ trình y hệt kết quả sạch. **Chặng sau-khi-nạp: KHÔNG đạt**, khai rõ ở
đây thay vì để chữ ký phủ lên nó. Trạng thái `imported` đã được thiết kế, quét a11y
và duyệt ở Cổng 1, nhưng chưa bao giờ tới sản phẩm; guard proto **không thể** đỏ vì
việc đó, vì nó chỉ đo proto. Việc cài nó là hợp đồng riêng, không phải một vòng vá
nữa trong hồ sơ này.

## Notes
- `suggested_in_s` / `suggested_out_s` có trong schema nhưng library **chưa bao giờ
  điền** — không xây gì trên chúng hôm nay.
- `GET /v1/assets/:id` trả 404 cho cả "không tồn tại" lẫn "không thấy được", theo
  thiết kế của library. Node nói đúng điều đó, không đoán hộ.
- Văn bản của thẻ (caption, subjects, curator_note, tên thực thể) là **nội dung của
  bên thứ ba**: library đã khử markup/ký tự điều khiển, nhưng nếu OneFlow đưa thẻ vào
  prompt LLM về sau thì vẫn phải coi là **dữ liệu, không phải lệnh**.
