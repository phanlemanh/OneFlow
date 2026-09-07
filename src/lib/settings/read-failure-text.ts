import { DEFAULT_TIMEOUT_MS } from "@/lib/api/client";
import type {
    ReadFailure,
    UnavailableReason,
    WriteFailure,
} from "@/lib/settings/env-client";

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
/**
 * ONE renderer for the cause, whatever union it arrived in.
 *
 * The three unions here — read, write, unavailable — overlap almost entirely,
 * and the copy for a shared code is the same sentence: a 502 is a 502. Three
 * switches over one catalogue is how they drifted: `{seconds}` was added to
 * `cause.timeout` and only one of them learned to pass it, so a write that hit
 * the ceiling rendered the raw key path — in five languages, on the one code
 * path this dossier introduced.
 */
type AnyCause =
    | ReadFailure
    | WriteFailure
    | UnavailableReason
    | { code: "timeout" };

function causeText(
    t: (key: string, values?: Record<string, string | number>) => string,
    reason: AnyCause,
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
        case "timeout":
            // The number comes from the ceiling itself. Spelled into the copy
            // it was a second source of truth in ten places across five
            // locales; passed here it can only be wrong in one.
            return t("cause.timeout", { seconds: DEFAULT_TIMEOUT_MS / 1000 });
    }
}

export function writeFailureText(
    t: (key: string, values?: Record<string, string | number>) => string,
    reason: WriteFailure,
): string {
    return causeText(t, reason);
}

export function readFailureText(
    t: (key: string, values?: Record<string, string | number>) => string,
    reason: ReadFailure,
): string {
    return causeText(t, reason);
}

/**
 * The same sentence for the wider union.
 *
 * `UnavailableReason` is `ReadFailure` plus `timeout`, and it deliberately does
 * NOT share a type with it: one is a claim about the bytes on disk, the other
 * about the connection. They share the copy because the CAUSE reads the same
 * either way, which is why they now share the renderer too.
 */
export function unavailableReasonText(
    t: (key: string, values?: Record<string, string | number>) => string,
    reason: UnavailableReason,
): string {
    return causeText(t, reason);
}
