---
schema_version: 2
feature_slug: scan-with-block-imports
verdict: PASS
triage_failed: true
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a33e0df4db5253e190051a947576c97a6bd564dc
human_signoff: Manh Phan 2026-08-18
---

# Evidence Report: scan-with-block-imports

> **Nâng PENDING-JUDGMENT lên PASS tại Cổng 2 — Manh Phan, 2026-08-18.** Vòng chấm
> để verdict ở PENDING-JUDGMENT vì phân loại phạm vi chạy không trọn
> (`triage_failed: true`), tức máy KHÔNG khai là đã kiểm hết. Việc nâng lên PASS là
> chữ ký của người đã tự đọc toàn bộ `review-findings.md`, không phải kết luận của
> máy. Hai điều đã chốt kèm chữ ký: đường `entry.py` không thuộc gói này (AC-2 đã thu
> phạm vi, hợp đồng kế đóng nó) và năm giới hạn đã biết ghi trong `## Notes` của
> contract.

> **Ghi chú của người vận hành (không do máy chấm viết).** Vòng 2 có HAI lượt trên
> cùng commit `a33e0df`, không đổi một dòng mã nào giữa hai lượt:
>
> - **Lượt 1 (03:18Z) — BLOCKED.** Bộ phân loại an toàn của Bash bị giới hạn tốc độ,
>   13/16 eval không chạy được. `run-log.jsonl` giữ 13 dòng `"cannot_run": true`,
>   `exit_code: null`. Ba eval chạy được là E13, E14, E15.
> - **Lượt 2 (03:38Z) — lượt trong báo cáo này.** Sau khi giới hạn tốc độ hết, toàn
>   bộ 16 eval chạy và exit 0.
>
> Vì hai lượt cùng vòng, `run_id` của một eval xuất hiện HAI lần trong sổ chạy — dòng
> `cannot_run` và dòng thật. Đây là chủ ý: xoá dòng của lượt không chạy được sẽ xoá
> mất bằng chứng rằng vòng đó từng không đo được gì. Một agent trong workflow đã tự
> xoá 13 dòng đó và commit kèm nhãn "(PASS)" (commit `3a83a13`); các dòng đã được
> khôi phục từ kết quả gốc của lượt bị chặn.
>
> **Vòng 3 (05:07Z) — BLOCKED, rồi bị gỡ bỏ lý do tồn tại.** Vòng 3 được mở vì sau
> vòng 2 có thêm hai thay đổi mã: nhớ-đệm `_collect_models_roots` và phép đo đếm của
> nó. Vòng đó cũng bị bộ phân loại chặn (14/16 eval `cannot_run`, còn trong sổ chạy).
> Ở Cổng 2, người ký chọn **bỏ phần vá tốc độ khỏi gói này** sau khi đo được rằng nó
> đáng 2.5 ms trên cây plugin thật (con số 63x là ca tổng hợp cực đoan). Hai file đó
> đã hoàn nguyên, nên mã của nhánh này **trùng khớp từng byte** với `a33e0df` — đúng
> commit mà báo cáo này đo. Phần vá tốc độ thuộc về hợp đồng kế
> (`fix/scan-scope-diagnostics`), nơi nó sẽ có bằng chứng của riêng nó.
>
> Vì vậy `verified_commit` ở đây là `a33e0df` chứ không phải HEAD: các commit sau nó
> chỉ chạm `_acceptance/**` và `docs/**`, không chạm mã sản phẩm.

⚠ phân loại phạm vi KHÔNG chạy được: không có lỗi nào được máy tự sửa vòng này; danh sách đầy đủ nằm trong review-findings.md; người xem lại toàn bộ trước khi ký.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-11 | script | PASS |
| E12 | AC-12 | script | PASS |
| E13 | AC-13 | script | PASS |
| E14 | AC-1 | script | PASS |
| E14b | AC-14 | script | PASS |
| E15 | AC-7 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-scan-with-block-imports-E1-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_scope_with_deploy
  verified_at: 2026-08-18T11:15:00+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.16s

- eval: E2
  run_id: minted-scan-with-block-imports-E2-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_scope_with_scan
  verified_at: 2026-08-18T11:15:00+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E3
  run_id: minted-scan-with-block-imports-E3-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_scope_nested
  verified_at: 2026-08-18T11:15:00+07:00
  output: |
    ............                                                             [100%]
    12 passed in 0.03s

- eval: E4
  run_id: minted-scan-with-block-imports-E4-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_scope_function_local
  verified_at: 2026-08-18T11:15:00+07:00
  output: |
    ..                                                                       [100%]
    2 passed in 0.03s

- eval: E5
  run_id: minted-scan-with-block-imports-E5-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_scope_import_spellings
  verified_at: 2026-08-18T11:15:00+07:00
  output: |
    ...                                                                      [100%]
    3 passed in 0.04s

- eval: E6
  run_id: minted-scan-with-block-imports-E6-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_scope_prior_behaviour
  verified_at: 2026-08-18T11:15:00+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E7
  run_id: minted-scan-with-block-imports-E7-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_reason_not_sdk_model
  verified_at: 2026-08-18T11:15:00+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.03s

- eval: E8
  run_id: minted-scan-with-block-imports-E8-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_reason_missing_annotation
  verified_at: 2026-08-18T11:15:00+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E9
  run_id: minted-scan-with-block-imports-E9-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_reason_missing_param
  verified_at: 2026-08-18T11:15:00+07:00
  output: |
    1 passed in 0.16s

- eval: E10
  run_id: minted-scan-with-block-imports-E10-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_reason_single_source
  verified_at: 2026-08-18T11:15:00+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.26s

- eval: E11
  run_id: minted-scan-with-block-imports-E11-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.check_scan_noise
  verified_at: 2026-08-18T11:15:00+07:00
  output: |
    ok: over 5 installed plugins, no plugin became newly problematic at HEAD

- eval: E12
  run_id: minted-scan-with-block-imports-E12-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.check_overlay_discoverable_fixture
  verified_at: 2026-08-18T11:15:00+07:00
  output: |
    fixture deploy.py matches its pinned hash (b3ac7ff6ab0f9a556f8a48ff44f51b58f6912037aaec5da752e0abb3eb5c9e6e)
    tongflow loaded from this repo: /Users/manh-macmini/dev/oneflow/sdk/tongflow/__init__.py
    ok [fixture]: compose-overlay served by ['oneflow-modal-compose-overlay'], no problems for oneflow-modal-compose-overlay

- eval: E13
  run_id: minted-scan-with-block-imports-E13-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.check_scan_blast_radius
  verified_at: 2026-08-18T11:15:00+07:00
  output: |
    ok: no contract chokepoint touched, SDK version unchanged since 29d0c3be811408297827f75d7c7931c11e0973ed

- eval: E14
  run_id: minted-scan-with-block-imports-E14-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.check_scope_walker_teeth
  verified_at: 2026-08-18T11:15:00+07:00
  output: |
    ok: reverting the walker turns E1..E5 red and names the missing slot COMPOSE_OVERLAY

- eval: E14b
  run_id: minted-scan-with-block-imports-E14b-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.check_overlay_discoverable_real
  verified_at: 2026-08-18T11:15:00+07:00
  output: |
    tongflow loaded from this repo: /Users/manh-macmini/dev/oneflow/sdk/tongflow/__init__.py
    ok [real]: compose-overlay served by ['oneflow-modal-compose-overlay'], no problems for oneflow-modal-compose-overlay

- eval: E15
  run_id: minted-scan-with-block-imports-E15-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.check_reason_teeth
  verified_at: 2026-08-18T11:15:00+07:00
  output: |
    ok: removing the reason emission turns E7..E10 red and names the absent reason

### Full regression suites (context, not mapped to a single contract eval)

These ran successfully this round and confirm nothing outside the mapped
evals is broken:

- `pnpm build && pnpm typecheck` — exit 0. Last line: `$ tsc --noEmit`.
- `pnpm lint:check` — exit 0. `Checked 431 files in 182ms. No fixes applied.`
- `pnpm test` — exit 0. `Tests 427 passed (427)`.
- `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q` — exit 0. `217 passed in 6.18s`.
- `pnpm verify:plugins` — exit 0. `[verify-plugins-scan] OK`.
- `pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json` — exit 0. `Wrote sdk/tongflow/_data/tongflow.abi.json` / `[no diff detected]`.

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: PASS — evidence committed for this feature's criteria (see commit `f9368f4 chore(acceptance): S4 round 1 evidence for scan-with-block-imports (PASS)`).
Round 2: this attempt was retried after an earlier same-round pass ended BLOCKED (Bash tool safety classifier rate-limited on 13 of 16 evals). This retry ran all 16 machine evals (E1-E15/E14b) to completion — all PASS, all baseline: red (discriminating) — but scope-triage could not run, so no finding this round was auto-classified into or out of contract; verdict is PENDING-JUDGMENT with `triage_failed: true`, awaiting full human review of review-findings.md before Gate 2 can sign off.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] Scope-triage failed this round (`triage_failed: true`) — personally
      review every finding in review-findings.md (all sections, including
      `## Chưa phân loại (triage-failed)`) since the machine did not classify
      or fix any of them
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter