---
schema_version: 1
feature: Kho khoá toàn vẹn — đọc không cắt bớt âm thầm, ghi không để lại file cụt
slug: kho-khoa-toan-ven
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api]
status: approved
design_doc: docs/superpowers/specs/2026-08-31-kho-khoa-toan-ven-design.md
approved_by: Phan Le Manh
approved_at: 2026-08-31
---

# Acceptance Contract: kho-khoa-toan-ven

Hồ sơ [`chong-mat-khoa-byo`](../chong-mat-khoa-byo/contract.md) dạy kho khoá **từ chối
thay vì giả dạng rỗng**. Hồ sơ này đóng hai lỗ còn lại của cùng lời hứa: kho **đọc được
nhưng bị cắt bớt âm thầm**, và kho **ghi dở dang để lại file cụt**.

Quyết định định hình của owner (31/08): giá trị không phải chuỗi thì **đổi thành chuỗi,
giữ khoá** — không từ chối cả kho. Lý do và đường bị loại: design doc §3.

## Criteria

- AC-1: Given kho trên đĩa có một giá trị `number` hoặc `boolean` (vd `{"PORT": 8080,
  "DEBUG": true}`), When gọi `readEnvStore()`, Then nó trả `state: "ok"` và **giữ đủ mọi
  khoá**, với giá trị đã đổi thành chuỗi (`"8080"`, `"true"`). Không khoá nào biến mất.
  Đo hôm nay trước khi sửa: bốn khoá biến mất mà trạng thái vẫn báo `ok`.
- AC-2: Given kho có một giá trị `object`, `array` hoặc `null`, When gọi `readEnvStore()`,
  Then **cả kho** trả `state: "unreadable"`, `reason: "shape"`. Không đổi thành chuỗi:
  `String({a:1})` ra `"[object Object]"`, tức biến một lỗi thành một giá trị rác trông
  hợp lệ — im lặng kiểu khác, không phải hết im lặng.
- AC-3: Given kho có một khoá rỗng hoặc toàn khoảng trắng (vd `{"   ": "x"}`), When gọi
  `readEnvStore()`, Then **cả kho** trả `unreadable` / `shape`. Một tên biến môi trường
  rỗng không sửa được bằng phép đổi kiểu, nên đó là kho hỏng chứ không phải kho cần chữa.
- AC-4: Given kho mà **mọi** giá trị đã là chuỗi, When gọi `readEnvStore()`, Then nó trả
  `state: "ok"` với map **y hệt** nội dung trên đĩa — không khoá nào mất, không giá trị
  nào đổi. Đây là **nửa đàn áp**: thiếu nó thì một bản sửa luôn-trả-`unreadable` hoặc một
  bản đổi-mọi-thứ vẫn qua sạch AC-1..AC-3.
- AC-5: Given `saveEnvStore()` nhận một giá trị không phải chuỗi hoặc một khoá rỗng, When
  gọi nó, Then nó **ném lỗi nêu đích danh khoá phạm lỗi** và **không ghi gì xuống đĩa**.
  Tham số của nó khai kiểu `Record<string, string>`, nên thứ tới được đây là lỗi lập
  trình, không phải dữ liệu người dùng — lọc lặng một lỗi lập trình là giấu nó.
  HAI hình dạng ban đầu, vì "không ghi gì" nghĩa khác nhau ở hai chỗ: kho ĐÃ CÓ → nội
  dung không đổi một byte; kho CHƯA CÓ (máy mới cài) → file đích **vẫn phải vắng** và thư
  mục dữ liệu không có file tạm mồ côi. Phép đo so-sha một mình đòi file phải tồn tại, nên
  nó bỏ sót đúng ca máy-mới.
- AC-6: Given một lượt ghi đang chạy trên khối dữ liệu lớn, When một người đọc ở **tiến
  trình hệ điều hành RIÊNG** đọc liên tục file kho, Then **mọi mẫu đều hoặc là bản cũ trọn
  vẹn, hoặc là bản mới trọn vẹn** — không mẫu nào là JSON hỏng hay chuỗi rỗng. VÀ tập mẫu
  phải **CHỨA CẢ HAI**: ít nhất một mẫu cũ và ít nhất một mẫu mới. Không bắc qua được thì
  lượt đo là **KHÔNG KẾT LUẬN ĐƯỢC** (thoát khác 0), **không phải ĐẠT**.
  Vì sao vế thứ hai: "mọi mẫu đều hợp lệ" thoả **hằng đúng** khi vòng đọc chạy hoàn toàn
  sau lượt ghi — 200 mẫu đều là bản mới cũng qua. Và người đọc cùng tiến trình thì KHÔNG
  BAO GIỜ bắc qua được: JS không xen giữa một lượt ghi đồng bộ. Thiếu hai điều này, ô đo
  khó nhất của gói xanh mà chưa đo gì. Đếm mẫu-cũ và mẫu-mới phải được IN RA, không chỉ
  in tổng.
- AC-7: Given một lượt ghi đã xong, When soi thư mục kho, Then **không còn file tạm nào
  sót lại**, và file tạm mà bản cài đặt dùng nằm **cùng thư mục** với đích. Đổi tên qua
  hai hệ thống file không nguyên tử, nên "cùng thư mục" là một phần của lời hứa chứ
  không phải chi tiết cài đặt. VÀ đường THẤT BẠI: khi lượt ghi hỏng giữa chừng, cũng
  **không được để lại file tạm**. Hai lời hứa "không để dấu vết" mà chỉ phủ đường thành
  công là nửa lời hứa.
- AC-8: Given `readSettingsBlob` và `writeSettingsBlob`, When so chữ ký hàm với bản trước
  gói việc này, Then **không đổi**. Đây là seam: vỏ cloud có bản `src/ext/settings-store.ts`
  riêng, gitignored, nằm ở repo khác — đổi chữ ký là làm nó hỏng âm thầm ở nơi không ai
  chạy được bộ thử.
- AC-9: Given kho có giá trị `number`/`boolean`, When đường CHẠY gọi `loadEnvStore()` (bộ
  đọc khoan dung mà `withStoredEnv` dùng), Then plugin nhận **đủ mọi khoá**, đã đổi thành
  chuỗi. Hôm nay đường này mất đúng những khoá đó. Đây là vế nói lên vì sao owner chọn
  đổi-thành-chuỗi chứ không từ-chối-cả-kho.
- AC-10: Given kho có giá trị `number`/`boolean`, When chạy vòng `readEnvStore()` →
  `saveEnvStore()` → `readEnvStore()`, Then lần đọc thứ hai trả **đủ mọi khoá** của lần
  đầu. Đây là vòng tròn mất-vĩnh-viễn đã đo: đọc lọc mất → hiện lên màn → người dùng bấm
  lưu → mất trên đĩa. Đo ở lớp kho nên không cần chạm route.
- AC-12: Given một yêu cầu lưu chứa **khoá rỗng lẫn khoá hợp lệ** (vd
  `{"": "x", "OPENAI_API_KEY": "sk-fake"}`), When nó đi qua đường lưu thật, Then kết quả
  là **được-tất-hoặc-không-gì**, thất bại **kêu to** có nêu khoá phạm lỗi — và **tuyệt đối
  không** phải "âm thầm bỏ khoá rỗng rồi lưu phần còn lại".
  Đây là HỒI QUY mà chính AC-5 tạo ra, phát hiện ở vòng phản biện: bộ lọc ở `route.ts`
  dòng 105 lọc theo **kiểu giá trị**, KHÔNG lọc khoá — nên khoá rỗng lọt qua route và
  chạm `saveEnvStore`. Trước gói này, khoá hợp lệ vẫn được lưu. Đo từ **file thử ở lớp
  kho** (nhập handler vào, không sửa file nào dưới `src/app/api/**`), nên gói vẫn T2.
  `saveEnvStore` **bắt buộc** phải từ chối khoá rỗng: nếu nó ghi, nó tạo ra một kho mà
  chính bộ đọc của ta (AC-3) sẽ từ chối ở lần đọc kế — ghi thành công rồi đọc không được
  là kết cục tệ hơn cả hai.
- AC-11: Given mỗi phép đo mới của gói việc này, When nó được coi là xong, Then nó có
  **cặp hai chiều trên cùng một vật**: bản lành → xanh; phá bản sao → đỏ với thông điệp
  **ghim nêu đích danh** khoá hoặc mẫu lệch, không chỉ mã thoát. Chiều đỏ do
  `scripts/settings/check-env-store-teeth.sh` chứng minh — bảy ca, mỗi ca vá NGƯỢC một
  luật mới vào bản sao lưu của file thật rồi đòi bộ thử ĐỎ. Kể cả tính nguyên tử: ca
  `atomic` khôi phục `writeFileSync` cũ và đòi chính AC-6 đỏ, nên chiều đỏ khó nhất của
  gói này là phép đo MÁY chứ không phải một lượt chạy tay không ai kiểm lại được.
  HAI ràng buộc bắt buộc của bộ răng, cả hai từ vòng phản biện:
  (a) **CÁCH LY** — nó vá vào một cây làm việc riêng (`git worktree`), KHÔNG vá file trong
  cây chung: các ô đo khác đọc đúng hai file đó và **chạy song song**, nên vá tại chỗ sẽ
  làm một ô khác đỏ vì lý do không tái hiện được, và một lượt bị giết giữa chừng để lại
  cây mang mã đã thoái lui. Kết thúc phải khẳng định cây sạch và IN ra kết quả đó.
  (b) **KHÔNG NHẬN ĐỎ VU VƠ** — mỗi ca khai TRƯỚC tên ca thử phải đỏ và mẫu thông điệp
  phải xuất hiện; script khẳng định cả hai. Lượt chạy mà bộ thử không thu được ca nào,
  hoặc hỏng vì lỗi cú pháp, là **KHÔNG KẾT LUẬN ĐƯỢC** (thoát 2), không phải ĐẠT — nếu
  không, một bản vá `sed` làm hỏng cú pháp cũng cho "bộ thử đỏ" và bảy ca PASS trên một
  bộ răng rỗng.

## Coverage

Quét bằng `morphological-scan` (tự dựng trục — không preset nào khớp), hộp
**dạng giá trị × cửa × hệ quả** cộng một trục cắt ngang về **kiểu hỏng**.

- **Trục A — dạng giá trị trên đĩa:** chuỗi | số/bool | object/mảng/null | khoá rỗng.
  *Thước CE:* bản kê **đóng** theo kiểu JSON — đúng bốn nhóm, không nhóm thứ năm nào tồn
  tại trong JSON hợp lệ `[SUY-TỪ-REPO: src/lib/settings/env-store.server.ts:38-49]`.
- **Trục B — cửa dữ liệu đi qua:** đọc (`coerceEnv`) | ghi qua lib (`saveEnvStore`) |
  ghi xuống đĩa (`writeSettingsBlob`). *Thước CE:* ba hàm, đo bằng `grep` trên hai file
  của phạm vi. **Cửa thứ tư — `route.ts` dòng 105 — CÓ THẬT và cố ý để ngoài**, vì chạm
  `src/app/api/**` là hoá T3; ghi ở Out of scope, không giấu.
- **Trục C — hệ quả:** giữ nguyên | đổi thành chuỗi | từ chối cả kho | ném lỗi.
  *Thước CE:* bốn hệ quả khớp bốn ô của bảng quyết định ở design doc §4.1, cộng ô ném lỗi
  của `saveEnvStore`. Ô "bỏ qua im lặng" **bị loại khỏi bảng** — đó là chính lỗi đang sửa.
- **Trục D — kiểu hỏng (cắt ngang):** nội dung sai (Lỗi 1) | ghi bị ngắt giữa chừng
  (Lỗi 2). *Thước CE:* hai lỗi độc lập — đổi cái này không ép đổi cái kia; cả hai đo
  được trên cây hôm nay 31/08.

**Ô Core 11/40 (27,5%)** — trên ngưỡng 20% có chủ ý: AC-4 (nửa đàn áp), AC-7 (nửa cấu
trúc của tính nguyên tử), AC-8 (bất biến seam) và AC-11 (cặp hai chiều) là **nửa chống
đỡ** của chính các ô thành công, không gộp vào được. Đã cắt bằng hợp nhất ô, không bằng
bỏ ô.

## Out of scope

- **Bộ lọc lặng ở `route.ts` dòng 105** — cửa thứ ba, có thật. Chạm `src/app/api/**` là
  hoá T3 và thêm một cổng người, đổi lấy một đường mà client **đã thấy được** kết quả
  (dòng 137 trả lại bản đã lọc). Đáng một hợp đồng riêng.
- **Hiện cảnh báo trên màn Cài đặt khi kho vừa bị đổi kiểu** — lớp giao diện, thuộc gói
  A2 cùng với AC-9…AC-14 của hồ sơ trước.
- **Mã hoá kho ở bản OSS** — codec là seam, để trống có chủ ý (kế thừa hồ sơ trước).
- **Versioning / migrate schema `settings.json`** — chưa có nhu cầu.
- **Đo tính nguyên tử bằng cách giết tiến trình thật** — bất định theo máy và theo tải;
  khẳng định người-đọc-song-song ở AC-6 rẻ hơn và phân biệt được cùng một thứ.
- **Chống hai tab cùng ghi (khoá file)** — `PUT` đã là thay-toàn-bộ từ trước; tính nguyên
  tử chống *file cụt*, không chống *ghi đè lẫn nhau*. Khác bài toán.

## Notes

Bất biến kế thừa từ `chong-mat-khoa-byo`, **không được vi phạm**:

- `loadEnvStore` (đường CHẠY) vẫn khoan dung — kho hỏng KHÔNG được chặn một lượt chạy.
  AC-9 củng cố vế này chứ không lật nó.
- Bốn mã lý do `io | decode | parse | shape` giữ nguyên tên; AC-2 và AC-3 tái dùng `shape`
  chứ không thêm mã thứ năm.
- Bộ thử chạy trên **thư mục tạm thật**, không mock seam lưu trữ — chú thích đầu
  `env-store.server.test.ts` ghi rõ vì sao, và đó cũng là điều làm AC-6 đo được.
- Mọi ca thử dùng giá trị khoá **giả**; kho thật chứa API key.
