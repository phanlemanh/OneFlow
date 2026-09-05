# Security Policy

## Supported Versions

OneFlow is under active development. Security fixes are applied to the latest
release on the `main` branch. Please make sure you are running the most recent
version before reporting an issue.

Vulnerabilities in *upstream* TongFlow that are not present in this fork should
be reported to [tong-io/tongflow](https://github.com/tong-io/tongflow) instead.

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Instead, use GitHub's [private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)
via the **Security** tab of this repository. That channel is private, goes
directly to the maintainer, and is the only reporting route for this fork.

Please include:

- A description of the issue and its potential impact.
- Steps to reproduce (proof of concept if possible).
- Affected version / commit and your environment.

## What to Expect

- We aim to acknowledge your report within **3 business days**.
- We will keep you informed about our progress toward a fix.
- We ask that you give us a reasonable amount of time to release a fix before any
  public disclosure, and we will credit you (if you wish) once the issue is resolved.

## Handling Secrets

OneFlow integrates with several third-party providers (Modal, OpenAI, OpenRouter,
Gemini, PyPI, …). **Never commit real credentials.** Keep them in your local `.env`
(which is gitignored); only `.env.example` with placeholder values is tracked. If you
believe a secret has been exposed, rotate it immediately and report it through the
private channel above.
