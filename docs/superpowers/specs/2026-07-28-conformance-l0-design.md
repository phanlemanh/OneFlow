# Thiết kế — 1.L0: `pluginRev`, `node_cached`, conformance suite TS↔Python

> Lát **L0** của [spec cache](../../spec/prd/engine-cache-partial-rerender.md) §6.
> Tài liệu tự chứa: người đọc không cần lịch sử chat để build được.

## 1. Vì sao lát này đứng trước cache

Spec cache đặt điều kiện tiên quyết (§5): **không bật cache mặc định khi hai runtime còn
lệch ngữ nghĩa.** Lý do không phải sự sạch sẽ mà là đúng-sai: cache tái dùng một artifact
được sinh theo ngữ nghĩa A rồi phục vụ cho một lời gọi mang ngữ nghĩa B là **trả kết quả
sai một cách im lặng** — loại lỗi đắt nhất trong nhóm này.

L0 giao ba thứ, không thứ nào cần đến cache store:

1. `pluginRev` — ghi commit sha lúc cài plugin (khoá cache L1 sẽ cần; L0 chỉ ghi nhận).
2. `node_cached` — chốt hình dạng sự kiện + nối đường ống ba tầng trước khi có nguồn phát.
3. Conformance suite — fixture chung, hai phía cùng call-log, CI đỏ khi lệch.

Và vì suite ca số 1 sẽ đỏ ngay khi viết xong, L0 giao thêm thứ tư: **sửa engine để hết
lệch** (quyết định của người vận hành, 28/07).

## 2. Hiện trạng đã kiểm chứng trên code

| Sự việc | Vị trí |
|---|---|
| Canvas fan-out N prompt theo `batchField` | [`resolve.ts:326-335`](../../../src/lib/abi/resolve.ts) (`buildPrompts`) |
| Exporter phát `batchField` vào ExecutableNode | [`exporter.ts:648`](../../../src/lib/workflow/exporter.ts) |
| Engine **không có một dòng nào** đọc `batchField` | `sdk/tongflow/engine/` — `grep batch` trả rỗng |
| Workflow **chỉ chạy trên engine Python**; TS delegate toàn bộ | [`runner.ts:118`](../../../src/lib/task/runner.ts) → `executeWorkflowViaEngine` |
| Sự kiện engine đi qua một switch có tên | [`engine-delegate.server.ts:60-110`](../../../src/lib/task/engine-delegate.server.ts) |
| Hai đường cài plugin độc lập | TS isomorphic-git [`plugins-install.server.ts`](../../../src/lib/plugins/plugins-install.server.ts) · Python `git clone --depth 1` [`plugins.py:54`](../../../sdk/tongflow/engine/plugins.py) |
| Registry manifest do scanner Python sinh, TS parse bằng zod | [`plugins-registry-schema.ts`](../../../src/lib/plugins/plugins-registry-schema.ts) · [`scan.py:407`](../../../sdk/tongflow/scan.py) |

**Đính chính một giả định trong spec cache.** Spec gọi đây là "hai runtime". Chính xác hơn:
workflow chỉ có **một** runtime (Python). Lệch nằm giữa *hai định nghĩa của cùng một phép
toán* — phép fan-out theo `batchField`: canvas định nghĩa nó ở `buildPrompts`, engine không
định nghĩa nó ở đâu cả. Điều này làm harness rẻ hơn nhiều so với dự tính: **không cần dựng
workflow runner thứ hai bên TS**, chỉ cần trích chuẩn hoá phép fan-out ở mỗi phía.

## 3. Quyết định thiết kế

### D1 — `pluginRev` ghi ở cả hai đường cài, là field optional

Hai đường cài chạy độc lập (người dùng desktop cài qua UI TS; engine headless tự clone),
nên ghi một phía là bỏ trống phía kia. Rev vào registry manifest dưới dạng
`pluginRev?: string` — **optional có chủ đích**: registry đã sinh trước đó vẫn parse được,
và plugin cài tay (thư mục không phải git repo) là trạng thái hợp lệ trong môi trường dev,
không phải lỗi. Giá trị = `git rev-parse HEAD` đầy đủ 40 ký tự, không rút gọn.

**Manifest chỉ do scanner Python sinh** — đó là chỗ dễ hiểu nhầm "ghi ở cả hai đường". Cài
bằng TS rồi scan bằng Python là **một đường ghép**, và nó là đường phổ biến nhất (người dùng
desktop cài plugin qua UI). Nếu chỉ kiểm mỗi phía riêng lẻ thì kịch bản sau đi lọt: desktop
không có `git` CLI, hoặc checkout do isomorphic-git để lại mà CLI không đọc được rev — entry
thiếu `pluginRev`, và tới L1 khoá cache mới phát hiện đường cài phổ biến nhất không có rev.
Nên đường ghép phải có phép kiểm riêng.

Hệ quả: **hai trạng thái vắng rev phải tách bạch**, không được gộp thành "thiếu là hợp lệ":

| Trạng thái | Hành vi đúng |
|---|---|
| Thư mục không phải git checkout (cài tay trong dev) | Bỏ `pluginRev`, scan thành công |
| Là git checkout nhưng đọc rev thất bại | **Lỗi có tên**, không im lặng bỏ field |

Gộp hai trạng thái này là cách một sự cố thật nguỵ trang thành cấu hình hợp lệ.

L0 **chỉ ghi nhận**. Đưa `pluginRev` vào khoá fingerprint là việc của L1 — trộn vào đây sẽ
kéo cả `digest_form()` và test vector sang lát này.

### D2 — `node_cached`: chốt hợp đồng, nối ống, chưa phát

```
{ "type": "node_cached", "nodeId": str, "feature": str, "label": str,
  "fingerprint": str, "tier": "A" | "B" }
```

`fingerprint` và `tier` có mặt trong hợp đồng ngay từ L0 dù L0 chưa tính được chúng: thêm
trường vào một sự kiện đã chạy trong sản xuất đắt hơn nhiều so với khai trước. Đường ống
engine → `engine-delegate.server.ts` → SSE → UI được nối đủ và kiểm bằng invoker giả bơm sự
kiện. Ở L2, cache store chỉ việc gọi `emit()` — không phải mở đường xuyên ba tầng giữa lúc
đang làm phần khó.

Sự kiện không nhận diện được (kể cả `node_cached` từ engine phiên bản mới hơn) **không được
làm sập stream** — switch hiện tại rơi vào nhánh mặc định; giữ nguyên tính chất đó.

**"Đường ống" nghĩa là cả ba tầng, và phải kiểm cả ba.** Bán điểm duy nhất của quyết định
này là "L2 chỉ việc gọi `emit()`". Nếu phép kiểm dừng ở unit test của
`engine-delegate.server.ts` thì vẫn còn hai chỗ nuốt sự kiện: type mới không được thêm vào
union sự kiện SSE, hoặc parser phía client rơi vào nhánh mặc định. Cả hai đều làm
`fingerprint`/`tier` không bao giờ tới UI trong khi unit test xanh — và ta chỉ phát hiện ở
L2, đúng lúc đang làm phần khó, tức mất sạch lợi ích đã trả giá để mua. Phép kiểm phải bơm
sự kiện giả rồi đọc payload **đã serialize ở route SSE** và cho parser phía client tiêu thụ.

### D3 — Engine fan-out theo `batchField`, khớp ngữ nghĩa canvas

Vị trí: [`runner.py`](../../../sdk/tongflow/engine/runner.py), giữa `resolve_node_params` và
`materialize_asset_inputs`. Luật lấy thẳng từ `buildPrompts`:

- `batchField` vắng → đúng một lời gọi, input y như hiện nay. (Đường không-batch phải bất biến.)
- `batchField` có, giá trị là mảng N phần tử → **N lời gọi**, lời gọi thứ i nhận
  `input[batchField] = items[i]` (vô hướng, không phải mảng một phần tử).
- `batchField` có, mảng **rỗng** → **0 lời gọi**. Không phải một lời gọi với mảng rỗng.
  Đây là ca dễ sai nhất: canvas trả `[]` (không tạo task nào), engine hiện tại vẫn gọi
  plugin một lần với `[]` và nhận về kết quả rác.
- `batchField` có, giá trị không phải mảng → 0 lời gọi (khớp `Array.isArray` ở `resolve.ts:332`).

### D4 — Gộp kết quả sau fan-out: nối `values` theo thứ tự batch

Đây là điểm mà quét coverage lộ ra, và là chỗ dễ hỏng dữ liệu nhất.

Canvas không gặp bài toán này: mỗi prompt thành một task riêng, data node hạ nguồn tự gom.
Engine thì khác — node hạ nguồn đọc `output_views[node_id]`, khoá theo **nodeId**, không
theo lời gọi. N kết quả phải gộp thành **một** view.

Luật: với mỗi `sourceField`, nối `values` của N kết quả **theo đúng thứ tự batch**
(kết quả lời gọi 0 trước, rồi 1, …). Giữ nguyên `nodeType` / `dataField` / `expandEach` của
route. Hệ quả bắt buộc: `node_outputs[node_id]` giữ **danh sách** N kết quả thô, và
`data_node_state` được làm mới từ view đã gộp — bẫy D5 của spec cache áp nguyên ở đây.

Nếu chỉ giữ kết quả cuối cùng thì batch 5 ảnh âm thầm mất 4. Không có ngoại lệ nào báo lỗi.

**Trường hợp N = 0 là một nhánh riêng, không phải hệ quả của luật trên.** Đây là chỗ dễ nổ
nhất và nó nổ ở *node khác*: metadata route (`nodeType` / `dataField` / `expandEach`) mà D4
nói "giữ nguyên" được lấy từ đâu khi không có kết quả nào? Lấy từ `results[0]` là `IndexError`.
Bỏ qua node hoàn toàn thì `output_views` không có khoá `nodeId` và node hạ nguồn nổ lúc
resolve params.

Luật cho N = 0: dựng view **từ chính route** (route là dữ liệu tĩnh của node, luôn có sẵn,
không cần kết quả nào), với `values: []`. Node hạ nguồn nhận danh sách rỗng và chạy bình
thường — batch rỗng là "không có gì để làm", không phải lỗi. Kiểm bằng workflow ba tầng chạy
tới hết, không chỉ kiểm số lời gọi của node giữa.

### D5 — Harness: một fixture, hai adapter mỏng, một call-log

```
sdk/tests/conformance/fixtures/<case>.json   ← nguồn duy nhất, cả hai phía đọc
```

Mỗi fixture chứa: một `ExecutableWorkflow` tối giản + `inputs` + call-log kỳ vọng.
Mỗi phía có một adapter mỏng xuất **call-log chuẩn hoá**:

```
[{ "slot": str, "input": { <mọi business field của slot theo ABI> } }]
```

**Chuẩn hoá là gì, nói tường minh** — nếu để mơ hồ thì hai adapter do cùng một người viết sẽ
tự thoả thuận một phạm vi hẹp, suite xanh, và mù đúng những lệch nó sinh ra để bắt:

- **Giữ toàn bộ** business field mà ABI khai cho slot đó, kể cả field không liên quan đến
  batch. Một phía tự bơm default (`duration` từ picker chẳng hạn) mà phía kia không có là
  đúng loại lệch cần bắt — lọc bớt field là tự bịt mắt.
- **Bỏ đúng ba nhóm**, vì chúng per-run chứ không mang nghĩa ngữ nghĩa: khoá `_tongflow`
  (progressUrl/token), `taskId`, và mọi khoá routing (`outputs`, `level`, `dependencies`).
  Danh sách này khớp phần "bắt buộc loại khỏi khoá" của [spec cache D2](../../spec/prd/engine-cache-partial-rerender.md).
- **Khoá sắp xếp** theo thứ tự từ điển trước khi so, để khác biệt thứ tự trường không thành
  khác biệt giả.
- **Asset biểu diễn bằng `{"__asset": "<sha256 của bytes>"}`**, không phải chuỗi base64 và
  cũng không phải `file_key`. Hai phía materialize asset theo đường khác nhau nên `file_key`
  sẽ luôn lệch; sha256 của nội dung thì không.
- **Giá trị vắng**: field không có giá trị bị **bỏ khỏi** call-log, không ghi `null`. Một
  phía ghi `null` còn phía kia bỏ hẳn sẽ thành khác biệt giả.

Adapter:

- **Phía TS** (vitest): gọi `buildPrompts` với spec đã resolve từ ABI, xuất từng prompt thành
  một mục call-log.
- **Phía Python** (pytest): chạy `run_workflow` với `invoker` giả — chỉ ghi lời gọi rồi trả
  kết quả cố định, không đụng subprocess/mạng/GPU.

Cả hai assert trên **cùng danh sách trong fixture**. Fixture là hợp đồng; adapter là thứ
phải chiều theo nó.

Vì sao không golden-file sinh tự động: golden sinh ra thì sửa nó là cách rẻ nhất để giấu
drift — người sửa chỉ cần chạy lại lệnh regenerate. Fixture viết tay, review được như code.

Vì sao không chạy plugin thật: CI phải clone plugin + dựng venv mỗi lần — chậm, giòn, phụ
thuộc mạng. Ngữ nghĩa fan-out là thứ cần kiểm; plugin tính ra gì thì không.

### D6 — Chứng minh suite thật sự bắt được lệch

"CI đỏ khi lệch" chỉ là lời hứa cho tới khi có bằng chứng. Một script guard làm mutation
test: cố tình đổi một phía (patch tạm trong tiến trình, không đụng file làm việc) rồi khẳng
định suite **đỏ**; khôi phục; khẳng định suite **xanh**. Guard này chạy được ở local lẫn CI.

Guard đục **hai loại** lệch, không phải một:

1. **Lệch fan-out** — đổi số lời gọi ở một phía. Đây là drift số 1.
2. **Lệch một field ngoài `batchField`** — thêm/bỏ một business field ở một phía. Nếu guard
   chỉ đục loại 1 thì call-log có thể đang so một tập field hẹp mà không ai biết, và loại
   lệch nguy hiểm nhất về sau (một phía bơm default phía kia không có) đi lọt.

Bài học lấy từ per-plugin-origin: ba guard của feature đó đều phải mutation-test mới được
tính là bằng chứng.

### D7 — Baseline chụp trước khi sửa, cho đường không-batch

"Input y như hiện nay" (D3) không tự kiểm được sau khi code đã đổi — không còn cái "hiện nay"
nào để so. Nên trước khi chạm `runner.py`, chụp call-log của các workflow không-batch bằng
chính recording invoker của harness và cam kết vào repo làm fixture baseline.

Bước fan-out chèn giữa `resolve_node_params` và `materialize_asset_inputs` rất dễ kéo theo
một lần copy/normalize dict — thứ làm rụng khoá `None` hoặc đổi kiểu một field. Số lời gọi
vẫn đúng bằng một, suite engine cũ không assert toàn bộ dict, nên hồi quy này đi lọt qua mọi
phép kiểm hiển nhiên. So với baseline thì diff phải **rỗng tuyệt đối**.

## 4. Ca kiểm thử của suite (ca số 1 và các ca biên)

| Ca | Nội dung | Bắt được gì |
|---|---|---|
| `batch-basic` | Node có `batchField`, 3 phần tử | Drift số 1: engine gọi 1 lần thay vì 3 |
| `batch-empty` | `batchField`, mảng rỗng | Engine gọi 1 lần với `[]` thay vì 0 lần |
| `no-batch` | Node không có `batchField` | Hồi quy: đường không-batch phải bất biến |
| `batch-collect` | `batchField` cùng field `collectAll` | Trường collect giữ nguyên mảng qua mọi lời gọi |

## 5. Phạm vi — và những gì cố ý không làm

**Trong phạm vi:** `pluginRev` ghi nhận hai phía · hợp đồng + đường ống `node_cached` ·
engine fan-out + gộp kết quả · harness + 4 fixture · guard mutation.

**Ngoài phạm vi (có lý do, không phải quên):**

- `digest_form()` / `node_fingerprint()` / cache store — L1, L2.
- Đưa `pluginRev` vào khoá cache — L1. L0 chỉ ghi.
- Đưa batch về orchestrator để xoá drift tận gốc — Phase 3 của roadmap. L0 làm hai runtime
  *khớp nhau*; hợp nhất về một chỗ là việc sau.
- Ba câu hỏi mở Q1–Q3 của spec cache — không cái nào chặn L0.
- Song song hoá `executionLevels` — engine vẫn tuần tự như hiện nay.

## 6. Rủi ro

| # | Rủi ro | Xử lý |
|---|---|---|
| R1 | Fan-out làm hỏng workflow đang chạy được | Ca `no-batch` + suite hiện có (`test_engine.py`) phải xanh không sửa |
| R2 | Gộp kết quả sai → mất dữ liệu im lặng | D4 có AC riêng, không gộp vào AC fan-out |
| R3 | Fixture viết theo hành vi engine hiện tại (chép lại cái sai) | Fixture viết từ `buildPrompts` — canvas là chuẩn, engine chiều theo |
| R4 | Registry cũ vỡ khi thêm `pluginRev` | Field optional; có AC kiểm registry không có field vẫn parse |
| R5 | Suite xanh giả (không thật sự so gì) | D6 mutation guard |

---

**Người viết:** Claude (phiên 2026-07-28) · **Duyệt:** Manh (Cổng 1) ·
**Phụ thuộc:** không · **Chặn:** L1→L4 của spec cache
