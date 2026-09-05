# STATUS — OneFlow

> Trạng thái sống của repo — cập nhật cuối mỗi gói việc. Handoff giữa máy/agent đọc **file này + `_acceptance/`**, không đọc lịch sử chat.

## Hiện trạng (2026-09-04, sau khi mở kế hoạch lát cắt chứng minh và đóng băng)

> Chỉ mục tính năng theo góc nhìn người dùng nằm ở [`docs/feature-index.md`](docs/feature-index.md).
> File này giữ vai *đang ở đâu*; *làm gì tiếp* nằm ở **một chỗ duy nhất**: khối kế hoạch trong
> [docs/roadmap.md](docs/roadmap.md), mục "Kế hoạch lát cắt chứng minh".

- **37 hồ sơ đã ký** (guard sổ cái xanh 37/37, 05/09); 36 trên `main`, `lat-cat-chung-minh` đang ở PR #97. Hai hồ sơ ký ngày 04/09 đã hạ cánh: `khong-noi-sai-ve-kho-khoa` (PR #95) và `hang-rao-doc-nham-loi-thanh-khong-co-gi` (PR #96).
- **Định vị ba tầng** ghi ở [vision.md](docs/strategy/vision.md) (04/09): nền tảng đa mục đích → năm trụ cột → lát cắt. Skill #1 là lát cắt chứng minh đầu tiên, không phải định nghĩa sản phẩm.
- **Đóng băng mở hạng mục mới** từ khi `lat-cat-chung-minh` merge tới khi 16/16 ★ và ≥ 85% dòng ✅. Xem tỉ lệ: `pnpm plan:check`. Ngoại lệ chỉ ba lý do: mất-dữ-liệu · bảo-mật · chặn-★, và mỗi ngoại lệ cộng vào mẫu số.
- **Máy dev đang cài 4 plugin:** `oneflow-api-ffmpeg`, `oneflow-api-openai` (phục vụ cả hai slot transcribe — S3 de facto xong), `oneflow-api-pyscenedetect`, `oneflow-modal-compose-overlay` (mắt Modal duy nhất còn lại trên chuỗi Skill #1 → B6).
- **7 nhánh chưa về `main`** (đo 04/09): `feat/director-wire-shape` (11, → B3), `docs/director-lane-d` (5, nằm trong D0), `b01/open-source-rebrand` (4, → B2), `fix/t1-escape-doi-hoi-artifact-ho-so` (2, → S1), `chore/roadmap-alias-guard`, `draft/bo-phan-loai-token`, `chore/acceptance-ci-recheck-all` (park, giữ nguyên trên ổ).
- **Kit gate, hai tầng phiên bản:** plugin cache **acceptance-gate 2.8.0 + feature-loop 2.8.0** (đo 04/09 qua `installed_plugins.json`); thước vendored trong `scripts/pre-merge-check.sh` là bản fork của repo. Hỏi "version nào" phải nêu cả hai — các con số kit cũ ở mục Lịch sử là sử liệu.
- **Nền tảng:** fork TongFlow (AGPL-3.0). SDK `oneflow-sdk` 0.2.18 trên PyPI, import `tongflow`; 0.2.20 đi cùng B4.

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

## Đang dở — bắt máy tiếp ở đây

**Một nguồn duy nhất:** khối `plan-freeze` trong [docs/roadmap.md](docs/roadmap.md), mục
"Kế hoạch lát cắt chứng minh (04/09 → 08/11)". Thứ tự làn B là thứ tự thực thi, một hồ sơ mở tại
một thời điểm; làn A (owner) có hạn theo tuần; ba mốc đồng bộ và luật tái hoạch 09/10 ở §6 của
[thiết kế](docs/superpowers/specs/2026-09-04-lat-cat-chung-minh-design.md).

Bảng điều khiển: `pnpm plan:check` in `plan-freeze: ★ a/16 · tổng c/d · còn băng|GỠ BĂNG`.
Đừng chép bảng ấy vào đây — hai nguồn sự thật là thứ file này từng trôi 18 ngày vì nó.

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
- **[park — desktop 0.1d/S5]** **Desktop shell trỏ `app.tongflow.com`**, artifact tên `TongFlow-*.dmg` — không phát hành desktop tới khi tách. Chờ quyết định URL cloud.
- **[trong kế hoạch A6]** **Token PyPI toàn tài khoản** đang nằm trong `.env` và đã hiện trong transcript phiên 26/07. **Nên thu hồi** và tạo lại loại project-scoped (`oneflow-sdk` đã tồn tại nên tuỳ chọn hẹp giờ có sẵn).
- **[park — gói nợ fork]** **Ghim SDK của 38 plugin chính thức** không sửa được — repo upstream, ta không sở hữu. Sẽ tự giải khi từng plugin được fork.
- **[park]** **Trùng tên "OneFlow"**: GitHub `oneflow` = OneFlow Systems Ltd; `Oneflow-Inc` = framework DL Trung Quốc, và framework đó **giữ tên `oneflow` trên PyPI**. Còn trống: `oneflow-io`, `oneflow-studio`, `oneflowhq`.
- **[park — gate tooling]** **Hai giới hạn guard đã ghi, chưa sửa** — xem mục "Known limits" trong `_acceptance/ci-actions-bump/contract.md` và `_acceptance/oneflow-plugin-prefix/contract.md`. Đều cần contract riêng vì sửa script eval sau khi verify là bắt đầu lại vòng.
- **[đã xử lý]** **2 PR dependabot cũ (#1, #2) đã đóng thủ công** — commit của chúng không nằm trong PR #17 nên GitHub không tự đóng.
- **[park — gói nợ fork]** **Gói nợ "lần fork thật đầu tiên"** (từ 8 round review của per-plugin-origin, chi tiết ở Known limits contract đó). ~~link "mở kho" trong plugins-dialog ghép từ org mặc định~~ **đã sửa 03/08** (`7ff8bd5` — `officialGitUrl(entry)` giải origin theo từng entry, dialog render `p.repoUrl`; văn bản cũ trong file này và trong contract `per-plugin-origin` đã lạc hậu 5 ngày so với code). Còn mở: bản sao luật URL thứ tư trong `sdk/tongflow/engine/plugins.py` (engine standalone ngoài app vẫn ghép từ org mặc định, có `overrides` che); di trú tự động khi đổi origin (cần AC + eval git-fixture riêng — **lưu ý S2 KHÔNG kích hoạt đường này**: nó thay hẳn `id` chứ không dời origin của cùng một id, nên cơ chế 409 không chạm tới); 3 LOW (query/fragment lọt qua `requireHttpUrl`, message CLI hardcode `plugins/`, catch trần trong `remoteIsAhead`); `assertSafeGitUrl` lỏng hơn biên manifest.
- **[trong kế hoạch B4]** **🔴 Hai đường chạy giành nhau đúng một thư mục venv — chưa có contract, phát hiện 17/08.** S2 chỉ sửa **phía TS**. Phía Python thì `_venv_dir()` ([`sdk/tongflow/engine/plugins.py:98`](sdk/tongflow/engine/plugins.py)) vẫn trả `data_dir/.tongflow/plugin-venv` và dựng **một venv chung ngay tại đó** — đúng cái path mà TS nay coi là **root chứa nhiều venv con** ([`plugin-python-env.server.ts:36`](src/lib/plugins/plugin-python-env.server.ts)). Vòng lặp: engine chạy → tạo venv chung ở root → lần chạy TS kế tiếp thấy `pyvenv.cfg` ở root → `removeLegacySharedVenv()` `rmSync(root, recursive)` → **xoá sạch mọi venv per-plugin cùng lúc**. Kiểm chứng trên máy này: root đang có `pyvenv.cfg` + `bin/` + `lib/`, tức đang ở trạng thái venv-chung. Kèm theo, `prepare_python_env` (dòng 233-235) `except Exception → return sys.executable` — **đúng hành vi mà AC-18 vừa cố ý gỡ khỏi phía TS** vì nó biến lỗi cài đặt thành `ImportError` mù. `_acceptance/local-cpu-plugins/contract.md` §Out of scope **không nhắc đường engine**, nên đây là lỗ hổng chưa ghi ở đâu, không phải known limit đã disclose.
- **[park — cost_usd/gpu_type]** **`cost_usd` / `gpu_type` chưa từng được ghi một lần nào.** Không phải "thiếu mặt tiền": grep toàn `src/` cho ra 0 chỗ ghi (chỉ có schema + 2 file test); comment trong `src/db/workspace.schema.ts:48-52` tự khai hai cột này "stay NULL until a backend-neutral plugin metadata channel exists". `duration_ms` thì có ghi thật. Nghĩa là **DoD "mỗi task ghi đủ 3 cột" của hạng mục 0.2 chỉ đạt 1/3 trên đường workflow**, và eval `task-metering` PASS 8/8 vẫn xanh vì nó ký **trước** khi engine thành đường chạy workflow duy nhất — bằng chứng cũ không phủ được lỗ mới.
- **[park]** **Trần 3 lượt chạy đồng thời chỉ chặn một nửa.** `checkConcurrentTaskLimit` chỉ được gọi ở `/api/workflow/execute`; `/api/task/create` không có. Chạy từng node lẻ không bị chặn, và bộ đếm đếm mọi task `pending`+`processing` bất kể loại — nên 3 task node lẻ kẹt ở `pending` sẽ **khoá vĩnh viễn** mọi lượt chạy cả sơ đồ.
- **[trong kế hoạch B2]** **`docker run` một dòng trong README cho ra bản UPSTREAM, không phải bản này.** `README.md` và `docker-compose.yml:11` mặc định kéo `ghcr.io/tong-io/tongflow:latest`; ảnh của fork là `ghcr.io/${{ github.repository }}` và chỉ build khi đẩy tag `v*`. Ai self-host theo README sẽ chạy bản không có ADR-0011 và không có 3 plugin `oneflow-*`.
- ~~**CI không chạy `pnpm test`**~~ — **đã đóng 05/08** (`ci-vitest-sdk-pin`). CI nay có job `Unit Tests (vitest)`; guard `check-vitest-job.sh` canh job không bị làm mềm và tự chứng minh có răng bằng cách đọc lệnh RA TỪ `ci.yml` chứ không ghi cứng.
- **[park — overlay-canvas-reach; B6 thay plugin]** **Known limits của `compose-overlay`** (chi tiết ở contract §Known limits): ~~ghi cứng SDK pin~~ **đã gỡ 05/08** · CLAUDE.md §"Registering an official plugin" mô tả guard bản cũ (`expected_count`) · `compose-overlay-op-form.tsx` dùng `<select>` thô, nhãn enum chưa dịch (5 locale thấy `top-left`, `tiktok-portrait`… tiếng Anh) · workflow nhập ngoài/sửa tay có thể còn dây video ở ô `logo` · schema ops gộp không ràng buộc field theo loại op (Amendment 2 — revisit khi generator hỗ trợ `oneOf`).
- **[đã có bước máy 28/08]** **Agent baseline của kit làm hỏng `node_modules` của repo gốc** (gặp 28/07, round 1 của `conformance-l0`). Sau khi workflow S4 chạy xong, mọi `node_modules/<pkg>` biến thành symlink trỏ vào `/private/var/folders/.../tmp.XXXX/agk-baseline/node_modules/.pnpm/...` — thư mục tạm đó đã bị xoá, nên mọi lệnh `pnpm` chết với `MODULE_NOT_FOUND`, và `pnpm` lại đòi **xoá `node_modules`** (nguy hiểm với lockfile có importer `packages/proprietary` không tồn tại). Cách gỡ đã dùng, an toàn: `CI=true pnpm install --frozen-lockfile` rồi đối chiếu `shasum` của `pnpm-lock.yaml` để chắc lockfile không đổi. **Đừng chạy `pnpm install` không có `--frozen-lockfile`.** — **Đã có bước máy từ 28/08**: `scripts/acceptance/preflight-verify-env.sh`, khai ở `_acceptance/config.yaml` (`executors.script.preflight_env` + đầu `feature_loop.suite_keys`), nên nó là một ô máy của **mọi** vòng verify: xanh thì ô đỏ pnpm của vòng là hồi quy thật, đỏ thì mọi ô đỏ pnpm/node là **NGHI NGỜ hạ tầng** và nó tự in luôn câu lệnh gỡ. Lý do phải là máy chứ không phải mục ghi chú này: mục này đã đứng đây tròn một tháng **kèm cả cách gỡ** mà `chong-doc-sai-em-ru` vẫn **quy oan cho mã hai lần** — round 1 (`pnpm build` exit 1) và round 2 (`pytest` exit 2). Hai trục, đừng trộn: bẫy **nổ** ba lần (round 3 `pnpm build` exit 1 nữa) nhưng round 3 được **bắt đúng**, vì lúc đó đã có thứ tự "kiểm `.modules.yaml` trước khi đọc ô đỏ" — chính thứ tự mà bước máy này nay tự thi hành. Thêm bẫy kiểm-được-bằng-máy thì thêm một hàm `check_*` vào script đó, đừng thêm một gạch đầu dòng ở đây. — **ĐÍNH CHÍNH CÁCH GỠ, đo 28/08 trên cây hỏng THẬT dựng lại trong kho nháp:** một mình `CI=true pnpm install --frozen-lockfile` **KHÔNG gỡ được** — pnpm trả *"Already up to date"* rồi bỏ qua cây hỏng; thêm `--force` cũng vậy; xoá riêng `.modules.yaml` cũng vậy (pnpm không tạo lại). Chỉ **`rm -rf node_modules && CI=true pnpm install --frozen-lockfile`** mới phục hồi (`pnpm build` xanh lại, shasum `pnpm-lock.yaml` không đổi). Vẫn phải giữ `--frozen-lockfile` — nó là thứ chặn pnpm ghi lại lockfile. Lần gỡ 28/07 thành công nên coi đây là *"không phải lúc nào cũng đủ"*, không phải *"ghi sai"*. Cẩn thận: `rm -rf node_modules` phá cây dùng chung, kiểm không có phiên nào đang chạy vòng verify trước khi xoá. **Cơ chế gây hỏng cũng đã tái lập được:** worktree tạm `agk-baseline` + `node_modules` symlink về cây gốc, pnpm chặn bằng `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY` — **và chính thông báo lỗi đó bảo đặt `CI=true`**; làm theo là ghi `virtualStoreDir` của cây gốc trỏ ra thư mục tạm. **Quyết định owner 28/08: `runBaseline` TẮT làm mặc định cho mọi vòng verify** — không còn là tuỳ chọn mỗi phiên tự cân. Đo ba lần trong một buổi (`chong-doc-sai-em-ru` vòng 1, 2, 3, chuỗi tmp khác nhau mỗi vòng): bộ đo ghi đè `.modules.yaml` của cây chính **giữa lúc đang chạy**, nên chính nó gây ô đỏ mà nó rồi báo cáo. Sau khi tắt, vòng 4, 5, 6 đều có `failedCommands` RỖNG — ba vòng sạch liên tiếp. Phép kiểm nhanh nay là `bash scripts/acceptance/preflight-verify-env.sh`.
- **[ghi chú môi trường]** **Môi trường dev macOS**: 3 executor `sdk_pytest*` nay chạy qua `uv` (PEP 668 chặn pip vào Homebrew Python — CI xanh nhưng máy dev đỏ với lệnh cũ); `uv` đã vào CONTRIBUTING prerequisites. pnpm 11 cần `pnpm-workspace.yaml` local với `allowBuilds` (trường `pnpm.onlyBuiltDependencies` trong package.json không còn được đọc) — file này untracked, lockfile committed có importer `packages/proprietary` không tồn tại trong repo public, cẩn thận đừng để pnpm prune nó.

## Kế hoạch 24 tuần (product-only)

Bản chuẩn duy nhất: **[docs/roadmap.md](docs/roadmap.md)** (4 phase, gate G0–G3 với DoD; cập nhật mỗi lần qua gate — không lặp bảng ở đây để tránh hai nguồn sự thật). Tầm nhìn & bằng chứng thẩm định: [docs/strategy/](docs/strategy/vision.md).

## Hàng đợi — đã chuyển

Bảng "Hàng đợi hiện hành" (0.1a … 1.5) dừng cập nhật ngày 17/08 và bị thay bằng khối kế hoạch
trong docs/roadmap.md ngày 04/09. Sử liệu của bảng cũ: `git show eb175ed:STATUS.md`.

## Nghi thức bắt buộc (AGENTS.md)

- **Merge commit, không bao giờ squash** — squash viết lại commit mang chữ ký Cổng 2 và phá vĩnh viễn `signoff.require_human_commit`.
- **Không `--delete-branch`** khi có PR xếp chồng lên nhánh đó (đã từng làm đóng nhầm #12, #13).
- **Không trích chuỗi chữ ký vào phần văn xuôi** của evidence — nó đổi số lần xuất hiện và làm `git log -S` trỏ nhầm commit.
- **Phân vùng phiên (đo 04/09):** hai phiên có thể chạy trên cùng cây, và HEAD dời dưới chân phiên đang đọc. Trước khi chạm `docs/roadmap.md`, `STATUS.md`, `_acceptance/**`, `PRODUCT-MAP.md`: `ListAgents`, nhắn phiên peer nêu rõ file mình sẽ ghi, đợi xác nhận; nhắn trước khi checkout đổi nhánh. Đo lại `git rev-parse HEAD` trước mỗi phép đo dựa vào cây.
