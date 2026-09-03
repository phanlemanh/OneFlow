---
schema_version: 2
feature_slug: noi-thuoc-tai-lieu-vao-ci
verdict: PASS
failed_evals: []
reason:
verified_by: phiên VERIFY tươi, chạy TUẦN TỰ (CLASSIFIER-FALLBACK sau BLOCKED vòng 2)
enforcement_mode: strict
bypass_used: false
verified_commit: 57c10c950893239c57559730ecdba193e75b0aab
human_signoff: Phan Le Manh 2026-09-02
---

# Evidence Report: noi-thuoc-tai-lieu-vao-ci

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

**Lệnh máy:** 8/8 exit 0 tại `0110e2a557c1` (preflight · build · typecheck · lint ·
test · sdk pytest · verify:plugins · gen:abi sạch).

**Cách chấm vòng này khác hai vòng trước.** Vòng 2 trả `BLOCKED` — hai agent chết
(`agent bi skip/chet`), không phải lỗi sản phẩm. Theo `CLASSIFIER-FALLBACK`, lượt kế
phải đi **verify độc lập, lệnh chạy TUẦN TỰ** thay vì tung bầy lại: xác suất một vòng
fan-out sống là pⁿ, nên tung lại chỉ đổi lượt trúng đạn. Một phiên tươi chạy lần lượt
8 lệnh máy rồi 9 ô đo; **0 lệnh bị công cụ giết**.

E8 đo hai lần: đỏ trước re-pin (đúng dự kiến — hai hồ sơ chờ ghim, mà ghim chỉ xảy ra
sau khi làn máy xanh), rồi một phiên tươi thứ hai chạy lại sau `40381e7` và trả xanh.
Cả hai lượt đều ghi trong run-log.

## Iterations

- **Vòng 1** — REJECT. `pnpm build` exit 134 (SIGABRT dưới tải) + 3 finding trong hợp
  đồng: `exit-propagates` thiếu đối chứng dương (2/7 needle đạt vô nghĩa), `shape` grep
  toàn khối nên đo chỉ dẫn chứ không đo đầu ra, log chẩn đoán ở `/tmp` cố định.
- **Vòng 2** — BLOCKED. Cùng lớp lỗi lại xuất hiện ở cùng chế độ: bất biến đếm
  **hằng-đúng** (mỗi needle tăng đúng một trong hai biến) và một nhánh `fail` chết vì
  `set -e`. Làn ghim của vòng này bị **DỪNG đúng luật** vì `pnpm build` hết heap; không
  ghi dòng repin, chặn nguyên nhân (ghim 8 GB), phóng lane mới.
- **Vòng 3** — PASS. `STOP-PATCHING-CLAUSE` kích hoạt; owner chọn **thu phạm vi**: rút
  hẳn `exit-propagates`. Bốn step CI vẫn được bốn chế độ CÓ SẴN chứng minh.

## Evidence

- eval: E1
  run_id: seq-verify-20260902T102400Z-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gate_guards_job_shape
  verified_at: 2026-09-02T17:24:00+07:00
  sha: 0110e2a557c1e5524d7e5a91db39023da23b5df8
  output: |
    OK: cả hai guard nằm trong job acceptance-gate; fetch-depth 0, Node 24, hai trigger còn nguyên
    OK: không có continue-on-error / || true / set +e trong job acceptance-gate

- eval: E2
  run_id: seq-verify-20260902T102400Z-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gate_guards_job_shape
  verified_at: 2026-09-02T17:24:00+07:00
  sha: 0110e2a557c1e5524d7e5a91db39023da23b5df8
  output: |
    OK: không có continue-on-error / || true / set +e trong job acceptance-gate

- eval: E3
  run_id: seq-verify-20260902T102400Z-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gate_guards_job_reachable
  verified_at: 2026-09-02T17:24:00+07:00
  sha: 0110e2a557c1e5524d7e5a91db39023da23b5df8
  output: |
    OK: trigger pull_request không lọc đường dẫn; step và job không mang if: hay needs:

- eval: E4
  run_id: seq-verify-20260902T102400Z-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gate_guards_job_teeth
  verified_at: 2026-09-02T17:24:00+07:00
  sha: 0110e2a557c1e5524d7e5a91db39023da23b5df8
  output: |
    KÊ=7 · PHÁ=5 · BỎ QUA=2
    OK: 7 lệnh (rút từ .github/workflows/ci.yml) xanh trên cây lành; 5 đỏ trên cây đã phá; 2 bỏ qua CÓ TÊN; cờ rác bị từ chối

- eval: E5
  run_id: seq-verify-20260902T102400Z-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gate_guards_job_teeth
  verified_at: 2026-09-02T17:24:00+07:00
  sha: 0110e2a557c1e5524d7e5a91db39023da23b5df8
  output: |
    bỏ qua: check-live-docs-manifest-synced.sh orphans — doc base ref qua git show; cay tham do la thu muc mktemp khong co .git
    bỏ qua: check-live-docs-manifest-teeth.sh — ve do cua no CHINH LA no; pha no de chung minh no biet do la vong tron

- eval: E6
  run_id: seq-verify-20260902T102400Z-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dkfo_readme_sync
  verified_at: 2026-09-02T17:24:00+07:00
  sha: 0110e2a557c1e5524d7e5a91db39023da23b5df8
  output: |
    README.md: 39 id extracted · manifest: 39
    docs/README_ZH.md: 39 id extracted · manifest: 39
    docs/README_JA.md: 39 id extracted · manifest: 39
    OK: 3 READMEs each list exactly the 39 plugins the manifest registers, every org matching its entry shape

- eval: E7
  run_id: seq-verify-20260902T102400Z-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dkfo_docs_teeth
  verified_at: 2026-09-02T17:24:00+07:00
  sha: 0110e2a557c1e5524d7e5a91db39023da23b5df8
  output: |
    OK: 9/9 ca — 2 doi chung duong + 6 phep pha (readme + claude modes) + 1 ca tu soi harness

- eval: E8
  run_id: seq-verify-20260902T102400Z-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ntlc_resign_wave
  verified_at: 2026-09-02T17:24:00+07:00
  sha: 40381e72771cdcab36472d5fb44dd354b898b655
  output: |
    OK: no feature other than noi-thuoc-tai-lieu-vao-ci carries stale evidence — the re-sign wave has cleared

- eval: E9
  run_id: seq-verify-20260902T102400Z-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ntlc_no_new_checkout
  verified_at: 2026-09-02T17:24:00+07:00
  sha: 0110e2a557c1e5524d7e5a91db39023da23b5df8
  output: |
    OK: năm job còn lại deep-equal với merge-base 1d66bc25
    action pins: at or above the contracted floor at every site

### Re-pin lần 1 — 2026-09-02, do repin-khong-chay-lai-eval chạm scripts/ci/**
run_id: repin-20260902T162209Z-29839
sha: ddea746f4269130b59797ea4236f2ec9a44a6c61 · suites: 8 lệnh exit 0 (làn tuần tự; dòng repin ghi bằng chế độ `write`, mang `prev_sha`)

### Re-pin lần 2 — 2026-09-02, do nhánh thêm hai phép từ chối cho `write` và một guard điểm vào
run_id: rkce-repin-20260902T221339Z
sha: 3c859a4998c875a1032d76ee6529b263474d3b20 · suites: 8 lệnh exit 0

### Re-pin lần 3 — 2026-09-03, do nhánh gom mọi lượt đọc/ghi run-log về một cửa
run_id: rkce-repin-20260903T023014Z
sha: 71449d00fb483e1ef48b95a7da0e4adbb156fb45 · suites: 8 lệnh exit 0

## Sửa đổi sau chữ ký — 2026-09-03

`evals.yaml` của hồ sơ này có khoá **trùng** trong khối `E2`: `expected:` hai lần và
`paths:` ba lần. YAML giữ khoá CUỐI, nên phép đo mà bằng chứng đã ký mô tả là
`exit-propagates` — chế độ đã **RÚT ở vòng 3** của chính hồ sơ này. Bản `expected` đầu
tiên mới là bản đúng, và nó nói thẳng điều đó ("Chế độ tự viết để đóng lỗ ấy đã RÚT ở
vòng 3"), nhưng không bên đọc nào thấy được nó.

Sửa: giữ bản `expected` đầu, bỏ bản sau; gộp ba khối `paths` trùng về một. **Không đổi
lệnh, không đổi kết quả đo, không đụng chữ ký.** Cái đổi là văn bản mà người chấm đối
chiếu với đầu ra — trước sửa nó mô tả một phép đo không chạy.

Phát hiện bởi hội đồng soi ở S4 vòng 3 của `repin-khong-chay-lai-eval` (finding
`measurement`, mức HIGH). Cùng lớp với AC-14 của hồ sơ ấy: một lời khai không có gì
buộc vào vật nó mô tả. Chưa có hàng rào nào bắt khoá YAML trùng trên toàn kho — đã ghi
vào Known limits của hồ sơ đang chạy.

### Re-pin lần 4 — 2026-09-03, do nhánh buộc mọi con số viết tay vào vật nó mô tả
run_id: rkce-repin-20260903T054659Z
sha: c1fae946b9185354407bcf5b080748cadac35488 · suites: 8 lệnh exit 0

### Re-pin lần 5 — 2026-09-03, do vòng soi xác nhận bác một phép sửa và nhánh sửa lại
run_id: rkce-repin-20260903T065011Z
sha: e68cdd61b0e7108753431434216e4343e0117e77 · suites: 8 lệnh exit 0

### Re-pin lần 6 — 2026-09-03, do hợp nhất `origin/main` (33 commit) vào nhánh
run_id: merge-repin-20260903T074652Z
sha: 5b440efdc75859cc700b7564e76b42e6a3e73fd9 · suites: 8 lệnh exit 0

### Re-pin lần 7 — 2026-09-04, do thêm `scripts/acceptance/check-eval-key-dupes.sh` và sửa `scripts/ci/repin-eval-coverage.mjs` cho hồ sơ `hang-rao-doc-nham-loi-thanh-khong-co-gi` — cả hai nằm trong union `paths` của gói này. Mã của gói này không đổi; lane máy 7 lệnh exit 0
run_id: repin-hang-rao-doc-nham-loi-20260903T220954Z
sha: 57c10c950893239c57559730ecdba193e75b0aab · suites: 7 lệnh exit 0
