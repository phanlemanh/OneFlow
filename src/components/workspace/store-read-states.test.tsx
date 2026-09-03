// @vitest-environment jsdom
/**
 * Three surfaces x four read states, pinned at twelve cells.
 *
 * The defect this closes is not "a surface shows the wrong card". It is that
 * three surfaces each decided independently what a failed read means, and the
 * heaviest available name won every time: an expired session and a proxy 502
 * both arrived as "your key store is broken", and on one of those surfaces
 * that came with a button offering to erase it.
 *
 * So the matrix asserts two things per cell, and the second is the one that
 * matters. The right card is present, AND the destructive button is absent
 * everywhere except the single cell entitled to it. Counting the button in all
 * twelve cells is what makes "only settings, only when the store is really
 * broken" a measured fact rather than a sentence in a review.
 *
 * The PUT count rides along in every cell because a surface can show a perfect
 * card and still have sent the request that overwrites the store.
 */
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { ReactFlowProvider } from "@xyflow/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Task } from "@/hooks/use-task";
import enMsg from "@/i18n/messages/en.json";
import viMsg from "@/i18n/messages/vi.json";
import { healthyRead } from "@/lib/settings/__fixtures__/read-failures";
import { openSettings } from "./__fixtures__/settings-harness";
import { NodeKeyPrompt } from "./node-key-prompt";
import { MediaLibraryConfigPanel } from "./nodes/add/media-library-config-panel";
import { useNodeKeyGate } from "./nodes/base/abi-node-shell";

const MESSAGES = { en: enMsg, vi: viMsg } as const;

const SURFACES = ["settings", "node-key-prompt", "ml-panel"] as const;
const STATES = [
    "ok",
    "store-unreadable",
    "unauthenticated",
    "unavailable",
] as const;
const CELLS = 12;

type State = (typeof STATES)[number];

/** One wire signal per state, chosen so each lands on its own positive test. */
const GET_FOR: Record<State, () => Response> = {
    ok: () => healthyRead(),
    "store-unreadable": () =>
        new Response(JSON.stringify({ code: "ENV_STORE_UNREADABLE" }), {
            status: 503,
        }),
    unauthenticated: () => new Response("{}", { status: 401 }),
    unavailable: () => new Response("{}", { status: 500 }),
};

const PANEL_LABELS = {
    urlLabel: "url",
    keyLabel: "key",
    save: "Lưu",
    saving: "Đang lưu…",
    writeFailed: "write failed",
};

const PROMPT_LABELS = {
    needsKey: "needs",
    describe: (p: string) => p,
    placeholder: "ph",
    save: "Lưu khoá",
    verifying: "…",
    invalid: "invalid",
    verified: "verified",
    savedUnverified: "saved",
};

const wrap = (ui: React.ReactNode, locale: keyof typeof MESSAGES = "vi") => (
    <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]}>
        <ReactFlowProvider>{ui}</ReactFlowProvider>
    </NextIntlClientProvider>
);

/**
 * The node prompt is presentational; this is the gate that feeds it.
 *
 * The gate handle escapes through a module variable rather than through a
 * second `renderHook`. Two hook calls are two independent gates: driving one
 * leaves the other in its initial state, and the surface renders nothing while
 * the assertions look like they are about a surface.
 */
let gate: ReturnType<typeof useNodeKeyGate> | null = null;

function KeyGateSurface() {
    const g = useNodeKeyGate();
    gate = g;
    if (!g.envKey) return null;
    return (
        <NodeKeyPrompt
            envKey={g.envKey}
            providerName="OpenAI"
            state={g.state}
            labels={PROMPT_LABELS}
            value={g.value}
            onChange={g.setValue}
            onSave={g.save}
            onRetry={() => {}}
        />
    );
}

async function mount(
    surface: (typeof SURFACES)[number],
    state: State,
    locale: keyof typeof MESSAGES = "vi",
) {
    const fetchMock = vi.fn(async (_u: string, init?: RequestInit) =>
        init?.method === "PUT"
            ? new Response(JSON.stringify({ env: {}, verdicts: {} }), {
                  status: 200,
              })
            : GET_FOR[state](),
    );

    if (surface === "settings") {
        const h = await openSettings(GET_FOR[state], undefined, {
            locale,
            messages: MESSAGES[locale],
        });
        return h.fetchMock;
    }

    vi.stubGlobal("fetch", fetchMock);

    if (surface === "ml-panel") {
        render(
            wrap(
                <MediaLibraryConfigPanel
                    missing={["MEDIA_LIBRARY_URL"]}
                    message="missing"
                    labels={PANEL_LABELS}
                    onSaved={() => {}}
                />,
                locale,
            ),
        );
        const input = document.querySelector("input");
        if (input) {
            const setter = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype,
                "value",
            )?.set;
            setter?.call(input, "https://x.test");
            input.dispatchEvent(new Event("input", { bubbles: true }));
        }
        await act(async () => {
            screen.getByRole("button", { name: PANEL_LABELS.save }).click();
        });
        await waitFor(() => expect(fetchMock).toHaveBeenCalled());
        return fetchMock;
    }

    render(wrap(<KeyGateSurface />, locale));
    await act(async () => {
        gate?.noteTask({
            id: "t1",
            status: "FAILED",
            error: "missing OPENAI_API_KEY",
        } as unknown as Task);
    });
    await waitFor(() => expect(gate?.envKey).toBe("OPENAI_API_KEY"));
    await act(async () => {
        gate?.setValue("sk-test");
    });
    await act(async () => {
        await gate?.save();
    });
    return fetchMock;
}

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

describe("three surfaces tell four read states apart", () => {
    it(`covers exactly ${CELLS} cells`, () => {
        expect(SURFACES.length * STATES.length, "matrix must stay full").toBe(
            CELLS,
        );
    });

    for (const surface of SURFACES) {
        for (const state of STATES) {
            it(`${surface} x ${state}`, async () => {
                const f = await mount(surface, state);

                const wipe = screen.queryAllByRole("button", {
                    name: /Thay kho|Replace the key store/i,
                });
                const expectWipe =
                    surface === "settings" && state === "store-unreadable"
                        ? 1
                        : 0;
                expect(wipe.length, `${surface} x ${state}: wipe buttons`).toBe(
                    expectWipe,
                );

                // Nine non-ok cells, nine ways out. A card that states a
                // transient failure and offers no way to try again leaves the
                // user with only the destructive button, or with nothing.
                const retry = screen.queryAllByRole("button", {
                    name: /^(Thử lại|Try again)$/i,
                });
                expect(
                    retry.length,
                    `${surface} x ${state}: retry buttons`,
                ).toBe(state === "ok" ? 0 : 1);

                if (state !== "ok") {
                    expect(
                        screen.queryAllByTestId(`${state}-notice`).length,
                        `${surface} x ${state}: notice testid`,
                    ).toBeGreaterThan(0);
                }

                const puts = f.mock.calls.filter(
                    (c: unknown[]) =>
                        (c[1] as RequestInit | undefined)?.method === "PUT",
                );
                const expectPuts =
                    state === "ok" && surface !== "settings" ? 1 : 0;
                expect(puts.length, `${surface} x ${state}: PUT count`).toBe(
                    expectPuts,
                );
            });
        }
    }

    // A hardcoded string passes every assertion above. These pin the RELATION:
    // each new state renders its OWN key, not the store-broken one wearing a
    // different tone.
    for (const locale of ["en", "vi"] as const) {
        for (const state of ["unauthenticated", "unavailable"] as const) {
            it(`${locale} x ${state}: title is the state's own key`, async () => {
                await mount("settings", state, locale);
                const own = MESSAGES[locale].Settings[state].title;
                const old = MESSAGES[locale].Settings.storeUnreadable.title;
                expect(
                    screen.queryAllByText(own).length,
                    `${locale}/${state}: must use its own key`,
                ).toBeGreaterThan(0);
                expect(
                    own,
                    `${locale}/${state}: must not reuse storeUnreadable.title`,
                ).not.toBe(old);
            });
        }
    }
});
