# _acceptance

Workspace for the Acceptance-Gate Kit: turns a feature requirement into a contract + evals, then verifies the implementation with machine evidence so a human reviews a 1-page report instead of hand-testing. Driven by the `acceptance` skill; `config.yaml` binds the kit to this repo's verify suite (build/typecheck/lint/vitest/sdk-pytest/plugins-scan/ABI-drift).

Per-feature artifacts (contract.md, evals.yaml, evidence-report.md, evidence/) live in subfolders: `_acceptance/<feature-slug>/`.
