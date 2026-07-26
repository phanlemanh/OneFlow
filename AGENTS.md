# AGENTS.md

Codex/agent-native entry point. **[CLAUDE.md](CLAUDE.md) is the single source of truth** for repo rules — read it first; this file only adds agent-workflow notes.

## Non-negotiables (mirror of CLAUDE.md)

- **ABI first:** [`config/tongflow.abi.json`](config/tongflow.abi.json) is the contract. Any ABI change → `pnpm gen:abi` → commit [`src/generated/abi/index.ts`](src/generated/abi/index.ts) → keep Python SDK models in sync → publish SDK before plugins depend on it.
- **Contract enforcement is compile-time only.** No runtime validators; TS + Pydantic types are the whole gate.
- **Wire shape:** `pluginId` is top-level in the create-task body and `ExecutableNode`; `prompt` carries business fields only.
- **Verify suite** (run before every commit): `pnpm lint:check` · `pnpm typecheck` · `pnpm build` · `pnpm test` · the SDK suite (if `sdk/` changed) · `pnpm verify:plugins`. Run the SDK suite the way `_acceptance/config.yaml` does — `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q` — not a bare `pytest`: on macOS PEP 668 blocks installing pytest into Homebrew's `python3`, so the bare form can never work there.
- **Branch off `main`** — never commit straight to it. Enable the guard once per machine: `pnpm hooks:install`.
- Comments in code: English only. Conventional Commits. No secrets in git.

## Acceptance Gate (installed)

Features (T2/T3) go through the Acceptance-Gate Kit — see [`_acceptance/README.md`](_acceptance/README.md):

1. Requirement → contract.md + evals.yaml → **Gate 1: human approves criteria**.
2. Implement as normal.
3. Machine verify → evidence-report.md → **Gate 2: human signs off** (signature lands in its own human-fields-only commit).

`_acceptance/config.yaml` binds evals to this repo's verify suite. PASS verdicts without machine evidence are blocked at write time (hook) and at merge time (`scripts/pre-merge-check.sh` in CI). Docs/branding-only changes (T1 globs in config) skip the gate.

## Merge rituals

Two rules learned the hard way on 2026-07-26. Both are cheap to follow and expensive to skip.

### 1. Merge commits only for gated PRs — never squash

`signoff.require_human_commit` finds the commit that introduced `human_signoff` and demands it touched **only** human fields. Squashing folds that signature into the same commit as the implementation, so the check reports "the commit introducing human_signoff also edits the report body" — permanently, for every later PR. Use `gh pr merge <n> --merge`.

Two corollaries:

- **Do not pass `--delete-branch` while other PRs are stacked on that branch.** GitHub closes them instead of retargeting, and a closed PR cannot be reopened or retargeted until its base branch exists again.
- **Never repeat a signature value verbatim in report prose.** `git log -S` counts occurrences, so a second copy makes the provenance check resolve to the wrong commit. Write "the human signature line" instead; the value belongs in frontmatter, once.

### 2. Re-pin after every merge and every rebase

`stale_files` compares the **whole tree** against each report's `verified_commit`, unscoped to the PR. So every merged feature goes stale the moment anything non-T1 lands after it, and a rebase kills the pin outright by replacing the commit. The rule is coarse on purpose: it cannot tell "code this feature depends on changed" from "unrelated code now exists beside it", so it flags both.

**Never hand-edit a SHA.** A pin moves only after evals have actually run. How much has to run depends on which feature it is:

| Feature | What to run | Signature |
|---|---|---|
| The one under review in this PR | Full re-verify — every eval, fresh-context verifier, new round in `run-log.jsonl` | Re-sign at Gate 2 as normal |
| Already merged and signed off | The standing checks (`pnpm test`, `pnpm lint:check`, `pnpm build && pnpm typecheck`) — plus its own evals when cheap | **Carries forward**, see below |

**The carry-forward rule** (authorised by Manh, 2026-07-26). A merged feature's human signature may be re-pinned to a new commit when **both** hold:

1. The feature's **own** code is unchanged — check with `git diff --name-only <old-pin>` filtered of `_acceptance/`; every differing file must belong to some other feature.
2. The standing checks are green on the new tree.

The signature then attests to the same code it originally did, which is the substance the human actually judged. Record the check in the report's `## Iterations` — including which files differed and which feature owns them.

**What this does NOT license.** If any file the feature owns has changed, the signature does not carry: re-verify and get a fresh Gate-2 signature. Carry-forward is a bookkeeping fix for a coarse staleness rule, not a way to extend approval over code a human never saw.

The alternative was considered and rejected: requiring a fresh signature per merged feature per PR costs one signature per feature and grows without bound, which turns the gate into noise. Accepting permanently red CI was rejected for the same reason.

Because even the cheap path costs a verify cycle, **prefer one gated feature per branch off `main`.** Stacking multiplies the re-pins, and the branches will conflict twice over: on `_acceptance/config.yaml` where each appends its executor keys (resolve by **union** — every feature keeps its own), and on any evidence report both branches re-pinned (take the version already on `main`, then re-verify).

## Living state

- [`STATUS.md`](STATUS.md) — current state + work queue; update it at the end of every work package (state lives in the repo, not in a machine's head).
- Product strategy & 24-week product plan: see STATUS.md "Kế hoạch" section.
