// @vitest-environment jsdom
/**
 * E12 / AC-13 — the wire between the message catalogue and the screen.
 *
 * E8 only reads the five JSON files. E2, E4 and E6 only assert Vietnamese
 * literals. Both stay green when a call site hands the component a hardcoded
 * Vietnamese label, and the two together still cannot tell the difference — so
 * AC-13 would report DONE while an English, Japanese, Korean or Chinese user
 * reads a key-loss warning in Vietnamese.
 *
 * This is not hypothetical. `abi-node-shell.tsx` already holds exactly that
 * shape in `KEY_PROMPT_BASE`, pre-existing debt this contract explicitly
 * declined to clean up — so the template for the mistake sits in a file this
 * work package edits.
 */
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SettingsDialog } from "@/components/workspace/settings-dialog";
import en from "@/i18n/messages/en.json";
import viMsg from "@/i18n/messages/vi.json";
import { READ_FAILURES } from "@/lib/settings/__fixtures__/read-failures";
import { requestOpenSettings } from "@/lib/settings/settings-events";
import { healthyGet, openSettings } from "./__fixtures__/settings-harness";

const unreadable = READ_FAILURES[0][1];
const KEYS = ["title", "unchanged"] as const;

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

describe("store-unreadable copy comes from the catalogue", () => {
    for (const key of KEYS) {
        it(`Settings.storeUnreadable.${key} renders the en value under the en catalogue`, async () => {
            const expected = en.Settings.storeUnreadable[key];
            // If en and vi ever agreed, this test would pass on a hardcoded
            // string and prove nothing. Assert they differ first.
            expect(
                expected,
                `en and vi must differ for ${key}, or this test cannot detect a hardcoded label`,
            ).not.toBe(viMsg.Settings.storeUnreadable[key]);

            await openSettings(unreadable, undefined, {
                locale: "en",
                messages: en,
            });

            expect(
                screen.queryByText(expected),
                `Settings.storeUnreadable.${key} is hardcoded — the en catalogue was ignored`,
            ).toBeTruthy();
        });
    }

    it("the open-settings request actually opens the screen", async () => {
        // The other half of the dead-control fix. E6 proves the blocked panels
        // FIRE the event; this proves something LISTENS. Split across two files
        // because they are two different defects — a dispatch with no listener
        // and a listener with no dispatch look identical from either side
        // alone, and the shipped bug was the first of the two.
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => healthyGet()),
        );
        render(
            <NextIntlClientProvider locale="vi" messages={viMsg}>
                <SettingsDialog />
            </NextIntlClientProvider>,
        );
        expect(document.querySelector('[role="dialog"]')).toBeNull();

        await act(async () => {
            requestOpenSettings();
        });

        await waitFor(() =>
            expect(
                document.querySelector('[role="dialog"]'),
                "requestOpenSettings() did not open the settings screen",
            ).toBeTruthy(),
        );
    });

    it("NEGATIVE CONTROL: the vi catalogue renders the vi wording", async () => {
        // Without this, a component that always returned English would satisfy
        // every case above.
        await openSettings(unreadable, undefined, {
            locale: "vi",
            messages: viMsg,
        });
        expect(
            screen.queryByText(viMsg.Settings.storeUnreadable.title),
        ).toBeTruthy();
    });
});
