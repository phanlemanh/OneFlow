# AGENTS.md

Codex/agent-native entry point. **[CLAUDE.md](CLAUDE.md) is the single source of truth** for repo rules — read it first; this file only adds agent-workflow notes.

## Non-negotiables (mirror of CLAUDE.md)

- **ABI first:** [`config/tongflow.abi.json`](config/tongflow.abi.json) is the contract. Any ABI change → `pnpm gen:abi` → commit [`src/generated/abi/index.ts`](src/generated/abi/index.ts) → keep Python SDK models in sync → publish SDK before plugins depend on it.
- **Contract enforcement is compile-time only.** No runtime validators; TS + Pydantic types are the whole gate.
- **Wire shape:** `pluginId` is top-level in the create-task body and `ExecutableNode`; `prompt` carries business fields only.
- **Verify suite** (run before every commit): `pnpm lint:check` · `pnpm typecheck` · `pnpm build` · `pnpm test` · `cd sdk && pytest` (if `sdk/` changed) · `pnpm verify:plugins`.
- **Branch off `main`** — never commit straight to it. Enable the guard once per machine: `pnpm hooks:install`.
- Comments in code: English only. Conventional Commits. No secrets in git.

## Acceptance Gate (installed)

Features (T2/T3) go through the Acceptance-Gate Kit — see [`_acceptance/README.md`](_acceptance/README.md):

1. Requirement → contract.md + evals.yaml → **Gate 1: human approves criteria**.
2. Implement as normal.
3. Machine verify → evidence-report.md → **Gate 2: human signs off** (signature lands in its own human-fields-only commit).

`_acceptance/config.yaml` binds evals to this repo's verify suite. PASS verdicts without machine evidence are blocked at write time (hook) and at merge time (`scripts/pre-merge-check.sh` in CI). Docs/branding-only changes (T1 globs in config) skip the gate.

## Living state

- [`STATUS.md`](STATUS.md) — current state + work queue; update it at the end of every work package (state lives in the repo, not in a machine's head).
- Product strategy & 24-week product plan: see STATUS.md "Kế hoạch" section.
