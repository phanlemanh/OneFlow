## Trong hợp đồng

- **Hình dạng 3 — assert "chuỗi có mặt" cho lời hứa "thông điệp lỗi ĐÍCH DANH file": tên file luôn có trong stdout dù thông điệp có ghim hay không**
  file: `scripts/plugins/check-live-docs-manifest-teeth.sh:81`
  severity: medium
  source: measurement
  AC: AC-5
  detail: Header của chính file này (dòng 10-12) và AC-5/E5 hứa: "Each case asserts two things, never just the exit code: the guard exits non-zero, AND its message names the offending id and the offending file." Nhưng vế "tên file" được đo bằng grep -qF trên toàn bộ stdout+stderr đã gộp (dòng 53: out="$(... 2>&1)", dòng 66: grep -qF -- "$needle"), trong khi hàng rào IN TÊN FILE VÔ ĐIỀU KIỆN trước mọi nhánh lỗi:

  - check-live-docs-manifest-synced.sh:105 — console.log(`${file}: ${seen.size} id extracted · manifest: ${want.size}`) chạy cho cả ba README ở MỌI lần chạy;
  - check-live-docs-manifest-synced.sh:83 — console.log(`CLAUDE.md: ${found.length} id extracted ...`) tương tự cho mode claude.

  Hệ quả cụ thể: needle "docs/README_ZH.md" (dòng 81), "README.md" (dòng 86), "docs/README_JA.md" (dòng 91), "README.md" (dòng 98), "CLAUDE.md" (dòng 103) đều được thoả bởi dòng đếm thông tin, KHÔNG phải bởi thông điệp FAIL. Nếu thay toàn bộ các dòng console.error ở synced.sh:108-110/115 và 86-87 bằng một câu chung không nêu file (ví dụ `FAIL: docs and manifest disagree`), cả bảy ca vẫn in PASS và E5 vẫn xanh. Đã xác nhận bằng cách chạy thật: mode readme in `README.md: 39 id extracted · manifest: 39` v.v. ngay cả khi exit 0. (Vế needle theo ID thì thật — id chỉ xuất hiện trong thông điệp lỗi; chỉ vế tên-file là rỗng nghĩa, gồm cả ca orphan-them-moi dòng 112 dùng needle "zzz-teeth-probe" là ghim thật.)
  rationale: AC-5 hứa rõ mỗi ca phải 'nêu đích danh id và tên file gây lỗi — không nhận câu chung'; finding chứng minh vế tên-file được thoả bởi một dòng in thông tin không liên quan tới lỗi, nên lời hứa của AC-5 chưa thật sự được kiểm chứng.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Editor backup `_acceptance/config.yaml.bak` committed — a stale second copy of the acceptance config**
  Người dùng thấy gì: Một bản sao cấu hình cũ bị lưu nhầm vào kho, trỏ tới các bước kiểm tra không còn tồn tại. Không hệ thống nào đọc tới nó nên chưa ảnh hưởng người dùng, nhưng để lại có thể gây nhầm lẫn nếu sau này có người chỉnh sửa nhầm bản này.
  file: `_acceptance/config.yaml.bak`
  severity: high
  Đề xuất: known-limits

- **CLAUDE.md still says a "fourth" origin entry turns the manifest guard red — four now exist**
  Người dùng thấy gì: Tài liệu hướng dẫn nội bộ vẫn nói sai ngưỡng cảnh báo (nói mục kế tiếp là 'mục thứ tư' trong khi mục thứ tư đã tồn tại sẵn), có thể khiến người đăng ký plugin tiếp theo hiểu nhầm khi nào công cụ kiểm tra sẽ báo lỗi.
  file: `CLAUDE.md`
  severity: medium
  Đề xuất: known-limits

- **New teeth script claims "red for all 6 perturbations" after running a single `--case`**
  Người dùng thấy gì: Khi công cụ kiểm tra tài liệu được chạy với chỉ một tình huống thử thay vì toàn bộ, nó vẫn in ra thông báo kiểu 'đã kiểm tra xong tất cả'. Cách vận hành hiện tại chưa dùng theo kiểu đó nên chưa gây hiểu nhầm, nhưng sẽ đánh lừa người đọc báo cáo nếu cách dùng này xuất hiện sau này.
  file: `scripts/plugins/check-live-docs-manifest-teeth.sh`
  severity: medium
  Đề xuất: known-limits

- **Guard header comment states four pre-existing orphan icons; the measured base count is three**
  Người dùng thấy gì: Một dòng ghi chú giải thích bên trong công cụ kiểm tra vẫn nêu sai số lượng ảnh biểu tượng cũ không dùng tới (nói bốn trong khi thực tế là ba). Đây chỉ là lời giải thích, không ảnh hưởng tới kết quả kiểm tra thật, nhưng có thể gây hiểu nhầm cho người đọc sau này.
  file: `scripts/plugins/check-live-docs-manifest-synced.sh`
  severity: medium
  Đề xuất: known-limits

- **New `claude`-mode coupling to CLAUDE.md is undocumented and anchored on a bullet CLAUDE.md says may be retired**
  Người dùng thấy gì: Công cụ kiểm tra mới ngầm dựa vào một dòng cụ thể trong tài liệu hướng dẫn nội bộ, nhưng điều này chưa được ghi chú ở nơi mô tả các ràng buộc liên quan. Nếu sau này có người xoá dòng đó theo một hướng dẫn khác, công cụ sẽ báo lỗi với thông điệp chỉ sai nguyên nhân thật.
  file: `scripts/plugins/check-live-docs-manifest-synced.sh`
  severity: medium
  Đề xuất: known-limits

- **teeth script claims "red for all 6 perturbations" even when --case ran zero perturbations**
  Người dùng thấy gì: Khi công cụ kiểm tra tài liệu được chạy với chỉ một tình huống thử thay vì toàn bộ, nó vẫn in ra thông báo kiểu 'đã kiểm tra xong tất cả'. Cách vận hành hiện tại chưa dùng theo kiểu đó nên chưa gây hiểu nhầm, nhưng sẽ đánh lừa người đọc báo cáo nếu cách dùng này xuất hiện sau này.
  file: `scripts/plugins/check-live-docs-manifest-teeth.sh`
  severity: medium
  Đề xuất: known-limits

- **_acceptance/config.yaml.bak committed — 757-line stale copy pointing at two scripts that do not exist**
  Người dùng thấy gì: Một bản sao cấu hình cũ bị lưu nhầm vào kho, trỏ tới các bước kiểm tra không còn tồn tại. Không hệ thống nào đọc tới nó nên chưa ảnh hưởng người dùng, nhưng để lại có thể gây nhầm lẫn nếu sau này có người chỉnh sửa nhầm bản này.
  file: `_acceptance/config.yaml.bak`
  severity: medium
  Đề xuất: known-limits

- **healthy positive control only covers the readme mode; claude and orphans modes have no green control**
  Người dùng thấy gì: Bộ kiểm tra tài liệu chỉ có một tình huống 'mẫu đúng' để đối chứng, và tình huống đó chỉ phủ một trong ba loại kiểm tra mà công cụ thực hiện. Hai loại còn lại có thể báo lỗi ngay cả khi không có gì sai mà chưa phép đo nào phát hiện ra, vì thiếu tình huống đối chứng cho chúng.
  file: `scripts/plugins/check-live-docs-manifest-teeth.sh`
  severity: low
  Đề xuất: known-limits

- **Guard header still says four base orphan icons; the measured count is three**
  Người dùng thấy gì: Một dòng ghi chú giải thích bên trong công cụ kiểm tra vẫn nêu sai số lượng ảnh biểu tượng cũ không dùng tới (nói bốn trong khi thực tế là ba). Đây chỉ là lời giải thích, không ảnh hưởng tới kết quả kiểm tra thật, nhưng có thể gây hiểu nhầm cho người đọc sau này.
  file: `scripts/plugins/check-live-docs-manifest-synced.sh`
  severity: low
  Đề xuất: known-limits

- **orphans mode does not assert base_svgs was actually read, unlike base_list**
  Người dùng thấy gì: Nếu bước đọc dữ liệu gốc để so sánh bị lỗi âm thầm, công cụ kiểm tra ảnh biểu tượng cũ sẽ báo sai toàn bộ tệp là 'mới thêm', dẫn tới báo lỗi oan. Tình huống này chưa từng xảy ra trong vận hành hiện tại và chưa được đo tới.
  file: `scripts/plugins/check-live-docs-manifest-synced.sh`
  severity: low
  Đề xuất: known-limits

- **CLAUDE.md still tells the reader a fourth origin entry turns the guard red, after the fourth landed**
  Người dùng thấy gì: Tài liệu hướng dẫn nội bộ vẫn nói sai ngưỡng cảnh báo (nói mục kế tiếp là 'mục thứ tư' trong khi mục thứ tư đã tồn tại sẵn), có thể khiến người đăng ký plugin tiếp theo hiểu nhầm khi nào công cụ kiểm tra sẽ báo lỗi.
  file: `CLAUDE.md`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên quét LỚP ("every mode of that guard gets perturbed") nhưng ba nhánh lỗi của hàng rào không có ô phá nào**
  Người dùng thấy gì: Công cụ 'thử phá rồi kiểm tra báo đỏ' mới chỉ thử một số cách phá nhất định; còn vài đường lỗi khác — trong đó có đường dễ xảy ra nhất trong đợt thay đổi vừa rồi — chưa từng được thử phá để chắc chắn công cụ phát hiện ra.
  file: `scripts/plugins/check-live-docs-manifest-teeth.sh`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — đối chứng dương chỉ phủ 1/3 mode: `healthy` chạy mode readme, mode claude và orphans không có ca xanh trên cùng bản sao**
  Người dùng thấy gì: Bộ kiểm tra tài liệu chỉ có một tình huống 'mẫu đúng' để đối chứng, và tình huống đó chỉ phủ một trong ba loại kiểm tra mà công cụ thực hiện. Hai loại còn lại có thể báo lỗi ngay cả khi không có gì sai mà chưa phép đo nào phát hiện ra, vì thiếu tình huống đối chứng cho chúng.
  file: `scripts/plugins/check-live-docs-manifest-teeth.sh`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/14 lỗi rơi vào file không bộ đo nào phủ (_acceptance/config.yaml.bak) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
