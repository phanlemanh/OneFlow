---
schema_version: 1
feature: Cache L2 — on-disk node cache, tier A only
slug: cache-l2-store
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [sdk, api]
status: signed-off
approved_by: Manh
approved_at: 2026-07-30
time_human_minutes: {gate1: 25, gate2: 20}
---

# Acceptance Contract: cache-l2-store

## Context

Đây là lát đầu tiên cache **thật sự đọc và ghi**. L1 ([`cache-l1-fingerprint`](../cache-l1-fingerprint/contract.md), ký 30/07) chỉ tính khoá; L2 dùng khoá đó để **bỏ được một lời gọi plugin**. DoD của [spec cache](../../docs/spec/prd/engine-cache-partial-rerender.md) §6: *chạy lại workflow ffmpeg thuần → 100% trúng, kết quả byte-identical*. Chỉ **tầng A** (D3: trong tenant, chéo workflow); tầng B là L3.

Thiết kế đầy đủ: [2026-07-30-cache-l2-store-design.md](../../docs/superpowers/specs/2026-07-30-cache-l2-store-design.md). Bốn điều đọc-code-mới-thấy định hình hợp đồng này:

**Điểm móc là per-call, không per-node.** `materialize_asset_inputs` nằm trong vòng `for call_params in per_call_params` ([`runner.py:359`](../../sdk/tongflow/engine/runner.py)), nên cache đúng `one` sau `convert_asset_outputs_to_file_refs`. Hệ quả: *"cái bẫy dễ mắc nhất"* của D5 — bỏ qua node thì phải tự khôi phục `node_outputs` + `output_views` + `data_node_state` — **tự biến mất**, vì cache không bỏ qua node, nó chỉ bỏ qua `invoke_plugin`; ba thứ đó vẫn được tính từ `results` bằng code hiện tại. Và batch trúng-một-phần trở nên khả thi.

**Khoá thêm `tenant` và `abiDigest`, `KEY_SCHEMA_VERSION` 1 → 2.** `tenant` vào khoá (không chỉ vào đường dẫn) vì `scope = ""` vừa hợp lệ ở bản OSS đơn-tenant vừa là triệu chứng cloud cấu hình sai — đường dẫn không phân biệt được hai ca đó, khoá thì có. `abiDigest` vì ABI là **input của phép tính** mà khoá đang thiếu, cùng họ bug với `[NGÀNH: ccache]` không băm binary compiler.

**Tầng A là allowlist tường minh, không suy từ ABI.** 38/61 slot không có núm `seed`/`temperature`, nhưng tập đó chứa `gen-text`, `image-describe`, `music-brief` — gọi model sinh nội dung, không có seed để ghim, tức bất định *nặng hơn*. Vắng núm không suy ra tất định.

**L2 biến known limit 1.1-L1b từ lý thuyết thành sống thật**, nên allowlist cố ý hoãn `transcribe` / `transcribe-timestamp` / `parse-document` dù D3 nêu tên chúng — cả ba chọn bộ giải mã theo `mime` đã khai.

## Criteria

**Quy tắc chung kế thừa nguyên từ L1** (contract `cache-l1-fingerprint`, mục `## Criteria`): mọi tiêu chí so hai khoá đã tính phải khẳng định **cả hai** khoá là chuỗi khác `None`, đúng 64 ký tự hex viết thường trước khi so — `None == None` và `None != "<sha>"` đều đúng trong Python. Ngoại lệ: tiêu chí mà kết quả kỳ vọng **chính là** `None`/không-cacheable, phải khẳng định đúng trạng thái đó.

**Quy tắc chung thứ hai, riêng cho L2:** mọi tiêu chí khẳng định "không cacheable" phải kiểm **CẢ HAI chiều** — không đọc entry có sẵn **và** không ghi entry mới. Chỉ kiểm một chiều là bỏ ngỏ đúng nửa nguy hiểm: một implementation ghi mà không đọc thì vô hại; ghi khi không được phép thì làm cache phình theo dữ liệu không được phép cache và có thể phục vụ sai ở lát sau.

- AC-1: Given một workflow chỉ gồm slot trong allowlist, When chạy lần một rồi chạy lần hai với **cùng `data_dir` và cùng `tenant`**, Then lần hai gọi invoker **0 lần**, và mọi asset trong `outputs` được **giải qua store của lần chạy tương ứng** rồi so **byte-for-byte** với bytes đã giải của lần chạy một. Chuẩn hoá được phép áp **duy nhất** cho chuỗi handle đục của store (`mem://<uuid>` khác nhau giữa hai tiến trình là hợp lệ); mọi thứ khác phải so nguyên. *Đây là DoD của §6. Định nghĩa phép chuẩn hoá ngay trong tiêu chí là bắt buộc: để hở chữ "chuẩn hoá" thì một verifier có thể strip mọi handle asset (chúng KHÁC nhau một cách hợp lệ) rồi chỉ so bộ xương JSON còn lại — và một implementation trả về blob KHÁC nhưng hợp lệ vẫn xanh. Đếm lời gọi invoker là thước duy nhất không thể "gần đúng": một cache trúng mà vẫn gọi plugin thì không tiết kiệm gì, còn 0 lời gọi mà output khác là hỏng dữ liệu.*
- AC-2: Given một entry đã có trong cache mà lần chạy hiện tại dùng một store **khác** (ví dụ `MemoryStore` mới của tiến trình mới), When trúng cache, Then blob được `put` lại vào store của **lần chạy hiện tại** và node hạ nguồn nhận `file_key` **giải được trong store đó**. *Mấu chốt đúng-sai của D6: `MemoryStore` trả `mem://<uuid>` chỉ sống trong tiến trình, nên lưu handle đó vào cache là lưu một con trỏ chết. Nếu chỉ khẳng định "trúng cache" mà không khẳng định hạ nguồn giải được `file_key`, tiêu chí này xanh trong khi node sau chạy với input rỗng — đúng loại hỏng-âm-thầm mà D5 gọi tên.*
- AC-3: Given một lời gọi plugin trả `success: false`, When run kết thúc (runner raise theo hành vi hiện tại), Then **không entry nào** được tạo cho khoá đó, kiểm bằng cách đếm file dưới `node-cache/` trước và sau. *D8: một lỗi hạ tầng nhất thời bị cache lại thành lỗi vĩnh viễn là bug tệ nhất trong nhóm này. Điểm ghi cache phải nằm SAU phép kiểm success, không phải trước.*
- AC-4: Given một entry tồn tại nhưng (a) blob nó trỏ tới đã bị xoá, (b) `result.json` không parse được, hoặc (c) blob tồn tại nhưng **kích thước lệch** so với kích thước đã ghi trong `result.json`, When chạy lại, Then **coi như miss** — plugin được gọi, run kết thúc thành công, và entry được ghi lại đúng. Ba ca kiểm **riêng**, không gộp. *Ba ca đều là trạng thái thật (`[NGÀNH: Bazel]` — blob bị GC mà entry còn là ca kinh điển của disk cache). Một implementation raise ở đây biến một cache hỏng thành một run hỏng. Ca (c) là ca gap-probe bắt được: một run bị SIGKILL giữa lúc ghi blob để lại file **cụt** ở đúng tên sha — blob tồn tại, `result.json` parse được, nên (a) và (b) đều xanh, mà run sau `put` bytes cụt vào store và slot ffmpeg hạ nguồn sinh output hỏng, rồi output hỏng đó lại được cache. Dùng kích thước chứ không băm lại: băm lại một video 200MB trên MỖI lần trúng là đúng thứ cache sinh ra để tránh.*
- AC-5: Given thư mục cache **không ghi được** (ví dụ chmod 0500 hoặc đường dẫn bị chiếm bởi một file), When chạy workflow, Then run kết thúc **thành công**, plugin được gọi, và **không ngoại lệ nào** lọt ra ngoài. *`[NGÀNH: ccache]` cache dir read-only. §8 nói cache không phải nguồn sự thật; một cache không ghi được mà làm hỏng run thì vi phạm đúng câu đó.*
- AC-6: Given cache đã có entry, When xoá cả thư mục `node-cache/` rồi chạy lại, Then kết quả **không đổi** và số lời gọi invoker trở lại như lần chạy đầu. *§8 nguyên văn: "xoá thư mục cache → kết quả không đổi, chỉ chậm hơn". Đây là tiêu chí chứng minh cache không lặng lẽ trở thành nguồn sự thật.*
- AC-7: Given một slot **ngoài** allowlist tầng A, When chạy hai lần, Then không entry nào được ghi cho slot đó **và** không lần nào đọc entry cho nó — invoker được gọi đủ ở cả hai lần. *Allowlist là fail-closed: slot mới mặc định không được cache. Kiểm cả hai chiều theo quy tắc chung thứ hai.*
- AC-8: Given `tenant` là chuỗi rỗng hoặc thiếu hẳn trong options, When chạy hai lần, Then **không đọc, không ghi** entry nào; invoker được gọi đủ ở cả hai lần. *Nửa fail-closed của quyết định đưa tenant vào khoá. Chuỗi rỗng đi qua được nghĩa là cloud cấu hình sai cũng đi qua được y hệt, và lúc đó cả tính năng chỉ còn là một cái tên.*
- AC-9: Given cùng workflow, cùng input, cùng `data_dir`, chạy với `tenant="user:a"` rồi `tenant="user:b"`, When lần hai chạy, Then invoker **vẫn được gọi** (không phục vụ chéo) và hai entry riêng tồn tại. *`[NGÀNH: Turborepo]` — remote cache scoping đã từng có advisory thật. Đây là tiêu chí duy nhất chứng minh tenant thực sự vào KHOÁ chứ không chỉ vào đường dẫn: dùng CHUNG một `data_dir` là điều kiện bắt buộc của ca kiểm, vì nếu tách `data_dir` thì đường dẫn đã cô lập và tiêu chí xanh mà không chứng minh gì.*
- AC-10: Given thư mục plugin **không dùng được để định danh phiên bản** theo một trong hai cách — (a) là git checkout **có thay đổi chưa commit**, hoặc (b) **không phải checkout gì cả** (không có `.git`) — When chạy hai lần cho mỗi ca, Then không đọc, không ghi entry nào cho plugin đó; invoker được gọi đủ ở cả hai lần. Hai ca kiểm **riêng**. *Đóng đúng "Điều kiện chặn L1" mà `conformance-l0` ghi ở Cổng 2, ở phía caller: L1 chỉ nhận cờ `plugin_dirty`, L2 là chỗ dò nó. Không có tiêu chí này thì cờ kia vĩnh viễn là `False` và điều kiện chặn vẫn mở. Ca (b) do gap-probe bắt: nếu implementation thay `None` bằng một placeholder (`""` / `"unknown"`) để "có cái mà cache", hai phiên bản plugin khác nhau sẽ dùng chung khoá và phục vụ output của nhau — mà KHÔNG eval nào phản đối, vì mọi fixture đều `git init` thật.*
- AC-11: Given một node chia lô 5 item mà 3 item đã có entry, When chạy, Then invoker được gọi **đúng 2 lần** và output đủ 5 item theo đúng thứ tự batch. *Đây là thứ per-node không làm được, nên nó cũng là tiêu chí chứng minh điểm móc thật sự là per-call. Khẳng định thứ tự vì gộp kết quả sai thứ tự là hỏng dữ liệu chứ không phải chậm.*
- AC-12: Given hai entry khác nhau mà cùng tham chiếu một asset giống bytes, When cả hai đã ghi, Then trên đĩa chỉ có **một** file blob cho asset đó. *Dedupe của D6, và là cơ sở cho câu "200 video khác nhau chỉ khác overlay vẫn chia sẻ mọi blob nguồn". Nếu blob nằm trong từng entry thay vì ở gốc `node-cache/`, tiêu chí này đỏ.*
- AC-13: Given một entry đã ghi, When **ABI đổi** (một byte trong file ABI đang dùng) và chạy lại với mọi thứ khác giữ nguyên, Then **miss** — invoker được gọi lại. *ABI là input của phép tính: cả `materialize_asset_inputs` và `convert_asset_outputs_to_file_refs` đọc nó, nên cùng input có thể ra kết quả khác. `sdkMajor` KHÔNG phủ được vì ABI là file riêng có version riêng và đổi không kéo theo bump SDK. Cùng họ bug với `[NGÀNH: ccache]` không băm binary compiler — bỏ tiêu chí này là nhận đúng cái lỗi mà ngành mất nhiều năm mới trị hết.*
- AC-14 **(cross-layer)**: Given `getScope()` trả `""` (bản OSS đơn-tenant) hoặc `<id>` (cloud shell), When `engine-delegate.server.ts` dựng request cho bridge, Then `options.tenant` là `"local"` tương ứng `"user:<id>"` — **không bao giờ** là chuỗi rỗng; **và** given engine nhận `options.tenant` là chuỗi rỗng hoặc vắng, Then engine coi là không cacheable. *Phép dịch này là code không ai nhìn thấy cho tới khi hỏng, và nó là chỗ duy nhất biến "rỗng vì đơn-tenant" thành một giá trị tường minh. Hai nửa phải đo riêng: chỉ đo phía TS thì engine vẫn có thể chấp nhận rỗng; chỉ đo phía engine thì TS vẫn có thể truyền rỗng và mất cache trên desktop mà không ai biết.*

- AC-15: Given một workflow gồm **≥3 node trong allowlist** đã trúng cache toàn bộ, When **đúng một node đổi một trường nghiệp vụ** (một param, KHÔNG phải asset) rồi chạy lại với cùng `data_dir` / `tenant` / ABI, Then invoker được gọi **đúng một lần cho node đó cộng một lần cho mỗi node hạ nguồn của nó**, các node khác **0 lần**, và output của node đã đổi **khác** output đã cache. Và given hai lời gọi **trong cùng một batch** chỉ khác nhau ở một param nghiệp vụ, Then hai khoá của chúng khác nhau. *Đây là tiêu chí của chính cái tên spec — `engine-cache-partial-rerender` — và bản đầu của hợp đồng này **không có nó**; gap-probe bắt được, xếp P0. Kịch bản fail: `node_cache.py` dựng lời gọi fingerprint từ `params` mức NODE (hoặc chỉ từ digest asset) thay vì từ `call_params` per-call mà `fan_out_inputs` sinh ra, làm rơi các trường nghiệp vụ của node. Người dùng sửa `text` của một node `combine-text` rồi chạy lại: khoá không đổi → lần hai phục vụ output CŨ, âm thầm, với 0 lời gọi invoker. Mà AC-1 (cùng input hai lần), AC-6 (xoá thư mục), AC-13 (đổi ABI) và AC-11 (gieo sẵn 3/5 entry) đều vẫn XANH — AC-11 gieo entry sẵn chứ không dẫn xuất chúng từ input khác nhau, nên nó không bắt được việc khoá theo mức node. Không có AC-15 thì Cổng 1 được duyệt với niềm tin DoD đã phủ, và Cổng 2 ship một cache phục vụ kết quả cũ mỗi lần người dùng sửa.*
- AC-16 **(cross-layer)**: Given cùng một scope, When `engine-delegate.server.ts` dựng request bridge cho **hai task run liên tiếp**, Then `data_dir` **byte-identical** giữa hai lần và được dẫn xuất từ `scopedDataDirFor()`, không phải một đường dẫn theo task hay theo thư mục tạm. *Mọi eval khác tự kiểm soát `data_dir` (AC-1 và AC-9 coi "cùng `data_dir`" là tiền đề do test cấp), nên không tiêu chí nào đo được rằng host thật cấp một `data_dir` bền. Kịch bản fail: `data_dir` biến thiên theo run → `<data_dir>/.tongflow/node-cache/` là cây rỗng mới ở mọi task; 15/15 eval xanh, bằng chứng Cổng 2 cho thấy DoD đã chứng minh, và desktop có tỷ lệ trúng 0% vĩnh viễn. Đúng loại bug vô-hình-tới-lúc-hỏng mà chính hợp đồng này viện ra để biện minh cho AC-14. Đã kiểm code: `dataDir()` là `TONGFLOW_DATA_DIR` hoặc `path.resolve(process.cwd(), "data")` — bền theo tiến trình, nhưng **neo vào `process.cwd()`**, nên khởi động server từ cwd khác là cache rỗng. Tiêu chí này ghim tính bền lại trước khi một refactor phá nó âm thầm.*

## Coverage

Quét bằng skill `morphological-scan`, preset `test-matrix` (chất vấn và dựng lại trục — preset của nó nhắm feature có người dùng, L2 là engine headless).

- **Trục A — cổng cacheable:** slot ngoài allowlist | `tenant` rỗng/thiếu | `plugin_rev` thiếu | plugin dirty | đủ điều kiện — *[CE: design §5–§6 + luật fail-closed của L1]*
- **Trục B — giai đoạn tương tác:** quyết định → tra khoá → đọc entry → phục hồi blob vào store hiện tại → ghi entry — *[CE: D6 + đường code per-call của `runner.py`]*
- **Trục C — kết cục:** đường hạnh phúc | biên | hạ tầng lỗi — *[CE: §8 spec + `[NGÀNH: ccache]` cache dir read-only]*
- **Trục D — hình dạng fan-out:** không batch | batch trúng hết | batch trúng một phần | batch rỗng — *[CE: `fan_out_inputs` + bài học lô rỗng của L0]*

Không gian ≈ 5×5×3×4 = 300 ô → quét **pairwise** theo Pareto của preset, không tích Descartes đầy đủ.

**Ô chân ngành lộ ra mà bản đầu design đã sót:** ABI không nằm trong khoá → AC-13. Đây là giá trị rõ nhất của bước quét: nó đến từ `[NGÀNH: ccache]`, không từ trí nhớ về sản phẩm này.

**Ô đã quét, cố ý để ngoài Core:**
- Phiên bản binary `ffmpeg` không nằm trong khoá — cùng họ AC-13, xem `## Known limits (ghi ở Cổng 2 từ 4 finding ngoài hợp đồng của S4 round 1 — quyết định: ghi Known limits, không sửa trong lát này)

- **`plugin_is_dirty` fail-OPEN khi `git status` exit khác 0** (index hỏng, lỗi quyền worktree): rev vẫn đọc được mà độ bẩn không biết được → plugin ĐANG có sửa đổi được cache dưới khoá rev-sạch, và run sau (kể cả checkout sạch thật của rev đó) nhận output của bản đã sửa — đúng hiểm hoạ R1. Mọi đường lỗi khác trong file fail-closed; riêng chỗ này ngược chiều. **Ứng viên sửa đầu tiên của lát kế** (một dòng: returncode != 0 → coi là dirty), chưa sửa ở đây vì đụng eval sau verify là bắt đầu lại vòng.
- **`engineOptionsFor` spread `assetOptions` SAU `tenant`/`data_dir`**: một key tương lai trùng tên sẽ âm thầm đè giá trị dẫn xuất từ scope — đúng lớp regression mà seam này sinh ra để chặn, và test hiện truyền `assetOptions: {}` nên không bắt được. Sửa = đảo thứ tự spread hoặc assert không trùng key.
- **`NodeCache.get/put` nuốt mọi ngoại lệ không một dòng log**: cache hỏng vĩnh viễn (sai quyền sau migration) không phân biệt được với cache lạnh. Degrade-to-miss là đúng spec §8; thiếu là tính quan sát được — một warning memo hoá mỗi run là đủ.
- **Comment `node_cached` trong `runner.py` nói L2 phát event đó — L2 không phát.** Cache hit đi qua `node_completed` như run thường; wiring `engine-events.ts` cho `node_cached` vẫn là dead code. Hoặc phát event ở đường hit, hoặc sửa comment nói lát nào sở hữu nó.
- **L3 (`cache-l3-tier-b`, 2026-07-30, nhánh `feat/cache-l3-tier-b`) sửa `node_cache.py`** — thêm
  `TIER_B_SLOTS`, `DESCOPED_GENERATIVE_SLOTS`, và sửa `plugin_is_dirty` để coi `git status` exit
  khác 0 là dirty, đóng đúng known limit **đầu tiên** ở mục này — **và** sửa cổng cache của
  `runner.py`. Cả hai file feature này sở hữu. Theo luật per-file (AGENTS.md §2), chữ ký Cổng 2
  của feature này **không carry-forward được**: phải verify lại và ký lại cùng PR của L3.

## Notes`.
- Hai run ghi song song cùng một entry — atomic write đã phủ phần nguy hiểm; không đáng một AC riêng ở L2.
- Store `Http` trên đường trúng cache — cùng cơ chế `put`, phủ bằng AC-2. **Đính chính 30/07 (final review, prose-only):** vế `Disk` của bullet gốc là SAI — `DiskStore.get()` trả `None` by design, nên kết quả mang asset trên đường desktop-delegation (`file_key_base` tương đối) KHÔNG cache được và L2 fail-closed từ chối ghi entry. Hệ quả đo được: 9/11 slot tầng A có output asset → DoD 'workflow ffmpeg thuần 100% trúng' đạt trên MemoryStore/HttpStore, còn desktop hiện 0% cho slot asset. Dạy cache biết `file_key_base` là hàng đợi riêng (xem STATUS).
- Plugin đọc env var không khai (API key) — `[NGÀNH: Bazel]` non-hermetic action; 11 slot tầng A đều thuần cơ khí không gọi API nên ô này rỗng ở L2, sẽ sống lại ở L3.

## Out of scope

- **Tầng B (memo theo workflow + tenant)** — L3. L2 chỉ tầng A.
- **Eviction / LRU / trần dung lượng / `purge()` / `reuse=` API** — L4. L2 **không có núm tắt riêng**: `tenant` không khai *là* cách tắt, và test dùng `data_dir` mới thay cho một cờ.
- **1.1-L1b (`mime`/`filename` vào digest)** — contract riêng. L2 né bằng cách hoãn `transcribe` / `transcribe-timestamp` / `parse-document` khỏi allowlist.
- **`sdk_major()` kiểm lỏng** — known limit của L1, giữ nguyên.
- **Không đụng `store.py`** — Q1 chốt KHÔNG (29/07): `HttpStore` nhận `file_key` do host cấp nên nội-dung-địa-chỉ không thể làm đồng nhất ba store.
- **Không mở rộng allowlist quá 11 slot cơ khí** ở lát này.

## Notes

- **`fingerprint.py` bị sửa** (thêm `tenant`, `abi_digest`, bump `KEY_SCHEMA_VERSION` → 2). File đó do `cache-l1-fingerprint` **sở hữu**, nên theo luật per-file (AGENTS.md §2, chốt 29/07) feature ấy phải **verify lại + chữ ký Cổng 2 mới**. Đã biết trước và nhận ở Cổng 1 của L2. Vector của AC-13 (L1) sẽ được sinh lại, và AC-14 của L1 *tự chứng minh* cú bump bằng cách chạy lại node-id của AC-13 trong subprocess.
- **Mỗi lần sửa ABI là toàn bộ cache mất hiệu lực.** Hệ quả trực tiếp của AC-13, và là chi phí vận hành thật: ở giai đoạn này ABI đổi khá thường (mọi feature cross-layer đều chạm theo CLAUDE.md), nên trong lúc phát triển tỷ lệ trúng sẽ thấp. Hành vi *đúng* — R6 đã nhận cùng đánh đổi cho `sdkMajor` — nhưng đừng ngạc nhiên khi cache "không hoạt động" ngay sau một PR chạm ABI.
- **Phiên bản binary `ffmpeg` không nằm trong khoá — known limit, cùng họ AC-13.** 11 slot tầng A đều là ffmpeg. Nếu ffmpeg là gói **hệ thống** (không phải pip trong `requirements.txt` của plugin) thì `pluginRev` + venv marker không phủ nó, và nâng cấp ffmpeg sẽ khiến cache phục vụ output của bản cũ — encoder defaults giữa các bản ffmpeg đổi thật. Không quyết được trong lát này vì `plugins/` gitignore nên không đọc được plugin thật để biết ffmpeg đến từ đâu. **Việc đầu tiên của L3/L4 nên là trả lời câu đó**, không phải mở rộng allowlist.
- Fixture của `test_engine_batch.py` patch thẳng `scan_manifest`, nên nó tự cấp `cfg` kèm `pluginRev` và `read_plugin_rev` không bao giờ chạy — **chỉ ca (a) của AC-10** (dò dirty) cần một git checkout thật, vì `plugin_is_dirty` đọc working tree thật. Mười lăm tiêu chí còn lại dùng manifest patch là đủ. Câu trong bản đầu của tài liệu này ("mọi fixture buộc phải git init") quá rộng; nó nằm trong prose, không trong tiêu chí nào, nên sửa được mà không mở lại Cổng 1.
