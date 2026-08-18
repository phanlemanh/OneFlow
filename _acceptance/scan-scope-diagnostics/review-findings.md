## Trong hợp đồng

- **A file that will not decode aborts the whole registry scan instead of naming itself**
  file: `sdk/tongflow/scan.py:149`
  severity: medium
  AC: AC-8
  The new arm reads `except (OSError, SyntaxError) as exc:` and its comment claims "A file that will not parse HAS a reason." Two common unparseable shapes are not in that tuple: non-UTF-8 bytes raise `UnicodeDecodeError` from `path.read_text(encoding='utf-8')`, and a NUL byte in the source raises `ValueError` from `ast.parse` — both subclasses of `ValueError`, not `OSError`.

  Those escape `_scan_methods_by_slot_in_file`, escape `_scan_methods_by_slot_in_dir`, and escape the per-plugin loop in `scan()`, which has no try/except around it. Reproduced against HEAD with two plugin dirs, one healthy and one holding `entry.py` with a 0xff byte:

      RAISED UnicodeDecodeError 'utf-8' codec can't decode byte 0xff in position 5

  The healthy plugin never registers. This breaks the invariant the file itself documents at scan.py:506-509 — "Every other per-plugin failure in this loop is reported through `errors` and skipped rather than raised, because one broken plugin must not cost the registry every other one" — and which `read_plugin_rev` is explicitly written to honour (scan.py:511-514 catches RuntimeError). The catch set predates this PR, but this PR is the one that reworks the path and asserts completeness over it, and `parse_failure_reason(exc: OSError | SyntaxError, ...)` bakes the narrow set into the shared helper's signature. Widening to `(OSError, ValueError, SyntaxError)` (SyntaxError is not a ValueError, so it must stay listed) makes the claim true.

  Rationale: AC-8 requires that a plugin file which cannot be read produces a named problem for that plugin rather than propagating; an uncaught decode failure means no problem is ever reported and the scan aborts, directly failing AC-8's Then clause.

- **A non-UTF-8 .py file in any plugin crashes the whole scan, producing no registry at all**
  file: `sdk/tongflow/scan.py:149`
  severity: medium
  AC: AC-8
  `path.read_text(encoding="utf-8")` raises `UnicodeDecodeError`, a subclass of `ValueError`, which is not caught by `except (OSError, SyntaxError) as exc`. The exception escapes `_scan_methods_by_slot_in_file` -> `_scan_methods_by_slot_in_dir` -> `scan()` entirely, so a single mis-encoded file in one third-party plugin takes down discovery for *every* plugin rather than degrading one entry.

  Reproduced: a healthy plugin plus `latin1.py` written as `b"# caf\xe9 comment\nx = 1\n"` gives `CRASH: UnicodeDecodeError 'utf-8' codec can't decode byte 0xe9 in position 5`, with no payload returned.

  The `except` tuple is pre-existing, but this diff rewrote that handler and states its contract as "A file that will not parse HAS a reason." A file that cannot be decoded is precisely that case and is not covered. `_scan_slot_models_in_dir` (line ~233) has the same narrow tuple. Fix: catch `UnicodeDecodeError` (or `ValueError`) alongside `OSError`/`SyntaxError` and route it through `parse_failure_reason`.

  Rationale: Same as the other decode-failure finding on this file/line: AC-8 requires a read failure to be reported as a named problem for the offending plugin, not to crash the entire scan function and take down every other plugin's registration.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **A deploy.py that will not parse is reported twice, byte-identically**
  Người dùng thấy gì: Khi file deploy.py của một plugin bị lỗi, tác giả có thể thấy đúng một thông báo lỗi bị lặp lại y hệt hai lần trong danh sách lỗi, dễ gây hiểu lầm là có hai vấn đề trong khi chỉ có một.
  file: `sdk/tongflow/scan.py:387`
  severity: high
  Đề xuất: known-limits

- **Unrelated sdk/uv.lock regeneration rides along in a scoped PR**
  Người dùng thấy gì: Bản vá này kèm theo một thay đổi không liên quan trong tệp khoá phụ thuộc của SDK Python, làm phạm vi thay đổi của PR rộng hơn cam kết ban đầu, dù không ảnh hưởng trực tiếp tới người dùng.
  file: `sdk/uv.lock:18`
  severity: low
  Đề xuất: known-limits

- **An unparseable deploy.py is reported twice with byte-identical messages**
  Người dùng thấy gì: Khi file deploy.py của một plugin bị lỗi cú pháp, tác giả có thể thấy đúng một thông báo lỗi xuất hiện hai lần y hệt nhau trong danh sách lỗi, khiến việc đọc log gây nhầm lẫn.
  file: `sdk/tongflow/scan.py:395`
  severity: medium
  Đề xuất: known-limits

- **A broken file anywhere in the plugin tree silently swallows the real "no @node_slot found" diagnostic**
  Người dùng thấy gì: Nếu bất kỳ tệp nào trong plugin — kể cả một tệp không liên quan như file mẫu hay thư viện đi kèm — bị lỗi cú pháp, tác giả plugin có thể không còn thấy được lý do thật khiến plugin của mình chưa đăng ký được, khiến việc tự gỡ lỗi khó hơn.
  file: `sdk/tongflow/scan.py:422`
  severity: medium
  Đề xuất: known-limits

- **Tuyên quét LỚP nhưng chỉ chạy điểm-case: teeth mode re-chạy 2/5 test mà eval khai là E7..E10**
  Người dùng thấy gì: Kịch bản tự kiểm tra dùng để bảo đảm các bài test thật sự phát hiện được lỗi lại tuyên bố chạy nhiều bài test hơn số nó thực sự chạy, nên một số thay đổi làm hỏng chẩn đoán trong tương lai có thể lọt qua mà không bị phát hiện dù script này báo ổn.
  file: `scripts/plugins/check-diagnostics-teeth.sh:122`
  severity: medium
  Đề xuất: known-limits

- **Số assert = 1 cho cả batch: expect_red chỉ đòi MỘT test trong nhóm đỏ và mang needle**
  Người dùng thấy gì: Kịch bản tự kiểm tra coi cả một nhóm bài test là đã được bảo vệ chỉ cần một bài trong nhóm đó phát hiện được lỗi, nên các bài còn lại trong nhóm có thể âm thầm mất khả năng phát hiện lỗi mà không ai biết cho tới khi sự cố thật xảy ra.
  file: `scripts/plugins/check-diagnostics-teeth.sh:23`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

(rỗng — không có finding nào chưa adversarial-verify)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).