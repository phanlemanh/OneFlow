# Chống mất khoá BYO — nửa giao diện · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When the BYO key store cannot be read, the settings screen and both on-canvas key boxes say so plainly and refuse to overwrite, instead of showing an empty form that erases every stored key on the next save.

**Architecture:** One browser-side reader (`env-client.ts`) whose gate is a POSITIVE assertion — `ok` only when 200 ∧ body parses ∧ `env` is a plain object — replaces three hand-rolled `fetch` sites that each got the error path wrong differently. The destructive write (`replaceUnreadableStore: true`) is constructible only from the settings dialog, so "the node panels have no escape button" holds by construction rather than by discipline. `resolveConfig` gains a third union member so the compiler forces both call sites to tell "store broken" from "not configured".

**Tech Stack:** Next.js App Router, React 19, TypeScript, vitest 4 (`environment: "node"`, per-file `// @vitest-environment jsdom`), @testing-library/react, next-intl, Tailwind v4 + shadcn tokens, biome.

**Spec:** [docs/superpowers/specs/2026-09-01-chong-mat-khoa-byo-giao-dien-design.md](../specs/2026-09-01-chong-mat-khoa-byo-giao-dien-design.md)

**Contract:** [_acceptance/chong-mat-khoa-byo-giao-dien/contract.md](../../../_acceptance/chong-mat-khoa-byo-giao-dien/contract.md) — AC-9…AC-14, 12 evals.

## Global Constraints

- **Code comments in English only** (CLAUDE.md). Product copy is Vietnamese-source, translated to 5 locales.
- **One eval = one whole test file. Never a `-t` name filter.** `vitest -t` exits 0 when the filter matches nothing; `scripts/ci/check-eval-filters.mjs` polices that, and a whole-file run fails loudly on an empty file instead.
- **Executor keys go into `_acceptance/config.yaml` LAST (Task 9), after every test file exists.** Declaring them earlier turns CI red.
- **The server half is already shipped and must NOT be touched.** `src/app/api/**` is in `risk_tiers.t3_paths`; touching it re-tiers this feature to T3 and voids the approved gate. `GET` already returns 503 + `ENV_STORE_UNREADABLE`; `PUT` already returns 409 unless the body carries `replaceUnreadableStore: true`.
- **Do not touch** `scripts/media-library/`, `scripts/onboarding/`, or the `build/bko-a11y` tsconfig line — session `amazing-kapitsa-45dd7a` owns those.
- **No new hex values.** Repo token vocabulary only (`src/app/globals.css`).
- **`@ext` resolves to `src/ext-default` under vitest**, and `dataDir()` reads `TONGFLOW_DATA_DIR` — store-level tests use a real temp dir, never a mock.
- Every new measurement ships with its RED direction actually run, not argued (contract §Notes).
- Before each commit: `pnpm lint:check && pnpm typecheck`. `pnpm build` (~299s) once, at Task 9.

## File Structure

| File | Responsibility |
|---|---|
| `src/lib/settings/env-client.ts` (create) | The only place the browser names `/api/settings/env`. Fail-closed read; both write paths. |
| `src/lib/settings/__fixtures__/read-failures.ts` (create) | The five read-failure shapes, named, shared by five test files. |
| `src/components/settings/store-unreadable-notice.tsx` (exists, `557f05c`) | The one blocked card all three surfaces render. Already stamps `data-testid`. |
| `src/components/workspace/settings-dialog.tsx` (modify) | Blocked state, disabled Save, the single escape button, the confirm dialog, the one-shot latch. |
| `src/components/workspace/nodes/add/media-library-config-panel.tsx` (modify) | Refuse + link to settings. |
| `src/components/workspace/nodes/base/abi-node-shell.tsx` (modify) | Same, via a new prompt phase. Export `useNodeKeyGate` so it is testable. |
| `src/components/workspace/node-key-prompt.tsx` (modify) | Render the shared notice for the new phase. |
| `src/lib/media-library/config.server.ts` (modify) | Third union member; `process.env` fallback runs BEFORE the verdict. |
| `src/i18n/messages/{en,ja,ko,vi,zh}.json` (modify) | `Settings.storeUnreadable.*`, `Workspace.storeUnreadable.*`. |
| `src/i18n/locale-parity.test.ts` (create) | E8. Full parity, frozen 76-key debt. |
| `scripts/settings/check-one-env-reader.sh` + teeth (create) | E11. Structural guard: one reader file. |
| 7 new test files | E1–E7, E12. One per eval. |

---

### Task 1: The one browser-side reader

**Files:**
- Create: `src/lib/settings/env-client.ts`
- Create: `src/lib/settings/__fixtures__/read-failures.ts`
- Test: `src/lib/settings/env-client.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces, and every later task uses these exact names:
  - `type EnvClientRead = { state: "ok"; env: Record<string,string>; pluginEnv: PluginEnvDecl[] } | { state: "unreadable"; reason: string }`
  - `readEnvForBrowser(): Promise<EnvClientRead>`
  - `type SaveOutcome = { ok: true; verdicts: Record<string, KeyVerdict> } | { ok: false; reason: "store-unreadable"; detail: string } | { ok: false; reason: "write-failed"; detail: string }`
  - `saveEnvKeys(patch: Record<string,string>, verify?: string[]): Promise<SaveOutcome>` — read, merge, write; refuses when the read is unreadable. Used by BOTH node surfaces.
  - `replaceUnreadableStore(): Promise<SaveOutcome>` — the destructive write, `PUT {env:{}, replaceUnreadableStore:true}`. Used ONLY by the settings dialog.

- [ ] **Step 1: Write the shared fixture**

`src/lib/settings/__fixtures__/read-failures.ts`:

```ts
/**
 * The five shapes a read of the key store can come back in.
 *
 * Named, and shared by five test files, because every assertion in this feature
 * reports WHICH shape it was looking at. "expected 1 to be 0" with no shape
 * name costs a debugging round, and the whole point of this dossier is that
 * four of these five shapes were being handled as if they were the fifth.
 */
export const READ_FAILURES: ReadonlyArray<readonly [string, () => Response]> = [
    [
        "503",
        () =>
            new Response(
                JSON.stringify({ error: "unreadable", code: "ENV_STORE_UNREADABLE" }),
                { status: 503 },
            ),
    ],
    ["500", () => new Response(JSON.stringify({ error: "boom" }), { status: 500 })],
    [
        "502-html",
        () =>
            new Response("<html><body>502 Bad Gateway</body></html>", {
                status: 502,
                headers: { "content-type": "text/html" },
            }),
    ],
    ["shape", () => new Response(JSON.stringify({ env: [1, 2, 3] }), { status: 200 })],
    [
        "network",
        () => {
            throw new TypeError("fetch failed");
        },
    ],
];

export const healthyRead = (env: Record<string, string> = { OPENAI_API_KEY: "sk-1" }) =>
    new Response(JSON.stringify({ env, pluginEnv: [] }), { status: 200 });
```

- [ ] **Step 2: Write the failing test**

`src/lib/settings/env-client.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { READ_FAILURES, healthyRead } from "./__fixtures__/read-failures";
import { readEnvForBrowser, replaceUnreadableStore, saveEnvKeys } from "./env-client";

afterEach(() => vi.unstubAllGlobals());

describe("readEnvForBrowser — the gate is a positive assertion", () => {
    it("reports ok only for a 200 carrying a plain object", async () => {
        vi.stubGlobal("fetch", vi.fn(async () => healthyRead()));
        const read = await readEnvForBrowser();
        expect(read.state).toBe("ok");
        if (read.state === "ok") expect(read.env).toEqual({ OPENAI_API_KEY: "sk-1" });
    });

    for (const [name, make] of READ_FAILURES) {
        it(`reports unreadable for ${name}`, async () => {
            vi.stubGlobal("fetch", vi.fn(async () => make()));
            const read = await readEnvForBrowser();
            expect(read.state, `shape ${name} must be unreadable`).toBe("unreadable");
        });
    }
});

describe("saveEnvKeys — refuses to write onto a store it cannot read", () => {
    for (const [name, make] of READ_FAILURES) {
        it(`sends no PUT for ${name}`, async () => {
            const f = vi.fn(async (_u: string, init?: RequestInit) =>
                init?.method === "PUT" ? healthyRead() : make(),
            );
            vi.stubGlobal("fetch", f);
            const out = await saveEnvKeys({ OPENAI_API_KEY: "sk-2" });
            expect(out.ok, `shape ${name}`).toBe(false);
            if (!out.ok) expect(out.reason).toBe("store-unreadable");
            const puts = f.mock.calls.filter((c) => c[1]?.method === "PUT");
            expect(puts.length, `shape ${name} sent ${puts.length} PUT(s)`).toBe(0);
        });
    }

    it("POSITIVE CONTROL: a healthy store sends exactly one PUT, and it MERGES", async () => {
        const f = vi.fn(async (_u: string, init?: RequestInit) =>
            init?.method === "PUT"
                ? new Response(JSON.stringify({ env: {}, verdicts: {} }), { status: 200 })
                : healthyRead({ KEEP_ME: "yes" }),
        );
        vi.stubGlobal("fetch", f);
        const out = await saveEnvKeys({ NEW: "v" });
        expect(out.ok).toBe(true);
        const puts = f.mock.calls.filter((c) => c[1]?.method === "PUT");
        expect(puts.length).toBe(1);
        expect(JSON.parse(String(puts[0][1]?.body)).env).toEqual({ KEEP_ME: "yes", NEW: "v" });
    });
});

describe("replaceUnreadableStore — the destructive write", () => {
    it("sends exactly one PUT, flagged, with an EMPTY env, and reads nothing first", async () => {
        const f = vi.fn(async () => new Response(JSON.stringify({ env: {} }), { status: 200 }));
        vi.stubGlobal("fetch", f);
        await replaceUnreadableStore();
        const puts = f.mock.calls.filter((c) => c[1]?.method === "PUT");
        expect(puts.length).toBe(1);
        const body = JSON.parse(String(puts[0][1]?.body));
        expect(body.replaceUnreadableStore).toBe(true);
        expect(body.env, `body was ${JSON.stringify(body)}`).toEqual({});
        expect(f.mock.calls.filter((c) => (c[1]?.method ?? "GET") === "GET").length).toBe(0);
    });
});
```

- [ ] **Step 3: Run it and watch it fail**

Run: `pnpm vitest run src/lib/settings/env-client.test.ts`
Expected: FAIL — `Failed to resolve import "./env-client"`.

- [ ] **Step 4: Write `src/lib/settings/env-client.ts`**

```ts
import type { KeyVerdict } from "@/lib/onboarding/key-verify";
import type { PluginEnvDecl } from "@/lib/plugins/plugin-env-manifest-schema";

const ENDPOINT = "/api/settings/env";

export type EnvClientRead =
    | { state: "ok"; env: Record<string, string>; pluginEnv: PluginEnvDecl[] }
    | { state: "unreadable"; reason: string };

export type SaveOutcome =
    | { ok: true; verdicts: Record<string, KeyVerdict> }
    | { ok: false; reason: "store-unreadable"; detail: string }
    | { ok: false; reason: "write-failed"; detail: string };

const describeCause = (cause: unknown) =>
    cause instanceof Error && cause.message ? cause.message : String(cause);

/**
 * The ONE place the browser asks for the stored keys.
 *
 * The gate is a POSITIVE assertion: `ok` requires a 200, a body that parses,
 * and an `env` that is a plain object. Everything else is unreadable.
 *
 * Deliberately not `if (status === 503)`. A proxy 502 and an HTML error page
 * never carry `ENV_STORE_UNREADABLE`, and those are two of the three cases the
 * parent dossier ordered carried forward. A gate that tests for the code only
 * closes when the server is polite enough to send one.
 */
export async function readEnvForBrowser(): Promise<EnvClientRead> {
    let response: Response;
    try {
        response = await fetch(ENDPOINT, { cache: "no-store" });
    } catch (cause) {
        return { state: "unreadable", reason: describeCause(cause) };
    }
    if (!response.ok) {
        return { state: "unreadable", reason: `HTTP ${response.status}` };
    }
    let body: unknown;
    try {
        body = await response.json();
    } catch {
        return { state: "unreadable", reason: "phản hồi không phải JSON" };
    }
    const env = (body as { env?: unknown })?.env;
    if (!env || typeof env !== "object" || Array.isArray(env)) {
        return { state: "unreadable", reason: "phản hồi thiếu danh sách khoá" };
    }
    const pluginEnv = (body as { pluginEnv?: PluginEnvDecl[] })?.pluginEnv ?? [];
    return { state: "ok", env: env as Record<string, string>, pluginEnv };
}

/**
 * Merge keys into the store. Used by BOTH on-canvas surfaces.
 *
 * The read is load-bearing, not a nicety: PUT replaces the whole map, so
 * writing without a trustworthy read deletes every key not named in `patch`.
 */
export async function saveEnvKeys(
    patch: Record<string, string>,
    verify: string[] = Object.keys(patch),
): Promise<SaveOutcome> {
    const read = await readEnvForBrowser();
    if (read.state !== "ok") {
        return { ok: false, reason: "store-unreadable", detail: read.reason };
    }
    return put({ env: { ...read.env, ...patch }, verify });
}

/**
 * Replace an unreadable store with an empty, valid one.
 *
 * This is the only destructive write in the product, and nothing the node
 * panels import can reach it. That is what makes "the panels have no escape
 * button" structural rather than a rule someone has to remember.
 *
 * No read first: by definition the store cannot be read, and reading here
 * would be asking a question of the broken answer we are replacing.
 */
export async function replaceUnreadableStore(): Promise<SaveOutcome> {
    return put({ env: {}, replaceUnreadableStore: true });
}

async function put(body: unknown): Promise<SaveOutcome> {
    let response: Response;
    try {
        response = await fetch(ENDPOINT, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
    } catch (cause) {
        return { ok: false, reason: "write-failed", detail: describeCause(cause) };
    }
    if (!response.ok) {
        return { ok: false, reason: "write-failed", detail: `HTTP ${response.status}` };
    }
    try {
        const saved = (await response.json()) as {
            verdicts?: Record<string, KeyVerdict>;
        };
        return { ok: true, verdicts: saved.verdicts ?? {} };
    } catch {
        return { ok: false, reason: "write-failed", detail: "phản hồi không phải JSON" };
    }
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm vitest run src/lib/settings/env-client.test.ts`
Expected: PASS — 5 unreadable shapes, 1 ok, 5 no-PUT, 1 positive control, 1 destructive-write case.

- [ ] **Step 6: Prove the RED direction**

Temporarily narrow the gate to `if (response.status === 503) return { state: "unreadable", ... }` with everything else falling through to `ok`. Re-run. Expected: the `500`, `502-html`, `shape` and `network` cases FAIL, each naming its shape. Restore, re-run green.

- [ ] **Step 7: Verify and commit**

```bash
pnpm lint:check && pnpm typecheck
git add src/lib/settings/
git commit -m "feat(settings): one fail-closed env reader for the browser"
```

---

### Task 2: Five locales for the new copy, and a parity guard that cannot rot

**Files:**
- Modify: `src/i18n/messages/{en,ja,ko,vi,zh}.json`
- Create: `src/i18n/locale-parity.test.ts`

**Interfaces:**
- Produces: `Settings.storeUnreadable.{title,unchanged,reason,escape,confirmTitle,confirmBody,confirmCancel,confirmOk,replaceFailed}` and `Workspace.storeUnreadable.{title,unchanged,reason,toSettings}`. Tasks 4, 5, 6 and 8 read them via `useTranslations("Settings.storeUnreadable")` / `("Workspace.storeUnreadable")`.

- [ ] **Step 1: Write the guard**

`src/i18n/locale-parity.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import en from "./messages/en.json";
import ja from "./messages/ja.json";
import ko from "./messages/ko.json";
import vi from "./messages/vi.json";
import zh from "./messages/zh.json";

/**
 * Japanese keys already missing on 2026-09-01, FROZEN.
 *
 * The count is an assertion in its own right. An allowlist that may only grow
 * is how a parity guard quietly stops guarding: each new gap gets waved through
 * by the very mechanism meant to bound the old ones. So the length is pinned in
 * BOTH directions — a key since translated must be removed from the debt or the
 * suite fails. The debt can shrink; it can never silently grow.
 */
const JA_DEBT_COUNT = 76;

/** Namespaces this work package adds. They may never join the debt. */
const NEW_NAMESPACES = ["Settings.storeUnreadable.", "Workspace.storeUnreadable."];

const flatten = (o: unknown, prefix = ""): string[] =>
    Object.entries(o as Record<string, unknown>).flatMap(([k, v]) =>
        v && typeof v === "object" && !Array.isArray(v)
            ? flatten(v, `${prefix}${k}.`)
            : [`${prefix}${k}`],
    );

const EN = new Set(flatten(en));
const LOCALES: Record<string, unknown> = { ja, ko, vi, zh };
const JA_KEYS = new Set(flatten(ja));
const jaDebt = [...EN].filter((k) => !JA_KEYS.has(k)).sort();

describe("locale parity — all five files, frozen debt", () => {
    it("the frozen Japanese debt is exactly the size it was on 2026-09-01", () => {
        expect(
            jaDebt.length,
            `ja is missing ${jaDebt.length} keys, frozen at ${JA_DEBT_COUNT}. ` +
                `Translated some? Lower the constant. Grew? You added an untranslated key: ` +
                jaDebt.slice(0, 5).join(", "),
        ).toBe(JA_DEBT_COUNT);
    });

    it("no key of this work package is in the debt", () => {
        const leaked = jaDebt.filter((k) => NEW_NAMESPACES.some((n) => k.startsWith(n)));
        expect(
            leaked,
            `new keys ship in all five locales, they do not join the debt: ${leaked.join(", ")}`,
        ).toEqual([]);
    });

    for (const [name, messages] of Object.entries(LOCALES)) {
        const keys = new Set(flatten(messages));

        it(`${name} is missing no key outside the frozen debt`, () => {
            const debt = name === "ja" ? new Set(jaDebt) : new Set<string>();
            const missing = [...EN].filter((k) => !keys.has(k) && !debt.has(k));
            expect(missing, `${name} is missing: ${missing.join(", ")}`).toEqual([]);
        });

        it(`${name} has no key absent from en`, () => {
            const extra = [...keys].filter((k) => !EN.has(k));
            expect(extra, `${name} has keys en does not: ${extra.join(", ")}`).toEqual([]);
        });
    }
});
```

- [ ] **Step 2: Run it — it starts GREEN, which is why Step 3 exists**

Run: `pnpm vitest run src/i18n/locale-parity.test.ts`
Expected: PASS (the debt is 76 today; the new-namespace test passes vacuously). This is the one guard in the plan whose first run is green, so its red direction has to be produced deliberately — that is Step 3, not an afterthought.

- [ ] **Step 3: Add the keys to `en.json` ONLY, then watch the guard bite**

Under `Settings`:

```json
"storeUnreadable": {
  "title": "Your saved API keys could not be read",
  "unchanged": "Nothing has been changed.",
  "reason": "The settings file could not be read ({reason}).",
  "escape": "Replace the key store with an empty one…",
  "confirmTitle": "Replace the key store with an empty one?",
  "confirmBody": "Every stored key will be lost and cannot be recovered. After this you will have to enter each key again.",
  "confirmCancel": "Leave it alone",
  "confirmOk": "I understand — replace it",
  "replaceFailed": "Could not replace the store ({reason}). Nothing has been changed."
}
```

Under `Workspace`:

```json
"storeUnreadable": {
  "title": "Your saved API keys could not be read",
  "unchanged": "Nothing has been changed.",
  "reason": "The server could not return the list of stored keys ({reason}).",
  "toSettings": "Open Settings"
}
```

Run: `pnpm vitest run src/i18n/locale-parity.test.ts`
Expected: **FAIL** — `ja is missing 89 keys, frozen at 76 … you added an untranslated key: Settings.storeUnreadable.confirmBody, …`, and the four `<locale> is missing` tests fail naming the exact keys. RED direction observed, not argued.

- [ ] **Step 4: Add the same keys to `ja`, `ko`, `vi`, `zh`**

Vietnamese is the source wording already approved in the prototype (`src/components/proto/chong-mat-khoa-byo-giao-dien-proto.tsx`, the `COPY` constant) — reuse it verbatim so the approved prototype and the shipped screen say the same sentences. Translate for ja/ko/zh. Keep `{reason}` intact in every locale.

- [ ] **Step 5: Run and verify green** — debt back to exactly 76.

- [ ] **Step 6: Prove the RED direction once more**

Delete `Settings.storeUnreadable.title` from `ja.json`. Re-run. Expected: FAIL naming that exact key and `ja`, not merely a count. Restore.

- [ ] **Step 7: Verify and commit**

```bash
pnpm lint:check && pnpm typecheck
git add src/i18n/
git commit -m "feat(i18n): store-unreadable copy in five locales, with a frozen-debt parity guard"
```

---

### Task 3: `resolveConfig` tells a broken store from an unconfigured one

**Files:**
- Modify: `src/lib/media-library/config.server.ts`
- Modify: `src/lib/media-library/import.server.ts:189`, `src/lib/media-library/client.server.ts:24` (the compiler points at both)
- Test: `src/lib/media-library/config.server.unreadable.test.ts`

**Interfaces:**
- Consumes: `readEnvStore()` from `@/lib/settings/env-store.server`, already returning `{state:"ok"|"absent"|"unreadable"}`.
- Produces: `ResolveConfigResult` gains `{ ok: false; kind: "store-unreadable"; reason: EnvStoreReadReason; message: string }`; the existing failure member gains `kind: "missing"`.

- [ ] **Step 1: Write the failing test**

Healthy fixtures go through `saveEnvStore()` — the app's real writer — so the test cannot pass merely by agreeing with itself about an envelope shape.

```ts
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const ORIGINAL = { ...process.env };
let dir: string;

beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "kkt-cfg-"));
    process.env.TONGFLOW_DATA_DIR = dir;
    delete process.env.MEDIA_LIBRARY_URL;
    delete process.env.MEDIA_LIBRARY_API_KEY;
});
afterEach(() => {
    process.env = { ...ORIGINAL };
});

/** Healthy fixtures go through the REAL writer, never hand-rolled JSON. */
async function writeHealthyStore(env: Record<string, string>) {
    const { saveEnvStore } = await import("@/lib/settings/env-store.server");
    await saveEnvStore(env);
}
function corruptStore() {
    writeFileSync(join(dir, "settings.json"), "{ this is not json", "utf8");
}

describe("resolveConfig — 'store broken' is not 'not configured'", () => {
    it("(a) healthy store with both values resolves", async () => {
        await writeHealthyStore({
            MEDIA_LIBRARY_URL: "https://x.test",
            MEDIA_LIBRARY_API_KEY: "k",
        });
        const { resolveConfig } = await import("./config.server");
        expect((await resolveConfig()).ok).toBe(true);
    });

    it("(b) absent store, no env vars → missing, naming both variables", async () => {
        const { resolveConfig } = await import("./config.server");
        const r = await resolveConfig();
        expect(r.ok).toBe(false);
        if (!r.ok && r.kind === "missing") {
            expect(r.missing.slice().sort()).toEqual([
                "MEDIA_LIBRARY_API_KEY",
                "MEDIA_LIBRARY_URL",
            ]);
        } else {
            throw new Error(`expected kind "missing", got ${JSON.stringify(r)}`);
        }
    });

    it("(c) corrupt store, no env vars → store-unreadable, NOT missing", async () => {
        corruptStore();
        const { resolveConfig } = await import("./config.server");
        const r = await resolveConfig();
        expect(r.ok).toBe(false);
        if (!r.ok) {
            expect(
                r.kind,
                "a corrupt store reported as 'missing keys' sends the user to re-enter them",
            ).toBe("store-unreadable");
        }
    });

    it("(d) corrupt store but env vars supply BOTH → still ok", async () => {
        corruptStore();
        process.env.MEDIA_LIBRARY_URL = "https://x.test";
        process.env.MEDIA_LIBRARY_API_KEY = "k";
        const { resolveConfig } = await import("./config.server");
        expect(
            (await resolveConfig()).ok,
            "one broken file must not take down an env-var deployment",
        ).toBe(true);
    });

    it("(e) corrupt store, env vars supply only PART → store-unreadable", async () => {
        corruptStore();
        process.env.MEDIA_LIBRARY_URL = "https://x.test";
        const { resolveConfig } = await import("./config.server");
        const r = await resolveConfig();
        expect(r.ok).toBe(false);
        if (!r.ok) {
            expect(
                r.kind,
                "the missing half may well be inside the store we cannot read",
            ).toBe("store-unreadable");
        }
    });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm vitest run src/lib/media-library/config.server.unreadable.test.ts`
Expected: FAIL — `kind` does not exist yet, so (b), (c) and (e) fail.

- [ ] **Step 3: Rewrite `resolveConfig`**

```ts
export type ResolveConfigResult =
    | { ok: true; config: MediaLibraryConfig }
    | { ok: false; kind: "missing"; missing: string[]; message: string }
    | {
          ok: false;
          kind: "store-unreadable";
          reason: EnvStoreReadReason;
          message: string;
      };

export async function resolveConfig(): Promise<ResolveConfigResult> {
    const read = await readEnvStore();
    const stored = read.state === "ok" ? read.env : {};

    // The env-var fallback runs BEFORE any verdict about the store. A single
    // corrupt settings file must not take down a deployment that configures
    // itself through the environment.
    const url = (stored[URL_KEY] ?? process.env[URL_KEY] ?? "").trim();
    const key = (stored[API_KEY] ?? process.env[API_KEY] ?? "").trim();
    if (url && key) {
        return {
            ok: true,
            config: { baseUrl: url.replace(/\/+$/, ""), apiKey: key },
        };
    }

    // Only now does it matter WHY we came up short. If the store could not be
    // read, the value we lack may well be inside it, and saying "you are
    // missing MEDIA_LIBRARY_API_KEY" sends the user to re-enter a key — the
    // data-loss path this whole dossier exists to close.
    if (read.state === "unreadable") {
        return {
            ok: false,
            kind: "store-unreadable",
            reason: read.reason,
            message: `Không đọc được kho khoá đã lưu (${read.reason}); chưa có gì bị thay đổi.`,
        };
    }

    const missing = [!url && URL_KEY, !key && API_KEY].filter(
        (x): x is string => Boolean(x),
    );
    return {
        ok: false,
        kind: "missing",
        missing,
        message: `Chưa gọi được media-library: thiếu ${missing.join(" và ")}.`,
    };
}
```

- [ ] **Step 4: Fix the two call sites the compiler flags**

Run `pnpm typecheck`. It flags `import.server.ts:189` and `client.server.ts:24`. Both already branch on `!cfg.ok` and read `cfg.message`, which exists on both failure members — so no new branch is needed there. If either reads `cfg.missing` unconditionally, narrow it with `cfg.kind === "missing"` first.

- [ ] **Step 5: Run the test to verify it passes** — five cases green.

- [ ] **Step 6: Prove BOTH red directions**

(i) Put `loadEnvStore()` back in place of `readEnvStore()`. Expected: (c) and (e) FAIL naming `store-unreadable`, and **(d) stays GREEN** — if (d) goes red too, the change has taken down env-var deployments and the fix is wrong.
(ii) In `writeHealthyStore`, swap `saveEnvStore()` for a hand-written `writeFileSync(join(dir, "settings.json"), JSON.stringify({ MEDIA_LIBRARY_URL: "…" }))`. Expected: (a) FAILS, proving the healthy fixture reads the real writer's envelope and not one the test invented.
Restore both.

- [ ] **Step 7: Verify and commit**

```bash
pnpm lint:check && pnpm typecheck
git add src/lib/media-library/
git commit -m "feat(media-library): resolveConfig tells a broken store from an unconfigured one"
```

---

### Task 4: The settings screen blocks, and says why

**Files:**
- Modify: `src/components/workspace/settings-dialog.tsx`
- Test: `src/components/workspace/settings-dialog.unreadable.test.tsx` (E2)
- Test: `src/components/workspace/settings-dialog.unreadable-wire.test.tsx` (E3)

**Interfaces:**
- Consumes: `readEnvForBrowser` (Task 1), `READ_FAILURES` (Task 1), `StoreUnreadableNotice` (`557f05c`), `Settings.storeUnreadable.*` (Task 2).
- Produces: nothing later tasks import.

- [ ] **Step 1: Write E2 — the UI half**

Both files open with `// @vitest-environment jsdom`. Render the dialog inside `<NextIntlClientProvider locale="vi" messages={vi}>`, open it, stub `fetch`. Loop `READ_FAILURES`; for each shape assert:

```tsx
// form REPLACED, not merely covered
expect(screen.queryAllByRole("textbox").length, `shape ${name}`).toBe(0);
expect(document.querySelectorAll('input[type="password"]').length, `shape ${name}`).toBe(0);
// the shared card, exactly one
expect(screen.getAllByTestId("store-unreadable-notice").length, `shape ${name}`).toBe(1);
expect(screen.getByTestId("store-unreadable-notice").textContent, `shape ${name}`)
    .toContain("Chưa có gì bị thay đổi");
// Save present AND disabled — hiding it is a FAIL, the criterion says so
const save = screen.getByRole("button", { name: vi.Settings.save });
expect(save, `shape ${name}`).toBeDefined();
expect((save as HTMLButtonElement).disabled, `shape ${name}: Save must be present but disabled`).toBe(true);
// exactly one escape
expect(screen.getAllByRole("button", { name: vi.Settings.storeUnreadable.escape }).length, `shape ${name}`).toBe(1);
```

Plus a **positive control**: a healthy 200 renders inputs, an *enabled* Save, and `queryAllByTestId("store-unreadable-notice").length === 0`. Without it, a dialog that always blocks would pass every assertion above.

- [ ] **Step 2: Write E3 — the wire half**

Same five shapes. After opening and clicking every control still on screen (including the disabled Save and an Enter keypress in the dialog):

```tsx
const puts = fetchMock.mock.calls.filter((c) => c[1]?.method === "PUT");
expect(puts.length, `shape ${name} sent ${puts.length} PUT(s)`).toBe(0);
expect(fetchMock.mock.calls.filter((c) => (c[1]?.method ?? "GET") === "GET").length).toBe(1);
```

Positive control: a healthy store DOES send exactly one PUT when Save is clicked.

- [ ] **Step 3: Run both and watch them fail**

Run: `pnpm vitest run src/components/workspace/settings-dialog.unreadable.test.tsx src/components/workspace/settings-dialog.unreadable-wire.test.tsx`
Expected: FAIL — today `fetchEnv` swallows the error into `logger.error` and renders an empty, enabled form.

- [ ] **Step 4: Implement**

In `settings-dialog.tsx`: add `const [blocked, setBlocked] = useState<string | null>(null)`. Replace the `apiGet<EnvResponse>` call inside `fetchEnv` with `readEnvForBrowser()`; when `read.state !== "ok"`, `setBlocked(read.reason)` and do NOT call `applyEnv`; when ok, `setBlocked(null)` then `applyEnv(read.env, read.pluginEnv)`. In the body, when `blocked` is set, render `<StoreUnreadableNotice reason={t("reason", { reason: blocked })} labels={{ title: t("title"), unchanged: t("unchanged") }}>` with the escape `<Button variant="outline">{t("escape")}</Button>` as its child, **in place of** the `groups.map(...)` block. Keep the footer Save mounted, with `disabled={Boolean(blocked) || saving}`.

- [ ] **Step 5: Run to verify both pass.**

- [ ] **Step 6: Prove BOTH red directions**

(i) Narrow the check to `if (status === 503)`. Expected: `500`, `502-html`, `shape`, `network` fail in E2, each naming its shape.
(ii) Remove `disabled` from Save. Expected: E3's no-PUT assertion fails, printing the PUT count.
Restore both.

- [ ] **Step 7: Verify and commit**

```bash
pnpm lint:check && pnpm typecheck
git add src/components/workspace/settings-dialog.tsx src/components/workspace/settings-dialog.unreadable*.tsx
git commit -m "feat(settings): settings screen refuses to overwrite an unreadable key store"
```

---

### Task 5: The one way out, and it fires exactly once

**Files:**
- Modify: `src/components/workspace/settings-dialog.tsx`
- Test: `src/components/workspace/settings-dialog.replace.test.tsx` (E4)
- Test: `src/components/workspace/settings-dialog.replace-wire.test.tsx` (E5)

**Interfaces:**
- Consumes: `replaceUnreadableStore` (Task 1), `AlertDialog*` from `@/components/ui/alert-dialog`, `buttonVariants` from `@/components/ui/button`, `Settings.storeUnreadable.confirm*` (Task 2).

- [ ] **Step 1: Write E4 — the UI half**

From the blocked state, click escape, then assert:

```tsx
const box = screen.getByRole("alertdialog");
// TWO separate assertions, so a missing half is named rather than hidden
expect(box.textContent, "confirm must say the keys are lost").toContain("sẽ mất");
expect(box.textContent, "confirm must say it is unrecoverable").toContain("không khôi phục được");
// the repo's own destructive variant, not a hand-copied class list
expect(screen.getByRole("button", { name: vi.Settings.storeUnreadable.confirmOk }).className)
    .toContain("bg-destructive");
```

Then confirm (PUT→200, refetch→200 healthy) and assert the screen returns to normal: inputs back, `queryAllByTestId("store-unreadable-notice").length === 0`.
**Negative control:** clicking Cancel leaves the blocked state intact — notice still present, zero inputs.

- [ ] **Step 2: Write E5 — the wire half**

Across the whole open → escape → confirm sequence:

```tsx
const puts = fetchMock.mock.calls.filter((c) => c[1]?.method === "PUT");
expect(puts.length).toBe(1);
const body = JSON.parse(String(puts[0][1]?.body));
expect(body.replaceUnreadableStore).toBe(true);
expect(Object.keys(body.env).length, `body was ${JSON.stringify(body)}`).toBe(0);
// assert across the WHOLE array, not just the last element
expect(puts.filter((c) => !JSON.parse(String(c[1]?.body)).replaceUnreadableStore).length).toBe(0);
```

Then the double-click case: two `fireEvent.click` on confirm inside one `act`, expect total PUTs still `1`.
**Negative control:** cancel yields 0 PUTs.

- [ ] **Step 3: Run both and watch them fail** — no escape button exists yet.

- [ ] **Step 4: Implement**

Add to `settings-dialog.tsx`:

```tsx
const [confirming, setConfirming] = useState(false);
const [replaceError, setReplaceError] = useState<string | null>(null);
const replacing = useRef(false);

const confirmReplace = useCallback(async () => {
    // One-shot latch. A double click on a destructive confirm is the ordinary
    // way "exactly one write" becomes two: React state set inside an async
    // callback has not settled by the time the second click dispatches, so a
    // `saving` boolean cannot gate this. A ref can.
    if (replacing.current) return;
    replacing.current = true;
    try {
        const out = await replaceUnreadableStore();
        if (!out.ok) {
            setReplaceError(t("replaceFailed", { reason: out.detail }));
            return;
        }
        setConfirming(false);
        setBlocked(null);
        await fetchEnv();
    } finally {
        replacing.current = false;
    }
}, [fetchEnv, t]);
```

Render an `<AlertDialog open={confirming} onOpenChange={setConfirming}>` with title/body from `t("confirmTitle")` / `t("confirmBody")`, an `AlertDialogCancel` reading `t("confirmCancel")`, and

```tsx
<AlertDialogAction
    className={cn(buttonVariants({ variant: "destructive" }))}
    onClick={confirmReplace}
>
    {t("confirmOk")}
</AlertDialogAction>
```

Render `replaceError` inside the notice when set (state `ST-caidat-replace-failed` from the design doc).

- [ ] **Step 5: Run to verify both pass.**

- [ ] **Step 6: Prove BOTH red directions**

(i) Remove the `replacing` latch. Expected: E5's double-click case fails reporting **2** PUTs.
(ii) Change the body to `{ replaceUnreadableStore: true }` with no `env`. Expected: E5's body assertion fails and prints the whole request body.
Restore both.

- [ ] **Step 7: Verify and commit**

```bash
pnpm lint:check && pnpm typecheck
git add src/components/workspace/settings-dialog.tsx src/components/workspace/settings-dialog.replace*.tsx
git commit -m "feat(settings): confirmed one-shot escape from an unreadable key store"
```

---

### Task 6: Both on-canvas surfaces refuse, and point at Settings

**Files:**
- Modify: `src/components/workspace/nodes/add/media-library-config-panel.tsx`
- Modify: `src/components/workspace/nodes/base/abi-node-shell.tsx`
- Modify: `src/components/workspace/node-key-prompt.tsx`
- Create: `src/components/workspace/nodes/__fixtures__/xyflow-shims.ts` (extract from the existing test)
- Test: `src/components/workspace/nodes/store-unreadable-refusal.test.tsx` (E6)
- Test: `src/components/workspace/nodes/store-unreadable-refusal-wire.test.tsx` (E7)

**Interfaces:**
- Consumes: `saveEnvKeys` (Task 1), `READ_FAILURES` (Task 1), `StoreUnreadableNotice`, `Workspace.storeUnreadable.*` (Task 2).
- Produces: `KeyPromptState` gains `| { phase: "store-unreadable"; reason: string }`; `useNodeKeyGate` becomes an exported hook.

- [ ] **Step 1: Extract the xyflow shims**

`src/components/workspace/nodes/add/add-media-library-node.test.tsx` already defines `ResizeObserverStub` and the matching jsdom shims. Move them to `src/components/workspace/nodes/__fixtures__/xyflow-shims.ts` exporting `installXyflowShims()`, and import it from the existing test so that suite still passes unchanged. Run `pnpm vitest run src/components/workspace/nodes/add/add-media-library-node.test.tsx` and confirm it is still green before going on.

- [ ] **Step 2: Write E6 — the UI half, FULL matrix**

```tsx
const SURFACES = ["media-library-config-panel", "abi-node-shell"] as const;
const EXPECTED_CASES = SURFACES.length * READ_FAILURES.length; // 10
// The count is itself an assertion: a matrix that quietly lost a row still
// passes every per-case check.
expect(cases.length, "matrix must be 2 surfaces x 5 shapes").toBe(EXPECTED_CASES);
```

Per case (`label = ${surface} / ${shape}`):

```tsx
expect(screen.getAllByTestId("store-unreadable-notice").length, label).toBe(1);
expect(screen.getAllByRole("button", { name: viMsg.Workspace.storeUnreadable.toSettings }).length, label).toBe(1);
// zero escape buttons — this is what makes AC-12 structural
const escapes = screen.queryAllByRole("button", { name: /Thay kho khoá|ghi đè/i });
expect(escapes.length, `${label}: node panels must offer no way to overwrite`).toBe(0);
expect(screen.queryAllByRole("alertdialog").length, label).toBe(0);
```

**Positive control:** a healthy store renders the input form on both surfaces with zero notices.

`MediaLibraryConfigPanel` renders standalone. For the ABI surface, drive the exported `useNodeKeyGate` with `renderHook(() => useNodeKeyGate(), { wrapper: ReactFlowProvider })`, call `noteTask` with a FAILED task whose `error` names an env key, then `save()`, and render `<NodeKeyPrompt state={result.current.state} …>` to assert the UI.

- [ ] **Step 3: Write E7 — the wire half, same matrix**

Per case: `expect(fetchMock.mock.calls.filter((c) => c[1]?.method === "PUT").length, label).toBe(0);`
**Positive control:** healthy store → exactly one PUT per surface.

- [ ] **Step 4: Run both and watch them fail**

Expected: `abi-node-shell` sends a PUT today — it never checks `loaded.ok` — and neither surface renders the notice.

- [ ] **Step 5: Implement**

`node-key-prompt.tsx`: add `| { phase: "store-unreadable"; reason: string }` to `KeyPromptState`; add `storeUnreadable: { title, unchanged, reason, toSettings }` to `NodeKeyPromptLabels`. When `state.phase === "store-unreadable"`, return the `StoreUnreadableNotice` with `headingLevel={3}` and a link-to-settings button as its child — and **no input, no save button**.

`abi-node-shell.tsx`: export `useNodeKeyGate`. Delete `saveAndVerifyKey` entirely (Task 7's guard enforces it stays deleted) and in `save()` call `saveEnvKeys({ [envKey]: value }, [envKey])`; map `!out.ok && out.reason === "store-unreadable"` to `setState({ phase: "store-unreadable", reason: out.detail })`, `"write-failed"` to the existing `invalid` phase, and success to the existing verdict branches. Feed `KEY_PROMPT_LABELS.storeUnreadable` from `useTranslations("Workspace.storeUnreadable")` — this file's other labels stay hardcoded by explicit descope, so introduce `t` for the new phase only.

`media-library-config-panel.tsx`: replace its two `fetch` calls with a single `saveEnvKeys({...})`; on `store-unreadable`, render the notice with the settings link in place of the form.

- [ ] **Step 6: Run to verify both pass** — 10 cases each, plus positive controls.

- [ ] **Step 7: Prove the RED direction**

Restore `abi-node-shell` to an inline `if (loaded.status === 503)` check. Expected: **exactly 4** cases of that surface fail in E6 and E7 (`500`, `502-html`, `shape`, `network`), each naming surface and shape. Exactly one failing case would mean the matrix is not actually full. Restore.

- [ ] **Step 8: Verify and commit**

```bash
pnpm lint:check && pnpm typecheck
git add src/components/workspace/nodes/ src/components/workspace/node-key-prompt.tsx
git commit -m "feat(workspace): both on-canvas key surfaces refuse to write to a broken store"
```

---

### Task 7: A structural guard, so a fourth surface cannot reinvent the bug

**Files:**
- Create: `scripts/settings/check-one-env-reader.sh`
- Create: `scripts/settings/check-one-env-reader-teeth.sh`

**Interfaces:** none — a shell guard invoked by eval E11.

- [ ] **Step 1: Write the guard**

```bash
#!/usr/bin/env bash
# E11 — the endpoint has exactly ONE caller outside tests.
#
# The behaviour matrix in E6/E7 proves the three surfaces handle all five read
# shapes TODAY. It cannot stop a fourth surface being written next month with a
# fourth hand-rolled fetch — and "three places each rolled their own, all three
# wrong in a different way" is the mechanism that produced this bug, not an
# accident of any one of them.
#
# Measured on main @ 1d66bc2: 6 calls across 3 files. This guard is that number
# collapsed to one file, held there.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

EXPECTED="src/lib/settings/env-client.ts"

# Test files are excluded on purpose: they MUST name the endpoint to stub it.
# Without this exclusion the guard would be forbidding tests, and would be red
# on a perfectly correct tree.
OFFENDERS=$(
    grep -rl '"/api/settings/env"' src/ \
        --include='*.ts' --include='*.tsx' \
        | grep -v '\.test\.tsx\?$' \
        | grep -v "^${EXPECTED}$" \
        | sort || true
)

if [ -n "$OFFENDERS" ]; then
    echo "FAIL: /api/settings/env is named outside ${EXPECTED}:"
    printf '  %s\n' $OFFENDERS
    echo "Route the call through readEnvForBrowser / saveEnvKeys instead."
    exit 1
fi

# Second arm: the guard must be measuring something. An empty or renamed
# env-client would satisfy the check above by having nothing to find.
if ! grep -q '"/api/settings/env"' "$EXPECTED"; then
    echo "FAIL: ${EXPECTED} does not name the endpoint — this guard is measuring nothing"
    exit 2
fi

echo "OK: /api/settings/env has exactly one non-test caller (${EXPECTED})"
```

- [ ] **Step 2: Run it**

Run: `bash scripts/settings/check-one-env-reader.sh`
Expected: PASS, because Task 6 removed the other callers. If it names a file, that file still has an old `fetch` — go back and finish Task 6.

- [ ] **Step 3: Write the teeth**

`check-one-env-reader-teeth.sh` copies `src/` into a temp tree and runs the guard against it (`--root`-style, by `cd`-ing there) under two perturbations:
1. inject `fetch("/api/settings/env")` into `nodes/base/abi-node-shell.tsx` → guard must exit 1 **and print that path**;
2. empty `env-client.ts` → guard must exit 2.
Assert both. A guard that stays green under either perturbation is not a guard, and this script is what makes that statement checkable rather than hopeful.

- [ ] **Step 4: Run the teeth** — Expected: PASS, both perturbations correctly rejected.

- [ ] **Step 5: Verify and commit**

```bash
chmod +x scripts/settings/check-one-env-reader.sh scripts/settings/check-one-env-reader-teeth.sh
pnpm lint:check
git add scripts/settings/
git commit -m "feat(settings): guard that the key endpoint keeps exactly one caller"
```

---

### Task 8: Prove the copy comes from the catalog, not a hardcoded string

**Files:**
- Test: `src/components/workspace/settings-i18n-render.test.tsx` (E12)

**Interfaces:** Consumes Task 2's keys and Task 4's blocked rendering.

- [ ] **Step 1: Write the test**

```tsx
// @vitest-environment jsdom
/**
 * E12 — the wire between the message catalog and the screen.
 *
 * E8 only reads the five JSON files; E2/E4/E6 only assert Vietnamese literals.
 * Both stay green when a call site passes a hardcoded Vietnamese label, and the
 * repo already contains exactly that shape — `KEY_PROMPT_LABELS` in
 * abi-node-shell.tsx, which this contract deliberately did not clean up. So the
 * failure mode is not hypothetical: its template sits in a file this work
 * package edits.
 */
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import en from "@/i18n/messages/en.json";
import vi from "@/i18n/messages/vi.json";

const KEYS = ["title", "unchanged"] as const;

describe("store-unreadable copy is rendered from the catalog", () => {
    for (const key of KEYS) {
        it(`Settings.storeUnreadable.${key} renders the en value under the en catalog`, async () => {
            await renderBlockedSettings("en", en);
            const expected = en.Settings.storeUnreadable[key];
            expect(
                expected,
                `en and vi must differ for ${key}, or this test proves nothing`,
            ).not.toBe(vi.Settings.storeUnreadable[key]);
            expect(
                screen.queryByText(expected),
                `Settings.storeUnreadable.${key} is hardcoded — the en catalog was ignored`,
            ).toBeTruthy();
        });
    }

    it("NEGATIVE CONTROL: the vi catalog renders the vi wording", async () => {
        await renderBlockedSettings("vi", vi);
        expect(screen.queryByText(vi.Settings.storeUnreadable.title)).toBeTruthy();
    });
});
```

`renderBlockedSettings(locale, messages)` reuses Task 4's harness: stub `fetch` to a 503, render `<NextIntlClientProvider locale={locale} messages={messages}><SettingsDialog /></NextIntlClientProvider>`, open the dialog, await the blocked state.

- [ ] **Step 2: Run it** — PASSES if Task 4 used `t(...)` throughout; FAILS naming the key if any label is hardcoded.

- [ ] **Step 3: Prove the RED direction**

Replace one `t("title")` in `settings-dialog.tsx` with the literal Vietnamese string. Expected: FAIL naming `Settings.storeUnreadable.title`. Restore.

- [ ] **Step 4: Verify and commit**

```bash
pnpm lint:check && pnpm typecheck
git add src/components/workspace/settings-i18n-render.test.tsx
git commit -m "test(settings): pin store-unreadable copy to the message catalog"
```

---

### Task 9: Wire the executors, then verify the whole tree

**Files:**
- Modify: `_acceptance/config.yaml`
- Modify: `_acceptance/chong-mat-khoa-byo-giao-dien/contract.md` (`status: implemented`)

**Interfaces:** all 12 `config:` refs in `evals.yaml` must resolve.

- [ ] **Step 1: Add the executor keys — LAST, now that every test file exists**

Use the kit's splice script, never a hand edit:

```bash
AG=/Users/manh-macmini/.claude/plugins/cache/acceptance-gate-kit/acceptance-gate/2.5.0
node "$AG/scripts/config-patch.mjs" --config _acceptance/config.yaml \
  --key executors.test.kkt_gd_resolve_config \
  --value '"pnpm vitest run src/lib/media-library/config.server.unreadable.test.ts"' --write
```

Repeat for `kkt_gd_settings_ui`, `kkt_gd_settings_wire`, `kkt_gd_replace_ui`, `kkt_gd_replace_wire`, `kkt_gd_panels_ui`, `kkt_gd_panels_wire`, `kkt_gd_locale_parity`, `kkt_gd_i18n_render`, plus `executors.script.kkt_gd_one_reader` (`bash scripts/settings/check-one-env-reader.sh`) and `executors.script.kkt_gd_a11y_proto` (`bash scripts/settings/check-a11y-proto.sh`).

**Do not add `-t` to any of them.**

- [ ] **Step 2: Verify no eval filters by test name**

Run: `node scripts/ci/check-eval-filters.mjs`
Expected: PASS. Every new key is a whole-file run, so none is even collected by this guard.

- [ ] **Step 3: Run all 11 eval commands once, by hand**

Expected: all exit 0. `check-a11y-proto.sh` takes a few minutes — it boots its own dev server on port 3197.

- [ ] **Step 4: Full suite**

Run: `pnpm lint:check && pnpm typecheck && pnpm test && pnpm build`
Expected: all green. Build is ~299s; run it once.

- [ ] **Step 5: Commit and hand off to S4**

```bash
git add _acceptance/config.yaml
git commit -m "chore(acceptance): wire chong-mat-khoa-byo-giao-dien eval executors"
```

Then set `status: implemented` in the contract frontmatter and dispatch S4 in the same turn.

---

## Self-Review

**Spec coverage.** AC-9 → Task 3. AC-10 → Tasks 1, 4. AC-11 → Task 5. AC-12 → Tasks 1, 6, 7. AC-13 → Tasks 2, 8. AC-14 → already satisfied by `557f05c` (prototype + a11y guard, `verdict: PASS`, 6/6 state-and-theme read-back); Task 9 only wires its executor key. All three load-bearing design decisions are implemented and each has a guard: the shared fail-closed reader (Task 1, guarded structurally by Task 7), the destructive write reachable from one screen only (Tasks 1 and 5), and the `process.env` fallback ordering (Task 3, whose red direction explicitly requires case (d) to stay green).

**Placeholder scan.** Three places describe rather than paste: the two render helpers in Tasks 4 and 8, and the teeth script body in Task 7. All three are mechanical given the harness established in Task 4, and each has its assertions and exit codes spelled out. Everything else carries real code.

**Type consistency.** `EnvClientRead`, `SaveOutcome`, `readEnvForBrowser`, `saveEnvKeys`, `replaceUnreadableStore` are named identically in Tasks 1, 4, 5, 6. `ResolveConfigResult.kind` is `"missing" | "store-unreadable"` in both Task 3's test and its implementation. `KeyPromptState`'s new member is `{ phase: "store-unreadable"; reason: string }` at both sites in Task 6. `READ_FAILURES` lives in one fixture file from Task 1 and is imported by Tasks 1, 4, 5, 6.

**One ordering constraint that is easy to get wrong.** Task 9 must come last. Adding executor keys before the test files exist turns CI red through `check-eval-filters.mjs`, and that failure reads as an unrelated regression.

**One risk worth naming.** Task 6 is the largest task and the only one needing the xyflow harness. Its Step 1 (extracting the shims and re-running the existing suite green) exists so that, if the harness turns out to be the hard part, that is discovered before any production code moves.
