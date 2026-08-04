---
schema_version: 1
feature: Cache L4 — LRU eviction theo dung lượng, purge, reuse API, telemetry % partial
slug: cache-l4-eviction
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [sdk, api, db]
status: verified
approved_by: Manh
approved_at: 2026-07-31
time_human_minutes: {gate1: 10, gate2: 15}
---

# Acceptance Contract: cache-l4-eviction

## Context

Lát cuối của trục cache 1.1 ([spec §6](../../docs/spec/prd/engine-cache-partial-rerender.md)). L2/L3 cho cache đọc/ghi thật nhưng **chưa có gì xoá**: 5 lần sửa prompt tầng B = 5 entry cỡ media, 1 cái với tới được — known limit "monotonic orphan generator" trên card Cổng 2 của L3, và đĩa phình đơn điệu (R2). Đồng thời DoD "đo được % partial" chưa có nguồn dữ liệu: engine **chưa bao giờ phát** `node_cached` (đường ống TS wired từ L0 nhưng hit hiện tan lặng lẽ vào `node_completed`), và không có gì persist để truy vấn.

Thiết kế: [2026-07-31-cache-l4-eviction-design.md](../../docs/superpowers/specs/2026-07-31-cache-l4-eviction-design.md). Bốn quyết định định hình (đã duyệt brainstorm 31/07): sidecar `meta.json` + sweep cuối run (loại SQLite index và layout-theo-scope); telemetry persist vào 2 cột nullable của `tasks` (pattern task-metering — NULL giữ nghĩa "không đo", khác "đo ra 0"); `reuse=` chỉ ship `auto`/`off`, **descope `force`** (amendment spec §7); không lock liên tiến trình — sweep/purge best-effort, race tự lành qua ngữ nghĩa miss sẵn có.

**Chi phí ký lại, báo giá NGAY tại Cổng 1** (luật per-file): L4 sửa `node_cache.py` + `runner.py` + `engine-delegate.server.ts` + tách `test_node_cache.py` (→ `cache-l2-store`, `cache-l3-tier-b`, `conformance-l0` ký lại); sửa `workspace.schema.ts` + `metering-schema.test.ts` (→ `task-metering` ký lại). Nếu việc tách test đụng `test_fingerprint*.py` thì thêm `cache-l1-fingerprint`. Dự kiến **4–5 chữ ký lại** + carry-forward phần còn lại — cùng hình dạng wave L3.

## Criteria

**Kế thừa nguyên văn hai quy tắc chung của L2/L3**: (1) so khoá phải ép cả hai vế là chuỗi khác `None`; (2) tiêu chí "không đọc không ghi" kiểm **cả hai chiều**. Thêm quy tắc riêng L4: **mọi tiêu chí sweep/purge đo bằng trạng thái đĩa thật** (file tồn tại/mất + tổng bytes), không đo qua giá trị trả về của hàm sweep.

- AC-1: Given cache vượt trần với ≥3 entry, trong đó một entry **tạo sớm nhất nhưng vừa được hit** (get thành công) và một entry tạo muộn hơn nhưng không được dùng lâu hơn, When sweep chạy, Then thứ tự evict theo **least-recently-USED**: entry tạo-sớm-vừa-hit sống sót, entry nguội hơn bị xoá. *Survivor set phải khác thứ tự tạo — một FIFO giả danh LRU phải làm tiêu chí này đỏ; đây là guard của việc `get()` touch recency.*
- AC-2: Given tổng dung lượng (entries + blobs) **vượt trần**, When sweep, Then sau sweep tổng ≤ trần (đo bằng stat thật trên đĩa). Given tổng **dưới trần**, When sweep, Then **không entry nào và không blob-còn-được-tham-chiếu nào bị xoá** (blob mồ côi vẫn bị GC theo AC-4 — orphan GC chạy vô điều kiện, không gate sau điều kiện vượt trần). *Hai chiều của cùng cái trần: hụt chiều nào cũng hoặc phình đĩa hoặc phá cache vô cớ; vế noop viết tường minh để không mâu thuẫn AC-4.*
- AC-3: Given hai entry cùng tham chiếu một blob (dedupe của L2), When sweep evict đúng một trong hai, Then blob **còn nguyên**, entry sống sót vẫn **hit và rehydrate đúng bytes**. *Reachability kiểu Git gc: refcount, không xoá mù theo entry.*
- AC-4: Given blob không được entry sống nào tham chiếu — gồm cả **orphan có sẵn từ trước khi sweep tồn tại** (mô phỏng entry L2/L3 bị xoá tay, blob bỏ lại), When sweep, Then mọi blob mồ côi bị xoá kể cả khi không entry nào bị evict trong lần sweep đó. *Đây là tiêu chí đóng "monotonic orphan generator" — hồi tố, không chỉ cho entry mới.*
- AC-5: Given entry thời L2/L3 **không có `meta.json`**, When sweep, Then không crash, entry evict được theo mtime, blob refs lấy từ `result.json`; When purge, Then entry legacy được **bỏ qua** (tenant không xác định — giới hạn có chủ đích, nó già đi qua LRU). *Tương thích ngược không cần migration.*
- AC-6: Given root cache không đọc/ghi được (quyền, hoặc dir biến mất giữa chừng), When sweep/purge chạy, Then **không raise**, kết quả run y hệt run không cache; **và** danh sách ĐÓNG bốn nhánh nuốt lỗi sau phát **đúng một dòng log mỗi lần kích hoạt** qua callback: (1) `get` gặp entry không dùng được → miss, (2) `put` bị từ chối, (3) `sweep` lỗi, (4) `purge` lỗi. **Miễn trừ tường minh:** `os.utime` touch recency lúc hit fail thì im lặng — root read-only mà log mỗi hit là spam, và recency chỉ là advisory. *Đóng known limit L2 "cache nuốt lỗi không log" bằng danh sách đóng đo được, không phải lượng từ "mọi nhánh".*
- AC-7: Given entry tầng B của hai workflow khác nhau cùng tenant, entry tầng A cùng tenant, và entry của tenant khác — chung một `data_dir`, When `purge(tenant, workflow_id)`, Then **chỉ** entry tầng B có `meta.tenant` khớp và `workflow_scope` bắt đầu `"wf:<workflow_id>:"` bị xoá; tầng A (scope `null`), workflow khác, tenant khác **vẫn hit được** sau purge (kiểm chiều dương, không chỉ đếm file). *Best-effort nhưng đúng phạm vi tuyệt đối — xoá lố là mất cache người khác.*
- AC-8: Given purge đã chạy một lần, When gọi **lần thứ hai** cùng tham số, Then không lỗi, không xoá thêm gì; **và** blob chỉ được entry vừa purge tham chiếu bị dọn trong cùng lần gọi. *Idempotent theo spec §8; purge không được tự tạo orphan mới.*
- AC-9: Given `reuse="off"`, When chạy workflow hai lần (lần đầu để ấm bằng `auto` trước đó), Then **không entry nào được đọc** (invoker gọi đủ), **không entry/blob nào được ghi thêm**, **không sweep** — cây node-cache **byte-identical** trước/sau run off; kết quả run vẫn đúng. *Ba phủ định phải kiểm cả ba — off mà vẫn sweep là benchmark tự phá cache của chính nó.*
- AC-10: Given `reuse` nhận giá trị ngoài `{"auto","off"}` (vd `"force"`, `""`, `None` không tính — `None` không phải tham số hợp lệ vì default là `"auto"`), When gọi `run_workflow`, Then `ValueError` **trước khi bất kỳ node nào chạy**; và `reuse="auto"` giữ hành vi hiện tại từng chữ (suite L2/L3 xanh nguyên vẹn). *Fail loud tại biên; `force` descope không được âm thầm hiểu thành auto.*
- AC-11: Given năm kịch bản — (a) full hit mọi node, (b) batch partial hit (một phần call trúng), (c) all miss, (d) run fail giữa chừng, (e) `reuse="off"` — When chạy, Then result block `cache.calls_total`/`cache.calls_cached` đúng từng con số: call fail **không bao giờ** đếm là cached; block **có mặt cả khi run failed** (đếm tới thời điểm dừng); cache tắt (tenant vắng) → block **vắng**; và `reuse="off"` → block **vắng** (cột NULL — run benchmark không được pha loãng mẫu số của % partial bằng những hàng 0% giả). *Nguồn số liệu duy nhất của % partial — sai ở đây là gate G2 đọc số rác.*
- AC-12: (cross-layer) Given node có **TẤT CẢ** call trúng cache, When chạy, Then engine phát `node_cached` đúng shape L0 đã pin (`nodeId`, `feature`, `label`, `fingerprint`, `tier`, `output` = merged results) **bên cạnh** `node_completed` (luồng completion hiện có không đổi); node lạnh hoặc **partial-hit KHÔNG phát** `node_cached` (partiality sống trong counters). **Nửa consumer TS phải đo, không chỉ khẳng định:** cặp sự kiện `node_cached` + `node_completed` của cùng node đi qua đường ống delegate/client hiện có → output apply đúng **một** lần, không throw — đường ống L0 ngủ 4 slice nay nhận sự kiện thật lần đầu. *Comment stale ở `runner.py` được sửa bằng cách làm cho nó đúng.*
- AC-13: (cross-layer) Given engine trả `finalResult.cache`, When delegate cập nhật task row ở nhánh terminal (**cả** success **lẫn** failed), Then `cache_calls_total`/`cache_calls_cached` được ghi đúng giá trị; Given block **vắng** (engine cũ, cache off), Then hai cột giữ **NULL — không bao giờ 0**. Schema: hai cột integer nullable + migration drizzle, và tỷ lệ % partial truy vấn được bằng một câu SQL trên `tasks`. *Cặp nguyên tử với E11 (nửa engine): bằng chứng hai lớp phải cùng round.*
- AC-14: Given bộ test cache sau khi tách file, When chạy guard layout, Then **mọi** file test cache ≤ 800 dòng **và** mọi pytest node-id cache đã khai trong `_acceptance/config.yaml` (họ `l2`/`l3`/`l4`) collect **đúng 1 test**; guard tự chứng minh discriminating (file >800 dòng → đỏ; node-id collect 0 hoặc ≥2 → đỏ). *Trả nợ M-d của L3 mà không làm gãy ref eval nào — key giữ nguyên, chỉ giá trị lệnh đổi (tiền lệ measure-harness).*
- AC-16: Given cache **vượt trần** trên đĩa, When gọi `run_workflow(reuse="auto")` — một case run **success**, một case run **fail giữa chừng** — Then sau khi `run_workflow` trả về, tổng dung lượng đo bằng stat thật ≤ trần (sweep **thực sự được gọi** ở cuối run, không chỉ tồn tại như hàm unit); **và** chuỗi resolve trần chứng minh được cả ba nấc: param `cache_max_bytes` thắng env, env `TONGFLOW_CACHE_MAX_BYTES` thắng default, default = 20 GiB. *Gap-probe P0: mọi eval sweep khác gọi thẳng `sweep()` unit-level — thiếu tiêu chí này thì impl quên cắm dây vẫn 18/18 xanh và orphan generator vẫn mở trong production, cùng họ với I1 của L3 (wiring không guard).*
- AC-15: Given ABI guard của tier lists, When kiểm hai chiều, Then (a) slot có núm (`seed`/`temperature`/`top_p`) trong ABI mà vắng khỏi `TIER_B_SLOTS ∪ DESCOPED_GENERATIVE_SLOTS` → đỏ (chiều đã có từ L3), **và** (b) slot nằm trong bất kỳ list nào (`TIER_A`/`TIER_B`/`DESCOPED`) mà **không còn tồn tại trong ABI** → đỏ (chiều mới — trả nợ M-e). *Slot chết nằm lại trong list là phân loại zombie: vô hại hôm nay, sai lệch âm thầm khi tên slot được tái sử dụng.*

## Coverage

Từ morphological scan 31/07 (preset test-matrix + risk-premortem; chân ngành: ccache / Git gc / Bazel disk cache):

- **Trục thao tác** get-hit | put | sweep | purge | reuse-off — [CE: mặt cắt API + spec §8] → AC-1..10, AC-16 (sweep wired end-to-end + chuỗi resolve trần)
- **Trục trạng thái entry** có-meta | legacy-không-meta | hỏng/ghi-dở | blob-share — [CE: format đĩa L2 + lịch sử suite] → AC-3..6
- **Trục điều kiện** dưới trần | vượt trần | scope khớp/không-khớp | fs-error — [CE: spec R2/§8] → AC-2, 6, 7
- **Trục kết cục call (telemetry)** full-hit | partial-hit | miss | failure | cache-off — [CE: vòng per-call của runner] → AC-11, 12
- **Trục tầng persist** engine result | sự kiện `node_cached` | cột `tasks` — [CE: pattern task-metering đã ký; ngành: ccache stats] → AC-11..13
- Ô Later/Never có vết: race đa tiến trình (Later — known limit, D-L4-4) · công bằng trần giữa tenant (Later — cloud P2) · TTL (Never — Q3) · SQLite index (Never — D-L4-1) · phơi reuse ra UI (Never — spec D7).

## Out of scope

- `reuse="force"` (descope D-L4-3, entry ledger; amendment spec §7 đi cùng PR).
- Wiring purge vào app/UI (xoá workflow trong canvas chưa gọi purge — engine API only).
- Lock/serialize sweep liên tiến trình (D-L4-4 — best-effort, race tự lành qua miss).
- Trần per-tenant (một trần chung; cloud multi-tenant chung đĩa là known limit, revisit P2).
- `mime`/`filename` vào digest (queue 1.1-L1b) · cache `file_key_base` (queue 1.1-L2b) · seed-pinning dời upscale về tầng A.

## Notes

**Known limits — chốt tại Cổng 2 (Manh Phan, option (a) cho 2 finding ngoài hợp đồng):**

- **`cache_max_bytes` từ host không được kiểm tra kiểu** (2 finding review gộp một gốc, `node_cache.py:142` + wiring): giá trị không hợp lệ (chuỗi, số âm) → âm thầm rơi về mặc định 20GiB, không log — deferral trong docstring chưa bao giờ được thực hiện; boolean `true` → `isinstance(True, int)` cho trần **1 byte** → sweep cuối run xoá gần hết cache không cảnh báo. Chưa chạm được từ đường chạy thật nào (delegate không gửi trường này). **Revisit:** sửa cùng lát kế tiếp mở lại `node_cache.py` (L5 eviction-extraction hoặc 1.1-L2b) — guard `not isinstance(param, bool)` + log một dòng khi bỏ qua giá trị, hoặc raise như `reuse`.
- **Race đa tiến trình của sweep/purge** — descope có chủ đích (D-L4-4, không lockfile): 2 tiến trình cùng dọn là best-effort, race tự lành qua ngữ nghĩa miss; cửa sổ micro giây prune-giữa-meta-và-result tạo entry dạng-legacy (AC-5 vẫn sweep được). Revisit cloud P2.
- **Trần dung lượng là MỘT trần chung** — cloud multi-tenant chung đĩa: churn của tenant này evict được entry của tenant kia. Revisit P2 (per-tenant cap).
- **Preflight raise (thiếu plugin/venv) thoát trước sweep** — run đó không put gì nên không phình; cache đang vượt trần thì đợi run auto kế tiếp.
- **Purge để lại thư mục shard 2-ký-tự rỗng** (chỉ inode; sweep prune mức entry-dir).
- **`cacheColumnsFrom` nhận float/âm** — engine chỉ phát int; SQLite dynamic typing lưu vô hại.
- **E20 (apply-đúng-một-lần)**: một thông báo hoàn thành mỗi node + shape mảng an toàn đo trên code thật; idempotency double-apply ghim ở seam contract `payload.ts` bằng model mutation-proven của `expands` — reuse thật sống trong Zustand store, repo không có React test harness.
- **E15/E16/E20 không tự phân biệt qua bộ lọc `-t`** (0 test trên cây không feature → xanh trống): sức phân biệt nằm ở bằng chứng mutation trong report từng task (mẫu E9 của L3).
- **`run_workflow` ~485 dòng** — extraction khối cache per-call xếp hàng lát kế.
