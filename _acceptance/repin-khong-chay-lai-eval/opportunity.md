---
schema_version: 1
slug: repin-khong-chay-lai-eval
feature: Re-pin chỉ chạy lại suite, không chạy lại eval — bằng chứng đã ký nói sai về thứ nó đo
owner: Manh
stage: discovery
decision:
decided_by:
decided_at:
prototype:
  base_commit:
  disposition:
---

# Cơ hội: một hồ sơ đã ký có thể tuyên một đầu ra mà lệnh của nó không còn sinh ra

## Vấn đề & ai gặp

Nghi thức re-pin tồn tại để trả lời: *"code đổi sau khi verify — bằng chứng còn dùng
được không?"* Nó trả lời bằng cách chạy lại **bộ lệnh máy** (8 suite) rồi dời
`verified_commit` tới sha mới.

Nó **không** chạy lại ô đo nào. Đo trên toàn kho — 33 dòng `kind:"repin"`, **tất cả**
mang đúng năm khoá:

```
kind · run_id · sha · suites_exit · ts
```

Không có chỗ nào cho kết quả eval, theo cấu trúc chứ không phải do sơ suất.

Hệ quả: sửa một file nằm trong `paths` của một eval **đã ký** thì bằng chứng của hồ sơ
đó sai — nhưng `check-resign-wave` so `sha` nên vẫn xanh, và `recheck-evidence.cjs`
**không chạy lệnh nào** (đo: 0 lần `execSync`/`spawnSync`/`child_process`; nó chỉ đọc
file), nên cũng không thấy gì. Không thước nào trong cổng đối chiếu đầu ra đã ghi với
một lượt chạy tươi.

Người gặp: bất kỳ ai đọc một hồ sơ đã ký để biết hệ thống làm gì. Và mọi vòng sau, vì
hồ sơ đã ký là thứ các vòng sau tựa vào.

## Bằng chứng: đã xảy ra thật, có tên

`dang-ky-fork-openai` ký 01/09 với bằng chứng ghi `OK: 7/7 ca`. Hồ sơ kế
(`noi-thuoc-tai-lieu-vao-ci`) thêm hai ca vào chính bộ răng ấy; lệnh nay in `OK: 9/9 ca`.
E5 của hồ sơ đã ký khai `paths` gồm **đúng** file bị sửa. Nó được re-pin **ba lần** và
không lần nào chạy lại. Phát hiện bởi một hội đồng review, không bởi thước nào.

## Quy mô, đo được

| Đo 02/09 | Số |
|---|---:|
| Hồ sơ đã ký | **32** |
| Trong đó đã từng re-pin | **14** (44%) |
| Ô đo trong hồ sơ đã ký | **502** |
| Trong đó khai `paths` — tức có thể bị vô hiệu | **357** (71%) |
| Tập file mà chúng tuyên là đang canh | **199** |
| Ô đo ĐÃ bị chạm giữa lần repin đầu và lần cuối, mà không chạy lại | **40**, ở 5 hồ sơ |

Bốn mươi ô ấy nằm ở `chong-doc-sai-em-ru` (4) · `conformance-l0` (7) ·
`dang-ky-fork-openai` (5) · `normalize-text-vi` (9) · `stale-scope-by-paths` (15). Đây
là **sàn dưới**: nó chỉ đếm từ lần repin ĐẦU tới lần CUỐI, nên trôi trước lần repin đầu
không vào được con số này.

## Hiệu chỉnh quan trọng — đừng thổi phồng

Lấy mẫu **8** ô đo thuộc nhóm bị-chạm (script và test, ở bốn hồ sơ khác nhau) rồi chạy
lại: **0 ô đỏ**.

Nên phát biểu đúng của rủi ro là: lỗ này làm bằng chứng **nói sai về thứ nó đã đo**,
chứ (chưa) làm nó **giấu một thất bại**. Ca đã xác nhận (`7/7` → `9/9`) là trôi **văn
bản đầu ra**, không phải lật PASS thành FAIL.

Hai điều đó khác nhau về mức khẩn, và cùng quan trọng theo hai kiểu: một hồ sơ nói sai
đầu ra làm người đọc tin nhầm hệ thống làm gì; một hồ sơ giấu thất bại làm người đọc tin
nhầm hệ thống có chạy. Hồ sơ này đang ở loại thứ nhất, và không có gì bảo đảm nó ở yên
đó.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Bộ máy tính "delta này buộc chạy lại ô đo nào" đã có sẵn, không phải viết mới | phải viết bộ so paths-vs-delta từ đầu, việc phình gấp mấy lần | đọc `carry-plan.mjs` của gói feature-loop | **Đã thử — đúng** (02/09): nó nhận `--delta-files` và trả `{carriedEvals, rerun, reason}`, đang dùng cho carry-forward vòng-delta |
| 2 | Không thước nào hiện có đối chiếu đầu ra đã ghi với lượt chạy tươi | lỗ này đã được canh ở đâu đó, hồ sơ vô nghĩa | đếm `execSync\|spawnSync\|child_process` trong `recheck-evidence.cjs` | **Đã thử — đúng** (02/09): **0** lần; nó chỉ đọc file |
| 3 | Chạy lại chỉ các ô BỊ CHẠM là đủ rẻ để đưa vào nghi thức re-pin | re-pin hoá đắt ngang một vòng verify, không ai dùng | với 5 hồ sơ có drift, đếm số ô phải chạy lại: 4+7+5+9+15 = 40 trên tổng 502 (8%) | Chưa thử phần **thời gian**: mẫu 8 ô mất khoảng 3 phút, nhưng một ô là `pytest` 292 ca / 132 giây |
| 4 | 40 ô "bị chạm" phần lớn vẫn đúng, nên đây là nợ chứ không phải cháy | phải chạy lại cả 40 ngay, và có thể phải rút chữ ký | lấy mẫu 8 ô, chạy lại | **Đã thử — đúng** (02/09): 0/8 đỏ |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: `[đề xuất]` Sau khi sửa, một lượt re-pin chạm file nằm trong `paths` của một ô đo đã ký có **tự chạy lại đúng ô đó** không?
- Kết quả nào là SỐNG: `[đề xuất]` Dựng lại đúng ca đã xảy ra — sửa bộ răng từ 7 lên 9 ca rồi re-pin hồ sơ đã ký — và nghi thức **tự chạy lại E5**, rồi hoặc cập nhật đầu ra đã ghi hoặc đỏ nêu đích danh.
- Kết quả nào là CHẾT: `[đề xuất]` Re-pin hoá đắt tới mức phải bỏ qua, hoặc nó bắt đầu chạy lại **mọi** ô đo (lúc đó nó chỉ là một vòng verify đội lốt, và tên "re-pin" thành sai).
- Timebox: `[đề xuất]` một buổi.

## Ghi chú phạm vi

**Việc nội bộ của bộ công cụ, không có người dùng cuối.** Người ký Cổng Đáng có thể thay
cả khối ngưỡng trên bằng một dòng `Không đo được — <lý do>`; khuôn cho phép.

**Hình dạng lời giải có sẵn, và nó là hình dạng đã thắng một lần.** Hồ sơ
`noi-thuoc-tai-lieu-vao-ci` (ký 02/09) học được rằng mở rộng một bộ đo đã có răng thì
chạy, còn tự viết một chế độ mới thì rỗng ba lần liên tiếp. Ở đây bộ có sẵn là
`carry-plan.mjs`: nghi thức re-pin gọi nó với `--delta-files` = diff giữa
`verified_commit` cũ và sha mới, rồi chạy lại tập `rerun`. Nếu đúng vậy thì đây là việc
**nối dây**, không phải việc **đo**.

**Ba câu hỏi thiết kế mà tôi KHÔNG trả lời thay người ký:**

1. Chạy lại rồi đầu ra khác thì làm gì — cập nhật bằng chứng đã ký, hay đỏ và bắt mở
   vòng mới? Cập nhật tự động là sửa một bản ghi đã ký; đỏ tự động có thể chặn merge vì
   một khác biệt vô hại (một dòng đếm tăng).
2. Nghi thức này thuộc kit (gói `feature-loop`) hay thuộc kho? Sửa trong kit thì mọi
   kho hưởng, nhưng kho này không sở hữu kit.
3. Bốn mươi ô đang nợ: chạy lại hết một lượt để dọn sạch, hay để chúng tự được dọn ở
   lần re-pin kế của từng hồ sơ?

**Ngoài phạm vi:** `check-resign-wave` và `recheck-evidence` giữ nguyên vai — chúng trả
lời câu hỏi khác (sha có mới không · hồ sơ có đúng khuôn không). Lỗ này không phải lỗi
của chúng.
