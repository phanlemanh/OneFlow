# Review Findings: normalize-text-vi (round 5)

## Trong hợp đồng

- **Bare "đ" after a magnitude word reaches the voice with ok=True (money rules never fire)**
  file: `sdk/tongflow/text/normalize_vi.py:46`
  severity: high
  AC: AC-6
  detail: Both `_SPACED_DONG` (line 46, `(?<=\d)\s+(?i:đ)\b`) and `_MONEY` (line 96, `(?<=\d)\s*(?i:đ)\b`) anchor the currency abbreviation on a DIGIT immediately to its left. The extremely common sales form `<số> <đơn vị lớn> đ` ("5 tỷ đ", "500 triệu đ", "500 nghìn đ") puts a word between the digit and the "đ", so: (a) the pre-pass does not rewrite it to "đồng", (b) `has_money()` returns False, so the relational money-loss rule at line 206 never runs, and (c) `_RESIDUAL` (line 73) only flags `[0-9₫%]` and digit-hyphen-digit, so a bare letter "đ" is not residual. Result: ok=True with the currency unit unspoken. This is the same class Gate 2 round 2/3 already raised scope for (spaced-đ prices), just with a magnitude word in between, and it is not listed under contract.md "Known limits".

    Measured (uv, vietnormalizer==0.2.3, this branch):
      'Giá 5 tỷ đ'        -> money_in=False ok=True  out='giá năm tỷ đ'        residual=()
      'Giá 500 triệu đ'   -> money_in=False ok=True  out='giá năm trăm triệu đ' residual=()
      'Căn hộ 2 tỷ đ, view sông' -> ok=True out='căn hộ hai tỷ đ, viu sông'

    Fix direction: anchor the currency rules on "digit-or-magnitude-word + đ", or make the money test a relation on the input token "đ" independent of what precedes it.
  failure_scenario: Real-estate copy "Căn hộ 2 tỷ đ, view sông" goes into normalize-text-vi -> returns success=True, text='căn hộ hai tỷ đ, viu sông' -> TTS speaks the price with no currency unit (or spells the letter), and every guard downstream stays green.
  source: bugs
  rationale: AC-6 quy định luật quan hệ không điều kiện vị trí: đầu vào có dấu hiệu tiền "đ" thì đầu ra phải chứa từ chỉ tiền tương ứng, và chuỗi đo được ("Giá 5 tỷ đ" vẫn còn ký tự "đ" trong đầu vào) vi phạm đúng luật này khi đầu ra không có "đồng".

- **Hình dạng 2 — fixture đăng ký VIẾT TAY đúng khuôn bên đọc; không có round-trip mount→registry**
  file: `src/components/workspace/nodes/transfer/normalize-text-vi.test.tsx:182`
  severity: high
  AC: AC-9
  detail: Test tên là "registers under the right ABI feature when mounted" nhưng KHÔNG mount node: nó tự gọi `registerAbiNode({nodeId, feature: "normalize-text-vi", sourceSpec: NODE_TYPE_SOURCE_SPEC.normalizeTextViNode})` (dòng 183-187) rồi đọc lại `getAbiNodeRegistration(NODE_ID)` (dòng 191-195). Bên GHI thật là `use-abi-execution.ts:152` (registerAbiNode chạy lúc AbiNodeShell mount) — đường đó không hề bị chạy trong assert này; cái được so là chính payload mà test vừa tự viết ra theo đúng khuôn bên đọc. Vòng vá S4-r1 chỉ đóng nửa ĐỌC ("đọc lại registry chứ không assert hằng khai báo"), nửa GHI vẫn hở. Đo được ngay: xoá lời gọi registerAbiNode trong src/hooks/use-abi-execution.ts thì cả ba test trong file này, cả normalize-text-vi-export.test.ts và cả tts-order-guard.test.ts vẫn xanh — vì cả ba file đều tự đăng ký bằng tay (normalize-text-vi-export.test.ts:64-70, tts-order-guard.test.ts:58-64). Đúng chế độ hỏng mà chính comment đầu tts-order-guard.test.ts (dòng 7-11) cảnh báo: registry rỗng ⇒ exporter phát 0 executable node ⇒ file workflow rỗng trông vẫn hợp lệ. Round-trip khả thi và rẻ: `renderNode()` ở dòng 108-144 đã mount node thật (afterEach đã unregister NODE_ID), chỉ cần assert registry SAU render thay vì sau lời gọi tay. Chưa được khai ở Known limits của contract.md lẫn decisions.jsonl (decision d-20260821T031100Z-9965 chỉ descope round-trip của conformance fixture AC-12, không phải chỗ này).
  failure_scenario: (không cung cấp riêng — xem detail: xoá registerAbiNode trong use-abi-execution.ts, cả ba test suite liên quan vẫn xanh, nghĩa là một registry rỗng thực tế sẽ khiến exporter phát workflow 0 node mà không test nào đỏ.)
  source: measurement
  rationale: AC-9 đòi "When render node và export, Then handles đúng..."; test hiện tại không thực sự mount node nên không đo được đúng mệnh đề này, và mục "Luật dừng vòng verify" của chính hợp đồng xếp loại "finding về phép đo (test không đo thứ nó tên)" vào diện phải sửa trong vòng, không phải mở hồ sơ follow-up.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Release-train guard hardcodes the vietnormalizer version its own header forbids hardcoding**
  Người dùng thấy gì: Một script kiểm tra tự động phục vụ việc phát hành có thể báo lỗi sai và chặn bản phát hành hợp lệ vào lần tới khi số phiên bản thư viện đọc được cập nhật đúng quy trình, dù thực chất không có gì sai.
  file: `scripts/abi/check-normalize-sdk-train-local.sh`
  severity: low
  Đề xuất: known-limits

- **Shared sdk_pytest executor fails obscurely if the pin line ever moves**
  Người dùng thấy gì: Một cấu hình chạy kiểm thử dùng chung cho nhiều tính năng khác nhau có thể âm thầm hỏng theo cách khó hiểu nếu định dạng khai báo phiên bản thư viện thay đổi, khiến việc kiểm thử của các tính năng không liên quan cũng báo lỗi oan.
  file: `_acceptance/config.yaml`
  severity: low
  Đề xuất: known-limits

- **Amounts with both thousand dots and a decimal comma come back mangled, ok=True**
  Người dùng thấy gì: Một số dạng giá tiền viết theo chuẩn Việt Nam (có cả dấu chấm ngăn cách hàng nghìn lẫn dấu phẩy thập phân) có thể bị đọc thành một dãy chữ số sai hoàn toàn, trong khi hệ thống vẫn báo là đọc thành công.
  file: `sdk/tongflow/text/normalize_vi.py`
  severity: high
  Đề xuất: known-limits

- **ui-capture computes the document lang but never enforces it**
  Người dùng thấy gì: Ảnh chụp và bằng chứng thu thập để người duyệt xem xét thiết kế có thể âm thầm hiển thị sai phiên bản ngôn ngữ của giao diện mà không có cảnh báo nào, khiến người duyệt đánh giá nhầm dựa trên hình ảnh không đúng.
  file: `scripts/ui-capture.mjs`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 4/6 lỗi rơi vào file không bộ đo nào phủ (_acceptance/config.yaml, sdk/tongflow/text/normalize_vi.py, scripts/ui-capture.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
