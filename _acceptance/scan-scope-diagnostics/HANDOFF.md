# Handoff: scan-parse-failure-semantics (hợp đồng con của scan-scope-diagnostics)

Đầu vào cho `/feature-loop scan-parse-failure-semantics`. Nguồn: Cổng 2 của
`scan-scope-diagnostics` (ký 2026-08-18, PASS vòng 3) — năm hạn chế đã biết trong
`contract.md` của gói đó, gom về hai gốc rễ. Cả hai mục hành vi đã được tái hiện tay
tại `5747c60` trước khi ký.

## Gốc 1 — ngữ nghĩa lỗi-đọc-tệp ở tầng `scan()`

Một quyết định của gói cha (trả lỗi đọc/parse trong khay `rejections`,
`sdk/tongflow/scan.py:149-154`) quá tải hai hệ quả:

1. **Báo trùng từng byte.** `_iter_plugin_py_files` đọc mọi `*.py` kể cả `deploy.py`;
   `parse_deploy_py` đọc lại chính tệp đó và `scan()` append `derr` lần nữa
   (`scan.py:~387-395`). Vì AC-10 đã hợp nhất câu chữ qua `parse_failure_reason`, hai
   entry giống hệt. Tái hiện: `deploy.py` = `class Inference(:` → hai dòng `errors` y hệt.
   Hướng sửa rẻ nhất từng nêu: guard `if derr not in rejections`, hoặc bỏ `deploy.py`
   khỏi bản quét thư mục — chọn ở S1 của gói con.
2. **Tệp lạc lối dập câu chẩn đoán thật.** Guard `if not rejections:` (`scan.py:~422`)
   coi MỌI lỗi parse là "lý do cụ thể hơn". Tái hiện: `entry.py` lành không handler +
   `tests/legacy.py` chứa `print "py2"` → câu `no @node_slot ... found` biến mất, người
   viết plugin bị trỏ sang tệp rác. **Ràng buộc quan trọng:** hành vi này đúng nguyên văn
   AC-7 của gói cha ("a plugin `.py` file", không giới hạn tệp) — gói con phải
   **supersede câu chữ AC-7 đó** tại Cổng 1 của nó: câu chung chung chỉ nhường chỗ cho
   lỗi ở tệp có thể chứa handler (`entry.py` / `deploy.py`); lỗi ở tệp khác vẫn báo
   nhưng không dập.

## Gốc 2 — luật đo (lớp thước-lỏng lặp ở CẢ BA vòng review của gói cha)

Cùng tên lớp, ba vòng, chín cái thước: đo chuỗi-có-mặt thay vì quan hệ; răng chạy
điểm-case thay vì trọn nhóm nó tuyên. Ba mục còn sống lúc ký:

- Ca NUL-byte (`sdk/tests/test_scan_diagnostics.py`) xanh được bằng đường sai: câu
  chung chung của chính plugin chứa sẵn chuỗi đường dẫn mà phép đo tìm. Sửa: ghim
  thông điệp (`unreadable source` / `not valid UTF-8`) + assert `not _generic(msgs)`.
- Răng `scope-gate` trong `scripts/plugins/check-diagnostics-teeth.sh` tuyên quét
  E1..E3+E6 nhưng chạy tập con.
- Răng `parse-failure` tuyên E7..E10 nhưng chạy 2/7 ca.

Gói con nên mang một AC "luật đo" (mọi assert âm ghim thông điệp + đối chứng dương;
mọi teeth chạy trọn nhóm) rồi tái cắt cả chín thước dưới luật đó một thể — đổi khuôn,
không vá cái thứ mười.

## Ràng buộc thừa kế

- T3 (`sdk/**`). Nhánh nền lúc viết: `fix/scan-scope-diagnostics` (stacked trên
  `feat/scan-with-block-imports`); nếu chuỗi PR đã merge thì nền là `main`.
- Không sửa `sdk/tests/test_scan_scope.py` (thước của gói ông). Executor keys mẫu:
  các key `diag_*` trong `_acceptance/config.yaml`.
- Sóng ký lại: gói con chạm `sdk/**` sẽ làm stale bằng chứng của các gói sở hữu file
  trong đó — tính chi phí ở Cổng 1.
