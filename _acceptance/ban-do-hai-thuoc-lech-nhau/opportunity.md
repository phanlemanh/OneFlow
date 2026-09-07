---
schema_version: 1
slug: ban-do-hai-thuoc-lech-nhau
feature: Bản đồ sản phẩm có hai thước bất đồng, và thước chạy trong cổng mù với Cổng Giá trị
owner: Manh
stage: discovery
decision:
decided_by:
decided_at:
prototype:
  base_commit:
  disposition:
---

# Cơ hội: hai cái thước cho một tấm bản đồ

## Vấn đề & ai gặp

Bản đồ sản phẩm có **bộ vẽ** sống trong bộ đồ nghề cài ngoài, và **bộ kiểm** được
chép vào kho. Đo ngày 2026-09-07, chúng bất đồng **năm** chỗ:

| # | Bộ vẽ nói | Bộ kiểm nói |
|---|---|---|
| 1 | `lat-cat-chung-minh` thuộc nhóm đã giao (36 mục) | không hồ sơ nào ở trạng thái đó (35 mục) |
| 2 | `skill-1-footage-kho-clip` là "sắp mở vòng" | là "đang cân nhắc cơ hội" |
| 3 | khối rỗng thì bỏ đi | khối "Đang cân nhắc cơ hội" phải luôn có mặt |
| 4 | khối rỗng thì bỏ đi | khối "Đã giao — chờ phiên nghiệm thu" phải luôn có mặt |
| 5 | hồ sơ đã ký Cổng Giá trị chuyển sang nhóm "đã nghiệm thu giá trị" | **không đọc `uat-session.md` chút nào** |

Chỗ (5) là chỗ đau nhất và nó không phải bất đồng, nó là **mù**. Bộ kiểm chạy trong
cổng vẫn nói bản đồ khớp trong khi bản đồ chưa ghi chữ ký vừa đặt xuống. Một thước
xanh trên đúng thứ nó không nhìn thấy còn tệ hơn không có thước.

Người gặp: ai mở bản đồ để biết việc nào đã qua cổng nào. Hôm nay bản đồ nói
`noi-thuoc-tai-lieu-vao-ci` còn chờ phiên nghiệm thu, trong khi phiên ấy đã họp và
đã ký **release** ngày 2026-09-07.

## Vì sao nó đến được đây

Chính bộ kiểm tự khai lý do, trong chú thích đầu file: bộ vẽ không được chép vào kho
vì "vendoring it would freeze a copy that then drifts into a fork, leaving two
different rulers for one thing". Quyết định ấy tránh được một bản fork của bộ **vẽ**,
nhưng đổi lại bộ **kiểm** hoá thành cái fork đó. Bộ vẽ ngoài kho tự trôi theo phiên
bản; bộ kiểm trong kho đứng yên. Không ai đặt hai cái cạnh nhau cho tới hôm nay.

## Ghi nợ: hai việc phiên nghiệm thu 07/09 CỐ Ý không làm

1. **Không ship bản đồ mới** (owner quyết 07/09, một chữ: "Giữ"). Ship nó làm cổng đỏ
   bốn chỗ và kéo phiên nghiệm thu thành việc sửa bộ công cụ.
2. **Bản đồ được sửa TAY hai dòng** cho khớp số hồ sơ, giữ nguyên hình dạng cũ. Đó là
   việc kit vốn cấm (bản đồ là view máy sinh), làm có chủ ý và ghi ra đây chứ không
   làm lặng.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: …
- Kết quả nào là SỐNG: …
- Kết quả nào là CHẾT: …
- Timebox: …

## Ghi chú phạm vi

Chưa rõ lối chữa nào rẻ hơn: dạy bộ kiểm đọc hồ sơ phiên nghiệm thu và chấp nhận hình
dạng mới, hay bỏ bộ kiểm vendored và cho cổng gọi thẳng bộ vẽ ở chế độ so sánh. Lối
thứ hai vướng đúng điều chú thích cảnh báo: cổng chạy trên máy sạch không có bộ đồ
nghề ấy. Đây là chỗ cần một buổi khai thác, không phải một bản vá.
