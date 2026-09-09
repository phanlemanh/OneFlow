"""Plugin preflight for the standalone engine.

Given an exported workflow, collect the ``pluginId``s it needs, clone any that
are missing, provision ONE VENV PER PLUGIN (SDK + that plugin's ``requirements.txt``),
and scan the plugins directory into a manifest the invoker uses.

Mirrors the desktop app's behavior:
- clone/update  -> ``plugins-install.server.ts`` (here via system ``git``)
- per-plugin venv -> ``plugin-python-env.server.ts`` (marker caching). The root
  ``data/.tongflow/plugin-venv`` CONTAINS the venvs and is never itself one; a
  ``pyvenv.cfg`` at the root is the pre-2026-08-07 shared venv and gets removed.
  Both runtimes are pinned to that layout by
  ``scripts/plugins/check-venv-layout-pinned.sh``.
- manifest scan -> reuses :func:`tongflow.scan.scan`

Plugin git URL convention matches ``official-plugins.server.ts``:
``{org}/{pluginId}.git`` (default org ``https://github.com/tong-io``). Pass
``plugin_git_urls`` to override per plugin or to install non-official plugins.
"""

from __future__ import annotations

import hashlib
import re
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any, Callable, Optional

from ..scan import scan
from ._subproc import utf8_env

DEFAULT_ORG = "https://github.com/tong-io"

# The directory that contains the importable ``tongflow`` package (sdk root, the
# one with pyproject.toml). engine -> tongflow -> sdk.
SDK_ROOT = Path(__file__).resolve().parents[2]

LogCb = Callable[[str], None]


def collect_plugin_ids(workflow: dict[str, Any]) -> list[str]:
    ids: list[str] = []
    for node in workflow.get("executableNodes", []):
        if not isinstance(node, dict):
            continue
        pid = node.get("pluginId")
        if isinstance(pid, str) and pid.strip() and pid not in ids:
            ids.append(pid.strip())
    return ids


def _git_url_for(plugin_id: str, org: str, overrides: dict[str, str]) -> str:
    if plugin_id in overrides:
        return overrides[plugin_id]
    return f"{org.rstrip('/')}/{plugin_id}.git"


def _clone_plugin(plugin_id: str, url: str, plugins_dir: Path, log: LogCb) -> None:
    dest = plugins_dir / plugin_id
    plugins_dir.mkdir(parents=True, exist_ok=True)
    log(f"cloning plugin {plugin_id} from {url}")
    r = subprocess.run(
        ["git", "clone", "--depth", "1", url, str(dest)],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        env=utf8_env(),
    )
    if r.returncode != 0:
        raise RuntimeError(
            f"git clone failed for {plugin_id} ({url}): {r.stderr.strip() or r.stdout.strip()}"
        )


def ensure_plugins_present(
    plugin_ids: list[str],
    plugins_dir: Path,
    *,
    auto_install: bool,
    org: str,
    plugin_git_urls: Optional[dict[str, str]],
    log: LogCb,
) -> None:
    overrides = plugin_git_urls or {}
    missing = [pid for pid in plugin_ids if not (plugins_dir / pid).is_dir()]
    if not missing:
        return
    if not auto_install:
        raise RuntimeError(
            "Missing plugins: "
            + ", ".join(missing)
            + f". Install them under {plugins_dir} or pass auto_install=True."
        )
    for pid in missing:
        _clone_plugin(pid, _git_url_for(pid, org, overrides), plugins_dir, log)


# --- per-plugin venv (mirrors plugin-python-env.server.ts) -----------------


# Mirrors `venvDirFor` in src/lib/plugins/plugin-python-env.server.ts. The two
# implementations are pinned against each other by
# scripts/plugins/check-venv-layout-pinned.sh — change one, change both.
_PLUGIN_ID_RE = re.compile(r"^[a-zA-Z0-9._-]+$")


def _venv_root(data_dir: Path) -> Path:
    """The directory that CONTAINS one venv per plugin. Never itself a venv."""
    return data_dir / ".tongflow" / "plugin-venv"


def _venv_dir(root: Path, plugin_id: str) -> Path:
    """The venv directory for one plugin id.

    The id arrives from a directory name on disk and is concatenated into a
    filesystem path, so it is validated rather than trusted: a separator, a
    leading dot, or an empty string would place a venv outside the root that
    eviction scans.
    """
    # fullmatch, not match: Python's `$` also matches before a trailing
    # newline, so `re.match` would accept "oneflow-api-ffmpeg\n" while the
    # JavaScript rule this mirrors rejects it.
    if not _PLUGIN_ID_RE.fullmatch(plugin_id) or plugin_id.startswith("."):
        raise ValueError(f"unsafe plugin id for a venv path: {plugin_id!r}")
    return root / plugin_id


def _venv_python(venv_dir: Path) -> Path:
    if sys.platform == "win32":
        return venv_dir / "Scripts" / "python.exe"
    return venv_dir / "bin" / "python"


def _markers_dir(venv_dir: Path) -> Path:
    return venv_dir / ".markers"


def _hash_file(path: Path) -> str:
    try:
        return hashlib.sha256(path.read_bytes()).hexdigest()
    except OSError:
        return "none"


def _read_marker(venv_dir: Path, name: str) -> Optional[str]:
    try:
        return (_markers_dir(venv_dir) / name).read_text(encoding="utf-8").strip()
    except OSError:
        return None


def _write_marker(venv_dir: Path, name: str, value: str) -> None:
    md = _markers_dir(venv_dir)
    md.mkdir(parents=True, exist_ok=True)
    (md / name).write_text(value, encoding="utf-8")


def _run(cmd: list[str], cwd: Path) -> tuple[int, str]:
    r = subprocess.run(
        cmd,
        cwd=str(cwd),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        env=utf8_env(),
    )
    return r.returncode, (r.stdout + r.stderr)


def _sdk_version() -> str:
    # Lazy import to avoid a circular import (tongflow.__init__ imports engine).
    from tongflow import __version__

    return __version__


def _sdk_distribution() -> str:
    """PyPI name to install — not the import name, which stays ``tongflow``."""
    from tongflow import __distribution__

    return __distribution__


def _remove_legacy_shared_venv(root: Path, log: LogCb) -> None:
    """Remove the pre-2026-08-07 shared venv, which lived AT the path that is
    now the root holding one venv per plugin.

    Mirrors `removeLegacySharedVenv` in plugin-python-env.server.ts. Detected by
    the pyvenv.cfg that only a venv root has; a directory OF venvs has none.
    Without this the corpse sits at the root forever and the TypeScript side
    deletes the whole tree on its next provisioning run.
    """
    if not (root / "pyvenv.cfg").is_file():
        return
    log("removing the legacy shared venv; each plugin now gets its own")
    try:
        shutil.rmtree(root)
    except OSError as e:
        # Never swallow this. A failed removal leaves pyvenv.cfg at the root,
        # per-plugin venvs get created underneath it, and the next run of
        # `ensurePluginPython` on the TypeScript side reads that marker and
        # deletes the whole tree — the mutual-destruction cycle this module was
        # rewritten to end, re-armed on a partial-failure path. The TypeScript
        # twin's `rmSync(..., {force: true})` masks ENOENT only; a permission
        # error still throws there, and it must throw here too.
        raise RuntimeError(
            f"could not remove the legacy shared venv at {root}: {e}. "
            "Leaving it in place would make the app delete every per-plugin "
            "venv on its next run. Remove it by hand, then retry."
        ) from e
    if (root / "pyvenv.cfg").exists():
        raise RuntimeError(
            f"the legacy shared venv marker survived removal at {root}; "
            "refusing to provision on top of it"
        )


def _running_from_checkout() -> bool:
    """True when the SDK is imported from a repo checkout rather than
    site-packages. ``pip install <SDK_ROOT>`` only works in the first case."""
    return (SDK_ROOT / "pyproject.toml").is_file()


def _install_sdk_into(py: Path, venv_dir: Path, log: LogCb) -> None:
    if _running_from_checkout():
        source, label = str(SDK_ROOT), f"the checkout at {SDK_ROOT}"
    else:
        dist, version = _sdk_distribution(), _sdk_version()
        source, label = f"{dist}=={version}", f"{dist}=={version} from PyPI"

    log(f"installing {label} into {venv_dir.name}")
    code, out = _run([str(py), "-m", "pip", "install", source], venv_dir)
    if code == 0:
        return

    detail = out.strip()
    hint = ""
    if not _running_from_checkout() and "No matching distribution" in detail:
        # The release window: the running version is not on the index yet.
        # Until 2026-09-08 this degraded to the ambient interpreter in silence.
        hint = (
            "\nThis version is not on the index yet. Two ways out: run the engine "
            "from a checkout of the repo, or publish this version to PyPI."
        )
    raise RuntimeError(
        f"failed to install SDK into {venv_dir.name}: {detail}{hint}"
    )


def _ensure_venv_for(plugin_id: str, data_dir: Path, log: LogCb) -> Path:
    root = _venv_root(data_dir)
    _remove_legacy_shared_venv(root, log)

    venv_dir = _venv_dir(root, plugin_id)
    py = _venv_python(venv_dir)
    version = _sdk_version()

    if py.exists() and _read_marker(venv_dir, "sdk.version") == version:
        return py

    root.mkdir(parents=True, exist_ok=True)
    if not py.exists():
        log(f"creating plugin venv for {plugin_id}")
        code, out = _run([sys.executable, "-m", "venv", str(venv_dir)], root)
        if code != 0:
            raise RuntimeError(
                f"failed to create plugin venv for {plugin_id}: {out.strip()}"
            )

    _install_sdk_into(py, venv_dir, log)
    _write_marker(venv_dir, "sdk.version", version)
    return py


def _ensure_plugin_requirements(
    plugin_id: str, plugin_dir: Path, py: Path, venv_dir: Path, log: LogCb
) -> None:
    req = plugin_dir / "requirements.txt"
    if not req.is_file():
        return
    h = _hash_file(req)
    marker = f"req-{plugin_id}.hash"
    if _read_marker(venv_dir, marker) == h:
        return
    log(f"installing requirements.txt for {plugin_id}")
    code, out = _run(
        [str(py), "-m", "pip", "install", "-r", str(req)], plugin_dir
    )
    if code != 0:
        raise RuntimeError(
            f"failed to install requirements for {plugin_id}: {out.strip()}"
        )
    _write_marker(venv_dir, marker, h)


def prepare_python_env(
    plugin_ids: list[str],
    plugins_dir: Path,
    data_dir: Path,
    *,
    auto_install: bool,
    log: LogCb,
) -> dict[str, str]:
    """Return the interpreter to run each plugin's entry with, keyed by id.

    With ``auto_install`` set, every plugin gets its OWN venv (SDK + that
    plugin's requirements) under a root that is never itself a venv — the layout
    plugin-python-env.server.ts writes. Otherwise fall back to the current
    interpreter and rely on PYTHONPATH, which is what the caller asked for by
    passing ``auto_install=False``.

    Provisioning failures raise. They used to return ``sys.executable``, which
    turned "could not provision" into "ran against whatever happened to be
    importable" with nothing but a log line to show for it.
    """
    if not auto_install:
        return {pid: sys.executable for pid in plugin_ids}

    root = _venv_root(data_dir)
    pythons: dict[str, str] = {}
    for pid in plugin_ids:
        py = _ensure_venv_for(pid, data_dir, log)
        _ensure_plugin_requirements(
            pid, plugins_dir / pid, py, _venv_dir(root, pid), log
        )
        pythons[pid] = str(py)
    return pythons


def scan_manifest(plugins_dir: Path, abi_path: Path) -> dict[str, Any]:
    return scan(plugins_dir, abi_path)
