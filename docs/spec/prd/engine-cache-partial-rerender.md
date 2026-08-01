# Spec: Cache nội-dung-địa-chỉ & Partial Re-render trong engine

> Hạng mục **0.4** của kế hoạch sản phẩm. Trạng thái: **draft, chờ review**.
> Tài liệu này tự chứa — người đọc không cần lịch sử chat để build được.

## 1. Vì sao việc này đứng đầu hàng đợi

Toàn bộ luận điểm kinh tế của sản phẩm là **"sửa miễn phí — sinh mới mới tính tiền"**.
Đó không phải khẩu hiệu marketing: nó là COGS. Gói thuê bao phẳng cho seller chỉ có
biên dương nếu một vòng sửa (đổi giá, đổi hook, đổi khung khuyến mãi) **không** kéo
theo việc sinh lại toàn bộ video trên GPU.

Hôm nay engine chưa có gì như vậy. `runner.py` chạy tuần tự toàn bộ `executionLevels`,
không cache, không dirty-tracking, không resume, không có API "chạy từ node X". Mọi
lần chạy lại là chạy lại từ đầu. Nghĩa là mệnh đề trung tâm của mô hình kinh doanh
hiện **chưa tồn tại trong code** — ba giám khảo hội đồng độc lập cùng chỉ ra điều này.

Kịch bản chuẩn phải chạy được sau khi làm xong:

> Seller có 200 video đã render. Đợt sale đổi giá 99K → 89K. Node giá đổi → node
> overlay chạy lại (~vài giây CPU mỗi video). **Node sinh video không chạy lại.**
> Chi phí vòng sửa ≈ 0 GPU-giây.

## 2. Hiện trạng (đã kiểm chứng trên code)

| Sự việc | Vị trí |
|---|---|
| Vòng lặp tuần tự theo level, không song song dù `executionLevels` được thiết kế cho song song | [`runner.py:294-397`](../../../sdk/tongflow/engine/runner.py) |
| Không có cache/memo/resume ở bất kỳ đâu trong engine | — |
| `file_key` sinh bằng `uuid4()`, **không** theo nội dung | [`store.py:59`](../../../sdk/tongflow/engine/store.py), `store.py:94` |
| `MemoryStore` (mặc định khi `inline_outputs=True`) trả handle `mem://<uuid>` — chết ngay khi hết tiến trình | `store.py:59` |
| Đầu vào được materialize thành base64 tại chỗ trước khi gọi plugin | `runner.py:330` (`materialize_asset_inputs`) |
| Plugin gọi qua subprocess, một JSON vào / một JSON ra | [`invoker.py:111-121`](../../../sdk/tongflow/engine/invoker.py) |
| Khoá `_tongflow` (progressUrl/token) được trộn vào prompt — per-run, **không** mang nghĩa ngữ nghĩa | `invoker.py:82-89` |
| Plugin clone `--depth 1`, **không ghi lại commit sha** | [`plugins.py:58-65`](../../../sdk/tongflow/engine/plugins.py) |
| Tiền lệ hashing duy nhất trong SDK: marker sha256 cho venv | `plugins.py:112-129` |
| Không có định danh cho lần chạy — `task_id` mặc định hằng số `"tongflow-engine"` | `runner.py:182` |
| 23/61 slot có núm bất định (`seed`, `temperature`, `top_p`); `seed` **không** nằm trong `required` | `sdk/tongflow/_data/tongflow.abi.json` |
| Engine **bỏ qua hoàn toàn** `batchField` mà exporter TS phát ra | `exporter.ts:648` ↔ không có mã tương ứng trong `engine/` |

## 3. Quyết định thiết kế

### D1 — Điểm móc: ngay sau `materialize_asset_inputs`

Hash tại `runner.py:330`, **sau** khi asset đã được materialize. Lý do: `business_input`
lúc đó chứa bytes thật của mọi trường `$ref: Asset`, nên khoá là **nội-dung-địa-chỉ
miễn phí** — không cần đọc thêm file. Hash trước đó (`params`, dòng 327) chỉ cho ta
khoá theo *tham chiếu*: cùng `file_key` nhưng bytes đã đổi vẫn trúng cache sai.

### D2 — Thành phần khoá

```
node_fingerprint = sha256(canonical_json({
  "v":         1,                    # phiên bản lược đồ khoá — bump là vô hiệu hoá toàn bộ
  "slot":      node.feature,
  "pluginId":  node.pluginId,
  "pluginRev": <commit sha của plugin>,
  "model":     node.model | null,
  "sdkMajor":  <major.minor của tongflow>,
  "input":     digest_form(business_input)
}))
```

**Bắt buộc loại khỏi khoá** — mỗi cái đều từng đủ sức phá cache nếu lọt vào:
`_tongflow` (per-run token), `taskId`, `rawConfig` (chỉ để khôi phục UI),
`label`/`comment`/`locked`, `level`/`dependencies`, `exportedAt`, và `outputs` routes
(routing quyết định *chiếu* kết quả đi đâu, không quyết định plugin *tính* ra gì).

`digest_form()` duyệt cấu trúc và thay mọi `bytesBase64` bằng `{"__asset": "<hex>"}` —
cùng hằng `ASSET_DIGEST_KEY` mà [`callog.py`](../../../sdk/tongflow/engine/callog.py) dùng,
vì L1 tính khoá **từ chính** `normalize_call()` chứ không viết lại luật chuẩn hoá. Nhờ vậy
khoá cache và log mà conformance suite đối chiếu là **một**, thay vì hai định nghĩa song
song của cùng một thao tác. Không hash chuỗi base64 trực tiếp: một video 200MB sẽ thành
chuỗi ~270MB phải serialize lại mỗi lần — thay bằng digest thì khoá ngoài luôn nhỏ và ổn định.

`pluginRev` là điều kiện đúng đắn, không phải tuỳ chọn: plugin hiện clone không pin,
nên sửa code plugin mà khoá không đổi sẽ tái dùng kết quả của phiên bản cũ. Cần bổ
sung việc ghi lại `git rev-parse HEAD` lúc clone/scan (`plugins.py`).

### D3 — Hai tầng cache, chia theo tính bất định

Đây là quyết định quan trọng nhất, và nó **né được toàn bộ tranh cãi về seed**.

Cache này **không** phải "cùng input → đảm bảo cùng output" (bất khả thi với seed ngẫu
nhiên). Nó là: **"input không đổi → dùng lại đúng cái bạn đã tạo ra"**. Với bài toán
re-render thì đó mới là ngữ nghĩa đúng.

| Tầng | Áp dụng cho | Phạm vi | Ví dụ slot |
|---|---|---|---|
| **A — nội dung, trong tenant** | Slot tất định (không có núm bất định, hoặc có nhưng đã ghim) | Trong tenant, chéo workflow | `concat-videos`, `extract-audio`, `get-first-frame`, `transcribe`, `parse-document`, `image-upscale` (đã ghim seed) |
| **B — memo theo workflow** | Slot bất định chưa ghim seed | Chỉ trong phạm vi workflow + tenant | `image-gen`, `text-gen-video`, `image-gen-video`, `gen-music`… |

Tầng B tuyệt đối không rò chéo workflow/tenant: hai người dùng có input trùng nhau
vẫn phải nhận kết quả riêng.

**Cả hai tầng đều khoá theo tenant** (quyết định 29/07, Manh). Tính tất định **không**
quyết định *có chia sẻ chéo tenant hay không* — nó chỉ quyết định độ rộng **bên trong**
một tenant: tầng A dùng lại được chéo workflow, tầng B thì không.

Lý do không chia sẻ chéo tenant: `transcribe` là tất định, nên tầng A dùng chung toàn hệ
thống sẽ trả bản chép của tenant A cho tenant B khi B có đúng bytes đó. Nội dung không lộ
thêm gì (cùng input tất định thì cùng output), nhưng cơ chế là một **existence oracle** —
có bytes trong tay là biết người khác đã xử lý đúng bytes đó chưa, suy ra được qua độ trễ
hoặc qua hoá đơn mà không cần đọc nội dung. Nó đi ngược niềm tin nền số 5 của
[vision.md](../../strategy/vision.md). **Đừng "tối ưu" nó ngược lại như một cải tiến hiệu
năng**; đầy đủ lý lẽ ở [design doc 29/07](../../superpowers/specs/2026-07-29-cache-open-questions-design.md) §2.

Tầng B ngoài ra còn **sai ngữ nghĩa** nếu dùng chéo workflow, không chỉ là chuyện bảo mật:
cache này là *"input không đổi → dùng lại đúng cái bạn đã tạo ra"*, và "cái bạn đã tạo ra"
gắn với workflow đã sinh ra nó.

### D4 — Dirty propagation là hệ quả, không phải cơ chế riêng

Không cần xây dirty-tracking. Vì fingerprint của một node bao gồm input đã materialize,
mà input đó đến từ output của node trên, nên:

- Node trên không đổi → output không đổi → fingerprint node dưới không đổi → trúng cache.
- Node trên đổi → output đổi → fingerprint node dưới đổi → tự động chạy lại.

Lan truyền "bẩn" nổi lên tự nhiên từ nội-dung-địa-chỉ. Vòng lặp vẫn duyệt tuần tự
từng level như hiện nay; mỗi node chỉ hỏi thêm một câu "đã có kết quả cho fingerprint
này chưa?".

### D5 — Một lần trúng cache phải khôi phục **ba** thứ

Đây là cái bẫy dễ mắc nhất. Bỏ qua `materialize_asset_inputs` + `invoke_plugin` là
chưa đủ; vẫn phải thực thi phần hạ nguồn ở `runner.py:356-373`:

1. `node_outputs[node_id] = result`
2. `output_views[node_id] = compute_output_view(routes, result)`
3. Làm mới `data_node_state[route.downstreamDataNodeId]` cho mọi route

Thiếu (2) hoặc (3) thì node hạ nguồn đọc `output_views` rỗng (`bindings.py:30-32` trả
`[]`) và **âm thầm** chạy với input rỗng — hỏng dữ liệu chứ không báo lỗi.

### D6 — Store: cache phải giữ bytes, không giữ handle

`MemoryStore` trả `mem://<uuid>` chỉ sống trong tiến trình. Lưu `result` chứa handle
đó vào cache là lưu một con trỏ chết.

Thiết kế: mỗi entry nằm ở `<data_dir>/.tongflow/node-cache/<hash[:2]>/<hash>/` gồm
`result.json` (kết quả plugin với asset đã thay bằng tham chiếu blob) và các blob nội
dung-địa-chỉ dùng chung ở `.../blobs/<sha256>`. Khi **trúng**, engine `put` lại blob
vào store **của lần chạy hiện tại** rồi mới dựng `result` — nhờ vậy hạ nguồn luôn thấy
`file_key` hợp lệ trong store đang dùng, bất kể Memory/Disk/Http.

Hệ quả phụ đáng giá: blob dedupe theo sha256, nên 200 video khác nhau chỉ khác overlay
vẫn chia sẻ mọi blob nguồn.

### D7 — API

```python
run_workflow(
    workflow, inputs,
    reuse="auto",        # "auto" | "off" | "force"
    reuse_scope=None,    # khoá phạm vi tầng B: (tenant, workflowId)
    ...
)
```

- `auto` (mặc định): tầng A + tầng B như D3.
- `off`: bỏ qua cache hoàn toàn — dùng cho benchmark và khi cần chủ động sinh lại.
- `force`: coi cả slot bất định như tầng A **trong cùng tenant**. Chỉ dành cho debug,
  **không** phơi ra UI.
- `reuse_scope` là `(tenant, workflowId)` và **bắt buộc cho cả hai tầng** sau quyết định
  29/07. **Thiếu scope → tắt cache hoàn toàn**, không rơi về dùng chung. Đây là điểm
  fail-closed quan trọng nhất của cả gói: nếu thiếu scope mà âm thầm dùng chung thì một
  lỗi cấu hình ở cloud sẽ khôi phục lại đúng existence oracle mà D3 vừa đóng — và khôi
  phục **im lặng**. Desktop cấp một scope tenant cục bộ, nên đường self-host không mất
  cache vì luật này.

Không cần tham số `from_nodes`: "chạy từ node X" là hệ quả tự nhiên của D4, và một API
tường minh sẽ mở đường cho việc bỏ qua node mà người dùng *tưởng* đã đổi.

### D8 — Không bao giờ cache thất bại

Chỉ ghi cache khi `result.success !== false` và không có ngoại lệ. Lỗi hạ tầng nhất
thời mà bị cache lại thành lỗi vĩnh viễn là kiểu bug tệ nhất trong nhóm này.

## 4. Kịch bản tham chiếu — đổi giá 200 video

```
[text: giá]──┐
[ảnh SKU]────┼─→ (image-gen-video) ─→ (compose-overlay) ─→ [video ra]
[hook text]──┘        tầng B                tầng A
```

Vòng 1: cả hai node chạy. Vòng 2 (chỉ đổi node giá):

| Node | Fingerprint | Kết quả |
|---|---|---|
| `image-gen-video` | không đổi (giá không nối vào node này) | **trúng tầng B** → 0 GPU-giây |
| `compose-overlay` | đổi (text giá nằm trong input) | chạy lại, ~1-2s CPU |

Đây chính là con số phải đo được để chứng minh luận điểm: **tỷ lệ % render là partial**
(mốc 6 tháng: ≥25%). Cần phát sự kiện `node_cached` bên cạnh `node_completed` để
telemetry đếm được.

## 5. Hai runtime — nợ phải trả trước

Canvas (TS) và engine (Python) là hai cỗ máy ngữ nghĩa khác nhau, và **đã lệch thật**:
exporter phát `batchField` ([`exporter.ts:648`](../../../src/lib/workflow/exporter.ts))
nhưng engine không có một dòng nào xử lý. ~30 slot dùng `batchOn()`, nên với những
slot đó canvas fan-out thành N lời gọi còn engine gọi **một** lần với cả mảng.

Với cache, lệch ngữ nghĩa không còn là bất tiện mà thành **nguy cơ đúng-sai**: tái
dùng một artifact được sinh theo ngữ nghĩa khác là trả về kết quả sai một cách im lặng.

Vì vậy: **conformance suite chạy cùng fixture qua cả hai đường và fail CI khi lệch là
điều kiện tiên quyết**, với `batchField` làm ca kiểm thử số 1. Không có nó thì không
bật cache mặc định.

## 6. Lộ trình theo lát (mỗi lát tự đứng được)

| Lát | Nội dung | Xong khi |
|---|---|---|
| **L0** | Ghi `pluginRev` lúc clone/scan; phát sự kiện `node_cached`; conformance suite TS↔Python với ca `batchField` | CI đỏ khi hai runtime lệch |
| **L1** | `digest_form()` + `node_fingerprint()` + test vector; **chưa** đọc/ghi cache | Fingerprint ổn định qua các lần chạy, đổi input là đổi khoá |
| **L2** | Store cache trên đĩa + blob dedupe + khôi phục 3 thứ (D5); chỉ **tầng A** | Chạy lại workflow ffmpeg thuần → 100% trúng, kết quả byte-identical |
| **L3** | Tầng B (memo theo workflow+tenant) | Kịch bản mục 4 đạt: đổi giá không tốn GPU-giây |
| **L4** | Eviction LRU theo dung lượng + `reuse=` API + telemetry tỷ lệ partial | Cache có trần dung lượng; đo được % partial |

## 7. Rủi ro & câu hỏi cần chốt

| # | Vấn đề | Đề xuất |
|---|---|---|
| R1 | Plugin sửa code mà khoá không đổi → tái dùng kết quả cũ | `pluginRev` trong khoá (bắt buộc, L0) |
| R2 | Đĩa phình vô hạn | Trần dung lượng cấu hình được, LRU, mặc định 20GB (L4) |
| R3 | Rò dữ liệu chéo tenant ở cloud | **Cả hai** tầng khoá theo tenant (29/07). Tính tất định chỉ quyết định độ rộng *trong* một tenant, không cấp quyền chia sẻ ra ngoài. Existence oracle của tầng A dùng chung toàn hệ thống **đã bị đóng bằng chính luật này** — đừng mở lại dưới dạng một tối ưu hoá |
| R4 | Cache một lỗi tạm thời | D8 — không bao giờ cache `success:false` |
| R5 | Hai runtime lệch → tái dùng sai ngữ nghĩa | Conformance suite là điều kiện tiên quyết (mục 5) |
| R6 | Đổi `sdkMajor` vô hiệu hoá toàn bộ cache | Chấp nhận; đây là hành vi đúng, chỉ cần cảnh báo trong changelog |
| **Q1** | Có gộp `store.py:59/94` thành nội-dung-địa-chỉ luôn không? | **Chốt 29/07: KHÔNG.** `HttpStore` nhận `file_key` do host cấp nên "có" không thể làm đồng nhất ba store; UUID đang gánh vai trò vòng đời chứ không chỉ là tên; D6 đã thu phần lợi. Mở lại chỉ khi có số đo |
| **Q2** | Cache có dùng chung giữa desktop (self-host) và cloud không? | **Chốt 29/07: KHÔNG** — hệ quả của việc tầng A khoá theo tenant, không còn là phán đoán |
| **Q3** | Cửa sổ sống của tầng B bao lâu? | **Chốt 29/07: LRU theo dung lượng là cơ chế thu hồi duy nhất** (chung cho A và B), cộng `purge(tenant, workflowId)` best-effort. **Không TTL** — hai cơ chế thu hồi thì khi cache mất phải điều tra xem cái nào đã ăn |

> **Tu chỉnh (cache-l4-eviction, Gate 1, 31/07):** `reuse="force"` (D7) bị descope khỏi lát này — không triển khai (ledger `d-20260731T014332Z-32155`). `auto` và `off` đã lên hàng.

## 8. Phác tiêu chí nghiệm thu (cho lúc build từng lát)

- Workflow ffmpeg thuần chạy hai lần → lần hai trúng cache 100%, output byte-identical.
- Đổi đúng một node text → chỉ node đó và hạ nguồn của nó chạy lại; số lời gọi plugin giảm đúng bằng số node trúng.
- Node trúng cache vẫn làm hạ nguồn nhận đủ input (chống bẫy D5): workflow 3 tầng, node giữa trúng cache, node cuối vẫn ra kết quả đúng.
- Xoá thư mục cache → kết quả không đổi, chỉ chậm hơn (cache không được là nguồn sự thật).
- `success:false` không bao giờ tạo entry.
- Hai tenant cùng input ở slot **bất định** → **không** dùng chung kết quả.
- Hai tenant cùng input ở slot **tất định** → **cũng không** dùng chung kết quả. (Tiêu chí canh quyết định 29/07; thiếu nó thì quyết định đó không có gì canh.)
- Gọi `run_workflow` **không có `reuse_scope`** → không entry nào được đọc và không entry nào được ghi. Fail-closed, không phải "dùng chung".
- `purge(tenant, workflowId)` xoá entry tầng B của đúng workflow đó, **không** chạm workflow khác cùng tenant; gọi hai lần không lỗi.
- Đổi `pluginRev` → không trúng cache cũ.

---

**Người viết:** Claude (phiên 2026-07-25) · **Đã review & chốt Q1–Q3:** Manh 2026-07-29 ·
**Phụ thuộc:** không · **Chặn:** mọi việc phía sau của mô hình gói phẳng (P2 cloud)
