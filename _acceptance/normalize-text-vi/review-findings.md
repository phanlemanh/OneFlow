## Trong hợp đồng

### Tuyên quét lớp "từ điển hành chính / đơn vị đo" nhưng chỉ có điểm-case: 6/11 mục từ điển và đơn vị kg không có ca nào
- file: `sdk/tests/test_normalize_vi.py:411`
- severity: medium
- AC: AC-4
- detail: Hình dạng #5 (tuyên quét LỚP nhưng chỉ có điểm-case, thiếu ma trận toàn phần viết-trước).

  Ma trận viết-trước duy nhất cho AC-4 là `ID_TYPES × ID_POSITIONS` (dòng 290-291, kiểm ở dòng 411-417) = 3×3 = 9 ô, và 9 ô đều có ca. Nhưng trục mà lời hứa thực sự nói tới — từng MỤC của từ điển ngành trong kho — không có ma trận nào, khác hẳn CORPUS_MONEY và CORPUS_TIME (cả hai đều có `covered` + `DELIBERATELY_UNCOVERED_*_CELLS` cộng lại đúng bằng tích Descartes: 11+14=25 và 14+10=24).

  `sdk/tongflow/text/vi_dictionary.py` khai 11 mục: `_ABBREVIATIONS` = TP.HCM, TPHCM, TP.HN, CMND, CCCD, BĐS; `_PREFIXES` = TP., TT., Q., P., H. Corpus (CORPUS_ID, dòng 260-289) chỉ chạm 5 mục: TP.HCM (abbrev), TP. / Q. / P. / H. (prefix). Grep toàn bộ `sdk/tests/` + `src/` không có một lần xuất hiện nào của TPHCM, TP.HN, CMND, CCCD, BĐS, TT. — xoá thẳng bất kỳ mục nào trong 6 mục đó khỏi `_ABBREVIATIONS`/`_PREFIXES` thì mọi test vẫn xanh.

  Điều này làm sai mệnh đề chiều-đỏ ghi trong `expected` của E4 (`_acceptance/normalize-text-vi/evals.yaml`): "Chiều đỏ: bỏ một mục từ điển → assert đỏ nêu đúng viết tắt không bung" — đúng với 5 mục, sai với 6 mục còn lại.

  Cùng hình dạng, cùng test: `expected` của E4 kể tên ba đơn vị "m², km/h, kg bung đúng". Corpus có `85m2` và `60 km/h`; `kg` chỉ xuất hiện trong hàm suy loại ở dòng 389 (`any(u in fragment for u in ("m2", "km/h", "kg"))`) chứ không có ca nào đo — không assert nào chạm tới việc kg bung ra chữ. Dạng superscript `m²` mà eval nêu cũng không có ca (corpus chỉ dùng `m2`).
- source: measurement

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

<<<OOC-ITEM-TEMPLATE
- **_SPACED_DONG chạy trước _RANGE, phá mỏ neo `đ` — dải giá viết cách mất hẳn chữ "đến" mà vẫn ok=True**
  Người dùng thấy gì: Với một số cách viết giá có khoảng trắng (ví dụ "từ 1.000 đ - 2.000 đ" hoặc viết bằng chữ "đồng"), một khoảng giá có thể bị đọc rời thành hai giá riêng lẻ thay vì một khoảng — mất chữ "đến" nối hai mức giá, dễ khiến người nghe hiểu sai giá.
  file: `sdk/tongflow/text/normalize_vi.py`
  severity: high
  Đề xuất: new-contract
OOC-ITEM-TEMPLATE>>>

<<<OOC-ITEM-TEMPLATE
- **Test "registers ... when mounted" không mount node — tự gọi registerAbiNode rồi đọc lại**
  Người dùng thấy gì: Một bài kiểm tự ghi rồi tự đọc lại thông tin thay vì thật sự đặt node lên bảng vẽ để kiểm, nên nếu phần đăng ký của node bị hỏng thật trong sản phẩm, hệ thống kiểm tra tự động sẽ không phát hiện ra.
  file: `src/components/workspace/nodes/transfer/normalize-text-vi.test.tsx`
  severity: medium
  Đề xuất: known-limits
OOC-ITEM-TEMPLATE>>>

<<<OOC-ITEM-TEMPLATE
- **normalize_vi() returns ok=True with an EMPTY / truncated string — no output-loss check**
  Người dùng thấy gì: Khi câu chứa đường link web, bước đọc thành chữ có thể xoá sạch cả câu hoặc cắt mất một phần nội dung trong khi hệ thống vẫn báo "thành công", khiến giọng đọc tự động phát ra một câu trống rỗng hoặc cụt lủn mà không ai được cảnh báo.
  file: `sdk/tongflow/text/normalize_vi.py`
  severity: high
  Đề xuất: new-contract
OOC-ITEM-TEMPLATE>>>

<<<OOC-ITEM-TEMPLATE
- **_RANGE rewrites any digit-hyphen-digit as "đến" — mangles ISO dates and dashed phone numbers**
  Người dùng thấy gì: Một số chuỗi có dấu gạch ngang nhưng không phải là khoảng giá — như ngày viết kiểu quốc tế (2026-08-19) hoặc số điện thoại có gạch nối (0901-234-567) — có thể bị đọc nhầm thành một dãy số nối bằng chữ "đến", khiến người nghe hiểu sai ngày tháng hoặc số điện thoại, kể cả làm mất số 0 ở đầu số điện thoại.
  file: `sdk/tongflow/text/normalize_vi.py`
  severity: high
  Đề xuất: new-contract
OOC-ITEM-TEMPLATE>>>

<<<OOC-ITEM-TEMPLATE
- **check-normalize-registration.sh dies silently at the call-site count under `set -e`**
  Người dùng thấy gì: Một kịch bản kiểm tra nội bộ dùng để đảm bảo tính năng đã được gắn đúng chỗ có thể âm thầm dừng lại mà không in ra cảnh báo nào khi có người vô tình xoá mất đoạn gắn cảnh báo liên quan, khiến đội ngũ không biết tính năng đã bị hỏng.
  file: `scripts/plugins/check-normalize-registration.sh`
  severity: medium
  Đề xuất: known-limits
OOC-ITEM-TEMPLATE>>>

<<<OOC-ITEM-TEMPLATE
- **ui-capture --require refuses to write but leaves the previous run's PNG/HTML in place**
  Người dùng thấy gì: Khi công cụ chụp ảnh màn hình dùng làm bằng chứng từ chối ghi vì phát hiện trang chưa đúng, nó vẫn có thể để lại ảnh chụp cũ của lần chạy trước tại đúng vị trí, khiến người xem tưởng nhầm đó là bằng chứng của lần kiểm mới nhất.
  file: `scripts/ui-capture.mjs`
  severity: low
  Đề xuất: known-limits
OOC-ITEM-TEMPLATE>>>

<<<OOC-ITEM-TEMPLATE
- **Fixture viết tay đúng khuôn bên đọc — test "registers ... when mounted" không hề mount, tự ghi registry rồi đọc lại chính nó**
  Người dùng thấy gì: Một bài kiểm tự ghi rồi tự đọc lại thông tin thay vì thật sự đặt node lên bảng vẽ để kiểm, nên nếu phần đăng ký của node bị hỏng thật trong sản phẩm, hệ thống kiểm tra tự động sẽ không phát hiện ra.
  file: `src/components/workspace/nodes/transfer/normalize-text-vi.test.tsx`
  severity: high
  Đề xuất: known-limits
OOC-ITEM-TEMPLATE>>>

⚠ Cụm ngoài vùng phủ: 4/8 lỗi rơi vào file không bộ đo nào phủ (sdk/tongflow/text/normalize_vi.py, scripts/ui-capture.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.