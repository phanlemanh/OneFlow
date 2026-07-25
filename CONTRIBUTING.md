# Contributing to TongFlow

Thanks for your interest in contributing to TongFlow! This guide covers the essentials.

## Code of Conduct

Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Be respectful and constructive; we welcome contributors from all backgrounds.

## Prerequisites

- Node.js 20+
- pnpm
- Python 3.10+ (only needed for Modal plugin development)
- Modal account (free tier at [modal.com](https://modal.com)) — for GPU/CPU inference

## Development Setup

```bash
git clone https://github.com/tong-io/tongflow.git
cd tongflow
pnpm install

cp .env.example .env       # fill in your API keys / tokens

# Optional, for running Modal plugins locally:
pip install modal && modal setup

pnpm dev                   # http://localhost:3000
```

Project conventions (directory layout, the ABI contract, plugin authoring rules) live
in [CLAUDE.md](CLAUDE.md). Plugin development is documented in [docs/plugins.md](docs/plugins.md).

## Submitting a Pull Request

1. Fork and branch from `main`: `git checkout -b feat/your-feature`.
2. Make your changes, following existing patterns and keeping PRs narrowly scoped.
3. Verify before pushing:

   ```bash
   pnpm typecheck
   pnpm lint:check
   pnpm build
   ```

4. Use [Conventional Commits](https://www.conventionalcommits.org/) for messages
   (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:` …) and open a PR against `main`.

Comments in code must be in English. File names use kebab-case; React components use PascalCase.

## Reporting Bugs & Requesting Features

Use [GitHub Issues](https://github.com/tong-io/tongflow/issues) with the provided
templates. For questions, join our [Discord](https://discord.gg/K7V8az94Zf).

## License

OneFlow is licensed under [AGPL-3.0](LICENSE) only. This fork cannot offer a
commercial license — the dual-licensing option belongs to the upstream copyright
holder, [tong-io/tongflow](https://github.com/tong-io/tongflow).

There is **no CLA**: contributions are accepted under AGPL-3.0 itself
(inbound = outbound). By submitting a pull request you agree to license your
contribution under AGPL-3.0. This applies to the whole repository, including the
`sdk/` directory (the `tongflow` PyPI package).
