---
schema_version: 2
feature_slug: normalize-text-vi
verdict: PENDING-JUDGMENT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 42152398ff9271d16bb065759d28ccdc262b1351
human_signoff:
---

# Evidence Report: normalize-text-vi

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1a | AC-1 | script | PASS |
| E1b | AC-1 | script | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6a | AC-6 | test | PASS |
| E6b | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9a | AC-9 | test | PASS |
| E9b | AC-9 | test | PASS |
| E10a | AC-10 | test | PASS |
| E10b | AC-10 | test | PASS |
| E10c | AC-10 | test | PASS |
| E11a | AC-11 | test | PASS |
| E11b | AC-11 | test | PASS |
| E12a | AC-12 | test | PASS |
| E12b | AC-12 | test | PASS |
| E13 | AC-13 | script | PASS |
| E14a | AC-13 | script | PASS |
| E14b | AC-13 | script | PASS |
| E15 | AC-15 | ui-check | PASS |
| E16 | AC-15 | judgment | PASS |
| E17a | AC-14 | script | PASS |
| E17b | AC-14 | script | PASS |
| E18 | AC-16 | script | PASS |

## Evidence

- eval: E1a
  run_id: minted-normalize-text-vi-E1a-r2
  exit_code: 0
  verifier: config:executors.script.gen_abi_clean
  verified_at: 2026-08-26T01:27:25Z
  carried_from_round: 13
  note: carry-forward tu round 13 — delta khong cham paths cua eval (khung goc xem round 13 trong Iterations)

- eval: E1b
  run_id: minted-normalize-text-vi-E1b-r2
  exit_code: 0
  verifier: config:executors.script.abi_python_gen_clean
  verified_at: 2026-08-26T01:27:25Z
  carried_from_round: 13
  note: carry-forward tu round 13 — delta khong cham paths cua eval (khung goc xem round 13 trong Iterations)

- eval: E2
  run_id: minted-normalize-text-vi-E2-r14
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_money
  verified_at: 2026-08-26T09:20:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E3
  run_id: minted-normalize-text-vi-E3-r14
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_datetime
  verified_at: 2026-08-26T09:20:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E4
  run_id: minted-normalize-text-vi-E4-r14
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_identifiers
  verified_at: 2026-08-26T09:20:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E5
  run_id: minted-normalize-text-vi-E5-r14
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_ambiguous
  verified_at: 2026-08-26T09:20:00Z
  output: |
    pin: vietnormalizer==0.2.3
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E6a
  run_id: minted-normalize-text-vi-E6a-r14
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_residual_fail
  verified_at: 2026-08-26T09:20:00Z
  output: |
    1 passed in 0.04s

- eval: E6b
  run_id: minted-normalize-text-vi-E6b-r14
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_residual_pass
  verified_at: 2026-08-26T09:20:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E7
  run_id: minted-normalize-text-vi-E7-r14
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_idempotent
  verified_at: 2026-08-26T09:20:00Z
  output: |
    1 passed in 0.06s
    EXIT_CODE: 0

- eval: E8
  run_id: minted-normalize-text-vi-E8-r14
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_edges
  verified_at: 2026-08-26T09:20:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.08s

- eval: E9a
  run_id: minted-normalize-text-vi-E9a-r6
  exit_code: 0
  verifier: config:executors.test.unit_normalize_node
  verified_at: 2026-08-26T01:27:25Z
  carried_from_round: 13
  note: carry-forward tu round 13 — delta khong cham paths cua eval (khung goc xem round 13 trong Iterations)

- eval: E9b
  run_id: minted-normalize-text-vi-E9b-r14
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_normalize_export
  verified_at: 2026-08-26T09:20:00Z
  output: |
    Tests  2 passed (2)
    Start at  09:19:01
    Duration  202ms (transform 93ms, setup 0ms, import 130ms, tests 3ms, environment 0ms)

- eval: E10a
  run_id: minted-normalize-text-vi-E10a-r14
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_tts_order_violation
  verified_at: 2026-08-26T09:20:00Z
  output: |
    Tests  5 passed | 55 skipped (60)
    Start at  09:18:59
    Duration  278ms (transform 88ms, setup 0ms, import 206mb, tests 4ms, environment 0ms)

- eval: E10b
  run_id: minted-normalize-text-vi-E10b-r14
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_tts_order_compliant
  verified_at: 2026-08-26T09:20:00Z
  output: |
    Tests  8 passed | 52 skipped (60)
    Start at  09:18:57
    Duration  597ms (transform 221ms, setup 0ms, import 498ms, tests 6ms, environment 0ms)

- eval: E10c
  run_id: minted-normalize-text-vi-E10c-r14
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_tts_family_matches_abi
  verified_at: 2026-08-26T09:20:00Z
  output: |
    Tests  2 passed | 58 skipped (60)
    Start at  09:18:59
    Duration  277ms (transform 87ms, setup 0ms, import 206ms, tests 2ms, environment 0ms)

- eval: E11a
  run_id: minted-normalize-text-vi-E11a-r14
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_node_cache_normalize
  verified_at: 2026-08-26T09:20:00Z
  output: |
    ..                                                                       [100%]
    2 passed in 0.20s

- eval: E11b
  run_id: minted-normalize-text-vi-E11b-r6
  exit_code: 0
  verifier: config:executors.test.sdk_pytest_tier_a_allowlist
  verified_at: 2026-08-26T01:27:25Z
  carried_from_round: 13
  note: carry-forward tu round 13 — delta khong cham paths cua eval (khung goc xem round 13 trong Iterations)

- eval: E12a
  run_id: minted-normalize-text-vi-E12a-r6
  exit_code: 0
  verifier: config:executors.test.sdk_pytest_normalize_conformance
  verified_at: 2026-08-26T01:27:25Z
  carried_from_round: 13
  note: carry-forward tu round 13 — delta khong cham paths cua eval (khung goc xem round 13 trong Iterations)

- eval: E12b
  run_id: minted-normalize-text-vi-E12b-r2
  exit_code: 0
  verifier: config:executors.test.unit_conformance
  verified_at: 2026-08-26T01:27:25Z
  carried_from_round: 13
  note: carry-forward tu round 13 — delta khong cham paths cua eval (khung goc xem round 13 trong Iterations)

- eval: E13
  run_id: minted-normalize-text-vi-E13-r14
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.normalize_registration_synced
  verified_at: 2026-08-26T09:20:00Z
  output: |
    OK: manifest + 3 READMEs (plugin list & matrix row) + 5 locales all in sync

- eval: E14a
  run_id: minted-normalize-text-vi-E14a-r14
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.normalize_sdk_train_local
  verified_at: 2026-08-26T09:20:00Z
  output: |
    OK: SDK 0.2.23 (both files agree) · vietnormalizer==0.2.3 pinned exactly

- eval: E14b
  run_id: minted-normalize-text-vi-E14b-r14
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.normalize_sdk_published
  verified_at: 2026-08-26T09:20:00Z
  output: |
    OK: artifact mang tongflow/text/, models mới và NORMALIZE_TEXT_VI
    OK: the plugin shell pins oneflow-sdk==0.2.23
    OK: the release train is in sync for 0.2.23

- eval: E15
  run_id: 42152398ff9271d16bb065759d28ccdc262b1351
  exit_code: 0
  baseline: n-a
  verifier: config:capture
  verified_at: 2026-08-26T09:22:00Z
  screenshot: evidence/design/captures/state-1-idle.png
  observed: |
    Frame 1 (state-1-idle.png, 1280x900, dark canvas): a single React Flow node card titled "Đọc số thành chữ" with a spell-check icon and a "≡" options button in the header. Body shows an "Cách triển khai" (implementation) selector reading "api-normalize-text-vi" and a full-width "Đọc thành chữ" action button. Two small circular connection handles are visible on the node's left and right mid-edge (in:text / out:text). All visible labels are real Vietnamese words, not raw i18n keys (e.g. not "node.title" or "vi.normalize.button"). Matches Expected: idle state, readable Vietnamese UI, canvas viewport (not phone-sized).
    Frame 2 (state-2-wired.png, 1280x900, dark canvas): same node card ("Đọc số thành chữ" / "Cách triển khai" / "api-normalize-text-vi" / "Đọc thành chữ" button), now wired via a curved edge to an upstream source node on the left showing "Giá 1.999.000đ ngày 19/8/2026" (a real import-shaped fixture value, consistent with commit 9d98fb1 "E18 chọn chủ thể theo import thật"). Both left (in:text) and right (out:text) handles are visible and connected/exposed. Matches Expected: wired state, real canvas edge rendering, correct subject chosen from the import fixture.
    Both frame HTML sidecars were inspected: state-1-idle.html has data-proto-state="idle" and html lang="vi"; state-2-wired.html has data-proto-state="wired" and html lang="vi" — both match Expected exactly, no idle-fallback-under-wired-label defect.
  network_observed: clean

- eval: E16
  judged_by: judge panel (3 lens: domain-correctness, operational-feasibility, spec-alignment)
  verdict: PASS
  rationale: Ca ba lens deu PASS. domain-correctness: ca hai anh dung khuon AbiNodeShell, header co icon + tieu de "Doc so thanh chu" + hamburger, than card co dropdown "Cach trien khai" chon "api-normalize-text-vi", nut hanh dong "Doc thanh chu" co icon dua phep, dung hai handle tron o giua canh trai/phai khop in:text/out:text, canh noi o state-2 cam dung vao handle trai, tieng Viet co dau hien thi dung khong vo chu. operational-feasibility: bo cuc padding/spacing deu voi cac shell khac trong workspace, khong yeu to nao pha vo ngon ngu thiet ke quan sat duoc. spec-alignment: khong thay chi tiet nao pha vo spacing/bo goc/tong mau/kieu chu giua hai trang thai.
  required_evidence: []
  human_override: Manh 2026-08-26 — PASS. Đã tự xem hai ảnh khổ 1280x900 và bản phóng to 8x ở cạnh node (evidence/gate2-e16/), đặt cạnh các node sẵn có trên bảng vẽ: cùng ngôn ngữ thiết kế, hai đầu nối đúng chỗ, dây cắm đúng đầu nối trái. Vế so sánh với node khác — phần máy không chấm được — do người duyệt xác nhận.

- eval: E17a
  run_id: minted-normalize-text-vi-E17a-r14
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.normalize_plugin_shell
  verified_at: 2026-08-26T09:20:00Z
  output: |
    plugin_commit_sha: local-tree-not-a-repo
    ...                                                                      [100%]
    3 passed in 0.15s

- eval: E17b
  run_id: minted-normalize-text-vi-E17b-r14
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.normalize_plugin_shell
  verified_at: 2026-08-26T09:20:00Z
  output: |
    plugin_commit_sha: local-tree-not-a-repo
    ...                                                                      [100%]
    3 passed in 0.15s

- eval: E18
  run_id: minted-normalize-text-vi-E18-r14
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.measuring_instruments_refuse
  verified_at: 2026-08-26T09:20:00Z
  output: |
    (checked 9 executor keys whose tests need the engine; each must carry the ${pin:?…} guard)
    OK: capture refuses a wrong locale and clears the stale frame · shared executor reports a legible pin error

## Analyst

carried tu round 2 — baseline khong do lai round nay

- E1a (`pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json`) — green tren ca HEAD lan diffBase; guard chung minh generator khop output da commit, khong rieng chung minh feature nay them dung slot. Can xem lai de assert them NormalizeTextViInput/Output cu the, hoac xac nhan day la regression-guard co chu y (khong sua trong round nay).
- E1b (`bash scripts/abi/check-python-gen-clean.sh`) — cung mau hinh nhu E1a nhung o phia Python codegen; green tren ca hai nhanh.
- E12b (`pnpm vitest run src/lib/abi/conformance.test.ts`) — nua TS cua conformance suite green tren ca HEAD lan baseline; ban than suite chay du fixture nao cung xanh, khong rieng phan biet fixture normalize-text-vi moi.

## Variance

none — khong co eval nao trong vong nay mang field runs > 1; toan bo eval deterministic va dong nhat (0/1 hoac 1/1).

## Iterations

Round 13: 6 eval nen tang (E1a, E1b, E9a, E11b, E12a, E12b) da xanh; carry-forward sang round 14 vi delta khong cham paths cua chung (P1).
Round 14 (vong nay): 20 eval may con lai (E2-E8, E9b, E10a-c, E11a, E13, E14a-b, E15, E17a-b, E18) chay lai tren cay 4215239 — PASS toan bo (theo commit 9d98fb1 "D tran truoc tu viet hoa TU CHOI thay vi doan; E18 chon chu the theo import that"); E16 (judgment, AC-15) hoi dong 3 lens deu PASS nhung theo luat T3, moi judgment item bat buoc human_override ke ca khi PASS → verdict tong giu PENDING-JUDGMENT cho Gate 2.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter
