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
 * The same sentence for the wider union.
 *
 * `UnavailableReason` is `ReadFailure` plus `timeout`, and it deliberately does
 * NOT share a type with it: one is a claim about the bytes on disk, the other
 * about the connection. They share the `cause.*` copy because the CAUSE reads
 * the same either way — a 502 is a 502 — while the headline above it differs,
 * which is where the two claims actually part company.
 */
export function unavailableReasonText(
    t: (key: string, values?: Record<string, string | number>) => string,
    reason: UnavailableReason,
): string {
    if (reason.code === "timeout") {
        // The number comes from the ceiling itself. Spelled into the copy it
        // was a second source of truth in ten places across five locales, and
        // changing the constant would have made every one of them say
        // something false with nothing to catch it.
        return t("cause.timeout", { seconds: DEFAULT_TIMEOUT_MS / 1000 });
    }
    return readFailureText(t, reason);
}
