from __future__ import annotations

import argparse
import ast
import json
import subprocess
from pathlib import Path
from typing import Optional

from .abi import load_abi
from ._subproc import utf8_env
from ._ast_utils import (
    DEFAULT_SLOTS_CONST,
    REJECTION_HINT,
    SLOT_MODELS_CONST,
    extract_default_slots,
    extract_node_slot_decorators,
    extract_node_slot_defaults,
    extract_slot_models,
    slot_rejection_reason,
)
from .parse_deploy import _slot_to_ident, parse_deploy_py

SCANNER_VERSION = 3

SKIP_DIR_NAMES = frozenset(
    {
        "tongflow",
        ".git",
        "__pycache__",
        ".ruff_cache",
        "node_modules",
    }
)


def _iter_plugin_dirs(plugins_root: Path) -> list[Path]:
    if not plugins_root.is_dir():
        return []
    out: list[Path] = []
    for child in sorted(plugins_root.iterdir()):
        if not child.is_dir():
            continue
        if child.name.startswith(".") and child.name != ".":  # noqa: SIM102
            continue
        if child.name in SKIP_DIR_NAMES:
            continue
        out.append(child)
    return out


# Directory-name conventions. `oneflow-` is the current one. `tongflow-` is
# accepted as legacy and will be for a while: the official plugins are upstream
# repos under an org this fork does not control, and a plugin's id is its git
# repo basename — so rejecting `tongflow-` would reject every official plugin
# the product ships with. Narrowing follows those repos as they get forked into
# our own namespace, one at a time.
#
# This gate runs BEFORE a directory's contents are read, so it decides whether a
# plugin exists at all. Widening the installer's regex without widening this
# lets a plugin install and then never register — which is worse than refusing
# to install it.
_PLUGIN_PREFIXES = ("oneflow-", "tongflow-")


def _strip_plugin_prefix(plugin_id: str) -> str | None:
    """The part after a recognised prefix, or None if there is no prefix."""
    for prefix in _PLUGIN_PREFIXES:
        if plugin_id.startswith(prefix):
            return plugin_id[len(prefix) :]
    return None


def _detect_runner(plugin_dir: Path) -> tuple[str | None, str | None]:
    deploy = plugin_dir / "deploy.py"
    entry = plugin_dir / "entry.py"
    has_deploy = deploy.is_file()
    has_entry = entry.is_file()
    plugin_id = plugin_dir.name

    # pluginId is case-sensitive and used as a key everywhere (Modal appName,
    # localSubdir, node_plugin_map). A repo/dir name with uppercase letters would
    # silently miss the lowercase prefix checks below and be reported as an
    # "unknown prefix"; surface a clear rename hint instead.
    lowered = plugin_id.lower()
    lowered_rest = _strip_plugin_prefix(lowered)
    if plugin_id != lowered and lowered_rest is not None and (
        lowered_rest.startswith("modal-") or lowered_rest.startswith("api-")
    ):
        return None, (
            f"{plugin_dir}:1: pluginId must be all lowercase; "
            f"fix: rename the plugin repo/dir to {lowered}"
        )

    rest = _strip_plugin_prefix(plugin_id)
    if rest is None:
        return None, (
            f"{plugin_dir}:1: unknown pluginId prefix; "
            "fix: use oneflow-modal-<name> or oneflow-api-<name> "
            "(legacy tongflow-modal-<name> / tongflow-api-<name> still accepted)"
        )

    for runner in ("modal", "api"):
        if rest.startswith(f"{runner}-gpu-") or rest.startswith(f"{runner}-cpu-"):
            return None, (
                f"{plugin_dir}:1: pluginId must not encode gpu/cpu; "
                f"fix: use oneflow-{runner}-<semantic-name>"
            )

    prefix_runner: str | None = None
    if rest.startswith("modal-"):
        prefix_runner = "modal"
    elif rest.startswith("api-"):
        prefix_runner = "api"
    else:
        return None, (
            f"{plugin_dir}:1: unknown pluginId prefix; "
            "fix: use oneflow-modal-<name> or oneflow-api-<name> "
            "(legacy tongflow-modal-<name> / tongflow-api-<name> still accepted)"
        )

    if not has_deploy and not has_entry:
        return None, (
            f"{plugin_dir}:1: missing deploy.py or entry.py; "
            "fix: add an entry.py, or a deploy.py for a Modal-backed plugin"
        )

    # Every plugin runs the same way: the platform spawns the plugin's local
    # entry.py and exchanges JSON. A simple plugin's entry.py does the work; a
    # deploy-first plugin's entry.py is a thin bridge that deploys (once) and
    # invokes the remote backend, discovering slot->method from its own deploy.py.
    # "api" is kept as the registry's single generic-runner tag.
    return "api", None


def _scan_error(path: Path, reason: str, hint: str, line: int = 1) -> str:
    return f"{path}:{line}: {reason}; fix: {hint}"


def _scan_methods_by_slot_in_file(
    path: Path,
) -> tuple[dict[str, str], set[str], list[str], list[str]]:
    """Returns (methods_by_slot_ident, default_slot_idents, problems, rejections)."""
    try:
        src = path.read_text(encoding="utf-8")
        tree = ast.parse(src, filename=str(path))
    except (OSError, SyntaxError):
        return {}, set(), [], []

    out: dict[str, str] = {}
    defaults: set[str] = set()
    problems: list[str] = []
    rejections: list[str] = []
    # Methods on a class are the deploy parser's business; reporting them here
    # too would make every healthy deploy-first plugin noisy (AC-11).
    module_level = {id(node) for node in tree.body}

    for node in ast.walk(tree):
        if not isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            continue
        if node.name.startswith("_"):
            continue
        # Strict typing: require 1st arg annotation + return annotation (SDK models).
        reason = slot_rejection_reason(node, tree, input_index=0)
        if reason is not None:
            if id(node) in module_level and extract_node_slot_decorators(node):
                rejections.append(
                    _scan_error(path, reason, REJECTION_HINT, line=node.lineno)
                )
            continue
        slots = extract_node_slot_decorators(node)
        for s in slots:
            out[s] = node.name
        claimed, claim_problems = extract_node_slot_defaults(node)
        defaults.update(claimed)
        for lineno, claim_reason in claim_problems:
            problems.append(
                _scan_error(path, claim_reason, "pass a literal True", line=lineno)
            )
    return out, defaults, problems, rejections


def _scan_methods_by_slot_in_dir(
    plugin_dir: Path,
) -> tuple[dict[str, str], set[str], list[str], list[str]]:
    out: dict[str, str] = {}
    defaults: set[str] = set()
    problems: list[str] = []
    rejections: list[str] = []
    for p in _iter_plugin_py_files(plugin_dir):
        methods, file_defaults, file_problems, file_rejections = (
            _scan_methods_by_slot_in_file(p)
        )
        for slot_ident, method in methods.items():
            out.setdefault(slot_ident, method)
        defaults.update(file_defaults)
        problems.extend(file_problems)
        rejections.extend(file_rejections)
    return out, defaults, problems, rejections


def _iter_plugin_py_files(plugin_dir: Path) -> list[Path]:
    return [
        p
        for p in plugin_dir.rglob("*.py")
        if not any(part in {"__pycache__", ".venv", "node_modules"} for part in p.parts)
    ]


def _scan_slot_models_in_dir(
    plugin_dir: Path,
) -> tuple[dict[str, list[str]], list[str]]:
    """Collect TONGFLOW_SLOT_MODELS declarations across the plugin's files."""

    models_by_slot: dict[str, list[str]] = {}
    problems: list[str] = []
    for p in _iter_plugin_py_files(plugin_dir):
        try:
            tree = ast.parse(p.read_text(encoding="utf-8"), filename=str(p))
        except (OSError, SyntaxError):
            continue
        found, file_problems = extract_slot_models(tree)
        for lineno, reason in file_problems:
            problems.append(
                _scan_error(
                    p,
                    reason,
                    "declare a pure literal dict[str, list[str]]",
                    line=lineno,
                )
            )
        for slot, models in found.items():
            if slot in models_by_slot:
                problems.append(
                    _scan_error(
                        p,
                        f"{SLOT_MODELS_CONST} declares slot {slot!r} more than once across files",
                        "keep one declaration per slot",
                    )
                )
                continue
            models_by_slot[slot] = models
    return models_by_slot, problems


def _scan_default_slots_in_dir(plugin_dir: Path) -> tuple[list[str], list[str]]:
    """Collect TONGFLOW_DEFAULT_SLOTS declarations across the plugin's files."""

    slots: list[str] = []
    problems: list[str] = []
    for p in _iter_plugin_py_files(plugin_dir):
        try:
            tree = ast.parse(p.read_text(encoding="utf-8"), filename=str(p))
        except (OSError, SyntaxError):
            continue
        found, file_problems = extract_default_slots(tree)
        for lineno, reason in file_problems:
            problems.append(
                _scan_error(
                    p,
                    reason,
                    "declare a pure list literal of slot strings",
                    line=lineno,
                )
            )
        for slot in found:
            if slot in slots:
                problems.append(
                    _scan_error(
                        p,
                        f"{DEFAULT_SLOTS_CONST} declares slot {slot!r} more than once "
                        "across files",
                        "keep one declaration per slot",
                    )
                )
                continue
            slots.append(slot)
    return slots, problems


def read_plugin_rev(plugin_dir: Path) -> Optional[str]:
    """The installed commit of a plugin, or None when there is no rev to read.

    Three states, and conflating any two of them costs something different:

    * **Not a checkout** (hand-copied, as dev environments do) — no rev, no
      complaint.
    * **A checkout on a host with no git binary.** The in-app installer clones
      with isomorphic-git precisely so the host does not need one, so a real
      ``.git`` on a machine without git is an ordinary state, not a defect —
      a Windows desktop build being the obvious case. This must behave like the
      first case, and note that ``subprocess.run`` raises ``FileNotFoundError``
      here rather than returning non-zero: catching only the return code would
      let the exception escape and abort the scan of *every* plugin.
    * **A checkout whose rev genuinely cannot be read** (corrupt HEAD, say).
      That is a real failure and is raised, because L1 folds this value into the
      cache key: a silently missing rev means a plugin can change while its key
      does not. The caller turns it into a per-plugin scan error rather than
      letting one bad checkout take the whole registry down.
    """
    if not (plugin_dir / ".git").exists():
        return None
    try:
        r = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            cwd=plugin_dir,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            env=utf8_env(),
        )
    except OSError:
        # No git binary (or it cannot be executed). Same outcome as a
        # non-checkout: no rev is recorded, and the scan carries on.
        return None
    if r.returncode != 0:
        raise RuntimeError(
            f"cannot read plugin rev for {plugin_dir.name}: "
            f"{r.stderr.strip() or r.stdout.strip()}"
        )
    rev = r.stdout.strip()
    # The consumer declares `pluginRev: z.string().length(40)` and parses the
    # manifest un-guarded, so an out-of-format value does not degrade one entry
    # — it throws and leaves the app with no plugins at all. Fail here instead,
    # where the error names the plugin and the caller turns it into one scan
    # error. (A short sha, an abbreviated `core.abbrev`, or a ref name rather
    # than a sha would all get through otherwise.)
    if len(rev) != 40 or any(c not in "0123456789abcdef" for c in rev):
        raise RuntimeError(
            f"cannot read plugin rev for {plugin_dir.name}: "
            f"git returned {rev!r}, not a 40-character sha"
        )
    return rev


def scan(plugins_root: Path, abi_path: Path) -> dict[str, object]:
    abi = load_abi(abi_path)
    valid = abi.node_slots

    node_plugin_map: dict[str, list[str]] = {}
    plugins: dict[str, dict[str, object]] = {}
    errors: list[dict[str, str]] = []
    # slot -> plugin ids that declared `@node_slot(..., default=True)` for it,
    # in directory order. Resolved into the head of nodePluginMap below.
    default_claims: dict[str, list[str]] = {}

    for pdir in _iter_plugin_dirs(plugins_root):
        plugin_id = pdir.name
        _runner, runner_error = _detect_runner(pdir)
        if runner_error:
            errors.append({"pluginId": plugin_id, "message": runner_error})
            continue

        # Every plugin is spawned the same way: the platform runs the plugin's
        # local entry.py and exchanges JSON. Handlers are discovered by scanning
        # every .py file for module-level @node_slot + SDK annotations.
        methods_by_ident, default_idents, default_problems, rejections = (
            _scan_methods_by_slot_in_dir(pdir)
        )
        for message in default_problems:
            errors.append({"pluginId": plugin_id, "message": message})
        for message in rejections:
            errors.append({"pluginId": plugin_id, "message": message})
        # A deploy-first plugin keeps its handlers as methods on a @deploy-marked
        # class in deploy.py — first arg `self`, so the module-level dir scan
        # skips them. Fall back to the backend-neutral deploy parser (it matches
        # tongflow's own @deploy marker, not any backend's class decorator). Such
        # a plugin must be deployed before it can run, recorded as needsDeploy so
        # the platform routes it through its entry.py deploy-then-invoke bridge.
        needs_deploy = False
        deploy_py = pdir / "deploy.py"
        if not methods_by_ident and deploy_py.is_file():
            dscan, _derr = parse_deploy_py(deploy_py)
            if dscan:
                for lineno, reason in dscan.slot_problems:
                    message = _scan_error(
                        deploy_py, reason, REJECTION_HINT, line=lineno
                    )
                    rejections.append(message)
                    errors.append({"pluginId": plugin_id, "message": message})
                if dscan.methods_by_slot:
                    methods_by_ident = dict(dscan.methods_by_slot)
                    default_idents = set(dscan.default_slots)
                    for lineno, reason in dscan.default_problems:
                        errors.append(
                            {
                                "pluginId": plugin_id,
                                "message": _scan_error(
                                    deploy_py,
                                    reason,
                                    "pass a literal True",
                                    line=lineno,
                                ),
                            }
                        )
                    needs_deploy = True
        if not methods_by_ident:
            # A specific reason at the defining line says strictly more than
            # "nothing found in entry.py" — the generic line yields to it.
            if not rejections:
                errors.append(
                    {
                        "pluginId": plugin_id,
                        "message": _scan_error(
                            pdir / "entry.py",
                            "no @node_slot(NodeSlots.XXX) methods found",
                            "add @node_slot and Input/Output annotations to entry.py",
                        ),
                    }
                )
            continue

        ident_to_slot = {_slot_to_ident(s): s for s in valid}
        llm_methods: dict[str, dict[str, object]] = {}
        for ident, method_name in methods_by_ident.items():
            slot = ident_to_slot.get(ident)
            if not slot:
                errors.append(
                    {
                        "pluginId": plugin_id,
                        "message": _scan_error(
                            pdir / "entry.py",
                            f"unknown NodeSlots.{ident} (not in tongflow.abi.json)",
                            "use a NodeSlots constant generated from the ABI",
                        ),
                    }
                )
                continue
            llm_methods[slot] = {"methodName": method_name}
            node_plugin_map.setdefault(slot, [])
            if plugin_id not in node_plugin_map[slot]:
                node_plugin_map[slot].append(plugin_id)
            if ident in default_idents:
                default_claims.setdefault(slot, []).append(plugin_id)

        if not llm_methods:
            continue

        # Optional per-slot model lists (router-style plugins). Purely additive:
        # plugins that declare no TONGFLOW_SLOT_MODELS are untouched.
        models_by_slot, model_problems = _scan_slot_models_in_dir(pdir)
        for message in model_problems:
            errors.append({"pluginId": plugin_id, "message": message})
        for slot, models in models_by_slot.items():
            if slot not in llm_methods:
                errors.append(
                    {
                        "pluginId": plugin_id,
                        "message": _scan_error(
                            pdir / "entry.py",
                            f"{SLOT_MODELS_CONST} declares models for slot {slot!r} "
                            "but the plugin has no @node_slot handler for it",
                            "remove the entry or add the matching handler",
                        ),
                    }
                )
                continue
            llm_methods[slot]["models"] = models

        # Optional default-implementation claims. The module constant is the
        # portable form (never executed, so any SDK version imports it);
        # `@node_slot(..., default=True)` is equivalent but needs tongflow>=0.2.15
        # in whatever runtime imports the plugin.
        claimed_slots, claim_problems = _scan_default_slots_in_dir(pdir)
        for message in claim_problems:
            errors.append({"pluginId": plugin_id, "message": message})
        for slot in claimed_slots:
            if slot not in llm_methods:
                errors.append(
                    {
                        "pluginId": plugin_id,
                        "message": _scan_error(
                            pdir / "entry.py",
                            f"{DEFAULT_SLOTS_CONST} claims slot {slot!r} but the "
                            "plugin has no @node_slot handler for it",
                            "remove the entry or add the matching handler",
                        ),
                    }
                )
                continue
            if plugin_id not in default_claims.setdefault(slot, []):
                default_claims[slot].append(plugin_id)

        # Every other per-plugin failure in this loop is reported through
        # `errors` and skipped rather than raised, because one broken plugin
        # must not cost the registry every other one. An unreadable rev follows
        # the same rule: the plugin still registers, without a rev, and the
        # reason is surfaced where the consumer already looks.
        try:
            rev = read_plugin_rev(pdir)
        except RuntimeError as e:
            errors.append({"pluginId": plugin_id, "message": str(e)})
            rev = None

        plugins[plugin_id] = {
            "localSubdir": plugin_id,
            "methodsByNodeSlot": llm_methods,
            "entryFile": "entry.py",
            "needsDeploy": needs_deploy,
            # Optional on purpose: a hand-copied plugin has no rev, and a
            # registry written before this field existed must still parse.
            # L1 folds it into the cache key; L0 only records it.
            **({"pluginRev": rev} if rev else {}),
        }

    # de-dupe lists, preserve order
    for k in list(node_plugin_map.keys()):
        seen: set[str] = set()
        nxt: list[str] = []
        for x in node_plugin_map[k]:
            if x in seen:
                continue
            seen.add(x)
            nxt.append(x)
        node_plugin_map[k] = nxt

    # The head of nodePluginMap[slot] is the slot's default implementation: what
    # a freshly added node preselects and what the picker lists first. Without a
    # `default=True` claim it stays the first plugin in directory order.
    for slot, claimants in default_claims.items():
        winner = claimants[0]
        if len(claimants) > 1:
            errors.append(
                {
                    "pluginId": winner,
                    "message": (
                        f"{plugins_root}:1: slot {slot!r} is claimed as default by "
                        f"{', '.join(claimants)}; using {winner}; "
                        "fix: keep @node_slot(..., default=True) on one plugin per slot"
                    ),
                }
            )
        ids = node_plugin_map.get(slot, [])
        node_plugin_map[slot] = [winner, *(x for x in ids if x != winner)]

    return {
        "version": 1,
        "generatedAt": _iso_now(),
        "scannerVersion": SCANNER_VERSION,
        "nodePluginMap": node_plugin_map,
        "plugins": plugins,
        "errors": errors,
    }


def _iso_now() -> str:
    from datetime import datetime, timezone

    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def main() -> int:
    ap = argparse.ArgumentParser(
        description="Scan Tongflow local plugins/ and print registry JSON (stdout).",
    )
    ap.add_argument(
        "--root",
        type=Path,
        default=Path("plugins"),
        help="Directory that contains one folder per plugin (default: ./plugins).",
    )
    ap.add_argument(
        "--abi",
        type=Path,
        default=Path("config/tongflow.abi.json"),
        help="Path to tongflow.abi.json",
    )
    ns = ap.parse_args()
    root = ns.root if ns.root.is_absolute() else (Path.cwd() / ns.root).resolve()
    abi = ns.abi if ns.abi.is_absolute() else (Path.cwd() / ns.abi).resolve()
    if not abi.is_file():
        err = {
            "version": 1,
            "errors": [
                {
                    "pluginId": "<scan>",
                    "message": _scan_error(
                        abi,
                        "missing ABI",
                        "pass --abi pointing to tongflow.abi.json",
                    ),
                }
            ],
        }
        print(json.dumps(err, ensure_ascii=True))
        return 0

    payload = scan(root, abi)
    print(json.dumps(payload, ensure_ascii=True))
    return 0


if __name__ == "__main__":
    main()
