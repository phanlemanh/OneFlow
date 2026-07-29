# STATUS — OneFlow

> Trạng thái sống của repo — cập nhật cuối mỗi gói việc. Handoff giữa máy/agent đọc **file này + `_acceptance/`**, không đọc lịch sử chat.

## Hiện trạng (2026-07-29)

- **Nền tảng:** fork TongFlow (AGPL-3.0, không CLA, không dual-license — README §License). Đã rebrand OneFlow: logo pixel (`public/logo.svg`, `logo_icon.svg`), xoá COMMERCIAL-LICENSE.md/CLA.md.
- **i18n:** tiếng Việt đủ (`src/i18n/messages/vi.json`). Lưu ý `ja.json` thiếu **76 khoá** so với `en.json` — có sẵn từ upstream, chưa sửa. TTS tầng model vẫn chưa có tiếng Việt (Qwen3-TTS không hỗ trợ → kế hoạch dùng plugin ElevenLabs, P1).
- **Acceptance-Gate Kit:** đang chạy strict/strict. `main` sạch — **9 feature đã ký**. CI 5 job, gate là job thứ 5.
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
| `conformance-l0` | T3 | 28/07 | Engine fan-out khớp canvas; gộp kết quả theo thứ tự batch; suite conformance TS↔Python + mutation guard; `pluginRev` lúc scan; hợp đồng `node_cached` nối thông 3 tầng. Merge 29/07 (PR #25) sau khi gỡ 7 pin stale |

## Đang dở — bắt máy A tiếp ở đây

**`cache-l1-fingerprint` (lát L1 của 1.1) đang bay — verify PASS ở vòng 2 (30/07), chờ chữ ký Cổng 2.** Contract `status: implemented`, 16 tiêu chí / 16 eval / 16 executor key một-đối-một, 133 test SDK xanh. Nhánh `feat/cache-l1-fingerprint`.

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

- [ADR-0001](docs/adr/0001-cache-before-cloud.md) cache trước cloud · [ADR-0002](docs/adr/0002-skill-template-orchestrator.md) skill = template + orchestrator, không mở rộng DSL · [ADR-0003](docs/adr/0003-media-judge-ranker-first.md) judge là ranker tới FPR < 5% · [ADR-0004](docs/adr/0004-universe-kg-three-entities.md) KG 3 thực thể · [ADR-0005](docs/adr/0005-managed-cloud-default.md) managed cloud mặc định · [ADR-0006](docs/adr/0006-defer-vn-compliance.md) hoãn compliance VN · [ADR-0007](docs/adr/0007-sequential-plugin-forking.md) fork plugin tuần tự · [ADR-0008](docs/adr/0008-naming-and-distribution.md) tên & phân phối (`oneflow-sdk`, import `tongflow`, tiền tố `oneflow-`, namespace `phanlemanh`) · [ADR-0009](docs/adr/0009-tts-vi-eleven-v3.md) TTS-vi dùng `eleven_v3`, điều kiện MOS của G0 đóng bằng phán quyết · [ADR-0010](docs/adr/0010-mainstream-infra-and-models.md) ưu tiên hạ tầng & model phổ biến — Modal là lựa chọn, không phải nền tảng
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
| 0.5 | Scoping staleness theo `paths` đã khai | ✅ **xong** — ký 29/07, 7 feature cũ carry-forward cùng PR |
| **0.6** | **Ngữ nghĩa không gian tên đường dẫn + coverage-set** của cổng | 🔴 **contract riêng, quyết ở Cổng 2 của 0.5**. Gộp lỗi fail-open thứ 5: scope chỉ gồm glob t1-exempt (`docs/**`) thì `stale_files()` đã lọc chúng TRƯỚC khi áp scope → staleness set rỗng vĩnh viễn. AC phải mở đúng trục này, eval phủ cả 5 biến thể đã biết — **không vá lẻ**, 4 lần vá lẻ trước đều lòi biến thể kế tiếp. **Mở rộng 29/07:** gộp thêm họ **eval hết hạn ý nghĩa lúc merge** — `prefix_no_config_drift` và `origin_manifest_unmoved` đều diff `origin/main...HEAD` nên ở nhánh sau chúng chấm bài của PR khác. Cùng gốc: hỏi câu hỏi ở một không gian, dùng câu trả lời ở không gian khác — chỉ khác là họ này fail **closed** |
| **0.7** | **English-only vs văn bản vendor của kit** | 🔴 **contract riêng, quyết ở Cổng 2 của 0.5**. ≈265 dòng tiếng Việt + ≥14 thông điệp `VIOLATION`/`NOTE` CI, và `lib/gap-probe.js` biến một cụm tiếng Việt thành từ khoá điều khiển duy nhất. Nằm trong file vendor (kit 1.24.0) nên sửa tay bị ghi đè lần bump sau → việc thật là quyết định chính sách: xin upstream dịch, hay ghi ngoại lệ vendor vào CLAUDE.md/CONTRIBUTING.md |
| **1.L0** | `pluginRev` + sự kiện `node_cached` + **conformance suite TS↔Python** (ca đầu: `batchField`) | ✅ **xong** — ký 28/07, merge 29/07 ([PR #25](https://github.com/phanlemanh/OneFlow/pull/25), merge commit `99a75ad`) |
| **1.L0b** | Gỡ 7 pin stale chặn PR #25 | ✅ **xong** — 6 carry-forward re-pin + 1 re-verify & ký lại (`oneflow-plugin-prefix`). Cách làm giữ ở mục trên vì sẽ gặp lại |
| 0.4b | Chốt Q1–Q3 của spec cache | ✅ **xong** — chốt 29/07, PR #30 ([design doc](docs/superpowers/specs/2026-07-29-cache-open-questions-design.md)). Tầng A khoá theo tenant; `reuse_scope` thiếu → tắt cache; LRU là cơ chế thu hồi duy nhất |
| **1.1-L1** | `digest_form()` + `node_fingerprint()` + test vector ghim lược đồ khoá | ✅ **ký 30/07** — 16 tiêu chí, 2 vòng verify (vòng 1 REJECT, vòng 2 PASS) |
| **1.1-L1b** | **`mime`/`filename` của asset vào digest khoá cache** | 🔴 **contract riêng, quyết ở Cổng 2 của L1**. Cùng bytes + metadata khác → **cùng một khoá** (`denoise_audio`, `audio/wav` vs `audio/mpeg` → `dd316ad8…`). Plugin *thấy* hai field đó, nên ở L2 plugin chọn decoder theo `input.mime` bị phục vụ entry của loại kia. Sửa nằm trong `callog.py` — **của `conformance-l0`** — nên feature đó phải verify lại + ký lại. AC-4/AC-5 chỉ phủ trục `file_key` vs bytes |
| **1.1-L2** | Store cache trên đĩa + blob dedupe + khôi phục 3 thứ (D5), chỉ tầng A | ⏭ **việc lớn kế tiếp sau L1**. Mang theo 2 known limit của L1: `sdk_major()` lỏng, và `mime`/`filename` không vào digest |

## Nghi thức bắt buộc (AGENTS.md)

- **Merge commit, không bao giờ squash** — squash viết lại commit mang chữ ký Cổng 2 và phá vĩnh viễn `signoff.require_human_commit`.
- **Không `--delete-branch`** khi có PR xếp chồng lên nhánh đó (đã từng làm đóng nhầm #12, #13).
- **Không trích chuỗi chữ ký vào phần văn xuôi** của evidence — nó đổi số lần xuất hiện và làm `git log -S` trỏ nhầm commit.
