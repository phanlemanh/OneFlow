<div align="center">
  <img src="public/logo.svg" alt="OneFlow" width="320" />

  <h1>OneFlow : An Open-Source Multi-Modal GenAI Workflow Studio</h1>
  <p>
    <a href="https://github.com/phanlemanh/OneFlow/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-AGPL--3.0-blue.svg" alt="License" /></a>
    <a href="https://github.com/phanlemanh/OneFlow/actions/workflows/ci.yml"><img src="https://github.com/phanlemanh/OneFlow/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
    <a href="https://pypi.org/project/oneflow-sdk/"><img src="https://img.shields.io/pypi/v/oneflow-sdk?logo=pypi&logoColor=white&label=Python%20SDK" alt="PyPI" /></a>
  </p>
  <p>
    <video src="https://github.com/user-attachments/assets/407a7e7b-2d44-4c90-8016-33d0a9f5e7d5"></video>
  <p>
  <p>
    <strong>English</strong> · <a href="docs/README_ZH.md">简体中文</a> · <a href="docs/README_JA.md">日本語</a>
  </p>
</div>

> **Fork notice:** OneFlow is a personal/internal fork of [TongFlow](https://github.com/tong-io/tongflow) (copyright tong-io, AGPL-3.0). It is modified and maintained independently and is not affiliated with or endorsed by tong-io. See [`NOTICE.md`](NOTICE.md) for details.








## How To Start

OneFlow runs on your own machine — self-host it and bring your own API keys.
Two ways to start:

- **[Run with Docker](#run-with-docker)** — one command, no Node/Python setup.
- **[Run from source](#run-from-source)** — for development.

Then follow [Self-host setup](#self-host-setup-plugins--credentials) to install
plugins and add credentials.

> **About the desktop app.** This fork does **not** publish desktop installers.
> The `TongFlow-*.dmg` / `.msi` builds on upstream's
> [Releases](https://github.com/tong-io/tongflow/releases/latest) page are a thin
> shell around upstream's hosted studio at `app.tongflow.com` — they sign you in
> to tong-io's service, not to anything this fork runs. A local desktop app for
> OneFlow is a planned item, tracked as S5 in the
> [roadmap](docs/roadmap.md); until it lands, self-hosting is the supported path.

## Core Concept

- **All models**: AI models can be thought of as a **modality transform** (e.g. LLMs are text→text, image models are text→image, speech models are text→audio, and so on). OneFlow wraps each capability as a node.

- **All modalities**: OneFlow supports almost every modality and file format that people actually ship over the web.

- **Low barrier, high ceiling**: no complex AI parameters to learn, no manual node connecting; just three operations — **add**, **transform**, and **combine** — to arrange ideas freely. And by orchestrating AI models freely, you can generate unique creations and works of your own.

- **Open ecosystem**: OneFlow's plugin-based design lets every platform package its own independent plugins, and we provide at least one official implementation plugin for each capability node. The core stays small, the ecosystem stays open.

## What’s Defined

> ✅ = available out of the box with an official plugin · ⬜ = not usable yet — either the canvas node or the official plugin is still missing (planned).

### Add

- ✅ **Text input**: type text and add a text node.
- ✅ **Add image**: pick a local file and add an image node.
- ✅ **Add photo**: capture with the device camera and add an image node.
- ✅ **Add sketch**: draw on the canvas and add an image node.
- ✅ **Add audio**: pick a local audio file and add an audio node.
- ✅ **Record audio**: record with the mic and add an audio node.
- ✅ **Add video**: pick a local video file and add a video node.
- ✅ **Record video**: record with the camera and add a video node.
- ✅ **Add document**: pick a local file and add a document node.
- ✅ **Add URL**: fetch a page from a link and add text, image, audio, or video nodes.
- ✅ **Add 3D model**: choose a local model file and add a 3D model node.

### Transform

#### Text

- ✅ **Generate / rewrite**: create or edit copy from a prompt.
- ⬜ **Read numbers aloud (Vietnamese)**: turn numbers, prices, dates and abbreviations into spoken Vietnamese — required before text-to-speech.

#### Image

- ✅ **Image generation**: images from text.
- ✅ **Image editing**: inpaint, edit, or redraw with instructions.
- ✅ **Image understanding**: captions, Q&A, or descriptions from an image.
- ✅ **Image upscaling**: enlarge for sharper detail.
- ✅ **Pose detection**: 308-keypoint whole-body skeleton overlay (body, hands, face).
- ✅ **Body-part segmentation**: 29-class human parsing overlay.
- ✅ **Surface normals**: per-pixel normal map — human-centric or full scene.
- ✅ **Matting**: cut the human or salient foreground out as a transparent PNG.

#### Video

- ✅ **Video generation**: video from text.
- ✅ **Image-to-video**: animate a still into motion.
- ✅ **First/last-frame video**: two key images to interpolate a clip.
- ✅ **Images → video**: multi-image reference fusion — several reference images plus text into a new video.
- ✅ **Video understanding**: summaries or descriptions from video.
- ✅ **Video upscaling**: higher-resolution output.
- ✅ **Extract first / last frame**: grab a frame as an image.
- ✅ **Video editing**: edit a video from a text instruction.
- ✅ **Subtitle removal**: clean subtitles from a video.
- ✅ **Watermark removal**: remove watermarks from a video.

#### Audio

- ✅ **Music generation**: music from text, with optional reference-audio conditioning.
- ✅ **Audio understanding**: describe a clip (music, speech, or ambient sound) in text.
- ✅ **Music repaint**: regenerate a chosen time range of a song.
- ✅ **Music cover**: restyle a song via a caption and/or a reference track.
- ✅ **Add track / complete arrangement**: generate one new stem over a mix, or fill in missing tracks.
- ✅ **Music brief**: one-sentence idea → lyrics, style tags, BPM, key, and duration.
- ✅ **Speech synthesis**: text-to-speech — preset style, voice clone (reference audio), or instruction-driven.
- ✅ **Speech recognition**: transcribe speech from audio or video.
- ✅ **Noise reduction**: denoise audio.
- ⬜ **Speaker diarization**: separate audio by speaker.
- ⬜ **Voice / timbre replacement**: replace or clone a voice with a reference sample.
- ⬜ **Emotion / style-referenced speech**: text plus a reference clip → speech in that voice and emotion.
- ⬜ **Timestamped transcription**: transcript with per-sentence time codes — the plugin ships it, the canvas node is still missing.
- ✅ **Multi-track / vocal-accompaniment separation**: isolate vocals, drums, bass, guitar, and 8 more stems.
- ✅ **Open-vocabulary sound separation**: describe any sound in words ("dog barking") and split the audio into that sound and everything else.

### Combine

- ✅ **Image fusion**: blend or edit multiple references into one image.
- ✅ **Lip sync**: audio + video → video (lip-sync); also audio + image → video and audio + text → video variants.
- ✅ **Character swap**: video + reference (scene blend / character replacement), Animate Mix-style generation.
- ✅ **Motion transfer**: video + reference (motion / retarget), Animate Move-style generation.
- ✅ **Combine text**: merge multiple text nodes into one.
- ✅ **Text / price-tag / logo overlay**: stamp text, price tags, and logos onto an image or video — multi-line Vietnamese text, per-op time windows, TikTok safe-zone clamp.

### Other

- ✅ **Image → 3D**: single-view 3D model from an image.
- ✅ **Video → motion capture**: monocular video to skeletal animation (body + fingers + face channels, GLB).
- ✅ **Document → text**: extract plain text from documents.
- ✅ **Link → text**: turn page content into text.

### Helpers

- ✅ **Concatenate clips**: join multiple videos end to end.
- ✅ **Mux audio + video**: merge into one file.
- ✅ **Split by shots**: cut a long video into segments by scene.
- ✅ **Split video & audio**: demux a video into separate video and audio tracks.
- ✅ **Extract audio track**: pull audio into its own asset.
- ✅ **Split long text**: break a long passage into chunks.
- ✅ **Merge / tidy text blocks**: combine segments (use the auto-merge option).
- ✅ **Filter or drop clips**: drop unwanted clips by rule or selection.
- ✅ **Arrange & batch groups**: group and arrange text/clip batches for downstream processing.

## Official plugins

> The official GPU/CPU plugins currently run on [Modal](https://modal.com) — up to **$30/month** of free GPU compute (H100/A100, etc.). See [Self-host setup](#self-host-setup-plugins--credentials) for the `MODAL_TOKEN_*` setup. Any other platform can publish its own plugins the same way. The **local** plugins below need none of that.

### API plugins

- [tongflow-api-openrouter-free](https://github.com/tong-io/tongflow-api-openrouter-free) — default `gen_text` route via OpenRouter's free models
- [tongflow-api-gemini](https://github.com/tong-io/tongflow-api-gemini) — Google Gemini for `gen_text` and image generation / editing / fusion (Nano Banana)
- [oneflow-api-openai](https://github.com/phanlemanh/oneflow-api-openai) — OpenAI for `gen_text`, image generation / editing / fusion (`gpt-image-2`), and transcription (`gpt-transcribe`)
- [tongflow-api-deepseek](https://github.com/tong-io/tongflow-api-deepseek) — DeepSeek V4 (`flash` / `pro`, with a streaming **thinking** bubble) for `gen_text` / text tools
- [tongflow-api-bytedance](https://github.com/tong-io/tongflow-api-bytedance) — Volcengine Ark (Doubao Seedance 2.0) for text/image/audio → video
- [tongflow-api-apimart](https://github.com/tong-io/tongflow-api-apimart) — APIMart gateway with a per-node **model picker**: image gen/edit (Z-Image, Seedream, Nano Banana, GPT-Image), text/image → video (Kling, VEO3, Sora2, Seedance), `gen_text` (GPT-5, Claude, Gemini), Whisper transcription and TTS
- [tongflow-api-agnes](https://github.com/tong-io/tongflow-api-agnes) — Agnes AI gateway: `gen_text` / text tools / image understanding (`agnes-2.0-flash`), image generation / editing / fusion (`agnes-image-2.x-flash`), and text / image / first-last-frame → video (`agnes-video-v2.0`)

### Local plugins

> These run **on your own machine** — no cloud account, no GPU, no round-trip. See [ADR-0011](docs/adr/0011-local-first-execution.md).

- [oneflow-api-ffmpeg](https://github.com/phanlemanh/oneflow-api-ffmpeg) — transcoding, muxing, media pipelines
- [oneflow-api-pyscenedetect](https://github.com/phanlemanh/oneflow-api-pyscenedetect) — shot-boundary detection for splitting clips

### GPU/CPU plugins

- [tongflow-modal-z-image](https://github.com/tong-io/tongflow-modal-z-image) — Z-Image text-to-image
- [tongflow-modal-ernie-image](https://github.com/tong-io/tongflow-modal-ernie-image) — ERNIE Image text-to-image (alternative)
- [tongflow-modal-flux2-klein9b](https://github.com/tong-io/tongflow-modal-flux2-klein9b) — FLUX.2 Klein 9B multi-reference fusion / image editing
- [tongflow-modal-boogu](https://github.com/tong-io/tongflow-modal-boogu) — Boogu-Image-0.1 (fp8) text-to-image (dense bilingual text) & single-reference image editing
- [tongflow-modal-ltx](https://github.com/tong-io/tongflow-modal-ltx) — LTX-2.3 text / image-to-video
- [tongflow-modal-fastwan](https://github.com/tong-io/tongflow-modal-fastwan) — FastWan-QAD-FP8 fast text-to-video (3-step distilled Wan2.1-1.3B)
- [tongflow-modal-infinitetalk](https://github.com/tong-io/tongflow-modal-infinitetalk) — InfiniteTalk audio-driven lip-sync (audio + image / video → talking-head video)
- [tongflow-modal-wan-animate](https://github.com/tong-io/tongflow-modal-wan-animate) — Wan-Animate character swap & motion transfer (video + reference)
- [tongflow-modal-scail2](https://github.com/tong-io/tongflow-modal-scail2) — SCAIL-2 controlled character animation (image + driving video; same two slots as wan-animate)
- [tongflow-modal-bernini](https://github.com/tong-io/tongflow-modal-bernini) — Bernini-R 1.3B unified video renderer (text/image → image/video, video editing, subtitle / watermark removal)
- [tongflow-modal-sam3](https://github.com/tong-io/tongflow-modal-sam3) — SAM 3 / SAM 3.1 text-guided matting: cut every instance of a described concept out of an image (transparent PNG) or track it through a video (green-screen matte)
- [tongflow-modal-triposplat](https://github.com/tong-io/tongflow-modal-triposplat) — TripoSplat single image → 3D Gaussian splat
- [tongflow-modal-sam-3d-objects](https://github.com/tong-io/tongflow-modal-sam-3d-objects) — SAM 3D Objects single image → 3D Gaussian splat of the foreground object (auto mask, robust to occlusion/clutter; alternative)
- [tongflow-modal-sam-3d-body](https://github.com/tong-io/tongflow-modal-sam-3d-body) — SAM 3D Body single image → full-body 3D human mesh GLB (multi-person, MHR rig; alternative), and **video motion capture** (per-frame MHR regression → animated character GLB; alternative)
- [tongflow-modal-sapiens2](https://github.com/tong-io/tongflow-modal-sapiens2) — Sapiens2 (Meta) human suite: pose detection, body-part segmentation, surface normals, human matting, image → 3D point cloud, and **video motion capture** (geometric engine: keypoints + pointmap → animated MHR character GLB)
- [tongflow-modal-sensenova-vision](https://github.com/tong-io/tongflow-modal-sensenova-vision) — SenseNova-Vision (SenseTime) unified vision model: image understanding / visual QA, detection & OCR structured text, full-scene surface normals, salient-object matting, and human pose overlay (alternative)
- [tongflow-modal-seedvr2](https://github.com/tong-io/tongflow-modal-seedvr2) — SeedVR2 image / video super-resolution
- [tongflow-modal-gemma4](https://github.com/tong-io/tongflow-modal-gemma4) — Gemma-4 multimodal text (image / video understanding)
- [tongflow-modal-qwen3asr](https://github.com/tong-io/tongflow-modal-qwen3asr) — Qwen3 speech recognition
- [tongflow-modal-qwen3tts](https://github.com/tong-io/tongflow-modal-qwen3tts) — Qwen3 text-to-speech
- [tongflow-modal-whisper](https://github.com/tong-io/tongflow-modal-whisper) — Whisper speech recognition with timestamps (alternative)
- [tongflow-modal-ace-step](https://github.com/tong-io/tongflow-modal-ace-step) — ACE-Step 1.5 music suite: text-to-music (sft / base / turbo selectable), repaint, cover, stem extraction, add-track, arrangement completion, music brief, and music understanding
- [tongflow-modal-levo](https://github.com/tong-io/tongflow-modal-levo) — LeVo 2 / SongGeneration text-to-music (multilingual, commercial-grade)
- [tongflow-modal-sam-audio](https://github.com/tong-io/tongflow-modal-sam-audio) — SAM-Audio text-prompted sound separation: noise reduction, vocal isolation, and free-text stem extraction ("the piano in the background")
- [tongflow-modal-docling](https://github.com/tong-io/tongflow-modal-docling) — Docling document → text
- [tongflow-modal-paddle](https://github.com/tong-io/tongflow-modal-paddle) — PaddleOCR document → text
- [tongflow-modal-unlimited-ocr](https://github.com/tong-io/tongflow-modal-unlimited-ocr) — Unlimited-OCR long-horizon document / PDF → text
- [tongflow-modal-crawl4ai](https://github.com/tong-io/tongflow-modal-crawl4ai) — Crawl4AI URL / link → text
- [tongflow-modal-scrapling](https://github.com/tong-io/tongflow-modal-scrapling) — Scrapling stealth-browser URL / link → text
- [oneflow-modal-compose-overlay](https://github.com/phanlemanh/oneflow-modal-compose-overlay) — Text / price-tag / logo overlay onto image or video (single Pillow text path, Vietnamese-complete font, TikTok safe-zone constraint)

## Run from source

```bash
pnpm install
pnpm plugins:install   # clone official plugins into plugins/
pnpm start:prod        # builds once, then serves at http://localhost:3000
```

Requires **Node** (with `pnpm`) and a **Python 3.10+** interpreter on your `PATH` (set `PYTHON` to point at a specific one). Plugins run as local Python processes; OneFlow provisions an isolated venv for them automatically and installs each plugin's `requirements.txt` on first use — no manual Python setup.

Open **`http://localhost:3000`** and the canvas is live. Then follow [Self-host setup](#self-host-setup-plugins--credentials) (credentials go in the in-app **Settings** dialog, or a project `.env`).

## Run with Docker

The self-host image `ghcr.io/phanlemanh/oneflow` is published to GHCR by the release workflow when a `vX.Y.Z` tag is cut. **Until the first tagged release exists the image is not on GHCR yet** — build it from this repo instead (no Node/Python/pnpm setup required either way):

```bash
git clone https://github.com/phanlemanh/OneFlow.git && cd OneFlow
docker compose up -d --build
```

Once a release has been published you can pull instead of building:

```bash
docker run -d -p 3000:3000 \
  -v oneflow-data:/data -v oneflow-plugins:/plugins \
  ghcr.io/phanlemanh/oneflow:latest
```

Then open **`http://localhost:3000`**. This repo's [`docker-compose.yml`](docker-compose.yml) declares both `image:` and `build: .`, so `docker compose up -d` builds when the image is not available locally and pulls once it is published.

**Data & credentials.** Everything writable lives in the `/data` volume (SQLite db, uploads, settings). API keys are optional — set them in the in-app **Settings** dialog, or pass them at launch (`-e OPENROUTER_API_KEY=…`); supported keys: `OPENROUTER_API_KEY`, `GEMINI_API_KEY`, `OPENAI_API_KEY`, `MODAL_TOKEN_ID` / `MODAL_TOKEN_SECRET`, `ANTHROPIC_API_KEY` (powers the Director agent — see below).

**Plugins.** The image ships no plugins — install them from the in-app plugin manager (first install needs network access to GitHub). On first run, a plugin provisions **its own** Python venv under `/data/.tongflow/plugin-venv/<pluginId>` (installs the SDK + the plugin's `requirements.txt` from PyPI), so the first run is slower and needs network. One venv per plugin means two plugins can pin conflicting versions of the same package without one silently overwriting the other. Modal-backed plugins additionally need a Modal token; the local plugins need none.

## Self-host setup (plugins & credentials)

A self-hosted OneFlow ships with no plugins pre-installed, and the canvas is preloaded with an example workflow. Three steps get it running:

### 1 — Install plugins

Open the **plugin manager** (the blocks icon, top-right) and install what you need. Newly installed plugins are usable immediately, no restart.

To run the preloaded **example workflow** (text → image → fusion → video), install these three plugins:

- [tongflow-modal-z-image](https://github.com/tong-io/tongflow-modal-z-image) — text-to-image
- [tongflow-modal-flux2-klein9b](https://github.com/tong-io/tongflow-modal-flux2-klein9b) — image fusion / blending
- [tongflow-modal-ltx](https://github.com/tong-io/tongflow-modal-ltx) — image-to-video

These run on [Modal](https://modal.com) (up to **$30/month** of free GPU compute). Add `MODAL_TOKEN_ID` / `MODAL_TOKEN_SECRET` in **Settings**; create a token at [modal.com/settings/tokens](https://modal.com/settings/tokens). Any other platform can publish its own plugins the same way.

Browse the full catalog — the official API plugins (OpenAI / Gemini / OpenRouter) and other GPU/CPU plugins — in the plugin manager.

### 2 — Configure credentials

Open **Settings** (the gear icon, top-right) and add the environment variables your plugins need — e.g. `OPENAI_API_KEY` for the API plugins, or the credentials your GPU/CPU plugins require. To use the **Director agent** (the sparkles icon on the canvas — turns a natural-language prompt into a workflow graph), add `ANTHROPIC_API_KEY` there too.

> **Plugin credentials live in Settings.** The plugin system itself is platform-agnostic and hardcodes no provider: the Settings dialog is a generic key/value editor for environment variables passed to plugins, and each plugin's README documents the keys it needs. The Director agent is the one first-party exception — it is a built-in OneFlow feature (not a plugin) and always calls the Anthropic API, so it needs `ANTHROPIC_API_KEY` specifically. Values are stored locally and take effect without a restart.

### 3 — Run the example workflow

Run the preloaded example node by node, or switch to Execute Mode and hit the run button to run the whole thing in one click.

## Custom plugins

Every runnable node is backed by a **contract** — the ABI ([`config/tongflow.abi.json`](config/tongflow.abi.json)) — that defines *what capabilities exist* and *what each one's input/output looks like*, independent of *who* implements it. A plugin is just a small Python package that picks one or more ABI slots and supplies the **how**, annotated against the ABI-generated types via the tongflow Python SDK.

The full development flow — the ABI, the `@node_slot` decorator, the SDK, directory layout, and how to publish — lives in **[docs/plugins.md](docs/plugins.md)**.

## Community

Questions, ideas and bug reports go to
**[GitHub Discussions](https://github.com/phanlemanh/OneFlow/discussions)** and
**[Issues](https://github.com/phanlemanh/OneFlow/issues)** on this repository.

This fork does not run a chat community. The Discord and WeChat groups linked by
upstream TongFlow belong to tong-io and are not staffed by this project.

## Open-Source

If you like this project, a Star on GitHub helps a lot. Thank you.

<img src="docs/assets/star.gif" alt="Star on GitHub" width="480" />

## License

OneFlow is licensed under **[AGPL-3.0](LICENSE)** — the same license as the
upstream project it forks. That includes AGPL Section 13: if you run a modified
OneFlow as a network service, you must offer its complete corresponding source
to that service's users.

This fork **cannot** grant a commercial license. The dual-licensing option
belongs to the upstream copyright holder, tong-io — if you need TongFlow under
non-AGPL terms, contact them directly at
[tong-io/tongflow](https://github.com/tong-io/tongflow). The upstream
`COMMERCIAL-LICENSE.md` and `CLA.md` documents are not part of this fork;
contributions are accepted under AGPL-3.0 itself (inbound = outbound), with no
CLA — see [CONTRIBUTING.md](CONTRIBUTING.md).

The license covers the entire repository, including the `sdk/` directory, which
is modified by this fork and published to PyPI as `oneflow-sdk` (the import
package name stays `tongflow`) — see [NOTICE.md](NOTICE.md).

See [NOTICE.md](NOTICE.md) for fork attribution and modification notice.
