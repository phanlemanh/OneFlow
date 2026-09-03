// @vitest-environment jsdom
/**
 * The retry button does what it says, exactly once.
 *
 * The matrix suite counts the button; this one counts the READ. A button that
 * renders and calls nothing passes every assertion over there, and is the
 * cheapest possible way to satisfy "offer a way to try again" while leaving
 * the user stuck — the same shape of untruth this dossier removes from the
 * words, moved into a control.
 *
 * The double-click case is not paranoia. A `busy` boolean set inside an async
 * callback has not settled by the time the second click dispatches, which is
 * how "exactly one request" becomes two; the settings screen already learned
 * this on its destructive write and holds a ref for it.
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
import { ReadStateNotice } from "@/components/settings/read-state-notice";
import { SettingsDialog } from "@/components/workspace/settings-dialog";
import viMsg from "@/i18n/messages/vi.json";

const S = viMsg.Settings;

const RETRY = new RegExp(`^${S.unavailable.retry}$`);

/** Open the dialog with a GET responder under the test's control. */
async function openWith(get: () => Promise<Response> | Response) {
    const fetchMock = vi.fn(async (_u: string, init?: RequestInit) =>
        init?.method === "PUT"
            ? new Response(JSON.stringify({ env: {}, verdicts: {} }), {
                  status: 200,
              })
            : get(),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(
        <NextIntlClientProvider locale="vi" messages={viMsg}>
            <SettingsDialog />
        </NextIntlClientProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: S.title }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    await waitFor(() =>
        expect(screen.queryAllByTestId("unavailable-notice").length).toBe(1),
    );
    return fetchMock;
}

const unavailable = () => new Response("{}", { status: 500 });

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

describe("retry reads again", () => {
    it("retry calls the reader exactly once", async () => {
        const f = await openWith(unavailable);
        const before = f.mock.calls.length;
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: RETRY }));
        });
        await waitFor(() =>
            expect(
                f.mock.calls.length - before,
                "retry: expected exactly 1 further read",
            ).toBe(1),
        );
    });

    it("two clicks while the read is in flight still read once", async () => {
        // A `busy` boolean set inside an async callback has not settled by the
        // time the second click dispatches, which is how "exactly one request"
        // becomes two. The button must be disabled from the same tick the read
        // starts, so this asserts the count AND the disabled attribute.
        // Typed through an object so TS does not narrow it to `null`: the
        // assignment happens inside the fetch closure, which the compiler
        // cannot see running before the release below.
        const hold: { release?: (r: Response) => void } = {};
        let first = true;
        const fetchMock = vi.fn(async (_u: string, init?: RequestInit) => {
            if (init?.method === "PUT") {
                return new Response("{}", { status: 200 });
            }
            if (first) {
                first = false;
                return new Response("{}", { status: 500 });
            }
            return new Promise<Response>((resolve) => {
                hold.release = resolve;
            });
        });
        vi.stubGlobal("fetch", fetchMock);

        render(
            <NextIntlClientProvider locale="vi" messages={viMsg}>
                <SettingsDialog />
            </NextIntlClientProvider>,
        );
        fireEvent.click(screen.getByRole("button", { name: S.title }));
        await waitFor(() =>
            expect(screen.queryAllByTestId("unavailable-notice").length).toBe(
                1,
            ),
        );

        const before = fetchMock.mock.calls.length;
        const btn = screen.getByRole("button", { name: RETRY });
        await act(async () => {
            fireEvent.click(btn);
        });
        fireEvent.click(btn);

        expect(
            fetchMock.mock.calls.length - before,
            "retry: expected 1 read, a second click must not start another",
        ).toBe(1);
        expect(
            (screen.getByRole("button", { name: RETRY }) as HTMLButtonElement)
                .disabled,
            "retry: the button must be disabled while the read is in flight",
        ).toBe(true);

        hold.release?.(
            new Response(JSON.stringify({ env: {}, pluginEnv: [] })),
        );
    });

    it("a retry that succeeds returns the form", async () => {
        let healthy = false;
        const f = await openWith(() =>
            healthy
                ? new Response(
                      JSON.stringify({
                          env: { OPENAI_API_KEY: "sk-1" },
                          pluginEnv: [],
                      }),
                      { status: 200 },
                  )
                : unavailable(),
        );
        healthy = true;
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: RETRY }));
        });
        await waitFor(() =>
            expect(
                screen.queryAllByTestId("unavailable-notice").length,
                "retry: the card must go away once the read succeeds",
            ).toBe(0),
        );
        expect(
            document.querySelectorAll('[role="dialog"] input').length,
            "retry: the form must come back",
        ).toBeGreaterThan(0);
        expect(f.mock.calls.length).toBeGreaterThan(1);
    });

    it("a retry that hits 401 swaps the card, it does not keep the old one", async () => {
        // The state can CHANGE between attempts, and a screen that latches its
        // first verdict then tells the user something that stopped being true.
        let step = 0;
        await openWith(() => {
            step += 1;
            return step === 1
                ? unavailable()
                : new Response("{}", { status: 401 });
        });
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: RETRY }));
        });
        await waitFor(() =>
            expect(
                screen.queryAllByTestId("unauthenticated-notice").length,
                "retry: the new state must replace the old card",
            ).toBe(1),
        );
        expect(
            screen.queryAllByTestId("unavailable-notice").length,
            "retry: the stale card must be gone",
        ).toBe(0);
    });

    it("all three surfaces carry a retry that is a live control", async () => {
        // The matrix suite counts the button on all three surfaces; this
        // asserts the control is wired on all three, which is the half a count
        // cannot see. The canvas surfaces hand their retry in as a prop, so
        // what is measured here is that the shared card actually calls it.
        for (const state of ["unauthenticated", "unavailable"] as const) {
            let fired = 0;
            const { unmount } = render(
                <NextIntlClientProvider locale="vi" messages={viMsg}>
                    <ReadStateNotice
                        read={
                            state === "unauthenticated"
                                ? { state }
                                : { state, reason: { code: "timeout" } }
                        }
                        // Echo the key back so the assertion names the exact
                        // key the card asked for, not a translated string.
                        t={((k: string) => k) as never}
                        onRetry={() => {
                            fired += 1;
                        }}
                    />
                </NextIntlClientProvider>,
            );
            fireEvent.click(
                screen.getByRole("button", { name: `${state}.retry` }),
            );
            expect(
                fired,
                `${state}: the shared card must call the surface's retry`,
            ).toBe(1);
            unmount();
        }
    });

    it("a retry never offers the destructive button", async () => {
        // The button that erases the store is reachable from exactly one card.
        // A retry that lands back on `unavailable` must not quietly grow one.
        await openWith(unavailable);
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: RETRY }));
        });
        await waitFor(() =>
            expect(screen.queryAllByTestId("unavailable-notice").length).toBe(
                1,
            ),
        );
        expect(
            screen.queryAllByRole("button", { name: /Thay kho/i }).length,
            "retry: a transient failure never earns the wipe button",
        ).toBe(0);
    });
});
