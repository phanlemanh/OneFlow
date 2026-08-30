// @vitest-environment jsdom
/**
 * The settings screen, mounted for real.
 *
 * This suite exists because the first draft of the contract let the criterion
 * about this screen be "covered" by an eval that re-ran the route's own test.
 * Nothing touched the screen, so an implementer could fix the seam, the reader
 * and the route, leave `fetchEnv` swallowing exactly as before, and watch every
 * measurement stay green while the original bug lived on. The fix is to mount
 * the shipped component and assert on its DOM.
 */

import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import en from "@/i18n/messages/en.json";
import { SettingsDialog } from "./settings-dialog";

vi.mock("react-hot-toast", () => ({
    default: { success: vi.fn(), error: vi.fn() },
    toast: { success: vi.fn(), error: vi.fn() },
}));

type Call = { url: string; method: string; body?: string };
let calls: Call[] = [];

function stubFetch(get: { status: number; body: unknown }) {
    calls = [];
    globalThis.fetch = vi.fn(
        async (input: RequestInfo | URL, init?: RequestInit) => {
            const url = String(input);
            const method = (init?.method ?? "GET").toUpperCase();
            calls.push({ url, method, body: init?.body as string | undefined });
            if (method === "PUT") {
                return new Response(JSON.stringify({ env: {}, verdicts: {} }), {
                    status: 200,
                    headers: { "content-type": "application/json" },
                });
            }
            return new Response(JSON.stringify(get.body), {
                status: get.status,
                headers: { "content-type": "application/json" },
            });
        },
    ) as typeof fetch;
}

function mount() {
    return render(
        <NextIntlClientProvider locale="en" messages={en}>
            <SettingsDialog />
        </NextIntlClientProvider>,
    );
}

async function openDialog() {
    mount();
    fireEvent.click(screen.getByRole("button", { name: en.Settings.title }));
}

beforeEach(() => {
    calls = [];
});
afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe("settings dialog: unreadable store", () => {
    it("replaces the key form, keeps Save mounted but disabled, offers one way out", async () => {
        stubFetch({
            status: 503,
            body: { error: "decode", code: "ENV_STORE_UNREADABLE" },
        });
        await openDialog();

        await screen.findByText(en.Settings.storeUnreadableTitle);

        // The form is gone, not merely covered.
        expect(screen.queryAllByRole("textbox")).toHaveLength(0);
        expect(screen.getByText(en.Settings.storeUnreadableBody)).toBeTruthy();

        // No jest-dom in this repo: assert the property the DOM actually
        // exposes rather than a matcher that does not exist here.
        const save = screen.getByRole("button", {
            name: en.Settings.save,
        }) as HTMLButtonElement;
        expect(save.disabled).toBe(true);

        expect(
            screen.getAllByRole("button", { name: en.Settings.dropStore }),
        ).toHaveLength(1);
    });

    it("shows the normal form when the store is merely empty", async () => {
        // Positive control. A dialog that always reports a broken store passes
        // every assertion above, and this is the case that catches it.
        stubFetch({ status: 200, body: { env: {}, pluginEnv: [] } });
        await openDialog();

        // `addRow` always renders in the healthy form; the custom-section
        // hint only appears when a plugin declared variables, so anchoring on
        // it would make this control depend on the plugin registry.
        await screen.findByRole("button", { name: en.Settings.addRow });
        expect(screen.queryByText(en.Settings.storeUnreadableTitle)).toBeNull();
        const save = screen.getByRole("button", {
            name: en.Settings.save,
        }) as HTMLButtonElement;
        expect(save.disabled).toBe(false);
        expect(
            screen.queryAllByRole("button", { name: en.Settings.dropStore }),
        ).toHaveLength(0);
    });
});

describe("settings dialog: escape hatch", () => {
    it("sends exactly one flagged PUT and no un-flagged one", async () => {
        stubFetch({
            status: 503,
            body: { error: "decode", code: "ENV_STORE_UNREADABLE" },
        });
        await openDialog();
        await screen.findByText(en.Settings.storeUnreadableTitle);

        fireEvent.click(
            screen.getByRole("button", { name: en.Settings.dropStore }),
        );
        // The confirmation has to name the price, not ask "are you sure?".
        expect(screen.getByText(en.Settings.dropStoreConfirmBody)).toBeTruthy();

        fireEvent.click(
            screen.getByRole("button", {
                name: en.Settings.dropStoreConfirmOk,
            }),
        );

        await waitFor(() => {
            const puts = calls.filter((c) => c.method === "PUT");
            expect(puts).toHaveLength(1);
            expect(
                JSON.parse(puts[0].body ?? "{}").replaceUnreadableStore,
            ).toBe(true);
        });
        // Suppression half: an un-flagged PUT sent first would be refused by
        // the server, but it would also mean the screen tried to write into a
        // store it could not read.
        expect(
            calls.filter(
                (c) =>
                    c.method === "PUT" &&
                    JSON.parse(c.body ?? "{}").replaceUnreadableStore !== true,
            ),
        ).toHaveLength(0);
    });

    it("writes nothing when the user cancels", async () => {
        stubFetch({
            status: 503,
            body: { error: "decode", code: "ENV_STORE_UNREADABLE" },
        });
        await openDialog();
        await screen.findByText(en.Settings.storeUnreadableTitle);

        fireEvent.click(
            screen.getByRole("button", { name: en.Settings.dropStore }),
        );
        fireEvent.click(
            screen.getByRole("button", { name: en.Settings.dropStoreCancel }),
        );

        expect(calls.filter((c) => c.method === "PUT")).toHaveLength(0);
    });
});
