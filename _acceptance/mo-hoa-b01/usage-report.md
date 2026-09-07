### S4 round 1 — wf_09aa10f1-d63 (36 agent, 66,276 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 2 | 17,071 | 4 | 111,348 | 180 |
| triage | claude-sonnet-5 | 2 | 14,515 | 4 | 97,204 | 169 |
| review:conventions | claude-fable-5-1 | 25 | 6,804 | 770 | 3,486,836 | 557 |
| refute:check-prototype-lane.sh | claude-sonnet-5 | 13 | 4,959 | 26 | 1,337,392 | 135 |
| refute:ci.yml | claude-sonnet-5 | 24 | 4,443 | 48 | 2,744,669 | 260 |
| review:bugs | claude-fable-5-1 | 13 | 3,004 | 386 | 1,441,033 | 280 |
| review:measurement | claude-fable-5-1 | 19 | 2,854 | 578 | 2,404,600 | 538 |
| refute:check-fork-identity-teeth.sh | claude-sonnet-5 | 14 | 2,792 | 28 | 1,506,944 | 137 |
| refute:evals.yaml | claude-sonnet-5 | 11 | 1,635 | 22 | 1,119,871 | 198 |
| refute:README.md | claude-sonnet-5 | 11 | 1,527 | 22 | 1,037,261 | 91 |
| machine:pnpm gen:abi && git diff --exit-code src | claude-haiku-4-5-20251001 | 2 | 913 | 18 | 94,294 | 15 |
| refute:check-fork-identity-teeth.sh | claude-sonnet-5 | 16 | 756 | 32 | 1,697,983 | 156 |
| refute:check-fork-identity-teeth.sh | claude-sonnet-5 | 7 | 749 | 14 | 615,138 | 70 |
| refute:check-suite-key.sh | claude-sonnet-5 | 12 | 566 | 24 | 1,171,041 | 155 |
| machine:bash scripts/fork/check-fork-identity-te | claude-haiku-4-5-20251001 | 2 | 526 | 18 | 94,345 | 19 |
| machine:bash scripts/fork/check-fork-identity-te | claude-haiku-4-5-20251001 | 2 | 512 | 18 | 94,336 | 23 |
| refute:check-fork-identity-teeth.sh | claude-sonnet-5 | 10 | 490 | 20 | 989,079 | 245 |
| refute:CODE_OF_CONDUCT.md | claude-sonnet-5 | 12 | 477 | 24 | 1,211,105 | 128 |
| machine:bash scripts/fork/check-fork-identity-te | claude-haiku-4-5-20251001 | 2 | 450 | 18 | 65,808 | 16 |
| machine:bash scripts/fork/check-fork-identity-te | claude-haiku-4-5-20251001 | 2 | 432 | 18 | 94,360 | 19 |
| capture:provenance | claude-sonnet-5 | 5 | 368 | 10 | 427,234 | 40 |
| machine:pnpm verify:plugins | claude-haiku-4-5-20251001 | 2 | 364 | 18 | 94,257 | 12 |
| machine:cd sdk && . ../scripts/lib/sdk-version.s | claude-haiku-4-5-20251001 | 2 | 11 | 18 | 94,338 | 23 |
| machine:bash scripts/fork/check-fork-identity-te | claude-haiku-4-5-20251001 | 2 | 10 | 18 | 94,372 | 26 |
| machine:bash scripts/fork/check-fork-identity-te | claude-haiku-4-5-20251001 | 2 | 10 | 18 | 94,322 | 16 |
| machine:bash scripts/ci/check-gate-guards-job.sh | claude-haiku-4-5-20251001 | 2 | 9 | 18 | 94,354 | 81 |
| machine:bash scripts/fork/check-fork-identity-te | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 94,321 | 18 |
| machine:bash scripts/fork/check-prototype-lane.s | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 94,299 | 22 |
| machine:pnpm test | claude-haiku-4-5-20251001 | 2 | 3 | 18 | 131,518 | 154 |
| machine:pnpm lint:check | claude-haiku-4-5-20251001 | 2 | 3 | 18 | 94,257 | 11 |
| machine:pnpm build && pnpm typecheck | claude-haiku-4-5-20251001 | 2 | 3 | 18 | 94,265 | 44 |
| machine:bash scripts/fork/check-fork-identity.sh | claude-haiku-4-5-20251001 | 2 | 3 | 18 | 94,269 | 23 |
| machine:bash scripts/fork/check-fork-identity-te | claude-haiku-4-5-20251001 | 2 | 2 | 18 | 94,271 | 50 |
| machine:bash scripts/acceptance/preflight-verify | claude-haiku-4-5-20251001 | 2 | 2 | 18 | 94,267 | 17 |
| machine:bash scripts/plugins/check-live-docs-man | claude-haiku-4-5-20251001 | 2 | 2 | 18 | 94,432 | 18 |
| machine:node scripts/roadmap/check-plan-freeze.m | claude-haiku-4-5-20251001 | 2 | 2 | 18 | 94,272 | 13 |

- **claude-sonnet-5**: 13 agent · 139 calls · out 50,348 · in 278 · cache_read 14,066,269 · cache_create 1,201,335
- **claude-fable-5-1**: 3 agent · 57 calls · out 12,662 · in 1,734 · cache_read 7,332,469 · cache_create 441,295
- **claude-haiku-4-5-20251001**: 20 agent · 40 calls · out 3,266 · in 360 · cache_read 1,894,957 · cache_create 845,866

### S4 round 2 — wf_a5e87052-a9c (35 agent, 43,223 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| triage | claude-sonnet-5 | 3 | 13,428 | 6 | 204,550 | 240 |
| refute:evals.yaml | claude-sonnet-5 | 22 | 5,429 | 44 | 2,499,859 | 278 |
| review:conventions | claude-fable-5-1 | 15 | 5,354 | 450 | 1,712,833 | 274 |
| refute:check-fork-identity-teeth.sh | claude-sonnet-5 | 18 | 4,920 | 36 | 2,078,191 | 273 |
| refute:docker-compose.yml | claude-sonnet-5 | 9 | 4,069 | 18 | 907,696 | 267 |
| refute:README.md | claude-sonnet-5 | 20 | 3,424 | 40 | 2,024,030 | 225 |
| refute:check-fork-identity-teeth.sh | claude-sonnet-5 | 13 | 2,698 | 26 | 1,292,819 | 142 |
| refute:check-fork-identity-teeth.sh | claude-sonnet-5 | 26 | 1,570 | 52 | 2,840,145 | 247 |
| refute:check-fork-identity-teeth.sh | claude-sonnet-5 | 6 | 556 | 12 | 550,072 | 61 |
| machine:bash scripts/acceptance/preflight-verify | claude-haiku-4-5-20251001 | 2 | 519 | 18 | 94,267 | 17 |
| refute:check-fork-identity-teeth.sh | claude-sonnet-5 | 17 | 358 | 34 | 1,755,171 | 302 |
| machine:bash scripts/fork/check-fork-identity-te | claude-haiku-4-5-20251001 | 2 | 314 | 18 | 94,336 | 21 |
| refute:check-suite-key.sh | claude-sonnet-5 | 9 | 297 | 18 | 838,606 | 92 |
| review:measurement | claude-fable-5-1 | 11 | 66 | 322 | 1,308,580 | 395 |
| review:bugs | claude-fable-5-1 | 9 | 65 | 258 | 984,805 | 403 |
| refute:check-fork-identity.sh | claude-sonnet-5 | 8 | 40 | 16 | 738,802 | 85 |
| refute:config.yml | claude-sonnet-5 | 9 | 34 | 18 | 794,210 | 104 |
| machine:bash scripts/fork/check-fork-identity.sh | claude-haiku-4-5-20251001 | 2 | 9 | 18 | 94,269 | 16 |
| capture:provenance | claude-sonnet-5 | 3 | 9 | 6 | 188,339 | 29 |
| machine:bash scripts/fork/check-fork-identity-te | claude-haiku-4-5-20251001 | 2 | 8 | 18 | 94,345 | 21 |
| synthesize:report | claude-sonnet-5 | 2 | 7 | 4 | 111,873 | 150 |
| machine:cd sdk && . ../scripts/lib/sdk-version.s | claude-haiku-4-5-20251001 | 2 | 7 | 18 | 94,338 | 24 |
| machine:bash scripts/fork/check-fork-identity-te | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 94,372 | 20 |
| machine:pnpm build && pnpm typecheck | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 94,265 | 43 |
| machine:pnpm verify:plugins | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 94,257 | 11 |
| machine:bash scripts/fork/check-fork-identity-te | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 94,271 | 55 |
| machine:bash scripts/fork/check-fork-identity-te | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 94,360 | 21 |
| machine:bash scripts/fork/check-fork-identity-te | claude-haiku-4-5-20251001 | 3 | 3 | 26 | 164,867 | 21 |
| machine:pnpm gen:abi && git diff --exit-code src | claude-haiku-4-5-20251001 | 2 | 3 | 18 | 94,294 | 24 |
| machine:bash scripts/fork/check-prototype-lane.s | claude-haiku-4-5-20251001 | 2 | 3 | 18 | 94,299 | 16 |
| machine:node scripts/roadmap/check-plan-freeze.m | claude-haiku-4-5-20251001 | 2 | 3 | 18 | 94,272 | 17 |
| machine:bash scripts/fork/check-fork-identity-te | claude-haiku-4-5-20251001 | 2 | 3 | 18 | 94,322 | 16 |
| machine:pnpm test | claude-haiku-4-5-20251001 | 2 | 2 | 18 | 94,253 | 25 |
| machine:bash scripts/fork/check-fork-identity-te | claude-haiku-4-5-20251001 | 2 | 2 | 18 | 65,827 | 21 |
| machine:pnpm lint:check | claude-haiku-4-5-20251001 | 2 | 2 | 18 | 94,257 | 13 |

- **claude-sonnet-5**: 14 agent · 165 calls · out 36,839 · in 330 · cache_read 16,824,363 · cache_create 1,285,966
- **claude-fable-5-1**: 3 agent · 35 calls · out 5,485 · in 1,030 · cache_read 4,006,218 · cache_create 396,183
- **claude-haiku-4-5-20251001**: 18 agent · 37 calls · out 899 · in 332 · cache_read 1,739,471 · cache_create 796,260

