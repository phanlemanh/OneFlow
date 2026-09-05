# Node nạp-từ-kho (`add/media-library`) — thiết kế giai đoạn A của ADR-0012

*2026-08-19 · hạng mục roadmap **1.3b** · làn NHẸ của pilot dây chuyền N=2
([spec pilot](2026-08-19-pilot-day-chuyen-n2.md)) · nhánh `feat/add-media-library`.*

## 1 · Đề bài

Một node "add" mới trên canvas cho phép người dùng **tìm trong media-library** rồi
**nạp một asset về kho file của OneFlow** thành `file_key`, để mọi node phía sau
tiêu thụ y như một file vừa upload. Đây là **giai đoạn A** (chỉ đọc) của
[ADR-0012](../../adr/0012-media-library-boundary.md); ghi ngược (ingest +
telemetry) là giai đoạn B, sống trong hạng mục 1.6.

Chuỗi năm chặng: **cấu hình → tìm → chọn thẻ → nạp bytes → giao canvas**.

## 2 · Hợp đồng thật của media-library (đã đọc, không phải suy đoán)

Đọc từ `~/dev/media-library` — `packages/contracts/src/`, `apps/api/src/`:

| Thứ | Giá trị thật |
|---|---|
| Auth | `Authorization: Bearer <key>`; hai endpoint cần **scope `search`** |
| Phiên bản | `contracts_version` là **trường trong body của MỌI response**, kể cả lỗi; hiện **`0.2.0`**. Không có header, không có endpoint version. `GET /v1/health` không cần auth |
| Tìm | `POST /v1/search`, body `{intent (bắt buộc, 1–500 ký tự), media_type?, entity_id?, exclude_ids? (≤50), limit? (≤20, mặc định 5)}` |
| Trả về | `{cards, context, candidates, skipped, warnings, contracts_version}` |
| Chi tiết asset | `GET /v1/assets/:id` → `{card, urls:{original, proxy, thumb}, expires_in_s, contracts_version}` |
| URL ký | `urls.original` — **luôn có** (không có original thì cả endpoint trả 404); TTL **900 giây** |
| Lỗi | 401 `unauthorized` · 403 `forbidden: cần scope <x>` · 400 `bad_request` / `entity_not_found` · 404 `not_found` · 501 `not_implemented` · 500 trần. **Không có 429** — dịch vụ không có rate limit |

Ba điều của hợp đồng đắt hơn phần còn lại, vì chúng định hình code:

1. **`provenance` là union MỞ** — `'real'|'real-model'|'render-3d'|'scale-model'|'stock'`
   **hoặc** chuỗi khớp `generated:${provider}@${hash}`. Chép thành union đóng
   trong TypeScript là sai *từ trong trứng*: `switch` trên nó không bao giờ đúng.
2. **`urls` không kèm `mime`, `size_bytes` hay `filename`.** Ba trường đó không
   nằm trong `zAssetDetail`, không nằm trong `zMediaCard`, và cũng không phải cột
   của bảng `media_assets`. Bên nạp **phải tự suy** đuôi file.
3. **`license_label` là công bố pháp lý bắt buộc hiển thị khi có** (chú thích
   ngay trong `media-card.ts`). Bỏ nó đi là lỗi tuân thủ, không phải lỗi thẩm mỹ.

Ngoài ra: `renditions.thumb_url`/`proxy_url` trên thẻ tìm kiếm **cũng ký và cũng
hết hạn sau 900 giây**, nhưng response tìm kiếm **không** trả `expires_in_s` —
cache thẻ quá 15 phút là ảnh vỡ không báo trước.

## 3 · Kiến trúc — ba mảnh, ranh giới rõ

```
[add-media-library-node.tsx]  client, chỉ UI + gọi 2 route
        │  POST /api/media-library/search   { intent, limit }
        │  POST /api/media-library/import   { assetId }
        ▼
[src/app/api/media-library/*/route.ts]  vỏ mỏng: đọc body, gọi lib, map lỗi
        ▼
[src/lib/media-library/*.server.ts]  toàn bộ nghiệp vụ
        ├── config.server.ts   đọc MEDIA_LIBRARY_URL + _API_KEY từ env-store
        ├── client.server.ts   fetch REST, kiểm contracts_version, map lỗi
        └── import.server.ts   tải bytes qua URL ký → saveFile() → file_key
```

**Vì sao route chứ không phải Server Action.** Repo có **28 route handler và
KHÔNG một file `"use server"` nào**; `src/lib/api/client.ts` là đường client→server
duy nhất đang dùng. Dựng Server Action cho đúng một feature là mở một khuôn mới
(bundling, security surface, quy ước test) trái với luật "theo khuôn sẵn có" của
CLAUDE.md. Đường vòng đó cũng **không đổi hạng rủi ro**: xem §4.

**Vì sao bytes đi qua server chứ không qua browser.** Nếu trả URL ký về client
để browser tải rồi upload ngược lên `/api/upload`, bytes đi hai lượt qua máy
người dùng và URL ký lộ ra tab trình duyệt. Tải phía server là một lượt, và URL
ký không rời tiến trình Node.

**Không dùng `downloadAndSave()` sẵn có.** `src/lib/file/file-utils.ts:34` có đúng
hàm cần — `fetch(url)` → `saveFile()` — nhưng **không kiểm scheme, host, hay kích
thước**, và hiện **không ai gọi** (grep toàn repo: 0 caller). Nối nó vào một
feature nhận URL từ dịch vụ ngoài là thừa kế nguyên một lỗ SSRF. `import.server.ts`
tự tải, với ba chặn: **chỉ `https:`** (trừ khi `MEDIA_LIBRARY_URL` là
`http://localhost` — cửa dev), **trần kích thước**, **timeout**. Hàm cũ để nguyên
trạng thái chết, không đụng.

## 4 · Hạng rủi ro: **T3**, và không có đường vòng

Đăng ký một add node trải trên **năm** điểm; hai trong số đó nằm dưới
`src/lib/workflow/**` — một `t3_paths` của repo:

| Điểm | File | Vì sao phải sửa |
|---|---|---|
| Bản đồ nodeTypes | `src/components/workspace/types.tsx:113` | canvas mới render được node |
| Danh mục ADD | `src/components/workspace/types.tsx:220` | node hiện trong nhóm |
| Bảng chọn | `src/components/workspace/smart-island.tsx:206` | người dùng thêm được node |
| **Ánh xạ add→modality** | **`src/lib/workflow/flow-connection-shared.ts:13`** | validate cạnh |
| **Bản sao của chính ánh xạ đó** | **`src/lib/workflow/exporter.ts:493`** | export workflow |

Nên hạng là **T3** dù chọn Server Action hay route — chọn route là chọn theo khuôn
repo, không phải để né cổng. T3 kéo theo **Gate 1.5 duyệt plan**; xem §8.

## 5 · Quyết định phạm vi: giai đoạn A chỉ nạp **video**

`ADD_NODE_OUTPUT_TYPE` là `Record<string,string>` **tĩnh**, và
`getEffectiveOutputType()` với add node chỉ tra bảng đó — nó **không** đọc
`sourceHandle` động (nhánh đọc handle chỉ chạy cho node ABI). Một node có modality
đổi theo asset vừa chọn vì thế không khớp cơ chế hiện có.

Hai đường:

- **(C) Khoá video ở giai đoạn A** — `addMediaLibraryNode: "videoNode"`, request
  ghim `media_type: "video"` nên kết quả **không bao giờ hiện thứ không nạp được**.
  Khớp đúng lý do 1.3b tồn tại: mở input cho **skill #1 "Footage → kho clip"**.
- **(E) Cho handle động** — thêm một nhánh chung vào `getEffectiveOutputType`: nếu
  `sourceHandle` là `out:<loại>` và `<loại>` là data node hợp lệ thì lấy nó. Gọn,
  nhưng **đổi ngữ nghĩa dùng chung cho cả bảy add node** đang chạy, trong file T3,
  mà hôm nay không eval nào phủ.

**Chọn (C).** Ảnh/audio/floorplan vào `Out of scope` với điều kiện mở lại (skill #2
cần ảnh). Đây là lát cắt, không phải giới hạn vĩnh viễn — và (E) vẫn còn nguyên
đó khi có lý do thật.

## 6 · Ba bảo đảm ADR-0012 được hiện thực ra sao

**#2 Không phụ thuộc cứng.** Thiếu `MEDIA_LIBRARY_URL` hoặc `MEDIA_LIBRARY_API_KEY`
→ node hiện trạng thái *thiếu-cấu-hình* **gọi đúng tên biến**, theo đúng câu chuẩn
repo đã có: `Missing required env var <KEY>` (`src/lib/plugin-executor/required-env.ts:41`).
Không có lời gọi mạng nào lúc khởi động; không route nào của studio phụ thuộc
module này. Studio thiếu library vẫn chạy nguyên vẹn.

**#3 Lĩnh vực là dữ liệu.** Mọi trường từ vựng của library —`provenance`,
`scene_kind`, `entity.kind`, `entity.specificity`, `energy`, `interior_state`,
`license_label`, `relation_text` — vào TypeScript dưới dạng **`string` mờ**, được
render nguyên văn, **không** union đóng, **không** `switch`, **không** bảng dịch
phía OneFlow. Library mở sang tài chính/bảo hiểm thì node này thừa hưởng bằng 0
dòng code. Có một guard chạy được canh điều này (§7).

**#7 Ranh giới có phiên bản.** Adapter ghim `SUPPORTED_CONTRACTS = "0.2"`. Đối
chiếu `contracts_version` của mọi response: khác **major** → từ chối gọi đúng tên
(`MEDIA_LIBRARY_VERSION_MISMATCH`). Vì library đang ở `0.x`, nơi minor *là* trục
phá vỡ (0.1.0 → 0.2.0 khai sinh mặt tiền search), **`0.x` được đối chiếu tới cả
minor**; từ `1.0.0` trở đi chỉ đối chiếu major. Đây là diễn giải chặt hơn chữ
"lệch major" của ADR, và là chủ ý — nới ra lúc nào cũng được, siết lại thì đã muộn.

## 7 · Suy đuôi file khi hợp đồng không cho mime

`saveFile(buffer, ext)` cần một đuôi. Không có `mime`/`filename` từ library, nên
suy theo thứ tự, dừng ở cái đầu tiên có nghĩa:

1. đuôi trong đường dẫn của `urls.original` (URL ký của Supabase giữ tên gốc);
2. `Content-Type` của chính response tải bytes, qua một bảng mime→ext **generic**;
3. mặc định `mp4` (giai đoạn A chỉ video).

Đuôi sai không chỉ xấu — `/api/uploads/[...path]` suy Content-Type **từ đuôi**, nên
một `file_key` sai đuôi là một video không phát được trên canvas.

## 8 · Kiểm chứng

- **Đơn vị**: `config.server`, `client.server` (ma trận **tám** cách hỏng, chốt phiên
  bản), `import.server` (chỉ https, trần kích thước, suy đuôi). Mọi test dựng **máy
  chủ giả cục bộ** đúng hình dạng hợp đồng thật — không gọi mạng.
- **Call-site, không phải hàm**: một suite đi **qua chính route handler**, chỉ stub
  `globalThis.fetch` và kho file, không có điểm tiêm nào khác — đúng khuôn
  [`src/app/api/settings/env/route.test.ts`](../../../src/app/api/settings/env/route.test.ts)
  đã dùng cho byo-key. Lý do: một `import.server.ts` viết đủ ba chặn mà route lại gọi
  tắt `downloadAndSave()` sẽ làm mọi test mức-hàm xanh và vẫn ship nguyên lỗ. Kèm một
  guard khẳng định `downloadAndSave` vẫn **0 caller** sau thay đổi.
- **Guard từ vựng lĩnh vực**: script quét `src/lib/media-library/**` + file node,
  đỏ khi thấy chuỗi từ vựng BĐS của library. Có **nửa đàn áp**: fixture cắm
  `"noi-that"` phải làm guard đỏ, nếu không guard chỉ là trang trí.
- **Giao diện**: các trạng thái của node — thiếu-cấu-hình, đang tìm, kệ mỏng,
  kết quả không xếp hạng, đang nạp, xong, lỗi có tên — chụp thật ở `/proto/add-media-library`.
- **Ranh giới hạng**: guard khẳng định diff **không** chạm `config/tongflow.abi.json`,
  `src/generated/abi/**`, `sdk/**`, `src/db/**` — đúng lời hứa "add node không đụng ABI/SDK"
  và cũng là lời khai phân vùng với làn nặng của pilot.

## 9 · Ngoài phạm vi (giai đoạn A)

Ingest ghi ngược + telemetry lượt dùng (bảo đảm #5) — giai đoạn B, hạng mục 1.6 ·
`entity_id` / đồ thị thực thể (#4) — hạng mục 1.7 · ảnh/audio/floorplan — §5 ·
phân trang quá ~50 kết quả (hợp đồng không diễn đạt được: `limit` ≤20,
`exclude_ids` ≤50, không cursor) · nạp nhiều asset một lượt.

## 10 · Giới hạn đã biết, khai trước

- Thẻ tìm kiếm cache quá **15 phút** thì `thumb_url` chết mà không có tín hiệu
  (response tìm kiếm không trả TTL). Giai đoạn A **không** làm mới thẻ tự động —
  người dùng để node mở lâu sẽ thấy ảnh vỡ và phải tìm lại. Đây là giới hạn đã khai
  trong contract, không phải thứ đã có xử lý.
- `suggested_in_s`/`suggested_out_s` có trong schema nhưng **library chưa bao giờ
  điền**; không xây gì trên hai trường đó hôm nay.
- `GET /v1/assets/:id` trả 404 cho cả "không tồn tại" lẫn "không thấy được" — theo
  thiết kế của library. Node không đoán hộ, chỉ nói đúng điều đó.
