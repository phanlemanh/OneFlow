---
schema_version: 2
feature_slug: normalize-text-vi
verdict: PENDING-JUDGMENT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a60ccac04f11450d79eb8329587bac840289c628
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
| E17a | AC-14 | script | PASS |
| E17b | AC-14 | script | PASS |
| E15 | AC-15 | ui-check | PASS |
| E16 | AC-15 | judgment | UNCERTAIN |

## Evidence

- eval: E1a
  run_id: minted-normalize-text-vi-E1a-r2
  exit_code: 0
  verifier: config:executors.script.gen_abi_clean
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E1b
  run_id: minted-normalize-text-vi-E1b-r2
  exit_code: 0
  verifier: config:executors.script.abi_python_gen_clean
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-normalize-text-vi-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_money
  verified_at: 2026-08-21T07:45:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.06s

- eval: E3
  run_id: minted-normalize-text-vi-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_datetime
  verified_at: 2026-08-21T07:45:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E4
  run_id: minted-normalize-text-vi-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_identifiers
  verified_at: 2026-08-21T07:45:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E5
  run_id: minted-normalize-text-vi-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_ambiguous
  verified_at: 2026-08-21T07:45:00Z
  output: |
    1 passed in 0.04s

- eval: E6a
  run_id: minted-normalize-text-vi-E6a-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_residual_fail
  verified_at: 2026-08-21T07:45:00Z
  output: |
    1 passed in 0.04s

- eval: E6b
  run_id: minted-normalize-text-vi-E6b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_residual_pass
  verified_at: 2026-08-21T07:45:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E7
  run_id: minted-normalize-text-vi-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_idempotent
  verified_at: 2026-08-21T07:45:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E8
  run_id: minted-normalize-text-vi-E8-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_edges
  verified_at: 2026-08-21T07:45:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.07s

- eval: E9a
  run_id: minted-normalize-text-vi-E9a-r2
  exit_code: 0
  verifier: config:executors.test.unit_normalize_node
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E9b
  run_id: minted-normalize-text-vi-E9b-r2
  exit_code: 0
  verifier: config:executors.test.unit_normalize_export
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E10a
  run_id: minted-normalize-text-vi-E10a-r2
  exit_code: 0
  verifier: config:executors.test.unit_tts_order_violation
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E10b
  run_id: minted-normalize-text-vi-E10b-r2
  exit_code: 0
  verifier: config:executors.test.unit_tts_order_compliant
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E10c
  run_id: minted-normalize-text-vi-E10c-r2
  exit_code: 0
  verifier: config:executors.test.unit_tts_family_matches_abi
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E11a
  run_id: minted-normalize-text-vi-E11a-r2
  exit_code: 0
  verifier: config:executors.test.sdk_pytest_node_cache_normalize
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E11b
  run_id: minted-normalize-text-vi-E11b-r2
  exit_code: 0
  verifier: config:executors.test.sdk_pytest_tier_a_allowlist
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E12a
  run_id: minted-normalize-text-vi-E12a-r2
  exit_code: 0
  verifier: config:executors.test.sdk_pytest_normalize_conformance
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E12b
  run_id: minted-normalize-text-vi-E12b-r2
  exit_code: 0
  verifier: config:executors.test.unit_conformance
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E13
  run_id: minted-normalize-text-vi-E13-r2
  exit_code: 0
  verifier: config:executors.script.normalize_registration_synced
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E14a
  run_id: minted-normalize-text-vi-E14a-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.normalize_sdk_train_local
  verified_at: 2026-08-21T07:45:00Z
  output: |
    OK: SDK 0.2.21 (hai file khớp) · vietnormalizer==0.2.3 pin chính xác

- eval: E14b
  run_id: minted-normalize-text-vi-E14b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.normalize_sdk_published
  verified_at: 2026-08-21T07:45:00Z
  output: |
    OK: artifact mang tongflow/text/, models mới và NORMALIZE_TEXT_VI
    OK: vỏ plugin pin oneflow-sdk==0.2.21
    OK: chuyến phát hành đồng bộ cho 0.2.21

- eval: E17a
  run_id: minted-normalize-text-vi-E17a-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.normalize_plugin_shell
  verified_at: 2026-08-21T07:45:00Z
  output: |
    plugin_commit_sha: local-tree-not-a-repo
    ...                                                                      [100%]
    3 passed in 0.12s

- eval: E17b
  run_id: minted-normalize-text-vi-E17b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.normalize_plugin_shell
  verified_at: 2026-08-21T07:45:00Z
  output: |
    plugin_commit_sha: local-tree-not-a-repo
    ...                                                                      [100%]
    3 passed in 0.12s

- eval: E15
  run_id: minted-normalize-text-vi-E15-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check.normalize_node_states
  verified_at: 2026-08-21T07:45:00Z
  screenshot: evidence/design/captures/state-1-idle.png
  observed: |
    state-1-idle.png (opened with Read): dark-themed React Flow canvas, single node card titled "Đọc số thành chữ" (readable Vietnamese, not a raw i18n key) with an implementation-method dropdown labeled "Cách triển khai" showing value "api-normalize-text-vi", and an action button "Đọc thành chữ". No upstream node is present, matching the idle fixture (no wiring). Matches Expected for state=idle. Cross-checked the saved state-1-idle.html: contains data-proto-state="idle" and <html lang="vi">, confirming this frame is genuinely the idle state on the vi locale, not a silent idle-fallback for a bad state name.

    state-2-wired.png (opened with Read): same node card ("Đọc số thành chữ" / "Cách triển khai" / "api-normalize-text-vi" / "Đọc thành chữ") now positioned to the right, with a second light-colored stub node visible to its left representing the upstream text source, laid out as connected input feeding the normalize node — matching the wired fixture (an upstream text node feeding in:text). Matches Expected for state=wired. Cross-checked the saved state-2-wired.html: contains data-proto-state="wired" and <html lang="vi">.

    Both frames are genuinely from this tree/round: HEAD was verified equal to invokedSha before any capture, and both HTML dumps carry lang="vi" (locale correctly forced) plus the exact expected data-proto-state value (no "unknown:" fallback).
  network_observed: clean
  output: |
    - _acceptance/normalize-text-vi/evidence/E15-network.txt

    Verdict: exitCode=0, every assertion passed. Both frames are genuine captures of this exact tree (HEAD verified pre-flight), correct locale (lang="vi"), and correct data-proto-state ("idle" / "wired", not an unknown-name idle-fallback). P0 design gate green on both. Console clean of errors. Exactly two handles (in:text/out:text). Labels are real Vietnamese text, not raw i18n keys.

<!-- <<<JUDGMENT-BLOCK-TEMPLATE -->
- eval: E16
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment)
  verdict: UNCERTAIN
  rationale: |
    Đề xuất panel: FAIL (2/3 lens — domain-correctness, operational-feasibility); spec-alignment còn UNCERTAIN nên khối này giữ UNCERTAIN, không tự chốt thành phía FAIL — đúng tinh thần criterion E16 (bất đồng thuận giữa các lens → người quyết ở Cổng 2, không phải máy tự chốt). Toàn bộ phiếu, đầy đủ không rút gọn:
    - domain-correctness: FAIL — Shell/header, spacing, icon, và nhãn tiếng Việt đều đúng khuôn AbiNodeShell; nhưng quét pixel toàn bộ viền node (trái/phải/trên/dưới) ở cả state-1-idle.png và state-2-wired.png không phát hiện bất kỳ dấu hiệu handle in:text/out:text nào — vùng sát viền chỉ là màu nền canvas đồng nhất, và ở state-2 cũng không thấy đường edge (bezier path) nối vào node dù có khối trắng chồng lên phía trên. Đây là vi phạm rõ với đúng tiêu chí "hai handle in:text/out:text" mà AC-15 hỏi.
    - operational-feasibility: FAIL — Header/icon/spacing/nhãn nút đều đúng khuôn AbiNodeShell và đọc được tiếng Việt ("Đọc số thành chữ", "Cách triển khai", "Đọc thành chữ"), nhưng phóng to 4x và quét pixel dọc toàn bộ viền trái/phải/trên/dưới của node ở cả hai ảnh chỉ thấy hình chữ nhật bo góc trơn với gradient bóng đổ — không có bất kỳ chấm handle nào tách biệt lộ ra để nhận diện in:text/out:text. Ở state-2 "wired", node input trắng phía trên chỉ đè chồng góc trên-trái của node, không có đường dây/bezier nào nối hai node hiện rõ trong ảnh — nên không thể xác nhận wire nhìn thấy được, một phần cấu thành của câu hỏi AC-15.
    - spec-alignment: UNCERTAIN — Shell/header (thanh navy đậm, icon "A✓" bên trái tiêu đề, menu hamburger phải), spacing, và nhãn nút "Đọc thành chữ" đều đọc được rõ tiếng Việt và nhất quán giữa hai ảnh, không có gì phá vỡ ngôn ngữ thiết kế nhìn thấy được. Nhưng zoom pixel-level cả 4 cạnh (trái/phải) của node ở cả hai ảnh không thấy dấu chấm handle nào tại viền — tiêu chí "hai handle in:text/out:text" không thể xác nhận được từ hai ảnh tĩnh này; ở state-2-wired cũng không thấy đường nối (edge) rõ ràng giữa node nguồn (đè lên) và node này, nên không loại trừ khả năng handle bị ẩn/che chứ chưa chắc là thiếu.
  required_evidence:
    - "[domain-correctness] Crop độ phân giải cao (>=3x) đúng toạ độ handle mong đợi trên node (cạnh trái ~x=116, cạnh phải ~x=465, y giữa ~456 trong state-1-idle.png) cho thấy một chấm/hình tròn connector có màu tương phản với nền — nếu tồn tại, verdict đổi sang PASS."
    - "[domain-correctness] Ảnh chụp node đang trong thao tác kéo-nối (hover trên handle hoặc đang tạo edge) cho thấy đường bezier path rõ ràng nối vào handle in:text của node — nếu chứng minh được edge thật (không phải node khác chỉ nằm đè lên), verdict đổi."
    - "[operational-feasibility] Ảnh chụp canvas ở mức zoom trình duyệt cao hơn (150%+) khung sát cạnh trái và cạnh phải của node 'Đọc số thành chữ' đủ để thấy rõ có/không có chấm handle in:text và out:text tại đó — nếu thấy hai chấm handle rõ ràng, verdict đổi sang PASS cho vế handle."
    - "[operational-feasibility] Ảnh chụp toàn cảnh (không crop) của state-2-wired cho thấy trọn đường bezier/wire nối từ handle output của node input text phía trên xuống handle input của node 'Đọc số thành chữ' — nếu đường dây hiện rõ nối hai node, vế 'wire nhìn thấy được' được giải quyết."
    - "[spec-alignment] Một ảnh chụp node ở trạng thái hover/connect-mode (hoặc DevTools inspector) từ chính trang /proto/normalize-text-vi cho thấy rõ hai phần tử <Handle id=\"in:text\"> và <Handle id=\"out:text\"> (chấm tròn) tại viền trái/phải của node card — nếu ảnh này tồn tại và thấy hai handle, verdict đổi sang PASS; nếu thấy DOM không có Handle nào, verdict đổi sang FAIL."
  human_override:
<!-- JUDGMENT-BLOCK-TEMPLATE>>> -->

## Analyst

carried tu round 2 — baseline khong do lai round nay

- E1a (`pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json`) — kiểm generator ABI-clean; xanh trên cả HEAD lẫn baseline khi đo ở round 2 (generator idempotent trên cây sạch). evals.yaml không đổi từ lần đo cuối nên round này không đo lại baseline.
- E1b (`bash scripts/abi/check-python-gen-clean.sh`) — cùng lý do, kiểm generator Python-clean; non-discriminating từ round 2, không đo lại.
- E12b (`pnpm vitest run src/lib/abi/conformance.test.ts`) — 13 test cũ trong suite conformance TS xanh trên cả hai phía ở round 2; phần mới cho normalize-text-vi nằm trong E9a/E9b/E12a, không nằm trong file này.

## Variance

none — không có eval nào trong vòng này (kể cả các eval carry-forward) mang field runs > 1; toàn bộ deterministic.

## Iterations

Round 1: các lỗ đo được ghi nhận và vá trong S4-r1 — hố NFD của luật tiền trong E8 (chỉ so `.text` bỏ lọt `.ok`/`has_money` lệch dạng), nửa đọc của E9a (đăng ký node đo bằng hằng thay vì đọc lại registry), và E11b (quan hệ TIER_A_SLOTS ⊆ ABI đo ở executor không được chọn) — trả về implementation.
Round 2: các lỗ còn lại từ S4-r2 được vá — quan hệ has_money có mỏ neo dương độc lập trong E6b, predicate không còn rỗng-hoá được; E11b có test riêng `_and_in_abi`; E13 đo cấu trúc README bằng awk đoạn-giữa-heading; E10a bỏ prose i18n sang đo tất định ở E13; E14b tự dựng cặp wheel giả lành/thiếu trong script; E17a pin vietnormalizer derive từ pyproject. 24 eval máy + E15 (ui-check) PASS; E16 (judgment so-sánh-đối-chứng) UNCERTAIN vì panel không được cấp capture của denoise-audio/remove-subtitle để so sánh — verdict tổng PENDING-JUDGMENT.
Round 3 (vòng này): owner nâng phạm vi AC-5/AC-6b tại Cổng 2 (2026-08-21) — vá hai lỗi đọc owner nêu: khoảng có hậu tố đơn vị viết cách (5% - 10%) từng đọc thành "âm", và giá viết cách "500 đ" từng bị từ chối; đồng thời AC-15/E16 được thu hẹp bỏ vế so-sánh-đối-chứng (dời sang checklist Cổng 2 riêng của owner) nên E16 lần này chấm việc hai handle in:text/out:text có nhìn thấy được trên chính hai ảnh — panel vẫn chia phiếu (2 FAIL, 1 UNCERTAIN) vì quét pixel viền node không xác nhận được chấm handle nào; giữ UNCERTAIN chờ người quyết. 12 eval carry-forward không đổi (delta không chạm paths của chúng) + 13 eval máy đo lại đều PASS, E15 (ui-check) PASS; verdict tổng vẫn PENDING-JUDGMENT.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter
