---
schema_version: 1
slug: dang-ky-fork-openai
ran_at: 2026-09-01T16:05:00Z
variant: ui
chan: 4
lac: 1
kho_chiu: 4
vat: 6
chuyen_phien_nguoi: 10
---

## Mục tiêu (tiếng sản phẩm, giấu đường đi)

Bạn là người mới dùng OneFlow, chưa từng đọc mã của nó. Ngân sách **12 bước mỗi
mục tiêu**; cạn thì ghi «BỎ CUỘC TẠI ĐÂY» và sang mục tiêu kế.

1. Bạn có một đoạn ghi âm và muốn lấy lời thoại ra thành chữ. Tìm xem OneFlow có
   làm được việc đó không, và đưa được thứ làm việc đó lên vùng làm việc.
2. Trước khi chạy, bạn muốn biết **ai** sẽ xử lý đoạn ghi âm của mình và **bằng
   mô hình nào**. Tìm chỗ nói điều đó, và ghi lại nguyên văn những gì màn hình
   hiện — tên nhà cung cấp, tên mô hình, có mấy lựa chọn.
3. Bạn nghe nói vài mô hình phiên âm của OpenAI sắp bị tắt. Kiểm xem thứ OneFlow
   đang mời bạn dùng có nằm trong nhóm sắp tắt không, chỉ bằng những gì màn hình
   nói — đừng suy đoán.
4. Bạn cũng muốn lấy **mốc thời gian từng câu** (để làm phụ đề). Xem OneFlow có
   mời việc đó không, và nếu có thì nó dùng mô hình nào.

## Nhật ký vấp

| # | Loại | Mục tiêu | Vấp gì (nguyên văn người-lạ) | Bằng chứng |
|---|---|---|---|---|
| 1 | CHẶN | 1 | Thanh dưới 8 nút chỉ THÊM tài sản, không nút nào ra thứ BIẾN âm thanh thành chữ. Menu node chỉ có Add comment / Delete. Kéo từ chấm tròn thì canvas trượt. Chuột phải và bấm đúp trên nền: không gì. Hết 12 bước — BỎ CUỘC TẠI ĐÂY cho lối tự đặt node | ảnh canvas + tooltip; menu node 2 dòng; My Workflows trống |
| 2 | CHẶN | 1 | Gõ yêu cầu phiên âm vào Director, chờ ~15s, nhận `Could not build a valid workflow. Try rephrasing.` — nó bảo tôi viết lại câu nên tôi tưởng lỗi ở tôi. Nguyên nhân thật là plugin OpenAI CHƯA CÀI; màn hình không hề nói | toast đỏ 2 lần; sau khi Install thì cùng yêu cầu chạy được |
| 3 | KHÓ-CHỊU | 1 | Chạy hỏng mà ô nhập giữ nguyên câu cũ; bấm vào thì con trỏ rơi GIỮA câu, câu mới bị chèn vào giữa thành chuỗi lai rồi gửi đi nguyên vậy. `Cmd+A` không chọn hết | ảnh panel Director với chuỗi lai, lặp 2 lần |
| 4 | KHÓ-CHỊU | 1 | Danh sách plugin toàn tên gói thô, không dòng mô tả nào — làm sao biết cái nào biết phiên âm? Mô tả chỉ hiện SAU KHI đã cài | hộp Plugins, tab Official |
| 5 | LẠC | 1 | Tôi bảo phiên âm ĐOẠN GHI ÂM CỦA TÔI, nó dựng Add Text → Generate Speech → Audios → Speech Recognition → Texts: tự đọc một câu mẫu thành tiếng rồi phiên âm ngược. Không có node Add Audio nào — file của tôi không có chỗ bỏ vào | canvas sau Replace; ô Input Text ghi sẵn câu mẫu |
| 6 | VẶT | 1 | Lịch sử chạy ghi ngày `12/15/58601, 9:17:46 PM` — năm 58601 | panel My Tasks, nhiều dòng cùng kiểu |
| 7 | KHÓ-CHỊU | 1 | Lịch sử đỏ lòm: thiếu MODAL_TOKEN_ID, thiếu OPENAI_API_KEY — mà không chỗ nào bấm để đi sửa | panel My Tasks, ~7 dòng Pending |
| 8 | VẶT | 1 | Tên workflow có mũi tên xuống như dropdown, bấm hai lần không mở gì | thanh trên cùng |
| 9 | VẶT | 1 | Director dựng xong, canvas trông TRỐNG TRƠN — tưởng hỏng; phải bấm nút fit-view bé xíu góc dưới trái mới thấy node | ảnh ngay sau Replace |
| 10 | KHÓ-CHỊU | 2 | Ở mức phóng mặc định, chữ trong node nhỏ tới mức không đọc nổi tên mô hình; phải cuộn phóng to | so sánh ảnh fit-view và ảnh phóng to |
| 11 | VẶT | 2 | Ô ghi `Implementation`, không phải `Provider`/`Nhà cung cấp` — phải đoán rằng OpenAI ở đó nghĩa là nhà cung cấp | node Speech Recognition |
| 12 | CHẶN | 3 | Tìm khắp ô Model, ô Implementation, tooltip dấu hỏi, mục plugin: KHÔNG chỗ nào nói gì về mô hình sắp tắt, ngừng hỗ trợ, hay hạn dùng. Không nhãn, không cảnh báo, không ngày tháng | dropdown Model 1 dòng; dropdown Implementation 1 dòng; tooltip và thẻ plugin đều không nhắc vòng đời |
| 13 | VẶT | 3 | Bấm dấu hỏi cạnh OpenAI hiện `Text and image generation via any OpenAI-compatible endpoint…` — đây là node phiên âm mà mô tả chỉ nói sinh chữ và sinh ảnh, không nhắc tiếng nói | tooltip dropdown Implementation, y hệt dòng trong hộp Plugins |
| 14 | CHẶN | 4 | Bảo Director làm phụ đề có mốc thời gian; nó đặt tên workflow `Sentence-level Subtitles fro…` nhưng dựng ĐÚNG cái cũ. Không ô mốc thời gian, không SRT/VTT, không gì tên timestamp. Tên hứa một đằng, node cho một nẻo | canvas workflow thứ hai; node chỉ 3 hàng |
| 15 | VẶT | 2 | Trong Settings, `OPENAI_API_KEY` nằm dưới `Custom variables — Variables not declared by any installed plugin` dù OpenAI chính là thứ node đang dùng | hộp Settings |

## Điều màn hình HIỆN cho mục tiêu 2 (nguyên văn)

Node **Speech Recognition** · **Implementation: OpenAI** — dropdown đúng **1** lựa chọn ·
**Model: gpt-transcribe** — dropdown đúng **1** lựa chọn, có dấu tick · nút **Recognize Speech**.

## Chuyển phiên người

- Người dùng mang sẵn một file ghi âm tới — việc đầu tiên sản phẩm mời họ làm có nên là "gõ một câu chữ để máy đọc thành tiếng" không?
- Nếu con đường duy nhất để đặt được một node xử lý lên canvas là Director, thì canvas còn nên trông giống một trình dựng kéo-thả nữa không?
- Một người mới có được phép biết mình đang thiếu plugin nào trước khi bị bảo "hãy viết lại câu" không?
- Danh sách plugin có nên nói bằng tiếng người thay vì tên gói không?
- Khi chỉ có đúng một nhà cung cấp và đúng một mô hình, bày ra hai dropdown mỗi cái một dòng là trung thực hay giả vờ có lựa chọn?
- Sản phẩm có nợ người dùng thông tin về vòng đời mô hình không, hay đó là việc người dùng tự tra ở nơi khác?
- Nếu chưa làm được mốc thời gian từng câu, Director có được phép đặt tên workflow là "Sentence-level Subtitles" không?
- Một câu lệnh Director xoá sạch canvas đang có có phải cái giá chấp nhận được để thử một ý tưởng không?
- Lịch sử tác vụ toàn lỗi đỏ và ngày năm 58601 nên cho người mới nhìn thấy trong 5 phút đầu, hay giấu tới khi họ chạy được một việc?
- Ngưỡng "đọc được chữ" trên canvas nên đặt ở mức phóng nào?

