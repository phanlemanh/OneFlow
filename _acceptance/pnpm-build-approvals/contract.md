---
schema_version: 1
feature: pnpm 11 build-script approvals — move to pnpm-workspace.yaml (allowBuilds) and unblock the verify toolchain
slug: pnpm-build-approvals
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ci, scripts]
status: implemented
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-08-18T08:20:31Z
---

# Acceptance Contract: pnpm-build-approvals

## Context

`pnpm` was upgraded to 11.5.1, which **no longer reads the `pnpm` field in
`package.json`**. Every invocation printed a warning, and every `pnpm install`
ended in `ERR_PNPM_IGNORED_BUILDS`. Because build scripts never ran,
`better-sqlite3`'s native addon was never compiled, so 4 tests in
[`src/db/metering-schema.test.ts`](../../src/db/metering-schema.test.ts) failed
with *"Could not locate the bindings file … better_sqlite3.node"*. Worse, pnpm's
implicit deps check aborted `build`, `lint:check`, `test`, `verify:plugins` and
`gen:abi` **before they did any work**.

This is not one feature's problem: it blocked `feature_loop.suite_keys` in
[`_acceptance/config.yaml`](../config.yaml) for **every** feature — no verify
round could produce a clean suite result. The measuring stick itself was down,
which is the same class of failure `ci-vitest-sdk-pin` was cut for.

Source input: prompt (session 2026-08-18), reporting the warning text, the 4
failing tests, and the 6 aborting commands as reproducible facts.

### The trap this contract exists to pin down

The obvious fix — move the existing `onlyBuiltDependencies` **list** into
`pnpm-workspace.yaml` — is a **silent no-op on pnpm 11**. Measured on this
machine with isolated stores (no side-effects-cache contamination), against a
package with a real install script:

| key in `pnpm-workspace.yaml` | pnpm 10.34.5 (CI pin) | pnpm 11.5.1 (local) |
|---|---|---|
| none (control) | NOT-BUILT | NOT-BUILT |
| `onlyBuiltDependencies` | BUILT | **ignored** |
| `allowBuilds` | BUILT | BUILT |

pnpm 11 renamed the setting (list → package→boolean map). A verbatim move would
have produced a byte-identical outcome to having no config at all — green-looking
and wrong. AC-6 and AC-7 are the teeth for exactly this.

### Re-sign cost — QUOTED AT GATE 1 (measured, not estimated)

Computed by machine on `5f1afba` via
`bash scripts/pre-merge-check.sh . --base origin/main --recheck-all`:
**17 OK, 0 stale, 0 features needing re-sign.** The only violation is this PR's
own missing `_acceptance/` artifacts — which is what this contract closes.

Zero is not luck: `.gitignore` is `t1_skip_globs`-exempt, and the per-slug scope
rule shipped by `stale-scope-by-paths` keeps slugs whose declared paths do not
intersect `package.json` from being invalidated by an unrelated tooling change.
This is that feature paying out.

## Criteria

House rule inherited from `stale-scope-by-paths` and `ci-vitest-sdk-pin`: **a
config that claims to enable builds must be proven to go RED when it is removed,
not merely green while it sits there.** Hence a "teeth" criterion beside each
"wire" criterion.

- AC-1: Given the repo tree, When `package.json` is read, Then it carries **no
  `pnpm` field**, and no `pnpm` invocation prints `The "pnpm" field in
  package.json is no longer read`. *Wire: the dead config is gone, not merely
  shadowed.*
- AC-2: Given a repo with dependencies installed, When `pnpm install` runs, Then
  it exits 0 and prints **no `ERR_PNPM_IGNORED_BUILDS`**.
- AC-3: Given a completed install, When `better-sqlite3` is loaded, Then the
  compiled addon `build/Release/better_sqlite3.node` exists and
  `src/db/metering-schema.test.ts` passes in full — the 4 bindings failures are
  gone. *This is the originally-reported symptom.*
- AC-4: Given the repo, When `pnpm test` runs, Then **427/427** tests pass across
  32 files, with no test skipped to get there.
- AC-5: Given the six commands the deps check aborted (`build`, `typecheck`,
  `lint:check`, `test`, `verify:plugins`, `gen:abi`), When each runs **without**
  `--config.verifyDepsBeforeRun=false`, Then each exits 0. *The workaround must
  become unnecessary, not merely optional.*
- AC-6: Given the approvals block in `pnpm-workspace.yaml` is removed or renamed
  (perturbation on a copy, in-process, never committed), When `pnpm install` runs
  on a clean store, Then it **fails with `ERR_PNPM_IGNORED_BUILDS`** and the addon
  is absent; restoring the block makes it pass again. *Teeth for AC-2/AC-3: proves
  the file is load-bearing rather than decorative.*
- AC-7: Given the same file rewritten to the legacy `onlyBuiltDependencies` list
  form, When `pnpm install` runs on a clean store under the **local pnpm 11**,
  Then builds are **still skipped** — byte-identical to the no-config control.
  *Teeth for the key choice itself: proves `allowBuilds` is load-bearing and that
  the intuitive fix would have been a silent no-op.*
- AC-8: Given a clean checkout carrying no `node_modules`, When `pnpm install`
  runs under the **pnpm major CI pins** (`pnpm/action-setup` `version: 10`), Then
  the intended build scripts run and the addon is compiled — the one config
  serves both CI and local. *Should-NOT-break: the fix must not trade local green
  for CI red.*
- AC-9: Given `pnpm-workspace.yaml`, When git is asked about it, Then it is
  **tracked** (`git ls-files` lists it) and **not ignored** (`git check-ignore`
  does not match). *Teeth for AC-8: a gitignored approvals file works on the
  author's laptop and is invisible to CI — precisely the state this repo was in
  before this change.*
- AC-10: Given the set of packages pnpm flags as having build scripts, When
  `pnpm-workspace.yaml` is read, Then **every flagged package has an explicit
  `true` or `false`** — none omitted — and each package marked `false` is
  justified by its actual install script being a no-op under this repo's
  conditions. *Should-NOT-fire: an omission and a deliberate denial must not look
  the same.*
- AC-11: Given `_acceptance/config.yaml`, When the diff against `origin/main` is
  read, Then every change is **purely additive** — no pre-existing `executors.*`
  key is modified or removed and `feature_loop.suite_keys` is untouched — and no
  dependency version in `package.json` or `pnpm-lock.yaml` changes.
  *Boundary: this package fixes how approvals are declared; it does not
  re-negotiate what is installed or what is already measured. Adding this
  feature's own executor keys is expected; touching anyone else's is not.*
- AC-12: Given the PR diff against `origin/main`, When the changed-file list is
  read, Then every path is confined to tooling config and this feature's own gate
  artifacts (`package.json`, `pnpm-workspace.yaml`, `.gitignore`, `_acceptance/**`,
  `scripts/pnpm/**`) with **no feature code** under `src/**`, `sdk/**` or
  `config/**`, and **no lockfile change**. *Boundary: the stated scope was
  "tooling config only"; guard scripts this contract's own evals invoke are gate
  artifacts, not product code.*

## Coverage

Axis scan (morphological, preset "verify infrastructure"; product leg: the
reported symptom set — warning, ignored builds, 4 failing tests, 6 aborting
commands; industry leg: `[INDUSTRY: pnpm settings migration, package.json →
pnpm-workspace.yaml]` and `[INDUSTRY: node-gyp / prebuild-install native addon
resolution]`):

- **Axis — symptom closed:** warning gone (AC-1) | ignored-builds gone (AC-2) |
  addon compiled (AC-3) | suite whole (AC-4) | workaround retired (AC-5)
- **Axis — wire ↔ teeth** (each mechanism needs both): wire AC-2/AC-3 · teeth
  AC-6 · key-choice teeth AC-7 · tracked-not-ignored teeth AC-9
- **Axis — version surface** (the axis that makes this non-trivial): local
  pnpm 11 (AC-1..AC-7) | CI pnpm 10 (AC-8). *A fix that is green on only one of
  these is the actual failure mode here.*
- **Axis — should-NOT:** silent omission vs deliberate denial (AC-10) · measuring
  stick unchanged (AC-11) · scope creep into feature code or the lockfile (AC-12)
- Later/Never cells, recorded: bump the CI pin to pnpm 11 (**Later** — would make
  the version axis single-valued and retire AC-8, but it is a CI major bump with
  its own blast radius; deliberately not bundled) · add a `packageManager` field
  to pin pnpm exactly (**Later** — it would close the `allowBuilds` floor risk in
  Known limits; same reason) · make each git worktree its own pnpm root
  (**Never here** — it is a side effect of shipping the file, not a goal, and
  claiming it as one would invent scope).

## Out of scope

- **No CI pnpm major bump.** `.github/workflows/ci.yml` keeps `version: 10`; this
  package proves the config works there rather than changing it.
- **No `packageManager` field** in `package.json`, and no pinning of an exact pnpm
  version — see Known limits for the residual risk this leaves open.
- **No dependency changes.** No version bumps, no additions, no removals, no
  lockfile edit. `dependency-refresh-2026-07` owns that surface.
- **No feature code, no ABI, no SDK.** Nothing under `src/**`, `sdk/**`, or
  `config/tongflow.abi.json` is touched — which is also why this stays T2.
- **No repair of the worktree/pnpm-root nesting behaviour.** Shipping a tracked
  `pnpm-workspace.yaml` happens to make each git worktree resolve as its own pnpm
  root; that is an observed side effect, not a criterion, and nothing here asserts
  it.
- **No change to which packages are installed** — only to which of them are
  permitted to run build scripts.

## Notes

- **This contract was written AFTER the implementation landed** (commit `5f1afba`,
  PR #62), because the change was made as a direct tooling fix before the gate
  was consulted. That is the anti-pattern the kit names as "criteria mould
  themselves to what was built", and it is disclosed rather than hidden. Two
  mitigations, both checkable: (1) every criterion AC-1..AC-5 is a restatement of
  a symptom from the **original problem report**, which predates the
  implementation; (2) AC-6..AC-9 are perturbation/teeth criteria that can fail
  against the code as written, and AC-7 in particular encodes a trap the
  implementation had to actively avoid.
- **Tier T2:** the diff touches no `risk_tiers.t3_paths` entry. If implementation
  ever had to reach into `sdk/**` or `src/db/**`, the tier escalates to T3 —
  Phase 3 re-checks the real `git diff`.
- **Known limit — `allowBuilds` version floor.** Support lands between pnpm 10.20
  (no) and 10.28 (yes); measured. CI's `version: 10` floats to the latest 10.x
  (10.34.5 today), so it is comfortably above the floor. But an exact pin below
  ~10.28 would skip native builds **silently** — fail-open, the failure family
  this repo has paid for before. Recorded here rather than fixed; the fix is the
  `packageManager` field held out of scope above.
- **Known limit — `cbor-extract` dropped on absence, not on history.** It was
  removed from the approvals because it has zero occurrences in `pnpm-lock.yaml`
  today. If it returns as a transitive dependency, it returns unapproved and the
  install fails loudly (AC-10's shape) rather than silently — an acceptable
  failure direction, but it is a re-appearance this contract does not guard.
- Merge ritual unchanged (AGENTS.md): merge commit, not squash.
