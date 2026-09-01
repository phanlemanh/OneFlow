---
schema_version: 2
feature_slug: dang-ky-fork-openai
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 0c80f8d7e5b0c32a973abf67eef8875944f1b469
human_signoff:
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

**Vì sao REJECT dù cả 8 eval đều PASS:** `pnpm typecheck` thoát mã 2 (xem khối trong "Lệnh suite (hồi quy)" bên dưới) — đây là lệnh hồi quy bắt buộc mỗi vòng theo checklist commit/PR của CLAUDE.md ("`pnpm typecheck` passes (`tsc --noEmit`)"), KHÔNG gắn với bất kỳ AC/eval nào trong `failed_evals`, nhưng thất bại của nó vẫn chặn merge. Lỗi là `TS6053`: `tsc` không tìm thấy các file được sinh bởi Next.js dưới `.next/types/**` (`app/workspace/page.ts`, `cache-life.d.ts`, `validator.ts`) — môi trường verify thiếu bước build/sinh type trước khi chạy `tsc --noEmit`. Vì lỗi này không map vào AC nào nên `failed_evals` giữ nguyên rỗng; verdict tổng REJECT là quyết định của điều phối viên workflow, không phải suy diễn từ bảng eval trên.

## Evidence

- eval: E1
  run_id: minted-dang-ky-fork-openai-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lcp_manifest_counts
  verified_at: 2026-09-01T16:40:00+07:00
  output: |
    OK: 35 plain strings under default org + 4 origin entries (oneflow-api-ffmpeg, oneflow-api-openai, oneflow-api-pyscenedetect, oneflow-modal-compose-overlay)

- eval: E2
  run_id: minted-dang-ky-fork-openai-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lcp_manifest_guard_teeth
  verified_at: 2026-09-01T16:40:00+07:00
  output: |
      ok — guard goes red: an origin entry was demoted to a plain string
      ok — guard goes red: the default org was changed
    OK: the manifest guard is red for all 6 perturbations

- eval: E3
  run_id: minted-dang-ky-fork-openai-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.civ_docs_guard_synced
  verified_at: 2026-09-01T16:40:00+07:00
  output: |
    OK: CLAUDE.md describes scripts/plugins/check-manifest-unmoved.sh as it behaves — 35 plain strings + 4 origin entry

- eval: E4
  run_id: minted-dang-ky-fork-openai-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dkfo_readme_sync
  verified_at: 2026-09-01T16:40:00+07:00
  output: |
    docs/README_ZH.md: 39 id extracted · manifest: 39
    docs/README_JA.md: 39 id extracted · manifest: 39
    OK: 3 READMEs each list exactly the 39 plugins the manifest registers, every org matching its entry shape

- eval: E5
  run_id: minted-dang-ky-fork-openai-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dkfo_docs_teeth
  verified_at: 2026-09-01T16:40:00+07:00
  output: |
    CASE claude-stale-id: PASS
    CASE orphan-them-moi: PASS
    OK: the live-docs guard is red for all 6 perturbations, and green on the unperturbed fixture

- eval: E6
  run_id: minted-dang-ky-fork-openai-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dkfo_claude_origin_ids
  verified_at: 2026-09-01T16:40:00+07:00
  output: |
    CLAUDE.md: 4 id extracted · manifest origin entries: 4
    OK: CLAUDE.md lists exactly the 4 origin ids — oneflow-api-ffmpeg, oneflow-api-openai, oneflow-api-pyscenedetect, oneflow-modal-compose-overlay

- eval: E7
  run_id: minted-dang-ky-fork-openai-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dkfo_icon_no_new_orphan
  verified_at: 2026-09-01T16:40:00+07:00
  output: |
    public/plugins: base 3 orphan · HEAD 3 orphan · added 0
    OK: no new orphan icon against origin/main

- eval: E8
  run_id: minted-dang-ky-fork-openai-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dkfo_resign_wave
  verified_at: 2026-09-01T16:40:00+07:00
  output: |
    OK: no feature other than dang-ky-fork-openai carries stale evidence — the re-sign wave has cleared

### Lệnh suite (hồi quy)

- cmd: bash scripts/acceptance/preflight-verify-env.sh
  run_id: minted-dang-ky-fork-openai-SUITE-bash_scripts_acceptance_preflight_verify-r1
  exit_code: 0
  verified_at: 2026-09-01T16:40:00+07:00
  output: |
    [PASS] pnpm-foreign-tree    sổ sách không nhắc worktree lạ (agk-baseline)
    [PASS] pnpm-live-links      76 liên kết node_modules cấp 1 đều giải được
    VERDICT: GREEN — không bẫy hạ tầng nào đang hoạt động. Ô đỏ của lệnh pnpm/node vòng này là tín hiệu THẬT, đọc như hồi quy.

- cmd: pnpm build
  run_id: minted-dang-ky-fork-openai-SUITE-build-r1
  exit_code: 0
  verified_at: 2026-09-01T16:40:00+07:00
  output: |
    ƒ  (Dynamic)  server-rendered on demand

- cmd: pnpm typecheck
  run_id: minted-dang-ky-fork-openai-SUITE-typecheck-r1
  exit_code: 2
  verified_at: 2026-09-01T16:40:00+07:00
  output: |
    error TS6053: File '/Users/manh-macmini/dev/oneflow/.next/types/app/workspace/page.ts' not found.
      The file is in the program because:
        Matched by include pattern '.next/types/**/*.ts' in '/Users/manh-macmini/dev/oneflow/tsconfig.json'
    error TS6053: File '/Users/manh-macmini/dev/oneflow/.next/types/cache-life.d.ts' not found.
      The file is in the program because:
        Matched by include pattern '.next/types/**/*.ts' in '/Users/manh-macmini/dev/oneflow/tsconfig.json'
    error TS6053: File '/Users/manh-macmini/dev/oneflow/.next/types/validator.ts' not found.
      The file is in the program because:
        Matched by include pattern '.next/types/**/*.ts' in '/Users/manh-macmini/dev/oneflow/tsconfig.json'
    [ELIFECYCLE] Command failed with exit code 2.

- cmd: pnpm lint:check
  run_id: minted-dang-ky-fork-openai-SUITE-lint_check-r1
  exit_code: 0
  verified_at: 2026-09-01T16:40:00+07:00
  output: |
    Done in 185ms using pnpm v11.5.1
    $ pnpm exec biome check --error-on-warnings .
    Checked 509 files in 119ms. No fixes applied.

- cmd: pnpm test
  run_id: minted-dang-ky-fork-openai-SUITE-test-r1
  exit_code: 0
  verified_at: 2026-09-01T16:40:00+07:00
  output: |
    Tests  720 passed | 5 skipped (725)
    Start at  16:40:23
    Duration  14.43s (transform 6.27s, setup 0ms, import 11.88s, tests 23.39s, environment 4.37s)

- cmd: cd sdk && . ../scripts/lib/sdk-version.sh && pin=$(reader_pin) && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions --with "${pin:?no vietnormalizer pin derived from sdk/pyproject.toml}" python -m pytest -q
  run_id: minted-dang-ky-fork-openai-SUITE-scripts_lib_sdk_version_sh_pin_reader_pi-r1
  exit_code: 0
  verified_at: 2026-09-01T16:40:00+07:00
  output: |
    ....                                                                     [100%]
    292 passed in 76.77s (0:01:16)

- cmd: pnpm verify:plugins
  run_id: minted-dang-ky-fork-openai-SUITE-verify_plugins-r1
  exit_code: 0
  verified_at: 2026-09-01T16:40:00+07:00
  output: |
    Done in 412ms using pnpm v11.5.1
    $ tsx scripts/verify-plugins-scan.ts
    [verify-plugins-scan] OK

- cmd: pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json
  run_id: minted-dang-ky-fork-openai-SUITE-gen_abi-r1
  exit_code: 0
  verified_at: 2026-09-01T16:40:00+07:00
  output: |
    $ tsx scripts/gen-abi-types.ts
    Wrote src/generated/abi/index.ts
    Wrote sdk/tongflow/_data/tongflow.abi.json

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round truoc — baseline khong do lai round nay.

Không có eval không-phân-biệt để liệt kê: `baseline` của cả 8 eval là `n-a` vì round này không đo lại baseline (P2 — `evals.yaml` không đổi từ lần đo baseline cuối). Không suy ra "mọi eval đều red trên baseline" từ đây — chỉ là chưa đo.

## Variance

none — every multi-run eval is uniform (không eval nào mang field `runs` > 1 trong vòng này).

## Iterations

Round 1: E1–E8 đều PASS trên script; `pnpm typecheck` thất bại (exit 2, `TS6053`, không gắn AC nào) — verdict REJECT. Chưa quay lại implementation trong vòng này; chờ fix môi trường/typecheck rồi verify lại.
