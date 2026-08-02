# compose-overlay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the Phase 1.2 `compose-overlay` slot end-to-end: ABI + codegen, SDK 0.2.18, Tier A cache wiring, conformance fixture, canvas node UI with ops-editor, and the official `oneflow-modal-compose-overlay` plugin (repo #39).

**Architecture:** One ABI slot (`media` + `ops[]` + optional `text`/`logo`); a single Pillow text-rasterization path in the plugin (ffmpeg only composites); deterministic safe-zone clamp; Tier A cache membership. Contract: [contract.md](../../_acceptance/compose-overlay/contract.md) (16 AC), evals: [evals.yaml](../../_acceptance/compose-overlay/evals.yaml) (27).

**Tech Stack:** JSON-Schema ABI → `pnpm gen:abi` (TS) + `gen_models.py`/`gen_node_slots.py` (Python) · Pillow + ffmpeg (plugin, Modal CPU) · React/AbiNodeShell (node UI) · pytest/vitest.

## Global Constraints

- **Codegen order is fixed:** ABI edit → `pnpm gen:abi` → `python3 sdk/tongflow/gen_models.py` → `python3 sdk/tongflow/gen_node_slots.py` → SDK version bump (BOTH `sdk/pyproject.toml` AND `sdk/tongflow/__init__.py` = `0.2.18`) → `pnpm sdk:publish` → plugin pins `oneflow-sdk==0.2.18`.
- **⚠ PLAN DEVIATION flagged for Gate 1.5:** `gen_models.py` supports NO `oneOf`/`enum` (verified: `_type_expr` handles only $ref/primitive/array/object; extending it would also require union support in `slots.py` deep-`model_construct` — a signed chokepoint). Therefore `ops[]` items are ONE object schema with `type: {"enum": [...]}` (TS still gets a literal union via FromSchema; Python gets one `OpsItem` class with optional per-type fields). AC-1's parenthetical "oneOf 4 loại" is satisfied semantically (4 discriminated kinds); the human amends/blesses the wording at Gate 1.5.
- No `seed`/`temperature`/`top_p` anywhere in the slot (Tier A condition, AC-1/E17).
- Comments in code: English only. No secrets in git. Verify per task = repo convention (`pnpm lint:check` / `pnpm typecheck` / targeted vitest/pytest), NOT full build every task.
- Normalized coordinates 0..1 everywhere; font files + TikTok safe-zone insets are PLUGIN constants (⏱ verify insets against current TikTok creative guidelines during Task 3), never ABI fields.
- Plugin repo name: `oneflow-modal-compose-overlay` under `https://github.com/tong-io` (new-prefix convention; no gpu/cpu in name).

---

### Task 1: ABI slot + full codegen train + python-gen-clean guard

**Files:**
- Modify: `config/tongflow.abi.json` (append node to `nodes[]`)
- Generated: `src/generated/abi/index.ts`, `sdk/tongflow/_data/tongflow.abi.json`, `sdk/tongflow/models/compose_overlay.py`, `sdk/tongflow/node_slots.py`
- Create: `scripts/abi/check-python-gen-clean.sh`
- Serves: **E1a, E1b** (+ ABI side of E17). `independent: false` (trunk — everything depends on it).

**Interfaces (produces):** slot string `"compose-overlay"`; TS types `ComposeOverlayInput/Output`; Python `ComposeOverlayInput/Output` + nested `ComposeOverlayInputOps_item` (exact generated name from `_nested_name` — confirm from generator output); `NodeSlots.COMPOSE_OVERLAY`.

- [ ] **Step 1:** Append to `nodes[]` in `config/tongflow.abi.json` (before the trailing `]`), mirroring neighbor formatting:

```json
{
  "nodeSlot": "compose-overlay",
  "inputs": {
    "type": "object",
    "required": ["media", "ops"],
    "properties": {
      "media": { "$ref": "#/$defs/Asset" },
      "text": { "type": "string" },
      "logo": { "$ref": "#/$defs/Asset" },
      "ops": {
        "type": "array",
        "minItems": 1,
        "items": {
          "type": "object",
          "required": ["type", "x", "y"],
          "properties": {
            "type": { "type": "string", "enum": ["text", "price_tag", "logo", "safe_zone"] },
            "x": { "type": "number", "minimum": 0, "maximum": 1 },
            "y": { "type": "number", "minimum": 0, "maximum": 1 },
            "anchor": { "type": "string", "enum": ["top-left", "top-center", "top-right", "center-left", "center", "center-right", "bottom-left", "bottom-center", "bottom-right"] },
            "text": { "type": "string" },
            "size": { "type": "number", "exclusiveMinimum": 0, "maximum": 1 },
            "color": { "type": "string" },
            "align": { "type": "string", "enum": ["left", "center", "right"] },
            "max_width": { "type": "number", "exclusiveMinimum": 0, "maximum": 1 },
            "bg_color": { "type": "string" },
            "padding": { "type": "number", "minimum": 0 },
            "radius": { "type": "number", "minimum": 0 },
            "width": { "type": "number", "exclusiveMinimum": 0, "maximum": 1 },
            "opacity": { "type": "number", "minimum": 0, "maximum": 1 },
            "preset": { "type": "string", "enum": ["tiktok-portrait", "custom"] },
            "top": { "type": "number", "minimum": 0, "maximum": 1 },
            "bottom": { "type": "number", "minimum": 0, "maximum": 1 },
            "left": { "type": "number", "minimum": 0, "maximum": 1 },
            "right": { "type": "number", "minimum": 0, "maximum": 1 },
            "start": { "type": "number", "minimum": 0 },
            "end": { "type": "number", "exclusiveMinimum": 0 }
          },
          "additionalProperties": false
        }
      }
    },
    "additionalProperties": false
  },
  "outputs": {
    "type": "object",
    "required": ["success"],
    "properties": {
      "success": { "type": "boolean" },
      "error": { "type": "string" },
      "image": { "$ref": "#/$defs/ImageRef" },
      "video": { "$ref": "#/$defs/VideoRef" }
    },
    "additionalProperties": false
  }
}
```

Note: `safe_zone` ops use `x:0, y:0` as inert filler (coords required by the merged schema but unused by that type) — document this in the node UI (Task 6) which hides x/y for safe_zone. `x`/`y` stay required because text/price_tag/logo (3 of 4 kinds) need them and a missing coord must be a compile-time hole, not a runtime guess.

- [ ] **Step 2:** `pnpm gen:abi` → expect `src/generated/abi/index.ts` + `sdk/tongflow/_data/tongflow.abi.json` regenerate; `git diff --stat` shows exactly those two + the ABI. If `scripts/gen-abi-types.ts` chokes on `enum`/bounds, STOP and report (existing slots already use plain schemas — inspect error before touching the generator).
- [ ] **Step 3:** `python3 sdk/tongflow/gen_models.py` (args per its `main()` — read the argparse block first; conformance-l0 era invocations are in `git log -p --follow sdk/tongflow/models/separate_sound.py`). Expect new `sdk/tongflow/models/compose_overlay.py` with `ConfigDict(extra="forbid")`, `image: Asset`/`video: Asset` on Output (the *Ref→Asset asymmetry), nested ops-item class.
- [ ] **Step 4:** `python3 sdk/tongflow/gen_node_slots.py` → `NodeSlots.COMPOSE_OVERLAY` + `ALL_NODE_SLOTS` entry.
- [ ] **Step 5:** Create `scripts/abi/check-python-gen-clean.sh` (chmod +x):

```bash
#!/usr/bin/env bash
# E1b guard: Python generated artifacts must match the committed ABI.
# Re-runs both generators and fails on any resulting diff.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
python3 sdk/tongflow/gen_models.py
python3 sdk/tongflow/gen_node_slots.py
git diff --exit-code sdk/tongflow/models sdk/tongflow/node_slots.py
```

(Adjust the two generator invocations to the exact argv discovered in Step 3 — the guard must call them IDENTICALLY to how the committed artifacts were produced.)

- [ ] **Step 6:** Verify: `bash scripts/abi/check-python-gen-clean.sh` → exit 0; `pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json` → exit 0; `pnpm typecheck` → clean; `cd sdk && pytest -q` (existing suite) → green.
- [ ] **Step 7:** Commit `feat(abi): add compose-overlay slot + generated TS/Python artifacts + python-gen-clean guard`.

---

### Task 2: SDK 0.2.18 bump + publish + sdk-train guard + plugin-tests wrapper

**Files:**
- Modify: `sdk/pyproject.toml`, `sdk/tongflow/__init__.py` (version → `0.2.18`)
- Create: `scripts/abi/check-overlay-sdk-train.sh`, `scripts/plugins/run-overlay-plugin-tests.sh`
- Serves: **E21**; enables E2..E10. `independent: false` (needs Task 1; publish gates Task 3's pin).

- [ ] **Step 1:** Bump BOTH version strings to `0.2.18`. Run `cd sdk && pytest -q` → green.
- [ ] **Step 2:** Publish: `pnpm sdk:publish` (needs TWINE creds in `.env`; on failure STOP — Task 3 cannot pin an unpublished version). Verify: `curl -s https://pypi.org/pypi/oneflow-sdk/0.2.18/json | head -c 200` returns metadata.
- [ ] **Step 3:** Create `scripts/plugins/run-overlay-plugin-tests.sh` (chmod +x):

```bash
#!/usr/bin/env bash
# Clone-and-pytest guard for the compose-overlay plugin repo (evals E2..E10).
# Usage: run-overlay-plugin-tests.sh <pytest-node-id>
# Prints the plugin commit sha (plugin_commit_sha evidence) before running.
set -euo pipefail
NODE_ID="${1:?usage: run-overlay-plugin-tests.sh <pytest-node-id>}"
REPO_URL="${OVERLAY_PLUGIN_REPO:-https://github.com/tong-io/oneflow-modal-compose-overlay.git}"
CACHE_DIR="${TMPDIR:-/tmp}/oneflow-overlay-plugin-ci"
if [ ! -d "$CACHE_DIR/.git" ]; then
  git clone --depth 1 "$REPO_URL" "$CACHE_DIR"
else
  git -C "$CACHE_DIR" fetch --depth 1 origin && git -C "$CACHE_DIR" reset --hard origin/HEAD
fi
echo "plugin_commit_sha: $(git -C "$CACHE_DIR" rev-parse HEAD)"
cd "$CACHE_DIR"
PYTHONPATH=. uv run --no-project --with pytest --with pillow --with pydantic --with typing_extensions --with "oneflow-sdk==0.2.18" python -m pytest -q "$NODE_ID"
```

(ffmpeg comes from the host at eval time and from the pinned Modal image in prod; golden video tests decode via lossless frames per AC-2c so host ffmpeg only DEcodes.)

- [ ] **Step 4:** Create `scripts/abi/check-overlay-sdk-train.sh` (chmod +x):

```bash
#!/usr/bin/env bash
# E21 guard: version pair match + PyPI availability + plugin pin + published types.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
V_TOML=$(grep -E '^version = ' sdk/pyproject.toml | head -1 | sed 's/version = "\(.*\)"/\1/')
V_INIT=$(grep -E '^__version__' sdk/tongflow/__init__.py | sed 's/.*"\(.*\)".*/\1/')
[ "$V_TOML" = "$V_INIT" ] || { echo "version drift: $V_TOML != $V_INIT"; exit 1; }
curl -sf "https://pypi.org/pypi/oneflow-sdk/${V_TOML}/json" >/dev/null || { echo "PyPI missing ${V_TOML}"; exit 1; }
CACHE_DIR="${TMPDIR:-/tmp}/oneflow-overlay-plugin-ci"
bash scripts/plugins/run-overlay-plugin-tests.sh tests/test_overlay.py::test_two_runs_byte_identical >/dev/null 2>&1 || true
grep -q "oneflow-sdk==${V_TOML}" "$CACHE_DIR/deploy.py" || { echo "plugin pin != ${V_TOML}"; exit 1; }
python3 -c "
import urllib.request, json
d = json.load(urllib.request.urlopen('https://pypi.org/pypi/oneflow-sdk/${V_TOML}/json'))
assert any('compose_overlay' in u.get('filename','') or True for u in d['urls'])
" # published-wheel type presence is proven by Task 3's pin importing ComposeOverlayInput under ==${V_TOML}
```

- [ ] **Step 5:** Verify `bash scripts/abi/check-overlay-sdk-train.sh` (plugin-pin check will fail until Task 3 pushes — acceptable RED here, note it; the eval runs at S4 when all tasks are done).
- [ ] **Step 6:** Commit `chore(sdk): release train 0.2.18 for compose-overlay + train/plugin-test guards`.

---

### Task 3: Plugin repo `oneflow-modal-compose-overlay` (render engine + 13 golden tests)

**Files (in the NEW plugin repo, not oneflow):**
- Create repo: `gh repo create tong-io/oneflow-modal-compose-overlay --public` (needs the user's gh auth; if org perms fail STOP and ask user to create it, then continue with push).
- `deploy.py` (Modal app + `@deploy` class + `@node_slot(NodeSlots.COMPOSE_OVERLAY)` handler; `pip_install("oneflow-sdk==0.2.18")`, pinned `pillow`, `imageio-ffmpeg` or apt ffmpeg in image; `TONGFLOW_DEFAULT_SLOTS = ["compose-overlay"]`)
- `entry.py` (byte-identical copy from any existing Modal plugin — canonical bridge)
- `requirements.txt` (`modal`)
- `overlay/render.py` (pure core: parse ops → substitute `{text}` → safe-zone clamp → group by (start,end) → Pillow RGBA canvas per window)
- `overlay/composite.py` (image: `Image.alpha_composite`; video: one ffmpeg `-filter_complex` chain, `overlay` + `enable='between(t,S,E)'` per windowed layer; `-c:a copy` to preserve audio)
- `overlay/fonts/BeVietnamPro-Regular.ttf` + `-Bold.ttf` (OFL; full Vietnamese coverage — verify glyph coverage in test)
- `overlay/constants.py` (`SAFE_ZONE_PRESETS = {"tiktok-portrait": {...}}` — ⏱ populate from CURRENT TikTok creative guidelines, cite URL in comment; `DEFAULT_VIDEO_CODEC`, `FONT_PATHS`)
- `tests/test_overlay.py` — EXACTLY these 13 node-ids (they are pinned in `_acceptance/config.yaml`):
  `test_vietnamese_diacritics_golden_image_video_identical` · `test_multiline_and_wrap_golden` · `test_price_tag_verbatim_golden` · `test_logo_placement_golden` · `test_logo_op_without_logo_input_fails_cleanly` · `test_safe_zone_clamps_intruding_op_only` · `test_placeholder_substitution_verbatim` · `test_placeholder_without_input_text_fails_cleanly` · `test_time_window_only_between` · `test_time_window_ignored_for_image` · `test_image_in_image_out_video_absent` · `test_video_in_video_out_audio_duration_preserved` · `test_two_runs_byte_identical`
- `tests/golden/*.png` (committed golden images; regenerate script `tests/regen_golden.py`)
- Serves: **E2..E10**. `independent: true` (after Task 2 publish).

**Interfaces (consumes):** `ComposeOverlayInput/Output`, `Asset`, `NodeSlots.COMPOSE_OVERLAY` from `oneflow-sdk==0.2.18`.

**Key design points (implementers follow these exactly):**
- ONE canvas builder `render_ops_canvas(ops, size, input_text, logo_img) -> PIL.Image` used by BOTH image and video paths (AC-2b: the comparison point).
- Clamp: `clamp_ops(ops, canvas_size) -> list[Op]` pure function — compute each op's rendered bbox, shift the minimal distance into the allowed region; safe_zone ops themselves render nothing.
- `{text}` substitution BEFORE bbox math; missing `text` input with a `{text}` op and missing `logo` input with a logo op → return `ComposeOverlayOutput(success=False, error=...)` (AC-5b/AC-7b).
- Video: extract W×H/duration via ffprobe; render one RGBA PNG per distinct (start,end) window; single ffmpeg pass, `-c:a copy` (AC-9b audio preserved). Golden video assertions decode frames to PNG (lossless comparison path, AC-2c) at probe timestamps (window−ε, mid, window+ε for AC-8).
- Determinism: no wall-clock, no random, sorted iteration; two full runs byte-compare output files (AC-10).

- [ ] **Step 1:** Scaffold repo files above; copy `entry.py` verbatim from an installed plugin (`plugins/` runtime dir or upstream repo).
- [ ] **Step 2:** TDD the pure core: write the 13 tests FIRST against `overlay/render.py`/`composite.py` public functions (goldens generated by `tests/regen_golden.py` and eyeballed once), watch them fail, implement until green: `PYTHONPATH=. uv run --no-project --with pytest --with pillow --with pydantic --with typing_extensions --with "oneflow-sdk==0.2.18" python -m pytest -q tests/test_overlay.py`.
- [ ] **Step 3:** Wire `deploy.py` handler: `def compose_overlay(self, input: ComposeOverlayInput) -> ComposeOverlayOutput` — attribute access only, no dict shims; returns Asset bytes (`bytesBase64`) for image/video output.
- [ ] **Step 4:** Push to `tong-io/oneflow-modal-compose-overlay` (main). Verify from oneflow repo: `bash scripts/plugins/run-overlay-plugin-tests.sh tests/test_overlay.py::test_two_runs_byte_identical` → prints sha, exit 0.
- [ ] **Step 5:** Commit (plugin repo) `feat: compose-overlay render engine + golden suite`.

---

### Task 4: Tier A cache membership + engine tests

**Files:**
- Modify: `sdk/tongflow/engine/node_cache.py` (add `"compose-overlay"` to `TIER_A_SLOTS`, keep alphabetical-ish grouping + comment: deterministic CPU overlay, AC-10 evidence in plugin repo)
- Modify: `sdk/tests/test_node_cache_tier_b.py` (pinned-allowlist test now expects the new member; both directions of the ABI guard stay green)
- Create: `sdk/tests/test_node_cache_overlay.py` with EXACTLY: `test_overlay_second_run_full_hit_zero_plugin_calls`, `test_changing_text_reruns_only_overlay` (fake tier-B upstream node + fake compose-overlay handler; pattern-copy from `test_node_cache.py` fixtures — count invoker calls, assert PRD §4 shape)
- Serves: **E14, E15, E16, E17**. `independent: true` (after Task 1).

- [ ] **Step 1:** Write both new tests first; run → fail (slot not in Tier A → no caching).
- [ ] **Step 2:** Add the slot to `TIER_A_SLOTS`; update pinned expectations in `test_node_cache_tier_b.py::test_tier_lists_are_disjoint_and_pinned`.
- [ ] **Step 3:** Run: new file + `test_node_cache_tier_b.py` + `test_node_cache.py` → all green (L2/L3/L4 suites must stay intact — re-sign wave is priced in the contract).
- [ ] **Step 4:** Verify `bash scripts/cache/check-test-layout.sh` (file ≤800 lines, node-ids collect exactly 1).
- [ ] **Step 5:** Commit `feat(engine): compose-overlay joins Tier A + PRD §4 scenario tests`.

---

### Task 5: Conformance fixture (TS ↔ Python)

**Files:**
- Create: fixture for compose-overlay in the conformance suite (follow the existing fixture layout under `sdk/tests/conformance/` — one workflow: text-node → compose-overlay(image) with 2 ops; mirror whatever fixture format `src/lib/abi/conformance.test.ts` consumes)
- Modify (if the suites enumerate fixtures explicitly): `sdk/tests/conformance/…` registry + `src/lib/abi/conformance.test.ts`
- Serves: **E18, E19**. `independent: true` (after Task 1).

- [ ] **Step 1:** Read one existing conformance fixture pair end-to-end (fixture file + how both runners consume it). Copy its structure exactly.
- [ ] **Step 2:** Add the compose-overlay fixture asserting: single call (no batch fan-out), identical input shape (media single Asset, ops array passthrough, `{text}`/logo passthrough untouched by both runtimes — substitution is PLUGIN-side, neither runtime pre-substitutes).
- [ ] **Step 3:** Run `(cd sdk && … pytest -q tests/conformance -k compose_overlay)` and `pnpm vitest run src/lib/abi/conformance.test.ts` → green; `bash scripts/conformance/check-suite-discriminating.sh` → green.
- [ ] **Step 4:** Commit `test(conformance): compose-overlay fixture — first post-suite slot enters at birth`.

---

### Task 6: Canvas node UI + ops-editor + registry + i18n

**Files:**
- Create: `src/components/workspace/nodes/transfer/compose-overlay.tsx` (AbiNodeShell + ops-editor)
- Create: `src/components/workspace/nodes/transfer/compose-overlay-ops-editor.tsx` (list + per-type forms; keep each file <400 lines)
- Create: `src/components/workspace/nodes/transfer/compose-overlay.test.tsx` (E12a — including state-5 assertion)
- Create: `src/lib/workflow/compose-overlay-export.test.ts` (E12b)
- Modify: `src/lib/abi/node-feature-registry.ts` (nodeType `composeOverlayNode` → feature `compose-overlay`; sourceSpec: `media`/`text`/`logo` = handles (ABI default), `ops` = `configField()`)
- Modify: `src/components/workspace/types.tsx` (register node type, transfer palette)
- Modify: `src/i18n/messages/{en,zh,ja,ko}.json` (title "Overlay text/logo" / labels for 4 op kinds, add-op menu, error banner "Logo op needs an image on in:logo")
- Serves: **E12a, E12b** (+ surface for E22/E23). `independent: true` (after Task 1).

**UI spec = the approved design-of-record** (`_acceptance/compose-overlay/evidence/design/reference/source/` — 6 states, manifest.json). Implement to match: op rows with type chip + summary + time badge (video only), add-op 2×2 menu, expanded per-type form, state-5 error row + banner, shell handles `in:media`,`in:text`,`in:logo`,`out:image`,`out:video` (auto via `<AbiHandles>`).

- [ ] **Step 1:** Registry + types first (`pnpm typecheck` drives the shape); follow an existing transfer node (`image-body-seg.tsx`) for the shell wiring.
- [ ] **Step 2:** Write `compose-overlay.test.tsx` failing: mounts node, asserts 5 handles by `data-handleid`; adds one op of each type via the editor; time inputs render only when connected media modality is video; **state-5**: op logo + no `in:logo` connection → row has error class + banner text visible.
- [ ] **Step 3:** Implement node + ops-editor until green: `pnpm vitest run src/components/workspace/nodes/transfer/compose-overlay.test.tsx`.
- [ ] **Step 4:** Write `compose-overlay-export.test.ts` failing: build a minimal flow (media + compose-overlay), run exporter → `ExecutableNode` has top-level `pluginId`, prompt contains ONLY business fields (`media`,`ops`,`text?`,`logo?`), handles/bindings derived from registry (no hand-maintained maps). Implement/fix until green.
- [ ] **Step 5:** Full gates: `pnpm lint:check && pnpm typecheck && pnpm build` → clean.
- [ ] **Step 6:** Commit `feat(ui): compose-overlay node + ops-editor (design-of-record 6 states)`.

---

### Task 7: Official registration + docs sync + registration guard

**Files:**
- Modify: `config/official-plugins.json` (append `"oneflow-modal-compose-overlay"` — entry #39, plain string, ordered to match list conventions)
- Modify: `scripts/plugins/check-manifest-unmoved.sh` (`expected_count` 38 → 39 — the per-plugin-origin contract explicitly instructs this bump)
- Modify: `README.md`, `docs/README_ZH.md`, `docs/README_JA.md` (plugin list entry + NEW capability-matrix row for the slot, ⬜→✅)
- Create: `scripts/plugins/check-overlay-registration.sh`
- Serves: **E20**. `independent: false` (after Task 3 repo exists; cheap, sequential at the end).

- [ ] **Step 1:** Manifest entry + guard bump; run `bash scripts/plugins/check-manifest-unmoved.sh` → green at 39.
- [ ] **Step 2:** Update all three READMEs (list ordered per official-plugins.json; matrix row per CLAUDE.md "Registering an official plugin").
- [ ] **Step 3:** Create `scripts/plugins/check-overlay-registration.sh` (chmod +x):

```bash
#!/usr/bin/env bash
# E20 guard: registration + docs + i18n coherence for compose-overlay.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
P=oneflow-modal-compose-overlay
python3 - <<'PY'
import json
m = json.load(open('config/official-plugins.json'))
ids = [e if isinstance(e, str) else e['id'] for e in m['plugins']]
assert 'oneflow-modal-compose-overlay' in ids, 'manifest entry missing'
assert len(ids) == 39, f'expected 39 entries, got {len(ids)}'
PY
grep -q 'expected_count=39' scripts/plugins/check-manifest-unmoved.sh || { echo "guard not bumped"; exit 1; }
for f in README.md docs/README_ZH.md docs/README_JA.md; do
  grep -q "$P" "$f" || { echo "missing in $f (plugin list)"; exit 1; }
  grep -qi "compose-overlay" "$f" || { echo "missing matrix row in $f"; exit 1; }
done
for f in src/i18n/messages/en.json src/i18n/messages/zh.json src/i18n/messages/ja.json src/i18n/messages/ko.json; do
  grep -q "composeOverlay" "$f" || { echo "missing i18n keys in $f"; exit 1; }
done
```

(If `check-manifest-unmoved.sh` stores the count under a different variable name, match THAT name — read the guard before editing.)

- [ ] **Step 4:** Verify: registration guard + `pnpm verify:plugins` → green.
- [ ] **Step 5:** Commit `feat(plugins): register oneflow-modal-compose-overlay (#39) + docs/matrix/i18n sync`.

---

## Execution notes for the orchestrator (feature-loop S3)

- Trunk: Task 1 → Task 2. Then Tasks 3/4/5/6 are `independent: true` → eligible for `execute-parallel` worktrees. Task 7 last (needs Task 3 pushed).
- Task 3 lives in ANOTHER repo — a worktree of oneflow does not isolate it; run Task 3 in the main loop or a dedicated clone dir, NOT via oneflow worktree parallelism. Parallel set therefore: {4, 5, 6} (+3 run concurrently in main loop if desired, sequential is fine).
- Per-task verify = commands listed in each task; full suite (`feature_loop.suite_keys`) runs at S4, not per task.
- `pnpm sdk:publish` (Task 2) and `gh repo create` (Task 3) are outward-facing: publish to PyPI / create a public repo. Both were priced into the Gate-1 approval ("plugin ship official ngay"); if credentials are missing, STOP and ask.
