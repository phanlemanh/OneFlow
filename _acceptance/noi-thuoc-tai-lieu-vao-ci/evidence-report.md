# Evidence Report Template — nội dung round 1

---
schema_version: 2
feature_slug: noi-thuoc-tai-lieu-vao-ci
verdict: REJECT
failed_evals: []
reason: 
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 647e81f0cbed2a0f411c5dbbe21f2da6693e3e81
human_signoff: 
---

# Evidence Report: noi-thuoc-tai-lieu-vao-ci

⚠ REJECT: lệnh suite `pnpm build` (evals: [], không gắn AC nào) thoát mã 134 — Node OOM (`Ineffective mark-compacts near heap limit`) trong lúc build. Toàn bộ 9 eval AC-1..AC-9 (E1–E9) đều PASS trên cây hiện tại; verdict tổng REJECT là vì lệnh suite hồi quy này đỏ, không phải vì một eval có hợp đồng thất bại — xem khối "Lệnh suite (hồi quy)" bên dưới.

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
| E9 | AC-9 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-noi-thuoc-tai-lieu-vao-ci-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gate_guards_job_shape
  verified_at: 2026-09-02T02:10:00Z
  output: |
    OK: cả hai guard nằm trong job acceptance-gate; fetch-depth 0, Node 24, hai trigger còn nguyên
    OK: không có continue-on-error / || true / set +e trong job acceptance-gate

- eval: E2
  run_id: minted-noi-thuoc-tai-lieu-vao-ci-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ntlc_exit_propagates
  verified_at: 2026-09-02T02:10:00Z
  output: |
    OK: cả 7 lệnh trong job đều truyền mã thoát khác 0 khi script chúng gọi hỏng

- eval: E3
  run_id: minted-noi-thuoc-tai-lieu-vao-ci-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gate_guards_job_reachable
  verified_at: 2026-09-02T02:10:00Z
  output: |
    OK: trigger pull_request không lọc đường dẫn; step và job không mang if: hay needs:

- eval: E4
  run_id: minted-noi-thuoc-tai-lieu-vao-ci-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gate_guards_job_teeth
  verified_at: 2026-09-02T02:10:00Z
  output: |
    KÊ=7 · PHÁ=5 · BỎ QUA=2
      bỏ qua: check-live-docs-manifest-synced.sh orphans — doc base ref qua git show; cay tham do la thu muc mktemp khong co .git
      bỏ qua: check-live-docs-manifest-teeth.sh — ve do cua no CHINH LA no; pha no de chung minh no biet do la vong tron
    OK: 7 lệnh (rút từ .github/workflows/ci.yml) xanh trên cây lành; 5 đỏ trên cây đã phá; 2 bỏ qua CÓ TÊN; cờ rác bị từ chối

- eval: E5
  run_id: minted-noi-thuoc-tai-lieu-vao-ci-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gate_guards_job_teeth
  verified_at: 2026-09-02T02:10:00Z
  output: |
    KÊ=7 · PHÁ=5 · BỎ QUA=2
      bỏ qua: check-live-docs-manifest-synced.sh orphans — doc base ref qua git show; cay tham do la thu muc mktemp khong co .git
      bỏ qua: check-live-docs-manifest-teeth.sh — ve do cua no CHINH LA no; pha no de chung minh no biet do la vong tron
    OK: 7 lệnh (rút từ .github/workflows/ci.yml) xanh trên cây lành; 5 đỏ trên cây đã phá; 2 bỏ qua CÓ TÊN; cờ rác bị từ chối

- eval: E6
  run_id: minted-noi-thuoc-tai-lieu-vao-ci-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dkfo_readme_sync
  verified_at: 2026-09-02T02:10:00Z
  output: |
    OK: 3 READMEs each list exactly the 39 plugins the manifest registers, every org matching its entry shape

- eval: E7
  run_id: minted-noi-thuoc-tai-lieu-vao-ci-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dkfo_docs_teeth
  verified_at: 2026-09-02T02:10:00Z
  output: |
    CASE claude-stale-id: PASS
    CASE khong-tuyen-qua: PASS
    OK: 9/9 ca — 2 doi chung duong + 6 phep pha (readme + claude modes) + 1 ca tu soi harness

- eval: E9
  run_id: minted-noi-thuoc-tai-lieu-vao-ci-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ntlc_no_new_checkout
  verified_at: 2026-09-02T02:10:00Z
  output: |
    ok actions/checkout: 8 site(s), all >= v7
    ok docker/login-action: 1 site(s), all >= v4
    action pins: at or above the contracted floor at every site

- eval: E8
  run_id: minted-noi-thuoc-tai-lieu-vao-ci-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ntlc_resign_wave
  verified_at: 2026-09-02T02:10:00Z
  output: |
    OK: no feature other than noi-thuoc-tai-lieu-vao-ci carries stale evidence — the re-sign wave has cleared
    (lane repin: repin-20260902T020812Z-5668)

### Lệnh suite (hồi quy)

- cmd: bash scripts/acceptance/preflight-verify-env.sh
  run_id: minted-noi-thuoc-tai-lieu-vao-ci-SUITE-bash_scripts_acceptance_preflight_verify-r1
  exit_code: 0
  verified_at: 2026-09-02T02:10:00Z

- cmd: pnpm build
  run_id: minted-noi-thuoc-tai-lieu-vao-ci-SUITE-build-r1
  exit_code: 134
  verified_at: 2026-09-02T02:10:00Z
  output: |
    FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
    ----- Native stack trace -----
     1: 0x106096848 node::OOMErrorHandler(...) [/opt/homebrew/Cellar/node/26.7.0/lib/libnode.147.dylib]
    ...
    47: 0x19c5bdd54 start [/usr/lib/dyld]
    [ELIFECYCLE] Command failed.

- cmd: pnpm typecheck
  run_id: minted-noi-thuoc-tai-lieu-vao-ci-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-09-02T02:10:00Z

- cmd: pnpm lint:check
  run_id: minted-noi-thuoc-tai-lieu-vao-ci-SUITE-lint_check-r1
  exit_code: 0
  verified_at: 2026-09-02T02:10:00Z

- cmd: pnpm test
  run_id: minted-noi-thuoc-tai-lieu-vao-ci-SUITE-test-r1
  exit_code: 0
  verified_at: 2026-09-02T02:10:00Z

- cmd: cd sdk && . ../scripts/lib/sdk-version.sh && pin=$(reader_pin) && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions --with "${pin:?no vietnormalizer pin derived from sdk/pyproject.toml}" python -m pytest -q
  run_id: minted-noi-thuoc-tai-lieu-vao-ci-SUITE-scripts_lib_sdk_version_sh_pin_reader_pi-r1
  exit_code: 0
  verified_at: 2026-09-02T02:10:00Z

- cmd: pnpm verify:plugins
  run_id: minted-noi-thuoc-tai-lieu-vao-ci-SUITE-verify_plugins-r1
  exit_code: 0
  verified_at: 2026-09-02T02:10:00Z

- cmd: pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json
  run_id: minted-noi-thuoc-tai-lieu-vao-ci-SUITE-gen_abi-r1
  exit_code: 0
  verified_at: 2026-09-02T02:10:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round truoc — baseline khong do lai round nay (P2: evals.yaml không đổi từ lần baseline cuối; mọi field `baseline:` ở trên ghi "n-a" cho round này).

none — không đo lại baseline vòng này.

## Variance

none — every multi-run eval is uniform (không eval nào mang `runs` > 1 vòng này).

## Iterations

Round 1: cả 9 eval hợp đồng (E1–E9) PASS, nhưng lệnh suite `pnpm build` (không gắn eval nào) thoát mã 134 — Node hết heap khi build (`JavaScript heap out of memory`) — nên verdict tổng là REJECT. review-findings.md còn ghi thêm 3 finding trong hợp đồng (AC-1, AC-2×2) và một cảnh báo phạm vi cuối file (7/13 lỗi rơi ngoài vùng đo). Trả về implementation: (1) khắc phục OOM của `pnpm build` (tăng `--max-old-space-size` hoặc điều tra hồi quy bộ nhớ), (2) vá 3 finding trong hợp đồng ở review-findings.md, (3) hồ sơ `noi-thuoc-tai-lieu-vao-ci` còn `status: implemented` với `approved_by` rỗng và không có evidence-report.md trước round này — cần ký Cổng 2 cho round kế tiếp trước khi merge.