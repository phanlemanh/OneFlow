"""Distribution identity (plan item 0.1, option C).

The SDK publishes as ``oneflow-sdk`` but still imports as ``tongflow``. Python
keeps those two names independent, and this fork exploits that: renaming the
distribution unblocks publishing, while leaving the import package alone keeps
69 plugin files and 13 SDK files working untouched.

Every assertion below guards one half of that split. Several are deliberately
negative — the ways this change goes wrong are omissions, not mistakes.
"""

from __future__ import annotations

import json
from pathlib import Path

# tomllib is stdlib only from 3.11, and pyproject declares requires-python
# ">=3.10" — so CI runs 3.10 and needs the backport. Keep both paths until the
# floor moves.
try:
    import tomllib
except ModuleNotFoundError:  # Python 3.10
    import tomli as tomllib

import tongflow

REPO = Path(__file__).resolve().parents[2]
PYPROJECT = REPO / "sdk" / "pyproject.toml"
PUBLISH_SCRIPT = REPO / "scripts" / "publish-tongflow-pypi.sh"

DISTRIBUTION = "oneflow-sdk"
IMPORT_PACKAGE = "tongflow"
NPM_SCRIPT = "sdk:publish"


def _pyproject() -> dict:
    return tomllib.loads(PYPROJECT.read_text(encoding="utf-8"))


# --- Distribution identity -------------------------------------------------


def test_distribution_name_is_oneflow_sdk():
    """AC-1."""
    assert _pyproject()["project"]["name"] == DISTRIBUTION


def test_import_package_is_untouched():
    """AC-2 — suppression half of option C.

    Renaming this include pattern would build a wheel with no modules in it,
    and setuptools would not complain.
    """
    find = _pyproject()["tool"]["setuptools"]["packages"]["find"]
    assert f"{IMPORT_PACKAGE}*" in find["include"]
    assert (REPO / "sdk" / IMPORT_PACKAGE).is_dir()


def test_import_still_works_and_exposes_the_public_api():
    """AC-3 — the name 82 Python files depend on."""
    assert tongflow.__name__ == IMPORT_PACKAGE
    for symbol in ("run_workflow", "progress", "deploy"):
        assert hasattr(tongflow, symbol), f"missing public symbol {symbol}"


def test_version_is_declared_once_in_effect():
    """AC-4 — CLAUDE.md calls this drift a recurring bug."""
    assert _pyproject()["project"]["version"] == tongflow.__version__


def test_project_urls_do_not_point_at_upstream():
    """AC-5 — suppression half. These ship to PyPI as package metadata."""
    for name, url in _pyproject()["project"]["urls"].items():
        assert "tong-io" not in url, f"{name} still points at upstream: {url}"
        assert "tongflow.com" not in url, f"{name} still points at upstream: {url}"


# --- Publish script --------------------------------------------------------


def test_publish_script_uses_normalised_artifact_names():
    """AC-6.

    setuptools normalises the dash: ``oneflow-sdk`` builds
    ``oneflow_sdk-<v>-py3-none-any.whl`` and ``oneflow_sdk.egg-info``. Getting
    this wrong makes the script print a path that does not exist, silently.
    """
    script = PUBLISH_SCRIPT.read_text(encoding="utf-8")
    normalised = DISTRIBUTION.replace("-", "_")
    assert f"{normalised}.egg-info" in script
    assert f"dist/{normalised}-${{VER}}-py3-none-any.whl" in script


def test_publish_script_tells_operators_the_right_package():
    """AC-7, both halves."""
    script = PUBLISH_SCRIPT.read_text(encoding="utf-8")
    assert f"pip install {DISTRIBUTION}==${{VER}}" in script
    # Suppression half: sending an operator to upstream's package with this
    # fork's version number would install something entirely different.
    assert f"pip install {IMPORT_PACKAGE}==" not in script


# --- Docs and scripts ------------------------------------------------------


def test_author_facing_docs_name_the_distribution():
    """AC-8."""
    for rel in ("CLAUDE.md", "docs/plugins.md", "sdk/README.md"):
        text = (REPO / rel).read_text(encoding="utf-8")
        assert DISTRIBUTION in text, f"{rel} never names {DISTRIBUTION}"


def test_npm_publish_script_renamed_and_no_dangling_references():
    """AC-9, both halves."""
    pkg = json.loads((REPO / "package.json").read_text(encoding="utf-8"))
    assert NPM_SCRIPT in pkg["scripts"]
    assert "tongflow:publish" not in pkg["scripts"]
    for path in _tracked_text_files():
        assert "tongflow:publish" not in path.read_text(
            encoding="utf-8", errors="ignore"
        ), f"{path.relative_to(REPO)} still references the old npm script"


def test_no_surviving_distribution_name_usage():
    """AC-10 — suppression half, repo-wide sweep."""
    stale = (
        f"pip install {IMPORT_PACKAGE}",
        f'pip_install("{IMPORT_PACKAGE}==',
        f"{IMPORT_PACKAGE}.egg-info",
        f"dist/{IMPORT_PACKAGE}-",
    )
    offenders = []
    for path in _tracked_text_files():
        text = path.read_text(encoding="utf-8", errors="ignore")
        for needle in stale:
            if needle in text:
                offenders.append(f"{path.relative_to(REPO)}: {needle}")
    assert not offenders, "stale distribution references: " + "; ".join(offenders)


# --- Functional dependency (AC-13) -----------------------------------------


def test_engine_installs_the_distribution_from_a_single_source():
    """AC-13, both halves.

    The engine provisions the plugin venv by pip-installing the SDK. Before the
    rename it hard-coded ``tongflow==``, which after the rename would ask pip
    for a distribution that does not exist.
    """
    assert tongflow.__distribution__ == _pyproject()["project"]["name"]
    plugins_src = (
        REPO / "sdk" / IMPORT_PACKAGE / "engine" / "plugins.py"
    ).read_text(encoding="utf-8")
    assert f'"{IMPORT_PACKAGE}=={{version}}"' not in plugins_src
    assert f"{IMPORT_PACKAGE}=={{version}}" not in plugins_src


# --- helpers ---------------------------------------------------------------

# Directories excluded from the repo sweep, each for a stated reason:
#   plugins/          gitignored, populated at runtime, lives in other repos
#   _acceptance/      the contract and evals quote these patterns as the very
#                     thing being searched for
#   .claude/          gitignored (.gitignore:58) agent state, including
#                     worktrees holding older checkouts of this same repo
#   .superpowers/     untracked agent scratch notes, not source
#   node_modules, .next, .git, data, dist, build, .venv — not source
_SKIP_DIRS = {
    "plugins",
    "_acceptance",
    ".claude",
    ".superpowers",
    "node_modules",
    ".next",
    ".git",
    "data",
    "dist",
    "build",
    ".venv",
    "__pycache__",
    ".turbo",
}
# `.example` is here because `.env.example` is tracked and carried a stale
# reference that a suffix list without it silently missed.
_TEXT_SUFFIXES = {
    ".md",
    ".sh",
    ".json",
    ".py",
    ".ts",
    ".tsx",
    ".yml",
    ".toml",
    ".example",
}


def _tracked_text_files():
    """Source files worth sweeping — excluding this file, which quotes the
    stale patterns it is looking for."""
    self_path = Path(__file__).resolve()
    for path in REPO.rglob("*"):
        if not path.is_file() or path.suffix not in _TEXT_SUFFIXES:
            continue
        if path.resolve() == self_path:
            continue
        if _SKIP_DIRS & set(path.relative_to(REPO).parts):
            continue
        yield path
