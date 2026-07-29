## Trong hợp đồng

### 1. E14 eval pins HEAD_SHA to a local-only commit — unreproducible on CI or any other clone
- file: `scripts/acceptance/check-stale-real-repo.sh:26`
- severity: high
- source: conventions
- AC: AC-10

`HEAD_SHA=5986bb27b8aa2200e74f44c729be8782264d137d` is reachable only from the local branch `feat/conformance-l0`. Every remote ref was checked: `git branch -r --contains 5986bb27` returns nothing, and `git merge-base --is-ancestor 5986bb27 <each refs/remotes/*>` fails for all of them (`BASE_SHA=336944d` by contrast IS on `origin/main`). The guard's own preflight then fires `FAIL: pinned commit $sha not in this clone (shallow fetch or rewritten history)` and exits 1 on any fresh clone, including CI with `fetch-depth: 0`. It passes only in this working copy. This is the eval backing AC-10 — the one criterion in the whole feature that asserts against real repo data rather than a fixture, so it is exactly the one that must survive a clean checkout. It also couples the feature's evidence to an unmerged sibling branch and to `_acceptance/conformance-l0/`, a directory that does not exist on this branch, which runs against the "prefer one gated feature per branch off `main`" convention. The commit is also just `docs(spec): stale-scope-by-paths` — a commit this branch itself authored and then moved away from (ledger d-20260728T130000Z-6690), not a stable upstream anchor.

Rationale (contract mapping): AC-10's own text defines its success condition against "the two literal SHAs recorded in eval E14"; since that SHA is unreachable outside this working copy, AC-10 as worded cannot be demonstrated on a fresh clone or CI.

### 2. Narrow scope silently matches nothing when _acceptance/ is not at the git root (evidence can never go stale)
- file: `scripts/pre-merge-check.sh:579`
- severity: high
- source: bugs
- AC: AC-1

`scope_has_any_match()` validates the declared glob union against `git -C "$ROOT" ls-files`, whose paths are relative to `$ROOT`. Every other consumer of those same globs — `stale_files()` (line 612), `gated_coverage()` (541), `scope_gaps()` (555) — matches against `git diff --name-only`, whose paths are relative to the GIT TOP-LEVEL, not `$ROOT`. Verified: `git -C repo/pkg diff --name-only` prints `pkg/src/a.txt` while `git -C repo/pkg ls-files` prints `src/a.txt`.

The script explicitly supports `$ROOT` being a subdirectory of the repo (see the comment at lines 731-735 about "monorepo: pkg/_acceptance/", and the `_acceptance/*|*/_acceptance/*` patterns used throughout). In that layout a declaration written `$ROOT`-relative (e.g. `paths: ["src/covered/**"]`) passes the match-nothing guard (`ls-files` sees `src/covered/seed.txt`) but the scope filter in `stale_files()` is handed `pkg/src/covered/...` and matches nothing — so the narrow staleness set is always empty and the feature is never reported stale again.

Reproduced end-to-end: fixture git repo with `pkg/_acceptance/fx/` (signed-off T2, `verified_commit` pinned, both evals declaring `paths: ["src/covered/**"]`), then a commit adding `pkg/src/covered/CHANGED.txt` — a file INSIDE the declared union. `bash scripts/pre-merge-check.sh <repo>/pkg --base <post-report-sha>` prints:
```
NOTE [fx]: narrow staleness scope applied (src/covered/**) — suppressed 1 whole-tree change(s)
OK [fx]: PASS, signed off by Fixture 2026-07-28
```
That is exactly the AC-1 failure mode the feature exists to prevent ("a mechanism degraded into 'never stale' passes every other criterion"). The cross-check does not save it: it only runs when the feature's own `_acceptance/<slug>/` is in the PR diff, and on that PR the namespace mismatch makes `scope_gaps()` report gaps and fail closed — so the hole opens on every LATER PR, which is the common case. Every fixture in `check-stale-scoping.sh` puts `$ROOT` at the git root, so nothing in the guard suite covers this. Fix: normalize one namespace, e.g. resolve the prefix of `$ROOT` relative to `git rev-parse --show-prefix` and either strip it from the diff output or prepend it in `scope_has_any_match` (and use `git ls-files --full-name`).

Rationale (contract mapping): AC-1 unconditionally requires that a file matching the declared paths union still causes the feature to be reported stale; the reproduced scenario shows exactly such a file failing to trigger staleness once `_acceptance/` sits below the git root, a direct counterexample to AC-1's text.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Vietnamese comments and Vietnamese CI-facing gate output introduced into English-only code**
  Người dùng thấy gì: Some of the pass/fail messages this project's automated check shows to contributors are written in Vietnamese instead of English, so an outside contributor may not understand why their change was blocked.
  file: `scripts/pre-merge-check.sh`
  severity: high
  Đề xuất: new-contract

- **gap-probe's only escape hatch is an undocumented Vietnamese string literal**
  Người dùng thấy gì: The one way to skip this particular automated check is a hidden phrase that only works in Vietnamese and is not written down anywhere in English, so most contributors would have no way to find or use it.
  file: `lib/gap-probe.js`
  severity: medium
  Đề xuất: new-contract

- **biome.json added to t1_skip_globs, so lint-config changes can never stale signed evidence**
  Người dùng thấy gì: Turning off a certain code-style setting later would not flag past sign-offs as needing a fresh check, even though those sign-offs recorded that the setting was in effect at the time.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

- **Vendor bump truncated a doc comment in evidence-core.js, dropping a documented behaviour note**
  Người dùng thấy gì: An explanatory note in the code was accidentally cut in half during an unrelated update, leaving behind a sentence that stops mid-thought and drops a rule future readers were meant to know.
  file: `lib/evidence-core.js`
  severity: low
  Đề xuất: known-limits

- **stale_files() writes to a bare global named `scope`, shadowing the caller's variable of the same name**
  Người dùng thấy gì: A shared, unprotected internal variable currently works safely only by luck; a future change elsewhere in the same script could quietly corrupt it and produce a wrong result with no warning.
  file: `scripts/pre-merge-check.sh`
  severity: low
  Đề xuất: known-limits

- **Dead assertion in case_partial: the gate never emits the literal string "narrow scope"**
  Người dùng thấy gì: One part of an internal safety check meant to catch a specific kind of mistake can never actually trigger, so that particular mistake could go undetected in the future — though a second check right next to it in the same test would likely still catch the main problem.
  file: `scripts/acceptance/check-stale-scoping.sh`
  severity: medium
  Đề xuất: known-limits

- **Golden baseline only compares header lines, not the stale-file lists it claims to pin**
  Người dùng thấy gì: A safety check meant to catch changes in exactly which files get flagged only looks at a short summary, not the actual list of flagged files, so a bug that changes that list's contents could pass unnoticed.
  file: `scripts/acceptance/check-stale-golden.sh`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 3/9 lỗi rơi vào file không bộ đo nào phủ (lib/gap-probe.js, _acceptance/config.yaml, lib/evidence-core.js) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.