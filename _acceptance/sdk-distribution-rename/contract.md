---
schema_version: 1
feature: Publish the SDK as oneflow-sdk while keeping the tongflow import package
slug: sdk-distribution-rename
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [sdk]
status: verified
approved_by: Manh
approved_at: 2026-07-26
time_human_minutes: {gate1: 0, gate2: 0}
---

# Acceptance Contract: sdk-distribution-rename

## Context

Phase 0 item 0.1, first half. The fork cannot publish to the `tongflow` name
on PyPI — upstream owns it — and that blocks the wedge: adding the
`compose-overlay` slot and the Vietnamese TTS plugin both require publishing a
new SDK before any plugin can consume the new types.

Python separates the **distribution** name (what PyPI serves, what `pip
install` takes) from the **import** name (what `import x` resolves). Option C,
chosen 2026-07-26, exploits that split: rename only the distribution to
`oneflow-sdk` now, and leave the import package as `tongflow`. That unblocks
publishing while touching 4 files instead of the 82 Python files and 38 plugin
repos a full import rename would require.

The trade-off is explicit and accepted: a machine with both `tongflow` and
`oneflow-sdk` installed has two distributions fighting over the same `tongflow`
import namespace. That is acceptable because no target environment installs
both, and renaming the import package later (option A) stays open.

Source input: prompt (product plan Phase 0 item 0.1; option C decided by Manh 2026-07-26)

## Criteria

- AC-1: Given `sdk/pyproject.toml`, When it is parsed, Then `project.name` is `oneflow-sdk`.
- AC-2: Given the same file, When `tool.setuptools.packages.find.include` is read, Then it still selects `tongflow*` and the directory `sdk/tongflow/` is unchanged — option C renames the distribution only, and a stray rename here would silently ship an empty package.
- AC-3: Given the installed SDK, When `import tongflow` runs, Then it succeeds and still exposes its public API (`run_workflow`, `progress`, `deploy`) — the import name is the thing 82 Python files depend on.
- AC-4: Given the version is declared twice, When `sdk/pyproject.toml` and `sdk/tongflow/__init__.py` are compared, Then the two values match — CLAUDE.md names this drift a recurring bug, and a rename is exactly when it slips.
- AC-5: Given `project.urls`, When each URL is read, Then none points at `tong-io` or `tongflow.com`; every one addresses this fork.
- AC-6: Given `scripts/publish-tongflow-pypi.sh`, When it cleans build output and prints the local-install hint, Then it uses the setuptools-normalised artifact names — `oneflow_sdk.egg-info` and `dist/oneflow_sdk-<version>-py3-none-any.whl` (dash normalises to underscore) — so it neither leaves stale output nor prints a path that does not exist.
- AC-7: Given the same script, When it prints the final install instruction, Then it says `pip install oneflow-sdk==<version>`.
- AC-8: Given every doc that instructs a plugin author (`CLAUDE.md`, `docs/plugins.md`, `sdk/README.md`), When SDK installation or pinning is described, Then it names `oneflow-sdk` — a doc that still says `pip install tongflow` sends the author to upstream's package.
- AC-9: Given `package.json`, When the publish script is invoked, Then its name no longer claims the upstream product, and every reference to the old script name across docs is updated in the same change — a dangling `pnpm tongflow:publish` in a doc is a broken instruction.
- AC-10: Given the whole repository, When it is searched for distribution-name usages (`pip install tongflow`, `pip_install("tongflow==`, `tongflow.egg-info`, `dist/tongflow-`), Then none remains outside the gitignored `plugins/` tree.
- AC-11: Given the SDK is functionally untouched, When `cd sdk && pytest` runs, Then the whole suite is green.
- AC-12: Given `package.json` changed, When `pnpm lint:check`, `pnpm typecheck` and `pnpm build` run, Then all three pass.
- AC-13: Given the engine provisions the shared plugin venv, When it installs the SDK from PyPI, Then it installs the name held in `tongflow.__distribution__` rather than a hard-coded string, and that constant equals `project.name` in `sdk/pyproject.toml` — otherwise the engine tells pip to fetch a distribution that does not exist. **Added during implementation, after Gate 1** (see Notes).

## Coverage

Morphological scan of the change surface:

- Trục **danh tính**: tên phân phối (đổi — AC-1) | tên import (giữ nguyên — AC-2, AC-3). [thước CE: Python tách hai khái niệm này; mỗi cái có đúng một AC khẳng định hướng của nó]
- Trục **nơi tên xuất hiện**: metadata gói (AC-1, AC-5) | script publish (AC-6, AC-7) | tài liệu cho tác giả plugin (AC-8) | script npm (AC-9) | quét toàn repo bắt sót (AC-10). [thước CE: 20 dòng tìm được khi kiểm kê, gom đúng 5 nhóm này]
- Trục **phiên bản**: parity `pyproject` ↔ `__init__` (AC-4). [thước CE: CLAUDE.md tự khai đây là lỗi lặp lại]
- Trục **không hồi quy**: SDK pytest (AC-11) | cây kiểm tra JS (AC-12).
- Trục **artefact build**: tên egg-info và tên file wheel sau khi setuptools chuẩn hoá dấu gạch (AC-6). [thước CE: `oneflow-sdk` → `oneflow_sdk`, đúng một phép chuẩn hoá cần bắt]

## Out of scope

- **Đổi tên gói import `tongflow` → `oneflow`** (phương án A). Đây chính là thứ phương án C hoãn lại: nó chạm 69 file trong `plugins/`, 13 file trong `sdk/`, 12 biến `TONGFLOW_*`, tên file `tongflow.abi.json` và validator tiền tố thư mục plugin.
- **Publish thật lên PyPI.** Cần token của người dùng và là thao tác ra ngoài; việc này chỉ làm cho repo *sẵn sàng* publish.
- **Mirror 38 plugin repo và sửa `pip_install(...)` pin của chúng.** `plugins/` bị gitignore — pin nằm trong repo khác, và còn chờ quyết định tên org.
- **`DEFAULT_ORG` và `org` trong `config/official-plugins.json`.** Chờ tên GitHub org, chưa chốt.
- **Tách desktop shell khỏi `app.tongflow.com`.** Chờ URL cloud, chưa tồn tại.
- **Sửa lệch pin sẵn có giữa các plugin** (30 chỗ ghim `0.2.16`, 1 chỗ `0.2.13`, SDK ở `0.2.17`). Ghi nhận ở đây, xử lý cùng lúc mirror repo.
- **Đổi số phiên bản.** Giữ `0.2.17` — mã nguồn đang ở đúng trạng thái đó; lần sửa SDK tiếp theo mới bump.

## Notes

- **AC-13 được thêm SAU khi Cổng 1 đã duyệt.** Lúc implement mới phát hiện
  [`plugins.py`](../../sdk/tongflow/engine/plugins.py) chạy `pip install tongflow==<version>`
  để dựng venv cho plugin — tức đổi tên phân phối mà không sửa chỗ này thì engine
  sẽ bảo pip tải một gói không tồn tại. Đây là phụ thuộc **chức năng**, không phải
  tài liệu, và bộ mẫu quét của AC-10 không bắt được (mẫu là `pip install tongflow`
  có dấu cách, còn code dùng f-string `f"tongflow=={version}"`). Thêm tiêu chí là
  làm chặt hơn chứ không nới lỏng, nhưng phạm vi đã lớn hơn cái được duyệt — cần
  nêu rõ ở Cổng 2. Cách chữa: hằng số `__distribution__` cạnh `__version__` làm
  nguồn sự thật duy nhất, đóng vòng lệch y như cách parity phiên bản đang làm.
- setuptools chuẩn hoá `-` thành `_` trong tên artefact: phân phối `oneflow-sdk` sinh ra `oneflow_sdk-0.2.17-py3-none-any.whl` và `oneflow_sdk.egg-info`. Viết sai chỗ này thì script publish in ra đường dẫn không tồn tại mà không báo lỗi.
- `python -m build` chưa cài ở môi trường này (script publish tự dựng venv riêng), nên eval khẳng định metadata bằng `tomllib` thay vì dựng artefact thật; `pip install -e sdk` trong CI vẫn chứng minh gói cài được dưới tên mới.
- Không có bề mặt web UI → bỏ qua eval design theo SKILL 2b.
