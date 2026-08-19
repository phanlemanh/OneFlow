---
schema_version: 1
feature: The plugin scanner reports the reason it already has, instead of blaming entry.py
slug: scan-scope-diagnostics
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [plugins, sdk]
status: signed-off
approved_by: Manh
approved_at: 2026-08-18
---

# Acceptance Contract: scan-scope-diagnostics

## Context

A plugin author writes a handler, installs the plugin, and the registry says the slot is
unserved. The message is always the same sentence:

```
entry.py:1: no @node_slot(NodeSlots.XXX) methods found;
fix: add @node_slot and Input/Output annotations to entry.py
```

That sentence is honest in exactly one case — nothing was found, and nothing else had
anything to say. In four other cases the scanner is *holding* a specific reason (a
defining line, a method name, a syntax error, a duplicate slot) and discards it in favour
of the generic line. The author is then sent to fix a file that may not be the wrong one.

This is the defect class `scan-with-block-imports` was built to remove, reappearing in
paths that package did not cover. Its own contract says so under
"Việc tách ra hợp đồng riêng", and two more sit in its Known limits.

Root causes, one per path:

1. **The two halves of one function disagree about module scope.** `scan.py:156` builds
   `module_level = {id(node) for node in tree.body}` and gates rejection reporting on it at
   line 166, while registration in the same function uses `ast.walk`. They agree only when
   nothing is nested — so a `@node_slot` function inside `with image.imports():` (the very
   idiom the parent package legalised) registers when well-formed and goes silent when
   malformed.
2. **`scan.py:374` discards the deploy parser's error string** (`dscan, _derr = ...`).
3. **`parse_deploy.py:211` assigns where it should merge**, dropping reasons collected from
   `@deploy` classes when a separately-named `Inference` class coexists.
4. **`_scan_methods_by_slot_in_file` swallows parse failures** (`except (OSError,
   SyntaxError): return {}, set(), [], []`), so a plain typo in `entry.py` yields the
   generic line.

Source input: [design](../../docs/superpowers/specs/2026-08-18-scan-scope-diagnostics-design.md)

## Criteria

### A. Module scope decided by one boundary predicate

- AC-1: Given a plugin file whose `@node_slot` function sits inside a module-level block
  that does not open a scope (`with image.imports():`) and whose input annotation is
  missing, When the plugin is scanned, Then a problem is reported whose line equals the
  line of that `def` and whose text names the method and the reason, **and** no
  `no @node_slot ... methods found` problem is reported for that plugin. *(Both halves are
  required: emitting the reason while still emitting the generic line leaves the author
  with two messages disagreeing about which file is wrong.)*
- AC-2: Given the same malformed function placed inside each of the ten Python block
  keywords that do not open a scope — `with`, `if`, `elif`, `else`, `for`, `while`, `try`,
  `except`, `finally`, `match` — When the plugin is scanned, Then the reason is reported in
  **every one of the ten** cases, asserted one keyword at a time so a partial implementation
  names the keyword it missed; and the number of keywords asserted is itself pinned, so
  deleting a row shrinks the matrix loudly. Given the same function nested two levels deep
  (`with` inside `if` inside `try`), Then the reason is still reported. *(This is the
  criterion that separates "decide by scope boundary" from "add a few more block types to a
  list" — an implementation enumerating three of the ten passes every other criterion here.)*
- AC-3: Given a **well-formed** `@node_slot` function inside such a block, When the plugin
  is scanned, Then the slot registers and **no** problem is reported for that plugin.
  *(The green half of AC-1's pair, on the same shape. It is not covered today either: the
  parent package's fixtures nest the import, never the `def`.)*
- AC-4: Given a malformed `@node_slot` function defined **inside another `def`**, When the
  plugin is scanned, Then no problem is reported for it — a closure is not module scope, and
  the fix must not degrade into reporting everything.
- AC-5: Given a malformed `@node_slot` method in a **class body**, When the directory scan
  runs, Then no problem is reported for it — those belong to the deploy parser, and
  reporting them here too would make every healthy deploy-first plugin noisy.
- AC-6: Given both the import collector and the rejection gate must answer "is this in
  module scope", When the change lands, Then that answer is produced by **one** function in
  `_ast_utils.py` used by both, and the import collector's existing behaviour is unchanged —
  imports at bare module level, inside non-scope blocks, inside a `def`, and inside a
  `class` all collect exactly as before — all four cases, not only the negative two.
  *(The floor: the parent package's own tests must stay green, which is what makes the shared
  predicate a reuse rather than a rewrite.)* The single-function claim is a **relation** and is
  proven by mutation: neutering that one function must change the behaviour of **both** the
  rejection gate and the import collector. *(Two readers that merely agree do not evidence one
  source — an implementer can satisfy every other criterion here by adding a second private
  module-scope enumerator inside `scan.py`, which is precisely the drift this package exists to
  end.)*
- AC-15: (added after the S1 gap-probe) Given a `@node_slot` function at **bare module
  level** — no enclosing block at all — When the plugin is scanned, Then a malformed one still
  yields a problem naming its own line and method, and a well-formed one still registers with
  zero problems. *(The regression floor for the commonest shape, and the one case every other
  criterion here skips: AC-1..AC-3 nest the `def` in a block, AC-4 in a `def`, AC-5 in a class.
  It matters because the noise measure only reddens on noise GAINED — a change that widens the
  gate to blocks while dropping bare module level would lose the diagnostic that works today and
  no other eval in this contract would go red.)*

### B. A file that will not parse must say so itself

- AC-7: Given a plugin `.py` file containing a syntax error, When the plugin is scanned,
  Then a problem is reported naming **that file**, the **line of the syntax error**, and the
  parser's message, **and** the generic `no @node_slot ... methods found` problem is not
  reported for that plugin.
- AC-8: Given a plugin `.py` file that cannot be read, When the plugin is scanned, Then a
  problem is reported naming that file and the read failure, and the generic problem is not
  reported.
- AC-9: Given a `deploy.py` for which `parse_deploy_py` returns an error string — a slot
  claimed twice across two `@deploy` classes, an unreadable file, or a syntax error — When
  the plugin is scanned, Then that error string appears in the scan's `errors` for the
  plugin, and the generic problem is not reported. *(Today the string is bound to `_derr`
  and dropped on the floor.)*
- AC-10: Given both readers (`scan.py` for plugin files, `parse_deploy.py` for `deploy.py`)
  must word "this file would not parse", When each reports it, Then the sentence is produced
  by a single function in `_ast_utils.py`, proven by mutation: replacing the text at that one
  site makes the replacement surface in **both** paths. *(Equality of two strings cannot
  distinguish one source from two identical copies; only the mutation can.)*

### C. The legacy `Inference` branch merges instead of overwriting

- AC-11: Given a `deploy.py` holding a `@deploy`-marked class that registers no slot **and**
  a separately-named `Inference` class, When it is parsed, Then `slot_problems` contains the
  reasons from **both** classes.
- AC-12: Given the ordinary shape — one class that is both `@deploy`-marked and named
  `Inference` — When it is parsed, Then each reason appears **exactly once**. *(This is the
  trap in fixing AC-11, not a nicety: both readers parse the same class and produce identical
  `(lineno, reason)` tuples, so a naïve `.extend()` fixes the rare shape and simultaneously
  reports every reason twice for every ordinary deploy-first plugin. Overwriting is what
  hides that today.)*

### D. No new noise, no wider blast radius

- AC-13: Given a **committed** fixture plugin tree, When the scanner runs at the base and at
  HEAD over it, Then the set of plugin ids carrying problems gains no id the base did not
  already carry, and this check **never skips**. Given the real `plugins/` tree when plugins are
  actually installed, When the same comparison runs, Then the same holds; and when that tree is
  empty or absent, the check reports a **named** skip landing in the evidence rather than
  passing silently. *(Measured by two evals with separate exit codes, not one: `plugins/` is
  gitignored and populated at runtime, so a delta over an empty tree is empty on both sides and
  green for the wrong reason. The parent package hit this exact shape and split it too — one
  criterion, two measures, so a fresh checkout cannot answer the question vacuously.)*
- AC-14: Given this package must not widen its blast radius, When the change lands, Then
  `git diff` against the merge base shows **zero** changed files under
  `config/tongflow.abi.json`, `src/generated/abi/**`, `src/lib/abi/**`, `src/db/**`,
  `src/lib/plugin-executor/**`, `src/lib/workflow/**` and `src/app/api/**`, and the SDK
  version in `sdk/pyproject.toml` and `sdk/tongflow/__init__.py` is unchanged — this package
  ships no release. The base is the **tip of the stacked parent branch**
  `feat/scan-with-block-imports`; `origin/main` is permitted only as an explicitly recorded
  wider window. The resolved base SHA is printed into the evidence, and the check asserts it is
  a strict ancestor of HEAD with a **non-empty** diff. *(Without that last clause the eval is
  green whenever the base resolves onto HEAD — after a rebase of the stacked parent, say — and
  reports a clean blast radius having compared nothing.)*

## Coverage

Không gian quét bằng morphological box (preset *test-matrix*, đã chất vấn và thay trục: một
bộ đọc mã tĩnh không có chiều actor / surface / mạng, nên các trục preset đó được thay bằng
chiều thật của bộ đọc). 3 trục → 7 × 4 = 28 ô, dưới ngưỡng ~30 nên liệt kê hết thay vì
pairwise.

- **Trục A — hình dạng / bộ đọc nào sở hữu nó:** `def` ở module trần · `def` trong khối
  không mở phạm vi · `def` trong `def` (closure) · `def` trong thân `class` · class
  `@deploy` · class `Inference` cũ · class `@deploy` không đăng ký gì **đứng cạnh** một
  class tên `Inference` riêng. Thước CE: chính hai bộ đọc trong
  [`scan.py`](../../sdk/tongflow/scan.py) và [`parse_deploy.py`](../../sdk/tongflow/parse_deploy.py)
  [SUY-TỪ-REPO], cộng luật phạm vi của Python — chỉ `def`/`class`/`lambda`/comprehension mở
  phạm vi mới [NGÀNH: CPython `symtable`]. Phủ bởi AC-1..AC-5, AC-9, AC-11, AC-12, và
  AC-15 cho giá trị «module trần» (ô này trống cho tới lượt phản biện context sạch ở S1).
- **Trục B — lớp lý do:** không có (lành) · lý do theo từng `def` · lỗi cấu trúc tệp
  (không đọc được / sai cú pháp) · xung đột chéo class (trùng slot). Thước CE:
  `slot_rejection_reason` và các nhánh trả lỗi của `parse_deploy_py` [SUY-TỪ-REPO:
  `sdk/tongflow/_ast_utils.py`, `sdk/tongflow/parse_deploy.py`]; đối chiếu quy ước của các
  bộ phân tích tĩnh Python — chẩn đoán neo tại dòng định nghĩa gây lỗi và việc lồng trong
  `if`/`with`/`try` không bao giờ dập tắt nó [NGÀNH: ruff, mypy, pyright, flake8]. Phủ bởi
  AC-1, AC-7, AC-8, AC-9, AC-11.
- **Trục C — từ khoá khối không mở phạm vi** (áp cho trục A giá trị 2): mười từ khoá + lồng
  nhau. Thước CE: ma trận `_BLOCKS` mười từ khoá đã tồn tại trong
  [`test_scan_scope.py`](../../sdk/tests/test_scan_scope.py) [SUY-TỪ-REPO] — bộ đo này là
  bản sao của nó cho nhánh chẩn đoán. Phủ bởi AC-2.

Ô cắt bỏ và lý do nằm ở *Out of scope*; không ô `[NGÀNH]` nào bị bỏ câm.

## Out of scope

- **Lỗi gương "closure vẫn đăng ký".** `ast.walk` đăng ký một `def` mang `@node_slot` nằm
  trong một `def` khác; `methods_by_slot` lưu **tên** phương thức trần, mà tên của closure
  không được gắn ở module scope, nên slot đăng ký trỏ vào thứ không ai phân giải được. Sửa
  nó là đổi hành vi ĐĂNG KÝ — gói này cố ý chỉ chạm nửa chẩn đoán (quyết định ở Cổng 1).
  AC-4 chỉ đòi nó im lặng, không đòi nó thôi đăng ký.
- **Đăng ký `@staticmethod` trong thân class qua bản quét thư mục.** Không có lần xuất hiện
  nào trong kho, và plugin thật nằm trong `plugins/` (gitignore), nên không thay đổi nào ở
  đây kiểm chứng được là an toàn.
- **`@deploy` / `Inference` được tìm bằng `tree.body`.** Một class handler lồng trong khối
  module-level vô hình với **cả hai** nửa — hẹp một cách nhất quán chứ không lệch nhau — nên
  nới nó là việc của hành vi đăng ký, không phải của hợp đồng này.
- **Không phát hành SDK.** Không bump version, không publish PyPI, không đụng pin
  `oneflow-sdk==X.Y.Z` của plugin nào (AC-14 là thứ canh).

## Notes

- **Ràng buộc hạng:** T3 vì `sdk/**` nằm trong `risk_tiers.t3_paths`. Gói này chạm
  `sdk/tongflow/_ast_utils.py`, `sdk/tongflow/scan.py`, `sdk/tongflow/parse_deploy.py`,
  một tệp test MỚI `sdk/tests/test_scan_diagnostics.py`, và các script gate dưới
  `scripts/plugins/`. **Không sửa `sdk/tests/test_scan_scope.py`** — tệp đó đã 521 dòng và
  đang là thước của gói cha dở S4; tách tệp giữ nguyên phép đo của họ và tránh trần 800
  dòng.
- **Nhánh nền:** gói này **chồng lên** `feat/scan-with-block-imports` @ `6e406f3`, chưa
  merge và đang dở S4 (evidence vòng 2 = PENDING-JUDGMENT, triage chưa trọn, đang chờ Cổng
  2 của họ). Mã được sửa chỉ tồn tại trên nhánh đó, nên `main` không phải nền khả dĩ. Hệ
  quả phải nói rõ ở Cổng 2: PR này chỉ merge được **sau** PR cha, và nếu nhánh cha đổi thì
  bằng chứng ở đây thành stale. **Đã xảy ra một lần ngay trong S1 này**: nền nhảy
  `a33e0df` → `6e406f3` (3 commit, trong đó có memoise `_collect_models_roots`) giữa lúc
  soạn hợp đồng — nên đây là rủi ro đo được, không phải giả định.
- **Sóng ký lại:** thay đổi trong `sdk/**` làm hết hiệu lực bằng chứng của các feature sở hữu
  file trong đó — ứng viên là `conformance-l0`, `oneflow-plugin-prefix` và chính
  `scan-with-block-imports`. Chi phí thật tính bằng máy ở Cổng 1.

### Known limits (Cổng 2 — người ký chấp nhận, ship bản này)

Năm hạn chế do vòng review S4 xác nhận, đều NGOÀI phạm vi đã duyệt ở Cổng 1; hai mục đầu
được chủ động tái hiện lại bằng tay trước khi ký. Hai gốc rễ của chúng chuyển sang hợp
đồng con (mục kế).

- **`deploy.py` không phân tích được bị báo HAI lần, giống hệt từng byte.** Bản quét thư
  mục đọc mọi `*.py` kể cả `deploy.py` (`scan.py:149`), rồi `parse_deploy_py` đọc lại chính
  tệp đó (`scan.py:~390`); vì hai bộ đọc cố ý nói chung một câu (AC-10), hai dòng trùng
  khít. Hai finder độc lập cùng hội tụ về lỗi này. Tái hiện: `deploy.py` chứa
  `class Inference(:` → hai entry `errors` y hệt.
- **Một tệp `.py` lạc lối hỏng cú pháp dập mất câu chẩn đoán đăng ký thật.** Tái hiện:
  plugin có `entry.py` lành không handler + `tests/legacy.py` chứa `print "py2"` → chỉ còn
  lỗi cú pháp của tệp rác, câu `no @node_slot ... found` biến mất. Hành vi này là ĐÚNG
  NGUYÊN VĂN AC-7 đã duyệt ("a plugin `.py` file", không giới hạn tệp) — lỗi nằm ở câu chữ
  tiêu chí viết quá rộng, nên sửa nó bắt buộc đi đường amend ở hợp đồng con, không có
  đường vá im lặng trong gói này.
- **Ca đo NUL-byte xanh được bằng đường sai.** Khẳng định duy nhất của nó là chuỗi đường
  dẫn có mặt trong danh sách lỗi, mà câu chung chung của chính plugin đó cũng chứa đúng
  chuỗi ấy — nếu lỗi parse bị nuốt trở lại, phép đo vẫn xanh. (`test_scan_diagnostics.py`,
  ca NUL-byte.)
- **Răng `scope-gate` tuyên quét cả nhóm nhưng chỉ chạy điểm-case.** Lượt phá thử phủ hẹp
  hơn danh sách phép đo nó nhân danh.
- **Răng `parse-failure` chạy 2/7 ca của nhóm nó tuyên.** Cùng lớp với mục trên — lớp
  thước-lỏng này xuất hiện ở cả ba vòng review, dấu hiệu khuôn viết thước sai chứ không
  phải chín cái thước tình cờ sai.

### Việc tách ra hợp đồng riêng

- **`scan-parse-failure-semantics`** — một hợp đồng con ôm cả hai gốc rễ còn sống:
  1. *Ngữ nghĩa lỗi-đọc-tệp ở tầng `scan()`:* một lý do chỉ xuất hiện MỘT lần tại nơi hai
     bộ đọc gặp nhau (nâng bất biến "exactly once" của AC-12 từ `parse_deploy` lên
     `scan()`), và câu chẩn đoán chung chung chỉ nhường chỗ cho lỗi ở tệp CÓ THỂ chứa
     handler (`entry.py` / `deploy.py`) — điều này **supersede câu chữ AC-7 của hợp đồng
     này**, đi qua Cổng 1 của chính nó.
  2. *Luật đo:* mọi khẳng định âm phải ghim thông điệp và có đối chứng dương; mọi lượt phá
     thử chạy TRỌN nhóm nó tuyên; tái cắt các thước lỏng nêu trên dưới luật đó một thể.
  Xem `HANDOFF.md` cùng thư mục cho đầu vào đầy đủ (tái hiện, con trỏ dòng, phác tiêu chí).
