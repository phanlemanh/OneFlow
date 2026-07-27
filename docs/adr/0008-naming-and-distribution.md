# ADR-0008: Đặt tên & phân phối — tiền tố `oneflow-`, distribution `oneflow-sdk`, import giữ `tongflow`

- **Ngày:** 2026-07-27 · **Trạng thái:** Chấp nhận (đã thực thi: `sdk-distribution-rename`,
  `oneflow-plugin-prefix` — đều đã ký trong `_acceptance/`)
- **Nguồn:** hội đồng (nút thắt upstream: tên PyPI `tongflow` thuộc upstream); quyết định founder về namespace

## Bối cảnh

Tên gói PyPI `tongflow` thuộc upstream — mọi thay đổi ABI của OneFlow cần publish model mới
sẽ đụng trần ngay ở wedge đầu tiên. Nhưng đổi cả import package (`import tongflow` →
`import oneflow`) sẽ phá 38 plugin upstream đang `from tongflow.models import ...` — mâu
thuẫn trực tiếp với [ADR-0007](0007-sequential-plugin-forking.md) (plugin upstream phải tiếp
tục chạy được). Lưu ý thêm: tên `oneflow` trên PyPI đã thuộc framework ML của oneflow.org.

## Quyết định

- **Phương án C — chỉ đổi tên distribution:** publish dưới tên **`oneflow-sdk`**
  (`pip install oneflow-sdk`), import package **giữ nguyên `tongflow`**
  (`import tongflow`). Đã publish 0.2.17 lên PyPI (26/07/2026).
- **Plugin mới dùng tiền tố `oneflow-`** (`oneflow-modal-*`, `oneflow-api-*`); tiền tố
  `tongflow-*` là legacy, scanner vẫn nhận diện.
- **Namespace GitHub tạm dùng tài khoản cá nhân `phanlemanh`**; lập org khi có cộng sự
  hoặc chốt xong thương hiệu.

## Hệ quả

- Độc lập phân phối đạt được với chi phí đổi tên tối thiểu; toàn bộ plugin upstream chạy
  nguyên trạng.
- Chấp nhận một bất đối xứng tên (cài `oneflow-sdk`, import `tongflow`) — ghi rõ trong
  README của SDK; xem xét lại chỉ khi có lý do đủ lớn (ADR mới).
- Việc còn mở của cụm độc lập upstream: tách desktop shell khỏi `app.tongflow.com`.
