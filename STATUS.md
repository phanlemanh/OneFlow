# STATUS — OneFlow

> Trạng thái sống của repo — cập nhật cuối mỗi gói việc. Handoff giữa máy/agent đọc **file này + `_acceptance/`**, không đọc lịch sử chat.

## Hiện trạng (2026-07-27)

- **Nền tảng:** fork TongFlow (AGPL-3.0, không CLA, không dual-license — README §License). Đã rebrand OneFlow: logo pixel (`public/logo.svg`, `logo_icon.svg`), xoá COMMERCIAL-LICENSE.md/CLA.md.
- **i18n:** tiếng Việt đủ (`src/i18n/messages/vi.json`). Lưu ý `ja.json` thiếu **76 khoá** so với `en.json` — có sẵn từ upstream, chưa sửa. TTS tầng model vẫn chưa có tiếng Việt (Qwen3-TTS không hỗ trợ → kế hoạch dùng plugin ElevenLabs, P1).
- **Acceptance-Gate Kit:** đang chạy strict/strict. `main` sạch — **7 feature đã ký**. CI 5 job, gate là job thứ 5.
- **SDK:** `oneflow-sdk` **0.2.17 đã publish lên PyPI** (2026-07-26). Cài bằng `pip install oneflow-sdk`, import bằng `import tongflow` (phương án C: chỉ đổi tên distribution).
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

## Đang dở — bắt máy A tiếp ở đây

**`conformance-l0` (1.L0) đang ở S4 VERIFY** trên nhánh `feat/conformance-l0`. Cổng 1 đã ký (Manh, 28/07); 11 AC / 15 eval; code xong, chờ phán quyết verify rồi tới Cổng 2.

Ba điều chỉnh so với plan, đều đã ghi vào `decisions.jsonl` và đáng nhớ:

1. **`resolve_node_params` phải giữ nguyên mảng cho field batch.** Exporter ghi `consumerShape: "scalar"` cho field có `batchOn` (đúng — mỗi lượt gọi nhận một phần tử), nên params bị thu về một giá trị *trước khi* engine kịp fan-out. Nếu không sửa, fan-out lặng lẽ quay về một lời gọi.
2. **Không mount nào trong registry dùng cả `batchOn` lẫn `collectAll`.** Ca `batch-collect` do đó là tổ hợp tổng hợp; fixture tự khai `sourceSpec` thay vì tra registry theo nodeType.
3. **`mapEngineEvent` phải nằm ngoài `engine-delegate.server.ts`** — `server-only` không nạp được dưới vitest, nên để nguyên thì test ba tầng bất khả thi.

Một guard bị mutation test bác bỏ và đã gỡ: `channel is None` trong `runner.py` hoàn toàn tương đương `not channel` (vì `merge_fanout_views` luôn tạo key), nên nó chỉ là nhiễu kèm comment gợi ý một khác biệt không tồn tại.

`per-plugin-origin` đã merge (PR #20, merge commit `6461d2b`, 27/07); `pre-merge-check` trên `main` sạch.

Feature thứ 7: entry trong `config/official-plugins.json` nay nhận dạng `{"id", "origin"}` — fork lẻ từng plugin không phải chuyển cả 38. Một resolver (`src/lib/plugins/official-manifest.ts`, thuần, 57 test) phục vụ cả ba đường tải code; installer CLI chuyển sang TS; manifest được validate lúc nạp (kể cả tên plugin, chặn `../x` vào đường dẫn); 3 guard mới đều đã mutation-test. 8 round verify — round 8 sạch (0 HIGH/MEDIUM).

Bài học đắt ghi lại cho máy sau: **round 2→7 churn vì sửa hành vi "plugin đã cài dời origin" — thứ không có AC/eval nào phủ và AC-6 cấm xảy ra trong PR này.** Chốt cuối: origin lệch → từ chối 409 chỉ cách gỡ (so qua `sameGitRemote` đã chuẩn hoá, không xoá, không migrate). Di trú tự động thuộc contract của lần fork thật đầu tiên, xem Known limits của contract.

## Quyết định đã chốt (đừng mở lại)

Đã tách thành **ADR bất biến** — nội dung đầy đủ (bối cảnh, hệ quả, nguồn) ở [docs/adr/](docs/adr/README.md); file này chỉ giữ pointer:

- [ADR-0001](docs/adr/0001-cache-before-cloud.md) cache trước cloud · [ADR-0002](docs/adr/0002-skill-template-orchestrator.md) skill = template + orchestrator, không mở rộng DSL · [ADR-0003](docs/adr/0003-media-judge-ranker-first.md) judge là ranker tới FPR < 5% · [ADR-0004](docs/adr/0004-universe-kg-three-entities.md) KG 3 thực thể · [ADR-0005](docs/adr/0005-managed-cloud-default.md) managed cloud mặc định · [ADR-0006](docs/adr/0006-defer-vn-compliance.md) hoãn compliance VN · [ADR-0007](docs/adr/0007-sequential-plugin-forking.md) fork plugin tuần tự · [ADR-0008](docs/adr/0008-naming-and-distribution.md) tên & phân phối (`oneflow-sdk`, import `tongflow`, tiền tố `oneflow-`, namespace `phanlemanh`) · [ADR-0009](docs/adr/0009-tts-vi-eleven-v3.md) TTS-vi dùng `eleven_v3`, điều kiện MOS của G0 đóng bằng phán quyết · [ADR-0010](docs/adr/0010-mainstream-infra-and-models.md) ưu tiên hạ tầng & model phổ biến — Modal là lựa chọn, không phải nền tảng
- **Phạm vi kế hoạch: chỉ phát triển sản phẩm** — GTM/growth/vận hành ngoài phạm vi (header [docs/roadmap.md](docs/roadmap.md)).
- **Luật carry-forward** (AGENTS.md): chữ ký của một feature đã merge chỉ được mang sang khi code của chính nó **chứng minh được là không đổi** và standing check xanh. Nó vừa trả công lần đầu ở PR #18 — `sdk-distribution-rename` phải verify lại và ký lại vì nhánh đó chạm `sdk/**`.

## Nợ & cảnh báo đang mở

- ~~**`batchField` drift**~~ — **đã xoá trong `conformance-l0`** (chờ Cổng 2). Engine nay fan-out N lời gọi khớp canvas, gộp kết quả theo đúng thứ tự batch, và suite conformance canh cho hai phía không lệch lại. Việc đưa batch về orchestrator để hợp nhất tận gốc vẫn nằm ở Phase 3.
- **Desktop shell trỏ `app.tongflow.com`**, artifact tên `TongFlow-*.dmg` — không phát hành desktop tới khi tách. Chờ quyết định URL cloud.
- **Token PyPI toàn tài khoản** đang nằm trong `.env` và đã hiện trong transcript phiên 26/07. **Nên thu hồi** và tạo lại loại project-scoped (`oneflow-sdk` đã tồn tại nên tuỳ chọn hẹp giờ có sẵn).
- **Ghim SDK của 38 plugin chính thức** không sửa được — repo upstream, ta không sở hữu. Sẽ tự giải khi từng plugin được fork.
- **Trùng tên "OneFlow"**: GitHub `oneflow` = OneFlow Systems Ltd; `Oneflow-Inc` = framework DL Trung Quốc, và framework đó **giữ tên `oneflow` trên PyPI**. Còn trống: `oneflow-io`, `oneflow-studio`, `oneflowhq`.
- **Hai giới hạn guard đã ghi, chưa sửa** — xem mục "Known limits" trong `_acceptance/ci-actions-bump/contract.md` và `_acceptance/oneflow-plugin-prefix/contract.md`. Đều cần contract riêng vì sửa script eval sau khi verify là bắt đầu lại vòng.
- **2 PR dependabot cũ (#1, #2) đã đóng thủ công** — commit của chúng không nằm trong PR #17 nên GitHub không tự đóng.
- **Gói nợ "lần fork thật đầu tiên"** (từ 8 round review của per-plugin-origin, chi tiết ở Known limits contract đó): link "mở kho" trong plugins-dialog vẫn ghép từ org mặc định (sửa = đổi hình dạng phản hồi API, đường T3); bản sao luật URL thứ tư trong `sdk/tongflow/engine/plugins.py`; di trú tự động khi đổi origin (cần AC + eval git-fixture riêng); 3 LOW (query/fragment lọt qua `requireHttpUrl`, message CLI hardcode `plugins/`, catch trần trong `remoteIsAhead`); `assertSafeGitUrl` lỏng hơn biên manifest. **Lần fork đầu tiên phải mang cả gói này theo.**
- **CI không chạy `pnpm test`** — phát hiện ở round 6: `.github/workflows/ci.yml` chạy lint/typecheck/build/sdk-pytest/pre-merge nhưng không vitest, nên 300+ test và 3 guard mới chỉ có hiệu lực khi chạy tay local. Sửa = chạm workflows = chạm evidence của `ci-actions-bump` — cần contract riêng.
- **Agent baseline của kit làm hỏng `node_modules` của repo gốc** (gặp 28/07, round 1 của `conformance-l0`). Sau khi workflow S4 chạy xong, mọi `node_modules/<pkg>` biến thành symlink trỏ vào `/private/var/folders/.../tmp.XXXX/agk-baseline/node_modules/.pnpm/...` — thư mục tạm đó đã bị xoá, nên mọi lệnh `pnpm` chết với `MODULE_NOT_FOUND`, và `pnpm` lại đòi **xoá `node_modules`** (nguy hiểm với lockfile có importer `packages/proprietary` không tồn tại). Cách gỡ đã dùng, an toàn: `CI=true pnpm install --frozen-lockfile` rồi đối chiếu `shasum` của `pnpm-lock.yaml` để chắc lockfile không đổi. **Đừng chạy `pnpm install` không có `--frozen-lockfile`.**
- **Môi trường dev macOS**: 3 executor `sdk_pytest*` nay chạy qua `uv` (PEP 668 chặn pip vào Homebrew Python — CI xanh nhưng máy dev đỏ với lệnh cũ); `uv` đã vào CONTRIBUTING prerequisites. pnpm 11 cần `pnpm-workspace.yaml` local với `allowBuilds` (trường `pnpm.onlyBuiltDependencies` trong package.json không còn được đọc) — file này untracked, lockfile committed có importer `packages/proprietary` không tồn tại trong repo public, cẩn thận đừng để pnpm prune nó.

## Kế hoạch 24 tuần (product-only)

Bản chuẩn duy nhất: **[docs/roadmap.md](docs/roadmap.md)** (4 phase, gate G0–G3 với DoD; cập nhật mỗi lần qua gate — không lặp bảng ở đây để tránh hai nguồn sự thật). Tầm nhìn & bằng chứng thẩm định: [docs/strategy/](docs/strategy/vision.md).

## Hàng đợi hiện hành

| # | Việc | Trạng thái |
|---|---|---|
| 0.1a | Tiền tố `oneflow-` (2 tầng ép buộc) | ✅ **xong** — PR #18 |
| 0.1b | Publish `oneflow-sdk` lên PyPI | ✅ **xong** — 0.2.17 |
| 0.1c | Origin theo từng plugin trong manifest | ✅ **xong** — PR #20, ký 27/07 |
| 0.1d | Tách desktop khỏi `app.tongflow.com` | ⏸ chặn — chờ quyết định URL cloud |
| 0.2 | 3 cột metering | ✅ xong — PR #12 |
| 0.3 | Bộ đo WER/TTS-vi/COGS | ◐ script xong PR #14 · **MOS đóng 27/07** ([ADR-0009](docs/adr/0009-tts-vi-eleven-v3.md): `eleven_v3`, phán quyết vận hành) · **WER chờ clip thực địa + ref chép tay** → [`measure/wer-corpus/`](measure/wer-corpus/README.md) · COGS chờ task chạy thật + hoá đơn |
| 0.4 | Spec cache + partial re-render | ✅ xong — PR #11. **3 câu hỏi mở (Q1–Q3, §7) chưa chốt** |
| **1.L0** | `pluginRev` + sự kiện `node_cached` + **conformance suite TS↔Python** (ca đầu: `batchField`) | ◐ **đang làm** — Cổng 1 ký 28/07, code xong, đang S4 VERIFY trên `feat/conformance-l0` |
| 1.1 | Cache engine hạ cánh trong `sdk/tongflow/engine/` (lát L1→L4) | ⏭ kế tiếp sau 1.L0. **Q1–Q3 của spec cache cần chốt trước L2** |

## Nghi thức bắt buộc (AGENTS.md)

- **Merge commit, không bao giờ squash** — squash viết lại commit mang chữ ký Cổng 2 và phá vĩnh viễn `signoff.require_human_commit`.
- **Không `--delete-branch`** khi có PR xếp chồng lên nhánh đó (đã từng làm đóng nhầm #12, #13).
- **Không trích chuỗi chữ ký vào phần văn xuôi** của evidence — nó đổi số lần xuất hiện và làm `git log -S` trỏ nhầm commit.
