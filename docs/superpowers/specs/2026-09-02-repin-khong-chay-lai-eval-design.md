# Re-pin chỉ chạy lại suite — làm độ trôi eval tính được và bắt được

**Ngày:** 2026-09-02 · **Slug:** `repin-khong-chay-lai-eval` · **Hạng:** T2

## 1. Lỗ

Nghi thức re-pin chạy lại **bộ lệnh máy** rồi dời `verified_commit`. Nó không chạy
lại ô đo nào — đo toàn kho: **33 dòng `kind:"repin"`, tất cả mang đúng năm khoá**
(`kind · run_id · sha · suites_exit · ts`). Không có chỗ cho kết quả eval, theo cấu
trúc.

Nên sửa một file nằm trong `paths` của một eval **đã ký** thì bằng chứng hồ sơ đó sai,
mà `check-resign-wave` so `sha` nên vẫn xanh và `recheck-evidence.cjs` **không chạy
lệnh nào** (đo: 0 lần `execSync`/`spawnSync`) nên cũng không thấy. Đã xảy ra thật:
`dang-ky-fork-openai` ký với `OK: 7/7 ca`; lệnh đó nay in `9/9`.

Quy mô đo được: 32 hồ sơ đã ký · 14 đã re-pin · 502 eval, **357 khai `paths`** (71%)
phủ 199 file · **40 eval đã bị chạm mà không chạy lại** (sàn dưới). Mẫu 8 ô chạy lại:
**0 đỏ** — nên đây là bằng chứng **nói sai về thứ nó đo**, chưa phải giấu thất bại.

## 2. Vì sao lỗ này không tính lại được — và chốt mở

Dòng repin ghi `sha` **mới**. Nó **không** ghi sha **cũ**. Nên sau khi re-pin, không ai
tính được "lần ghim ấy đã nuốt những thay đổi nào" — thông tin đã mất, không phải bị
bỏ qua.

Chốt: cả hai bên đọc dòng repin — `recheck-evidence.cjs:77` và
`pre-merge-check.sh:1577` — parse JSON rồi lấy `run_id`/`sha`/`suites_exit`. **Trường
lạ được bỏ qua**, nên thêm `prev_sha` là **tương thích ngược**: dòng cũ vẫn hợp lệ,
dòng mới tính được.

## 3. Khuôn: cộng một trường, dựng một bộ đọc, không đụng kit

Nghi thức re-pin sống trong SKILL của gói `feature-loop` — kho này **không sở hữu** nó.
Nên lời giải phía kho không phải "sửa nghi thức" mà là **làm cho việc bỏ qua nó hiện
ra**:

| Vật | Vai |
|---|---|
| `prev_sha` trong dòng repin | dữ liệu còn thiếu; tuỳ chọn, tương thích ngược |
| `repin-plan` | trả lời "lần ghim này buộc chạy lại eval nào" — giao cho người ghim |
| `repin-coverage` | hàng rào: repin CÓ `prev_sha` mà chạm eval nào thì eval đó phải có bản ghi chạy lại mang cùng `run_id` |

Dòng repin **không** có `prev_sha` (33 dòng lịch sử) đi đường **ông bà** — không vi
phạm, nhưng hàng rào **in ra số lượng**, nên con số ấy nhìn thấy được và co lại theo
thời gian thay vì ẩn.

## 4. Vì sao không tự viết bộ so paths-vs-delta

`carry-plan.mjs` của gói feature-loop đã làm đúng việc ấy cho carry-forward vòng-delta:
nhận `--delta-files`, trả `{carriedEvals, rerun, reason}`. Nhưng nó nằm trong cache
plugin, và vòng trước đã đo rằng đường dẫn cache **không ổn định giữa các phiên**
(sau một lượt resume, tool từ chối chính đường dẫn đã dùng được trước đó).

Nên bộ đọc phía kho **tự làm phép giao paths-vs-delta** — chừng hai chục dòng, cùng
luật khớp glob mà `pre-merge-check.sh` đã dùng cho `t1_skip_globs`. Không phải vì
`carry-plan` sai, mà vì một hàng rào CI không được phụ thuộc một đường dẫn cache.

## 5. Cái giá, đo trước

Chạm bất kỳ vùng gated nào làm **3 hồ sơ** hoá ôi (đo 02/09 bằng mô phỏng ở ba thư
mục: `scripts/ci/` → 3 · `scripts/acceptance/` → 4 · `scripts/plugins/` → 3). Sàn là
ba, nên chọn `scripts/ci/` — rẻ nhất và đúng chỗ các hàng rào CI khác đang ở.

Con số này **bác một giả định tôi mang từ vòng trước** (`scripts/ci/**` → 0 hồ sơ):
hai hồ sơ vừa ký không khai phạm vi hẹp nên dùng phạm vi mặc định.

## 6. Cố ý không làm

- **Không tự chạy lại eval.** Hàng rào chỉ *bắt* việc bỏ qua; ai chạy lại và khi nào là
  quyết định của người ghim. Một hàng rào tự chạy 40 eval là một vòng verify đội lốt.
- **Không dọn 40 ô đang nợ.** Chúng đi đường ông bà và co lại ở lần re-pin kế của từng
  hồ sơ. Dọn một lượt là việc riêng, và mẫu 8 ô cho thấy chưa cháy.
- **Không sửa nghi thức trong kit.** Kho không sở hữu nó.
- **Không quyết "đầu ra khác thì làm gì".** Hàng rào đỏ và nêu tên; cập nhật bằng chứng
  đã ký hay mở vòng mới là việc của người.

## 7. Đặc tả UX

Không có. Feature không chạm surface web-UI nào.
