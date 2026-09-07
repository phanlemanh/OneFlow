---
schema_version: 1
feature: Per-task metering columns and measured plugin duration
slug: task-metering
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api]
status: signed-off
approved_by: Manh
approved_at: 2026-07-25
time_human_minutes: {gate1: 0, gate2: 0}
# The merge commit that carried this feature into main (PR #12).
# scripts/acceptance/own-range.sh turns it into the commit range this
# feature's evals ask over, so re-running on a later branch still grades
# this feature's own diff instead of the whole branch.
landed_merge: f335135
---

# Acceptance Contract: task-metering

## Context

Phase 0 item 0.2 of the product plan. Before we can reconcile a real Modal
invoice against individual nodes (item 0.3), every task row has to carry how
long its plugin actually ran. The `tasks` table already records *what* ran
(`pluginId`, `feature`, `model`) but nothing about *cost*, so today an invoice
can only be attributed to a whole month, not to a node.

This round adds the three metering columns and populates the one number we can
measure honestly today — `duration_ms`. `cost_usd` and `gpu_type` are created
but deliberately left NULL, because three findings block filling them without a
new mechanism: ABI slot outputs are `additionalProperties: false` so a plugin
cannot return metadata alongside its result; the deploy scanner
([parse_deploy.py:87-98](../../sdk/tongflow/parse_deploy.py)) deliberately knows
nothing about a backend's class decorator, so `gpu="A100-40GB"` cannot be read
off `@app.cls` without breaking that stated invariant; and the existing
`@@TF_PROGRESS@@` channel needs both a stderr transport and an HTTP sink to work
in cloud mode, so a metadata twin is a subsystem, not a line of code.

Creating the columns now is the point: the council flagged provenance retrofit
as expensive once rows exist, and this is the cheap moment.

Source input: prompt (product plan Phase 0, item 0.2)

## Criteria

- AC-1: Given the drizzle schema, When `pnpm db:generate` has been run and the migration is committed, Then `tasks` gains exactly three columns — `cost_usd` (real, nullable), `duration_ms` (integer, nullable), `gpu_type` (text, nullable) — and the migration contains no `DROP`, no column rename, and no alteration of any pre-existing column.
- AC-2: Given a database file created before this change (migration level 0001) containing task rows, When the app opens it and migrations run, Then the three columns are added, every pre-existing row is preserved, and the new columns read as NULL for those rows.
- AC-3: Given a fresh database, When migrations run, Then `PRAGMA table_info(tasks)` reports the three new columns with the declared types and all three nullable.
- AC-4: Given a single-node task whose plugin returns `success: true`, When `executeTask` finishes, Then the task row's `duration_ms` is a positive integer and is written in the same update that sets `status: "completed"`.
- AC-5: Given a single-node task whose plugin returns `success: false`, When `executeTask` finishes, Then `duration_ms` is still written alongside `status: "failed"` — a failed generation costs GPU time and must not vanish from the ledger.
- AC-6: Given a single-node task whose plugin invocation throws, When the catch branch writes the failure, Then `duration_ms` is written alongside `status: "failed"`.
- AC-7: Given asset preparation that takes materially longer than the plugin call, When the task completes, Then `duration_ms` reflects only the `executePlugin` invocation and excludes `prepareAssetInput` — the number has to mean "billable plugin time" for invoice reconciliation to work.
- AC-8: Given a task that is aborted mid-flight, When the runner takes its early-return path, Then no `duration_ms` is written for that task — a cancelled run must not enter the ledger as a completed measurement.
- AC-9: Given any task written by this round, When its row is read, Then `cost_usd` and `gpu_type` are NULL — no estimated, derived or placeholder value is ever written, so item 0.3 can distinguish "not measured" from "measured as zero".
- AC-10: Given the existing task lifecycle, When a task completes or fails, Then `status`, `result`, `error` and the SSE notifications are byte-for-byte unchanged from before this feature.
- AC-11: Given the repo's standing checks, When `pnpm lint:check`, `pnpm typecheck` and `pnpm build` run, Then all three pass with no new warnings.

## Coverage

Morphological scan of the change surface — axes and the measuring stick per axis:

- Trục **đường ghi DB** (write path): success (AC-4) | plugin trả `success:false` (AC-5) | throw (AC-6) | abort (AC-8, phải KHÔNG ghi). [thước CE: 4 nhánh trong `executeTask`, đếm trực tiếp từ [runner.ts:148-268](../../src/lib/task/runner.ts)]
- Trục **cột**: `duration_ms` được ghi (AC-4/5/6) | `cost_usd` phải NULL (AC-9) | `gpu_type` phải NULL (AC-9). [thước CE: 3 cột khai trong schema, không cột nào thiếu AC]
- Trục **vòng đời DB**: DB mới (AC-3) | DB cũ có dữ liệu (AC-2). [thước CE: `_journal.json` có 2 mức migration → đúng 2 trạng thái xuất phát]
- Trục **ranh giới đo**: chỉ `executePlugin` (AC-7) | loại trừ `prepareAssetInput` (AC-7). [thước CE: 2 lời gọi await trong thân `executeTask`]
- Trục **đường thực thi**: single-node `executeTask` (AC-4…AC-8) | workflow-qua-engine `executeWorkflowViaEngine` — **ngoài phạm vi**, khai ở Out of scope. [thước CE: 2 nhánh trong `dispatchTask`]
- Trục **không hồi quy**: hành vi cũ giữ nguyên (AC-10) + cây kiểm tra chuẩn (AC-11).

## Out of scope

- **Kênh metadata plugin → nền tảng** (`@@TF_META@@` hoặc tương đương) để điền `gpu_type`/`cost_usd`. Cần cả transport stderr (local) lẫn HTTP sink (cloud) như `progress.py` đã làm — là một tiểu hệ thống riêng, không phải phần đuôi của việc này.
- **Đường workflow chạy qua engine Python** (`executeWorkflowViaEngine`). Engine ghi task theo đường khác; đo ở đó thuộc cùng gói với cache/partial re-render (hạng mục 0.4).
- **Bảng giá GPU và quy đổi ra tiền.** Việc quy đổi thuộc 0.3, sau khi có hoá đơn Modal thật để hiệu chỉnh — tự bịa công thức bây giờ sẽ làm hỏng chính phép đối chiếu đó.
- **Cột `entity_refs` (provenance của Universe KG).** Thuộc Phase 1 khi KG v0 ra đời; lần này chỉ mở đường bằng migration additive.
- **Hiển thị metric lên UI.** Không có bề mặt web nào trong phạm vi này (nên không có eval design).
- **Đo lại lịch sử.** Task đã tồn tại giữ `duration_ms` NULL vĩnh viễn; không backfill.

## Notes

- Migration đi theo đúng tiền lệ [drizzle/0001](../../drizzle/0001_smart_morgan_stark.sql) (`ALTER TABLE tasks ADD model text`) — additive, nullable, không cần backfill. Migration tự áp dụng khi mở DB ([src/ext-default/db.ts:33](../../src/ext-default/db.ts)).
- `duration_ms` dùng đồng hồ đơn điệu (`performance.now()`), không phải `Date.now()`, để không bị nhảy khi đồng hồ hệ thống đổi.
- Không có bề mặt web UI → bỏ qua eval design theo SKILL 2b (ghi nhận việc bỏ qua tại đây).
