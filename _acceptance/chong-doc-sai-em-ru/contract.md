---
schema_version: 1
feature: chống đọc sai êm ru — bộ đọc phải TỪ CHỐI thay vì phát ra nội dung sai
slug: chong-doc-sai-em-ru
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [sdk, web-ui, docs]
status: draft
approved_by:
approved_at:
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

## Tiêu chí nghiệm thu

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

- AC-3: (sdk) Given `số-gạch-số` **không phải khoảng** — ngày kiểu ISO `2026-08-19`, mã đơn
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

- AC-6: (cross-layer) Given bộ đọc từ chối một chuỗi, When lỗi hiện cho người dùng, Then thông
  điệp hiển thị **theo ngôn ngữ của người dùng**, không phải tiếng Việt cứng trong SDK.
  *Hôm nay `normalize_vi()` trả câu tiếng Việt trong trường `error` và nó đi thẳng ra giao
  diện ở cả 5 locale. Trái ngay với khuôn mà chính nhánh gốc dựng cho cảnh báo xuất bản: mã
  máy đọc được + câu người sống trong 5 file ngôn ngữ. Hướng: mã ổn định
  (`EMPTY_INPUT` / `RESIDUAL_TOKENS` / `MONEY_UNIT_LOST`) + khoá i18n; `error` để cho log.*

- AC-7: (web-ui) Given người dùng dựng luồng giọng đọc, When họ muốn khai luồng là tiếng Việt,
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

## Coverage — bộ tiêu chí phủ những trục nào

- **Trục ký tự**: gạch kiểu chữ (AC-1) · dấu phân cách trong URL/đường dẫn (AC-2)
- **Trục hình dạng dễ nhầm**: `số-gạch-số` không phải khoảng (AC-3) · token La-tinh (AC-4)
- **Trục phủ từ điển**: mọi mục có ca dương + ca âm (AC-5)
- **Trục người đọc**: thông điệp lỗi theo ngôn ngữ người dùng (AC-6) · khai được tiếng Việt (AC-7)
- **Trục tự soi**: phép đo không được tự chọn chủ thể theo thứ nó đo (AC-8)

## Out of scope

- Sửa chính thư viện `vietnormalizer` — ta ghim phiên bản và bọc, không fork.
- Đọc ngôn ngữ khác ngoài tiếng Việt.
- Giọng theo vùng miền, và phần phát thành tiếng.
- Thu hẹp cảnh báo xuất bản theo ngôn ngữ — chỉ mở lại **sau** khi AC-7 xong.

## Ghi chú cho Cổng 1

Hai mục dưới đây **không** thuộc hợp đồng này mà là lỗi của hợp đồng gốc, đang nằm trong cây
đóng băng và cần owner quyết riêng:

1. **`Đ` hoa trong câu thường bị đọc thành "đường"** — `Giá 1.999.000 Đ Bao gồm VAT` →
   "…nghìn **đường** bao gồm…", và `has_money` trả False nên luật quan hệ tắt. Đây là **vi phạm
   AC-6 của hợp đồng gốc** (đầu vào có dấu tiền, đầu ra không có chữ tiền) và là **hồi quy do
   luật `STREET_PATTERN` thêm ở vòng 6** — comment chỉ khai giới hạn cho chữ VIẾT HOA TOÀN BỘ,
   nhưng câu viết thường cũng dính.
2. **`E18` chọn chủ thể bằng chính thuộc tính đang đo** (xem AC-8) — làm mệnh đề "quét cả lớp"
   của AC-16 hợp đồng gốc thành vô căn cứ.
