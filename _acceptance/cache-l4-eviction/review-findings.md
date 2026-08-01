## Trong hợp đồng

(không có finding nào được map vào AC ở round này)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **resolve_cache_max_bytes misreads a boolean cap as a 1-byte cap instead of rejecting or defaulting**
  Người dùng thấy gì: Nếu hệ thống gửi lên giới hạn dung lượng cache dưới dạng đúng/sai (boolean) thay vì một con số, cache có thể bị hiểu nhầm là gần như đầy và bị xoá gần như toàn bộ ngay sau đó mà không có cảnh báo.
  file: `/Users/manh-macmini/dev/oneflow/sdk/tongflow/engine/node_cache.py`
  severity: low
  Đề xuất: known-limits

- **Invalid host-supplied cache_max_bytes silently falls back (and bool True yields a 1-byte cap)**
  Người dùng thấy gì: Khi giá trị giới hạn dung lượng cache được gửi lên không hợp lệ, hệ thống âm thầm bỏ qua và dùng giá trị mặc định mà không ghi lại cảnh báo nào, nên người vận hành khó biết cấu hình của họ đã không được áp dụng; nếu giá trị đó là đúng/sai (boolean), gần như toàn bộ cache có thể bị xoá ngay lập tức.
  file: `sdk/tongflow/engine/node_cache.py`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).