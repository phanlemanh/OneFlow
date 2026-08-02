# compose-overlay — Design (2026-08-02)

Phase 1.2 roadmap item ("hạng mục không được cắt thứ hai"): the overlay node that
stamps text / price tags / logos onto an image or video, with a safe-zone
constraint. It is the "tier A" actor of the cache PRD's flagship scenario
(re-price 200 videos → only this node re-runs, ~1–2 s CPU each, zero GPU-seconds).

## Decisions locked at brainstorm (with Manh, 2026-08-02)

1. **Ops v1 = all four**: `text`, `price_tag`, `logo`, `safe_zone` (roadmap wording).
2. **Media v1 = image AND video.**
3. **Plugin ships official immediately**: new repo `oneflow-modal-compose-overlay`
   under the org, registered as the 39th manifest entry.
4. **Safe-zone semantics = placement constraint**: ops that intrude into the
   forbidden margins are deterministically clamped inward (not just a debug guide,
   not a hard failure).
5. **Single text-rasterization path (Approach A)**: Pillow + a bundled
   Vietnamese-complete font renders ALL ops onto one transparent RGBA canvas;
   ffmpeg only composites (`overlay` filter) — it never draws text. Text on image
   and text on video are pixel-identical; diacritics are verified once.
   (Rejected: B — two slots per modality, double surface for no product reason;
   C — ffmpeg drawtext, a second text codepath = diacritics drift risk exactly
   where Gate G1 is strictest.)
6. **v1 includes multi-line text (+ wrap via `max_width`) and per-op time windows**
   (`start`/`end`, video only) — unlocks real-estate/finance verticals
   (addresses, mandatory disclaimers, per-scene labels) and lays the track for
   skill #1 subtitles. Static single-line-only v1 was rejected as too narrow.

## ABI slot `compose-overlay`

Inputs (`additionalProperties: false` everywhere):

- `media` — `$ref Asset`, **required**. Image or video background.
- `ops` — array, **required**, `minItems: 1`. Each item `oneOf` (discriminated by `type`):
  - `text`: `type:"text"`, `text` (string, may contain `\n`; `{text}` placeholder
    substituted verbatim from the top-level `text` input), `x`, `y` (normalized
    0..1), `anchor` (9-value enum, default `top-left`), `size` (fraction of media
    height), `color` (#RRGGBB[AA]), `align` (`left|center|right`), optional
    `max_width` (normalized width → word-wrap), optional `start`, `end` (seconds;
    video only, ignored for images).
  - `price_tag`: everything `text` has, plus `bg_color`, `padding` (fraction of
    font size), `radius` (fraction of box height). Text over a rounded box.
  - `logo`: `type:"logo"`, `x`, `y`, `anchor`, `width` (normalized; height keeps
    aspect), optional `opacity`, `start`, `end`. Bitmap comes from the top-level
    `logo` input (one logo per node in v1).
  - `safe_zone`: `type:"safe_zone"`, `preset` (`"tiktok-portrait" | "custom"`),
    optional `top`/`bottom`/`left`/`right` insets (normalized, used by `custom`;
    preset values are **plugin constants**, verified against current TikTok
    creative guidelines at implementation time — not frozen into the ABI).
    Constraint op: every other op whose rendered bounding box intrudes into a
    forbidden margin is clamped inward. Deterministic; order-independent
    (clamp is a pure function of the final op list).
- `text` — string, optional. Upstream text feed; replaces `{text}` placeholders.
- `logo` — `$ref Asset`, optional. Required at runtime iff any `logo` op exists
  (plugin returns `success:false` with a clear error otherwise).

Outputs: `success` (required), `error`, `image` (`$ref ImageRef`), `video`
(`$ref VideoRef`) — exactly one of image/video is set, matching the input
modality. No `seed`/`temperature`/`top_p` anywhere → Tier A eligible.

ABI hygiene: no font-family field (font = plugin constant), no codec/fps knobs
(plugin constants), single `text` knob (never `texts`).

## Plugin `oneflow-modal-compose-overlay` (new repo, Modal CPU)

- Standard Modal pattern: `@deploy` handler class, `@node_slot(NodeSlots.COMPOSE_OVERLAY)`,
  canonical `entry.py` bridge (byte-identical to other Modal plugins), `modal` in
  its own `requirements.txt`, `TONGFLOW_DEFAULT_SLOTS = ["compose-overlay"]`.
- Render pipeline: parse ops → substitute `{text}` → group ops by
  `(start,end)` window → for each window render one RGBA canvas with Pillow
  (text, price boxes, logo) using the bundled OFL font (Be Vietnam Pro or Noto
  Sans, pinned files, full Vietnamese coverage) → image input: single
  `alpha_composite`; video input: one ffmpeg `-filter_complex` chain of
  `overlay` filters, `enable='between(t,start,end)'` per windowed layer.
- Safe-zone clamp runs before rasterization, pure function, deterministic.
- Determinism: byte-identical re-runs within one plugin rev (Modal image pins
  Pillow/freetype/ffmpeg; fingerprint already includes pluginRev).
- Plugin-repo pytest: golden-image tests (full Vietnamese diacritic pangram,
  price tag, logo placement, clamp cases, `{text}` substitution, time-window
  layer grouping, two-run byte-identity).

## oneflow repo work

1. **ABI + codegen train** (order matters, generators are NOT auto-chained):
   edit `config/tongflow.abi.json` → `pnpm gen:abi` (TS + `_data` copy) →
   `python sdk/tongflow/gen_models.py` → `python sdk/tongflow/gen_node_slots.py`
   → bump `sdk/pyproject.toml` **and** `sdk/tongflow/__init__.py` to 0.2.18 →
   `pnpm sdk:publish` → plugin pins `oneflow-sdk==0.2.18`.
2. **Cache Tier A**: add `"compose-overlay"` to `TIER_A_SLOTS`
   (`sdk/tongflow/engine/node_cache.py`) + update the pinned-allowlist test.
3. **Node UI**: `src/components/workspace/nodes/transfer/compose-overlay.tsx`
   via `AbiNodeShell`/`AbiHandles` (auto handles `in:media`, `in:text`,
   `in:logo`, `out:image`, `out:video`); `ops` declared as `configField()` with a
   dedicated ops-editor panel (add/remove/reorder ops, per-type forms);
   registration in `node-feature-registry.ts`, `types.tsx`; i18n strings
   (en/zh/ja/ko).
4. **Official registration**: 39th entry in `config/official-plugins.json`;
   bump `expected_count` 38→39 in `scripts/plugins/check-manifest-unmoved.sh`
   (per per-plugin-origin contract instructions); update all three READMEs
   (plugin list + capability matrix row for the new slot).

## Surface & state matrix (design lane D2)

Surface touched: **one new canvas node** (`transfer/compose-overlay.tsx`) — the
`BaseNodeShell` chrome (header, plugin select, execute button, loading overlay)
is inherited; the genuinely new UI is the **ops-editor panel** in the node body.
Pinned breakpoint: desktop canvas (node width 256–384 px, capture page 1440);
themes: light primary, dark variant (shell already ships both).

| # | State | What is visible |
|---|-------|-----------------|
| 1 | empty | media chưa nối, ops rỗng — empty-state ops-editor với nút "Thêm op" (4 loại), execute disabled |
| 2 | ops-image | media = ảnh; 4 op rows (text, price_tag, logo, safe_zone) dạng thu gọn; **không** có field giờ |
| 3 | ops-video | media = video; cùng 4 rows; field start/end hiện trên từng op row |
| 4 | op-form | một op text đang mở form: text (multi-line), x/y, anchor, size, color, align, max_width |
| 5 | error | op logo tồn tại nhưng input logo chưa nối — inline error trên row + banner node |
| 6 | running | loading overlay của shell (elapsed + progress label) phủ node |

Design-of-record: `_acceptance/compose-overlay/evidence/design/reference/source/`
(checked-in HTML/CSS, portable-reference path; provenance = content hash).

## Out of scope (v1)

- Animated text / charts (different node family).
- User-selectable fonts (plugin constant only).
- Multiple distinct logos per node.
- Output codec/fps control.
- The two known per-plugin-origin UI gaps (open-repo link, standalone-engine
  origin) — plugin registers as a plain-string entry under the default org, so
  those gaps are not exercised.
- Subtitle *generation* (upstream transcribe-timestamp feeds ops in a later
  skill; this node only renders what it is given).

## Risks

- **Cross-repo seam**: plugin code lives outside oneflow; oneflow evals reach it
  via a clone-and-pytest guard script (network-dependent, same class as the
  `ci_*` evals).
- **Font rasterization drift across environments**: byte-identity is only
  claimed within a pinned environment (Modal image / locked local venv), which
  is exactly the cache's determinism boundary (fingerprint includes pluginRev).
- **SDK publish ordering**: models must be on PyPI before the plugin pin — the
  standing release-train rule.
