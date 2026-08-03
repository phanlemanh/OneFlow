### S1 explore fan-out — wf_2b3e16a6-49e (4 agent, 27,576 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| Read-only exploration of /Users/manh-macmini/dev | claude-haiku-4-5-20251001 | 17 | 12,279 | 142 | 1,127,949 | 175 |
| Read-only exploration of /Users/manh-macmini/dev | claude-haiku-4-5-20251001 | 18 | 7,385 | 650 | 1,264,926 | 121 |
| Read-only exploration of /Users/manh-macmini/dev | claude-haiku-4-5-20251001 | 24 | 6,626 | 194 | 1,940,780 | 148 |
| Read-only exploration of /Users/manh-macmini/dev | claude-haiku-4-5-20251001 | 8 | 1,286 | 66 | 504,980 | 150 |

- **claude-haiku-4-5-20251001**: 4 agent · 67 calls · out 27,576 · in 1,052 · cache_read 4,838,635 · cache_create 366,809

### S3 execute-parallel — wf_9fb309c2-02e (3 agent, 122,934 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| exec:task-6 | claude-fable-5 | 128 | 84,328 | 456 | 26,878,333 | 1850 |
| exec:task-5 | claude-fable-5 | 44 | 25,044 | 86 | 4,913,375 | 577 |
| exec:task-4 | claude-fable-5 | 32 | 13,562 | 63 | 3,241,491 | 331 |

- **claude-fable-5**: 3 agent · 204 calls · out 122,934 · in 605 · cache_read 35,033,199 · cache_create 594,520

### S4 round 1 — wf_cd4a6eec-7e4 (44 agent, 226,011 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| ui:E22 | claude-sonnet-5 | 220 | 100,133 | 440 | 46,244,424 | 2298 |
| refute:compose-overlay.tsx | claude-sonnet-5 | 40 | 24,337 | 80 | 4,448,274 | 446 |
| review:bugs | claude-fable-5 | 35 | 20,229 | 67 | 4,443,664 | 497 |
| synthesize:report | claude-sonnet-5 | 2 | 19,784 | 4 | 90,063 | 202 |
| baseline:diffBase | claude-sonnet-5 | 32 | 14,516 | 64 | 2,845,534 | 302 |
| review:conventions | claude-fable-5 | 16 | 12,926 | 29 | 1,499,395 | 249 |
| refute:node-feature-registry.ts | claude-sonnet-5 | 21 | 7,452 | 42 | 1,807,636 | 158 |
| refute:check-overlay-registration.sh | claude-sonnet-5 | 6 | 2,426 | 12 | 407,245 | 56 |
| refute:check-overlay-registration.sh | claude-sonnet-5 | 8 | 2,114 | 16 | 563,662 | 59 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 1,083 | 18 | 66,411 | 14 |
| judge:E23:spec-alignment | claude-sonnet-5 | 4 | 1,020 | 8 | 248,279 | 25 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 4 | 914 | 34 | 171,874 | 23 |
| judge:E23:operational-feasibility | claude-sonnet-5 | 4 | 900 | 8 | 247,848 | 21 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 865 | 18 | 66,373 | 14 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 863 | 18 | 49,028 | 16 |
| machine:bash scripts/abi/check-python-gen-clean. | claude-haiku-4-5-20251001 | 4 | 860 | 34 | 154,261 | 19 |
| machine:pnpm gen:abi && git diff --exit-code src | claude-haiku-4-5-20251001 | 2 | 841 | 18 | 49,034 | 17 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 3 | 805 | 26 | 101,659 | 18 |
| machine:pnpm test | claude-haiku-4-5-20251001 | 2 | 804 | 18 | 66,339 | 19 |
| judge:E23:domain-correctness | claude-sonnet-5 | 4 | 793 | 8 | 225,210 | 24 |
| machine:pnpm vitest run src/lib/workflow/compose | claude-haiku-4-5-20251001 | 2 | 756 | 18 | 66,365 | 13 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 749 | 18 | 66,417 | 12 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 3 | 748 | 26 | 119,028 | 18 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 723 | 18 | 66,413 | 11 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 712 | 18 | 49,034 | 19 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 707 | 18 | 49,028 | 13 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 699 | 18 | 49,025 | 15 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 676 | 18 | 66,379 | 12 |
| machine:bash scripts/abi/check-overlay-sdk-train | claude-haiku-4-5-20251001 | 2 | 658 | 18 | 66,359 | 16 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 656 | 18 | 66,416 | 12 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 613 | 18 | 66,377 | 12 |
| machine:pnpm vitest run src/components/workspace | claude-haiku-4-5-20251001 | 2 | 613 | 18 | 66,365 | 14 |
| machine:pnpm lint:check | claude-haiku-4-5-20251001 | 2 | 607 | 18 | 66,343 | 11 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 512 | 18 | 66,387 | 19 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 403 | 18 | 49,034 | 16 |
| machine:pnpm vitest run src/lib/abi/conformance. | claude-haiku-4-5-20251001 | 2 | 383 | 18 | 66,365 | 11 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 367 | 18 | 66,396 | 13 |
| machine:pnpm verify:plugins | claude-haiku-4-5-20251001 | 2 | 357 | 18 | 66,343 | 14 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 339 | 18 | 49,034 | 20 |
| capture:provenance | claude-sonnet-5 | 2 | 329 | 4 | 70,412 | 17 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 319 | 18 | 49,029 | 18 |
| machine:pnpm build && pnpm typecheck | claude-haiku-4-5-20251001 | 2 | 317 | 18 | 66,351 | 39 |
| triage | claude-sonnet-5 | 2 | 97 | 4 | 72,608 | 51 |
| machine:bash scripts/plugins/check-overlay-regis | claude-haiku-4-5-20251001 | 2 | 6 | 18 | 66,354 | 10 |

- **claude-sonnet-5**: 12 agent · 345 calls · out 173,901 · in 690 · cache_read 57,271,195 · cache_create 1,290,422
- **claude-fable-5**: 2 agent · 51 calls · out 33,155 · in 96 · cache_read 5,943,059 · cache_create 260,952
- **claude-haiku-4-5-20251001**: 30 agent · 66 calls · out 18,955 · in 588 · cache_read 2,133,821 · cache_create 1,243,022

### S4 round 2 — wf_83568de2-bc2 (52 agent, 317,918 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| ui:E22 | claude-sonnet-5 | 194 | 108,067 | 388 | 44,586,644 | 2061 |
| synthesize:report | claude-sonnet-5 | 2 | 32,983 | 4 | 93,694 | 314 |
| refute:node-feature-registry.ts | claude-sonnet-5 | 64 | 22,525 | 128 | 6,754,456 | 501 |
| review:bugs | claude-opus-5 | 47 | 22,249 | 92 | 6,415,914 | 481 |
| review:conventions | claude-opus-5 | 20 | 16,641 | 39 | 2,168,688 | 301 |
| refute:compose-overlay.tsx | claude-sonnet-5 | 16 | 12,838 | 127 | 1,370,785 | 215 |
| triage | claude-sonnet-5 | 2 | 12,134 | 4 | 77,313 | 130 |
| judge:E23:spec-alignment | claude-sonnet-5 | 20 | 11,825 | 40 | 1,595,165 | 205 |
| refute:compose-overlay.tsx | claude-sonnet-5 | 22 | 9,331 | 427 | 1,845,183 | 176 |
| refute:compose_overlay.py | claude-sonnet-5 | 16 | 8,106 | 163 | 1,379,004 | 146 |
| refute:compose-overlay-op-form.tsx | claude-sonnet-5 | 23 | 7,603 | 179 | 2,132,723 | 158 |
| refute:compose-overlay-ops-editor.tsx | claude-sonnet-5 | 16 | 7,173 | 32 | 1,345,376 | 158 |
| refute:official-plugins.json | claude-sonnet-5 | 15 | 3,768 | 697 | 1,223,975 | 154 |
| refute:check-python-gen-clean.sh | claude-sonnet-5 | 14 | 3,760 | 28 | 1,032,171 | 111 |
| refute:check-overlay-registration.sh | claude-sonnet-5 | 8 | 3,520 | 16 | 564,618 | 142 |
| refute:tongflow.abi.json | claude-sonnet-5 | 15 | 3,231 | 30 | 1,244,504 | 140 |
| judge:E23:operational-feasibility | claude-sonnet-5 | 5 | 1,941 | 10 | 303,760 | 44 |
| refute:check-manifest-unmoved.sh | claude-sonnet-5 | 8 | 1,886 | 16 | 554,830 | 88 |
| machine:pnpm gen:abi && git diff --exit-code src | claude-haiku-4-5-20251001 | 4 | 1,849 | 34 | 155,526 | 30 |
| refute:run-overlay-plugin-tests.sh | claude-sonnet-5 | 4 | 1,811 | 8 | 249,324 | 39 |
| judge:E23:domain-correctness | claude-sonnet-5 | 5 | 1,699 | 10 | 304,058 | 33 |
| machine:pnpm lint:check | claude-haiku-4-5-20251001 | 3 | 1,673 | 26 | 119,280 | 30 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 6 | 1,511 | 50 | 278,161 | 34 |
| refute:config.yaml | claude-sonnet-5 | 4 | 1,191 | 8 | 224,284 | 33 |
| capture:provenance | claude-sonnet-5 | 2 | 1,153 | 4 | 70,412 | 18 |
| machine:bash scripts/abi/check-python-gen-clean. | claude-haiku-4-5-20251001 | 6 | 1,120 | 50 | 260,711 | 28 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 1,069 | 18 | 49,029 | 17 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 1,039 | 18 | 66,379 | 19 |
| machine:pnpm build && pnpm typecheck | claude-haiku-4-5-20251001 | 2 | 1,000 | 18 | 66,351 | 38 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 997 | 18 | 66,417 | 14 |
| machine:bash scripts/plugins/check-overlay-regis | claude-haiku-4-5-20251001 | 3 | 785 | 26 | 118,871 | 17 |
| machine:pnpm vitest run src/lib/abi/conformance. | claude-haiku-4-5-20251001 | 2 | 776 | 18 | 66,365 | 12 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 760 | 18 | 66,373 | 14 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 751 | 18 | 66,377 | 14 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 3 | 749 | 26 | 101,568 | 17 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 748 | 18 | 49,034 | 16 |
| machine:pnpm vitest run src/lib/workflow/compose | claude-haiku-4-5-20251001 | 2 | 708 | 18 | 66,365 | 12 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 705 | 18 | 66,378 | 14 |
| machine:pnpm verify:plugins | claude-haiku-4-5-20251001 | 2 | 701 | 18 | 66,343 | 13 |
| machine:bash scripts/abi/check-overlay-sdk-train | claude-haiku-4-5-20251001 | 2 | 691 | 18 | 66,359 | 16 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 671 | 18 | 66,413 | 11 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 652 | 18 | 49,028 | 13 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 641 | 18 | 66,416 | 11 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 587 | 18 | 49,028 | 13 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 585 | 18 | 66,387 | 19 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 510 | 18 | 66,371 | 17 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 425 | 18 | 66,411 | 13 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 396 | 18 | 66,396 | 11 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 3 | 372 | 26 | 101,586 | 18 |
| machine:pnpm vitest run src/components/workspace | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 66,365 | 16 |
| machine:pnpm test | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 66,339 | 17 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 2 | 18 | 49,034 | 19 |

- **claude-sonnet-5**: 20 agent · 455 calls · out 256,545 · in 2,319 · cache_read 66,952,279 · cache_create 2,049,114
- **claude-opus-5**: 2 agent · 67 calls · out 38,890 · in 131 · cache_read 8,584,602 · cache_create 314,970
- **claude-haiku-4-5-20251001**: 30 agent · 74 calls · out 22,483 · in 652 · cache_read 2,575,661 · cache_create 1,229,469

### S4 round 3 — wf_387d7da5-978 (50 agent, 244,570 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| ui:E22 | claude-sonnet-5 | 197 | 79,608 | 394 | 41,903,592 | 2015 |
| review:bugs | claude-opus-5 | 47 | 24,700 | 93 | 6,803,331 | 516 |
| review:conventions | claude-opus-5 | 43 | 20,993 | 86 | 4,940,621 | 440 |
| refute:node-feature-registry.ts | claude-sonnet-5 | 53 | 15,786 | 3,349 | 5,364,859 | 382 |
| refute:edge-target-options.ts | claude-sonnet-5 | 24 | 11,891 | 48 | 2,180,473 | 251 |
| refute:compose-overlay.test.tsx | claude-sonnet-5 | 19 | 11,546 | 38 | 1,667,817 | 252 |
| refute:types.tsx | claude-sonnet-5 | 13 | 8,740 | 73 | 1,068,951 | 141 |
| refute:conformance.ts | claude-sonnet-5 | 22 | 8,584 | 44 | 1,889,231 | 194 |
| refute:connection-rules.ts | claude-sonnet-5 | 20 | 8,468 | 40 | 1,735,718 | 195 |
| refute:tongflow.abi.json | claude-sonnet-5 | 22 | 6,810 | 44 | 1,932,943 | 193 |
| refute:connection-rules.ts | claude-sonnet-5 | 11 | 5,973 | 22 | 919,357 | 118 |
| refute:node-feature-registry.ts | claude-sonnet-5 | 9 | 4,959 | 3,004 | 775,175 | 84 |
| refute:compose-overlay-op-form.tsx | claude-sonnet-5 | 15 | 4,788 | 30 | 1,161,980 | 99 |
| judge:E23:spec-alignment | claude-sonnet-5 | 5 | 4,645 | 636 | 328,955 | 75 |
| refute:check-manifest-unmoved.sh | claude-sonnet-5 | 4 | 2,338 | 8 | 227,786 | 41 |
| judge:E23:operational-feasibility | claude-sonnet-5 | 5 | 1,793 | 10 | 313,784 | 96 |
| judge:E23:domain-correctness | claude-sonnet-5 | 5 | 1,694 | 10 | 309,650 | 100 |
| capture:provenance | claude-sonnet-5 | 2 | 1,335 | 4 | 70,426 | 18 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 1,070 | 18 | 66,380 | 17 |
| machine:pnpm build && pnpm typecheck | claude-haiku-4-5-20251001 | 2 | 1,053 | 18 | 66,351 | 38 |
| machine:pnpm vitest run src/lib/abi/conformance. | claude-haiku-4-5-20251001 | 5 | 1,038 | 42 | 224,960 | 25 |
| machine:bash scripts/abi/check-overlay-sdk-train | claude-haiku-4-5-20251001 | 2 | 1,035 | 18 | 66,359 | 16 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 985 | 18 | 49,029 | 16 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 3 | 942 | 26 | 119,448 | 23 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 852 | 18 | 49,034 | 17 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 785 | 18 | 66,373 | 15 |
| machine:pnpm gen:abi && git diff --exit-code src | claude-haiku-4-5-20251001 | 2 | 755 | 18 | 66,380 | 14 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 738 | 18 | 66,379 | 14 |
| machine:pnpm vitest run src/components/workspace | claude-haiku-4-5-20251001 | 2 | 722 | 18 | 66,365 | 14 |
| machine:pnpm verify:plugins | claude-haiku-4-5-20251001 | 2 | 712 | 18 | 66,343 | 13 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 698 | 18 | 66,374 | 14 |
| machine:bash scripts/abi/check-python-gen-clean. | claude-haiku-4-5-20251001 | 4 | 691 | 34 | 154,249 | 22 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 681 | 18 | 49,025 | 13 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 670 | 18 | 66,411 | 12 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 658 | 18 | 66,380 | 14 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 648 | 18 | 66,387 | 19 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 633 | 18 | 66,396 | 11 |
| machine:pnpm test | claude-haiku-4-5-20251001 | 2 | 630 | 18 | 66,339 | 17 |
| machine:bash scripts/plugins/check-overlay-regis | claude-haiku-4-5-20251001 | 2 | 580 | 18 | 66,354 | 10 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 491 | 18 | 66,416 | 13 |
| machine:pnpm vitest run src/lib/workflow/compose | claude-haiku-4-5-20251001 | 2 | 453 | 18 | 66,365 | 14 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 449 | 18 | 66,378 | 15 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 417 | 18 | 66,417 | 11 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 343 | 18 | 66,374 | 13 |
| machine:pnpm lint:check | claude-haiku-4-5-20251001 | 2 | 305 | 18 | 66,343 | 17 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 293 | 18 | 66,413 | 12 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 280 | 18 | 49,027 | 13 |
| synthesize:report | claude-sonnet-5 | 2 | 208 | 4 | 92,036 | 306 |
| triage | claude-sonnet-5 | 2 | 100 | 4 | 75,798 | 105 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 66,375 | 18 |

- **claude-sonnet-5**: 18 agent · 430 calls · out 179,266 · in 7,762 · cache_read 62,018,531 · cache_create 1,917,516
- **claude-opus-5**: 2 agent · 90 calls · out 45,693 · in 179 · cache_read 11,743,952 · cache_create 313,825
- **claude-haiku-4-5-20251001**: 30 agent · 66 calls · out 19,611 · in 588 · cache_read 2,221,424 · cache_create 1,157,090

### S4 round 4 — wf_1c10da11-809 (54 agent, 205,514 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| ui:E22 | claude-sonnet-5 | 179 | 54,319 | 358 | 35,208,058 | 1973 |
| review:bugs | claude-opus-5 | 82 | 34,446 | 162 | 13,063,173 | 767 |
| review:conventions | claude-opus-5 | 36 | 16,420 | 72 | 4,019,522 | 380 |
| refute:node-feature-registry.ts | claude-sonnet-5 | 12 | 10,500 | 24 | 933,405 | 167 |
| refute:compose-overlay.tsx | claude-sonnet-5 | 30 | 9,065 | 60 | 2,911,924 | 232 |
| refute:compose-overlay-ops-editor.tsx | claude-sonnet-5 | 23 | 8,411 | 770 | 2,157,829 | 226 |
| refute:compose-overlay.test.tsx | claude-sonnet-5 | 28 | 6,583 | 56 | 2,520,729 | 193 |
| refute:use-node-actions.tsx | claude-sonnet-5 | 30 | 5,760 | 60 | 2,490,832 | 192 |
| refute:compose-overlay-op-form.tsx | claude-sonnet-5 | 23 | 5,575 | 46 | 2,091,996 | 212 |
| judge:E23:domain-correctness | claude-sonnet-5 | 8 | 4,945 | 3,064 | 578,535 | 100 |
| refute:types.tsx | claude-sonnet-5 | 15 | 4,650 | 30 | 1,278,799 | 190 |
| refute:vocabulary.ts | claude-sonnet-5 | 19 | 4,649 | 38 | 1,647,399 | 159 |
| refute:edge-target-options.ts | claude-sonnet-5 | 10 | 3,931 | 20 | 769,873 | 95 |
| judge:E23:spec-alignment | claude-sonnet-5 | 7 | 3,363 | 14 | 505,992 | 65 |
| judge:E23:operational-feasibility | claude-sonnet-5 | 9 | 2,660 | 18 | 699,399 | 84 |
| refute:ui-capture.mjs | claude-sonnet-5 | 15 | 2,625 | 30 | 1,149,945 | 103 |
| refute:CLAUDE.md | claude-sonnet-5 | 5 | 2,360 | 10 | 312,975 | 64 |
| refute:compose-overlay-ops-editor.tsx | claude-sonnet-5 | 4 | 1,858 | 8 | 235,937 | 37 |
| refute:check-manifest-unmoved.sh | claude-sonnet-5 | 4 | 1,629 | 8 | 247,452 | 34 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 1,132 | 18 | 66,417 | 20 |
| machine:bash scripts/abi/check-python-gen-clean. | claude-haiku-4-5-20251001 | 6 | 1,130 | 50 | 261,821 | 31 |
| machine:pnpm lint:check | claude-haiku-4-5-20251001 | 2 | 1,130 | 18 | 66,343 | 17 |
| refute:tongflow.abi.json | claude-sonnet-5 | 9 | 995 | 18 | 630,882 | 80 |
| machine:pnpm build && pnpm typecheck | claude-haiku-4-5-20251001 | 2 | 912 | 18 | 66,351 | 35 |
| machine:pnpm verify:plugins | claude-haiku-4-5-20251001 | 2 | 911 | 18 | 66,343 | 15 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 4 | 833 | 34 | 171,925 | 26 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 803 | 18 | 49,034 | 17 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 736 | 18 | 49,029 | 14 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 722 | 18 | 66,378 | 15 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 712 | 18 | 49,034 | 13 |
| machine:pnpm vitest run src/lib/abi/conformance. | claude-haiku-4-5-20251001 | 2 | 710 | 18 | 66,365 | 12 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 704 | 18 | 66,387 | 21 |
| machine:bash scripts/abi/check-overlay-sdk-train | claude-haiku-4-5-20251001 | 2 | 702 | 18 | 66,359 | 12 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 699 | 18 | 66,373 | 12 |
| machine:pnpm test | claude-haiku-4-5-20251001 | 2 | 692 | 18 | 66,339 | 13 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 3 | 684 | 26 | 101,715 | 16 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 676 | 18 | 49,027 | 14 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 670 | 18 | 66,416 | 11 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 666 | 18 | 66,413 | 11 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 658 | 18 | 66,396 | 11 |
| machine:pnpm vitest run src/lib/workflow/compose | claude-haiku-4-5-20251001 | 2 | 647 | 18 | 66,365 | 12 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 608 | 18 | 66,411 | 11 |
| capture:provenance | claude-sonnet-5 | 2 | 510 | 4 | 70,426 | 16 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 495 | 18 | 66,371 | 16 |
| refute:compose-overlay-op-form.tsx | claude-sonnet-5 | 5 | 472 | 10 | 330,848 | 40 |
| machine:pnpm vitest run src/components/workspace | claude-haiku-4-5-20251001 | 2 | 439 | 18 | 66,365 | 16 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 388 | 18 | 66,379 | 15 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 353 | 18 | 49,028 | 14 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 285 | 18 | 49,034 | 14 |
| machine:bash scripts/plugins/check-overlay-regis | claude-haiku-4-5-20251001 | 2 | 233 | 18 | 66,354 | 11 |
| synthesize:report | claude-sonnet-5 | 2 | 231 | 4 | 97,157 | 321 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 3 | 129 | 26 | 118,921 | 18 |
| triage | claude-sonnet-5 | 2 | 96 | 4 | 78,651 | 168 |
| machine:pnpm gen:abi && git diff --exit-code src | claude-haiku-4-5-20251001 | 2 | 2 | 18 | 49,034 | 17 |

- **claude-sonnet-5**: 22 agent · 441 calls · out 135,187 · in 4,654 · cache_read 56,949,043 · cache_create 2,140,420
- **claude-opus-5**: 2 agent · 118 calls · out 50,866 · in 234 · cache_read 17,082,695 · cache_create 336,213
- **claude-haiku-4-5-20251001**: 30 agent · 68 calls · out 19,461 · in 604 · cache_read 2,258,727 · cache_create 1,226,326

### S4 round 7 — wf_9526b14c-19f (50 agent, 261,150 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| ui:E22 | claude-sonnet-5 | 139 | 50,778 | 278 | 20,357,728 | 1310 |
| synthesize:report | claude-sonnet-5 | 16 | 43,390 | 32 | 1,823,489 | 487 |
| review:bugs | claude-opus-5 | 65 | 37,158 | 129 | 9,966,469 | 782 |
| review:conventions | claude-opus-5 | 40 | 22,783 | 327 | 5,597,345 | 540 |
| refute:exporter.ts | claude-sonnet-5 | 28 | 10,975 | 56 | 2,505,024 | 220 |
| refute:compose-overlay.tsx | claude-sonnet-5 | 16 | 8,651 | 1,551 | 1,389,125 | 205 |
| refute:run-overlay-plugin-tests.sh | claude-sonnet-5 | 11 | 8,175 | 22 | 807,723 | 140 |
| triage | claude-sonnet-5 | 2 | 7,732 | 4 | 75,674 | 75 |
| refute:compose-overlay.tsx | claude-sonnet-5 | 19 | 6,649 | 38 | 1,550,844 | 152 |
| refute:compose-overlay.tsx | claude-sonnet-5 | 10 | 6,561 | 115 | 810,063 | 109 |
| refute:package.json | claude-sonnet-5 | 6 | 6,033 | 12 | 401,123 | 90 |
| refute:evidence-report.md | claude-sonnet-5 | 13 | 5,957 | 26 | 1,035,973 | 124 |
| refute:compose-overlay-op-form.tsx | claude-sonnet-5 | 12 | 5,437 | 24 | 1,034,919 | 105 |
| judge:E23:spec-alignment | claude-sonnet-5 | 6 | 4,951 | 12 | 413,365 | 82 |
| judge:E23:operational-feasibility | claude-sonnet-5 | 3 | 4,823 | 6 | 148,167 | 71 |
| refute:compose-overlay-op-form.tsx | claude-sonnet-5 | 9 | 4,070 | 3,886 | 723,821 | 73 |
| judge:E23:domain-correctness | claude-sonnet-5 | 8 | 3,777 | 3,612 | 601,765 | 119 |
| refute:compose-overlay.tsx | claude-sonnet-5 | 7 | 3,123 | 14 | 488,153 | 64 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 7 | 1,632 | 58 | 316,804 | 36 |
| refute:CLAUDE.md | claude-sonnet-5 | 5 | 1,242 | 167 | 304,489 | 49 |
| machine:pnpm lint:check | claude-haiku-4-5-20251001 | 2 | 1,035 | 18 | 66,343 | 15 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 4 | 954 | 34 | 171,889 | 26 |
| machine:pnpm gen:abi && git diff --exit-code src | claude-haiku-4-5-20251001 | 3 | 953 | 26 | 101,763 | 24 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 897 | 18 | 49,025 | 16 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 768 | 18 | 66,373 | 13 |
| machine:bash scripts/abi/check-overlay-sdk-train | claude-haiku-4-5-20251001 | 2 | 755 | 18 | 66,359 | 14 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 729 | 18 | 49,034 | 21 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 720 | 18 | 49,034 | 16 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 713 | 18 | 49,028 | 15 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 694 | 18 | 66,417 | 11 |
| machine:pnpm verify:plugins | claude-haiku-4-5-20251001 | 2 | 684 | 18 | 66,343 | 12 |
| machine:pnpm vitest run src/lib/abi/conformance. | claude-haiku-4-5-20251001 | 2 | 662 | 18 | 66,365 | 14 |
| machine:pnpm test | claude-haiku-4-5-20251001 | 2 | 651 | 18 | 66,339 | 13 |
| machine:pnpm vitest run src/lib/workflow/compose | claude-haiku-4-5-20251001 | 2 | 633 | 18 | 66,365 | 12 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 618 | 18 | 66,396 | 10 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 599 | 18 | 66,416 | 11 |
| capture:provenance | claude-sonnet-5 | 2 | 588 | 4 | 70,426 | 17 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 550 | 18 | 66,413 | 13 |
| machine:bash scripts/plugins/check-overlay-regis | claude-haiku-4-5-20251001 | 2 | 535 | 18 | 66,354 | 10 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 482 | 18 | 66,374 | 16 |
| machine:bash scripts/abi/check-python-gen-clean. | claude-haiku-4-5-20251001 | 5 | 444 | 42 | 207,583 | 28 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 388 | 18 | 49,032 | 15 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 371 | 18 | 66,380 | 16 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 347 | 18 | 66,375 | 15 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 344 | 18 | 66,411 | 13 |
| machine:pnpm vitest run src/components/workspace | claude-haiku-4-5-20251001 | 2 | 314 | 18 | 66,365 | 14 |
| machine:cd sdk && PYTHONPATH=. uv run --no-proje | claude-haiku-4-5-20251001 | 2 | 302 | 18 | 66,387 | 19 |
| machine:pnpm build && pnpm typecheck | claude-haiku-4-5-20251001 | 2 | 280 | 18 | 66,351 | 36 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 238 | 18 | 49,029 | 13 |
| machine:bash scripts/plugins/run-overlay-plugin- | claude-haiku-4-5-20251001 | 2 | 5 | 18 | 66,377 | 15 |

- **claude-sonnet-5**: 18 agent · 312 calls · out 182,912 · in 9,859 · cache_read 34,541,871 · cache_create 1,825,468
- **claude-opus-5**: 2 agent · 105 calls · out 59,941 · in 456 · cache_read 15,563,814 · cache_create 389,990
- **claude-haiku-4-5-20251001**: 30 agent · 71 calls · out 18,297 · in 628 · cache_read 2,419,724 · cache_create 1,227,727

