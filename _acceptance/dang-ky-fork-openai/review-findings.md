## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Teeth harness writes into the real public/plugins/ while sibling evals scan that same directory in parallel**
  Người dùng thấy gì: Khi tính năng này được thẩm định, đôi lúc hệ thống có thể báo nhầm là nhánh code làm rơi rớt một icon plugin, dù thực tế không có vấn đề gì — gây mất công điều tra một lỗi không có thật.
  file: `scripts/plugins/check-live-docs-manifest-teeth.sh`
  severity: high
  Đề xuất: known-limits

- **New standing guards are wired only into this dossier's evals — nothing runs them again after sign-off**
  Người dùng thấy gì: Sau khi tính năng này được duyệt xong, các rào chắn mới chống lệch tài liệu/manifest sẽ không còn được kiểm tra tự động trên các thay đổi kế tiếp, nên README hoặc danh sách plugin có thể lệch nhau trở lại mà không ai được cảnh báo.
  file: `.github/workflows/ci.yml`
  severity: medium
  Đề xuất: new-contract

- **E9 pins a volatile file count in `expected`; it is already stale at HEAD**
  Người dùng thấy gì: Một phép kiểm tra tự động có thể báo sai là có vấn đề dù kho vẫn hoàn toàn sạch, chỉ vì số lượng file trong kho tăng lên một cách bình thường theo thời gian.
  file: `_acceptance/dang-ky-fork-openai/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **CLAUDE.md quotes a FAIL string the new guard never emits**
  Người dùng thấy gì: Tài liệu hướng dẫn đọc đầu phiên mô tả sai một thông báo lỗi thực tế, có thể khiến người đọc bối rối khi tự tay thử tái hiện tình huống lỗi đó.
  file: `CLAUDE.md`
  severity: low
  Đề xuất: known-limits

- **Adding a second CLAUDE.md line naming check-manifest-unmoved leaves the older doc guard on a `head -1` anchor**
  Người dùng thấy gì: Nếu sau này có người đổi thứ tự các dòng hướng dẫn trong tài liệu, công cụ kiểm tra đồng bộ có thể âm thầm đo nhầm đoạn văn và bỏ lọt một lần lệch số liệu thật.
  file: `scripts/plugins/check-manifest-doc-synced.sh`
  severity: low
  Đề xuất: known-limits

- **`check-manifest-guard-teeth.sh` case label still says "37th" after the count moved to 35**
  Người dùng thấy gì: Một dòng thông báo nội bộ của công cụ kiểm thử vẫn ghi số cũ, có thể gây nhầm lẫn nhẹ cho người đọc log dù kết quả kiểm tra vẫn đúng.
  file: `scripts/plugins/check-manifest-guard-teeth.sh`
  severity: low
  Đề xuất: known-limits

- **Teeth harness's positive control covers only one of the guard's three modes**
  Người dùng thấy gì: Nếu một trong hai chế độ kiểm tra khác của rào chắn tài liệu bị hỏng hoàn toàn và luôn báo lỗi bất kể đúng sai, hệ thống kiểm thử hiện tại sẽ không phát hiện ra sự cố đó.
  file: `scripts/plugins/check-live-docs-manifest-teeth.sh`
  severity: low
  Đề xuất: known-limits

- **Teeth script mutates the real public/plugins/ tree while a sibling eval lists it — parallel suite makes dkfo_icon_no_new_orphan flaky-red**
  Người dùng thấy gì: Việc thẩm định tính năng này đôi khi có thể báo lỗi giả về icon plugin bị lạc do một phép kiểm tra khác chạy song song ghi đè lên cùng thư mục thật, khiến người xét duyệt mất công điều tra một lỗi không có thật.
  file: `scripts/plugins/check-live-docs-manifest-teeth.sh`
  severity: high
  Đề xuất: known-limits

- **check-no-tracked-backups.sh prints OK and exits 0 when git fails entirely — green on zero files scanned**
  Người dùng thấy gì: Nếu công cụ dò file rác chạy trong một môi trường bị lỗi (ví dụ không đọc được lịch sử Git), nó vẫn báo 'sạch' thay vì báo lỗi — một lần quét thất bại có thể bị hiểu nhầm thành kho không có file rác nào.
  file: `scripts/ci/check-no-tracked-backups.sh`
  severity: medium
  Đề xuất: new-contract

- **New drift guards are wired only to this one dossier's dkfo_* executors — they never run on an ordinary PR**
  Người dùng thấy gì: Sau khi tính năng này được duyệt xong, các rào chắn mới chống lệch tài liệu/manifest sẽ không còn được kiểm tra tự động trên các thay đổi kế tiếp, nên README hoặc danh sách plugin có thể lệch nhau trở lại mà không ai được cảnh báo.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: new-contract

- **E9's expected output pins tracked-file count 1447; HEAD measures 1451**
  Người dùng thấy gì: Một phép kiểm tra tự động có thể báo sai là có vấn đề dù kho vẫn hoàn toàn sạch, chỉ vì số lượng file trong kho tăng lên một cách bình thường theo thời gian.
  file: `_acceptance/dang-ky-fork-openai/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3/4 — assert "chuỗi có mặt" ở BẤT KỲ dòng nào, trong khi lời hứa là "thông điệp FAIL nêu tên file"; nhánh có neo ^FAIL: là code chết**
  Người dùng thấy gì: Bài kiểm thử nội bộ cho công cụ dò file rác có một cách so khớp lỏng lẻo, nên nếu sau này thông báo lỗi bị viết lại chung chung hơn, bài kiểm thử có thể vẫn báo 'đạt' dù không còn kiểm tra đúng điều nó hứa.
  file: `scripts/ci/check-no-tracked-backups.sh`
  severity: medium
  Đề xuất: known-limits

## Chưa phân loại (triage-failed)

phân loại phạm vi không chạy được — không lỗi nào bị máy tự sửa, người xem lại toàn bộ

- title: Hình dạng 5 — bộ răng tuyên "8/8 ca, mọi mode đều bị phá" nhưng một trong bốn nhánh khẳng định của hàng rào readme chưa từng bị đo đỏ
  file:line: scripts/plugins/check-live-docs-manifest-teeth.sh:95
  severity: medium
  detail: Mode `readme` của `check-live-docs-manifest-synced.sh` có ĐÚNG BỐN nhánh FAIL, mỗi nhánh là một khẳng định độc lập trên từng phần tử: dòng 120 `!got` — README thiếu id manifest có; dòng 121 `got.org !== org` — sai org; dòng 122 `got.repo !== id` — link trỏ sang repository khác tên id; dòng 124-125 — README có id manifest không có. Bốn ca readme trong bộ răng phủ nhánh 1 (`readme-missing`), nhánh 4 (`readme-extra`), và nhánh 2 HAI LẦN (`org-sai-chuoi-tran` dòng 108, `org-sai-muc-origin` dòng 115 — cố ý tách hai nửa luật org). Nhánh 3 (`got.repo !== id`) KHÔNG có ca nào. Không có phép phá nào chạm tới nó, nên nếu điều kiện đó bị đảo hoặc bị xoá, bộ răng vẫn in `OK: 8/8 ca` và E5/E11 vẫn xanh. Nhánh này không phải code chết — dựng lại trên bản sao cây và nó bắn thật: đổi link `oneflow-api-openai` thành `.../phanlemanh/oneflow-api-openai-fork` cho ra `FAIL: README.md links \`oneflow-api-openai\` to repository \`oneflow-api-openai-fork\`` với exit 1. Tức là có một lớp trôi tài liệu thật (link trỏ đúng org nhưng sai repo) mà hàng rào bắt được nhưng phép đo chiều đỏ chưa từng chứng minh là bắt được. Header script (dòng 5-9) tuyên "every mode of that guard gets perturbed here" và dòng chốt tuyên "1 doi chung duong + 7 phep pha, thuoc do dung o ca 7", còn evals.yaml E5 tuyên "ĐỦ TÁM ... Mỗi ca phá khẳng định hàng rào thoát KHÁC 0" — cả ba câu đọc như đã quét hết bề mặt khẳng định của hàng rào, trong khi 3/4 nhánh được đo.
  source: measurement

⚠ Cụm ngoài vùng phủ: 4/13 lỗi rơi vào file không bộ đo nào phủ (.github/workflows/ci.yml, _acceptance/dang-ky-fork-openai/evals.yaml, _acceptance/config.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
