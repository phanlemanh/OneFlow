import type { KeyVerdict } from "@/lib/onboarding/key-verify";
import type { PluginEnvDecl } from "@/lib/plugins/plugin-env-manifest-schema";

/**
 * The browser's one door to the stored BYO keys.
 *
 * Before this module, three surfaces each rolled their own `fetch` against the
 * same endpoint and each got the error path wrong in a different way: the
 * settings dialog swallowed failures into a logger and left an empty, saveable
 * form; `abi-node-shell` never checked the response at all and sent its write
 * anyway; the media-library panel checked, but could only say "read failed" and
 * left the user nowhere to go. Writing that logic a fourth time is the
 * mechanism, not an accident of any one of them — so there is one door, and
 * `scripts/settings/check-one-env-reader.sh` keeps it that way.
 */

const ENDPOINT = "/api/settings/env";

/**
 * Why a read failed, in a form the caller can translate.
 *
 * NOT a display string. This module is shared by three surfaces that each
 * render into a localized `{reason}` slot, so a Vietnamese literal here reaches
 * an English user as "The server could not return the list of stored keys
 * (phản hồi không phải JSON)." That is the exact defect this repo already fixed
 * one file over — add-media-library-node.tsx stopped passing the server's
 * Vietnamese `message` through for the same reason — and a shared lib is the
 * worst place to reintroduce it.
 *
 * `http` and `network` carry a locale-neutral detail (a status code, or the
 * platform's own error text); the other two need no detail at all.
 */
export type ReadFailure =
    | { code: "http"; status: number }
    | { code: "not-json" }
    | { code: "no-env" }
    | { code: "network"; detail: string };

export type EnvClientRead =
    | { state: "ok"; env: Record<string, string>; pluginEnv: PluginEnvDecl[] }
    | { state: "unreadable"; reason: ReadFailure };

/**
 * Why a write failed. A CODE, like `ReadFailure`, for the same reason and after
 * the same mistake twice.
 *
 * Round 1 of verification found a Vietnamese literal leaking out of the READ
 * path into four other locales. It was fixed. Round 2 found the identical
 * literal still sitting in the WRITE path, reaching users through
 * `replaceFailed`. Repairing instances of a defect twice is the signal that the
 * SHAPE permits it — so `detail` stops being a `string` here at all, and there
 * is nowhere left in this module's public surface to put a sentence.
 */
export type WriteFailure =
    | { code: "http"; status: number }
    | { code: "not-json" }
    | { code: "network"; detail: string };

export type SaveOutcome =
    | { ok: true; verdicts: Record<string, KeyVerdict> }
    | { ok: false; reason: "store-unreadable"; detail: ReadFailure }
    | { ok: false; reason: "write-failed"; detail: WriteFailure };

const describeCause = (cause: unknown) =>
    cause instanceof Error && cause.message ? cause.message : String(cause);

/**
 * Read the stored keys, or refuse.
 *
 * The gate is a POSITIVE assertion: `ok` requires a 200, a body that parses,
 * and an `env` that is a plain object. Everything else is unreadable.
 *
 * Deliberately not `if (status === 503)`. A proxy 502 and an HTML error page
 * never carry `ENV_STORE_UNREADABLE`, and those are two of the three cases the
 * parent dossier ordered carried forward; a gate that tests for the code only
 * closes when the server is polite enough to send one. Stating the success
 * condition instead of enumerating failures also means a shape nobody has
 * thought of yet lands on the safe side by construction.
 */
export async function readEnvForBrowser(): Promise<EnvClientRead> {
    let response: Response;
    try {
        response = await fetch(ENDPOINT, { cache: "no-store" });
    } catch (cause) {
        return {
            state: "unreadable",
            reason: { code: "network", detail: describeCause(cause) },
        };
    }

    if (!response.ok) {
        return {
            state: "unreadable",
            reason: { code: "http", status: response.status },
        };
    }

    let body: unknown;
    try {
        body = await response.json();
    } catch {
        return { state: "unreadable", reason: { code: "not-json" } };
    }

    const env = (body as { env?: unknown })?.env;
    if (!env || typeof env !== "object" || Array.isArray(env)) {
        return { state: "unreadable", reason: { code: "no-env" } };
    }

    const pluginEnv =
        (body as { pluginEnv?: PluginEnvDecl[] })?.pluginEnv ?? [];
    return {
        state: "ok",
        env: env as Record<string, string>,
        pluginEnv,
    };
}

/**
 * Merge keys into the store. Used by BOTH on-canvas surfaces.
 *
 * The read is load-bearing rather than a courtesy: `PUT` replaces the whole
 * map, so writing without a trustworthy read deletes every key not named in
 * `patch`. That is the original bug, and refusing here is what closes it.
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
 * The only destructive write in the product. Nothing the node panels import can
 * reach it, which is what makes "the panels have no escape button" structural
 * rather than a rule somebody has to remember — and the reason this function
 * lives beside `saveEnvKeys` instead of inside the settings component is that
 * one place naming the endpoint is the invariant the guard checks.
 *
 * No read first: by definition the store cannot be read, and reading here would
 * be asking a question of the broken answer we are about to discard.
 */
export async function replaceUnreadableStore(): Promise<SaveOutcome> {
    return put({ env: {}, replaceUnreadableStore: true });
}

/**
 * Write a map the caller already holds in full.
 *
 * The settings screen edits every key at once and needs deletions to actually
 * delete, so it cannot go through `saveEnvKeys` — that one merges onto a fresh
 * read, which would resurrect every key the user just cleared. It is a
 * different write, not a different endpoint: keeping it here is what lets the
 * structural guard hold "one file names the endpoint".
 */
export async function putEnvMap(
    env: Record<string, string>,
): Promise<SaveOutcome> {
    return put({ env });
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
        return {
            ok: false,
            reason: "write-failed",
            detail: { code: "network", detail: describeCause(cause) },
        };
    }

    if (!response.ok) {
        // 409 is the server saying "the store is unreadable, and I wrote
        // nothing". Reporting that as a generic write failure is how the node
        // ends up telling the user their KEY is invalid and inviting a retype —
        // the exact trap this dossier exists to close. The server already said
        // precisely what happened; discarding it here undoes the whole feature
        // on the race where the store breaks between the read and the write.
        if (response.status === 409) {
            return {
                ok: false,
                reason: "store-unreadable",
                detail: { code: "http", status: 409 },
            };
        }
        return {
            ok: false,
            reason: "write-failed",
            detail: { code: "http", status: response.status },
        };
    }

    try {
        const saved = (await response.json()) as {
            verdicts?: Record<string, KeyVerdict>;
        };
        return { ok: true, verdicts: saved.verdicts ?? {} };
    } catch {
        return {
            ok: false,
            reason: "write-failed",
            detail: { code: "not-json" },
        };
    }
}
