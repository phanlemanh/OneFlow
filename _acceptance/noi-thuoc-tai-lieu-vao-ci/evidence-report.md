---
schema_version: 2
feature_slug: noi-thuoc-tai-lieu-vao-ci
verdict: PASS
failed_evals: []
reason:
verified_by: phiên VERIFY tươi, chạy TUẦN TỰ (CLASSIFIER-FALLBACK sau BLOCKED vòng 2)
enforcement_mode: strict
bypass_used: false
verified_commit: 40381e72771cdcab36472d5fb44dd354b898b655
human_signoff:
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

### E1 — AC-1

- run_id: `seq-verify-20260902T102400Z-r3`
- verifier: `config:executors.script.gate_guards_job_shape`
- exit_code: `0`
- verified_at: `2026-09-02T10:22:31Z`
- sha: `0110e2a557c1e5524d7e5a91db39023da23b5df8`

```
OK: cả hai guard nằm trong job acceptance-gate; fetch-depth 0, Node 24, hai trigger còn nguyên
```

### E2 — AC-2

- run_id: `seq-verify-20260902T102400Z-r3`
- verifier: `config:executors.script.gate_guards_job_shape`
- exit_code: `0`
- verified_at: `2026-09-02T10:22:31Z`
- sha: `0110e2a557c1e5524d7e5a91db39023da23b5df8`

```
OK: không có continue-on-error / || true / set +e trong job acceptance-gate
```

### E3 — AC-3

- run_id: `seq-verify-20260902T102400Z-r3`
- verifier: `config:executors.script.gate_guards_job_reachable`
- exit_code: `0`
- verified_at: `2026-09-02T10:22:31Z`
- sha: `0110e2a557c1e5524d7e5a91db39023da23b5df8`

```
OK: trigger pull_request không lọc đường dẫn; step và job không mang if: hay needs:
```

### E4 — AC-4

- run_id: `seq-verify-20260902T102400Z-r3`
- verifier: `config:executors.script.gate_guards_job_teeth`
- exit_code: `0`
- verified_at: `2026-09-02T10:22:31Z`
- sha: `0110e2a557c1e5524d7e5a91db39023da23b5df8`

```
OK: 7 lệnh (rút từ .github/workflows/ci.yml) xanh trên cây lành; 5 đỏ trên cây đã phá; 2 bỏ qua CÓ TÊN; cờ rác bị từ chối
```

### E5 — AC-5

- run_id: `seq-verify-20260902T102400Z-r3`
- verifier: `config:executors.script.gate_guards_job_teeth`
- exit_code: `0`
- verified_at: `2026-09-02T10:22:31Z`
- sha: `0110e2a557c1e5524d7e5a91db39023da23b5df8`

```
bỏ qua: …orphans — đọc base ref qua git show; cây thăm dò là mktemp không có .git · bỏ qua: …teeth.sh — vế đỏ của nó CHÍNH LÀ nó
```

### E6 — AC-6

- run_id: `seq-verify-20260902T102400Z-r3`
- verifier: `config:executors.script.dkfo_readme_sync`
- exit_code: `0`
- verified_at: `2026-09-02T10:22:31Z`
- sha: `0110e2a557c1e5524d7e5a91db39023da23b5df8`

```
README.md: 39 id extracted · manifest: 39 (×3 file) · OK: 3 READMEs each list exactly the 39 plugins the manifest registers
```

### E7 — AC-7

- run_id: `seq-verify-20260902T102400Z-r3`
- verifier: `config:executors.script.dkfo_docs_teeth`
- exit_code: `0`
- verified_at: `2026-09-02T10:22:31Z`
- sha: `0110e2a557c1e5524d7e5a91db39023da23b5df8`

```
OK: 9/9 ca — 2 doi chung duong + 6 phep pha (readme + claude modes) + 1 ca tu soi harness
```

### E8 — AC-8

- run_id: `seq-verify-20260902T102400Z-r3`
- verifier: `config:executors.script.ntlc_resign_wave`
- exit_code: `0`
- verified_at: `2026-09-02T10:22:31Z`
- sha: `40381e72771cdcab36472d5fb44dd354b898b655`

```
OK: no feature other than noi-thuoc-tai-lieu-vao-ci carries stale evidence — the re-sign wave has cleared
```

### E9 — AC-9

- run_id: `seq-verify-20260902T102400Z-r3`
- verifier: `config:executors.script.ntlc_no_new_checkout`
- exit_code: `0`
- verified_at: `2026-09-02T10:22:31Z`
- sha: `0110e2a557c1e5524d7e5a91db39023da23b5df8`

```
OK: năm job còn lại deep-equal với merge-base · action pins: at or above the contracted floor at every site
```
