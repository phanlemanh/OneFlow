## Trong hợp đồng

- **check-prototype-lane.sh resolves bare `main`, which does not exist on any PR checkout — the teeth case debt-table-missing (and thus the CI step at ci.yml:189) goes red on every pull request**
  file: `scripts/fork/check-prototype-lane.sh:18`
  severity: high
  AC: AC-11
  `MAIN="${PROTOTYPE_LANE_MAIN:-main}"` and `git merge-base --is-ancestor "$base" "$MAIN" 2>/dev/null` use the bare ref name `main`. Git ref DWIM tries refs/heads/main and refs/remotes/main but never refs/remotes/origin/main, so the check only works when a LOCAL branch named main exists. Verified: (1) the real Acceptance Gate job on PR #99 (run 33951234133) checks out `git checkout --progress --force refs/remotes/pull/99/merge` — detached HEAD, no local `main`; (2) a clone of this branch with `origin/main` present (5f1e4db) but no local `main` reproduces it: `bash scripts/fork/check-prototype-lane.sh mo-hoa-b01` → `FAIL: base_commit 5547aff2 không phải tổ tiên của main` exit 1, and `check-fork-identity-teeth.sh --case debt-table-missing` → `FAIL CASE debt-table-missing: đối chứng dương đỏ`. The new ci.yml step `Fork identity guard still has teeth` runs the full teeth suite (including debt-table-missing), so CI will fail on the PR for this very branch and on every future PR. The failure is also mis-attributed: `2>/dev/null` swallows git's `Not a valid object name` and the script reports it as a broken ancestry relation (exit 1) instead of `cannot conclude` (exit 2). Every sibling guard in the repo uses `origin/main` (check-live-docs-manifest-synced.sh:34, check-gate-guards-job.sh:189). Fix: default to `origin/main` (or `git rev-parse --verify main || origin/main`) and treat an unresolvable ref as exit 2. No CI run exists yet for this branch (gh run list shows none for b01/open-source-rebrand), so this has not been caught.
  source: bugs

- **Teeth case image-upstream pins a token that also appears on the healthy tree — its message assertion is vacuous**
  file: `scripts/fork/check-fork-identity-teeth.sh:122`
  severity: low
  AC: AC-7
  `case_image-upstream` does `expect_red image-upstream "ảnh container"`. The guard prints `OK: ảnh container của compose là …` when green and `FAIL: ảnh container — compose có image: …` when red, so `grep -F "ảnh container"` succeeds in both states; only the exit-code half of expect_red still measures anything. check-gate-guards-job.sh already documents this exact trap for the same guard and pins `ảnh container — compose có image:` instead (RED_TOKEN comment). Pin the FAIL phrasing here too so the case proves the guard went red for ITS OWN reason (the class-scan hit on `ghcr.io/tong-io` in docker-compose.yml would otherwise satisfy the case on its own).
  source: bugs

- **Hình dạng 3 — ca `conf-remote-lech` ghim tiền tố `remote=` rỗng trong khi AC-1/E1 hứa guard in CẢ HAI giá trị**
  file: `scripts/fork/check-fork-identity-teeth.sh:130`
  severity: medium
  AC: AC-7
  AC-1 (contract.md:32) và E1 expected (evals.yaml:20-21) hứa khi conf lệch remote guard "đỏ nêu cả hai giá trị". Dòng 130 chỉ grep `'conf lệch remote — conf=ai-do/kho-khac remote='` — giá trị conf được ghim, giá trị remote thì không (chuỗi kết thúc ngay sau `remote=`). Đã tái lập: sửa bản sao guard dòng 83 thành `fail "conf lệch remote — conf=$REPO remote="` (bỏ hẳn `$remote_path`) → `--case conf-remote-lech` vẫn `PASS`. Quan hệ "giá trị remote in ra == đường dẫn remote thật" không được đo dù ca này cố ý chạy trên kho thật (comment dòng 122-123) và giá trị mong đợi tính được ngay tại chỗ (`git remote get-url origin` → `phanlemanh/oneflow`).
  source: measurement

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Docs now route users to GitHub Discussions, but Discussions is disabled on phanlemanh/OneFlow**
  Người dùng thấy gì: Support links in the docs now point to a GitHub Discussions page that isn't turned on for this project, so clicking it leads to a dead page instead of getting help.
  file: `README.md`
  severity: high
  Đề xuất: known-limits

- **CODE_OF_CONDUCT.md still routes conduct reports to upstream's mailbox; file sits outside the guard's declared scope**
  Người dùng thấy gì: The Code of Conduct still lists the original project's email for reporting concerns, not this fork's own contact, so a report sent there would reach the wrong team.
  file: `CODE_OF_CONDUCT.md`
  severity: medium
  Đề xuất: known-limits

- **New CI step introduces first CI-path dependency on PyYAML; branch has never run on GitHub**
  Người dùng thấy gì: This change hasn't been run through the real GitHub checks yet, so there's a chance the automated checks unexpectedly fail the first time a pull request triggers them.
  file: `.github/workflows/ci.yml`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 — E8 ghim chuỗi chỉ tồn tại trong NGUỒN của guard-của-guard, không có trong đầu ra của cả mode shape lẫn mode teeth**
  Người dùng thấy gì: A check meant to prove a safety guard is truly wired into automated testing reports success based on a coincidental text match rather than confirming the guard failed for its own specific reason, so a future accidental weakening of that guard could go unnoticed.
  file: `_acceptance/mo-hoa-b01/evals.yaml`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 3 — ca `clean` đếm N=3 dòng miễn trừ tối thiểu trong khi E6 hứa BA DÒNG CÓ TÊN («không phải một con số N»); vế đỏ `miễn trừ tối thiểu vắng` không có ca răng nào**
  Người dùng thấy gì: One of the automated checks confirms three expected exceptions exist only by counting them, not by confirming they're the right three, so a wrong exception could quietly take the place of a correct one without being caught.
  file: `scripts/fork/check-fork-identity-teeth.sh`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 — check-suite-key.sh khẳng định "executor gọi đúng script" bằng phép chứa-chuỗi trên VĂN BẢN lệnh, không chạy lệnh**
  Người dùng thấy gì: A check meant to confirm the release process really runs the correct verification script only looks for the script's name inside a text description, not whether it's actually executed, so a misconfigured entry could pass this check while doing nothing.
  file: `scripts/fork/check-suite-key.sh`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 6 (gần nhất) — răng ghim cứng định danh fork của tác giả `phanlemanh/OneFlow` trong khi guard và chính răng đã suy REPO từ conf**
  Người dùng thấy gì: Some of the automated tests hardcode this exact project's name and address rather than reading them from configuration, so if the project is ever renamed or re-forked, those specific tests would need manual updates instead of adapting on their own.
  file: `scripts/fork/check-fork-identity-teeth.sh`
  severity: low
  Đề xuất: wont-fix

⚠ Cụm ngoài vùng phủ: 2/10 lỗi rơi vào file không bộ đo nào phủ (CODE_OF_CONDUCT.md, _acceptance/mo-hoa-b01/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.