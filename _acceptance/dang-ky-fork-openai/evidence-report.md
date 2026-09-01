---
schema_version: 2
feature_slug: dang-ky-fork-openai
verdict: REJECT
triage_failed: true
failed_evals: ["E8"]
reason: 
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 51d0836fc9d70f123789482952c5957b51ce9e0b
human_signoff: 
---

# Evidence Report: dang-ky-fork-openai

⚠ phân loại phạm vi KHÔNG chạy được — không lỗi nào trong danh sách dưới đây được máy tự phân loại hay tự sửa; danh sách đầy đủ nằm trong review-findings.md (mục "## Chưa phân loại (triage-failed)"); người xem lại toàn bộ trước khi ký.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | FAIL |
| E9 | AC-9 | script | PASS |
| E10 | AC-9 | script | PASS |
| E11 | AC-10 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-dang-ky-fork-openai-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lcp_manifest_counts
  verified_at: 2026-09-01T09:00:00Z
  output: |
    OK: 35 plain strings under default org + 4 origin entries (oneflow-api-ffmpeg, oneflow-api-openai, oneflow-api-pyscenedetect, oneflow-modal-compose-overlay)

- eval: E2
  run_id: minted-dang-ky-fork-openai-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lcp_manifest_guard_teeth
  verified_at: 2026-09-01T09:00:00Z
  output: |
      ok — guard goes red: an origin entry was demoted to a plain string
      ok — guard goes red: the default org was changed
    OK: the manifest guard is red for all 6 perturbations

- eval: E3
  run_id: minted-dang-ky-fork-openai-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.civ_docs_guard_synced
  verified_at: 2026-09-01T09:00:00Z
  output: |
    OK: CLAUDE.md describes scripts/plugins/check-manifest-unmoved.sh as it behaves — 35 plain strings + 4 origin entry

- eval: E4
  run_id: minted-dang-ky-fork-openai-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dkfo_readme_sync
  verified_at: 2026-09-01T09:00:00Z
  output: |
    docs/README_ZH.md: 39 id extracted · manifest: 39
    docs/README_JA.md: 39 id extracted · manifest: 39
    OK: 3 READMEs each list exactly the 39 plugins the manifest registers, every org matching its entry shape

- eval: E5
  run_id: minted-dang-ky-fork-openai-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dkfo_docs_teeth
  verified_at: 2026-09-01T09:00:00Z
  output: |
    CASE orphan-them-moi: PASS
    CASE khong-tuyen-qua: PASS
    OK: 8/8 ca — 1 doi chung duong + 7 phep pha, thuoc do dung o ca 7 va khong tuyen qua so ca da chay

- eval: E6
  run_id: minted-dang-ky-fork-openai-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dkfo_claude_origin_ids
  verified_at: 2026-09-01T09:00:00Z
  output: |
    CLAUDE.md: 4 id extracted · manifest origin entries: 4
    OK: CLAUDE.md lists exactly the 4 origin ids — oneflow-api-ffmpeg, oneflow-api-openai, oneflow-api-pyscenedetect, oneflow-modal-compose-overlay

- eval: E7
  run_id: minted-dang-ky-fork-openai-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dkfo_icon_no_new_orphan
  verified_at: 2026-09-01T09:00:00Z
  output: |
    public/plugins: base 3 orphan · HEAD 3 orphan · added 0
    OK: no new orphan icon against origin/main

- eval: E8
  run_id: minted-dang-ky-fork-openai-E8-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.dkfo_resign_wave
  verified_at: 2026-09-01T09:00:00Z
  output: |
    VIOLATION [conformance-l0]: evidence is stale — code changed after verify (verified_commit bb85560ca1337e308b1e06f5be7234dd64a0be2a); re-run verify before merge. Changed:
    FAIL: 1 other feature(s) still carry stale evidence (above) — re-verify them before merging 'dang-ky-fork-openai'

- eval: E9
  run_id: minted-dang-ky-fork-openai-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dkfo_no_tracked_backups
  verified_at: 2026-09-01T09:00:00Z
  output: |
    tracked files scanned: 1451 · backup-shaped: 0
    OK: no backup-shaped file is tracked

- eval: E10
  run_id: minted-dang-ky-fork-openai-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dkfo_backups_teeth
  verified_at: 2026-09-01T09:00:00Z
  output: |
    CASE healthy: PASS
    CASE co-file-bak: PASS
    OK: 2/2 ca — thuoc xanh tren repo sach, do va neu ten file khi co .bak bi theo doi

- eval: E11
  run_id: minted-dang-ky-fork-openai-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dkfo_docs_teeth
  verified_at: 2026-09-01T09:00:00Z
  output: |
    CASE orphan-them-moi: PASS
    CASE khong-tuyen-qua: PASS
    OK: 8/8 ca — 1 doi chung duong + 7 phep pha, thuoc do dung o ca 7 va khong tuyen qua so ca da chay

### Lệnh suite (hồi quy)

- cmd: bash scripts/acceptance/preflight-verify-env.sh
  run_id: minted-dang-ky-fork-openai-SUITE-bash_scripts_acceptance_preflight_verify-r2
  exit_code: 0
  verified_at: 2026-09-01T09:00:00Z

- cmd: pnpm build
  run_id: minted-dang-ky-fork-openai-SUITE-build-r2
  exit_code: 0
  verified_at: 2026-09-01T09:00:00Z

- cmd: pnpm typecheck
  run_id: minted-dang-ky-fork-openai-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-09-01T09:00:00Z

- cmd: pnpm lint:check
  run_id: minted-dang-ky-fork-openai-SUITE-lint_check-r2
  exit_code: 0
  verified_at: 2026-09-01T09:00:00Z

- cmd: pnpm test
  run_id: minted-dang-ky-fork-openai-SUITE-test-r2
  exit_code: 0
  verified_at: 2026-09-01T09:00:00Z

- cmd: cd sdk && . ../scripts/lib/sdk-version.sh && pin=$(reader_pin) && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions --with "${pin:?no vietnormalizer pin derived from sdk/pyproject.toml}" python -m pytest -q
  run_id: minted-dang-ky-fork-openai-SUITE-scripts_lib_sdk_version_sh_pin_reader_pi-r2
  exit_code: 0
  verified_at: 2026-09-01T09:00:00Z

- cmd: pnpm verify:plugins
  run_id: minted-dang-ky-fork-openai-SUITE-verify_plugins-r2
  exit_code: 0
  verified_at: 2026-09-01T09:00:00Z

- cmd: pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json
  run_id: minted-dang-ky-fork-openai-SUITE-gen_abi-r2
  exit_code: 0
  verified_at: 2026-09-01T09:00:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round truoc — baseline khong do lai round nay
none — danh sách eval không-phân-biệt (carried) rỗng: []

## Variance

none — every multi-run eval is uniform

## Iterations

Round 2: E8 failed — check-resign-wave.sh phát hiện 1 feature khác còn mang bằng chứng đã ký từ trước khi code của feature đó thay đổi (verified_commit bb85560ca1337e308b1e06f5be7234dd64a0be2a); phải re-verify feature đó trước khi merge dang-ky-fork-openai. Bước triage phạm vi không chạy được round này (triage_failed) — không finding nào được máy tự phân loại hay tự sửa.
