# Director Agent — Design Spec (v0 sketch)

Date: 2026-07-24
Status: approved design, pre-implementation
Scope: TongFlow self-hosted web app (this repo)

## 1. Goal

Add a "Director agent" to the TongFlow canvas: the user types an intent in natural
language ("làm MV hoạt hình từ bài hát này"), Claude translates it into a valid
workflow graph, and the graph lands on the canvas **unexecuted** for the user to
review, edit, and run with the existing execution button.

This implements the hybrid pattern agreed in design discussion: *agent turns
intent into structure; a deterministic workflow engine turns structure into
results; the human approves at gates.* Gate 1 = the generated graph on the
canvas. The existing run button and node-level result review remain the
execution path and Gate 2 — this feature adds no execution behavior.

### Non-goals (v0)

- No conversational editing of an existing graph (that is the B+C evolution,
  see §13).
- No auto-run after generation, ever.
- No file/media source assets in the DSL — text sources only. The Director
  cannot invent images/audio; users add media nodes manually afterwards.
- No plugin selection by the LLM — the compiler assigns the installed default
  plugin per slot.
- No streaming UI for the LLM call (response is a small JSON plan).

## 2. Decisions already made

| Question | Decision |
|---|---|
| Where it lives | In-app: prompt panel on canvas + `POST /api/director` |
| LLM | Claude API, model `claude-opus-4-8`, key `ANTHROPIC_API_KEY` from Settings env store |
| Node vocabulary | Auto-derived from ABI + registries, filtered to installed plugins |
| After generation | Graph replaces canvas (confirm dialog if canvas non-empty); never auto-runs |
| Generation architecture | **B: DSL + deterministic compiler.** Claude emits a small step-plan DSL; a TS compiler emits ReactFlow `{nodes, edges}` that are valid by construction. DSL is designed as a public contract so agentic tool-use (architecture C) can operate on it later. |
| UI stack | shadcn/ui conventions (repo already uses them) + AI SDK Elements `PromptInput` for the prompt surface — per user's standing preference |

## 3. Architecture overview

```
DirectorPrompt (canvas UI)
    │  POST /api/director { prompt }
    ▼
route.ts ──► director.server.ts
                │ 1. vocabulary.server.ts  (ABI + installed plugins → system prompt block)
                │ 2. Claude messages.parse (structured output = DSL zod schema)
                │ 3. compile.ts            (DSL → ReactFlow nodes/edges, deterministic)
                │ 4. validate              (connection rules + cycle check via WorkflowParser)
                │ 5. on error: one retry with error feedback → else 422
                ▼
{ name, description, nodes, edges }
    │
    ▼
DirectorPrompt: confirm-replace (AlertDialog) → useFlow.setNodes/setEdges/
setWorkflowName/setWorkflowDescription  (same path the bundled example loader uses)
```

Key reuse points (all existing code):

- `parseWorkflowImportJson` (`src/lib/workflow/exporter.ts`) already accepts
  root-level `{ nodes, edges, name, description }` — the API response shape is
  chosen to be importable by that same function.
- `NODE_TYPE_TO_ABI_FEATURE` (`src/lib/abi/node-feature-registry.ts`) — RF node
  type ↔ ABI slot mapping.
- `handle-introspect.ts` (`src/lib/abi/`) — `getAbiTopology`, `sourceHandleId`,
  `targetHandleId`, `FieldClass` (handle vs config classification, upstream
  `DataNodeType`, extraction path).
- `WorkflowParser` (`src/lib/workflow/parser.ts`) — dependency levels (layout)
  and cycle detection.
- Connection validator (`src/lib/workflow/connection-validator.ts`) — final
  safety net over generated edges.
- Env store (`src/lib/settings/env-store.server.ts`) — `ANTHROPIC_API_KEY`
  from the in-app Settings dialog (no restart needed), falling back to process
  env, via the same merge order as plugin spawn env.
- Plugins registry (`src/lib/plugins/plugins-registry.server.ts`) — installed
  plugins per slot; head of `nodePluginMap[slot]` is the default plugin.

## 4. New components

| File | Responsibility |
|---|---|
| `src/lib/director/dsl.ts` | DSL TypeScript types + zod schema (`DirectorPlanSchema`). Shared by server (structured output + validation) and tests. No server-only imports. |
| `src/lib/director/vocabulary.server.ts` | Build the vocabulary block of the system prompt from `ABI_NODES` + `NODE_TYPE_TO_ABI_FEATURE` + installed-plugin registry. Deterministic output (sorted) so prompt caching hits. |
| `src/lib/director/compile.ts` | Pure function `compilePlan(plan, options) → { nodes, edges, errors }`. No I/O; slot→plugin map passed in as an argument so it stays unit-testable. |
| `src/lib/director/director.server.ts` | Orchestrates one generation: build prompts, call Claude, compile, validate, retry once, map SDK errors to the error taxonomy. |
| `src/app/api/director/route.ts` | Thin HTTP wrapper: parse request, call director, shape success/error JSON. |
| `src/components/ai-elements/prompt-input.tsx` | Vendored by `npx ai-elements@latest add prompt-input` (AI Elements registry → shadcn flow). Not hand-written. |
| `src/components/workspace/director-prompt.tsx` | Toggle button + floating panel hosting `PromptInput`; confirm-replace dialog; injects result into `useFlow`. |

Modified files: `src/components/workspace/workspace.tsx` (mount the component),
`package.json` (add `@anthropic-ai/sdk`), `src/i18n/messages/{en,zh,ja,ko}.json`
(new `director.*` keys).

## 5. DSL contract (`dslVersion: 1`)

The DSL is the IR between model and engine. It is versioned and treated as a
public contract: architecture C (tool-use editing) will mutate this same
structure later, and Gate-1-as-diff will diff it.

```jsonc
{
  "dslVersion": 1,
  "name": "Mèo và chuột",
  "description": "Hai nhân vật hoạt hình chụp ảnh chung rồi thành video",
  "steps": [
    { "id": "s1", "kind": "text", "text": "a cute cat, cartoon style" },
    { "id": "s2", "kind": "gen",  "slot": "image-gen",
      "inputs": { "text": "@s1" }, "params": { "width": 1024, "height": 1024 } },
    { "id": "s3", "kind": "text", "text": "a cute mouse, cartoon style" },
    { "id": "s4", "kind": "gen",  "slot": "image-gen", "inputs": { "text": "@s3" } },
    { "id": "s5", "kind": "gen",  "slot": "image-fusion",
      "inputs": { "images": ["@s2", "@s4"],
                   "text": "cat and mouse take a photo together" } },
    { "id": "s6", "kind": "gen",  "slot": "image-gen-video",
      "inputs": { "image": "@s5", "text": "drinking" },
      "params": { "duration": 5 } }
  ]
}
```

Semantics:

- `steps[].id` — unique short string; referenced as `"@<id>"`.
- `kind: "text"` — a literal text source asset. The only source kind in v0.
- `kind: "gen"` — an executable step. `slot` must be one of the ABI `nodeSlot`
  strings present in the vocabulary (i.e. has ≥1 installed plugin).
- `inputs` — map from ABI **handle field** name → `"@id"` reference, literal
  string (inline text for text-typed handle fields), or array of those (for
  array-typed handle fields such as `images`). References must point to an
  earlier step whose output modality matches the field's expected modality.
- `params` — map from ABI **config field** name → scalar value (width, height,
  duration, …). Optional; compiler fills nothing — absent params stay absent
  and the node's own form defaults apply after mount.
- Order matters only for readability; the compiler derives the DAG solely from
  references.

Zod schema notes (structured-outputs constraints): no recursion; every object
`additionalProperties: false`; `inputs`/`params` are records with
string/number/array-of-string values. Reference syntax is validated by the
compiler, not the schema (schema keeps Claude unconstrained on key names —
wrong keys become compiler errors that drive the retry loop).

## 6. Compiler

`compilePlan(plan, { slotToNodeType, slotDefaultPlugin, topologyForSlot })`:

1. **Resolve node types.** Inverse of `NODE_TYPE_TO_ABI_FEATURE`, built once:
   first declaration wins, with an explicit preference table for slots that map
   to multiple RF node types (prefer the non-`Compose` variant, e.g.
   `image-gen-video → imageGenVideoNode`, `text-gen-speech-clone →
   textGenSpeechCloneNode`).
2. **Emit source nodes.** Each `text` step → `addTextNode` (data
   `{ manualValue }`) + `textNode` (data `{ texts: [text] }`) + edge
   `addText → in:textNode`, mirroring `public/example.json` exactly.
3. **Emit gen nodes.** Each `gen` step → executable node + one output modality
   node (`imageNode`/`videoNode`/`textNode`/`audioNode`/…, from the slot's ABI
   output topology) + edge `out:<field> → in:<modalityNode>`.
4. **Wire inputs.** For each `inputs` entry: resolve `"@id"` to that step's
   output modality node, then add edge `out:<DataNodeType> →
   in:<field>` using `sourceHandleId`/`targetHandleId` from handle-introspect.
   Inline literal text on a text-typed handle field spawns its own
   `addTextNode + textNode` pair (same as a `text` step).
5. **Assemble `data`.** Per node: `feature` (slot), `pluginId` (default
   installed plugin for the slot), config `params` passed through, and
   handle-fed fields initialized per `FieldClass.path` conventions
   (`texts`, `fileKeys`, `ids`) mirroring the shapes observed in
   `public/example.json`. Implementation must verify against
   `exporter.ts`/`use-flow` expectations during build and keep the example
   file as the reference fixture.
6. **Layout.** Run `WorkflowParser` on the emitted graph → execution levels.
   `x = level * 520`, `y` = row index within level * 430, origin near
   `{ x: 0, y: 0 }` (React Flow `fitView` on import handles centering).
   Node `id`s are `crypto.randomUUID()`.
7. **Errors collected, not thrown** (all with step id + message): unknown slot,
   slot without installed plugin (includes plugin ids from the official-plugin
   catalog when known), unknown reference, modality mismatch on a reference,
   array/scalar mismatch, cycle detected, unknown input field for slot.

After compilation, run the existing connection validator over the emitted
edges; validator failures join the same error list.

## 7. Vocabulary generation

`vocabulary.server.ts` renders one markdown block per available slot:

```
### image-gen  (Text to Image)
inputs:  text: string (required, handle)
params:  width: integer, height: integer
output:  image
```

- Source of truth: `ABI_NODES` (via `getAbiTopology`) for fields, required
  flags, handle-vs-config classification, and output modality.
- Filter: only slots whose `nodePluginMap[slot]` is non-empty (≥1 installed
  plugin). The `text` step kind is documented statically.
- Sorted by slot name; no timestamps or randomness — byte-stable output is
  required for prompt-cache hits (see §8).
- Slot count is ~61 max; rendered block is roughly 2–4k tokens.

## 8. LLM call

- SDK: `@anthropic-ai/sdk` (new dependency; latest release — must support zod
  v4 `zodOutputFormat`; the repo pins zod 4.1.8).
- Call: `client.messages.parse({ model: "claude-opus-4-8", max_tokens: 16000,
  thinking: { type: "adaptive" }, system: [rulesBlock, vocabBlock+cache_control],
  messages: [user prompt] , output_config: { format:
  zodOutputFormat(DirectorPlanSchema) } })`. No temperature/top_p (removed on
  this model family).
- System prompt layout (stable → volatile, for prefix caching):
  1. Static rules block: role, the DSL semantics from §5, hard rules ("only
     slots from the vocabulary", "text sources only", "prefer parallel branches
     where independent"), and one few-shot pair — the bundled example workflow
     expressed as prompt → DSL.
  2. Vocabulary block (deterministic, changes only when plugins change), with
     `cache_control: { type: "ephemeral" }` on this final system block.
  3. User turn: the raw user prompt (after the cache breakpoint).
- Retry loop: `parse → compile → validate`. On errors, append one user turn:
  "Your plan failed validation: <error list>. Return a corrected plan." and
  call `parse` again. Max 1 retry, then fail with `PLAN_INVALID`.
- API key resolution: `loadEnvStore()` value overrides `process.env`, matching
  `withStoredEnv` precedence. Missing key → `MISSING_API_KEY` without calling
  the API.

## 9. API route contract

`POST /api/director` — request `{ "prompt": string (1..2000 chars) }`.

Success `200`:

```json
{ "name": "...", "description": "...", "nodes": [...], "edges": [...] }
```

(Directly consumable by `parseWorkflowImportJson`; the client still runs it
through that function for uniformity with the import path.)

Error responses `{ "error": { "code": "...", "message": "...", "details": [...] } }`:

| code | HTTP | Trigger | UI action |
|---|---|---|---|
| `MISSING_API_KEY` | 400 | No `ANTHROPIC_API_KEY` in env store/process env | Toast + hint to open Settings |
| `AUTH_FAILED` | 401 | SDK `AuthenticationError` | Toast: invalid key |
| `RATE_LIMITED` | 429 | SDK `RateLimitError` | Toast: retry later |
| `PLAN_INVALID` | 422 | Compile/validate errors after retry | Toast with first 1–2 errors |
| `MISSING_PLUGIN` | 422 | Plan needs slot with no installed plugin | Toast naming the plugin(s); hint to open plugin manager |
| `UPSTREAM_ERROR` | 502 | `APIConnectionError` / 5xx `APIStatusError` | Generic toast |

Error mapping uses the SDK's typed exception chain (most-specific first), never
message string matching. `PLAN_INVALID` vs `MISSING_PLUGIN`: if every remaining
error is a missing-plugin error, return `MISSING_PLUGIN`; otherwise
`PLAN_INVALID`.

## 10. UI

- **Entry point**: icon button (lucide `Sparkles`, tooltip i18n `director.open`)
  appended to the existing top-left control cluster in `workspace.tsx`.
- **Panel**: floating card, top-center, ~560px wide, containing the AI Elements
  `PromptInput` (`PromptInputTextarea` + `PromptInputSubmit`) used standalone —
  `onSubmit` posts to `/api/director`; local `status` state
  (`ready → submitted → ready/error`) drives the submit button spinner; inputs
  disabled while pending. Esc or outside-click closes when idle.
- **Result flow**: on 200 → if `useFlow` has ≥1 node, open `AlertDialog`
  ("Thay thế canvas hiện tại?" — destructive action confirm); on confirm (or
  empty canvas) run the exact example-loader sequence: `parseWorkflowImportJson`
  → `setNodes` → `setEdges` → `setWorkflowName` → `setWorkflowDescription`;
  success toast; panel closes. The graph is selected/framed by React Flow
  `fitView`. Never triggers execution.
- **Components**: only shadcn primitives already in `src/components/ui` plus
  the vendored AI Elements prompt-input. No new bespoke UI primitives.
- **i18n**: `director.*` keys added to all four locales (en, zh, ja, ko).

## 11. Testing

Unit (vitest, no network; Claude call mocked at `parsed_output` level):

- `compile.test.ts` — the §5 example plan compiles to a graph shape-equivalent
  to `public/example.json` (node types, `data` keys, handle ids
  `out:textNode→in:text`, `out:image→in:imageNode`, `out:imageNode→in:images`,
  sandwich structure, level-based positions); error cases: unknown ref, unknown
  slot, missing plugin, modality mismatch, cycle, scalar-vs-array mismatch.
- `dsl.test.ts` — zod schema accepts the example, rejects malformed shapes.
- `vocabulary.test.ts` — includes installed slots, excludes uninstalled ones,
  byte-stable across two runs.
- `director.server.test.ts` — retry loop: first plan invalid → error feedback
  turn appended → second plan valid; error taxonomy mapping for each SDK
  exception class.

Manual acceptance: with `ANTHROPIC_API_KEY` set and the demo plugins installed,
prompt "một con mèo và một con chuột chụp ảnh chung rồi làm thành video" →
canvas shows a graph equivalent to the bundled example; run button executes it
unchanged. Repo gates: `pnpm lint:check`, `pnpm typecheck`, `pnpm test`,
`pnpm build`.

## 12. Setup

- `pnpm add @anthropic-ai/sdk`
- `npx ai-elements@latest add prompt-input` (vendors the component via the
  shadcn registry flow into `src/components/ai-elements/`)
- Optional, once per machine (agent skills for future sessions):
  `pnpm dlx skills add shadcn/ui` and `npx skills add vercel/ai-elements`
- User-side: add `ANTHROPIC_API_KEY` in the in-app Settings dialog.

## 13. Evolution path (context, not v0 scope)

- **B+C**: expose DSL-mutating tools (add/replace/remove step, change params)
  to a conversational agent; compiler and validator stay the bottom layer.
  Gate 1 evolves from "review whole graph" to "review DSL diff".
- **Evidence gate**: attach per-step execution results to DSL step ids so Gate
  2 can show "which step produced this asset" provenance.
- The `dslVersion` field exists so both can migrate the contract explicitly.
