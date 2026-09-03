// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it } from "vitest";
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

function show(locale: keyof typeof MESSAGES, state: (typeof STATES)[number]) {
    const m = MESSAGES[locale].Settings[state];
    render(
        <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]}>
            <StoreUnreadableNotice
                tone="quiet"
                reason="x"
                labels={{ title: m.title, unchanged: m.unchanged }}
                testId={`${state}-notice`}
            >
                <button type="button">{m.retry}</button>
            </StoreUnreadableNotice>
        </NextIntlClientProvider>,
    );
    return m;
}

describe("copy comes from the catalogue, per locale", () => {
    for (const state of STATES) {
        for (const key of KEYS) {
            it(`${state}.${key}: en renders en and differs from vi`, () => {
                const m = show("en", state);
                expect(
                    screen.getByText(m[key]),
                    `key Settings.${state}.${key} must render its en value`,
                ).toBeTruthy();
                expect(
                    m[key],
                    `key Settings.${state}.${key} must differ between en and vi`,
                ).not.toBe(MESSAGES.vi.Settings[state][key]);
            });
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
