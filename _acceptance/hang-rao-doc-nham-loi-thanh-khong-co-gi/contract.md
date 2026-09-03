---
schema_version: 1
feature: Hàng rào thôi đọc nhầm "không đo được" thành "không có gì sai"
slug: hang-rao-doc-nham-loi-thanh-khong-co-gi
risk_tier: T2
surfaces: []
design_doc: docs/superpowers/specs/2026-09-03-hang-rao-doc-nham-loi-design.md
status: verified
owner: phanlemanh@gmail.com
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-03T21:36:18Z
---

# Acceptance contract: hang-rao-doc-nham-loi-thanh-khong-co-gi

## Criteria

- AC-1: Given `gitOk("show", "<base>:<path>")` trả `null` cho CẢ "file chưa có ở base" (lành) LẪN "base không phân giải được" (hỏng), và `|| ""` xoá mất khác biệt, When chạy `newlines <base>` với một `<base>` không phân giải được, Then nó **DỪNG ngay đầu chế độ** với thông điệp nêu **đích danh** `<base>`, và KHÔNG đọc tệp nào. Đo hiện trạng 03/09: chạy với một nhánh không tồn tại làm **1674** dòng lịch sử bị xếp là mới và đẻ **25 lỗi giả** — người đọc thấy một trang đỏ không liên quan gì tới thay đổi của mình, và cách duy nhất để biết đó là báo động giả là đọc mã. **[Chế độ so dòng ghim mới TỪ CHỐI một mốc so sánh không phân giải được.]**

- AC-2: Given phép từ chối ở AC-1 dễ bị viết quá tay thành "mọi lượt `show` rỗng đều là lỗi", When chạy `newlines` với một base phân giải được, trên một hồ sơ mà `run-log.jsonl` CHƯA tồn tại ở base ấy, Then mọi dòng của hồ sơ đó tính là **mới** và chế độ chạy bình thường. Đây là **đối chứng dương** của AC-1: không có nó, một phép từ chối chặn tất cả cũng thoả AC-1. **[Sau chốt ấy, "file chưa có ở base" vẫn phải đọc là chưa có.]**

- AC-3: Given `gitOk("diff","--name-only", "<prev>..<sha>") || ""` biến một lỗi git thành "không file nào đổi", nên lần ghim ấy được tính là **đã đo** và không bao giờ có thể bị phát hiện là bỏ sót ô nào, When phép so ấy thất bại, Then `check` **DỪNG** nêu cặp sha, thay vì trả danh sách rỗng. Hai lượt `cat-file -t` ngay phía trên đã xác thực `prev` và `sha`, nên thất bại ở đây là lỗi git thật — không phải trạng thái bình thường. **[Chế độ kiểm chính TỪ CHỐI khi phép so hai mốc thất bại.]**

- AC-4: Given dòng repin lịch sử không có `prev_sha` là **dữ kiện**, không phải lỗi — miễn trừ ấy cố ý, When `check` chạy, Then số dòng rơi vào hạng ấy **in ra** trong dòng tổng kết (hôm nay: 25/52). Một hạng miễn trừ không đếm được là chỗ chôn lỗi lý tưởng: mọi thứ hỏng đều trôi vào đó và không số nào đổi. **[Hạng "ông bà" giữ nguyên nhưng phải ĐẾM ĐƯỢC.]**

- AC-5: Given `gitOk("rev-parse","--is-shallow-repository")` trả `null` khi git lỗi, và `null` khác `"true"` nên chế độ đi tiếp, When lệnh dò ấy thất bại, Then `check` **DỪNG** thay vì giả định kho đầy đủ. Cùng lớp với AC-1 và AC-3: một lượt dò hỏng đang được đọc thành một câu trả lời. **[Lỗi khi dò clone nông không được đọc thành "không nông".]**

- AC-6: Given `yaml.safe_load` giữ khoá **cuối** và im lặng, nên một tệp có khoá lặp vẫn nạp bình thường, When chạy hàng rào mới trên một hồ sơ có khối eval mang cùng một khoá hai lần, Then nó **ĐỎ**. Ca thật đã xảy ra trên hồ sơ **đã ký** `noi-thuoc-tai-lieu-vao-ci`: `expected` hai lần trong khối E2, nên bằng chứng đã ký mô tả một phép đo **đã bị rút**. **[Có hàng rào bắt khoá trùng trong tệp khai ô đo.]**

- AC-7: Given một thông điệp chỉ nói "có khoá trùng" bắt người đọc đi tìm, When hàng rào đỏ, Then thông điệp nêu **hồ sơ · khoá · số dòng**. Và nó đọc **thô**, KHÔNG qua `yaml.safe_load` — dùng chính bộ đọc nuốt khoá để bắt lỗi nuốt khoá là vô nghĩa. **[Hàng rào ấy nêu đích danh vật hỏng, và không dùng bộ đọc đang hỏng.]**

- AC-8: Given ô đo nào CHẠY chính chế độ `check` thì mỗi lần ghim tự đưa nó vào tập «bị chạm» — mọi lần ghim đều ghi vào `_acceptance/**`, kể cả dòng ghim của chính nó — nên `check` không bao giờ xanh được sau một lần hợp nhất, When một ô đo là loại ấy, Then `evals.yaml` khai `self_referential: true` cho nó, và `check` bỏ nó khỏi tập phải-chạy-lại. **Khai, không đoán:** nhận diện bằng cách dò tên script trong lệnh chính là bệnh mà hồ sơ cơ hội này gọi tên ở mục E — nhận diện theo hình dạng chuỗi thay vì theo chủ thể được khai. **Phạm vi miễn trừ, và cái nó đánh đổi — khai thẳng vì phép miễn trừ này TỰ NÓ là một fail-open.** Cờ miễn ô đo khỏi **đúng một** đòi hỏi: "phải có dòng chạy lại XANH tại sha của lần ghim". Nó KHÔNG miễn ô đo khỏi việc chạy. Miễn trừ phải toàn phần chứ không thu hẹp được về "chỉ khi lượt chạm đến từ `_acceptance/**`", vì một thay đổi vào chính mã hàng rào cũng dựng lại đúng vòng tròn ấy: muốn có dòng xanh thì phải chạy `check`, mà `check` lúc đó đang đỏ vì chính ô này chưa có dòng xanh. Đổi lại — và đây là chỗ phải nhìn thẳng — **hàng rào không bao giờ tự buộc chạy lại phép đo của chính nó sau một lần ghim.** Phép bù có tên, không phải lời hứa: (i) ô tự-quy-chiếu vẫn chạy trong **mọi lượt verify** của hồ sơ sở hữu nó, và (ii) một thay đổi vào mã hàng rào làm bằng chứng của hồ sơ ấy **hoá ôi**, nên lưới staleness buộc một lượt verify mới — chính là chỗ ô đo chạy. Lần ghim là sổ sách của máy; lượt verify mới là chỗ phép đo sống. AC-9 giữ cho tập được miễn **đếm được**, để phép bù này không thành lời nói suông. **[Ô đo tự-quy-chiếu được KHAI TƯỜNG MINH, không bị đoán.]**

- AC-9: Given một phép miễn trừ im lặng không phân biệt được với một phép đo bị quên, When `check` chạy, Then dòng tổng kết có thêm **một hạng có tên** cho ô tự-quy-chiếu, kèm số đếm, cạnh các số hiện có. **[Ô được miễn trừ KHÔNG biến mất: nó có tên và có số.]**

- AC-10: Given hướng của phép quên là tiêu chí duy nhất đáng cân khi chọn cơ chế miễn trừ, When một ô đo tự-quy-chiếu KHÔNG khai `self_referential`, Then nó nằm trong tập phải-chạy-lại như cũ và hàng rào **ĐỎ**. Chứng minh việc bế tắc đã hết đòi **hoàn nguyên `paths` của E5/E6** (hồ sơ `repin-khong-chay-lai-eval`) về đủ `_acceptance` — phép thu hẹp 03/09 mua yên tĩnh bằng cách bán độ phủ thật; không hoàn nguyên thì bế tắc chỉ đang bị giấu, không phải đã hết. **[QUÊN khai thì hàng rào ĐỎ, không xanh.]**

- AC-11: Given vòng này chạm `scripts/ci/**` và **thêm một file mới dưới `scripts/acceptance/**`** — vùng nằm trong phạm vi eval của nhiều hồ sơ đã ký, When chạy phép kiểm làn sóng ký lại cho hồ sơ này, Then không hồ sơ đã ký nào khác còn mang bằng chứng có trước code của nhánh. Đo 03/09 trên nhánh trước: chạm `scripts/acceptance/` làm **4** hồ sơ hoá ôi. Không có tiêu chí này thì việc ghim lại là một bước người phải nhớ, và một bước phải nhớ là một bước sẽ quên. **[Nhánh này không để hồ sơ nào khác mang bằng chứng ôi.]**

- AC-12: Given cùng hình dạng `gitOk("diff","--name-only", "<prev>..<sha>") || ""` còn ở chế độ **lập kế hoạch ghim** — chế độ mà người vận hành chạy để biết lần ghim này phải chạy lại những ô đo nào — nên một tham chiếu gõ nhầm in `0 file doi` · `BI CHAM (0): (rong)` rồi thoát 0, tức một chỉ dẫn trông có thẩm quyền bảo *không cần chạy lại gì cả*, When phép so hai mốc ấy thất bại, Then `plan` **DỪNG** nêu cặp tham chiếu. Đo 04/09 trước khi sửa: `plan repin-khong-chay-lai-eval deadbeefdeadbeef HEAD` in đúng hai dòng trên và thoát 0. Tiêu chí này **thêm ở Cổng 2 vòng 1** (owner trả thẻ, chọn nâng phạm vi): nó là **điểm thứ tư** trong bốn điểm mà ma trận thiết kế kê vào diện *sửa*, và thiếu nó thì chính con số «4/9» của Đường đo là sai. **[Chế độ lập kế hoạch ghim TỪ CHỐI khi phép so hai mốc thất bại.]**

## Coverage

Quét trên câu hỏi **"một hàng rào đọc nhầm lỗi thành 'không có gì' ở đâu?"**

- **Trục A — nguồn ngoài được đọc:** tham chiếu git · nội dung git (`diff`/`show`) · tệp
  YAML hồ sơ · trạng thái kho.
  *[CE: 9 điểm gọi `gitOk` đếm được trong lõi + 34 tệp `evals.yaml` — đo 03/09.]*
- **Trục B — cách hỏng:** lệnh lỗi · rỗng hợp lệ · mất mát âm thầm · **không thoả được**.
  *[CE: cả bốn đã xảy ra thật, có số — 25 lỗi giả · 49 file trong diff merge · 1 ca khoá
  trùng trên hồ sơ đã ký · 2 ô bế tắc.]*
- **Trục C — hướng phép hỏng chỉ về:** fail-open · fail-closed · từ-chối-lớn-tiếng.
  *[CE: ngành — JPL Power of Ten quy tắc 7, CWE-252, CWE-390, fail-safe defaults
  (Saltzer & Schroeder 1975); nội bộ — luật kit "một hàng rào thành no-op không lời còn
  tệ hơn không có".]*

48 ô; Core 10 ô (≈20%) → **AC-1…AC-10**. **AC-11 KHÔNG đến từ quét** — nó đến từ mục
«cái giá đã biết» của thiết kế (thêm file dưới `scripts/acceptance/**` làm hồ sơ đã ký
hoá ôi). Ghi rõ để không ai đọc «11 tiêu chí» thành «11 ô Core».

**Hai điểm mù khai thẳng, cả hai đều là "vế xanh không chứng minh gì":**

1. AC-6/AC-7 **sinh ra đã xanh** trên kho — đo 03/09: **0/34** tệp có khoá lặp, vì ca duy
   nhất vừa được vá. Chiều đỏ bắt buộc đến từ fixture.
2. Diện của AC-8…AC-10 **hôm nay rất nhỏ**: **1/530** ô đo còn khai `_acceptance` trần.
   Con số ấy quay về khi hoàn nguyên `paths` — vốn là một phần của AC-10.

## Out of scope

- **Bất biến hằng-đúng** `kê == phá + bỏ qua` ở `scripts/ci/check-gate-guards-job.sh`.
  Nó đúng theo cấu trúc nên không bao giờ đỏ được, nhưng là một dòng assert ở hàng rào
  khác, thuộc hồ sơ `noi-thuoc-tai-lieu-vao-ci`.
- **Bộ quét theo mẫu không phân biệt trích dẫn với khẳng định** — xảy ra ba lần trong một
  ngày ở ba bộ quét độc lập. Cần *chủ thể*, không cần *trạng thái*; chưa có lời giải rõ.
- **`lib/evidence-core.cjs`** — vendored từ kit, nằm trong `t1_skip_globs`. Không chạm.
- **Cắm hàng rào ghim vào CI** — mục tiêu xa mà AC-1…AC-10 dọn đường, không làm ở đây.
- **Bọc lại cả 9 điểm gọi `gitOk`** — bốn chỗ đang đúng (hai đã `die`, hai fail-closed);
  chạm chúng là rủi ro không đổi lấy gì.

## Đường đo

Ngưỡng khai ở `opportunity.md`, mỗi thước một dòng. **Sửa phạm vi so với hồ sơ cơ hội:**
ngưỡng gốc viết "số lượt đọc ngoài trong BA hàng rào phải về 0". Vòng này chỉ chạm MỘT
tệp (`repin-eval-coverage.mjs`) và thêm một hàng rào mới; hai hàng rào kia nằm ngoài phạm
vi owner đã chốt. Giữ nguyên câu chữ cũ là hứa một thứ bằng chứng sẽ không phủ.

| Thước | Số từ đâu | AC nào bảo đảm |
|---|---|---|
| **4/9** điểm gọi `gitOk` trong `repin-eval-coverage.mjs` chuyển từ đọc-nhầm sang từ-chối; 5 điểm còn lại GIỮ, mỗi điểm một lý do (xem ma trận trong design doc) | đếm điểm gọi, ma trận viết trước, 9 dòng | AC-1, AC-3, AC-5, **AC-12** (sửa) · AC-4 (in ra) |
| Mỗi chỗ có **cặp hai chiều**: cây lành → xanh; hỏng đúng nguồn ấy → **ĐỎ nêu đích danh** | fixture của từng ca | AC-1+AC-2 · AC-3 · AC-6+AC-7 · AC-10 |
| Hàng rào ghim chạy trên **bản sao rút gọn** không đẻ lỗi giả | 25 → 0 | AC-1 |
| Ô đo tự-quy-chiếu xanh sau một lần ghim **mà không cần** thu hẹp `paths` | 2 ô | AC-8, AC-9, AC-10 |

## Notes
