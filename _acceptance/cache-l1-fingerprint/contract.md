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
(`runner.py:330`), so `business_input` already carries real asset bytes and the
key is content-addressed for free. D2 defines the key's components: slot,
pluginId, pluginRev, an `sdkMajor` of `major.minor` granularity, model, and the
digest of business input with per-run keys (`_tongflow`, `taskId`, `outputs`,
`level`, `dependencies`) stripped. R1 requires a missing/empty `plugin_rev` to
degrade to "not cacheable" (`None`) rather than a key computed as if nothing
were wrong, so a hand-copied plugin without `.git` doesn't silently poison the
cache with a key that never invalidates when the plugin's code changes.

AC-10 is the seam this slice must not drift from: `digest_form()` must be
computed from the **same** normalized artifact that the L0 conformance suite
already proves TypeScript and Python agree on (`normalize_call()` in
`callog.py`). If the two diverge, the conformance suite polices one shape while
the cache key uses another, and a semantics disagreement the suite is built to
catch stops being visible to the cache at all.

Source input: [`.superpowers/sdd/task-2-brief.md`](../../.superpowers/sdd/task-2-brief.md), [cache spec](../../docs/spec/prd/engine-cache-partial-rerender.md) §3 (D1, D2), §6 (R1, R6).

## Criteria

- AC-1: Given cùng một `(slot, pluginId, pluginRev, model, business_input)`, When `node_fingerprint()` được gọi ở **hai tiến trình khác nhau với `PYTHONHASHSEED` khác nhau**, Then hai khoá bằng nhau. *DoD của L1 là "fingerprint ổn định qua các lần chạy"; gọi hai lần trong một tiến trình không chứng minh được điều đó vì thứ tự dict trùng nhau sẵn.*
- AC-2: Given hai `business_input` khác nhau ở đúng một trường nghiệp vụ, When tính khoá, Then hai khoá khác nhau.
- AC-3: Given hai `business_input` chỉ khác nhau ở khoá per-run (`_tongflow`, `taskId`, `outputs`, `level`, `dependencies`), When tính khoá, Then hai khoá **bằng** nhau. *Mỗi khoá này từng đủ sức phá sạch cache nếu lọt vào (D2).*
- AC-4: Given hai asset có **cùng bytes** nhưng `file_key` khác nhau, When tính khoá, Then hai khoá bằng nhau. *Đây là điều D1 mua được khi hash sau `materialize_asset_inputs`.*
- AC-5: Given hai asset có **cùng `file_key`** nhưng bytes khác nhau, When tính khoá, Then hai khoá khác nhau. *Đây đúng là con bug D1 sinh ra để chặn — khoá theo tham chiếu sẽ trúng cache sai.*
- AC-6: Given `plugin_rev` là `None` hoặc chuỗi rỗng, When gọi `node_fingerprint()`, Then trả về `None` (không cacheable) chứ không phải một khoá. *R1: plugin sửa code mà khoá không đổi là tái dùng kết quả của phiên bản cũ. Trả `None` để pyright ép người gọi ở L2 xử lý, thay vì ném lỗi cho một trạng thái bình thường (plugin chép tay không có `.git`).*
- AC-7: Given hai `plugin_rev` khác nhau, mọi thứ khác giữ nguyên, When tính khoá, Then hai khoá khác nhau.
- AC-8: Given hai phiên bản SDK khác nhau ở **patch** (`0.2.17` vs `0.2.18`), When tính khoá, Then khoá **bằng** nhau; và given khác ở **minor** (`0.2.17` vs `0.3.0`), Then khoá khác nhau. *D2 nói `sdkMajor` là major.minor; R6 chấp nhận việc đổi nó vô hiệu hoá cache, nhưng một bản vá patch mà thổi bay 20GB cache thì không.*
- AC-9: Given file vector `sdk/tests/fixtures/fingerprint_vectors.json` như đã commit, When chạy lại, Then mọi khoá tính ra khớp **từng ký tự** với khoá đã ghi. *Lược đồ khoá trôi mà `v` không bump = mọi entry cache cũ trở thành rác âm thầm. Vector là thứ duy nhất bắt được việc đó.*
- AC-10: Given cùng `(slot, business_input)`, When so `digest_form(slot, bi)` với `normalize_call(slot, bi)["input"]` của `callog.py`, Then hai giá trị bằng nhau. *Khoá cache phải tính từ **chính** artifact mà conformance suite chứng minh hai runtime đồng ý. Nếu hai thứ đó tách ra, suite canh một đằng còn cache dùng một nẻo — đúng loại lỗi §5 của spec đặt tên.*

## Out of scope

- **Đọc/ghi cache** — không cache store, không blob dedupe, không đọc/ghi bất kỳ entry nào. L1 chỉ tính khoá.
- **Nối vào `runner.py`** — không cắm `node_fingerprint()` vào vòng lặp thực thi. Đó là L2.
- **Sửa `callog.py`** — AC-10 chỉ *so sánh* với `normalize_call()` đã có từ `conformance-l0`, không sửa hàm đó hay hợp đồng của nó.
- **Trường `v` (version) của lược đồ khoá và migration khi lược đồ đổi** — nằm ngoài phạm vi hai hàm thuần này; AC-9 chỉ khoá lược đồ hiện tại bằng vector, chưa định nghĩa quy trình bump `v`.
- **Điều kiện chặn L1 đã ghi ở `conformance-l0`** — pluginRev mù với sửa đổi chưa commit (`git rev-parse HEAD` không thấy working tree bẩn). Đóng lỗ hổng đó là việc của lát này *hoặc* lát kế tiếp đưa rev vào khoá thật; nếu lát này không đóng, phải ghi rõ trong Notes rằng nó vẫn mở.

## Notes

- Interfaces mà Task 3–5 sẽ tham chiếu: hai executor key `executors.test.sdk_pytest_fingerprint` (chạy `sdk/tests/test_fingerprint.py`) và `executors.test.sdk_pytest_fingerprint_vectors` (chạy `sdk/tests/test_fingerprint_vectors.py`), khai trong `_acceptance/config.yaml`.
- Contract này không sinh code sản phẩm. `sdk/tongflow/engine/fingerprint.py`, `sdk/tests/test_fingerprint.py`, `sdk/tests/test_fingerprint_vectors.py`, `sdk/tests/fixtures/fingerprint_vectors.json` đều hạ cánh ở các task sau, sau khi Cổng 1 được ký.
