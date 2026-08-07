---
schema_version: 1
feature: Local CPU plugins — ffmpeg and pyscenedetect off Modal
slug: local-cpu-plugins
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [plugins, cli]
status: verified
approved_by: Manh
approved_at: 2026-08-06
time_human_minutes: {gate1: 0, gate2: 0}
---

# Acceptance Contract: local-cpu-plugins

## Context

First engineering step of [ADR-0011](../../docs/adr/0011-local-first-execution.md):
the user's machine becomes the default execution substrate. Seven slots on skill
#1's critical path (`split-video` plus all six ffmpeg slots) are served today by
two Modal plugins that request **`gpu=NONE`** — pure CPU work paying cloud
latency, cold start and a Modal account dependency. This package replaces them
with two local plugins and gives every plugin its own Python environment.

Execution is already local: `runners/generic.ts` spawns each plugin's `entry.py`
as a subprocess, and the Modal plugins are merely bridges out from there. So this
is a change of **who executes**, not of the executor, not of the ABI.

Source input: [spec](../../docs/superpowers/specs/2026-08-05-local-cpu-plugins-design.md) ·
[plan](../../docs/superpowers/plans/2026-08-05-local-cpu-plugins.md) · ADR-0011

## Criteria

### A. Per-plugin virtualenv (`src/lib/plugins/plugin-python-env.server.ts`)

- AC-1: Given two distinct plugin ids, When `venvDirFor` derives a path for each,
  Then the two paths differ, both end in their own plugin id, and both sit
  directly under one shared parent directory so eviction can still enumerate them.
- AC-2: Given a plugin id containing path separators or a leading dot
  (`../../etc`, `.ssh`), When `venvDirFor` is called, Then it throws and no
  directory outside the venv root is ever derived.
- AC-3: Given two plugins whose `requirements.txt` pin the **same package to
  conflicting versions**, When both are provisioned, Then each resolves its own
  pinned version and both entries still run — where one shared venv would have
  left the loser silently overwritten and `pip check` would only have warned.
- AC-4: Given the executor is a t3 path this package must not touch, When the
  change lands, Then `ensurePluginPython(pluginId, pluginDir)` keeps its exact
  signature and `git diff` shows **zero** changed files under
  `src/lib/plugin-executor/**`, `src/lib/abi/**`, `sdk/**` or `config/tongflow.abi.json`.
- AC-5: Given two different plugins provisioning at the same moment, When both
  call `ensurePluginPython`, Then pip runs serialized **within** each venv and
  the two plugins are not serialized against each other.
- AC-18: Given provisioning fails for a plugin that **declares a
  `requirements.txt`**, When `ensurePluginPython` is called, Then it throws an
  error naming the plugin and the fix — it must **not** return a plain
  interpreter that lacks every dependency the plugin is about to import. Given
  the same failure for a plugin declaring **no** requirements, Then the
  lightweight fallback is still used, because a plain interpreter is genuinely
  equivalent there.
  *(Added 2026-08-07 at the Gate-1 amendment: this was Notes item 3 until
  implementation proved the path reachable — see Notes.)*

### B. `oneflow-api-ffmpeg` (six slots)

- AC-6: Given a 1-second fixture video, When each of `concat-videos`,
  `extract-audio`, `merge-video-audio`, `remove-video-audio`, `get-first-frame`,
  `get-last-frame` is invoked over stdin as `{nodeSlot, prompt}`, Then each
  returns `success: true` on stdout with its ABI output asset carrying a
  non-empty `bytesBase64`, and exits 0.
- AC-7: Given a request whose `prompt` omits the required asset, When the slot
  runs, Then stdout is `{"success": false, "error": …}` naming the missing field,
  the process exits non-zero, and **no zero-byte asset is emitted**.
- AC-8: Given a video with **no audio track**, When `extract-audio` runs, Then it
  fails explicitly with the ffmpeg stderr trimmed into `error` — never
  `success: true` carrying a zero-byte audio asset.
- AC-9: Given `FFMPEG_BIN` is set to a valid binary, When any slot runs, Then that
  binary is used; with `FFMPEG_BIN` unset the resolver takes `ffmpeg` from PATH;
  with neither available it falls back to the `imageio-ffmpeg` wheel.
- AC-10: Given **none** of the three routes resolves (bogus `FFMPEG_BIN`, PATH
  cleared, wheel absent), When a slot runs, Then it goes red with an error naming
  the install fix — it must **not** find some other ffmpeg and pass by accident.

### C. `oneflow-api-pyscenedetect` (one slot)

- AC-11: Given a fixture with a hard red→blue cut, When `split-video` runs, Then
  `success: true` and the output field **`video_parts`** holds ≥ 2 assets, each
  with non-empty `bytesBase64`. (The upstream ABI field is `video_parts`, not
  `videos` — the plan's draft test asserted the wrong key.)
- AC-12: Given the upstream splitter calls **`ffprobe`** for keyframe alignment
  and the `imageio-ffmpeg` wheel ships **no ffprobe**, When ffprobe cannot be
  resolved, Then the plugin fails loudly naming ffprobe — never silently skipping
  keyframe alignment or emitting unaligned cuts.

### D. Modal is actually gone

- AC-13: Given both new plugin repositories, When their sources are scanned, Then
  no file imports `modal`, no `deploy.py`/`download.py` exists, neither
  `tongflow.plugin.json` declares `MODAL_TOKEN_ID`/`MODAL_TOKEN_SECRET`, and
  `FFMPEG_BIN` is declared **optional** (not `required`).

### E. Manifest, guard and docs

- AC-14: Given the two Modal ids are replaced by the two local ids with
  `origin: https://github.com/phanlemanh`, When the manifest is counted, Then it
  holds exactly **36 plain strings + 3 origin entries = 39**, and
  `check-manifest-unmoved.sh` exits 0.
- AC-15: Given the re-cut guard, When a fourth origin entry is added or one
  origin URL is altered, Then the guard exits non-zero — it must not have been
  loosened into a check that passes on anything.
- AC-16: Given the READMEs and CLAUDE.md are updated, When
  `check-manifest-doc-synced.sh` and `check-prefix-docs.sh` run, Then both exit 0,
  and the capability matrix still shows the seven slots ✅ (they change server,
  not availability).
- AC-19: Given two features in flight each carry a residual eval asserting "the
  gate is clear apart from me", When `check-gate-residual.sh` runs, Then a
  FOREIGN feature that is PASS-but-unsigned is forgiven (both can reach green in
  one signature run), while a foreign feature that is **stale**, **REJECT**, or
  has **no evidence report** still blocks — and the three own-slug classes are
  unchanged.
  *(Added 2026-08-07: verify round 1 proved the two residual evals deadlocked —
  each a machine FAIL awaiting the other's signature, which no `human_override`
  can release. See Notes.)*

- AC-17: Given this package edits `check-manifest-unmoved.sh`, which **is** AC-6
  of the already-signed `per-plugin-origin` feature, When Gate 2 is reached, Then
  the re-signature wave is computed by machine and `per-plugin-origin` is
  re-verified, not assumed still valid. (judgment)

## Coverage

Morphological scan, four axes; every cell below is either an AC above or an
explicit out-of-scope bullet.

- **Trục A — đơn vị thay đổi:** venv layer | ffmpeg plugin | pyscenedetect plugin
  | manifest + guard | docs. [thước CE: File Structure của plan, 5 nhóm — khớp 1-1]
- **Trục B — hướng chứng minh:** *wire* (chạy đúng: AC-1, 6, 11, 14, 16) ↔ *teeth*
  (hỏng thì phải đỏ: AC-2, 3, 7, 8, 10, 12, 15, 18). [thước CE: trục "wire ↔ teeth"
  của `ci-vitest-sdk-pin`, đã ký 2026-08-05]
- **Trục C — biên đầu vào:** thiếu asset (AC-7) | thiếu binary (AC-10, 12) | pin
  xung đột (AC-3) | id độc hại (AC-2) | media thiếu audio track (AC-8).
  [CE chưa kiểm chứng: chưa có nguồn liệt kê biên chuẩn cho plugin media]
- **Trục D — thứ bị gỡ bỏ:** `import modal` | `deploy.py`/`download.py` |
  `MODAL_TOKEN_*` | `boto3` + đường S3 → gộp vào AC-13 vì cùng một phép quét tĩnh.

Lỗ hổng đã biết, chấp nhận: AC-5 (đồng thời) chỉ kiểm được gián tiếp qua cấu
trúc `Map` chứ không đo được wall-clock ổn định trên CI.

## Out of scope

- **`docling`, `crawl4ai`, `scrapling`** — ba plugin `gpu=NONE` còn lại. Chúng
  tải browser/model weights lúc build image nên không "nhẹ" như hai plugin này;
  đi đường API ở **S6**, và hai cái sau chung slot `LINK` nên phải đi cùng nhau.
- **Desktop app chạy server tại máy** — hôm nay là vỏ Pake trỏ `app.tongflow.com`.
  Local-first rồi sẽ mâu thuẫn với nó, nhưng đó là **S5**.
- **Onboarding BYO-key** — store, API route và dialog đã có; cái thiếu là trải
  nghiệm lần đầu cho người không phải Manh. **S4**.
- **Mọi thay đổi ABI.** Không slot nào đổi hình dạng; **không** chạy `pnpm gen:abi`,
  không sửa `config/tongflow.abi.json`.
- **Không bump SDK.** Cả hai repo pin `oneflow-sdk==0.2.18`; không phát hành PyPI
  trong package này.
- **Không có fallback về Modal khi local hỏng.** ADR-0011 gỡ đúng con đường đó;
  giữ lại fallback là giữ lại phụ thuộc mà package này tồn tại để gỡ.
- **26 plugin GPU còn lại** — tuần tự, theo nhu cầu, theo ADR-0007.
- **G0.** Package này không gỡ được cái nào trong bốn chặn của G0; nó dọn đường tới G1.

## Notes

- **Ràng buộc tier:** T2. Không chạm `risk_tiers.t3_paths`. AC-4 là cái canh
  đúng ranh giới đó — nếu một task có vẻ cần chạm, dừng và leo thang, vì tier đổi
  và sóng re-sign nở ra.
- **Ba sai lệch giữa plan và source thật, phát hiện lúc soạn contract**, phải sửa
  khi implement:
  1. Plan Task 3 Step 2 assert `out["videos"]`; ABI thật là **`video_parts`**
     (`deploy.py:346`). → AC-11.
  2. Spec nói wheel `imageio-ffmpeg` là "lưới an toàn", nhưng
     `tongflow-modal-pyscenedetect/deploy.py:50-70` cần **cả `ffprobe`**, mà
     wheel đó **không** ship ffprobe. → AC-12.
  3. `ensurePluginPython` vẫn `catch → resolvePythonLite()`. → **đã nâng thành
     AC-18 ngày 2026-08-07** sau khi implement chứng minh đường này *có thật*:
     `pip install ./sdk` hỏng trên máy dev (`[Errno 2]` lúc build wheel, vì
     `sdk/.venv` 18M nằm trong `sdk/` và bị copy theo), và hàm lặng lẽ trả về
     `python3` trần. `check-venv-isolation.ts` bắt được vì nó assert interpreter
     phải nằm trong venv — không có assert đó thì eval đã xanh giả.
  4. `scenedetect[opencv]` (spec §88) **không tồn tại** ở scenedetect 0.7.1:
     extras chỉ có `pyav` và `moviepy`; `opencv-python` là dependency trực tiếp.
     `requirements.txt` dùng `scenedetect` trơn.
  5. AC-12 nói ffprobe được dùng "for keyframe alignment" — **tiền đề sai**.
     `_get_keyframes_seconds` / `_snap_to_prev_kf` được định nghĩa nhưng không
     bao giờ được gọi; chỉ `_ensure_ff_tools()` (deploy.py:277) đòi ffprobe cho
     một đường code đã chết. Bắt buộc ffprobe sẽ khiến plugin **từ chối chạy**
     trên đúng cái máy trắng mà local-first sinh ra để phục vụ. Nên cái được
     chốt là **răng của resolver**: ai cần ffprobe thì nhận lỗi gọi đúng tên
     ffprobe, không bao giờ bị thay thầm. Ghi rõ trong docstring của test.

- **Đổi tên plugin, 2026-08-07 (quyết định của Manh).** Ids dự kiến
  `oneflow-local-*` bị quy tắc prefix từ chối:
  `^(one|tong)flow-(modal|api)-...`, ép ở **ba** chỗ —
  [`plugin-id.ts`](../../src/lib/plugins/plugin-id.ts),
  [`official-manifest.ts:187`](../../src/lib/plugins/official-manifest.ts) và
  `sdk/tongflow/scan.py` `_detect_runner`. Chỗ thứ ba nằm trong `sdk/**`, tức
  t3 — thêm kind `local` sẽ đẩy cả gói lên T3 kèm một chuyến release SDK. Đã
  chọn đổi tên thành **`oneflow-api-ffmpeg`** / **`oneflow-api-pyscenedetect`**
  để giữ T2. Chi phí đã chấp nhận: nhãn "api" trong picker cho plugin không gọi
  API nào — tài liệu của `plugin-id.ts` nói rõ prefix chỉ là nhãn, không chọn
  backend. Một kind `local` đúng nghĩa là việc của gói sau.
- **Không có eval design-quality:** feature này không render surface web UI nào
  (`surfaces: [plugins, cli]`), nên bỏ theo đúng luật mục 2b của kit.
- **`per-plugin-origin` sẽ phải re-verify** — `check-manifest-unmoved.sh` chính là
  AC-6 của nó. Xem AC-17.
