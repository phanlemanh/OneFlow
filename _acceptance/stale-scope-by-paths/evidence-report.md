---
schema_version: 2
feature_slug: stale-scope-by-paths
verdict: PASS
failed_evals: []
reason: >-
  Chạy lại ở 1b37024 (nhánh feat/ci-vitest-sdk-pin, round 7) sau khi chủ sở hữu
  descope E3 tại Cổng 2 (d-20260805T190000Z-31447 + mục Amendment của contract).
  Bộ eval còn 15; cả 15 thoát 0 với đúng token `expected` đòi. Nguyên nhân đỏ của
  hai lượt trước là chính E3 — golden của nó đóng băng PHÁN QUYẾT staleness của 7
  hồ sơ khai 0 `paths`, một thứ phụ thuộc trạng thái ghim, chứ không phải HÀNH VI
  scoping mà AC-3 nói tới. Lượt này kiểm lại chẩn đoán đó bằng đo trực tiếp trên
  cây (xem mục CI-a) và xác nhận đúng. Kèm theo: AC-3 nay không còn eval máy
  khẳng định trọn vẹn — khoảng hở ghi rõ bên dưới cho người ký.
verified_by: fresh-context verification subagent (round 7)
enforcement_mode: strict
bypass_used: false
verified_commit: 1b37024c643f5ad845eac61b22c92f1cf4012aae
human_signoff: Manh 2026-07-29
---

# Evidence Report: stale-scope-by-paths

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
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

E3 (AC-3) đã bị gỡ khỏi `evals.yaml` ngày 2026-08-05 theo quyết định Cổng 2
`d-20260805T190000Z-31447`. AC-3 vì thế không còn dòng nào trong bảng — đó là
khoảng hở, không phải sơ suất trình bày; xem "Khoảng hở AC-3" bên dưới.

## Evidence

- eval: E1
  run_id: stale-scope-by-paths-E1-20260806T023856
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_in_scope
  verified_at: 2026-08-06T02:38:56Z
  output: |
    CASE in-scope: PASS

- eval: E2
  run_id: stale-scope-by-paths-E2-20260806T023857
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_out_of_scope
  verified_at: 2026-08-06T02:38:57Z
  output: |
    CASE out-of-scope: PASS

- eval: E4
  run_id: stale-scope-by-paths-E4-20260806T023858
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_partial
  verified_at: 2026-08-06T02:38:58Z
  output: |
    CASE partial: PASS

- eval: E5
  run_id: stale-scope-by-paths-E5-20260806T023859
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_under_declared
  verified_at: 2026-08-06T02:38:59Z
  output: |
    CASE under-declared: PASS

- eval: E6
  run_id: stale-scope-by-paths-E6-20260806T023859
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_malformed
  verified_at: 2026-08-06T02:38:59Z
  output: |
    CASE malformed: PASS

- eval: E7
  run_id: stale-scope-by-paths-E7-20260806T023900
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_merged_halves
  verified_at: 2026-08-06T02:39:00Z
  output: |
    CASE merged-halves: PASS

- eval: E8
  run_id: stale-scope-by-paths-E8-20260806T023902
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_suppression
  verified_at: 2026-08-06T02:39:02Z
  output: |
    CASE suppression: PASS

- eval: E9
  run_id: stale-scope-by-paths-E9-20260806T023903
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_mutation
  verified_at: 2026-08-06T02:39:03Z
  output: |
    CASE mutation: PASS

- eval: E10
  run_id: stale-scope-by-paths-E10-20260806T023905
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_case_completeness
  verified_at: 2026-08-06T02:39:05Z
  output: |
    CASE case-completeness: PASS

- eval: E11
  run_id: stale-scope-by-paths-E11-20260806T023905
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_guard_not_exempt
  verified_at: 2026-08-06T02:39:05Z
  output: |
    CASE guard-not-exempt: PASS

- eval: E12
  run_id: stale-scope-by-paths-E12-20260806T023905
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_two_bases
  verified_at: 2026-08-06T02:39:05Z
  output: |
    CASE two-bases: PASS

- eval: E13
  run_id: stale-scope-by-paths-E13-20260806T023905
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_no_kill_switch
  verified_at: 2026-08-06T02:39:05Z
  output: |
    CASE no-kill-switch: PASS

- eval: E14
  run_id: stale-scope-by-paths-E14-20260806T023905
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_real_repo
  verified_at: 2026-08-06T02:39:05Z
  output: |
    OK: conformance-l0 refused narrow scope for exactly the six declared-but-missing files

- eval: E15
  run_id: stale-scope-by-paths-E15-20260806T023907
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_announce
  verified_at: 2026-08-06T02:39:07Z
  output: |
    CASE announce: PASS

- eval: E16
  run_id: stale-scope-by-paths-E16-20260806T023908
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_indent_drift
  verified_at: 2026-08-06T02:39:08Z
  output: |
    CASE indent-drift: PASS

### Supporting checks (whole-repo, not tied to a single eval id)

Đo ở `c38b939` (lượt 6 của cùng đợt CI-a) và **vẫn mô tả đúng cây ở HEAD
`1b37024`**: `git diff --name-only c38b939..1b37024` chỉ trả về file dưới
`_acceptance/**` — không một file gated nào — nên không có mã sản phẩm nào đổi
giữa hai điểm đó. Đã kiểm bằng lệnh, không suy đoán.

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

Round 4: feature_scope()'s completeness check now walks the evals list as an explicit open/close block per eval item via a single awk pass (paths_re passed through ENVIRON rather than `-v`, so escape sequences like `\[`/`\]` are not eaten and the glob grammar is not silently widened), rejecting any `paths:` line that lands outside every open block — closing round 3's "nearest `- id:` above" gap. E4 was strengthened with three halves: the obvious partial-declaration case, the same lie hidden behind balanced totals (two `paths:` lines on one eval, none on the sibling), and the sibling-mapping variant that triggered round 3's finding, each isolated from the AC-7 cross-check so they exercise completeness alone. All 16 script evals (E1-E16) exit 0 against the fixture suite, and the supporting `pnpm build`/`typecheck`, `lint:check`, `test`, SDK `pytest`, `verify:plugins`, and `gen:abi` diff-check all pass clean. Adversarial code review found no further in-contract findings this round — 7 out-of-contract findings remain (2 HIGH: the t1-exempt-only fail-open scope, and the Vietnamese-language vendor text; plus 5 MEDIUM/LOW), all already routed to Gate 2 per the S1/gate2 decision log (d-20260729T095807Z-19845, d-20260729T095807Z-29062) as deferred to a separate contract rather than fixed here. Overall gate verdict PASS.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
- [ ] **Đọc mục "Khoảng hở AC-3" bên dưới trước khi ký.** Hồ sơ này ký PASS với
      một tiêu chí (AC-3) không còn eval máy khẳng định trọn vẹn, và với hai file
      guard chết nằm lại trên cây.


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

## Kiểm lại trên nhánh `feat/ci-vitest-sdk-pin` (CI-a) — ba lượt, kết ở việc descope E3

Một mục duy nhất cho cả đợt CI-a, thay cho các mục rời của từng lượt.

**Vì sao hồ sơ này vào đợt.** Phạm vi eval khai của nó phủ `scripts/acceptance/**`,
mà nhánh CI-a thêm `scripts/acceptance/check-gate-residual.sh` rồi sửa
`scripts/acceptance/check-stale-golden.sh` — đúng thư mục đó. Đây là **re-verify
thật**, không phải carry-forward: hồ sơ này SỞ HỮU file mà nhánh vừa sửa.

### Lượt 5 @ `9fcfc33` — 15/16, E3 đỏ vì NOTE gap-probe

Guard so output của `pre-merge-check.sh . --base main` cho bảy hồ sơ **không khai
`paths`** với golden 7 dòng, và thấy **13 dòng**: đủ 7 dòng `VIOLATION` khớp golden
nguyên vẹn, cộng **6 dòng `NOTE` gap-probe thừa**. NOTE gap-probe chỉ bắn khi
`_acceptance/<slug>/` của hồ sơ đó nằm trong diff PR, mà re-pin bằng chứng — đúng
việc một đợt verify làm — đưa các thư mục ấy vào diff.

### Lượt 6 @ `c38b939` — 16/16 xanh lúc chạy, rồi E3 đỏ lại sau khi ghim

`c38b939` bỏ dòng NOTE gap-probe khỏi phép so (`grep -v '(gap-probe)'`) và **chỉ
dòng đó** — độ hẹp của bộ lọc đã được kiểm chứng chứ không tin lời commit message
(gỡ đúng 6 dòng NOTE, giữ đủ 7 dòng `VIOLATION`; 13 → 7). E3 cũng được thử làm
hỏng golden ba kiểu (đổi tên hồ sơ, xoá một dòng, đổi chữ trong thông điệp) và cả
ba đều bị bắt, nên bộ lọc `(gap-probe)` không làm eval rỗng nghĩa.

Nhưng lượt 6 phát hiện một tầng nữa: sau khi bảy hồ sơ kia được ghim lại về HEAD,
`stale_files()` không còn file gated nào để báo, nên gate in `OK [<slug>]: PASS,
signed off by ...` thay cho `VIOLATION ... evidence is stale`. Bảy dòng lật cùng
lúc và byte-compare của golden đỏ. Đo trực tiếp hai lần trên cùng một cây (thoát 0
trước khi ghim, thoát khác 0 sau khi ghim), cả hai lần đều có dòng riêng trong
`run-log.jsonl` round 6. Mười lăm eval anh em xanh ở cả hai trạng thái — chỉ E3
nhạy với trạng thái ghim. Lượt 6 vì thế giữ REJECT và không ghim `verified_commit`.

### Quyết ở Cổng 2 (2026-08-05): descope E3

Chủ sở hữu quyết gỡ E3 khỏi bộ eval — `d-20260805T190000Z-31447`, kèm mục
**Amendment** trong contract. `evals.yaml` còn 15 eval; chỗ của E3 là một khối
comment giải thích lý do gỡ. `scripts/acceptance/check-stale-golden.sh` và fixture
của nó **cố ý giữ lại trên cây**: xoá là chạm `scripts/**`, kích lại treadmill
staleness cho toàn bộ pin vừa ghim.

### Lượt 7 @ `1b37024` (lượt này) — 15/15 xanh, và kiểm lại chính chẩn đoán trên

Lượt này không nhận chẩn đoán của lượt 6 làm dữ kiện mà **đo lại độc lập trên cây
hiện tại**:

1. `cat scripts/acceptance/fixtures/baseline-gate-output.txt` → đúng 7 dòng, cả 7
   đều dạng `VIOLATION [<slug>]: evidence is stale …`.
2. Chạy lại đúng pipeline mà guard dùng (`pre-merge-check.sh . --base main`, cùng
   `grep`/`sed`/`sort`) → cả 7 hồ sơ nay in `OK [<slug>]: PASS, signed off by …`.
   Tức byte-compare của E3 hôm nay chắc chắn lệch — golden ghim một phán quyết đã
   đổi, không phải một hành vi đã đổi.
3. **Vì sao đổi, và đổi có phải do narrow-scoping không:** không. Cả bảy hồ sơ đều
   khai **0 dòng `paths`** (đã đếm trên `evals.yaml` của từng hồ sơ), nên không hồ
   sơ nào đủ điều kiện nhận scope hẹp. Và pipeline của guard có bắt cả dòng `NOTE
   [<slug>]` — không dòng `narrow staleness scope applied` nào xuất hiện cho bất kỳ
   hồ sơ nào trong bảy. Chúng hết cũ chỉ vì `verified_commit` của chúng
   (`c38b939`) nay đã hiện hành: `git diff --name-only c38b939..1b37024` chỉ trả về
   file dưới `_acceptance/**` — không một file gated nào.

**Kết luận về chẩn đoán:** đúng. E3 đóng băng *phán quyết* staleness, một hàm của
trạng thái ghim, chứ không phải *hành vi* scoping mà AC-3 khẳng định. Nó không có
trạng thái ổn định (giữ nguyên → đỏ sau mọi wave re-pin; regen về 7 dòng `OK` → đỏ
ở nhánh sau khi bảy hồ sơ stale trở lại), nên descope là quyết định đúng, không
phải né tránh một eval đang bắt được lỗi thật.

**Và hành vi AC-3 thật sự vẫn đúng trên cây này** — điều đó được kiểm riêng, không
suy ra từ việc E3 bị gỡ: dựng lại đúng fixture `none` (0 `paths`) mà harness đã có
rồi cho một file gated đổi, gate in `VIOLATION [fx]: evidence is stale …` và
**không** in dòng narrow-scope nào. Đủ ba vế của AC-3. Chỉ là không eval nào khẳng
định vế đầu.

15 eval còn lại đều thoát 0 với đúng token `expected` đòi; `stale_scope_real_repo`
(E14) vẫn báo đúng sáu file thiếu của `conformance-l0`. Vì vậy lượt này ghim
`verified_commit: 1b37024`.

### Khoảng hở AC-3 — người ký cần biết

AC-3 gồm ba vế: hồ sơ khai 0 `paths` (a) vẫn nhận staleness **toàn cây**, (b)
không sinh dòng output mới, (c) không được cấp scope hẹp.

Bản Amendment nói AC-3 "mất eval máy trực tiếp duy nhất" và chỉ còn E4 cùng E1/E2
chạm tới **gián tiếp**. Kiểm lại harness thì mô tả đó **hơi quá tay theo hướng bi
quan**, và nên đính chính cho đúng:

- **E15 (`announce`, AC-14) có dựng fixture khai 0 `paths` thật**
  (`mk_committed_report_fixture "$d2" fx none`), cho một file gated đổi
  (`src/uncovered/new.txt`), rồi khẳng định **trực tiếp** rằng gate **không** in
  dòng `narrow staleness scope applied` cho nó. Đó chính là vế (b) và (c) của AC-3,
  khẳng định thẳng trên ca 0-`paths` chứ không phải gián tiếp.
- **E8 (`suppression`, AC-8) cũng chạy fixture mode `none`** — nhưng chỉ ở chiều
  phủ định (đổi `docs/**` + `_acceptance/**` thì **không** stale), nên nó không nói
  gì về vế (a).

**Phần thật sự hở là vế (a):** không eval nào trong 15 khẳng định rằng một hồ sơ
khai **0** `paths` vẫn bị báo `VIOLATION … evidence is stale` khi có file gated
đổi. E4 khẳng định vế đó cho khai **một phần**, E6 cho `paths: []` — cả hai đều là
"coi như không khai", nhưng không phải là ca không-khai theo nghĩa đen mà AC-3 mô
tả. Đó là một vế, không phải cả tiêu chí.

Chi phí vá rất nhỏ và nên nói rõ để khỏi bị đánh giá to hơn thực tế: fixture cần
thiết **đã tồn tại** — chính `$d2` của `case_announce` — nên thêm một dòng
`grep -q 'VIOLATION \[fx\]: evidence is stale'` vào đó là đóng được vế (a). Việc
đã nằm trong hàng đợi của Amendment dưới dạng case `undeclared` riêng trong
`check-stale-scoping.sh`; dựng trên fixture git nên miễn nhiễm trạng thái ghim của
repo thật — đúng điểm khác biệt khiến nó ổn định còn golden thì không.

### Code chết còn lại trên cây (cố ý)

Sau descope, ba thứ của E3 vẫn nằm trên cây và **không** còn eval nào gọi:

- `scripts/acceptance/check-stale-golden.sh`
- `scripts/acceptance/fixtures/baseline-gate-output.txt`
- khoá executor `stale_scoping_golden` trong `_acceptance/config.yaml` (dòng 230)
  — không `evals.yaml` nào của repo còn trỏ tới nó.

Giữ lại là cố ý (xoá = chạm `scripts/**` = stale lại toàn bộ pin vừa ghim), nhưng
hệ quả cần nói thẳng: guard này **vẫn chạy được bằng tay và hôm nay sẽ đỏ**. Ai
gặp nó mà không đọc mục này dễ tưởng có một cổng đang hỏng. Đã kiểm: nó **không**
được gọi trong `.github/workflows/**`, nên không chặn CI. Dọn thuộc contract kế.
