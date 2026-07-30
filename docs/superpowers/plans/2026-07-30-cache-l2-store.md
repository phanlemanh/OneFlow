# Cache L2 — on-disk store, tier A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cache thật sự đọc/ghi lần đầu — bỏ được một lời gọi plugin khi input không đổi, chỉ cho tầng A (11 slot cơ khí), khoá theo tenant.

**Architecture:** Cache **per-call** ngay sau `materialize_asset_inputs` trong vòng `for call_params in per_call_params` của `runner.py`. Một module mới `node_cache.py` giữ store trên đĩa + allowlist + dò `plugin_dirty` + digest ABI; `fingerprint.py` được mở rộng thêm `tenant` và `abi_digest` (bump `KEY_SCHEMA_VERSION` → 2); `engine-delegate.server.ts` dịch `getScope()` thành sentinel tường minh.

**Tech Stack:** Python 3.11+ (SDK, pytest qua `uv`), TypeScript/Next.js (vitest), `hashlib`, `os.replace`, `git status --porcelain`.

## Global Constraints

- **Comment trong code: tiếng Anh.** (CLAUDE.md)
- **KHÔNG sửa `sdk/tongflow/engine/callog.py`** — thuộc `conformance-l0`; chạm là feature đó phải re-verify + ký lại.
- **KHÔNG sửa `sdk/tongflow/engine/store.py`** — Q1 chốt KHÔNG (29/07).
- **KHÔNG sửa `scan.py` hay `plugins.py`** — thuộc `oneflow-plugin-prefix` / `sdk-distribution-rename`. Dò `plugin_dirty` đặt trong `node_cache.py`.
- **Allowlist tầng A đúng 11 slot**, không thêm: `concat-videos` `extract-audio` `remove-video-audio` `merge-video-audio` `get-first-frame` `get-last-frame` `split-video` `drop-video` `split-text` `combine-text` `arrange-group`.
- **Mọi so sánh khoá phải ép cả hai vế là chuỗi khác `None` 64 hex** (quy tắc chung L1, kế thừa). Ngoại lệ: tiêu chí mà `None` *là* kết quả đúng.
- **Mọi tiêu chí "không cacheable" phải kiểm CẢ HAI chiều** — không đọc *và* không ghi (quy tắc chung thứ hai của contract L2).
- Chạy pytest qua `uv`: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q <path>`. Không dùng `python3 -m pytest` (PEP 668).
- Tên hàm test phải khớp **từng ký tự** node-id trong `_acceptance/config.yaml` — lệch là eval đỏ vĩnh viễn (pytest exit 4, fail-closed).

## Sửa một câu quá rộng trong artifact đã ký

Design doc §8 và `contract.md` `## Notes` viết *"fixture test buộc phải `git init` thư mục plugin thật"*. **Quá rộng.** Fixture của `test_engine_batch.py:222` patch thẳng `scan_manifest`, nên nó tự cấp `cfg` kèm `pluginRev` và `read_plugin_rev` không bao giờ chạy. Chỉ **AC-10 ca (a)** — dò dirty — cần git checkout thật.

Câu đó nằm trong prose, không trong tiêu chí nào; E10 vẫn đòi `git init` đúng chỗ nó cần. **Không mở lại Cổng 1**, chỉ sửa prose ở Task 6.

## File Structure

| File | Trách nhiệm |
|---|---|
| `sdk/tongflow/engine/fingerprint.py` | **Sửa** — thêm `tenant` + `abi_digest` vào khoá, `KEY_SCHEMA_VERSION` → 2 |
| `sdk/tongflow/engine/node_cache.py` | **Tạo** — store trên đĩa, blob dedupe, atomic write, size guard, allowlist, dò dirty, digest ABI |
| `sdk/tongflow/engine/runner.py` | **Sửa** — nối cache vào vòng per-call; param `tenant` |
| `sdk/tongflow/engine/__main__.py` | **Sửa** — đọc `options.tenant` |
| `sdk/tests/test_node_cache.py` | **Tạo** — 16 test engine-side |
| `sdk/tests/test_fingerprint.py` | **Sửa** — 13 lời gọi `node_fingerprint` cần kwargs mới |
| `sdk/tests/fixtures/fingerprint_vectors.json` | **Sinh lại** — `v` đổi nên mọi khoá đã ghi đổi |
| `src/lib/task/engine-delegate.server.ts` | **Sửa** — dịch scope → sentinel |
| `src/lib/task/engine-delegate.test.ts` | **Tạo** — 2 test TS |

---

### Task 1: Mở rộng khoá — `tenant` + `abi_digest`, `v` → 2

**Files:**
- Modify: `sdk/tongflow/engine/fingerprint.py`
- Modify: `sdk/tests/test_fingerprint.py`
- Modify: `sdk/tests/fixtures/fingerprint_vectors.json`

**Serves:** phần khoá của AC-8, AC-9, AC-13. **independent: false** — mọi task sau phụ thuộc chữ ký này.

**Interfaces produced:**
```python
KEY_SCHEMA_VERSION = 2

def node_fingerprint(
    *, slot: str, plugin_id: str, plugin_rev: str | None, plugin_dirty: bool,
    tenant: str | None, abi_digest: str, model: str | None,
    business_input: dict[str, Any], sdk_version: str | None = None,
) -> str | None: ...
```

⚠️ **Task này chạm `fingerprint.py` — file mà `cache-l1-fingerprint` sở hữu.** Feature đó sẽ phải re-verify + chữ ký Cổng 2 mới. Đã nhận ở Cổng 1 của L2. Task 6 lo phần bookkeeping.

- [ ] **Step 1: Viết test đỏ cho hai thành phần khoá mới**

Thêm vào `sdk/tests/test_fingerprint.py` (import ở đầu file cùng các import có sẵn):

```python
def test_tenant_participates_in_the_key():
    # AC-9's unit half. Two tenants, everything else identical.
    a = _fp(tenant="user:a")
    b = _fp(tenant="user:b")
    _assert_valid_key(a)
    _assert_valid_key(b)
    assert a != b


def test_missing_tenant_is_not_cacheable():
    # AC-8's unit half. Empty string and None are both "not declared"; the
    # single-tenant OSS build must send an explicit sentinel instead.
    assert _fp(tenant="") is None
    assert _fp(tenant=None) is None


def test_abi_digest_participates_in_the_key():
    # AC-13's unit half. The ABI is an input to the computation: both
    # materialize_asset_inputs and convert_asset_outputs_to_file_refs read it.
    a = _fp(abi_digest="a" * 64)
    b = _fp(abi_digest="b" * 64)
    _assert_valid_key(a)
    _assert_valid_key(b)
    assert a != b
```

`_fp` là helper đã có trong file; Step 3 sẽ thêm `tenant` và `abi_digest` vào defaults của nó.

- [ ] **Step 2: Chạy test, xác nhận ĐỎ**

Run:
```
cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_fingerprint.py -k "tenant or abi_digest"
```
Expected: FAIL — `TypeError: node_fingerprint() got an unexpected keyword argument 'tenant'`

- [ ] **Step 3: Sửa `fingerprint.py`**

Đổi hằng số:

```python
# Bumping this invalidates every existing cache entry on purpose. Change it
# whenever the meaning of any key component changes, and say so in the
# changelog (R6).
#
# 1 -> 2 (L2, 2026-07-30): `tenant` and `abiDigest` joined the payload. Bumped
# while no entry had ever been written, which is why it cost nothing; doing it
# after L2 ships would mean invalidating a cache that is running for real.
KEY_SCHEMA_VERSION = 2
```

Đổi chữ ký và payload của `node_fingerprint` (giữ nguyên docstring cũ, thêm hai đoạn):

```python
def node_fingerprint(
    *,
    slot: str,
    plugin_id: str,
    plugin_rev: str | None,
    plugin_dirty: bool,
    tenant: str | None,
    abi_digest: str,
    model: str | None,
    business_input: dict[str, Any],
    sdk_version: str | None = None,
) -> str | None:
    """... (giữ nguyên docstring cũ, rồi thêm) ...

    ``tenant`` is required and an empty string counts as not declared. It is in
    the key rather than only in the cache directory path because ``scope = ""``
    is BOTH a legitimate value in the single-tenant build AND the symptom of a
    misconfigured cloud, and a path cannot tell those two apart. In the key,
    two tenants that share a data dir still cannot serve each other.

    ``abi_digest`` is the sha256 of the ABI file in use. The ABI is an input to
    the computation -- both ``materialize_asset_inputs`` and
    ``convert_asset_outputs_to_file_refs`` read it -- so omitting it is the
    same bug class as a compiler cache that does not hash the compiler.
    """
    if not plugin_rev or plugin_dirty or not tenant:
        return None
    payload = {
        "v": KEY_SCHEMA_VERSION,
        "slot": slot,
        "pluginId": plugin_id,
        "pluginRev": plugin_rev,
        "tenant": tenant,
        "abiDigest": abi_digest,
        "model": model,
        "sdkMajor": sdk_major(sdk_version),
        "input": digest_form(slot, business_input),
    }
    blob = json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=True)
    return hashlib.sha256(blob.encode("utf-8")).hexdigest()
```

- [ ] **Step 4: Cập nhật `_fp` helper trong `test_fingerprint.py`**

Thêm hai default vào dict `args` của `_fp` (giữ mọi default khác nguyên):

```python
        tenant="local",
        abi_digest="0" * 64,
```

- [ ] **Step 5: Chạy `test_fingerprint.py`, sửa cho hết đỏ**

Run:
```
cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_fingerprint.py
```
Expected: 17 passed (14 cũ + 3 mới). Nếu còn đỏ, đó là lời gọi `node_fingerprint` trực tiếp không qua `_fp` — thêm `tenant=`/`abi_digest=` cho từng chỗ.

- [ ] **Step 6: Sinh lại vector của L1**

`v` đổi nên mọi khoá đã ghi trong `sdk/tests/fixtures/fingerprint_vectors.json` sai hết. **Sinh bằng implementation, không sửa tay.**

```bash
cd sdk && PYTHONPATH=. uv run --no-project --with pydantic --with typing_extensions python - <<'PY'
import json, pathlib
from tongflow.engine.fingerprint import KEY_SCHEMA_VERSION, node_fingerprint
p = pathlib.Path("tests/fixtures/fingerprint_vectors.json")
d = json.loads(p.read_text(encoding="utf-8"))
d["keySchemaVersion"] = KEY_SCHEMA_VERSION
for c in d["cases"]:
    c.setdefault("tenant", "local")
    c.setdefault("abiDigest", "0" * 64)
    c["expected"] = node_fingerprint(
        slot=c["slot"], plugin_id=c["pluginId"], plugin_rev=c["pluginRev"],
        plugin_dirty=c.get("pluginDirty", False), tenant=c["tenant"],
        abi_digest=c["abiDigest"], model=c["model"],
        business_input=c["businessInput"], sdk_version=c["sdkVersion"])
p.write_text(json.dumps(d, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print("regenerated", len(d["cases"]), "vectors under v =", KEY_SCHEMA_VERSION)
PY
```

Rồi cập nhật `sdk/tests/test_fingerprint_vectors.py` để truyền hai field mới vào `node_fingerprint` (đọc `case["tenant"]` và `case["abiDigest"]`).

- [ ] **Step 7: Chạy `pnpm lint` cho file JSON vừa sinh**

Run: `pnpm lint`
Expected: exit 0. Biome format JSON theo luật của nó; `json.dumps(indent=2)` không khớp (bài học L1 vòng 1).

- [ ] **Step 8: Cả hai file vector test xanh, và guard AC-14 của L1 vẫn có răng**

Run:
```
cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_fingerprint_vectors.py
```
Expected: 2 passed. Guard bump `KEY_SCHEMA_VERSION` 2 → 3 trong bản copy temp và vẫn phải thấy AC-13 đỏ.

- [ ] **Step 9: Full SDK suite + commit**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q`
Expected: 136 passed (133 cũ + 3 mới).

```bash
git add sdk/tongflow/engine/fingerprint.py sdk/tests/test_fingerprint.py sdk/tests/test_fingerprint_vectors.py sdk/tests/fixtures/fingerprint_vectors.json
git commit -m "feat(cache): tenant and abiDigest join the key, KEY_SCHEMA_VERSION 2"
```

---

### Task 2: `node_cache.py` — store, allowlist, dò dirty, digest ABI

**Files:**
- Create: `sdk/tongflow/engine/node_cache.py`
- Create: `sdk/tests/test_node_cache.py`

**Serves:** E4 (AC-4), E5 (AC-5), E12 (AC-12). **independent: false** — dùng chữ ký của Task 1.

**Interfaces consumed:** `node_fingerprint(...)` từ Task 1.

**Interfaces produced:**
```python
TIER_A_SLOTS: frozenset[str]          # đúng 11 slot
def abi_digest_of(abi_file: Path) -> str
def plugin_is_dirty(plugin_dir: Path) -> bool
class NodeCache:
    def __init__(self, data_dir: Path) -> None
    def get(self, key: str, store: AssetStore) -> dict[str, Any] | None
    def put(self, key: str, result: dict[str, Any], store: AssetStore) -> None
```

- [ ] **Step 1: Viết test đỏ cho ba tiêu chí của task này**

Tạo `sdk/tests/test_node_cache.py`:

```python
from __future__ import annotations

import base64
import json
import os
import subprocess
from pathlib import Path

from tongflow.engine.node_cache import (
    TIER_A_SLOTS,
    NodeCache,
    abi_digest_of,
    plugin_is_dirty,
)
from tongflow.engine.store import MemoryStore


def _asset(store: MemoryStore, raw: bytes) -> dict:
    """A result payload carrying one asset already put into `store`."""
    ref = store.put(raw, mime="video/mp4", filename="a.mp4")
    return {"success": True, "video": ref}


def _blob_files(data_dir: Path) -> list[Path]:
    root = data_dir / ".tongflow" / "node-cache" / "blobs"
    return sorted(p for p in root.rglob("*") if p.is_file())


def test_unusable_entry_is_treated_as_miss(tmp_path):
    # AC-4, three cases asserted separately. Each is a real state: (a) is
    # Bazel's classic GC'd-blob-with-live-entry, (c) is a run killed mid-write.
    cache = NodeCache(tmp_path)
    store = MemoryStore()
    key = "a" * 64
    cache.put(key, _asset(store, b"payload-bytes"), store)

    # (a) blob deleted
    for b in _blob_files(tmp_path):
        b.unlink()
    assert cache.get(key, MemoryStore()) is None

    # (b) result.json unparseable
    cache.put(key, _asset(store, b"payload-bytes"), store)
    entry = next((tmp_path / ".tongflow" / "node-cache").rglob("result.json"))
    entry.write_text("{ this is not json", encoding="utf-8")
    assert cache.get(key, MemoryStore()) is None

    # (c) blob present but truncated -> size mismatch
    cache.put(key, _asset(store, b"payload-bytes"), store)
    blob = _blob_files(tmp_path)[0]
    blob.write_bytes(b"short")
    assert cache.get(key, MemoryStore()) is None


def test_unwritable_cache_dir_does_not_break_the_run(tmp_path):
    # AC-5. ccache's read-only-cache-dir case. The spec says the cache is not
    # the source of truth; a cache that cannot write must not fail the caller.
    root = tmp_path / "ro"
    root.mkdir()
    os.chmod(root, 0o500)
    try:
        cache = NodeCache(root)
        store = MemoryStore()
        cache.put("b" * 64, _asset(store, b"x"), store)   # must not raise
        assert cache.get("b" * 64, MemoryStore()) is None
    finally:
        os.chmod(root, 0o700)


def test_shared_asset_stores_one_blob(tmp_path):
    # AC-12. Two DIFFERENT entries referencing byte-identical assets share one
    # blob file. If blobs lived per-entry instead of at the node-cache root,
    # D6's "200 videos share every source blob" claim would be false.
    cache = NodeCache(tmp_path)
    store = MemoryStore()
    same = b"identical-bytes"
    cache.put("c" * 64, _asset(store, same), store)
    cache.put("d" * 64, _asset(store, same), store)
    assert len(_blob_files(tmp_path)) == 1


def test_allowlist_holds_exactly_the_eleven_mechanical_slots():
    # Guard on the constant itself: the deferred three must NOT be in it until
    # 1.1-L1b lands, and a new slot must not be added silently.
    assert TIER_A_SLOTS == frozenset({
        "concat-videos", "extract-audio", "remove-video-audio",
        "merge-video-audio", "get-first-frame", "get-last-frame",
        "split-video", "drop-video", "split-text", "combine-text",
        "arrange-group",
    })
    for deferred in ("transcribe", "transcribe-timestamp", "parse-document"):
        assert deferred not in TIER_A_SLOTS


def test_abi_digest_tracks_file_contents(tmp_path):
    p = tmp_path / "abi.json"
    p.write_text('{"version": 1}', encoding="utf-8")
    first = abi_digest_of(p)
    p.write_text('{"version": 2}', encoding="utf-8")
    assert abi_digest_of(p) != first
    assert len(first) == 64


def test_plugin_is_dirty_reads_the_real_working_tree(tmp_path):
    # AC-10's detector. A real checkout, because git status is what we assert.
    d = tmp_path / "plug"
    d.mkdir()
    (d / "entry.py").write_text("x = 1\n", encoding="utf-8")
    env = {**os.environ, "GIT_AUTHOR_NAME": "t", "GIT_AUTHOR_EMAIL": "t@e",
           "GIT_COMMITTER_NAME": "t", "GIT_COMMITTER_EMAIL": "t@e"}
    subprocess.run(["git", "init", "-q"], cwd=d, check=True, env=env)
    subprocess.run(["git", "add", "-A"], cwd=d, check=True, env=env)
    subprocess.run(["git", "commit", "-qm", "init"], cwd=d, check=True, env=env)
    assert plugin_is_dirty(d) is False
    (d / "entry.py").write_text("x = 2\n", encoding="utf-8")
    assert plugin_is_dirty(d) is True


def test_plugin_without_git_is_not_reported_dirty(tmp_path):
    # Not a checkout at all: `plugin_rev` is already None there, which is what
    # makes it uncacheable. `plugin_is_dirty` must not claim dirty as well --
    # two independent reasons reported as one hides which one fired.
    d = tmp_path / "plain"
    d.mkdir()
    assert plugin_is_dirty(d) is False
```

- [ ] **Step 2: Chạy test, xác nhận ĐỎ**

Run:
```
cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_node_cache.py
```
Expected: FAIL — `ModuleNotFoundError: No module named 'tongflow.engine.node_cache'`

- [ ] **Step 3: Viết `node_cache.py`**

Tạo `sdk/tongflow/engine/node_cache.py`:

```python
"""On-disk cache for one plugin call's result — slice L2, tier A only.

The cache is NOT the source of truth. Every read and write path degrades to
"behave as if there were no cache" on any error: a full disk, a read-only
directory, a half-written entry. Deleting the whole directory must change
nothing but speed (spec section 8).

Blobs live at the node-cache ROOT, not inside each entry, so two entries
referencing byte-identical assets share one file. Both `result.json` and blobs
are written temp-then-`os.replace`: a process reading a half-written file is
the hazard, and it applies to blobs exactly as much as to the manifest.
"""

from __future__ import annotations

import hashlib
import json
import os
import subprocess
import tempfile
from pathlib import Path
from typing import Any, Optional

from ._subproc import utf8_env
from .store import AssetStore

# Tier A is a hand-maintained allowlist, NOT derived from the ABI. 38 of 61
# slots carry no seed/temperature knob, but that set includes gen-text,
# image-describe and music-brief — generative model calls with no seed to pin,
# i.e. MORE nondeterministic, not less. Absence of a knob does not imply
# determinism, so a slot must be named here to be cached.
#
# transcribe / transcribe-timestamp / parse-document are deliberately absent
# even though spec D3 names them: they pick a decoder from the declared mime,
# and L2 is what turns the mime/filename known limit (queue 1.1-L1b) from
# theoretical into live. Re-add them once that lands.
TIER_A_SLOTS = frozenset({
    "concat-videos",
    "extract-audio",
    "remove-video-audio",
    "merge-video-audio",
    "get-first-frame",
    "get-last-frame",
    "split-video",
    "drop-video",
    "split-text",
    "combine-text",
    "arrange-group",
})

_BLOB_KEY = "__cache_blob"
_SIZE_KEY = "__cache_size"


def abi_digest_of(abi_file: Path) -> str:
    """sha256 of the ABI file in use.

    The ABI is an input to the computation, not ambient configuration: both
    `materialize_asset_inputs` and `convert_asset_outputs_to_file_refs` read
    it, so the same business input can produce a different result when a slot's
    schema changes. `sdkMajor` does not cover it — the ABI is a separate file
    with its own version that changes without an SDK minor bump.
    """
    return hashlib.sha256(abi_file.read_bytes()).hexdigest()


def plugin_is_dirty(plugin_dir: Path) -> bool:
    """True when the plugin checkout has uncommitted edits.

    `git rev-parse HEAD` cannot see a working-tree edit, so a hand-modified
    plugin keeps its rev and the cache would serve its old result forever —
    the blocking condition conformance-l0 recorded for this slice.

    Not a checkout, or no git binary, or git failing for any reason: return
    False. Those states are already uncacheable via a missing `plugin_rev`, and
    reporting them as "dirty" too would conflate two independent reasons.
    """
    if not (plugin_dir / ".git").exists():
        return False
    try:
        r = subprocess.run(
            ["git", "status", "--porcelain"],
            cwd=plugin_dir,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            env=utf8_env(),
        )
    except OSError:
        return False
    if r.returncode != 0:
        return False
    return bool(r.stdout.strip())


def _atomic_write(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=str(path.parent), suffix=".part")
    try:
        with os.fdopen(fd, "wb") as f:
            f.write(data)
        os.replace(tmp, path)
    except BaseException:
        # Leave no partial file behind on any exit path, including interrupts.
        try:
            os.unlink(tmp)
        except OSError:
            pass
        raise


class NodeCache:
    """Content-addressed cache rooted at ``<data_dir>/.tongflow/node-cache``."""

    def __init__(self, data_dir: Path) -> None:
        self.root = Path(data_dir) / ".tongflow" / "node-cache"

    def _entry(self, key: str) -> Path:
        return self.root / key[:2] / key / "result.json"

    def _blob(self, sha: str) -> Path:
        return self.root / "blobs" / sha[:2] / sha

    def get(self, key: str, store: AssetStore) -> Optional[dict[str, Any]]:
        """The cached result with its blobs re-put into ``store``, or None.

        Re-putting is the correctness crux of D6: `MemoryStore` hands back a
        `mem://<uuid>` that only lives inside one process, so a cached handle
        from an earlier run is a dead pointer. Downstream nodes must see a
        `file_key` valid in the store THIS run is using.
        """
        try:
            raw = self._entry(key).read_text(encoding="utf-8")
            payload = json.loads(raw)
            return self._rehydrate(payload, store)
        except Exception:
            # Any unusable entry is a miss: missing file, unparseable JSON,
            # missing or truncated blob, permission error.
            return None

    def put(self, key: str, result: dict[str, Any], store: AssetStore) -> None:
        """Write one entry. Never raises — a cache that cannot write must not
        fail the run (spec section 8)."""
        try:
            payload = self._dehydrate(result, store)
            self._entry(key).parent.mkdir(parents=True, exist_ok=True)
            _atomic_write(
                self._entry(key),
                json.dumps(payload, ensure_ascii=False).encode("utf-8"),
            )
        except Exception:
            return

    def _dehydrate(self, node: Any, store: AssetStore) -> Any:
        """Replace every asset ref with a blob pointer, writing the blob."""
        if isinstance(node, dict):
            fk = node.get("file_key")
            if isinstance(fk, str):
                data = store.get(fk)
                if data is not None:
                    sha = hashlib.sha256(data).hexdigest()
                    blob = self._blob(sha)
                    if not blob.exists():
                        _atomic_write(blob, data)
                    rest = {k: v for k, v in node.items() if k != "file_key"}
                    return {**rest, _BLOB_KEY: sha, _SIZE_KEY: len(data)}
            return {k: self._dehydrate(v, store) for k, v in node.items()}
        if isinstance(node, list):
            return [self._dehydrate(v, store) for v in node]
        return node

    def _rehydrate(self, node: Any, store: AssetStore) -> Any:
        """Put blobs back into `store` and restore `file_key`.

        A size mismatch means the blob was written by a process that died
        mid-write; raise so `get()` reports a miss. Size rather than a re-hash:
        re-hashing a 200MB video on every hit is exactly the I/O the cache
        exists to avoid.
        """
        if isinstance(node, dict):
            sha = node.get(_BLOB_KEY)
            if isinstance(sha, str):
                blob = self._blob(sha)
                data = blob.read_bytes()
                if len(data) != node.get(_SIZE_KEY):
                    raise ValueError("cached blob size mismatch")
                rest = {k: v for k, v in node.items()
                        if k not in (_BLOB_KEY, _SIZE_KEY)}
                ref = store.put(
                    data,
                    mime=rest.get("mime"),
                    filename=rest.get("filename"),
                )
                return {**rest, **ref}
            return {k: self._rehydrate(v, store) for k, v in node.items()}
        if isinstance(node, list):
            return [self._rehydrate(v, store) for v in node]
        return node
```

- [ ] **Step 4: Chạy test, xác nhận XANH**

Run:
```
cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_node_cache.py
```
Expected: 7 passed

- [ ] **Step 5: Chứng minh guard AC-12 không rỗng**

Sửa tạm `_blob` thành `self.root / key_placeholder / "blobs" / sha` (blob trong từng entry) — nghĩa là thay thân hàm bằng một đường dẫn phụ thuộc entry — rồi chạy lại: `test_shared_asset_stores_one_blob` phải ĐỎ. Hoàn nguyên, xanh lại. Dán cả hai output.

- [ ] **Step 6: Commit**

```bash
git add sdk/tongflow/engine/node_cache.py sdk/tests/test_node_cache.py
git commit -m "feat(cache): on-disk node cache with shared blobs and atomic writes"
```

---

### Task 3: Nối vào `runner.py` — đọc/ghi, allowlist, tenant, dirty

**Files:**
- Modify: `sdk/tongflow/engine/runner.py`
- Modify: `sdk/tests/test_node_cache.py`

**Serves:** E1 (AC-1), E3 (AC-3), E6 (AC-6), E7 (AC-7), E8 (AC-8), E9 (AC-9), E10 (AC-10), E13 (AC-13). **independent: false**

**Interfaces consumed:** `NodeCache`, `TIER_A_SLOTS`, `abi_digest_of`, `plugin_is_dirty` (Task 2); `node_fingerprint` (Task 1).

**Interfaces produced:** `run_workflow(..., tenant: str | None = None)`.

- [ ] **Step 1: Viết fixture + 8 test đỏ**

Thêm vào `sdk/tests/test_node_cache.py`. Fixture theo đúng khuôn `test_engine_batch.py:195-232` — **patch `scan_manifest`** nên nó tự cấp `pluginRev`, không cần `git init` (trừ test dirty):

```python
from unittest.mock import patch

from tongflow.engine import run_workflow
from tongflow.engine import runner as runner_mod


def _two_node_workflow(text: str) -> dict:
    """combine-text -> split-text. Both are tier A, neither needs a real plugin."""
    return {
        "nodes": [
            {"id": "n1", "feature": "combine-text", "pluginId": "oneflow-text",
             "bindings": {"text": {"kind": "static", "value": text}},
             "outputs": [{"sourceField": "text", "dataField": "texts",
                          "downstreamDataNodeId": "d1"}],
             "level": 0, "dependencies": []},
            {"id": "n2", "feature": "split-text", "pluginId": "oneflow-text",
             "bindings": {"text": {"kind": "dataNode", "dataNodeId": "d1"}},
             "outputs": [], "level": 1, "dependencies": ["n1"]},
        ],
        "dataNodes": [{"id": "d1", "nodeType": "textNode"}],
        "executionLevels": [["n1"], ["n2"]],
        "inputs": [],
    }


def _run(workflow, tmp_path, *, tenant="local", data_dir=None, plugin_dir_name="oneflow-text"):
    calls: list[dict] = []

    def recording_invoker(plugin_id, slot, business_input, plugin_dir, model):
        calls.append({"slot": slot, "input": business_input})
        return {"success": True, "text": f"out:{business_input.get('text')}"}

    plugins_dir = tmp_path / "plugins"
    (plugins_dir / plugin_dir_name).mkdir(parents=True, exist_ok=True)
    manifest = {"plugins": {"oneflow-text": {
        "localSubdir": plugin_dir_name,
        "pluginRev": "a" * 40,
    }}}
    with patch.object(runner_mod, "scan_manifest", lambda _pd, _abi: manifest):
        result = run_workflow(
            workflow, {},
            plugins_dir=plugins_dir,
            data_dir=data_dir or (tmp_path / "data"),
            tenant=tenant,
            invoker=recording_invoker,
            auto_install=False,
        )
    return result, calls


def test_second_run_hits_cache_with_zero_plugin_calls(tmp_path):
    # AC-1, the DoD. Counting invoker calls is the only measure that cannot be
    # "close enough": a hit that still calls the plugin saves nothing.
    wf = _two_node_workflow("hello")
    r1, c1 = _run(wf, tmp_path)
    r2, c2 = _run(wf, tmp_path)
    assert len(c1) == 2
    assert len(c2) == 0
    assert r2["outputs"] == r1["outputs"]


def test_failed_call_never_writes_an_entry(tmp_path):
    # AC-3. A transient failure cached as a permanent one is the worst bug in
    # this family, so the write point must sit AFTER the success check.
    def failing_invoker(plugin_id, slot, business_input, plugin_dir, model):
        return {"success": False, "error": "boom"}

    plugins_dir = tmp_path / "plugins"
    (plugins_dir / "oneflow-text").mkdir(parents=True)
    manifest = {"plugins": {"oneflow-text": {
        "localSubdir": "oneflow-text", "pluginRev": "a" * 40}}}
    root = tmp_path / "data" / ".tongflow" / "node-cache"
    with patch.object(runner_mod, "scan_manifest", lambda _pd, _abi: manifest):
        try:
            run_workflow(_two_node_workflow("x"), {}, plugins_dir=plugins_dir,
                         data_dir=tmp_path / "data", tenant="local",
                         invoker=failing_invoker, auto_install=False)
        except Exception:
            pass
    entries = list(root.rglob("result.json")) if root.exists() else []
    assert entries == []


def test_deleting_cache_dir_keeps_results_identical(tmp_path):
    # AC-6. Spec section 8 verbatim: deleting the cache changes nothing but speed.
    import shutil
    wf = _two_node_workflow("hello")
    r1, c1 = _run(wf, tmp_path)
    _run(wf, tmp_path)                                  # warm
    shutil.rmtree(tmp_path / "data" / ".tongflow")
    r3, c3 = _run(wf, tmp_path)
    assert r3["outputs"] == r1["outputs"]
    assert len(c3) == len(c1)


def test_slot_outside_allowlist_is_never_cached(tmp_path):
    # AC-7, BOTH directions. A new slot defaults to uncached.
    wf = _two_node_workflow("hello")
    wf["nodes"][0]["feature"] = "gen-text"              # not in TIER_A_SLOTS
    _, c1 = _run(wf, tmp_path)
    _, c2 = _run(wf, tmp_path)
    assert len(c2) == len(c1)                           # not read
    root = tmp_path / "data" / ".tongflow" / "node-cache"
    keys = list(root.rglob("result.json")) if root.exists() else []
    assert len(keys) == 1                               # only n2 (split-text) written


def test_missing_tenant_is_not_cacheable(tmp_path):
    # AC-8, both cases, both directions.
    wf = _two_node_workflow("hello")
    for bad in ("", None):
        d = tmp_path / f"t{bad!r}"
        _, c1 = _run(wf, d, tenant=bad)
        _, c2 = _run(wf, d, tenant=bad)
        assert len(c2) == len(c1) == 2
        root = d / "data" / ".tongflow" / "node-cache"
        assert not (root.exists() and list(root.rglob("result.json")))


def test_two_tenants_sharing_data_dir_do_not_cross_serve(tmp_path):
    # AC-9. Sharing ONE data_dir is mandatory: split them and the path already
    # isolates, so the test would pass without proving tenant is in the key.
    wf = _two_node_workflow("hello")
    shared = tmp_path / "data"
    _, ca = _run(wf, tmp_path, tenant="user:a", data_dir=shared)
    _, cb = _run(wf, tmp_path, tenant="user:b", data_dir=shared)
    assert len(ca) == 2 and len(cb) == 2
    entries = list((shared / ".tongflow" / "node-cache").rglob("result.json"))
    assert len(entries) == 4                            # 2 nodes x 2 tenants


def test_dirty_plugin_is_not_cacheable_end_to_end(tmp_path):
    # AC-10 case (a): a REAL checkout with uncommitted edits. This is the one
    # test that needs `git init` — the fixture patches scan_manifest, so
    # read_plugin_rev never runs, but plugin_is_dirty reads the real tree.
    wf = _two_node_workflow("hello")
    plugins_dir = tmp_path / "plugins"
    d = plugins_dir / "oneflow-text"
    d.mkdir(parents=True)
    (d / "entry.py").write_text("x = 1\n", encoding="utf-8")
    env = {**os.environ, "GIT_AUTHOR_NAME": "t", "GIT_AUTHOR_EMAIL": "t@e",
           "GIT_COMMITTER_NAME": "t", "GIT_COMMITTER_EMAIL": "t@e"}
    subprocess.run(["git", "init", "-q"], cwd=d, check=True, env=env)
    subprocess.run(["git", "add", "-A"], cwd=d, check=True, env=env)
    subprocess.run(["git", "commit", "-qm", "i"], cwd=d, check=True, env=env)
    (d / "entry.py").write_text("x = 2\n", encoding="utf-8")   # now dirty
    _, c1 = _run(wf, tmp_path)
    _, c2 = _run(wf, tmp_path)
    assert len(c2) == len(c1) == 2
    root = tmp_path / "data" / ".tongflow" / "node-cache"
    assert not (root.exists() and list(root.rglob("result.json")))


def test_abi_change_invalidates_the_key(tmp_path):
    # AC-13. Change the REAL ABI file, not a monkeypatched digest — patching a
    # digest proves the digest is used, not that the ABI is its source.
    import shutil
    from tongflow.engine.abi_schema import resolve_abi_path
    real = resolve_abi_path(None)
    copy = tmp_path / "abi.json"
    shutil.copyfile(real, copy)
    wf = _two_node_workflow("hello")

    def run_with_abi(abi):
        calls: list[dict] = []

        def inv(plugin_id, slot, business_input, plugin_dir, model):
            calls.append({"slot": slot})
            return {"success": True, "text": "out"}

        plugins_dir = tmp_path / "plugins"
        (plugins_dir / "oneflow-text").mkdir(parents=True, exist_ok=True)
        manifest = {"plugins": {"oneflow-text": {
            "localSubdir": "oneflow-text", "pluginRev": "a" * 40}}}
        with patch.object(runner_mod, "scan_manifest", lambda _pd, _abi: manifest):
            run_workflow(wf, {}, plugins_dir=plugins_dir,
                         data_dir=tmp_path / "data", tenant="local",
                         abi_path=abi, invoker=inv, auto_install=False)
        return calls

    assert len(run_with_abi(copy)) == 2
    assert len(run_with_abi(copy)) == 0                 # warm
    copy.write_text(copy.read_text(encoding="utf-8") + "\n", encoding="utf-8")
    assert len(run_with_abi(copy)) == 2                 # ABI changed -> miss
```

- [ ] **Step 2: Chạy, xác nhận ĐỎ**

Run:
```
cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_node_cache.py
```
Expected: FAIL — `TypeError: run_workflow() got an unexpected keyword argument 'tenant'`

- [ ] **Step 3: Thêm param `tenant` vào `run_workflow`**

Trong `sdk/tongflow/engine/runner.py`, thêm sau `task_id: str = "tongflow-engine",`:

```python
    tenant: Optional[str] = None,
```

và vào docstring Args:

```
        tenant: cache scope for this run. Required for any caching to happen;
            an empty string or None disables the cache entirely rather than
            falling back to a shared one. The single-tenant build sends
            "local"; a cloud shell sends "user:<id>".
```

- [ ] **Step 4: Dựng cache một lần mỗi run**

Sau `abi = load_abi_schema(abi_file)` (khoảng dòng 230), thêm:

```python
    from .node_cache import TIER_A_SLOTS, NodeCache, abi_digest_of, plugin_is_dirty

    # One digest per run: the ABI does not change mid-run, and hashing it per
    # call would be pointless I/O.
    try:
        abi_dig = abi_digest_of(abi_file)
    except OSError:
        abi_dig = ""
    node_cache = NodeCache(Path(data_dir_resolved)) if tenant else None
    dirty_by_dir: dict[Path, bool] = {}
```

> Người thực thi: thay `data_dir_resolved` bằng tên biến thật mà `runner.py` dùng cho data dir đã resolve (đọc quanh dòng 229-290 để lấy đúng tên). Nếu `data_dir` chưa được resolve thành `Path` ở đó, resolve tại chỗ theo đúng cách các option khác làm.

- [ ] **Step 5: Nối đọc/ghi vào vòng per-call**

Trong vòng `for call_params in per_call_params:`, ngay **sau** `business_input = materialize_asset_inputs(...)`, thay khối gọi plugin bằng:

```python
                    cache_key = None
                    if node_cache is not None and slot in TIER_A_SLOTS:
                        if plugin_dir not in dirty_by_dir:
                            dirty_by_dir[plugin_dir] = plugin_is_dirty(plugin_dir)
                        cache_key = node_fingerprint(
                            slot=slot,
                            plugin_id=plugin_id,
                            plugin_rev=cfg.get("pluginRev"),
                            plugin_dirty=dirty_by_dir[plugin_dir],
                            tenant=tenant,
                            abi_digest=abi_dig,
                            model=model,
                            business_input=business_input,
                        )

                    cached = (
                        node_cache.get(cache_key, store)
                        if (node_cache is not None and cache_key)
                        else None
                    )
                    if cached is not None:
                        results.append(cached)
                        continue

                    if invoker is not None:
                        raw = invoker(plugin_id, slot, business_input, plugin_dir, model)
                    else:
                        raw = invoke_plugin(
                            python=python,
                            plugin_dir=plugin_dir,
                            entry_file=cfg.get("entryFile", "entry.py"),
                            plugin_id=plugin_id,
                            node_slot=slot,
                            prompt=business_input,
                            sdk_root=SDK_ROOT,
                            task_id=task_id,
                            model=model,
                            on_progress=on_progress,
                        )
                    one = convert_asset_outputs_to_file_refs(slot, raw, abi, store)

                    if one.get("success") is False:
                        raise RuntimeError(
                            str(one.get("error") or "Plugin returned success=false")
                        )
                    # Write AFTER the success check: D8 forbids caching a
                    # failure, and a transient error cached as a permanent one
                    # is the worst outcome in this family.
                    if node_cache is not None and cache_key:
                        node_cache.put(cache_key, one, store)
                    results.append(one)
```

Thêm import ở đầu file cùng các import `.` khác:

```python
from .fingerprint import node_fingerprint
```

- [ ] **Step 6: Chạy, xác nhận XANH**

Run:
```
cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_node_cache.py
```
Expected: 15 passed (7 của Task 2 + 8 mới)

- [ ] **Step 7: Full SDK suite**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q`
Expected: 151 passed. **Nếu test cũ đỏ** — nhất là `test_engine.py` / `test_engine_batch.py` — nguyên nhân gần chắc là chúng gọi `run_workflow` không truyền `tenant` nên cache tắt, đúng như thiết kế; đỏ vì lý do khác thì đọc kỹ trước khi sửa test.

- [ ] **Step 8: Chứng minh AC-7 và AC-9 không rỗng**

Hai mutation, mỗi cái chạy lại `tests/test_node_cache.py`:
1. Bỏ điều kiện `slot in TIER_A_SLOTS` → `test_slot_outside_allowlist_is_never_cached` phải ĐỎ.
2. Bỏ `tenant=tenant` khỏi lời gọi `node_fingerprint` (dùng hằng `"x"`) → `test_two_tenants_sharing_data_dir_do_not_cross_serve` phải ĐỎ.

Hoàn nguyên cả hai, xanh lại. Dán output cả bốn lần chạy.

- [ ] **Step 9: Commit**

```bash
git add sdk/tongflow/engine/runner.py sdk/tests/test_node_cache.py
git commit -m "feat(cache): wire the node cache into the per-call loop"
```

---

### Task 4: Asset qua cache + fan-out — AC-2, AC-11, AC-15

**Files:**
- Modify: `sdk/tests/test_node_cache.py`
- Modify: `sdk/tongflow/engine/runner.py` (chỉ nếu test lộ ra khiếm khuyết)

**Serves:** E2 (AC-2), E11 (AC-11), E16 (AC-15). **independent: false**

- [ ] **Step 1: Viết ba test đỏ**

Thêm vào `sdk/tests/test_node_cache.py`:

```python
def test_hit_reputs_blobs_into_current_run_store(tmp_path):
    # AC-2, the correctness crux of D6. Asserting "it hit" is not enough: a
    # cache returning a dead mem:// handle from an earlier process also "hits".
    wf = _two_node_workflow("hello")
    wf["nodes"][0]["feature"] = "get-first-frame"        # tier A, asset output

    seen: list[str] = []

    def inv(plugin_id, slot, business_input, plugin_dir, model):
        if slot == "get-first-frame":
            return {"success": True, "image": {"file_key": "seed", "bytesBase64":
                    base64.b64encode(b"frame-bytes").decode("ascii")}}
        seen.append(str(business_input))
        return {"success": True, "text": "out"}

    plugins_dir = tmp_path / "plugins"
    (plugins_dir / "oneflow-text").mkdir(parents=True, exist_ok=True)
    manifest = {"plugins": {"oneflow-text": {
        "localSubdir": "oneflow-text", "pluginRev": "a" * 40}}}

    def once():
        with patch.object(runner_mod, "scan_manifest", lambda _pd, _abi: manifest):
            return run_workflow(wf, {}, plugins_dir=plugins_dir,
                                data_dir=tmp_path / "data", tenant="local",
                                invoker=inv, auto_install=False)

    r1 = once()
    r2 = once()
    # The downstream node must have received a resolvable key on the cached run.
    assert len(seen) == 2
    out1 = r1["outputs"]["n1"]
    out2 = r2["outputs"]["n1"]
    assert out2["image"]["file_key"] != "" and out2["image"]["file_key"] is not None
    # Same content on both runs, resolved through each run's own store.
    assert base64.b64decode(out2["image"]["bytesBase64"]) == \
           base64.b64decode(out1["image"]["bytesBase64"])


def test_batch_partial_hit_calls_only_the_misses(tmp_path):
    # AC-11. This is what a per-node cache cannot do, so it is also the test
    # that proves the hook really is per-call.
    def wf_for(items):
        w = _two_node_workflow("x")
        w["nodes"][0]["feature"] = "split-text"
        w["nodes"][0]["batchField"] = "text"
        w["nodes"][0]["bindings"]["text"] = {"kind": "static", "value": items}
        return w

    _, c1 = _run(wf_for(["a", "b", "c"]), tmp_path)
    assert len([x for x in c1 if x["slot"] == "split-text"]) == 3
    _, c2 = _run(wf_for(["a", "b", "c", "d", "e"]), tmp_path)
    # a/b/c are cached; only d/e run.
    assert len([x for x in c2 if x["slot"] == "split-text"]) == 2


def test_changing_one_node_input_reruns_only_it_and_downstream(tmp_path):
    # AC-15 — the criterion the parent spec is NAMED after, and the one the
    # clean-context critique found missing. An implementation keying on
    # node-level params instead of the per-call materialized input passes
    # AC-1/AC-6/AC-11/AC-13 while serving stale output on every edit.
    wf1 = _two_node_workflow("first")
    _, c1 = _run(wf1, tmp_path)
    assert len(c1) == 2
    _, c2 = _run(wf1, tmp_path)
    assert len(c2) == 0
    wf2 = _two_node_workflow("second")                  # one business field changed
    r3, c3 = _run(wf2, tmp_path)
    # n1 changed -> n1 reruns; n2 is downstream of it -> n2 reruns too.
    assert len(c3) == 2
    assert r3["outputs"]["n1"] != _run(wf1, tmp_path)[0]["outputs"]["n1"]
```

- [ ] **Step 2: Chạy, xác nhận ĐỎ trước khi sửa gì**

Run:
```
cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_node_cache.py -k "reputs or partial_hit or one_node_input"
```
Expected: ít nhất một test đỏ. **Ghi lại test nào đỏ và vì sao** — nếu cả ba xanh ngay, đó là dấu hiệu test chưa phân biệt được gì, phải làm nó đỏ trước bằng cách kiểm chặt hơn.

- [ ] **Step 3: Sửa cho xanh**

Ba tiêu chí này *nên* đã đúng nhờ Task 3 (khoá tính từ `business_input` per-call). Nếu đỏ, nguyên nhân gần chắc là một trong hai:
- `_rehydrate` không trả `bytesBase64` mà `outputs` cần → sửa `_rehydrate` trong `node_cache.py`.
- `cache_key` được tính ngoài vòng per-call → chuyển vào trong vòng.

Không sửa test để nó xanh; sửa code.

- [ ] **Step 4: Chạy lại + full suite**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q`
Expected: 154 passed

- [ ] **Step 5: Chứng minh AC-15 không rỗng — mutation quan trọng nhất của lát này**

Sửa tạm lời gọi `node_fingerprint` trong `runner.py` để truyền `business_input={}` thay vì `business_input=business_input` (mô phỏng đúng bug khoá-theo-mức-node mà AC-15 sinh ra để bắt). Chạy lại:

Expected: `test_changing_one_node_input_reruns_only_it_and_downstream` **ĐỎ**. Nếu nó vẫn xanh thì AC-15 là guard rỗng và phải viết lại test trước khi đi tiếp.

Hoàn nguyên, xanh lại. Dán cả hai output.

- [ ] **Step 6: Commit**

```bash
git add sdk/tongflow/engine/node_cache.py sdk/tongflow/engine/runner.py sdk/tests/test_node_cache.py
git commit -m "test(cache): assets through the cache, partial batch hits, partial re-render"
```

---

### Task 5: Bridge NDJSON — nửa engine của AC-14 và AC-16

**Files:**
- Modify: `sdk/tongflow/engine/__main__.py`
- Modify: `sdk/tests/test_node_cache.py`

**Serves:** E14 (AC-14, `layer: backend-effect`), E18 (AC-16, `layer: backend-effect`). **independent: false**

- [ ] **Step 1: Viết hai test đỏ**

```python
def _bridge(request: dict) -> dict:
    """Drive __main__.main() over stdin/stdout the way a host does."""
    import io
    import sys as _sys
    from tongflow.engine import __main__ as bridge
    old_in, old_out = _sys.stdin, _sys.stdout
    _sys.stdin = io.StringIO(json.dumps(request))
    _sys.stdout = io.StringIO()
    try:
        bridge.main()
        lines = [l for l in _sys.stdout.getvalue().splitlines() if l.strip()]
    finally:
        _sys.stdin, _sys.stdout = old_in, old_out
    return json.loads(lines[-1])


def test_engine_rejects_empty_tenant(tmp_path):
    # AC-14, engine half, through the real bridge — options is where a missing
    # field turns into a default, so testing run_workflow directly would miss it.
    wf = _two_node_workflow("hello")
    plugins_dir = tmp_path / "plugins"
    (plugins_dir / "oneflow-text").mkdir(parents=True)
    manifest = {"plugins": {"oneflow-text": {
        "localSubdir": "oneflow-text", "pluginRev": "a" * 40}}}
    root = tmp_path / "data" / ".tongflow" / "node-cache"

    for opts in ({"tenant": ""}, {}):                   # empty AND absent
        req = {"workflow": wf, "inputs": {}, "options": {
            "plugins_dir": str(plugins_dir), "data_dir": str(tmp_path / "data"),
            "auto_install": False, **opts}}
        with patch.object(runner_mod, "scan_manifest", lambda _pd, _abi: manifest):
            with patch.object(runner_mod, "invoke_plugin",
                              lambda **kw: {"success": True, "text": "out"}):
                _bridge(req)
                _bridge(req)
        assert not (root.exists() and list(root.rglob("result.json")))


def test_bridge_reuses_cache_across_two_invocations(tmp_path):
    # AC-16, backend-effect half: a stable data_dir must actually produce a hit
    # through the path the host uses, not merely be an equal string in TS.
    wf = _two_node_workflow("hello")
    plugins_dir = tmp_path / "plugins"
    (plugins_dir / "oneflow-text").mkdir(parents=True)
    manifest = {"plugins": {"oneflow-text": {
        "localSubdir": "oneflow-text", "pluginRev": "a" * 40}}}
    calls: list[str] = []

    def fake_invoke(**kw):
        calls.append(kw["node_slot"])
        return {"success": True, "text": "out"}

    req = {"workflow": wf, "inputs": {}, "options": {
        "plugins_dir": str(plugins_dir), "data_dir": str(tmp_path / "data"),
        "tenant": "local", "auto_install": False}}
    with patch.object(runner_mod, "scan_manifest", lambda _pd, _abi: manifest):
        with patch.object(runner_mod, "invoke_plugin", fake_invoke):
            _bridge(req)
            first = len(calls)
            _bridge(req)
    assert first == 2
    assert len(calls) == first                          # second run: zero calls
```

- [ ] **Step 2: Chạy, xác nhận ĐỎ**

Run:
```
cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_node_cache.py -k "bridge or empty_tenant"
```
Expected: FAIL — bridge chưa truyền `tenant`, nên run thứ hai vẫn gọi plugin.

- [ ] **Step 3: Đọc `tenant` trong bridge**

Trong `sdk/tongflow/engine/__main__.py`, thêm `"tenant"` vào docstring liệt kê options, và truyền vào `run_workflow`:

```python
            tenant=opts.get("tenant"),
```

- [ ] **Step 4: Chạy, xác nhận XANH + full suite**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q`
Expected: 156 passed

- [ ] **Step 5: Commit**

```bash
git add sdk/tongflow/engine/__main__.py sdk/tests/test_node_cache.py
git commit -m "feat(cache): the NDJSON bridge passes tenant through to the engine"
```

---

### Task 6: Phía TS — sentinel tenant + `data_dir` bền

**Files:**
- Modify: `src/lib/task/engine-delegate.server.ts`
- Create: `src/lib/task/engine-delegate.test.ts`
- Modify: `docs/superpowers/specs/2026-07-30-cache-l2-store-design.md`
- Modify: `_acceptance/cache-l2-store/contract.md`

**Serves:** E15 (AC-14 TS half), E17 (AC-16 TS half). **independent: true** — khác ngôn ngữ, khác file, chỉ cần đồng thuận tên option `tenant`.

- [ ] **Step 1: Viết hai test đỏ**

Tạo `src/lib/task/engine-delegate.test.ts`. Tên test phải chứa đúng chuỗi mà `-t` của config lọc: `tenant sentinel` và `data_dir is stable`.

```ts
import { describe, expect, it, vi } from "vitest";

describe("engine delegate options", () => {
    it("translates scope into an explicit tenant sentinel", async () => {
        // Empty scope is the single-tenant OSS build; it must become "local",
        // never the empty string — an empty tenant is what the engine treats as
        // "not declared", and a misconfigured cloud looks identical to it.
        const { tenantFor } = await import("./engine-delegate.server");
        expect(tenantFor("")).toBe("local");
        expect(tenantFor("abc")).toBe("user:abc");
        for (const scope of ["", "abc"]) {
            expect(tenantFor(scope)).not.toBe("");
        }
    });

    it("data_dir is stable across two consecutive runs for one scope", async () => {
        const { dataRootFor } = await import("./engine-delegate.server");
        const a = dataRootFor("abc");
        const b = dataRootFor("abc");
        expect(a).toBe(b);
        // And it must derive from the scoped data dir, not a per-task or temp
        // path: a hardcoded constant would satisfy equality alone.
        const { scopedDataDirFor } = await import("@/lib/runtime/scope.server");
        expect(a).toBe(scopedDataDirFor("abc"));
    });
});
```

- [ ] **Step 2: Chạy, xác nhận ĐỎ**

Run: `pnpm vitest run src/lib/task/engine-delegate.test.ts`
Expected: FAIL — `tenantFor` / `dataRootFor` chưa export.

- [ ] **Step 3: Export hai helper thuần và dùng chúng**

Trong `src/lib/task/engine-delegate.server.ts`, thêm gần đầu file (sau các import):

```ts
/**
 * Cache scope sent to the engine. The empty scope of the single-tenant build
 * becomes an explicit "local" rather than "" — the engine treats an empty
 * tenant as "not declared" and disables the cache, and a cloud whose
 * `resolveScope()` returns "" for everyone would otherwise look identical to a
 * legitimate single-tenant install while pooling every user's cache.
 */
export function tenantFor(scope: string): string {
    return scope ? `user:${scope}` : "local";
}

/** Data root for a scope. Stable across runs: the cache lives under it. */
export function dataRootFor(scope: string): string {
    return scopedDataDirFor(scope);
}
```

Rồi thay hai chỗ dùng: `const dataRoot = dataRootFor(scope);` và thêm vào khối `options`:

```ts
                tenant: tenantFor(scope),
```

- [ ] **Step 4: Chạy, xác nhận XANH**

Run: `pnpm vitest run src/lib/task/engine-delegate.test.ts`
Expected: 2 passed

- [ ] **Step 5: Sửa câu quá rộng trong hai artifact**

Trong design doc §8 và `contract.md` `## Notes`, thay câu *"Fixture test buộc phải `git init` thư mục plugin thật"* bằng:

```
Fixture của `test_engine_batch.py` patch thẳng `scan_manifest`, nên nó tự cấp `cfg`
kèm `pluginRev` và `read_plugin_rev` không bao giờ chạy — **chỉ ca (a) của AC-10**
(dò dirty) cần một git checkout thật, vì `plugin_is_dirty` đọc working tree thật.
Mười lăm tiêu chí còn lại dùng manifest patch là đủ. Câu trong bản đầu của tài liệu
này ("mọi fixture buộc phải git init") quá rộng; nó nằm trong prose, không trong
tiêu chí nào, nên sửa được mà không mở lại Cổng 1.
```

- [ ] **Step 6: Verify đầy đủ theo checklist CLAUDE.md**

Run, theo đúng thứ tự này (build viết lại `.next/types` trong khi tsc đọc chúng nên không chạy song song):
```
pnpm lint:check && pnpm test && pnpm build && pnpm typecheck
```
Expected: tất cả exit 0.

- [ ] **Step 7: Commit**

```bash
git add src/lib/task/engine-delegate.server.ts src/lib/task/engine-delegate.test.ts docs/superpowers/specs/2026-07-30-cache-l2-store-design.md _acceptance/cache-l2-store/contract.md
git commit -m "feat(cache): TS sends an explicit tenant sentinel and a stable data_dir"
```

---

### Task 7: Bookkeeping — 18 node-id + `cache-l1-fingerprint` phải ký lại

**Files:**
- Modify: `_acceptance/cache-l1-fingerprint/contract.md`
- Modify: `STATUS.md`

**Serves:** không eval nào — đây là nghĩa vụ quy trình. **independent: false** (chạy cuối).

- [ ] **Step 1: Xác nhận cả 18 node-id chọn đúng một test**

```bash
grep -oE 'tests/test_(node_cache|fingerprint|fingerprint_vectors)\.py::[a-z_0-9]+' _acceptance/config.yaml | while read -r nid; do
  n=$(cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q --collect-only "$nid" 2>/dev/null | grep -cE '::')
  [ "$n" = "1" ] || echo "BAD $nid -> $n"
done; echo "(im lặng = mọi node-id đúng)"
pnpm vitest run src/lib/task/engine-delegate.test.ts -t 'tenant sentinel' 2>&1 | tail -2
pnpm vitest run src/lib/task/engine-delegate.test.ts -t 'data_dir is stable' 2>&1 | tail -2
```
Expected: không dòng `BAD` nào; hai lệnh vitest mỗi lệnh 1 passed.

- [ ] **Step 2: Ghi nghĩa vụ ký lại của L1 vào contract của nó**

Thêm một bullet vào `## Known limits` của `_acceptance/cache-l1-fingerprint/contract.md`:

```
- **`KEY_SCHEMA_VERSION` bump 1 → 2 ở lát L2 (2026-07-30).** L2 thêm `tenant` và
  `abiDigest` vào khoá, tức sửa `fingerprint.py` — file feature này sở hữu. Theo luật
  per-file (AGENTS.md §2) chữ ký Cổng 2 của feature này **không carry-forward được**:
  nó phải verify lại và ký lại cùng PR của L2. Vector của AC-13 đã sinh lại dưới `v = 2`,
  và guard AC-14 tự chứng minh cú bump bằng cách chạy lại node-id của AC-13 trong subprocess.
```

- [ ] **Step 3: Cập nhật `STATUS.md`**

Đổi dòng hàng đợi `1.1-L2` thành `◐ đang bay — nhánh feat/cache-l2-store, ký Cổng 1 30/07`, và thêm vào mục "Đang dở" một dòng nói L2 đang bay + `cache-l1-fingerprint` sẽ phải ký lại.

- [ ] **Step 4: Commit**

```bash
git add _acceptance/cache-l1-fingerprint/contract.md STATUS.md
git commit -m "chore(acceptance): record that L2's key bump costs L1 a fresh signature"
```

---

## Self-Review

**Spec coverage.** 16 tiêu chí ↔ task: AC-1/3/6/7/8/9/10/13 → Task 3 · AC-2/11/15 → Task 4 · AC-4/5/12 → Task 2 · AC-14 → Task 5 (engine) + Task 6 (TS) · AC-16 → Task 5 (backend-effect) + Task 6 (TS). Phần khoá của AC-8/9/13 nằm ở Task 1. Design §1–§9 đều có task; §7 (amendment spec) **cố ý không có task** — nó là việc của một PR docs riêng sau khi L2 merge, vì sửa spec giữa lúc chưa biết code có đúng như thiết kế hay không là viết ngược.

**Placeholder scan.** Không có TBD/TODO. Một chỗ duy nhất nhờ người thực thi tự tra tên biến: Task 3 Step 4 (`data_dir_resolved`) — cố ý, vì đoán sai tên biến trong plan tệ hơn là nói rõ phải đọc code quanh dòng 229-290.

**Type consistency.** `node_fingerprint(..., tenant, abi_digest, ...)` khai ở Task 1, dùng ở Task 3 Step 5 đúng tên. `NodeCache.get/put(key, ..., store)` khai ở Task 2, dùng ở Task 3 đúng chữ ký. `TIER_A_SLOTS` là `frozenset` ở cả hai chỗ. `tenantFor` / `dataRootFor` khai ở Task 6 Step 3, dùng ở Task 6 Step 1 đúng tên.

**Ba mutation bắt buộc, đừng bỏ:** Task 2 Step 5 (blob trong entry → AC-12 đỏ) · Task 3 Step 8 (bỏ allowlist → AC-7 đỏ; bỏ tenant → AC-9 đỏ) · **Task 4 Step 5** (`business_input={}` → AC-15 đỏ). Cái thứ ba quan trọng nhất: AC-15 là tiêu chí mang tên spec cha và là thứ vòng phản biện xếp P0, nên nó phải chứng minh được nó đỏ khi bug quay lại.
