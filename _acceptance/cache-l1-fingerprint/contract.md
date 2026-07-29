---
schema_version: 1
feature: Cache L1 — node_fingerprint() and digest_form(), pure key computation
slug: cache-l1-fingerprint
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [sdk]
status: draft
approved_by:
approved_at:
time_human_minutes: {gate1: 0, gate2: 0}
---

# Acceptance Contract: cache-l1-fingerprint

## Context

The product's whole economic claim is *"sửa miễn phí — sinh mới mới tính tiền"*.
The [cache spec](../../docs/spec/prd/engine-cache-partial-rerender.md) breaks the
cache into slices; L0 ([`conformance-l0`](../conformance-l0/contract.md)) landed
`pluginRev` and matched the engine's fan-out to the canvas. L1 is the next slice:
it computes the cache **key**, and only the key — `digest_form()` and
`node_fingerprint()`, two pure functions with no cache reads or writes.

D1 fixes the hash hook at the point right after `materialize_asset_inputs`
(`runner.py:359`), so `business_input` already carries real asset bytes and the
key is content-addressed for free. D2 defines the key's components: `v` (key
schema version), slot, pluginId, pluginRev, an `sdkMajor` of `major.minor`
granularity, model, and the digest of business input with per-run keys
(`_tongflow`, `taskId`, `outputs`, `level`, `dependencies`) stripped. R1
requires a missing/empty `plugin_rev` to degrade to "not cacheable" (`None`)
rather than a key computed as if nothing were wrong, so a hand-copied plugin
without `.git` doesn't silently poison the cache with a key that never
invalidates when the plugin's code changes.

`conformance-l0` (signed off) recorded a second, sharper version of the same
failure and named it a blocking condition for this slice: `git rev-parse HEAD`
cannot see an uncommitted edit, so a plugin that is hand-modified in place
keeps its old `pluginRev`, the key never changes, and the cache serves the
stale result forever. This slice closes that condition — see AC-7 and Notes.

AC-15 is the seam this slice must not drift from: `digest_form()` must be
computed from the **same** normalized artifact that the L0 conformance suite
already proves TypeScript and Python agree on (`normalize_call()` in
`callog.py`). If the two diverge, the conformance suite polices one shape while
the cache key uses another, and a semantics disagreement the suite is built to
catch stops being visible to the cache at all.

Source input: [`.superpowers/sdd/task-2-brief.md`](../../.superpowers/sdd/task-2-brief.md), [cache spec](../../docs/spec/prd/engine-cache-partial-rerender.md) §3 (D1, D2), §7 (R1, R6).

## Criteria

- AC-1: Given cùng một `(slot, pluginId, pluginRev, model, business_input)`, When `node_fingerprint()` được gọi ở **hai tiến trình khác nhau với `PYTHONHASHSEED` khác nhau**, Then hai khoá bằng nhau. *DoD của L1 là "fingerprint ổn định qua các lần chạy"; gọi hai lần trong một tiến trình không chứng minh được điều đó vì thứ tự dict trùng nhau sẵn.*
- AC-2: Given hai `business_input` khác nhau ở đúng một trường nghiệp vụ, When tính khoá, Then hai khoá khác nhau.
- AC-3: Given hai `business_input` chỉ khác nhau ở khoá per-run (`_tongflow`, `taskId`, `outputs`, `level`, `dependencies`), When tính khoá, Then hai khoá **bằng** nhau. *Mỗi khoá này từng đủ sức phá sạch cache nếu lọt vào (D2).*
- AC-4: Given hai asset có **cùng bytes** nhưng `file_key` khác nhau, When tính khoá, Then hai khoá bằng nhau. *Đây là điều D1 mua được khi hash sau `materialize_asset_inputs`.*
- AC-5: Given hai asset có **cùng `file_key`** nhưng bytes khác nhau, When tính khoá, Then hai khoá khác nhau. *Đây đúng là con bug D1 sinh ra để chặn — khoá theo tham chiếu sẽ trúng cache sai.*
- AC-6: Given `plugin_rev` là `None` hoặc chuỗi rỗng, When gọi `node_fingerprint()`, Then trả về `None` (không cacheable) chứ không phải một khoá. *R1: plugin sửa code mà khoá không đổi là tái dùng kết quả của phiên bản cũ. Trả `None` để pyright ép người gọi ở L2 xử lý, thay vì ném lỗi cho một trạng thái bình thường (plugin chép tay không có `.git`).*
- AC-7: Given `plugin_dirty=True` — tham số keyword bắt buộc của `node_fingerprint()` — bất kể `plugin_rev` có giá trị hợp lệ hay không, When gọi `node_fingerprint()`, Then trả về `None`, cùng hạng "không cacheable" như AC-6. *Đóng đúng "Điều kiện chặn L1" mà `conformance-l0` đã ghi ở Cổng 2: `git rev-parse HEAD` không thấy working tree bẩn, nên một plugin sửa tay giữ nguyên rev cũ và khoá không đổi — phục vụ kết quả cũ vĩnh viễn. Việc phát hiện dirty (`git status --porcelain` hoặc tương đương) là của caller ở L2; L1 vẫn thuần, chỉ nhận cờ đã tính sẵn.*
- AC-8: Given hai `plugin_rev` khác nhau, mọi thứ khác giữ nguyên (kể cả `plugin_dirty=False` ở cả hai), When tính khoá, Then hai khoá khác nhau.
- AC-9: Given hai node giống hệt nhau ngoại trừ `slot` (`node.feature`) khác nhau, When tính khoá, Then hai khoá khác nhau. *Nếu implementation bỏ `slot` khỏi dict băm, tiêu chí này là thứ duy nhất bắt được: mọi AC khác vẫn xanh trong khi hai slot khác nhau với input giống hệt trúng cache CHÉO — sai kết quả ở L2.*
- AC-10: Given hai node cùng `slot` nhưng `pluginId` khác nhau (hai plugin khác nhau cùng phục vụ một slot), mọi thứ khác giữ nguyên, When tính khoá, Then hai khoá khác nhau. *Cùng lỗ hổng như AC-9 nhưng ở thành phần khác: bỏ `pluginId` khỏi khoá làm hai implementation khác semantics của cùng slot chia sẻ cache.*
- AC-11: Given `model=None` so với `model="flux-dev"`, mọi trường khác giữ nguyên, When tính khoá, Then hai khoá khác nhau. *`model` là một trong bảy thành phần liệt kê ở D2; bỏ nó khỏi dict băm làm hai model khác nhau trên cùng slot/plugin trúng cache sai — im lặng, vì không AC nào khác chạm tới trường này.*
- AC-12: Given hai phiên bản SDK khác nhau ở **patch** (`0.2.17` vs `0.2.18`) truyền vào qua tham số `sdk_version` tuỳ chọn của `node_fingerprint()` — không đọc mặc định từ `tongflow.__version__`, vì hằng số module không thể bị một test tiêm giá trị khác mà không monkeypatch một giá trị đã suy ra sẵn — When tính khoá, Then khoá **bằng** nhau; và given khác ở **minor** (`0.2.17` vs `0.3.0`) qua cùng tham số, Then khoá khác nhau. *D2 nói `sdkMajor` là major.minor; R6 chấp nhận việc đổi nó vô hiệu hoá cache, nhưng một bản vá patch mà thổi bay 20GB cache thì không.*
- AC-13: Given file vector `sdk/tests/fixtures/fingerprint_vectors.json` như đã commit, When chạy lại, Then mọi khoá tính ra khớp **từng ký tự** với khoá đã ghi. *Lược đồ khoá trôi mà `v` không bump = mọi entry cache cũ trở thành rác âm thầm. Vector là thứ duy nhất bắt được việc đó.*
- AC-14: Given bộ vector của AC-13 đang xanh, When hằng số module `KEY_SCHEMA_VERSION` (trường `v` trong D2) bị bump thêm 1 mà **không** cập nhật file vector, Then test của AC-13 phải chuyển **đỏ**; và khi revert hằng số về giá trị cũ, test phải xanh lại. *Quy tắc ghi ở STATUS.md: "guard mới phải chứng minh nó đỏ khi lỗi quay lại, không chỉ xanh khi code đúng." Không có tiêu chí này, AC-13 có thể xanh vì so sánh vô nghĩa (ví dụ so một hằng số với chính nó) chứ không phải vì vector thật sự khớp.*
- AC-15: Given cùng `(slot, business_input)`, When so `digest_form(slot, bi)` với `normalize_call(slot, bi)["input"]` của `callog.py`, Then hai giá trị bằng nhau **trên nhiều hình dạng input** — có asset (so khớp `{"__asset": "<sha256>"}`, không phải `{"__sha256": ...}` của D2, xem Notes), có trường `None`/rỗng bị lược bỏ, có danh sách asset lồng nhau, và có ít nhất hai slot khác nhau — không chỉ một input rỗng hay một input đơn giản thoả mãn được. *Khoá cache phải tính từ **chính** artifact mà conformance suite chứng minh hai runtime đồng ý. Nếu hai thứ đó tách ra, suite canh một đằng còn cache dùng một nẻo — đúng loại lỗi §5 của spec đặt tên.*

## Coverage

Quét thủ công theo trục thành phần khoá (D2) × mặt kiểm, sau khi AC-1..AC-6,
AC-8, AC-13, AC-15 đã có từ vòng viết đầu; các ô còn trống dưới đây là thứ
review round này lấp (AC-7, AC-9..AC-12, AC-14).

- Trục A — thành phần khoá theo D2: `v` · `slot` · `pluginId` · `pluginRev` · `model` · `sdkMajor` · digest của `business_input` — [CE: spec cache §3 D2]
- Trục B — mặt kiểm: bất biến (đổi trường không liên quan → khoá giữ nguyên) · phân biệt (đổi trường liên quan → khoá đổi) · biên "không cacheable" · chống hồi quy im lặng (vector + guard tự chứng minh không vô nghĩa)
- Ô đã có từ đầu: A(digest business_input) × B(bất biến) → AC-3, AC-4; A(digest business_input) × B(phân biệt) → AC-2, AC-5; A(pluginRev) × B(biên) → AC-6; A(pluginRev) × B(phân biệt) → AC-8; A(sdkMajor) × B(bất biến/phân biệt) → AC-12; A(digest business_input) × B(chống hồi quy) → AC-13, AC-15
- Ô review round này lấp — suýt sót: A(`slot`) × B(phân biệt) → AC-9; A(`pluginId`) × B(phân biệt) → AC-10; A(`model`) × B(phân biệt) → AC-11 — ba thành phần này KHÔNG có tiêu chí nào trước round này chạm tới; một implementation bỏ cả ba khỏi dict băm vẫn xanh hết AC-1..AC-6/AC-8/AC-12/AC-13/AC-15
- Ô review round này lấp — biên chặn L1: A(pluginRev) × B(biên "không cacheable") → AC-7, đóng "Điều kiện chặn L1" mà `conformance-l0` đã ghi
- Ô review round này lấp — guard không được vô nghĩa: A(`v`) × B(chống hồi quy) → AC-14, tự chứng minh AC-13 phân biệt được lược đồ trôi chứ không chỉ xanh vì trùng khớp
- Ô có nghĩa nhưng cắt khỏi phạm vi: A(`v`) × B(quy trình migration cache cũ khi bump) — xem Out of scope

## Out of scope

- **Đọc/ghi cache** — không cache store, không blob dedupe, không đọc/ghi bất kỳ entry nào. L1 chỉ tính khoá.
- **Nối vào `runner.py`** — không cắm `node_fingerprint()` vào vòng lặp thực thi. Đó là L2.
- **Sửa `callog.py`** — AC-15 chỉ *so sánh* với `normalize_call()` đã có từ `conformance-l0`, không sửa hàm đó hay hợp đồng của nó.
- **Phát hiện plugin dirty** (`git status --porcelain` hoặc tương đương) — `node_fingerprint()` chỉ nhận cờ `plugin_dirty: bool` đã tính sẵn qua tham số bắt buộc (AC-7); việc *tính ra* cờ đó thuộc về caller ở L2 hoặc lát kế tiếp đưa rev vào khoá thật.
- **Quy trình bump `v` (hằng số `KEY_SCHEMA_VERSION`) và migration cache cũ khi lược đồ đổi** — `v` bản thân LÀ một thành phần bắt buộc của khoá (D2) và AC-14 khẳng định bump nó phải làm khoá vector đổi; chỉ riêng *quy trình xử lý các entry cache cũ* (invalidate, migrate, cảnh báo changelog) khi `v` thật sự bump nằm ngoài phạm vi hai hàm thuần này.

## Notes

- Interfaces mà Task 3–5 sẽ tham chiếu: mười lăm executor key, một cho mỗi tiêu chí (AC-1..AC-15), khai dưới `executors.test.sdk_pytest_fingerprint_*` và `executors.test.sdk_pytest_fingerprint_vectors_*` trong `_acceptance/config.yaml` — xem `evals.yaml` cho ánh xạ đầy đủ AC↔eval↔executor key. Thay thế cho cặp khoá gộp ban đầu (`sdk_pytest_fingerprint`, `sdk_pytest_fingerprint_vectors`): một khoá dùng chung cho nhiều tiêu chí để lộ đúng lỗ mà `stale-scope-by-paths` đã đặt tên — một tiêu chí chưa cài vẫn thoát 0 giống một tiêu chí đã cài, vì cùng một lệnh `pytest` chạy cả file.
- Contract này không sinh code sản phẩm. `sdk/tongflow/engine/fingerprint.py`, `sdk/tests/test_fingerprint.py`, `sdk/tests/test_fingerprint_vectors.py`, `sdk/tests/fixtures/fingerprint_vectors.json` đều hạ cánh ở các task sau, sau khi Cổng 1 được ký.
- **Đóng "Điều kiện chặn L1"**: `conformance-l0` (đã ký) ghi rõ ở Cổng 2 rằng `pluginRev` mù với sửa đổi chưa commit là điều kiện phải đóng trước khi L1 coi là xong — nếu không, một plugin sửa tay sẽ phục vụ kết quả cũ vĩnh viễn. AC-7 đóng điều kiện đó: `node_fingerprint()` nhận tham số bắt buộc `plugin_dirty: bool` và trả `None` khi nó `True`, bất kể `plugin_rev`. Việc *tính* cờ dirty (`git status --porcelain`) là của caller — L1 giữ nguyên là hàm thuần.
- **Lệch khỏi D2 đã biết, ghi lại để Cổng 1 thấy**: D2 định nghĩa `digest_form()` thay `bytesBase64` bằng `{"__sha256": "<hex>"}`, nhưng `normalize_call()` đã ký ở `conformance-l0` (`sdk/tongflow/engine/callog.py:27`) dùng hằng số `ASSET_DIGEST_KEY = "__asset"`, tức `{"__asset": "<hex>"}`. AC-15 đòi `digest_form()` khớp **chính xác** `normalize_call()`, nên contract này đi theo hình dạng đã ship (`__asset`) chứ không theo spec (`__sha256`). Spec đang được sửa ở một PR riêng đang mở; tới khi đó, `"__sha256"` trong văn bản D2 coi như đã lỗi thời so với `__asset` mà code thật dùng.
