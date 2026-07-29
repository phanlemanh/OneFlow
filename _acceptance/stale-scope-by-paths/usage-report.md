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

### S4 round 2 — wf_15f133bf-94b (38 agent, 102,790 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5 | 18 | 17,785 | 36 | 2,406,407 | 342 |
| review:conventions | claude-opus-5 | 23 | 12,642 | 45 | 2,440,246 | 308 |
| refute:pre-merge-check.sh | claude-sonnet-5 | 21 | 11,103 | 42 | 1,730,746 | 272 |
| refute:pre-merge-check.sh | claude-sonnet-5 | 16 | 8,827 | 32 | 1,560,250 | 138 |
| refute:check-stale-real-repo.sh | claude-sonnet-5 | 7 | 6,784 | 14 | 469,625 | 105 |
| synthesize:report | claude-sonnet-5 | 9 | 6,441 | 18 | 840,031 | 273 |
| refute:check-stale-golden.sh | claude-sonnet-5 | 5 | 5,839 | 10 | 317,076 | 84 |
| refute:pre-merge-check.sh | claude-sonnet-5 | 14 | 5,049 | 28 | 1,095,594 | 119 |
| refute:pre-merge-check.sh | claude-sonnet-5 | 9 | 3,442 | 18 | 659,249 | 69 |
| baseline:diffBase | claude-sonnet-5 | 6 | 3,331 | 12 | 378,972 | 60 |
| refute:evidence-report.md | claude-sonnet-5 | 10 | 2,946 | 1,356 | 771,567 | 125 |
| refute:evidence-core.js | claude-sonnet-5 | 11 | 2,845 | 22 | 817,776 | 103 |
| refute:check-stale-scoping.sh | claude-sonnet-5 | 5 | 2,137 | 4,413 | 354,283 | 56 |
| capture:provenance | claude-sonnet-5 | 2 | 1,310 | 4 | 71,165 | 18 |
| machine:bash scripts/acceptance/check-stale-real | claude-haiku-4-5-20251001 | 3 | 1,163 | 26 | 118,730 | 23 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 5 | 1,135 | 42 | 205,517 | 31 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 4 | 918 | 34 | 170,490 | 21 |
| machine:pnpm lint:check | claude-haiku-4-5-20251001 | 3 | 797 | 26 | 118,409 | 17 |
| refute:config.yaml | claude-sonnet-5 | 6 | 762 | 12 | 389,851 | 65 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 2 | 706 | 18 | 49,199 | 12 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 2 | 667 | 18 | 66,498 | 13 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 3 | 656 | 26 | 118,834 | 17 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 2 | 655 | 18 | 49,196 | 14 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 2 | 595 | 18 | 66,500 | 12 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 2 | 554 | 18 | 49,200 | 11 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 3 | 524 | 26 | 118,381 | 25 |
| machine:bash scripts/acceptance/check-stale-gold | claude-haiku-4-5-20251001 | 2 | 455 | 18 | 49,191 | 11 |
| machine:pnpm test | claude-haiku-4-5-20251001 | 2 | 370 | 18 | 66,477 | 13 |
| machine:pnpm build && pnpm typecheck | claude-haiku-4-5-20251001 | 2 | 368 | 18 | 66,489 | 32 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 4 | 310 | 34 | 170,494 | 20 |
| machine:pnpm gen:abi && git diff --exit-code src | claude-haiku-4-5-20251001 | 2 | 294 | 18 | 66,518 | 12 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 3 | 282 | 26 | 101,032 | 18 |
| machine:pnpm verify:plugins | claude-haiku-4-5-20251001 | 2 | 282 | 18 | 66,481 | 13 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 2 | 262 | 18 | 66,502 | 12 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 2 | 236 | 18 | 66,502 | 17 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 4 | 210 | 36 | 170,367 | 24 |
| triage | claude-sonnet-5 | 2 | 102 | 4 | 75,687 | 114 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 2 | 6 | 18 | 49,198 | 13 |

- **claude-opus-5**: 2 agent · 41 calls · out 30,427 · in 81 · cache_read 4,846,653 · cache_create 306,032
- **claude-sonnet-5**: 14 agent · 123 calls · out 60,918 · in 5,985 · cache_read 9,531,872 · cache_create 1,173,388
- **claude-haiku-4-5-20251001**: 22 agent · 58 calls · out 11,445 · in 510 · cache_read 2,070,205 · cache_create 892,564

### S4 round 3 — wf_0b39f0a3-bc2 (38 agent, 119,434 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5 | 33 | 35,918 | 66 | 4,603,510 | 618 |
| refute:pre-merge-check.sh | claude-sonnet-5 | 22 | 13,787 | 44 | 2,136,553 | 250 |
| review:conventions | claude-opus-5 | 27 | 13,591 | 54 | 2,685,485 | 376 |
| refute:config.yaml | claude-sonnet-5 | 15 | 9,313 | 30 | 1,241,611 | 259 |
| refute:baseline-gate-output.txt | claude-sonnet-5 | 14 | 8,453 | 1,057 | 1,224,278 | 288 |
| refute:check-stale-real-repo.sh | claude-sonnet-5 | 12 | 7,013 | 24 | 1,003,007 | 204 |
| refute:config.yaml | claude-sonnet-5 | 13 | 4,400 | 26 | 988,060 | 135 |
| refute:evidence-core.js | claude-sonnet-5 | 10 | 4,220 | 20 | 716,614 | 234 |
| refute:pre-merge-check.sh | claude-sonnet-5 | 8 | 3,458 | 16 | 598,477 | 95 |
| refute:pre-merge-check.sh | claude-sonnet-5 | 10 | 2,462 | 778 | 736,682 | 165 |
| refute:pre-merge-check.sh | claude-sonnet-5 | 10 | 2,059 | 20 | 762,137 | 119 |
| baseline:diffBase | claude-sonnet-5 | 7 | 1,944 | 14 | 455,675 | 69 |
| refute:evidence-report.md | claude-sonnet-5 | 7 | 1,174 | 1,531 | 482,792 | 96 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 5 | 929 | 42 | 205,926 | 25 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 3 | 724 | 26 | 101,137 | 16 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 3 | 691 | 26 | 118,336 | 16 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 679 | 18 | 66,525 | 13 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 2 | 660 | 18 | 66,498 | 16 |
| machine:pnpm build && pnpm typecheck | claude-haiku-4-5-20251001 | 2 | 654 | 18 | 66,489 | 38 |
| machine:pnpm verify:plugins | claude-haiku-4-5-20251001 | 2 | 653 | 18 | 66,481 | 11 |
| machine:bash scripts/acceptance/check-stale-real | claude-haiku-4-5-20251001 | 2 | 643 | 18 | 66,495 | 17 |
| machine:pnpm test | claude-haiku-4-5-20251001 | 2 | 578 | 18 | 66,477 | 12 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 2 | 517 | 18 | 49,197 | 12 |
| machine:pnpm lint:check | claude-haiku-4-5-20251001 | 2 | 493 | 18 | 66,481 | 11 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 3 | 442 | 26 | 118,378 | 26 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 5 | 430 | 42 | 222,546 | 29 |
| capture:provenance | claude-sonnet-5 | 2 | 423 | 4 | 71,165 | 13 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 3 | 420 | 26 | 118,327 | 18 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 4 | 417 | 34 | 153,120 | 21 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 2 | 415 | 18 | 49,198 | 17 |
| machine:pnpm gen:abi && git diff --exit-code src | claude-haiku-4-5-20251001 | 2 | 340 | 18 | 66,518 | 14 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 2 | 328 | 18 | 49,198 | 12 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 2 | 291 | 18 | 66,502 | 17 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 2 | 283 | 18 | 66,500 | 12 |
| machine:bash scripts/acceptance/check-stale-gold | claude-haiku-4-5-20251001 | 2 | 270 | 18 | 49,191 | 16 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 2 | 246 | 18 | 49,197 | 11 |
| triage | claude-sonnet-5 | 2 | 104 | 4 | 76,571 | 154 |
| synthesize:report | claude-sonnet-5 | 4 | 12 | 8 | 287,539 | 191 |

- **claude-opus-5**: 2 agent · 60 calls · out 49,509 · in 120 · cache_read 7,288,995 · cache_create 328,615
- **claude-sonnet-5**: 14 agent · 136 calls · out 58,822 · in 3,576 · cache_read 10,781,161 · cache_create 1,283,795
- **claude-haiku-4-5-20251001**: 22 agent · 56 calls · out 11,103 · in 492 · cache_read 1,948,717 · cache_create 908,935

### S4 round 4 — wf_700007b9-d8f (40 agent, 194,487 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5 | 41 | 39,216 | 82 | 6,031,081 | 757 |
| synthesize:report | claude-sonnet-5 | 7 | 19,214 | 14 | 594,440 | 229 |
| refute:pre-merge-check.sh | claude-sonnet-5 | 10 | 18,250 | 20 | 757,566 | 251 |
| refute:pre-merge-check.sh | claude-sonnet-5 | 28 | 13,801 | 987 | 2,798,552 | 272 |
| refute:pre-merge-check.sh | claude-sonnet-5 | 17 | 13,000 | 34 | 1,405,008 | 243 |
| review:conventions | claude-opus-5 | 29 | 12,433 | 311 | 3,077,416 | 401 |
| refute:config.yaml | claude-sonnet-5 | 21 | 10,157 | 121 | 1,880,745 | 215 |
| refute:pre-merge-check.sh | claude-sonnet-5 | 11 | 9,732 | 22 | 849,530 | 140 |
| refute:config.yaml | claude-sonnet-5 | 13 | 7,939 | 2,710 | 1,096,557 | 147 |
| refute:pre-merge-check.sh | claude-sonnet-5 | 15 | 6,923 | 4,864 | 1,196,725 | 172 |
| refute:check-stale-golden.sh | claude-sonnet-5 | 9 | 6,891 | 18 | 670,692 | 144 |
| refute:check-stale-real-repo.sh | claude-sonnet-5 | 6 | 5,844 | 12 | 409,677 | 80 |
| refute:check-stale-scoping.sh | claude-sonnet-5 | 8 | 5,811 | 16 | 645,459 | 103 |
| triage | claude-sonnet-5 | 2 | 4,798 | 4 | 75,801 | 53 |
| refute:check-stale-real-repo.sh | claude-sonnet-5 | 5 | 4,268 | 10 | 330,060 | 72 |
| baseline:diffBase | claude-sonnet-5 | 7 | 2,863 | 14 | 454,951 | 53 |
| refute:evidence-core.js | claude-sonnet-5 | 8 | 2,078 | 16 | 563,563 | 86 |
| capture:provenance | claude-sonnet-5 | 3 | 1,413 | 6 | 151,025 | 21 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 7 | 1,195 | 58 | 310,396 | 49 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 2 | 820 | 18 | 66,500 | 15 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 2 | 785 | 18 | 66,500 | 14 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 3 | 703 | 26 | 118,422 | 19 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 3 | 648 | 26 | 101,038 | 17 |
| machine:pnpm build && pnpm typecheck | claude-haiku-4-5-20251001 | 2 | 640 | 18 | 66,489 | 35 |
| machine:pnpm test | claude-haiku-4-5-20251001 | 2 | 623 | 18 | 66,477 | 16 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 2 | 587 | 18 | 49,200 | 13 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 2 | 542 | 18 | 66,502 | 11 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 2 | 505 | 18 | 66,502 | 10 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 2 | 344 | 18 | 66,498 | 13 |
| machine:bash scripts/acceptance/check-stale-real | claude-haiku-4-5-20251001 | 2 | 335 | 18 | 66,495 | 19 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 2 | 322 | 18 | 49,198 | 14 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 2 | 298 | 18 | 49,196 | 14 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 2 | 281 | 18 | 66,499 | 12 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 2 | 278 | 18 | 49,198 | 13 |
| machine:pnpm gen:abi && git diff --exit-code src | claude-haiku-4-5-20251001 | 3 | 248 | 26 | 118,532 | 17 |
| machine:bash scripts/acceptance/check-stale-gold | claude-haiku-4-5-20251001 | 2 | 244 | 18 | 66,493 | 15 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 2 | 233 | 18 | 66,499 | 14 |
| machine:pnpm lint:check | claude-haiku-4-5-20251001 | 2 | 221 | 18 | 66,481 | 11 |
| machine:bash scripts/acceptance/check-stale-scop | claude-haiku-4-5-20251001 | 2 | 2 | 18 | 49,196 | 14 |
| machine:pnpm verify:plugins | claude-haiku-4-5-20251001 | 2 | 2 | 18 | 66,481 | 14 |

- **claude-opus-5**: 2 agent · 70 calls · out 51,649 · in 393 · cache_read 9,108,497 · cache_create 326,559
- **claude-sonnet-5**: 16 agent · 170 calls · out 132,982 · in 8,868 · cache_read 13,880,351 · cache_create 1,393,559
- **claude-haiku-4-5-20251001**: 22 agent · 52 calls · out 9,856 · in 460 · cache_read 1,758,792 · cache_create 890,777

