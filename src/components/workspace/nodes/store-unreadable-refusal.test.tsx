// @vitest-environment jsdom
/**
 * E6 / AC-12 — both on-canvas key surfaces refuse, and point at Settings.
 *
 * FULL MATRIX: 2 surfaces x 5 read-failure shapes. Not one shape. A patch that
 * checks only for the status the server sends is green on the 503 cell and
 * sends its write on the other four, which is precisely the defect on `main`
 * and the reason `evals.yaml` calls this "the half most likely to go falsely
 * green".
 *
 * The ABI surface is driven through its real hook rather than a full canvas
 * render. The hook is the object the shell itself uses, so this measures the
 * product and not a copy of it, while skipping the React Flow node chrome that
 * has nothing to do with this criterion. The hook still has to be opened the
 * way the shell opens it — with a FAILED task naming an env key — because that
 * is what tells it WHICH key is being asked for.
 */
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { ReactFlowProvider } from "@xyflow/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Task } from "@/hooks/use-task";
import viMsg from "@/i18n/messages/vi.json";
import {
    EXPECTED_STATE,
    healthyRead,
    READ_FAILURES,
} from "@/lib/settings/__fixtures__/read-failures";
import type { ReadFailure } from "@/lib/settings/env-client";
import { OPEN_SETTINGS_EVENT } from "@/lib/settings/settings-events";
import { MediaLibraryConfigPanel } from "./add/media-library-config-panel";
import {
    type NodeKeyGate,
    NodeKeyGateSurface,
    useNodeKeyGate,
} from "./base/abi-node-shell";

const WSU = viMsg.Workspace.storeUnreadable;
const SURFACES = ["media-library-config-panel", "abi-node-shell"] as const;
/** Pinned: a matrix that silently loses a row still passes every per-case check. */
const EXPECTED_CASES = SURFACES.length * READ_FAILURES.length;

const PANEL_LABELS = {
    urlLabel: "url",
    keyLabel: "key",
    save: "Lưu",
    saving: "Đang lưu…",
    writeFailed: "write failed",
    storeUnreadableTitle: WSU.title,
    storeUnreadableUnchanged: WSU.unchanged,
    storeUnreadableReason: (c: ReadFailure) => `${WSU.reason} ${c.code}`,
    toSettings: WSU.toSettings,
};

const wrap = (ui: React.ReactNode) => (
    <NextIntlClientProvider locale="vi" messages={viMsg}>
        <ReactFlowProvider>{ui}</ReactFlowProvider>
    </NextIntlClientProvider>
);

/** Drive one surface to its post-save state and render it. */
async function driveSurface(
    surface: string,
    make: () => Response,
    /** Which card this shape must land on — see EXPECTED_STATE. */
    want: string,
) {
    const fetchMock = vi.fn(async (_u: string, init?: RequestInit) =>
        init?.method === "PUT" ? healthyRead() : make(),
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
        screen.getByRole("button", { name: PANEL_LABELS.save }).click();
        await waitFor(() =>
            expect(
                screen.queryAllByTestId(`${want}-notice`).length,
                `waiting for the ${want} card`,
            ).toBe(1),
        );
        return fetchMock;
    }

    /*
     * Mount what SHIPS. This used to render its own `<NodeKeyPrompt …>` with
     * `onRetry={() => {}}`, and the retry button only renders when that prop
     * is present — so eight of this suite's sixteen cells asserted "every
     * blocked card offers a retry" about a prop the harness had just supplied
     * itself, and stayed green while the real node offered nothing. The
     * production shell's own comment names that trap; this file still had it.
     */
    let gate: NodeKeyGate | null = null;
    const Surface = () => {
        const g = useNodeKeyGate();
        gate = g;
        return <NodeKeyGateSurface gate={g} providerName="OpenAI" />;
    };
    render(wrap(<Surface />));

    // Open the gate exactly as the shell does: a failed run naming the key.
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

describe("both on-canvas key surfaces, store unreadable", () => {
    it("the matrix is 2 surfaces x 5 shapes", () => {
        expect(
            EXPECTED_CASES,
            // 2 surfaces x 8 read shapes. Was 10 (x5): khong-noi-sai-ve-kho-khoa
            // added 401, 403 and a code-less 503 to the shared fixture, and this
            // pin is what noticed. Growing coverage still has to be declared.
        ).toBe(16);
    });

    for (const surface of SURFACES) {
        for (const [shape, make] of READ_FAILURES) {
            const label = `${surface} / ${shape}`;
            it(`refuses and offers a live way forward — ${label}`, async () => {
                const want = EXPECTED_STATE[shape];
                await driveSurface(surface, make, want);

                // WHICH card is the claim. This suite used to assert the
                // store-unreadable card for all eight shapes, which is the
                // defect khong-noi-sai-ve-kho-khoa removed: a 401 and a proxy
                // 502 say nothing about the bytes on disk.
                expect(
                    screen.getAllByTestId(`${want}-notice`).length,
                    `${label}: expected the ${want} card`,
                ).toBe(1);

                // Settings is where a broken store gets repaired, so the link
                // to it appears for that state and no other: sending a user
                // there for an expired session is advice that cannot help.
                const forward = screen.queryAllByRole("button", {
                    name: WSU.toSettings,
                });
                expect(
                    forward.length,
                    `${label}: the Settings link belongs to store-unreadable only`,
                ).toBe(want === "store-unreadable" ? 1 : 0);

                // The control must DO something. Asserting only that a button
                // with the right LABEL exists is exactly what let a dispatch
                // with no listener ship: the label was right, this eval was
                // green, and the user's single way out of the blocked state
                // did nothing at all. A label is not a behaviour.
                if (forward.length === 1) {
                    let asked = 0;
                    const listener = () => {
                        asked += 1;
                    };
                    window.addEventListener(OPEN_SETTINGS_EVENT, listener);
                    forward[0].click();
                    window.removeEventListener(OPEN_SETTINGS_EVENT, listener);
                    expect(
                        asked,
                        `${label}: the way forward fired nothing — dead control`,
                    ).toBe(1);
                }

                // Every blocked card has a way out, whichever state it is.
                expect(
                    screen.queryAllByRole("button", { name: WSU.retry }).length,
                    `${label}: every blocked card offers a retry`,
                ).toBe(1);
                // Zero escape buttons. This is what makes AC-12 structural: the
                // destructive write is not reachable from these components.
                const escapes = screen
                    .queryAllByRole("button")
                    .filter((b) =>
                        /thay kho|ghi đè/i.test(b.textContent ?? ""),
                    );
                expect(
                    escapes.length,
                    `${label}: node panels must offer no way to overwrite`,
                ).toBe(0);
                expect(
                    screen.queryAllByRole("alertdialog").length,
                    `${label}: the destructive confirm lives only in Settings`,
                ).toBe(0);
            });
        }
    }

    it("POSITIVE CONTROL: a healthy store leaves the media-library form usable", async () => {
        // Without this, a panel that blocks unconditionally passes every case
        // above.
        const fetchMock = vi.fn(async (_u: string, init?: RequestInit) =>
            init?.method === "PUT"
                ? new Response(JSON.stringify({ env: {}, verdicts: {} }), {
                      status: 200,
                  })
                : healthyRead(),
        );
        vi.stubGlobal("fetch", fetchMock);
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
        expect(document.querySelectorAll("input").length).toBeGreaterThan(0);
        for (const state of [
            "store-unreadable",
            "unauthenticated",
            "unavailable",
        ]) {
            expect(
                screen.queryAllByTestId(`${state}-notice`).length,
                `healthy store must render no ${state} card`,
            ).toBe(0);
        }
    });
});
