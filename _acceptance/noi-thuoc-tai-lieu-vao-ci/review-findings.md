## Trong hợp đồng

- **exit-propagates skips needles dynamically while its sibling teeth mode requires skips to be declared up front**
  file: `scripts/ci/check-gate-guards-job.sh:425`
  severity: medium
  source: conventions
  AC: AC-2
  The new `exit-propagates` mode runs a green half per needle and, when the command is already non-zero in the probe tree, pushes the needle onto `prop_skipped` (line 425) and continues; the mode then exits 0 as long as `checked > 0` (line 447). The sibling `teeth` mode in the same file takes the opposite stance on purpose — TEETH_SKIP is a STATIC list whose comment reads "Named here rather than quietly absent: a silent exclusion is the exact class this file exists to catch" — and its `ke == pha + bo` invariant is computed against that declared list. Failure scenario: a later change makes six of the seven guard commands fail inside the shallow symlinked probe tree (e.g. a guard starts reading a path that is copied rather than symlinked). `exit-propagates` then measures exit-code propagation for one step, prints `KÊ=7 · ĐO=1 · BỎ QUA=6` and `OK: 1 / 7 …`, exits 0, and CI stays green — the mode has stopped guarding six of the seven steps with no red anywhere. Either make an undeclared green-half failure a `fail` (with an explicit static allow-list mirroring TEETH_SKIP), or floor `checked` at the number of needles minus the declared skips.
  Rationale: AC-2 requires stub-and-execute proof of nonzero exit for TỪNG (every) command line extracted from ci.yml; silently dropping needles into an undeclared runtime skip bucket means not every command line gets that proof.

- **exit-propagates aborts with no message when the script-path grep finds nothing (fail branch is dead code)**
  file: `scripts/ci/check-gate-guards-job.sh:380`
  severity: medium
  source: bugs
  AC: AC-2
  `target=$(printf '%s\n' "$cmd" | tr ' ' '\n' | grep -m1 -E '^scripts/.*\.(sh|mjs|js)$')` runs under the file's `set -euo pipefail`. For a simple assignment, the command's exit status is the status of the command substitution, so when grep matches nothing (exit 1) `set -e` kills the whole script immediately. Line 381's `[ -n "$target" ] || fail "không tìm được script mà lệnh này gọi: $cmd"` is therefore unreachable. The mode exits 1 printing NOTHING, which in a CI log is indistinguishable from a genuine exit-code-propagation failure and gives the reader no way to tell which needle broke. This triggers the moment a `run:` line stops matching the narrow `^scripts/…` shape — an absolute path, `$GITHUB_WORKSPACE/scripts/…`, a `pnpm <script>` wrapper, or a guard moved outside `scripts/`. Verified with a minimal repro: the equivalent snippet exits 1 and never reaches the fail branch. Fix: `target=$(… || true)` before the emptiness test, or `if ! target=$(…); then fail …; fi`.
  Rationale: When this crash fires, the script dies immediately under set -e and stops checking remaining needles, so AC-2's promise of a nonzero-exit proof for TỪNG (every) extracted command line is not actually delivered for the needles never reached.

- **exit-propagates can pass while measuring almost nothing — skips are generated at runtime, not declared**
  file: `scripts/ci/check-gate-guards-job.sh:447`
  severity: medium
  source: bugs
  AC: AC-2
  A needle whose UNSTUBBED green half exits non-zero in the probe tree is appended to `prop_skipped` at runtime (line 424-427) and dropped from the measurement. The only floor afterwards is `[ "$checked" -gt 0 ]` (line 447). The `ke == checked + bo` invariant on line 445 is vacuous by construction: every needle lands in exactly one of the two buckets, so it can never fail. So 6 of 7 needles can silently fall out — missing `node_modules` (check-eval-filters), an unfetched `origin/main` (the orphans needle), or any future guard the symlink probe tree cannot host — and the mode still exits 0 printing `OK: 1 / 7 …`. CI stays green on a measurement that proved the exit-code relation for one step. This is precisely the class the mode's own header says it exists to forbid, and the sibling `teeth` mode gets it right: its `bo` comes from the hardcoded `TEETH_SKIP` array (line ~52), so 'forgot to write a perturbation' and 'deliberately skipped' produce different output. Fix: require skipped needles to appear in a declared list, or fail when `checked < ke` unless the needle is pre-declared.
  Rationale: This directly undermines AC-2's requirement that the stub-based exit-code proof cover every extracted command line, since the only floor left (checked > 0) lets most needles fall out unproven while the mode still reports success.

- **Hình dạng 5 — bất biến đếm `KÊ = PHÁ + BỎ QUA` của chế độ teeth là hằng đúng, không thể bắt "quên viết phép phá"**
  file: `scripts/ci/check-gate-guards-job.sh:349`
  severity: medium
  source: measurement
  AC: AC-5
  `red_cmds` (dòng 302–306) được dựng bằng cách lọc BỎ đúng những needle nằm trong `TEETH_SKIP` (dòng 53) ra khỏi `cmds`. Do đó `pha = ke - |TEETH_SKIP ∩ GUARD_NEEDLES|` và `bo = ${#TEETH_SKIP[@]}`, nên `[ "$ke" -eq "$((pha + bo))" ]` ở dòng 349 luôn đúng theo cấu tạo (chạy thật: `KÊ=7 · PHÁ=5 · BỎ QUA=2`, và 5 là 7−2 chứ không phải một phép đếm độc lập). Nó chỉ đỏ được trong một ca duy nhất: một mục `TEETH_SKIP` không khớp needle nào.

  `_acceptance/noi-thuoc-tai-lieu-vao-ci/evals.yaml:102` (E5/AC-5) lại đặt toàn bộ tiêu chí lên bất biến này: "bất biến đếm là phép đo, không phải lời bình; thiếu nó thì 'quên viết phép phá cho một needle' và 'cố ý bỏ qua' cho cùng một đầu ra xanh". Nó không đo được điều đó: một needle bị quên viết phép phá vẫn nằm nguyên trong `red_cmds`, `pha` không đổi, bất biến vẫn xanh — thứ bắt được ca ấy là vòng lặp chạy đỏ ở dòng 322–336, không phải phép đếm. Ma trận "số assert = số phần tử" mà E5 tuyên bố có, thực chất không được bất biến nào canh.
  Rationale: AC-5 explicitly requires the teeth mode's count invariant to make "quên viết phép phá cho một needle" and "cố ý bỏ qua" produce different outputs, but the invariant is a tautology by construction (pha = ke − |TEETH_SKIP|) and can never distinguish the two, so AC-5's stated Then fails.

- **Hình dạng 5 — chế độ `exit-propagates` tự loại needle lúc chạy, phép đếm không thể đỏ, và không in dòng xác nhận TỪNG lệnh như eval đòi**
  file: `scripts/ci/check-gate-guards-job.sh:445`
  severity: medium
  source: measurement
  AC: AC-2
  Trong vòng lặp qua 7 needle, mỗi lượt hoặc tăng `checked` (dòng 441) hoặc đẩy vào `prop_skipped` rồi `continue` (dòng 425). Vì vậy `ke == checked + bo` ở dòng 445 tăng đúng một trong hai biến mỗi vòng — nó KHÔNG BAO GIỜ đỏ được. Rào chắn duy nhất còn lại là `[ "$checked" -gt 0 ]` (dòng 447): nếu 6/7 needle đỏ sẵn trong cây thăm dò (thiếu node_modules, thiếu `.git`, vv — đúng hai lớp sự cố mà chú thích dòng 431–436 kể là ĐÃ xảy ra), chế độ vẫn in `OK` và vẫn xanh trong khi chỉ đo 1 phần tử.

  `_acceptance/noi-thuoc-tai-lieu-vao-ci/evals.yaml:59` (E2/AC-2) hứa: "stdout ghim, cho TỪNG chuỗi rút từ ci.yml, một dòng xác nhận chuỗi ấy đã thoát KHÁC 0…". Đầu ra thật chỉ có hai dòng tổng: `KÊ=7 · ĐO=7 · BỎ QUA=0` + một dòng OK — không có dòng nào cho từng chuỗi, và tập phần tử được đo là do lúc chạy quyết định chứ không phải ma trận viết trước.
  Rationale: AC-2 requires a nonzero-exit proof for TỪNG (every) command line extracted from ci.yml; the checked==checked+skipped invariant can never go red and no per-command confirmation line is printed, so AC-2's Then is not actually verified for all commands.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Needle → run-line extraction never asserts the "exactly ONE row" invariant ci.yml relies on**
  Người dùng thấy gì: Nếu sau này có người gộp các bước kiểm tra CI lại cho gọn hơn, công cụ đang bảo vệ pipeline có thể âm thầm ngừng xác nhận một vài bước trong khi bảng tổng kết vẫn báo mọi thứ đã được kiểm tra đầy đủ.
  file: `scripts/ci/check-gate-guards-job.sh`
  severity: medium
  Đề xuất: known-limits

- **readme mode dropped its per-file count print, contradicting the guard's own invariant and the signed evidence**
  Người dùng thấy gì: Khi công cụ đối chiếu danh sách plugin trong README với danh mục chính thức chạy thành công, nó không còn in ra số lượng plugin đã đọc được từ mỗi file README như trước, khiến người xem báo cáo khó tự xác minh công cụ có thực sự quét đủ nội dung hay chỉ báo "ổn" một cách hình thức.
  file: `scripts/plugins/check-live-docs-manifest-synced.sh`
  severity: medium
  Đề xuất: new-contract

- **`pnpm build` now carries a POSIX-only inline env assignment**
  Người dùng thấy gì: Lệnh build của dự án hiện dùng cú pháp chỉ chạy được trên máy Mac/Linux; nếu ai đó chạy lệnh build trên máy Windows, lệnh sẽ báo lỗi và không build được.
  file: `package.json`
  severity: low
  Đề xuất: known-limits

- **The diagnostic log named in the exit-propagates failure message is deleted by the EXIT trap before it can be read**
  Người dùng thấy gì: Khi công cụ kiểm tra CI phát hiện lỗi và báo "xem file log để biết chi tiết", file log đó thực ra đã bị xoá trước khi ai kịp mở ra xem, nên người xử lý sự cố không biết chính xác lệnh nào gây lỗi.
  file: `scripts/ci/check-gate-guards-job.sh`
  severity: medium
  Đề xuất: known-limits

- **orphans mode swallows git ls-tree failure and can blame the branch for pre-existing orphan icons**
  Người dùng thấy gì: Công cụ kiểm tra icon plugin "mồ côi" có thể đổ oan cho một nhánh code, báo rằng nhánh đó vừa thêm icon thừa, trong khi thực ra icon ấy đã tồn tại từ trước và nhánh này không hề đụng tới.
  file: `scripts/plugins/check-live-docs-manifest-synced.sh`
  severity: low
  Đề xuất: known-limits

- **build script hard-sets NODE_OPTIONS, discarding any inherited value**
  Người dùng thấy gì: Lệnh build đặt cứng giới hạn bộ nhớ cho quá trình build, nên nếu máy build cần một cấu hình bộ nhớ khác thì cấu hình đó sẽ bị lệnh build ghi đè và bỏ qua.
  file: `package.json`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 — assert "chuỗi 39 có mặt" thay cho QUAN HỆ: dòng đếm id rút-từ-README đã bị xoá khỏi thước, hai eval vẫn đòi nó**
  Người dùng thấy gì: Khi mọi thứ hợp lệ, công cụ đối chiếu README với danh mục plugin chính thức không còn hiển thị số lượng id đã đọc được từ mỗi README, khiến người xem báo cáo khó tự kiểm tra công cụ có thực sự quét đúng nội dung hay không.
  file: `scripts/plugins/check-live-docs-manifest-synced.sh`
  severity: high
  Đề xuất: new-contract

⚠ Cụm ngoài vùng phủ: 2/12 lỗi rơi vào file không bộ đo nào phủ (package.json) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.