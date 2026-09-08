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

### S4 round 3 — wf_a9f37fbd-b93 (55 agent, 66,628 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| triage | claude-sonnet-5 | 2 | 20,511 | 4 | 94,151 | 230 |
| refute:oneof-vs-anyof.mjs | claude-sonnet-5 | 14 | 4,486 | 28 | 1,358,117 | 237 |
| judge:E14b:spec-alignment | claude-sonnet-5 | 2 | 4,143 | 4 | 122,187 | 55 |
| review:measurement | claude-opus-5 | 23 | 3,240 | 46 | 2,782,816 | 398 |
| refute:eval3-direct-3providers.mjs | claude-sonnet-5 | 8 | 2,941 | 16 | 733,898 | 96 |
| refute:dws-expect-count.sh | claude-sonnet-5 | 14 | 2,883 | 28 | 1,255,233 | 189 |
| judge:E14b:domain-correctness | claude-sonnet-5 | 2 | 2,569 | 4 | 122,187 | 33 |
| refute:dws-no-prompt-in-prod-log.sh | claude-sonnet-5 | 14 | 2,292 | 28 | 1,263,953 | 136 |
| refute:route.ts | claude-sonnet-5 | 13 | 2,265 | 26 | 1,213,418 | 145 |
| refute:provenance.test.ts | claude-sonnet-5 | 17 | 1,788 | 34 | 1,599,665 | 191 |
| refute:route.ts | claude-sonnet-5 | 17 | 1,728 | 34 | 1,680,580 | 163 |
| refute:director-prompt.tsx | claude-sonnet-5 | 19 | 1,717 | 38 | 1,846,783 | 166 |
| review:conventions | claude-opus-5 | 32 | 1,689 | 64 | 3,926,142 | 354 |
| refute:director-prompt.tsx | claude-sonnet-5 | 13 | 1,491 | 26 | 1,219,445 | 99 |
| review:bugs | claude-opus-5 | 21 | 1,396 | 42 | 2,488,671 | 274 |
| refute:dws-wire-returns-plan.sh | claude-sonnet-5 | 14 | 1,327 | 28 | 1,269,475 | 135 |
| refute:dws-barrel-export.sh | claude-sonnet-5 | 15 | 1,101 | 30 | 1,354,157 | 126 |
| refute:wire-shape.test.ts | claude-sonnet-5 | 20 | 848 | 40 | 1,960,381 | 150 |
| machine:pnpm gen:abi && git diff --exit-code src | claude-haiku-4-5-20251001 | 2 | 788 | 18 | 86,784 | 14 |
| refute:wire-shape.test.ts | claude-sonnet-5 | 15 | 783 | 30 | 1,408,779 | 172 |
| refute:dws-wire-returns-plan.sh | claude-sonnet-5 | 8 | 761 | 16 | 680,143 | 78 |
| refute:director-prompt.tsx | claude-sonnet-5 | 16 | 677 | 32 | 1,507,129 | 127 |
| refute:request-body.test.ts | claude-sonnet-5 | 16 | 665 | 32 | 1,471,522 | 125 |
| refute:dws-wire-returns-plan.sh | claude-sonnet-5 | 11 | 518 | 22 | 1,016,033 | 111 |
| machine:npx vitest run src/lib/director/request- | claude-haiku-4-5-20251001 | 2 | 496 | 18 | 86,774 | 16 |
| machine:npx vitest run src/db/migrate-old-db.tes | claude-haiku-4-5-20251001 | 2 | 416 | 18 | 86,770 | 14 |
| machine:npx vitest run src/lib/director/request- | claude-haiku-4-5-20251001 | 2 | 416 | 18 | 86,774 | 14 |
| machine:pnpm test | claude-haiku-4-5-20251001 | 2 | 394 | 18 | 86,743 | 26 |
| machine:bash scripts/acceptance/dws-wire-returns | claude-haiku-4-5-20251001 | 2 | 365 | 18 | 58,269 | 13 |
| machine:npx vitest run src/app/api/director/rout | claude-haiku-4-5-20251001 | 2 | 352 | 18 | 86,768 | 14 |
| judge:E14a:operational-feasibility | claude-sonnet-5 | 4 | 312 | 8 | 303,389 | 46 |
| refute:route.ts | claude-sonnet-5 | 11 | 298 | 22 | 996,592 | 144 |
| refute:director-prompt.tsx | claude-sonnet-5 | 18 | 270 | 36 | 1,737,087 | 233 |
| judge:E14a:spec-alignment | claude-sonnet-5 | 3 | 231 | 6 | 217,071 | 69 |
| machine:bash scripts/acceptance/dws-no-prompt-in | claude-haiku-4-5-20251001 | 2 | 212 | 18 | 86,767 | 11 |
| refute:schema-diff.mjs | claude-sonnet-5 | 9 | 136 | 18 | 769,202 | 112 |
| refute:route.ts | claude-sonnet-5 | 5 | 23 | 10 | 400,145 | 40 |
| synthesize:report | claude-sonnet-5 | 5 | 20 | 10 | 502,152 | 339 |
| judge:E14b:operational-feasibility | claude-sonnet-5 | 2 | 7 | 4 | 122,189 | 46 |
| judge:E14a:domain-correctness | claude-sonnet-5 | 2 | 7 | 4 | 84,843 | 54 |
| capture:provenance | claude-sonnet-5 | 2 | 7 | 4 | 83,951 | 18 |
| machine:bash scripts/acceptance/dws-expect-count | claude-haiku-4-5-20251001 | 2 | 6 | 18 | 86,759 | 14 |
| machine:npx vitest run src/lib/director/events/d | claude-haiku-4-5-20251001 | 2 | 6 | 18 | 86,769 | 12 |
| machine:bash scripts/acceptance/dws-barrel-expor | claude-haiku-4-5-20251001 | 2 | 6 | 18 | 86,760 | 13 |
| machine:npx vitest run src/db/director-events-sc | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 86,767 | 13 |
| machine:bash scripts/acceptance/dws-old-client-u | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 86,765 | 12 |
| machine:npx vitest run src/app/api/director/wire | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 86,777 | 13 |
| machine:node scripts/roadmap/check-plan-freeze.m | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 86,762 | 13 |
| machine:bash scripts/acceptance/preflight-verify | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 86,757 | 17 |
| machine:npx vitest run src/app/api/workspace/sav | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 86,771 | 14 |
| machine:pnpm verify:plugins | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 86,747 | 12 |
| machine:bash scripts/fork/check-fork-identity.sh | claude-haiku-4-5-20251001 | 2 | 2 | 18 | 86,759 | 14 |
| machine:pnpm build && pnpm typecheck | claude-haiku-4-5-20251001 | 2 | 2 | 18 | 86,755 | 58 |
| machine:cd sdk && . ../scripts/lib/sdk-version.s | claude-haiku-4-5-20251001 | 2 | 2 | 18 | 86,830 | 24 |
| machine:pnpm lint:check | claude-haiku-4-5-20251001 | 2 | 2 | 18 | 86,747 | 11 |

- **claude-sonnet-5**: 30 agent · 311 calls · out 56,805 · in 622 · cache_read 28,393,857 · cache_create 2,295,064
- **claude-opus-5**: 3 agent · 76 calls · out 6,325 · in 152 · cache_read 9,197,629 · cache_create 388,807
- **claude-haiku-4-5-20251001**: 22 agent · 44 calls · out 3,498 · in 396 · cache_read 1,880,374 · cache_create 763,734

### S4 round 4 — wf_042bdde3-ab7 (43 agent, 60,607 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| triage | claude-sonnet-5 | 2 | 21,313 | 4 | 94,205 | 244 |
| synthesize:report | claude-sonnet-5 | 4 | 7,567 | 8 | 363,408 | 359 |
| judge:E14b:domain-correctness | claude-sonnet-5 | 2 | 3,048 | 4 | 122,097 | 42 |
| review:bugs | claude-opus-5 | 33 | 2,998 | 66 | 4,110,491 | 414 |
| review:conventions | claude-opus-5 | 31 | 2,752 | 62 | 3,597,509 | 348 |
| refute:route.ts | claude-sonnet-5 | 13 | 2,440 | 26 | 1,229,235 | 141 |
| refute:route.ts | claude-sonnet-5 | 18 | 2,346 | 36 | 1,747,789 | 165 |
| refute:provenance.test.ts | claude-sonnet-5 | 9 | 2,075 | 18 | 779,976 | 68 |
| refute:dws-wire-returns-plan.sh | claude-sonnet-5 | 10 | 1,799 | 20 | 912,024 | 93 |
| refute:route.ts | claude-sonnet-5 | 22 | 1,772 | 44 | 2,072,072 | 185 |
| refute:config.yaml | claude-sonnet-5 | 22 | 1,673 | 44 | 2,427,787 | 145 |
| refute:director-core.ts | claude-sonnet-5 | 15 | 1,431 | 30 | 1,374,622 | 110 |
| refute:director-events.test.ts | claude-sonnet-5 | 5 | 1,215 | 10 | 395,795 | 60 |
| refute:director-prompt.tsx | claude-sonnet-5 | 16 | 1,155 | 32 | 1,601,121 | 176 |
| refute:eval3-direct-3providers.mjs | claude-sonnet-5 | 8 | 1,092 | 16 | 705,076 | 87 |
| judge:E14a:spec-alignment | claude-sonnet-5 | 2 | 998 | 4 | 122,102 | 42 |
| review:bugs | claude-opus-5 | 18 | 817 | 36 | 1,929,066 | 183 |
| capture:provenance | claude-sonnet-5 | 2 | 739 | 4 | 83,951 | 21 |
| refute:dws-expect-count.sh | claude-sonnet-5 | 10 | 618 | 20 | 860,277 | 75 |
| machine:bash scripts/fork/check-fork-identity.sh | claude-haiku-4-5-20251001 | 2 | 515 | 18 | 86,759 | 13 |
| refute:check-eval-filters-teeth.sh | claude-sonnet-5 | 11 | 493 | 22 | 990,181 | 92 |
| machine:pnpm test | claude-haiku-4-5-20251001 | 2 | 404 | 18 | 86,743 | 31 |
| review:measurement | claude-opus-5 | 18 | 337 | 36 | 1,811,756 | 185 |
| refute:request-body.ts | claude-sonnet-5 | 13 | 330 | 26 | 1,172,989 | 99 |
| refute:director-prompt.tsx | claude-sonnet-5 | 9 | 218 | 18 | 772,057 | 68 |
| machine:pnpm verify:plugins | claude-haiku-4-5-20251001 | 2 | 180 | 18 | 86,747 | 11 |
| review:conventions | claude-opus-5 | 13 | 99 | 26 | 1,226,835 | 185 |
| review:measurement | claude-opus-5 | 23 | 77 | 46 | 2,869,657 | 401 |
| refute:config.yaml | claude-sonnet-5 | 11 | 58 | 22 | 960,651 | 83 |
| judge:E14b:operational-feasibility | claude-sonnet-5 | 2 | 8 | 4 | 122,099 | 35 |
| judge:E14a:domain-correctness | claude-sonnet-5 | 2 | 7 | 4 | 122,102 | 48 |
| judge:E14b:spec-alignment | claude-sonnet-5 | 2 | 7 | 4 | 122,097 | 41 |
| machine:pnpm gen:abi && git diff --exit-code src | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 86,784 | 16 |
| judge:E14a:operational-feasibility | claude-sonnet-5 | 2 | 5 | 4 | 84,656 | 41 |
| machine:pnpm lint:check | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 86,747 | 13 |
| machine:bash scripts/acceptance/preflight-verify | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 58,265 | 15 |
| machine:pnpm build && pnpm typecheck | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 86,755 | 67 |
| machine:node scripts/roadmap/check-plan-freeze.m | claude-haiku-4-5-20251001 | 2 | 2 | 18 | 86,762 | 12 |
| machine:cd sdk && . ../scripts/lib/sdk-version.s | claude-haiku-4-5-20251001 | 2 | 2 | 18 | 86,830 | 26 |
| review:measurement | <synthetic> | 1 | 0 | 0 | 0 | 185 |
| capture:provenance | <synthetic> | 1 | 0 | 0 | 0 | 0 |
| review:bugs | <synthetic> | 1 | 0 | 0 | 0 | 183 |
| review:conventions | <synthetic> | 1 | 0 | 0 | 0 | 185 |

- **claude-sonnet-5**: 24 agent · 212 calls · out 52,407 · in 424 · cache_read 19,238,369 · cache_create 1,880,826
- **claude-opus-5**: 6 agent · 136 calls · out 7,080 · in 272 · cache_read 15,545,314 · cache_create 711,170
- **claude-haiku-4-5-20251001**: 9 agent · 18 calls · out 1,120 · in 162 · cache_read 752,392 · cache_create 333,986
- **<synthetic>**: 4 agent · 4 calls · out 0 · in 0 · cache_read 0 · cache_create 0

