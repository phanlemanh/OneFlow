# ADR-0007: Fork plugin tuần tự theo nhu cầu, không mirror cả 38

- **Ngày:** 2026-07-27 · **Trạng thái:** Chấp nhận
- **Nguồn:** quyết định founder trong quá trình thực thi (nguyên văn: *"dựa trên nguyên tắc
  tuần tự và phổ biến thay vì fork tất cả plugin"*); hội đồng nêu nút thắt upstream

## Bối cảnh

38 plugin chính thức nằm ở org upstream `tong-io` — OneFlow không sở hữu. Phương án hội đồng
gợi ý ban đầu (mirror toàn bộ về org riêng) là nhiều engineer-tuần chết cho các plugin chưa
chắc dùng, với nguồn lực 1 người. Nhưng manifest `config/official-plugins.json` chỉ có một
trường `org` duy nhất — fork một plugin nghĩa là phải chuyển cả 38 hoặc không cái nào.

## Quyết định

- Fork **từng plugin, khi cần** (khi phải sửa nó hoặc khi nó là dependency của wedge).
- Manifest hỗ trợ **origin per-plugin** (feature `per-plugin-origin`): entry dạng chuỗi dùng
  `org` mặc định; entry dạng object khai `origin` riêng. Tương thích ngược hoàn toàn.
- Luật dựng URL chỉ được viết **một chỗ** (resolver TS dùng chung cho cả app lẫn script) và
  manifest phải được validate — gõ nhầm key không được lặng lẽ rơi về origin mặc định.
- Plugin `tongflow-*` upstream vẫn cài được bình thường (xem [ADR-0008](0008-naming-and-distribution.md)).

## Hệ quả

- Chi phí độc lập upstream trải theo nhu cầu thay vì trả trước một cục.
- Registry là hỗn hợp nguồn (upstream + fork) trong thời gian dài — chấp nhận, có validate.
