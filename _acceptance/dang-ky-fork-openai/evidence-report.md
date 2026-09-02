---
schema_version: 2
feature_slug: dang-ky-fork-openai
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: ae09815e2a9e4002d3b0046b02ec4f7eb48b089c
human_signoff: Phan Le Manh 2026-09-01
---

# Evidence Report: dang-ky-fork-openai

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-dang-ky-fork-openai-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lcp_manifest_counts
  verified_at: 2026-09-01T22:35:00+07:00
  output: |
    OK: 35 plain strings under default org + 4 origin entries (oneflow-api-ffmpeg, oneflow-api-openai, oneflow-api-pyscenedetect, oneflow-modal-compose-overlay)

- eval: E2
  run_id: minted-dang-ky-fork-openai-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lcp_manifest_guard_teeth
  verified_at: 2026-09-01T22:35:00+07:00
  output: |
      ok — guard goes red: an origin entry was demoted to a plain string
      ok — guard goes red: the default org was changed
    OK: the manifest guard is red for all 6 perturbations

- eval: E3
  run_id: minted-dang-ky-fork-openai-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.civ_docs_guard_synced
  verified_at: 2026-09-01T22:35:00+07:00
  output: |
    OK: CLAUDE.md describes scripts/plugins/check-manifest-unmoved.sh as it behaves — 35 plain strings + 4 origin entry

- eval: E4
  run_id: minted-dang-ky-fork-openai-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dkfo_readme_sync
  verified_at: 2026-09-01T22:35:00+07:00
  output: |
    docs/README_ZH.md: 39 id extracted · manifest: 39
    docs/README_JA.md: 39 id extracted · manifest: 39
    OK: 3 READMEs each list exactly the 39 plugins the manifest registers, every org matching its entry shape

- eval: E5
  run_id: minted-dang-ky-fork-openai-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dkfo_docs_teeth
  verified_at: 2026-09-01T22:35:00+07:00
  output: |
    CASE claude-stale-id: PASS
    CASE khong-tuyen-qua: PASS
    OK: 7/7 ca — 1 doi chung duong + 6 phep pha (readme + claude modes), va khong tuyen qua so ca da chay

- eval: E6
  run_id: minted-dang-ky-fork-openai-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dkfo_claude_origin_ids
  verified_at: 2026-09-01T22:35:00+07:00
  output: |
    CLAUDE.md: 4 id extracted · manifest origin entries: 4
    OK: CLAUDE.md lists exactly the 4 origin ids — oneflow-api-ffmpeg, oneflow-api-openai, oneflow-api-pyscenedetect, oneflow-modal-compose-overlay

- eval: E7
  run_id: minted-dang-ky-fork-openai-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dkfo_icon_no_new_orphan
  verified_at: 2026-09-01T22:35:00+07:00
  output: |
    public/plugins: base 3 orphan · HEAD 3 orphan · added 0
    OK: no new orphan icon against origin/main

- eval: E8
  run_id: minted-dang-ky-fork-openai-E8-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dkfo_resign_wave
  verified_at: 2026-09-01T22:35:00+07:00
  output: |
    OK: no feature other than dang-ky-fork-openai carries stale evidence — the re-sign wave has cleared

### Lệnh suite (hồi quy)

- cmd: bash scripts/acceptance/preflight-verify-env.sh
  run_id: minted-dang-ky-fork-openai-SUITE-bash_scripts_acceptance_preflight_verify-r3
  exit_code: 0
  verified_at: 2026-09-01T22:35:00+07:00

- cmd: pnpm build
  run_id: minted-dang-ky-fork-openai-SUITE-build-r3
  exit_code: 0
  verified_at: 2026-09-01T22:35:00+07:00

- cmd: pnpm typecheck
  run_id: minted-dang-ky-fork-openai-SUITE-typecheck-r3
  exit_code: 0
  verified_at: 2026-09-01T22:35:00+07:00

- cmd: pnpm lint:check
  run_id: minted-dang-ky-fork-openai-SUITE-lint_check-r3
  exit_code: 0
  verified_at: 2026-09-01T22:35:00+07:00

- cmd: pnpm test
  run_id: minted-dang-ky-fork-openai-SUITE-test-r3
  exit_code: 0
  verified_at: 2026-09-01T22:35:00+07:00

- cmd: cd sdk && . ../scripts/lib/sdk-version.sh && pin=$(reader_pin) && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions --with "${pin:?no vietnormalizer pin derived from sdk/pyproject.toml}" python -m pytest -q
  run_id: minted-dang-ky-fork-openai-SUITE-scripts_lib_sdk_version_sh_pin_reader_pi-r3
  exit_code: 0
  verified_at: 2026-09-01T22:35:00+07:00

- cmd: pnpm verify:plugins
  run_id: minted-dang-ky-fork-openai-SUITE-verify_plugins-r3
  exit_code: 0
  verified_at: 2026-09-01T22:35:00+07:00

- cmd: pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json
  run_id: minted-dang-ky-fork-openai-SUITE-gen_abi-r3
  exit_code: 0
  verified_at: 2026-09-01T22:35:00+07:00

## Known limits

- E2 (`check-manifest-guard-teeth.sh`): nhãn của ca thứ 5 vẫn in "a 37th plain string was added" dù sau PR này số chuỗi trần là 35 (phép phá tạo chuỗi thứ 36, không phải 37). Trôi văn xuôi trong mã có sẵn, ngoài phạm vi hồ sơ này — script vẫn đỏ đúng như kỳ vọng.
- E5 (`check-live-docs-manifest-teeth.sh`): ca `orphan-them-moi` đã bị RÚT ở vòng 3 vì nó ghi vật thăm dò vào cây thật trong khi bộ điều phối chạy các ô máy song song, gây đua. Bộ răng còn 7 ca (`healthy readme-missing readme-extra org-sai-chuoi-tran org-sai-muc-origin claude-stale-id khong-tuyen-qua`), in `OK: 7/7 ca`.
- E7 (`check-live-docs-manifest-synced.sh orphans`): chế độ `orphans` CHƯA TỪNG được chứng minh biết đỏ — ca phá của nó (cùng `orphan-them-moi`) đã bị rút cùng lý do đua trên cây thật ở vòng 3. Assertion hiện tại chỉ khẳng định `added 0`, không có đối chứng đỏ.

## Ngoài hợp đồng

## Analyst

carried tu round trước — baseline không đo lại round này (P2, evals.yaml không đổi từ lần đo baseline cuối).

none — baseline round này ghi `n-a` cho toàn bộ tám eval máy (không đo lại); không có eval nào được xác nhận xanh-cả-hai-phía ở round này để báo cáo. Các lệnh suite (build/typecheck/lint/test/sdk-pytest/verify:plugins/gen:abi/preflight) là regression-guard bình thường, không liệt kê theo quy ước.

## Variance

none — không có eval nào mang `runs > 1` ở round này; toàn bộ tám eval là deterministic (runs=1) và đều pass_rate 1/1 ngầm định (exit 0, không dao động giữa các lần chạy được ghi nhận).

## Iterations

Round 1: E8 failed — hồ sơ đã ký của một feature khác mang bằng chứng có trước code của nhánh này (trước re-pin). Returned to implementation.
Round 2: E8 failed lại — vòng sửa chạm thêm `scripts/plugins/**` sau khi đã ghim, làm mốc pin cũ hết hiệu lực. Returned to implementation.
Round 3: E1-E8 đều PASS — ca `orphan-them-moi` (E5/E7) đã rút vì gây đua trên cây thật khi chạy song song; re-pin lần 8 tại 35b24ee đóng lại E8. Toàn bộ lệnh suite (build/typecheck/lint/test/sdk pytest/verify:plugins/gen:abi/preflight) xanh.