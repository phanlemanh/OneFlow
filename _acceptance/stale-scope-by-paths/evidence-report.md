---
schema_version: 2
feature_slug: stale-scope-by-paths
verdict: REJECT
failed_evals: [E3]
reason: >-
  Chạy lại ở 9fcfc33 (nhánh feat/ci-vitest-sdk-pin): 15/16 eval xanh, riêng E3
  (check-stale-golden.sh) đỏ — output của gate cho 7 hồ sơ không khai `paths`
  có thêm 6 dòng NOTE gap-probe so với golden 7 dòng. Nguyên nhân: chính commit
  556c799 của nhánh này (đợt re-pin bằng chứng của 9 hồ sơ) đưa
  `_acceptance/<slug>/` của 6 hồ sơ đó vào diff của PR, mà NOTE gap-probe chỉ
  bắn khi hồ sơ nằm trong diff. Cơ chế staleness-scoping (thứ AC-3 nói tới)
  không đổi. Không ghim `verified_commit`.
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: f39723a228be90031eb1e3e423664c84829851db
human_signoff: Manh 2026-07-29
---

# Evidence Report: stale-scope-by-paths

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | FAIL |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | script | PASS |
| E10 | AC-9 | script | PASS |
| E11 | AC-11 | script | PASS |
| E12 | AC-12 | script | PASS |
| E13 | AC-13 | script | PASS |
| E14 | AC-10 | script | PASS |
| E15 | AC-14 | script | PASS |
| E16 | AC-6 | script | PASS |

## Evidence

- eval: E1
  run_id: stale-scope-by-paths-E1-20260806014056
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_in_scope
  verified_at: 2026-08-06T01:40:56Z
  output: |
    CASE in-scope: PASS

- eval: E2
  run_id: stale-scope-by-paths-E2-20260806014057
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_out_of_scope
  verified_at: 2026-08-06T01:40:57Z
  output: |
    CASE out-of-scope: PASS

- eval: E3
  run_id: stale-scope-by-paths-E3-20260806014107
  exit_code: 1
  baseline: red
  verifier: config:executors.script.stale_scoping_golden
  verified_at: 2026-08-06T01:41:07Z
  output: |
    FAIL: line count differs from golden (13 actual vs 7 golden)
    0a1,6
    > NOTE [ci-actions-bump]: chưa qua phản biện context sạch (gap-probe) — advisory, không chặn merge. …
    > NOTE [dependency-refresh-2026-07]: chưa qua phản biện context sạch (gap-probe) — advisory, không chặn merge. …
    > NOTE [measure-harness]: chưa qua phản biện context sạch (gap-probe) — advisory, không chặn merge. …
    > NOTE [oneflow-plugin-prefix]: chưa qua phản biện context sạch (gap-probe) — advisory, không chặn merge. …
    > NOTE [sdk-distribution-rename]: chưa qua phản biện context sạch (gap-probe) — advisory, không chặn merge. …
    > NOTE [task-metering]: chưa qua phản biện context sạch (gap-probe) — advisory, không chặn merge. …
    (7 dòng VIOLATION của golden khớp nguyên vẹn; 6 dòng NOTE ở trên là phần THỪA)

- eval: E4
  run_id: stale-scope-by-paths-E4-20260806014058
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_partial
  verified_at: 2026-08-06T01:40:58Z
  output: |
    CASE partial: PASS

- eval: E5
  run_id: stale-scope-by-paths-E5-20260806014059
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_under_declared
  verified_at: 2026-08-06T01:40:59Z
  output: |
    CASE under-declared: PASS

- eval: E6
  run_id: stale-scope-by-paths-E6-20260806014100
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_malformed
  verified_at: 2026-08-06T01:41:00Z
  output: |
    CASE malformed: PASS

- eval: E7
  run_id: stale-scope-by-paths-E7-20260806014100
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_merged_halves
  verified_at: 2026-08-06T01:41:00Z
  output: |
    CASE merged-halves: PASS

- eval: E8
  run_id: stale-scope-by-paths-E8-20260806014103
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_suppression
  verified_at: 2026-08-06T01:41:03Z
  output: |
    CASE suppression: PASS

- eval: E9
  run_id: stale-scope-by-paths-E9-20260806014105
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_mutation
  verified_at: 2026-08-06T01:41:05Z
  output: |
    CASE mutation: PASS

- eval: E10
  run_id: stale-scope-by-paths-E10-20260806014106
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_case_completeness
  verified_at: 2026-08-06T01:41:06Z
  output: |
    CASE case-completeness: PASS

- eval: E11
  run_id: stale-scope-by-paths-E11-20260806014107
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_guard_not_exempt
  verified_at: 2026-08-06T01:41:07Z
  output: |
    CASE guard-not-exempt: PASS

- eval: E12
  run_id: stale-scope-by-paths-E12-20260806014104
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_two_bases
  verified_at: 2026-08-06T01:41:04Z
  output: |
    CASE two-bases: PASS

- eval: E13
  run_id: stale-scope-by-paths-E13-20260806014107
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_no_kill_switch
  verified_at: 2026-08-06T01:41:07Z
  output: |
    CASE no-kill-switch: PASS

- eval: E14
  run_id: stale-scope-by-paths-E14-20260806014110
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_real_repo
  verified_at: 2026-08-06T01:41:10Z
  output: |
    OK: conformance-l0 refused narrow scope for exactly the six declared-but-missing files

- eval: E15
  run_id: stale-scope-by-paths-E15-20260806014104
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_announce
  verified_at: 2026-08-06T01:41:04Z
  output: |
    CASE announce: PASS

- eval: E16
  run_id: stale-scope-by-paths-E16-20260806014100
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_indent_drift
  verified_at: 2026-08-06T01:41:00Z
  output: |
    CASE indent-drift: PASS

### Supporting checks (whole-repo, not tied to a single eval id)

- `pnpm build && pnpm typecheck` — exit 0. Tail: `$ tsc --noEmit` (clean, plus the pnpm.onlyBuiltDependencies settings-migration warning, unrelated to this change).
- `pnpm lint:check` — exit 0. Tail: `Checked 402 files in 177ms. No fixes applied.`
- `pnpm test` — exit 0. Tail: `Tests  329 passed (329)`.
- `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q` — exit 0. Tail: `89 passed in 2.88s`.
- `pnpm verify:plugins` — exit 0. Tail: `[verify-plugins-scan] OK`.
- `pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json` — exit 0. Tail: `Wrote src/generated/abi/index.ts` / `Wrote sdk/tongflow/_data/tongflow.abi.json` / `EXIT_CODE: 0` (no drift).

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: All 16 script evals (E1-E16) exit 0 against the fixture suite, and the supporting `pnpm build`/`typecheck`/`lint:check`/`test`, SDK `pytest`, `verify:plugins`, and `gen:abi` diff-check all pass clean — but code review surfaced 2 CRITICAL/HIGH in-contract findings that no fixture in the current suite exercises: an AC-1 counterexample (scope_has_any_match() vs stale_files()/scope_gaps() namespace mismatch — narrow scope silently matches nothing once `_acceptance/` sits below the git root, reproduced end-to-end against a fixture repo) and an AC-10 reproducibility gap (E14's pinned HEAD_SHA 5986bb27b8aa2200e74f44c729be8782264d137d is unreachable from any remote ref, so it only passes in this working copy, not on a fresh clone or CI). Overall gate verdict REJECT. Returned to implementation.

Round 2: All 16 script evals (E1-E16) exit 0 again — E1 was strengthened to cover the $ROOT-below-git-root monorepo halves and E14 now pins BASE_SHA=336944d68a7bc7fe6da281a8c6eaf24d105703a2 / HEAD=7352ca57b932924dfabb18a80f4e71ed4b6810fd with a remote-reachability preflight, closing round 1's AC-1 and AC-10 findings — and the supporting suite passes clean again — but code review surfaced 2 NEW CRITICAL/HIGH in-contract findings the current suite still does not exercise: an AC-5 monorepo blind spot (slug_acceptance_touched() at scripts/pre-merge-check.sh:646 matches only the top-level-anchored `_acceptance/<slug>/` prefix while every sibling diff consumer accepts the nested `*/_acceptance/<slug>/` spelling too, so in a nested-root monorepo layout the declared-paths cross-check silently never fires) and an AC-4 completeness-counting gap (feature_scope() compares total `- id:` line count to total `paths:` line count instead of per-eval, so a duplicate `paths:` line under one eval balances a missing one under another and a partial declaration reads as complete). Overall gate verdict REJECT. Returned to implementation.

Round 3: All 16 script evals (E1-E16) exit 0 again — slug_acceptance_touched() now accepts both the top-level and nested `*/_acceptance/<slug>/` spelling (closing round 2's AC-5 blind spot), and feature_scope()'s completeness check moved from bare total-count comparison to a per-eval, line-number-anchored accounting via "nearest `- id:` above" (closing round 2's total-count AC-4 gap) — and the supporting suite passes clean again. Adversarial code review then found a NEW in-contract AC-4 variant that no round-3 fixture caught: the "nearest `- id:` above" heuristic attributes a `paths:` line to an eval without checking the line is still inside that eval's block, so an unrelated `paths:` key sitting at the eval-key column below the evals list (e.g. under a sibling `misc:`/`sub:` mapping) gets folded into the last eval's ownership, balancing the total and reading a partially-declared file as complete — the exact dangerous-direction failure (narrower-than-truth scope) AC-4 exists to refuse. Given the finding was in-contract and failed in the dangerous direction, the human explicitly approved exceeding the normal 3-round escalation cap to fix it rather than merging on known-bad completeness logic. Overall gate verdict REJECT. Returned to implementation.

Round 4 (this round): feature_scope()'s completeness check now walks the evals list as an explicit open/close block per eval item via a single awk pass (paths_re passed through ENVIRON rather than `-v`, so escape sequences like `\[`/`\]` are not eaten and the glob grammar is not silently widened), rejecting any `paths:` line that lands outside every open block — closing round 3's "nearest `- id:` above" gap. E4 was strengthened with three halves: the obvious partial-declaration case, the same lie hidden behind balanced totals (two `paths:` lines on one eval, none on the sibling), and the sibling-mapping variant that triggered round 3's finding, each isolated from the AC-7 cross-check so they exercise completeness alone. All 16 script evals (E1-E16) exit 0 against the fixture suite, and the supporting `pnpm build`/`typecheck`, `lint:check`, `test`, SDK `pytest`, `verify:plugins`, and `gen:abi` diff-check all pass clean. Adversarial code review found no further in-contract findings this round — 7 out-of-contract findings remain (2 HIGH: the t1-exempt-only fail-open scope, and the Vietnamese-language vendor text; plus 5 MEDIUM/LOW), all already routed to Gate 2 per the S1/gate2 decision log (d-20260729T095807Z-19845, d-20260729T095807Z-29062) as deferred to a separate contract rather than fixed here. Overall gate verdict PASS.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract


---

Carry-forward re-pin (2026-07-30, branch feat/cache-l3-tier-b):
`verified_commit` moved from 5037c8df9fc077fcefafc277b0cc92170fad07ed to
77fb83f9cc25c9d65e0021563203aafd899928e0 with NO re-verify, under the carry-forward rule in AGENTS.md.
Both conditions were checked, not assumed.

(1) This feature's own code is unchanged. The branch's gated diff is exactly the
11 files of **cache-l3-tier-b**:
sdk/tests/fixtures/fingerprint_vectors.json · sdk/tests/test_fingerprint.py ·
sdk/tests/test_fingerprint_vectors.py · sdk/tests/test_node_cache.py ·
sdk/tongflow/engine/__main__.py · sdk/tongflow/engine/fingerprint.py ·
sdk/tongflow/engine/node_cache.py · sdk/tongflow/engine/runner.py ·
src/lib/task/engine-delegate.server.ts · src/lib/task/engine-delegate.test.ts ·
src/lib/task/runner.ts
Ownership was computed, not eyeballed: each merged feature's owned set was taken
from the gated diff of the merge commit that landed it, then intersected with
this branch's gated diff. This feature's intersection is empty. Four features
have non-empty intersections — cache-l1-fingerprint, cache-l2-store,
conformance-l0 (sdk/tongflow/engine/runner.py + src/lib/task/engine-delegate.server.ts),
and task-metering (src/lib/task/runner.ts) — all four are on the re-verify path
with fresh rerun evidence and fresh signatures, the half of the rule this note
does not license.

(2) Standing checks green on the new tree (S4 round 1 of cache-l3-tier-b, run-log `_acceptance/cache-l3-tier-b/run-log.jsonl`): `pnpm build && pnpm typecheck`, `pnpm lint:check`, `pnpm test` (350 passed), full sdk pytest (170 passed), `pnpm verify:plugins`, `pnpm gen:abi` diff-clean.

The human signature line in frontmatter was not touched — it attests to the same
code it originally did.


---

Carry-forward re-pin (2026-07-31, branch feat/cache-l4-eviction):
`verified_commit` moved to c000b4b6b32f29eea6217f8de26596a052737128 with NO re-verify, under the carry-forward rule in AGENTS.md.
Both conditions were checked, not assumed.

(1) This feature's own code is unchanged. The branch's gated diff is exactly the
17 files of **cache-l4-eviction**:
drizzle/0003_clammy_blazing_skull.sql · drizzle/meta/0003_snapshot.json ·
drizzle/meta/_journal.json · scripts/cache/check-test-layout.sh ·
sdk/tests/cache_helpers.py · sdk/tests/test_cache_runner_wiring.py ·
sdk/tests/test_cache_sweep.py · sdk/tests/test_node_cache.py ·
sdk/tests/test_node_cache_tier_b.py · sdk/tongflow/engine/__main__.py ·
sdk/tongflow/engine/node_cache.py · sdk/tongflow/engine/runner.py ·
src/db/metering-schema.test.ts · src/db/workspace.schema.ts ·
src/lib/task/engine-delegate.server.ts · src/lib/task/engine-delegate.test.ts ·
src/lib/task/node-cached.test.ts
Ownership was computed, not eyeballed: each merged feature's owned set was taken
from the gated diff of the merge commit that landed it, then intersected with
this branch's gated diff. This feature's intersection is empty. Four features
have non-empty intersections — cache-l2-store, cache-l3-tier-b, conformance-l0
and task-metering — all four are on the re-verify path with fresh rerun evidence
and fresh signatures, the half of the rule this note does not license.

(2) Standing checks green on the new tree (S4 round 1 of cache-l4-eviction, run-log `_acceptance/cache-l4-eviction/run-log.jsonl`): `pnpm build && pnpm typecheck`, `pnpm lint:check`, `pnpm test` (363 passed), full sdk pytest (189 passed), `pnpm verify:plugins`, `pnpm gen:abi` diff-clean.

The human signature line in frontmatter was not touched — it attests to the same
code it originally did.

## Vòng kiểm lại 2026-08-04 (sau hạng mục 0.6 `gate-scope-anchors`)

Hợp đồng `gate-scope-anchors` chạm `scripts/**`, nên bằng chứng của hồ sơ này
thành cũ theo cơ chế staleness. Đã chạy lại: **16/16 eval xanh** ở
`5acc982e7690`, trong một đợt chạy chung 194 eval / 131 lệnh duy nhất của cả 13 hồ
sơ bị ảnh hưởng — không hồ sơ nào đỏ.

Chi phí này đã khai trước ở Cổng 1 của `gate-scope-anchors`.

## Ghim lại 2026-08-05 (nhánh `chore/landed-merge-anchors`)

Nhánh điền `landed_merge` chạm `scripts/**` (sửa test + hoàn nguyên golden), nên
bằng chứng lại thành cũ. Đã chạy lại đợt chung 139 eval / 85 lệnh của 10 hồ sơ
bị ảnh hưởng ở `f39723a228be` — **0 hồ sơ đỏ**.

## Kiểm lại trên nhánh `feat/ci-vitest-sdk-pin` (CI-a) @ `9fcfc33` — REJECT vì E3

**Vì sao hồ sơ này vào đợt.** Phạm vi eval khai của nó phủ `scripts/acceptance/**`,
mà nhánh CI-a thêm `scripts/acceptance/check-gate-residual.sh` vào đúng thư mục đó.
Đây là lần đầu hồ sơ này bị kéo vào đợt CI-a (hai lượt trước ở `a1bc936` và
`28c1a7d` không chạm `scripts/acceptance/`).

**Kết quả: 15/16 eval xanh, riêng E3 (`check-stale-golden.sh`) đỏ, mã thoát 1.**

Guard so output của `pre-merge-check.sh . --base main` cho bảy hồ sơ **không khai
`paths`** với golden 7 dòng. Lượt này nó thấy **13 dòng**: đủ 7 dòng `VIOLATION`
khớp golden nguyên vẹn, cộng **6 dòng `NOTE` gap-probe thừa** cho
`ci-actions-bump`, `dependency-refresh-2026-07`, `measure-harness`,
`oneflow-plugin-prefix`, `sdk-distribution-rename`, `task-metering`.

**Nguyên nhân, đã truy tới tận gốc chứ không đoán.** NOTE gap-probe chỉ bắn khi
`_acceptance/<slug>/` của hồ sơ đó nằm trong diff của PR — đúng điều commit
`f39723a` từng ghi lại khi hoàn nguyên một lần regen golden trước đó ("regenerating
from the compose-overlay branch baked a transient, PR-specific state into a baseline
meant to capture stable behaviour"). Trên nhánh này, commit `556c799` (đợt re-pin
bằng chứng của 9 hồ sơ, do chính các lượt verify trước của đợt CI-a sinh ra) đã đưa
`_acceptance/` của sáu hồ sơ ấy vào diff `main...HEAD`. Chạy lại cùng phép so với
base loại trừ `556c799` (`--base 01ee88c`) cho **đúng 7 dòng, khớp golden từng
byte** — tức cơ chế staleness-scoping mà AC-3 nói tới **không đổi**; cái đổi là
trạng thái nhánh.

**Phát hiện đáng ghi.** `grep` của guard bắt tiền tố `^(VIOLATION|OK|NOTE) \[<hồ
sơ>\]`, nên nó nuốt cả NOTE gap-probe — một dòng advisory phụ thuộc **trạng thái
diff của nhánh**, không phải hành vi của cơ chế scoping. Hệ quả: E3 sẽ đỏ trên bất
kỳ nhánh nào re-pin bằng chứng của sáu hồ sơ đó, mà đó chính xác là việc một đợt
acceptance verify làm. Đây là mắc kẹt tự quy chiếu, không phải hồi quy sản phẩm —
nhưng eval đỏ thật, và hồ sơ này không được ghim.

**Không ghim.** `verified_commit` giữ nguyên `f39723a228be`; `verdict` là REJECT
với `failed_evals: [E3]`. Dòng chữ ký người trong frontmatter không bị đụng tới.

15 eval còn lại (E1, E2, E4–E16) đều thoát 0 với đúng token `CASE <tên>: PASS` mà
`expected` đòi; `stale_scope_real_repo` (E14) vẫn báo đúng sáu file thiếu.
