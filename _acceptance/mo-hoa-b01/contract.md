---
schema_version: 1
feature: Mở hoá B01 — hạ cánh nhánh đổi định danh kho (ba README, NOTICE, SECURITY, CONTRIBUTING, CLAUDE.md, .github, docker-compose trỏ ảnh của fork, tắt trigger tag desktop-release)
slug: mo-hoa-b01
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [cli, docs]
status: signed-off
approved_by: Phan Le Manh
approved_at: 2026-09-07
veto_state: dong-bang-chu-ky
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

## Known limits — người ký chấp nhận tại Cổng 2 (07/09/2026)

Chữ người ký gõ, nguyên văn: «Ký». Bảy mục dưới đây nằm NGOÀI phạm vi duyệt ở Cổng 1;
người ký nhận nguyên khuyến nghị của máy trên dòng lệnh.

| # | Điều còn lại | Xử |
|---|---|---|
| 1 | Liên kết cộng đồng trỏ tới trang Thảo luận chưa bật cho kho này, người bấm gặp trang không tồn tại | known-limits |
| 2 | `check-fork-identity.sh` âm thầm quay về conf/allow-list thật khi đường dẫn ghi đè không tồn tại | known-limits |
| 3 | `fixture()` để sót thư mục tạm ở ca có vòng lặp; chỉ probe cuối được dọn | wont-fix |
| 4 | E10/E5 hứa QUAN HỆ (tên gói đọc từ `pyproject`) nhưng ca răng chỉ assert chuỗi vắng | known-limits |
| 5 | E7/E8 ghim những phép kiểm mà lệnh không chạy; verifier chỉ «đạt» bằng cách đọc mã | known-limits |
| 6 | `check-suite-key.sh` khẳng định «executor GỌI script» bằng phép chứa-chuỗi | wont-fix |
| 7 | Ba ca răng còn ghi cứng `phanlemanh/OneFlow` dù đã suy REPO_RAW từ conf | wont-fix |

**Treo — chưa xử, người ký nêu tên:** hình 5. E6 hứa ba dòng miễn trừ tối thiểu CÓ TÊN
(«không phải một con số N») nhưng `case_clean` assert đếm N=3 cộng một tên; hai dòng
`desktop-release` không được ghim, và vế đỏ «miễn trừ tối thiểu vắng» chưa có ca răng.
Mục này đến từ nhóm chưa-phân-loại mà thẻ Cổng 2 không tự đưa ra — nêu tay trong tin mời cổng.

**Một Known limit sinh ra từ chính bản sửa vòng 3:** 18 lời gọi `expect_red` là lệnh cuối
hàm giữ nguyên vì chúng không có bệnh. Ai thêm một lệnh SAU một trong số đó sẽ tái tạo
đúng bệnh nuốt-lỗi đã sửa. Phạm vi sửa cố ý hẹp theo đúng chỗ đo được là hỏng.

**Phán quyết máy là PENDING-JUDGMENT, không phải PASS**, và người ký biết điều đó khi ký.
Nó đến từ vòng 2 khi bước phân loại phạm vi không chạy được, không từ một ô đo nào đỏ:
11/11 ô đo xanh tại `b24bd89`.

## Ký lại — 07/09/2026, sau finding volume

Chữ người ký gõ, nguyên văn: «ký». Chữ ký đầu đứng trên bằng chứng vòng 2 và chưa thấy một
finding high ngoài hợp đồng mà vòng 3 mới lộ ra: đổi khoá volume trong `docker-compose.yml`
làm người tự host mất dữ liệu khi `git pull && docker compose up -d`. Người ký chọn lối
«giữ khoá volume cũ», đã sửa tại `6cb2253` (mục ĐÃ SỬA trong `review-findings.md`). Bảy mục
Known limits và hình 5 treo ở trên giữ nguyên định đoạt. Lúc ký lại, phán quyết máy mới nhất
là REJECT của vòng 3 (toàn chuyện sổ sách sau chữ ký, đã sửa tại `54568bf`); vòng 4 chạy
sau chữ ký này để evidence ghim đúng HEAD cuối — lưới trước merge đòi chuỗi PASS của máy.

## Amendment sau luật chặn xoáy — 07/09/2026

Người ký duyệt trước vòng 7: sau vòng 7, finding TRONG hợp đồng còn lại thành nợ có tên ở đây và
ký; finding NGOÀI hợp đồng thành known-limits có tên; không vòng thêm để vá. Lý do: vòng 4, 5, 6
mỗi vòng lộ thêm lỗi mới của chính phép đo (vòng xoáy guard-của-guard), lối ra là thu phạm vi với
nợ có tên. Vòng 7 không còn finding trong hợp đồng (ba lỗi AC-1/AC-6/AC-11 của vòng 6 đã sửa tại
`0d3c124`); vòng 8 là vòng cực gọn gỡ BLOCKED hạ tầng (agent chết, đỏ dưới tải), mang theo 9 ô
xanh của vòng 7. Bảy mục Known limits ở trên giữ nguyên. Nợ có tên thêm:

- [vòng 4] guard định danh fork đỏ trên mọi fork của contributor (so conf với remote origin) — known-limits
- [vòng 4] `check-prototype-lane.sh` ưu tiên `main` cục bộ trước `origin/main`, main cũ cho FAIL sai — known-limits
- [vòng 5] hai dòng decisions.jsonl mang giờ địa phương gắn hậu tố Z — sử liệu, không sửa lùi
- [vòng 5] hình 3: quan hệ conf → tên ảnh chưa có ca răng đổi conf — known-limits
- [vòng 5] hình 3: tip của dòng Diff trong opportunity.md là hằng, guard không ràng với HEAD — known-limits
- [vòng 6] năm dòng miễn trừ `app.tongflow.com` không ghim ngữ cảnh — known-limits
- [vòng 7] hình 5 treo: ba dòng miễn trừ tối thiểu chỉ đếm N=3 và ghim một tên; vế đỏ «miễn trừ tối thiểu vắng» chưa có ca răng — known-limits
- [vòng 7] `if expect_red …; fi || return 1` — vế `|| return 1` chết, vòng class-matrix không dừng sớm — wont-fix
- [vòng 7] AC-5: răng badge phủ 2/3 điều kiện mỗi README — known-limits
- [vòng 7] `docker compose up -d --build` đo bằng grep toàn file, không neo vào khối lệnh — known-limits
- [vòng 7] «đúng một hàng» đếm bằng grep trên toàn opportunity.md, không giới hạn trong bảng — known-limits
- [vòng 8] SECURITY.md declares private vulnerability reporting as the ONLY route, but it is disabled on the repo — ĐÃ BẬT 08/09 (owner bật Private vulnerability reporting, đo qua API: enabled=true)
- [vòng 8] Every community link now points to GitHub Discussions, which is not enabled (404) — ĐÃ BẬT 08/09 (owner bật Discussions, đo qua API: has_discussions=true, trang trả 200; Known limit #1 hết hiệu lực)
- [vòng 8] CODE_OF_CONDUCT.md still routes enforcement reports to upstream's business@tongflow.com — nợ có tên — CODE_OF_CONDUCT.md không thuộc diện miễn T1 nên sửa là evidence ôi; sửa ở lượt kế cùng việc đưa file vào FILES của guard
- [vòng 8] Teeth suite leaks a scratch dir per extra fixture() call (measured 8 dirs / class-matrix, ~22 per full run) — wont-fix
- [vòng 8] Hình 5 — class-matrix quét đủ 8 mẫu nhưng chỉ trên MỘT file; chiều FILES của lớp không có ma trận, gỡ file khỏi FILES răng vẫn 32/32 — known-limits
- [vòng 8] Hình 2 — fixture tag-trigger-back viết tay đúng khuôn awk/grep của guard; trigger tags dạng flow-style hợp lệ vẫn xanh — known-limits
- [vòng 8] Hình 4 — E8 expected ghim token `RED của check-fork-identity.sh: ảnh container` mà không script nào in; vế đỏ của needle mới chỉ còn mã thoát + dòng tổng — known-limits
- [vòng 8] Hình 4 — nhánh đỏ `ghi công upstream mất khỏi NOTICE.md` không ca răng nào ghim; notice-attribution-gone kích cả hai FAIL nhưng chỉ ghim bánh cóc — known-limits
- [vòng 8] Hình 1 — check-suite-key.sh khẳng định «executor GỌI script» bằng `script not in str(cmd)`; đo chỉ dẫn, không chạy (đã ghi review-findings, wont-fix) — wont-fix
- [vòng 8] Hình 5 — case_clean đếm N=3 + ghim MỘT tên trong khi E6 hứa BA dòng miễn trừ có tên «không phải một con số N» (đã ghi review-findings, chưa phân loại) — new-contract
- [vòng 8] Hình 6 — răng ghim cứng `phanlemanh/OneFlow` ở ba ca dù đã đọc REPO_RAW từ conf (đã ghi review-findings, wont-fix) — wont-fix

Chữ ký «ký» (mục Ký lại ở trên) áp cho evidence vòng 8 theo đúng luật này; `human_signoff` trong
evidence-report ghi `Phan Le Manh 2026-09-07`.
