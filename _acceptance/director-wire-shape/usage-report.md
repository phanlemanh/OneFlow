### S4 round 1 — wf_861dc2f6-f6a (56 agent, 80,534 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| triage | claude-sonnet-5 | 2 | 24,871 | 4 | 91,529 | 273 |
| review:measurement | claude-fable-5-1 | 11 | 10,141 | 322 | 1,130,060 | 308 |
| refute:workspace.schema.ts | claude-sonnet-5 | 17 | 5,816 | 34 | 1,538,027 | 153 |
| refute:migrate-old-db.test.ts | claude-sonnet-5 | 8 | 2,926 | 16 | 669,689 | 87 |
| refute:director-events.test.ts | claude-sonnet-5 | 14 | 2,546 | 28 | 1,255,524 | 110 |
| refute:route.ts | claude-sonnet-5 | 13 | 2,500 | 26 | 1,133,792 | 97 |
| refute:director-core.ts | claude-sonnet-5 | 16 | 2,386 | 32 | 1,526,555 | 121 |
| refute:schema-diff.mjs | claude-sonnet-5 | 12 | 2,346 | 24 | 1,032,455 | 82 |
| refute:route.ts | claude-sonnet-5 | 17 | 2,297 | 34 | 1,586,054 | 201 |
| judge:E14b:operational-feasibility | claude-sonnet-5 | 2 | 2,134 | 4 | 120,883 | 31 |
| refute:director-prompt.tsx | claude-sonnet-5 | 19 | 1,899 | 38 | 1,774,233 | 141 |
| refute:request-body.ts | claude-sonnet-5 | 15 | 1,755 | 30 | 1,459,331 | 133 |
| refute:director-events.server.ts | claude-sonnet-5 | 9 | 1,682 | 18 | 748,323 | 75 |
| refute:director-events.test.ts | claude-sonnet-5 | 8 | 1,655 | 16 | 658,384 | 61 |
| refute:dws-no-prompt-in-prod-log.sh | claude-sonnet-5 | 11 | 1,650 | 22 | 944,940 | 85 |
| review:conventions | claude-fable-5-1 | 12 | 1,246 | 354 | 1,139,396 | 221 |
| refute:director-prompt.tsx | claude-sonnet-5 | 20 | 1,233 | 40 | 1,873,179 | 152 |
| machine:bash scripts/fork/check-fork-identity.sh | claude-haiku-4-5-20251001 | 2 | 1,048 | 18 | 85,768 | 21 |
| refute:director-prompt.tsx | claude-sonnet-5 | 7 | 946 | 14 | 547,753 | 59 |
| refute:director-events.server.ts | claude-sonnet-5 | 11 | 900 | 22 | 942,169 | 68 |
| refute:director-prompt.tsx | claude-sonnet-5 | 13 | 853 | 26 | 1,183,704 | 103 |
| review:bugs | claude-fable-5-1 | 13 | 847 | 386 | 1,314,336 | 213 |
| refute:wire-shape.test.ts | claude-sonnet-5 | 11 | 846 | 22 | 961,553 | 86 |
| machine:bash scripts/acceptance/dws-no-prompt-in | claude-haiku-4-5-20251001 | 2 | 679 | 18 | 85,776 | 12 |
| refute:eval3-direct-3providers.mjs | claude-sonnet-5 | 8 | 637 | 16 | 660,812 | 71 |
| refute:route.ts | claude-sonnet-5 | 8 | 579 | 16 | 661,911 | 62 |
| machine:npx vitest run src/lib/director/request- | claude-haiku-4-5-20251001 | 2 | 576 | 18 | 85,783 | 15 |
| machine:pnpm build && pnpm typecheck | claude-haiku-4-5-20251001 | 2 | 526 | 18 | 85,764 | 43 |
| refute:request-body.ts | claude-sonnet-5 | 3 | 450 | 6 | 208,404 | 36 |
| refute:route.ts | claude-sonnet-5 | 10 | 447 | 20 | 870,390 | 69 |
| machine:bash scripts/acceptance/dws-old-client-u | claude-haiku-4-5-20251001 | 2 | 408 | 18 | 85,774 | 14 |
| machine:npx vitest run src/app/api/workspace/sav | claude-haiku-4-5-20251001 | 2 | 404 | 18 | 85,780 | 14 |
| machine:npx vitest run src/db/migrate-old-db.tes | claude-haiku-4-5-20251001 | 2 | 339 | 18 | 85,779 | 12 |
| judge:E14a:domain-correctness | claude-sonnet-5 | 3 | 309 | 6 | 177,014 | 48 |
| judge:E14b:domain-correctness | claude-sonnet-5 | 2 | 298 | 4 | 120,881 | 30 |
| refute:dws-barrel-export.sh | claude-sonnet-5 | 6 | 244 | 12 | 470,731 | 43 |
| judge:E14a:spec-alignment | claude-sonnet-5 | 5 | 20 | 10 | 435,795 | 49 |
| judge:E14a:operational-feasibility | claude-sonnet-5 | 4 | 15 | 8 | 335,008 | 82 |
| judge:E14b:spec-alignment | claude-sonnet-5 | 2 | 9 | 4 | 120,881 | 49 |
| synthesize:report | claude-sonnet-5 | 2 | 7 | 4 | 109,359 | 218 |
| capture:provenance | claude-sonnet-5 | 3 | 5 | 6 | 170,777 | 23 |
| machine:bash scripts/acceptance/dws-wire-returns | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 85,770 | 14 |
| machine:bash scripts/acceptance/dws-expect-count | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 85,768 | 11 |
| machine:npx vitest run src/app/api/director/rout | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 85,777 | 13 |
| machine:npx vitest run src/lib/director/events/d | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 85,778 | 14 |
| machine:pnpm verify:plugins | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 85,756 | 13 |
| machine:npx vitest run src/app/api/director/wire | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 85,786 | 15 |
| machine:pnpm lint:check | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 85,756 | 12 |
| machine:pnpm gen:abi && git diff --exit-code src | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 85,793 | 15 |
| machine:bash scripts/acceptance/dws-barrel-expor | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 85,769 | 13 |
| machine:bash scripts/acceptance/preflight-verify | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 85,766 | 19 |
| machine:pnpm test | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 85,752 | 26 |
| machine:npx vitest run src/lib/director/request- | claude-haiku-4-5-20251001 | 2 | 3 | 18 | 85,783 | 16 |
| machine:npx vitest run src/db/director-events-sc | claude-haiku-4-5-20251001 | 2 | 3 | 18 | 57,278 | 14 |
| machine:cd sdk && . ../scripts/lib/sdk-version.s | claude-haiku-4-5-20251001 | 2 | 2 | 18 | 85,839 | 21 |
| machine:node scripts/roadmap/check-plan-freeze.m | claude-haiku-4-5-20251001 | 2 | 2 | 18 | 85,771 | 14 |

- **claude-sonnet-5**: 31 agent · 281 calls · out 64,261 · in 562 · cache_read 24,390,040 · cache_create 2,176,868
- **claude-fable-5-1**: 3 agent · 36 calls · out 12,234 · in 1,062 · cache_read 3,583,792 · cache_create 360,440
- **claude-haiku-4-5-20251001**: 22 agent · 44 calls · out 4,039 · in 396 · cache_read 1,858,566 · cache_create 742,543

### S4 round 2 — wf_5e44cc9f-8c0 (53 agent, 67,304 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 2 | 31,970 | 4 | 110,410 | 316 |
| refute:dws-no-prompt-in-prod-log.sh | claude-sonnet-5 | 15 | 5,151 | 30 | 1,337,046 | 146 |
| refute:director-prompt.tsx | claude-sonnet-5 | 23 | 4,252 | 46 | 2,147,368 | 192 |
| judge:E14a:operational-feasibility | claude-sonnet-5 | 2 | 3,314 | 4 | 120,987 | 57 |
| judge:E14a:domain-correctness | claude-sonnet-5 | 4 | 2,900 | 8 | 273,350 | 74 |
| review:bugs | claude-fable-5-1 | 11 | 1,943 | 322 | 1,080,341 | 210 |
| refute:request-body.test.ts | claude-sonnet-5 | 17 | 1,633 | 34 | 1,549,817 | 125 |
| refute:director-prompt.tsx | claude-sonnet-5 | 17 | 1,502 | 34 | 1,587,945 | 137 |
| refute:workflow-title-menu.tsx | claude-sonnet-5 | 14 | 1,402 | 28 | 1,248,774 | 112 |
| refute:route.ts | claude-sonnet-5 | 21 | 1,148 | 42 | 2,048,490 | 210 |
| capture:provenance | claude-sonnet-5 | 2 | 1,001 | 4 | 82,641 | 26 |
| refute:workspace.schema.ts | claude-sonnet-5 | 13 | 982 | 26 | 1,123,025 | 94 |
| refute:route.ts | claude-sonnet-5 | 11 | 874 | 22 | 945,570 | 88 |
| refute:route.ts | claude-sonnet-5 | 12 | 815 | 24 | 1,060,134 | 101 |
| refute:director-core.ts | claude-sonnet-5 | 9 | 760 | 18 | 772,248 | 85 |
| refute:dws-barrel-export.sh | claude-sonnet-5 | 6 | 659 | 12 | 470,918 | 71 |
| refute:request-body.ts | claude-sonnet-5 | 16 | 570 | 32 | 1,486,595 | 120 |
| machine:pnpm build && pnpm typecheck | claude-haiku-4-5-20251001 | 2 | 549 | 18 | 85,764 | 50 |
| machine:node scripts/roadmap/check-plan-freeze.m | claude-haiku-4-5-20251001 | 2 | 537 | 18 | 85,771 | 16 |
| judge:E14a:spec-alignment | claude-sonnet-5 | 2 | 535 | 4 | 120,985 | 57 |
| refute:director-prompt.tsx | claude-sonnet-5 | 18 | 534 | 36 | 1,638,469 | 189 |
| review:conventions | claude-fable-5-1 | 13 | 466 | 386 | 1,306,138 | 197 |
| machine:bash scripts/acceptance/dws-no-prompt-in | claude-haiku-4-5-20251001 | 2 | 461 | 18 | 85,776 | 13 |
| machine:pnpm gen:abi && git diff --exit-code src | claude-haiku-4-5-20251001 | 2 | 432 | 18 | 85,793 | 16 |
| refute:dws-wire-returns-plan.sh | claude-sonnet-5 | 20 | 426 | 40 | 1,818,386 | 144 |
| machine:bash scripts/acceptance/dws-barrel-expor | claude-haiku-4-5-20251001 | 2 | 375 | 18 | 85,769 | 13 |
| machine:npx vitest run src/db/director-events-sc | claude-haiku-4-5-20251001 | 2 | 373 | 18 | 85,776 | 14 |
| machine:bash scripts/acceptance/dws-old-client-u | claude-haiku-4-5-20251001 | 2 | 362 | 18 | 85,774 | 14 |
| refute:director-prompt.tsx | claude-sonnet-5 | 7 | 359 | 14 | 582,282 | 61 |
| review:measurement | claude-fable-5-1 | 14 | 327 | 418 | 1,519,736 | 317 |
| refute:provenance.test.ts | claude-sonnet-5 | 15 | 304 | 30 | 1,345,957 | 99 |
| refute:schema-diff.mjs | claude-sonnet-5 | 7 | 157 | 14 | 573,006 | 61 |
| refute:wire-shape.test.ts | claude-sonnet-5 | 16 | 132 | 32 | 1,476,348 | 94 |
| refute:eval3-direct-3providers.mjs | claude-sonnet-5 | 4 | 9 | 8 | 298,691 | 37 |
| triage | claude-sonnet-5 | 2 | 7 | 4 | 91,935 | 192 |
| judge:E14b:domain-correctness | claude-sonnet-5 | 2 | 7 | 4 | 120,881 | 35 |
| judge:E14b:operational-feasibility | claude-sonnet-5 | 2 | 7 | 4 | 120,883 | 34 |
| machine:pnpm test | claude-haiku-4-5-20251001 | 2 | 6 | 18 | 85,752 | 29 |
| machine:npx vitest run src/app/api/director/wire | claude-haiku-4-5-20251001 | 2 | 6 | 18 | 85,786 | 15 |
| machine:npx vitest run src/app/api/workspace/sav | claude-haiku-4-5-20251001 | 2 | 6 | 18 | 85,780 | 13 |
| machine:bash scripts/acceptance/dws-wire-returns | claude-haiku-4-5-20251001 | 2 | 6 | 18 | 57,272 | 13 |
| machine:pnpm verify:plugins | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 85,756 | 12 |
| machine:npx vitest run src/app/api/director/rout | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 85,777 | 15 |
| machine:bash scripts/acceptance/dws-expect-count | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 85,768 | 12 |
| machine:npx vitest run src/lib/director/events/d | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 85,778 | 14 |
| machine:npx vitest run src/db/migrate-old-db.tes | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 85,779 | 15 |
| judge:E14b:spec-alignment | claude-sonnet-5 | 2 | 4 | 4 | 120,881 | 34 |
| machine:bash scripts/acceptance/preflight-verify | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 85,766 | 17 |
| machine:npx vitest run src/lib/director/request- | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 85,783 | 15 |
| machine:pnpm lint:check | claude-haiku-4-5-20251001 | 2 | 3 | 18 | 85,756 | 14 |
| machine:cd sdk && . ../scripts/lib/sdk-version.s | claude-haiku-4-5-20251001 | 2 | 2 | 18 | 85,839 | 22 |
| machine:bash scripts/fork/check-fork-identity.sh | claude-haiku-4-5-20251001 | 2 | 2 | 18 | 85,768 | 17 |
| machine:npx vitest run src/lib/director/request- | claude-haiku-4-5-20251001 | 2 | 2 | 18 | 85,783 | 16 |

- **claude-sonnet-5**: 28 agent · 281 calls · out 61,414 · in 562 · cache_read 24,674,022 · cache_create 2,032,008
- **claude-fable-5-1**: 3 agent · 38 calls · out 2,736 · in 1,126 · cache_read 3,906,215 · cache_create 338,691
- **claude-haiku-4-5-20251001**: 22 agent · 44 calls · out 3,154 · in 396 · cache_read 1,858,566 · cache_create 742,242

