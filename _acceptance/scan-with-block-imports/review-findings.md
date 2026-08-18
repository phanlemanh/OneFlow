## Trong hợp đồng

- **New eval executors address tests by -k substring instead of pytest node-id**
  file: `_acceptance/config.yaml:164`
  severity: medium
  AC: AC-3
  Lines 162-172 add ten executors that select tests with `-k` expressions (`-k 'non_scope_block or nested_blocks'`, `-k 'function_local or class_body'`, `-k deploy_with_image_imports`, …).

  Every pre-existing per-criterion pytest executor in this file uses an exact node-id, and the file states the convention inline at lines 44-47 and 65-67: "One key per criterion, each a distinct pytest node-id". The `-k` form is fail-open in a way node-ids are not: in `-k 'non_scope_block or nested_blocks'`, deleting or renaming `test_non_scope_block_collects_import` leaves the other half matching, so the eval stays green while the criterion it measures (AC-3's ten-keyword matrix, which E3's `expected` explicitly claims is "TEN separate assertions") is no longer being run at all. Nothing pins the collected count.

  The same `-k` or-chains are load-bearing in `scripts/plugins/check-scope-walker-teeth.sh` and `check-reason-teeth.sh`, so the teeth checks inherit the same slack.

  Use `tests/test_scan_scope.py::test_name` (parametrised ids where applicable), matching the surrounding entries.

- **Shape 3 — assert "chuỗi có mặt" trong khi lời hứa là QUAN HỆ (AC-7 tách vị trí khỏi lý do)**
  file: `sdk/tests/test_scan_scope.py:315`
  severity: medium
  AC: AC-7
  AC-7 hứa rõ một QUAN HỆ trên CÙNG một problem: file = file định nghĩa method, line = dòng của `def`, "together with the method name and the reason", và contract.md:72 nói thẳng "the relation is the point, not the presence of four substrings". Nhưng test đo bằng HAI lời gọi `any()` độc lập trên cùng một list: dòng 315 `assert any(m.startswith(f"{deploy}:{line}:") for m in problems)` và dòng 319 `assert any(REASON_NOT_SDK_MODEL in m for m in problems)`. Không có gì buộc hai điều kiện này rơi vào cùng một phần tử — một payload có problem A neo đúng `deploy.py:<line>:` nhưng mang lý do chung chung, cộng problem B ở dòng/khung khác tình cờ chứa câu REASON_NOT_SDK_MODEL, sẽ xanh cả hai assert. Chính test anh em ngay dưới đã làm đúng dạng quan hệ: test_reason_missing_annotation (dòng ~340) hợp nhất thành một vị từ `m.startswith(f"{deploy}:{line}:") and REASON_MISSING_ANNOTATION in m` trong một `any()`. AC-7 — tiêu chí duy nhất trong hồ sơ này lấy quan hệ làm luận điểm — lại là cái đo lỏng nhất họ nhà nó.

- **Shape 6 — DELTA hai điểm mã không chốt được là đã nạp đúng cây base (eval có thể xanh vĩnh viễn)**
  file: `scripts/plugins/check-scan-noise.sh:33`
  severity: medium
  AC: AC-11
  E11 tự khai là "DELTA across two code points": chạy scanner ở merge-base và ở HEAD trên cùng plugins/. Cơ chế chọn cây duy nhất là `PYTHONPATH="$1/sdk"` trong `ids_at()` (dòng 34) rồi `"$py" -m tongflow`. Với `python -m`, sys.path[0] là CWD và đứng TRƯỚC PYTHONPATH; đã kiểm chứng trên máy này: `cd sdk && PYTHONPATH=/tmp/fakesdk python3 -c 'import tongflow'` nạp /Users/manh-macmini/dev/oneflow/sdk/tongflow/__init__.py, tức PYTHONPATH bị che. Nếu script được gọi với cwd chứa gói `tongflow` (ví dụ sdk/), CẢ HAI lần chạy đều đo HEAD, `before` == `after` theo cấu trúc, `comm -13` luôn rỗng, và eval xanh mà chưa hề so hai điểm mã. Script không có assertion nào chốt `tongflow.__file__` của lần chạy base nằm dưới `$work/base/sdk`, trong khi đúng cái chốt đó đã được viết ở script anh em check-overlay-discoverable.sh:47-55, và chính test_scan_scope.py:test_reason_single_source còn cảnh báo bằng lời ("cwd must NOT be the repo's sdk/") rồi kiểm bằng probe subprocess. E11 là eval duy nhất giữ AC-11 nên chỗ hở này làm nó mất khả năng đỏ.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Diagnostic path still gated by tree.body, contradicting the scope-boundary rule the same commit introduced**
  Người dùng thấy gì: If a plugin author writes their handler method nested inside a conditional or try block (a style the project's own docs recommend), a mistake in that method can fail silently with a generic 'method not found' message instead of explaining what's actually wrong — making the real problem much harder to track down.
  file: `sdk/tongflow/scan.py:156`
  severity: high
  Đề xuất: new-contract

- **Fixture sha256 pin is self-referential and cannot detect the drift it claims to detect**
  Người dùng thấy gì: An internal safeguard meant to confirm a bundled test copy still matches the real official plugin does not actually check that — so if the real plugin changes shape later, this internal copy could quietly go stale without anyone being warned. This does not affect what end users see or use.
  file: `sdk/tests/fixtures/scan_scope/plugins/oneflow-modal-compose-overlay/deploy.py.sha256:1`
  severity: medium
  Đề xuất: known-limits

- **Legacy Inference branch replaces rather than merges slot_problems, dropping @deploy-class reasons**
  Người dùng thấy gì: In one uncommon way of structuring a plugin file, a specific explanation for why a method was rejected can get silently dropped and replaced with a vague 'method not found' message, making it harder for the plugin author to fix.
  file: `sdk/tongflow/parse_deploy.py:211`
  severity: low
  Đề xuất: known-limits

- **Legacy Inference branch overwrites @deploy slot_problems, silently dropping skip reasons**
  Người dùng thấy gì: In one uncommon way of structuring a plugin file, a specific explanation for why a method was rejected can get silently dropped and replaced with a vague 'method not found' message, making it harder for the plugin author to fix.
  file: `sdk/tongflow/parse_deploy.py:211`
  severity: medium
  Đề xuất: known-limits

- **parse_deploy_py error discarded in scan(), replaced by a misleading entry.py message**
  Người dùng thấy gì: If a plugin file has certain structural mistakes (such as declaring the same capability twice), the scanner shows a generic, unhelpful error instead of the specific, more useful explanation — making the real cause harder for the plugin author to find.
  file: `sdk/tongflow/scan.py:374`
  severity: medium
  Đề xuất: known-limits

- **Rejection reasons gated by tree.body identity, invisible for @node_slot defs inside module-scope blocks**
  Người dùng thấy gì: If a plugin author writes their handler method nested inside a conditional or try block (a style the project's own docs recommend), a mistake in that method can fail silently with a generic 'method not found' message instead of explaining what's actually wrong — making the real problem much harder to track down.
  file: `sdk/tongflow/scan.py:166`
  severity: medium
  Đề xuất: new-contract

- **Shape 2 — pin hash tự chiếu: chốt fixture với chính nó, không chốt round-trip từ plugin thật**
  Người dùng thấy gì: An internal safeguard meant to confirm a bundled test copy still matches the real official plugin does not actually check that — so if the real plugin changes shape later, this internal copy could quietly go stale without anyone being warned. This does not affect what end users see or use.
  file: `scripts/plugins/check-overlay-discoverable.sh:22`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/10 lỗi rơi vào file không bộ đo nào phủ (sdk/tests/fixtures/scan_scope/plugins/oneflow-modal-compose-overlay/deploy.py.sha256, _acceptance/config.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
