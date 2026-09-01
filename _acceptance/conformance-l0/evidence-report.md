---
schema_version: 2
feature_slug: conformance-l0
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: bb85560ca1337e308b1e06f5be7234dd64a0be2a
human_signoff: Manh 2026-08-07
---

# Evidence Report: conformance-l0

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E14 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | script | PASS |
| E9 | AC-8 | test | PASS |
| E15 | AC-8 | script | PASS |
| E10 | AC-9 | test | PASS |
| E11 | AC-9 | test | PASS |
| E12 | AC-10 | test | PASS |
| E13 | AC-11 | test | PASS |

## Evidence

- eval: E1
  run_id: conformance-l0-E1-20260807T013210Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-08-07T01:32:10Z
  output: |
    ................                                               [100%]
    16 passed in 0.03s
    (one run of tests/test_engine_batch.py serves E1, E2, E4, E5 and E13)

- eval: E2
  run_id: conformance-l0-E2-20260807T013210Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-08-07T01:32:10Z
  output: |
    ................                                               [100%]
    16 passed in 0.03s

- eval: E3
  run_id: conformance-l0-E3-20260807T013224Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest
  verified_at: 2026-08-07T01:32:24Z
  output: |
    ........................................................................ [ 37%]
    ........................................................................ [ 74%]
    .................................................                        [100%]
    193 passed in 4.39s

- eval: E14
  run_id: conformance-l0-E14-20260807T013214Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_conformance
  verified_at: 2026-08-07T01:32:14Z
  output: |
    .......                                                        [100%]
    7 passed in 0.03s

- eval: E4
  run_id: conformance-l0-E4-20260807T013210Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-08-07T01:32:10Z
  output: |
    ................                                               [100%]
    16 passed in 0.03s

- eval: E5
  run_id: conformance-l0-E5-20260807T013210Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-08-07T01:32:10Z
  output: |
    ................                                               [100%]
    16 passed in 0.03s

- eval: E6
  run_id: conformance-l0-E6-20260807T013214Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_conformance
  verified_at: 2026-08-07T01:32:14Z
  output: |
    .......                                                        [100%]
    7 passed in 0.03s
    (the four fixtures plus the compose-overlay conformance cases a later feature
    added to the same directory)

- eval: E7
  run_id: conformance-l0-E7-20260807T013236Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_conformance
  verified_at: 2026-08-07T01:32:36Z
  output: |
    RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
    Test Files  1 passed (1)
         Tests  12 passed (12)

- eval: E8
  run_id: conformance-l0-E8-20260807T013250Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.conformance_discriminating
  verified_at: 2026-08-07T01:32:50Z
  output: |
    ==> baseline: the suite must be GREEN
        green
    ==> perturbation (a): drop one item from the fan-out
        went RED as required
    ==> perturbation (b): add a business field on the Python side only
        went RED as required
    ==> perturbation (c): corrupt a fixture and run the TypeScript half
        went RED as required
    ==> revert: both halves must be GREEN again
        green
    OK: the conformance suite discriminates on all three perturbation kinds

- eval: E9
  run_id: conformance-l0-E9-20260807T013218Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_plugin_rev
  verified_at: 2026-08-07T01:32:18Z
  output: |
    .......                                                        [100%]
    7 passed in 0.72s

- eval: E15
  run_id: conformance-l0-E15-20260807T013305Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.plugin_rev_joined_path
  verified_at: 2026-08-07T01:33:05Z
  output: |
    OK: TypeScript install -> Python scan preserved pluginRev
    90ada928bd2e852dd85acab44a5c3f35e5aee068

- eval: E10
  run_id: conformance-l0-E10-20260807T013218Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_plugin_rev
  verified_at: 2026-08-07T01:32:18Z
  output: |
    .......                                                        [100%]
    7 passed in 0.72s

- eval: E11
  run_id: conformance-l0-E11-20260807T013237Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_plugin_rev
  verified_at: 2026-08-07T01:32:37Z
  output: |
    RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
    Test Files  1 passed (1)
         Tests  3 passed (3)

- eval: E12
  run_id: conformance-l0-E12-20260807T013238Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_node_cached
  verified_at: 2026-08-07T01:32:38Z
  output: |
    RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
    Test Files  1 passed (1)
         Tests  11 passed (11)

- eval: E13
  run_id: conformance-l0-E13-20260807T013210Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-08-07T01:32:10Z
  output: |
    ................                                               [100%]
    16 passed in 0.03s

## Analyst

No A/B baseline was taken: establishing one requires moving the working tree to the
diffBase, which this re-verification round is explicitly forbidden to do (no git
operations of any kind). Every eval therefore carries `baseline: n-a`, and no claim
is made here about which evals discriminate.

This feature was the most exposed of the four to the branch's edits — it owns
`sdk/tongflow/engine/runner.py`, `sdk/tests/conformance/**` and
`src/lib/plugins/**`, and the branch added plugin work in all three areas. Nothing
regressed. Worth noting that E8 is not a bare pass: its mutation guard drove the
suite red on all three perturbation kinds and green again on revert at this HEAD, so
the conformance suite is still discriminating rather than merely still exiting 0 —
which is the property most likely to rot when fixtures are added around it, and a
later feature did add compose-overlay cases into `sdk/tests/conformance`.

No judgment executors appear in this feature's evals.yaml, so nothing here is left
unscored for a judge.

## Variance

none — every eval in this feature is deterministic (no `runs` declared, no executor
crossing a provider or LLM).

## Iterations

Round 1 (re-verification after upstream code change): all fifteen evals clean at
a788985.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] No judgment items in this feature — nothing to override
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract

### Re-pin lần 1 — 2026-08-27, do fork `STALE-DIFF-SCOPE-GUARD` được thu hẹp (hồ sơ `gate-tooling-t1`): feature khai đủ `paths` nay lại bị soi staleness, làm lộ bản ghi cũ này. Mã của gói này không đổi — mọi suite chạy lại đều exit 0
run_id: repin-conformance-l0-20260827T101500Z
sha: d919b5eb51a0a3dfa70b5718113c935b39099ab0 · suites: 9 lệnh exit 0

### Re-pin lần 2 — 2026-08-28, do nhánh `fix/scoping-fixtures-diff-shape` thu hẹp fork `STALE-DIFF-SCOPE-GUARD` và thêm guard dưới `scripts/acceptance/**`: feature khai `paths` nay bị soi, và thay đổi gated của nhánh rơi vào vùng eval của hồ sơ này chạy qua. Mã sản phẩm không đổi — mọi suite chạy lại đều exit 0
run_id: repin-conformance-l0-20260828T053000Z
sha: 8512c6e98c48ab3f4cab75dafa9493a0b1e36868 · suites: 9 lệnh exit 0

### Re-pin lần 3 — 2026-08-28, do nhánh `draft/chong-doc-sai-em-ru` sửa `sdk/tongflow/text/normalize_vi.py` và `sdk/tests/test_normalize_vi.py`: hồ sơ này khai `sdk/**` trong `paths` của một eval, nên thay đổi đó rơi vào vùng soi staleness. Chỉ lộ ra SAU khi merge `main` (PR #83) vào nhánh — trước merge cả hai cổng đều xanh, đúng lý do "cổng chạy trên cây đã merge main mới là cổng thật". Mã của gói này không đổi một byte; một phiên tươi chạy lại cả 9 lệnh, preflight GREEN, mọi lệnh exit 0
run_id: repin-conformance-l0-20260828T124500Z
sha: 9caa25568b35132ab0387e09e5aa0b503c8a8deb · suites: 9 lệnh exit 0

### Re-pin lần 4 — 2026-08-29, do nhánh `feat/add-media-library` thêm ba route API dưới `src/app/api/media-library/`: hồ sơ này khai `src/app/api/**` trong `paths` của một eval, nên ba file đó rơi vào vùng soi staleness. Chỉ lộ ra SAU khi merge `main` vào nhánh — trên chính `main` thì cổng sạch, staleness sinh ra từ nhánh chứ không phải từ `main`. Mã của gói này không đổi một byte; một phiên tươi chạy lại cả 9 lệnh trong worktree của nhánh, preflight GREEN, mọi lệnh exit 0. Lane chạy LẠI ở mốc cuối sau khi hai file `scripts/acceptance/` bỏ dở trong worktree được commit — một ghim chỉ được dời sau một lane đã thật sự chạy tại đúng mốc đó
run_id: repin-conformance-l0-20260829T025815Z
sha: 1406d9686404e9924c19797908b00bc2f40d524a · suites: 9 lệnh exit 0

### Re-pin lần 5 — 2026-08-29, do nhánh `feat/add-media-library` đi tiếp tới chữ ký Cổng 2: sau lần re-pin 4 nhánh còn commit thêm bảy lượt (hai lỗi nặng của vòng 7, khai thư mục dist trong `tsconfig.json`, bỏ bước khôi phục phá dữ liệu khỏi guard a11y, và bộ hồ sơ nghiệm thu). Hồ sơ này khai `src/**` và `sdk/**` trong `paths`, nên các commit đó rơi vào vùng soi staleness. Mã của gói này không đổi một byte; một phiên tươi chạy lại cả 9 lệnh trong worktree của nhánh, preflight GREEN ở mọi agent kiểm nó, mọi lệnh exit 0. Ghim dời **sau** khi mọi commit ngoài `_acceptance/**` đã xong — đúng bài học lần 4: ghim trước rồi commit tiếp là tự huỷ ghim vừa lấy. Hai lệnh pytest đỏ ở lượt đầu là **lỗi gọi của người dựng lane**, không phải hồ sơ đỏ: exit 4 là mã *usage error* của pytest (target không tồn tại) chứ không phải mã test trượt — target thật là `tests/test_engine_batch.py` và `tests/conformance`, sai vì bản liệt kê config bị cắt ở 110 ký tự rồi bị coi là nguồn. Sửa target, chạy lại: 9/9 exit 0.
run_id: repin-conformance-l0-20260829T134252Z
sha: 31968535286d7800678c5f9af0e2aa0a33c4c54a · suites: 9 lệnh exit 0

### Re-pin lần 6 — 2026-08-31, do `chong-mat-khoa-byo` chạm `src/app/api/**` mà hồ sơ này khai trong `paths`
run_id: repin-20260831T022203Z-2767
sha: 292d740129ec49e46dda86ecef6b6f0a51b5080e · suites: 7 lệnh exit 0

Lane máy thuần chạy bởi một agent tươi tại HEAD: preflight GREEN · build+typecheck ·
lint · vitest 708 · sdk pytest 292 · verify:plugins · gen:abi sạch. Cây sạch trước và
sau. Không chữ ký người nào bị đụng.

### Re-pin lần 7 — 2026-09-01, do dang-ky-fork-openai chạm scripts/plugins/** trong phạm vi hẹp của hồ sơ này
run_id: repin-20260901T093702Z-3535
sha: bb85560ca1337e308b1e06f5be7234dd64a0be2a · suites: 8 lệnh exit 0
