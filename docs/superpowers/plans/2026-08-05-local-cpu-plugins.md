# local-cpu-plugins Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Take the seven CPU-only slots on skill #1's critical path off Modal by shipping two local plugins and giving every plugin its own Python environment.

**Architecture:** A local plugin is the existing API-plugin shape — one `entry.py` reading `{nodeSlot, prompt}` from stdin and writing `{success, ...}` to stdout — with the work done in-process instead of over HTTP. The video helpers are copied verbatim from the Modal plugins' `deploy.py`, where they already sit above the Modal class as plain functions. Alongside, `plugin-python-env.server.ts` switches from one shared venv to one venv per plugin id.

**Tech Stack:** Python 3.10+ (plugin entries), `moviepy`, `scenedetect[opencv]`, ffmpeg binary; TypeScript / Node 24 + vitest (the oneflow side); acceptance-gate kit strict/strict.

## Global Constraints

- **Risk tier T2.** Do not touch `risk_tiers.t3_paths`: `config/tongflow.abi.json`, `src/generated/abi/**`, `src/lib/abi/**`, `sdk/**`, `src/db/**`, `src/lib/plugin-executor/**`, `src/lib/workflow/**`, `src/app/api/**`, `scripts/publish-tongflow-pypi.sh`. If a task appears to need one, stop and escalate — the tier changes and the re-sign wave grows.
- **No ABI change.** No slot changes shape. Do not run `pnpm gen:abi`.
- **SDK pin:** `oneflow-sdk==0.2.18` in both plugin repos' `requirements.txt`. Do not bump the SDK in this package.
- **Plugin origin:** `https://github.com/phanlemanh` for both new entries.
- **Code comments in English only** (CLAUDE.md). Plan and spec prose may be Vietnamese; code may not.
- **Branch off `main`**, Conventional Commits, merge commit never squash.
- **Two separate git repositories** are created outside this repo: `oneflow-local-ffmpeg` and `oneflow-local-pyscenedetect`. `plugins/` is gitignored here; nothing in Tasks 2–3 is committed to the oneflow repo.
- **Acceptance gate:** this plan produces the code. The contract + evals (Gate 1) must be approved *before* Task 1 begins, per the repo's strict/strict kit.

---

## File Structure

**Repo `oneflow-local-ffmpeg` (new, under `phanlemanh`)**
- `entry.py` — six slot handlers, the ffmpeg resolver, stdin/stdout dispatch
- `requirements.txt` — `oneflow-sdk==0.2.18`, `moviepy`
- `tongflow.plugin.json` — name/description/icon, `env: []`
- `README.md` — what it does, prerequisites, how to point at a custom ffmpeg
- `tests/test_slots.py` — pytest over a committed 1-second fixture video

**Repo `oneflow-local-pyscenedetect` (new, under `phanlemanh`)**
- Same five files; `entry.py` holds one slot, `requirements.txt` adds `scenedetect[opencv]`

**Repo `oneflow` (this one)**
- Modify `src/lib/plugins/plugin-python-env.server.ts` — per-plugin venv
- Create `src/lib/plugins/plugin-python-env.test.ts` — venv path derivation tests
- Modify `config/official-plugins.json` — 2 string entries → 2 origin entries
- Modify `scripts/plugins/check-manifest-unmoved.sh` — counts 38/1 → 36/3
- Modify `README.md`, `docs/README_ZH.md`, `docs/README_JA.md` — plugin list + capability matrix
- Modify `CLAUDE.md` — §"Registering an official plugin" guard description

---

### Task 1: Per-plugin virtualenv

**Files:**
- Modify: `src/lib/plugins/plugin-python-env.server.ts:26-30,102-118,126-170,214-230`
- Test: `src/lib/plugins/plugin-python-env.test.ts` (create)

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: `ensurePluginPython(pluginId: string, pluginDir: string): Promise<string>` — signature **unchanged**, so `src/lib/plugin-executor/runners/generic.ts` needs no edit. New exported helper `venvDirFor(pluginId: string): string` used only by tests.

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/plugins/plugin-python-env.test.ts
import { describe, expect, it } from "vitest";
import { venvDirFor } from "./plugin-python-env.server";

describe("venvDirFor", () => {
    it("gives each plugin its own directory", () => {
        expect(venvDirFor("oneflow-local-ffmpeg")).not.toBe(
            venvDirFor("oneflow-local-pyscenedetect"),
        );
    });

    it("ends with the plugin id", () => {
        expect(venvDirFor("oneflow-local-ffmpeg").endsWith("oneflow-local-ffmpeg")).toBe(true);
    });

    it("keeps every venv under one parent so eviction can find them", () => {
        const a = venvDirFor("a");
        const b = venvDirFor("b");
        expect(a.slice(0, a.lastIndexOf("a"))).toBe(b.slice(0, b.lastIndexOf("b")));
    });

    it("refuses a plugin id that would escape the parent directory", () => {
        expect(() => venvDirFor("../../etc")).toThrow();
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/lib/plugins/plugin-python-env.test.ts`
Expected: FAIL — `venvDirFor` is not exported.

- [ ] **Step 3: Make the venv path per-plugin**

Replace lines 26-30:

```typescript
const VENV_ROOT = () => join(dataDir(), ".tongflow", "plugin-venv");

/**
 * One virtualenv per plugin id.
 *
 * These entries used to share a single venv on the assumption, documented in
 * this file's header, that they are thin adapters and the heavy compute lives
 * in a remote Modal image. ADR-0011 removes the remote image, so the heavy
 * dependencies land here instead, where `pip check` only *warns* about
 * conflicts — a conflict would surface as wrong behaviour at run time rather
 * than as an error at install time. Isolation is the fix.
 */
export function venvDirFor(pluginId: string): string {
    if (!/^[a-zA-Z0-9._-]+$/.test(pluginId) || pluginId.startsWith(".")) {
        throw new Error(`unsafe plugin id for a venv path: ${pluginId}`);
    }
    return join(VENV_ROOT(), pluginId);
}

const MARKERS_DIR = (pluginId: string) => join(venvDirFor(pluginId), ".markers");

function venvPython(pluginId: string): string {
    const dir = venvDirFor(pluginId);
    return process.platform === "win32"
        ? join(dir, "Scripts", "python.exe")
        : join(dir, "bin", "python");
}
```

- [ ] **Step 4: Thread `pluginId` through the remaining call sites**

Every function that read `VENV_DIR()` or called `venvPython()` now takes `pluginId` as its first parameter: the marker read/write helpers (lines ~102-110), the `pip check` call (~126), the venv creation and SDK install (~137-170). Rename `ensureSharedVenv()` to `ensureVenv(pluginId: string)` and pass `venvDirFor(pluginId)` where it used `VENV_DIR()`.

Replace the single serialization chain (line ~115) with one chain per plugin, so two plugins provision concurrently while pip stays serialized within each venv:

```typescript
// pip is not safe to run concurrently against the SAME environment. Separate
// venvs have no such constraint, so the chain is per plugin id rather than global.
const venvChains = new Map<string, Promise<void>>();

function serialize<T>(pluginId: string, fn: () => Promise<T>): Promise<T> {
    const prev = venvChains.get(pluginId) ?? Promise.resolve();
    const next = prev.then(fn, fn);
    venvChains.set(
        pluginId,
        next.then(
            () => undefined,
            () => undefined,
        ),
    );
    return next;
}
```

And in `ensurePluginPython`:

```typescript
export async function ensurePluginPython(
    pluginId: string,
    pluginDir: string,
): Promise<string> {
    try {
        return await serialize(pluginId, async () => {
            const py = await ensureVenv(pluginId);
            await ensurePluginRequirements(pluginId, pluginDir, py);
            return py;
        });
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        logger.warn(
            `[plugin-env] provisioning failed (${msg}); falling back to plain python`,
        );
        return resolvePythonLite();
    }
}
```

- [ ] **Step 5: Run the test and the whole suite**

Run: `pnpm vitest run src/lib/plugins/plugin-python-env.test.ts && pnpm test`
Expected: the four new tests PASS; the existing 413 still PASS.

- [ ] **Step 6: Run typecheck and lint**

Run: `pnpm typecheck && pnpm lint:check`
Expected: both clean.

- [ ] **Step 7: Prove it end to end on a real plugin**

Run: `pnpm verify:plugins`
Then: `ls "$(node -e 'console.log(require("node:os").homedir())')"/.tongflow/plugin-venv` (or the scoped data dir the logs name).
Expected: one directory per plugin exercised, not a single shared one.

- [ ] **Step 8: Commit**

```bash
git add src/lib/plugins/plugin-python-env.server.ts src/lib/plugins/plugin-python-env.test.ts
git commit -m "feat(plugins): one virtualenv per plugin id

ADR-0011 moves heavy dependencies from a remote Modal image onto the user's
machine, where a shared venv turns version conflicts into wrong runtime
behaviour — pip check only warns. Each plugin id now gets its own venv, and
the pip serialization chain is per id so two plugins can provision at once.

ensurePluginPython keeps its signature, so the executor is untouched."
```

---

### Task 2: `oneflow-local-ffmpeg`

**Files (new repository, not this repo):**
- Create: `entry.py`, `requirements.txt`, `tongflow.plugin.json`, `README.md`, `tests/test_slots.py`, `tests/fixtures/tiny.mp4`

**Interfaces:**
- Consumes: nothing from Task 1 (separate artifact).
- Produces: a plugin serving `NodeSlots.CONCAT_VIDEOS`, `EXTRACT_AUDIO`, `MERGE_VIDEO_AUDIO`, `REMOVE_VIDEO_AUDIO`, `GET_FIRST_FRAME`, `GET_LAST_FRAME`, and declaring `TONGFLOW_DEFAULT_SLOTS` for all six. Task 4 registers its id `oneflow-local-ffmpeg`.

- [ ] **Step 1: Create the repo and the fixture**

```bash
gh repo create phanlemanh/oneflow-local-ffmpeg --public --clone
cd oneflow-local-ffmpeg && mkdir -p tests/fixtures
ffmpeg -y -f lavfi -i testsrc=size=320x240:rate=10:duration=1 \
       -f lavfi -i sine=frequency=440:duration=1 \
       -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest tests/fixtures/tiny.mp4
```

A generated fixture keeps the repo small and makes the test reproducible for anyone.

- [ ] **Step 2: Write the failing test**

```python
# tests/test_slots.py
import json, subprocess, sys, base64
from pathlib import Path

FIXTURE = Path(__file__).parent / "fixtures" / "tiny.mp4"
ENTRY = Path(__file__).parent.parent / "entry.py"

def run_slot(slot: str, prompt: dict) -> dict:
    proc = subprocess.run(
        [sys.executable, str(ENTRY)],
        input=json.dumps({"nodeSlot": slot, "prompt": prompt}),
        capture_output=True, text=True,
    )
    return json.loads(proc.stdout)

def video_asset() -> dict:
    return {"bytesBase64": base64.b64encode(FIXTURE.read_bytes()).decode(), "mime": "video/mp4"}

def test_extract_audio_returns_an_audio_asset():
    out = run_slot("extract-audio", {"video": video_asset()})
    assert out["success"] is True
    assert out["audio"]["bytesBase64"]

def test_get_first_frame_returns_an_image():
    out = run_slot("get-first-frame", {"video": video_asset()})
    assert out["success"] is True
    assert out["image"]["bytesBase64"]

def test_missing_video_fails_cleanly():
    out = run_slot("extract-audio", {})
    assert out["success"] is False
    assert "video" in out["error"].lower()

def test_unknown_slot_fails_cleanly():
    out = run_slot("not-a-slot", {})
    assert out["success"] is False
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `python -m pytest tests/test_slots.py -v`
Expected: FAIL — `entry.py` does not exist.

- [ ] **Step 4: Write the ffmpeg resolver**

```python
# entry.py — resolver section
import os, shutil, subprocess
from functools import lru_cache

@lru_cache(maxsize=1)
def ffmpeg_bin() -> str:
    """Resolve the ffmpeg binary: explicit override, then PATH, then the wheel.

    System ffmpeg is preferred because its codec and filter coverage is wider
    than the bundled build; the wheel is the safety net so a machine with
    nothing installed still works, which is the point of running locally.

    Kept in this repo rather than shared: the two local plugins are separate
    artifacts with no file between them, and sharing would mean putting this in
    the SDK, a t3 path. A change to this order must be made in both repos.
    """
    override = os.environ.get("FFMPEG_BIN")
    if override:
        if not shutil.which(override) and not os.path.isfile(override):
            raise RuntimeError(f"FFMPEG_BIN points at {override!r}, which is not executable")
        return override
    found = shutil.which("ffmpeg")
    if found:
        return found
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception as e:
        raise RuntimeError(
            "no ffmpeg available: set FFMPEG_BIN, install ffmpeg "
            "(macOS: brew install ffmpeg), or reinstall this plugin's requirements"
        ) from e
```

- [ ] **Step 5: Port the helpers and slot handlers**

Copy the seven helpers from `plugins/tongflow-modal-ffmpeg/deploy.py` verbatim, with one edit each: the literal `"ffmpeg"` in every `subprocess.run([...])` becomes `ffmpeg_bin()`. Then copy the six slot method bodies from the `@app.cls` class, dropping `self` and the `@modal.method()` decorator, keeping `@node_slot(...)` exactly as it is. Add at module level:

```python
TONGFLOW_DEFAULT_SLOTS = [
    "concat-videos", "extract-audio", "merge-video-audio",
    "remove-video-audio", "get-first-frame", "get-last-frame",
]
```

Then the dispatch block, copied in shape from `tongflow-api-openai/entry.py`:

```python
_SLOT_HANDLERS: Dict[str, Any] = {
    NodeSlots.CONCAT_VIDEOS: concat_videos,
    NodeSlots.EXTRACT_AUDIO: extract_audio,
    NodeSlots.MERGE_VIDEO_AUDIO: merge_video_audio,
    NodeSlots.REMOVE_VIDEO_AUDIO: remove_video_audio,
    NodeSlots.GET_FIRST_FRAME: get_first_frame,
    NodeSlots.GET_LAST_FRAME: get_last_frame,
}

def _write(out: Dict[str, Any]) -> None:
    sys.stdout.write(json.dumps(out))

def main() -> int:
    try:
        raw = sys.stdin.read()
        req = json.loads(raw) if raw.strip() else {}
        prompt = req.get("prompt") if isinstance(req, dict) else {}
        if not isinstance(prompt, dict):
            prompt = {}
        slot = str(req.get("nodeSlot") or "") if isinstance(req, dict) else ""
        handler = _SLOT_HANDLERS.get(slot)
        if handler is None:
            raise RuntimeError(f"unsupported nodeSlot: {slot!r}")
        out = handler(prompt)
    except Exception as e:  # noqa: BLE001 — surfaced as ABI failure
        _write({"success": False, "error": str(e)})
        return 1
    _write(out)
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
```

- [ ] **Step 6: Write the manifest and requirements**

```json
{
    "plugin": {
        "name": "FFmpeg (local)",
        "description": "Media transcoding, muxing, and frame/track extraction with FFmpeg, running on this machine. No model weights, no cloud account.",
        "icon": "/plugins/oneflow-local-ffmpeg.svg"
    },
    "env": [
        {
            "key": "FFMPEG_BIN",
            "description": "Path to a specific ffmpeg binary. Defaults to ffmpeg on PATH, then the bundled imageio-ffmpeg build."
        }
    ]
}
```

```
oneflow-sdk==0.2.18
moviepy
```

Note `FFMPEG_BIN` is **not** `required` — the whole point is that the plugin works with nothing configured.

- [ ] **Step 7: Run the tests**

Run: `pip install -r requirements.txt pytest && python -m pytest tests/ -v`
Expected: all four PASS.

- [ ] **Step 8: Prove the resolver has teeth**

Run: `FFMPEG_BIN=/nonexistent python -m pytest tests/test_slots.py::test_extract_audio_returns_an_audio_asset -v`
Expected: FAIL, and the failure message names `FFMPEG_BIN`. This confirms the plugin reports a missing binary instead of silently finding another one.

- [ ] **Step 9: Commit and push**

```bash
git add -A
git commit -m "feat: local ffmpeg plugin, six slots, no Modal

Helpers ported verbatim from tongflow-modal-ffmpeg's deploy.py, where they
already sat above the Modal class as plain functions; the only edit is that
the literal 'ffmpeg' becomes the resolved binary. Requires no account and no
configuration: FFMPEG_BIN, then PATH, then the imageio-ffmpeg wheel."
git push
```

---

### Task 3: `oneflow-local-pyscenedetect`

**Files (new repository, not this repo):**
- Create: `entry.py`, `requirements.txt`, `tongflow.plugin.json`, `README.md`, `tests/test_split.py`, `tests/fixtures/scenes.mp4`

**Interfaces:**
- Consumes: nothing. The resolver from Task 2 is **re-typed here, not imported** — separate repos, decision recorded in the spec.
- Produces: a plugin serving `NodeSlots.SPLIT_VIDEO` and declaring `TONGFLOW_DEFAULT_SLOTS = ["split-video"]`. Task 4 registers `oneflow-local-pyscenedetect`.

- [ ] **Step 1: Create the repo and a two-scene fixture**

```bash
gh repo create phanlemanh/oneflow-local-pyscenedetect --public --clone
cd oneflow-local-pyscenedetect && mkdir -p tests/fixtures
ffmpeg -y -f lavfi -i "color=red:size=320x240:rate=10:duration=1" -c:v libx264 -pix_fmt yuv420p /tmp/a.mp4
ffmpeg -y -f lavfi -i "color=blue:size=320x240:rate=10:duration=1" -c:v libx264 -pix_fmt yuv420p /tmp/b.mp4
printf "file '/tmp/a.mp4'\nfile '/tmp/b.mp4'\n" > /tmp/list.txt
ffmpeg -y -f concat -safe 0 -i /tmp/list.txt -c copy tests/fixtures/scenes.mp4
```

A hard red→blue cut gives the detector something unambiguous to find.

- [ ] **Step 2: Write the failing test**

```python
# tests/test_split.py
import json, subprocess, sys, base64
from pathlib import Path

FIXTURE = Path(__file__).parent / "fixtures" / "scenes.mp4"
ENTRY = Path(__file__).parent.parent / "entry.py"

def run_slot(prompt: dict) -> dict:
    proc = subprocess.run(
        [sys.executable, str(ENTRY)],
        input=json.dumps({"nodeSlot": "split-video", "prompt": prompt}),
        capture_output=True, text=True,
    )
    return json.loads(proc.stdout)

def test_split_finds_both_scenes():
    out = run_slot({"video": {
        "bytesBase64": base64.b64encode(FIXTURE.read_bytes()).decode(),
        "mime": "video/mp4",
    }})
    assert out["success"] is True
    assert len(out["videos"]) >= 2

def test_missing_video_fails_cleanly():
    out = run_slot({})
    assert out["success"] is False
    assert "video" in out["error"].lower()
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `python -m pytest tests/test_split.py -v`
Expected: FAIL — no `entry.py`.

- [ ] **Step 4: Write `entry.py`**

Copy the `ffmpeg_bin()` resolver from Task 2 Step 4 verbatim (including its docstring, which explains why it is duplicated). Port the split logic from `plugins/tongflow-modal-pyscenedetect/deploy.py`, dropping the `boto3` import and any S3 upload path — those exist only for the Modal side. Prepend the resolved binary's directory to `PATH` once at start-up so `scenedetect`'s own ffmpeg lookup finds the same binary this plugin resolved:

```python
os.environ["PATH"] = os.path.dirname(ffmpeg_bin()) + os.pathsep + os.environ.get("PATH", "")
```

Add the same `_SLOT_HANDLERS` / `_write` / `main()` block as Task 2 Step 5, with one entry: `NodeSlots.SPLIT_VIDEO: split_video`. Add `TONGFLOW_DEFAULT_SLOTS = ["split-video"]`.

- [ ] **Step 5: Write the manifest and requirements**

`tongflow.plugin.json` mirrors Task 2 Step 6 with name `"PySceneDetect (local)"`, icon `/plugins/oneflow-local-pyscenedetect.svg`, and the same optional `FFMPEG_BIN` entry.

```
oneflow-sdk==0.2.18
scenedetect[opencv]
imageio-ffmpeg
```

`imageio-ffmpeg` is explicit here because there is no moviepy to bring it along.

- [ ] **Step 6: Run the tests**

Run: `pip install -r requirements.txt pytest && python -m pytest tests/ -v`
Expected: both PASS.

- [ ] **Step 7: Commit and push**

```bash
git add -A
git commit -m "feat: local PySceneDetect plugin, split-video, no Modal

Split logic ported from tongflow-modal-pyscenedetect minus the boto3 S3 path,
which only existed for the Modal side. The resolved ffmpeg directory is
prepended to PATH so scenedetect's own lookup finds the same binary."
git push
```

---

### Task 4: Register the two plugins

**Files:**
- Modify: `config/official-plugins.json`
- Modify: `scripts/plugins/check-manifest-unmoved.sh:12-30`

**Interfaces:**
- Consumes: the two repository names published in Tasks 2 and 3.
- Produces: a manifest of 36 plain strings + 3 origin entries. Task 5 documents it.

- [ ] **Step 1: Swap the two manifest entries**

Remove the plain strings `"tongflow-modal-ffmpeg"` and `"tongflow-modal-pyscenedetect"`; add in their positions:

```json
{ "id": "oneflow-local-ffmpeg", "origin": "https://github.com/phanlemanh" },
{ "id": "oneflow-local-pyscenedetect", "origin": "https://github.com/phanlemanh" }
```

- [ ] **Step 2: Run the guard to watch it fail**

Run: `bash scripts/plugins/check-manifest-unmoved.sh`
Expected: FAIL — `expected 38 plain string entries, got 36`. This is the guard doing its job; it is a snapshot of two earlier PRs, exactly as CLAUDE.md describes.

- [ ] **Step 3: Update the guard's counts and identities**

In the `node -e` block: `strings.length !== 38` becomes `36`, `objects.length !== 1` becomes `3`, and the single-identity check becomes a set check over all three ids, each requiring `origin === "https://github.com/phanlemanh"`. Update the header comment to record the third edition and its date.

- [ ] **Step 4: Run the guard and the scanner**

Run: `bash scripts/plugins/check-manifest-unmoved.sh && pnpm verify:plugins`
Expected: both exit 0; the scanner reports no default-slot clash (neither upstream plugin claimed these seven slots).

- [ ] **Step 5: Confirm the arithmetic independently**

Run:
```bash
python3 -c "
import json;p=json.load(open('config/official-plugins.json'))['plugins']
s=sum(1 for x in p if isinstance(x,str));print(f'{s} plain + {len(p)-s} origin = {len(p)}')"
```
Expected: `36 plain + 3 origin = 39`.

- [ ] **Step 6: Commit**

```bash
git add config/official-plugins.json scripts/plugins/check-manifest-unmoved.sh
git commit -m "feat(plugins): register the two local CPU plugins

Replaces tongflow-modal-ffmpeg and tongflow-modal-pyscenedetect rather than
sitting beside them: the fallback coexistence would buy is a fallback to what
ADR-0011 removed. Manifest becomes 36 plain strings + 3 origin entries, and
the snapshot guard is re-cut to match — its third edition."
```

---

### Task 5: Documentation

**Files:**
- Modify: `README.md`, `docs/README_ZH.md`, `docs/README_JA.md` — official plugin list + capability matrix
- Modify: `CLAUDE.md` — §"Registering an official plugin"

**Interfaces:**
- Consumes: the manifest shape from Task 4.
- Produces: nothing code depends on. `scripts/plugins/check-prefix-docs.sh` and `check-manifest-doc-synced.sh` both read these.

- [ ] **Step 1: Update all three READMEs**

In each, replace the `tongflow-modal-ffmpeg` and `tongflow-modal-pyscenedetect` rows with the two local ids, linking to `github.com/phanlemanh/...`, keeping the order aligned with `official-plugins.json`. The capability matrix does not change state — the seven slots stay ✅, they are simply served locally now.

- [ ] **Step 2: Update CLAUDE.md**

Rewrite the "fourth coupled constant" bullet: the guard now asserts **36 plain strings under the upstream org plus exactly three origin entries** (compose-overlay, local-ffmpeg, local-pyscenedetect), and note it is now a snapshot of three PRs.

- [ ] **Step 3: Run the doc guards**

Run: `bash scripts/plugins/check-manifest-doc-synced.sh && bash scripts/plugins/check-prefix-docs.sh`
Expected: both exit 0.

- [ ] **Step 4: Run the full standing suite**

Run: `pnpm lint:check && pnpm typecheck && pnpm test && pnpm build`
Expected: all clean.

- [ ] **Step 5: Commit**

```bash
git add README.md docs/README_ZH.md docs/README_JA.md CLAUDE.md
git commit -m "docs: record the two local plugins in all three READMEs and CLAUDE.md

The capability matrix is unchanged — the seven slots were already available;
they are simply served locally now. The manifest guard description becomes a
snapshot of three PRs rather than two."
```

---

## Self-Review

**Spec coverage.** Architecture → Task 2/3 dispatch blocks. Both components → Tasks 2 and 3. ffmpeg resolution → Task 2 Step 4, duplicated in Task 3 Step 4 with the reason in the docstring. Per-plugin venv → Task 1. Four coupled constants → Tasks 4 and 5. Error handling → Task 2 Steps 2 and 8, Task 3 Step 2. Proof axis "wire ↔ teeth" → Task 2 Steps 7/8 and Task 1 Steps 5/7. **One spec item is deliberately not a task:** the conformance check that each slot agrees across canvas-TS and engine-Python belongs to the acceptance evals, not to implementation — it is asserted by an eval, and no production code produces it.

**Placeholder scan.** No TBD/TODO. Every code step carries the code. Task 2 Step 5 and Task 3 Step 4 say "copy verbatim from `<exact path>`" rather than reproducing several hundred lines of upstream helpers — the source file and the single required edit are both named exactly.

**Type consistency.** `ffmpeg_bin()` is the name in Task 2 Step 4, Task 2 Step 5 and Task 3 Step 4. `venvDirFor(pluginId)` matches between Task 1 Steps 1 and 3. `ensurePluginPython(pluginId, pluginDir)` keeps its existing signature, which is what leaves `generic.ts` untouched and the tier at T2. Slot string constants (`"extract-audio"`, `"split-video"`) match the `NodeSlots` idents used in the handler maps.
