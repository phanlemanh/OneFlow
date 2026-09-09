## Trong hợp đồng

- **Hình dạng 5 — AC-7 tuyên LỚP "pip trả khác 0" nhưng eval chỉ có MỘT điểm-case (No matching distribution)**
  file: `sdk/tests/test_plugin_venv_layout.py:193`
  severity: medium
  AC: AC-7
  detail: AC-7 (contract.md:72) hứa cho CẢ LỚP: mọi `pip install` trả khác 0 dưới `auto_install=True` thì `prepare_python_env` NÉM lỗi mang nguyên nhân và KHÔNG trả về `sys.executable`; vế "chỉ ra hai lối" chỉ là trường hợp riêng. Eval duy nhất cho AC-7 là E8 (evals.yaml:100) trỏ vào một node-id `test_a_missing_published_version_names_both_ways_out`, và chính `expected` khai "MOT ca". Ca này ép `SDK_ROOT` sang thư mục không phải checkout (dòng 196) rồi trả đúng chuỗi "No matching distribution" (dòng 205) — tức chỉ đi qua nhánh `hint` đặc biệt của `_install_sdk_into`. Không có ca nào (grep toàn `sdk/tests/`) đo: (a) pip hỏng với thông điệp KHÁC, (b) pip hỏng khi ĐANG chạy từ checkout — nhánh mặc định của CI và mọi dev, nơi `_running_from_checkout()` là True và không có hint, (c) `_ensure_plugin_requirements` trả khác 0 ("failed to install requirements"), (d) `python -m venv` trả khác 0 ("failed to create plugin venv"). Một refactor nuốt lỗi ở nhánh chung `if code != 0` (ví dụ trả `sys.executable` khi không phải cửa sổ phát hành) vẫn giữ E8 xanh vì ca duy nhất đi qua nhánh riêng. Số assert = 1 điểm cho một AC tuyên 4 nhánh; không có ma trận viết-trước.
  source: measurement

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Coupled constant not bumped: check-eval-filters-teeth.sh still pins "38 ô đo" after this diff adds a 39th name-filtered eval**
  Người dùng thấy gì: Một phép đếm nội bộ dùng để xác nhận đã có đủ số bài kiểm chưa được cập nhật theo thay đổi này, nên báo cáo bằng chứng của một tính năng khác có thể không lặp lại được kết quả "đạt" như đã ký trước đó.
  file: `scripts/ci/check-eval-filters-teeth.sh`
  severity: high
  Đề xuất: known-limits

- **No high-confidence correctness bug or silent failure in the diff; the two behavioural gaps present are already signed as Known limits**
  Người dùng thấy gì: Không phát hiện lỗi mới; hai điểm hạn chế nêu ra (mỗi lần đổi phía chạy có thể phải cài đặt lại không cần thiết, và một plugin gặp sự cố có thể làm hỏng toàn bộ lượt chạy dù các phần khác đã sẵn sàng) là những giới hạn đã được biết và người phụ trách đã chấp nhận từ trước.
  file: `sdk/tongflow/engine/plugins.py`
  severity: low
  Đề xuất: known-limits

- **Plugin id is validated for the venv path but not for the clone path that runs first (pre-existing, adjacent to the diff)**
  Người dùng thấy gì: Nếu tên một plugin không hợp lệ được đưa vào hệ thống, bước tải plugin về máy vẫn chạy trước khi tên đó được kiểm tra hợp lệ, nên dữ liệu có thể bị ghi ra ngoài thư mục dự kiến trước khi bị chặn lại ở bước sau.
  file: `sdk/tongflow/engine/plugins.py`
  severity: low
  Đề xuất: new-contract

- **Hình dạng 3 — đối chứng dương ở bên TS khẳng định chuỗi-hậu-tố (endsWith) trong khi lời hứa là QUAN HỆ "nằm dưới gốc"**
  Người dùng thấy gì: Một bài kiểm phụ trợ chỉ xác nhận tên thư mục có đúng đuôi chứ chưa chắc đúng vị trí thật; một bài kiểm khác đang đo đúng vị trí nên rủi ro thực tế hiện thấp, nhưng nếu bài kiểm chính đó bị đổi sau này, một lỗi vị trí sai có thể lọt qua mà không bị phát hiện.
  file: `src/lib/plugins/plugin-python-env.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).