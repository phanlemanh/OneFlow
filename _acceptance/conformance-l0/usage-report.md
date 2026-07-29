### S4 round 2 — wf_bd1375b4-6f3 (29 agent, 166,306 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5 | 69 | 29,356 | 132 | 8,961,424 | 735 |
| review:conventions | claude-opus-5 | 28 | 24,962 | 787 | 3,281,659 | 436 |
| refute:bindings.py | claude-sonnet-5 | 24 | 17,273 | 48 | 2,140,679 | 268 |
| refute:plugins-registry-schema.ts | claude-sonnet-5 | 13 | 15,713 | 26 | 1,013,755 | 204 |
| refute:runner.py | claude-sonnet-5 | 24 | 14,094 | 1,210 | 2,098,135 | 228 |
| synthesize:report | claude-sonnet-5 | 7 | 11,760 | 14 | 603,640 | 121 |
| refute:batch-basic.json | claude-sonnet-5 | 13 | 9,066 | 26 | 1,084,412 | 146 |
| refute:runner.py | claude-sonnet-5 | 13 | 8,151 | 4,128 | 1,135,614 | 145 |
| refute:plugins-registry-schema.ts | claude-sonnet-5 | 10 | 6,034 | 20 | 736,654 | 107 |
| refute:scan.py | claude-sonnet-5 | 12 | 5,851 | 167 | 912,487 | 109 |
| refute:test_conformance.py | claude-sonnet-5 | 9 | 5,442 | 18 | 672,306 | 109 |
| refute:batch.py | claude-sonnet-5 | 9 | 4,664 | 18 | 675,265 | 86 |
| scribe:run-log | claude-haiku-4-5-20251001 | 5 | 2,673 | 42 | 214,441 | 36 |
| refute:use-workflow-recovery.ts | claude-sonnet-5 | 6 | 2,479 | 12 | 414,884 | 44 |
| machine:pnpm gen:abi && git diff --exit-code src | claude-haiku-4-5-20251001 | 3 | 951 | 26 | 118,448 | 17 |
| capture:provenance | claude-sonnet-5 | 2 | 870 | 4 | 71,156 | 13 |
| machine:bash scripts/conformance/check-suite-dis | claude-haiku-4-5-20251001 | 2 | 746 | 18 | 49,173 | 16 |
| machine:pnpm build && pnpm typecheck | claude-haiku-4-5-20251001 | 2 | 674 | 18 | 49,168 | 34 |
| machine:pnpm vitest run src/lib/plugins/plugin-r | claude-haiku-4-5-20251001 | 2 | 674 | 18 | 49,182 | 13 |
| machine:pnpm vitest run src/lib/abi/conformance. | claude-haiku-4-5-20251001 | 2 | 661 | 18 | 49,182 | 14 |
| machine:pnpm tsx scripts/plugins/check-rev-joine | claude-haiku-4-5-20251001 | 3 | 612 | 26 | 101,025 | 15 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 599 | 18 | 49,208 | 11 |
| machine:pnpm vitest run src/lib/task/node-cached | claude-haiku-4-5-20251001 | 2 | 597 | 18 | 66,457 | 16 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 559 | 18 | 49,213 | 15 |
| machine:pnpm test | claude-haiku-4-5-20251001 | 2 | 507 | 18 | 49,156 | 41 |
| machine:pnpm lint:check | claude-haiku-4-5-20251001 | 2 | 453 | 18 | 49,160 | 10 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 329 | 18 | 49,213 | 19 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 317 | 18 | 49,204 | 15 |
| machine:pnpm verify:plugins | claude-haiku-4-5-20251001 | 2 | 239 | 18 | 66,435 | 11 |

- **claude-opus-5**: 2 agent · 97 calls · out 54,318 · in 919 · cache_read 12,243,083 · cache_create 333,248
- **claude-sonnet-5**: 12 agent · 142 calls · out 101,397 · in 5,691 · cache_read 11,558,987 · cache_create 1,114,877
- **claude-haiku-4-5-20251001**: 15 agent · 35 calls · out 10,591 · in 310 · cache_read 1,058,665 · cache_create 738,566

### S4 round 3 — wf_07b2d993-b60 (31 agent, 154,753 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5 | 47 | 31,721 | 89 | 6,309,333 | 648 |
| review:conventions | claude-opus-5 | 45 | 31,363 | 3,812 | 5,880,651 | 604 |
| refute:scan.py | claude-sonnet-5 | 20 | 17,081 | 40 | 2,030,385 | 328 |
| refute:batch.py | claude-sonnet-5 | 31 | 7,795 | 62 | 2,803,423 | 257 |
| refute:batch.py | claude-sonnet-5 | 18 | 6,895 | 36 | 1,499,774 | 148 |
| refute:batch.py | claude-sonnet-5 | 13 | 6,641 | 1,619 | 1,066,654 | 150 |
| refute:scan.py | claude-sonnet-5 | 13 | 6,273 | 26 | 1,023,712 | 139 |
| refute:runner.py | claude-sonnet-5 | 29 | 6,037 | 58 | 2,545,488 | 235 |
| refute:conformance.ts | claude-sonnet-5 | 10 | 5,550 | 20 | 772,385 | 140 |
| refute:conformance.ts | claude-sonnet-5 | 14 | 5,097 | 28 | 1,099,975 | 141 |
| refute:node-cached.test.ts | claude-sonnet-5 | 7 | 4,824 | 14 | 472,901 | 99 |
| scribe:run-log | claude-haiku-4-5-20251001 | 5 | 4,195 | 42 | 219,121 | 48 |
| refute:engine-delegate.server.ts | claude-sonnet-5 | 9 | 3,558 | 18 | 661,125 | 81 |
| refute:runner.py | claude-sonnet-5 | 10 | 3,318 | 1,439 | 794,407 | 92 |
| refute:conformance.ts | claude-sonnet-5 | 14 | 3,106 | 28 | 1,229,417 | 216 |
| synthesize:report | claude-sonnet-5 | 11 | 1,867 | 22 | 1,040,403 | 164 |
| machine:pnpm tsx scripts/plugins/check-rev-joine | claude-haiku-4-5-20251001 | 2 | 1,166 | 18 | 49,179 | 18 |
| machine:bash scripts/conformance/check-suite-dis | claude-haiku-4-5-20251001 | 4 | 1,029 | 34 | 153,287 | 30 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 3 | 921 | 26 | 101,083 | 18 |
| machine:pnpm build && pnpm typecheck | claude-haiku-4-5-20251001 | 2 | 902 | 18 | 49,168 | 40 |
| machine:pnpm vitest run src/lib/abi/conformance. | claude-haiku-4-5-20251001 | 2 | 681 | 18 | 49,182 | 14 |
| machine:pnpm vitest run src/lib/task/node-cached | claude-haiku-4-5-20251001 | 2 | 662 | 18 | 49,182 | 13 |
| machine:pnpm gen:abi && git diff --exit-code src | claude-haiku-4-5-20251001 | 2 | 605 | 18 | 66,472 | 17 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 597 | 18 | 49,213 | 11 |
| machine:pnpm verify:plugins | claude-haiku-4-5-20251001 | 2 | 580 | 18 | 66,435 | 10 |
| capture:provenance | claude-sonnet-5 | 2 | 532 | 4 | 71,156 | 13 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 3 | 517 | 26 | 101,077 | 19 |
| machine:pnpm lint:check | claude-haiku-4-5-20251001 | 2 | 484 | 18 | 66,435 | 19 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 401 | 18 | 49,213 | 14 |
| machine:pnpm test | claude-haiku-4-5-20251001 | 2 | 353 | 18 | 66,431 | 15 |
| machine:pnpm vitest run src/lib/plugins/plugin-r | claude-haiku-4-5-20251001 | 2 | 2 | 18 | 49,182 | 13 |

- **claude-opus-5**: 2 agent · 92 calls · out 63,084 · in 3,901 · cache_read 12,189,984 · cache_create 308,219
- **claude-sonnet-5**: 14 agent · 201 calls · out 78,574 · in 3,414 · cache_read 17,111,205 · cache_create 1,306,317
- **claude-haiku-4-5-20251001**: 15 agent · 37 calls · out 13,095 · in 326 · cache_read 1,184,660 · cache_create 724,010

### S4 round 4 — wf_80cef231-281 (28 agent, 100,746 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5 | 54 | 28,219 | 102 | 7,397,470 | 687 |
| review:conventions | claude-opus-5 | 36 | 16,328 | 4,437 | 4,441,538 | 432 |
| refute:conformance.ts | claude-sonnet-5 | 17 | 8,971 | 34 | 1,475,521 | 211 |
| refute:runner.py | claude-sonnet-5 | 26 | 7,240 | 52 | 2,260,595 | 224 |
| refute:batch.py | claude-sonnet-5 | 17 | 5,450 | 34 | 1,449,823 | 141 |
| refute:runner.py | claude-sonnet-5 | 13 | 5,142 | 3,657 | 1,030,800 | 114 |
| refute:engine-events.ts | claude-sonnet-5 | 10 | 4,837 | 1,414 | 756,763 | 104 |
| scribe:run-log | claude-haiku-4-5-20251001 | 4 | 3,721 | 34 | 162,005 | 44 |
| refute:check-rev-joined-path.ts | claude-sonnet-5 | 12 | 3,178 | 24 | 929,315 | 99 |
| machine:pnpm gen:abi && git diff --exit-code src | claude-haiku-4-5-20251001 | 2 | 2,470 | 18 | 66,472 | 30 |
| refute:plugins-registry-schema.ts | claude-sonnet-5 | 6 | 2,386 | 511 | 395,602 | 60 |
| synthesize:report | claude-sonnet-5 | 7 | 2,167 | 4,594 | 579,270 | 159 |
| refute:ci.yml | claude-sonnet-5 | 9 | 2,047 | 18 | 712,877 | 89 |
| refute:conformance.ts | claude-sonnet-5 | 10 | 1,595 | 20 | 768,806 | 173 |
| capture:provenance | claude-sonnet-5 | 2 | 1,079 | 4 | 71,156 | 21 |
| machine:pnpm build && pnpm typecheck | claude-haiku-4-5-20251001 | 2 | 722 | 18 | 49,168 | 33 |
| machine:pnpm vitest run src/lib/abi/conformance. | claude-haiku-4-5-20251001 | 2 | 714 | 18 | 49,182 | 15 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 700 | 18 | 66,488 | 13 |
| machine:pnpm tsx scripts/plugins/check-rev-joine | claude-haiku-4-5-20251001 | 2 | 631 | 18 | 49,179 | 16 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 614 | 18 | 49,208 | 12 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 611 | 18 | 49,213 | 15 |
| machine:pnpm test | claude-haiku-4-5-20251001 | 2 | 591 | 18 | 66,431 | 15 |
| machine:bash scripts/conformance/check-suite-dis | claude-haiku-4-5-20251001 | 2 | 386 | 18 | 66,448 | 18 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 369 | 18 | 49,204 | 16 |
| machine:pnpm vitest run src/lib/task/node-cached | claude-haiku-4-5-20251001 | 2 | 312 | 18 | 66,457 | 15 |
| machine:pnpm vitest run src/lib/plugins/plugin-r | claude-haiku-4-5-20251001 | 2 | 259 | 18 | 66,457 | 15 |
| machine:pnpm verify:plugins | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 66,435 | 15 |
| machine:pnpm lint:check | claude-haiku-4-5-20251001 | 2 | 2 | 18 | 49,160 | 14 |

- **claude-opus-5**: 2 agent · 90 calls · out 44,547 · in 4,539 · cache_read 11,839,008 · cache_create 331,658
- **claude-sonnet-5**: 11 agent · 129 calls · out 44,092 · in 10,362 · cache_read 10,430,528 · cache_create 974,479
- **claude-haiku-4-5-20251001**: 15 agent · 32 calls · out 12,107 · in 286 · cache_read 971,507 · cache_create 670,080

