## Trong hợp đồng

Bốn phát hiện rơi vào code của chính hợp đồng này. Cả bốn đã sửa + mutation-test
trong vòng verify, nên chúng **không** còn là việc của người quyết — liệt kê ở
đây để thấy vết.

- **`anchor_tip` lui về HEAD cục bộ; `anchor_commits` trả rỗng** (vòng 1, HIGH) —
  đã sửa bằng poison value `ANCHOR_UNRESOLVED` + rẽ nhánh theo *có-hỏi-neo*.
- **Lỗi `gh` thoáng qua bị đọc thành "không có run ở commit này"** (vòng 2,
  MEDIUM) — đã sửa bằng `LOOKUP_FAILED`; repro thật trước khi sửa.
- **Cửa sổ GHCR rỗng cho feature đã neo nhưng chưa merge** (vòng 3, HIGH) — đã
  sửa bằng `anchor_landed` + `assert_window_sane`.
- **`scope_has_any_match` đánh vần đường dẫn phi-ASCII khác `stale_files`**
  (vòng 3, LOW) — đã sửa bằng `core.quotePath=false`.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người
quyết, máy không tự sửa. Phần lớn thuộc `compose-overlay` (đã có review-findings
riêng) hoặc thuộc gói nợ khác.

- **`run-overlay-plugin-tests.sh` ghim phiên bản SDK lần thứ ba, không guard nào canh**
  Người dùng thấy gì: một bản cập nhật nội bộ có thể được kiểm bằng phiên bản thư viện cũ hơn thứ thực sự sẽ chạy, nên một lỗi lọt lưới có thể chỉ lộ ra sau khi tính năng đã lên. Không đổi gì người dùng thấy hôm nay.
  file: `scripts/plugins/run-overlay-plugin-tests.sh`
  Đề xuất: new-contract

- **Hai guard plugin dùng chung một thư mục cache cố định, không đổi lại remote**
  Người dùng thấy gì: nếu ai đó từng chỉ công cụ kiểm sang một kho khác, những lần kiểm sau trên cùng máy vẫn âm thầm kiểm kho cũ và báo xanh — bằng chứng nói về một kho không ai hỏi. Chỉ ảnh hưởng người phát triển.
  file: `scripts/plugins/run-overlay-plugin-tests.sh`
  Đề xuất: new-contract

- **Node compose-overlay là N→1 nhưng nằm ở `transfer/` và đăng ký dưới nhóm TRANSFER**
  Người dùng thấy gì: nút này xuất hiện sai nhóm trong bảng chọn công cụ, nên người dùng tìm nó ở chỗ ghép nhiều nguồn thì không thấy. Đã ghi trong known-limits của compose-overlay.
  file: `src/components/workspace/nodes/transfer/compose-overlay.tsx`
  Đề xuất: known-limits

- **Ô nhập số của op không có min/max, không nơi nào chặn biên**
  Người dùng thấy gì: khi đặt lớp phủ, có thể gõ vị trí hoặc kích thước ngoài khoảng cho phép và ứng dụng vẫn nhận; ảnh/video ghép ra có thể sai hoặc hỏng mà không có lời giải thích.
  file: `src/components/workspace/nodes/transfer/compose-overlay-op-form.tsx`
  Đề xuất: new-contract

- **`<select>` thô với nhãn là mã ABI chưa dịch, không dùng component Select chung**
  Người dùng thấy gì: menu chọn vị trí/căn lề hiện chữ kỹ thuật tiếng Anh ("top-left", "tiktok-portrait") ở cả năm ngôn ngữ, và trạng thái di chuột/lấy nét trông khác các menu còn lại.
  file: `src/components/workspace/nodes/transfer/compose-overlay-op-form.tsx`
  Đề xuất: new-contract

- **Thêm op đẩy một đối tượng dùng chung cấp module vào state**
  Người dùng thấy gì: không lỗi hôm nay; nhưng một thay đổi sau này có thể khiến hai lớp phủ cùng loại di chuyển cùng nhau một cách khó hiểu.
  file: `src/components/workspace/nodes/transfer/compose-overlay-ops-editor.tsx`
  Đề xuất: known-limits

- **Bình luận tiếng Việt trong `lib/evidence-core.js` trái quy ước English-only**
  Người dùng thấy gì: không gì cả — thuần quy ước nội bộ cho người phát triển.
  file: `lib/evidence-core.js`
  Đề xuất: known-limits

- **CLAUDE.md mô tả hợp đồng của `check-manifest-unmoved.sh` đã lỗi thời**
  Người dùng thấy gì: không gì cả — hướng dẫn nội bộ trỏ tới một biến không còn tồn tại, dễ làm người đóng góp sau bối rối.
  file: `CLAUDE.md`
  Đề xuất: known-limits

- **Đổi đích một kết nối trên canvas bị từ chối im lặng, không phản hồi**
  Người dùng thấy gì: khi thử nối lại một dây sang đầu vào không hợp lệ, ứng dụng lặng lẽ bật về như cũ — trông như bị treo hoặc bị bỏ qua, không có manh mối vì sao.
  file: `src/components/workspace/edges/custom-edge.tsx`
  Đề xuất: new-contract

- **Chú thích của `alsoAccepts` nói nhẹ hơn thứ nó thật sự điều khiển**
  Người dùng thấy gì: không gì cả — nhưng người sửa sau đọc chú thích này sẽ không ngờ việc nới một handle thứ hai làm đổi cả loại kết quả mà bước đó khai báo.
  file: `src/lib/abi/sources.ts`
  Đề xuất: known-limits

- **`check-python-gen-clean.sh` sinh lại tại chỗ và để file bẩn khi thất bại**
  Người dùng thấy gì: không gì cả — nhưng một lần kiểm hỏng để lại cây làm việc bẩn, có thể khiến các phép kiểm sau báo sai.
  file: `scripts/abi/check-python-gen-clean.sh`
  Đề xuất: known-limits

- **`pnpm-lock.yaml` sinh bởi pnpm 11 trong khi CI ghim pnpm 10, để lại `pnpm-workspace.yaml` chưa commit**
  Người dùng thấy gì: không gì cả hôm nay, nhưng danh sách phê duyệt build-script đang tồn tại ở hai nơi với hai chủ — đúng loại chênh khiến máy của người đóng góp và CI cho kết quả khác nhau.
  file: `pnpm-lock.yaml`
  Đề xuất: new-contract

- **`ui-capture.mjs` giữ nguyên header tham chiếu của vendor (sai tên file, npm thay vì pnpm)**
  Người dùng thấy gì: không gì cả — chỉ dẫn sai trong header cho người phát triển.
  file: `scripts/ui-capture.mjs`
  Đề xuất: known-limits

- **`head_sha` và `run_json` vẫn dùng `exit` trần trong ngữ cảnh subshell**
  Người dùng thấy gì: không gì cả — an toàn vì mọi script gọi chúng đều bật `set -e`, và nay đã có guard kiểm chính điều đó. Sửa chúng nằm ngoài phạm vi 0.6.
  file: `scripts/ci/gh-run-lib.sh`
  Đề xuất: known-limits
