---
schema_version: 1
feature: chống đọc sai êm ru — bộ đọc phải TỪ CHỐI thay vì phát ra nội dung sai
slug: chong-doc-sai-em-ru
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [sdk, web-ui, docs]
status: implemented
approved_by: Phan Le Manh
approved_at: 2026-08-27
---

# Hợp đồng: chống đọc sai êm ru

## Vì sao có hợp đồng này

`normalize-text-vi` hứa một điều: **clip không phát ra sai giá hay sai ngày**. Qua 11 vòng
nghiệm thu, mọi lỗi đắt nhất đều **cùng một hình dạng** — không phải "từ chối đọc" mà là
**đọc ra nội dung sai với `ok=True`**, trong khi cả hai lớp canh đều mù đúng theo thiết kế:

- hậu kiểm chỉ bắt **chữ số còn sót**, nên một câu đã thành chữ hết thì luôn sạch;
- luật quan hệ mất-chữ-tiền chỉ chạy khi **đầu vào có dấu hiệu tiền**, nên bất kỳ đường nào
  làm `has_money` trả False cũng tắt luôn cái canh duy nhất.

Hợp đồng gốc đã đóng từng ca một khi chúng lộ ra. Hợp đồng này đóng **cái lớp**.

**Nguyên tắc xuyên suốt:** giữa *từ chối đọc* và *đọc sai*, luôn chọn **từ chối**. Một câu bị
chặn thì người dùng thấy; một giá đọc sai thì không ai thấy cho tới khi khách hàng nghe.

## Criteria

- AC-1: (sdk) Given một chuỗi chứa **dấu gạch kiểu chữ** — en dash `–` (U+2013), em dash `—`
  (U+2014), hoặc dấu trừ Unicode `−` (U+2212) — When chuẩn hoá, Then đọc **giống hệt** dạng
  ASCII tương ứng.
  *Đo thật trên nhánh `feat/normalize-text-vi` (2026-08-25), tất cả `ok=True`:*
  `Giá 5 – 10 triệu` → "giá năm **mười** triệu" (mất chữ "đến");
  `Giá 5−10 triệu` → "giá năm **tháng** mười triệu" (thư viện đọc thành ngày tháng);
  `Nhiệt độ −7 độ` → "nhiệt độ **-bảy** độ" (chữ "âm" không bao giờ được đọc).
  *Dạng ASCII đều đúng, nên đây thuần tuý là lỗ hổng lớp ký tự ở `_RANGE`, `_NEGATIVE` và
  `_RESIDUAL`. Ca ÂM bắt buộc: gạch nối trong từ ghép tiếng Việt (`ki-lô-mét`) không được đụng.*

- AC-2: (sdk) Given một chuỗi chứa **URL hoặc đường dẫn**, When chuẩn hoá, Then hoặc đọc đúng
  phần văn bản quanh nó, hoặc `success:false` — **không** được trả `ok=True` với chuỗi rỗng
  hay bị cắt cụt. *(Rủi ro để lại từ vòng 3, chưa có ca đo.)*

- AC-3: (sdk) Given một chuỗi `số-gạch-số` mang nghĩa **khác khoảng** — ngày kiểu ISO `2026-08-19`, mã đơn
  `A-123-B`, điện thoại viết gạch `0901-234-567` — When chuẩn hoá, Then **không** đọc thành
  "đến". *(Hôm nay cả ba đều thành "đến" với `ok=True`; đã ghim làm giới hạn đã biết ở
  `CORPUS_RANGE_NEGATIVE_KNOWN_LIMIT`, hợp đồng này biến giới hạn đó thành yêu cầu.)*

- AC-4: (sdk) Given một **token thương hiệu chữ La-tinh viết hoa lẫn** (`VNDirect`, `VNDS`,
  `H.264`), When chuẩn hoá, Then token giữ nguyên hoặc đọc theo cách khai rõ, và phép đọc
  **idempotent**.
  *Đo thật: `Công ty VNDirect niêm yết` → "công ty **ndi re** niêm yết" ngay lần đầu, đọc lại
  lần hai thành "**di re**" — vi phạm AC-7 của hợp đồng gốc. `VNDS` không sao. Hiện đang khai
  ngoại lệ ở `IDEMPOTENCE_EXCLUDED` kèm phép đo tự đỏ nếu giới hạn này lành.*

- AC-5: (sdk) Given **mọi** mục trong từ điển viết tắt và tiền tố hành chính, When chuẩn hoá,
  Then mỗi mục có ít nhất một ca đo dương và một ca âm chứng minh mỏ neo chữ cái có tác dụng.
  *(Hôm nay 6/11 mục chưa có ca nào — `VNDirect` → "đồngirect" và `H.264` → "huyện 264" đều
  từng lọt đúng vì thiếu ca âm.)*

- AC-6: (sdk) **THU HẸP tại S4 vòng 2, 2026-08-28 — owner chọn ngả (b)**. Given bộ đọc từ chối
  một chuỗi, When nó trả kết quả, Then mỗi đường từ chối mang một **mã ổn định máy đọc được**
  (`EMPTY_INPUT` / `RESIDUAL_TOKENS` / `MONEY_UNIT_LOST`) kèm danh sách cụm chặn; câu tiếng Việt
  trong `error` chỉ còn để cho log. *Nửa này đo bằng E10, hai chiều: không mã lạ, không mã khai
  mà không đường nào sinh.*

  **Nửa hiển thị — "câu theo ngôn ngữ người dùng" — HOÃN, ở lại trong hạng mục 1.3.** Không phải
  vì khó, mà vì hai điều kiện tiên quyết nằm ngoài phạm vi hồ sơ này và **đo được**:

  1. **Không có bên GHI để đo ngược.** Plugin `normalize-text-vi` đã bị **rút khỏi manifest**
     ngày 2026-08-26 (repo mà `origin` của nó trỏ tới không tồn tại công khai). Không plugin nào
     phục vụ slot này, nên đường plugin → câu chưa từng chạy thật được lần nào, và mọi fixture
     buộc phải bịa. Đo tại S4 vòng 2: fixture tôi dựng khai `residual = ('đ', '/')` trong khi
     bên ghi thật trả `('/',)` — ba file kiểm đồng thuận với nhau về một khuôn chưa từng tồn tại.
  2. **Máy chạy luồng chủ động vứt mã.** `sdk/tongflow/engine/runner.py:540` đổi node
     `success=False` thành `RuntimeError(str(error))`, và dòng `raise` nằm **trên** dòng ghi
     `node_outputs[node_id]`. Nên với mọi lượt chạy cả luồng — cách dùng bình thường của node
     này — `code` và `residual` bị nuốt thành một chuỗi trước khi tới giao diện. Sửa việc đó là
     chạm `sdk/**`: đường t3, kéo cả hồ sơ lên T3 kèm một chuyến phát hành SDK, mà executor đã
     triển khai thì ghim `tongflow` lúc cấp phát và không tự trôi lên.

  Hai lần thử đóng nửa này ở S4 (vòng 1 và vòng 2) đều tái hiện **cùng một lớp lỗi** — câu dựng
  đúng, chỗ gọi không bao giờ chạy — nên điều khoản dừng-vá kích hoạt và owner chốt thu hẹp.
  Văn bản gốc giữ lại làm sử liệu: *(cross-layer)* Given bộ đọc từ chối một chuỗi, When lỗi hiện
  cho người dùng, Then thông điệp hiển thị **theo ngôn ngữ của người dùng**, không phải tiếng
  Việt cứng trong SDK.

- AC-7: ~~(web-ui)~~ **HOÃN SANG HẠNG MỤC 1.4** *(bước dò T0, 2026-08-27 — điều kiện đảo
  chiều owner ký sẵn ở Gate 1.5 đã kích hoạt)*. Đo được hai dữ kiện: plugin TTS duy nhất
  (`tongflow-modal-qwen3tts`) **không kiểm** giá trị `language`, nó đi thẳng tới model; và
  danh mục shipped đúng **10 ngôn ngữ**, không có tiếng Việt — chính comment của file khai
  đó là bộ giá trị tham số của Qwen3-TTS. Thêm mục 'Tiếng Việt' hôm nay là hứa thay cho một
  model không nói được nó, và plugin sẽ **không báo lỗi** — đúng hình dạng thất-bại-theo-
  chiều-mở mà hợp đồng này lập ra để chặn. Tiêu chí chuyển sang hợp đồng con của hạng mục
  1.4 (plugin TTS ElevenLabs, tiếng Việt), nơi nó có nghĩa thật.
  Văn bản gốc giữ lại làm sử liệu: Given người dùng dựng luồng giọng đọc, When họ muốn khai luồng là tiếng Việt,
  Then bộ chọn ngôn ngữ **có mục tiếng Việt**.
  *Đây là mảnh sản phẩm còn thiếu khiến việc thu hẹp cảnh báo TTS phải gỡ bỏ hai lần
  (vòng 7 và 8): danh mục có 11 mục, không mục nào là tiếng Việt, và mặc định `clone` là
  `"Auto"` = tự dò ngôn ngữ. Có mục này thì mới thu hẹp được cảnh báo mà không thất bại theo
  chiều mở.*

- AC-8: (đo lường) Given một phép đo **tuyên quét cả lớp**, When nó chọn tập chủ thể, Then tập
  đó **không được chọn bằng chính thuộc tính đang đo**.
  *Đo thật: `E18` tuyên soi mọi khoá executor suy pin, nhưng chọn chủ thể bằng `grep
  'vietnormalizer'` — mà sau khi gộp nguồn, từ đó chỉ còn nằm **trong chính thông điệp mỏ neo**
  nó đi kiểm. Khoá nào mất mỏ neo cũng mất luôn từ khoá, nên không bị soi. Phép chứng minh đỏ
  cũ "qua" chỉ vì cách phá tình cờ để lại từ đó.*

- AC-9: (sdk) Given chuỗi có chữ **"ngày"** đứng trước một token **hình dạng** ngày mà thư viện
  **không parse được** — `ngày 12/25/2026` (kiểu Mỹ), `ngày 32/8/2026` (ngày không tồn tại) —
  When chuẩn hoá, Then hoặc đọc đúng, hoặc `success:false`; **không** được im lặng nuốt chữ
  "ngày" và nuốt luôn một thành phần của ngày.
  *Đo thật trên `feat/normalize-text-vi` (2026-08-26), tất cả `ok=True`:*
  `ngày 12/25/2026` → "mười hai **tháng hai**/hai nghìn không trăm hai mươi sáu" — mất chữ
  "ngày", **mất hẳn số 25**, đọc thành **tháng 2**, và còn nguyên dấu `/`.
  `ngày 32/8/2026` → "ba mươi hai**/**tháng tám năm…".
  *Nguyên nhân: luật xoá chữ "ngày" chạy vô điều kiện trên mọi token khớp hình dạng
  `d{1,2}[/-]d{1,2}[/-]d{4}`, dựa vào giả định thư viện sẽ tự thêm lại — giả định chỉ đúng khi
  thư viện parse được. Ngày Việt hợp lệ (`ngày 19/8/2026`) vẫn đọc đúng.*

- AC-10: (sdk) Given đầu ra còn **dấu gạch chéo** mà thư viện để nguyên dưới dạng ký tự, When hậu
  kiểm, Then tính là token chưa đọc được.
  *Đo thật: `Giá 50.000 đ/kg` → "giá năm mươi nghìn đồng**/kg**", `Lãi 5%/năm` → "lãi năm phần
  trăm**/năm**", đều `ok=True`, `residual` rỗng. `đ/kg` và `%/năm` là cách viết giá và lãi suất
  phổ biến nhất trong đúng loại nội dung slot này phục vụ. Đáng chú ý: `100km/h` thư viện đọc
  đúng thành "ki lô mét trên giờ", nên đây là lỗ hổng theo ca chứ không phải toàn bộ.*
  *Đây cũng là cơ chế khiến AC-9 im lặng: khi thư viện parse hụt, thứ nó bỏ lại là `/`, không
  phải chữ số, nên lớp hậu kiểm — vốn chỉ soi `[0-9₫%]` — hoàn toàn mù.*
  **Luật này QUAN HỆ, không phải hình dạng** *(sửa tại S4 vòng 2)*: đòi cả hai nửa — đầu RA còn
  dấu gạch chéo **và** đầu VÀO có dấu gạch chéo sát chữ số, dấu phần trăm, hoặc ký hiệu tiền
  theo sau chữ số. Bản chỉ soi đầu ra từ chối cả văn xuôi thường: `và/hoặc`, `TP/HCM`, `nam/nữ`,
  `N/A` đều ra `ok=False` trong khi chuỗi đọc đã đúng — một lần từ chối oan chặn cả dây giọng
  đọc trên đoạn văn không có lấy một con số. Đây đúng khuôn mà luật dấu hai chấm của hợp đồng
  gốc đã phải sửa vì cùng lý do; ca âm nay nặng ngang ca dương trong bộ ca.

- AC-11: (đo lường) Given họ ca "Đ nhập nhằng" *(kéo vào từ triage chữ ký Cổng 2 hợp đồng
  gốc, owner 2026-08-27)*, When khai bộ ca, Then bộ ca là **ma trận khai-trước** hai trục
  {dấu ngăn: cách · tab · xuống dòng · NBSP · không có} × {token theo sau: chữ · số · dấu
  phẩy · kết chuỗi}, mỗi ô có ca hoặc nằm trong danh sách bỏ-có-tên kèm lý do, và assert nêu
  **ĐÚNG TÊN Ô** còn trống.
  *Hôm nay bộ ca là danh sách phẳng 17 dòng: vòng 17 và vòng 19 của hợp đồng gốc mỗi lần đều
  phải thêm bốn dòng SAU khi có người soi ra — thay vì phép đo tự nói ô nào trống. Sáu họ anh
  em cùng file đều đã theo khuôn ma trận.*

- AC-12: (cross-layer) Given người dùng lưu hoặc chạy một luồng có node giọng đọc *(kéo vào từ
  triage chữ ký Cổng 2 hợp đồng gốc, owner 2026-08-27)*, When node đọc-số **chưa cài được**
  (không plugin nào nhận slot), Then **không hiện** cảnh báo bảo họ thêm node đó; cảnh báo chỉ
  hiện khi hành động nó gợi ý làm được thật.
  *Hôm nay cảnh báo hiện vô điều kiện trên MỌI lần lưu/chạy/xuất, trỏ tới một node không nằm
  trong picker nào và không plugin nào thực thi được — plugin đã rút khỏi danh sách chính thức
  vì kho origin chưa tồn tại công khai. Ca ÂM bắt buộc: khi plugin có mặt trở lại, cảnh báo
  phải hiện lại đúng như cũ.*

## Coverage — bộ tiêu chí phủ những trục nào

- **Trục ký tự**: gạch kiểu chữ (AC-1) · dấu phân cách trong URL/đường dẫn (AC-2)
- **Trục hình dạng dễ nhầm**: `số-gạch-số` không phải khoảng (AC-3) · token La-tinh (AC-4)
- **Trục phủ từ điển**: mọi mục có ca dương + ca âm (AC-5)
- **Trục người đọc**: mã từ chối ổn định máy đọc được (AC-6, nửa SDK) · ~~thông điệp theo ngôn ngữ người dùng (AC-6, nửa hiển thị — HOÃN, ở lại 1.3, xem AC-6)~~ · ~~khai được tiếng Việt (AC-7 — HOÃN sang 1.4, xem AC-7)~~ **hai ô sau CỐ Ý TRỐNG ở hồ sơ này**
- **Trục hậu kiểm mù**: token thư viện bỏ lại KHÔNG phải chữ số nên lớp hậu kiểm không thấy —
  dấu gạch chéo còn sót trong đầu ra (AC-10) · ngày khớp hình dạng nhưng thư viện không parse
  được (AC-9). *Đây là cơ chế trung tâm nêu ở §Vì sao có hợp đồng này; thiếu trục này thì một
  lượt cắt phạm vi có thể gỡ đúng hai AC bịt lỗ gốc mà bản đồ phủ vẫn trông đủ.*
- **Trục tự soi**: phép đo không được tự chọn chủ thể theo thứ nó đo (AC-8)
- **Trục bộ-ca-tự-lộ-ô-trống**: họ ca nhập nhằng theo ma trận khai-trước (AC-11)
- **Trục cảnh báo khả thi**: chỉ khuyên điều làm được thật (AC-12)

## Known limits — khai rõ, không để im

- **Token La-tinh bị nuốt chữ một cách ỔN ĐỊNH vẫn lọt** *(đo S4 vòng 3)*. Lưới AC-4 quyết định
  bằng **tính ổn định** — đọc hai lần ra khác nhau thì từ chối — chứ không bằng **bảo toàn**.
  Nên `Mã AbCd và XyZw` ra `mã a và xi du` với `ok=True`: `AbCd` mất 3/4 ký tự nhưng mất **y
  hệt nhau** ở cả hai lần đọc, nên không có gì đỏ. Đây là đúng hình dạng "đọc sai mà nói ok" mà
  hợp đồng lập ra để chặn, và nó **chưa** đóng. Không đóng ở hồ sơ này vì chốt bảo toàn (so độ
  dài / số âm tiết đầu ra với token vào) là một họ luật mới cần bộ ca riêng, không phải một
  dòng thêm vào lưới đang có. Bộ ca hiện chỉ ghim `VNDirect` (ca không ổn định) và `iPhone`
  (ca lành), nên nó **không** phân biệt được "lưới có răng" với "lưới bắt đúng một ca đã biết".

- **Dạng chữ thường của token thương hiệu** (`vndirect`) không có tín hiệu cấu trúc nào tách
  khỏi một từ tiếng Việt. Cùng lý do, `Mail` đọc thành `mêu`.

- **`Mã đơn 1234-5678`** không phân biệt được với một khoảng thật.

## Out of scope

- Sửa chính thư viện `vietnormalizer` — ta ghim phiên bản và bọc, không fork.
- Đọc ngôn ngữ khác ngoài tiếng Việt.
- Giọng theo vùng miền, và phần phát thành tiếng.
- Thu hẹp cảnh báo xuất bản theo ngôn ngữ — chỉ mở lại **sau** khi AC-7 xong.

## Ghi chú cho Cổng 1

Hồ sơ này viết 26/08, **trước** năm vòng nghiệm thu cuối của hợp đồng gốc. Cập nhật hiện
trạng tại 27/08 (sau khi PR #77 merge):

1. **ĐÃ ĐÓNG, không còn là việc của hợp đồng này:** mục cũ "`Đ` hoa trong câu thường đọc
   thành đường" — luật đường đã gỡ hẳn (từ chối cả họ), và các vòng 17–21 nới luật từ chối
   sang mọi dấu ngăn + token theo sau là số/dấu phẩy. `Giá 1.999.000 Đ Bao gồm VAT` nay bị
   TỪ CHỐI, đã ghim trong bộ ca của hợp đồng gốc.
2. **Mục cũ về `E18` chọn chủ thể bằng thuộc tính đang đo** đã trở thành AC-8 của chính hợp
   đồng này — không còn là ghi chú ngoài lề.
3. AC-1/AC-9/AC-10 có số đo từ 25–26/08; các bản vá vòng 17–21 không chạm ba họ này (chỉ chạm
   họ dấu phẩy và họ Đ-nhập-nhằng) nên số đo còn nguyên giá trị — S4 sẽ đo lại làm bằng chứng.
