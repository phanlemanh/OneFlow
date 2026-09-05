import { DEFAULT_TIMEOUT_MS, notifyUnauthorized } from "@/lib/api/client";
import type { KeyVerdict } from "@/lib/onboarding/key-verify";
import type { PluginEnvDecl } from "@/lib/plugins/plugin-env-manifest-schema";
import {
    ENV_STORE_REPLACE_REFUSED,
    ENV_STORE_UNREADABLE,
} from "@/lib/settings/env-codes";

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

/**
 * Why a read did not produce a usable map, when the STORE is not the reason.
 *
 * A separate union from `ReadFailure` on purpose: these are conditions of the
 * connection, the session or the proxy, and none of them says anything about
 * the bytes on disk. Sharing one type is how they came to share one name.
 */
export type UnavailableReason =
    | { code: "http"; status: number }
    | { code: "not-json" }
    | { code: "no-env" }
    | { code: "network"; detail: string }
    | { code: "timeout" };

export type EnvReadState =
    | "ok"
    | "store-unreadable"
    | "unauthenticated"
    | "unavailable";

/**
 * Positive in BOTH directions.
 *
 * The previous shape asserted `ok` positively and let the COMPLEMENT fall into
 * `unreadable`. That reads as caution and behaves as the opposite: every
 * condition nobody had thought of — a proxy 502, an expired session, a dropped
 * connection — inherited the heaviest name available, and the settings screen
 * offers to WIPE THE KEY STORE under that name.
 *
 * So both heavy conclusions now need their own positive signal, and whatever is
 * left lands on a neutral one. `unavailable` is the honest name for "we could
 * not find out", and nothing destructive is offered under it.
 */
export type EnvClientRead =
    | { state: "ok"; env: Record<string, string>; pluginEnv: PluginEnvDecl[] }
    | { state: "store-unreadable"; reason: ReadFailure }
    | { state: "unauthenticated" }
    | { state: "unavailable"; reason: UnavailableReason };

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
    | { code: "network"; detail: string }
    | { code: "timeout" };

/** Every read outcome except the good one. */
export type EnvReadFailure = Exclude<EnvClientRead, { state: "ok" }>;

/**
 * A refused write carries the READ that refused it, not a flattened reason.
 *
 * The earlier shape reported every refusal as `store-unreadable`, which was
 * true when there was only one way to fail a read. With four states, flattening
 * is how a surface ends up telling the user their key store is corrupt because
 * their session expired.
 */
export type SaveOutcome =
    | { ok: true; verdicts: Record<string, KeyVerdict> }
    | { ok: false; reason: "read-failed"; read: EnvReadFailure }
    | { ok: false; reason: "write-failed"; detail: WriteFailure }
    /**
     * The server checked our premise and found it false: we asked to replace
     * an unreadable store, and the store reads fine. Nothing was written.
     *
     * Its own arm rather than a write failure, because nothing failed. The
     * caller's honest response is to re-read, not to report a fault that does
     * not exist while the user's keys sit intact behind an error card.
     */
    | { ok: false; reason: "replace-refused" }
    /**
     * The session expired mid-save. Nothing was written, and nothing here is a
     * statement about the key — the surfaces render this as the quiet card,
     * the same one the read half produces for a 401.
     */
    | { ok: false; reason: "unauthenticated" };

/**
 * Every request from this module, with a ceiling.
 *
 * Shared with `apiClient` rather than picking a second number: two ceilings
 * that drift apart are two behaviours the user experiences as one. Without it a
 * hung request never settles, and the surfaces that await it have no state to
 * move to — the settings screen spins and a node sits mid-verification.
 */
interface Fetched {
    response: Response;
    /** Parsed body, or undefined when the payload was not JSON. */
    body: unknown;
    parsed: boolean;
}

async function fetchWithCeiling(
    input: string,
    init: RequestInit = {},
): Promise<Fetched> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
    try {
        const response = await fetch(input, {
            ...init,
            signal: controller.signal,
        });
        /*
         * The body is read INSIDE the ceiling, and that is the whole point of
         * this shape. Clearing the timer right after `fetch` resolves disarms
         * it the moment HEADERS arrive, leaving `response.json()` unbounded —
         * so a proxy that sends headers and then stalls the body produces
         * exactly the hang the ceiling was introduced to stop, while every
         * timeout test still passes because they stall the headers.
         */
        try {
            return { response, body: await response.json(), parsed: true };
        } catch (cause) {
            // An abort DURING the body read is our ceiling firing, not a
            // malformed payload. Swallowing it here would report a stalled
            // proxy as "the response was not JSON".
            if (isAbort(cause)) throw cause;
            return { response, body: undefined, parsed: false };
        }
    } finally {
        clearTimeout(timer);
    }
}

/** An abort is our own ceiling firing, not the network refusing. */
const isAbort = (cause: unknown) =>
    cause instanceof Error && cause.name === "AbortError";

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
    let got: Fetched;
    try {
        got = await fetchWithCeiling(ENDPOINT, { cache: "no-store" });
    } catch (cause) {
        return {
            state: "unavailable",
            reason: isAbort(cause)
                ? { code: "timeout" }
                : { code: "network", detail: describeCause(cause) },
        };
    }

    const { response, body, parsed } = got;

    // Not authenticated is not a broken store. The shell gets told so it can
    // raise sign-in; 403 deliberately does not reach here — that is
    // authenticated-and-refused, and re-auth would be the wrong offer.
    if (response.status === 401) {
        notifyUnauthorized();
        return { state: "unauthenticated" };
    }

    if (!parsed) {
        return response.ok
            ? { state: "unavailable", reason: { code: "not-json" } }
            : {
                  state: "unavailable",
                  reason: { code: "http", status: response.status },
              };
    }

    // The positive signal for the heavy conclusion: the store says its own name.
    // 503 alone is not enough — a proxy sends 503 too and has never heard of
    // this store, and treating that as "your keys are corrupt" is how a network
    // hiccup came to offer a destructive fix.
    if (
        response.status === 503 &&
        (body as { code?: string })?.code === ENV_STORE_UNREADABLE
    ) {
        return {
            state: "store-unreadable",
            reason: { code: "http", status: 503 },
        };
    }

    if (!response.ok) {
        return {
            state: "unavailable",
            reason: { code: "http", status: response.status },
        };
    }

    const env = (body as { env?: unknown })?.env;
    if (!env || typeof env !== "object" || Array.isArray(env)) {
        return { state: "unavailable", reason: { code: "no-env" } };
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
        return { ok: false, reason: "read-failed", read };
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
    let got: Fetched;
    try {
        got = await fetchWithCeiling(ENDPOINT, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
    } catch (cause) {
        // RETURN, never throw. Three callers read `out.ok` and branch; a throw
        // reaches `abi-node-shell`'s catch as `phase: "invalid"` and tells the
        // user their key is bad because the network stalled.
        return {
            ok: false,
            reason: "write-failed",
            detail: isAbort(cause)
                ? { code: "timeout" }
                : { code: "network", detail: describeCause(cause) },
        };
    }

    const { response, body: answer, parsed } = got;

    // An expired session is not a failed write, and it is not a statement
    // about the key. Without this arm a save during an expired session read
    // "Could not save (the server answered 401)" with no way to sign in, and
    // on a node it landed in the writeFailed path — which tells the user the
    // key WAS stored. The read half of this module has classified 401 since
    // the taxonomy landed; the write half stopped at the module boundary.
    if (response.status === 401) {
        notifyUnauthorized();
        return { ok: false, reason: "unauthenticated" };
    }

    if (!response.ok) {
        // 409 is the server saying "the store is unreadable, and I wrote
        // nothing". Reporting that as a generic write failure is how the node
        // ends up telling the user their KEY is invalid and inviting a retype —
        // the exact trap this dossier exists to close. The server already said
        // precisely what happened; discarding it here undoes the whole feature
        // on the race where the store breaks between the read and the write.
        if (response.status === 409) {
            // Two different 409s, and telling them apart is the whole point.
            // One says the store is broken; the other says it is FINE and our
            // request was based on a stale reading. Collapsing them reports a
            // healthy store as a corrupt one.
            const code = (answer as { code?: string } | undefined)?.code;
            if (code === ENV_STORE_REPLACE_REFUSED) {
                return { ok: false, reason: "replace-refused" };
            }
            // POSITIVE SIGNAL, same rule as the read path. A 409 alone is not
            // evidence the store is broken — a proxy, a CDN or an auth gateway
            // sends 409 too and has never heard of this store — and concluding
            // it anyway puts the destructive red card and the erase-the-store
            // button in front of a user whose store is fine. That combination
            // is the entire defect this dossier removes; the read half was
            // hardened for it and the write half was not.
            if (code === ENV_STORE_UNREADABLE) {
                return {
                    ok: false,
                    reason: "read-failed",
                    read: {
                        state: "store-unreadable",
                        reason: { code: "http", status: 409 },
                    },
                };
            }
            return {
                ok: false,
                reason: "write-failed",
                detail: { code: "http", status: 409 },
            };
        }
        return {
            ok: false,
            reason: "write-failed",
            detail: { code: "http", status: response.status },
        };
    }

    if (!parsed) {
        return {
            ok: false,
            reason: "write-failed",
            detail: { code: "not-json" },
        };
    }
    const saved = answer as { verdicts?: Record<string, KeyVerdict> };
    return { ok: true, verdicts: saved?.verdicts ?? {} };
}
