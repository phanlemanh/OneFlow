---
verdict: findings
p0: 2
p1: 2
p2: 1
---

# Phản biện context sạch — `kho-khoa-toan-ven`

> 31/08/2026 · critic ngữ cảnh sạch, đọc ĐÚNG 5 artifact (design-doc, contract,
> evals, decisions, claims), **không đọc mã sản phẩm** — mã của tính năng chưa tồn tại.

Cả năm phát hiện đã **vá trong artifact, trước khi viết dòng mã nào**. Hai cái nặng
đều bắt được lỗi sắp đi vào mã: một phép đo **hằng đúng**, và một **hồi quy** do chính
hợp đồng này tạo ra.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | E6 chặn được ca hằng-đúng "0 mẫu" nhưng KHÔNG chặn ca "n mẫu đều nằm ngoài cửa sổ ghi". Không chỗ nào đòi vòng đọc phải BẮC QUA lượt ghi, cũng không nói người đọc phải ở tiến trình RIÊNG — với vòng đọc cùng tiến trình và một lượt ghi đồng bộ, JS không thể được lập lịch xen giữa nên assert thoả mà không cần cách ghi đúng. | Ghi khối 4 MB xong trong ~3 ms còn tiến trình đọc mất ~40 ms để khởi động, nên cả 200 mẫu đều là bản MỚI. E6 xanh, in "200 mẫu", trông như đã đo nguyên tử. Rồi ca răng atomic khôi phục writeFileSync cũ mà E6 VẪN xanh → CASE atomic FAIL, cả gói đỏ không rõ vì sao. | Tập mẫu phải CHỨA cả bản cũ lẫn bản mới; không bắc qua thì thoát KHÁC 0 với trạng thái không-kết-luận-được, KHÔNG phải PASS. Người đọc ở tiến trình hệ điều hành riêng. In số mẫu-cũ và mẫu-mới, không chỉ tổng. | **VÁ** → AC-6 + E6 viết lại. |
| P0 | contract | AC-5 lập luận khoá rỗng tới saveEnvStore là "lỗi lập trình". Với NỬA khoá rỗng lập luận đó sai theo chính design §2: bộ lọc ở route.ts dòng 105 lọc theo KIỂU GIÁ TRỊ, không lọc khoá. Không AC nào đo hệ quả của cú NÉM MỚI ở cửa route, và entry descope chỉ cân nhắc bộ LỌC cũ. | Người dùng lưu `{"":"x","OPENAI_API_KEY":"sk-1"}`. Dòng 105 giữ khoá rỗng vì giá trị là chuỗi; saveEnvStore ném; yêu cầu trả 500 và khoá HỢP LỆ cũng không được lưu — trước gói này thì lưu bình thường. Cả 12 ô xanh, Cổng 1 duyệt trên một tiền đề mà chính hồ sơ đã bác. | Thêm một ô gọi thẳng handler PUT với khoá rỗng, ghim mã trạng thái VÀ khẳng định được-tất-hoặc-không-gì. Đo từ file thử ở lớp kho nên không sửa file nào dưới src/app/api nên giữ T2. | **VÁ** → AC-12 + E13. Giữ nguyên việc saveEnvStore từ chối khoá rỗng: nếu nó ghi, nó tạo ra kho mà chính AC-3 sẽ từ chối ở lần đọc kế. |
| P1 | evals | E11 vá NGƯỢC vào chính file thật trong cây làm việc: không cách ly, không trap khôi phục khi bị giết, và expected không đòi khẳng định cây SẠCH sau khi chạy. Các ô E1–E10 và E12 đọc đúng hai file đó và chạy song song. | E11 giữ env-store.server.ts ở trạng thái vá ngược ~20 giây; E4 hoặc E9 biên dịch file đó đúng trong cửa sổ ấy → đỏ, báo cáo ghi một lỗi không tái hiện được. Hoặc harness giết E11 giữa ca atomic → cây còn nguyên writeFileSync cũ, lần chạy sau xanh giả trên mã đã thoái lui. | Sao sang git worktree riêng và chỉ vá bản sao; trap khôi phục ở EXIT INT TERM; kết thúc chạy git diff --quiet trên hai file phạm vi và IN kết quả. | **VÁ** → AC-11 (a) + E11. |
| P1 | evals | AC-11 hứa chiều đỏ có thông điệp GHIM, nhưng expected của E11 chỉ đo chuỗi-có-mặt `CASE tên PASS` và đếm token. Không ô nào đòi cú đỏ QUY được về đúng phép đo tương ứng, nên "suite thoát khác 0" đủ để một ca báo PASS. | Ca coerce-scalar vá bằng sed làm hỏng cú pháp file; vitest thoát 1 vì không parse được; script đọc "suite đỏ" → in CASE coerce-scalar PASS. Bảy ca PASS theo cách này mà không ca nào chứng minh được luật mới. Gói qua Cổng 2 với bộ răng rỗng. | Mỗi ca khai TRƯỚC tên ca thử phải đỏ và mẫu thông điệp phải xuất hiện; assert cả hai. Lượt mà vitest không thu được ca nào, hoặc hỏng vì cú pháp, là thoát 2 chứ không phải PASS. | **VÁ** → AC-11 (b) + E11. |
| P2 | contract | Hai lời hứa "không để lại dấu vết" chỉ phủ ĐƯỜNG THÀNH CÔNG. AC-7 mở bằng "một lượt ghi đã xong"; AC-5 đo bằng so sha trước/sau, phép đo này đòi file phải TỒN TẠI nên ca kho CHƯA CÓ không đo được. | Máy mới, chưa có settings.json. Caller truyền khoá rỗng; bản cài mkdirSync rồi mở file tạm TRƯỚC khi kiểm rồi mới ném → còn lại một settings.json.tmp mồ côi vĩnh viễn, và lần đọc kế trả "kho rỗng" thay vì "chưa có kho", đổi hành vi onboarding. E5 và E7 đều xanh vì fixture của chúng luôn có kho lành. | E5 thêm fixture kho VẮNG: sau khi ném, file đích vẫn không tồn tại và thư mục dữ liệu rỗng. E7 thêm ca đường THẤT BẠI rồi khẳng định không còn file tạm. | **VÁ** → AC-5 + AC-7 + E5 + E7. |

## Vết để lại

- AC 11 → **12**; eval 12 → **13**; executor mới **1** (`unit_kkt_empty_key_put`).
- Không thêm file nào ngoài bốn file đã khai, nên **cận trên re-pin không đổi**.
- Hai lỗ P0 đều thuộc lớp **phép đo tự thoả**: một cái hằng đúng, một cái đo sai tiền đề.
  Chúng không lộ ra qua đọc lại hợp đồng — chỉ lộ khi có người hỏi *"ô này xanh được mà
  hệ thống vẫn sai không?"*
