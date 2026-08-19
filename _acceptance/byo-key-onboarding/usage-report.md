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

