## Luật riêng của kho OneFlow (chép vào LUAT.md của đợt of1)

Đợt of1 là đợt thử thứ hai của gói `dieu-phoi` trong kit, chạy trên kho neo thứ hai. Mục đích đo: gói chạy
được ở OneFlow mà kho không phải chép hay sửa một dòng mã lõi nào của gói. Mọi chỗ kho phải chỉnh để đợt chạy
được ghi vào Nhật ký với nhãn `lõi` hoặc `kho` (xem README của gói đợt, mục «Đo không sửa lõi»).

1. **Thợ chờ người thì ghi `can-nguoi`.** Mọi lúc thợ dừng để chờ người — câu hỏi, chữ ký cổng, hộp xin quyền
   (kể cả hộp quyền bật lên trong lượt chấm S4) — thợ chạy
   `node <thư mục đợt>/loi/dieu-phoi.mjs yeu-cau can-nguoi --hang <slug> --noi-dung '{"cau":"<một câu>"}'`
   trước khi dừng. Giám sát gom, báo chủ kho tối đa một lần mỗi 30′. Luật mang từ crm (luật 52 của đợt
   `sau-14-10`, luật 22 của `r2`): khuôn `LUAT.md` của gói chưa mang luật này, và hộp quyền của tác tử Workflow
   chưa đo là tới được hook chờ người — đợt này đếm số lần thợ đứng mà không có tệp chờ người.
2. **Một cửa.** Chủ kho chỉ nói với phiên giám sát. Hai ngoại lệ, luôn kèm thẻ dẫn đường của giám sát (link tới
   đúng phiên, dòng lệnh soạn sẵn, chừa chữ quyết): **ký cổng** — lệnh ký khoá không cho máy gọi; **hộp xin
   quyền** — chỉ bấm được ở chính phiên đó.
3. **Luật đóng băng của kế hoạch lát cắt** (`docs/roadmap.md`, khối `plan-freeze`): không hồ sơ đang làm nào
   ngoài kế hoạch. Hàng phát sinh giữa đợt chỉ vào khi là một dòng của kế hoạch, hoặc mang một trong ba lý do
   ngoại lệ có tên (mất-dữ-liệu · bảo-mật · chặn-★) và được chủ kho ghi vào bảng «Ngoại lệ mở giữa lúc băng».
   `node scripts/roadmap/check-plan-freeze.mjs` xanh trước khi đẩy.
4. **Cấm `pkill -f`, `pkill -P`, `killall`** lên `node`, `next`, `pnpm`, `python`. Máy M5 chạy cùng lúc phiên
   của crm và kit. Chỉ `kill <PID>` đúng tiến trình mình đã ghi lại lúc khởi chạy.
5. **Cổng 3000 không phải của thợ.** Máy chủ dev của S4 do lượt chấm dựng (`dev_server` trong
   `_acceptance/config.yaml`, chỉ khi giữ khoá `s4`). Thợ cần xem màn thì chạy `pnpm dev` với cổng khác và tắt bằng
   PID.
6. **Đổi `package.json` hay `pnpm-lock.yaml`** (tệp bảo vệ — gửi `cham-tep` trước) thì `pnpm install` trước khi
   xin khoá `s4`; thiếu gói thì vitest gán lỗi sang ca khác, đỏ giả.
7. **`PRODUCT-MAP.md` không sửa tay.** Xung đột thì gộp `origin/main` rồi vẽ lại bằng
   `node <gói acceptance-gate>/scripts/product-map.mjs --root .` — đúng bản kit đã ghim ở `KIT_SHA` của CI.
8. **Gộp:** không bao giờ `gh pr merge --auto`. Chỉ `gh pr merge <n> --merge --match-head-commit <sha>` (lệ của kho:
   merge commit), và chỉ khi Nhật ký ghi chủ kho cho phép hàng đó.
9. **Không nâng plugin `acceptance-gate`/`feature-loop` giữa một lượt S4.** Gói `dieu-phoi` nâng giữa đợt được: lõi của
   đợt đã chép vào `<thư mục đợt>/loi/`.
10. **Một kiểm tra CI đỏ ở phần PR không chạm:** đối chiếu cùng kiểm tra trên `main`, chạy lại riêng trên máy. `main`
    xanh và máy xanh thì chạy lại job đỏ một lần (`gh run rerun <id> --failed`) trước khi sửa gì.

Tên và giao tiếp.

11. **Tên phiên.** Thợ: `of1·P<n> · <mã hàng> · <trạng thái>`; giám sát: `of1 · Giám sát`, ghim. Trạng thái dùng đúng
    các chữ: `đang làm` · `chờ lượt S4` · `chờ anh ký <cổng>` · `chờ anh bấm quyền` · `xong`.
12. **Nhánh** `<loại>/<slug>`; phiên mở từ chip đổi nhánh `claude/<ngẫu nhiên>` sang tên này trước commit đầu
    (`git branch -m`). **PR** `<mã> · <loại>(<slug>): <câu giao ngắn>`, mở dạng nháp tới lúc trình Cổng Bằng chứng.
13. **Tin giữa các phiên** mở đầu bằng `[<nguồn> → <đích>] <loại>` — `yeu-cau` · `tra-loi` · `bao` · `hoi`.
14. **Từ vựng** theo `CONTEXT.md` của kit, mục «Điều phối – Thợ»: đợt, dãy, hàng, phiên giám sát, phiên thợ, bộ phát
    lịch. Không gọi dãy là «làn».
