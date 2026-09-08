## Trong hợp đồng

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra) — đếm chỗ gọi phía Python vẫn đếm docstring/chuỗi ký tự, b278980 chỉ chặn dạng `#`**
  file: `scripts/plugins/check-venv-layout-pinned.sh:71`
  severity: high
  AC: AC-4
  detail: `py_code=$(sed 's/#.*//')` rồi `grep -cE '_remove_legacy_shared_venv\('` (dòng 69–71): chỉ chú thích `#` bị lột, docstring và string literal thì không. Đo thật: thay dòng gọi `_remove_legacy_shared_venv(root, log)` trong `_ensure_venv_for` bằng `"""_remove_legacy_shared_venv(root, log) used to run here"""` → py_call vẫn = 2, guard OK, rc=0, trong khi vòng phá nhau đã tái vũ trang y như ca 13 mô tả. Ca răng `call-gone-comment-stays` (teeth.sh:73) chỉ thử dạng `pass  # ...`, nên bản vá vòng 6 được đo là kín trên đúng một dạng chú thích. Lời hứa là «một lời gọi SỐNG»; phép đo vẫn là «tên hàm xuất hiện trong văn bản không phải chú thích #». Rationale: AC-4's Then clause requires the guard to catch a side losing its legacy-venv-removal step ("mất bước dọn venv đời cũ"); this shows the Python-side call can be removed (replaced by a docstring) while the guard still reports success, exactly the scenario AC-4 promises to catch and matching the Amendment's named AC-4 debt.
  source: measurement

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra) — phía TypeScript: JSDoc một dòng và string literal đếm thành chỗ gọi, KHÔNG có ca răng nào cho phía này**
  file: `scripts/plugins/check-venv-layout-pinned.sh:82`
  severity: high
  AC: AC-4
  detail: `ts_code=$(sed -E 's#//.*##; s#^[[:space:]]*\*.*##')` (dòng 80) chỉ lột `//` và dòng bắt đầu bằng `*`; dòng `/** ... */` (bắt đầu bằng `/`) và string literal đi qua nguyên vẹn. Đo thật hai ca trên bản sao: (B) thay `removeLegacySharedVenv();` trong ensureVenv bằng `/** removeLegacySharedVenv() used to run here */` → rc=0; (C) thay bằng `logger.info("removeLegacySharedVenv() skipped")` → rc=0. Bộ răng có `c_py_call_comment` nhưng không có `c_ts_call_comment` — chú thích trong guard tuyên «Same on the TypeScript side» (dòng 79) mà chiều đỏ phía TS của lớp này chưa được đo lần nào; E5 tuyên 13 ca quét lớp «xoá chỗ gọi, giữ nhắc tên» nhưng ma trận thiếu nửa TS (chạm cả hình dạng 5). Rationale: AC-4 explicitly covers 'cả hai phía' (both sides); this shows the TypeScript-side legacy-venv-removal call can likewise be removed (replaced by a comment or log string) while the same guard still reports success — the identical failure mode as the Python side, on the other side AC-4 names.
  source: measurement

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Stale "shared venv" wording survives in engine source the diff touched — runner.py public docstring, runner.py comment inside the edited hunk, __main__.py header**
  Người dùng thấy gì: Some of the SDK's internal documentation still describes the old shared-environment behavior even though the product now uses a separate environment per plugin. This could briefly confuse a developer reading the SDK's own reference docs, but it does not change how the product behaves for end users.
  file: `sdk/tongflow/engine/runner.py`
  severity: medium
  Đề xuất: known-limits

- **ci.yml comment claims the new guard pair is addressable by the teeth mode "matching every other pinning pair", but the pair is not registered in GUARD_NEEDLES — the comment states the opposite of the tree**
  Người dùng thấy gì: A comment in the project's CI configuration incorrectly claims a safety check is being monitored by another safety check, when it currently is not. This is an internal engineering documentation accuracy issue, not something end users would notice.
  file: `.github/workflows/ci.yml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra) — kiểm AC-11 grep ci.yml vẫn khớp dòng `run:` đã bị chú-thích-hoá**
  Người dùng thấy gì: The team's own safety check that verifies certain protective scripts actually run in CI could be fooled if someone accidentally disabled the step by commenting it out — the check would still report success even though nothing ran. This is a gap in internal engineering tooling, not a risk to product users.
  file: `scripts/plugins/check-venv-layout-pinned.sh`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 (âm-tính-một-mình) — kiểm AC-13 chỉ khẳng định CỤM TỪ CŨ VẮNG, xoá hẳn docstring/banner vẫn xanh**
  Người dùng thấy gì: An internal check only confirms that outdated wording was removed from certain code comments, but doesn't confirm the correct, up-to-date description was actually written in its place — so a comment could end up blank and the check would still pass. This affects internal code documentation quality, not the running product.
  file: `scripts/plugins/check-venv-layout-pinned.sh`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (chuỗi-có-mặt thay vì quan hệ) — đối chứng dương của venvDirFor dùng `endsWith(id)`, trong khi lời hứa là «nằm ngay dưới gốc venv»**
  Người dùng thấy gì: One internal test that checks where a plugin's isolated environment gets stored uses a looser check than it could, so it might not catch every way that storage-location logic could later break. This is a gap in test thoroughness, not a bug users would encounter today.
  file: `src/lib/plugins/plugin-python-env.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay) — manifest KHÔNG mang gốc, nên nửa `root` của bố cục không round-trip; và `expected` E3a mô tả một phép đo khác phép đo thật**
  Người dùng thấy gì: The reference file used to verify that both parts of the system agree on environment folder locations doesn't itself carry the base folder path, so that piece of agreement rests on a weaker, separate check. Also, the written description for one verification test overstates what it actually tests. Both are gaps in the engineering team's own verification tooling, not something users would experience.
  file: `_acceptance/hai-duong-chay-mot-venv/evals.yaml`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/8 lỗi rơi vào file không bộ đo nào phủ (.github/workflows/ci.yml, _acceptance/hai-duong-chay-mot-venv/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
