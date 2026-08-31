---
schema_version: 1
feature: Ô đo chạy 0 ca thử mà vẫn báo đạt — hàng rào ở chốt CI
slug: o-do-chay-0-ca-van-xanh
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ci]
status: approved
design_doc: docs/superpowers/specs/2026-08-31-o-do-chay-0-ca-van-xanh-design.md
approved_by: Phan Le Manh
approved_at: 2026-09-01
---

# Acceptance Contract: o-do-chay-0-ca-van-xanh

`pnpm vitest run <file> -t '<tên ca>'` **thoát 0 khi không ca nào khớp**. Một ô đo
dùng khuôn đó báo ĐẠT vĩnh viễn dù chưa chạy thử điều gì. Đã xảy ra thật ở lượt verify
đầu tiên của `kho-khoa-toan-ven` (31/08) — hai tiêu chí không hề có ca thử mà vẫn xanh.

**Đo trước khi thiết kế, CẢ HAI nhóm — 33/33 ô đang chạy ≥ 1 ca, không có lỗi nào để
sửa:**

| Khuôn lệnh | Số ô | Ô chạy ≥ 1 ca |
|---|---:|---:|
| gọi thẳng `vitest run <file> -t` | 23 | **23** |
| qua bộ bọc `run-one-test.sh` | 10 | **10** |
| **tổng** | **33** | **33** |

Bản nháp đầu chỉ đo nhóm 23 và tuyên "23/23 lành" — bỏ sót đúng nhóm mười ô **nơi lỗi
được phát hiện**. Vòng phản biện bắt được; số ở trên là lượt đo bù, 31/08. Nếu có ô
rỗng, nó phải thành một mục sửa CÓ TÊN kèm ô đo, tuyệt đối không được lấy đường rẻ là
sửa chuỗi lọc trong cấu hình của một hồ sơ ĐÃ KÝ.

Gói này thuần tuý là hàng rào. Rủi ro thật không phải gõ sai lúc viết, mà là **đổi tên một ca
thử sau này**, khi hồ sơ đã ký từ lâu và không ai còn soi.

Quyết định định hình của owner (31/08): **một bộ kiểm ở chốt CI**, không bọc từng ô đo.
Lý do và hai đường bị loại: design doc §3.

## Criteria

- AC-1: Given `_acceptance/config.yaml` có một ô đo lọc theo tên ca mà **không ca thử
  nào khớp**, When chạy bộ kiểm, Then nó **đỏ nêu đích danh khoá ô đo và chuỗi lọc**
  — không phải một câu chung "có ô đo hỏng". Đây là toàn bộ lý do gói việc tồn tại:
  cùng tình huống ấy hôm nay cho `exit=0`.
- AC-2: Given mọi ô đo đều khớp ít nhất một ca (tức cây hiện tại), When chạy bộ kiểm,
  Then nó **xanh** và in ra **tổng số ô đã kiểm CỘNG số theo từng khuôn**, và ba con số
  đó phải khớp một **bộ đếm độc lập**: **23 gọi thẳng + 10 qua bộ bọc = 33** (đo
  31/08). Đây là **nửa đàn áp**, và nó phải ghim SỐ chứ không chỉ đòi "lớn hơn 0":
  trạng thái nguy hiểm hơn ca 0 ô là **ca đếm THIẾU**. Một regex gom ô đo chỉ khớp dạng
  nháy đơn một dòng sẽ thấy 5 trên 33, in `đã kiểm 5 ô`, thoát 0 — AC-3 không kích vì
  khác 0, AC-6 vẫn xanh vì vẫn có mặt cả hai nhóm, và **28 ô nằm ngoài hàng rào trong
  khi mọi đèn đều xanh**.
- AC-3: Given bộ kiểm tìm thấy **0 ô đo** để kiểm, When nó kết thúc, Then nó **ĐỎ**,
  không xanh. Cửa quan trọng nhất: nếu khuôn lệnh đổi — ai đó chuyển hết sang một dạng
  khác — bộ kiểm sẽ im lặng phủ **không gì cả** mà vẫn báo đạt. Đó đúng là lớp lỗi
  gói này sinh ra để chặn, tái sinh bên trong chính nó.
- AC-4: Given một ô đo có `-t` mà bộ kiểm **không phân tích được** thành (file, chuỗi
  lọc), When chạy, Then nó **đỏ nêu tên khoá** — không bỏ qua im lặng. Bỏ qua một ô
  không hiểu được chính là cách một ô hỏng lọt qua.
- AC-5: Given `vitest list` chạy hỏng (không có `node_modules`, vitest lỗi), When chạy
  bộ kiểm, Then nó **đỏ nêu nguyên nhân** — tuyệt đối không kết luận "không có gì để
  kiểm". Một bộ kiểm không lấy được vật cần đối chiếu thì chưa kiểm gì cả.
- AC-6: Given bộ kiểm duyệt cấu hình, When nó gom danh sách ô đo, Then nó nhận **CẢ
  HAI** khuôn lệnh: gọi thẳng `vitest run <file> -t '<lọc>'`, **và** gọi qua bộ bọc
  `run-one-test.sh '<lọc>'`. Khuôn thứ hai do `kho-khoa-toan-ven` sinh ra hôm qua; bỏ
  sót nó thì **mười ô đo mới nhất vô hình với chính hàng rào này**.
- AC-13: Given một ô đo gọi vitest **qua một script chưa được nhận diện** (một bộ bọc
  mới, lệnh không hề có `-t`), When chạy bộ kiểm, Then nó **ĐỎ nêu tên khoá và tên
  script** — không được phân loại nó là "không lọc theo tên" rồi bỏ qua im lặng.
  Tiêu chí gom vì thế **không phải** "lệnh có `-t`" mà là "lệnh gọi vitest, trực tiếp
  hoặc qua bất kỳ script nào dưới `scripts/`".
  Vì sao: `run-one-test.sh` mới ra đời **hôm qua**. Hồ sơ tuần sau sinh một bộ bọc thứ
  hai theo đúng khuôn ấy, sáu ô đo mới dùng nó, không lệnh nào có `-t` — bộ kiểm xếp
  chúng vào nhóm không-lọc, bỏ qua, in một con số trông hợp lý, và xanh. Lớp lỗi tái
  sinh **y nguyên bên trong hàng rào vừa dựng**. Bản kê "đóng" ở Trục A là ảnh chụp
  hôm nay, không phải một bất biến — AC này là thứ làm nó thành bất biến.
- AC-7: Given khớp tên ca, When bộ kiểm so bộ lọc với danh sách ca, Then nó dùng
  **regex** đúng như `testNamePattern` của vitest, không phải so chuỗi con. Đo bằng
  **MA TRẬN BỐN BỘ LỌC phủ CẢ HAI chiều bất đồng**, số assert bằng số ô ma trận:
  khớp-regex-nhưng-không-khớp-chuỗi-con (vd `answers 503 .* code`),
  khớp-chuỗi-con-nhưng-không-khớp-regex, khớp cả hai, không khớp cả hai. Mỗi ô **thật
  sự chạy `vitest run -t`** với chuỗi đó và so số ca chạy được với phán quyết của bộ
  kiểm — chuẩn đối chiếu là **hành vi thật của vitest**, không phải một lời hứa trong
  văn xuôi.
  Một chuỗi tự chọn, một chiều là không đủ: chiều bất đồng còn lại chưa đo thì bộ kiểm
  có thể kết luận một ô đo THẬT là rỗng và làm CI đỏ trên mọi PR, hoặc tha một ô rỗng.
- AC-8: Given một PR có ô đo lọc hỏng, When CI chạy, Then job `Acceptance Gate` **đỏ**.
  Đo bằng cách **rút lệnh RA TỪ `ci.yml`** rồi chạy nó trên cây đã phá — đọc YAML là
  đo chỉ dẫn, chạy lệnh rút ra mới là đo hành vi.
- AC-9: Given job `Acceptance Gate`, When kiểm khả-năng-chạy, Then step mới **không
  mang `if:`**, job không mang `if:`/`needs:`, và trigger `pull_request` không lọc
  đường dẫn — cùng bất biến mà `cong-tu-canh-minh` đã dựng. Guard cắm điện mà không
  bao giờ chạy là nguyên trạng nó sinh ra để đóng.
- AC-10: Given `scripts/ci/check-gate-guards-job.sh`, When đọc `GUARD_NEEDLES`, Then
  guard mới có mặt trong đó. Không khai thì nó nằm **ngoài** mọi lớp `shape` /
  `no-softening` / `reachable` / `teeth` — một guard không được canh.
- AC-11: Given gói việc này đã hạ cánh, When CI chạy, Then vẫn đúng **6 job**, năm job
  `lint · typecheck · build · unit-tests · sdk-tests` **deep-equal** với merge-base, và
  `check-action-pins.sh` vẫn báo **8 site** `actions/checkout`. Gói này thêm step và
  thêm `pnpm/action-setup` vào một job **không** nằm trong năm job đó — ba con số này
  là cách chứng minh điều ấy chứ không chỉ nói.
- AC-12: Given mỗi phép đo mới của gói việc này, When nó được coi là xong, Then nó có
  **cặp hai chiều trên cùng một vật**: bản lành → xanh; phá bản sao → đỏ với thông điệp
  **ghim nêu đích danh** khoá ô đo hoặc chuỗi lọc, không chỉ mã thoát. Chiều đỏ do
  `scripts/ci/check-eval-filters-teeth.sh` chứng minh, `--case` địa chỉ hoá, một mã
  thoát mỗi ca, tên ca lạ → thoát 2.
  **Danh sách ca ghim ở ĐÂY, không ở `--list` của chính script** — chín ca:
  `clean`, `no-match`, `zero-executors`, `undercount`, `unparsable`, `list-broken`,
  `regex-semantics`, `unknown-wrapper`, `needle-missing`. Khẳng định case-completeness
  bằng chính `--list` là **hằng đúng**: script tự khai bao nhiêu ca thì thoả bấy nhiêu,
  nên bỏ bớt một ca vẫn xanh. Ca `clean` là **đối chứng dương có mã thoát riêng**:
  thiếu nó thì một bộ răng đọc ngược mã thoát cũng qua sạch mọi ca đỏ.

## Coverage

Quét bằng `morphological-scan` (tự dựng trục), hộp **khuôn lệnh × kiểu hỏng × nơi
chạy**.

- **Trục A — khuôn lệnh ô đo:** gọi thẳng `vitest -t` (23) | qua bộ bọc
  `run-one-test.sh` (10) | **qua một bộ bọc CHƯA BIẾT** | không lọc theo tên (chạy cả
  file). *Thước CE:* ba khuôn đầu đo được bằng `grep` trên `_acceptance/config.yaml`
  `[SUY-TỪ-REPO: _acceptance/config.yaml]`; khuôn thứ tư không mang lớp lỗi này (file
  vắng làm vitest đỏ) nên ở Out of scope.
  Giá trị thứ ba **sinh ra từ phản biện** và là giá trị quan trọng nhất của trục: bản
  kê "đóng" chỉ là **ảnh chụp hôm nay**, mà `run-one-test.sh` mới ra đời hôm qua. Một
  bộ bọc thứ hai tuần sau sẽ rơi khỏi bản kê và kéo theo mọi ô dùng nó. AC-13 biến bản
  kê thành bất biến bằng cách bắt bộ kiểm **ĐỎ trước cái nó chưa nhận diện**, thay vì
  im lặng xếp vào nhóm không-lọc.
- **Trục B — kiểu hỏng:** lọc không khớp ca nào | lệnh không phân tích được | công cụ
  liệt kê hỏng | **không tìm thấy ô nào để kiểm**. *Thước CE:* bốn hình dạng, mỗi
  hình một AC (AC-1, AC-4, AC-5, AC-3). Giá trị thứ tư là **bộ kiểm tự nó rỗng** —
  nó vào bản kê vì đúng lớp lỗi đang sửa, không phải vì suy luận.
- **Trục C — nơi hàng rào chặn:** vòng nghiệm thu | chốt CI. *Thước CE:* owner chốt
  chốt CI (§3); giá trị "vòng nghiệm thu" là đường bọc-từng-ô đã bị loại, ghi ở
  Out of scope kèm lý do.
- **Trục D — không hồi quy hạ tầng (cắt ngang):** 6 job | năm job không đổi định nghĩa
  | 8 site checkout. *Thước CE:* ba con số đo được hôm nay, và cả ba đều là guard của
  hồ sơ KHÁC mà gói này có thể vô tình làm đỏ — đó là lý do chúng thành một AC
  (AC-11) chứ không phải một dòng ghi chú.

**Ô Core 13/48 (27%)** *(hộp nở khi giá trị "bộ bọc chưa biết" sinh ra ở phản biện)* — trên ngưỡng 20% có chủ ý: AC-2 (nửa đàn áp), AC-3 (bộ kiểm tự
nó rỗng), AC-10 (guard được canh), AC-11 (không hồi quy) và AC-12 (cặp hai chiều) là
**nửa chống đỡ** của chính các ô thành công. Gói việc nhỏ nên tỉ lệ cao là hệ quả số
học, không phải thiếu cắt.

## Out of scope

- **Sửa 33 ô đo hiện có** — đo 31/08 trên CẢ HAI nhóm: **không ô nào hỏng**. Không có gì để sửa; đây là
  phát hiện làm gói việc nhỏ lại, và nó được ghi ra chứ không lặng lẽ bỏ.
- **Bọc từng ô đo** — loại ở quyết định owner. Đổi 23 dòng cấu hình ở vùng nhiều hồ sơ
  đã ký tham chiếu, và **ô viết sau này vẫn có thể quên dùng bọc** — hàng rào tự có lỗ.
- **Ô đo không lọc theo tên** — chạy cả file thì file vắng làm vitest đỏ; không mang
  lớp lỗi này.
- **Bộ lọc theo tên ở ngôn ngữ khác** (`pytest -k` trong làn SDK) — cùng lớp lỗi, khác
  công cụ và khác cách liệt kê. Đáng hồ sơ riêng **nếu đo ra có thật**; chưa đo.
- **Chuẩn hoá `run-one-test.sh` thành bộ bọc chung** — nó ghim cứng một file thử; tổng
  quát hoá thuộc đường bọc-từng-ô đã bị loại.
- **Bắt ô đo đỏ ngay trong vòng verify** — đánh đổi đã khai của đường được chọn: chốt
  CI chặn merge, nhưng một vòng verify chạy trên mã chưa merge vẫn thấy ô đo xanh.

## Notes

Bất biến của hồ sơ khác mà gói này **không được phá**:

- `cong-tu-canh-minh`: sáu job, năm job kia deep-equal merge-base. Gói này thêm step
  vào `acceptance-gate` — job **không** nằm trong năm job đó. AC-11 khẳng định điều ấy
  bằng số chứ không bằng lời.
- `ci-actions-bump`: `check-action-pins.sh` khẳng định đúng 8 site `actions/checkout`.
  Gói này thêm `pnpm/action-setup`, **không** thêm checkout.
- `kho-khoa-toan-ven`: `scripts/settings/run-one-test.sh` là khuôn lệnh thứ hai, và
  AC-6 buộc bộ kiểm nhận nó.
