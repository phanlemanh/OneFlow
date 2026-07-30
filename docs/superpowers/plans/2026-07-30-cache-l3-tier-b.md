# Cache L3 — tier B, per-workflow memo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Slot bất định (23 slot có núm) được dùng lại trong phạm vi một workflow của một tenant; kèm fix `plugin_is_dirty` fail-open; ba feature bị chạm ký lại trên bằng chứng chạy lại thật.

**Architecture:** `workflowScope` thành thành phần khoá thứ 10 (`null` cho tầng A, `"wf:<id>:node:<nodeId>[:call:<ordinal>]"` cho tầng B — ordinal chỉ khi node chia lô), `KEY_SCHEMA_VERSION` 2→3. `TIER_B_SLOTS` là hằng 23 slot trong `node_cache.py` + guard đọc ABI lúc test. Plumbing `workflow_id` tái dùng nguyên seam của L2: `runner.ts` → `engineOptionsFor` → bridge → `run_workflow`.

**Tech Stack:** như L2 (Python/pytest qua `uv`, vitest, không thêm dependency).

## Global Constraints

- **Comment tiếng Anh.** KHÔNG đụng `callog.py`, `scan.py`, `plugins.py`, `store.py`.
- Sửa `fingerprint.py`/`node_cache.py`/`runner.py`/`__main__.py`/`engine-delegate.server.ts` là **đã báo giá** (ba chữ ký lại) — nhưng vẫn giữ diff tối thiểu.
- Kế thừa nguyên hai quy tắc chung của L2 (non-None 64-hex; không-cacheable kiểm hai chiều).
- Tên hàm test khớp **từng ký tự** node-id trong `_acceptance/config.yaml` (15 key mới `sdk_pytest_l3_*` / `unit_l3_*` / `l3_conformance_l0_full_rerun`).
- pytest qua `uv` với `--no-project` (hai agent từng báo nhầm uv.lock vì bỏ flag này).
- Fixture: dùng lại `_run` / `_two_node_workflow` / `_bridge` của `sdk/tests/test_node_cache.py` — chúng là source of truth về shape, KHÔNG bịa shape mới (ba lần L2 brief bịa shape đều sai).

## Tasks

### Task 1: Khoá — `workflow_scope` + v=3 (serves: phần khoá của AC-3/4/7/11/14; independent: false)

**Files:** `sdk/tongflow/engine/fingerprint.py`, `sdk/tests/test_fingerprint.py`, `sdk/tests/fixtures/fingerprint_vectors.json`, `sdk/tests/test_fingerprint_vectors.py`.

- [ ] TDD: test đỏ trước — `test_workflow_scope_emitted_unconditionally` (node-id của E7, kiểm trên **chuỗi JSON canonical** trước khi băm: tầng A phải thấy `"workflowScope":null` trong blob, không phải vắng key; hai scope khác nhau → hai khoá khác nhau, cả hai qua `_assert_valid_key`).
- [ ] `node_fingerprint()` thêm keyword bắt buộc `workflow_scope: str | None` (None = tầng A — hợp lệ, KHÔNG bail; đây là khác biệt với `tenant`: docstring phải nói rõ vì sao None ở đây là giá trị chứ không phải lỗi). Payload thêm `"workflowScope": workflow_scope`. `KEY_SCHEMA_VERSION = 3` với comment changelog 2→3.
- [ ] Cập nhật `_fp` helper (default `workflow_scope=None`) + guard TypeError của AC-7-L1 thêm kwarg mới (bài học L2 Task 1: thiếu là guard hết cô lập).
- [ ] Sinh lại vectors bằng implementation (mỗi case thêm `workflowScope`, ít nhất MỘT case mang giá trị khác None — Minor của L2 nói 5 case cùng giá trị chỉ ghim presence); `pnpm lint` cho file JSON.
- [ ] Verify: `tests/test_fingerprint.py` + vectors pass; guard AC-14-L1 bump 3→4 vẫn đỏ-rồi-xanh; mutation bỏ `"workflowScope"` khỏi payload → test mới đỏ. Commit.

### Task 2: `TIER_B_SLOTS` + guard ABI + fix dirty (serves: AC-6, AC-8; independent: false)

**Files:** `sdk/tongflow/engine/node_cache.py`, `sdk/tests/test_node_cache.py`.

- [ ] TDD: `test_tier_lists_are_disjoint_and_pinned` (E6 — frozenset literal 23 slot đúng design §3, giao rỗng, 5 slot descope không thuộc list nào, VÀ guard đọc `config/tongflow.abi.json` lúc test: {slot có seed/temperature/top_p} ⊆ TIER_B ∪ DESCOPED_GENERATIVE, ∩ TIER_A = ∅) + `test_git_status_failure_reads_as_dirty` (E8 — mock `subprocess.run` trả returncode=1 → `plugin_is_dirty` True; ca OSError và ca không-`.git` GIỮ nguyên False như L2).
- [ ] Thêm `TIER_B_SLOTS` (23) + `DESCOPED_GENERATIVE_SLOTS` (gen-text, image/video/audio-describe, music-brief — hằng tường minh để guard ABI có tập đối chiếu) + đổi MỘT dòng trong `plugin_is_dirty`: `if r.returncode != 0: return True` với comment nêu kịch bản R1.
- [ ] Verify: mutation đảo dòng dirty về False → E8 đỏ; xoá một slot khỏi TIER_B → guard ABI đỏ. Full SDK suite. Commit.

### Task 3: Runner tầng B + plumbing (serves: AC-1/2/3/4/5/11/14 + AC-9 backend; independent: false)

**Files:** `sdk/tongflow/engine/runner.py`, `sdk/tongflow/engine/__main__.py`, `sdk/tests/test_node_cache.py`.

- [ ] `run_workflow` thêm `workflow_id: str | None = None`; bridge đọc `opts.get("workflow_id")`. Gate tầng B: `wf_scope_ok = bool(workflow_id and workflow_id.strip())`.
- [ ] Trong vòng per-call: slot ∈ TIER_A → `workflow_scope=None` như cũ; slot ∈ TIER_B **và** `wf_scope_ok` → `workflow_scope=f"wf:{workflow_id}:node:{node_id}"` + `f":call:{idx}"` khi `batch_field_of(node) is not None` (idx = chỉ số call trong fan-out); slot ∈ TIER_B mà không có workflow_id → `cache_key=None` (tầng B tắt, tầng A không ảnh hưởng); slot ngoài cả hai → không cache như L2.
- [ ] TDD với 8 test mới (node-id E1,E2,E3,E4,E5,E10,E12,E15 — tên trong config). Fixture: nhân bản `_two_node_workflow` thành `_mixed_workflow` (image-gen-video → concat-videos) — đọc shape thật từ fixture L2, `image-gen-video` cần binding image+text: đọc ABI slot đó trước khi viết. E5 bốn ca (vắng/None/""/whitespace). E12 khác tenant chung data_dir. E15 batch với call_params trùng.
- [ ] Verify: mutation bỏ tenant khỏi nhánh B → E12 đỏ; bỏ nodeId khỏi scope → E4 đỏ; bỏ ordinal → E15 đỏ; gate rơi cả tầng A khi thiếu workflow_id → E5 đỏ. Full suite. Commit.

### Task 4: TS — `workflow_id` qua `engineOptionsFor` (serves: AC-9 TS; independent: true)

**Files:** `src/lib/task/runner.ts`, `src/lib/task/engine-delegate.server.ts`, `src/lib/task/engine-delegate.test.ts`.

- [ ] TDD: test title chứa đúng chuỗi `workflow_id` (filter `-t` của E9): `engineOptionsFor("local", {..., workflowId: 41}).workflow_id === "41"`; không có workflowId → `null`; không bao giờ `""` — khẳng định trên chính object (bài học wiring-vs-helper).
- [ ] `executeWorkflowViaEngine` nhận `workflowId?: number` (từ `runner.ts:118` truyền `task.workflowId`); `engineOptionsFor` phát `workflow_id: workflowId != null ? String(workflowId) : null`.
- [ ] Verify: mutation xoá dòng `workflow_id` khỏi options → test đỏ. `pnpm lint:check && pnpm test && pnpm build && pnpm typecheck` (tuần tự). Commit.

### Task 5: Ba bộ bằng chứng chạy lại + bookkeeping (serves: AC-10/12/13; independent: false, chạy cuối)

**Files:** `_acceptance/cache-l1-fingerprint/contract.md`, `_acceptance/cache-l2-store/contract.md`, `STATUS.md`.

- [ ] Chạy 3 lệnh của E11/E13/E14 (đúng config key), dán output. 15 node-id L3 mỗi cái chọn đúng 1 test.
- [ ] Thêm bullet Known-limits vào contract L1 + L2 ghi nghĩa vụ ký lại lần này (v 2→3; nhánh cache trong runner đổi cấu trúc); STATUS cập nhật hàng đợi.
- [ ] Commit.

## Self-Review

14 AC ↔ task: AC-1/2/3/4/5/11/14 + AC-9-backend → T3 · AC-6/8 → T2 · AC-7 → T1 · AC-9-TS → T4 · AC-10/12/13 → T5. Mutation bắt buộc: T1 (bỏ workflowScope), T2 (đảo dirty, xoá slot khỏi TIER_B), T3 (bốn mutation), T4 (xoá wiring). Không placeholder; điểm duy nhất nhờ người thực thi tự tra: shape binding của `image-gen-video` — đọc ABI, đừng bịa (ba lần L2 đã dạy).
