## Trong hợp đồng

### Hình dạng 5 — tuyên quét LỚP nhưng phép đo chỉ chạy điểm-case: 45/60 assert của tts-order-guard không eval nào chọn
- file: `src/lib/workflow/tts-order-guard.test.ts:103`
- severity: high
- AC: AC-10
- source: measurement
- detail: Ba executor duy nhất đọc file này đều lọc bằng `-t`: `unit_tts_order_violation` (-t violation), `unit_tts_order_compliant` (-t compliant), `unit_tts_family_matches_abi` (-t two-way) (_acceptance/config.yaml). Describe `language scope` ở dòng 103 không khớp chuỗi nào trong ba nhãn đó, nên toàn bộ khối này KHÔNG bao giờ chạy dưới E10a/E10b/E10c. Đo được tại chỗ: `pnpm vitest run src/lib/workflow/tts-order-guard.test.ts -t violation` → 5 passed | 55 skipped; `-t compliant` → 8 passed | 52 skipped; `-t two-way` → 2 passed | 58 skipped. Tổng 15/60. 45 test còn lại đúng bằng khối `language scope`: it.each(TTS_SLOTS × LANGUAGES) = 4×11 = 44 ô, cộng test 'has no Vietnamese option to scope on'. Đây chính là ma trận toàn phần viết-trước mà chú thích ở dòng 94-102 nói là bài học của hai lần revert scoping ('both suites stayed green because the tests supplied language values by hand'). Ma trận đó tồn tại trong file nhưng nằm ngoài mọi phép đo nghiệm thu — cùng lớp lỗi mà E11b đã ghi nhận ở S4-r2 ('quan hệ này sống ở node-id executor không chọn').
- rationale: Khối 'language scope' (44 ô TTS_SLOTS×LANGUAGES + ca 'no Vietnamese option') chính là cơ chế vòng 9 dựng ra để ghim AC-10 'trở lại KHÔNG điều kiện'; không eval nào chọn khối này nghĩa là yêu cầu cảnh báo-không-điều-kiện của AC-10 không được đo, có thể trôi trở lại trạng thái bị thu hẹp mà không đỏ.

### Hình dạng 5 — 10/18 hàm test của corpus vàng không executor nào chọn, trong đó có chính guard làm cho lời hứa 'TOÀN corpus' của E7 không rỗng
- file: `sdk/tests/test_normalize_vi.py:1133`
- severity: high
- AC: AC-7
- source: measurement
- detail: evals.yaml khai 8 node-id pytest cho file này (test_numbers_and_money_golden, test_datetime_golden, test_identifiers_units_abbrev_golden, test_ambiguous_policy_pinned, test_residual_tokens_fail_and_are_listed, test_clean_input_has_no_digits_left, test_idempotent_and_byte_identical, test_edge_inputs). File có 18 hàm test. Không eval nào của feature dùng khoá `sdk_pytest` chạy cả bộ, nên 10 hàm sau không nằm trong bất kỳ phép đo nghiệm thu nào: test_both_money_rules_read_the_same_magnitude_list (211), test_currency_word_survives_magnitude_word (251), test_iso_currency_codes_are_case_insensitive (371), test_ambiguous_undotted_d_refuses_rather_than_guessing (388), test_unambiguous_money_marks_still_read (401), test_comma_separated_lists_are_not_decimals (488), test_vietnamese_grouped_amounts_read_at_the_right_scale (498), test_brand_tokens_survive_currency_and_prefix_rules (794), test_idempotence_exclusions_are_still_broken (1117), test_determinism_sweep_covers_every_declared_corpus (1133). Nặng nhất là cái cuối: E7 (`sdk_pytest_normalize_idempotent`) chỉ chạy test_idempotent_and_byte_identical, hàm này quét ALL_CORPUS được dựng từ _DECLARED_CORPORA — nếu ai thêm một corpus mà quên khai vào tuple đó thì ALL_CORPUS lặng lẽ co lại và E7 vẫn xanh. Hàm 1133 là thứ duy nhất biến 'TOÀN corpus' thành phép đo, và nó không được chọn.
- rationale: test_determinism_sweep_covers_every_declared_corpus là chính phép đo mà amendment vòng 6 của AC-7 yêu cầu ('có phép đo tự đỏ khi ai đó thêm bộ mới mà không ghi danh'); hàm này không nằm trong danh sách node-id được evals.yaml chọn nên yêu cầu đó của AC-7 hiện không được đo.

### Hình dạng 5 — 'ma trận toàn phần, mỗi ô ≥1 ca' của E2/E3 thật ra là 11/25 và 14/24 ô, phần còn lại xả bằng frozenset không assert nào kiểm
- file: `sdk/tests/test_normalize_vi.py:83`
- severity: medium
- AC: AC-2
- source: measurement
- detail: E2 khai expected 'MA TRẬN TOÀN PHẦN — trục {linh, lẻ, mốt, lăm, mươi} × {chục, trăm, nghìn, triệu, tỷ}, mỗi ô ≥1 ca'. Thực tế MONEY_MATRIX_CELLS phủ 11 ô; DELIBERATELY_UNCOVERED_MONEY_CELLS (dòng 83-100) nuốt 14 ô còn lại, trong đó cả 5 ô của biến thể 'linh' — tức một phần tử của trục MONEY_VARIANTS không hề được chạy qua normalize_vi lần nào. E3 tương tự: DELIBERATELY_UNCOVERED_TIME_CELLS (dòng 601) xả 10/24 ô. Vấn đề đo lường: không có test nào kiểm lý do xả còn đúng, khác hẳn IDEMPOTENCE_EXCLUDED được test_idempotence_exclusions_are_still_broken (dòng 1117) canh 'exclusion đã tự lành là một lời nói dối trong file'. Chú thích ở dòng 76-82 tự thừa nhận bản trước của chính frozenset này khai sai ('lăm','triệu') là bất khả trong khi '25 triệu' sinh ra nó — nghĩa là ô có thể rơi vào danh sách xả bằng một câu văn sai mà không có gì đỏ. Đối chiếu: E5 khai tường minh cơ chế DELIBERATELY_UNCOVERED_RANGE_CELLS trong expected, E2/E3 thì không, nên lời eval và phép đo đang nói hai con số khác nhau.
- rationale: AC-2 nói rõ 'mỗi ô ma trận có ít nhất một ca... ô trống làm phép đo đỏ kèm tên ô'; 14/25 ô (gồm toàn bộ biến thể 'linh') bị xả qua một frozenset không assert nào canh, tức các ô đó có 0 ca mà không có phép đo nào đỏ — vi phạm trực tiếp câu chữ của AC-2.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Shared `machine-cleared` × signature rule is dead code, re-implemented in bash — the exact drift the module forbids**
  Người dùng thấy gì: Hai chỗ trong công cụ kiểm duyệt nội bộ đang chép lại cùng một quy tắc theo hai cách khác nhau; nếu chỉ sửa một chỗ mà quên chỗ kia, công cụ có thể bỏ lọt các trường hợp mâu thuẫn mà lẽ ra phải báo lỗi.
  file: `lib/workspace-record.cjs`
  severity: high
  Đề xuất: new-contract

- **TTS-order warning instructs users to add a node that is unreachable in the shipped product**
  Người dùng thấy gì: Khi thiếu bước đọc số trước giọng đọc, cảnh báo hiện ra hướng dẫn người dùng thêm một khối xử lý, nhưng trên bản sản phẩm tiêu chuẩn hiện tại không có cách nào thêm được khối đó, nên người dùng không thể làm theo hướng dẫn này.
  file: `src/lib/workflow/exporter.ts`
  severity: medium
  Đề xuất: known-limits

- **New guard script mixes Vietnamese and English operator output after the branch standardised guard messages on English**
  Người dùng thấy gì: Một số thông báo kỹ thuật của công cụ kiểm tra nội bộ đang lẫn giữa tiếng Việt và tiếng Anh; đây chỉ hiện ra khi lập trình viên chạy kiểm tra nội bộ, không ảnh hưởng tới người dùng sản phẩm.
  file: `scripts/abi/check-normalize-sdk-published.sh`
  severity: low
  Đề xuất: known-limits

- **check-manifest-unmoved.sh header still declares "THIRD edition" / "SNAPSHOT of three PRs" after being re-cut twice more**
  Người dùng thấy gì: Một ghi chú giải thích trong công cụ kiểm tra nội bộ nói sai số lần chỉnh sửa trước đó, có thể khiến người bảo trì sau đọc nhầm lịch sử; việc này không ảnh hưởng gì tới người dùng cuối.
  file: `scripts/plugins/check-manifest-unmoved.sh`
  severity: low
  Đề xuất: known-limits

- **Phân số có số 0 đứng đầu bị đọc mất số 0 — sai một bậc, ok=True, mọi guard im**
  Người dùng thấy gì: Khi phần thập phân của một con số bắt đầu bằng số 0 (ví dụ lãi suất 7,05%), hệ thống có thể đọc thành một con số khác hẳn (ví dụ 7,5%) mà vẫn báo là đọc thành công, khiến người nghe hiểu sai số tiền hoặc lãi suất thực tế.
  file: `sdk/tongflow/text/normalize_vi.py`
  severity: high
  Đề xuất: new-contract

- **Docstring của has_money khẳng định một bước xử lý không còn tồn tại trong hàm**
  Người dùng thấy gì: Một dòng ghi chú trong mã mô tả sai một bước xử lý không còn tồn tại; đây chỉ là tài liệu lỗi thời, kết quả người dùng nhận được vẫn đúng như bình thường.
  file: `sdk/tongflow/text/normalize_vi.py`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 6 — đo cây của tác giả thay vì cây đang kiểm: E17a/E17b chỉ chạy được trên máy này**
  Người dùng thấy gì: Phép kiểm plugin thật hiện chỉ chạy đúng ý nghĩa trên máy của người phát triển; ở máy khác phép kiểm này không xác nhận được điều gì cả, đúng như giới hạn đã được ghi nhận và chờ kho công khai được xuất bản.
  file: `scripts/plugins/run-normalize-plugin-tests.sh`
  severity: high
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).