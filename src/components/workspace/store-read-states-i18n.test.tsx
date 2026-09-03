// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it } from "vitest";
import { ReadStateNotice } from "@/components/settings/read-state-notice";
import { StoreUnreadableNotice } from "@/components/settings/store-unreadable-notice";
import en from "@/i18n/messages/en.json";
import vi from "@/i18n/messages/vi.json";

/**
 * The two new read states get their words from the catalogue, per locale.
 *
 * A hardcoded Vietnamese string inside the component would pass every render
 * test in this repo and reach four of five locales as untranslated text. That
 * is the same failure this dossier exists to remove, moved from the taxonomy
 * to the copy: a surface confidently saying the wrong thing.
 *
 * The second assertion in each case is what makes the first one mean anything.
 * "en renders its own value" is satisfied by a component that hardcodes the
 * English string; "and that value differs from vi" is not.
 */
// The repo runs vitest without a setup file, so nothing tears down a render
// between cases. Two states share the same `unchanged` and `retry` copy, so an
// accumulated document turns a correct component into "found multiple
// elements" — a failure about the harness wearing the costume of a defect.
afterEach(cleanup);

const MESSAGES = { en, vi } as const;
const STATES = ["unauthenticated", "unavailable"] as const;
const KEYS = ["title", "unchanged", "retry"] as const;

/**
 * Render the SHIPPING card through a real NextIntl provider.
 *
 * The earlier version built its own `<button>{m.retry}</button>` from a string
 * it had looked up itself, then asserted it could find that string — a test
 * asserting about the test. The relation that matters (state -> catalogue
 * group -> key -> locale) lives inside `ReadStateNotice`, and that component
 * was never rendered, so pointing `unavailable` at the `storeUnreadable` group
 * left all six cases green.
 */
function show(locale: keyof typeof MESSAGES, state: (typeof STATES)[number]) {
    render(
        <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]}>
            <ReadStateNotice
                read={
                    state === "unauthenticated"
                        ? { state }
                        : { state, reason: { code: "timeout" } }
                }
                t={catalogueT(locale)}
                onRetry={() => {}}
            />
        </NextIntlClientProvider>,
    );
    return MESSAGES[locale].Settings[state];
}

/**
 * The `Settings` translator, resolved the same way a surface resolves it.
 *
 * Not a hook, despite serving the same role: it is a plain lookup, built by
 * hand rather than via `useTranslations` because this file renders
 * the card directly instead of through a surface component; it walks the same
 * catalogue the provider was given, so a wrong key still throws.
 */
function catalogueT(locale: keyof typeof MESSAGES) {
    const ns = MESSAGES[locale].Settings as unknown as Record<string, unknown>;
    return (key: string, values?: Record<string, string | number>) => {
        const hit = key
            .split(".")
            .reduce<unknown>(
                (node, part) =>
                    (node as Record<string, unknown> | undefined)?.[part],
                ns,
            );
        if (typeof hit !== "string") {
            throw new Error(`missing catalogue key Settings.${key}`);
        }
        return Object.entries(values ?? {}).reduce(
            (out, [k, v]) => out.replaceAll(`{${k}}`, String(v)),
            hit,
        );
    };
}

describe("copy comes from the catalogue, per locale", () => {
    for (const state of STATES) {
        for (const key of KEYS) {
            for (const locale of ["en", "vi"] as const) {
                it(`${locale} ${state}.${key}: the card renders that key`, () => {
                    const m = show(locale, state);
                    // The card must produce the value of the state's OWN key
                    // in the locale it was given. Both locales run, because
                    // "en renders en" alone is satisfied by a hardcoded
                    // English string.
                    expect(
                        screen.queryAllByText(m[key]).length,
                        `${locale}: card must render Settings.${state}.${key}`,
                    ).toBeGreaterThan(0);
                    // And it must NOT be the store-broken group's value: that
                    // is the substitution this dossier exists to prevent.
                    expect(
                        screen.queryAllByText(
                            MESSAGES[locale].Settings.storeUnreadable.title,
                        ).length,
                        `${locale}: ${state} must not borrow storeUnreadable.title`,
                    ).toBe(0);
                });
            }
        }
    }

    it("the quiet tone is not the destructive one", () => {
        // Colour carries the same taxonomy the words carry. A transient
        // timeout painted in the store-is-broken red tells the user their data
        // is at risk, which is exactly the misstatement being removed.
        const { container } = render(
            <StoreUnreadableNotice
                tone="quiet"
                reason="x"
                labels={{ title: "t", unchanged: "u" }}
            />,
        );
        const frame = container.querySelector("[role=alert]");
        expect(
            frame?.className.includes("destructive"),
            "quiet tone must not reuse the destructive frame",
        ).toBe(false);
    });

    it("every render carries the prototype marker", () => {
        // The a11y floor is measured on the prototype. Without one marker
        // shared by prototype and shipping surfaces, that measurement says
        // nothing about what users actually see.
        const { container } = render(
            <StoreUnreadableNotice
                reason="x"
                labels={{ title: "t", unchanged: "u" }}
            />,
        );
        expect(
            container.querySelector(
                '[data-proto-component="store-unreadable-notice"]',
            ),
            "the marker must be on the rendered root",
        ).toBeTruthy();
    });
});
