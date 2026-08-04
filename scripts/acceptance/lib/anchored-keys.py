#!/usr/bin/env python3
"""Cross-check that a feature's OWN eval keys run its anchored guards anchored.

Prints one line per offending key ("<key>: <command>") and exits 0; prints
nothing when the feature is fully wired. Exits 2 when it cannot look — a missing
evals.yaml, an unresolvable config key, a config that will not parse. "Could not
look" is never allowed to read as "looked and it was fine", the rule the whole
gate-scope-anchors contract is built on.

Called from scripts/acceptance/test-own-range.sh's backfill-integration case. It
exists because the obvious check — grep the config for ACCEPTANCE_SLUG=<slug> —
passes vacuously: the gate-scope-anchors contract's own executor keys carry those
exact strings while the feature's keys still run unanchored.

Usage: FEATURE_SLUG=<slug> anchored-keys.py <repo-root>
"""

import os
import re
import sys

# The guards that read ACCEPTANCE_SLUG. A command invoking one of these without
# the env var asks its question against whatever branch it happens to run on.
ANCHORED_GUARDS = (
    "check-no-config-drift.sh",
    "check-no-t3-drift.sh",
    "check-workflow-drift.sh",
    "check-run-jobs.sh",
    "check-gate-plumbing.sh",
    "check-dispatch-run.sh",
    "check-ghcr-untouched.sh",
)

CONFIG_REF = re.compile(r"config:executors\.script\.([A-Za-z0-9_-]+)")


def die(message):
    print(message, file=sys.stderr)
    sys.exit(2)


def script_executors(config_path):
    """The executors.script: block as {key: command}.

    A line-by-line read of the same 2-space-indented shape the kit's hook parses,
    rather than a YAML dependency this repo's gate tooling does not otherwise
    carry.
    """
    executors = {}
    in_executors = False
    in_script = False
    with open(config_path, encoding="utf-8") as handle:
        for line in handle:
            stripped = line.rstrip("\n")
            if not stripped.strip() or stripped.lstrip().startswith("#"):
                continue
            if not stripped.startswith(" "):
                in_executors = stripped.startswith("executors:")
                in_script = False
                continue
            if not in_executors:
                continue
            if re.match(r"^  [A-Za-z0-9_-]+:", stripped):
                in_script = stripped.strip().startswith("script:")
                continue
            if not in_script:
                continue
            match = re.match(r"^    ([A-Za-z0-9_-]+):\s*(.*)$", stripped)
            if match:
                value = match.group(2).strip()
                if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
                    value = value[1:-1]
                executors[match.group(1)] = value
    if not executors:
        die("no executors.script keys parsed from %s" % config_path)
    return executors


def referenced_keys(evals_path):
    with open(evals_path, encoding="utf-8") as handle:
        keys = set(CONFIG_REF.findall(handle.read()))
    if not keys:
        die("no config:executors.script.* references found in %s" % evals_path)
    return keys


def main():
    slug = os.environ.get("FEATURE_SLUG", "")
    if not slug:
        die("FEATURE_SLUG is not set")
    if len(sys.argv) != 2:
        die("usage: FEATURE_SLUG=<slug> %s <repo-root>" % os.path.basename(sys.argv[0]))
    root = sys.argv[1]

    evals_path = os.path.join(root, "_acceptance", slug, "evals.yaml")
    config_path = os.path.join(root, "_acceptance", "config.yaml")
    for path in (evals_path, config_path):
        if not os.path.isfile(path):
            die("missing %s" % path)

    executors = script_executors(config_path)
    for key in sorted(referenced_keys(evals_path)):
        if key not in executors:
            die("%s references executors.script.%s, which does not exist" % (evals_path, key))
        command = executors[key]
        if not any(guard in command for guard in ANCHORED_GUARDS):
            continue
        # Every invocation inside a compound command needs the anchor, not just
        # the first: `a && b` where only `a` carries it leaves `b` unanchored.
        segments = [s for s in re.split(r"&&|\|\||;", command) if s.strip()]
        for segment in segments:
            if not any(guard in segment for guard in ANCHORED_GUARDS):
                continue
            if ("ACCEPTANCE_SLUG=%s " % slug) not in segment:
                print("%s: %s" % (key, segment.strip()))


if __name__ == "__main__":
    main()
