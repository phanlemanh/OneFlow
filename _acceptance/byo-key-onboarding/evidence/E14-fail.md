# E14 (AC-10, ui-check) — FAIL (reproduced, root-caused)

This supersedes the "cannotRun" outcome recorded in `E14-blocked.md` (an
earlier round blocked mainly on lacking a real OpenAI credential). This round
went further: it reached a genuine node-level task failure for a missing key
and found that the very first precondition of E14 — the inline `NodeKeyPrompt`
appearing on the node after a real "missing key" failure — never happens, due
to a real client-side bug. So step 1 ("Enter a deliberately wrong key at the
node and save") cannot be performed at all: there is no key field to type
into, because the node never transitions out of its normal state after the
failed run.

## Reproduction (genuine, no mocks)

1. Started a fresh `pnpm dev` instance (port 3000 was already occupied by
   another concurrent session; mine landed on port 3001 — used, and killed at
   the end of this run).
2. Installed the real `tongflow-api-openai` plugin via the app's own
   `POST /api/plugins/install {"id":"tongflow-api-openai"}` (the only
   installed plugin that implements `gen-text` and declares `OPENAI_API_KEY`
   as `required: true`). Left installed afterwards — `plugins/` is gitignored
   and shared by every concurrent session in this checkout; removing it risks
   breaking a sibling eval that may now depend on it.
3. In the real workspace canvas (`/workspace`): added an "Add Text" node,
   typed "Write one sentence about the ocean.", clicked "Add Text" to create a
   Text asset node, selected it, used the node's own "Generate Text" quick
   action to attach a real `gen-text` node (Implementation: OpenAI,
   Model: gpt-5.1), typed instructions, and clicked Execute — with
   `OPENAI_API_KEY` unset (confirmed via `GET /api/settings/env` → `{}`).
4. The task genuinely ran and genuinely failed. Confirmed three independent
   ways:
   - DB row (`sqlite3 data/tongflow.db`): `status=failed`,
     `error={"message":"Missing required env var OPENAI_API_KEY"}` — the
     canonical sentence `classifyFailure()` is built to recognise.
   - Browser console:
     `[useAbiExecution] Task failed for node <id>: {..., error: undefined, ...}`
     — the Task object the node's key-gate logic (`noteTask`) actually
     receives has `error: undefined`, NOT the specific sentence.
   - DOM (`document.documentElement.outerHTML`, saved to `E14-step1.html`):
     contains the generic toast text "Task failed" / "Task execution failed"
     three/one times; contains ZERO occurrences of the key-prompt's own copy
     ("cần một khoá API", "Nhập khoá") or its DOM id prefix (`node-key-`).
     The inline key form never mounted.

## Root cause (read directly in source, matches the live observation exactly)

- `src/lib/plugin-executor/runners/generic.ts` throws
  `new Error(missingRequiredEnvMessage(missingKeys))` →
  `"Missing required env var OPENAI_API_KEY"`.
- `src/lib/task/runner.ts`'s outer `catch` block wraps that into the SSE
  payload as `{ message: "Task execution failed", error: errorMsg }` (generic
  `message`, specific `error`) — and separately persists the correct specific
  message to the DB (`error: serializeTaskErrorForDb({ message: errorMsg })`,
  which is why the DB row above shows the right text).
- `src/ext-default/task-events.ts`'s `notifyTask(taskId, status, data, nodeId)`
  emits `{ id, status, nodeId, data }` — there is no top-level `error` field
  on the wire event at all; the specific message only exists nested at
  `data.error`.
- `src/app/api/task/wait/route.ts` serialises that `TaskEvent` verbatim to the
  SSE stream (`jsonStringifyForSse(event)`), so the same shape reaches the
  browser.
- Client-side there are TWO consumers of this SSE message, and only one of
  them is correct:
  - `src/hooks/use-task.ts` **single-task** path (~line 408):
    `error: message.error || (message.data as Record<string, unknown>)?.error`
    — correctly falls back to `data.error`.
  - `src/hooks/use-task.ts` **batch** path (~line 719, used by
    `useBatchTaskManager`/`createBatchTasks`, which is what
    `useAbiExecution` — and therefore every ABI node's Execute button,
    including the inline key-prompt gate in `AbiNodeShell` — actually calls):
    `error: message.error` — **no fallback to `message.data?.error`**. Since
    the wire event never has a top-level `error`, this is always `undefined`
    for any failure that goes through the runner's `catch` block (which is
    exactly how "missing required env var" failures are raised).
  - `src/components/workspace/task-failure-toaster.tsx` has a related, second
    bug in the same family: `data.message?.trim() || data?.error?.trim()`
    picks `.message` first. Since the runner's `catch` block always sets
    `data.message = "Task execution failed"` (non-empty), the toaster's
    `errorText` is always the generic string too, so
    `classifyFailure(errorText)` returns `{kind:"none"}` and the toast never
    offers "Nhập khoá OPENAI_API_KEY" either — the only other UI surface that
    could have gotten the user to a key field is also closed off.

Net effect: for the class of failure this criterion is specifically about
(`throw new Error("Missing required env var X")`, the SDK-side convention
`required-env.ts` exists to produce), **neither** the node's inline key
prompt **nor** the failure toast's recovery button ever appears, on the
node-level Execute path. `key-verify.test.ts` / `required-env.test.ts` /
`failure-actions.test.ts` all pass because they unit-test each piece in
isolation with a plain string already extracted — none of them exercise the
real SSE→Task mapping that silently drops the string in the batch path.

## Assertion status

1. "a well-formed but rejected key is reported as not working at save time,
   citing the verification result" — **FAIL**. Cannot even be attempted: the
   key entry field never appears after a genuine missing-key failure on the
   node.
2. "a correct key is confirmed" — **FAIL** (unreachable for the same reason;
   also no real OpenAI credential is available in this environment to
   exercise the accept path even if the form did mount — see
   `E14-blocked.md` Blocker 1, still true here).

## Evidence

- `E14-step1.html` — live `document.documentElement.outerHTML` of the
  workspace right after the failed run (fallback: `capture.ui`
  (`pnpm ui:capture`) launches an isolated headless Chrome profile with no
  shared localStorage/session, so it cannot reproduce this interactive
  session's canvas state — verified by running it, which loaded the
  unrelated default "Ví dụ / example" workflow instead. HTML snapshot of the
  real interactive session was used instead, per the fallback rule).
- `E14-network.txt` — network/console dump, plus the DB row's exact error
  text for cross-reference.

## What this run touched (and left in an intended-safe state)

- Own `pnpm dev` on port 3001 — stopped at the end (`kill`), port 3000's
  pre-existing server (pid 895, not started by this run) was left untouched.
- Installed `plugins/tongflow-api-openai` — left in place (gitignored,
  shared by concurrent sessions, added via the app's own supported install
  API, not a hack).
- Added nodes to the (already-shared, already-mutating) canvas under this
  run's own dev server instance on port 3001, isolated from the canvas other
  concurrent sessions were driving on port 3000/3201/etc.
- No tracked file was modified. No `.env` or credential was read into any
  UI field or console command.
