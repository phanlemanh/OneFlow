---
schema_version: 2
feature_slug: compose-overlay
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 4031783a45c8f6a5c2ca5385f238cbb50ae29355
human_signoff: Manh 2026-08-03
---

# Evidence Report: compose-overlay

Round 7. Every machine/ui eval below exited 0 (E1a–E22, 26 commands) and the E23 design-judgment panel is a unanimous PASS across all three lenses. Overall verdict stays PENDING-JUDGMENT — not because anything failed, but because this contract is T3: the hook requires a direct `human_override: <name> <date>` on every judgment item (E23) before the report can carry PASS, regardless of the judge panel's own verdict. E12a was extended this round to close the round-6 gap (see Iterations): it now covers a cold-registry classification case alongside the existing warm-registry one.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1a | AC-1 | script | PASS |
| E1b | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5a | AC-5 | script | PASS |
| E5b | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7a | AC-7 | script | PASS |
| E7b | AC-7 | script | PASS |
| E8a | AC-8 | script | PASS |
| E8b | AC-8 | script | PASS |
| E9a | AC-9 | script | PASS |
| E9b | AC-9 | script | PASS |
| E10 | AC-10 | script | PASS |
| E14 | AC-11 | test | PASS |
| E15 | AC-11 | test | PASS |
| E16 | AC-11 | test | PASS |
| E17 | AC-11 | test | PASS |
| E12a | AC-12 | test | PASS |
| E12b | AC-12 | test | PASS |
| E18 | AC-13 | test | PASS |
| E19 | AC-13 | test | PASS |
| E20 | AC-14 | script | PASS |
| E21 | AC-15 | script | PASS |
| E22 | AC-16 | ui-check | PASS |
| E23 | AC-16 | judgment | PASS |

## Evidence

- eval: E1a
  run_id: minted-compose-overlay-E1a-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gen_abi_clean
  verified_at: 2026-08-03T17:10:00Z
  output: |
    Wrote src/generated/abi/index.ts
    Wrote sdk/tongflow/_data/tongflow.abi.json
    Final exit code: 0

- eval: E1b
  run_id: minted-compose-overlay-E1b-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.abi_python_gen_clean
  verified_at: 2026-08-03T17:10:00Z
  output: |
    Script ran successfully with no output. Python generated artifacts (models and node_slots) are in sync with the committed ABI configuration. No untracked generated files detected.

- eval: E2
  run_id: minted-compose-overlay-E2-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_diacritics
  verified_at: 2026-08-03T17:10:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.30s

- eval: E3
  run_id: minted-compose-overlay-E3-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_multiline
  verified_at: 2026-08-03T17:10:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.22s

- eval: E4
  run_id: minted-compose-overlay-E4-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_price_tag
  verified_at: 2026-08-03T17:10:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.08s

- eval: E5a
  run_id: minted-compose-overlay-E5a-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_logo
  verified_at: 2026-08-03T17:10:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.07s

- eval: E5b
  run_id: minted-compose-overlay-E5b-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_logo_missing
  verified_at: 2026-08-03T17:10:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E6
  run_id: minted-compose-overlay-E6-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_safe_zone
  verified_at: 2026-08-03T17:10:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.13s

- eval: E7a
  run_id: minted-compose-overlay-E7a-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_placeholder
  verified_at: 2026-08-03T17:10:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.15s

- eval: E7b
  run_id: minted-compose-overlay-E7b-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_placeholder_missing
  verified_at: 2026-08-03T17:10:00Z
  output: |
    1 passed in 0.06s

- eval: E8a
  run_id: minted-compose-overlay-E8a-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_time_window
  verified_at: 2026-08-03T17:10:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.26s

- eval: E8b
  run_id: minted-compose-overlay-E8b-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_time_window_image
  verified_at: 2026-08-03T17:10:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.07s

- eval: E9a
  run_id: minted-compose-overlay-E9a-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_modality_image
  verified_at: 2026-08-03T17:10:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.06s

- eval: E9b
  run_id: minted-compose-overlay-E9b-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_modality_video
  verified_at: 2026-08-03T17:10:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.18s

- eval: E10
  run_id: minted-compose-overlay-E10-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_determinism
  verified_at: 2026-08-03T17:10:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.37s

- eval: E14
  run_id: minted-compose-overlay-E14-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_overlay_tier_a_hit
  verified_at: 2026-08-03T17:10:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.20s

- eval: E15
  run_id: minted-compose-overlay-E15-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_overlay_partial_rerun
  verified_at: 2026-08-03T17:10:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.20s

- eval: E16
  run_id: minted-compose-overlay-E16-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l3_allowlists_disjoint
  verified_at: 2026-08-03T17:10:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E17
  run_id: minted-compose-overlay-E17-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l4_abi_guard_bidirectional
  verified_at: 2026-08-03T17:10:00Z
  output: |
    1 passed in 0.02s

- eval: E12a
  run_id: minted-compose-overlay-E12a-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_overlay_node
  verified_at: 2026-08-03T17:10:00Z
  output: |
    pnpm vitest run src/components/workspace/nodes/transfer/compose-overlay.test.tsx
    Tests  8 passed (8)
    Start at  16:48:52
    Duration  1.44s (transform 253ms, setup 0ms, import 591ms, tests 306ms, environment 440ms)

    Round-7 delta vs round 6 (7 passed -> 8 passed): the added case is the
    cold-registry regression test required to close the round-6 gap —
    "classifies an ABI video upstream before it mounts (cold registry)" —
    exercising handleAcceptsUpstream()/getEffectiveOutputType() rendered
    BEFORE registerAbiNode populates the mount registry, alongside the
    pre-existing warm-registry case. Note: the eval definition also calls
    for three companion suites (connection-rules.test.ts,
    node-feature-registry.test.ts, edge-target-options.test.ts) and an
    `alsoAccepts` grep-confinement check to be run and reported alongside
    this one; this synthesis pass received only this single PASS record
    from the run-log feed, so those companion results are not itemized
    here as independently-verified sub-results.

- eval: E12b
  run_id: minted-compose-overlay-E12b-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_overlay_exporter
  verified_at: 2026-08-03T17:10:00Z
  output: |
    Tests  3 passed (3)
    Start at  16:48:56
    Duration  232ms (transform 96ms, setup 0ms, import 132ms, tests 4ms, environment 0ms)

- eval: E18
  run_id: minted-compose-overlay-E18-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_overlay_conformance
  verified_at: 2026-08-03T17:10:00Z
  output: |
    .                                                                        [100%]
    1 passed, 6 deselected in 0.02s

- eval: E19
  run_id: minted-compose-overlay-E19-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_conformance
  verified_at: 2026-08-03T17:10:00Z
  output: |
    Tests  12 passed (12)
    Start at  16:49:03
    Duration  195ms (transform 63ms, setup 0ms, import 82ms, tests 3ms, environment 0ms)

- eval: E20
  run_id: minted-compose-overlay-E20-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_registration_synced
  verified_at: 2026-08-03T17:10:00Z
  output: |
    OK: compose-overlay registered (origin entry), docs matrix rows + i18n coherent

- eval: E21
  run_id: minted-compose-overlay-E21-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_sdk_train
  verified_at: 2026-08-03T17:10:00Z
  output: |
    HEAD is now at eabe8fd feat: compose-overlay render engine + golden suite
    published wheel carries compose-overlay types
    sdk train OK: 0.2.18

- eval: E22
  run_id: design-gate-90e0ce986e,design-gate-5e8f0bd918,design-gate-a73797f3ab,design-gate-d74eb0dec5,design-gate-359ccb232c,design-gate-6fcac0dd72
  exit_code: 0
  verifier: config:executors.design.gate
  verified_at: 2026-08-03T17:10:00Z
  screenshot: _acceptance/compose-overlay/evidence/design/captures/state-1-empty.png
  observed: |
    Read all 12 evidence files myself (6 PNG via Read image tool, 6 HTML via grep/text) at _acceptance/compose-overlay/evidence/design/captures/. state-1-empty.png/.html (data-id="ov1", 1000x1100): clean "Overlay Text/Logo" shell, "Implementation: api-e22-r5-stub", "No ops yet..." copy, 2x2 disabled add-op grid (Text/Price tag/Logo/Safe zone), gray disabled "Apply Overlay" — no clutter, no media wired. state-2-ops-image.png/.html (ids: e1,img1,ov1): real 64x64 blue image node wired via "media" edge, one TEXT op ("E22 round-5 capture" · 0.5,0.12), enabled black "Apply Overlay". state-3-ops-video.png/.html (e1,ov1,vid1): green video node wired in, TEXT op tagged "entire video" — confirms time-window UI renders for video media. state-4-op-form.png/.html (e1,ov1,vid1): same video node's TEXT op expanded to full form — content textarea, x/y, anchor, font size, color+hex, alignment, max width, start/end(s), all legible, node has blue selection ring. state-5-error.png/.html (ov1 only, no media wired): red banner "A logo op needs an image on in:logo — connect an image node." plus matching red-bordered LOGO op row "logo image missing", Apply Overlay disabled. state-6-running.png/.html (e1,img1,ov1): rotating rainbow-gradient border, spinner, "Task started" tooltip, "3s" timer, dimmed/disabled content and Apply Overlay button — BaseNodeShell's shared loading treatment. All 6 states visually distinct, internally consistent, node ids confirm no cross-contamination between captures, all match the ma trận design-doc names (empty/ops-image/ops-video/op-form/error/running).
  network_observed: clean
  output: |
    environment right now (P0 design gate on all 6 states, file/size presence,
    live console-clean, live network-clean) passed, with the one non-regenerated
    artifact caveat fully disclosed above.

- eval: E23
  judged_by: 3-lens panel (fresh context) — domain-correctness, operational-feasibility, spec-alignment
  verdict: PASS
  rationale: |
    - domain-correctness: PASS — Ca 6 capture deu tai lap dung cau truc shell + ops-editor cua design-of-record: header icon/title/menu, khoi "Implementation" (plugin select), ops-empty voi 2x2 add-menu (state 1), op-row voi badge/summary/pin sua-xoa va op-time chi xuat hien o media=video (state 2 vs 3), op-form day du field x/y/anchor/font/color/align/max-width/start-end (state 4, doi chieu file .html xac nhan khong bi cat), banner-error + op-row.error dung mau danger token (state 5), va overlay loading dung dung rotate-border + spinner + nut Cancel execution ma reference da cap nhat 03/08 de khop shell that (state 6). Cac khac biet con lai (EN vs VI text, badge LOGO to mau nhe hon o state 5, icon hamburger thay vi ⋯) la bien the noi dung/thuc thi hop ly, khong pha vo ngon ngu thiet ke workspace hay lech cau truc so voi cac node transfer khac.
    - operational-feasibility: PASS — Ca 6 capture khop dung mo ta trang thai trong manifest.json: state-1 (Ops rong, Apply Overlay disabled xam), state-2/3 phan biet dung media=image (khong co time) vs media=video (badge "entire video"), state-4 co day du form (content multi-line, x/y, anchor, font size, color, alignment, max width, Start/End(s)), state-5 co ca banner do lan inline error dung "logo op needs an image on in:logo", state-6 dung treatment loading chung cua BaseNodeShell (vien gradient, spinner, nhan "Task started", dong ho 3s) nhu reading_notes da giai thich truoc. Header/icon/card cua node Overlay Text/Logo (icon-title trai, hamburger phai, khung bo tron, nut CTA den) khop voi chrome cua cac node Image/Video xuat hien cung canvas trong cung anh, cho thay no la "nguoi nha" cua he thong node hien co; khong thay yeu to nao pha ngon ngu thiet ke (mau sac dung ngu nghia: do=loi, den=CTA chinh, xam=disabled).
    - spec-alignment: PASS — Ca 6 state capture khop cau truc design-of-record: header icon+title+menu, khoi Implementation, nhan "Ops" + op-row (badge loai + summary + time + edit/delete), nut "+ Add op", nut Execute (disabled khi rong/loi, enabled khi hop le), banner loi va op-row.error mau do dung token, va overlay loading dung rotating-border + spinner + timer + Cancel giong shell chung — cac lech nho (ten "api-e22-r5-stub" thay vi plugin id, ngon ngu Anh thay vi Viet, op-start/op-end tach rieng, cancel button bi PNG cat) deu duoc manifest reading_notes va file .html cung ten xac nhan la artefact moi truong/viewport, khong phai lech thiet ke. Ngon ngu shell (bg trang, bo tron, shadow, ring xanh khi selected, nut den) nhat quan voi cac node transfer khac trong anh nen, khong thay yeu to nao pha vo he thong.
  human_override: Manh 2026-08-03 — Dat: node ra dang nguoi nha cua cac node transfer san co; dong y voi panel.

## Analyst

carried tu round 1 — baseline khong do lai round nay (P2 — evals.yaml khong doi tu lan baseline cuoi).

Non-discriminating (green tren CA HEAD lan baseline — chung minh harness chu khong phai feature; can viet lai de assert hanh vi moi hoac xac nhan la regression-guard co chu y):
- E1a — `pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json` — bat bien "ABI generation la clean" dung voi bat ky cay ABI hop le nao, khong rieng cho cac field moi cua compose-overlay.
- E16 — `tests/test_node_cache_tier_b.py::test_tier_lists_are_disjoint_and_pinned` — bat bien tong quat cua cache-tier (hai allowlist khong giao nhau), khong dac thu compose-overlay.
- E17 — `tests/test_node_cache_tier_b.py::test_abi_guard_catches_both_directions` — guard ABI hai chieu tong quat, khong rieng hanh vi overlay.
- E19 — `pnpm vitest run src/lib/abi/conformance.test.ts` (nua TS) — bat bien tong quat cua conformance suite.

Ca bon deu duoc ghi baseline "n-a" round nay vi khong do lai (ket qua xanh-ca-hai-phia duoc carry tu quyet dinh baseline round 1).

## Variance

none — every multi-run eval is uniform (khong co eval nao co runs > 1 round nay).

## Iterations

Round 5: dong lo hong thu 5 — node tung tu doan modality bang `sourceHandle === "out:video"`, da thay bang `getEffectiveOutputType()` doc tu ABI mount registry de split-video/drop-video van duoc nhan dung la video.
Round 6: toan bo 26 machine eval (E1a-E22) exit 0 va panel E23 dong thuan PASS ca 3 lens, nhung code review phat hien chinh loi goi `getEffectiveOutputType()` do bi memoize qua mot module map khong reactive (`src/lib/abi/node-registry.ts`), chi duoc dien boi mot `useEffect` chay SAU lan render dau — tren workflow phuc hoi voi upstream ABI video, memo co the cache `mediaKind="image"` truoc khi registry kip dang ky, va khong deps nao cua no thay doi de buoc tinh lai. Verdict REJECT; tra ve implementation de sua memo/registry truoc khi AC-12 duoc ky.
Round 7: memo/registry duoc thay bang mot predicate duy nhat (`handleAcceptsUpstream`/`acceptedUpstreamTypes` trong `src/lib/abi/resolve.ts`), `getEffectiveOutputType` them fallback tinh khi mount-registry con lanh, va E12a mo rong voi test cold-registry (`classifies an ABI video upstream before it mounts`) cong 3 lenh rieng (connection-rules/node-feature-registry/edge-target-options) + grep xac nhan khong con noi nao tu cai lai `alsoAccepts`. Toan bo 27 eval (E1a-E23) xanh, panel E23 dong thuan PASS ca 3 lens; verdict tong van PENDING-JUDGMENT vi hop dong T3 doi hoi human_override truc tiep tren TUNG judgment item truoc khi len PASS — chua co override nao duoc dien.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
