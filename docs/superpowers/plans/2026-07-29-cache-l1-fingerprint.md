# Cache L1 — `digest_form()` + `node_fingerprint()` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sửa spec cache theo bốn quyết định của 29/07, rồi giao lát **L1** — hai hàm thuần tính khoá cache, có test vector ghim lược đồ khoá, **chưa đọc/ghi cache**.

**Architecture:** `node_fingerprint()` tính khoá từ **chính artifact mà conformance suite chứng minh hai runtime đồng ý** — `normalize_call()` trong [`callog.py`](../../../sdk/tongflow/engine/callog.py). Không viết lại luật chuẩn hoá, không sửa `callog.py`. Khoá thiếu `pluginRev` trả `None` (không cacheable) thay vì ném lỗi, để pyright ép người gọi ở L2 phải xử lý.

**Tech Stack:** Python 3.11+, pytest qua `uv`, `hashlib.sha256`, `json.dumps` canonical.

## ⚠️ Amendment sau Cổng 1 (29/07) — đọc trước Task 3

Task 2 đã chạy và qua ba vòng review. **Ba thứ trong plan gốc bị thay**, Task 3–5 phải theo bản này chứ không theo văn bản gốc bên dưới:

**1. Không còn hai executor key — có 16, mỗi tiêu chí một key**, dùng pytest node-id. Chín tiêu chí chung một exit code vi phạm quy tắc mà chính `_acceptance/config.yaml` viết ra: *"nine evals behind one command collapse nine criteria into one exit code, and a case that was never implemented then looks identical to a case that passed."*

**Tên hàm test phải khớp TỪNG KÝ TỰ** với node-id đã ghi trong `_acceptance/config.yaml` — lệch một ký tự là eval đỏ vĩnh viễn (pytest exit 4). Mười sáu tên, theo đúng thứ tự AC-1…AC-16:

| # | `sdk/tests/test_fingerprint.py` |
|---|---|
| 1 | `test_stable_across_processes_with_different_hashseed` |
| 2 | `test_business_input_field_diff_changes_key` |
| 3 | `test_per_run_keys_stripped_do_not_change_key` |
| 4 | `test_asset_same_bytes_diff_file_key_same_key` |
| 5 | `test_asset_same_file_key_diff_bytes_changes_key` |
| 6 | `test_missing_plugin_rev_is_not_cacheable` |
| 7 | `test_dirty_plugin_is_not_cacheable` |
| 8 | `test_plugin_rev_diff_changes_key` |
| 9 | `test_slot_diff_changes_key` |
| 10 | `test_plugin_id_diff_changes_key` |
| 11 | `test_model_none_vs_value_changes_key` |
| 12 | `test_sdk_version_patch_same_minor_diff` |
| 15 | `test_digest_form_matches_normalize_call` |
| 16 | `test_dict_key_insertion_order_does_not_change_key` |

| # | `sdk/tests/test_fingerprint_vectors.py` |
|---|---|
| 13 | `test_vectors_match_character_for_character` |
| 14 | `test_vector_guard_catches_schema_version_bump` |

**2. `node_fingerprint()` nhận thêm `plugin_dirty: bool` (bắt buộc, không default).** Trả `None` khi `plugin_rev` rỗng **hoặc** `plugin_dirty` đúng. Đây là việc đóng **"Điều kiện chặn L1"** mà contract đã ký của `conformance-l0` ghi: `git rev-parse HEAD` không thấy sửa đổi chưa commit, nên plugin sửa tay giữ nguyên rev và cache phục vụ kết quả cũ vĩnh viễn. Dò `git status --porcelain` là việc của L2; L1 chỉ nhận cờ. Chữ ký cuối:

```python
def node_fingerprint(
    *,
    slot: str,
    plugin_id: str,
    plugin_rev: str | None,
    plugin_dirty: bool,
    model: str | None,
    business_input: dict[str, Any],
    sdk_version: str | None = None,
) -> str | None:
```

**3. Mọi test so hai khoá phải khẳng định cả hai vế là chuỗi khác `None`, đúng 64 ký tự hex thường** — không viết `assert k1 == k2` hay `assert k1 != k2` trần trụi. Ba vòng review mới đóng hết họ lỗi này: trong Python `None == None` đúng **và** `None != "<sha>"` cũng đúng, nên một implementation trả `None` vô điều kiện lách qua được cả hai chiều so sánh. Quy tắc chung nằm ở đầu mục `## Criteria` của contract. Ngoại lệ duy nhất: AC-6 và AC-7, nơi `None` **chính là** kết quả đúng — hai chỗ đó khẳng định `is None` chính xác.

Bốn tiêu chí mới so với plan gốc: **AC-9/10/11** (`slot`, `pluginId`, `model` tham gia khoá — plan gốc không có tiêu chí nào cho ba thành phần này, nên một implementation bỏ hẳn chúng khỏi dict băm vẫn xanh hết), **AC-16** (khoá bất biến với thứ tự chèn dict), và **AC-14** (guard mutation phải chạy lại node-id của AC-13 trong subprocess và khẳng định exit khác 0 khi bump `KEY_SCHEMA_VERSION`, rồi exit 0 sau khi hoàn nguyên). File vector **phải ghim `sdk_version`**, nếu không AC-13 đỏ mỗi lần bump minor.

## Global Constraints

- **Comment trong code: tiếng Anh.** (CLAUDE.md)
- **Không sửa `sdk/tongflow/engine/callog.py`.** File đó do `conformance-l0` sở hữu; chạm vào là feature đó phải re-verify + chữ ký Cổng 2 mới (AGENTS.md §2, luật per-file chốt 29/07). Import, đừng refactor.
- **Không đọc/ghi cache ở lát này.** L1 dừng ở hai hàm thuần + test. Store, blob, D5 là L2.
- **Không nối vào `runner.py` ở lát này.** Tính fingerprint mà không ai dùng là code chết; dây nối thuộc L2 khi đã có người tiêu thụ.
- **Chạy pytest qua `uv`**, không dùng `python3 -m pytest` (PEP 668 chặn trên macOS):
  `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q <path>`
- **Nhánh riêng off `main`**, Conventional Commit, không squash.

## File Structure

| File | Trách nhiệm |
|---|---|
| `docs/spec/prd/engine-cache-partial-rerender.md` | **Sửa** — D3, D7, §8, R3, và tên khoá digest (Task 1) |
| `sdk/tongflow/engine/fingerprint.py` | **Tạo** — `sdk_major()`, `digest_form()`, `node_fingerprint()`. Thuần, không I/O |
| `sdk/tests/test_fingerprint.py` | **Tạo** — hành vi: ổn định, nhạy input, điếc với khoá per-run, fail-closed khi thiếu rev |
| `sdk/tests/fixtures/fingerprint_vectors.json` | **Tạo** — test vector ghim lược đồ khoá |
| `sdk/tests/test_fingerprint_vectors.py` | **Tạo** — chạy vector, đỏ khi lược đồ khoá trôi mà `v` không bump |
| `_acceptance/cache-l1-fingerprint/` | **Tạo** — contract + evals (Task 2) |
| `_acceptance/config.yaml` | **Sửa** — thêm hai executor key |

---

### Task 1: Sửa spec theo bốn quyết định của 29/07

Docs-only, `docs/**` nằm trong `t1_skip_globs` nên không stale bằng chứng của feature nào. Task này **độc lập** — merge được ngay, không chờ phần code.

**Files:**
- Modify: `docs/spec/prd/engine-cache-partial-rerender.md`

**Interfaces:**
- Consumes: [`docs/superpowers/specs/2026-07-29-cache-open-questions-design.md`](../specs/2026-07-29-cache-open-questions-design.md) §6
- Produces: spec không còn tự mâu thuẫn; §8 có tiêu chí canh quyết định Q0

- [ ] **Step 1: Sửa D3 — cột Phạm vi của tầng A**

Trong bảng ở §3 D3, dòng tầng A, đổi ô Phạm vi:

```
| **A — nội dung, dùng chung** | ... | Toàn hệ thống, dedupe chéo workflow/người dùng | ... |
```

thành:

```
| **A — nội dung, trong tenant** | ... | Trong tenant, chéo workflow | ... |
```

- [ ] **Step 2: Thay đoạn văn dưới bảng D3**

Xoá câu *"Tầng A thì càng chia sẻ càng lợi — và đúng những node rẻ-nhưng-chạy-liên-tục (ffmpeg, cắt khung, transcribe) nằm ở đây."* — nó là tiền đề của quyết định cũ. Thay bằng:

```markdown
**Cả hai tầng đều khoá theo tenant** (quyết định 29/07, Manh). Tính tất định không
quyết định *có chia sẻ chéo tenant hay không* — nó chỉ quyết định độ rộng **bên trong**
một tenant: tầng A dùng lại được chéo workflow, tầng B thì không.

Lý do không chia sẻ chéo tenant: `transcribe` là tất định, nên tầng A dùng chung toàn hệ
thống sẽ trả bản chép của tenant A cho tenant B khi B có đúng bytes đó. Nội dung không lộ
thêm gì, nhưng cơ chế là một **existence oracle** — có bytes là biết người khác đã xử lý
đúng bytes đó chưa, suy ra được qua độ trễ hoặc hoá đơn. Nó đi ngược niềm tin nền số 5
của vision.md. Đừng "tối ưu" nó ngược lại như một cải tiến hiệu năng; đầy đủ lý lẽ ở
[design doc 29/07](../../superpowers/specs/2026-07-29-cache-open-questions-design.md) §2.

Tầng B ngoài ra còn sai ngữ nghĩa nếu dùng chéo workflow: cache này là *"input không đổi
→ dùng lại đúng cái bạn đã tạo ra"*, và "cái bạn đã tạo ra" gắn với workflow sinh ra nó.
```

- [ ] **Step 3: Sửa D2 — tên khoá digest cho khớp code đã ship**

D2 viết `digest_form()` thay `bytesBase64` bằng `{"__sha256": "<hex>"}`. Code đã ship ở L0 dùng `{"__asset": "<hex>"}` ([`callog.py`](../../../sdk/tongflow/engine/callog.py), `ASSET_DIGEST_KEY`). Lấy tên đang chạy, không đổi code theo spec. Sửa câu đó thành:

```markdown
`digest_form()` duyệt cấu trúc và thay mọi `bytesBase64` bằng `{"__asset": "<hex>"}` —
cùng hằng `ASSET_DIGEST_KEY` mà `callog.py` dùng, vì L1 tính khoá **từ chính**
`normalize_call()` chứ không viết lại luật (xem §6 dưới).
```

- [ ] **Step 4: Sửa D7 — `reuse_scope` fail-closed**

Thay khối chú thích dưới đoạn code `run_workflow(...)` bằng:

```markdown
- `auto` (mặc định): tầng A + tầng B như D3.
- `off`: bỏ qua cache hoàn toàn — dùng cho benchmark và khi cần chủ động sinh lại.
- `force`: coi cả slot bất định như tầng A **trong cùng tenant**. Chỉ dành cho debug,
  **không** phơi ra UI.
- `reuse_scope` là `(tenant, workflowId)` và **bắt buộc cho cả hai tầng** sau quyết định
  29/07. **Thiếu scope → tắt cache hoàn toàn**, không rơi về dùng chung. Đây là điểm
  fail-closed quan trọng nhất của cả gói: nếu thiếu scope mà âm thầm dùng chung thì một
  lỗi cấu hình ở cloud sẽ khôi phục lại existence oracle, và khôi phục **im lặng**.
  Desktop cấp một scope tenant cục bộ nên đường self-host không mất cache vì luật này.
```

- [ ] **Step 5: Sửa R3 trong bảng §7**

```
| R3 | Rò dữ liệu chéo tenant ở cloud | **Cả hai** tầng khoá theo tenant (29/07). Tính tất định chỉ quyết định độ rộng *trong* một tenant. Existence oracle của tầng A dùng chung toàn hệ thống đã bị đóng bằng chính luật này — đừng mở lại dưới dạng tối ưu hoá |
```

- [ ] **Step 6: Thay ba dòng Q1–Q3 bằng quyết định**

```
| **Q1** | Có gộp `store.py:59/94` thành nội-dung-địa-chỉ luôn không? | **Chốt 29/07: KHÔNG.** `HttpStore` nhận `file_key` do host cấp nên "có" không thể làm đồng nhất ba store; UUID đang gánh vai trò vòng đời; D6 đã thu phần lợi. Mở lại chỉ khi có số đo |
| **Q2** | Cache có dùng chung giữa desktop và cloud không? | **Chốt 29/07: KHÔNG** — hệ quả của việc tầng A khoá theo tenant |
| **Q3** | Cửa sổ sống của tầng B bao lâu? | **Chốt 29/07: LRU theo dung lượng là cơ chế thu hồi duy nhất** (chung cho A và B), cộng `purge(tenant, workflowId)` best-effort. **Không TTL** |
```

- [ ] **Step 7: Thêm tiêu chí nghiệm thu vào §8**

Đổi dòng *"Hai tenant cùng input ở slot bất định → không dùng chung kết quả."* thành bốn dòng:

```markdown
- Hai tenant cùng input ở slot **bất định** → **không** dùng chung kết quả.
- Hai tenant cùng input ở slot **tất định** → **cũng không** dùng chung kết quả. (Đây là
  tiêu chí canh quyết định 29/07; thiếu nó thì quyết định đó không có gì canh.)
- Gọi `run_workflow` **không có `reuse_scope`** → không entry nào được đọc và không entry
  nào được ghi. Fail-closed, không phải "dùng chung".
- `purge(tenant, workflowId)` xoá entry tầng B của đúng workflow đó, **không** chạm
  workflow khác cùng tenant; gọi hai lần không lỗi.
```

- [ ] **Step 8: Cập nhật dòng chân spec**

```markdown
**Người viết:** Claude (phiên 2026-07-25) · **Đã review & chốt Q1–Q3:** Manh 2026-07-29 ·
**Phụ thuộc:** không · **Chặn:** mọi việc phía sau của mô hình gói phẳng (P2 cloud)
```

- [ ] **Step 9: Kiểm tra spec không còn tự mâu thuẫn**

Run: `grep -n "càng chia sẻ càng lợi\|Toàn hệ thống\|__sha256\|Cần chốt" docs/spec/prd/engine-cache-partial-rerender.md`
Expected: không ra dòng nào (mọi tàn dư của quyết định cũ đã bị thay).

- [ ] **Step 10: Chạy cổng**

Run: `bash scripts/pre-merge-check.sh . --base main`
Expected: `pre-merge-check: clean` — `docs/**` là t1-exempt nên không pin nào phải dời.

- [ ] **Step 11: Commit**

```bash
git add docs/spec/prd/engine-cache-partial-rerender.md
git commit -m "docs(spec): fold the 29/07 cache decisions into the spec body

D3's tier A narrows to tenant scope, D7's reuse_scope fails closed when
absent, R3 records the existence oracle as closed rather than open, and
section 8 gains the criterion that guards the decision. D2 adopts __asset,
the digest key that actually shipped in callog.py at L0.

Q1-Q3 in section 7 stop being questions."
```

---

### Task 2: Acceptance contract + evals cho `cache-l1-fingerprint`

Repo chạy acceptance-gate strict/strict, nên contract + evals phải có **trước** khi code hạ cánh, và Cổng 1 phải được ký. Task này không sinh code sản phẩm.

**Files:**
- Create: `_acceptance/cache-l1-fingerprint/contract.md`
- Create: `_acceptance/cache-l1-fingerprint/evals.yaml`
- Modify: `_acceptance/config.yaml`

**Interfaces:**
- Produces: hai executor key `sdk_pytest_fingerprint`, `sdk_pytest_fingerprint_vectors` mà Task 3–5 sẽ tham chiếu.

- [ ] **Step 1: Thêm executor key vào `_acceptance/config.yaml`**

Chèn dưới khối `per-plugin-origin Gate 1`, trong `executors.test`:

```yaml
    # cache-l1-fingerprint Gate 1 (2026-07-29): both files land during
    # implementation; keys declared now so eval refs stay portable.
    sdk_pytest_fingerprint: "cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_fingerprint.py"
    sdk_pytest_fingerprint_vectors: "cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_fingerprint_vectors.py"
```

- [ ] **Step 2: Viết `_acceptance/cache-l1-fingerprint/contract.md`**

Tier **T3** (chạm `sdk/**`, là t3_path). Mười AC dưới đây là nội dung bắt buộc; viết vào mục `## Criteria` theo đúng khuôn của contract đã có (xem `_acceptance/conformance-l0/contract.md`).

```markdown
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
```

Mục `## Out of scope` phải ghi rõ: **không** đọc/ghi cache, **không** nối vào `runner.py`, **không** sửa `callog.py`.

- [ ] **Step 3: Viết `_acceptance/cache-l1-fingerprint/evals.yaml`**

Một eval cho mỗi AC, trỏ vào hai executor key ở Step 1. **Khai `paths` cho mọi eval ngay từ đầu** — nếu không, feature này sẽ đi vào đúng cái treadmill mà `stale-scope-by-paths` sinh ra để trị, và backfill sau phải nằm trong PR mang code gated mà `paths` của nó phủ:

```yaml
    paths: ["sdk/tongflow/engine/fingerprint.py", "sdk/tests/test_fingerprint.py", "sdk/tests/test_fingerprint_vectors.py", "sdk/tests/fixtures/fingerprint_vectors.json"]
```

- [ ] **Step 4: Chạy cổng**

Run: `bash scripts/pre-merge-check.sh . --base main`
Expected: `pre-merge-check: clean` (`_acceptance/**` là t1-exempt).

- [ ] **Step 5: Commit**

```bash
git add _acceptance/cache-l1-fingerprint _acceptance/config.yaml
git commit -m "chore(acceptance): contract and evals for cache-l1-fingerprint"
```

- [ ] **Step 6: DỪNG — Cổng 1 cần chữ ký người**

Không viết code cho tới khi Manh duyệt contract. T3 nên cần ký đủ.

---

### Task 3: `digest_form()` — mượn luật chuẩn hoá, không viết lại

**Files:**
- Create: `sdk/tongflow/engine/fingerprint.py`
- Create: `sdk/tests/test_fingerprint.py`

**Interfaces:**
- Consumes: `normalize_call(slot: str, business_input: dict[str, Any]) -> dict[str, Any]` từ `sdk/tongflow/engine/callog.py`, trả `{"slot": ..., "input": ...}`.
- Produces: `digest_form(slot: str, business_input: dict[str, Any]) -> dict[str, Any]`.

- [ ] **Step 1: Viết test đỏ (AC-3, AC-4, AC-5, AC-10)**

Tạo `sdk/tests/test_fingerprint.py`:

```python
import base64

from tongflow.engine.callog import normalize_call
from tongflow.engine.fingerprint import digest_form


def _asset(raw: bytes, file_key: str) -> dict:
    return {"file_key": file_key, "bytesBase64": base64.b64encode(raw).decode("ascii")}


def test_digest_form_equals_the_conformance_logs_input_half():
    # AC-10. The cache key must be computed from the very artifact the
    # conformance suite proves both runtimes agree on. If these two ever
    # diverge, the suite guards one thing and the cache uses another.
    bi = {"text": "hello", "duration": 5, "image": _asset(b"abc", "k1")}
    assert digest_form("image-gen-video", bi) == normalize_call("image-gen-video", bi)["input"]


def test_per_run_keys_do_not_reach_the_digest():
    # AC-3. Each of these would otherwise make every key differ from every
    # other for reasons that mean nothing.
    base = {"text": "hello"}
    noisy = {
        "text": "hello",
        "_tongflow": {"progressUrl": "http://x", "token": "secret"},
        "taskId": "task-123",
        "outputs": [{"downstreamDataNodeId": "d1"}],
        "level": 3,
        "dependencies": ["n1"],
    }
    assert digest_form("gen-text", base) == digest_form("gen-text", noisy)


def test_same_bytes_under_different_file_keys_digest_alike():
    # AC-4. This is what hashing after materialize_asset_inputs buys.
    a = {"image": _asset(b"same-bytes", "uploads/a.png")}
    b = {"image": _asset(b"same-bytes", "mem://deadbeef")}
    assert digest_form("image-edit", a) == digest_form("image-edit", b)


def test_same_file_key_with_different_bytes_digests_differently():
    # AC-5. The bug D1 exists to prevent: keying by reference would reuse a
    # stale result after the bytes behind a file_key changed.
    a = {"image": _asset(b"version-one", "uploads/a.png")}
    b = {"image": _asset(b"version-two", "uploads/a.png")}
    assert digest_form("image-edit", a) != digest_form("image-edit", b)
```

- [ ] **Step 2: Chạy test, xác nhận ĐỎ**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_fingerprint.py`
Expected: FAIL — `ModuleNotFoundError: No module named 'tongflow.engine.fingerprint'`

- [ ] **Step 3: Viết cài đặt tối thiểu**

Tạo `sdk/tongflow/engine/fingerprint.py`:

```python
"""Content-addressed cache keys for a node's execution.

Two pure functions, no I/O. Slice L1 of the cache roadmap computes keys and
nothing else — reading and writing entries is L2.

The normalization rule is NOT reimplemented here. ``digest_form`` delegates to
``callog.normalize_call``, which is the shape the TS/Python conformance suite
holds both runtimes to. Keeping the cache key derived from that exact artifact
is what stops the suite from guarding one definition while the cache uses
another — the silent-wrong-answer failure the spec names in section 5.
"""

from __future__ import annotations

from typing import Any

from .callog import normalize_call


def digest_form(slot: str, business_input: dict[str, Any]) -> dict[str, Any]:
    """The input half of the shared conformance call-log shape.

    Drops per-run keys, sorts keys, and replaces inline asset bytes with their
    sha256 so the key stays small and stable regardless of how large the asset
    is or which store handed it over.
    """
    return normalize_call(slot, business_input)["input"]
```

- [ ] **Step 4: Chạy test, xác nhận XANH**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_fingerprint.py`
Expected: PASS — 4 passed

- [ ] **Step 5: Commit**

```bash
git add sdk/tongflow/engine/fingerprint.py sdk/tests/test_fingerprint.py
git commit -m "feat(cache): digest_form derives from the conformance call-log

Rather than restate the normalization rule, L1 computes the key's input half
from callog.normalize_call — the exact shape the TS/Python conformance suite
holds both runtimes to. A second copy would let the suite guard one definition
while the cache keys off another.

callog.py is untouched on purpose: it belongs to conformance-l0, and editing
it would cost that feature a re-verify and a fresh Gate 2 signature."
```

---

### Task 4: `node_fingerprint()` + `sdk_major()`

**Files:**
- Modify: `sdk/tongflow/engine/fingerprint.py`
- Modify: `sdk/tests/test_fingerprint.py`

**Interfaces:**
- Consumes: `digest_form()` từ Task 3; `__version__` từ `tongflow/__init__.py` (hiện `"0.2.17"`).
- Produces:
  - `sdk_major(version: str | None = None) -> str` — `"0.2.17"` → `"0.2"`.
  - `node_fingerprint(*, slot: str, plugin_id: str, plugin_rev: str | None, model: str | None, business_input: dict[str, Any], sdk_version: str | None = None) -> str | None` — `None` nghĩa là **không cacheable**.
  - `KEY_SCHEMA_VERSION: int = 1`.

- [ ] **Step 1: Viết test đỏ (AC-1, AC-2, AC-6, AC-7, AC-8)**

Thêm vào `sdk/tests/test_fingerprint.py`:

```python
import os
import subprocess
import sys

from tongflow.engine.fingerprint import node_fingerprint, sdk_major


def _fp(**over):
    args = dict(
        slot="image-gen",
        plugin_id="oneflow-image",
        plugin_rev="a" * 40,
        model=None,
        business_input={"text": "a cat"},
    )
    args.update(over)
    return node_fingerprint(**args)


def test_business_change_changes_the_key():
    # AC-2
    assert _fp() != _fp(business_input={"text": "a dog"})


def test_missing_plugin_rev_is_not_cacheable():
    # AC-6. R1: without a rev, editing plugin code leaves the key unchanged and
    # the cache serves the old version's result. None forces L2's caller to
    # handle it — pyright flags `str | None` used as `str`.
    assert _fp(plugin_rev=None) is None
    assert _fp(plugin_rev="") is None


def test_plugin_rev_participates_in_the_key():
    # AC-7
    assert _fp(plugin_rev="a" * 40) != _fp(plugin_rev="b" * 40)


def test_sdk_major_is_major_minor_only():
    # AC-8
    assert sdk_major("0.2.17") == "0.2"
    assert sdk_major("0.2.18") == "0.2"
    assert sdk_major("0.3.0") == "0.3"


def test_patch_bump_keeps_the_key_but_minor_bump_breaks_it():
    # AC-8. R6 accepts that bumping sdkMajor invalidates the cache; a patch
    # release wiping 20GB of it is a different thing entirely.
    assert _fp(sdk_version="0.2.17") == _fp(sdk_version="0.2.18")
    assert _fp(sdk_version="0.2.17") != _fp(sdk_version="0.3.0")


def test_key_is_stable_across_processes_with_different_hash_seeds():
    # AC-1. Two calls inside one process share dict ordering, so they cannot
    # show stability "across runs" — the DoD of this slice. Two interpreters
    # with different PYTHONHASHSEED can.
    script = (
        "from tongflow.engine.fingerprint import node_fingerprint;"
        "print(node_fingerprint(slot='image-gen', plugin_id='oneflow-image',"
        "plugin_rev='a'*40, model=None,"
        "business_input={'text':'a cat','seed':7,'width':512}))"
    )
    keys = []
    for seed in ("0", "12345"):
        env = {**os.environ, "PYTHONHASHSEED": seed, "PYTHONPATH": "."}
        out = subprocess.run(
            [sys.executable, "-c", script], capture_output=True, text=True, env=env, check=True
        )
        keys.append(out.stdout.strip())
    assert keys[0] == keys[1]
    assert len(keys[0]) == 64
```

- [ ] **Step 2: Chạy test, xác nhận ĐỎ**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_fingerprint.py`
Expected: FAIL — `ImportError: cannot import name 'node_fingerprint'`

- [ ] **Step 3: Viết cài đặt tối thiểu**

Thêm vào `sdk/tongflow/engine/fingerprint.py` (giữ nguyên phần Task 3):

```python
import hashlib
import json

# Bumping this invalidates every existing entry on purpose. Change it whenever
# the meaning of any key component changes, and say so in the changelog (R6).
KEY_SCHEMA_VERSION = 1


def sdk_major(version: str | None = None) -> str:
    """``"0.2.17"`` -> ``"0.2"``.

    Major.minor rather than the full version: R6 accepts that a schema-level SDK
    change invalidates the cache, but a patch release wiping the whole store is
    a different bargain than the one that was accepted.
    """
    if version is None:
        # Imported lazily, and it must stay that way. `tongflow/__init__.py`
        # does `from .engine import run_workflow` BEFORE it defines
        # `__version__`, so a module-level `from .. import __version__` here
        # breaks the moment anything inside the engine package imports this
        # module — which is exactly what L2 will do from runner.py. By call
        # time the package is fully initialized and this is safe.
        from .. import __version__

        raw = __version__
    else:
        raw = version
    parts = raw.split(".")
    if len(parts) < 2:
        raise ValueError(f"malformed SDK version: {raw!r}")
    return f"{parts[0]}.{parts[1]}"


def node_fingerprint(
    *,
    slot: str,
    plugin_id: str,
    plugin_rev: str | None,
    model: str | None,
    business_input: dict[str, Any],
    sdk_version: str | None = None,
) -> str | None:
    """The cache key for one plugin call, or ``None`` when it cannot be cached.

    ``None`` is returned for a plugin with no recorded rev — a hand-copied
    plugin directory, which is an ordinary dev state rather than an error.
    Without a rev the key cannot tell one version of the plugin's code from
    another, so caching it would serve the old version's result forever (R1).
    Returning ``None`` rather than raising puts the decision in the type, where
    a static checker makes L2's caller handle it.
    """
    if not plugin_rev:
        return None
    payload = {
        "v": KEY_SCHEMA_VERSION,
        "slot": slot,
        "pluginId": plugin_id,
        "pluginRev": plugin_rev,
        "model": model,
        "sdkMajor": sdk_major(sdk_version),
        "input": digest_form(slot, business_input),
    }
    # sort_keys + fixed separators + ensure_ascii is the canonical form. All
    # three matter: any of them left to a default is a key that changes when a
    # Python release changes its default.
    blob = json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=True)
    return hashlib.sha256(blob.encode("utf-8")).hexdigest()
```

- [ ] **Step 4: Chạy test, xác nhận XANH**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_fingerprint.py`
Expected: PASS — 10 passed

- [ ] **Step 5: Chạy toàn bộ SDK test, xác nhận không vỡ gì**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q`
Expected: PASS — 127 passed (117 cũ + 10 mới)

- [ ] **Step 6: Commit**

```bash
git add sdk/tongflow/engine/fingerprint.py sdk/tests/test_fingerprint.py
git commit -m "feat(cache): node_fingerprint over the D2 key components

Returns None when a plugin has no recorded rev, rather than raising: a
hand-copied plugin directory is an ordinary dev state, and putting the
un-cacheable case in the return type makes a static checker force L2's caller
to handle it. Caching without a rev would serve the old code's result forever.

sdkMajor is major.minor. R6 accepts that a schema-level SDK change invalidates
the cache; a patch release wiping 20GB of it is a different bargain.

The stability test spawns two interpreters with different PYTHONHASHSEED. Two
calls in one process share dict ordering and cannot show stability across
runs, which is this slice's actual DoD."
```

---

### Task 5: Test vector ghim lược đồ khoá

**Files:**
- Create: `sdk/tests/fixtures/fingerprint_vectors.json`
- Create: `sdk/tests/test_fingerprint_vectors.py`

**Interfaces:**
- Consumes: `node_fingerprint()` từ Task 4.
- Produces: file vector là hợp đồng — bất kỳ thay đổi nào của lược đồ khoá mà không bump `KEY_SCHEMA_VERSION` sẽ làm test này đỏ.

- [ ] **Step 1: Viết test đỏ (AC-9)**

Tạo `sdk/tests/test_fingerprint_vectors.py`:

```python
import json
from pathlib import Path

import pytest

from tongflow.engine.fingerprint import KEY_SCHEMA_VERSION, node_fingerprint

VECTORS = Path(__file__).parent / "fixtures" / "fingerprint_vectors.json"


def _load() -> dict:
    with VECTORS.open(encoding="utf-8") as f:
        return json.load(f)


def test_vector_file_declares_the_schema_version_it_was_generated_under():
    # A vector file from an older schema silently "passing" would be the worst
    # outcome here: it would certify a key format nobody is using.
    assert _load()["keySchemaVersion"] == KEY_SCHEMA_VERSION


@pytest.mark.parametrize("case", _load()["cases"], ids=lambda c: c["name"])
def test_recorded_key_still_matches(case):
    # AC-9. Drifting the key schema without bumping KEY_SCHEMA_VERSION turns
    # every existing cache entry into silent garbage: old entries keep being
    # found under keys that no longer mean what they meant.
    got = node_fingerprint(
        slot=case["slot"],
        plugin_id=case["pluginId"],
        plugin_rev=case["pluginRev"],
        model=case["model"],
        business_input=case["businessInput"],
        sdk_version=case["sdkVersion"],
    )
    assert got == case["expected"], (
        f"{case['name']}: key schema changed. If that was deliberate, bump "
        f"KEY_SCHEMA_VERSION and regenerate this file; if not, this is the bug."
    )
```

- [ ] **Step 2: Chạy test, xác nhận ĐỎ**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_fingerprint_vectors.py`
Expected: FAIL — `FileNotFoundError: .../fixtures/fingerprint_vectors.json`

- [ ] **Step 3: Sinh file vector**

Chạy đoạn này để in ra khoá thật, rồi dán vào file. **Không tự bịa giá trị `expected`** — vector bịa tay là vector chứng minh chính nó.

```bash
cd sdk && PYTHONPATH=. uv run --no-project --with pydantic --with typing_extensions python - <<'PY'
import base64, json
from tongflow.engine.fingerprint import KEY_SCHEMA_VERSION, node_fingerprint

png = base64.b64encode(b"\x89PNG\r\n\x1a\n fake pixels").decode("ascii")
cases = [
    {"name": "scalar-only", "slot": "gen-text", "pluginId": "oneflow-text",
     "pluginRev": "a" * 40, "model": None, "sdkVersion": "0.2.17",
     "businessInput": {"text": "xin chào"}},
    {"name": "with-model", "slot": "image-gen", "pluginId": "oneflow-image",
     "pluginRev": "b" * 40, "model": "flux-dev", "sdkVersion": "0.2.17",
     "businessInput": {"text": "a cat", "seed": 7, "width": 512, "height": 512}},
    {"name": "inline-asset", "slot": "image-edit", "pluginId": "oneflow-image",
     "pluginRev": "c" * 40, "model": None, "sdkVersion": "0.2.17",
     "businessInput": {"text": "remove bg", "image": {"file_key": "uploads/a.png", "bytesBase64": png}}},
    {"name": "nested-asset-list", "slot": "concat-videos", "pluginId": "oneflow-ffmpeg",
     "pluginRev": "d" * 40, "model": None, "sdkVersion": "0.2.17",
     "businessInput": {"videos": [
         {"file_key": "m1", "bytesBase64": base64.b64encode(b"clip-one").decode("ascii")},
         {"file_key": "m2", "bytesBase64": base64.b64encode(b"clip-two").decode("ascii")}]}},
    {"name": "unicode-and-empty-dropped", "slot": "gen-text", "pluginId": "oneflow-text",
     "pluginRev": "e" * 40, "model": None, "sdkVersion": "0.2.17",
     "businessInput": {"text": "Giá: 199.000đ", "userPrompt": ""}},
]
for c in cases:
    c["expected"] = node_fingerprint(
        slot=c["slot"], plugin_id=c["pluginId"], plugin_rev=c["pluginRev"],
        model=c["model"], business_input=c["businessInput"], sdk_version=c["sdkVersion"])
print(json.dumps({"keySchemaVersion": KEY_SCHEMA_VERSION, "cases": cases},
                 indent=2, ensure_ascii=False))
PY
```

Ghi output vào `sdk/tests/fixtures/fingerprint_vectors.json`.

- [ ] **Step 4: Chạy test, xác nhận XANH**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_fingerprint_vectors.py`
Expected: PASS — 6 passed (1 schema-version + 5 case)

- [ ] **Step 5: Chứng minh vector KHÔNG rỗng — mutation test bằng tay**

Guard mới phải chứng minh nó **đỏ khi lỗi quay lại**, không chỉ xanh khi code đúng (bài học của `stale-scope-by-paths`, STATUS.md).

Sửa tạm `KEY_SCHEMA_VERSION = 1` thành `= 2` trong `fingerprint.py`, chạy lại:

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_fingerprint_vectors.py`
Expected: FAIL — cả test schema-version lẫn 5 case đều đỏ.

Rồi **hoàn nguyên về `= 1`** và chạy lại, xác nhận xanh lại. Ghi kết quả hai chiều vào evidence.

- [ ] **Step 6: Commit**

```bash
git add sdk/tests/fixtures/fingerprint_vectors.json sdk/tests/test_fingerprint_vectors.py
git commit -m "test(cache): pin the key schema with recorded vectors

Five cases: scalars, a model field, one inline asset, a nested asset list, and
unicode with a dropped empty field. Values were generated by the implementation
rather than written by hand — a hand-written vector proves only itself.

Verified in both directions: bumping KEY_SCHEMA_VERSION turns all six red, and
reverting turns them green. A guard that only goes green on correct code
certifies nothing."
```

---

### Task 6: Verify + Cổng 2

**Files:**
- Create: `_acceptance/cache-l1-fingerprint/evidence-report.md` (do vòng verify sinh)

- [ ] **Step 1: Chạy standing check trên cây cuối**

```bash
pnpm lint:check && pnpm test && pnpm build && pnpm typecheck
cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q
```
Expected: tất cả xanh.

- [ ] **Step 2: Chạy cổng**

Run: `bash scripts/pre-merge-check.sh . --base main`
Expected: `clean` **hoặc** danh sách feature stale. Nhánh này chạm `sdk/**`, nên xử theo đúng luật per-file: feature nào **sở hữu** file bị đổi thì re-verify + ký lại; còn lại carry-forward re-pin. `fingerprint.py` là file mới nên **không** feature nào sở hữu — dự kiến toàn bộ đi đường carry-forward.

- [ ] **Step 3: Sinh evidence + Cổng 2**

Chạy vòng verify của repo, rồi trình Manh ký. Chữ ký phải nằm trong commit **chỉ chứa human field** (`human_signoff` + `time_human_minutes.gate2`).

- [ ] **Step 4: Mở PR và merge bằng merge commit**

```bash
gh pr create --base main --head feat/cache-l1-fingerprint
# sau khi CI xanh và đã ký:
gh pr merge <n> --merge
```

Không bao giờ squash — squash phá `signoff.require_human_commit` vĩnh viễn.

---

## Self-Review

**Spec coverage.** §6 của design doc có bốn amendment (D3, D7, §8, R3) — Task 1 Step 1–2 (D3), Step 4 (D7), Step 7 (§8), Step 5 (R3); cộng Step 3 cho lệch `__sha256`/`__asset` phát hiện lúc đọc code, và Step 6 cho ba dòng Q1–Q3. Lát L1 trong §6 của spec cache là "digest_form() + node_fingerprint() + test vector; chưa đọc/ghi cache" — Task 3, 4, 5 theo đúng thứ tự đó, và Global Constraints cấm phần "chưa".

**Placeholder scan.** Không có TBD/TODO; mọi step sửa code đều kèm code thật; mọi lệnh kèm kết quả mong đợi. Giá trị `expected` của vector cố ý **không** viết sẵn trong plan — Task 5 Step 3 sinh ra chúng, vì một vector bịa tay chỉ chứng minh chính nó.

**Type consistency.** `digest_form(slot, business_input)` nhận hai tham số ở cả Task 3 và Task 4 (khớp `normalize_call`). `node_fingerprint()` chỉ nhận keyword, trả `str | None` — Task 4 định nghĩa, Task 5 gọi đúng chữ ký đó. `KEY_SCHEMA_VERSION` là `int`, dùng ở Task 4 và Task 5. `sdk_major()` nhận `str | None`, trả `str`.

**Một khoảng trống đã biết, cố ý để lại.** `plugin_rev` ở đây là tham số; việc lấy nó từ `cfg["pluginRev"]` (scan.py ghi ở L0) thuộc **L2**, cùng lúc với người gọi đầu tiên. L1 không nối vào `runner.py` nên không có chỗ nào đọc `cfg`.

**Một bẫy import đã kiểm chứng, đừng gỡ.** `sdk_major()` nạp `__version__` **lười** bên trong hàm. Không phải phong cách — `tongflow/__init__.py:11` chạy `from .engine import run_workflow` **trước khi** định nghĩa `__version__` ở dòng 20, nên `from .. import __version__` ở mức module sẽ ném `ImportError: cannot import name '__version__' from partially initialized module` ngay khi bất cứ thứ gì **bên trong** package `engine` import module này — tức đúng việc L2 sẽ làm từ `runner.py`. Ở L1 nó chưa nổ vì chưa ai trong engine import `fingerprint`; đó là lý do phải viết đúng ngay bây giờ thay vì đợi L2 gặp. Cùng họ với lỗi mà L0 phải sửa (`fix: break the scan/engine import cycle`, commit `d1b73c2`).
