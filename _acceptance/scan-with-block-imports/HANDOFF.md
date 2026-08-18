# Handoff — scan-with-block-imports

**Trạng thái:** Cổng 1 đã duyệt (Manh, 2026-08-18). Nhánh `feat/scan-with-block-imports`,
commit `99199df`. Chưa viết dòng mã sản phẩm nào.

**Máy tiếp theo bắt đầu bằng:**

```
/feature-loop scan-with-block-imports
```

Nó đọc `status: approved` trong contract → vào **S2 PLAN**. Hạng **T3** nên sau khi lập
kế hoạch phải **DỪNG ở Cổng 1.5** cho người duyệt kế hoạch, trước khi code.

## Ba việc S2/S3 phải làm mà kế hoạch dễ bỏ sót

1. **Khai executor key trước, nếu không S4 dừng.** `evals.yaml` trỏ 16 khoá
   `config:executors.*` **chưa tồn tại** trong `_acceptance/config.yaml`. Bộ chạy S4 sẽ
   DỪNG chứ không đoán lệnh. Danh sách cần thêm:
   `test.sdk_pytest_scope_with_deploy` · `sdk_pytest_scope_with_scan` ·
   `sdk_pytest_scope_nested` · `sdk_pytest_scope_function_local` ·
   `sdk_pytest_scope_import_spellings` · `sdk_pytest_scope_prior_behaviour` ·
   `sdk_pytest_reason_not_sdk_model` · `sdk_pytest_reason_missing_annotation` ·
   `sdk_pytest_reason_missing_param` · `sdk_pytest_reason_single_source` ·
   `script.check_scan_noise` · `script.check_overlay_discoverable_fixture` ·
   `script.check_overlay_discoverable_real` · `script.check_scan_blast_radius` ·
   `script.check_scope_walker_teeth` · `script.check_reason_teeth`.
   Dùng `scripts/config-patch.mjs` của plugin acceptance-gate, đừng sửa tay.

2. **Fixture của AC-12 phải round-trip từ plugin thật**, không viết tay. Rút từ
   `plugins/oneflow-modal-compose-overlay/deploy.py`, ghim hash, kiểm hash trước khi
   quét. Fixture tự dựng đúng khuôn bên đọc là đúng lớp lỗi phản biện vừa bắt.

3. **Luật khai-sinh-phép-đo.** Mỗi phép đo mới chỉ tính XONG khi có cặp hai chiều trên
   cùng một vật: vật lành → xanh; phá đúng chỗ trong bản sao → **đỏ kèm thông điệp ghim
   tên** (không chỉ mã thoát). E14/E15 là hai nửa đỏ đã khai sẵn trong `evals.yaml`.

## Thứ đã chốt, đừng mở lại

Đọc `decisions.jsonl` (5 dòng, dòng cuối là seal của Cổng 1). Tóm tắt:

- Duyệt theo **ranh giới phạm vi**, không liệt kê loại khối. Loại phương án chỉ-thêm-`with`
  và `with`+`if`.
- Lý do bị loại sinh ở **một chỗ duy nhất** trong `_ast_utils.py`; hai bên đọc chỉ tiêu thụ.
- **Không kèm phát hành** SDK 0.2.19. Đổi lại: bản 0.2.18 trên PyPI còn lỗi tới chuyến sau.
- Đo bằng **hành vi** ở cả mười từ khoá; đã bỏ phương án assert hình dạng mã nguồn.

## Bối cảnh không nằm trong artifact

- Máy này vừa chạy `pnpm plugins:install` nên `plugins/` có đủ 41 thư mục (39 theo
  manifest + 2 mồ côi). Bảy slot ffmpeg/cắt-cảnh nay mặc định dùng plugin chạy trên máy.
- `compose-overlay` vẫn là slot duy nhất không ai phục vụ — đó chính là thứ gói này sửa.
- Dev server đang chạy ở cổng 3000 (`preview_start` tên `tongflow`).
- `main` đã có PR #60 merge (chỉ mục tính năng + đồng bộ tài liệu), nhánh này nhánh con
  của `main` @ `29d0c3b`.
