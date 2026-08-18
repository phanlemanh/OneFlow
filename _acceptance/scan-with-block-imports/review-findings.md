## Trong hợp đồng

### Shape 5 — trục "đường tiêu thụ" tuyên quét cả LỚP nhưng chỉ đo một đường: AC-1 và AC-2 cùng chạy qua parse_deploy_py
- file: `sdk/tests/test_scan_scope.py:112`
- severity: medium
- source: measurement
- AC: AC-2

contract.md Coverage khai trục **Đường tiêu thụ** gồm hai phần tử — `scan.py` (quét mọi tệp `.py`, đường entry-file) và `parse_deploy.py` (class `@deploy`) — và ghi rõ "Phủ bởi AC-1, AC-2 (mỗi đường một ca)"; AC-2 nói "Given the same import shape in a plugin file scanned by **the entry-file path**".

Nhưng `_write_plugin` (test_scan_scope.py:92-101) ghi `entry.py` chỉ chứa `def main(): json.dump({}, sys.stdout)` — KHÔNG có `@node_slot`, KHÔNG có import model — rồi đặt toàn bộ class + method vào `deploy.py`. Nên trong `test_scan_with_image_imports_registers_and_is_quiet` (:112-121), `scan()` chạy `_scan_methods_by_slot_in_dir` không tìm thấy gì ở mức module (method có `self` → `slot_rejection_reason(..., input_index=0)` loại, và nó không nằm trong `module_level` nên cũng không sinh rejection), rồi rơi xuống nhánh fallback `parse_deploy_py(deploy_py)`. Tức AC-2 đo lại đúng đường mà AC-1 đã đo, chỉ thêm một lớp `scan()` bọc ngoài.

Ô còn lại của trục — hàm mức module mang `@node_slot` trong `entry.py` với import model nằm trong khối không mở phạm vi, đọc bởi `_scan_methods_by_slot_in_file` (scan.py:141-186) — không có assert nào trong gói. `_ENTRY_BAD` (:395-400) là chỗ duy nhất viết `entry.py` có `@node_slot`, nhưng nó chú thích `dict`/`dict` và không hề có câu import `tongflow.models` nào, nên nó đo nhánh reason chứ không đo nhánh đăng-ký-qua-khối.

Ô này có thật và chạy được: probe với `entry.py` = `if True:\n    from tongflow.models.compose_overlay import ...` + hàm `@node_slot` mức module cho `nodePluginMap['compose-overlay'] == ['oneflow-api-probe']`, `errors == []`. Đúng hình dạng lỗi gốc của gói, trên đúng đường mà bảng Coverage khai là đã phủ, mà không phép đo nào chạm tới. Số assert (1 đường) < số phần tử của lớp đã tuyên (2 đường).

Rationale: AC-2 yêu cầu bằng chứng đo đúng "đường tiêu thụ" entry-file (scan() quét entry.py), nhưng fixture đưa toàn bộ hàm vào deploy.py nên phép đo thực chạy qua parse_deploy_py — cùng đường AC-1 đã đo — khiến AC-2 không được xác minh đúng như tiêu chí của chính nó.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Rejection diagnostics are gated on `tree.body` membership, so the exact idiom this change enables stays silent**
  Người dùng thấy gì: Nếu hàm xử lý slot được đặt bên trong một khối lệnh (if/with/try) thay vì nằm thẳng trong file, hệ thống báo lỗi chung chung "không tìm thấy phương thức nào" thay vì chỉ đúng nguyên nhân thật, khiến người viết plugin mất thời gian tự dò lỗi.
  file: `sdk/tongflow/scan.py`
  severity: high
  Đề xuất: new-contract

- **Legacy `Inference` fallback overwrites `slot_problems`, dropping @deploy-class diagnostics**
  Người dùng thấy gì: Trong một số cấu trúc file hiếm gặp, lý do lỗi thật của plugin có thể bị một class không liên quan tên là Inference che mất, khiến người viết plugin nhận thông báo sai về nguyên nhân slot của họ bị bỏ qua.
  file: `sdk/tongflow/parse_deploy.py`
  severity: medium
  Đề xuất: known-limits

- **New scanner rejection diagnostics are not documented in docs/plugins.md**
  Người dùng thấy gì: Tài liệu hướng dẫn viết plugin chưa giải thích các loại lỗi mới và quy tắc "import phải ở cấp module", nên người viết plugin mới có thể không hiểu vì sao slot của họ bị từ chối.
  file: `docs/plugins.md`
  severity: low
  Đề xuất: known-limits

- **Rejection reason is dropped for @node_slot functions nested in a module-level block — the exact idiom this change enables**
  Người dùng thấy gì: Nếu hàm xử lý slot được đặt bên trong một khối lệnh (if/with/try) thay vì nằm thẳng trong file, hệ thống báo lỗi chung chung "không tìm thấy phương thức nào" thay vì chỉ đúng nguyên nhân thật, khiến người viết plugin mất thời gian tự dò lỗi.
  file: `sdk/tongflow/scan.py`
  severity: high
  Đề xuất: new-contract

- **@deploy class slot problems are overwritten by the legacy Inference path**
  Người dùng thấy gì: Trong một số cấu trúc file hiếm gặp, lý do lỗi thật của plugin có thể bị một class không liên quan tên là Inference che mất, khiến người viết plugin nhận thông báo sai về nguyên nhân slot của họ bị bỏ qua.
  file: `sdk/tongflow/parse_deploy.py`
  severity: medium
  Đề xuất: known-limits

- **parse_deploy_py's duplicate-slot error is discarded and replaced by the misleading generic message**
  Người dùng thấy gì: Khi file cấu hình của plugin khai trùng một slot trên hai class khác nhau, hệ thống chỉ báo chung chung "không tìm thấy phương thức" thay vì nêu rõ đúng nguyên nhân và vị trí lỗi, khiến người viết plugin khó tìm ra nguyên nhân thật.
  file: `sdk/tongflow/scan.py`
  severity: medium
  Đề xuất: known-limits

- **~100x scan slowdown: full-AST import walk recomputed per annotation check**
  Người dùng thấy gì: Với các file plugin lớn, việc quét danh sách plugin có thể chậm đi đáng kể (đo được khoảng 100 lần so với trước), làm tăng thời gian chờ khi cài đặt hoặc làm mới danh sách plugin.
  file: `sdk/tongflow/_ast_utils.py`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 — nửa chokepoint của check-scan-blast-radius là assertion âm-tính-một-mình, không có đối chứng dương như nửa version**
  Người dùng thấy gì: Cơ chế tự động kiểm tra "không đụng vào các file nhạy cảm" có thể âm thầm mất tác dụng nếu các thư mục đó bị đổi tên hoặc đường dẫn kiểm tra bị gõ sai sau này, mà không ai phát hiện ra, tạo cảm giác an toàn giả.
  file: `scripts/plugins/check-scan-blast-radius.sh`
  severity: medium
  Đề xuất: known-limits

- **Shape 1 — hai script "răng" grep chính CHUỖI TRONG THÔNG ĐIỆP ASSERT của test, không phải đầu ra sản phẩm**
  Người dùng thấy gì: Các kịch bản dùng để đảm bảo bài kiểm thử thật sự phát hiện đúng lỗi có thể báo "ổn" ngay cả khi bài kiểm thử thất bại vì một lý do khác, làm giảm độ tin cậy của bằng chứng kiểm thử.
  file: `scripts/plugins/check-scope-walker-teeth.sh`
  severity: low
  Đề xuất: known-limits

- **Shape 3 — E9 hứa QUAN HỆ "distinct from E7 and E8" nhưng assert chỉ là "chuỗi có mặt"**
  Người dùng thấy gì: Bài kiểm tra cho một loại thông báo lỗi không thật sự xác nhận thông báo đó khác biệt với hai loại thông báo lỗi còn lại, nên nếu sau này các thông báo bị gộp nhầm với nhau, sẽ không có gì phát hiện ra để cảnh báo.
  file: `sdk/tests/test_scan_scope.py`
  severity: low
  Đề xuất: known-limits

- **Shape 2 — fixture chốt bằng hash CỦA CHÍNH NÓ, không phải round-trip đối chiếu bên viết**
  Người dùng thấy gì: Bản mẫu dùng để kiểm thử tự đối chiếu với chính nó chứ không đối chiếu với plugin thật đang chạy trên máy, nên nếu bản mẫu bị lệch so với plugin thật theo thời gian, sẽ không có gì phát hiện ra.
  file: `sdk/tests/fixtures/scan_scope/plugins/oneflow-modal-compose-overlay/deploy.py.sha256`
  severity: low
  Đề xuất: known-limits

## Chưa phân loại (triage-failed)

phân loại phạm vi không chạy được — không lỗi nào bị máy tự sửa, người xem lại toàn bộ.

### `parse_deploy_py`'s error is discarded in `scan()`, so a broken deploy.py is reported as "no @node_slot found in entry.py"
- file: `sdk/tongflow/scan.py:374`
- severity: medium
- source: conventions

Line 374: `dscan, _derr = parse_deploy_py(deploy_py)` — the error string is bound to `_derr` and never used. `parse_deploy_py` returns `(None, err)` for a SyntaxError/OSError in deploy.py and for the duplicate-slot case (`Duplicate @node_slot(...) on multiple @deploy classes ...; fix: keep one @node_slot implementation per slot`), so `dscan` is `None`, `rejections` stays empty, and the block at line 401 (`if not rejections:`) emits the generic entry.py message.

Verified: a plugin whose deploy.py contains `def broken(:` yields only `.../entry.py:1: no @node_slot(NodeSlots.XXX) methods found; ...` — the actual syntax error is never surfaced.

This contradicts the principle this very commit states in the comment at line 399-400 ("A specific reason at the defining line says strictly more than 'nothing found in entry.py' — the generic line yields to it") and the repo/global rule "Never silently swallow errors" (~/.claude/rules/common/coding-style.md). `_derr` should join `rejections`/`errors` the same way `dscan.slot_problems` now does.

⚠ Cụm ngoài vùng phủ: 3/13 lỗi rơi vào file không bộ đo nào phủ (docs/plugins.md, scripts/plugins/check-scan-blast-radius.sh, sdk/tests/fixtures/scan_scope/plugins/oneflow-modal-compose-overlay/deploy.py.sha256) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.