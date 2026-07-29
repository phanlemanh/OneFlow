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
| `stale-scope-by-paths` | T2 | 29/07 | Cổng chỉ báo bằng chứng hết hiệu lực cho feature mà code đổi NẰM TRONG `paths` nó khai; ai khai 0 `paths` giữ nguyên hành vi cũ từng chữ. Khai thiếu bị cross-check bắt và in tên file. **Cả 7 feature cũ được carry-forward re-pin cùng PR này** |

## Đang dở — bắt máy A tiếp ở đây

**Không còn feature nào dở.** `stale-scope-by-paths` ký 29/07, `pre-merge-check` sạch cả 8 feature. Việc lớn kế tiếp vẫn là **1.L0**.

Feature thứ 8 gỡ treadmill staleness. Bài học đắt nhất của nó **không** nằm ở cơ chế mà ở bộ đo: 4 vòng verify tìm ra **5 lỗi fail-open cùng một họ** — luôn là *hỏi câu hỏi ở một không gian, dùng câu trả lời ở không gian khác* (`ls-files` vs `diff --name-only`; prefix neo top-level; đếm tổng thay vì phân bố; quy chủ sở hữu chỉ nhìn lùi; scope toàn glob t1-exempt) — và **16/16 eval xanh ở cả bốn trạng thái code**, vì mọi fixture trong bộ guard đều đặt `$ROOT` ở gốc git. Bộ đo có điểm mù có hệ thống; chỉ review đọc-code bắt được. 4 lỗi đã sửa + mutation-test; lỗi thứ 5 và món tiếng Việt chuyển sang contract riêng (xem Hàng đợi).

Hai guard **suýt viết rỗng** cũng bị chính mutation-test bắt: một nửa case xanh vì cross-check tự từ chối scope (đo nhầm guard), và perturbation (b) của E9 hết phá được thứ nó định phá sau khi completeness tách làm hai chỗ. Quy tắc rút ra: **guard mới phải chứng minh nó đỏ khi lỗi quay lại, không chỉ xanh khi code đúng.**

⚠️ **Bẫy `main` trôi giữa phiên.** Suốt 4 vòng verify, `diffBase` dùng `336944d` = merge-base lúc bắt đầu phiên. Giữa chừng một subagent chạy `git fetch` làm local `main` fast-forward `336944d → 2255226` (kit 1.24.0, PR #26), nên merge-base thật đổi thành `896b17e`. Hệ quả: review 4 vòng nhìn diff RỘNG HƠN thực tế và quy nhầm code của `main` (≈265 dòng tiếng Việt, `biome.json`, `lib/gap-probe.js`) thành của nhánh này. Bằng chứng máy KHÔNG bị ảnh hưởng (coverage set tính trên base đúng vẫn y hệt — phần dôi ra đều t1-exempt), nhưng lần sau **tính lại merge-base ngay trước mỗi vòng verify**, đừng tin giá trị chốt từ đầu phiên.

Bài học đắt ghi lại cho máy sau: **round 2→7 churn vì sửa hành vi "plugin đã cài dời origin" — thứ không có AC/eval nào phủ và AC-6 cấm xảy ra trong PR này.** Chốt cuối: origin lệch → từ chối 409 chỉ cách gỡ (so qua `sameGitRemote` đã chuẩn hoá, không xoá, không migrate). Di trú tự động thuộc contract của lần fork thật đầu tiên, xem Known limits của contract.

## Quyết định đã chốt (đừng mở lại)

Đã tách thành **ADR bất biến** — nội dung đầy đủ (bối cảnh, hệ quả, nguồn) ở [docs/adr/](docs/adr/README.md); file này chỉ giữ pointer:

- [ADR-0001](docs/adr/0001-cache-before-cloud.md) cache trước cloud · [ADR-0002](docs/adr/0002-skill-template-orchestrator.md) skill = template + orchestrator, không mở rộng DSL · [ADR-0003](docs/adr/0003-media-judge-ranker-first.md) judge là ranker tới FPR < 5% · [ADR-0004](docs/adr/0004-universe-kg-three-entities.md) KG 3 thực thể · [ADR-0005](docs/adr/0005-managed-cloud-default.md) managed cloud mặc định · [ADR-0006](docs/adr/0006-defer-vn-compliance.md) hoãn compliance VN · [ADR-0007](docs/adr/0007-sequential-plugin-forking.md) fork plugin tuần tự · [ADR-0008](docs/adr/0008-naming-and-distribution.md) tên & phân phối (`oneflow-sdk`, import `tongflow`, tiền tố `oneflow-`, namespace `phanlemanh`) · [ADR-0009](docs/adr/0009-tts-vi-eleven-v3.md) TTS-vi dùng `eleven_v3`, điều kiện MOS của G0 đóng bằng phán quyết · [ADR-0010](docs/adr/0010-mainstream-infra-and-models.md) ưu tiên hạ tầng & model phổ biến — Modal là lựa chọn, không phải nền tảng
- **Phạm vi kế hoạch: chỉ phát triển sản phẩm** — GTM/growth/vận hành ngoài phạm vi (header [docs/roadmap.md](docs/roadmap.md)).
- **Luật carry-forward** (AGENTS.md): chữ ký của một feature đã merge chỉ được mang sang khi code của chính nó **chứng minh được là không đổi** và standing check xanh. Nó vừa trả công lần đầu ở PR #18 — `sdk-distribution-rename` phải verify lại và ký lại vì nhánh đó chạm `sdk/**`.

## Nợ & cảnh báo đang mở

- **`batchField` drift** — exporter TS phát (`exporter.ts:648`), engine Python **không xử lý một dòng nào**; ~30 slot dùng `batchOn()`, nên canvas fan-out N lời gọi còn engine gọi một lần với cả mảng. Là ca kiểm thử **số 1** của conformance suite, và là điều kiện tiên quyết của cache (spec §5).
- **Desktop shell trỏ `app.tongflow.com`**, artifact tên `TongFlow-*.dmg` — không phát hành desktop tới khi tách. Chờ quyết định URL cloud.
- **Token PyPI toàn tài khoản** đang nằm trong `.env` và đã hiện trong transcript phiên 26/07. **Nên thu hồi** và tạo lại loại project-scoped (`oneflow-sdk` đã tồn tại nên tuỳ chọn hẹp giờ có sẵn).
- **Ghim SDK của 38 plugin chính thức** không sửa được — repo upstream, ta không sở hữu. Sẽ tự giải khi từng plugin được fork.
- **Trùng tên "OneFlow"**: GitHub `oneflow` = OneFlow Systems Ltd; `Oneflow-Inc` = framework DL Trung Quốc, và framework đó **giữ tên `oneflow` trên PyPI**. Còn trống: `oneflow-io`, `oneflow-studio`, `oneflowhq`.
- **Hai giới hạn guard đã ghi, chưa sửa** — xem mục "Known limits" trong `_acceptance/ci-actions-bump/contract.md` và `_acceptance/oneflow-plugin-prefix/contract.md`. Đều cần contract riêng vì sửa script eval sau khi verify là bắt đầu lại vòng.
- **2 PR dependabot cũ (#1, #2) đã đóng thủ công** — commit của chúng không nằm trong PR #17 nên GitHub không tự đóng.
- **Gói nợ "lần fork thật đầu tiên"** (từ 8 round review của per-plugin-origin, chi tiết ở Known limits contract đó): link "mở kho" trong plugins-dialog vẫn ghép từ org mặc định (sửa = đổi hình dạng phản hồi API, đường T3); bản sao luật URL thứ tư trong `sdk/tongflow/engine/plugins.py`; di trú tự động khi đổi origin (cần AC + eval git-fixture riêng); 3 LOW (query/fragment lọt qua `requireHttpUrl`, message CLI hardcode `plugins/`, catch trần trong `remoteIsAhead`); `assertSafeGitUrl` lỏng hơn biên manifest. **Lần fork đầu tiên phải mang cả gói này theo.**
- **CI không chạy `pnpm test`** — phát hiện ở round 6: `.github/workflows/ci.yml` chạy lint/typecheck/build/sdk-pytest/pre-merge nhưng không vitest, nên 300+ test và 3 guard mới chỉ có hiệu lực khi chạy tay local. Sửa = chạm workflows = chạm evidence của `ci-actions-bump` — cần contract riêng.
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
| 0.5 | Scoping staleness theo `paths` đã khai | ✅ **xong** — ký 29/07, 7 feature cũ carry-forward cùng PR |
| **0.6** | **Ngữ nghĩa không gian tên đường dẫn + coverage-set** của cổng | 🔴 **contract riêng, quyết ở Cổng 2 của 0.5**. Gộp lỗi fail-open thứ 5: scope chỉ gồm glob t1-exempt (`docs/**`) thì `stale_files()` đã lọc chúng TRƯỚC khi áp scope → staleness set rỗng vĩnh viễn. AC phải mở đúng trục này, eval phủ cả 5 biến thể đã biết — **không vá lẻ**, 4 lần vá lẻ trước đều lòi biến thể kế tiếp |
| **0.7** | **English-only vs văn bản vendor của kit** | 🔴 **contract riêng, quyết ở Cổng 2 của 0.5**. ≈265 dòng tiếng Việt + ≥14 thông điệp `VIOLATION`/`NOTE` CI, và `lib/gap-probe.js` biến một cụm tiếng Việt thành từ khoá điều khiển duy nhất. Nằm trong file vendor (kit 1.24.0) nên sửa tay bị ghi đè lần bump sau → việc thật là quyết định chính sách: xin upstream dịch, hay ghi ngoại lệ vendor vào CLAUDE.md/CONTRIBUTING.md |
| **1.L0** | `pluginRev` + sự kiện `node_cached` + **conformance suite TS↔Python** (ca đầu: `batchField`) | ⏭ **việc lớn kế tiếp**. Không phụ thuộc Q1–Q3 |

## Nghi thức bắt buộc (AGENTS.md)

- **Merge commit, không bao giờ squash** — squash viết lại commit mang chữ ký Cổng 2 và phá vĩnh viễn `signoff.require_human_commit`.
- **Không `--delete-branch`** khi có PR xếp chồng lên nhánh đó (đã từng làm đóng nhầm #12, #13).
- **Không trích chuỗi chữ ký vào phần văn xuôi** của evidence — nó đổi số lần xuất hiện và làm `git log -S` trỏ nhầm commit.
