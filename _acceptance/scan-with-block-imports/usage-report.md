### S4 round 1 — wf_bc010725-215 (41 agent, 206,998 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:conventions | claude-opus-5 | 26 | 24,209 | 50 | 2,529,669 | 439 |
| review:bugs | claude-opus-5 | 20 | 20,298 | 2,070 | 1,783,888 | 354 |
| triage | claude-sonnet-5 | 2 | 18,948 | 4 | 72,067 | 202 |
| review:measurement | claude-opus-5 | 16 | 17,852 | 6,919 | 1,571,632 | 372 |
| synthesize:report | claude-sonnet-5 | 2 | 11,831 | 4 | 83,073 | 112 |
| refute:check-scan-blast-radius.sh | claude-sonnet-5 | 8 | 11,490 | 1,156 | 603,657 | 172 |
| refute:check-scan-noise.sh | claude-sonnet-5 | 16 | 11,441 | 32 | 1,203,560 | 199 |
| refute:test_scan_scope.py | claude-sonnet-5 | 11 | 10,673 | 344 | 816,448 | 186 |
| refute:config.yaml | claude-sonnet-5 | 22 | 10,020 | 44 | 1,783,340 | 204 |
| refute:check-overlay-discoverable.sh | claude-sonnet-5 | 16 | 9,438 | 32 | 1,173,338 | 186 |
| refute:scan.py | claude-sonnet-5 | 19 | 7,248 | 38 | 1,410,709 | 140 |
| refute:check-scan-noise.sh | claude-sonnet-5 | 19 | 7,008 | 38 | 1,506,877 | 303 |
| refute:scan.py | claude-sonnet-5 | 8 | 6,541 | 16 | 582,593 | 99 |
| refute:parse_deploy.py | claude-sonnet-5 | 10 | 6,203 | 20 | 735,816 | 111 |
| refute:scan.py | claude-sonnet-5 | 12 | 6,102 | 24 | 935,172 | 121 |
| baseline:diffBase | claude-sonnet-5 | 8 | 4,232 | 16 | 504,290 | 78 |
| refute:deploy.py.sha256 | claude-sonnet-5 | 7 | 3,846 | 291 | 457,381 | 82 |
| refute:parse_deploy.py | claude-sonnet-5 | 13 | 2,992 | 26 | 938,561 | 109 |
| machine:pnpm lint:check | claude-haiku-4-5-20251001 | 2 | 1,146 | 18 | 62,703 | 18 |
| machine:pnpm gen:abi && git diff --exit-code src | claude-haiku-4-5-20251001 | 3 | 1,111 | 26 | 108,987 | 22 |
| machine:pnpm build && pnpm typecheck | claude-haiku-4-5-20251001 | 2 | 908 | 18 | 62,711 | 38 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 3 | 896 | 26 | 108,999 | 19 |
| capture:provenance | claude-sonnet-5 | 2 | 893 | 4 | 65,530 | 23 |
| machine:bash scripts/plugins/check-scan-noise.sh | claude-haiku-4-5-20251001 | 4 | 860 | 34 | 155,095 | 24 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 793 | 18 | 62,747 | 19 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 717 | 18 | 62,761 | 13 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 710 | 18 | 62,765 | 13 |
| machine:bash scripts/plugins/check-overlay-disco | claude-haiku-4-5-20251001 | 2 | 710 | 18 | 62,715 | 13 |
| machine:pnpm test | claude-haiku-4-5-20251001 | 2 | 676 | 18 | 62,699 | 16 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 663 | 18 | 62,763 | 13 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 660 | 18 | 62,770 | 12 |
| machine:bash scripts/plugins/check-reason-teeth. | claude-haiku-4-5-20251001 | 2 | 658 | 18 | 62,713 | 18 |
| machine:bash scripts/plugins/check-scan-blast-ra | claude-haiku-4-5-20251001 | 2 | 644 | 18 | 62,717 | 12 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 643 | 18 | 43,090 | 12 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 637 | 18 | 62,768 | 12 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 633 | 18 | 62,765 | 13 |
| machine:bash scripts/plugins/check-overlay-disco | claude-haiku-4-5-20251001 | 2 | 626 | 18 | 62,715 | 12 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 601 | 18 | 62,761 | 12 |
| machine:pnpm verify:plugins | claude-haiku-4-5-20251001 | 2 | 563 | 18 | 62,703 | 12 |
| machine:bash scripts/plugins/check-scope-walker- | claude-haiku-4-5-20251001 | 2 | 556 | 18 | 62,716 | 12 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 322 | 18 | 62,763 | 13 |

- **claude-opus-5**: 3 agent · 62 calls · out 62,359 · in 9,039 · cache_read 5,885,189 · cache_create 318,786
- **claude-sonnet-5**: 16 agent · 175 calls · out 128,906 · in 2,089 · cache_read 12,872,412 · cache_create 1,131,701
- **claude-haiku-4-5-20251001**: 22 agent · 48 calls · out 15,733 · in 428 · cache_read 1,545,426 · cache_create 610,739

