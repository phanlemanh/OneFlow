import type { ReadFailure } from "@/lib/settings/env-client";

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
