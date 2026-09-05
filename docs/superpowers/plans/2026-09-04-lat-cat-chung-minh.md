# Lát cắt chứng minh (B1) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đưa khối kế hoạch máy-đọc + luật đóng băng vào `docs/roadmap.md`, dựng guard `check-plan-freeze.mjs` có răng trong job `Acceptance Gate`, park ba cơ hội, viết lại STATUS.md / vision.md, và mở hồ sơ T2 `lat-cat-chung-minh` sẵn cho Cổng 1.

**Architecture:** Một khối markdown giữa hai marker `plan-freeze:start/end` là nguồn sự thật duy nhất của kế hoạch; một guard Node-builtins đọc khối đó cùng `_acceptance/*/{contract,opportunity}.md` và trả bốn phán quyết F1–F4 (+F0 fail-closed), in tỉ lệ mỗi lần chạy; một teeth script chứng minh guard biết đỏ và biết tan băng. Guard được đấu vào CI theo đúng khuôn `check-roadmap-fresh.sh` (step có tên trong job `Acceptance Gate`, hằng số needle trong `check-gate-guards-job.sh`, khoá executor + suite key trong `_acceptance/config.yaml`).

**Tech Stack:** Node 24 (`node:fs`, `node:path` — không dependency), bash + python3 cho teeth (khuôn `scripts/roadmap/check-roadmap-guard-teeth.sh`), Acceptance-Gate Kit 2.7.0 (`_acceptance/`, generator `product-map.mjs` trong plugin cache).

**Spec:** `docs/superpowers/specs/2026-09-04-lat-cat-chung-minh-design.md` — đọc §3 (khối kế hoạch), §5 (guard), §8 (tài liệu), §9 (AC) trước khi làm.

## Global Constraints

- Nhánh làm việc: `feat/lat-cat-chung-minh` (đã tồn tại, chứa commit spec `af6d8cd`). Không commit thẳng `main`.
- Guard và teeth **chỉ dùng `node:` builtins** — job `Acceptance Gate` không có `node_modules`.
- Guard **từ chối mọi tham số** (exit 2): mode `teeth` của `check-gate-guards-job.sh` nối `--co-rac-khong-ton-tai` vào lệnh và đòi thoát khác 0.
- Trong khối kế hoạch: slug ở **cột riêng**, không nháy ngược; cột ★ chỉ `★`/rỗng; trạng thái chỉ `⬜ ◐ ✅`; không ký tự `|` trong ô; **không** nhắc `ADR-0013` hay bất kỳ `ADR-dddd` nào chưa có trên `main` (guard sổ cái quét mọi `ADR-\d{4}` trong roadmap).
- Đoạn văn xuôi dòng 211 của roadmap **không dùng nháy ngược**.
- Không sửa `scripts/pre-merge-check.sh` (đường vendor), không đụng `t3_paths`.
- Mỗi commit: Conventional Commits, tiếng Việt không dấu trong tiêu đề như các commit hiện có; message viết ra file rồi `git commit -F` (hook chặn nhầm `git commit -q -m` — xem memory). Không dùng cờ bỏ qua hook.
- Comment trong code: **English only** (CLAUDE.md). Thông điệp guard in ra cho người: tiếng Việt, gọi đúng tên slug (luật N1–N6 của kit).
- Trước mỗi commit chạm `scripts/**`: `pnpm lint:check` (Biome không quét `.mjs` ngoài `src/`? — vẫn chạy để chắc), và `bash scripts/acceptance/preflight-verify-env.sh` nếu định chạy vòng verify.
- Owner làm ba việc người: **ký Cổng 1 sau Task 0** (quyết định §11 spec: hồ sơ này xin chữ ký thật, không đi đường tự-đi-tiếp của T2), ký Cổng Đáng của cơ hội `skill-1-footage-kho-clip` (= A1, bất kỳ lúc nào sau Task 0), và commit `decided_by` / `decided_at` cho ba cơ hội park (Task 1 chỉ điền `stage` + `decision`).
- **Kit đang chạy: acceptance-gate 2.8.0 + feature-loop 2.8.0** (đo 04/09 qua `installed_plugins.json`). Không hardcode đường dẫn plugin cache — tìm bằng resolver: `RP=$(ls -d "$HOME"/.claude/plugins/cache/acceptance-gate-kit/feature-loop/*/scripts/resolve-plugin.mjs | sort -V | tail -1); AG=$(node "$RP" --plugin acceptance-gate --require scripts/product-map.mjs)` — in ra gốc bản đang cài, exit 1 nếu thiếu.
- Luật 2.8.0 áp cho hồ sơ này: gap-probe dispatch **đồng bộ** với **6 input** (design doc, contract, evals, decisions, claims nếu có, opportunity); feature không chạm UI phải có entry `descope` mở đầu đúng chuỗi `"bỏ đặc-tả-UX — …"`; cơ hội nội bộ khai ngưỡng bằng **một dòng** `Không đo được — …`; `machine-cleared` chưa có đường ghi — vòng kết bằng `signed-off`.

---

## File map

| File | Vai trò | Task |
|---|---|---|
| `_acceptance/lat-cat-chung-minh/{opportunity.md,contract.md,evals.yaml,decisions.jsonl,gap-probe.md}` | hồ sơ T2 (S1) — ngưỡng "Không đo được", 14 AC, gap-probe 6 input, thẻ Cổng 1 | 0 |
| `_acceptance/skill-1-footage-kho-clip/opportunity.md` | cơ hội của lát cắt ở `discovery` với U1–U8 + ba số G0 mang `[đề xuất]`; A1 = owner ký Cổng Đáng | 0 |
| `docs/roadmap.md` | khối `plan-freeze`, dòng S3, 1.5/1.6, đoạn 211, mục mới | 1 |
| `_acceptance/{director-v2,timeline-view,staleness-ho-so-thieu-paths}/opportunity.md` | `stage: decided`, `decision: park` | 1 |
| `scripts/roadmap/check-plan-freeze-teeth.sh` | răng: 12 case, mỗi case một mã thoát | 2 |
| `scripts/roadmap/check-plan-freeze.mjs` | guard F0–F4, tỉ lệ, gỡ băng, NOTE mốc | 3 |
| `package.json` | `plan:check`, `plan:teeth` | 3 |
| `scripts/roadmap/check-plan-docs.sh` | AC-12: tài liệu đúng số | 4 |
| `docs/strategy/vision.md` · `STATUS.md` | định vị ba tầng · viết lại hiện trạng, con trỏ, nhãn nợ, nghi thức phân vùng | 4 |
| `scripts/ci/check-product-map.mjs` · `scripts/ci/check-product-map-teeth.sh` · `PRODUCT-MAP.md` | ô "Xếp lại sau" theo `decision`, ô rỗng không heading; case `parked-opportunity`; sinh lại bản đồ | 5 |
| `.github/workflows/ci.yml` · `scripts/ci/check-gate-guards-job.sh` · `_acceptance/config.yaml` | hai step mới; needle + skip + perturb; khoá executor + suite key | 6 |
| (không file mới) | kiểm toàn cục, re-pin, PR, bàn giao Cổng 2 | 7 |

---

### Task 0: Hồ sơ S1 — contract + evals + cơ hội của lát cắt, gap-probe, thẻ Cổng 1

**Files:**
- Create: `_acceptance/lat-cat-chung-minh/opportunity.md`, `contract.md`, `evals.yaml`, `decisions.jsonl`, `gap-probe.md` (máy sinh ở Step 6)
- Create: `_acceptance/skill-1-footage-kho-clip/opportunity.md`

**Interfaces:**
- Consumes: design doc `docs/superpowers/specs/2026-09-04-lat-cat-chung-minh-design.md`; các khoá executor `lcm_*` sẽ được Task 6 khai (evals tham chiếu `config:` — hợp lệ ở S1 dù khoá chưa tồn tại; S4 mới chạy).
- Produces: hồ sơ `status: draft` chờ Cổng 1; cơ hội lát cắt `stage: discovery` chờ Cổng Đáng (A1). Sau Task 0, **feature-loop S1 kết thúc**; Task 1–7 là S3.

- [ ] **Step 1: `_acceptance/lat-cat-chung-minh/opportunity.md`**

```markdown
---
schema_version: 1
slug: lat-cat-chung-minh
feature: Lát cắt chứng minh — kế hoạch hợp nhất, luật đóng băng và guard
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-09-04T00:00:00Z
prototype:
  base_commit:
  disposition: archive
---

## Vấn đề & ai gặp

Owner (04/09): bốn nguồn kế hoạch (roadmap, STATUS.md, hồ sơ, nhánh) kể bốn chuyện; STATUS.md
đề ngày 17/08 ghi 17 hồ sơ trong khi 36 đã ký; hơn một chục hồ sơ/nợ được đặt tên rồi không ai
mở; 7 nhánh treo; một ADR chấp nhận 26/08 chưa về main. Trong 15 hồ sơ ký từ 27/08, 7 là hạ
tầng quy trình. Cỗ máy đã có, chưa có tính năng nào người dùng dùng được. Bằng chứng: phiên
điều tra 04/09, §1 của thiết kế.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Một khối máy-đọc duy nhất + guard trong CI đủ để ba tài liệu ngừng trôi | STATUS/roadmap lại lệch trong 2 tuần | check-plan-docs.sh + tỉ lệ in mỗi lần CI | Chưa thử |
| 2 | Đóng băng có răng không làm nghẹt sửa lỗi thật | ngoại lệ mất-dữ-liệu/bảo-mật không mở được | case ngoai-le-tran chiều xanh (lý do hợp lệ) | Chưa thử |
| 3 | Băng tan được khi đủ ★ | guard thành khoá vĩnh viễn | case go-bang | Chưa thử |

## Ngưỡng chết / ngưỡng UAT

Không đo được — việc nội bộ của bộ công cụ, không có người dùng cuối; giá trị của nó đo qua Cổng Giá trị của cơ hội skill-1-footage-kho-clip (lát cắt), không phải qua hồ sơ này.

## Cổng 0

- **decision = build.** Căn cứ: quyết định owner 04/09 (§11 thiết kế); hạng mục mới cuối cùng trước băng.
- **disposition = archive.** Không có prototype — hồ sơ hạ tầng quy trình.
- **Ngưỡng UAT chốt cùng lúc ký:** Không đo được (dòng trên).

## Out of scope từ khám phá

- Hạ cánh D0, b01, B4–B10 — mỗi cái một hồ sơ riêng theo khối kế hoạch.
- Sửa `scripts/pre-merge-check.sh` (đường vendor); chặn nhánh hay plan nháp.
- Mục "Làn D" và số ADR Director trong roadmap — việc của B3.
```

- [ ] **Step 2: `_acceptance/lat-cat-chung-minh/contract.md`**

```markdown
---
schema_version: 1
feature: Lát cắt chứng minh — kế hoạch hợp nhất, luật đóng băng và guard
slug: lat-cat-chung-minh
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [cli, docs]
status: draft
approved_by:
approved_at:
design_doc: docs/superpowers/specs/2026-09-04-lat-cat-chung-minh-design.md
---

# Acceptance Contract: lat-cat-chung-minh

## Context

Bốn nguồn kế hoạch của repo trôi khỏi nhau và hạng mục mới mở nhanh hơn hạng mục đóng (đo
04/09, §1 thiết kế). Hồ sơ này đặt một khối kế hoạch máy-đọc vào docs/roadmap.md, một luật đóng
băng có răng trong job Acceptance Gate, park ba cơ hội, mở cơ hội của lát cắt để owner ký
ngưỡng, và đưa STATUS.md / vision.md về đúng sự thật. Đây là hạng mục mới cuối cùng được nhận
trước băng.

Source input: docs/superpowers/specs/2026-09-04-lat-cat-chung-minh-design.md

## Criteria

- AC-1: Given docs/roadmap.md có khối plan-freeze, When guard đọc, Then đếm được đúng 20 dòng kế hoạch, 16 dòng ★, ba bảng, và header đủ bốn khoá plan/opened/unlock/checkpoint.
- AC-2: Given một thư mục `_acceptance/<slug>/` mới ở trạng thái mở (contract chưa signed-off, hoặc opportunity discovery/build/iterate) với slug ngoài ba bảng, When guard chạy trước gỡ băng, Then thoát 1 với `VIOLATION [plan-freeze] F1: <slug> mở ngoài kế hoạch`.
- AC-3: Given một dòng có slug đánh ✅ mà contract chưa signed-off, When guard chạy, Then thoát 1 với mã F2 nêu đúng slug; và Given một dòng slug `—` không mang chỉ dẫn kiểm đánh ✅, Then guard không đỏ nhưng in dòng đó trong danh sách "tin theo lời".
- AC-4: Given một slug ở bảng Xếp lại sau có thư mục mà opportunity.md không mang `decision: park`, When guard chạy, Then thoát 1 với mã F3 nêu đúng slug.
- AC-5: Given một dòng Ngoại lệ với lý do ngoài {mất-dữ-liệu, bảo-mật, chặn-★} hoặc thiếu ngày/ai quyết, When guard chạy, Then thoát 1 với mã F4.
- AC-6: Given mọi dòng ★ ✅ và ≥ 85% dòng ✅ với contract của mọi slug ★ signed-off, When guard chạy, Then in `GỠ BĂNG`, thoát 0, và một thư mục mở ngoài kế hoạch không còn làm guard đỏ.
- AC-7: Given `PLAN_FREEZE_TODAY` sau ngày checkpoint và header không có `checkpoint_done`, When guard chạy, Then in NOTE mốc tái hoạch và mã thoát không đổi; Given có `checkpoint_done`, Then không in NOTE.
- AC-8: Given khối thiếu marker, thiếu khoá header, sai số cột, hoặc trạng thái ngoài ⬜ ◐ ✅, When guard chạy, Then thoát 1 với mã F0 — fail-closed.
- AC-9: Given ci.yml, check-gate-guards-job.sh và config.yaml sau đấu dây, When chạy check-gate-guards-job.sh ở các mode shape, reachable, suite-keys, teeth, Then guard mới là một step có tên trong job Acceptance Gate, là một suite key, và mode teeth chứng minh nó đỏ trên cây đã phá.
- AC-10: Given check-plan-freeze-teeth.sh, When chạy toàn bộ, Then 13/13 case xanh, mỗi case một mã thoát và một token `CASE <tên>: PASS`; tên case lạ bị từ chối exit 2; `--selftest-fail` in FAIL.
- AC-11: Given ba cơ hội director-v2, timeline-view, staleness-ho-so-thieu-paths mang `decision: park` và PRODUCT-MAP.md sinh lại, When chạy check-product-map.mjs và case răng parked-opportunity, Then checker xanh với ô "Xếp lại sau" = 3 và case răng đỏ đúng chỗ.
- AC-12: Given STATUS.md, vision.md, roadmap.md sau hồ sơ này, When chạy check-plan-docs.sh, Then mọi phép kiểm OK (ngày 04/09, 36 hồ sơ, con trỏ, phân vùng phiên, đoạn định vị, S3 de facto, 1.5→B5, 1.6→B7, đoạn tỉ lệ 16/36 không nháy ngược, không ADR-0013) và guard sổ cái xanh.
- AC-13: Given guard và teeth, When grep import và chạy guard trong thư mục không có node_modules, Then chỉ dùng `node:` builtins, vẫn chạy được, và guard từ chối tham số lạ với exit 2.
- AC-14: Given dòng A1 mang ghi chú `kiểm: opportunity:skill-1-footage-kho-clip` và đánh ✅ trong khi opportunity ấy chưa có `decision` hoặc chưa có `decided_by`, When guard chạy, Then thoát 1 với mã F2 nêu đúng slug cơ hội; Given cơ hội đã ký Cổng Đáng, Then A1 ✅ được nhận mà không vào danh sách "tin theo lời".

## Coverage

- Trục phán quyết: F0 · F1 · F2 (contract) · F2 (opportunity — kiểm A1) · F3 · F4 [thước CE: mỗi phán quyết một case đỏ + case chiều ngược cho F1 (go-bang) và F2 (tin-theo-loi)]
- Trục vòng đời: đóng băng · gỡ băng · mốc tái hoạch · đóng kế hoạch (`closed:` — chưa có case, ghi Known limits)
- Trục đấu dây: step CI · needle guard-của-guard · suite key local · bản đồ sản phẩm
- Trục tài liệu: roadmap · STATUS.md · vision.md · ba opportunity park · cơ hội lát cắt

## Out of scope

- Không hạ cánh D0, b01, các hồ sơ B4–B10; không mở hồ sơ Should.
- Không sửa scripts/pre-merge-check.sh; không chặn nhánh hay docs/superpowers/plans.
- Không phân loại lại cột "Vị trí trên lộ trình" của sổ cái; không thêm mục "Làn D".
- Không kiểm `closed:` bằng răng; không kiểm B10 qua `verdict` (dòng B10 tin theo lời).
- `decided_by`/`decided_at` của ba cơ hội park do owner điền trong commit chỉ-trường-người.

## Notes

- Hồ sơ nội bộ: ngưỡng khai `Không đo được` nên không có section Đường đo; giá trị của lát cắt đo tại Cổng Giá trị của `skill-1-footage-kho-clip`.
- Thiết kế §5 định nghĩa hình dạng khối; §6.3 luật tái hoạch 09/10; §7 quyết định về Vercel AI Gateway (không vào đường ★).
- Guard sổ cái quét mọi `ADR-\d{4}` trong roadmap: khối kế hoạch không nhắc số ADR chưa có trên main.
```

- [ ] **Step 3: `_acceptance/lat-cat-chung-minh/evals.yaml`**

```yaml
schema_version: 1
feature_slug: lat-cat-chung-minh

# T2, mười bốn tiêu chí, lớp script + tài liệu. Không (cross-layer). Mỗi case răng một khoá
# executor riêng (bài học stale_scope_* / roadmap_teeth_*): case chưa cài và case đã qua
# không được trông giống nhau sau một mã thoát.

evals:
  - id: E1
    criterion: AC-1
    executor: script
    cmd: config:executors.script.lcm_teeth_clean
    paths: ["docs/roadmap.md", "scripts/roadmap/check-plan-freeze.mjs", "scripts/roadmap/check-plan-freeze-teeth.sh"]
    expected: >-
      exit 0 và stdout `CASE clean: PASS`. Ca này đòi dòng tỉ lệ có dạng `★ a/16 · tổng c/20`
      trên cây thật — một guard in 0/0 cũng xanh nhưng không qua được ca này.
    evidence_required: [run_id, exit_code, verifier, verified_at, output]

  - id: E2
    criterion: AC-2
    executor: script
    cmd: config:executors.script.lcm_teeth_o_moi
    paths: ["scripts/roadmap/check-plan-freeze.mjs", "scripts/roadmap/check-plan-freeze-teeth.sh"]
    expected: exit 0 và stdout `CASE o-moi-ngoai-ke-hoach: PASS` — guard đỏ F1 và gọi đúng slug lạ.
    evidence_required: [run_id, exit_code, verifier, verified_at, output]

  - id: E3
    criterion: AC-3
    executor: script
    cmd: config:executors.script.lcm_teeth_tick_noi_doi
    paths: ["scripts/roadmap/check-plan-freeze.mjs", "scripts/roadmap/check-plan-freeze-teeth.sh"]
    expected: exit 0 và stdout có cả `CASE tick-noi-doi: PASS` lẫn `CASE tin-theo-loi: PASS` — chiều đỏ F2 và chiều tin-theo-lời.
    evidence_required: [run_id, exit_code, verifier, verified_at, output]

  - id: E4
    criterion: AC-4
    executor: script
    cmd: config:executors.script.lcm_teeth_park
    paths: ["scripts/roadmap/check-plan-freeze.mjs", "scripts/roadmap/check-plan-freeze-teeth.sh", "_acceptance/timeline-view/opportunity.md"]
    expected: exit 0 và stdout `CASE park-khong-that: PASS`.
    evidence_required: [run_id, exit_code, verifier, verified_at, output]

  - id: E5
    criterion: AC-5
    executor: script
    cmd: config:executors.script.lcm_teeth_ngoai_le
    paths: ["scripts/roadmap/check-plan-freeze.mjs", "scripts/roadmap/check-plan-freeze-teeth.sh"]
    expected: exit 0 và stdout `CASE ngoai-le-tran: PASS`.
    evidence_required: [run_id, exit_code, verifier, verified_at, output]

  - id: E6
    criterion: AC-6
    executor: script
    cmd: config:executors.script.lcm_teeth_go_bang
    paths: ["scripts/roadmap/check-plan-freeze.mjs", "scripts/roadmap/check-plan-freeze-teeth.sh"]
    expected: >-
      exit 0 và stdout `CASE go-bang: PASS` — ca chiều ngược: 16/16 ★ + 20/20 → `GỠ BĂNG`, và
      hồ sơ lạ không còn làm đỏ. Đây là ca chịu lực: không có nó, một guard khoá vĩnh viễn qua
      mọi ca khác.
    evidence_required: [run_id, exit_code, verifier, verified_at, output]

  - id: E7
    criterion: AC-7
    executor: script
    cmd: config:executors.script.lcm_teeth_checkpoint
    paths: ["scripts/roadmap/check-plan-freeze.mjs", "scripts/roadmap/check-plan-freeze-teeth.sh"]
    expected: exit 0 và stdout có `CASE checkpoint-note: PASS` và `CASE checkpoint-done: PASS` — NOTE không đổi mã thoát; checkpoint_done tắt NOTE.
    evidence_required: [run_id, exit_code, verifier, verified_at, output]

  - id: E8
    criterion: AC-8
    executor: script
    cmd: config:executors.script.lcm_teeth_khoi_hong
    paths: ["scripts/roadmap/check-plan-freeze.mjs", "scripts/roadmap/check-plan-freeze-teeth.sh"]
    expected: exit 0 và stdout `CASE khoi-hong: PASS` — thiếu marker → F0, fail-closed.
    evidence_required: [run_id, exit_code, verifier, verified_at, output]

  - id: E9
    criterion: AC-9
    executor: script
    cmd: config:executors.script.lcm_wiring
    paths: [".github/workflows/ci.yml", "scripts/ci/check-gate-guards-job.sh", "_acceptance/config.yaml", "scripts/roadmap/check-plan-freeze.mjs"]
    expected: >-
      exit 0; stdout của mode shape nêu cả hai guard nằm trong job; mode teeth in
      `lệnh dưới phép thử … check-plan-freeze.mjs` và không FAIL — tức guard đỏ trên cây đã
      phá (hồ sơ teeth-probe-freeze) và xanh trên cây lành.
    evidence_required: [run_id, exit_code, verifier, verified_at, output]

  - id: E10
    criterion: AC-10
    executor: script
    cmd: config:executors.script.plan_freeze_teeth_all
    paths: ["scripts/roadmap/check-plan-freeze-teeth.sh", "scripts/roadmap/check-plan-freeze.mjs"]
    expected: exit 0 và dòng cuối `✅ răng: 13/13 case — mỗi case một mã thoát riêng`; kèm `CASE case-isolation: PASS` (tên lạ bị từ chối, selftest-fail in FAIL).
    evidence_required: [run_id, exit_code, verifier, verified_at, output]

  - id: E11
    criterion: AC-11
    executor: script
    cmd: config:executors.script.lcm_pmap
    paths: ["scripts/ci/check-product-map.mjs", "scripts/ci/check-product-map-teeth.sh", "PRODUCT-MAP.md", "_acceptance/director-v2/opportunity.md", "_acceptance/timeline-view/opportunity.md", "_acceptance/staleness-ho-so-thieu-paths/opportunity.md"]
    expected: exit 0; stdout checker in `xếp lại sau: 3 hồ sơ, 3 mục trên bản đồ, nút mermaid 3` và `CASE parked-opportunity: PASS`.
    evidence_required: [run_id, exit_code, verifier, verified_at, output]

  - id: E12
    criterion: AC-12
    executor: script
    cmd: config:executors.script.lcm_docs
    paths: ["STATUS.md", "docs/strategy/vision.md", "docs/roadmap.md", "scripts/roadmap/check-plan-docs.sh"]
    expected: exit 0 và dòng cuối `✅ check-plan-docs: tài liệu khớp kế hoạch`, không dòng `FAIL:` nào.
    evidence_required: [run_id, exit_code, verifier, verified_at, output]

  - id: E13
    criterion: AC-13
    executor: script
    cmd: config:executors.script.lcm_teeth_builtins
    paths: ["scripts/roadmap/check-plan-freeze.mjs", "scripts/roadmap/check-plan-freeze-teeth.sh"]
    expected: exit 0 và stdout `CASE builtins-only: PASS` — chỉ import `node:`; cờ rác → exit 2 kèm "không nhận tham số".
    evidence_required: [run_id, exit_code, verifier, verified_at, output]

  - id: E14
    criterion: AC-14
    executor: script
    cmd: config:executors.script.lcm_teeth_kiem_co_hoi
    paths: ["scripts/roadmap/check-plan-freeze.mjs", "scripts/roadmap/check-plan-freeze-teeth.sh", "_acceptance/skill-1-footage-kho-clip/opportunity.md"]
    expected: exit 0 và stdout `CASE kiem-co-hoi: PASS` — A1 ✅ khi cơ hội chưa ký Cổng Đáng → F2 nêu `skill-1-footage-kho-clip`; cơ hội đã ký → xanh và A1 không nằm trong "tin theo lời".
    evidence_required: [run_id, exit_code, verifier, verified_at, output]

  - id: J1
    criterion: AC-2
    executor: judgment
    rubric: >-
      Đọc stdout/stderr của guard ở các ca F1–F4 (trong evidence của E2, E4, E5, E3): mỗi thông
      điệp gọi đúng tên slug, nói THỨ gì sai và VIỆC gì phải làm (thêm Ngoại lệ / park / ký),
      không dùng mã lỗi trần thay câu người (luật N1–N6 của kit). PASS nếu cả bốn đạt.
    evidence_required: [run_id, verifier, verified_at, output]
```

- [ ] **Step 4: `_acceptance/lat-cat-chung-minh/decisions.jsonl` (ba entry)**

```jsonl
{"at":"2026-09-04T12:00:00Z","id":"d-20260904T120000Z-lcm1","type":"descope","stage":"S1","decision":"[khong kiem closed: bang rang] Khoa header `closed:` co trong guard de ket thuc ke hoach ma khong go guard, nhung chua co case rang — ghi Known limits, khong phai AC. Ly do: ke hoach chua ket thuc, mot case chua co du lieu that de doi chieu."}
{"at":"2026-09-04T12:05:00Z","id":"d-20260904T120500Z-lcm2","type":"descope","stage":"S1","decision":"[decided_by/at la truong nguoi] Ba co hoi park chi nhan stage/decision tu may; decided_by va decided_at do owner commit rieng, cung nghi thuc chu ky Cong 2. Guard F3 chi doc decision nen khong phu thuoc hai truong nay."}
{"at":"2026-09-04T12:10:00Z","id":"d-20260904T121000Z-lcm3","type":"descope","stage":"S1","decision":"bỏ đặc-tả-UX — hồ sơ chạm cli và docs, không có bề mặt UI nào; khuôn ux-spec-template không áp dụng","impact":"không có gì để soi ở Cổng 1 về UI — đúng bản chất hồ sơ hạ tầng quy trình"}
```

- [ ] **Step 5: `_acceptance/skill-1-footage-kho-clip/opportunity.md` — cơ hội của lát cắt, chờ Cổng Đáng (A1)**

```markdown
---
schema_version: 1
slug: skill-1-footage-kho-clip
feature: Skill #1 Footage → kho clip 9:16 — lát cắt chứng minh đầu tiên của nền tảng
owner: phanlemanh@gmail.com
stage: discovery
decision:
decided_by:
decided_at:
prototype:
  base_commit:
  disposition:
---

## Vấn đề & ai gặp

Người bán hàng hoặc môi giới có livestream / tour quay điện thoại nhưng không có clip 9:16 có
phụ đề và khung giá đúng để đăng. Hôm nay OneFlow có đủ mắt xích (split, transcribe, overlay)
nhưng phải tự nối 6–7 node và cần tài khoản Modal cho overlay. Bằng chứng: phiên điều tra
04/09 (§1 thiết kế lat-cat-chung-minh), feature-index 17/08.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Người dùng đại diện tự nhập được key (ADR-0011) | managed quay lại làm mặc định (Phase 2) | phiên UAT, đếm ≥ 2/3 | Chưa thử |
| 2 | WER thực địa ≤ 10% qua đường API hiện có | wedge chuyển sang phụ đề có bước sửa tay | B9 trên corpus A3 | Chưa thử |
| 3 | Đổi giá chỉ chạy lại overlay (cache tầng B giữ transcribe) | lời hứa "sửa rẻ" không đứng | telemetry cache_calls_* ở G1 | Chưa thử |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] một người dùng đại diện, không phải tác giả, trên máy trắng, có đưa footage vào và nhận về kho clip 9:16 đúng phụ đề đúng giá, và đổi giá mà chỉ overlay chạy lại không?
- Kết quả nào là SỐNG: [đề xuất] U1 cài + tự nhập key ≤ 30 phút, ≥ 2/3 người tự làm được · U2 một nút · U3 WER ≤ 10% và lỗi token chữ số trên câu có giá = 0 · U4 50 clip liên tiếp không lỗi dấu/giá · U5 đổi giá → chỉ overlay + merge chạy lại · U6 headless = canvas · U7 COGS ≤ $11/seller/tháng · U8 không cần Modal
- Kết quả nào là CHẾT: [đề xuất] < 1/3 người tự nhập được key (đảo chiều ADR-0011) · WER > 15% (vùng chết hội đồng) · đổi giá làm transcribe chạy lại
- Timebox: [đề xuất] UAT trước 11.11.2026 (T14); tái hoạch 09/10 theo §6.3 thiết kế lat-cat-chung-minh

## Cổng 0

- **decision = …** Căn cứ: … (owner điền khi ký — đây là A1 của khối kế hoạch; gỡ tiền tố [đề xuất] ở ba bullet trên là chốt ngưỡng)
- **disposition = archive.** Không có prototype trước hợp đồng.
- **Ngưỡng UAT chốt cùng lúc ký:** ba bullet trên sau khi gỡ [đề xuất].

## Out of scope từ khám phá

- TTS/lồng tiếng (1.4), ingest ngược về media-library (Should S3), Skill #2, judge.
- Bộ nhớ Director (D1–D4, park).
```

- [ ] **Step 6: claim-scan + gap-probe đồng bộ (bước mặc định T2 của kit 2.8.0)**

Run (resolver, không hardcode):
```bash
RP=$(ls -d "$HOME"/.claude/plugins/cache/acceptance-gate-kit/feature-loop/*/scripts/resolve-plugin.mjs | sort -V | tail -1)
FL=$(node "$RP" --plugin feature-loop --require scripts/claim-scan.mjs)
node "$FL/scripts/claim-scan.mjs" --root . --slug lat-cat-chung-minh > "$TMPDIR/claims-lat-cat-chung-minh.md"; echo "exit=$?"; wc -c "$TMPDIR/claims-lat-cat-chung-minh.md"
```
Rồi dispatch **một** subagent context sạch (Agent tool, `run_in_background: false`) với đúng các input: design doc, `contract.md`, `evals.yaml`, `decisions.jsonl`, file claims (nếu không rỗng), `opportunity.md` — **cấm** đưa hội thoại, cấm đọc code repo. Prompt giữ đủ 7 ý của kit (giả định có thiếu sót; chỉ lỗ làm feature fail acceptance hoặc Gate 1 duyệt sai; mỗi finding 4 trường artifact · kịch bản fail · severity · thước đo; cross-check AC↔eval, GWT không đo được, trục Coverage không có AC, lớp đo-lường; cap 5; `clean` hợp lệ; không lật entry đã seal/descope; claim là advisory, cite `[id]`). Ghi `_acceptance/lat-cat-chung-minh/gap-probe.md` với frontmatter `slug / at / verdict: clean|findings|probe-failed / p0 / p1 / p2` và bảng `| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |`. **Định đoạt từng finding** vào cột Xử lý: P0 = sửa artifact ngay hoặc `human-gate1`; P1/P2 = `fixed:` | `deferred:` | `rejected:`. One-pass, không re-probe.

- [ ] **Step 7: Commit hồ sơ S1**

```bash
cat > /tmp/lcm-msg.txt <<'EOF'
chore(acceptance): mo ho so lat-cat-chung-minh (S1) — contract T2 14 AC, evals, gap-probe; mo co hoi skill-1 cho Cong Dang

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
git add _acceptance/lat-cat-chung-minh _acceptance/skill-1-footage-kho-clip
git commit -F /tmp/lcm-msg.txt
```

- [ ] **Step 8: Render thẻ Cổng 1 và DỪNG chờ owner**

Invoke skill `acceptance-gate:acceptance-card` với args `lat-cat-chung-minh`. Đây là **điểm dừng người** theo quyết định owner (§11 spec) — không đi đường tự-đi-tiếp dù T2 đủ điều kiện. Owner duyệt → contract `status: approved`, `approved_by`, `approved_at`, seal entry vào decisions.jsonl. Cùng lúc owner có thể ký Cổng Đáng của `skill-1-footage-kho-clip` (= A1): gỡ `[đề xuất]`, điền `decision: build`, `decided_by`, `decided_at`, `stage: decided`.

---

### Task 1: Khối kế hoạch vào `docs/roadmap.md` + park ba cơ hội

**Files:**
- Modify: `docs/roadmap.md` (dòng 47 S3; dòng 111–112 1.5/1.6; chèn mục mới trước dòng 124 `## Phase 2`; đoạn dòng 211–213)
- Modify: `_acceptance/director-v2/opportunity.md`, `_acceptance/timeline-view/opportunity.md`, `_acceptance/staleness-ho-so-thieu-paths/opportunity.md` (frontmatter `stage`, `decision`)

**Interfaces:**
- Produces: khối giữa `<!-- plan-freeze:start -->` … `<!-- plan-freeze:end -->` với **đúng** hình dạng Task 3 parse: dòng header `plan: … · opened: … · unlock: … · checkpoint: …`, bảng 6 cột, nhãn `**Xếp lại sau**` + bảng 3 cột, nhãn `**Ngoại lệ mở giữa lúc băng**` + bảng 4 cột. 20 dòng kế hoạch, 16 ★.

- [ ] **Step 1: Kiểm tra tiền đề — cây sạch, guard sổ cái xanh**

Run:
```bash
git status --short | wc -l && bash scripts/roadmap/check-roadmap-fresh.sh
```
Expected: `0` và `✅ docs/roadmap.md khớp với docs/adr/ và _acceptance/ — không có trôi.`

- [ ] **Step 2: Sửa dòng S3 (dòng 47)**

Thay toàn bộ dòng bắt đầu `| S3 |` bằng:

```markdown
| S3 | Đường transcribe không-Modal | ✅ **de facto 01/09** qua fork `oneflow-api-openai` (`dang-ky-fork-openai`): máy dev quét được cả hai slot transcribe, model `gpt-transcribe`, 0 lỗi. *Chưa gọi tên ở đây tới 04/09.* Còn kiểm chứng end-to-end trong lát cắt — B7 của khối kế hoạch bên dưới |
```

- [ ] **Step 3: Nối con trỏ vào 1.5 và 1.6 (dòng 111–112)**

Thêm vào **cuối** dòng `- **1.5** …` (sau dấu chấm cuối):
```markdown
 → **B5** trong khối kế hoạch lát cắt chứng minh (04/09).
```
Thêm vào **cuối** dòng `- **1.6** …`:
```markdown
 → **B7** trong khối kế hoạch; ingest ngược là dòng Should S3 của khối.
```

- [ ] **Step 4: Chèn mục mới ngay trước `## Phase 2 — Năng lực cloud & vòng dữ liệu (T11–T16)`**

Chèn nguyên khối sau (kết thúc bằng một dòng trống trước `## Phase 2`):

````markdown
## Kế hoạch lát cắt chứng minh (04/09 → 08/11) — và luật đóng băng

> Thiết kế: [lat-cat-chung-minh-design](superpowers/specs/2026-09-04-lat-cat-chung-minh-design.md).
> Định vị ba tầng (nền tảng đa mục đích → năm trụ cột → lát cắt) ghi ở [vision.md](strategy/vision.md).
> Skill #1 là **lát cắt chứng minh đầu tiên** của nền tảng, không phải định nghĩa sản phẩm.
>
> **Luật đóng băng.** Từ khi hồ sơ `lat-cat-chung-minh` merge tới khi gỡ băng, không hồ sơ nào
> được mở ở trạng thái làm việc nếu slug không nằm trong ba bảng dưới. Băng đóng **phạm vi**,
> không đóng định vị. Ngoại lệ chỉ nhận ba lý do có tên: mất-dữ-liệu · bảo-mật · chặn-★, và
> tính vào mẫu số. Gỡ băng khi **mọi dòng ★ ✅ và ≥ 85% tổng dòng ✅**. Guard:
> `scripts/roadmap/check-plan-freeze.mjs` (job Acceptance Gate) in tỉ lệ mỗi lần chạy — đó là
> bảng điều khiển duy nhất. Mốc tái hoạch 09/10 theo §6.3 của thiết kế.

<!-- plan-freeze:start -->
plan: lat-cat-chung-minh · opened: 2026-09-04 · unlock: star=100% AND total>=85% · checkpoint: 2026-10-09
| # | ★ | Hạng mục | slug | Trạng thái | Ghi chú |
|---|---|---|---|---|---|
| B1 | ★ | Hồ sơ kế hoạch + luật đóng băng + guard; STATUS.md, vision.md, roadmap; mở cơ hội của lát cắt | lat-cat-chung-minh | ◐ | hạng mục mới cuối cùng được nhận; vòng nội bộ, ngưỡng Không đo được |
| B2 | ★ | Hạ cánh nhánh mở hoá b01: README x3, NOTICE, SECURITY, docker-compose trỏ ảnh của fork, tắt trigger tag desktop-release | mo-hoa-b01 | ⬜ | code có trước hợp đồng → cơ hội khai prototype keep + bảng nợ kế thừa; merge main vào nhánh trước; T2 vì chạm .github và docker-compose |
| B3 | ★ | Hạ cánh D0 Director wire-shape: resume S4 VERIFY, Cổng 2, ADR Director trường kỳ về main, mục Làn D | director-wire-shape | ⬜ | T3 (src/db), soi Gate 1.5 đã qua chưa; director-v2 D1/D2/D4 đã park |
| B4 | ★ | Engine dùng venv per-plugin như TS, bỏ fallback về sys.executable; SDK 0.2.20 + bump pin 4 plugin | hai-duong-chay-mot-venv | ⬜ | T3 (sdk) + train SDK; sau A6 |
| B5 | ★ | Skill system v1: manifest tham số, template, orchestrator v1, nút skill, xem/sửa kế hoạch; skill thứ hai giả lập không đụng engine | skill-system-v1 | ⬜ | T3 (src/app/api); nền tảng |
| B6 | ★ | Overlay chạy local (port khỏi Modal, cùng slot) kèm canvas 9:16 pad/crop | overlay-chay-local | ⬜ | T2; sau A7 |
| B7 | ★ | Skill #1 Footage → kho clip 9:16: nạp/upload → split → transcribe-timestamp → drop → overlay phụ đề + giá → gom; conformance headless | skill-1-footage-kho-clip | ⬜ | T3 (src/lib/workflow) |
| B8 | ★ | Director sinh instance skill từ prompt | director-sinh-instance | ⬜ | T3; có thể hạ Should ở mốc 09/10 |
| B9 | ★ | Đo G0 (WER, COGS từ ảnh chụp giá) và G1 (50 clip, đổi giá chỉ overlay chạy lại, headless = canvas) | do-g0-g1-lat-cat | ⬜ | T2; chờ A1, A3 |
| B10 | ★ | Cổng Giá trị của cơ hội skill-1-footage-kho-clip: phiên UAT (uat-session) với 3–5 người dùng đại diện trên máy trắng; phán quyết release/iterate/kill | — | ⬜ | làn A + B; chờ A2, A5; ✅ khi cơ hội có verdict |
| A1 | ★ | Ký Cổng Đáng của cơ hội skill-1-footage-kho-clip: gỡ [đề xuất] ở U1–U8 và ba số G0 (WER ≤ 10%, lỗi chữ số = 0, COGS ≤ $11) | — | ⬜ | làn A · T5 · kiểm: opportunity:skill-1-footage-kho-clip |
| A2 | ★ | Chốt ngách seller e-com hay BĐS | — | ⬜ | làn A · T8 |
| A3 | ★ | Corpus ≥ 10 clip thực địa + bản chép tay vào measure/wer-corpus | — | ⬜ | làn A · T9 |
| A4 | ★ | Một lượt chạy thật + hoá đơn | — | ⬜ | làn A · T11 |
| A5 | ★ | Tuyển 3–5 người dùng đại diện cho UAT | — | ⬜ | làn A · T13 |
| A6 |  | Thu hồi token PyPI toàn tài khoản, cấp lại project-scoped | — | ⬜ | làn A · T6, trước B4 |
| A7 | ★ | Tạo repo public oneflow-api-compose-overlay | — | ⬜ | làn A · T8, trước B6 |
| S1 |  | Hạ cánh fix t1-escape đòi artifact hồ sơ (2 commit sẵn) | t1-escape-doi-hoi-artifact-ho-so | ⬜ | Should; code có trước hợp đồng → prototype keep + bảng nợ kế thừa |
| S2 |  | Đăng ký plugin normalize-text-vi, đóng lỗ 1.3 | dang-ky-plugin-normalize-text-vi | ⬜ | Should; cần repo plugin public |
| S3 |  | Ingest ngược về media-library (giai đoạn B ADR-0012) | ingest-nguoc-media-library | ⬜ | Should; ứng viên iterate sau UAT |

**Xếp lại sau**
| slug | vì sao đông lạnh | nhánh |
|---|---|---|
| director-v2 | D1/D2/D4 sau lát cắt; D0 hạ cánh ở B3 | feat/director-wire-shape |
| timeline-view | cơ hội chưa điền, không trên đường ★ | — |
| staleness-ho-so-thieu-paths | lỗ cổng đo được 31/08, giả thuyết chưa kiểm; mọi hồ sơ của kế hoạch khai đủ paths | — |
| roadmap-alias-guard | nháp 10 AC / 9 eval, gate tooling | chore/roadmap-alias-guard |
| bo-phan-loai-token | nháp, phục vụ đường TTS ngoài lát cắt | draft/bo-phan-loai-token |
| ci-recheck-all | nháp 8 AC / 10 eval, gate tooling | chore/acceptance-ci-recheck-all |
| scan-parse-failure-semantics | HANDOFF sẵn trong scan-scope-diagnostics, gate tooling | — |
| overlay-canvas-reach | form node overlay; có thể vô nghĩa khi skill ẩn canvas | — |
| 1.1-L1b mime/filename vào digest | transcribe không trong allowlist tầng A; G1 U5 sẽ lộ nếu thành vấn đề | — |
| 1.1-L2b file_key_base cho desktop | desktop là S5, park | — |
| 0.7 English-only vs văn bản vendor; 0.8 (a)(c) | gate tooling | — |
| hai hợp đồng con của add-media-library | kiểm payload ở biên; sáu lỗ thủng bộ đo — không trên đường ★ | — |
| cost_usd và gpu_type (DoD 0.2 còn 1/3) | COGS G0 đo bằng hoá đơn + ảnh chụp giá | — |
| trần 3 lượt đồng thời nửa vời | /api/task/create không gọi checkConcurrentTaskLimit — không trên đường ★ | — |
| desktop 0.1d/S5; ja.json 76 khoá; gói nợ fork; 1.4 TTS; 1.7 KG; S6 | ngoài lát cắt | — |
| oneflow-api-vercel-gateway | mở khi STT của gateway hết beta VÀ Phase 2 mục 4 bắt đầu, HOẶC UAT cho thấy U1 trượt vì nhập nhiều key | — |
| hàng rào chặn model đã khai tử | đọc trường deprecated_at từ catalog công khai của gateway thay vì bảng tay | — |

**Ngoại lệ mở giữa lúc băng**
| slug | lý do | ngày | ai quyết |
|---|---|---|---|
<!-- plan-freeze:end -->

````

- [ ] **Step 5: Viết lại đoạn dòng 211–213 (ngoài khối ledger)**

Thay ba dòng bắt đầu `**Đọc được gì từ tỉ lệ này:**` bằng (không nháy ngược):

```markdown
**Đọc được gì từ tỉ lệ này (đếm lại 04/09 trên 36 hồ sơ):** 16/36 là hạng mục trên lộ trình,
5/36 là sửa lỗi sản phẩm ngoài lộ trình (bốn hồ sơ kho khoá và fork OpenAI), 15/36 là hạ tầng
quy trình và CI. Con số thứ ba không phải lãng phí — nó là giá của luật "mỗi phase một gate bằng
số" — nhưng nó *là* một khoản chi có thật, và lộ trình 24 tuần không tính nó vào bất kỳ ô nào.
Trong 15 hồ sơ ký từ 27/08, 7 là hạ tầng quy trình: đó chính là xu hướng mà khối kế hoạch và
luật đóng băng ở trên chặn lại.
```

- [ ] **Step 6: Park ba cơ hội (nửa máy)**

Trong mỗi file `_acceptance/director-v2/opportunity.md`, `_acceptance/timeline-view/opportunity.md`, `_acceptance/staleness-ho-so-thieu-paths/opportunity.md`, đổi hai dòng frontmatter:

```yaml
stage: decided
decision: park
```

Giữ nguyên `decided_by:` và `decided_at:` **trống** — owner điền trong commit chỉ-trường-người (Task 7, Step 7). Thêm vào cuối mỗi file mục:

```markdown
## Cổng 0 — 04/09

- **decision = park.** Căn cứ: khối kế hoạch lát cắt chứng minh (docs/roadmap.md) đóng băng việc mở hạng mục mới; hồ sơ này không nằm trên đường ★. Mở lại khi gỡ băng hoặc qua bảng Ngoại lệ với lý do có tên.
```

- [ ] **Step 7: Kiểm bằng máy — guard sổ cái vẫn xanh, khối đếm đúng**

Run:
```bash
bash scripts/roadmap/check-roadmap-fresh.sh && node -e '
const s=require("fs").readFileSync("docs/roadmap.md","utf8");
const b=s.match(/<!--\s*plan-freeze:start\s*-->([\s\S]*?)<!--\s*plan-freeze:end\s*-->/)[1];
const main=b.split("**Xếp lại sau**")[0].split("\n").filter(l=>l.startsWith("|")).slice(2);
console.log("dòng kế hoạch:",main.length,"★:",main.filter(l=>l.split("|")[2].trim()==="★").length);
if(main.length!==20)process.exit(1);' && grep -c 'ADR-0013' docs/roadmap.md
```
Expected: guard xanh; `dòng kế hoạch: 20 ★: 16`; `grep -c` in `0`.

- [ ] **Step 8: Commit**

```bash
cat > /tmp/lcm-msg.txt <<'EOF'
docs(roadmap): khoi ke hoach lat-cat-chung-minh + luat dong bang, park 3 co hoi

Them muc "Ke hoach lat cat chung minh" voi khoi plan-freeze (20 dong, 16 sao),
sua dong S3 (de facto qua fork OpenAI), noi 1.5/1.6 vao B5/B7, dem lai doan
ti le tren 36 ho so. Ba co hoi director-v2, timeline-view,
staleness-ho-so-thieu-paths sang stage decided / decision park (nua may;
decided_by/at cho owner).
EOF
git add docs/roadmap.md _acceptance/director-v2/opportunity.md _acceptance/timeline-view/opportunity.md _acceptance/staleness-ho-so-thieu-paths/opportunity.md
git commit -F /tmp/lcm-msg.txt
```

---

### Task 2: Teeth script trước (test đỏ) — `check-plan-freeze-teeth.sh`

**Files:**
- Create: `scripts/roadmap/check-plan-freeze-teeth.sh`

**Interfaces:**
- Consumes: guard tại `scripts/roadmap/check-plan-freeze.mjs` (Task 3) đọc `docs/roadmap.md` và `_acceptance/` **theo cwd** (hoặc `PLAN_FREEZE_ROOT`), ngày theo `PLAN_FREEZE_TODAY`, thoát 0/1, in `plan-freeze: ★ a/b · tổng c/d (p%) · còn băng|GỠ BĂNG`, `VIOLATION [plan-freeze] F<n>: …`, `NOTE [plan-freeze] …`, và dòng `tin theo lời (dòng không có slug): …`.
- Produces: CLI `--list`, `--case <tên>`, `--selftest-fail`; token `CASE <tên>: PASS|FAIL`; 12 case: `clean khoi-hong o-moi-ngoai-ke-hoach tick-noi-doi tin-theo-loi park-khong-that ngoai-le-tran go-bang checkpoint-note checkpoint-done builtins-only case-isolation`.

- [ ] **Step 1: Viết teeth script**

```bash
#!/usr/bin/env bash
# Teeth for check-plan-freeze.mjs, in the shape of check-roadmap-guard-teeth.sh:
# a guard only ever observed green is indistinguishable from `exit 0`.
#
# Each case builds its own throwaway fixture (docs/roadmap.md + every
# _acceptance/<slug>/{contract,opportunity}.md), perturbs it one way, and asserts
# the guard's exit code AND message. One exit code per case; `--case` for one;
# an unknown name is refused loudly (exit 2) rather than skipped.
#
# Case 5 (`go-bang`) is the reverse direction: the freeze must be able to THAW.
# Case `checkpoint-note` deliberately stays green — a NOTE is not a failure.
set -euo pipefail
cd "$(dirname "$0")/../.."

repo_root=$(pwd)
guard="$repo_root/scripts/roadmap/check-plan-freeze.mjs"
self="$repo_root/scripts/roadmap/check-plan-freeze-teeth.sh"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

CASES=(
  clean
  khoi-hong
  o-moi-ngoai-ke-hoach
  tick-noi-doi
  tin-theo-loi
  park-khong-that
  ngoai-le-tran
  ngoai-le-hop-le
  go-bang
  checkpoint-note
  checkpoint-done
  kiem-co-hoi
  kiem-co-hoi-de-xuat
  builtins-only
  case-isolation
)

is_case() { local n="$1" c; for c in "${CASES[@]}"; do [ "$c" = "$n" ] && return 0; done; return 1; }

build_fixture() {
  rm -rf "$tmp/t"
  mkdir -p "$tmp/t/docs" "$tmp/t/_acceptance"
  cp "$repo_root/docs/roadmap.md" "$tmp/t/docs/roadmap.md"
  for d in "$repo_root"/_acceptance/*/; do
    slug=$(basename "$d")
    mkdir -p "$tmp/t/_acceptance/$slug"
    [ -f "$d/contract.md" ] && cp "$d/contract.md" "$tmp/t/_acceptance/$slug/"
    [ -f "$d/opportunity.md" ] && cp "$d/opportunity.md" "$tmp/t/_acceptance/$slug/"
  done
  return 0
}

# Output is KEPT: several criteria are about the message, not just the code.
guard_capture() {
  local rc=0
  (cd "$tmp/t" && node "$guard") > "$tmp/out" 2>&1 || rc=$?
  return $rc
}
guard_is_red()   { ! guard_capture; }
guard_is_green() {   guard_capture; }
out_has() { grep -Eq -- "$1" "$tmp/out"; }

# Flip one plan row's state. $1 = a substring unique to the row, $2 = new state.
set_row_state() {
  python3 - "$tmp/t/docs/roadmap.md" "$1" "$2" <<'PY'
import sys, pathlib
p, needle, state = pathlib.Path(sys.argv[1]), sys.argv[2], sys.argv[3]
s = p.read_text(encoding="utf-8")
start, end = s.index("<!-- plan-freeze:start -->"), s.index("<!-- plan-freeze:end -->")
block = s[start:end]
out = []
hit = 0
for line in block.split("\n"):
    if line.startswith("|") and needle in line:
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) == 6:
            cells[4] = state
            line = "| " + " | ".join(cells) + " |"
            hit += 1
    out.append(line)
if hit != 1:
    raise SystemExit(f"fixture stale: needle {needle!r} matched {hit} rows, want 1")
p.write_text(s[:start] + "\n".join(out) + s[end:], encoding="utf-8")
PY
}

# --- cases ------------------------------------------------------------------

# AC-1 control: the real tree must be green and the ratio line must be present
# with 20 rows / 16 stars — a guard printing "0/0" would also be green.
case_clean() {
  build_fixture
  guard_is_green || return 1
  out_has 'plan-freeze: ★ [0-9]+/16 · tổng [0-9]+/20 \([0-9]+%\) · còn băng' || return 1
  [ ! -e "$tmp/t/node_modules" ] || return 1     # AC-13 half: no node_modules here
}

# AC-8. Block unreadable -> F0, fail-closed.
case_khoi_hong() {
  build_fixture
  python3 - "$tmp/t/docs/roadmap.md" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
p.write_text(s.replace("<!-- plan-freeze:end -->", "", 1), encoding="utf-8")
PY
  guard_is_red || return 1
  out_has 'VIOLATION \[plan-freeze\] F0' || return 1
  out_has 'marker'
}

# AC-2. A new working-state dossier whose slug is in none of the three tables.
case_o_moi_ngoai_ke_hoach() {
  build_fixture
  mkdir -p "$tmp/t/_acceptance/la-ngoai-ke-hoach"
  printf -- '---\nschema_version: 1\nslug: la-ngoai-ke-hoach\nstatus: draft\n---\n' > "$tmp/t/_acceptance/la-ngoai-ke-hoach/contract.md"
  guard_is_red || return 1
  out_has 'F1' || return 1
  out_has 'la-ngoai-ke-hoach mở ngoài kế hoạch'
}

# AC-3 red half. A slug row ticked ✅ while its contract is not signed off.
case_tick_noi_doi() {
  build_fixture
  set_row_state "| skill-system-v1 |" "✅"
  guard_is_red || return 1
  out_has 'F2' || return 1
  out_has 'skill-system-v1 chưa ký'
}

# AC-3 trusted half. A slug-less row ticked ✅ is accepted and NAMED.
case_tin_theo_loi() {
  build_fixture
  set_row_state "| A1 |" "✅"
  guard_is_green || return 1
  out_has 'tin theo lời.*A1'
}

# AC-4. Park table says parked; opportunity.md disagrees.
case_park_khong_that() {
  build_fixture
  python3 - "$tmp/t/_acceptance/timeline-view/opportunity.md" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
assert "decision: park" in s, "fixture stale: timeline-view is not parked on the real tree"
p.write_text(s.replace("decision: park", "decision:", 1), encoding="utf-8")
PY
  guard_is_red || return 1
  out_has 'F3' || return 1
  out_has 'timeline-view khai park mà hồ sơ chưa park'
}

# AC-5. An exception with a reason outside the named three.
case_ngoai_le_tran() {
  build_fixture
  python3 - "$tmp/t/docs/roadmap.md" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
row = "| tien-tay | tiện | 2026-09-05 | Manh |\n"
p.write_text(s.replace("<!-- plan-freeze:end -->", row + "<!-- plan-freeze:end -->", 1), encoding="utf-8")
PY
  guard_is_red || return 1
  out_has 'F4' || return 1
  out_has 'tien-tay không có lý do có tên'
}

# AC-5 GREEN HALF (gap-probe 04/09 P0). The freeze's safety valve must be shown to
# OPEN, not just to block: a well-formed exception is accepted, its slug joins F1's
# allowed set, and the denominator grows by one. Without this the valve is only ever
# exercised the day there is a real security incident.
case_ngoai_le_hop_le() {
  build_fixture
  # A dossier that is open and NOT in any table — F1 would redden on it...
  mkdir -p "$tmp/t/_acceptance/su-co-bao-mat"
  printf -- '---\nschema_version: 1\nslug: su-co-bao-mat\nstatus: draft\n---\n' > "$tmp/t/_acceptance/su-co-bao-mat/contract.md"
  guard_is_red || return 1
  out_has 'F1' || return 1
  local before
  before=$(sed -n 's/.*tổng [0-9]*\/\([0-9]*\).*/\1/p' "$tmp/out" | head -1)
  # ...until a valid exception row admits it.
  python3 - "$tmp/t/docs/roadmap.md" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
row = "| su-co-bao-mat | bảo-mật | 2026-09-20 | Manh |\n"
p.write_text(s.replace("<!-- plan-freeze:end -->", row + "<!-- plan-freeze:end -->", 1), encoding="utf-8")
PY
  guard_is_green || return 1
  ! out_has 'su-co-bao-mat mở ngoài kế hoạch' || return 1
  local after
  after=$(sed -n 's/.*tổng [0-9]*\/\([0-9]*\).*/\1/p' "$tmp/out" | head -1)
  [ -n "$before" ] && [ -n "$after" ] && [ "$after" -eq $((before + 1)) ]
}

# AC-6. THE THAW. Every row ✅ with every slug row backed by a signed contract:
# the guard must say GỠ BĂNG, exit 0, and F1 must be OFF (a stray dossier no
# longer turns it red). Without this case a guard hardcoded to freeze forever
# passes every other case.
case_go_bang() {
  build_fixture
  python3 - "$tmp/t" <<'PY'
import sys, pathlib, re
root = pathlib.Path(sys.argv[1])
p = root / "docs" / "roadmap.md"; s = p.read_text(encoding="utf-8")
start, end = s.index("<!-- plan-freeze:start -->"), s.index("<!-- plan-freeze:end -->")
block = s[start:end]
park_at = block.index("**Xếp lại sau**")
main, rest = block[:park_at], block[park_at:]
out = []
for line in main.split("\n"):
    if line.startswith("|") and not line.startswith("|---") and not line.startswith("| # "):
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) == 6:
            cells[4] = "✅"
            slug = cells[3]
            if slug != "—":
                d = root / "_acceptance" / slug; d.mkdir(parents=True, exist_ok=True)
                c = d / "contract.md"
                if c.exists():
                    t = re.sub(r"^status:.*$", "status: signed-off", c.read_text(encoding="utf-8"), count=1, flags=re.M)
                else:
                    t = f"---\nschema_version: 1\nfeature: fixture\nslug: {slug}\nrisk_tier: T2\nstatus: signed-off\n---\n"
                c.write_text(t, encoding="utf-8")
            line = "| " + " | ".join(cells) + " |"
    out.append(line)
p.write_text(s[:start] + "\n".join(out) + rest + s[end:], encoding="utf-8")
PY
  guard_is_green || return 1
  out_has 'plan-freeze: ★ 16/16 · tổng 20/20 \(100%\) · GỠ BĂNG' || return 1
  # F1 must be off now: the same stray dossier that reddens case 2 stays green.
  mkdir -p "$tmp/t/_acceptance/la-ngoai-ke-hoach"
  printf -- '---\nschema_version: 1\nslug: la-ngoai-ke-hoach\nstatus: draft\n---\n' > "$tmp/t/_acceptance/la-ngoai-ke-hoach/contract.md"
  guard_is_green || return 1
  out_has 'GỠ BĂNG'
}

# AC-7. Past the checkpoint with no checkpoint_done: a NOTE, exit code unchanged.
case_checkpoint_note() {
  build_fixture
  local rc=0
  (cd "$tmp/t" && PLAN_FREEZE_TODAY=2026-12-31 node "$guard") > "$tmp/out" 2>&1 || rc=$?
  [ "$rc" -eq 0 ] || return 1
  out_has 'NOTE \[plan-freeze\] đã qua mốc tái hoạch 2026-10-09'
}

# AC-7 suppression half: checkpoint_done in the header silences the NOTE.
case_checkpoint_done() {
  build_fixture
  python3 - "$tmp/t/docs/roadmap.md" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
old = "checkpoint: 2026-10-09"
assert old in s, "fixture stale: header checkpoint moved"
p.write_text(s.replace(old, old + " · checkpoint_done: 2026-10-09", 1), encoding="utf-8")
PY
  local rc=0
  (cd "$tmp/t" && PLAN_FREEZE_TODAY=2026-12-31 node "$guard") > "$tmp/out" 2>&1 || rc=$?
  [ "$rc" -eq 0 ] || return 1
  ! out_has 'NOTE \[plan-freeze\] đã qua mốc'
}

# AC-14. A slug-less row can carry `kiểm: opportunity:<slug>` in its note: its ✅ is
# then verified against that opportunity's Cổng Đáng (decision + decided_by), not trusted.
case_kiem_co_hoi() {
  build_fixture
  set_row_state "| A1 |" "✅"
  # Red half: the opportunity exists but has not been decided.
  guard_is_red || return 1
  out_has 'F2' || return 1
  out_has 'skill-1-footage-kho-clip chưa ký Cổng Đáng' || return 1
  # Green half: sign it the way the owner would.
  python3 - "$tmp/t/_acceptance/skill-1-footage-kho-clip/opportunity.md" <<'PY'
import sys, pathlib, re
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
s = re.sub(r"^stage:.*$", "stage: decided", s, count=1, flags=re.M)
s = re.sub(r"^decision:.*$", "decision: build", s, count=1, flags=re.M)
s = re.sub(r"^decided_by:.*$", "decided_by: Fixture", s, count=1, flags=re.M)
p.write_text(s, encoding="utf-8")
PY
  guard_is_green || return 1
  ! out_has 'tin theo lời.*A1'
}

# AC-14 SECOND HALF (gap-probe 04/09 P1). Cổng Đáng has TWO halves: strike the
# `[đề xuất]` prefixes off the thresholds, AND sign the three human fields. Signing
# while every threshold is still a proposal would tick A1 ✅ with no line agreed —
# defeating the very "set the bar before you see the number" rule A1 exists for.
case_kiem_co_hoi_de_xuat() {
  build_fixture
  set_row_state "| A1 |" "✅"
  # Sign the human fields but leave the [đề xuất] prefixes in place.
  python3 - "$tmp/t/_acceptance/skill-1-footage-kho-clip/opportunity.md" <<'PY'
import sys, pathlib, re
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
s = re.sub(r"^stage:.*$", "stage: decided", s, count=1, flags=re.M)
s = re.sub(r"^decision:.*$", "decision: build", s, count=1, flags=re.M)
s = re.sub(r"^decided_by:.*$", "decided_by: Fixture", s, count=1, flags=re.M)
assert "[đề xuất]" in s, "fixture stale: opportunity has no [đề xuất] left to keep"
p.write_text(s, encoding="utf-8")
PY
  guard_is_red || return 1
  out_has 'F2' || return 1
  out_has 'skill-1-footage-kho-clip.*còn ngưỡng đề xuất' || return 1
  # Green half: strike the prefixes and it passes.
  python3 - "$tmp/t/_acceptance/skill-1-footage-kho-clip/opportunity.md" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1])
p.write_text(p.read_text(encoding="utf-8").replace("[đề xuất] ", ""), encoding="utf-8")
PY
  guard_is_green
}

# AC-13. Builtins only, and refuses arguments (the CI teeth mode appends a junk
# flag and requires a non-zero exit).
case_builtins_only() {
  if grep -E '^\s*import .* from ["'"'"']' "$guard" | grep -vE 'from ["'"'"']node:'; then
    echo "    guard imports a non-builtin module" >&2
    return 1
  fi
  build_fixture
  local rc=0
  (cd "$tmp/t" && node "$guard" --co-rac-khong-ton-tai) > "$tmp/out" 2>&1 || rc=$?
  [ "$rc" -eq 2 ] || return 1
  out_has 'không nhận tham số'
}

# AC-10 teeth-of-the-teeth: each case addressable with its own token, unknown
# names refused, and the harness able to say FAIL.
case_case_isolation() {
  local c out rc
  for c in "${CASES[@]}"; do
    [ "$c" = "case-isolation" ] && continue
    out=$(bash "$self" --case "$c" 2>&1) || return 1
    [ "$(printf '%s\n' "$out" | grep -c "CASE $c: PASS")" -eq 1 ] || return 1
  done
  rc=0; out=$(bash "$self" --case khong-ton-tai 2>&1) || rc=$?
  [ "$rc" -ne 0 ] || return 1
  printf '%s\n' "$out" | grep -q "go-bang" || return 1
  rc=0; out=$(bash "$self" --selftest-fail 2>&1) || rc=$?
  [ "$rc" -ne 0 ] || return 1
  printf '%s\n' "$out" | grep -q "CASE selftest-fail: FAIL" || return 1
  return 0
}

case_selftest_fail() { return 1; }

run_case() {
  local name="$1" fn
  fn="case_$(printf '%s' "$name" | tr '-' '_')"
  if "$fn"; then echo "  ✓ CASE $name: PASS"; return 0; fi
  echo "  ✗ CASE $name: FAIL"; return 1
}

refuse() {
  echo "check-plan-freeze-teeth: $1" >&2
  echo "case hợp lệ: ${CASES[*]}" >&2
  exit 2
}

ONE_CASE=""
while [ $# -gt 0 ]; do
  case "$1" in
    --list) printf '%s\n' "${CASES[@]}"; exit 0 ;;
    --selftest-fail) run_case selftest-fail; exit $? ;;
    --case)
      [ $# -ge 2 ] || refuse "\`--case\` cần một tên ngay sau nó — nhận được (trống)"
      case "$2" in --*) refuse "\`--case\` cần một tên ngay sau nó — nhận được \`$2\`" ;; esac
      is_case "$2" || refuse "case lạ \`$2\`"
      ONE_CASE="$2"; shift 2 ;;
    *) refuse "tham số lạ \`$1\` — chỉ nhận \`--case <tên>\` và \`--list\`" ;;
  esac
done

if [ -n "$ONE_CASE" ]; then
  echo "→ răng: case $ONE_CASE"
  run_case "$ONE_CASE"
  exit $?
fi

echo "→ răng của check-plan-freeze.mjs"
pass=0; fail=0
for c in "${CASES[@]}"; do
  if run_case "$c"; then pass=$((pass + 1)); else fail=$((fail + 1)); fi
done
echo
if [ "$fail" -ne 0 ]; then
  echo "❌ răng: $pass đạt / $fail hỏng — guard không đáng tin"
  exit 1
fi
echo "✅ răng: $pass/$pass case — mỗi case một mã thoát riêng"
```

- [ ] **Step 2: Chạy để chắc nó ĐỎ khi chưa có guard**

Run:
```bash
chmod +x scripts/roadmap/check-plan-freeze-teeth.sh && bash scripts/roadmap/check-plan-freeze-teeth.sh; echo "exit=$?"
```
Expected: mọi case `FAIL` (guard chưa tồn tại → `node` thoát 1 với "Cannot find module"), dòng cuối `❌ răng: 0 đạt / 15 hỏng`, `exit=1`.

- [ ] **Step 3: Commit (test đỏ)**

```bash
cat > /tmp/lcm-msg.txt <<'EOF'
test(roadmap): rang cho check-plan-freeze — 12 case, moi case mot ma thoat (do truoc)
EOF
git add scripts/roadmap/check-plan-freeze-teeth.sh
git commit -F /tmp/lcm-msg.txt
```

---

### Task 3: Guard `check-plan-freeze.mjs` (làm răng xanh)

**Files:**
- Create: `scripts/roadmap/check-plan-freeze.mjs`
- Modify: `package.json` (sau dòng 39 `"roadmap:teeth": …`)

**Interfaces:**
- Consumes: khối `plan-freeze` (Task 1); `_acceptance/<slug>/contract.md` frontmatter `status`; `opportunity.md` frontmatter `stage`, `decision`.
- Produces: chương trình không tham số; env `PLAN_FREEZE_ROOT` (mặc định `.`), `PLAN_FREEZE_TODAY` (YYYY-MM-DD); exit 0 sạch / 1 vi phạm / 2 tham số lạ; thông điệp đúng chuỗi mà Task 2 grep.

- [ ] **Step 1: Viết guard**

```js
#!/usr/bin/env node
// Plan-freeze guard — teeth for the freeze rule docs/roadmap.md declares about
// itself (design: docs/superpowers/specs/2026-09-04-lat-cat-chung-minh-design.md §5).
//
// Reads the block between <!-- plan-freeze:start --> and <!-- plan-freeze:end -->
// plus every _acceptance/<slug>/{contract,opportunity}.md, and answers:
//   F0  block unreadable                        -> fail-closed
//   F1  a working-state dossier outside the plan (only while frozen)
//   F2  a ✅ row whose contract is not signed-off (slug-less rows are trusted, and named)
//   F3  a parked slug whose opportunity.md is not decision: park
//   F4  an exception row without one of the three named reasons
// Always prints the ratio line; prints GỠ BĂNG when every ★ row is ✅ and
// >= 85% of all rows (plan + exceptions) are done. The checkpoint date only
// yields a NOTE — the machine reminds, a human decides.
//
// Node builtins only: the Acceptance Gate job has no node_modules.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Refuse arguments. The CI teeth mode appends a junk flag to every guard command
// and requires a non-zero exit; a guard that swallows flags cannot be told apart
// from one that ran.
if (process.argv.length > 2) {
    console.error(
        `check-plan-freeze: không nhận tham số nào — nhận được: ${process.argv.slice(2).join(" ")}`,
    );
    process.exit(2);
}

const ROOT = process.env.PLAN_FREEZE_ROOT || ".";
const TODAY =
    process.env.PLAN_FREEZE_TODAY || new Date().toISOString().slice(0, 10);
const ROADMAP = join(ROOT, "docs", "roadmap.md");
const ACCEPTANCE_DIR = join(ROOT, "_acceptance");

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
const STATES = new Set(["⬜", "◐", "✅"]);
const REASONS = new Set(["mất-dữ-liệu", "bảo-mật", "chặn-★"]);
const REQUIRED_HEADER = ["plan", "opened", "unlock", "checkpoint"];
const UNLOCK_RATIO = 0.85;
const PARK_LABEL = "**Xếp lại sau**";
const EXC_LABEL = "**Ngoại lệ mở giữa lúc băng**";

const failures = [];
const notes = [];
const fail = (code, msg) => failures.push(`VIOLATION [plan-freeze] ${code}: ${msg}`);
function die(msg) {
    console.error(`VIOLATION [plan-freeze] F0: khối kế hoạch không đọc được: ${msg}`);
    process.exit(1);
}

// --- read the block --------------------------------------------------------
let roadmap;
try {
    roadmap = readFileSync(ROADMAP, "utf8");
} catch {
    die(`không đọc được ${ROADMAP}`);
}
const block = roadmap.match(
    /<!--\s*plan-freeze:start\s*-->([\s\S]*?)<!--\s*plan-freeze:end\s*-->/,
);
if (!block) die("thiếu marker plan-freeze:start/end");
const lines = block[1]
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
if (lines.length === 0) die("khối rỗng");

const header = {};
for (const part of lines[0].split("·")) {
    const i = part.indexOf(":");
    if (i < 0) die(`dòng header sai dạng ở "${part.trim()}"`);
    header[part.slice(0, i).trim()] = part.slice(i + 1).trim();
}
for (const k of REQUIRED_HEADER) if (!header[k]) die(`header thiếu khoá "${k}"`);
if (header.closed) {
    console.log(
        `NOTE [plan-freeze] kế hoạch ${header.plan} đã đóng ${header.closed} — không kiểm nữa`,
    );
    process.exit(0);
}

const parkAt = lines.indexOf(PARK_LABEL);
const excAt = lines.indexOf(EXC_LABEL);
if (parkAt < 0 || excAt < 0 || excAt < parkAt)
    die(`thiếu hoặc sai thứ tự nhãn ${PARK_LABEL} / ${EXC_LABEL}`);

// A table is header row + separator + data rows; every data row must have
// exactly `cols` cells. A `|` inside a cell would shift columns — refused.
function table(section, cols, name) {
    const rows = section.filter((l) => l.startsWith("|"));
    if (rows.length < 2) die(`bảng ${name} thiếu dòng tiêu đề hoặc dòng ngăn`);
    return rows.slice(2).map((r, i) => {
        const cells = r
            .replace(/^\|/, "")
            .replace(/\|$/, "")
            .split("|")
            .map((c) => c.trim());
        if (cells.length !== cols)
            die(`bảng ${name} dòng ${i + 1} có ${cells.length} cột, cần ${cols}`);
        return cells;
    });
}
const mainRows = table(lines.slice(1, parkAt), 6, "kế hoạch");
const parkRows = table(lines.slice(parkAt + 1, excAt), 3, "Xếp lại sau");
const excRows = table(lines.slice(excAt + 1), 4, "Ngoại lệ");

const rows = mainRows.map(([id, star, item, slug, state, note]) => {
    if (!id) die("một dòng kế hoạch thiếu mã #");
    if (star !== "" && star !== "★") die(`dòng ${id}: cột ★ chỉ nhận ★ hoặc rỗng`);
    if (slug !== "—" && !SLUG_RE.test(slug)) die(`dòng ${id}: slug "${slug}" sai dạng`);
    if (!STATES.has(state)) die(`dòng ${id}: trạng thái "${state}" ngoài ⬜ ◐ ✅`);
    return { id, star: star === "★", item, slug: slug === "—" ? null : slug, state, note };
});

// --- read the dossiers -----------------------------------------------------
// Returns the frontmatter fields plus one fact about the BODY: whether any
// threshold is still marked `[đề xuất]`. Cổng Đáng has two halves — strike the
// proposals and sign the fields — and reading only the frontmatter would accept a
// signature over thresholds nobody agreed to.
function frontmatter(path) {
    if (!existsSync(path)) return null;
    const text = readFileSync(path, "utf8");
    const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const out = { hasProposal: text.includes("[đề xuất]") };
    if (!fm) return out;
    for (const l of fm[1].split("\n")) {
        const m = l.match(/^([a-z_]+):\s*(.*)$/);
        if (m) out[m[1]] = m[2].trim();
    }
    return out;
}
const dossiers = new Map();
if (existsSync(ACCEPTANCE_DIR))
    for (const d of readdirSync(ACCEPTANCE_DIR, { withFileTypes: true })) {
        if (!d.isDirectory()) continue;
        dossiers.set(d.name, {
            contract: frontmatter(join(ACCEPTANCE_DIR, d.name, "contract.md")),
            opportunity: frontmatter(join(ACCEPTANCE_DIR, d.name, "opportunity.md")),
        });
    }
const isSigned = (slug) => dossiers.get(slug)?.contract?.status === "signed-off";
// "Open" = someone is working on it: a contract not yet signed, or an
// opportunity still in discovery / decided build|iterate.
function isOpen({ contract, opportunity }) {
    if (contract) return contract.status !== "signed-off";
    if (opportunity)
        return (
            opportunity.stage === "discovery" ||
            opportunity.decision === "build" ||
            opportunity.decision === "iterate"
        );
    return false;
}

// --- F2: a ✅ must be backed by a signed contract. A slug-less row is trusted,
// unless its note carries `kiểm: opportunity:<slug>` — then its ✅ means that
// opportunity passed Cổng Đáng (a decision AND a decider on record).
const trusted = [];
const OPP_CHECK = /kiểm:\s*opportunity:([a-z0-9][a-z0-9-]*)/;
for (const r of rows) {
    if (r.state !== "✅") continue;
    if (r.slug === null) {
        const m = r.note.match(OPP_CHECK);
        if (!m) {
            trusted.push(r.id);
            continue;
        }
        const opp = dossiers.get(m[1])?.opportunity;
        if (!opp || !opp.decision || !opp.decided_by)
            fail("F2", `${r.id} ✅ nhưng cơ hội ${m[1]} chưa ký Cổng Đáng (cần decision và decided_by)`);
        else if (opp.hasProposal)
            fail("F2", `${r.id} ✅ nhưng cơ hội ${m[1]} còn ngưỡng đề xuất — Cổng Đáng chốt vạch TRƯỚC khi ký, gỡ hết [đề xuất] rồi mới tính`);
        continue;
    }
    if (!isSigned(r.slug)) fail("F2", `${r.id} ✅ nhưng hồ sơ ${r.slug} chưa ký`);
}

// --- F4: exceptions need a slug, a named reason, a date and a decider --------
const exceptions = excRows.map(([slug, reason, date, who]) => {
    if (!SLUG_RE.test(slug)) fail("F4", `ngoại lệ "${slug}" không có slug hợp lệ`);
    if (!REASONS.has(reason))
        fail(
            "F4",
            `ngoại lệ ${slug} không có lý do có tên (nhận "${reason}"; hợp lệ: ${[...REASONS].join(", ")})`,
        );
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !who)
        fail("F4", `ngoại lệ ${slug} thiếu ngày hoặc ai quyết`);
    return { slug, done: isSigned(slug) };
});

// --- ratio and thaw ----------------------------------------------------------
const starRows = rows.filter((r) => r.star);
const starDone = starRows.filter((r) => r.state === "✅").length;
const total = rows.length + exceptions.length;
const done =
    rows.filter((r) => r.state === "✅").length + exceptions.filter((e) => e.done).length;
const unlocked =
    starRows.length > 0 && starDone === starRows.length && done / total >= UNLOCK_RATIO;

// --- F1: while frozen, no working-state dossier outside the three tables ------
const allowed = new Set([
    ...rows.map((r) => r.slug).filter(Boolean),
    ...parkRows.map(([s]) => s).filter((s) => SLUG_RE.test(s)),
    ...exceptions.map((e) => e.slug),
]);
if (!unlocked)
    for (const [slug, d] of dossiers)
        if (isOpen(d) && !allowed.has(slug))
            fail(
                "F1",
                `${slug} mở ngoài kế hoạch — thêm vào Ngoại lệ với lý do có tên, hoặc park`,
            );

// --- F3: a parked slug that exists on disk must really be parked --------------
for (const [slug] of parkRows) {
    if (!SLUG_RE.test(slug)) continue; // labels (e.g. "1.1-L1b …") are not checked
    const d = dossiers.get(slug);
    if (!d) continue;
    if (d.opportunity?.decision !== "park")
        fail("F3", `${slug} khai park mà hồ sơ chưa park (opportunity.md cần decision: park)`);
}

// --- checkpoint: a reminder, never a failure ---------------------------------
if (TODAY > header.checkpoint && !header.checkpoint_done)
    notes.push(
        `NOTE [plan-freeze] đã qua mốc tái hoạch ${header.checkpoint} — xem §6.3 của thiết kế lat-cat-chung-minh; ghi checkpoint_done: <ngày> vào header khi đã quyết`,
    );

// --- report --------------------------------------------------------------------
const pct = Math.floor((done / total) * 100);
console.log(
    `plan-freeze: ★ ${starDone}/${starRows.length} · tổng ${done}/${total} (${pct}%) · ${unlocked ? "GỠ BĂNG" : "còn băng"}`,
);
if (trusted.length)
    console.log(`   tin theo lời (dòng không có slug): ${trusted.join(", ")}`);
for (const n of notes) console.log(n);
if (failures.length) {
    for (const f of failures) console.error(f);
    console.error(`\nSửa ${ROADMAP} hoặc hồ sơ (không sửa guard) rồi chạy lại.`);
    process.exit(1);
}
console.log(`✅ kế hoạch ${header.plan} khớp với _acceptance/ — không vi phạm.`);
process.exit(0);
```

- [ ] **Step 2: Chạy răng → phải xanh 12/12**

Run:
```bash
bash scripts/roadmap/check-plan-freeze-teeth.sh
```
Expected: 15 dòng `✓ CASE …: PASS`, cuối `✅ răng: 15/15 case — mỗi case một mã thoát riêng`. Nếu một case đỏ: sửa **guard** cho tới khi khớp thông điệp Task 2 đòi (không nới case).

- [ ] **Step 3: Chạy guard trên cây thật**

Run:
```bash
node scripts/roadmap/check-plan-freeze.mjs
```
Expected: `plan-freeze: ★ 0/16 · tổng 0/20 (0%) · còn băng` rồi `✅ kế hoạch lat-cat-chung-minh khớp với _acceptance/ — không vi phạm.` (B1 đang ◐, không tính ✅.)

- [ ] **Step 4: Thêm hai script vào `package.json`**

Sau dòng `"roadmap:teeth": "bash scripts/roadmap/check-roadmap-guard-teeth.sh",` thêm:
```json
        "plan:check": "node scripts/roadmap/check-plan-freeze.mjs",
        "plan:teeth": "bash scripts/roadmap/check-plan-freeze-teeth.sh",
```
Run: `pnpm plan:check && pnpm plan:teeth | tail -1` → expected xanh cả hai.

- [ ] **Step 5: Lint + commit**

```bash
pnpm lint:check
cat > /tmp/lcm-msg.txt <<'EOF'
feat(roadmap): guard check-plan-freeze — F0..F4, ti le, go bang, NOTE moc tai hoach

Doc khoi plan-freeze trong docs/roadmap.md + _acceptance/*/{contract,opportunity}.md.
Node builtins, tu choi tham so. 12/12 rang xanh; tren cay that: 0/16 sao, con bang.
EOF
git add scripts/roadmap/check-plan-freeze.mjs package.json
git commit -F /tmp/lcm-msg.txt
```

---

### Task 4: Tài liệu — `check-plan-docs.sh` (đỏ trước), rồi vision.md + STATUS.md

**Files:**
- Create: `scripts/roadmap/check-plan-docs.sh`
- Modify: `docs/strategy/vision.md` (chèn sau mục `## Một câu`, trước `## Năm niềm tin nền` dòng 13)
- Modify: `STATUS.md` (dòng 5–18 Hiện trạng; dòng 42–80 Đang dở; dòng 141–158 Nợ; dòng 164–196 Hàng đợi; dòng 197+ Nghi thức)

**Interfaces:**
- Produces: `check-plan-docs.sh` không tham số, exit 0/1, in `OK`/`FAIL` mỗi phép kiểm — dùng làm eval E12 (Task 7).

- [ ] **Step 1: Viết `check-plan-docs.sh`**

```bash
#!/usr/bin/env bash
# AC-12 of lat-cat-chung-minh: the three living documents carry the plan's
# numbers and the freeze pointer. STATUS.md sat at 2026-08-17 / "17 features"
# while 36 were signed — a document that lies about the count teaches readers
# to stop reading it. Greps, not prose review; one FAIL line per miss.
set -euo pipefail
# Root comes from the script's own location, never hardcoded — the teeth script
# points PLAN_DOCS_ROOT at a throwaway copy to prove each check can go red.
cd "${PLAN_DOCS_ROOT:-$(dirname "$0")/../..}"
if [ $# -gt 0 ]; then
    echo "check-plan-docs: không nhận tham số nào — nhận được: $*" >&2
    exit 2
fi

fails=0
need() { # need <file> <regex> <label>
    if grep -Eq -- "$2" "$1"; then echo "OK: $3"; else echo "FAIL: $3 — không thấy /$2/ trong $1"; fails=$((fails + 1)); fi
}
forbid() { # forbid <file> <regex> <label>
    if grep -Eq -- "$2" "$1"; then echo "FAIL: $3 — vẫn thấy /$2/ trong $1"; fails=$((fails + 1)); else echo "OK: $3"; fi
}

need STATUS.md '^## Hiện trạng \(2026-09-04' 'STATUS.md đề ngày 04/09'

# The signed-dossier count is a RELATION, not a string. Grepping a constant keeps
# this green the day the 37th dossier is signed — the exact drift this file exists
# to catch, certified as fixed by a check that never looked (gap-probe 04/09 P1).
counted=$(grep -l '^status: signed-off' _acceptance/*/contract.md 2>/dev/null | wc -l | tr -d ' ')
claimed=$(sed -n 's/.*\*\*\([0-9]\{1,\}\) hồ sơ đã ký\*\*.*/\1/p' STATUS.md | head -1)
if [ -z "$claimed" ]; then
    echo "FAIL: STATUS.md không khai số hồ sơ đã ký (cần dạng **<số> hồ sơ đã ký**)"; fails=$((fails + 1))
elif [ "$claimed" != "$counted" ]; then
    echo "FAIL: STATUS.md ghi $claimed hồ sơ đã ký, đếm trên cây được $counted"; fails=$((fails + 1))
else
    echo "OK: số hồ sơ đã ký khớp cây ($counted)"
fi
need STATUS.md 'Kế hoạch lát cắt chứng minh' 'STATUS.md trỏ vào khối kế hoạch'
need STATUS.md 'plan:check' 'STATUS.md nêu lệnh xem tỉ lệ'
need STATUS.md 'Phân vùng phiên' 'STATUS.md có nghi thức phân vùng phiên'
forbid STATUS.md '^## Hàng đợi hiện hành' 'STATUS.md không còn bảng hàng đợi thứ hai'
need docs/strategy/vision.md '^## Định vị — bổ sung 04/09' 'vision.md có đoạn định vị ba tầng'
need docs/strategy/vision.md 'tiếp cận được với bất kỳ ai' 'vision.md nêu trụ cột tiếp cận'
need docs/roadmap.md '<!-- plan-freeze:start -->' 'roadmap có khối kế hoạch'
need docs/roadmap.md '^\| S3 \| .*de facto' 'roadmap dòng S3 ghi de facto'
need docs/roadmap.md '^- \*\*1\.5\*\*.*B5' 'roadmap 1.5 trỏ B5'
need docs/roadmap.md '^- \*\*1\.6\*\*.*B7' 'roadmap 1.6 trỏ B7'
need docs/roadmap.md '^\*\*Đọc được gì từ tỉ lệ này.*16/36' 'roadmap đoạn tỉ lệ đếm lại 16/36'
# The ratio paragraph is prose outside the ledger block, but the ledger guard's
# authors warned that backticks read as slugs; keep the paragraph bare.
ratio_para=$(awk '/^\*\*Đọc được gì từ tỉ lệ này/{f=1} f&&/^$/{exit} f' docs/roadmap.md)
if printf '%s' "$ratio_para" | grep -q '`'; then echo "FAIL: đoạn tỉ lệ có nháy ngược"; fails=$((fails + 1)); else echo "OK: đoạn tỉ lệ không có nháy ngược"; fi
forbid docs/roadmap.md 'ADR-0013' 'roadmap không nhắc ADR chưa có trên main'

bash scripts/roadmap/check-roadmap-fresh.sh >/dev/null && echo "OK: guard sổ cái xanh" || { echo "FAIL: guard sổ cái đỏ"; fails=$((fails + 1)); }

[ "$fails" -eq 0 ] || { echo "❌ check-plan-docs: $fails phép kiểm hỏng"; exit 1; }
echo "✅ check-plan-docs: tài liệu khớp kế hoạch"
```

- [ ] **Step 1b: `scripts/roadmap/check-plan-docs-teeth.sh` — răng cho phép kiểm tài liệu**

```bash
#!/usr/bin/env bash
# Teeth for check-plan-docs.sh (gap-probe 04/09 P1). Its red direction used to be a
# single manual run during Task 4; a check whose red half lives in a plan document
# rather than in a script is a check nobody will ever re-prove.
#
# Case `ho-so-thu-37` is the load-bearing one: it distinguishes "counts the tree"
# from "greps a constant" — a grep-based check stays GREEN there.
set -euo pipefail
cd "$(dirname "$0")/../.."
repo_root=$(pwd)
checker="$repo_root/scripts/roadmap/check-plan-docs.sh"
self="$repo_root/scripts/roadmap/check-plan-docs-teeth.sh"
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT

CASES=(clean lui-ngay nhay-nguoc mat-dinh-vi ho-so-thu-37)
is_case() { local n="$1" c; for c in "${CASES[@]}"; do [ "$c" = "$n" ] && return 0; done; return 1; }

build_fixture() {
  rm -rf "$tmp/t"; mkdir -p "$tmp/t/docs/strategy" "$tmp/t/_acceptance" "$tmp/t/scripts/roadmap"
  cp "$repo_root/STATUS.md" "$tmp/t/STATUS.md"
  cp "$repo_root/docs/roadmap.md" "$tmp/t/docs/roadmap.md"
  cp "$repo_root/docs/strategy/vision.md" "$tmp/t/docs/strategy/vision.md"
  cp -R "$repo_root/docs/adr" "$tmp/t/docs/adr"
  cp "$repo_root/scripts/roadmap/check-roadmap-fresh.sh" "$repo_root/scripts/roadmap/roadmap-drift.mjs" "$tmp/t/scripts/roadmap/"
  for d in "$repo_root"/_acceptance/*/; do
    slug=$(basename "$d"); mkdir -p "$tmp/t/_acceptance/$slug"
    [ -f "$d/contract.md" ] && cp "$d/contract.md" "$tmp/t/_acceptance/$slug/"
    [ -f "$d/opportunity.md" ] && cp "$d/opportunity.md" "$tmp/t/_acceptance/$slug/"
  done
  return 0
}
run_checker() { local rc=0; PLAN_DOCS_ROOT="$tmp/t" bash "$checker" > "$tmp/out" 2>&1 || rc=$?; return $rc; }
is_red()   { ! run_checker; }
is_green() {   run_checker; }
out_has()  { grep -Eq -- "$1" "$tmp/out"; }

case_clean() { build_fixture; is_green || return 1; out_has 'số hồ sơ đã ký khớp cây'; }

case_lui_ngay() {
  build_fixture
  sed -i '' 's/^## Hiện trạng (2026-09-04/## Hiện trạng (2026-08-17/' "$tmp/t/STATUS.md"
  is_red || return 1; out_has 'FAIL: STATUS.md đề ngày 04/09'
}

case_nhay_nguoc() {
  build_fixture
  python3 - "$tmp/t/docs/roadmap.md" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
i = s.index("**Đọc được gì từ tỉ lệ này")
j = s.index("\n\n", i)
p.write_text(s[:i] + s[i:j].replace("hạ tầng quy trình", "`hạ tầng quy trình`", 1) + s[j:], encoding="utf-8")
PY
  is_red || return 1; out_has 'đoạn tỉ lệ có nháy ngược'
}

case_mat_dinh_vi() {
  build_fixture
  grep -v '^## Định vị — bổ sung 04/09' "$tmp/t/docs/strategy/vision.md" > "$tmp/v" && mv "$tmp/v" "$tmp/t/docs/strategy/vision.md"
  is_red || return 1; out_has 'vision.md có đoạn định vị ba tầng'
}

# THE LOAD-BEARING CASE. A 37th signed dossier appears and nobody updates STATUS.md.
# A grep for the constant "36" stays green here; a count of the tree does not.
case_ho_so_thu_37() {
  build_fixture
  mkdir -p "$tmp/t/_acceptance/zz-ho-so-thu-37"
  printf -- '---\nschema_version: 1\nslug: zz-ho-so-thu-37\nrisk_tier: T2\nstatus: signed-off\n---\n' \
    > "$tmp/t/_acceptance/zz-ho-so-thu-37/contract.md"
  is_red || return 1
  out_has 'STATUS.md ghi [0-9]+ hồ sơ đã ký, đếm trên cây được [0-9]+'
}

run_case() {
  local name="$1" fn; fn="case_$(printf '%s' "$name" | tr '-' '_')"
  if "$fn"; then echo "  ✓ CASE $name: PASS"; return 0; fi
  echo "  ✗ CASE $name: FAIL"; return 1
}
refuse() { echo "check-plan-docs-teeth: $1" >&2; echo "case hợp lệ: ${CASES[*]}" >&2; exit 2; }

ONE=""
while [ $# -gt 0 ]; do
  case "$1" in
    --list) printf '%s\n' "${CASES[@]}"; exit 0 ;;
    --case) [ $# -ge 2 ] || refuse "\`--case\` cần một tên"; is_case "$2" || refuse "case lạ \`$2\`"; ONE="$2"; shift 2 ;;
    *) refuse "tham số lạ \`$1\`" ;;
  esac
done
if [ -n "$ONE" ]; then echo "→ răng tài liệu: case $ONE"; run_case "$ONE"; exit $?; fi

echo "→ răng của check-plan-docs.sh"
pass=0; fail=0
for c in "${CASES[@]}"; do if run_case "$c"; then pass=$((pass+1)); else fail=$((fail+1)); fi; done
echo
[ "$fail" -eq 0 ] || { echo "❌ răng tài liệu: $pass đạt / $fail hỏng"; exit 1; }
echo "✅ răng tài liệu: $pass/$pass case"
```

Run: `chmod +x scripts/roadmap/check-plan-docs-teeth.sh && bash scripts/roadmap/check-plan-docs-teeth.sh` → sau Step 4 phải xanh 5/5. (Trước Step 4, ca `clean` đỏ vì STATUS.md chưa sửa — đúng, đó là chiều đỏ của chính nó.)

- [ ] **Step 2: Chạy → đỏ (STATUS/vision chưa sửa)**

Run: `chmod +x scripts/roadmap/check-plan-docs.sh && bash scripts/roadmap/check-plan-docs.sh; echo "exit=$?"`
Expected: các dòng `FAIL:` cho STATUS.md (5 phép) và vision.md (2 phép); roadmap OK (Task 1); `exit=1`.

- [ ] **Step 3: vision.md — chèn mục định vị**

Chèn ngay trước dòng `## Năm niềm tin nền`:

```markdown
## Định vị — bổ sung 04/09

Ba tầng, ba tốc độ thay đổi khác nhau:

| Tầng | Nội dung | Thay đổi được? |
|---|---|---|
| **Định vị** | OneFlow là **công cụ nền tảng đa mục đích cho sáng tạo**; thế mạnh hướng đến: *studio quảng cáo AI có bộ nhớ*, tối ưu cho mọi nhu cầu sáng tạo, làm thiết kế đơn giản, **tiếp cận được với bất kỳ ai** | Bất biến — đổi bằng ADR mới |
| **Trụ cột** | ① footage thật trước generative · ② dữ liệu **và thực thi** thuộc về người dùng · ③ sửa rẻ gần bằng không · ④ chữ và giá vẽ tất định · ⑤ tiếp cận được với bất kỳ ai (một nút, tự cài, tự nhập key) · ⑥ bộ nhớ — uỷ quyền media-library | Ít đổi |
| **Lát cắt** | Một tính năng end-to-end chứng minh các trụ cột trên máy người dùng. Lát cắt đầu tiên: Skill #1 "Footage → kho clip" | Thay đổi được |

Tính năng là **bằng chứng** của nền tảng, không phải định nghĩa của nó: thay lát cắt thì kế hoạch
không đổi hình. Kế hoạch lát cắt chứng minh và luật đóng băng: [roadmap.md](../roadmap.md).

```

- [ ] **Step 4: STATUS.md — viết lại bằng python theo neo heading**

Chạy script sau (thay trọn ba mục, gắn nhãn nợ, thêm nghi thức):

```bash
python3 - <<'PY'
import pathlib, re
p = pathlib.Path("STATUS.md"); s = p.read_text(encoding="utf-8")

def replace_section(text, heading_prefix, new_body):
    """Replace from a '## <heading_prefix>…' line up to the next '## ' line."""
    lines = text.split("\n")
    start = next(i for i, l in enumerate(lines) if l.startswith("## " + heading_prefix))
    end = next((i for i in range(start + 1, len(lines)) if lines[i].startswith("## ")), len(lines))
    return "\n".join(lines[:start] + new_body.rstrip("\n").split("\n") + [""] + lines[end:])

hien_trang = """## Hiện trạng (2026-09-04, sau khi mở kế hoạch lát cắt chứng minh và đóng băng)

> Chỉ mục tính năng theo góc nhìn người dùng nằm ở [`docs/feature-index.md`](docs/feature-index.md).
> File này giữ vai *đang ở đâu*; *làm gì tiếp* nằm ở **một chỗ duy nhất**: khối kế hoạch trong
> [docs/roadmap.md](docs/roadmap.md) (mục "Kế hoạch lát cắt chứng minh").

- **36 hồ sơ đã ký**, tất cả trên `main` (guard sổ cái xanh 36/36 @ `eb175ed`, 04/09). Hai hồ sơ ký ngày 04/09 đã hạ cánh: `khong-noi-sai-ve-kho-khoa` (PR #95) và `hang-rao-doc-nham-loi-thanh-khong-co-gi` (PR #96).
- **Định vị ba tầng** ghi ở [vision.md](docs/strategy/vision.md) (04/09): nền tảng đa mục đích → năm trụ cột → lát cắt. Skill #1 là lát cắt chứng minh đầu tiên, không phải định nghĩa sản phẩm.
- **Đóng băng mở hạng mục mới** từ khi `lat-cat-chung-minh` merge tới khi 16/16 ★ và ≥ 85% dòng ✅. Xem tỉ lệ: `pnpm plan:check`. Ngoại lệ chỉ ba lý do: mất-dữ-liệu · bảo-mật · chặn-★.
- **Máy dev đang cài 4 plugin:** `oneflow-api-ffmpeg`, `oneflow-api-openai` (phục vụ cả hai slot transcribe — S3 de facto xong), `oneflow-api-pyscenedetect`, `oneflow-modal-compose-overlay` (mắt Modal duy nhất còn lại trên chuỗi Skill #1 → B6).
- **7 nhánh chưa về `main`** (đo 04/09): `feat/director-wire-shape` (11, → B3), `docs/director-lane-d` (5, nằm trong D0), `b01/open-source-rebrand` (4, → B2), `fix/t1-escape-doi-hoi-artifact-ho-so` (2, → S1), `chore/roadmap-alias-guard`, `draft/bo-phan-loai-token`, `chore/acceptance-ci-recheck-all` (park, giữ nguyên trên ổ).
- **Kit gate (hai tầng):** plugin cache **acceptance-gate 2.8.0 + feature-loop 2.8.0** (đo 04/09); thước vendored trong `scripts/pre-merge-check.sh` là bản fork của repo — hỏi "version nào" phải nêu cả hai. Các con số "kit 1.24.0" / "kit 2.1.0" ở các mục cũ của file này là sử liệu, không phải hiện trạng.
- **Nền tảng:** fork TongFlow (AGPL-3.0). SDK `oneflow-sdk` 0.2.18 trên PyPI, import `tongflow`; 0.2.20 đi cùng B4.
"""
s = replace_section(s, "Hiện trạng", hien_trang)

dang_do = """## Đang dở — bắt máy tiếp ở đây

**Một nguồn duy nhất:** khối `plan-freeze` trong [docs/roadmap.md](docs/roadmap.md), mục
"Kế hoạch lát cắt chứng minh (04/09 → 08/11)". Thứ tự làn B là thứ tự thực thi, một hồ sơ mở tại
một thời điểm; làn A (owner) có hạn theo tuần; ba mốc đồng bộ và luật tái hoạch 09/10 ở §6 của
[thiết kế](docs/superpowers/specs/2026-09-04-lat-cat-chung-minh-design.md).

Bảng điều khiển: `pnpm plan:check` in `plan-freeze: ★ a/16 · tổng c/20 · còn băng|GỠ BĂNG`.
Đừng chép bảng ấy vào đây — hai nguồn sự thật là thứ file này từng trôi 18 ngày vì nó.
"""
s = replace_section(s, "Đang dở", dang_do)

# The second queue table goes; its content lives in the plan block now.
s = replace_section(s, "Hàng đợi hiện hành", """## Hàng đợi — đã chuyển

Bảng "Hàng đợi hiện hành" (0.1a … 1.5) dừng cập nhật ngày 17/08 và bị thay bằng khối kế hoạch
trong docs/roadmap.md ngày 04/09. Sử liệu của bảng cũ: `git show eb175ed:STATUS.md`.
""")

# Label every open debt: in-plan (row id) / park / fixed.
labels = [
    ("Desktop shell trỏ", "**[park — desktop 0.1d/S5]** "),
    ("Token PyPI toàn tài khoản", "**[trong kế hoạch A6]** "),
    ("Ghim SDK của 38 plugin", "**[park — gói nợ fork]** "),
    ("Trùng tên \"OneFlow\"", "**[park]** "),
    ("Hai giới hạn guard đã ghi", "**[park — gate tooling]** "),
    ("2 PR dependabot cũ", "**[đã xử lý]** "),
    ("Gói nợ \"lần fork thật đầu tiên\"", "**[park — gói nợ fork]** "),
    ("🔴 Hai đường chạy giành nhau", "**[trong kế hoạch B4]** "),
    ("`cost_usd` / `gpu_type` chưa từng", "**[park — cost_usd/gpu_type]** "),
    ("Trần 3 lượt chạy đồng thời", "**[park]** "),
    ("`docker run` một dòng trong README", "**[trong kế hoạch B2]** "),
    ("Known limits của `compose-overlay`", "**[park — overlay-canvas-reach; B6 thay plugin]** "),
    ("Agent baseline của kit làm hỏng", "**[đã có bước máy 28/08]** "),
    ("Môi trường dev macOS", "**[ghi chú môi trường]** "),
]
lines = s.split("\n")
for i, l in enumerate(lines):
    if not l.startswith("- ") or l.startswith("- ~~"):
        continue
    for needle, tag in labels:
        if needle in l and tag not in l:
            lines[i] = "- " + tag + l[2:]
            break
s = "\n".join(lines)

ritual = """- **Phân vùng phiên (đo 04/09):** hai phiên có thể chạy trên cùng cây, và HEAD dời dưới chân phiên đang đọc. Trước khi chạm `docs/roadmap.md`, `STATUS.md`, `_acceptance/**`, `PRODUCT-MAP.md`: `ListAgents`, nhắn phiên peer nêu rõ file mình sẽ ghi, đợi xác nhận; nhắn trước khi checkout đổi nhánh. Đo lại `git rev-parse HEAD` trước mỗi phép đo dựa vào cây."""
s = s.rstrip("\n") + "\n" + ritual + "\n"
p.write_text(s, encoding="utf-8")
PY
```

- [ ] **Step 5: Chạy `check-plan-docs.sh` → xanh; đọc lại STATUS.md bằng mắt**

Run: `bash scripts/roadmap/check-plan-docs.sh && grep -c '^\- \*\*\[' STATUS.md`
Expected: `✅ check-plan-docs: tài liệu khớp kế hoạch`; số nhãn ≥ 12. Mở STATUS.md, xác nhận mục "Feature đã ký" (bảng 17 dòng) vẫn còn nhưng KHÔNG mâu thuẫn với "36 hồ sơ" — nếu cần, thêm một dòng ngay dưới heading đó: `> Bảng dưới dừng ở 17 hồ sơ (17/08); 19 hồ sơ sau đó chỉ ghi ở sổ cái docs/roadmap.md.`

- [ ] **Step 6: Commit**

```bash
cat > /tmp/lcm-msg.txt <<'EOF'
docs(status,vision): dinh vi ba tang, STATUS.md tro vao khoi ke hoach, nhan no, nghi thuc phan vung

Kem scripts/roadmap/check-plan-docs.sh (AC-12) canh ba tai lieu dung so.
EOF
git add scripts/roadmap/check-plan-docs.sh docs/strategy/vision.md STATUS.md
git commit -F /tmp/lcm-msg.txt
```

---

### Task 5: Bản đồ sản phẩm — ô "Xếp lại sau" theo `decision`, ô rỗng không heading

**Files:**
- Modify: `scripts/ci/check-product-map.mjs` (hàm `classifyDossiers` quanh dòng 130–182; hàm `checkBucket` quanh dòng 195–232; ba lời gọi `checkBucket` dòng 236–247)
- Modify: `scripts/ci/check-product-map-teeth.sh` (mảng `CASES` dòng 32–44; thêm case)
- Regenerate: `PRODUCT-MAP.md`

**Interfaces:**
- Consumes: generator của kit xếp `stage: decided` + `decision: park` vào ô "Xếp lại sau" và **bỏ heading khi ô trống** (đo 04/09: bản đồ hiện chỉ có 2 heading).
- Produces: checker kiểm ba ô: "Đã giao", "Đang cân nhắc cơ hội", "Xếp lại sau"; heading vắng + kỳ vọng rỗng + nút mermaid "chưa có" = hợp lệ.

- [ ] **Step 1: Thêm case răng `parked-opportunity` (đỏ trước)**

Trong `scripts/ci/check-product-map-teeth.sh`, thêm `parked-opportunity` vào cuối mảng `CASES`, và thêm hàm (đặt sau `case_opportunity_mismatch`):

```bash
# lat-cat-chung-minh AC-11. A parked opportunity (decision: park) belongs in
# "Xếp lại sau", not "Đang cân nhắc cơ hội". Before 04/09 the checker binned
# every opportunity-only dossier as "cân nhắc" and the map disagreed.
case_parked_opportunity() {
    build_fixture
    mkdir -p "$tmp/t/_acceptance/teeth-probe-parked"
    printf -- '---\nschema_version: 1\nslug: teeth-probe-parked\nstage: decided\ndecision: park\n---\n' \
        >"$tmp/t/_acceptance/teeth-probe-parked/opportunity.md"
    check_is_red || return 1
    out_has 'teeth-probe-parked' || return 1
    out_has 'Xếp lại sau'
}
```

Run: `bash scripts/ci/check-product-map-teeth.sh --case parked-opportunity; echo "exit=$?"`
Expected: `FAIL` (checker hiện xếp nó vào "cân nhắc" và không nhắc "Xếp lại sau"), `exit=1`.

- [ ] **Step 2: Sửa `classifyDossiers` — đọc `decision` của opportunity**

Trong `check-product-map.mjs`, đổi khởi tạo `const out = { signed: [], other: [], opportunity: [], unclassified: [] };` thành:
```js
    const out = { signed: [], other: [], opportunity: [], parked: [], unclassified: [] };
```
Thay khối `if (contract === null) { try { read(...opportunity.md); out.opportunity.push(slug); } catch {...} continue; }` bằng:
```js
        if (contract === null) {
            let opportunity;
            try {
                opportunity = read(join(ACCEPTANCE_DIR, slug, "opportunity.md"));
            } catch {
                out.unclassified.push({
                    slug,
                    reason: "không có contract.md lẫn opportunity.md",
                });
                continue;
            }
            // The kit's generator files a decided+park opportunity under
            // "Xếp lại sau"; the checker has to read the same field or the two
            // disagree on every parked item.
            const dm = opportunity.match(/^decision:[ \t]*(.*)$/m);
            const decision = dm ? dm[1].trim() : "";
            if (decision === "park") out.parked.push(slug);
            else out.opportunity.push(slug);
            continue;
        }
```
Sau `out.opportunity.sort();` thêm `out.parked.sort();`.

- [ ] **Step 3: Sửa `checkBucket` — heading vắng là hợp lệ khi ô rỗng**

Thay đoạn đầu hàm:
```js
    const items = blockItems(heading);
    const count = mermaidCount(node);
    // The generator omits a section whose bucket is empty (measured 04/09: the
    // map carried two headings for ten sections). Absent heading + nothing
    // expected + mermaid "chưa có" is the healthy empty state, not drift.
    if (items === null) {
        if (expected.length === 0 && count === 0) return;
        fail(rule, `không tìm thấy khối "## ${heading}" trong ${MAP}`);
        return;
    }
    if (count === null) {
        fail(rule, `không đọc được nút mermaid "${node}" trong ${MAP}`);
        return;
    }
```
(Xoá hai khối `if (items === null)` / `if (count === null)` cũ để không kiểm hai lần.)

- [ ] **Step 4: Thêm lời gọi bucket thứ ba**

Sau lời gọi `checkBucket({ rule: "cân nhắc cơ hội", … })` thêm:
```js
checkBucket({
    rule: "xếp lại sau",
    heading: "Xếp lại sau",
    node: "Xếp lại sau",
    expected: dossiers.parked,
});
```
và trong phần report, sau dòng `cơ hội: …` thêm:
```js
console.log(
    `   xếp lại sau: ${dossiers.parked.length} hồ sơ, ${(blockItems("Xếp lại sau") ?? []).length} mục trên bản đồ, nút mermaid ${mermaidCount("Xếp lại sau")}`,
);
```

- [ ] **Step 5: Sinh lại bản đồ bằng generator của kit, rồi kiểm**

Run:
```bash
RP=$(ls -d "$HOME"/.claude/plugins/cache/acceptance-gate-kit/feature-loop/*/scripts/resolve-plugin.mjs | sort -V | tail -1)
AG=$(node "$RP" --plugin acceptance-gate --require scripts/product-map.mjs)
node "$AG/scripts/product-map.mjs" --root . \
  && grep '^## ' PRODUCT-MAP.md \
  && node scripts/ci/check-product-map.mjs \
  && bash scripts/ci/check-product-map-teeth.sh
```
Expected: bản đồ có `## Xếp lại sau` (3 mục) và có thể không còn `## Đang cân nhắc cơ hội`; checker in `xếp lại sau: 3 hồ sơ, 3 mục trên bản đồ, nút mermaid 3` và `✅`; răng 12/12 (11 cũ + `parked-opportunity`). Nếu generator xếp `lat-cat-chung-minh` (Task 7 chưa tạo) — chưa có gì để xếp ở bước này, đúng.

- [ ] **Step 6: Commit**

```bash
cat > /tmp/lcm-msg.txt <<'EOF'
fix(ci): check-product-map hoc o "Xep lai sau" theo decision, o rong khong heading la hop le

Kem case rang parked-opportunity va PRODUCT-MAP.md sinh lai (3 co hoi park).
EOF
git add scripts/ci/check-product-map.mjs scripts/ci/check-product-map-teeth.sh PRODUCT-MAP.md
git commit -F /tmp/lcm-msg.txt
```

---

### Task 6: Đấu dây CI, guard-của-guard, config.yaml

**Files:**
- Modify: `.github/workflows/ci.yml` (sau step `Product map freshness`, ~dòng 146)
- Modify: `scripts/ci/check-gate-guards-job.sh` (mảng `GUARD_NEEDLES` dòng ~39–47; `TEETH_SKIP` ~53–56; khối python `PERTURB` ~dòng 275–300)
- Modify: `_acceptance/config.yaml` (khối `executors.script` — sau dòng 344 `roadmap_teeth_duplicate`; `feature_loop.suite_keys` sau `executors.script.preflight_env`)

**Interfaces:**
- Consumes: `node scripts/roadmap/check-plan-freeze.mjs` (exit 2 với cờ rác), `bash scripts/roadmap/check-plan-freeze-teeth.sh`.
- Produces: khoá executor `plan_freeze`, `plan_freeze_teeth_all`, `lcm_teeth_*` (một khoá mỗi case), `lcm_docs`, `lcm_wiring`; suite key `executors.script.plan_freeze`.

- [ ] **Step 1: ci.yml — hai step mới**

Sau:
```yaml
      - name: Product map freshness
        run: node scripts/ci/check-product-map.mjs
```
thêm:
```yaml
      # Freeze rule of the proof-slice plan (docs/roadmap.md, block plan-freeze):
      # no working-state dossier outside the plan until every ★ row is done.
      # Prints the completion ratio on every run — the plan's only dashboard.
      - name: Plan freeze
        run: node scripts/roadmap/check-plan-freeze.mjs
      - name: Plan freeze guard still has teeth
        run: bash scripts/roadmap/check-plan-freeze-teeth.sh
```

- [ ] **Step 2: `check-gate-guards-job.sh` — needle, skip, perturb**

Trong `GUARD_NEEDLES` thêm hai dòng sau `check-product-map.mjs`:
```bash
    check-plan-freeze.mjs
    check-plan-freeze-teeth.sh
```
Trong `TEETH_SKIP` thêm:
```bash
    "check-plan-freeze-teeth.sh|ve do cua no CHINH LA no; pha no de chung minh no biet do la vong tron"
```
Trong khối python `PERTURB` (trước dòng `PERTURB` đóng heredoc) thêm:
```python
# A working-state dossier outside the plan -> check-plan-freeze.mjs must go red.
stray = root / "_acceptance" / "teeth-probe-freeze"
stray.mkdir(parents=True, exist_ok=True)
(stray / "contract.md").write_text("---\nschema_version: 1\nslug: teeth-probe-freeze\nstatus: draft\n---\n", encoding="utf-8")
```

- [ ] **Step 3: `_acceptance/config.yaml` — khoá executor + suite key**

Sau dòng `roadmap_teeth_duplicate: …` thêm (giữ 4 khoảng trắng đầu dòng):
```yaml
    # --- lat-cat-chung-minh (04/09) --- guard dong bang + rang, MOT khoa moi case.
    plan_freeze: "node scripts/roadmap/check-plan-freeze.mjs"
    plan_freeze_teeth_all: "bash scripts/roadmap/check-plan-freeze-teeth.sh"
    lcm_teeth_clean: "bash scripts/roadmap/check-plan-freeze-teeth.sh --case clean"
    lcm_teeth_khoi_hong: "bash scripts/roadmap/check-plan-freeze-teeth.sh --case khoi-hong"
    lcm_teeth_o_moi: "bash scripts/roadmap/check-plan-freeze-teeth.sh --case o-moi-ngoai-ke-hoach"
    lcm_teeth_tick_noi_doi: "bash scripts/roadmap/check-plan-freeze-teeth.sh --case tick-noi-doi && bash scripts/roadmap/check-plan-freeze-teeth.sh --case tin-theo-loi"
    lcm_teeth_park: "bash scripts/roadmap/check-plan-freeze-teeth.sh --case park-khong-that"
    lcm_teeth_ngoai_le: "bash scripts/roadmap/check-plan-freeze-teeth.sh --case ngoai-le-tran && bash scripts/roadmap/check-plan-freeze-teeth.sh --case ngoai-le-hop-le"
    lcm_teeth_go_bang: "bash scripts/roadmap/check-plan-freeze-teeth.sh --case go-bang"
    lcm_teeth_checkpoint: "bash scripts/roadmap/check-plan-freeze-teeth.sh --case checkpoint-note && bash scripts/roadmap/check-plan-freeze-teeth.sh --case checkpoint-done"
    lcm_teeth_builtins: "bash scripts/roadmap/check-plan-freeze-teeth.sh --case builtins-only"
    lcm_teeth_kiem_co_hoi: "bash scripts/roadmap/check-plan-freeze-teeth.sh --case kiem-co-hoi && bash scripts/roadmap/check-plan-freeze-teeth.sh --case kiem-co-hoi-de-xuat"
    lcm_teeth_isolation: "bash scripts/roadmap/check-plan-freeze-teeth.sh --case case-isolation"
    lcm_docs: "bash scripts/roadmap/check-plan-docs.sh"
    lcm_docs_teeth: "bash scripts/roadmap/check-plan-docs-teeth.sh"
    lcm_wiring: "bash scripts/ci/check-gate-guards-job.sh shape && bash scripts/ci/check-gate-guards-job.sh reachable && bash scripts/ci/check-gate-guards-job.sh suite-keys && bash scripts/ci/check-gate-guards-job.sh teeth"
    lcm_pmap: "node scripts/ci/check-product-map.mjs && bash scripts/ci/check-product-map-teeth.sh --case parked-opportunity"
```
**Lưu ý:** teeth script chỉ nhận **một** `--case` mỗi lần chạy (khuôn roadmap teeth), nên hai khoá gộp hai case đều nối bằng `&&` như trên.

Trong `feature_loop.suite_keys`, ngay sau `- executors.script.preflight_env` thêm:
```yaml
    # lat-cat-chung-minh (04/09): moi vong verify local cung phai thay dong bang —
    # cong local khong chay guard so cai, nen PR #96 len CI moi do.
    - executors.script.plan_freeze
```

- [ ] **Step 4: Chạy mọi mode của guard-của-guard + guard**

Run:
```bash
for m in shape no-softening reachable job-count suite-keys teeth; do echo "== $m"; bash scripts/ci/check-gate-guards-job.sh $m || exit 1; done
python3 -c "import yaml; yaml.safe_load(open('_acceptance/config.yaml')); print('config.yaml OK')"
node scripts/roadmap/check-plan-freeze.mjs
```
Expected: sáu mode `OK …`; `teeth` in lệnh rút từ ci.yml cho cả hai needle mới, vế xanh và vế đỏ (needle teeth nằm trong skip); config.yaml parse được; guard xanh.
Nếu `teeth` đỏ vì `check-plan-freeze.mjs` **không đỏ** trên cây đã phá: kiểm khối PERTURB đã tạo `teeth-probe-freeze/contract.md` (F1 phải bắt).

- [ ] **Step 5: Commit**

```bash
cat > /tmp/lcm-msg.txt <<'EOF'
ci(gate): dau day check-plan-freeze — step, needle + skip + perturb, khoa executor va suite key
EOF
git add .github/workflows/ci.yml scripts/ci/check-gate-guards-job.sh _acceptance/config.yaml
git commit -F /tmp/lcm-msg.txt
```

---

### Task 7: Kiểm toàn cục, PR, bàn giao Cổng 2

**Files:** không file mới; có thể chạm `run-log.jsonl` / `evidence-report.md` của hồ sơ đã ký khác nếu phải re-pin, và `PRODUCT-MAP.md` sinh lại.

**Interfaces:**
- Consumes: mọi thứ Task 0–6; hồ sơ `lat-cat-chung-minh` đang `status: approved` (Cổng 1 đã ký ở Task 0 Step 8).
- Produces: cây sẵn cho S4 VERIFY (`status: implemented`) và Cổng 2.

- [ ] **Step 1: Kiểm toàn cục trước khi giao Cổng 2**

Run:
```bash
RP=$(ls -d "$HOME"/.claude/plugins/cache/acceptance-gate-kit/feature-loop/*/scripts/resolve-plugin.mjs | sort -V | tail -1)
AG=$(node "$RP" --plugin acceptance-gate --require scripts/product-map.mjs)
bash scripts/acceptance/preflight-verify-env.sh
node scripts/roadmap/check-plan-freeze.mjs
bash scripts/roadmap/check-plan-freeze-teeth.sh | tail -1
bash scripts/roadmap/check-plan-docs.sh | tail -1
node scripts/ci/check-product-map.mjs | tail -1
node "$AG/scripts/product-map.mjs" --root . --check
pnpm lint:check && pnpm test
bash scripts/pre-merge-check.sh . --base origin/main
```
Expected: preflight xanh; guard `★ 0/16 · tổng 0/20 · còn băng` xanh (B1 ◐, hồ sơ approved nằm trong bảng nên F1 im; cơ hội skill-1 ở discovery cũng trong bảng); răng 13/13; docs xanh; bản đồ khớp — **lưu ý:** hồ sơ B1 và cơ hội skill-1 làm generator xếp thêm ô ("Chờ duyệt phạm vi"/"Đang làm", "Đang cân nhắc cơ hội"): chạy lại generator (không `--check`) rồi commit PRODUCT-MAP.md nếu `--check` đỏ; lint + test xanh; pre-merge-check in `VIOLATION [lat-cat-chung-minh]: status=approved …` hoặc tương đương là **đúng** (cổng chặn merge tới Cổng 2), mọi hồ sơ đã ký khác `OK`.

Nếu pre-merge-check báo hồ sơ đã ký nào **stale** vì diff chạm `paths` của nó (ứng viên: `roadmap-drift-guard` với `scripts/roadmap/**`? — nó khai `scripts/roadmap/check-roadmap-fresh.sh` và `roadmap-drift.mjs`, không chạm; `cong-tu-canh-minh` khai `scripts/ci/check-gate-guards-job.sh` và `.github/workflows/ci.yml` → **sẽ stale**; `noi-thuoc-tai-lieu-vao-ci` có thể khai `ci.yml`): làm đúng nghi thức re-pin (AGENTS.md): chạy lại eval của hồ sơ đó bằng khoá executor của nó, ghi dòng repin JSON nén vào `run-log.jsonl` (kèm `prev_sha`), dời `verified_commit` — **re-pin là việc cuối** trước vòng verify.

- [ ] **Step 2: Push và cập nhật PR**

```bash
git push -u origin feat/lat-cat-chung-minh
gh pr create --draft --title "feat(plan): lat-cat-chung-minh — ke hoach hop nhat, luat dong bang co rang" --body-file <(cat <<'EOF'
Hồ sơ T2 `lat-cat-chung-minh` (B1 của khối kế hoạch). Chờ Cổng 1.

- Khối `plan-freeze` trong docs/roadmap.md: 20 dòng, 16 ★; S3 de facto; 1.5/1.6 → B5/B7; đoạn tỉ lệ đếm lại 36 hồ sơ.
- Guard `scripts/roadmap/check-plan-freeze.mjs` (F0–F4, tỉ lệ, gỡ băng, NOTE mốc) + 12 case răng; step CI; needle guard-của-guard; suite key.
- Ba cơ hội park (nửa máy); `check-product-map.mjs` học ô "Xếp lại sau"; PRODUCT-MAP.md sinh lại.
- vision.md: định vị ba tầng. STATUS.md: 04/09, 36 hồ sơ, con trỏ vào khối kế hoạch, nhãn nợ, nghi thức phân vùng phiên.

Spec: docs/superpowers/specs/2026-09-04-lat-cat-chung-minh-design.md · Plan: docs/superpowers/plans/2026-09-04-lat-cat-chung-minh.md

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)
```

- [ ] **Step 3: Bàn giao cho owner (việc người, không phải máy)**

1. Đặt contract `status: implemented`; feature-loop resume vào **S4 VERIFY** (`feature-loop:acceptance-verify`) với `runBaseline` tắt; tối đa 3 round.
2. **Commit chỉ-trường-người** điền `decided_by: Phan Le Manh` và `decided_at: <ISO UTC>` cho ba file `_acceptance/{director-v2,timeline-view,staleness-ho-so-thieu-paths}/opportunity.md` — không sửa gì khác trong commit đó. (Nếu chưa làm ở Task 0: ký Cổng Đáng của `skill-1-footage-kho-clip` = A1.)
3. **Cổng 2**: xem thẻ bằng `acceptance-gate:acceptance-card`; ký `signed-off` trong commit chỉ-trường-người; merge bằng merge commit (không squash); sau merge, dòng B1 trong khối kế hoạch chuyển `◐` → `✅` trong PR kế tiếp (guard F2 xác nhận contract signed-off), và A1 chuyển ✅ khi cơ hội đã ký (guard F2 xác nhận qua `kiểm: opportunity:`).

---

## Self-review (đã chạy khi viết)

- **Nếp kit (2.8.0):** Task 0 = S1 (ba artifact + cơ hội + gap-probe đồng bộ 6 input + thẻ Cổng 1, dừng chờ người theo quyết định owner); plan này = S2; Task 1–7 = S3; S4/Cổng 2/S5 ở Task 7 Step 3. Kit đo bằng `installed_plugins.json`, đường dẫn plugin qua `resolve-plugin.mjs`.
- **Spec coverage:** §3 khối kế hoạch → Task 1; §4/§5 luật + guard + teeth + đấu dây → Task 2, 3, 6; §8.1 vision → Task 4; §8.2 roadmap → Task 1; §8.3 STATUS → Task 4; §8.4 hồ sơ + cơ hội lát cắt + park + bản đồ → Task 0, 1, 5; §9 AC-1…AC-14 → E1…E14 (E1↔AC-1 dùng case clean đếm 20/16; AC-9 ↔ lcm_wiring; AC-11 ↔ lcm_pmap; AC-12 ↔ lcm_docs; AC-13 ↔ builtins-only; AC-14 ↔ kiem-co-hoi). Khoá `closed:` có trong guard, không có case — khai Known limits (decisions lcm1). B10 tin theo lời (Out of scope).
- **Placeholder scan:** không TBD/TODO; mọi bước code có code; các "nếu … thì" đều nêu việc cụ thể.
- **Type consistency:** tên case ở Task 2 (13) = tên trong khoá executor Task 6 = tên trong evals Task 0; chuỗi thông điệp guard (Task 3) = chuỗi teeth grep (Task 2): `mở ngoài kế hoạch`, `chưa ký`, `chưa ký Cổng Đáng`, `tin theo lời`, `khai park mà hồ sơ chưa park`, `không có lý do có tên`, `GỠ BĂNG`, `NOTE [plan-freeze] đã qua mốc tái hoạch`, `không nhận tham số`, `F0`…`F4`. Nhãn bảng `**Xếp lại sau**` / `**Ngoại lệ mở giữa lúc băng**` và cú pháp ghi chú `kiểm: opportunity:<slug>` giống nhau ở Task 1 và Task 3. Khoá `lcm_teeth_tick_noi_doi` và `lcm_teeth_checkpoint` viết dạng `a && b`.
