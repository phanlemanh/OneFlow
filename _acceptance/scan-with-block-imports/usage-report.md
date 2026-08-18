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

### S4 round 2 — wf_b0bd63db-3b1 (36 agent, 164,522 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:measurement | claude-opus-5 | 11 | 25,269 | 21 | 970,956 | 389 |
| synthesize:report | claude-sonnet-5 | 6 | 20,905 | 12 | 457,093 | 234 |
| review:bugs | claude-opus-5 | 13 | 18,959 | 25 | 1,131,284 | 294 |
| review:conventions | claude-opus-5 | 18 | 15,861 | 2,833 | 1,581,530 | 287 |
| refute:check-scope-walker-teeth.sh | claude-sonnet-5 | 15 | 15,389 | 30 | 1,097,810 | 245 |
| refute:scan.py | claude-sonnet-5 | 29 | 12,336 | 58 | 2,405,305 | 236 |
| refute:parse_deploy.py | claude-sonnet-5 | 13 | 11,262 | 26 | 968,356 | 170 |
| refute:scan.py | claude-sonnet-5 | 20 | 9,433 | 40 | 1,600,129 | 181 |
| triage | claude-sonnet-5 | 2 | 4,939 | 4 | 69,736 | 60 |
| baseline:diffBase | claude-sonnet-5 | 8 | 4,846 | 16 | 524,941 | 76 |
| refute:check-scan-blast-radius.sh | claude-sonnet-5 | 12 | 4,579 | 24 | 818,116 | 114 |
| refute:parse_deploy.py | claude-sonnet-5 | 5 | 2,588 | 10 | 314,980 | 51 |
| refute:README.md | claude-sonnet-5 | 5 | 1,995 | 1,567 | 301,498 | 43 |
| machine:pnpm gen:abi && git diff --exit-code src | claude-haiku-4-5-20251001 | 2 | 1,304 | 18 | 61,728 | 23 |
| machine:pnpm lint:check | claude-haiku-4-5-20251001 | 2 | 1,034 | 18 | 61,691 | 18 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 6 | 1,003 | 50 | 249,950 | 31 |
| machine:pnpm build && pnpm typecheck | claude-haiku-4-5-20251001 | 2 | 987 | 20 | 61,699 | 42 |
| capture:provenance | claude-sonnet-5 | 2 | 842 | 4 | 64,024 | 23 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 820 | 18 | 61,799 | 14 |
| machine:bash scripts/plugins/check-overlay-disco | claude-haiku-4-5-20251001 | 2 | 805 | 18 | 61,703 | 16 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 753 | 18 | 61,758 | 15 |
| machine:pnpm test | claude-haiku-4-5-20251001 | 2 | 734 | 18 | 61,687 | 17 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 704 | 18 | 60,700 | 15 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 702 | 18 | 61,754 | 14 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 676 | 18 | 61,735 | 19 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 659 | 18 | 61,762 | 14 |
| machine:bash scripts/plugins/check-scan-blast-ra | claude-haiku-4-5-20251001 | 2 | 659 | 18 | 61,705 | 14 |
| machine:bash scripts/plugins/check-scope-walker- | claude-haiku-4-5-20251001 | 2 | 649 | 18 | 61,704 | 14 |
| machine:bash scripts/plugins/check-scan-noise.sh | claude-haiku-4-5-20251001 | 2 | 614 | 18 | 61,703 | 15 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 590 | 18 | 61,752 | 14 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 582 | 18 | 61,754 | 13 |
| machine:bash scripts/plugins/check-reason-teeth. | claude-haiku-4-5-20251001 | 2 | 552 | 18 | 61,701 | 12 |
| machine:pnpm verify:plugins | claude-haiku-4-5-20251001 | 2 | 455 | 18 | 61,691 | 13 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 385 | 18 | 61,758 | 14 |
| machine:bash scripts/plugins/check-overlay-disco | claude-haiku-4-5-20251001 | 2 | 341 | 18 | 61,703 | 16 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 311 | 18 | 61,752 | 14 |

- **claude-opus-5**: 3 agent · 42 calls · out 60,089 · in 2,879 · cache_read 3,683,770 · cache_create 289,320
- **claude-sonnet-5**: 11 agent · 117 calls · out 89,114 · in 1,791 · cache_read 8,621,988 · cache_create 740,136
- **claude-haiku-4-5-20251001**: 22 agent · 48 calls · out 15,319 · in 430 · cache_read 1,545,189 · cache_create 570,028

