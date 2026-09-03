// @vitest-environment jsdom
/**
 * The server refuses the wipe, and the screen believes it.
 *
 * The race this closes: the screen reads, the store is unreadable, the user
 * confirms the destructive replace, and in between the store becomes readable
 * again. The server checks the premise and refuses, writing nothing. If the
 * screen then reports "could not replace the key store", it has invented a
 * fault that does not exist, while the user's keys sit there intact and
 * invisible behind an error card.
 *
 * The honest move when your premise is refused is to re-check the premise. So
 * the assertion is on the CALL SEQUENCE, not on the copy: a screen that
 * silently swallows the refusal shows no error either, and would pass a
 * copy-only test while leaving the user staring at a stale card.
 */
import {
    act,
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SettingsDialog } from "@/components/workspace/settings-dialog";
import viMsg from "@/i18n/messages/vi.json";

const S = viMsg.Settings;
const SU = S.storeUnreadable;

type Step = readonly [method: string, status: number, body: unknown];

/** Answer each request from a script, and record the methods actually used. */
function stubSequence(steps: readonly Step[], seen: string[]) {
    let i = 0;
    const fetchMock = vi.fn(async (_u: string, init?: RequestInit) => {
        const method = init?.method ?? "GET";
        seen.push(method);
        const step = steps[Math.min(i, steps.length - 1)];
        i += 1;
        return new Response(JSON.stringify(step[2]), { status: step[1] });
    });
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
}

async function open() {
    render(
        <NextIntlClientProvider locale="vi" messages={viMsg}>
            <SettingsDialog />
        </NextIntlClientProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: S.title }));
    await waitFor(() =>
        expect(screen.queryAllByTestId("store-unreadable-notice").length).toBe(
            1,
        ),
    );
}

async function confirmReplace() {
    await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: SU.escape }));
    });
    await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: SU.confirmOk }));
    });
}

const UNREADABLE: Step = ["GET", 503, { code: "ENV_STORE_UNREADABLE" }];

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

describe("a refused wipe re-reads", () => {
    it("a refusal makes the screen re-read, not report an error", async () => {
        const seen: string[] = [];
        stubSequence(
            [
                UNREADABLE,
                [
                    "PUT",
                    409,
                    { code: "ENV_STORE_REPLACE_REFUSED", state: "ok" },
                ],
                ["GET", 200, { env: { OPENAI_API_KEY: "1" }, pluginEnv: [] }],
            ],
            seen,
        );

        await open();
        await confirmReplace();

        await waitFor(() =>
            expect(
                screen.queryAllByDisplayValue("1").length,
                "the form must show the keys that were there all along",
            ).toBe(1),
        );
        expect(seen, "expected a GET after the refused PUT").toEqual([
            "GET",
            "PUT",
            "GET",
        ]);
        expect(
            screen.queryAllByTestId("store-unreadable-notice").length,
            "no card: the store is readable, that is what the server just said",
        ).toBe(0);
    });

    it("POSITIVE CONTROL: an accepted wipe still empties the form", async () => {
        // Without this, a screen that treats EVERY 409-or-not response as a
        // refusal passes the case above.
        const seen: string[] = [];
        stubSequence(
            [
                UNREADABLE,
                ["PUT", 200, { env: {}, verdicts: {} }],
                ["GET", 200, { env: {}, pluginEnv: [] }],
            ],
            seen,
        );

        await open();
        await confirmReplace();

        await waitFor(() =>
            expect(
                screen.queryAllByTestId("store-unreadable-notice").length,
                "an accepted wipe clears the card",
            ).toBe(0),
        );
        expect(
            seen.filter((m) => m === "PUT").length,
            "exactly one destructive write",
        ).toBe(1);
        expect(
            screen.queryAllByDisplayValue("1").length,
            "the store really was emptied",
        ).toBe(0);
    });

    it("a 409 that is NOT the refusal code still reports a failure", async () => {
        // The negative half. A 409 carrying the store-unreadable code means the
        // write was refused because the store IS broken — re-reading and
        // showing a clean form there would hide a real fault.
        const seen: string[] = [];
        stubSequence(
            [
                UNREADABLE,
                ["PUT", 409, { code: "ENV_STORE_UNREADABLE" }],
                UNREADABLE,
            ],
            seen,
        );

        await open();
        await confirmReplace();

        await waitFor(() =>
            expect(
                screen.queryAllByTestId("store-unreadable-notice").length,
                "a genuinely broken store keeps its card",
            ).toBe(1),
        );
        // The card alone does not discriminate: a screen that treats EVERY 409
        // as a refusal re-reads, gets 503 again, and paints the same card. The
        // CALL SEQUENCE is what tells the two apart — found by perturbing the
        // code discriminator and watching this case stay green.
        expect(seen, "a real failure is reported, not re-read").toEqual([
            "GET",
            "PUT",
        ]);
        expect(
            screen.queryAllByText(/Không thay được kho|Could not replace/i)
                .length,
            "the failure must be visible to the user",
        ).toBe(1);
    });

    it("a 409 with NO code at all is not evidence of a broken store", async () => {
        // The positive-signal rule, on the write path. A proxy, a CDN or an
        // auth gateway sends 409 too and has never heard of this store;
        // concluding "corrupt" from the status alone puts the destructive card
        // and the erase button in front of a user whose keys are fine. The
        // read half was hardened for exactly this and the write half was not.
        const seen: string[] = [];
        stubSequence(
            [UNREADABLE, ["PUT", 409, { error: "conflict" }], UNREADABLE],
            seen,
        );

        await open();
        await confirmReplace();

        await waitFor(() =>
            expect(
                screen.queryAllByText(/Không thay được kho|Could not replace/i)
                    .length,
                "a code-less 409 is a write failure, reported as one",
            ).toBe(1),
        );
        expect(seen, "and it must not trigger a re-read either").toEqual([
            "GET",
            "PUT",
        ]);
    });
});
