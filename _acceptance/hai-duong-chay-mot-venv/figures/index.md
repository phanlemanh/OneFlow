# Hình tại điểm quyết định — hai-duong-chay-mot-venv

Kê điểm quyết định từ artifact cuối S1 (5 entry sổ quyết định chờ seal, 5 finding
gap-probe đều `fixed`, 0 dòng `[GIẢ ĐỊNH]`, 3 chỗ design lệch dòng roadmap gốc).
Ngưỡng N5: từ ba bước nối tiếp, hoặc từ hai nhánh rẽ.

| Điểm | Đếm | Hình |
|---|---|---|
| Vòng phá nhau giữa hai runtime (Context + entry `guard`) | 4 bước nối tiếp, thành một chu trình | **cần hình** — `vong-pha-nhau` |
| Phương án A / B / C cho việc buộc hai bên (entry `guard`) | 3 nhánh rẽ | gộp vào `vong-pha-nhau` — hình phải cho thấy vì sao chú thích không giữ được |
| Rẽ nhánh đường lấy SDK (entry `noversion`) | 2 nhánh + một cửa sổ thời gian | **cần hình** — `re-nhanh-sdk` |
| Phạm vi: cắt publish, bump, bốn plugin (entry `scope`) | dưới ngưỡng: 1 bước | — |
| Giữ `auto_install=False`, bỏ nuốt lỗi (entry `fallback`) | dưới ngưỡng: 2 nhánh song song, không nối tiếp | — |
| Bỏ đặc-tả-UX (entry `uxskip`) | dưới ngưỡng: 1 bước | — |

## Đề bài hình 1 — `vong-pha-nhau`

- Loại: sơ đồ luồng có chu trình, kèm một nhánh "sau bản vá".
- Nút: `engine Python dựng venv chung tại gốc` · `pyvenv.cfg nằm ở gốc` ·
  `app TS thấy pyvenv.cfg ở gốc` · `rm -rf cả gốc` · `mọi venv per-plugin mất` ·
  quay lại nút đầu. Nhánh sau bản vá: `engine dựng venv tại gốc/<id>` →
  `gốc không có pyvenv.cfg` → `app TS không tìm thấy gì để xoá` → `venv còn nguyên`.
- Nhãn bằng chữ, không dùng ký hiệu riêng. Ghi rõ đâu là trạng thái hôm nay, đâu
  là sau bản vá.
- AC liên quan: AC-1, AC-2, AC-3.

## Đề bài hình 2 — `re-nhanh-sdk`

- Loại: cây quyết định hai nhánh, kèm một ô ghi cửa sổ thời gian.
- Nút: `engine cần cài SDK vào venv` → hỏi `SDK_ROOT/pyproject.toml có không?`
  → nhánh có: `pip install <SDK_ROOT>` (đang chạy trong checkout) → nhánh không:
  `pip install <dist>==<version>` (site-packages). Ô cửa sổ: `giữa lúc bump version
  và lúc publish, phiên bản trong kho không có trên PyPI` gắn vào nhánh thứ hai,
  và một nút `ném lỗi chỉ ra hai lối: chạy từ checkout, hoặc publish`.
- AC liên quan: AC-5, AC-6, AC-7.
