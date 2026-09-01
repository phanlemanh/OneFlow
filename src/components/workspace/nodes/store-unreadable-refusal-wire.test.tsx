// @vitest-environment jsdom
/**
 * E7 / AC-12 (cross-layer) — nothing leaves the browser from either surface.
 *
 * The half most likely to go falsely green. On `main`, `abi-node-shell` renders
 * a perfectly reasonable prompt and still sends its PUT, because it never
 * checks whether the read succeeded; the server refuses with a 409, so the user
 * sees an error and the data survives — but the request left, and the criterion
 * is about the request. A UI-only eval cannot see this at all.
 *
 * Same 2 x 5 matrix as E6, counted at the wire instead of at the screen.
 */
import {
    act,
    cleanup,
    render,
    renderHook,
    screen,
    waitFor,
} from "@testing-library/react";
import { ReactFlowProvider } from "@xyflow/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Task } from "@/hooks/use-task";
import viMsg from "@/i18n/messages/vi.json";
import {
    healthyRead,
    READ_FAILURES,
} from "@/lib/settings/__fixtures__/read-failures";
import { MediaLibraryConfigPanel } from "./add/media-library-config-panel";
import { useNodeKeyGate } from "./base/abi-node-shell";

const WSU = viMsg.Workspace.storeUnreadable;
const SURFACES = ["media-library-config-panel", "abi-node-shell"] as const;
const EXPECTED_CASES = SURFACES.length * READ_FAILURES.length;

const PANEL_LABELS = {
    urlLabel: "url",
    keyLabel: "key",
    save: "Lưu",
    saving: "Đang lưu…",
    readFailed: "read failed",
    writeFailed: "write failed",
    storeUnreadableTitle: WSU.title,
    storeUnreadableUnchanged: WSU.unchanged,
    storeUnreadableReason: (d: string) => `${WSU.reason} ${d}`,
    toSettings: WSU.toSettings,
};

const wrap = (ui: React.ReactNode) => (
    <NextIntlClientProvider locale="vi" messages={viMsg}>
        <ReactFlowProvider>{ui}</ReactFlowProvider>
    </NextIntlClientProvider>
);

const putsOf = (f: ReturnType<typeof vi.fn>) =>
    f.mock.calls.filter(
        (c: unknown[]) => (c[1] as RequestInit | undefined)?.method === "PUT",
    );

async function attemptSave(surface: string, make: () => Response) {
    const fetchMock = vi.fn(async (_u: string, init?: RequestInit) =>
        init?.method === "PUT"
            ? new Response(JSON.stringify({ env: {}, verdicts: {} }), {
                  status: 200,
              })
            : make(),
    );
    vi.stubGlobal("fetch", fetchMock);

    if (surface === "media-library-config-panel") {
        render(
            wrap(
                <MediaLibraryConfigPanel
                    missing={["MEDIA_LIBRARY_URL"]}
                    message="missing"
                    labels={PANEL_LABELS}
                    onSaved={() => {}}
                />,
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

    const { result } = renderHook(() => useNodeKeyGate(), {
        wrapper: ({ children }) => wrap(children),
    });
    await act(async () => {
        result.current.noteTask({
            id: "t1",
            status: "FAILED",
            error: "missing OPENAI_API_KEY",
        } as unknown as Task);
    });
    await waitFor(() => expect(result.current.envKey).toBe("OPENAI_API_KEY"));
    await act(async () => {
        result.current.setValue("sk-test");
    });
    await act(async () => {
        await result.current.save();
    });
    return fetchMock;
}

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

describe("both on-canvas key surfaces write nothing to a broken store", () => {
    it("the matrix is 2 surfaces x 5 shapes", () => {
        expect(EXPECTED_CASES).toBe(10);
    });

    for (const surface of SURFACES) {
        for (const [shape, make] of READ_FAILURES) {
            const label = `${surface} / ${shape}`;
            it(`sends zero PUTs — ${label}`, async () => {
                const f = await attemptSave(surface, make);
                const puts = putsOf(f);
                expect(
                    puts.length,
                    `${label} sent ${puts.length} PUT(s) — none may leave the browser`,
                ).toBe(0);
            });
        }
    }

    for (const surface of SURFACES) {
        it(`POSITIVE CONTROL: a healthy store DOES write from ${surface}`, async () => {
            // Without these, a surface that can never write at all satisfies
            // every case above.
            const f = await attemptSave(surface, () => healthyRead());
            await waitFor(() => expect(putsOf(f).length).toBe(1));
        });
    }
});
