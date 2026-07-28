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

