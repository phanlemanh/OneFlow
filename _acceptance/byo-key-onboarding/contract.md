---
schema_version: 1
feature: BYO-key onboarding — first run reaches a real result before asking for a key
slug: byo-key-onboarding
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ui, api]
status: approved
approved_by: phanlemanh@gmail.com
approved_at: 2026-08-07T09:22:27Z
time_human_minutes: {gate1: 0, gate2: 0}
---

# Acceptance Contract: byo-key-onboarding

## Context

[ADR-0011](../../docs/adr/0011-local-first-execution.md) makes BYO key the default and records the
accepted risk in its own words: the chosen ICP *"không có thẻ quốc tế, không biết Modal là gì"*. It
also fixes a falsifiable reversal condition — **≥ 1/3 of representative users failing to complete
the key step means managed tier returns as the default and ADR-0011 is superseded.**

For that measurement to answer the question it asks, users must *reach* the key step. Today they
cannot, and not because of one barrier but five: no plugin ships with the app, nothing points at
the plugin manager, the first run silently spends minutes building a Python venv, nothing points at
settings — and before all of that, the bundled welcome example demands three Modal plugins, i.e.
exactly the account ADR-0011 says the ICP does not have.

Fixing the funnel is therefore a **precondition for ADR-0011's reversal condition to mean anything**:
a session run today would measure "could not find the plugin manager" and label it "BYO key failed".

Source input: [design](../../docs/superpowers/specs/2026-08-07-byo-key-onboarding-design.md) ·
[ADR-0011](../../docs/adr/0011-local-first-execution.md) · roadmap item "S4"

## Criteria

### A. Reach a result before paying anything

- AC-1: Given a machine that has never run OneFlow, When the workspace opens, Then the bundled
  example workflow requires **zero** API keys and zero third-party accounts — no node in it resolves
  to a plugin whose manifest declares a `required` env key.
- AC-2: **(cross-layer)** Given that example, When the user completes the guided path, Then a real output
  asset appears on the canvas **before** any key has been requested or entered — and the asset is one the
  run PRODUCED, provably distinct from the sample bundled in `public/example-assets/`. A failed run that
  leaves the bundled input on screen must NOT read as success.
- AC-3: Given the workspace has already run the example once, When it is reopened, Then the first-run
  strip does not reappear — the guidance is idempotent and does not nag.
- AC-13: Given a user who ignores the strip entirely, When they use the canvas, Then nothing is
  blocked: no modal, no disabled canvas, no forced step. The strip is guidance, never a gate.

### B. The four walls become visible

- AC-4: Given the example needs plugins that are not installed, When the workflow **loads**, Then the
  missing plugins are named before the user presses anything — detection happens at load, not at run.
  (Industry: ComfyUI-Manager lists missing nodes at load.)
- AC-5: Given the example needs **two or more** plugins and none are installed, When the user presses the
  single action on the strip **exactly once**, Then **every** one of those plugins ends up installed — the
  relation between one press and the whole set, not merely that an install-all function exists somewhere.
- AC-6: Given a plugin has just been installed, When the registry is queried, Then the new plugin is
  registered **without restarting the app**. (OneFlow's install route rescans the registry; this
  criterion exists to keep that advantage over ComfyUI, which requires a restart.)
- AC-7: **(cross-layer)** Given a plugin's Python environment is being provisioned, When it runs, Then the client
  receives the **real** provisioning milestones emitted by the executor (create venv → install SDK →
  install requirements), not a simulated bar. A milestone must correspond to work that actually
  finished.
- AC-8: Given provisioning takes minutes, When the user watches, Then elapsed state is continuously
  distinguishable from a hang — the last reached milestone stays on screen with its own label.

### C. The key step itself

- AC-9: Given a node fails because a required env key is missing, When the failure surfaces, Then the
  key can be entered **at the node**, without navigating to the settings dialog.
  (Industry: n8n creates credentials inline from the node.)
- AC-10: **(cross-layer)** Given a key is entered and saved, When the save completes, Then it is **verified against the
  thing it unlocks** and the user is told whether it works — a wrong key must not be discovered later
  at run time — verification means asking the thing the key unlocks, NOT checking the key's shape. A
  well-formed but rejected key must come back reported as not working. (Industry: n8n tests credentials
  on save.)
- AC-11: Given a task fails, When the failure is classified, Then the offered action matches the
  cause: missing plugin → plugin manager filtered to that plugin; missing/invalid key → the key form;
  anything else → today's plain message with **no** invented action.

### D. Constraints this feature must not violate

- AC-12: Given the whole feature, When the client is exercised end to end, Then **no** request carries
  onboarding progress, funnel steps, timings or any behavioural record to any server. The reversal
  condition is measured by human observation; instrumenting the feature that exists to prove "your
  data is yours" would contradict it.
- AC-14: Given this feature is declared T3 because it touches `src/lib/plugin-executor/**`, When the
  change lands, Then `config/tongflow.abi.json`, `src/generated/abi/**`, `sdk/**` and `src/db/**` show
  **zero** changed files — the tier is justified by exactly one t3 path, not a blanket.
- AC-15: **(judgment)** Given a representative user session, When the funnel is walked, Then each of the five walls
  has a state an observer can point at from outside the app, with no console or log access.

## Coverage

Morphological scan; chân sản phẩm = [`vision.md`](../../docs/strategy/vision.md) + ADR-0011;
chân ngành = ComfyUI-Manager và n8n (tra và xác minh, xem design doc §Đối chiếu ngành).

- **Trục A — tường trong phễu:** tìm-plugin | cài-plugin | dựng-môi-trường | nhập-key | chạy-xong
  [thước CE: ngành ComfyUI-Manager phủ ba tường đầu; n8n phủ tường key]
- **Trục B — kết cục một bước:** xong | đang-chờ | hỏng-tự-sửa-được | hỏng-cần-người | bỏ-giữa-chừng
  [thước CE: SP — enum `TaskStatus` trong repo; ngành n8n — test-on-save tách "lưu được" khỏi "dùng được"]
- **Trục C — thời điểm phát hiện:** lúc load workflow | trước khi chạy | lúc chạy | không bao giờ
  [thước CE: ngành ComfyUI — phát hiện lúc load là chuẩn của loại này]
- **Trục D — bề mặt mang tin:** dải first-run | node | toast | settings | plugin dialog
  [thước CE: SP — surface đã tồn tại trong repo; ngành n8n — form credential nằm TRÊN node]

Tích Descartes 5×5×4×5 = 500 ô → quét theo lát cắt trục A thay vì liệt kê hết. Core = 15 AC (~3%).

Hai ô Core đến **từ chân ngành chứ không từ chân sản phẩm** — AC-10 (test key lúc lưu) và AC-9 (form
key tại node). Cả hai vắng mặt trong bản thiết kế đầu, và cả hai là must-be theo Kano: không ai nêu
ra khi được hỏi, nhưng thiếu là hỏng. Đây là lý do trục ngành bắt buộc.

## Out of scope

- **Telemetry mọi dạng** — kể cả cục bộ. Số liệu đảo chiều lấy từ phiên quan sát tay (AC-12 là nửa
  cấm của chính điều này).
- **Đổi cách lưu key.** `env-store.server.ts` và `/api/settings/env` giữ nguyên; feature này chỉ đổi
  *đường tới* chúng.
- **Tier managed / màn hình thanh toán.** ADR-0011 đặt nó là tier chứ không phải mặc định; dựng ở đây
  là hiện thực hoá trước cái mà điều kiện đảo chiều còn chưa phán.
- **Wizard chặn nhiều bước** — bị loại có chủ đích: bắt trả giá trước khi giao giá trị, ngược đúng
  thứ tự ADR-0011 cần chứng minh.
- **Desktop app chạy server tại máy** — roadmap S5, hạng mục riêng.
- **Đa ngôn ngữ ngoài các locale repo đã có.**
- **Màn hình nhỏ / mobile.** OneFlow là canvas desktop; 375px không phải mặt phẳng được hỗ trợ,
  nên ma trận design-pass chỉ chụp desktop và không AC nào ràng buộc breakpoint. Dải first-run vẫn
  xếp dọc khi cửa sổ hẹp, nhưng đó là chống vỡ cho **cửa sổ desktop bị thu hẹp** (chia đôi màn
  hình), không phải cam kết hỗ trợ mobile.

## Notes

- **Sóng re-sign đã đo bằng máy TRƯỚC khi duyệt, không ước lượng: 17 feature.** `cache-l1-fingerprint`,
  `cache-l2-store`, `cache-l3-tier-b`, `cache-l4-eviction`, `ci-actions-bump`, `ci-vitest-sdk-pin`,
  `compose-overlay`, `conformance-l0`, `dependency-refresh-2026-07`, `gate-scope-anchors`,
  `local-cpu-plugins`, `measure-harness`, `oneflow-plugin-prefix`, `per-plugin-origin`,
  `sdk-distribution-rename`, `stale-scope-by-paths`, `task-metering`. (Bài học từ `local-cpu-plugins`:
  spec bảo tính ở Cổng 1, lần trước bỏ qua nên sóng thành hoá đơn nhận lúc kết toán.)
- **Đính chính con số trên, đo lại lúc duyệt Cổng 1 (2026-08-07):** lần đo đầu ra **11**, đo lại ra
  **17**. Sáu feature chênh — bốn `cache-*`, `gate-scope-anchors`, `stale-scope-by-paths` — KHÔNG do
  đường t3 của feature này, mà do **công cụ đo a11y**: thêm `axe-core` + `puppeteer-core` vào
  `package.json`/`pnpm-lock.yaml` và thêm cờ `--html` vào `scripts/ui-capture.mjs`. Sáu hồ sơ đó khai
  `paths` chạm đúng ba file ấy. Bài học kế tiếp của chính bài học trên: sóng phải đo lại **sau** khi
  nghi thức trước cổng đã chạm cây mã, không phải chỉ đo trên diff dự kiến của feature.
- **Vì sao T3:** đúng một t3 path — `src/lib/plugin-executor/**`, để phát sự kiện tiến độ thật cho
  AC-7. Phương án T2 (báo trước "vài phút") đã cân nhắc và bị loại: xem design doc.
- **`feature_loop.ui_standards_skill` chưa khai** trong `_acceptance/config.yaml` → artifact UI của
  feature này không có đối trọng chuẩn nội. Không chặn; ghi để Cổng 1 biết.
- AC-15 là mục judgment duy nhất. T3 ⇒ verdict của judge chỉ tham khảo, người phải tự phán.
