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

