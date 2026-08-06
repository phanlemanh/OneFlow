# local-cpu-plugins — Design (2026-08-05)

First engineering step of [ADR-0011](../../adr/0011-local-first-execution.md): move the
two CPU-only plugins on skill #1's critical path off Modal and onto the machine that is
already running them.

Sub-project **S2** of the local-first decomposition agreed with Manh on 2026-08-05.
S1 (the ADR) is done; S3–S6 are named in "Out of scope" and stay unstarted.

## What triggered this

Surveying all 38 installed plugins to answer "can we call the OpenAI API directly instead
of Modal" turned up three measured facts:

1. **Five Modal plugins request `gpu=NONE`** — `ffmpeg`, `pyscenedetect`, `crawl4ai`,
   `scrapling`, `docling`. They pay cloud latency, cold start and a Modal account
   dependency for work a laptop does natively. `tongflow-modal-ffmpeg`'s own
   `plugin.json` says it outright: *"No model weights — pure media processing."*
2. **Execution is already local.** [`runners/generic.ts`](../../../src/lib/plugin-executor/runners/generic.ts)
   spawns each plugin's `entry.py` as a subprocess; the Modal plugins are bridges out
   from there. Nothing in the executor needs rebuilding.
3. **The seam for per-plugin environments already exists.** `ensurePluginPython(pluginId,
   pluginDir)` takes the plugin id and returns a python path, so isolating environments
   is a change wholly inside `plugin-python-env.server.ts` — `generic.ts` (a t3 path) is
   untouched.

## Decisions locked at brainstorm (with Manh, 2026-08-05)

1. **Scope = `ffmpeg` + `pyscenedetect` only.** Seven slots, all on skill #1's chain.
   Manh first chose all five `gpu=NONE` plugins, then narrowed once the evidence showed
   `scrapling`'s image runs `scrapling install` (downloads browsers) and `docling`'s runs
   `docling-tools models download` (downloads model weights). Those two plus `crawl4ai`
   are heavy despite `gpu=NONE`, and `scrapling`/`crawl4ai` share the `LINK` slot — so
   they move together, to S6, by the API route.
2. **Migration shape = replace, not coexist** (approach A of three offered). The manifest
   entry swaps; the Modal version leaves the official list. Rejected coexistence because
   the fallback it buys is a fallback *to the thing ADR-0011 just removed*, and because
   it is not even fully available: `crawl4ai` and `docling` claim their slot's default
   upstream, where we cannot edit it.
3. **Per-plugin venv, for every plugin** (not a hybrid opt-in flag). Isolation is a
   requirement once the user's machine is the substrate, not a luxury.
4. **No automatic fallback to Modal** on local failure. Fail loudly with a fix.
5. **Tier T2.** `src/lib/plugins/**` is not in `risk_tiers.t3_paths`, and the executor
   itself is not touched. (An earlier statement in this session called it T3 — wrong.)

## Architecture

No new plugin kind is invented. A local plugin uses the **existing API-plugin shape**,
which is already a local plugin that happens to call HTTP:

```
stdin  {nodeSlot, prompt}  →  entry.py  →  stdout {success, ...}
```

`entry.py` holds a `_SLOT_HANDLERS` map, turns any exception into
`{success: false, error}`, and exits 0/1. Compare the two shapes on disk:

| | Modal plugin | API plugin | Local plugin (this design) |
|---|---|---|---|
| Files | `deploy.py`, `download.py`, `entry.py`, `requirements.txt`, `plugin.json` | `entry.py`, `plugin.json`, README | same as API plugin |
| Slot methods | inside a `@app.cls`, calling helpers | directly in `entry.py` | directly in `entry.py` |
| Required env | `MODAL_TOKEN_ID` + `MODAL_TOKEN_SECRET` | provider key | **none** |

Dropped entirely: `deploy.py`, `download.py`, `import modal`, `MODAL_TOKEN_*`.

## Components

### `oneflow-local-ffmpeg` — 6 slots

`CONCAT_VIDEOS`, `EXTRACT_AUDIO`, `MERGE_VIDEO_AUDIO`, `REMOVE_VIDEO_AUDIO`,
`GET_FIRST_FRAME`, `GET_LAST_FRAME`.

The upstream `deploy.py` already separates six pure helpers (`concat_videos_helper`,
`remove_video_audio_helper`, `merge_av_helper`, `extract_audio_helper`,
`get_first_frame_helper`, `get_last_frame_helper`) *above* the Modal class. They take
`Path` arguments and shell out to ffmpeg; they do not know Modal exists. Porting is a
copy, not a rewrite — which is what makes this sub-project cheap.

Python dependencies: **`moviepy`**. Four of the seven helpers shell out to ffmpeg, but
`concat_videos_helper` (the fallback path), `get_first_frame_helper` and
`get_last_frame_helper` use moviepy's `VideoFileClip` / `concatenate_videoclips`. An
earlier draft of this spec claimed zero dependencies — wrong, corrected here.

A useful side effect: moviepy pulls in `imageio-ffmpeg`, which *is* the resolver's third
rung, so the safety net arrives with a dependency the plugin needs anyway.

### `oneflow-local-pyscenedetect` — 1 slot

`SPLIT_VIDEO`, the first step of skill #1. Python dependency: `scenedetect[opencv]`. The
upstream image also installs `boto3` for the Modal-side S3 upload; the local build drops it.

### `ffmpeg` binary resolution — one rule per repo

```
FFMPEG_BIN (env)  →  ffmpeg on PATH  →  the imageio-ffmpeg wheel
```

System ffmpeg first because its codec and filter coverage is wider; the wheel is the
safety net so a machine with nothing installed still works — the point of local-first.
**Each plugin repo keeps its own copy** (~15 lines), decided with Manh once the plan
showed the two plugins are separate git repositories with no shared file between them.
Genuinely sharing it would mean putting `ffmpeg_bin()` in `sdk/tongflow/`, which is a
t3 path and would escalate this package to T3 plus an SDK release train. The
`sdk-version.sh` lesson from CI-a still holds *within* a repo; across independent
artifacts, duplication is the cheaper correct answer — the same reason
`oneflow-modal-compose-overlay` shares no file with this one. Cost accepted and recorded:
a later change to the resolution order must be made in two places.

All three missing → `{success: false, error}` naming the install command. Never silent.

### Per-plugin virtualenv

`plugin-python-env.server.ts`: `VENV_DIR()` becomes
`<dataDir>/.tongflow/plugin-venv/<pluginId>`. Content-hash install caching stays; the
mutation serialization chain becomes per-venv, so two plugins can provision concurrently.

The file's own header documents the assumption this breaks — *"those entries are thin
adapters (the heavy compute runs in the backend / Modal image), so they share one managed
venv… keep local requirements thin; heavy/pinned deps belong in the remote image."* Once
there is no remote image, that premise is gone and one shared venv becomes a place for
version conflicts that `pip check` only *warns* about, so they would surface at runtime
as wrong behaviour rather than at install time as an error.

Cost accepted: one `tongflow` + `pydantic` copy per venv, and a slower first run.

## Four coupled constants

The place this package is most likely to break, flagged in CLAUDE.md:

1. `config/official-plugins.json` — 2 plain strings become 2 `{id, origin: phanlemanh}`
   entries ⇒ **36 plain + 3 origin**.
2. `scripts/plugins/check-manifest-unmoved.sh` — the 38/1 counts become 36/3.
3. **All three READMEs** (EN/ZH/JA) — official plugin list + capability matrix.
4. `CLAUDE.md` §"Registering an official plugin" — re-describe the guard.

## Error handling

- ffmpeg not found by any of the three routes → error naming the fix.
- Unreadable or corrupt input → `success:false` carrying a trimmed ffmpeg stderr.
- `EXTRACT_AUDIO` on a video with no audio track → explicit error, never a zero-byte file.
- **No Modal fallback.** ADR-0011 removed that route; keeping it would keep the
  dependency this package exists to remove.

## How it will be proven

The "wire ↔ teeth" axis from `ci-vitest-sdk-pin`: every mechanism gets both a criterion
that it works and a criterion that it fails when broken.

- **Wire** — one eval per slot against a small video fixture committed to the repo,
  asserting checksum / duration / frame count.
- **Teeth** — hide `FFMPEG_BIN` and clear PATH: the plugin must go **red with a message**,
  never green-by-accident.
- **No-Modal** — assert neither plugin imports `modal` and neither `plugin.json` declares
  `MODAL_TOKEN_*`.
- **Venv isolation** — install two plugins with deliberately conflicting pins into their
  own venvs; both must still run. Before the change, `pip check` only warns.
- **Conformance** — each slot runs through both the canvas-TS and engine-Python paths and
  agrees, so the new plugins enter the L0 suite rather than deferring like `batchField`.

## Re-signature cost

Touching `config/official-plugins.json` and `check-manifest-unmoved.sh` forces
**`per-plugin-origin` to re-verify and re-sign** — that guard *is* its AC-6. Touching
`src/lib/plugins/**` stales every feature declaring broad or zero `paths`.

The exact wave is computed by machine at Gate 1, never estimated — the CI-a package
quoted two re-verifies and seven carry-forwards from a real ownership computation and the
gate blocked on exactly that set.

## Out of scope

- `docling`, `crawl4ai`, `scrapling` → **S6**, by the API route, together because the
  last two share the `LINK` slot.
- Desktop app becoming a real local app → **S5**. Today it is a Pake shell pointing at
  `app.tongflow.com`, which local-first eventually contradicts.
- BYO-key onboarding UX → **S4**. The store, API route and settings dialog already exist;
  what is missing is the first-run experience for someone who is not Manh.
- The remaining 26 GPU plugins → sequential, on demand, per ADR-0007.
- Any ABI change. No slot changes shape; this is a change of who executes, not of what.
- G0. This package does not move any of G0's four blockers — it cleans the road to G1.
