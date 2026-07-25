/**
 * Client-side translator for non-React contexts (utilities, lib code,
 * thrown errors that surface via toast). React components should keep
 * using `useTranslations()` instead.
 *
 * Locale resolution mirrors `src/i18n/request.ts` step for step: the
 * `NEXT_LOCALE` cookie wins, otherwise the browser language is negotiated
 * (the client-side counterpart of the `Accept-Language` header the server
 * reads), and "zh" is the final fallback. Both resolvers must agree — when
 * they drift, React components render in one language while imperative
 * toasts render in another.
 */

import { createTranslator } from "next-intl";

import enMessages from "@/i18n/messages/en.json";
import jaMessages from "@/i18n/messages/ja.json";
import koMessages from "@/i18n/messages/ko.json";
import viMessages from "@/i18n/messages/vi.json";
import zhMessages from "@/i18n/messages/zh.json";

type AppLocale = "en" | "zh" | "ja" | "ko" | "vi";

// Loose typing: createTranslator's strict shape inference collapses to `never`
// across our locale union, so we surface a looser `(key, vars?) => string`
// signature via ClientTranslator below.
const messagesByLocale: Record<AppLocale, Record<string, unknown>> = {
    en: enMessages,
    zh: zhMessages,
    ja: jaMessages,
    ko: koMessages,
    vi: viMessages,
};

const DEFAULT_LOCALE: AppLocale = "zh";

/** Locale explicitly chosen by the user, if the cookie is present and valid. */
function readCookieLocale(): AppLocale | undefined {
    if (typeof document === "undefined") return undefined;
    const match = document.cookie?.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/);
    if (!match) return undefined;
    const value = decodeURIComponent(match[1]) as AppLocale;
    return value in messagesByLocale ? value : undefined;
}

/**
 * Browser-language negotiation, matching what `request.ts` derives from the
 * `Accept-Language` header: a leading en / ja / ko / vi tag selects that
 * locale, anything else leaves the default in place.
 */
function negotiateBrowserLocale(): AppLocale | undefined {
    if (typeof navigator === "undefined") return undefined;
    const language = navigator.language?.toLowerCase();
    if (!language) return undefined;
    if (language.startsWith("en")) return "en";
    if (language.startsWith("ja")) return "ja";
    if (language.startsWith("ko")) return "ko";
    if (language.startsWith("vi")) return "vi";
    return undefined;
}

function resolveLocale(): AppLocale {
    return readCookieLocale() ?? negotiateBrowserLocale() ?? DEFAULT_LOCALE;
}

export type ClientTranslator = (
    key: string,
    values?: Record<string, string | number>,
) => string;

export function getClientTranslator(namespace?: string): ClientTranslator {
    const locale = resolveLocale();
    const t = createTranslator({
        locale,
        messages: messagesByLocale[locale],
        namespace,
    });
    return t as unknown as ClientTranslator;
}
