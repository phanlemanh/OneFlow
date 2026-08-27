# STATUS — OneFlow

> Trạng thái sống của repo — cập nhật cuối mỗi gói việc. Handoff giữa máy/agent đọc **file này + `_acceptance/`**, không đọc lịch sử chat.

## Hiện trạng (2026-08-17, sau S2 local-cpu-plugins + nâng bộ gate lên kit 2.1.0)

> Chỉ mục tính năng theo góc nhìn người dùng — *làm được gì hôm nay, còn hở ở đâu* — nằm ở
> [`docs/feature-index.md`](docs/feature-index.md) (khảo sát toàn repo 17/08, kèm 2 sơ đồ).
> File này giữ vai *đang ở đâu* về mặt kỹ thuật và quy trình.


- **Nền tảng:** fork TongFlow (AGPL-3.0, không CLA, không dual-license — README §License). Đã rebrand OneFlow: logo pixel (`public/logo.svg`, `logo_icon.svg`), xoá COMMERCIAL-LICENSE.md/CLA.md.
- **i18n:** tiếng Việt đủ (`src/i18n/messages/vi.json`). Lưu ý `ja.json` thiếu **76 khoá** so với `en.json` — có sẵn từ upstream, chưa sửa. TTS tầng model vẫn chưa có tiếng Việt (Qwen3-TTS không hỗ trợ → kế hoạch dùng plugin ElevenLabs, P1).
- **Acceptance-Gate Kit:** đang chạy strict/strict (**kit 2.1.0**, nâng 17/08 qua PR #59 sau bước đệm 1.38.0 ở PR #54 — cả hai giữ nguyên fork `stale-scope` của repo). **17 feature đã ký, tất cả trên `main`** — trục cache 1.1 đóng trọn (L0 conformance → L1 fingerprint → L2 store → L3 tier-B → L4 eviction), Phase 1.2 `compose-overlay` đã ship, hạng mục 0.6 (`gate-scope-anchors`) đã đóng, và **S2 `local-cpu-plugins` đã ship 07/08** — hệ quả kỹ thuật đầu tiên của ADR-0011. CI **6 job** (CI-a thêm `Unit Tests (vitest)`), gate là job thứ 6.
- **SDK:** `oneflow-sdk` **0.2.18 đã publish lên PyPI** (kèm `ComposeOverlayInput/Output` + `COMPOSE_OVERLAY`). Cài bằng `pip install oneflow-sdk`, import bằng `import tongflow` (phương án C: chỉ đổi tên distribution).
- **Ba plugin fork đã hạ cánh:** `official-plugins.json` nay **39 entry — 36 chuỗi trơn dưới org mặc định + 3 entry `{"id", "origin"}` dưới `phanlemanh`** (`oneflow-modal-compose-overlay` 03/08, rồi `oneflow-api-ffmpeg` + `oneflow-api-pyscenedetect` 07/08 thay hẳn hai plugin Modal `gpu=NONE`). Cơ chế per-plugin-origin từ lý thuyết thành đang chạy ba lần. Known-limit "nút mở repo ghép từ org mặc định" **đã sửa 03/08** (`7ff8bd5`); nửa còn lại — engine standalone ngoài app vẫn ghép URL từ org mặc định trong `sdk/tongflow/engine/plugins.py` — còn hở, có `overrides` che.
- **⚠️ BƯỚC NGOẶT 05/08 — local-first.** [ADR-0011](docs/adr/0011-local-first-execution.md) đặt **máy của người dùng là nền thực thi mặc định**, BYO key thành mặc định, managed cloud thành tier — thay thế nửa "managed là mặc định" của ADR-0005. Quyết định của Manh sau khi khảo sát 38 plugin. Đảo ngược rủi ro critical #1 của hội đồng **mà chưa có bằng chứng thị trường mới**; ADR ghi điều kiện đảo chiều: ≥1/3 người dùng đại diện không tự nhập được key ở onboarding → managed quay lại làm mặc định. Đọc ADR trước khi làm bất cứ gì thuộc S2–S6.
- **Chiến lược sản phẩm:** đã chốt và vật chất hoá — [docs/strategy/vision.md](docs/strategy/vision.md) (tầm nhìn), [docs/roadmap.md](docs/roadmap.md) (lộ trình 24 tuần), [docs/adr/](docs/adr/README.md) (10 quyết định bất biến), [docs/strategy/council-2026-07.md](docs/strategy/council-2026-07.md) (biên bản hội đồng). Ngách beachhead quyết ở G0; kiến trúc không đổi theo ngách.

## Feature đã ký (đọc `_acceptance/<slug>/` để biết chi tiết)

| Slug | Tier | Ký | Nội dung |
|---|---|---|---|
| `task-metering` | T3 | 25/07 | 3 cột metering vào `tasks`; `duration_ms` đo thật, `cost_usd`/`gpu_type` NULL có chủ đích |
| `measure-harness` | T2 | 26/07 | Bộ đo WER / MOS mù / COGS |
| `sdk-distribution-rename` | T3 | 27/07 | Distribution `oneflow-sdk`, import package giữ `tongflow` |
| `dependency-refresh-2026-07` | T2 | 26/07 | Gộp 5 PR dependabot; biome 2.5.5 |
| `ci-actions-bump` | T2 | 26/07 | checkout v7, login-action v4, dry-run guard cho docker-publish |
| `oneflow-plugin-prefix` | T3 | 27/07 | `oneflow-` là quy ước thư mục plugin, `tongflow-` legacy. **Ký lại 27/07** cùng Cổng 2 của per-plugin-origin (nhánh đó sửa `plugin-id.test.ts` sang normaliser chung) |
| `per-plugin-origin` | T2 | 27/07 | Entry manifest nhận `origin` riêng; 1 resolver cho 3 đường tải; installer CLI sang TS; manifest validate lúc nạp. Origin lệch → từ chối 409, KHÔNG tự di trú |
| `stale-scope-by-paths` | T2 | 29/07 | Cổng chỉ báo bằng chứng hết hiệu lực cho feature mà code đổi NẰM TRONG `paths` nó khai; ai khai 0 `paths` giữ nguyên hành vi cũ từng chữ. Khai thiếu bị cross-check bắt và in tên file. **Cả 7 feature cũ được carry-forward re-pin cùng PR này** |
| `cache-l1-fingerprint` | T3 | 30/07 | Khoá cache nội-dung-địa-chỉ: `digest_form()` mượn `normalize_call()` của L0 nên khoá tính từ chính artifact conformance suite canh; `node_fingerprint()` trả `None` khi không biết rev HOẶC plugin có sửa đổi chưa commit; vector ghim lược đồ khoá + guard tự chứng minh không rỗng. 2 vòng verify (vòng 1 REJECT) |
| `conformance-l0` | T3 | 28/07 | Engine fan-out khớp canvas; gộp kết quả theo thứ tự batch; suite conformance TS↔Python + mutation guard; `pluginRev` lúc scan; hợp đồng `node_cached` nối thông 3 tầng. Merge 29/07 (PR #25) sau khi gỡ 7 pin stale |
| `cache-l2-store` | T3 | 30/07 | Store cache trên đĩa + blob dedupe, chỉ tầng A, per-call. Chạy lại workflow không đổi → 0 lời gọi plugin. S4 PASS vòng 1 (18/18 — lần đầu trong repo). Merge PR #32 |
| `cache-l3-tier-b` | T3 | 30/07 | Tầng B (memo theo workflow + tenant). Merge PR #33 |
| `cache-l4-eviction` | T3 | 31/07 | LRU trần 20GiB, blob GC reachability + dọn orphan hồi tố, `purge(tenant, workflow_id)`, `reuse=auto/off`, telemetry % partial (2 cột `cache_calls_*` trong `tasks`). S4 PASS vòng 1 (20/20). Merge 01/08 (PR #34, `459d95f`) — **trục cache 1.1 đóng** |
| `compose-overlay` | T3 | 03/08 | Phase 1.2 — slot dán text/khung giá/logo/safe-zone lên ảnh & video; 16 AC / 27 eval, 12 vòng verify. ABI + codegen train + node UI + Tier A allowlist + plugin repo riêng (`oneflow-modal-compose-overlay`, entry origin đầu tiên) + SDK 0.2.18. Merge 05/08 ([PR #43](https://github.com/phanlemanh/OneFlow/pull/43), `7976bd8`) |
| `ci-vitest-sdk-pin` | T2 | 05/08 | Gói CI-a — job `Unit Tests (vitest)` vào CI (413 test lần đầu được CI chạy) · pin SDK của guard overlay derive từ `sdk/pyproject.toml` (`scripts/lib/sdk-version.sh` là nơi duy nhất biết luật đọc) · CLAUDE.md khớp guard manifest. 12 AC / 13 eval, **4 vòng verify** + 4 wave ký lại. Merge 05/08 ([PR #48](https://github.com/phanlemanh/OneFlow/pull/48), `32e55c3`) |
| `local-cpu-plugins` | T2 | 07/08 | **S2 — hệ quả kỹ thuật đầu tiên của [ADR-0011](docs/adr/0011-local-first-execution.md).** 7 slot trên đường tới hạn của skill #1 (6 slot ffmpeg + `split-video`) rời Modal về máy người dùng: `oneflow-api-ffmpeg` + `oneflow-api-pyscenedetect` thay hai plugin Modal `gpu=NONE`. Venv riêng mỗi plugin (`plugin-python-env.server.ts`); manifest thành 36 trơn + 3 origin; guard đếm viết lại. 18 AC / 26 eval, 2 vòng verify, S4 PASS vòng 2 tại `a4c6eca`. **AC-18 là AC sinh ra sau khi implement chứng minh đường lỗi có thật**: `ensurePluginPython` từng lặng lẽ trả `python3` trần khi cài hỏng — plugin có `requirements.txt` nay phải ném lỗi gọi đúng tên plugin thay vì chạy tiếp với môi trường rỗng |
| `gate-scope-anchors` | T2 | 04/08 | Hạng mục 0.6 — đóng cả hai nửa của luật "hỏi một không gian, trả lời không gian khác": (a) `scope_has_any_match` hỏi trong universe đã lọc (fail-open biến thể 5); (b) anchor `landed_merge` + `own-range.sh` cho eval per-PR chấm đúng diff của chính nó (họ "eval hết hạn ý nghĩa lúc merge"). Kèm wave re-pin 10 feature, 139 eval xanh (PR #46) |

## Đang dở — bắt máy A tiếp ở đây

**Phase 1.2 `compose-overlay` ĐÃ SHIP** — ký 03/08 (Cổng 2 lần 2), merge 05/08 ([PR #43](https://github.com/phanlemanh/OneFlow/pull/43), `7976bd8`). Chi tiết ở bảng trên + `_acceptance/compose-overlay/`. Hai hạng mục "không được cắt" của roadmap (cache 1.1 + overlay 1.2) đều đã đóng — cơ chế của Gate G1 đã đủ (AC-11 chứng minh dây cache, AC-13 conformance 2 runtime), **còn thiếu phần đo: 50 clip liên tiếp + demo "đổi giá → chỉ re-run overlay" bằng telemetry thật.**

**Hạng mục 0.6 `gate-scope-anchors` ĐÃ ĐÓNG** — ký 04/08, kèm wave re-pin 10 feature (139 eval xanh, [PR #46](https://github.com/phanlemanh/OneFlow/pull/46), merge `499b98e` 05/08). Mọi contract nay mang anchor `landed_merge`; eval per-PR chấm đúng diff của chính nó khi chạy lại ở nhánh sau.

**Gói CI-a `ci-vitest-sdk-pin` ĐÃ SHIP** — ký 05/08, merge [PR #48](https://github.com/phanlemanh/OneFlow/pull/48) (`32e55c3`). CI nay **6 job**; mìn SDK-pin đã gỡ **trước** lần bump 0.2.19, đúng lý do gói này được xếp trước 1.3.

**S2 `local-cpu-plugins` ĐÃ SHIP** — ký 07/08, merge [PR #51](https://github.com/phanlemanh/OneFlow/pull/51). Bảy slot trên đường tới hạn của skill #1 rời Modal về máy người dùng; ADR-0011 từ văn bản thành mã chạy được. Ba điều đáng mang đi:

1. **AC-18 sinh ra SAU khi implement**, vì implement chứng minh đường lỗi có thật: `pip install ./sdk` hỏng trên máy dev (thư mục `sdk/.venv` 18M bị copy theo lúc build wheel), và `ensurePluginPython` lặng lẽ `catch → resolvePythonLite()` trả về `python3` trần. Guard bắt được **chỉ vì** nó assert interpreter phải nằm trong venv — không có assert đó thì eval đã xanh giả.
2. **Ba sai lệch giữa plan và source thật** lộ ra lúc soạn contract: ABI trả `video_parts` chứ không phải `videos`; wheel `imageio-ffmpeg` không ship `ffprobe`; `scenedetect[opencv]` không tồn tại ở 0.7.1. Cả ba đều đã thành AC.
3. **`ffprobe` bị bắt buộc là tiền đề sai** — `_get_keyframes_seconds` / `_snap_to_prev_kf` được định nghĩa nhưng không bao giờ được gọi. Bắt buộc nó sẽ khiến plugin từ chối chạy trên đúng cái máy trắng mà local-first sinh ra để phục vụ. Cái được chốt là **răng của resolver**: ai cần ffprobe thì nhận lỗi gọi đúng tên, không bao giờ bị thay thầm.

⚠️ **Nhưng máy dev này chưa cài ba plugin mới.** `plugins/` là ảnh chụp cũ: thiếu cả `oneflow-api-ffmpeg`, `oneflow-api-pyscenedetect`, `oneflow-modal-compose-overlay`, và còn thừa `tongflow-modal-ffmpeg` + `tongflow-modal-pyscenedetect` (đã bị gỡ khỏi manifest). Registry quét **thư mục** chứ không đọc manifest, nên 7 slot đó ở đây vẫn chạy vòng qua Modal bằng plugin mồ côi, còn overlay thì hoàn toàn không chạy được. Cài lại theo manifest là hết — nhưng ai nghiệm thu trên máy này mà không biết sẽ kết luận sai rằng S2/1.2 chưa ship.

**Bốn lỗi thật do quy trình bắt được, không do người viết tự thấy** — đáng nhớ hơn bản thân gói việc: (1) `teeth` chạy `pnpm test` trực tiếp nên xanh trên cây KHÔNG có job CI nào; (2) `sdk_version()` resolve repo root lúc gọi → runner chết sau khi `cd` vào plugin clone → **13/13 eval render của compose-overlay chết trong khi guard của gói này vẫn xanh**; (3) `check-action-pins.sh` ghim 7 checkout site, job mới thành 8; (4) golden của `stale-scope-by-paths` đóng băng **phán quyết** staleness thay vì **hành vi** scoping.

**Việc kế tiếp (làn B — máy), theo thứ tự:**

1. **`normalize-text-vi` (Phase 1.3)** — slot tất định số/giá/ngày → chữ; bắt buộc đứng trước TTS trong mọi template; cũng là điều kiện phụ của ngưỡng MOS đề xuất trong [g0-runbook](docs/measure/g0-runbook.md). Kèm SDK 0.2.19 — **đường guard đã an toàn** sau CI-a.
2. **Plugin TTS ElevenLabs (Phase 1.4, [ADR-0009](docs/adr/0009-tts-vi-eleven-v3.md))** — pattern API-plugin; entry origin thứ tư, cân nhắc mang theo phần còn lại của "gói nợ lần fork đầu tiên" (mục Nợ).
3. **Skill system v1 (Phase 1.5, [ADR-0002](docs/adr/0002-skill-template-orchestrator.md))** — phần scaffold (template + manifest + orchestrator TS, `src/lib/skills/`) **không phụ thuộc ngách**. Bắt đầu được kể cả khi G0 chưa phán.
4. **Skill #1 + KG v0 (Phase 1.6–1.7)** — chờ chốt ngách. Đo G1 ngay trong lúc build, không dồn về cuối.

**Một câu hỏi thứ tự đang mở, chưa quyết:** S3 (transcribe không-Modal) hiện xếp sau 1.4, nhưng nó nằm trên **hai** đường tới hạn cùng lúc — đường skill #1 (split → *transcribe* → …) và đường đo WER của G0, vì [ADR-0010](docs/adr/0010-mainstream-infra-and-models.md) chốt đo qua APIMart / OpenAI / ElevenLabs Scribe chứ không phải Modal. Đẩy S3 lên trước 1.4 thì hôm corpus về là đo được ngay. Chưa ai quyết; ghi lại để không phải suy lại từ đầu. Tương tự, **S4 (UX BYO key) là điều kiện tiên quyết để chạy được phiên nghiệm thu kiểm chứng [ADR-0011](docs/adr/0011-local-first-execution.md)** (*"≥1/3 người dùng đại diện không tự nhập được key → managed quay lại làm mặc định"*) — chưa có S4 thì điều kiện đảo chiều đó không đo được, và ADR ở nguyên trạng thái đảo-chiều-không-bằng-chứng.

Nợ xen kẽ giữa các feature lớn, theo giá: **AC-3 grep một dòng** (rẻ nhất, xem 0.8) · `overlay-canvas-reach` (hẹn ở Cổng 2 compose-overlay) · 1.1-L1b (mime vào digest) · 1.1-L2b (file_key_base) · extraction `run_workflow` · 0.7 · **0.8 gate-tooling** (xem Hàng đợi).

**Chặn G0 (làn A — cần NGƯỜI VẬN HÀNH, máy không tự làm được, không chặn làn B):** ⓪ **ký ngưỡng số của G0** ([g0-runbook §0](docs/measure/g0-runbook.md) — đề xuất WER ≤ 10% + lỗi token chữ số trên câu có giá = 0; ~30 phút, không cần dữ liệu, và đứng TRƯỚC các chặn kia về logic: chốt vạch sau khi thấy số là mất tính khách quan của gate) · ① clip thực địa + bản chép tay tham chiếu → [`measure/wer-corpus/`](measure/wer-corpus/README.md) (WER — thư mục vẫn chỉ có README, bộ đo ký 26/07 chưa chạy lần nào) · ② task chạy thật + hoá đơn (COGS) · ③ quyết định ngách seller e-commerce ↔ môi giới BĐS (deadline mềm: trước khi skill system scaffold xong, vì skill #1 + KG v0 cần nó). Chi tiết điều kiện ở [docs/roadmap.md](docs/roadmap.md) Phase 0.

**`cache-l2-store` (lát L2) đã ký Cổng 2 (30/07), merge qua [PR #32](https://github.com/phanlemanh/OneFlow/pull/32).** Cache thật sự đọc/ghi lần đầu: chạy lại workflow không đổi → 0 lời gọi plugin; sửa một node → chỉ node đó + hạ nguồn chạy lại. S4 PASS ngay vòng 1 (18/18 eval — lần đầu trong repo). Kèm PR: `cache-l1-fingerprint` và `conformance-l0` **ký lại** (luật per-file — L2 sửa `fingerprint.py` và `runner.py`/`engine-delegate.server.ts`; chi phí thứ hai KHÔNG được báo giá ở Cổng 1, đã disclose trong re-verify note); 7 feature carry-forward; `stale-scope-by-paths` không cần gì nhờ scope hẹp — cơ chế 0.5 trả công lần đầu.

`conformance-l0` (1.L0) đã merge 29/07 qua [PR #25](https://github.com/phanlemanh/OneFlow/pull/25). Q1–Q3 của spec cache **đã chốt 29/07** — xem [design doc](docs/superpowers/specs/2026-07-29-cache-open-questions-design.md) và PR #30.

**Hai thứ L1 để lại cho L2, đọc trước khi cắm dây** (chi tiết ở Known limits của contract):

- **`sdk_major()` chỉ kiểm "có dấu chấm".** `sdk_major('v0.2.17')` → `'v0.2'`, `sdk_major('..')` → `'.'`. `sdk_version` là tham số công khai của `node_fingerprint()`, nên một caller truyền chuỗi dạng tag làm `sdkMajor` rác được băm vào **mọi** khoá, không báo lỗi. Sửa rẻ: đòi hai thành phần đầu là chữ số.
- **`mime`/`filename` của asset không vào digest.** Cùng bytes + metadata khác → **cùng một khoá** (kiểm chứng: `denoise_audio`, `audio/wav` vs `audio/mpeg` → `dd316ad8…`). Plugin *thấy* hai field đó, nên plugin chọn decoder theo `input.mime` sẽ bị phục vụ entry của metadata kia. Sửa nằm trong `callog.py` — của `conformance-l0` — nên cần contract riêng.

## Cách gỡ 7 pin stale đã chặn PR #25 — giữ lại vì sẽ gặp lại

PR #25 kẹt hai ngày (28→29/07) vì cổng báo 7 feature cũ hết hiệu lực bằng chứng. **Feature thứ 8 (`stale-scope-by-paths`) không gỡ được** — 7 feature đó khai 0 `paths`, mà AC-3 quy định khai 0 `paths` = giữ nguyên hành vi cũ từng chữ. Nó chỉ tự cứu chính nó.

Đường gỡ đúng luật, từ 8 violation về `clean`:

| Bước | Kết quả |
|---|---|
| Merge `main` → nhánh | ✅ conflict giải xong: 6 file `_acceptance/stale-scope-by-paths/*` + plan lấy bản trên `main`; `_acceptance/config.yaml` giải bằng **union**; `STATUS.md` gộp tay |
| Backfill 6 `paths` của `conformance-l0` | ✅ cross-check chấp nhận, cấp scope hẹp, `OK [conformance-l0]` — 5 thay đổi bị chặn đều là `scripts/acceptance/**` của `main` |
| Carry-forward re-pin 6 feature | ✅ `task-metering`, `measure-harness`, `sdk-distribution-rename`, `dependency-refresh-2026-07`, `ci-actions-bump`, `per-plugin-origin` — pin `4dcb419` → `05fc945` |
| `oneflow-plugin-prefix` | ✅ re-verify vòng 4 + **chữ ký Cổng 2 mới** (Manh 29/07, commit human-fields-only `a2a9f93`) |
| Gate cuối | ✅ `pre-merge-check: clean`, CI 5/5 xanh, merge commit `99a75ad` |

Cách xác định ai carry-forward được: lấy tập file mỗi feature **sở hữu** = diff của merge commit đã hạ cánh nó, rồi giao với diff gated của nhánh này. Sáu giao rỗng. Đúng một giao khác rỗng: **`sdk/tongflow/scan.py`, của `oneflow-plugin-prefix`** — nên feature đó không được re-pin, phải verify lại (đúng nửa sau của luật, thứ mà re-pin không được dùng để lách).

Standing check trên cây mới đều xanh: `pnpm lint:check` (413 file) · `pnpm test` (347) · `pnpm build && pnpm typecheck` · `cd sdk && pytest` (117).

**Phát hiện của vòng re-verify, và là thứ đáng mang đi nhất:** eval `prefix_no_config_drift` đỏ **không phải vì regression mà vì nó đo nhầm PR**. Nó khẳng định "PR mở rộng tiền tố không mang theo thứ khác" bằng cách diff `origin/main...HEAD` — chạy lại ở nhánh sau thì `HEAD` là việc của người khác, nên nó bắt `src/lib/plugins/plugins-registry-schema.ts` (chỗ `conformance-l0` cố ý thêm `pluginRev`). Fail **closed**, không có gì không an toàn lọt qua; cái mất là nó không còn trả lời được câu hỏi về feature của chính nó.

Đây là **một họ, không phải một ca lẻ**: `origin_manifest_unmoved` (AC-6 của `per-plugin-origin`) cùng hình dạng y hệt, và CLAUDE.md đã ghi đúng câu đó — *"a snapshot of that PR, not a standing invariant"*. Hệ acceptance chưa có từ để gọi loại này: **eval hết hạn ý nghĩa lúc merge**, mà cổng vẫn chạy lại mãi như thể chúng là bất biến. Bản chất AC-6 đã kiểm tay trực tiếp thay cho guard (`config/`, `src/db/`, `plugins-registry.server.ts` không đổi; manifest vẫn 38 plugin dưới `tong-io`). Sửa = chạm script eval sau verify = bắt đầu lại vòng, nên **gộp vào 0.6** chứ không vá lẻ.

Round count hai chữ số của `measure-harness` (14), `task-metering` (14), `sdk-distribution-rename` (13) chính là những lần trả giá trước cho đúng luật này.

Bài học vận hành của 4 round `conformance-l0`, đáng mang sang mọi feature sau: **eval chưa đỏ lần nào ở cả 4 round**, nhưng reviewer context-sạch ra danh sách mới mỗi vòng (7 → 6 → 9 → 8) vì mỗi vòng soi một tree khác và không bị neo bởi vòng trước. Chốt "vòng này là vòng cuối" phải làm **TRƯỚC khi chạy**, không phải sau khi đọc findings — nếu sau, mọi danh sách mới đều trông đáng-sửa và vòng lặp không có điểm dừng tự nhiên. Round 4 được chốt trước, và 8 finding của nó vào Known limits đúng như cam kết.

Hai HIGH đã nhận làm nợ ở Cổng 2 (chi tiết trong `_acceptance/conformance-l0/contract.md` §Known limits): `src/lib/abi/conformance.ts` thiếu `.server.ts`/`server-only` (sửa gần như 1 dòng, nên tách PR nhỏ), và **lô rỗng: engine xoá state node hạ nguồn còn canvas giữ nội dung cũ** — ba reviewer độc lập cùng nêu, cần contract riêng.

## Lịch sử — mục cũ giữ lại để tham chiếu

Ba điều chỉnh của `conformance-l0` so với plan, đều đã ghi vào `decisions.jsonl` và đáng nhớ:

1. **`resolve_node_params` phải giữ nguyên mảng cho field batch.** Exporter ghi `consumerShape: "scalar"` cho field có `batchOn` (đúng — mỗi lượt gọi nhận một phần tử), nên params bị thu về một giá trị *trước khi* engine kịp fan-out. Nếu không sửa, fan-out lặng lẽ quay về một lời gọi.
2. **Không mount nào trong registry dùng cả `batchOn` lẫn `collectAll`.** Ca `batch-collect` do đó là tổ hợp tổng hợp — chỉ ca này tự khai `sourceSpec`; ba ca còn lại tra `NODE_TYPE_SOURCE_SPEC` (đảo ở round 1, vì fixture tự khai thì remount node mà suite vẫn xanh).
3. **`mapEngineEvent` phải nằm ngoài `engine-delegate.server.ts`** — `server-only` không nạp được dưới vitest, nên để nguyên thì test ba tầng bất khả thi.

Một guard bị mutation test bác bỏ và đã gỡ: `channel is None` trong `runner.py` hoàn toàn tương đương `not channel` (vì `merge_fanout_views` luôn tạo key), nên nó chỉ là nhiễu kèm comment gợi ý một khác biệt không tồn tại.

`per-plugin-origin` đã merge (PR #20, merge commit `6461d2b`, 27/07); `pre-merge-check` trên `main` sạch.

## Bài học của feature thứ 8 (`stale-scope-by-paths`, đã merge 29/07)

Feature thứ 8 gỡ treadmill staleness. Bài học đắt nhất của nó **không** nằm ở cơ chế mà ở bộ đo: 4 vòng verify tìm ra **5 lỗi fail-open cùng một họ** — luôn là *hỏi câu hỏi ở một không gian, dùng câu trả lời ở không gian khác* (`ls-files` vs `diff --name-only`; prefix neo top-level; đếm tổng thay vì phân bố; quy chủ sở hữu chỉ nhìn lùi; scope toàn glob t1-exempt) — và **16/16 eval xanh ở cả bốn trạng thái code**, vì mọi fixture trong bộ guard đều đặt `$ROOT` ở gốc git. Bộ đo có điểm mù có hệ thống; chỉ review đọc-code bắt được. 4 lỗi đã sửa + mutation-test; lỗi thứ 5 và món tiếng Việt chuyển sang contract riêng (xem Hàng đợi).

Hai guard **suýt viết rỗng** cũng bị chính mutation-test bắt: một nửa case xanh vì cross-check tự từ chối scope (đo nhầm guard), và perturbation (b) của E9 hết phá được thứ nó định phá sau khi completeness tách làm hai chỗ. Quy tắc rút ra: **guard mới phải chứng minh nó đỏ khi lỗi quay lại, không chỉ xanh khi code đúng.**

⚠️ **Bẫy `main` trôi giữa phiên.** Suốt 4 vòng verify, `diffBase` dùng `336944d` = merge-base lúc bắt đầu phiên. Giữa chừng một subagent chạy `git fetch` làm local `main` fast-forward `336944d → 2255226` (kit 1.24.0, PR #26), nên merge-base thật đổi thành `896b17e`. Hệ quả: review 4 vòng nhìn diff RỘNG HƠN thực tế và quy nhầm code của `main` (≈265 dòng tiếng Việt, `biome.json`, `lib/gap-probe.js`) thành của nhánh này. Bằng chứng máy KHÔNG bị ảnh hưởng (coverage set tính trên base đúng vẫn y hệt — phần dôi ra đều t1-exempt), nhưng lần sau **tính lại merge-base ngay trước mỗi vòng verify**, đừng tin giá trị chốt từ đầu phiên.

Bài học đắt ghi lại cho máy sau: **round 2→7 churn vì sửa hành vi "plugin đã cài dời origin" — thứ không có AC/eval nào phủ và AC-6 cấm xảy ra trong PR này.** Chốt cuối: origin lệch → từ chối 409 chỉ cách gỡ (so qua `sameGitRemote` đã chuẩn hoá, không xoá, không migrate). Di trú tự động thuộc contract của lần fork thật đầu tiên, xem Known limits của contract.

## Quyết định đã chốt (đừng mở lại)

Đã tách thành **ADR bất biến** — nội dung đầy đủ (bối cảnh, hệ quả, nguồn) ở [docs/adr/](docs/adr/README.md); file này chỉ giữ pointer:

- [ADR-0001](docs/adr/0001-cache-before-cloud.md) cache trước cloud · [ADR-0002](docs/adr/0002-skill-template-orchestrator.md) skill = template + orchestrator, không mở rộng DSL · [ADR-0003](docs/adr/0003-media-judge-ranker-first.md) judge là ranker tới FPR < 5% · [ADR-0004](docs/adr/0004-universe-kg-three-entities.md) KG 3 thực thể · ~~[ADR-0005](docs/adr/0005-managed-cloud-default.md) managed cloud mặc định~~ (**bị ADR-0011 thay thế**) · [ADR-0006](docs/adr/0006-defer-vn-compliance.md) hoãn compliance VN · [ADR-0007](docs/adr/0007-sequential-plugin-forking.md) fork plugin tuần tự · [ADR-0008](docs/adr/0008-naming-and-distribution.md) tên & phân phối (`oneflow-sdk`, import `tongflow`, tiền tố `oneflow-`, namespace `phanlemanh`) · [ADR-0009](docs/adr/0009-tts-vi-eleven-v3.md) TTS-vi dùng `eleven_v3`, điều kiện MOS của G0 đóng bằng phán quyết · [ADR-0010](docs/adr/0010-mainstream-infra-and-models.md) ưu tiên hạ tầng & model phổ biến — Modal là lựa chọn, không phải nền tảng · [ADR-0011](docs/adr/0011-local-first-execution.md) **máy người dùng là nền thực thi mặc định, managed cloud thành tier — thay thế nửa managed-mặc-định của ADR-0005**
- **Phạm vi kế hoạch: chỉ phát triển sản phẩm** — GTM/growth/vận hành ngoài phạm vi (header [docs/roadmap.md](docs/roadmap.md)).
- **Luật carry-forward** (AGENTS.md): chữ ký của một feature đã merge chỉ được mang sang khi code của chính nó **chứng minh được là không đổi** và standing check xanh.
- **Quyền sở hữu tính THEO TỪNG FILE, không theo subtree** (Manh chốt 29/07). Tập file một feature sở hữu = diff của merge commit đã hạ cánh nó, đem giao với diff gated của nhánh. `sdk/**` là t3-path chứ không phải lãnh địa của một feature. Điều này **thay thế** cách đọc ở PR #18 (commit `7e307f5` ký lại `sdk-distribution-rename` chỉ vì nhánh đó chạm `sdk/**`, trong khi file của chính nó không đổi) — đó là một chữ ký thừa, không phải tiền lệ.

## Nợ & cảnh báo đang mở

- ~~**`batchField` drift**~~ — **đã xoá, ký 28/07** (PR #25). Engine nay fan-out N lời gọi khớp canvas, gộp kết quả theo đúng thứ tự batch, và suite conformance canh cho hai phía không lệch lại. Việc đưa batch về orchestrator để hợp nhất tận gốc vẫn nằm ở Phase 3.
- **Desktop shell trỏ `app.tongflow.com`**, artifact tên `TongFlow-*.dmg` — không phát hành desktop tới khi tách. Chờ quyết định URL cloud.
- **Token PyPI toàn tài khoản** đang nằm trong `.env` và đã hiện trong transcript phiên 26/07. **Nên thu hồi** và tạo lại loại project-scoped (`oneflow-sdk` đã tồn tại nên tuỳ chọn hẹp giờ có sẵn).
- **Ghim SDK của 38 plugin chính thức** không sửa được — repo upstream, ta không sở hữu. Sẽ tự giải khi từng plugin được fork.
- **Trùng tên "OneFlow"**: GitHub `oneflow` = OneFlow Systems Ltd; `Oneflow-Inc` = framework DL Trung Quốc, và framework đó **giữ tên `oneflow` trên PyPI**. Còn trống: `oneflow-io`, `oneflow-studio`, `oneflowhq`.
- **Hai giới hạn guard đã ghi, chưa sửa** — xem mục "Known limits" trong `_acceptance/ci-actions-bump/contract.md` và `_acceptance/oneflow-plugin-prefix/contract.md`. Đều cần contract riêng vì sửa script eval sau khi verify là bắt đầu lại vòng.
- **2 PR dependabot cũ (#1, #2) đã đóng thủ công** — commit của chúng không nằm trong PR #17 nên GitHub không tự đóng.
- **Gói nợ "lần fork thật đầu tiên"** (từ 8 round review của per-plugin-origin, chi tiết ở Known limits contract đó). ~~link "mở kho" trong plugins-dialog ghép từ org mặc định~~ **đã sửa 03/08** (`7ff8bd5` — `officialGitUrl(entry)` giải origin theo từng entry, dialog render `p.repoUrl`; văn bản cũ trong file này và trong contract `per-plugin-origin` đã lạc hậu 5 ngày so với code). Còn mở: bản sao luật URL thứ tư trong `sdk/tongflow/engine/plugins.py` (engine standalone ngoài app vẫn ghép từ org mặc định, có `overrides` che); di trú tự động khi đổi origin (cần AC + eval git-fixture riêng — **lưu ý S2 KHÔNG kích hoạt đường này**: nó thay hẳn `id` chứ không dời origin của cùng một id, nên cơ chế 409 không chạm tới); 3 LOW (query/fragment lọt qua `requireHttpUrl`, message CLI hardcode `plugins/`, catch trần trong `remoteIsAhead`); `assertSafeGitUrl` lỏng hơn biên manifest.
- **🔴 Hai đường chạy giành nhau đúng một thư mục venv — chưa có contract, phát hiện 17/08.** S2 chỉ sửa **phía TS**. Phía Python thì `_venv_dir()` ([`sdk/tongflow/engine/plugins.py:98`](sdk/tongflow/engine/plugins.py)) vẫn trả `data_dir/.tongflow/plugin-venv` và dựng **một venv chung ngay tại đó** — đúng cái path mà TS nay coi là **root chứa nhiều venv con** ([`plugin-python-env.server.ts:36`](src/lib/plugins/plugin-python-env.server.ts)). Vòng lặp: engine chạy → tạo venv chung ở root → lần chạy TS kế tiếp thấy `pyvenv.cfg` ở root → `removeLegacySharedVenv()` `rmSync(root, recursive)` → **xoá sạch mọi venv per-plugin cùng lúc**. Kiểm chứng trên máy này: root đang có `pyvenv.cfg` + `bin/` + `lib/`, tức đang ở trạng thái venv-chung. Kèm theo, `prepare_python_env` (dòng 233-235) `except Exception → return sys.executable` — **đúng hành vi mà AC-18 vừa cố ý gỡ khỏi phía TS** vì nó biến lỗi cài đặt thành `ImportError` mù. `_acceptance/local-cpu-plugins/contract.md` §Out of scope **không nhắc đường engine**, nên đây là lỗ hổng chưa ghi ở đâu, không phải known limit đã disclose.
- **`cost_usd` / `gpu_type` chưa từng được ghi một lần nào.** Không phải "thiếu mặt tiền": grep toàn `src/` cho ra 0 chỗ ghi (chỉ có schema + 2 file test); comment trong `src/db/workspace.schema.ts:48-52` tự khai hai cột này "stay NULL until a backend-neutral plugin metadata channel exists". `duration_ms` thì có ghi thật. Nghĩa là **DoD "mỗi task ghi đủ 3 cột" của hạng mục 0.2 chỉ đạt 1/3 trên đường workflow**, và eval `task-metering` PASS 8/8 vẫn xanh vì nó ký **trước** khi engine thành đường chạy workflow duy nhất — bằng chứng cũ không phủ được lỗ mới.
- **Trần 3 lượt chạy đồng thời chỉ chặn một nửa.** `checkConcurrentTaskLimit` chỉ được gọi ở `/api/workflow/execute`; `/api/task/create` không có. Chạy từng node lẻ không bị chặn, và bộ đếm đếm mọi task `pending`+`processing` bất kể loại — nên 3 task node lẻ kẹt ở `pending` sẽ **khoá vĩnh viễn** mọi lượt chạy cả sơ đồ.
- **`docker run` một dòng trong README cho ra bản UPSTREAM, không phải bản này.** `README.md` và `docker-compose.yml:11` mặc định kéo `ghcr.io/tong-io/tongflow:latest`; ảnh của fork là `ghcr.io/${{ github.repository }}` và chỉ build khi đẩy tag `v*`. Ai self-host theo README sẽ chạy bản không có ADR-0011 và không có 3 plugin `oneflow-*`.
- ~~**CI không chạy `pnpm test`**~~ — **đã đóng 05/08** (`ci-vitest-sdk-pin`). CI nay có job `Unit Tests (vitest)`; guard `check-vitest-job.sh` canh job không bị làm mềm và tự chứng minh có răng bằng cách đọc lệnh RA TỪ `ci.yml` chứ không ghi cứng.
- **Known limits của `compose-overlay`** (chi tiết ở contract §Known limits): ~~ghi cứng SDK pin~~ **đã gỡ 05/08** · CLAUDE.md §"Registering an official plugin" mô tả guard bản cũ (`expected_count`) · `compose-overlay-op-form.tsx` dùng `<select>` thô, nhãn enum chưa dịch (5 locale thấy `top-left`, `tiktok-portrait`… tiếng Anh) · workflow nhập ngoài/sửa tay có thể còn dây video ở ô `logo` · schema ops gộp không ràng buộc field theo loại op (Amendment 2 — revisit khi generator hỗ trợ `oneOf`).
- **Agent baseline của kit làm hỏng `node_modules` của repo gốc** (gặp 28/07, round 1 của `conformance-l0`). Sau khi workflow S4 chạy xong, mọi `node_modules/<pkg>` biến thành symlink trỏ vào `/private/var/folders/.../tmp.XXXX/agk-baseline/node_modules/.pnpm/...` — thư mục tạm đó đã bị xoá, nên mọi lệnh `pnpm` chết với `MODULE_NOT_FOUND`, và `pnpm` lại đòi **xoá `node_modules`** (nguy hiểm với lockfile có importer `packages/proprietary` không tồn tại). Cách gỡ đã dùng, an toàn: `CI=true pnpm install --frozen-lockfile` rồi đối chiếu `shasum` của `pnpm-lock.yaml` để chắc lockfile không đổi. **Đừng chạy `pnpm install` không có `--frozen-lockfile`.**
- **Môi trường dev macOS**: 3 executor `sdk_pytest*` nay chạy qua `uv` (PEP 668 chặn pip vào Homebrew Python — CI xanh nhưng máy dev đỏ với lệnh cũ); `uv` đã vào CONTRIBUTING prerequisites. pnpm 11 cần `pnpm-workspace.yaml` local với `allowBuilds` (trường `pnpm.onlyBuiltDependencies` trong package.json không còn được đọc) — file này untracked, lockfile committed có importer `packages/proprietary` không tồn tại trong repo public, cẩn thận đừng để pnpm prune nó.

## Kế hoạch 24 tuần (product-only)

Bản chuẩn duy nhất: **[docs/roadmap.md](docs/roadmap.md)** (4 phase, gate G0–G3 với DoD; cập nhật mỗi lần qua gate — không lặp bảng ở đây để tránh hai nguồn sự thật). Tầm nhìn & bằng chứng thẩm định: [docs/strategy/](docs/strategy/vision.md).

## Hàng đợi hiện hành

| # | Việc | Trạng thái |
|---|---|---|
| 0.1a | Tiền tố `oneflow-` (2 tầng ép buộc) | ✅ **xong** — PR #18 |
| 0.1b | Publish `oneflow-sdk` lên PyPI | ✅ **xong** — 0.2.17 lần đầu; hiện hành 0.2.18 (train compose-overlay) |
| 0.1c | Origin theo từng plugin trong manifest | ✅ **xong** — PR #20, ký 27/07 |
| 0.1d | Tách desktop khỏi `app.tongflow.com` | ⏸ chặn — chờ quyết định URL cloud |
| 0.2 | 3 cột metering | ✅ xong — PR #12 |
| 0.3 | Bộ đo WER/TTS-vi/COGS | ◐ script xong PR #14 · **MOS đóng 27/07** ([ADR-0009](docs/adr/0009-tts-vi-eleven-v3.md): `eleven_v3`, phán quyết vận hành) · **WER chờ clip thực địa + ref chép tay** → [`measure/wer-corpus/`](measure/wer-corpus/README.md) · COGS chờ task chạy thật + hoá đơn |
| 0.4 | Spec cache + partial re-render | ✅ xong — PR #11. **3 câu hỏi mở (Q1–Q3, §7) chưa chốt** |
| 0.5 | Scoping staleness theo `paths` đã khai | ✅ **xong** — ký 29/07, 7 feature cũ carry-forward cùng PR |
| **0.6** | **Ngữ nghĩa không gian tên đường dẫn + coverage-set** của cổng | ✅ **xong** — `gate-scope-anchors` ký 04/08, đóng cả hai nửa (fail-open biến thể 5 + họ "eval hết hạn ý nghĩa lúc merge" bằng anchor `landed_merge` / `own-range.sh`). Wave re-pin 10 feature, 139 eval xanh (PR #46) |
| **0.7** | **English-only vs văn bản vendor của kit** | 🔴 **contract riêng, quyết ở Cổng 2 của 0.5**. ≈265 dòng tiếng Việt + ≥14 thông điệp `VIOLATION`/`NOTE` CI, và `lib/gap-probe.js` biến một cụm tiếng Việt thành từ khoá điều khiển duy nhất. Nằm trong file vendor (kit 1.24.0) nên sửa tay bị ghi đè lần bump sau → việc thật là quyết định chính sách: xin upstream dịch, hay ghi ngoại lệ vendor vào CLAUDE.md/CONTRIBUTING.md |
| **1.L0** | `pluginRev` + sự kiện `node_cached` + **conformance suite TS↔Python** (ca đầu: `batchField`) | ✅ **xong** — ký 28/07, merge 29/07 ([PR #25](https://github.com/phanlemanh/OneFlow/pull/25), merge commit `99a75ad`) |
| **1.L0b** | Gỡ 7 pin stale chặn PR #25 | ✅ **xong** — 6 carry-forward re-pin + 1 re-verify & ký lại (`oneflow-plugin-prefix`). Cách làm giữ ở mục trên vì sẽ gặp lại |
| 0.4b | Chốt Q1–Q3 của spec cache | ✅ **xong** — chốt 29/07, PR #30 ([design doc](docs/superpowers/specs/2026-07-29-cache-open-questions-design.md)). Tầng A khoá theo tenant; `reuse_scope` thiếu → tắt cache; LRU là cơ chế thu hồi duy nhất |
| **1.1-L1** | `digest_form()` + `node_fingerprint()` + test vector ghim lược đồ khoá | ✅ **ký 30/07** — 16 tiêu chí, 2 vòng verify (vòng 1 REJECT, vòng 2 PASS) |
| **1.1-L2b** | **Dạy cache `file_key_base`** để desktop-delegation (DiskStore, file_key tương đối) cache được kết quả mang asset | 🔴 hàng đợi mới từ final review L2: hiện fail-closed → desktop 0% hit cho 9/11 slot tầng A; DoD chỉ đạt trên MemoryStore/HttpStore |
| **1.1-L1b** | **`mime`/`filename` của asset vào digest khoá cache** | 🔴 **contract riêng, quyết ở Cổng 2 của L1**. Cùng bytes + metadata khác → **cùng một khoá** (`denoise_audio`, `audio/wav` vs `audio/mpeg` → `dd316ad8…`). Plugin *thấy* hai field đó, nên ở L2 plugin chọn decoder theo `input.mime` bị phục vụ entry của loại kia. Sửa nằm trong `callog.py` — **của `conformance-l0`** — nên feature đó phải verify lại + ký lại. AC-4/AC-5 chỉ phủ trục `file_key` vs bytes |
| **1.1-L2** | Store cache trên đĩa + blob dedupe, chỉ tầng A, per-call | ✅ **ký 30/07** — 16 tiêu chí / 18 eval, S4 PASS vòng 1, PR #32. Known limits: `plugin_is_dirty` fail-open khi `git status` lỗi (ứng viên sửa đầu của lát kế) · cache nuốt lỗi không log · spread-order `assetOptions` · comment `node_cached` stale |
| **1.1-L3** | Tầng B (memo theo workflow + tenant) | ✅ **ký 30/07**, merge PR #33 |
| **1.1-L4** | LRU eviction + purge + reuse API + telemetry % partial | ✅ **ký 01/08** (Manh Phan, gate2 15m) — S4 PASS vòng 1 (20/20), **merge 01/08 ([PR #34](https://github.com/phanlemanh/OneFlow/pull/34), `459d95f`)**. Trục cache 1.1 đóng |
| **1.2** | Slot `compose-overlay` (media + ops[] typed) → plugin CPU font tiếng Việt → node UI | ✅ **ký 03/08**, merge 05/08 ([PR #43](https://github.com/phanlemanh/OneFlow/pull/43)) — 16 AC / 27 eval, 12 vòng verify; plugin `oneflow-modal-compose-overlay` là entry origin đầu tiên; SDK 0.2.18 |
| **1.2b** | `overlay-canvas-reach` — ô nhập số chặn khoảng ABI khai; `mediaKind` trả `null` thay vì mặc định `"image"` | 🔴 contract riêng, quyết ở Cổng 2 của compose-overlay |
| **CI-a** | Job vitest vào CI + derive SDK pin + CLAUDE.md khớp guard | ✅ **ký 05/08** — `ci-vitest-sdk-pin`, merge [PR #48](https://github.com/phanlemanh/OneFlow/pull/48) (`32e55c3`). 13/13 eval, 4 vòng verify |
| **0.8** | **Gate tooling × `t1_skip_globs`** — miễn trừ khai theo TÊN CHÍNH XÁC 4 đường, nên guard thứ 5 trở đi làm cũ MỌI pin trước đó. Gộp: (a) case fixture `undeclared` cho AC-3 mệnh đề (a) — **một dòng grep** vào `$d2` sẵn có trong `case_announce`; (b) ✅ **xong 27/08** — đã xoá 3 mảnh code chết `check-stale-golden.sh` + fixture + key `stale_scoping_golden`. Lý do hoãn cũ ("xoá là chạm `scripts/**` và kích lại treadmill") đã HẾT HIỆU LỰC từ `97b5b12` (17/08): `STALE-DIFF-SCOPE-GUARD` bỏ qua staleness cho mọi feature có `_acceptance/<slug>/` ngoài diff, nên commit chỉ chạm `scripts/**` sinh 0 stale — đo được, không suy luận; (c) `landed_merge` mới có ở 5/16 contract → 11 contract còn lại không tính được tập file sở hữu, `own-range.sh` fallback về diff nhánh | 🔴 **contract riêng, mở tại Cổng 2 của CI-a**. Đã đốt **4 wave ký lại** trong một gói việc — cùng gốc với bẫy AC-11: cổng đóng băng thứ phụ thuộc hoàn cảnh rồi gọi là bất biến. **Đo thêm 27/08 khi làm (b), contract 0.8 cần dùng:** (i) tập `UNDECLARED` của golden đã trôi — `measure-harness` + `task-metering` KHAI `paths` từ `20bb1e6` (07/08), nên chỉ còn 5/7 là khai-0; (ii) **5/14 case của `check-stale-scoping.sh` ĐỎ trên `main` sạch**: `in-scope`, `partial`, `merged-halves`, `announce`, `mutation` — `announce` chính là eval mà quyết định descope E3 dựa vào để giữ AC-3 mệnh đề (b)+(c), nên AC-3 hiện KHÔNG còn eval máy nào xanh; **ĐÃ CHỨNG MINH 27/08** — không phải guard hỏng mà là **hai contract đã ký mâu thuẫn nhau**: cả 5 case XANH ở `dfdedbd` (`97b5b12^`) và ĐỎ ngay tại `97b5b12`; ở `97b5b12`, vô hiệu hoá RIÊNG điều kiện `STALE-DIFF-SCOPE-GUARD` (`if false`) lật cả 5 về xanh — một biến, lật trọn. Gốc: `fixtures.sh` cố ý lấy `--base` SAU commit report nên `_acceptance/fx/` NẰM NGOÀI diff (comment của `mk_subdir_fixture` ghi thẳng: "the shape every later PR has"), trong khi fork `stale-theo-diff-pr` định nghĩa CHÍNH hình dạng đó là ca KHÔNG soi staleness. Fixture mã hoá contract cũ, fork mã hoá contract mới; cùng một input, hai phán quyết ngược nhau. Quyết định cần người: sửa fork hay dựng lại fixture cho khớp chế độ hiện hành. Triệu chứng chung của cả 5: `OK [fx]: PASS, signed off by Fixture 2026-07-28` — khối staleness không in gì; (iii) câu "`check-stale-golden.sh` … giữ nguyên trên cây" trong `contract.md` + `decisions.jsonl` của `stale-scope-by-paths` nay SAI, nhưng sửa nó là chạm `_acceptance/stale-scope-by-paths/` → `VIOLATION … evidence is stale` (đo được) → để contract 0.8 sửa kèm wave re-pin |
| **S2** | **`local-cpu-plugins`** — `oneflow-api-ffmpeg` (6 slot) + `oneflow-api-pyscenedetect` (`SPLIT_VIDEO`) thay 2 plugin Modal `gpu=NONE`; venv riêng mỗi plugin; manifest 36 trơn + 3 origin | ✅ **ký 07/08** — 18 AC / 26 eval, S4 PASS vòng 2 tại `a4c6eca`, merge [PR #51](https://github.com/phanlemanh/OneFlow/pull/51). Ký lại kèm theo: `per-plugin-origin` (guard manifest là AC-6 của nó) |
| **S3–S6** | Đường transcribe không-Modal (S3) · UX BYO key (S4) · desktop app thật (S5) · `docling`/`crawl4ai`/`scrapling` + 26 plugin GPU sang API (S6) | 🔴 chưa bắt đầu — phân rã ghi trong spec S2 §Out of scope. **S3 và S4 đều có lý do để chen lên trước 1.4** — xem "Việc kế tiếp" |
| **1.3** | Slot/node `normalize-text-vi` tất định (số, giá, ngày → chữ), đứng trước TTS trong mọi template | 🔜 **kế tiếp** — CI-a đã gỡ chặn; không phụ thuộc G0; kèm SDK 0.2.19 |
| **1.4** | Plugin TTS ElevenLabs tiếng Việt ([ADR-0009](docs/adr/0009-tts-vi-eleven-v3.md)) | ⏭ sau 1.3 — entry origin thứ hai; cân nhắc mang "gói nợ lần fork đầu tiên" |
| **1.5** | Skill system v1 scaffold ([ADR-0002](docs/adr/0002-skill-template-orchestrator.md)) — template + manifest + orchestrator TS | ⏭ sau 1.4 — phần scaffold KHÔNG phụ thuộc ngách; skill #1 + KG v0 (1.6–1.7) mới chờ chốt ngách |

## Nghi thức bắt buộc (AGENTS.md)

- **Merge commit, không bao giờ squash** — squash viết lại commit mang chữ ký Cổng 2 và phá vĩnh viễn `signoff.require_human_commit`.
- **Không `--delete-branch`** khi có PR xếp chồng lên nhánh đó (đã từng làm đóng nhầm #12, #13).
- **Không trích chuỗi chữ ký vào phần văn xuôi** của evidence — nó đổi số lần xuất hiện và làm `git log -S` trỏ nhầm commit.
