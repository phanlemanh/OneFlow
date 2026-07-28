"""pluginRev: the scanner records which commit of a plugin is installed.

L0 only records it. L1 folds it into the cache key, and that is what makes the
distinction below load-bearing: a plugin whose code changed while its key did
not would serve the previous version's output forever.
"""

from __future__ import annotations

import subprocess
from pathlib import Path

import pytest

from tongflow.scan import read_plugin_rev


def _git_repo(tmp_path: Path, name: str = "oneflow-fixture-plugin") -> tuple[Path, str]:
    d = tmp_path / name
    d.mkdir()
    (d / "entry.py").write_text("# fixture\n", encoding="utf-8")
    for args in (
        ["init", "-q"],
        ["-c", "user.email=t@t", "-c", "user.name=t", "add", "."],
        ["-c", "user.email=t@t", "-c", "user.name=t", "commit", "-qm", "init"],
    ):
        subprocess.run(["git", *args], cwd=d, check=True, capture_output=True)
    sha = subprocess.run(
        ["git", "rev-parse", "HEAD"], cwd=d, check=True, capture_output=True, text=True
    ).stdout.strip()
    return d, sha


def test_git_checkout_yields_the_full_forty_character_sha(tmp_path: Path) -> None:
    d, sha = _git_repo(tmp_path)

    rev = read_plugin_rev(d)

    # Equality with the real sha, not merely truthiness: a function returning
    # "HEAD", a short sha, or a branch name would satisfy a truthiness check
    # and quietly poison L1's cache key.
    assert rev == sha
    assert rev is not None and len(rev) == 40


def test_non_git_directory_yields_none(tmp_path: Path) -> None:
    d = tmp_path / "hand-copied"
    d.mkdir()
    (d / "entry.py").write_text("# copied by hand\n", encoding="utf-8")

    assert read_plugin_rev(d) is None


def test_git_directory_with_unreadable_rev_raises_a_named_error(tmp_path: Path) -> None:
    """A checkout whose rev cannot be read is a failure, not a valid config.

    Collapsing this into the None case is how a real breakage — no git binary
    on a desktop build, a corrupt checkout — disguises itself as the ordinary
    hand-copied plugin and reaches L1 as a silently missing cache key.
    """
    d, _ = _git_repo(tmp_path)
    (d / ".git" / "HEAD").write_text("garbage\n", encoding="utf-8")

    with pytest.raises(RuntimeError, match="oneflow-fixture-plugin"):
        read_plugin_rev(d)
