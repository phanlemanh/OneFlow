# Bàn giao — phiên 2026-09-07

> Viết cho phiên kế tiếp (tài khoản khác). Đọc file này + `evidence-report.md` mục «Vòng 3»
> là đủ để tiếp; không cần lịch sử hội thoại.

## Đang ở đâu

Kế hoạch lát cắt: **★ 3/16 · tổng 3/20 (15%) · còn băng**. Mốc tái hoạch 2026-10-09.

| Hồ sơ | Trạng thái | Ở đâu |
|---|---|---|
| `mo-hoa-b01` (dòng B2) | ký Cổng 2 rồi, nhưng **vòng 3 verify trả REJECT** | cây `oneflow-b2`, nhánh `b01/open-source-rebrand`, PR #100 (nháp) |
| `noi-thuoc-tai-lieu-vao-ci` | xong hẳn — Cổng Giá trị ký `release` 07/09 | đã merge, PR #105 |
| seed hợp nhất hạ tầng | chờ merge | PR #106 |

## Việc đang dở: `mo-hoa-b01`

Hồ sơ đã `status: signed-off`, người ký Phan Le Manh 07/09, chữ nguyên văn «Ký». Nhưng chữ ký
ấy đứng trên bằng chứng **vòng 2**, và vòng 3 chạy sau đó cho `verdict: REJECT`.

**Vòng 3 đã sửa xong phần máy.** Bốn finding kéo REJECT đều là sổ sách sau chữ ký, không phải
sản phẩm; commit `54568bf` sửa cả năm chỗ và đo lại: E8 exit 0, E9 exit 0, bốn guard exit 0.

### Hai việc chờ người quyết

> **Cập nhật 07/09 (phiên sau):** mục 1 đã xử tại `6cb2253` — người ký chọn «giữ khoá volume cũ»;
> lối `name: tongflow-data` bị loại vì Compose thêm tiền tố project nên không khớp volume cũ.
> Mục 2: đã ký lại tại `cd15d1d`, vòng 4 PASS tại đó nhưng lộ thêm finding đổi tên service (container mồ côi); người ký chọn giữ tên service, sửa tại `b8ca06a`, vòng 5 chạy sau. Vòng 5 PENDING-JUDGMENT (phân loại thiếu mục) và lộ AC-6 high trong hợp đồng (miễn trừ cả dòng) — sửa tại `40dc80c`, người ký khai vòng 6 là vòng chốt. Vòng 6 BLOCKED (agent E8 chết; E8 tay exit 0) + ba lỗi trong hợp đồng AC-1/6/11 — sửa tại `0d3c124`; người ký duyệt luật chặn xoáy: vòng 7 là vòng cuối, còn gì thành nợ có tên rồi ký. Lúc viết dòng này `github.com:443` lại đứt, `api.github.com` thông.

1. **Đổi tên volume trong `docker-compose.yml` làm người tự host mất dữ liệu** (severity high,
   NGOÀI hợp đồng, **chưa từng được người ký xem** — vòng 2 không phân loại được nên nó chưa
   bao giờ lên bàn). Service `tongflow` → `oneflow` và hai volume `tongflow-data` /
   `tongflow-plugins` → `oneflow-data` / `oneflow-plugins`. Ai đang tự host mà
   `git pull && docker compose up -d` sẽ nhận hai volume RỖNG: cơ sở dữ liệu SQLite, tệp tải
   lên, `/data/settings.json` (mọi khoá API nhập trong app) và các venv plugin nằm lại volume
   cũ, app lên như bản cài mới, không lỗi không cảnh báo. Guard nhận diện fork chỉ canh chuỗi
   `image:`, không chạm tên volume — chỗ này không ai canh.
   Hai lối: giữ tên volume cũ bằng một dòng `volumes: { oneflow-data: { name: tongflow-data } }`,
   hoặc nhận known-limits kèm lệnh di trú trong ba README. Phiên trước khuyên **sửa**.
2. **Chữ ký cần xác nhận lại** sau khi xử mục trên, kèm một vòng 4 để có `verdict: PASS` —
   lưới trước merge đòi đúng chuỗi `PASS`, chữ ký người KHÔNG thay được (xem
   `scripts/pre-merge-check.sh:1297`).

### Tám finding còn lại (đã xác nhận, chưa xử)

| Mức | Nơi | Nội dung |
|---|---|---|
| medium | `scripts/fork/check-fork-identity.sh` | im lặng quay về conf/allow-list thật khi đường dẫn ghi đè không tồn tại |
| medium | `CLAUDE.md` | `workflow_dispatch` trên một tag ref vẫn cắt được Release công khai mang nhãn thượng nguồn |
| medium | `check-fork-identity-teeth.sh` | Hình 5 — E6 tuyên «ba dòng miễn trừ CÓ TÊN», `case_clean` chỉ assert một con số N |
| medium | `check-fork-identity-teeth.sh` | Hình 3 — E5/E10 hứa QUAN HỆ với `sdk/pyproject.toml`, ca răng chỉ assert chuỗi vắng |
| medium | `_acceptance/mo-hoa-b01/evals.yaml` | Hình 5 — E7/E8 ghim phép kiểm mà không lệnh executor nào chạy |
| low | `check-prototype-lane.sh` | báo cứng «not an ancestor» khi base commit chỉ là không phân giải được |
| low | `check-fork-identity-teeth.sh` | rò thư mục tạm mỗi lần re-fixture trong ca nhiều mẫu |

Bảy mục ngoài hợp đồng người ký đã duyệt ở lượt ký nằm trong `contract.md` mục Known limits.

## Cạm bẫy phiên này vấp — đừng lặp

1. **Ký xong là NĂM chỗ sổ sách phải sửa cùng lượt**, nếu không bốn guard trong cổng đỏ ngay và
   một vòng verify 39 agent trả REJECT toàn chuyện sổ sách. Danh sách đủ ở
   `evidence-report.md` mục «Vòng 3» và trong trí nhớ dài hạn.
2. **Chế độ `teeth` của `check-gate-guards-job.sh` dừng ở needle ĐẦU khi cây không lành**, nên
   bộ răng của chính feature không bao giờ được chạy. Vế xanh của nó là giả cho tới khi mọi
   guard khác xanh.
3. **`run_log_write_failed: true`** ở vòng 3 — bộ tổng hợp tính xong không ghi sổ chạy. Mười
   một dòng của vòng 3 do phiên ghi tay, có đánh dấu.
4. **Bộ kiểm bản đồ không đọc `uat-session.md`**, nên nó nói bản đồ khớp trong khi bản đồ chưa
   ghi chữ ký Cổng Giá trị. Nợ ghi trong `_acceptance/noi-thuoc-tai-lieu-vao-ci/opportunity.md`.
5. **Kế hoạch đang băng**: không mở `_acceptance/<slug>/` mới, guard F1 đỏ ngay. Khối Ngoại lệ
   chỉ nhận ba lý do có tên. Ý mới ghi thành một dòng ở bảng «Xếp lại sau».
6. **`github.com:443` từng đứt** giữa phiên trong khi `api.github.com` vẫn thông — `gh` chạy
   được mà `git push` treo 75 giây. Không phải hộp cát; đo bằng `curl` hai đích.

## Chạy lại vòng 4 thế nào

Tham số đã dựng sẵn: `_acceptance/mo-hoa-b01/s4-args.json` (11 ô đo, 8 lệnh lane máy, không có
ô hội đồng nào). Đổi `round` thành 4, tính lại `diffBase` bằng
`git merge-base origin/main HEAD`, rồi gọi workflow `acceptance-verify.js` của
feature-loop 2.8.0. Ba điều đã đo:

- **`scriptPath` phải nằm trong thư mục đọc được** — đường dẫn trong bộ nhớ đệm plugin bị từ
  chối; chép file ra thư mục phiên trước.
- **`contractPath` phải trỏ đúng** — thiếu nó là `triageFailed`, và đó chính là thứ làm vòng 2
  dừng ở `PENDING-JUDGMENT`.
- **`runBaseline: false`** — owner đã tắt; mẫu s4-args cũ hay tự bật lại.

Chạy `dryRun: true` trước, rẻ và bắt lỗi tham số mà không tốn agent nào.

## Việc dọn nhà chưa làm (đã rà, chờ lệnh)

- **24GB rác build** trong `.next` của ba cây, gitignored, `pnpm build` sinh lại. Cây chính
  chiếm 19GB, riêng thư mục standalone 15GB.
- **Hai cây tạm** dưới `.claude/worktrees` chiếm 10GB, cả hai sạch, commit của chúng đã có
  nhánh trên kho giữ.
- **Chín nhánh trên máy và tám nhánh trên kho đã merge** vẫn còn nguyên.
- **Ba PR phụ thuộc (#91, #101, #102) đỏ cùng một lý do cấu trúc**: chạm tệp ngoài diện miễn
  trừ T1 mà không mang hồ sơ. Cái cũ nhất treo từ 01/09. Cần owner chọn lối.
- **Cây `oneflow-roadmap`** không còn việc gì theo git, nhưng trí nhớ ghi thí điểm dây chuyền
  của nó đang chạy — hỏi trước khi gỡ.

## Cập nhật cuối 07/09 (phiên tài khoản hai)

Đã làm: volume + service compose giữ tên cũ (`6cb2253`, `b8ca06a`); AC-6 miễn trừ ghim một
mention (`40dc80c`); AC-1/6/11 (`0d3c124`); bộ răng 32 ca. Vòng 4–8: xem evidence-report.md.
Người ký duyệt luật chặn xoáy; contract có mục Amendment với 22 nợ có tên; evidence điền
chữ ký và hai mục rỗng. Vòng 8 verdict `PASS`.

Còn lại cho owner: PR #100 vẫn là nháp — chuyển sang sẵn sàng và merge là quyết định của owner.
Nợ có tên nằm ở contract mục Amendment; hai lỗi bộ tổng hợp kit (run-log không tự ghi, Known
limits/Ngoài hợp đồng rỗng) cần sửa ở kit, không ở hồ sơ.

**08/09:** owner đã bật Discussions và Private vulnerability reporting (đo qua API), PR #100 chuyển sang sẵn sàng, mergeStateStatus CLEAN, 6/6 job xanh tại `787d03b`. Merge là quyết định của owner.
