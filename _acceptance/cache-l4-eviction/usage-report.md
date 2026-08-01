### S4 round 1 — wf_d35c1bfc-673 (35 agent, 68,944 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-fable-5 | 20 | 14,830 | 40 | 1,632,404 | 288 |
| review:conventions | claude-fable-5 | 23 | 13,868 | 46 | 2,062,103 | 306 |
| baseline:diffBase | claude-sonnet-5 | 15 | 12,024 | 30 | 1,025,856 | 229 |
| refute:engine-delegate.server.ts | claude-sonnet-5 | 18 | 5,601 | 778 | 1,392,565 | 179 |
| refute:node_cache.py | claude-sonnet-5 | 13 | 3,684 | 26 | 884,155 | 93 |
| refute:node_cache.py | claude-sonnet-5 | 14 | 2,141 | 28 | 985,809 | 114 |
| triage | claude-sonnet-5 | 2 | 2,061 | 4 | 63,024 | 33 |
| machine:pnpm gen:abi && git diff --exit-code src | claude-haiku-4-5-20251001 | 2 | 1,123 | 18 | 56,607 | 16 |
| capture:provenance | claude-sonnet-5 | 2 | 1,072 | 4 | 61,085 | 17 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 1,060 | 18 | 39,280 | 15 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 3 | 813 | 26 | 98,688 | 15 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 3 | 734 | 26 | 81,317 | 17 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 727 | 18 | 39,273 | 14 |
| machine:pnpm verify:plugins | claude-haiku-4-5-20251001 | 2 | 709 | 18 | 56,570 | 13 |
| machine:pnpm vitest run src/lib/task/engine-dele | claude-haiku-4-5-20251001 | 2 | 704 | 18 | 56,600 | 13 |
| machine:pnpm vitest run src/db/metering-schema.t | claude-haiku-4-5-20251001 | 2 | 693 | 18 | 56,600 | 12 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 675 | 18 | 56,637 | 11 |
| machine:bash scripts/cache/check-test-layout.sh | claude-haiku-4-5-20251001 | 4 | 620 | 34 | 140,727 | 30 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 617 | 18 | 39,273 | 11 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 595 | 18 | 39,277 | 11 |
| machine:pnpm vitest run src/lib/task/node-cached | claude-haiku-4-5-20251001 | 3 | 560 | 26 | 98,531 | 19 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 542 | 18 | 56,647 | 14 |
| machine:pnpm build && pnpm typecheck | claude-haiku-4-5-20251001 | 2 | 474 | 18 | 56,578 | 34 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 414 | 18 | 56,643 | 12 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 406 | 18 | 56,641 | 12 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 366 | 18 | 39,272 | 12 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 366 | 18 | 39,271 | 14 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 304 | 18 | 56,645 | 11 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 266 | 18 | 56,614 | 20 |
| machine:pnpm lint:check | claude-haiku-4-5-20251001 | 2 | 264 | 18 | 56,570 | 12 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 3 | 261 | 26 | 81,280 | 16 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 231 | 18 | 39,272 | 14 |
| synthesize:report | claude-sonnet-5 | 2 | 134 | 4 | 73,691 | 105 |
| machine:pnpm test | claude-haiku-4-5-20251001 | 2 | 3 | 18 | 56,566 | 16 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 2 | 18 | 56,640 | 18 |

- **claude-fable-5**: 2 agent · 43 calls · out 28,698 · in 86 · cache_read 3,694,507 · cache_create 198,702
- **claude-sonnet-5**: 7 agent · 66 calls · out 26,717 · in 874 · cache_read 4,486,185 · cache_create 550,045
- **claude-haiku-4-5-20251001**: 26 agent · 58 calls · out 13,529 · in 516 · cache_read 1,568,019 · cache_create 807,044

