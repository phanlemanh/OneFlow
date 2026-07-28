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
    """A corrupt checkout is a failure, not a valid config.

    Collapsing this into the None case is how a real breakage disguises itself
    as the ordinary hand-copied plugin and reaches L1 as a silently missing
    cache key.
    """
    d, _ = _git_repo(tmp_path)
    (d / ".git" / "HEAD").write_text("garbage\n", encoding="utf-8")

    with pytest.raises(RuntimeError, match="oneflow-fixture-plugin"):
        read_plugin_rev(d)


def test_a_rev_that_is_not_a_forty_character_sha_is_a_named_error(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """An out-of-format rev must not reach the TypeScript consumer.

    `PluginsRegistrySchema` declares `pluginRev` as exactly 40 characters and
    the scanner's output is parsed un-guarded, so one bad value does not
    degrade a single entry — it throws and the app ends up with no plugins at
    all. Failing here names the offending plugin and becomes one scan error.
    """
    d, _ = _git_repo(tmp_path)
    fake_bin = tmp_path / "fake-bin"
    fake_bin.mkdir()
    git = fake_bin / "git"
    # An abbreviated sha is the realistic trigger: `core.abbrev` in a user's
    # global gitconfig is enough, and it exits 0 like a healthy read.
    git.write_text("#!/bin/sh\necho 1a2b3c4\n", encoding="utf-8")
    git.chmod(0o755)
    monkeypatch.setenv("PATH", str(fake_bin))

    with pytest.raises(RuntimeError, match="oneflow-fixture-plugin"):
        read_plugin_rev(d)


def test_checkout_on_a_host_without_git_yields_none(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """No git binary is an ordinary state, not a failure.

    The in-app installer clones with isomorphic-git specifically so the host
    does not need git, so a real .git directory on a machine without git is
    expected — a Windows desktop build being the obvious case. `subprocess.run`
    raises FileNotFoundError here rather than returning non-zero, so a guard
    that only checks the return code lets the exception escape and abort the
    scan of every plugin, not just this one.
    """
    d, _ = _git_repo(tmp_path)
    monkeypatch.setenv("PATH", str(tmp_path / "no-binaries-here"))

    assert read_plugin_rev(d) is None


def test_one_unreadable_checkout_does_not_take_down_the_whole_scan(
    tmp_path: Path,
) -> None:
    """A broken plugin costs itself, never the rest of the registry.

    Every other per-plugin failure in `scan()` is reported through `errors` and
    skipped. An unreadable rev raising out of the loop would be strictly worse
    than the silence it guards against: no registry at all, rather than one
    plugin flagged.
    """
    from tongflow.scan import scan

    plugins_root = tmp_path / "plugins"
    plugins_root.mkdir()

    handlers = (
        "from tongflow.slots import node_slot, NodeSlots\n"
        "from tongflow.models.gen_text import GenTextInput, GenTextOutput\n"
        "\n"
        "@node_slot(NodeSlots.GEN_TEXT)\n"
        "def gen_text(input: GenTextInput) -> GenTextOutput:\n"
        "    ...\n"
    )

    healthy, healthy_sha = _git_repo(plugins_root, "oneflow-api-healthy")
    (healthy / "entry.py").write_text(handlers, encoding="utf-8")

    broken, _ = _git_repo(plugins_root, "oneflow-api-broken")
    (broken / "entry.py").write_text(handlers, encoding="utf-8")
    (broken / ".git" / "HEAD").write_text("garbage\n", encoding="utf-8")

    abi_path = Path(__file__).resolve().parents[1] / "tongflow" / "_data" / "tongflow.abi.json"
    payload = scan(plugins_root, abi_path)

    plugins = payload["plugins"]
    assert "oneflow-api-healthy" in plugins
    assert "oneflow-api-broken" in plugins
    assert plugins["oneflow-api-healthy"]["pluginRev"] == healthy_sha
    assert "pluginRev" not in plugins["oneflow-api-broken"]
    assert any(
        e["pluginId"] == "oneflow-api-broken" and "rev" in e["message"]
        for e in payload["errors"]
    )
