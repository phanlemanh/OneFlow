## Trong hợp đồng

- **Legacy shared-venv removal swallows every failure, silently re-opening the loop the feature exists to close**
  file: `sdk/tongflow/engine/plugins.py:193`
  severity: high
  AC: AC-2
  detail: `_remove_legacy_shared_venv` ends with `shutil.rmtree(root, ignore_errors=True)`. If the removal fails for any reason (EPERM/EBUSY — on Windows, which this module explicitly supports via `_venv_python`'s `sys.platform == "win32"` branch, a venv whose python is in use cannot be deleted), the function returns as if it had succeeded, `root.mkdir(exist_ok=True)` proceeds, per-plugin venvs get created *inside a root that still holds `pyvenv.cfg`*, and the next `ensurePluginPython` run on the TypeScript side sees that marker and `rmSync`es the whole tree again. That is precisely the mutual-destruction cycle this package was written to end, restored on a partial-failure path with no log line and no exception.

  It also breaks the declared parity and the contract: the TypeScript twin `removeLegacySharedVenv` uses `rmSync(root, { recursive: true, force: true })`, where `force` only masks ENOENT and a permission error still throws; and AC-2 in `_acceptance/hai-duong-chay-mot-venv/contract.md` states "không có nhánh nào để lại `pyvenv.cfg` ở gốc" — this is such a branch. It is the same class of silent degradation the same commit deliberately removed two functions below (`except Exception → return sys.executable`). `scripts/plugins/check-venv-layout-pinned.sh` cannot see it: it only greps that the function *name* still exists.
  rationale: AC-2 requires no branch of legacy-venv removal to leave pyvenv.cfg at the root; ignore_errors=True on a partial-failure path is exactly such a branch.
  source: conventions

- **Plugin-id validation diverges from the TypeScript rule it is pinned to (trailing newline accepted)**
  file: `sdk/tongflow/engine/plugins.py:119`
  severity: medium
  AC: AC-10
  detail: `_PLUGIN_ID_RE = re.compile(r"^[a-zA-Z0-9._-]+$")` is used with `.match()`. In Python `$` also matches immediately before a trailing newline, so `_venv_dir(root, "oneflow-api-ffmpeg\n")` is accepted and yields a directory whose name carries the newline. The TypeScript rule the comment says it mirrors — `/^[a-zA-Z0-9._-]+$/.test(...)` in `src/lib/plugins/plugin-python-env.server.ts:66` — rejects the same string (verified: Python `True`, JS `false`).

  AC-10 requires the engine to enforce "đúng luật bên TS đã ép ở `venvDirFor`", and the module comment at line 99 claims the two are pinned against each other, but `check-venv-layout-pinned.sh` never compares the id rule at all — it only compares the path segments and greps two function names. The parametrized test cases are `["../escape", "a/b", ".hidden", ""]`, none of which exercise the newline. Fix is `re.fullmatch` (or `\Z` instead of `$`).
  rationale: AC-10 requires the engine's id validation to match the TS rule it is pinned to; the regex accepts an id the TS rule rejects.
  source: conventions

- **Legacy shared-venv removal swallows its own failure (ignore_errors=True)**
  file: `sdk/tongflow/engine/plugins.py:193`
  severity: medium
  AC: AC-2
  detail: _remove_legacy_shared_venv() ends with `shutil.rmtree(root, ignore_errors=True)` and never re-checks that `root/pyvenv.cfg` is gone. Its TypeScript mirror uses `rmSync(root, {recursive:true, force:true})`, which throws on a real failure (force only suppresses ENOENT). If the rmtree partially fails — a locked file, a permissions problem, a stale NFS handle — the function returns as if the migration succeeded, `_ensure_venv_for` proceeds to `root.mkdir(exist_ok=True)` and creates per-plugin venvs underneath a root that is STILL a venv. The next `ensurePluginPython` run on the TypeScript side then sees `pyvenv.cfg` at the root and rmSyncs the entire tree, deleting every per-plugin venv — precisely the destructive loop this package closes, reintroduced silently. This also contradicts the contract's own AC-2 ("không có nhánh nào để lại `pyvenv.cfg` ở gốc"): this branch does exactly that, with no log line and no exception. Fix: drop ignore_errors (or assert `not (root / "pyvenv.cfg").exists()` after the rmtree and raise).
  rationale: Same as above: AC-2 explicitly requires no branch to leave pyvenv.cfg at the root, and this silent-failure branch does.
  source: bugs

- **Venv-layout guard matches the function definition, so deleting the call site stays green**
  file: `scripts/plugins/check-venv-layout-pinned.sh:57`
  severity: medium
  AC: AC-4
  detail: The two `grep -q` assertions (`_remove_legacy_shared_venv` on the Python side, line 57; `removeLegacySharedVenv` on the TypeScript side, line 62) match the `def` / `export function` declaration itself, so they only detect the identifier disappearing entirely — not the migration step being unhooked. Verified empirically: copying the tree, deleting the single call `_remove_legacy_shared_venv(root, log)` from _ensure_venv_for (plugins.py:230) leaves the guard printing "OK: both runtimes pin the same venv root, and both still remove the legacy shared venv" with exit 0; same result after deleting `removeLegacySharedVenv();` at plugin-python-env.server.ts:229. The six teeth cases do not cover this because c_py_drop/c_ts_drop rename ALL occurrences including the definition. The Python half is still backstopped by tests/test_plugin_venv_layout.py::test_legacy_shared_venv_at_the_root_is_removed_first, but the TypeScript half has no backstop at all: plugin-python-env.test.ts invokes removeLegacySharedVenv() directly (deliberately, per its own comment, to avoid provisioning a real venv), so the call site inside ensureVenv is untested. Net effect: AC-4's promise that losing the legacy-cleanup step turns the guard red does not hold for the TypeScript side, and a user upgrading from the pre-2026-08-07 layout would keep a dead venv at the root forever with no measurement going red.
  rationale: AC-4 requires the pinning guard to catch a side losing the legacy-cleanup step; verified empirically the guard stays green when the call site (not just the function name) is removed, so it does not.
  source: bugs

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Both runtimes now write the same per-plugin venv but keep disjoint cache markers, so each silently overwrites the SDK the other believes it installed**
  Người dùng thấy gì: If you switch between running plugins through the app and through the engine tool, a plugin can end up quietly running an outdated version of the SDK because neither side notices the other already changed it.
  file: `sdk/tongflow/engine/plugins.py:236`
  severity: medium
  Đề xuất: known-limits

- **Module header still documents the shared venv the change removes**
  Người dùng thấy gì: An internal code comment still describes the old design and no longer matches how the software actually works; it does not change what users experience, only what a future maintainer might misread.
  file: `sdk/tongflow/engine/plugins.py:4`
  severity: medium
  Đề xuất: known-limits

- **Untrusted pluginId is concatenated into a clone path before the validation this module now applies to venv paths**
  Người dùng thấy gì: A plugin identifier that isn't properly checked before this earlier step could be used to make the app write files outside the folder it's supposed to be confined to.
  file: `sdk/tongflow/engine/plugins.py:57`
  severity: medium
  Đề xuất: new-contract

- **E3a's declared behaviour (test exports the manifest) does not match the test, which only compares against a hand-committed fixture**
  Người dùng thấy gì: The automated check meant to prove two parts of the system independently agree on plugin folder locations doesn't actually prove that — it only compares against a file someone typed by hand, so a real disagreement between the two parts could slip through unnoticed.
  file: `_acceptance/hai-duong-chay-mot-venv/evals.yaml:45`
  severity: medium
  Đề xuất: known-limits

- **SDK reinstall keyed on __version__ is stale once the SDK installs from the checkout**
  Người dùng thấy gì: If the SDK's own dependencies change without a version bump, plugins already set up on a developer's machine can keep running against the old, incomplete set of dependencies until something forces a fresh reinstall.
  file: `sdk/tongflow/engine/plugins.py:236`
  severity: medium
  Đề xuất: known-limits

- **Assert "chuỗi/thư mục CÓ MẶT" trong khi lời hứa là QUAN HỆ giữa hai phía (E3b không đo được anh xạ id → thư mục)**
  Người dùng thấy gì: The automated check meant to catch plugin folders being mislabeled internally doesn't actually catch that kind of mistake, so a real mix-up between a plugin and its folder could ship without being flagged by testing.
  file: `src/lib/plugins/plugin-python-env.test.ts:207`
  severity: high
  Đề xuất: known-limits

- **Fixture không round-trip anh xạ: cột `plugin_id` do bên QUAN SÁT bịa ra từ tên thư mục, không rút từ writer**
  Người dùng thấy gì: The reference data used to test plugin-folder naming can't actually represent a case where the two parts of the system disagree on how a plugin's identifier maps to its folder, which weakens confidence in that particular safety check.
  file: `sdk/tests/test_plugin_venv_layout.py:134`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
