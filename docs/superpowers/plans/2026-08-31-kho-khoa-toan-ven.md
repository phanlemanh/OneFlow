# Kho khoá toàn vẹn — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop the key store from silently dropping keys on read, and from leaving a truncated file on write.

**Architecture:** Three edits inside the store layer plus one teeth script. `coerceEnv` gains a closed four-branch decision table; `saveEnvStore` throws instead of filtering; `writeSettingsBlob` writes to a sibling temp file and renames. No file under `src/app/api/**` is touched, which is what keeps this T2.

**Tech Stack:** TypeScript, vitest (real temp dirs, no seam mock), bash.

**Spec:** [`docs/superpowers/specs/2026-08-31-kho-khoa-toan-ven-design.md`](../specs/2026-08-31-kho-khoa-toan-ven-design.md)
**Contract:** [`_acceptance/kho-khoa-toan-ven/contract.md`](../../../_acceptance/kho-khoa-toan-ven/contract.md) · 12 AC · 13 evals

---

## Global Constraints

- **Never touch `src/app/api/**`.** It is in `risk_tiers.t3_paths`; one edit there makes this T3 and adds a human gate. AC-12 measures the route's behaviour by **importing the handler into a store-layer test file** — reading is free, writing is not.
- **`readSettingsBlob` / `writeSettingsBlob` signatures are frozen.** They are the `@ext/settings-store` seam; the cloud shell ships its own `src/ext/settings-store.ts`, gitignored, in another repo. A signature change breaks it where no test in this repo runs. Pinned strings live in AC-8.
- **Comments in English only** (CLAUDE.md). Vietnamese only in user-facing `echo`.
- **Fake key values everywhere.** The real store holds API keys. Use `sk-fake`, never anything resembling a real credential.
- **Inherited invariants that must not break:** `loadEnvStore` stays forgiving (a broken store must never block a run); the four reason codes `io | decode | parse | shape` gain no fifth member.
- Before every commit: `pnpm lint:check`, `pnpm typecheck`. Run `pnpm build` once at the end — it costs 299s.
- Branch `feat/kho-khoa-toan-ven` already exists with the Gate-1 record at `6714569`.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/lib/settings/env-store.server.ts` | **Modify.** `coerceEnv` decision table; `saveEnvStore` throws. |
| `src/ext-default/settings-store.ts` | **Modify.** `writeSettingsBlob` temp+rename. Signature frozen. |
| `src/lib/settings/env-store.server.test.ts` | **Modify.** Ten new cases; existing eleven must keep passing. |
| `scripts/settings/check-env-store-teeth.sh` | **Create.** Seven cases proving the red direction, in an isolated worktree. |

---

### Task 1: `coerceEnv` — the four-branch decision table

**Files:** Modify `src/lib/settings/env-store.server.ts:38-49`, `src/lib/settings/env-store.server.test.ts`

**Makes green:** E1 (AC-1), E2 (AC-2), E3 (AC-3), E4 (AC-4).

**Interfaces:**
- Produces: `coerceEnv(parsed: unknown): EnvStore | null` — signature unchanged; `null` still means "the whole store is unreadable", so `readEnvStore`'s existing `shape` branch keeps working untouched.

- [ ] **Step 1: Write the four failing tests**

```ts
describe("coerceEnv decision table", () => {
  it("coerces scalars and keeps every key", async () => {
    writeFileSync(store(), JSON.stringify({ OPENAI_API_KEY: "sk-fake", PORT: 8080, DEBUG: true }));
    const { readEnvStore } = await import("./env-store.server");
    const read = await readEnvStore();
    expect(read.state).toBe("ok");
    // Assert the whole MAP, not one key: before the fix four keys vanished
    // while the state still read "ok", so a check that only looks at
    // OPENAI_API_KEY passes on the broken version too.
    expect(read.state === "ok" && read.env).toEqual({
      OPENAI_API_KEY: "sk-fake", PORT: "8080", DEBUG: "true",
    });
  });

  it("refuses structured values instead of stringifying them", async () => {
    // Full matrix: one store per shape, three assertions for three members.
    for (const bad of [{ NESTED: { a: 1 } }, { LIST: [1, 2] }, { NULLED: null }]) {
      rmSync(store(), { force: true });
      writeFileSync(store(), JSON.stringify({ OPENAI_API_KEY: "sk-fake", ...bad }));
      vi.resetModules();
      const { readEnvStore } = await import("./env-store.server");
      const read = await readEnvStore();
      expect(read).toEqual({ state: "unreadable", reason: "shape" });
      // The trap String(v) would spring: "[object Object]" is a garbage value
      // that looks valid. Assert it never appears anywhere in the result.
      expect(JSON.stringify(read)).not.toContain("[object Object]");
    }
  });

  it("refuses empty keys", async () => {
    for (const key of ["", "   "]) {
      rmSync(store(), { force: true });
      writeFileSync(store(), JSON.stringify({ [key]: "x", OPENAI_API_KEY: "sk-fake" }));
      vi.resetModules();
      const { readEnvStore } = await import("./env-store.server");
      expect(await readEnvStore()).toEqual({ state: "unreadable", reason: "shape" });
    }
  });

  it("leaves an all strings untouched store exactly as it is", async () => {
    // The suppressing half. Without it, a fix that always returns
    // "unreadable", or one that rewrites every value, passes the three above.
    const onDisk = { OPENAI_API_KEY: "sk-fake", ANTHROPIC_API_KEY: "sk-fake-2", REGION: "" };
    writeFileSync(store(), JSON.stringify(onDisk));
    const { readEnvStore } = await import("./env-store.server");
    const read = await readEnvStore();
    expect(read.state === "ok" && read.env).toEqual(onDisk);
  });
});
```

Note `REGION: ""` in the last case: an empty *value* is legal (an env var set to the
empty string), only an empty *key* is not. This case pins that distinction.

- [ ] **Step 2: Run them to verify they fail**

Run: `pnpm vitest run src/lib/settings/env-store.server.test.ts -t 'decision table'`
Expected: FAIL — the scalar case loses `PORT`/`DEBUG`, the structured and empty-key cases return `{state:"ok"}` instead of refusing.

- [ ] **Step 3: Implement the table**

```ts
/**
 * Read a parsed store into the flat string map, or refuse the whole thing.
 *
 * Closed decision table, one behaviour per branch — and NO branch drops a key
 * silently, which is the bug this replaces:
 *
 *   string           -> kept as is
 *   number, boolean  -> String(v); env vars are strings anyway, so this is the
 *                       value the system would have used
 *   object/array/null-> the WHOLE store is unreadable. String({a:1}) is
 *                       "[object Object]": that turns a fault into a
 *                       valid-looking garbage value, which is a different kind
 *                       of quiet, not the end of quiet.
 *   empty/blank key  -> the WHOLE store is unreadable. An empty env var name
 *                       cannot be repaired by a type change.
 *
 * Measured before the fix (2026-08-31): a store holding four non-string values
 * read back as one key with state "ok".
 */
function coerceEnv(parsed: unknown): EnvStore | null {
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return null;
    }
    const out: EnvStore = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
        if (!k.trim()) return null;
        if (typeof v === "string") out[k] = v;
        else if (typeof v === "number" || typeof v === "boolean") out[k] = String(v);
        else return null;
    }
    return out;
}
```

Note the key is kept verbatim (`out[k]`, not `out[k.trim()]`): trimming would
silently rename `" KEY "` to `"KEY"`, and two keys that differ only by
whitespace would collide and one would vanish — the same class of loss.

- [ ] **Step 4: Run to verify they pass**

Run: `pnpm vitest run src/lib/settings/env-store.server.test.ts`
Expected: all cases pass, including the eleven that predate this task.

- [ ] **Step 5: Commit**

```bash
git add src/lib/settings/env-store.server.ts src/lib/settings/env-store.server.test.ts
git commit -m "fix(settings): coerce scalars instead of dropping keys on read"
```

---

### Task 2: `saveEnvStore` — throw instead of filter

**Files:** Modify `src/lib/settings/env-store.server.ts`, `src/lib/settings/env-store.server.test.ts`

**Makes green:** E5 (AC-5), E13 (AC-12).

**Interfaces:**
- Produces: `saveEnvStore(env: EnvStore): Promise<void>` — signature unchanged; now rejects with an `Error` whose message names the offending key.

**Why it must refuse an empty key rather than drop it:** if it wrote one, it would
create a store that `coerceEnv` (Task 1) refuses on the very next read. Write succeeds,
read fails — worse than either.

- [ ] **Step 1: Write the failing tests**

```ts
it("save refuses a bad key and leaves the store untouched", async () => {
  writeFileSync(store(), JSON.stringify({ OPENAI_API_KEY: "sk-fake" }));
  const before = readFileSync(store(), "utf8");
  const { saveEnvStore } = await import("./env-store.server");
  await expect(saveEnvStore({ "": "x" } as never)).rejects.toThrow(/empty|rỗng/i);
  await expect(saveEnvStore({ PORT: 8080 } as never)).rejects.toThrow(/PORT/);
  // The half that matters: it threw AND it did not touch the disk.
  expect(readFileSync(store(), "utf8")).toBe(before);
});

it("save refuses on a machine with no store yet and leaves the directory clean", async () => {
  // "Wrote nothing" means something different here: the target must still be
  // ABSENT. The sha-compare above needs the file to exist, so it cannot see
  // this case — and this is the case where an orphaned empty settings.json
  // would turn "no store yet" into "empty store" for onboarding.
  expect(existsSync(store())).toBe(false);
  const { saveEnvStore } = await import("./env-store.server");
  await expect(saveEnvStore({ "": "x" } as never)).rejects.toThrow();
  expect(existsSync(store())).toBe(false);
  expect(readdirSync(dir)).toEqual([]);
});

it("empty key through PUT fails loudly and saves nothing", async () => {
  writeFileSync(store(), JSON.stringify({ OPENAI_API_KEY: "sk-old" }));
  const before = readFileSync(store(), "utf8");
  // Import the route handler; do NOT edit anything under src/app/api/**.
  const { PUT } = await import("@/app/api/settings/env/route");
  const res = await PUT(new Request("http://localhost/api/settings/env", {
    method: "PUT",
    body: JSON.stringify({ env: { "": "x", OPENAI_API_KEY: "sk-fake" } }),
  }) as never);
  expect(res.status).toBeGreaterThanOrEqual(400);
  expect(JSON.stringify(await res.json())).toMatch(/empty|rỗng|key/i);
  // All or nothing: the valid key must NOT be half-saved.
  expect(readFileSync(store(), "utf8")).toBe(before);
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `pnpm vitest run src/lib/settings/env-store.server.test.ts -t 'save refuses'`
Expected: FAIL — today `saveEnvStore` filters silently and resolves.

- [ ] **Step 3: Implement**

```ts
/**
 * Persist the env map, overwriting the previous contents.
 *
 * A non-string value or a blank key reaching here is a PROGRAMMING error, not
 * user data: the parameter is typed `Record<string, string>`. The previous
 * version filtered both away silently, which hid the mistake — and for a blank
 * key it did worse than hide it, because writing one produces a store that
 * `coerceEnv` refuses on the next read.
 */
export async function saveEnvStore(env: EnvStore): Promise<void> {
    for (const [k, v] of Object.entries(env)) {
        if (!k.trim()) {
            throw new Error(
                "saveEnvStore: refusing an empty environment variable name — the store would be unreadable on the next read",
            );
        }
        if (typeof v !== "string") {
            throw new Error(`saveEnvStore: value for \`${k}\` is ${typeof v}, expected string`);
        }
    }
    const encoded = await encodeEnvStore(JSON.stringify(env, null, 2));
    await writeSettingsBlob(encoded);
}
```

The validation loop runs **before** any encode or write, so nothing reaches disk.

- [ ] **Step 4: Run to verify they pass**

Run: `pnpm vitest run src/lib/settings/env-store.server.test.ts`
Expected: all pass. If the PUT case returns 500 rather than a 4xx, that is
acceptable under AC-12 (it only requires a non-2xx that names the key) — but
record the actual status in the evidence, do not silently accept whatever comes.

- [ ] **Step 5: Commit**

```bash
git add src/lib/settings/env-store.server.ts src/lib/settings/env-store.server.test.ts
git commit -m "fix(settings): refuse bad keys on save instead of filtering them away"
```

---

### Task 3: `writeSettingsBlob` — temp file and rename

**Files:** Modify `src/ext-default/settings-store.ts:36-40`, `src/lib/settings/env-store.server.test.ts`

**Makes green:** E6 (AC-6), E7 (AC-7), E8 (AC-8).

**Interfaces:**
- Produces: `writeSettingsBlob(blob: string): Promise<void>` — **signature frozen**, body replaced.

**The hard part is measuring it.** Only the concurrent-reader assertion distinguishes
the two implementations, and it is easy to write a version that passes vacuously.
Two rules from the clean-context review, both mandatory:

1. The reader runs in a **separate OS process**. A same-process loop can never
   interleave with a synchronous write — JS will not schedule it — so it would
   observe only the new bytes and pass on the broken implementation too.
2. The sample set must **straddle**: at least one old sample AND at least one new
   sample. Not straddling is **INCONCLUSIVE**, not PASS.

- [ ] **Step 1: Write the failing tests**

```ts
it("no temp file is left behind, on the success path and the failure path", async () => {
  const { writeSettingsBlob } = await import("@ext/settings-store");
  await writeSettingsBlob(JSON.stringify({ A: "1" }));
  expect(readdirSync(dir).sort()).toEqual(["settings.json"]);

  // Failure path: make the directory read-only so the temp write fails.
  // Skipped as root, which ignores mode bits — the repo's existing pattern.
  if (!isRoot()) {
    chmodSync(dir, 0o500);
    await expect(writeSettingsBlob("x".repeat(1024))).rejects.toThrow();
    chmodSync(dir, 0o700);
    expect(readdirSync(dir).sort()).toEqual(["settings.json"]);
  }
});

it("a concurrent reader never sees a partial file", async () => {
  const OLD = JSON.stringify({ OLD: "y".repeat(1_000) });
  writeFileSync(store(), OLD);
  const NEW = JSON.stringify({ NEW: "z".repeat(6_000_000) }); // >= 4 MB

  // A separate OS process. A same-process loop cannot interleave with a
  // synchronous write, so it would pass on the old implementation too.
  const reader = spawn(process.execPath, ["-e", `
    const fs = require("node:fs");
    const out = [];
    const until = Date.now() + 4000;
    while (Date.now() < until) {
      try { out.push(fs.readFileSync(process.argv[1], "utf8").length); } catch {}
    }
    process.stdout.write(JSON.stringify(out));
  `, store()]);

  await new Promise((r) => setTimeout(r, 150)); // let the reader start
  const { writeSettingsBlob } = await import("@ext/settings-store");
  await writeSettingsBlob(NEW);

  const samples: number[] = JSON.parse(await collect(reader));
  const old = samples.filter((n) => n === OLD.length).length;
  const fresh = samples.filter((n) => n === NEW.length).length;
  const partial = samples.filter((n) => n !== OLD.length && n !== NEW.length);
  console.log(`mẫu cũ=${old} mẫu mới=${fresh} tổng=${samples.length}`);

  // INCONCLUSIVE, not PASS: "every sample is valid" is vacuously true when the
  // reader ran entirely after the write.
  if (old === 0 || fresh === 0) {
    throw new Error(`không bắc qua được lượt ghi (cũ=${old} mới=${fresh}) — không kết luận được`);
  }
  expect(partial).toEqual([]);
});
```

`collect(reader)` is a two-line helper that concatenates stdout and resolves on
`close`. Put it beside the test, not in a shared util — one caller.

- [ ] **Step 2: Run to verify they fail**

Run: `pnpm vitest run src/lib/settings/env-store.server.test.ts -t 'concurrent reader'`
Expected: FAIL with partial samples listed — the current `writeFileSync` truncates first.
**Record the actual partial-sample count in the evidence**; that number is the proof the
measurement discriminates.

- [ ] **Step 3: Implement**

```ts
/**
 * Persist the raw settings blob for the current scope.
 *
 * Temp file in the SAME directory, then rename. Rename is atomic within one
 * filesystem, so a concurrent reader sees either the whole old file or the
 * whole new one — never a truncated one. The previous version wrote straight
 * onto settings.json, so an interrupted write left a stub: exactly the corrupt
 * store that `chong-mat-khoa-byo` taught the reader to refuse. That feature
 * treated the symptom; this removes the source.
 *
 * Same directory is load-bearing, not tidiness: rename across filesystems is
 * a copy, and a copy is not atomic.
 *
 * SIGNATURE FROZEN — this is the `@ext/settings-store` seam and the cloud
 * shell ships its own copy in another repo.
 */
export async function writeSettingsBlob(blob: string): Promise<void> {
    const dir = await scopedDataDir();
    mkdirSync(dir, { recursive: true });
    const target = path.join(dir, "settings.json");
    const tmp = path.join(dir, `.settings.json.${process.pid}.${Date.now()}.tmp`);
    try {
        writeFileSync(tmp, blob, "utf8");
        renameSync(tmp, target);
    } catch (err) {
        rmSync(tmp, { force: true });
        throw err;
    }
}
```

- [ ] **Step 4: Run to verify they pass**

Run: `pnpm vitest run src/lib/settings/env-store.server.test.ts`
Expected: all pass; the concurrent-reader case prints a straddling `mẫu cũ`/`mẫu mới` pair.

- [ ] **Step 5: Commit**

```bash
git add src/ext-default/settings-store.ts src/lib/settings/env-store.server.test.ts
git commit -m "fix(settings): write the store atomically via temp file and rename"
```

---

### Task 4: The teeth script

**Files:** Create `scripts/settings/check-env-store-teeth.sh`

**Makes green:** E8 (AC-8, case `seam-signature`), E11 (AC-11, all seven cases).

**Reference shape:** `scripts/roadmap/check-roadmap-guard-teeth.sh` and
`scripts/ci/check-product-map-teeth.sh` — `--case` addressable and repeatable, one exit
code per case, `CASE <name>: PASS|FAIL` tokens, unknown case → exit 2, `--list`.

**Two constraints from the clean-context review, both load-bearing:**

**(a) Isolation.** The script patches source files. E1–E10 and E12 read those same files
and **run in parallel**. Patching in the shared tree makes an unrelated eval go red for a
reason nobody can reproduce, and a killed run leaves the tree carrying reverted code —
green next time, on code that regressed.

Use `git worktree add "$WT" HEAD` and symlink node_modules:

```bash
wt=$(mktemp -d)/wt
git worktree add --detach -q "$wt" HEAD
ln -s "$repo_root/node_modules" "$wt/node_modules"
trap 'git worktree remove --force "$wt" 2>/dev/null || true' EXIT INT TERM
```

**Verify the symlink actually works before building the rest** — pnpm's node_modules is
a symlink farm into `.pnpm`, and a symlinked root may or may not resolve. Run one
untouched test inside the worktree first. If it does not resolve, fall back to: patch in
place, `trap` restore from a `cp` backup on `EXIT INT TERM`, and add a Known limit saying
E11 must not run concurrently with E1–E10/E12. **Do not use `git checkout` to restore** —
it destroys uncommitted work; that cost a rebuild once already.

Either way, the last thing the script does is assert the shared tree is clean:

```bash
git -C "$repo_root" diff --quiet -- src/lib/settings/env-store.server.ts src/ext-default/settings-store.ts \
  && echo "cây chung sạch: hai file phạm vi không đổi" \
  || { echo "FAIL: cây chung BẨN sau khi chạy răng" >&2; exit 1; }
```

**(b) No credit for a vague red.** A `sed` that breaks syntax makes vitest exit 1, and a
script that only checks "suite went red" prints PASS for a teeth case that proved
nothing. Each case declares, up front, **which test name must fail** and **which message
fragment must appear**; assert both. A run where vitest collects zero tests, or dies on a
parse error, is **exit 2 (inconclusive)** — never PASS.

- [ ] **Step 1: Write the script with all seven cases**

| Case | Patch applied to the worktree | Test that must go red |
|---|---|---|
| `coerce-scalar` | drop the `number`/`boolean` branch | `coerces scalars` |
| `refuse-structured` | `return null` → `out[k] = String(v)` | `refuses structured` |
| `refuse-empty-key` | drop the `!k.trim()` guard | `refuses empty key` |
| `all-strings` | make `coerceEnv` always return `{}` | `all strings untouched` |
| `save-throws` | restore the silent filter loop | `save refuses` |
| `seam-signature` | rename `writeSettingsBlob` → `writeBlob` | (no vitest; grep the pinned signature strings) |
| `atomic` | restore `writeFileSync(target, blob)` | `concurrent reader` |

`seam-signature` is the one case that does not run vitest: it greps for the two pinned
declarations from AC-8. It is also the executor behind E8, so it must be individually
addressable.

- [ ] **Step 2: Run to verify the harness reports honestly**

Run: `bash scripts/settings/check-env-store-teeth.sh --list`
Expected: seven names.

Run: `bash scripts/settings/check-env-store-teeth.sh --case no-such-case`
Expected: exit 2 plus the valid list.

- [ ] **Step 3: Run the full suite**

Run: `bash scripts/settings/check-env-store-teeth.sh`
Expected: `CASE <name>: PASS` seven times, then the clean-tree line, then exit 0.

The `atomic` case is the one to watch: it must go red **because the concurrent reader saw
partial samples**, not because the file failed to compile. Check the captured output says
so before believing it.

- [ ] **Step 4: Confirm the shared tree is untouched**

```bash
git status --porcelain -- src/lib/settings src/ext-default
git worktree list
```
Expected: no output from the first; no leftover worktree in the second.

- [ ] **Step 5: Commit**

```bash
chmod +x scripts/settings/check-env-store-teeth.sh
git add scripts/settings/check-env-store-teeth.sh
git commit -m "test(settings): teeth for the store invariants, in an isolated worktree"
```

---

### Task 5: Full lane and the machine gate

**Files:** none — verification only.

- [ ] **Step 1: Run the whole lane**

```bash
pnpm lint:check && pnpm typecheck && pnpm test
```

- [ ] **Step 2: Run the build once**

```bash
pnpm build
```
It takes ~299s. Once is enough; nothing in this change touches a route or a component.

- [ ] **Step 3: Run the independent backstop**

```bash
bash scripts/pre-merge-check.sh . --base origin/main
```
Expect it to name the re-pins this package owes. The upper bound measured from declared
paths is 3 (`add-media-library`, `byo-key-onboarding`, `chong-mat-khoa-byo`); the gate
decides the real number, and last package it asked for 1 where the same method predicted 3.

- [ ] **Step 4: Set the contract to `implemented`, then verify**

---

## Self-Review

**Spec coverage.** Design §4.1 → Task 1. §4.2 → Task 2. §4.3 → Task 3. §5 (how atomicity
is measured) → Task 3 Step 1 plus Task 4's `atomic` case. §6 out-of-scope → nothing in
this plan touches `src/app/api/**` for writing.

**Eval coverage.** E1–E4 → T1. E5, E13 → T2. E6, E7 → T3. E8 → T4 (`seam-signature`).
E9, E10, E12 → covered by the existing suite plus the new cases; verify explicitly in
Task 5 Step 1 rather than assuming. E11 → T4.

**Placeholders.** One deliberate branch, stated with both outcomes: Task 4's worktree
symlink may not resolve under pnpm, and the fallback is written out rather than left to
the implementer.

**Type consistency.** `coerceEnv` keeps `(parsed: unknown) => EnvStore | null` across
Task 1 and its callers. `saveEnvStore(env: EnvStore): Promise<void>` and
`writeSettingsBlob(blob: string): Promise<void>` are unchanged — that is AC-8, asserted
by a grep on pinned strings, so a drift here fails a measurement rather than slipping by.

**A risk this plan does not remove.** The concurrent-reader case depends on a real timing
window. On a very fast disk with a small blob it may not straddle, and the test then
reports INCONCLUSIVE rather than passing — deliberately, because the alternative is a
green that means nothing. If it turns out to be flaky in practice, the honest fix is a
bigger blob or a longer reader window, not relaxing the straddle requirement.
