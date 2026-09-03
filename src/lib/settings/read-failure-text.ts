import type { ReadFailure, WriteFailure } from "@/lib/settings/env-client";

/**
 * Turn a read-failure code into a sentence in the reader's own language.
 *
 * Lives beside the reader rather than inside it: the reader must stay free of
 * display strings, because three surfaces feed its output into a localized
 * `{reason}` slot and a literal there reaches every locale untranslated.
 *
 * `t` is whichever `useTranslations(...)` namespace the caller already holds,
 * scoped so that `t("cause.http")` resolves — both `Settings.storeUnreadable`
 * and `Workspace.storeUnreadable` carry the same four keys.
 */
export function writeFailureText(
    t: (key: string, values?: Record<string, string | number>) => string,
    reason: WriteFailure,
): string {
    switch (reason.code) {
        case "http":
            return t("cause.http", { status: reason.status });
        case "not-json":
            return t("cause.not-json");
        case "network":
            return t("cause.network", { detail: reason.detail });
        case "timeout":
            return t("cause.timeout");
    }
}

export function readFailureText(
    t: (key: string, values?: Record<string, string | number>) => string,
    reason: ReadFailure,
): string {
    switch (reason.code) {
        case "http":
            return t("cause.http", { status: reason.status });
        case "not-json":
            return t("cause.not-json");
        case "no-env":
            return t("cause.no-env");
        case "network":
            return t("cause.network", { detail: reason.detail });
    }
}

/**
 * The detail a surface can still render while it only knows how to talk about
 * `ReadFailure`.
 *
 * Bridging shim for the step that introduced the four read states before the
 * surfaces learned to tell them apart. It is deliberately lossy — every state
 * collapses back to an http/network-shaped detail — and it exists so ONE step
 * changes the type and the NEXT changes the behaviour, instead of one step
 * doing both and nobody being able to review either.
 */
export function legacyReadDetail(read: {
    state: string;
    reason?: { code: string; status?: number; detail?: string };
}):
    | { code: "http"; status: number }
    | { code: "network"; detail: string }
    | { code: "not-json" }
    | { code: "no-env" } {
    if (read.state === "unauthenticated") return { code: "http", status: 401 };
    const r = read.reason;
    if (!r) return { code: "http", status: 0 };
    if (r.code === "timeout") return { code: "network", detail: "timeout" };
    return r as never;
}
