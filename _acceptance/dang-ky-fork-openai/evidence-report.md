---
schema_version: 2
feature_slug: dang-ky-fork-openai
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 792163491a11febaa0f5ff729f112442e3eecbef
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

### Re-pin lần 1 — 2026-09-01, do noi-thuoc-tai-lieu-vao-ci chạm .github/workflows/ci.yml và scripts/plugins/**
run_id: repin-20260902T020812Z-5668
sha: e0eb0a92d5ca672e2af4f372bbdede9260727d74 · suites: 8 lệnh exit 0

## Sửa đổi sau chữ ký — 2026-09-02

Owner cho phép sửa bản ghi (Cổng 2 của `noi-thuoc-tai-lieu-vao-ci`, 02/09). Chữ ký
người KHÔNG bị đụng; verdict PASS và mọi kết quả ô đo giữ nguyên. Hai sửa đổi:

**1. Số ca của bộ răng: bằng chứng ghi `OK: 7/7 ca`, lệnh đó nay in `OK: 9/9 ca`.**
Hồ sơ [`noi-thuoc-tai-lieu-vao-ci`](../noi-thuoc-tai-lieu-vao-ci/contract.md) thêm hai
ca vào `check-live-docs-manifest-teeth.sh` (`readme-trung-org-dung`,
`readme-trung-sai-org`) ở commit `e0eb0a9`. Bảy ca cũ vẫn còn nguyên và vẫn PASS — số
đếm tăng, không có ca nào mất.

Điều này lọt lưới vì một **lỗ cấu trúc trong nghi thức re-pin**, không phải sơ suất
riêng lẻ: E5 khai `paths` gồm đúng file bị sửa, nhưng re-pin chỉ chạy lại **suite**,
không chạy lại **eval**. `check-resign-wave` so `sha` nên vẫn xanh. Một hồ sơ đã ký có
thể tuyên một đầu ra mà lệnh của nó không còn sinh ra, và không thước nào đỏ. Lỗ này
đi tiếp thành một hồ sơ cơ hội riêng.

**2. Sổ chạy vòng 3 mang một `sha` không phân giải được — đã sửa về giá trị thật.**
18 dòng ghi `ae09815e2a9e` + 28 số 0. Đó không phải commit; nó là tiền tố 12 ký tự
được độn số 0 khi tôi gõ lại `invokedSha` vào lời gọi workflow thay vì chép nguyên
40-hex từ `s4-args.json` (bản máy sinh, vốn LUÔN đúng). `evals_hash` cũng bị cắt
64 → 16 hex ở cùng nhóm dòng. Cả hai đã sửa về giá trị trong `s4-args.json`;
`git cat-file -t` nay phân giải được mọi sha trong sổ.

Đây là **dữ liệu bịa trong bản ghi kiểm toán**, không phải một phép đo hỏng — nên nó
lọt qua ba vòng verify, một hội đồng review và một chữ ký người. Không thước nào kiểm
sha trong run-log có tồn tại hay không; nó lộ ra vì người review đi `git cat-file`
từng giá trị. Sửa bản ghi về sự thật là khôi phục, không phải viết lại lịch sử — bản
gốc hỏng nằm trong lịch sử git nếu cần đối chiếu.

### Re-pin lần 2 — 2026-09-02, do noi-thuoc-tai-lieu-vao-ci chạm ci.yml, scripts/ci/**, scripts/plugins/** và package.json
run_id: repin-20260902T093055Z-6608
sha: 10e50bdad103b8d9c80efe6ba2b5ebddc4f34ebf · suites: 8 lệnh exit 0

### Re-pin lần 3 — 2026-09-02, do noi-thuoc-tai-lieu-vao-ci rút chế độ exit-propagates và khôi phục dòng in số id
run_id: repin-20260902T102111Z-4002
sha: 0110e2a557c1e5524d7e5a91db39023da23b5df8 · suites: 8 lệnh exit 0 (làn chạy TUẦN TỰ, không tung bầy — vòng trước BLOCKED vì agent chết)

### Re-pin lần 4 — 2026-09-02, do repin-khong-chay-lai-eval chạm scripts/ci/**
run_id: repin-20260902T162209Z-29839
sha: ddea746f4269130b59797ea4236f2ec9a44a6c61 · suites: 8 lệnh exit 0 (làn tuần tự; dòng repin ghi bằng chế độ `write`, mang `prev_sha`)

### Re-pin lần 5 — 2026-09-02, do nhánh thêm hai phép từ chối cho `write` và một guard điểm vào
run_id: rkce-repin-20260902T221339Z
sha: 3c859a4998c875a1032d76ee6529b263474d3b20 · suites: 8 lệnh exit 0

### Re-pin lần 6 — 2026-09-03, do nhánh gom mọi lượt đọc/ghi run-log về một cửa
run_id: rkce-repin-20260903T023014Z
sha: 71449d00fb483e1ef48b95a7da0e4adbb156fb45 · suites: 8 lệnh exit 0

### Re-pin lần 7 — 2026-09-03, do nhánh buộc mọi con số viết tay vào vật nó mô tả
run_id: rkce-repin-20260903T054659Z
sha: c1fae946b9185354407bcf5b080748cadac35488 · suites: 8 lệnh exit 0

### Re-pin lần 8 — 2026-09-03, do vòng soi xác nhận bác một phép sửa và nhánh sửa lại
run_id: rkce-repin-20260903T065011Z
sha: e68cdd61b0e7108753431434216e4343e0117e77 · suites: 8 lệnh exit 0

### Re-pin lần 9 — 2026-09-03, do hợp nhất `origin/main` (33 commit) vào nhánh
run_id: merge-repin-20260903T074652Z
sha: 5b440efdc75859cc700b7564e76b42e6a3e73fd9 · suites: 8 lệnh exit 0

### Re-pin lần 10 — 2026-09-04, do thêm `scripts/acceptance/check-eval-key-dupes.sh` và sửa `scripts/ci/repin-eval-coverage.mjs` cho hồ sơ `hang-rao-doc-nham-loi-thanh-khong-co-gi` — cả hai nằm trong union `paths` của gói này. Mã của gói này không đổi; lane máy 7 lệnh exit 0
run_id: repin-hang-rao-doc-nham-loi-20260903T220954Z
sha: 57c10c950893239c57559730ecdba193e75b0aab · suites: 7 lệnh exit 0

### Re-pin lần 11 — 2026-09-04, do sửa `modePlan` của `scripts/ci/repin-eval-coverage.mjs` (AC-12, owner nâng phạm vi ở Cổng 2 vòng 1) và bộ răng lên 30 ca — cả hai nằm trong union `paths` của gói này. Mã của gói này không đổi; lane máy 7 lệnh exit 0
run_id: repin-hang-rao-doc-nham-loi-20260903T231351Z
sha: d1331546558e3ba13f3e77ef557f1393a44cffa9 · suites: 7 lệnh exit 0

### Re-pin lần 12 — 2026-09-04, do hợp nhất `feat/fork-oneflow-api-openai` vào `main` — 36 commit của `main` (tính năng `khong-noi-sai-ve-kho-khoa`) vào cùng cây với hai hồ sơ của nhánh. Mã của gói này không đổi; lane máy chạy trên CÂY ĐÃ TRỘN: 7 lệnh exit 0
run_id: merge-repin-20260904T030830Z
sha: 792163491a11febaa0f5ff729f112442e3eecbef · suites: 7 lệnh exit 0
