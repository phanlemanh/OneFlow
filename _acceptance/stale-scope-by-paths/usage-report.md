### S4 round 1 — wf_4d6e3339-60b (39 agent, 127,411 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5 | 24 | 24,888 | 47 | 3,354,909 | 473 |
| review:conventions | claude-opus-5 | 48 | 21,623 | 96 | 5,420,390 | 501 |
| refute:check-stale-real-repo.sh | claude-sonnet-5 | 15 | 11,718 | 163 | 1,288,669 | 213 |
| refute:gap-probe.js | claude-sonnet-5 | 17 | 10,933 | 34 | 1,369,836 | 229 |
| refute:pre-merge-check.sh | claude-sonnet-5 | 25 | 10,471 | 50 | 2,239,672 | 247 |
| refute:pre-merge-check.sh | claude-sonnet-5 | 17 | 7,520 | 1,732 | 1,404,191 | 237 |
| refute:config.yaml | claude-sonnet-5 | 9 | 6,615 | 1,594 | 685,122 | 203 |
| refute:evidence-core.js | claude-sonnet-5 | 7 | 5,213 | 1,553 | 462,583 | 134 |
| refute:check-stale-golden.sh | claude-sonnet-5 | 11 | 4,744 | 22 | 806,296 | 120 |
| baseline:diffBase | claude-sonnet-5 | 6 | 2,957 | 12 | 379,047 | 53 |
| refute:gap-probe.js | claude-sonnet-5 | 14 | 2,935 | 28 | 1,134,304 | 193 |
| refute:evidence-core.js | claude-sonnet-5 | 7 | 2,381 | 14 | 491,368 | 81 |
| refute:check-stale-scoping.sh | claude-sonnet-5 | 10 | 1,552 | 20 | 718,955 | 65 |
| refute:pre-merge-check.sh | claude-sonnet-5 | 8 | 1,501 | 1,480 | 573,915 | 65 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 3 | 1,224 | 26 | 101,472 | 22 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 776 | 18 | 66,525 | 16 |
| capture:provenance | claude-sonnet-5 | 2 | 749 | 4 | 71,165 | 13 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 2 | 665 | 18 | 49,196 | 16 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 2 | 653 | 18 | 49,199 | 17 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 2 | 651 | 18 | 49,198 | 14 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 2 | 640 | 18 | 66,498 | 14 |
| machine:pnpm lint:check | claude-haiku-4-5-20251001 | 2 | 638 | 18 | 66,481 | 12 |
| machine:pnpm test | claude-haiku-4-5-20251001 | 2 | 621 | 18 | 66,477 | 15 |
| machine:bash scripts/acceptance/check-stale-real | claude-haiku-4-5-20251001 | 2 | 589 | 18 | 66,495 | 12 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 8 | 575 | 66 | 364,543 | 47 |
| machine:pnpm verify:plugins | claude-haiku-4-5-20251001 | 2 | 563 | 18 | 66,481 | 11 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 2 | 555 | 18 | 49,200 | 11 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 2 | 533 | 18 | 49,200 | 11 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 2 | 507 | 18 | 49,196 | 11 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 4 | 411 | 34 | 170,793 | 22 |
| machine:bash scripts/acceptance/check-stale-gold | claude-haiku-4-5-20251001 | 3 | 372 | 26 | 101,114 | 22 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 2 | 325 | 18 | 49,199 | 13 |
| machine:pnpm gen:abi && git diff --exit-code src | claude-haiku-4-5-20251001 | 3 | 286 | 26 | 118,485 | 21 |
| machine:pnpm build && pnpm typecheck | claude-haiku-4-5-20251001 | 2 | 266 | 18 | 66,489 | 36 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 2 | 235 | 18 | 66,500 | 13 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 2 | 214 | 18 | 49,198 | 13 |
| synthesize:report | claude-sonnet-5 | 2 | 193 | 4 | 87,043 | 188 |
| triage | claude-sonnet-5 | 2 | 115 | 4 | 76,895 | 180 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 66,502 | 11 |

- **claude-opus-5**: 2 agent · 72 calls · out 46,511 · in 143 · cache_read 8,775,299 · cache_create 317,549
- **claude-sonnet-5**: 15 agent · 152 calls · out 69,597 · in 6,714 · cache_read 11,789,061 · cache_create 1,231,448
- **claude-haiku-4-5-20251001**: 22 agent · 55 calls · out 11,303 · in 484 · cache_read 1,848,441 · cache_create 962,415

