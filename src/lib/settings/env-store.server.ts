import "server-only";

import { decodeEnvStore, encodeEnvStore } from "@ext/settings-codec";
import { readSettingsBlob, writeSettingsBlob } from "@ext/settings-store";

/**
 * Generic, platform-agnostic environment store.
 *
 * OneFlow itself declares no specific keys: this is a flat `key -> value` map
 * that the user fills in (workspace settings dialog). Each plugin documents the
 * keys it needs in its own README. The stored values are merged into the
 * environment of spawned plugin processes at execution time, so edits take
 * effect without restarting the server.
 *
 * Two seams compose here: `@ext/settings-store` persists the raw blob
 * (default: settings.json in the scoped data dir) and `@ext/settings-codec`
 * encodes/decodes it (default: identity; a cloud shell encrypts BYOK keys).
 */

export type EnvStore = Record<string, string>;

/**
 * The one code a caller checks to tell "no keys stored yet" from "your keys
 * cannot be read". It lives here rather than in the route because a Next.js
 * route module may only export its handlers and a fixed set of config fields —
 * `pnpm build` rejects anything else, which lint and typecheck both let past.
 */
export const ENV_STORE_UNREADABLE = "ENV_STORE_UNREADABLE" as const;

/** Why a store could not be read. Each cause stays tellable from the others. */
export type EnvStoreReadReason = "io" | "decode" | "parse" | "shape";

export type EnvStoreRead =
    | { state: "ok"; env: EnvStore }
    | { state: "absent" }
    | { state: "unreadable"; reason: EnvStoreReadReason };

function coerceEnv(parsed: unknown): EnvStore | null {
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return null;
    }
    const out: EnvStore = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
        if (typeof k === "string" && k.trim() && typeof v === "string") {
            out[k] = v;
        }
    }
    return out;
}

/**
 * The one reader, and the only place that decides what each failure means.
 *
 * Callers must handle all three states, and the compiler makes them: the
 * previous single-shape reader let every call site inherit "treat a broken
 * store as an empty one" without ever choosing it, which is how saving one key
 * could delete the rest. Anything that still wants the old forgiving behaviour
 * asks for it by name — see `loadEnvStore` below.
 */
export async function readEnvStore(): Promise<EnvStoreRead> {
    let raw: string | null;
    try {
        raw = await readSettingsBlob();
    } catch {
        return { state: "unreadable", reason: "io" };
    }
    if (raw == null) return { state: "absent" };

    let decoded: string;
    try {
        decoded = await decodeEnvStore(raw);
    } catch {
        return { state: "unreadable", reason: "decode" };
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(decoded);
    } catch {
        return { state: "unreadable", reason: "parse" };
    }

    const env = coerceEnv(parsed);
    // Valid JSON of the wrong shape is a corrupt store, not an empty one. This
    // branch used to return {} and was the quietest of the three swallows: a
    // settings file holding `[1,2,3]` looked exactly like a fresh install.
    if (env == null) return { state: "unreadable", reason: "shape" };
    return { state: "ok", env };
}

/**
 * Forgiving reader for the RUN path (`withStoredEnv`, the director).
 *
 * Owner decision, 2026-08-31: an unreadable store must NOT block a run. Failing
 * here would stop even local nodes that need no key at all, turning one broken
 * settings file into a total outage — a worse fault than the one being fixed.
 * So both `absent` and `unreadable` collapse to `{}`, deliberately, in one
 * named place. The write path and the display path use `readEnvStore` and
 * decide for themselves.
 */
export async function loadEnvStore(): Promise<EnvStore> {
    const read = await readEnvStore();
    return read.state === "ok" ? read.env : {};
}

/** Persist the env map, overwriting the previous contents. */
export async function saveEnvStore(env: EnvStore): Promise<void> {
    const clean: EnvStore = {};
    for (const [k, v] of Object.entries(env)) {
        const key = k.trim();
        if (key && typeof v === "string") clean[key] = v;
    }
    const encoded = await encodeEnvStore(JSON.stringify(clean, null, 2));
    await writeSettingsBlob(encoded);
}

/**
 * Build a spawn environment: the stored values override the process env so the
 * UI is the source of truth, while still inheriting PATH and other essentials.
 */
export async function withStoredEnv(
    extra?: Record<string, string | undefined>,
): Promise<NodeJS.ProcessEnv> {
    return {
        ...process.env,
        ...(await loadEnvStore()),
        ...extra,
    };
}
