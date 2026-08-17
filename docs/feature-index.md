# Chỉ mục tính năng OneFlow

> **File này là gì.** Danh sách mọi thứ người dùng làm được với OneFlow, kèm trạng thái thật.
> Đọc trực tiếp từ mã nguồn ngày **17/08/2026** (`main` @ `61d54ae`) chứ không chép lại từ tài liệu
> cũ — 6 luồng khảo sát độc lập, mỗi luồng được một vòng phản biện đọc lại từng khẳng định bằng
> chính file được viện dẫn.
>
> Phân vai: file này = *làm được gì*; [`docs/roadmap.md`](roadmap.md) = *sẽ đi đâu*;
> [`STATUS.md`](../STATUS.md) = *đang ở đâu*.

**Hai sơ đồ kèm theo:**

- [Bản đồ năng lực](assets/oneflow-capability-map.html) — OneFlow làm được gì, gói trong một trang
- [Đường tới cổng chất lượng](assets/oneflow-roadmap-lanes.html) — hai làn việc và chỗ chúng buộc phải gặp nhau

Ký hiệu: ✅ dùng được · ◐ dùng được nhưng còn hở · ⬜ chưa dùng được · 🔜 đang trong hàng đợi · ⏸ chờ điều kiện ngoài

---

## Đọc nhanh

| Con số | Nghĩa |
|---|---|
| **62** | việc trong hợp đồng năng lực (`config/tongflow.abi.json`) |
| **59** | việc có ô xử lý đặt được lên bàn làm việc |
| **55** | việc bấm chạy được **hôm nay, trên máy này** |
| **38** | plugin đang cài — 7 gọi API nhà cung cấp · 24 mượn GPU đám mây · 7 chạy CPU trên đám mây |
| **39** | mục trong danh sách plugin chính thức (36 lấy từ kho gốc + 3 kho riêng của OneFlow) |
| **17** | gói việc đã qua nghiệm thu và ký |
| **5** | ngôn ngữ giao diện — Việt, Anh, Trung, Hàn đủ chữ; Nhật thiếu 76 mục, toàn bộ nằm ở phần nhạc |

Bảy việc còn thiếu chia làm hai loại, không lẫn nhau được:

- **Ba việc chưa có ô xử lý** — hợp đồng có, plugin có, nhưng không có đường nào để người dùng chạm
  tới: *hỏi đáp về một tấm ảnh*, *hỏi đáp về một đoạn video*, *chép lời kèm mốc thời gian từng câu*.
- **Bốn việc có ô xử lý mà chưa ai phục vụ** — kéo ra bàn làm việc được, bấm chạy là báo lỗi:
  *tách từng người nói*, *đổi giọng nói*, *đọc văn bản theo mẫu giọng*, và *dán chữ · giá · logo*
  (việc cuối **đã làm xong và đã ký**, chỉ là plugin chưa được cài trên máy này — xem mục Cảnh báo).

---

## Ảnh

| | Người dùng làm được gì | Chạy ở đâu |
|---|---|---|
| ✅ | Tạo ảnh từ câu chữ | API nhà cung cấp |
| ✅ | Sửa ảnh bằng câu lệnh — vẽ thêm, xoá vật, chỉnh chi tiết | API nhà cung cấp |
| ✅ | Trộn nhiều ảnh tham chiếu thành một ảnh mới | API nhà cung cấp |
| ✅ | Cắt người hoặc vật chính ra khỏi nền, xuất PNG trong suốt | cloud (GPU) |
| ✅ | Phóng to ảnh cho nét hơn | cloud (GPU) |
| ✅ | Vẽ khung xương tư thế người lên ảnh | cloud (GPU) |
| ✅ | Tách ảnh người thành từng vùng bộ phận cơ thể | cloud (GPU) |
| ✅ | Đọc hướng nghiêng từng bề mặt trong ảnh, để thay ánh sáng hoặc dựng 3D | cloud (GPU) |
| ✅ | Lấy khung hình đầu của video ra thành ảnh | trên máy |
| ✅ | Lấy khung hình cuối của video ra thành ảnh | trên máy |

## Video

| | Người dùng làm được gì | Chạy ở đâu |
|---|---|---|
| ✅ | Tạo video từ câu chữ | API nhà cung cấp |
| ✅ | Cho một tấm ảnh tĩnh chuyển động thành video | API nhà cung cấp |
| ✅ | Hai ảnh khung đầu và khung cuối thành một clip nội suy | API nhà cung cấp |
| ✅ | Nhiều ảnh tham chiếu cộng lời mô tả thành một video | API nhà cung cấp |
| ✅ | Cắt video dài thành từng cảnh quay riêng | trên máy |
| ✅ | Nối nhiều clip lại thành một video liền mạch | trên máy |
| ✅ | Ghép một track tiếng vào một video | trên máy |
| ✅ | Làm câm một video — bỏ hết tiếng | trên máy |
| ✅ | Sửa video bằng một câu lệnh | cloud (GPU) |
| ✅ | Phóng to video cho nét hơn | cloud (GPU) |
| ✅ | Khớp khẩu hình nhân vật trong video theo file tiếng | cloud (GPU) |
| ✅ | Lồng tiếng và khớp khẩu hình cho video từ chữ | cloud (GPU) |
| ✅ | Một tấm ảnh chân dung cộng file tiếng thành video người nói | cloud (GPU) |
| ✅ | File tiếng cộng lời mô tả cảnh thành video | cloud (GPU) |
| ✅ | Thay nhân vật trong video bằng người trong ảnh mẫu | cloud (GPU) |
| ✅ | Chép chuyển động từ video mẫu sang nhân vật trong ảnh | cloud (GPU) |
| ✅ | Xoá watermark khỏi video | cloud (GPU) |
| ✅ | Xoá phụ đề cháy sẵn trên video | cloud (GPU) |
| ✅ | Lọc bỏ những clip không đạt, theo tiêu chí mô tả bằng lời | API nhà cung cấp |
| ✅ | Chia lô và sắp xếp clip thành từng nhóm để xử lý tiếp | API nhà cung cấp |
| ◐ | Dán chữ, khung giá và logo lên ảnh hoặc video, kẹp vùng an toàn TikTok | cloud (CPU) |

## Tiếng nói & Nhạc

| | Người dùng làm được gì | Chạy ở đâu |
|---|---|---|
| ✅ | Chép lời nói trong audio hoặc video ra chữ | cloud (CPU) |
| ✅ | Đọc văn bản thành tiếng bằng giọng có sẵn | cloud (GPU) |
| ✅ | Đọc văn bản bằng giọng nhân bản từ mẫu ghi âm | cloud (GPU) |
| ✅ | Đọc văn bản theo mô tả cách đọc bằng lời — nhanh chậm, vui buồn | cloud (GPU) |
| ✅ | Rút track âm thanh ra khỏi video | trên máy |
| ✅ | Khử tạp âm cho bản ghi | cloud (GPU) |
| ✅ | Tách giọng hát ra khỏi phần nhạc nền | cloud (GPU) |
| ✅ | Tả bằng lời một tiếng động rồi tách nó ra khỏi bản ghi | cloud (GPU) |
| ✅ | Sáng tác nhạc từ mô tả, kèm lời và thể loại | cloud (GPU) |
| ✅ | Một câu ý tưởng thành bản brief nhạc — lời, thể loại, BPM, tông, thời lượng | cloud (GPU) |
| ✅ | Vẽ lại một khúc nhạc trong khoảng thời gian đã chọn | cloud (GPU) |
| ✅ | Hát lại một bài theo phong cách khác | cloud (GPU) |
| ✅ | Tách riêng từng nhạc cụ khỏi bản mix | cloud (GPU) |
| ✅ | Thêm một bè nhạc cụ mới lên bản mix có sẵn | cloud (GPU) |
| ✅ | Điền nốt những bè còn thiếu cho bản phối | cloud (GPU) |
| ⬜ | Tách bản ghi thành từng người nói riêng — *ô xử lý có, chưa ai phục vụ* | — |
| ⬜ | Đổi giọng người nói sang một giọng khác — *ô xử lý có, chưa ai phục vụ* | — |
| ⬜ | Đọc văn bản theo cảm xúc và phong cách của một mẫu tiếng — *chưa có đường thêm vào bàn làm việc* | — |

## Chữ

| | Người dùng làm được gì | Chạy ở đâu |
|---|---|---|
| ✅ | Viết và viết lại nội dung theo câu lệnh | API nhà cung cấp |
| ✅ | Cắt một bài dài thành nhiều đoạn nhỏ | API nhà cung cấp |
| ✅ | Gộp nhiều đoạn chữ thành một bài | API nhà cung cấp |
| ✅ | Hỏi một câu bất kỳ về tấm ảnh, máy trả lời bằng chữ | cloud (GPU) |
| ✅ | Hỏi một câu bất kỳ về đoạn video, máy trả lời bằng chữ | cloud (GPU) |
| ✅ | Mô tả nội dung một file tiếng bằng chữ | API nhà cung cấp |
| ◐ | Hỏi đáp và mô tả nội dung một tấm ảnh — *có plugin, chưa có ô xử lý* | cloud (GPU) |
| ◐ | Chép lời nói ra chữ kèm mốc thời gian từng câu — *có plugin, chưa có ô xử lý* | cloud (CPU) |
| ⬜ | Hỏi đáp và mô tả nội dung một đoạn video — *không có cả ô xử lý lẫn plugin* | — |

## Tài liệu & Web

| | Người dùng làm được gì | Chạy ở đâu |
|---|---|---|
| ✅ | Bóc chữ ra khỏi tài liệu — PDF, Word, ảnh scan | cloud (CPU) |
| ✅ | Kéo nội dung một trang web về bàn làm việc — chữ, ảnh, video, tiếng | cloud (CPU) |

## 3D

| | Người dùng làm được gì | Chạy ở đâu |
|---|---|---|
| ✅ | Dựng mô hình 3D từ một tấm ảnh | cloud (GPU) |
| ✅ | Bắt chuyển động từ video một camera thành khung xương động 3D | cloud (GPU) |

---

## Bàn làm việc

| | Người dùng làm được gì |
|---|---|
| ✅ | Mở app là dùng được ngay, không phải đăng ký tài khoản |
| ✅ | Dựng sơ đồ công việc, bấm chạy, nhìn tiến độ từng bước theo thời gian thực |
| ✅ | Gạt qua lại giữa "đang dựng" và "đang chạy" |
| ✅ | Dừng giữa chừng một lượt chạy |
| ✅ | Lỡ tải lại trang, app vẫn bám tiếp lượt chạy cả sơ đồ đang dở |
| ✅ | Đóng trình duyệt mở lại vẫn còn nguyên bản vẽ dở |
| ✅ | Lưu bản vẽ rồi mở lại sau; xuất ra file để gửi đi và nhập file người khác gửi |
| ✅ | Tải ảnh, video, âm thanh, tài liệu lên — file nằm trên máy mình |
| ✅ | Chụp ảnh, ghi âm, quay video, vẽ phác thảo ngay trong app |
| ✅ | Kho tác phẩm: lọc theo loại, đánh dấu yêu thích, tải về máy; kết quả tự vào kho |
| ✅ | Lấy lại tư liệu cũ trong kho, thả thẳng vào bản vẽ mới |
| ✅ | Xem lại danh sách tác vụ đã chạy, trạng thái và lỗi; lỗi báo bằng câu tiếng Việt đọc hiểu được |
| ✅ | Chọn model cụ thể bên trong một plugin, ngay trên ô xử lý |
| ✅ | Dán ghi chú lên ô xử lý |
| ✅ | Đổi giao diện sáng / tối; đổi ngôn ngữ giữa 5 thứ tiếng |
| ✅ | Cài, cập nhật, gỡ plugin ngay trong app — kể cả plugin của người khác bằng một đường link Git |
| ◐ | Tả bằng lời, máy dựng sẵn sơ đồ lên bàn làm việc — *cần tự nhập khoá Anthropic, mà app không nhắc tên khoá đó ở đâu cả* |
| ◐ | App tự chặn không cho chạy quá 3 lượt cùng lúc — *chỉ chặn lượt chạy cả sơ đồ, không chặn chạy từng ô* |
| ⬜ | Hoàn tác một thao tác lỡ tay trên bàn làm việc |
| ⬜ | Xoá một tác phẩm ngay trong Kho |
| ⬜ | Từ một tác phẩm truy ngược về bản vẽ đã sinh ra nó |
| ⬜ | Chia sẻ bản vẽ hay tác phẩm cho người khác, làm chung một chỗ |

## Nền chạy

| | Người dùng được lợi gì |
|---|---|
| ✅ | Việc nặng chạy ngay trên máy người dùng, không phải gửi lên đám mây |
| ✅ | Thiếu plugin thì máy tự tải và cài lúc chạy, không bắt đi cài tay trước |
| ✅ | Bấm chạy trên app hay chạy tự động đều đi qua cùng một bộ máy — kết quả giống nhau |
| ✅ | Nối nhiều nguồn vào một ô thì ô đó chạy thành nhiều lượt rồi gộp kết quả lại |
| ✅ | Một ô hỏng thì dừng đúng chỗ và báo rõ ô nào hỏng vì sao |
| ✅ | Thấy plugin đang chạy tới đâu theo thời gian thực |
| ✅ | Mỗi người dùng có kho dữ liệu và kho kết quả riêng |
| ✅ | Sửa code plugin xong chạy lại thì không bao giờ bị trả về kết quả cũ |
| ✅ | Kho kết quả tự dọn theo trần dung lượng, không âm thầm ăn hết ổ cứng |
| ◐ | Sửa một chỗ chỉ chạy lại đúng chỗ đó — *chưa đúng trên đường chạy qua ứng dụng cài máy: mọi kết quả có kèm file đều chạy lại từ đầu* |
| ◐ | Tự nhập khoá nhà cung cấp của mình — *có chỗ nhập, chưa có ai dắt tay lần đầu* |
| ◐ | Mỗi plugin cài thư viện riêng, không giẫm chân nhau — *hai đường chạy đang giành nhau một thư mục; đường này xoá sạch việc của đường kia* |
| ◐ | Đo được bao nhiêu phần một lần chạy là dùng lại chứ không sinh mới — *đã ghi xuống, chưa có màn hình nào hiện ra* |
| 🔜 | Xem một lượt chạy tốn bao lâu, bao nhiêu tiền — *thời lượng có ghi; tiền và loại máy chưa từng được ghi một lần nào* |
| ⏸ | Bản cài đặt cho máy tính — *bản dựng hiện có vẫn chỉ là vỏ trỏ về web của kho gốc* |

---

## Đang làm và dự kiến

Thứ tự dưới đây là thứ tự thực thi. Nguồn: [`docs/roadmap.md`](roadmap.md),
[`STATUS.md`](../STATUS.md), và [ADR-0011](adr/0011-local-first-execution.md).

### Hàng đợi gần — làn máy tự đi được

| | Người dùng sẽ làm được gì | Ghi chú |
|---|---|---|
| 🔜 | Đọc số, giá và ngày thành chữ tiếng Việt chuẩn trước khi lồng tiếng | việc kế tiếp; không chờ ai |
| 🔜 | Phiên âm lời thoại không cần tài khoản đám mây | mở luôn đường đo chất lượng phụ đề — hai việc một mũi |
| 🔜 | Lồng tiếng Việt cho video | hôm nay danh sách giọng đọc 11 thứ tiếng, không có tiếng Việt |
| 🔜 | Lần chạy đầu tiên dắt tay người dùng nhập khoá và bắt đầu làm việc | điều kiện để kiểm chứng canh bạc lớn nhất của sản phẩm |
| 🔜 | Bấm một nút chạy cả quy trình, bàn làm việc chỉ hiện khi bấm "xem/sửa kế hoạch" | không phụ thuộc việc chốt ngách |
| 🔜 | Đọc web và tài liệu, cùng 26 việc GPU còn lại, chuyển sang đường API phổ biến | gỡ nốt phụ thuộc đám mây |

### Hàng đợi xa

| | Người dùng sẽ làm được gì |
|---|---|
| ⏸ | **Skill #1** — một buổi livestream hoặc tour quay điện thoại thành cả kho clip 9:16 có phụ đề và khung giá |
| ⏸ | Bộ nhớ về sản phẩm, thương hiệu, giọng của khách; mỗi kết quả truy được nguồn |
| ⏸ | App cài trên máy chạy thật tại máy, thay vì vỏ trỏ về web |
| 🔜 | Việc đang chạy dài không mất khi máy chủ khởi động lại |
| 🔜 | Biết biến thể quảng cáo nào chạy tốt, bằng cách nhập báo cáo từ TikTok / Meta |
| 🔜 | **Skill #2** — một đường link thành cả ma trận biến thể × định dạng × khung giá |
| 🔜 | Máy tự chấm và xếp hạng kết quả để chọn bản tốt nhất |

### Bốn việc chỉ người quyết được — đang chặn cổng đầu tiên

Không việc nào trong bốn việc này máy làm thay được, và cả bốn đứng yên từ 27/07:

1. **Ký ngưỡng số** cho cổng chất lượng đầu tiên (~30 phút, không cần dữ liệu). Đứng trước ba việc
   kia về logic: chốt vạch sau khi thấy số là mất tính khách quan của cổng.
2. **Clip thực địa + bản chép tay tham chiếu** — thư mục corpus tới nay vẫn chỉ có một file README,
   bộ đo ký từ 26/07 chưa chạy lần nào.
3. **Một lượt chạy thật + hoá đơn** để biết giá thành mỗi tác phẩm.
4. **Chốt ngách khách hàng** — người bán hàng online hay môi giới bất động sản. Đây là thứ chặn
   Skill #1 và bộ nhớ khách hàng, tức chặn cả cổng chất lượng đầu tiên.

---

## Cảnh báo — chỗ tài liệu và thực tế đang lệch

| Chỗ lệch | Sự thật đo được |
|---|---|
| **Máy này chưa cài 3 plugin mới nhất** | Danh sách chính thức đã trỏ sang `oneflow-api-ffmpeg`, `oneflow-api-pyscenedetect`, `oneflow-modal-compose-overlay`, nhưng thư mục `plugins/` trên máy này vẫn là ảnh chụp cũ: thiếu cả ba, và còn thừa hai plugin đã bị gỡ khỏi danh sách. Hệ quả: 7 việc cắt-ghép video ở đây vẫn vòng qua đám mây, còn dán chữ/giá/logo thì hoàn toàn không chạy được. Cài lại theo danh sách chính thức là hết. |
| **`STATUS.md` đề ngày 05/08** | Vẫn ghi "16 gói việc đã ký" và xếp việc chạy-trên-máy vào ô "chờ cổng 1", trong khi việc đó đã ký 07/08 và đã hạ cánh. Con số đúng là 17. |
| **Bảng năng lực trong README** | Lạc quan hơn thực tế: có ô đánh dấu đã có mà chưa có đường nào cho người dùng chạm tới, và có việc chưa được liệt vào ô còn trống nào cả. |
| **`CLAUDE.md` mục đăng ký plugin** | Vẫn mô tả chốt chặn bản cũ ("38 mục trơn + đúng một kho riêng"), trong khi chốt chặn thật đã là 36 + 3. Ai đọc để sửa sẽ sửa sai. |
| **Giao diện tiếng Nhật** | Thiếu đúng 76 mục, tất cả nằm dưới phần nhạc — người dùng Nhật thấy cả mảng chỉnh nhạc trống chữ. |
| **Khoá PyPI toàn tài khoản** | Vẫn nằm trong tệp môi trường và đã lộ trong một phiên làm việc từ 26/07. Nên thu hồi và cấp lại loại hẹp. |

---

## Cách chỉ mục này được dựng

Sáu luồng khảo sát chạy song song, mỗi luồng đọc một mặt của kho mã: hợp đồng năng lực × ô xử lý
trên bàn làm việc · plugin và nơi chúng chạy · bề mặt ứng dụng · bộ máy chạy · kế hoạch đã cam kết ·
lỗ hổng. Mỗi luồng sau đó bị một vòng phản biện context-sạch mở lại từng file được viện dẫn để
kiểm; vòng cuối đi soát cái gì còn sót và cái gì hai luồng nói ngược nhau.

Kết quả: 282 mục, 24 khẳng định bị sửa hoặc hạ bậc so với bản khảo sát đầu, 3 khẳng định bị bác bỏ
hoàn toàn. Những chỗ không kiểm được từ máy này (mã plugin nằm ở kho riêng trên GitHub) được hạ một
bậc và nói rõ lý do, thay vì tin theo tài liệu.
