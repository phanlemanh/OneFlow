---
schema_version: 1
feature: Plugin scanner reads imports by scope boundary, and says why a slot was skipped
slug: scan-with-block-imports
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [plugins, sdk]
status: verified
approved_by: Manh
approved_at: 2026-08-18
---

# Acceptance Contract: scan-with-block-imports

## Context

A user installs the official plugin list, drags the text/price-tag/logo node onto the
canvas, and clicks run — nothing serves it. The registry reports slot `compose-overlay`
as unserved and blames `entry.py`, while the plugin itself is written exactly to the
documented pattern.

Root cause, proven by a one-variable test: `_collect_models_roots`
(`sdk/tongflow/_ast_utils.py:37-49`) walks the module body by naming block types and
knows only `ast.Try`. The plugin puts its model imports inside Modal's standard
`with image.imports():`, so the model names never enter the valid set, the annotation
check fails, and the method is skipped **silently**.

Two defect classes, fixed together: enumerating block types instead of respecting scope
boundaries; and failing closed while blaming the wrong file.

Source input: [design](../../docs/superpowers/specs/2026-08-18-scan-with-block-imports-design.md)

## Criteria

### A. Import reader — scope boundary, not a list of block types

- AC-1: Given a `deploy.py` whose model import sits inside `with image.imports():` and
  whose `@deploy` class has a `@node_slot` method annotated with those models, When
  `parse_deploy_py` parses it, Then `methods_by_slot` contains that slot mapped to that
  method name.
- AC-2: Given the same import shape in a plugin file scanned by the entry-file path,
  When `scan()` runs over the plugin directory, Then the slot appears in the scan result
  and no "no @node_slot methods found" problem is raised for that plugin.
- AC-3: Given a model import placed inside each of the ten Python block keywords that
  do **not** open a scope — `with`, `if`, `elif`, `else`, `for`, `while`, `try`,
  `except`, `finally`, `match` — When the module is parsed, Then the imported names are
  collected in **every one of the ten** cases, asserted one keyword at a time so a
  partial implementation names which keyword it missed. Given the same import nested two
  or more levels deep (`with` inside `if` inside `try`), Then it is still collected.
  *(This criterion is what distinguishes "walk by scope boundary" from "add a few more
  block types to the list": an implementation that enumerates three of the ten passes
  every other criterion in this contract and fails only here.)*
- AC-4: Given a model import placed inside a `def` or a `class` body, When the module is
  parsed, Then those names are **not** collected and a `@node_slot` method annotated
  only by them is **not** registered — a function-local import binds a local name, and
  the fix must not degrade into accepting everything.
- AC-5: Given the three import spellings the collector already supports —
  `from tongflow.models.x import YInput`, the same with `as`, and
  `import tongflow.models.x as m` used as `m.YInput` — When each appears inside a
  non-scope block, Then all three are collected, matching their behaviour at module level.
- AC-6: Given imports at bare module level and inside `try`/`except`, When the module is
  parsed, Then they are collected exactly as before this change — the existing behaviour
  is a floor, not a casualty.

### B. Diagnostics — a skipped slot must name its reason

- AC-7: Given a method decorated with `@node_slot` whose input or return annotation is
  not an SDK model type, and given the scan begins from a different file than the one
  defining that method, When the plugin is scanned, Then a problem is reported whose
  **file is the file that defines the method** and whose **line is the line of its
  `def`** — not the file the scan happened to start from — together with the method name
  and the reason. *(The relation is the point, not the presence of four substrings: the
  original defect blamed `entry.py` while the cause sat in `deploy.py`. A problem naming
  `entry.py:1` satisfies "names a file and a line" and would still have cost the same
  debugging session.)*
- AC-8: Given a method decorated with `@node_slot` that is missing its input or return
  annotation entirely, When the plugin is scanned, Then a problem is reported naming
  that reason.
- AC-9: Given a method decorated with `@node_slot` that omits the input parameter
  entirely, When the plugin is scanned, Then a problem is reported naming that reason.
- AC-10: Given both consumer paths (`scan.py` for entry-style files and
  `parse_deploy.py` for `@deploy` classes), When each rejects a method for the same
  reason, Then the reason text is produced by a single function in `_ast_utils.py` and
  is character-for-character identical across the two paths — there is one wording, not two.
- AC-11: Given the plugins currently installed under `plugins/`, When the scanner runs
  before and after this change, Then the set of reported problems gains **no** entry for
  a plugin that was previously clean — the new diagnostic must not turn healthy plugins
  noisy.

### C. Product-level effect

- AC-12: Given a committed fixture plugin tree whose `deploy.py` is round-tripped
  byte-for-byte from the real `oneflow-modal-compose-overlay` (hash pinned, so the
  fixture cannot drift into a shape the real plugin never had), When the scanner runs the
  way the server runs it — module entry, repo `sdk/` first on `PYTHONPATH`, root derived
  from the script's own location and not from the caller's working directory — Then
  `nodePluginMap["compose-overlay"]` is non-empty, `errors` holds no entry for that
  plugin id, and the loaded `tongflow.__file__` resolves **under this repo's `sdk/`**
  rather than any installed copy. This eval never skips.
- AC-14: Given the real `plugins/` tree when the plugin is actually installed there,
  When the same scan runs, Then the same three assertions hold; when it is not installed,
  the check reports a **named** skip that appears in the evidence rather than passing
  silently. *(Split from AC-12 on purpose: `plugins/` is gitignored and populated at
  runtime, so making the product-level question depend on it means a fresh checkout can
  ship green without ever answering it.)*
- AC-13: Given this package must not widen its blast radius, When the change lands, Then
  `git diff` shows **zero** changed files under `config/tongflow.abi.json`,
  `src/generated/abi/**`, `src/lib/abi/**`, `src/db/**`, and the SDK version in
  `sdk/pyproject.toml` and `sdk/tongflow/__init__.py` is **unchanged** — this package
  ships no release.

## Coverage

Space scanned with a morphological box (preset *test-matrix*, adapted: a static source
reader has no actor/surface/network dimension, so those preset axes were replaced by the
reader's real dimensions). 4 axes → 96 cells → **pairwise**, per the preset's own rule
for spaces above ~50 cells.

- **Nơi câu import đứng** — module trần · khối không mở phạm vi (mười từ khoá `with`
  `if` `elif` `else` `for` `while` `try` `except` `finally` `match`, kể cả lồng nhau) ·
  trong `def` · trong `class`. Bằng chứng "đủ": luật phạm vi của chính Python
  ([NGÀNH: CPython `symtable`]), bộ soát tên pyflakes dựng cây phạm vi
  ([NGÀNH: pyflakes]), và cách pyright/mypy xử lý riêng `if TYPE_CHECKING:` — cộng lỗi
  thật đo được tại `sdk/tongflow/_ast_utils.py:37-49`. Phủ bởi AC-3 (ma trận mười từ
  khoá) và AC-4 (chân âm `def`/`class`).
- **Đường tiêu thụ** — `scan.py` (quét mọi tệp `.py`) · `parse_deploy.py` (class
  `@deploy`). Bằng chứng "đủ": chỉ có đúng hai chỗ gọi trong toàn SDK, đọc được ở
  `scan.py:153` và `parse_deploy.py:55`. Phủ bởi AC-1, AC-2 (mỗi đường một ca) và AC-10
  (cùng một lý do qua cả hai đường).
- **Kết cục của method mang `@node_slot`** — được đăng ký · loại vì chú thích không phải
  model của SDK · loại vì thiếu chú thích · loại vì thiếu tham số. Bằng chứng "đủ": bốn
  nhánh `continue` đọc được tại `scan.py:159-167` và `parse_deploy.py:62-78`. Phủ bởi
  AC-7, AC-8, AC-9.
- **Dạng câu import** — `from X import Y` · `from X import Y as Z` · `import X as m` rồi
  `m.YInput`. Bằng chứng "đủ": ba nhánh bộ thu đã xử lý tại `_ast_utils.py:20-36`. Phủ
  bởi AC-5.

Không gian 4 trục → 96 ô → **pairwise**, đúng luật của preset cho không gian trên ~50 ô.
AC-6 giữ vai chống hồi quy: module trần và `try` phải xanh trên CẢ mã đã vá lẫn chưa vá,
nên nó là sàn chứ không phải bản nhắc lại AC-3.

Ô *khối không mở phạm vi* KHÔNG được rút về một ca đại diện: AC-3 liệt kê đủ mười từ
khoá, một assert mỗi từ khoá. Lý do là kết quả phản biện — một ca đại diện không phân
biệt được "duyệt theo ranh giới phạm vi" với "thêm vài loại khối vào danh sách", mà đó
đúng là quyết định trụ cột của gói này.

Never: import bên trong comprehension hay lambda — Python không cho phép, nên ô này
không tồn tại chứ không phải bị cắt.

Không ô nào mang `[GIẢ ĐỊNH]`; không trục nào `[CE chưa kiểm chứng]`.

## Out of scope

- Phát hành `oneflow-sdk` lên PyPI, bump ghim `oneflow-sdk==X.Y.Z` trong plugin, dựng
  lại venv. Đường đang hỏng không đọc bản published (xem design §3).
- Sửa `compose-overlay` hay bất kỳ plugin nào. Plugin viết đúng chuẩn.
- `extract_default_slots` / `extract_slot_models` — giữ nguyên chỉ-đọc-cấp-module, đó là
  thiết kế có chủ đích.
- Va chạm thư mục venv giữa đường TS và đường Python (nợ riêng, đã ghi trong STATUS.md).
- `tongflow-api-bytedance` khai `NodeSlots.REFS_GEN_VIDEO` không có trong ABI — lỗi
  thượng nguồn, khác gốc.
- Dọn hai thư mục plugin mồ côi mà `pnpm plugins:install` không prune.

## Notes

- **Ràng buộc hạng:** T3 vì `sdk/**` nằm trong `risk_tiers.t3_paths`. AC-13 là thứ canh
  đúng ranh giới: gói này chạm `sdk/tongflow/_ast_utils.py` và test của nó, không chạm
  chokepoint hợp đồng nào khác.
- **Sóng ký lại:** thay đổi trong `sdk/**` sẽ làm hết hiệu lực bằng chứng của các feature
  sở hữu file trong đó. Chi phí thật tính bằng máy ở Cổng 1 — ứng viên chắc chắn là
  `conformance-l0` và `oneflow-plugin-prefix` (cả hai sở hữu file dưới `sdk/`).

### Known limits (Cổng 2, vòng 2 — người ký chấp nhận, ship bản này)

Bảy lỗi do vòng review xác nhận nằm NGOÀI phạm vi đã duyệt ở Cổng 1. Năm mục dưới đây
được ghi nhận và ship như hiện trạng; hai mục còn lại tách sang hợp đồng riêng (xem
mục kế).

- **Bản mẫu tự chiếu chính nó.** `deploy.py.sha256` chốt bản mẫu với chính nó, nên nó
  chỉ bắt được "ai đó sửa bản mẫu mà quên cập nhật hash" — KHÔNG bắt được trôi so với
  plugin thật, vì `plugins/` là thư mục gitignore và bản thượng nguồn không nằm trong
  kho. Chữ trong `check-overlay-discoverable.sh` và README của bản mẫu đang hứa nhiều
  hơn thứ nó chứng minh được. (`deploy.py.sha256:1`, `check-overlay-discoverable.sh:22`)
- **Nhánh `Inference` cũ ghi đè thay vì gộp lý do.** Với một hình dạng tệp hiếm — class
  mang `@deploy` không đăng ký được slot nào, đứng cạnh một class tên đúng `Inference` —
  mọi lý do thu từ class `@deploy` bị thay chứ không gộp, và người viết plugin nhận lại
  câu chung chung. Vô hại ở hình dạng phổ biến (class `@deploy` chính là `Inference`).
  (`parse_deploy.py:211`, hai finding cùng gốc)
- **Lỗi cấu trúc `deploy.py` bị nuốt.** `scan()` bỏ đi chuỗi lỗi mà `parse_deploy_py`
  trả về — tệp không đọc được, sai cú pháp, hoặc khai trùng một slot trên hai class —
  rồi thay bằng câu chung chung trỏ `entry.py`. Cùng họ với lỗi gốc của gói này nhưng ở
  một nhánh khác. (`scan.py:374`)

### Việc tách ra hợp đồng riêng

- **Nửa chẩn đoán vẫn chốt bằng lớp ngoài cùng, không bằng ranh giới phạm vi.**
  `scan.py:156` dựng `module_level` từ `tree.body`, trong khi nửa đăng ký dùng
  `ast.walk` duyệt cả cây. Hệ quả: một hàm mang `@node_slot` đặt trong khối `if`/`with`/
  `try` ở lớp ngoài cùng — đúng thành ngữ mà gói này vừa hợp thức hoá — thì ĐĂNG KÝ
  được, nhưng khi viết sai lại nhận câu chung chung `entry.py:1` thay vì lý do. Không
  phép đo nào của gói này phủ hình dạng đó. Nặng, và nằm trong lời hứa của họ tiêu chí
  B, nhưng ngoài phạm vi Cổng 1 đã duyệt (AC-7 nói về method trên class `@deploy`) →
  làm thành một feature riêng có AC và eval của nó. (`scan.py:156`, `scan.py:166`)
