---
schema_version: 1
slug: o-do-chay-0-ca-van-xanh
feature: Ô đo chạy 0 ca thử mà vẫn báo đạt — 23 executor còn mang lỗ
owner: Manh
stage: discovery
decision:
decided_by:
decided_at:
prototype:
  base_commit:
  disposition:
---

# Cơ hội: một phép kiểm chưa chạy gì vẫn báo đạt

## Việc gì đang sai

`pnpm vitest run <file> -t '<tên ca>'` **thoát 0 khi không ca nào khớp**. Nó in
`Tests  26 skipped (26)` rồi trả về thành công. Một ô đo dùng khuôn đó, với một
tên gõ sai hoặc một tiêu chí mà ca thử chưa từng được viết, sẽ **báo ĐẠT mãi mãi**.

## Bằng chứng đo được, không phải suy luận

Bắt được trong chính lượt verify của hồ sơ [`kho-khoa-toan-ven`](../kho-khoa-toan-ven/contract.md)
(31/08/2026), lượt chạy đầu tiên:

```
E9   AC-9   exit=0    Tests  26 skipped (26)   ← KHÔNG ca nào chạy
E10  AC-10  exit=0    Tests  26 skipped (26)   ← KHÔNG ca nào chạy
```

Hai tiêu chí đó **không hề có ca thử** — kế hoạch ghi "kiểm rõ ở bước cuối thay vì
giả định", và bước đó bị bỏ qua. Cả hai ô vẫn báo PASS. Nếu không đối chiếu dòng
`Tests`, chúng đã đi thẳng vào gói bằng chứng và qua Cổng 2.

## Phạm vi lỗ

| Đo 31/08 | Số |
|---|---:|
| Executor còn dùng `vitest run … -t` trực tiếp trong `_acceptance/config.yaml` | **23** |
| Đã bịt bằng `scripts/settings/run-one-test.sh` | 10 (chỉ của `kho-khoa-toan-ven`) |

Lệnh đo lại: `grep -c "vitest run .* -t " _acceptance/config.yaml`

## Vì sao đáng làm

Đây là lỗ ở **lớp đo**, không phải ở sản phẩm — nơi mọi hồ sơ khác đang tựa vào.
Một ô đo xanh mà chưa chạy gì không chỉ vô dụng: nó **chủ động nói dối** rằng một
lời hứa đã được kiểm. Cùng lớp fail-open mà ba hồ sơ gần đây đã đóng ở chỗ khác
(`chong-doc-sai-em-ru`, `cong-tu-canh-minh`, `kho-khoa-toan-ven`), lần này nằm
trong chính bộ thước.

Chưa ai biết trong 23 ô còn lại có bao nhiêu ô đang thật sự chạy 0 ca. **Đó là câu
hỏi đầu tiên phải trả lời**, và nó trả lời được bằng máy.

## Ngưỡng nghiệm thu sơ bộ

- Đếm được **bao nhiêu / 23 ô** đang chạy 0 ca ngay lúc này — con số đó là giá trị
  đầu tiên của hồ sơ, kể cả khi phần sửa bị hoãn.
- Phép thử hai chiều: một tên ca gõ sai phải làm ô đo **ĐỎ nêu lý do**, không phải
  xanh; một tên đúng vẫn xanh.
- Không hồ sơ đã ký nào đổi verdict vì cách sửa này — nếu có, đó là một ô đo vốn đã
  rỗng, và điều đó phải được nêu tên chứ không lặng lẽ vá.

## Ghi chú phạm vi

`scripts/settings/run-one-test.sh` ghim cứng một file thử, nên nó là bản vá cho
một hồ sơ chứ chưa phải lời giải chung. Lời giải chung có thể là một bộ bọc nhận
đường dẫn file, hoặc một cờ của vitest nếu có. Chưa khảo sát.
