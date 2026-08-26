## Trong hợp đồng

- **Mirror of the same rule: an address with a lowercase street name is read as money, ok=True**
  file: `sdk/tongflow/text/vi_dictionary.py:90`
  severity: medium
  AC: AC-6
  detail: STREET_PATTERN requires `[_UPPER]` after the space, so an address whose street name is not capitalised never reaches the street branch and falls through to `_SPACED_DONG` / `_MONEY` instead. Measured:

    'Số 5 đ. lê lợi'  -> has_money=True, ok=True, 'số năm ĐỒNG. lê lợi'
    'Số 5 Đ. lê lợi'  -> has_money=True, ok=True, 'số năm ĐỒNG. lê lợi'

  This is precisely the S4-round-6 defect STREET_PATTERN was written to fix ("Số 5 Đ. Lê Lợi read out as 'số năm đồng. lê lợi' with ok=True"), still live for any input where the street name is lowercase — common in user-typed listing copy. The money-loss relation cannot catch it because it confirms itself against the 'đồng' the rewrite just injected, exactly as the comment at test_normalize_vi.py:280 describes. CORPUS_STREET (test_normalize_vi.py:291) only contains capitalised street names, so nothing goes red.
  rationale: Sửa đổi vòng 6 của AC-6 cam kết nguyên tắc chung "Đ. là Đường, không phải đồng" để sửa đúng lỗi "Số 5 Đ. Lê Lợi đọc thành đồng"; ca đo được ở đây là cùng một lỗi, chỉ khác tên đường viết thường, nên nguyên tắc đó vẫn chưa được giữ đủ.
  source: bugs

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **New node has no picker affordance, so the TTS-order warning it exists for is unactionable**
  Người dùng thấy gì: Khi lưu workflow có giọng đọc mà thiếu bước đọc số/giá thành chữ, hệ thống báo cảnh báo bảo người dùng tự thêm node đó — nhưng bấm nút thêm node ở đúng chỗ lại không thấy tùy chọn này, nên không có cách tự sửa cảnh báo ngay trên giao diện.
  file: `src/hooks/use-node-actions.tsx:599`
  severity: high
  Đề xuất: new-contract

- **STREET_PATTERN rewrites a sentence-final currency mark into "đường" — price silently unspoken, ok=True**
  Người dùng thấy gì: Một câu giá kết thúc bằng 'đ.' ngay trước câu tiếp theo (ví dụ 'Giá 500 đ. Bao gồm VAT') có thể bị đọc thành tên đường 'đường' thay vì số tiền, nên giọng đọc ra sai nội dung giá trong khi hệ thống vẫn báo thành công.
  file: `sdk/tongflow/text/vi_dictionary.py:89`
  severity: high
  Đề xuất: known-limits

- **Shape 5 — tuyên quét LỚP (từ điển viết tắt) nhưng chỉ có điểm-case, không ma trận viết-trước**
  Người dùng thấy gì: Từ điển viết tắt địa danh/hành chính chỉ được kiểm bằng vài ví dụ chọn sẵn chứ chưa kiểm hết toàn bộ danh sách viết tắt hỗ trợ, nên nếu sau này ai đó vô tình làm mất một viết tắt khác trong từ điển, hệ thống vẫn báo mọi kiểm tra đều qua trong khi viết tắt đó không còn được đọc đúng thành lời.
  file: `sdk/tests/test_normalize_vi.py:584`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
