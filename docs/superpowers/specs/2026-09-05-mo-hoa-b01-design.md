# Mở hoá B01 — hạ cánh nhánh đổi định danh kho (B2 của lát cắt chứng minh)

Ngày: 2026-09-05 · Hồ sơ: `_acceptance/mo-hoa-b01/` · Tier: T2 (chạm `.github/**`,
`docker-compose.yml`) · Làn: prototype **keep** (code có trước hợp đồng) · Đường brainstorm:
**bounded** — luồng đã tồn tại trên nhánh `b01/open-source-rebrand`, việc là hạ cánh và trả nợ.

## 1. Vấn đề

Ai tự host OneFlow theo README hôm nay nhận về bản upstream (`ghcr.io/tong-io/tongflow`),
tức bản không có ADR-0011 và không có ba plugin `oneflow-*`. Badge, link tải, Discord, email
bảo mật đều dẫn về tong-io. Gắn tag `v*` cắt bộ cài desktop mang thương hiệu upstream trỏ vào
`app.tongflow.com` cùng lúc với việc đẩy ảnh Docker. Nhánh `b01` (26/08) đã sửa 13 file nhưng
chưa về `main` và bỏ sót ba chỗ (§4).

## 2. Mục tiêu một câu

Sau hồ sơ này, đường cài đặt từ README trỏ đúng bản của fork, gắn tag chỉ đẩy ảnh Docker, mọi
đường liên hệ dẫn về fork trừ chỗ ghi công — và một guard trong CI giữ cho định danh không trôi
ngược.

## 3. Quyết định thiết kế

| # | Quyết định | Phương án bị loại | Vì sao |
|---|---|---|---|
| D1 | Gộp `main` vào nhánh rồi hạ cánh nguyên bốn commit (keep) | rebase / cherry-pick / dựng lại | 0 xung đột khi merge (đo 05/09); dựng lại là chép lại 13 file |
| D2 | Tài liệu **nói thật** về ảnh Docker: ảnh chỉ có sau tag `v*` đầu tiên; `docker-compose.yml` thêm `build: .` để `docker compose up -d --build` chạy được ngay | (a) cắt tag ngay để ảnh tồn tại; (b) để README như nhánh | (a) là cam kết ra ngoài repo — owner quyết, ngoài phạm vi; (b) là README hứa một ảnh 404 (đo 05/09) |
| D3 | Một guard `scripts/fork/check-fork-identity.sh` quét **lớp** định danh upstream trên bộ file khai trước, miễn trừ khai trước theo cặp (tệp, mẫu, lý do), bánh cóc hai chiều | danh sách chuỗi cấm; hoặc không guard | measure-birth §4: phủ định phổ quát chỉ chứng được bằng liệt cái được phép; không guard thì định danh trôi ngược im lặng như đã trôi 17/08 → 26/08 |
| D4 | Tên kho suy từ `scripts/fork/fork-identity.conf` (`repo=phanlemanh/OneFlow`) và **đối chiếu** với `git remote get-url origin` khi có git; ảnh = `ghcr.io/<owner>/<repo>` chữ thường | đọc badge README làm nguồn | nguồn phải độc lập với vật được đo; conf là bản khai trước, remote là thực tại |
| D5 | Guard vào job Acceptance Gate cùng răng; thêm needle + phá-thử vào `check-gate-guards-job.sh` (khuôn AC-9 của lat-cat-chung-minh) | chỉ chạy lúc verify | guard không trong CI là guard chỉ chạy khi ai đó gõ (đo 31/08) |
| D6 | Giữ nguyên `TongFlow-*` và `app.tongflow.com` trong `desktop-release.yml` (miễn trừ có lý do) | rebrand workflow | workflow sẽ bị THAY ở S5, không đổi tên (quyết định 26/08, commit c2f163c) |

## 4. Nợ kế thừa của nhánh (đo 05/09)

1. `docs/README_ZH.md`, `docs/README_JA.md`: bốn badge đầu (stars, LICENSE, CI, PyPI) còn trỏ
   `tong-io/tongflow` và gói `tongflow` — nhánh chỉ sửa README.md. → dựng lại phần badge.
2. `CONTRIBUTING.md:20`: `git clone https://github.com/tong-io/tongflow.git`. → trỏ fork.
3. Ảnh `ghcr.io/phanlemanh/oneflow` **chưa tồn tại** (404, không có tag). → D2.

## 5. Guard: `scripts/fork/check-fork-identity.sh`

- Gốc cây: `FORK_IDENTITY_ROOT` (răng dùng) hoặc `git rev-parse --show-toplevel`, hoặc `pwd`.
- Danh sách file khai trước (thiếu file → exit 2 có tên, không kết luận): `README.md`,
  `docs/README_ZH.md`, `docs/README_JA.md`, `docker-compose.yml`, `CONTRIBUTING.md`,
  `SECURITY.md`, `NOTICE.md`, `CLAUDE.md`, ba file `.github/ISSUE_TEMPLATE/*.yml`,
  `.github/workflows/desktop-release.yml`, `sdk/pyproject.toml` (chỉ để đọc tên gói).
- Lớp định danh upstream (regex): `github\.com/tong-io/tongflow([^-a-z0-9]|$)` ·
  `ghcr\.io/tong-io` · `discord\.gg` · `tongflow\.com` · `pypi\.org/project/tongflow/` ·
  `shields\.io/[^ )"]*tong-io` · `TongFlow-(mac|win)` · `img\.shields\.io/pypi/v/tongflow`.
- Bản miễn trừ `scripts/fork/fork-identity-allow.txt`, mỗi dòng `file|regex|lý do`.
  Hit ngoài bản khai → `FAIL: định danh upstream ngoài miễn trừ — <file>:<dòng>`.
  Dòng miễn trừ không còn hit → `FAIL: miễn trừ ôi — <file>|<regex>` (bánh cóc chiều hai).
- Khẳng định dương (mỗi cái một dòng OK/FAIL có tên):
  - **ảnh container**: `image:` trong compose == `ghcr.io/<owner>/<repo>:latest`; compose có
    `build: .` không bị comment; ba README chứa chuỗi ảnh và chứa `docker compose up -d --build`.
  - **trigger desktop**: khối `on:` của `desktop-release.yml` không có `tags:`; job `prepare` mang
    `if: startsWith(github.ref, 'refs/tags/')`; header có `DISARMED`.
  - **checklist phát hành**: `CLAUDE.md` có `Not currently released`, không có
    ``builds `OneFlow-mac-universal.dmg` ``.
  - **kênh cộng đồng**: `.github/FUNDING.yml` vắng; ba issue template và CONTRIBUTING chứa
    `github.com/<owner>/<repo>` (không phân biệt hoa thường).
  - **badge**: ba README chứa `<owner>/<repo>/actions/workflows/ci.yml/badge.svg` và
    `shields.io/pypi/v/<tên gói từ pyproject>`; không README nào chứa `shields.io/github/stars`
    hay `shields.io/github/v/release`.
  - **NOTICE**: chứa tên gói đọc từ `sdk/pyproject.toml`; không chứa câu `consumed unchanged from upstream` (câu phủ định của fork hợp lệ); VẪN
    chứa URL kho upstream `github.com/tong-io/tongflow` (ghi công AGPL) — in
    `OK: ghi công upstream còn ở NOTICE.md`; dòng miễn trừ tương ứng là một trong ba dòng miễn trừ
    tối thiểu guard in tên trên cây lành (gap-probe 05/09 P1: ghi công phải có phép đo, không chỉ là
    cross-cutting trong Coverage).
  - **conf ↔ remote**: có git và có `origin` → `repo` trong conf phải bằng đường dẫn của remote
    (không phân biệt hoa thường); lệch → FAIL nêu cả hai.

## 6. Răng: `scripts/fork/check-fork-identity-teeth.sh`

Mảng `CASES`; mỗi ca: chép bộ file khai trước vào `mktemp`, chạy đối chứng dương (guard xanh)
rồi phá ĐÚNG MỘT biến, đòi guard đỏ VÀ in đúng token ghim (gap-probe 05/09 P1: ca phá hai biến
ghim một thông điệp chỉ chứng được một nửa). Ca lạ → exit 2; `--selftest-fail` in FAIL; tổng in
`n/${#CASES[@]}` (không in `$pass/$pass`). **27 ca**, một khẳng định một ca:

| Nhóm | Ca | Biến bị phá | Token ghim |
|---|---|---|---|
| lành | `clean` | — | thoát 0, in ba dòng miễn trừ tối thiểu có tên |
| ảnh | `image-upstream` | `image:` compose → upstream | `ảnh container` |
| ảnh | `conf-remote-lech` | `repo=` trong conf | `conf lệch remote` + cả hai giá trị |
| ảnh | `readme-image-missing` | xoá chuỗi ảnh khỏi lệnh docker run, từng README | `<README> thiếu chuỗi ảnh` |
| compose | `compose-no-build` | comment `build: .` | `compose thiếu build:` |
| compose | `readme-no-build-cmd` | xoá `docker compose up -d --build`, từng README | `<README> thiếu docker compose up -d --build` |
| phát hành | `tag-trigger-back` | thêm `tags: ["v*"]` dưới `push:` | `desktop-release còn trigger tags` |
| phát hành | `prepare-if-gone` | xoá `if: startsWith(github.ref, 'refs/tags/')` | `desktop-release prepare thiếu if tags` |
| phát hành | `disarmed-header-gone` | xoá chữ `DISARMED` | `desktop-release thiếu header DISARMED` |
| phát hành | `claude-not-released-gone` | xoá `Not currently released` | `Release checklist thiếu Not currently released` |
| phát hành | `claude-builds-line-back` | thêm lại câu tag builds `OneFlow-mac-universal.dmg` | `Release checklist nói ngược hành vi` |
| cộng đồng | `discord-back` | thêm `discord.gg/...` vào CONTRIBUTING | `định danh upstream ngoài miễn trừ — CONTRIBUTING.md:<dòng>` |
| cộng đồng | `email-back` | thêm `security@tongflow.com` vào SECURITY | `định danh upstream ngoài miễn trừ — SECURITY.md:<dòng>` |
| cộng đồng | `funding-back` | tạo lại `.github/FUNDING.yml` | `FUNDING.yml còn đó` |
| cộng đồng | `clone-upstream` | lệnh clone → `tong-io/tongflow.git` | `định danh upstream ngoài miễn trừ — CONTRIBUTING.md:<dòng>` |
| cộng đồng | `issue-template-not-fork` | xoá URL fork khỏi từng template | `<template> không trỏ fork` |
| badge | `badge-upstream` | trả badge stars vào README_ZH | `badge stars/release còn ở docs/README_ZH.md` |
| badge | `release-badge-back` | thêm badge `github/v/release` vào README | `badge stars/release còn ở README.md` |
| badge | `ci-badge-gone` | xoá badge CI, từng README | `<README> thiếu badge CI của fork` |
| badge | `pypi-badge-wrong-dist` | `pypi/v/oneflow-sdk` → `pypi/v/tongflow` | `badge PyPI không trỏ oneflow-sdk` (tên đọc từ pyproject) |
| lớp | `hit-outside` | thêm URL upstream vào SECURITY | `định danh upstream ngoài miễn trừ — SECURITY.md:<dòng>` |
| lớp | `class-matrix` | mỗi mẫu regex một lượt chèn vào một file lành, 8/8 | `định danh upstream ngoài miễn trừ — <file>:<dòng>` cho từng mẫu, tổng `8/8 mẫu` |
| lớp | `stale-exemption` | thêm dòng miễn trừ không có hit | `miễn trừ ôi — README.md|business@tongflow\.com` |
| NOTICE | `notice-dist-gone` | xoá `oneflow-sdk` | `NOTICE không nêu oneflow-sdk` |
| NOTICE | `notice-unchanged-back` | thêm lại `consumed unchanged from upstream` | `NOTICE còn consumed unchanged from upstream` |
| NOTICE | `notice-attribution-gone` | xoá URL kho upstream khỏi NOTICE | `miễn trừ ôi — NOTICE.md|github\.com/tong-io/tongflow` |
| dây | `suite-key-dangling` | đổi tên khoá `executors.script.fork_identity` trong bản sao config | `suite key fork_identity không trỏ executor nào` |
| prototype | `debt-table-missing` | xoá hàng `docs/README_JA.md` khỏi bản sao opportunity | `thiếu hàng nợ cho docs/README_JA.md` |

## 7. Guard làn prototype: `scripts/fork/check-prototype-lane.sh <slug>`

Đọc `_acceptance/<slug>/opportunity.md`: `disposition: keep` ⇒ `base_commit` phải là tổ tiên của
`main`; dòng `Diff: <base>...<tip>` trong «Bảng nợ kế thừa» ⇒ mọi file của
`git diff --name-only <base>...<tip>` phải có một hàng trong bảng; thiếu → FAIL nêu tên file.

## 8. Dây CI và răng của răng

- `ci.yml` job Acceptance Gate: hai step `Fork identity stays the fork's` (chạy
  `bash scripts/fork/check-fork-identity.sh`) và `Fork identity guard still has teeth`.
- `check-gate-guards-job.sh`: thêm needle `check-fork-identity.sh` + `RED_TOKEN` «ảnh container»
  + chép thêm vào cây thăm dò (`docker-compose.yml`, `CONTRIBUTING.md`, `SECURITY.md`,
  `NOTICE.md`, `.github/ISSUE_TEMPLATE`, `.github/workflows/desktop-release.yml`,
  `sdk/pyproject.toml`) + một phá-thử riêng (đổi `image:` về `ghcr.io/tong-io/tongflow`).
- `_acceptance/config.yaml`: khoá **`executors.script.fork_identity`** =
  `bash scripts/fork/check-fork-identity.sh` là khoá mà `feature_loop.suite_keys` trỏ tới (guard
  chạy trong MỌI vòng verify về sau); các khoá `executors.script.mhb_*` là ô đo của riêng hồ sơ này.
- `scripts/fork/check-suite-key.sh <khoá> <tên script>`: đọc config theo cấu trúc (khuôn
  `check-plan-suite-key.sh` của lat-cat-chung-minh) — khoá phải nằm trong `feature_loop.suite_keys`
  VÀ `executors.script.<khoá>` phải tồn tại VÀ lệnh của nó gọi đúng script; thiếu vế nào đỏ nêu vế đó
  (gap-probe 05/09 P2: grep chuỗi-có-mặt không chứng được quan hệ).

## 9. Không làm

Xem «Out of scope» của hợp đồng: cắt tag để có ảnh (owner), rebrand `desktop-release.yml` (S5),
URL thứ tư trong engine (T3, gói nợ fork), tên plugin `tongflow-*` legacy (ADR-0008),
`desktop/README.md` (S5).

## 10. Rủi ro

- `check-workflow-drift.sh` chạy KHÔNG neo đỏ vì gỡ `tags:` — CI chạy có neo
  (`ACCEPTANCE_SLUG=ci-actions-bump`), xanh. Ghi Notes, không sửa guard của hồ sơ khác.
- Sửa `check-gate-guards-job.sh` chạm `paths` của cong-tu-canh-minh và lat-cat-chung-minh →
  hai hồ sơ ấy chạy lại ô đo ở lần re-pin sau merge (đúng luật, không lách).
