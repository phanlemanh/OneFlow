## Trong hợp đồng

- **Đo CHỈ DẪN thay vì ĐẦU RA — guard đếm chuỗi tên hàm, nên một dòng CHÚ THÍCH cũng được tính là call site (AC-4, E4/E5)**
  file: `scripts/plugins/check-venv-layout-pinned.sh:61`
  severity: high
  AC: AC-4
  Dòng 61 (`py_call=$(grep -cE '_remove_legacy_shared_venv\(' "$PY")`) và dòng 70 (`ts_call=$(grep -cE 'removeLegacySharedVenv\(' "$TS")`) đếm SỐ DÒNG có chứa chuỗi tên hàm, rồi kết luận `call sites = py_call - py_def`. `grep -c` không phân biệt lời gọi thật với một dòng đã bị comment hoặc một dòng chú thích chỉ nhắc tên. Lời hứa của AC-4 là «một phía đánh mất bước dọn venv đời cũ thì guard trả về khác 0», tức là một QUAN HỆ về luồng chạy (bước dọn CÓ được gọi trong đường cấp phát), nhưng phép đo là «chuỗi có mặt trên ≥ 2 dòng» — đúng lớp lỗi mà chính chú thích dòng 57–59 của guard tuyên là đã đóng («grepping the NAME stays green when only the CALL SITE is deleted... Demand both»).

  ĐO TẬN TAY trên bản sao của cây này (cả hai phía đều XANH sai):
  1) Thay `_remove_legacy_shared_venv(root, log)` ở `sdk/tongflow/engine/plugins.py:253` bằng `# TODO: re-enable _remove_legacy_shared_venv(root, log) later` → `bash scripts/plugins/check-venv-layout-pinned.sh --root <copy>` in `OK: ... both still remove the legacy shared venv`, rc=0.
  2) Thay `removeLegacySharedVenv();` ở `src/lib/plugins/plugin-python-env.server.ts:229` bằng `// removeLegacySharedVenv(); disabled` → guard cũng in OK, rc=0.
  Đây chính là thay đổi tái vũ trang vòng phá nhau mà guard tồn tại để chặn.

  Chiều đỏ hiện có KHÔNG phân biệt được: `scripts/plugins/check-venv-layout-teeth.sh:48-49` (`c_py_call_drop` / `c_ts_call_drop`) xoá HẲN đoạn chữ (`s/.../pass/`, `s/.../;/`) chứ không comment nó ra, nên hai ca PASS đó chỉ chứng minh guard đỏ khi CHUỖI biến mất, không chứng minh guard đỏ khi LỜI GỌI biến mất. `evals.yaml` E5 khai hai ca này là «GIU dinh nghia xoa CHO GOI hai phia (lo hong vong 1)» — nhãn ấy mô tả một phép đo mạnh hơn phép đo thật.

  LƯU Ý phân biệt với nợ đã khai: `contract.md` §Out of scope đã rút AC-11 vì cùng lớp fail-open trên `ci.yml` (comment hoá step vẫn xanh), và rút AC-13 vì khẳng định âm-tính-một-mình. Ca này là chỗ THỨ BA của cùng lớp lỗi, nhưng nằm trên AC-4 — tiêu chí VẪN CÒN trong hợp đồng — và không được nêu trong Known limits.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **sdk/README.md vẫn quảng cáo "shared venv" — đúng cái model diff này xoá**
  Người dùng thấy gì: Tài liệu hướng dẫn của SDK vẫn mô tả sai cách cấp phát môi trường Python (nói dùng chung một môi trường trong khi sản phẩm đã đổi sang mỗi plugin một môi trường riêng), có thể khiến người đọc tài liệu cấu hình nhầm.
  file: `sdk/README.md`
  severity: high
  Đề xuất: known-limits

- **Hai runtime nay dùng CHUNG thư mục venv nhưng mỗi bên một bộ marker cache riêng**
  Người dùng thấy gì: Khi người dùng chuyển qua lại giữa chạy trên ứng dụng desktop và chạy dòng lệnh, hệ thống có thể âm thầm cài lại gói cho plugin nhiều lần hơn cần thiết, làm lần chạy đầu sau khi đổi cách dùng chậm hơn mong đợi.
  file: `sdk/tongflow/engine/plugins.py`
  severity: medium
  Đề xuất: known-limits

- **Hai step guard mới vào job acceptance-gate nhưng không đăng ký trong GUARD_NEEDLES**
  Người dùng thấy gì: Nếu sau này ai đó vô tình gỡ bỏ hai bước kiểm tra bố cục môi trường Python khỏi quy trình kiểm tra tự động, hệ thống cảnh báo phụ hiện có sẽ không phát hiện ra việc đó.
  file: `.github/workflows/ci.yml`
  severity: medium
  Đề xuất: known-limits

- **Engine và app nay bất đồng về hành vi khi cấp phát venv hỏng; docs/plugins.md chỉ còn đúng cho một bên**
  Người dùng thấy gì: Tài liệu hướng dẫn viết plugin mô tả một quy tắc xử lý lỗi cấp phát chung cho cả hai cách chạy, nhưng thực tế quy tắc đó nay chỉ đúng với một trong hai cách — có thể khiến người viết plugin hiểu nhầm điều gì xảy ra khi cài đặt thất bại.
  file: `docs/plugins.md`
  severity: medium
  Đề xuất: known-limits

- **Engine preflight is now all-or-nothing: one plugin's venv failure aborts the whole workflow, including fully-cached runs and no-dependency plugins the TS twin deliberately excuses**
  Người dùng thấy gì: Nếu một plugin bất kỳ trong quy trình gặp lỗi cài đặt, toàn bộ lượt chạy có thể dừng lại — kể cả khi kết quả cần dùng đã có sẵn trong bộ nhớ đệm và không cần cài thêm gì.
  file: `sdk/tongflow/engine/plugins.py`
  severity: medium
  Đề xuất: known-limits

- **The two new venv-layout guards are absent from GUARD_NEEDLES, so the meta-guard that exists to catch "a guard is not wired into CI" cannot see them being unwired**
  Người dùng thấy gì: Nếu sau này ai đó vô tình gỡ bỏ hai bước kiểm tra bố cục môi trường Python khỏi quy trình kiểm tra tự động, hệ thống cảnh báo phụ hiện có sẽ không phát hiện ra việc đó.
  file: `scripts/ci/check-gate-guards-job.sh`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 4/7 lỗi rơi vào file không bộ đo nào phủ (sdk/README.md, .github/workflows/ci.yml, docs/plugins.md, scripts/ci/check-gate-guards-job.sh) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.