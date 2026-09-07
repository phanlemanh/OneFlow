---
schema_version: 1
slug: mo-hoa-b01
feature: Mở hoá B01 — hạ cánh nhánh đổi định danh kho (ba README, NOTICE, SECURITY, CONTRIBUTING, CLAUDE.md, .github, docker-compose trỏ ảnh của fork, tắt trigger tag desktop-release)
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-09-05
prototype:
  base_commit: 5547aff2f241b41fcd629ca24b9a4691ee4f3c8f
  disposition: keep
---

## Vấn đề & ai gặp

Người tự host theo README hôm nay nhận về bản UPSTREAM: `docker run` một dòng và
`docker-compose.yml` kéo `ghcr.io/tong-io/tongflow:latest` — bản không có ADR-0011, không có ba
plugin `oneflow-*`. Badge, link tải desktop, Discord, email bảo mật đều trỏ về tong-io; gắn tag
`v*` vừa đẩy ảnh Docker vừa cắt bộ cài desktop mang thương hiệu upstream trỏ vào
`app.tongflow.com`. Bằng chứng: STATUS.md mục «Nợ & cảnh báo» (dòng `[trong kế hoạch B2]`,
đo 17/08), nhánh `b01/open-source-rebrand` (4 commit ngày 26/08, chưa về `main`), B2 của khối kế
hoạch lát cắt (§3.1 thiết kế lat-cat-chung-minh, 04/09): **U1 — đường cài đặt từ README phải
trỏ đúng bản.**

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Bốn commit của nhánh gộp sạch vào `main` sau 504 commit | phải làm lại bằng tay | `git merge main` trong worktree | **Đã thử 05/09: 0 xung đột, merge `ca05d08`** |
| 2 | Ảnh `ghcr.io/phanlemanh/oneflow` tồn tại để README trỏ tới | README hứa một ảnh không có, U1 trượt ngay dòng đầu | `gh api /users/phanlemanh/packages/container/oneflow/versions` | **Đã thử 05/09: 404 — chưa có tag `v*` nào, ảnh CHƯA tồn tại** |
| 3 | Guard tài liệu hiện có (README ↔ manifest, CLAUDE.md ↔ manifest, prefix-docs) vẫn xanh trên cây gộp | nhánh làm trôi thứ vòng dang-ky-fork-openai vừa siết | chạy 11 guard trên cây gộp | **Đã thử 05/09: 11/11 xanh; riêng check-workflow-drift đỏ khi chạy KHÔNG neo — CI chạy có neo (ACCEPTANCE_SLUG=ci-actions-bump) nên xanh** |

## Ngưỡng chết / ngưỡng UAT

Không đo được — vòng hạ cánh mã đã có, không có người dùng cuối riêng; đường cài đặt (U1) đo tại
Cổng Giá trị của cơ hội skill-1-footage-kho-clip (B10), không qua hồ sơ này.

## Kết quả prototype

Dựng ngoài vòng (26/08, phiên aisuite-60, trước khi có hợp đồng), verify local bằng bốn guard
(check-prefix-docs, check-manifest-doc-synced, check-action-pins, check-workflow-drift — theo
thông điệp commit c2f163c). Không có số so ngưỡng vì ngưỡng khai Không đo được. Đo lại 05/09 trên
cây gộp: xem bảng Giả định.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Bốn commit rebrand | nhánh `b01/open-source-rebrand` (6df8f31 · cf4c757 · c2f163c · 9798e23) | triết-lý/logic — đổi định danh, tắt trigger, sửa tài liệu phát hành | có | — |
| Lý do tắt trigger desktop | header DISARMED trong `.github/workflows/desktop-release.yml` (tự đứng, không trỏ ADR-0013 ngoài cây) | triết-lý/logic | có | — |

## Cổng 0

- **decision = build.** Căn cứ: B2 ★ của khối kế hoạch lát cắt đã qua Cổng 1 (owner ký 04/09,
  commit 88e7663); lệnh trong phiên 05/09 «thực thi theo plan này» — máy gõ thay, owner veto được.
- **disposition = keep.** Căn cứ: 13 file đều là tài liệu/cấu hình đã chạy qua bốn guard; dựng
  lại là chép lại. Ba guard của làn keep: diffBase = `prototype.base_commit`; baseline bắt buộc ở
  S4; nhánh cắt từ `main` (`git merge-base --is-ancestor 5547aff main` = đúng).
- **Ngưỡng UAT chốt cùng lúc ký:** Không đo được (dòng trên).

## Thước đo thành công → ứng viên criterion

- Người tự host theo README nhận về ảnh của fork, không phải upstream → AC-1, AC-2.
- Gắn tag `v*` chỉ đẩy ảnh Docker, không cắt bộ cài desktop của người khác → AC-3.
- Không còn đường liên hệ nào dẫn về tong-io ngoài chỗ ghi công → AC-4, AC-5, AC-6.
- Định danh không trôi ngược sau khi merge → AC-7, AC-8.

## Bảng nợ kế thừa (CHỈ khi disposition: keep)

Diff: 5547aff2f241b41fcd629ca24b9a4691ee4f3c8f...9798e23dd63617e606bbbb74db5077a28c7528eb

| Path | Giữ / Dựng lại | Chạm t3_paths? | Ghi chú |
|---|---|---|---|
| `.github/FUNDING.yml` | Giữ (xoá) | không | link tài trợ về business@tongflow.com |
| `.github/ISSUE_TEMPLATE/bug_report.yml` | Giữ | không | link issues về fork |
| `.github/ISSUE_TEMPLATE/config.yml` | Giữ | không | Discord → Discussions của fork |
| `.github/ISSUE_TEMPLATE/feature_request.yml` | Giữ | không | link về fork |
| `.github/workflows/desktop-release.yml` | Giữ | không | gỡ trigger `tags: v*`, header DISARMED tự đứng; tên artefact `TongFlow-*` GIỮ có chủ đích (S5 thay, không đổi tên) |
| `CLAUDE.md` | Giữ | không | Release checklist khớp hành vi thật sau disarm |
| `CONTRIBUTING.md` | **Dựng lại một dòng** | không | dòng 20 `git clone …tong-io/tongflow.git` còn trỏ upstream — nhánh bỏ sót |
| `NOTICE.md` | Giữ | không | khai SDK đã sửa, phát hành `oneflow-sdk` |
| `README.md` | **Giữ + sửa** | không | badge/link đã về fork; mục Docker phải nói thật: ảnh chỉ có sau tag đầu tiên (giả định 2 sai) |
| `SECURITY.md` | Giữ | không | chỉ còn kênh báo riêng của GitHub |
| `docker-compose.yml` | **Giữ + sửa** | không | ảnh của fork; thêm `build: .` để `docker compose up -d --build` chạy được trước tag đầu |
| `docs/README_JA.md` | **Dựng lại phần badge** | không | ba badge đầu (stars/LICENSE/CI) và PyPI còn trỏ tong-io/tongflow — nhánh chỉ sửa README.md |
| `docs/README_ZH.md` | **Dựng lại phần badge** | không | như README_JA |

Không path nào chạm `t3_paths`. Ngoài 13 file: một guard mới `scripts/fork/` + dây CI (không thuộc
nợ kế thừa — là phần hợp đồng thêm để định danh không trôi ngược).

## Out of scope từ khám phá

- **Cắt tag `v*` để ảnh `ghcr.io/phanlemanh/oneflow` tồn tại** — cam kết ra ngoài repo (khó-đảo),
  việc của owner; hồ sơ này chỉ làm tài liệu nói thật về việc ảnh chưa có.
- Đổi tên artefact `TongFlow-*.dmg/.msi` và URL `app.tongflow.com` trong `desktop-release.yml` —
  workflow sẽ bị THAY ở S5 (park), không rebrand.
- Bản sao luật URL thứ tư trong `sdk/tongflow/engine/plugins.py` (gói nợ fork, park; chạm `sdk/**` = T3).
- Tên plugin `tongflow-*` legacy trong manifest và README (ADR-0008: `oneflow-` là quy ước thư mục
  mới, `tongflow-` legacy hợp lệ) — không phải định danh kho.
- `desktop/README.md` còn nhắc `app.tongflow.com` — thuộc desktop 0.1d/S5 (park).
