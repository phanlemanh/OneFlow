# Thiết kế — lát L2: store cache trên đĩa, chỉ tầng A

> Lát **L2** của [spec cache](../../spec/prd/engine-cache-partial-rerender.md) §6.
> Tài liệu tự chứa: người đọc không cần lịch sử chat để build được.
>
> **Tiền đề:** lát L1 đã merge 30/07 (`digest_form` / `sdk_major` / `node_fingerprint`
> trong [`fingerprint.py`](../../../sdk/tongflow/engine/fingerprint.py), 16 tiêu chí đã ký).
> **Quyết định bởi:** Manh, 2026-07-30 · **Chặn:** L3 (tầng B), L4 (eviction).

## 1. Lát này giao gì

Cache thật sự đọc/ghi lần đầu. L1 chỉ tính khoá; L2 dùng khoá đó để **bỏ được một lời gọi
plugin**. DoD của §6: *chạy lại workflow ffmpeg thuần → 100% trúng, kết quả byte-identical*.

Chỉ **tầng A** (D3: trong tenant, chéo workflow). Tầng B là L3.

## 2. Điểm móc: cache **per-call**, không per-node

Đọc code trước khi thiết kế, và nó đổi kết luận. Vòng lặp thật ở
[`runner.py`](../../../sdk/tongflow/engine/runner.py) là:

```python
per_call_params = fan_out_inputs(node, params)
for call_params in per_call_params:
    business_input = materialize_asset_inputs(slot, call_params, abi, search_dirs, store)
    raw = invoke_plugin(...)               # hoặc invoker(...) khi host tiêm
    one = convert_asset_outputs_to_file_refs(slot, raw, abi, store)
    results.append(one)
```

`materialize_asset_inputs` nằm **trong** vòng per-call, nên điểm móc của D1 là per-call chứ
không phải per-node. Cache đúng `one` (sau `convert_asset_outputs_to_file_refs`).

### Hệ quả: "cái bẫy dễ mắc nhất" của D5 tự biến mất

D5 cảnh báo: bỏ qua một node thì phải tự khôi phục **ba** thứ — `node_outputs[node_id]`,
`output_views[node_id]`, và `data_node_state[...]` cho mọi route — thiếu (2) hoặc (3) thì node
hạ nguồn âm thầm chạy với input rỗng.

Cache per-call **không bỏ qua node**. Nó chỉ bỏ qua `invoke_plugin` cho từng lời gọi; ba thứ
kia vẫn được tính từ `results` bằng đúng code hiện tại. Không có gì để quên khôi phục.

Thêm một cái được: batch 5 item mà 3 item đã có trong cache thì **trúng 3, chạy 2**. Per-node
không làm được — nó chỉ có trúng-cả-node hoặc trượt-cả-node.

**Đổi lại:** §D5 của spec viết theo giả định per-node, nên cần một dòng amendment (§7 dưới).

### Các đường đã cân nhắc

| Đường | Nội dung | Vì sao không chọn |
|---|---|---|
| **A ⭐** | Per-call, cache `one` | — (chọn) |
| B | Per-node, cache cả `results` + khôi phục 3 thứ của D5 | Đúng cái bẫy D5 gọi tên; mất trúng-một-phần trong batch |
| C | Cả hai tầng | YAGNI; không có số đo nào nói per-node thêm được gì sau khi per-call đã có |

## 3. Khoá: thêm `tenant`, `KEY_SCHEMA_VERSION` → 2

`node_fingerprint()` nhận thêm `tenant: str` **bắt buộc**; chuỗi rỗng hoặc thiếu → trả `None`
= không cacheable, dùng lại đúng cơ chế fail-closed L1 đã có cho `plugin_rev` và `plugin_dirty`.

**Vì sao tenant vào KHOÁ chứ không chỉ vào đường dẫn** (quyết định 30/07, Manh):

Repo đã có seam tenant ở [`scope.server.ts`](../../../src/lib/runtime/scope.server.ts) —
`getScope()` trả `""` ở bản OSS đơn-tenant hoặc user id ở cloud shell, và
`scopedDataDirFor()` cho mỗi user một `<dataDir>/users/<id>/`.
[`engine-delegate.server.ts`](../../../src/lib/task/engine-delegate.server.ts) **đã** truyền
`data_dir` đã-scope. Nên nếu cache nằm dưới `data_dir`, cô lập tenant *có sẵn miễn phí*.

Nhưng cách đó **không thực hiện được tính fail-closed** mà quyết định 29/07 chọn: `scope = ""`
vừa là giá trị **hợp lệ** (OSS đơn-tenant) vừa là triệu chứng **cấu hình sai** (cloud mà
`resolveScope()` trả rỗng cho mọi người). Không cách nào phân biệt hai ca đó từ đường dẫn.

Tenant trong khoá đóng được cả hai: hai tenant lỡ dùng chung `data_dir` vẫn **không thể**
phục vụ chéo, vì khoá khác nhau. Và L1 chưa ghi entry nào nên **bump `v` bây giờ không mất
gì** — để sang L3/L4 là phải vô hiệu hoá một cache đã chạy thật.

### Nửa còn lại: TS phải dịch scope thành sentinel tường minh

`engine-delegate.server.ts` dịch, chứ không truyền thô:

| `getScope()` | `options.tenant` |
|---|---|
| `""` (OSS đơn-tenant) | `"local"` |
| `<id>` (cloud shell) | `"user:<id>"` |

Engine coi chuỗi rỗng / thiếu field là **không cacheable**. Cloud quên map → **mất cache**
(tốn GPU-giây, không sai kết quả) thay vì đồn chung một cache. Đây là code không ai nhìn thấy
cho tới khi hỏng, nên nó cần eval riêng.

### Cũng vào khoá: digest của ABI

Quét chân ngành (`morphological-scan`, preset test-matrix) bắt được một ô mà **bản đầu của
tài liệu này đã sót**, và nó cùng họ với bug kinh điển nhất của `[NGÀNH: ccache]` — *không băm
binary compiler, không băm `__DATE__`, không băm include-path*: **khoá thiếu một input thật.**

`config/tongflow.abi.json` là input của phép tính mà khoá không chứa. Cả
`materialize_asset_inputs` và `convert_asset_outputs_to_file_refs` đều đọc ABI, nên đổi schema
của một slot làm **cùng input cho ra kết quả khác** — mà khoá không đổi. `sdkMajor` không phủ
được: ABI là file riêng có `version` riêng, và trong repo nó đổi **không** kéo theo bump minor
của SDK (mỗi feature cross-layer đều chạm nó theo CLAUDE.md). Thêm nữa `abi_path` là **option**
nên host truyền được một ABI khác hẳn.

Quyết định 30/07: **băm cả file**, `sha256(abi_file.read_bytes())`, tính một lần mỗi run
(`abi_file` có sẵn ở `runner.py:229`). Không băm riêng schema của slot đang gọi — `$defs` dùng
chung nghĩa là phải resolve `$ref` mới thấy hết ảnh hưởng, và một phép băm-hẹp-sai còn tệ hơn
băm-rộng-đúng.

**Cái giá, ghi rõ vì nó là chi phí vận hành thật:** mỗi lần sửa ABI là **toàn bộ cache mất
hiệu lực**. Ở giai đoạn này ABI đổi khá thường, nên trong lúc phát triển tỷ lệ trúng sẽ thấp.
Đây là hành vi *đúng* — spec đã nhận cùng đánh đổi cho `sdkMajor` ở R6 — nhưng đừng ngạc nhiên
khi thấy cache "không hoạt động" ngay sau một PR chạm ABI. Không dùng field `version` của ABI
thay cho digest: một version không được bump ở mọi lần sửa chính là bug đang muốn đóng.

### Cái giá đã nhận

Sửa `fingerprint.py` = sửa file mà `cache-l1-fingerprint` **sở hữu** → theo luật per-file
(AGENTS.md §2, chốt 29/07) feature đó phải **verify lại + chữ ký Cổng 2 mới**. Đã biết trước
và chấp nhận. Bù lại: vector của AC-13 được sinh lại, và AC-14 của L1 *tự chứng minh* cú bump
`v` bằng cách chạy lại node-id của AC-13 trong subprocess.

## 4. Store trên đĩa

```
<data_dir>/.tongflow/node-cache/
├── <hash[:2]>/<hash>/result.json     # kết quả, asset thay bằng tham chiếu blob
└── blobs/<sha[:2]>/<sha>             # blob nội-dung-địa-chỉ, DÙNG CHUNG
```

Blob nằm ở **gốc** `node-cache/`, không trong từng entry — nếu đặt trong entry thì không
"dùng chung" được, và câu *"200 video khác nhau chỉ khác overlay vẫn chia sẻ mọi blob nguồn"*
của D6 thành sai.

**Ghi atomic — `result.json` VÀ blob, cùng một luật:** temp file + `os.replace`. Hai run song
song ghi cùng một entry là chuyện thường (nội-dung-địa-chỉ nên bytes giống nhau, ghi sau thắng
là vô hại), nhưng một tiến trình khác đọc file đang viết dở thì không vô hại.

Bản đầu của tài liệu này chỉ đòi atomic cho `result.json` và lập luận rằng blob "vô hại vì
nội-dung-địa-chỉ". Gap-probe bác đúng chỗ đó: **cái hại được nêu — đọc một file viết dở — áp
y hệt cho blob.** Một run bị SIGKILL giữa lúc ghi blob để lại file cụt ở đúng tên sha; run sau
trúng, `put` bytes cụt vào store, slot ffmpeg hạ nguồn ăn nửa video và sinh output hỏng — rồi
output hỏng đó lại được cache. Ghi atomic đóng cửa sổ đó ngay từ đầu.

Thêm một lưới đỡ **O(1)**, không phải băm lại: `result.json` ghi kèm **kích thước** mỗi blob;
lúc đọc, kích thước lệch → coi là miss và ghi lại. Không băm lại toàn bộ blob khi trúng — với
một video 200MB thì đó là I/O tỷ lệ kích thước trên mỗi lần trúng, đúng thứ cache sinh ra để
tránh.

**Khi trúng — mấu chốt đúng-sai của D6:** engine `put` lại blob vào store **của lần chạy hiện
tại** rồi mới dựng `result`. `MemoryStore` trả `mem://<uuid>` chỉ sống trong tiến trình, nên
lưu handle đó vào cache là lưu một con trỏ chết; hạ nguồn phải thấy `file_key` hợp lệ trong
store đang dùng, bất kể Memory / Disk / Http.

## 5. Tầng A: allowlist tường minh, trong module mới

ABI **không có** trường nào ghi tính tất định, và suy từ núm bất định là **không an toàn**:
38/61 slot không có `seed`/`temperature`, nhưng danh sách đó chứa `gen-text`,
`image-describe`, `audio-describe`, `music-brief` — gọi model sinh nội dung, không có seed để
ghim, tức bất định *nặng hơn* chứ không phải tất định. Vắng núm không suy ra tất định.

Nên: **hằng số liệt kê tay**, slot ngoài danh sách không được cache (fail-closed).

**L2 mở 11 slot — thuần cơ khí, thuần cấu trúc:**

`concat-videos` · `extract-audio` · `remove-video-audio` · `merge-video-audio` ·
`get-first-frame` · `get-last-frame` · `split-video` · `drop-video` · `split-text` ·
`combine-text` · `arrange-group`

**Cố ý hoãn, dù D3 nêu tên:** `transcribe`, `transcribe-timestamp`, `parse-document`.

Lý do là một tương tác mà L2 tự tạo ra: **L2 biến known limit 1.1-L1b từ lý thuyết thành sống
thật.** Trước L2 không có gì được cache nên chuyện "cùng bytes khác `mime`/`filename` cho cùng
một khoá" chỉ là giả thuyết; sau L2 thì nó là hành vi thật. Ba slot trên nhận asset mà bộ
giải mã / parser **chọn theo `mime` đã khai**, nên chúng đúng là ca 1.1-L1b. Đây là mất mát
thật — D3 gọi chúng là nhóm rẻ-nhưng-chạy-liên-tục — nhưng hướng an toàn. Mở lại sau khi
1.1-L1b hạ cánh chỉ là thêm dòng vào hằng số.

**Module mới `sdk/tongflow/engine/node_cache.py`**, không nhét vào file có sẵn — cố ý:
`scan.py` thuộc `oneflow-plugin-prefix`, `plugins.py` thuộc `sdk-distribution-rename`; đặt
code vào đó là bắt thêm hai feature nữa verify lại và ký lại. Dò `plugin_dirty` cũng đặt ở
module mới, cùng lý do.

## 6. Không bao giờ hỏng run

- Cache đọc/ghi lỗi (đĩa đầy, quyền, `result.json` hỏng) → log rồi **chạy tiếp như không có
  cache**. Cache không phải nguồn sự thật (§8: *xoá thư mục cache → kết quả không đổi, chỉ
  chậm hơn*).
- `success: false` **không bao giờ** tạo entry (D8). Lưu ý runner *raise* khi
  `success is False`, nên điểm ghi cache nằm **sau** phép kiểm đó.
- Không cacheable (ngoài allowlist / thiếu tenant / thiếu rev / plugin dirty) → chạy plugin
  như trước, không log ồn.

## 7. Amendment cho spec

| Mục | Đang viết | Phải thành |
|---|---|---|
| **D5** | "Một lần trúng cache phải khôi phục **ba** thứ" — giả định bỏ qua cả node | Ghi rõ L2 cache **per-call**, nên ba thứ đó được tính lại từ `results` như thường; cái bẫy chỉ áp cho thiết kế per-node, và đó không phải thiết kế đã chọn |
| **D2** | `"v": 1`; khoá gồm 7 thành phần | `"v": 2`; thêm **`tenant`** và **`abiDigest`** — kèm lý do (§3 tài liệu này). Ghi rõ ABI là input của phép tính, không phải cấu hình ngoài lề |
| **D6** | "blob … ở `.../blobs/<sha256>`" (mơ hồ chỗ đặt) | Blob ở **gốc** `node-cache/`, không trong từng entry — nếu không thì không dùng chung được |
| **D3** | Tầng A gồm `transcribe`, `parse-document` | Ghi chú: L2 hoãn ba slot đó tới sau 1.1-L1b, kèm lý do; danh sách mở dần bằng hằng số |

## 8. Test — phải chứng minh được cả hai chiều

Seam đã có sẵn: `invoker` là keyword param công khai của `run_workflow`, và
`sdk/tests/test_engine.py` + `test_engine_batch.py` đã dùng nó. Nên DoD chứng minh được bằng
**đếm lời gọi invoker**, không cần ffmpeg thật, không cần plugin thật.

- Chạy 1 → N lời gọi. Chạy 2 cùng `data_dir` → **0 lời gọi**, output byte-identical.
- Đổi một node text → chỉ node đó + hạ nguồn chạy lại; số lời gọi giảm đúng bằng số node trúng.
- Xoá thư mục cache → kết quả không đổi, chỉ nhiều lời gọi lại.
- Batch 5 item, 3 đã cache → đúng 2 lời gọi.

**Ràng buộc fixture, phát hiện lúc thiết kế:** fixture plugin hiện tại là thư mục tay **không
có `.git`**. Fixture của `test_engine_batch.py` patch thẳng `scan_manifest`, nên nó
tự cấp `cfg` kèm `pluginRev` và `read_plugin_rev` không bao giờ chạy — **chỉ ca (a) của AC-10**
(dò dirty) cần một git checkout thật, vì `plugin_is_dirty` đọc working tree thật. Mười lăm tiêu
chí còn lại dùng manifest patch là đủ. Câu trong bản đầu của tài liệu này ("mọi fixture buộc phải
git init") quá rộng; nó nằm trong prose, không trong tiêu chí nào, nên sửa được mà không mở lại
Cổng 1.

## 9. Ngoài phạm vi

- **Tầng B** (memo theo workflow) — L3.
- **Eviction / LRU / trần dung lượng / `purge()` / `reuse=` API** — L4. L2 không có núm tắt
  riêng: `tenant` không khai *là* cách tắt, và test dùng `data_dir` mới thay cho một cờ.
- **`sdk_major()` kiểm lỏng** — known limit của L1, giữ nguyên.
- **1.1-L1b (`mime`/`filename` vào digest)** — contract riêng. L2 né bằng allowlist (§5).
- **Không đụng `store.py`** — Q1 đã chốt KHÔNG (29/07): `HttpStore` nhận `file_key` do host
  cấp nên nội-dung-địa-chỉ không thể làm đồng nhất ba store.
- **Cache chia sẻ giữa các tenant trong cùng tổ chức** — chỉ có nghĩa khi schema org/membership
  hạ cánh ở P2.

---

**Người viết:** Claude (phiên 2026-07-30) · **Quyết định:** Manh 2026-07-30 ·
**Kế tiếp:** contract + evals, rồi Cổng 1.
