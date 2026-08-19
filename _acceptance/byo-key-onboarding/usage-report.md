### S4 round 1 — wf_8afa2b0c-9fa (55 agent, 680,682 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| ui:E11 | claude-sonnet-5 | 214 | 103,037 | 428 | 39,076,746 | 2141 |
| ui:E2 | claude-sonnet-5 | 176 | 87,539 | 352 | 28,750,592 | 1769 |
| ui:E12 | claude-sonnet-5 | 184 | 65,857 | 368 | 29,158,160 | 1515 |
| synthesize:report | claude-sonnet-5 | 2 | 41,740 | 4 | 102,076 | 399 |
| ui:E10 | claude-sonnet-5 | 86 | 41,356 | 172 | 10,315,677 | 906 |
| ui:E4 | claude-sonnet-5 | 108 | 40,669 | 216 | 15,225,889 | 918 |
| ui:E21 | claude-sonnet-5 | 82 | 40,610 | 164 | 11,790,940 | 1138 |
| ui:E14 | claude-sonnet-5 | 66 | 36,852 | 132 | 8,746,144 | 717 |
| ui:E16 | claude-sonnet-5 | 89 | 30,607 | 178 | 9,857,334 | 623 |
| review:bugs | claude-fable-5 | 30 | 19,214 | 60 | 3,313,823 | 381 |
| review:measurement | claude-fable-5 | 18 | 15,509 | 36 | 1,695,519 | 284 |
| refute:key-verify.ts | claude-sonnet-5 | 26 | 14,444 | 52 | 2,268,158 | 242 |
| review:conventions | claude-fable-5 | 21 | 12,610 | 42 | 2,036,742 | 275 |
| triage | claude-sonnet-5 | 2 | 12,382 | 4 | 74,496 | 120 |
| refute:key-verify.ts | claude-sonnet-5 | 16 | 11,795 | 32 | 1,296,044 | 202 |
| baseline:diffBase | claude-sonnet-5 | 24 | 11,626 | 48 | 1,817,775 | 268 |
| refute:provisioning-events.test.ts | claude-sonnet-5 | 6 | 11,347 | 12 | 405,509 | 150 |
| refute:check-no-telemetry-sinks.sh | claude-sonnet-5 | 21 | 9,800 | 42 | 1,949,189 | 238 |
| ui:E6 | claude-sonnet-5 | 31 | 8,429 | 62 | 3,195,779 | 245 |
| refute:abi-node-shell.tsx | claude-sonnet-5 | 16 | 8,089 | 32 | 1,266,529 | 155 |
| refute:abi-node-shell.tsx | claude-sonnet-5 | 10 | 5,210 | 20 | 815,674 | 82 |
| refute:key-verify.ts | claude-sonnet-5 | 9 | 3,890 | 18 | 651,127 | 75 |
| refute:check-a11y-proto.sh | claude-sonnet-5 | 15 | 3,846 | 30 | 1,147,783 | 110 |
| refute:key-verify.ts | claude-sonnet-5 | 10 | 3,648 | 20 | 741,096 | 75 |
| refute:route.ts | claude-sonnet-5 | 6 | 3,534 | 12 | 408,721 | 53 |
| refute:task-failure-toaster.tsx | claude-sonnet-5 | 10 | 3,475 | 20 | 703,100 | 68 |
| refute:use-first-run-readiness.test.ts | claude-sonnet-5 | 5 | 3,470 | 10 | 319,677 | 48 |
| refute:install-missing.server.ts | claude-sonnet-5 | 7 | 2,880 | 14 | 484,494 | 55 |
| refute:failure-actions.test.ts | claude-sonnet-5 | 6 | 2,618 | 12 | 403,322 | 42 |
| refute:abi-node-shell.tsx | claude-sonnet-5 | 6 | 2,322 | 12 | 398,304 | 52 |
| refute:task-failure-toaster.tsx | claude-sonnet-5 | 8 | 1,791 | 16 | 567,130 | 49 |
| judge:E20:spec-alignment | claude-sonnet-5 | 5 | 1,672 | 10 | 329,849 | 28 |
| machine:bash scripts/acceptance/check-t3-untouch | claude-haiku-4-5-20251001 | 2 | 1,606 | 18 | 65,279 | 21 |
| refute:use-first-run-readiness.ts | claude-sonnet-5 | 8 | 1,510 | 16 | 549,068 | 60 |
| judge:E20:operational-feasibility | claude-sonnet-5 | 5 | 1,341 | 10 | 329,782 | 24 |
| refute:use-first-run-readiness.ts | claude-sonnet-5 | 8 | 1,086 | 16 | 544,411 | 56 |
| machine:pnpm gen:abi && git diff --exit-code src | claude-haiku-4-5-20251001 | 3 | 1,072 | 26 | 112,909 | 25 |
| capture:provenance | claude-sonnet-5 | 4 | 1,006 | 8 | 211,070 | 26 |
| judge:E20:domain-correctness | claude-sonnet-5 | 5 | 967 | 10 | 302,832 | 26 |
| machine:bash scripts/onboarding/check-no-restart | claude-haiku-4-5-20251001 | 3 | 854 | 26 | 112,856 | 18 |
| machine:pnpm build && pnpm typecheck | claude-haiku-4-5-20251001 | 2 | 766 | 18 | 65,214 | 55 |
| machine:pnpm test | claude-haiku-4-5-20251001 | 2 | 765 | 18 | 65,202 | 29 |
| machine:pnpm vitest run src/hooks/use-first-run- | claude-haiku-4-5-20251001 | 2 | 734 | 18 | 65,232 | 14 |
| machine:bash scripts/onboarding/check-a11y-proto | claude-haiku-4-5-20251001 | 2 | 718 | 18 | 65,224 | 68 |
| machine:BKO_E22=1 pnpm vitest run src/lib/onboar | claude-haiku-4-5-20251001 | 2 | 717 | 18 | 65,246 | 51 |
| machine:bash scripts/onboarding/check-one-action | claude-haiku-4-5-20251001 | 2 | 705 | 18 | 65,225 | 17 |
| machine:bash scripts/onboarding/check-example-ne | claude-haiku-4-5-20251001 | 2 | 685 | 18 | 65,224 | 13 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 670 | 18 | 65,250 | 43 |
| machine:pnpm vitest run src/lib/onboarding/key-v | claude-haiku-4-5-20251001 | 2 | 667 | 18 | 44,576 | 14 |
| machine:bash scripts/onboarding/check-no-telemet | claude-haiku-4-5-20251001 | 2 | 660 | 18 | 65,226 | 13 |
| machine:pnpm vitest run src/lib/onboarding/examp | claude-haiku-4-5-20251001 | 2 | 644 | 18 | 65,231 | 13 |
| machine:pnpm verify:plugins | claude-haiku-4-5-20251001 | 2 | 609 | 18 | 65,206 | 14 |
| machine:pnpm vitest run src/lib/onboarding/failu | claude-haiku-4-5-20251001 | 3 | 401 | 26 | 112,818 | 16 |
| machine:pnpm vitest run src/lib/plugin-executor/ | claude-haiku-4-5-20251001 | 2 | 336 | 18 | 65,230 | 23 |
| machine:pnpm lint:check | claude-haiku-4-5-20251001 | 2 | 295 | 18 | 65,206 | 12 |

- **claude-sonnet-5**: 34 agent · 1276 calls · out 620,445 · in 2,552 · cache_read 174,204,477 · cache_create 3,281,318
- **claude-fable-5**: 3 agent · 69 calls · out 47,333 · in 138 · cache_read 7,046,084 · cache_create 344,558
- **claude-haiku-4-5-20251001**: 18 agent · 39 calls · out 12,904 · in 348 · cache_read 1,296,354 · cache_create 514,962

### S4 round 2 — wf_37eee3da-0e0 (50 agent, 715,827 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| ui:E11 | claude-sonnet-5 | 165 | 86,442 | 330 | 28,252,999 | 1897 |
| ui:E12 | claude-sonnet-5 | 215 | 81,648 | 430 | 39,643,621 | 2007 |
| ui:E10 | claude-sonnet-5 | 111 | 81,429 | 222 | 17,634,077 | 1719 |
| ui:E14 | claude-sonnet-5 | 214 | 66,140 | 428 | 35,676,398 | 1550 |
| ui:E2 | claude-sonnet-5 | 92 | 53,700 | 184 | 16,427,359 | 1044 |
| ui:E4 | claude-sonnet-5 | 122 | 48,219 | 244 | 17,557,830 | 1141 |
| synthesize:report | claude-sonnet-5 | 2 | 38,306 | 4 | 107,060 | 365 |
| ui:E21 | claude-sonnet-5 | 72 | 31,484 | 144 | 10,238,745 | 848 |
| ui:E16 | claude-sonnet-5 | 90 | 28,954 | 180 | 9,724,111 | 738 |
| review:bugs | claude-fable-5 | 43 | 25,744 | 86 | 5,259,808 | 519 |
| ui:E6 | claude-sonnet-5 | 56 | 22,347 | 112 | 7,597,740 | 597 |
| review:measurement | claude-fable-5 | 26 | 20,516 | 52 | 2,657,235 | 362 |
| triage | claude-sonnet-5 | 2 | 13,681 | 4 | 73,530 | 149 |
| review:conventions | claude-fable-5 | 20 | 13,489 | 40 | 1,851,655 | 250 |
| refute:provisioning-events.ts | claude-sonnet-5 | 23 | 12,010 | 46 | 1,857,081 | 205 |
| refute:beacon.ts | claude-sonnet-5 | 11 | 9,414 | 22 | 814,550 | 137 |
| refute:key-verify.ts | claude-sonnet-5 | 8 | 8,987 | 16 | 570,876 | 126 |
| refute:use-first-run-readiness.test.ts | claude-sonnet-5 | 7 | 7,153 | 14 | 477,435 | 99 |
| refute:evals.yaml | claude-sonnet-5 | 10 | 6,203 | 20 | 720,226 | 95 |
| refute:evals.yaml | claude-sonnet-5 | 9 | 4,723 | 18 | 649,097 | 81 |
| refute:abi-node-shell.tsx | claude-sonnet-5 | 9 | 4,577 | 18 | 639,500 | 75 |
| judge:E20:operational-feasibility | claude-sonnet-5 | 7 | 4,528 | 14 | 511,254 | 67 |
| judge:E20:spec-alignment | claude-sonnet-5 | 6 | 4,413 | 12 | 429,529 | 60 |
| refute:evals.yaml | claude-sonnet-5 | 13 | 4,371 | 26 | 980,939 | 86 |
| refute:key-verify.ts | claude-sonnet-5 | 8 | 3,765 | 16 | 558,907 | 67 |
| refute:seed-example-asset.server.ts | claude-sonnet-5 | 10 | 3,617 | 20 | 723,452 | 71 |
| judge:E20:domain-correctness | claude-sonnet-5 | 5 | 3,013 | 10 | 315,519 | 42 |
| refute:use-first-run-readiness.ts | claude-sonnet-5 | 7 | 2,706 | 14 | 467,089 | 53 |
| refute:failure-actions.test.ts | claude-sonnet-5 | 7 | 2,689 | 14 | 479,462 | 66 |
| refute:use-first-run-readiness.ts | claude-sonnet-5 | 9 | 2,677 | 18 | 637,604 | 59 |
| refute:key-verify.ts | claude-sonnet-5 | 5 | 2,045 | 10 | 322,005 | 36 |
| refute:first-run-strip-container.tsx | claude-sonnet-5 | 8 | 1,999 | 16 | 559,741 | 39 |
| machine:bash scripts/onboarding/check-a11y-proto | claude-haiku-4-5-20251001 | 7 | 1,719 | 58 | 307,202 | 177 |
| refute:seed-example-asset.server.ts | claude-sonnet-5 | 6 | 1,345 | 12 | 387,232 | 40 |
| capture:provenance | claude-sonnet-5 | 3 | 1,343 | 6 | 139,042 | 23 |
| machine:pnpm test | claude-haiku-4-5-20251001 | 2 | 1,201 | 18 | 65,202 | 32 |
| refute:install-missing.server.ts | claude-sonnet-5 | 4 | 1,085 | 8 | 239,995 | 28 |
| machine:pnpm gen:abi && git diff --exit-code src | claude-haiku-4-5-20251001 | 2 | 816 | 18 | 65,243 | 15 |
| machine:bash scripts/acceptance/check-t3-untouch | claude-haiku-4-5-20251001 | 2 | 798 | 18 | 65,291 | 13 |
| machine:bash scripts/onboarding/check-example-ne | claude-haiku-4-5-20251001 | 2 | 731 | 18 | 44,568 | 14 |
| machine:pnpm vitest run src/hooks/use-first-run- | claude-haiku-4-5-20251001 | 2 | 726 | 18 | 65,232 | 14 |
| machine:pnpm vitest run src/lib/plugin-executor/ | claude-haiku-4-5-20251001 | 2 | 696 | 18 | 65,230 | 27 |
| machine:BKO_E22=1 pnpm vitest run src/lib/onboar | claude-haiku-4-5-20251001 | 2 | 676 | 18 | 65,246 | 53 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 673 | 18 | 65,250 | 26 |
| machine:bash scripts/onboarding/check-one-action | claude-haiku-4-5-20251001 | 2 | 669 | 18 | 65,225 | 18 |
| machine:bash scripts/onboarding/check-no-telemet | claude-haiku-4-5-20251001 | 2 | 565 | 18 | 65,226 | 11 |
| machine:pnpm lint:check | claude-haiku-4-5-20251001 | 2 | 531 | 18 | 65,206 | 12 |
| machine:pnpm vitest run src/lib/onboarding/key-v | claude-haiku-4-5-20251001 | 2 | 506 | 18 | 65,232 | 12 |
| machine:pnpm verify:plugins | claude-haiku-4-5-20251001 | 2 | 470 | 18 | 65,206 | 12 |
| machine:pnpm build && pnpm typecheck | claude-haiku-4-5-20251001 | 2 | 288 | 18 | 65,214 | 42 |

- **claude-sonnet-5**: 32 agent · 1316 calls · out 645,013 · in 2,632 · cache_read 195,414,005 · cache_create 3,278,814
- **claude-fable-5**: 3 agent · 89 calls · out 59,749 · in 178 · cache_read 9,768,698 · cache_create 398,480
- **claude-haiku-4-5-20251001**: 15 agent · 35 calls · out 11,065 · in 310 · cache_read 1,199,773 · cache_create 431,081

### S4 round 3 — wf_a4fa23a4-41a (51 agent, 518,014 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| ui:E10 | claude-sonnet-5 | 120 | 52,591 | 240 | 21,835,994 | 1341 |
| ui:E12 | claude-sonnet-5 | 171 | 52,375 | 342 | 25,744,731 | 1194 |
| ui:E14 | claude-sonnet-5 | 213 | 49,624 | 426 | 33,178,752 | 1429 |
| synthesize:report | claude-sonnet-5 | 2 | 48,508 | 4 | 104,226 | 471 |
| ui:E4 | claude-sonnet-5 | 71 | 37,542 | 142 | 10,093,940 | 725 |
| ui:E2 | claude-sonnet-5 | 84 | 22,331 | 168 | 10,988,413 | 773 |
| review:bugs | claude-opus-5 | 36 | 21,877 | 72 | 4,532,843 | 423 |
| ui:E21 | claude-sonnet-5 | 48 | 21,835 | 96 | 5,627,077 | 461 |
| triage | claude-sonnet-5 | 2 | 18,981 | 4 | 79,018 | 206 |
| review:measurement | claude-opus-5 | 34 | 18,463 | 68 | 3,695,146 | 397 |
| ui:E6 | claude-sonnet-5 | 41 | 12,375 | 82 | 4,535,768 | 316 |
| review:conventions | claude-opus-5 | 16 | 11,158 | 32 | 1,833,178 | 210 |
| refute:generic.ts | claude-sonnet-5 | 13 | 10,257 | 26 | 1,005,737 | 172 |
| refute:example-run.test.ts | claude-sonnet-5 | 7 | 9,475 | 14 | 501,779 | 132 |
| refute:abi-node-shell.tsx | claude-sonnet-5 | 31 | 9,446 | 62 | 2,593,228 | 208 |
| refute:task-failure-toaster.tsx | claude-sonnet-5 | 27 | 9,094 | 54 | 2,379,328 | 205 |
| refute:evals.yaml | claude-sonnet-5 | 10 | 8,508 | 20 | 819,236 | 187 |
| refute:first-run-strip-container.tsx | claude-sonnet-5 | 14 | 7,894 | 28 | 1,113,580 | 116 |
| refute:beacon.ts | claude-sonnet-5 | 9 | 7,358 | 18 | 623,370 | 111 |
| refute:page.tsx | claude-sonnet-5 | 8 | 6,651 | 16 | 585,530 | 91 |
| judge:E20:domain-correctness | claude-sonnet-5 | 4 | 5,629 | 8 | 231,387 | 82 |
| refute:abi-node-shell.tsx | claude-sonnet-5 | 8 | 5,538 | 16 | 543,805 | 90 |
| refute:abi-node-shell.tsx | claude-sonnet-5 | 9 | 5,454 | 18 | 655,621 | 93 |
| refute:use-first-run-readiness.test.ts | claude-sonnet-5 | 4 | 5,310 | 8 | 250,116 | 69 |
| refute:abi-node-shell.tsx | claude-sonnet-5 | 10 | 4,969 | 20 | 757,720 | 85 |
| refute:failure-actions.test.ts | claude-sonnet-5 | 10 | 4,646 | 20 | 741,981 | 80 |
| judge:E20:operational-feasibility | claude-sonnet-5 | 3 | 4,512 | 6 | 173,642 | 71 |
| refute:first-run-strip-container.tsx | claude-sonnet-5 | 12 | 4,329 | 24 | 921,117 | 96 |
| judge:E20:spec-alignment | claude-sonnet-5 | 5 | 4,293 | 10 | 349,231 | 73 |
| refute:key-verify.test.ts | claude-sonnet-5 | 8 | 4,173 | 16 | 578,700 | 75 |
| refute:use-task.ts | claude-sonnet-5 | 15 | 4,011 | 30 | 1,146,117 | 83 |
| refute:check-t3-untouched.sh | claude-sonnet-5 | 8 | 3,796 | 16 | 540,425 | 62 |
| refute:check-a11y-proto.sh | claude-sonnet-5 | 13 | 2,861 | 26 | 970,953 | 89 |
| machine:bash scripts/onboarding/check-a11y-proto | claude-haiku-4-5-20251001 | 12 | 2,544 | 98 | 559,717 | 231 |
| refute:use-first-run-readiness.ts | claude-sonnet-5 | 8 | 2,493 | 16 | 547,908 | 56 |
| refute:seed-example-asset.server.ts | claude-sonnet-5 | 7 | 2,204 | 14 | 473,246 | 41 |
| refute:evals.yaml | claude-sonnet-5 | 8 | 1,981 | 16 | 559,711 | 58 |
| refute:seed-example-asset.server.ts | claude-sonnet-5 | 5 | 1,940 | 10 | 322,239 | 34 |
| refute:seed-example-asset.server.ts | claude-sonnet-5 | 4 | 1,272 | 8 | 240,127 | 29 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 3 | 1,161 | 26 | 113,325 | 47 |
| machine:pnpm test | claude-haiku-4-5-20251001 | 3 | 1,112 | 26 | 112,768 | 47 |
| machine:bash scripts/onboarding/check-no-telemet | claude-haiku-4-5-20251001 | 5 | 1,072 | 42 | 209,022 | 51 |
| machine:pnpm gen:abi && git diff --exit-code src | claude-haiku-4-5-20251001 | 4 | 1,068 | 34 | 160,769 | 36 |
| machine:BKO_E22=1 pnpm vitest run src/lib/onboar | claude-haiku-4-5-20251001 | 4 | 886 | 34 | 160,765 | 75 |
| machine:pnpm vitest run src/lib/onboarding/key-v | claude-haiku-4-5-20251001 | 3 | 767 | 26 | 112,890 | 33 |
| machine:pnpm vitest run src/lib/plugin-executor/ | claude-haiku-4-5-20251001 | 4 | 758 | 34 | 160,822 | 54 |
| machine:pnpm build && pnpm typecheck | claude-haiku-4-5-20251001 | 3 | 660 | 26 | 112,861 | 33 |
| machine:pnpm lint:check | claude-haiku-4-5-20251001 | 2 | 570 | 18 | 44,550 | 13 |
| machine:pnpm vitest run src/lib/onboarding/failu | claude-haiku-4-5-20251001 | 2 | 565 | 18 | 65,231 | 13 |
| machine:pnpm verify:plugins | claude-haiku-4-5-20251001 | 2 | 565 | 18 | 65,206 | 15 |
| capture:provenance | claude-sonnet-5 | 2 | 532 | 4 | 67,014 | 18 |

- **claude-sonnet-5**: 36 agent · 1014 calls · out 454,788 · in 2,028 · cache_read 131,880,767 · cache_create 3,135,262
- **claude-opus-5**: 3 agent · 86 calls · out 51,498 · in 172 · cache_read 10,061,167 · cache_create 427,863
- **claude-haiku-4-5-20251001**: 12 agent · 47 calls · out 11,728 · in 400 · cache_read 1,877,926 · cache_create 356,037

