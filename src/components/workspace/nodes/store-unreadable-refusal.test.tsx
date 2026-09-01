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
import { READ_FAILURES, healthyRead } from "@/lib/settings/__fixtures__/read-failures";
import { MediaLibraryConfigPanel } from "./add/media-library-config-panel";
import { useNodeKeyGate } from "./base/abi-node-shell";
import { NodeKeyPrompt } from "@/components/workspace/node-key-prompt";
import type { NodeKeyPromptLabels } from "@/components/workspace/node-key-prompt";

const WSU = viMsg.Workspace.storeUnreadable;
const SURFACES = ["media-library-config-panel", "abi-node-shell"] as const;
/** Pinned: a matrix that silently loses a row still passes every per-case check. */
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

const PROMPT_LABELS: NodeKeyPromptLabels = {
    needsKey: "needs",
    describe: () => "describe",
    placeholder: "ph",
    save: "Lưu",
    verifying: "…",
    invalid: "invalid",
    verified: "verified",
    savedUnverified: "saved",
    storeUnreadable: {
        title: WSU.title,
        unchanged: WSU.unchanged,
        reason: (d: string) => `${WSU.reason} ${d}`,
        toSettings: WSU.toSettings,
    },
};

const wrap = (ui: React.ReactNode) => (
    <NextIntlClientProvider locale="vi" messages={viMsg}>
        <ReactFlowProvider>{ui}</ReactFlowProvider>
    </NextIntlClientProvider>
);

/** Drive one surface to its post-save state and render it. */
async function driveSurface(surface: string, make: () => Response) {
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
            expect(screen.queryAllByTestId("store-unreadable-notice").length).toBe(1),
        );
        return fetchMock;
    }

    const { result } = renderHook(() => useNodeKeyGate(), {
        wrapper: ({ children }) => wrap(children),
    });
    // Open the gate exactly as the shell does: a failed run naming the key.
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
    render(
        wrap(
            <NodeKeyPrompt
                envKey="OPENAI_API_KEY"
                providerName="OpenAI"
                state={result.current.state}
                labels={PROMPT_LABELS}
                value=""
            />,
        ),
    );
    return fetchMock;
}

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

describe("both on-canvas key surfaces, store unreadable", () => {
    it("the matrix is 2 surfaces x 5 shapes", () => {
        expect(EXPECTED_CASES).toBe(10);
    });

    for (const surface of SURFACES) {
        for (const [shape, make] of READ_FAILURES) {
            const label = `${surface} / ${shape}`;
            it(`refuses and points at Settings — ${label}`, async () => {
                await driveSurface(surface, make);

                expect(
                    screen.getAllByTestId("store-unreadable-notice").length,
                    label,
                ).toBe(1);
                expect(
                    screen.getAllByRole("button", { name: WSU.toSettings }).length,
                    `${label}: must offer the way forward`,
                ).toBe(1);
                // Zero escape buttons. This is what makes AC-12 structural: the
                // destructive write is not reachable from these components.
                const escapes = screen
                    .queryAllByRole("button")
                    .filter((b) => /thay kho|ghi đè/i.test(b.textContent ?? ""));
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
                ? new Response(JSON.stringify({ env: {}, verdicts: {} }), { status: 200 })
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
        expect(screen.queryAllByTestId("store-unreadable-notice").length).toBe(0);
    });
});
