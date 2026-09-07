# E16 — vật liệu cho chữ ký người ở Cổng 2

Hai vòng verify liên tiếp trả `E16` UNCERTAIN/FAIL với **cùng một lý do**: hội đồng
không thấy handle `in:text` / `out:text`, và ở khung `wired` không thấy đường dây.
Thư mục này là phần đo để owner điền `human_override`, **không phải** evidence của
vòng — evidence vòng 3 nằm ở `../design/captures/` và không bị đụng tới.

## Cái gì đã thật sự xảy ra

Trang `/proto/[slug]` mount `ReactFlow` trực tiếp và **không nạp
`@xyflow/react/dist/style.css`** (canvas thật nạp qua `workspace.tsx` /
`types.tsx`). Không có bảng kiểu đó thì handle render ra `div` không kích thước
và edge render ra path không nét vẽ — **có trong DOM, vô hình trong ảnh**.

Ba phép đo, theo thứ tự đã chạy:

1. **DOM của chính lượt chụp vòng 3** (`../design/captures/state-1-idle.html`,
   `state-2-wired.html`): đủ hai handle, đúng id và đúng phía —
   `data-handleid="in:text"` (`handle-left target`),
   `data-handleid="out:text"` (`handle-right source`) — và khung `wired` có một
   `react-flow__edge-path`. Tức node không hề thiếu handle.
2. **Ảnh khổ desktop TRƯỚC khi vá** (`gate2-idle-1280x900.png`,
   `gate2-wired-1280x900.png` + hai crop `*-canh-*-zoom8x.png`): phóng 8× đúng
   giữa cạnh trái/phải node — chỉ có nền canvas, viền, thân card. Không chấm nào.
   Nên hội đồng **chấm đúng cái nó nhìn thấy**.
3. **Ảnh SAU khi vá** (`gate2-idle-sau-fix.png`, `gate2-wired-sau-fix.png`): thêm
   một dòng `import "@xyflow/react/dist/style.css"` vào component proto → hiện
   rõ hai chấm handle ở giữa cạnh trái/phải và đường bezier nối từ node text
   thượng nguồn vào `in:text`. Bản HTML kèm theo có luật `.react-flow__handle`
   và 172 biến `--xy-*`, hai thứ vắng mặt hoàn toàn ở bản trước.

## Ghi chú về lập luận của hội đồng

Ảnh mà vòng 3 cấp cho hội đồng là **390×844** (mặc định khổ điện thoại của
`scripts/ui-capture.mjs`; bước `E15` ghim locale, state, xuất xứ, dọn dẹp nhưng
**không ghim khổ khung**). Có lens dẫn toạ độ "cạnh phải ~x=465" — nằm ngoài
tấm ảnh rộng 390px, và trùng khít bbox node trong khung 1280×900 `(116, 366,
464, 546)`. Phần đó của lập luận vì vậy không thể là phép đo trực tiếp trên
ảnh được cấp; nó không đổi kết luận, nhưng đáng ghi khi đọc phiếu.
