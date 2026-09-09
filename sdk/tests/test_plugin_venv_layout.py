"""Layout of the per-plugin venv tree, and the two failure modes it used to hide.

The engine and `src/lib/plugins/plugin-python-env.server.ts` write the SAME
directory. Until 2026-09-08 they disagreed about what it means, so running one
destroyed the other's work. These tests pin the shape both sides now agree on.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

from tongflow.engine import plugins as P

SAFE_ID = "oneflow-api-ffmpeg"


def test_venv_dir_puts_each_plugin_in_its_own_subdirectory(tmp_path: Path) -> None:
    root = P._venv_root(tmp_path)
    a = P._venv_dir(root, "oneflow-api-ffmpeg")
    b = P._venv_dir(root, "oneflow-api-pyscenedetect")

    assert a != b
    assert a.parent == root and b.parent == root
    assert a.name == "oneflow-api-ffmpeg"
    assert root == tmp_path / ".tongflow" / "plugin-venv"


@pytest.mark.parametrize(
    "bad", ["../escape", "a/b", ".hidden", "", "oneflow-api-ffmpeg\n"]
)
def test_venv_dir_rejects_unsafe_plugin_ids(tmp_path: Path, bad: str) -> None:
    root = P._venv_root(tmp_path)

    with pytest.raises(ValueError) as e:
        P._venv_dir(root, bad)
    # Pinned message, not just the exception type: a bare `raises` cannot tell
    # "rejected the id" from "crashed for an unrelated reason".
    assert "unsafe plugin id" in str(e.value)

    # Positive control in the SAME test: the rule must still admit a real id.
    # A negative assertion alone proves nothing — a function that rejects
    # everything would pass it.
    assert P._venv_dir(root, SAFE_ID).parent == root


MANIFEST = Path(__file__).parent / "fixtures" / "venv-layout-manifest.json"
TWO_IDS = ["oneflow-api-ffmpeg", "oneflow-api-pyscenedetect"]


def _fake_run(recorder: list[list[str]]):
    """Stand in for `_run`, and materialise what the real command would create.

    Creating real venvs would make this suite take minutes and would test pip,
    not us. The stub still walks the production code path — only the subprocess
    boundary is replaced.
    """

    def run(cmd: list[str], cwd: Path) -> tuple[int, str]:
        recorder.append(list(cmd))
        if "venv" in cmd:
            target = Path(cmd[-1])
            (target / "bin").mkdir(parents=True, exist_ok=True)
            (target / "pyvenv.cfg").write_text("home = /usr/bin\n", encoding="utf-8")
            (target / "bin" / "python").write_text("", encoding="utf-8")
        return 0, ""

    return run


def _provision(tmp_path: Path, monkeypatch, ids=None) -> list[list[str]]:
    calls: list[list[str]] = []
    monkeypatch.setattr(P, "_run", _fake_run(calls))
    P.prepare_python_env(
        ids or TWO_IDS,
        tmp_path / "plugins",
        tmp_path / "data",
        auto_install=True,
        log=lambda _m: None,
    )
    return calls


def test_each_plugin_gets_its_own_venv_and_the_root_is_not_one(
    tmp_path: Path, monkeypatch
) -> None:
    _provision(tmp_path, monkeypatch)
    root = P._venv_root(tmp_path / "data")

    for pid in TWO_IDS:
        assert (root / pid / "pyvenv.cfg").is_file(), f"no venv for {pid}"
    # The whole bug in one assertion: a pyvenv.cfg HERE is the marker the
    # TypeScript side reads as "legacy shared venv, delete the lot".
    assert not (root / "pyvenv.cfg").exists(), (
        "root plugin-venv/ must not itself be a venv — a pyvenv.cfg here makes "
        "removeLegacySharedVenv() wipe every per-plugin venv"
    )


def test_legacy_shared_venv_at_the_root_is_removed_first(
    tmp_path: Path, monkeypatch
) -> None:
    root = P._venv_root(tmp_path / "data")
    # Reproduce the pre-2026-08-07 layout: the root IS a venv.
    (root / "bin").mkdir(parents=True)
    (root / "pyvenv.cfg").write_text("home = /usr/bin\n", encoding="utf-8")
    (root / "bin" / "python").write_text("", encoding="utf-8")

    _provision(tmp_path, monkeypatch)

    assert not (root / "pyvenv.cfg").exists(), "pyvenv.cfg still at the root"
    for pid in TWO_IDS:
        assert (root / pid / "pyvenv.cfg").is_file()


def test_engine_emits_the_layout_manifest_the_typescript_side_reads(
    tmp_path: Path, monkeypatch
) -> None:
    """The one artifact that binds both halves of AC-3.

    The TypeScript test builds its fixture from THIS file rather than typing a
    tree by hand. A hand-typed fixture matching the reader's expectation cannot
    catch the two sides drifting on the id -> directory mapping — which is the
    exact failure this package exists to close.
    """
    _provision(tmp_path, monkeypatch)
    root = P._venv_root(tmp_path / "data")

    # `relative_dir` comes from the PATH FUNCTION, `plugin_id` from the id we
    # asked for. Round 2 found both fields read back from the same observed
    # directory name, which made "the mapping is wrong" a state the record could
    # not express — and an eval cannot go red over something unrepresentable.
    observed = {
        "root_has_pyvenv_cfg": (root / "pyvenv.cfg").exists(),
        "entries": sorted(
            (
                {
                    "plugin_id": pid,
                    "relative_dir": str(P._venv_dir(root, pid).relative_to(root)),
                }
                for pid in TWO_IDS
            ),
            key=lambda e: e["plugin_id"],
        ),
    }
    # ...and the function must agree with what is actually on disk.
    for e in observed["entries"]:
        assert (root / e["relative_dir"]).is_dir(), (
            f"_venv_dir says {e['relative_dir']} but nothing is there"
        )
    committed = json.loads(MANIFEST.read_text(encoding="utf-8"))
    assert observed == committed, (
        "the venv layout the engine writes drifted from "
        f"{MANIFEST.name}; regenerate it and re-run the TypeScript half"
    )


def _sdk_install_cmd(calls: list[list[str]]) -> list[str]:
    return next(c for c in calls if "install" in c and "-r" not in c)


def test_installs_the_sdk_from_the_checkout_when_running_inside_one(
    tmp_path: Path, monkeypatch
) -> None:
    # SDK_ROOT of a checkout has a pyproject.toml; the real one does.
    assert (P.SDK_ROOT / "pyproject.toml").is_file()
    calls = _provision(tmp_path, monkeypatch, ids=[SAFE_ID])
    cmd = _sdk_install_cmd(calls)

    assert str(P.SDK_ROOT) in cmd
    assert not any("==" in part for part in cmd), (
        "running from a checkout must not pin a PyPI version: during the window "
        "between bumping and publishing, that pin does not resolve"
    )


def test_pins_the_pypi_version_when_not_running_from_a_checkout(
    tmp_path: Path, monkeypatch
) -> None:
    """Positive control for the branch above — the site-packages path must
    survive, which is what the comment at plugins.py:175 protected."""
    monkeypatch.setattr(P, "SDK_ROOT", tmp_path / "not-a-checkout")
    calls = _provision(tmp_path, monkeypatch, ids=[SAFE_ID])
    cmd = _sdk_install_cmd(calls)

    assert f"{P._sdk_distribution()}=={P._sdk_version()}" in cmd
    assert str(tmp_path / "not-a-checkout") not in cmd


def test_a_missing_published_version_names_both_ways_out(
    tmp_path: Path, monkeypatch
) -> None:
    monkeypatch.setattr(P, "SDK_ROOT", tmp_path / "not-a-checkout")

    def failing_run(cmd: list[str], cwd: Path) -> tuple[int, str]:
        if "venv" in cmd:
            target = Path(cmd[-1])
            (target / "bin").mkdir(parents=True, exist_ok=True)
            (target / "pyvenv.cfg").write_text("x\n", encoding="utf-8")
            (target / "bin" / "python").write_text("", encoding="utf-8")
            return 0, ""
        return 1, "ERROR: No matching distribution found for oneflow-sdk==9.9.9"

    monkeypatch.setattr(P, "_run", failing_run)

    with pytest.raises(RuntimeError) as e:
        P.prepare_python_env(
            [SAFE_ID],
            tmp_path / "plugins",
            tmp_path / "data",
            auto_install=True,
            log=lambda _m: None,
        )
    msg = str(e.value)
    assert "No matching distribution" in msg, "the root cause must survive"
    # Before this package the swallow made this window silent. Now it stops the
    # run, so the message has to say what to do about it.
    assert "checkout" in msg and "publish" in msg, (
        "a version missing from the index must name both ways out; an exit code "
        "alone leaves the reader stuck"
    )


def test_returns_one_interpreter_per_plugin_not_one_for_all(
    tmp_path: Path, monkeypatch
) -> None:
    monkeypatch.setattr(P, "_run", _fake_run([]))
    pythons = P.prepare_python_env(
        TWO_IDS,
        tmp_path / "plugins",
        tmp_path / "data",
        auto_install=True,
        log=lambda _m: None,
    )

    assert set(pythons) == set(TWO_IDS)
    a, b = pythons[TWO_IDS[0]], pythons[TWO_IDS[1]]
    assert a != b, (
        "both plugins share one interpreter — the whole point of the per-plugin "
        f"layout is lost at the call site ({a})"
    )
    # EQUALITY, not `pid in py`. The substring form was measured green against an
    # interpreter that belonged to no venv at all (`plugins_dir/<pid>/python`):
    # the id appears in the string, so the assertion held while the promise did
    # not. The promise is a RELATION — this interpreter is the one inside THIS
    # plugin's venv — so the assertion has to name that relation.
    root = P._venv_root(tmp_path / "data")
    for pid, py in pythons.items():
        want = str(P._venv_python(P._venv_dir(root, pid)))
        assert py == want, f"{pid}: got {py}, want the interpreter in its own venv {want}"


def test_auto_install_false_keeps_the_ambient_interpreter(
    tmp_path: Path, monkeypatch
) -> None:
    """The documented mode (sdk/README.md:30) the owner kept on 2026-09-08.

    It is also the positive control for the test above: if someone removes this
    branch while draining the silent fallback, this goes red.
    """
    monkeypatch.setattr(P, "_run", _fake_run([]))
    data = tmp_path / "data"
    pythons = P.prepare_python_env(
        TWO_IDS,
        tmp_path / "plugins",
        data,
        auto_install=False,
        log=lambda _m: None,
    )

    assert pythons == {pid: sys.executable for pid in TWO_IDS}
    assert not data.exists(), "auto_install=False must provision nothing"


def _two_plugin_workflow(tmp_path: Path) -> tuple[Path, dict]:
    """A workflow whose two executable nodes belong to two DIFFERENT plugins.

    One plugin cannot show the bug: with a single id, "the interpreter for this
    node" and "the one interpreter" are the same string.
    """
    plugins_dir = tmp_path / "plugins"
    entry = (
        "import json, sys\n"
        'payload = json.loads(sys.stdin.read())\n'
        'print(json.dumps({"success": True, "text": "x"}))\n'
    )
    for pid in TWO_IDS:
        d = plugins_dir / pid
        d.mkdir(parents=True)
        (d / "entry.py").write_text(entry, encoding="utf-8")

    dn = "dn-1"
    nodes = [
        {
            "id": f"exec-{i}",
            "type": "textNode",
            "feature": "gen-text",
            "pluginId": pid,
            "bindings": {
                "text": {
                    "kind": "handle",
                    "consumerShape": "scalar",
                    "sources": [{"fromNodeId": dn, "fromField": "texts"}],
                    "targetHandle": "in:text",
                }
            },
            "outputs": [
                {
                    "sourceField": "text",
                    "nodeType": "textNode",
                    "dataField": "texts",
                    "expandEach": False,
                }
            ],
            "dependencies": [dn],
            "level": 1,
        }
        for i, pid in enumerate(TWO_IDS)
    ]
    workflow = {
        "name": "two-plugins",
        "version": "1.0",
        "inputs": [],
        "outputs": [{"name": "out", "nodeId": "exec-0", "field": "text"}],
        "dataNodes": [
            {
                "id": dn,
                "type": "addTextNode",
                "dataType": "text",
                "isInput": True,
                "inputName": "in_text",
                "staticData": {"texts": ["hello"]},
                "level": 0,
            }
        ],
        "executableNodes": nodes,
        "executionLevels": [[dn], [n["id"] for n in nodes]],
        "dataNodeEdges": [],
    }
    return plugins_dir, workflow


def test_runner_calls_each_plugin_with_its_own_interpreter(
    tmp_path: Path, monkeypatch
) -> None:
    """The SECOND half of AC-9, which the test above cannot see.

    A refactor can return a correct dict and still pass one interpreter to every
    node — `python=next(iter(pythons.values()))` — and only a real run catches it.
    """
    from tongflow.engine import runner as R

    plugins_dir, workflow = _two_plugin_workflow(tmp_path)
    monkeypatch.setattr(P, "_run", _fake_run([]))
    monkeypatch.setattr(
        R,
        "scan_manifest",
        lambda _pd, _abi: {
            "plugins": {
                pid: {
                    "localSubdir": pid,
                    "entryFile": "entry.py",
                    "methodsByNodeSlot": {"gen-text": {"methodName": "gen_text"}},
                    "needsDeploy": False,
                }
                for pid in TWO_IDS
            }
        },
    )

    seen: list[tuple[str, str]] = []

    def spy(**kw):
        seen.append((kw["plugin_id"], kw["python"]))
        return {"success": True, "text": "x"}

    monkeypatch.setattr(R, "invoke_plugin", spy)

    R.run_workflow(
        workflow,
        plugins_dir=plugins_dir,
        data_dir=tmp_path / "data",
        abi_path=None,
        auto_install=True,
    )

    assert len(seen) == 2, f"expected both nodes to run, saw {seen}"
    assert seen[0][1] != seen[1][1], (
        "both nodes ran the same interpreter — the per-plugin layout is built "
        f"but not used at the call site ({seen[0][1]})"
    )
    # Same reason as above: compare against the mapping this test claims runner
    # consults, not against a substring of it.
    root = P._venv_root(tmp_path / "data")
    for pid, py in seen:
        want = str(P._venv_python(P._venv_dir(root, pid)))
        assert py == want, f"{pid}: got {py}, want the interpreter in its own venv {want}"


def test_a_failed_legacy_removal_raises_instead_of_provisioning_on_top(
    tmp_path: Path, monkeypatch
) -> None:
    """The high finding of round 1, pinned.

    `shutil.rmtree(root, ignore_errors=True)` returned as if it had succeeded.
    The marker stayed at the root, per-plugin venvs were created underneath it,
    and the next TypeScript run deleted the whole tree — the mutual-destruction
    cycle, re-armed on a partial-failure path with no log line and no exception.
    """
    root = P._venv_root(tmp_path / "data")
    (root / "bin").mkdir(parents=True)
    (root / "pyvenv.cfg").write_text("home = /usr/bin\n", encoding="utf-8")

    def refusing_rmtree(path, *a, ignore_errors=False, **kw):
        # Honour the flag exactly as shutil.rmtree does. A fake that raises
        # regardless cannot tell "production swallowed the failure" from
        # "production never called rmtree" — the red direction would then be
        # red for the wrong reason.
        if ignore_errors:
            return
        raise PermissionError(13, "Permission denied", str(path))

    monkeypatch.setattr(P.shutil, "rmtree", refusing_rmtree)
    monkeypatch.setattr(P, "_run", _fake_run([]))

    with pytest.raises(RuntimeError) as e:
        P.prepare_python_env(
            TWO_IDS,
            tmp_path / "plugins",
            tmp_path / "data",
            auto_install=True,
            log=lambda _m: None,
        )
    msg = str(e.value)
    assert "legacy shared venv" in msg and "Permission denied" in msg
    # And it must not have provisioned underneath the surviving marker.
    for pid in TWO_IDS:
        assert not (root / pid).exists(), (
            f"{pid} was provisioned inside a root that still holds pyvenv.cfg — "
            "the app will delete it on its next run"
        )
