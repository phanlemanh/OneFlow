---
schema_version: 1
feature: Lát cắt chứng minh — kế hoạch hợp nhất, luật đóng băng và guard
slug: lat-cat-chung-minh
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [cli, docs]
status: implemented
approved_by: Phan Le Manh
approved_at: 2026-09-04
design_doc: docs/superpowers/specs/2026-09-04-lat-cat-chung-minh-design.md
---

# Acceptance Contract: lat-cat-chung-minh

## Context

Bốn nguồn kế hoạch của repo trôi khỏi nhau và hạng mục mới mở nhanh hơn hạng mục đóng (đo
04/09, §1 thiết kế). Hồ sơ này đặt một khối kế hoạch máy-đọc vào docs/roadmap.md, một luật đóng
băng có răng trong job Acceptance Gate, park ba cơ hội, mở cơ hội của lát cắt để owner ký
ngưỡng, và đưa STATUS.md / vision.md về đúng sự thật. Đây là hạng mục mới cuối cùng được nhận
trước băng.

Source input: docs/superpowers/specs/2026-09-04-lat-cat-chung-minh-design.md

## Criteria

- AC-1: Given docs/roadmap.md có khối plan-freeze, When guard đọc, Then đếm được đúng 20 dòng **bảng kế hoạch**, 16 dòng ★, ba bảng, header đủ bốn khoá plan/opened/unlock/checkpoint; và **mẫu số của tỉ lệ là số tính được = dòng bảng kế hoạch + dòng bảng Ngoại lệ**, không phải hằng 20.
- AC-2: Given một thư mục `_acceptance/<slug>/` mới ở trạng thái mở (contract chưa signed-off, hoặc opportunity discovery/build/iterate) với slug ngoài ba bảng, When guard chạy trước gỡ băng, Then thoát 1 với `VIOLATION [plan-freeze] F1: <slug> mở ngoài kế hoạch`.
- AC-3: Given một dòng có slug đánh ✅ mà contract chưa signed-off, When guard chạy, Then thoát 1 với mã F2 nêu đúng slug; và Given một dòng slug `—` không mang chỉ dẫn kiểm đánh ✅, Then guard không đỏ nhưng in dòng đó trong danh sách "tin theo lời".
- AC-4: Given một slug ở bảng Xếp lại sau có thư mục mà opportunity.md không mang `decision: park`, When guard chạy, Then thoát 1 với mã F3 nêu đúng slug.
- AC-5: Given một dòng Ngoại lệ với lý do ngoài {mất-dữ-liệu, bảo-mật, chặn-★} hoặc thiếu ngày/ai quyết, When guard chạy, Then thoát 1 với mã F4; **và Given một dòng Ngoại lệ HỢP LỆ (lý do có tên + ngày + ai quyết) cho một slug đang mở ngoài kế hoạch, When guard chạy, Then thoát 0, slug ấy KHÔNG bị F1, và mẫu số tăng đúng một** — van an toàn của luật đóng băng phải chứng minh được là nó mở, không chỉ là nó chặn.
- AC-6: Given mọi dòng ★ ✅ và ≥ 85% dòng ✅ với contract của mọi slug ★ signed-off, When guard chạy, Then in `GỠ BĂNG`, thoát 0, và một thư mục mở ngoài kế hoạch không còn làm guard đỏ.
- AC-7: Given `PLAN_FREEZE_TODAY` sau ngày checkpoint và header không có `checkpoint_done`, When guard chạy, Then in NOTE mốc tái hoạch và mã thoát không đổi; Given có `checkpoint_done`, Then không in NOTE.
- AC-8: Given khối thiếu marker, thiếu khoá header, sai số cột, hoặc trạng thái ngoài ⬜ ◐ ✅, When guard chạy, Then thoát 1 với mã F0 — fail-closed.
- AC-9: Given ci.yml, check-gate-guards-job.sh và config.yaml sau đấu dây, When chạy check-gate-guards-job.sh ở các mode shape, reachable, suite-keys, teeth, Then guard mới là một step có tên trong job Acceptance Gate, là một suite key, và mode teeth chứng minh nó đỏ trên cây đã phá.
- AC-10: Given check-plan-freeze-teeth.sh, When chạy toàn bộ, Then 15/15 case xanh, mỗi case một mã thoát và một token `CASE <tên>: PASS`; tên case lạ bị từ chối exit 2; `--selftest-fail` in FAIL.
- AC-11: Given ba cơ hội director-v2, timeline-view, staleness-ho-so-thieu-paths mang `decision: park` và PRODUCT-MAP.md sinh lại, When chạy check-product-map.mjs và case răng parked-opportunity, Then checker xanh với ô "Xếp lại sau" = 3 và case răng đỏ đúng chỗ.
- AC-12: Given STATUS.md, vision.md, roadmap.md sau hồ sơ này, When chạy check-plan-docs.sh, Then mọi phép kiểm OK (ngày 04/09, con trỏ, phân vùng phiên, đoạn định vị, S3 de facto, 1.5→B5, 1.6→B7, đoạn tỉ lệ không nháy ngược, không ADR-0013) và guard sổ cái xanh; và **số hồ sơ trong STATUS.md được ĐẾM TỪ CÂY** (số contract mang `status: signed-off`) rồi so bằng — lệch thì FAIL in cả hai số, chứ không grep một hằng số.
- AC-15: Given check-plan-docs-teeth.sh, When chạy, Then bốn ca phá trên bản sao (lùi ngày STATUS.md · trả lại nháy ngược ở đoạn tỉ lệ · xoá đoạn định vị khỏi vision.md · thêm một hồ sơ ký mới mà không sửa STATUS.md) đều làm check-plan-docs.sh đỏ đúng phép kiểm, ca lành xanh, và mỗi ca một mã thoát riêng.
- AC-13: Given guard và teeth, When grep import và chạy guard trong thư mục không có node_modules, Then chỉ dùng `node:` builtins, vẫn chạy được, và guard từ chối tham số lạ với exit 2.
- AC-14: Given dòng A1 mang ghi chú `kiểm: opportunity:skill-1-footage-kho-clip` và đánh ✅ trong khi opportunity ấy chưa có `decision` hoặc chưa có `decided_by`, When guard chạy, Then thoát 1 với mã F2 nêu đúng slug cơ hội; **và Given cơ hội đã đủ ba trường người nhưng mục Ngưỡng còn ít nhất một `[đề xuất]`, When guard chạy, Then vẫn thoát 1 với F2 nêu "còn ngưỡng đề xuất"** — Cổng Đáng có hai vế, chốt vạch và ký tên, thiếu vế nào cũng chưa phải đã ký; Given cả hai vế xong, Then A1 ✅ được nhận mà không vào danh sách "tin theo lời".

## Coverage

- Trục phán quyết: F0 · F1 · F2 (contract) · F2 (opportunity — kiểm A1) · F3 · F4 [thước CE: mỗi phán quyết một case đỏ + case chiều ngược cho F1 (go-bang) và F2 (tin-theo-loi)]
- Trục vòng đời: đóng băng · gỡ băng · mốc tái hoạch · đóng kế hoạch (`closed:` — chưa có case, ghi Known limits)
- Trục đấu dây: step CI · needle guard-của-guard · suite key local · bản đồ sản phẩm
- Trục tài liệu: roadmap · STATUS.md · vision.md · ba opportunity park · cơ hội lát cắt
- Trục chiều đo (thêm sau gap-probe 04/09): mỗi phán quyết phải có **cặp hai chiều trên cùng fixture** — F1 (o-moi ↔ go-bang) · F2-contract (tick-noi-doi ↔ tin-theo-loi) · F2-opportunity (kiem-co-hoi ↔ kiem-co-hoi-de-xuat) · F3 (park-khong-that ↔ clean) · F4 (ngoai-le-tran ↔ ngoai-le-hop-le) · NOTE mốc (checkpoint-note ↔ checkpoint-done) · tài liệu (check-plan-docs-teeth 4 ca ↔ ca lành) [thước CE: ba nửa-xanh này chính là ba lỗ gap-probe tìm ra]
- Bỏ coverage-scan bằng skill — xem entry `descope` d-20260904T121500Z-lcm4 (không gian AC là bảng phán quyết × vòng đời × đấu dây × tài liệu, đã liệt kê đủ ở §5/§9 thiết kế được owner duyệt từng phần)

## Out of scope

- Không hạ cánh D0, b01, các hồ sơ B4–B10; không mở hồ sơ Should.
- Không sửa scripts/pre-merge-check.sh; không chặn nhánh hay docs/superpowers/plans.
- Không phân loại lại cột "Vị trí trên lộ trình" của sổ cái; không thêm mục "Làn D".
- Không kiểm `closed:` bằng răng; không kiểm B10 qua `verdict` (dòng B10 tin theo lời).
- `decided_by`/`decided_at` của ba cơ hội park do owner điền trong commit chỉ-trường-người.

## Notes

- Hồ sơ nội bộ: ngưỡng khai `Không đo được` nên không có section Đường đo; giá trị của lát cắt đo tại Cổng Giá trị của `skill-1-footage-kho-clip`.
- Thiết kế §5 định nghĩa hình dạng khối; §6.3 luật tái hoạch 09/10; §7 quyết định về Vercel AI Gateway (không vào đường ★).
- Guard sổ cái quét mọi `ADR-\d{4}` trong roadmap: khối kế hoạch không nhắc số ADR chưa có trên main.
- Kế hoạch thực thi (S2): docs/superpowers/plans/2026-09-04-lat-cat-chung-minh.md — Task 1–7.
