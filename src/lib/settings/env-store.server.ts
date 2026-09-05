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
// Re-exported from the neutral module so the browser and the server compare
// against the SAME value; the constant used to live here, where client code
// could not reach it.
export { ENV_STORE_UNREADABLE } from "@/lib/settings/env-codes";

/** Why a store could not be read. Each cause stays tellable from the others. */
export type EnvStoreReadReason = "io" | "decode" | "parse" | "shape";

export type EnvStoreRead =
    | { state: "ok"; env: EnvStore }
    | { state: "absent" }
    | { state: "unreadable"; reason: EnvStoreReadReason };

/**
 * Read a parsed store into the flat string map, or refuse the whole thing.
 *
 * Closed decision table, one behaviour per branch — and NO branch drops a key
 * silently, which is the bug this replaces:
 *
 *   string            kept as is
 *   number, boolean   String(v). Environment values are strings anyway, so
 *                     this is the value the system would have used.
 *   object/array/null the WHOLE store is unreadable. String({a:1}) is
 *                     "[object Object]": that turns a fault into a
 *                     valid-looking garbage value, which is a different kind
 *                     of quiet, not the end of quiet.
 *   empty/blank key   the WHOLE store is unreadable. An empty environment
 *                     variable name cannot be repaired by a type change.
 *
 * Measured before this change (2026-08-31): a store holding four non-string
 * values read back as ONE key with state "ok", and the round trip
 * read - display - save then erased the other four from disk.
 *
 * The key is kept verbatim rather than trimmed: trimming would silently rename
 * " KEY " to "KEY", and two keys differing only by whitespace would collide so
 * one would vanish — the same class of loss this function exists to end.
 */
function coerceEnv(parsed: unknown): EnvStore | null {
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return null;
    }
    const out: EnvStore = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
        if (!k.trim()) return null;
        if (typeof v === "string") out[k] = v;
        else if (typeof v === "number" || typeof v === "boolean")
            out[k] = String(v);
        else return null;
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

/**
 * Persist the env map, overwriting the previous contents.
 *
 * A non-string value or a blank key reaching here is a PROGRAMMING error, not
 * user data: the parameter is typed `Record<string, string>`. The previous
 * version filtered both away silently, which hid the mistake — and for a blank
 * key it did worse than hide it, because writing one produces a store that
 * `coerceEnv` refuses on the very next read. Write succeeds, read fails: a
 * worse outcome than either half.
 *
 * The whole map is checked BEFORE anything is encoded or written, so a refusal
 * never leaves a partial file — and on a machine with no store yet, the target
 * stays absent rather than becoming an empty one.
 */
export async function saveEnvStore(env: EnvStore): Promise<void> {
    for (const [k, v] of Object.entries(env)) {
        if (!k.trim()) {
            throw new Error(
                "saveEnvStore: refusing an empty environment variable name — the store would be unreadable on the next read",
            );
        }
        if (typeof v !== "string") {
            throw new Error(
                `saveEnvStore: value for \`${k}\` is ${typeof v}, expected string`,
            );
        }
    }
    const encoded = await encodeEnvStore(JSON.stringify(env, null, 2));
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
