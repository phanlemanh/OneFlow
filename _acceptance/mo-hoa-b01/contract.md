---
schema_version: 1
feature: Mở hoá B01 — hạ cánh nhánh đổi định danh kho (ba README, NOTICE, SECURITY, CONTRIBUTING, CLAUDE.md, .github, docker-compose trỏ ảnh của fork, tắt trigger tag desktop-release)
slug: mo-hoa-b01
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [cli, docs]
status: implemented
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-05T07:44:52Z
design_doc: docs/superpowers/specs/2026-09-05-mo-hoa-b01-design.md
---

# Acceptance Contract: mo-hoa-b01

## Context

Ai tự host OneFlow theo README hôm nay nhận về bản upstream: lệnh `docker run` và
`docker-compose.yml` kéo `ghcr.io/tong-io/tongflow`; badge, link tải, Discord, email bảo mật dẫn
về tong-io; gắn tag `v*` cắt bộ cài desktop mang thương hiệu upstream. Nhánh
`b01/open-source-rebrand` (26/08) đã sửa 13 file nhưng bỏ sót badge ở README_ZH/JA và lệnh clone
trong CONTRIBUTING, và trỏ tới một ảnh chưa tồn tại (404, đo 05/09). Hồ sơ này hạ cánh nhánh
theo làn prototype keep, trả ba khoản nợ đó, và đặt một guard trong CI để định danh không trôi
ngược. Đây là B2 ★ của khối kế hoạch lát cắt chứng minh.

Source input: docs/superpowers/specs/2026-09-05-mo-hoa-b01-design.md (§3.1 B2 của thiết kế lat-cat-chung-minh)

## Criteria

- AC-1: Given `scripts/fork/fork-identity.conf` khai `repo=<owner>/<repo>` và kho có remote `origin`, When guard chạy, Then tên ảnh suy ra `ghcr.io/<owner>/<repo>` (chữ thường) bằng đúng giá trị `image:` của `docker-compose.yml` (kèm `:latest`) và có mặt trong lệnh `docker run` của cả ba README; conf lệch đường dẫn của remote thì guard đỏ nêu cả hai giá trị.
- AC-2: Given ảnh của fork chưa được đẩy lên GHCR (chưa có tag `v*`), When người đọc mục Docker của ba README và mở `docker-compose.yml`, Then compose có `build: .` không bị comment cạnh `image:`, và ba README đều đưa lệnh `docker compose up -d --build` làm đường chạy được trước tag đầu tiên.
- AC-3: Given `.github/workflows/desktop-release.yml`, When guard đọc, Then khối `on:` không có `tags:`, job `prepare` mang `if: startsWith(github.ref, 'refs/tags/')`, header có `DISARMED`; và `CLAUDE.md` mục Release checklist chứa `Not currently released` và KHÔNG còn câu tag builds `OneFlow-mac-universal.dmg`.
- AC-4: Given bộ file cộng đồng/hỗ trợ, When guard đọc, Then `.github/FUNDING.yml` vắng, ba issue template và `CONTRIBUTING.md` (kể cả lệnh `git clone`) chứa `github.com/<owner>/<repo>`, và không file nào trong bộ khai trước chứa `discord.gg` hay địa chỉ email `@tongflow.com`.
- AC-5: Given ba README, When guard đọc, Then mỗi README chứa badge CI `<owner>/<repo>/actions/workflows/ci.yml/badge.svg` và badge PyPI `shields.io/pypi/v/<tên gói đọc từ sdk/pyproject.toml>`, và không README nào còn badge `shields.io/github/stars` hay `shields.io/github/v/release`.
- AC-6: Given lớp định danh upstream (regex khai trong guard) quét trên bộ file khai trước và bản miễn trừ `scripts/fork/fork-identity-allow.txt` theo cặp (tệp, mẫu, lý do), When guard chạy, Then mọi hit ngoài bản miễn trừ làm guard đỏ nêu `<file>:<dòng>`, và mọi dòng miễn trừ không còn hit thật cũng làm guard đỏ nêu dòng ấy (bánh cóc hai chiều); trên cây lành guard thoát 0 và in số hit đã miễn trừ.
- AC-7: Given `scripts/fork/check-fork-identity-teeth.sh`, When chạy toàn bộ, Then mọi ca xanh và tổng in là `n/${#CASES[@]}` đối chiếu với độ dài mảng CASES (không in `$pass/$pass`), mỗi ca một token `CASE <tên>: PASS`, mỗi ca đỏ ghim đúng thông điệp của phép kiểm nó phá, tên ca lạ bị từ chối exit 2, `--selftest-fail` in FAIL.
- AC-8: Given ci.yml, check-gate-guards-job.sh và config.yaml sau đấu dây, When chạy check-gate-guards-job.sh ở các mode shape, reachable, teeth, Then guard định danh là một step có tên trong job Acceptance Gate, needle `check-fork-identity.sh` có `RED_TOKEN` riêng («ảnh container — compose có image:», chỉ có trong dòng FAIL) vắng trên cây lành, và mode teeth chứng minh nó đỏ trên cây thăm dò bằng phép kiểm của CHÍNH NÓ (đổi `image:` về upstream), không mượn phép phá của needle khác; `fork_identity` là một khoá trong `feature_loop.suite_keys`.
- AC-9: Given cây đã gộp `main` và nhánh, When chạy **11** lệnh guard tài liệu hiện có (README ↔ manifest ba mode readme/claude/orphans, CLAUDE.md ↔ guard manifest, prefix-docs, action-pins, docker-dryrun, plan-freeze, plan-docs, roadmap-fresh, product-map), Then cả 11 thoát 0 và mỗi lệnh in dòng xanh có tên của nó — việc rebrand không làm trôi thứ các vòng trước vừa siết, và không lệnh nào «vào với 0 lượt thực thi».
- AC-10: Given `NOTICE.md`, `sdk/pyproject.toml` và bản miễn trừ, When guard đọc, Then NOTICE chứa đúng tên distribution đọc từ `[project] name` của pyproject, không còn câu `consumed unchanged from upstream` (câu phủ định «not consumed unchanged» của fork là hợp lệ), VÀ vẫn chứa URL kho upstream `github.com/tong-io/tongflow` làm ghi công AGPL — chỗ nhắc ấy là một dòng miễn trừ có tên trong bản khai, không phải hit; xoá ghi công làm guard đỏ.
- AC-11: Given `_acceptance/mo-hoa-b01/opportunity.md` khai `disposition: keep`, When chạy `scripts/fork/check-prototype-lane.sh mo-hoa-b01`, Then `prototype.base_commit` là tổ tiên của nhánh chính (`main`, hoặc `origin/main` khi checkout không có nhánh cục bộ; không giải được ref nào thì thoát 2 «không kết luận», không phải 1), dòng `Diff: <base>...<tip>` có trong «Bảng nợ kế thừa», và mọi file của `git diff --name-only <base>...<tip>` có đúng một hàng trong bảng; thiếu file nào guard đỏ nêu tên file đó.

## Coverage

Quét bằng morphological-scan (tự dựng trục, không khớp preset). Chân sản phẩm: 13 file của nhánh
`b01` + `git grep` lớp `tong-io|tongflow.com` toàn cây `[SUY-TỪ-REPO: nhánh b01/open-source-rebrand, STATUS.md mục Nợ]`.
Chân ngành: checklist đổi định danh của fork mã nguồn mở có tên — OpenTofu (fork Terraform) và
Forgejo (fork Gitea): URL kho, registry ảnh, tên gói, kênh cộng đồng, địa chỉ báo bảo mật, thông
báo ghi công/thương hiệu `[NGÀNH: OpenTofu, Forgejo]`.

- Trục **vật mang định danh**: tài liệu người đọc (ba README — AC-1, AC-2, AC-5) | tài liệu cộng đồng/hỗ trợ (CONTRIBUTING, SECURITY, NOTICE, ISSUE_TEMPLATE, FUNDING — AC-4, AC-10) | phân phối (docker-compose, lệnh docker trong README — AC-1, AC-2) | phát hành (desktop-release, Release checklist của CLAUDE.md — AC-3) [thước CE: 13 file của nhánh + `git grep -l 'tong-io\|tongflow\.com'` ngoài `src/` — chỉ còn `desktop/README.md`, đã park S5]
- Trục **loại định danh** `[NGÀNH: OpenTofu, Forgejo]`: URL kho (AC-4, AC-5, AC-6) | ảnh container (AC-1, AC-2) | tên gói phát hành (AC-5, AC-10) | kênh cộng đồng và email (AC-4, AC-6) | thương hiệu trong artefact phát hành (AC-3; tên `TongFlow-*` giữ có chủ đích — miễn trừ có lý do) | ghi công và giấy phép (giữ — miễn trừ AC-6) [thước CE: sáu mục của checklist ngành, mỗi mục có ≥1 AC hoặc một dòng miễn trừ có lý do]
- Trục **chiều bảo vệ** (measure-birth): xanh trên vật lành (AC-6, AC-9) | đỏ khi phục hồi upstream (AC-7) | bánh cóc bản miễn trừ (AC-6) | dây CI và răng của răng (AC-8) [thước CE: bốn mục của measure-birth]
- Trục **làn prototype keep**: base_commit là tổ tiên của main | bảng nợ phủ hết diff | baseline bắt buộc ở S4 (AC-11; baseline là việc của workflow S4) [thước CE: ba guard của làn keep trong khuôn opportunity]
- Cross-cutting: ghi công AGPL/NOTICE phải GIỮ — mọi chỗ nhắc tong-io vì ghi công đều là một dòng miễn trừ có lý do, không phải hit.

## Đường đo

- bỏ đường-đo — ngưỡng của cơ hội khai Không đo được; U1 (đường cài đặt) đo tại Cổng Giá trị của skill-1-footage-kho-clip, B10 (entry d-20260905T083000Z-mhb2)

## Out of scope

- **Cắt tag `v*` để ảnh `ghcr.io/phanlemanh/oneflow` tồn tại** — cam kết ra ngoài repo, owner quyết; hồ sơ này chỉ làm tài liệu nói thật rằng ảnh có sau tag đầu tiên (D2).
- Đổi tên `TongFlow-*.dmg/.msi` và URL `app.tongflow.com` trong `desktop-release.yml` — workflow sẽ bị THAY ở S5 (park), không rebrand; hai chuỗi này là miễn trừ có lý do.
- Bản sao luật URL thứ tư trong `sdk/tongflow/engine/plugins.py` — gói nợ fork (park), chạm `sdk/**` = T3.
- Tên plugin `tongflow-*` legacy trong manifest và bảng plugin của README — ADR-0008 cho phép, không phải định danh kho; regex của guard loại `tong-io/tongflow-…`.
- `desktop/README.md` còn nhắc `app.tongflow.com` — desktop 0.1d/S5 (park).
- Sửa `scripts/ci/check-workflow-drift.sh` để chạy KHÔNG neo vẫn xanh — guard thuộc ci-actions-bump, CI chạy có neo nên xanh; đổi nó là mở lại hồ sơ khác.

## Notes

- Làn prototype keep: `prototype.base_commit = 5547aff2` (điểm cắt khỏi main), diffBase của S4 là merge-base sau khi gộp main (`5f1e4db`); baseline chạy bắt buộc.
- `check-workflow-drift.sh` chạy KHÔNG neo đỏ vì nhánh gỡ `tags: v*`; CI chỉ chạy có neo (`ACCEPTANCE_SLUG=ci-actions-bump`, đo 05/09 xanh). Ghi ở đây để người sau không tưởng là hồi quy.
- Sửa `scripts/ci/check-gate-guards-job.sh` (thêm needle) chạm `paths` của cong-tu-canh-minh và lat-cat-chung-minh: hai hồ sơ ấy chạy lại ô đo ở lần re-pin sau merge — đúng luật carry-forward.
- Hai phiên có thể đứng cùng cây (STATUS.md, nghi thức phân vùng): hồ sơ này làm ở worktree riêng `/Users/manh-macmini/dev/oneflow-b2` trên nhánh `b01/open-source-rebrand`.
- **Giới hạn đã biết (đo 05/09, ngoài hợp đồng):** bộ sinh bản đồ của kit (`product-map.mjs`, mọi bản trong cache 2.2.0 → 2.8.0) xếp cơ hội đã quyết `build` vào nhóm «Sắp mở vòng» và hồ sơ khai «Không đo được» vào «Đã giao», trong khi bộ kiểm vendored `scripts/ci/check-product-map.mjs` đòi nhóm «Đang cân nhắc cơ hội» và «Đã giao — chờ phiên nghiệm thu». Sinh lại bằng kit làm bộ kiểm đỏ 5 chỗ; hồ sơ này vá tay đúng mục «Đang làm» của PRODUCT-MAP.md để bộ kiểm xanh. Lệnh tái lập: `node ~/.claude/plugins/cache/acceptance-gate-kit/acceptance-gate/2.8.0/scripts/product-map.mjs --root . && node scripts/ci/check-product-map.mjs`. Không sửa ở đây — bộ kiểm thuộc hồ sơ cong-tu-canh-minh; việc của một hồ sơ hạ tầng cổng khác.
