// @vitest-environment jsdom
/**
 * E12a — compose-overlay canvas node.
 *
 * Mounts the real node inside a React Flow canvas (jsdom) and asserts:
 *  - the 5 ABI handles render (`in:media`, `in:text`, `in:logo`,
 *    `out:image`, `out:video`);
 *  - the ops-editor can add one op of each of the 4 kinds;
 *  - time (start/end) inputs and the time badge render ONLY when the
 *    connected media modality is video;
 *  - state-5: a logo op without an `in:logo` connection renders the error
 *    row + banner and disables execute.
 */

import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import {
    type Edge,
    Handle,
    type Node,
    Position,
    ReactFlow,
    ReactFlowProvider,
} from "@xyflow/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { ComposeOverlayInput } from "@/generated/abi";
import useFlow from "@/hooks/use-flow";
import messages from "@/i18n/messages/en.json";

import ComposeOverlayNode from "./compose-overlay";

type OverlayOp = ComposeOverlayInput["ops"][number];

/* ------------------------------------------------------------------ */
/* React Flow jsdom shims (per xyflow testing guidance)                 */
/* ------------------------------------------------------------------ */

class ResizeObserverStub {
    private readonly callback: ResizeObserverCallback;
    constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
    }
    observe(target: Element) {
        const contentRect = {
            width: 1200,
            height: 800,
            x: 0,
            y: 0,
            top: 0,
            left: 0,
            right: 1200,
            bottom: 800,
        };
        this.callback(
            [{ target, contentRect } as unknown as ResizeObserverEntry],
            this as unknown as ResizeObserver,
        );
    }
    unobserve() {}
    disconnect() {}
}

class DOMMatrixReadOnlyStub {
    m22 = 1;
}

beforeAll(() => {
    globalThis.ResizeObserver =
        ResizeObserverStub as unknown as typeof ResizeObserver;
    globalThis.DOMMatrixReadOnly =
        DOMMatrixReadOnlyStub as unknown as typeof DOMMatrixReadOnly;
    Object.defineProperties(HTMLElement.prototype, {
        offsetHeight: {
            get(): number {
                return 60;
            },
        },
        offsetWidth: {
            get(): number {
                return 340;
            },
        },
    });
    (SVGElement.prototype as unknown as { getBBox: () => DOMRect }).getBBox =
        () => ({ x: 0, y: 0, width: 0, height: 0 }) as unknown as DOMRect;
});

/* ------------------------------------------------------------------ */
/* Test harness                                                        */
/* ------------------------------------------------------------------ */

/** Minimal upstream stand-ins rendering the modality source handles. */
const StubVideoNode = () => (
    <div>
        <Handle type="source" position={Position.Right} id="out:videoNode" />
    </div>
);
const StubImageNode = () => (
    <div>
        <Handle type="source" position={Position.Right} id="out:imageNode" />
    </div>
);
const StubTextNode = () => (
    <div>
        <Handle type="source" position={Position.Right} id="out:textNode" />
    </div>
);

const NODE_TYPES = {
    composeOverlayNode: ComposeOverlayNode,
    videoNode: StubVideoNode,
    imageNode: StubImageNode,
    textNode: StubTextNode,
};

const NODE_ID = "co1";

interface FlowOptions {
    media?: "image" | "video";
    logoConnected?: boolean;
    textConnected?: boolean;
    ops?: OverlayOp[];
}

function buildGraph(opts: FlowOptions): { nodes: Node[]; edges: Edge[] } {
    const nodes: Node[] = [
        {
            id: NODE_ID,
            type: "composeOverlayNode",
            position: { x: 0, y: 0 },
            data: { ops: opts.ops ?? [] },
        },
    ];
    const edges: Edge[] = [];

    if (opts.media) {
        const type = opts.media === "video" ? "videoNode" : "imageNode";
        nodes.push({
            id: "m1",
            type,
            position: { x: -300, y: 0 },
            data: { fileKeys: ["media-key"] },
        });
        edges.push({
            id: "e-media",
            source: "m1",
            sourceHandle: `out:${type}`,
            target: NODE_ID,
            targetHandle: "in:media",
        });
    }
    if (opts.logoConnected) {
        nodes.push({
            id: "l1",
            type: "imageNode",
            position: { x: -300, y: 150 },
            data: { fileKeys: ["logo-key"] },
        });
        edges.push({
            id: "e-logo",
            source: "l1",
            sourceHandle: "out:imageNode",
            target: NODE_ID,
            targetHandle: "in:logo",
        });
    }
    if (opts.textConnected) {
        nodes.push({
            id: "t1",
            type: "textNode",
            position: { x: -300, y: 300 },
            data: { texts: ["1.999.000"] },
        });
        edges.push({
            id: "e-text",
            source: "t1",
            sourceHandle: "out:textNode",
            target: NODE_ID,
            targetHandle: "in:text",
        });
    }
    return { nodes, edges };
}

function renderFlow(opts: FlowOptions = {}) {
    const { nodes, edges } = buildGraph(opts);
    // Seed the app-level flow store too: `useAbiForm` reads node.data from it.
    useFlow.getState().setNodes(nodes);
    useFlow.getState().setEdges(edges);
    return render(
        <NextIntlClientProvider
            locale="en"
            messages={messages}
            onError={() => {}}
        >
            <ReactFlowProvider>
                <div style={{ width: 1200, height: 800 }}>
                    <ReactFlow
                        defaultNodes={nodes}
                        defaultEdges={edges}
                        nodeTypes={NODE_TYPES}
                    />
                </div>
            </ReactFlowProvider>
        </NextIntlClientProvider>,
    );
}

beforeEach(() => {
    useFlow.getState().setNodes([]);
    useFlow.getState().setEdges([]);
});

afterEach(() => {
    cleanup();
});

const TEXT_OP: OverlayOp = {
    type: "text",
    x: 0.5,
    y: 0.12,
    anchor: "top-center",
    text: "Ưu đãi {text}",
    size: 0.05,
    color: "#FFFFFF",
    align: "center",
    max_width: 0.8,
    start: 0,
    end: 3.5,
};

const LOGO_OP: OverlayOp = {
    type: "logo",
    x: 0.95,
    y: 0.05,
    anchor: "top-right",
    width: 0.18,
    opacity: 1,
};

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */

describe("compose-overlay node", () => {
    it("renders the 5 ABI handles by data-handleid", async () => {
        const { container } = renderFlow({});
        await waitFor(() => {
            for (const handleId of [
                "in:media",
                "in:text",
                "in:logo",
                "out:image",
                "out:video",
            ]) {
                const el = container.querySelector(
                    `.react-flow__node-composeOverlayNode [data-handleid="${handleId}"]`,
                );
                expect(el, handleId).not.toBeNull();
            }
        });
    });

    it("adds one op of each kind via the editor", async () => {
        renderFlow({ media: "video" });

        // Empty state exposes the 4-kind add menu directly (state 1).
        fireEvent.click(await screen.findByTestId("add-op-text"));
        for (const kind of ["price_tag", "logo", "safe_zone"] as const) {
            fireEvent.click(await screen.findByTestId("add-op-toggle"));
            fireEvent.click(await screen.findByTestId(`add-op-${kind}`));
        }

        await waitFor(() => {
            const rows = screen.getAllByTestId("op-row");
            expect(rows.map((r) => r.getAttribute("data-op-kind"))).toEqual([
                "text",
                "price_tag",
                "logo",
                "safe_zone",
            ]);
        });
    });

    it("shows the time badge and start/end inputs only for video media", async () => {
        renderFlow({ media: "video", ops: [TEXT_OP] });

        // Row badge (state 3).
        const badge = await screen.findByTestId("op-time");
        expect(badge.textContent).toContain("0");
        expect(badge.textContent).toContain("3.5");

        // Expanded form exposes the time window inputs (state 4).
        fireEvent.click(screen.getByTestId("op-edit-0"));
        expect(await screen.findByTestId("op-start")).not.toBeNull();
        expect(screen.getByTestId("op-end")).not.toBeNull();
    });

    it("hides time badge and start/end inputs for image media", async () => {
        renderFlow({ media: "image", ops: [TEXT_OP] });

        await screen.findByTestId("op-row");
        expect(screen.queryByTestId("op-time")).toBeNull();

        fireEvent.click(screen.getByTestId("op-edit-0"));
        await waitFor(() => {
            // The form is expanded (content textarea present) …
            expect(screen.getByTestId("op-text-content")).not.toBeNull();
        });
        // … but carries no time window inputs.
        expect(screen.queryByTestId("op-start")).toBeNull();
        expect(screen.queryByTestId("op-end")).toBeNull();
    });

    it("state-5: logo op without in:logo shows error row + banner and disables execute", async () => {
        renderFlow({ media: "image", ops: [LOGO_OP] });

        const row = await screen.findByTestId("op-row");
        expect(row.getAttribute("data-op-error")).toBe("true");

        const banner = await screen.findByTestId("compose-overlay-logo-banner");
        expect(banner.textContent).toContain("in:logo");

        const execute = screen.getByRole("button", {
            name: /apply overlay/i,
        }) as HTMLButtonElement;
        expect(execute.disabled).toBe(true);
    });

    it("no error state when the logo op has in:logo connected", async () => {
        renderFlow({ media: "image", logoConnected: true, ops: [LOGO_OP] });

        const row = await screen.findByTestId("op-row");
        expect(row.getAttribute("data-op-error")).toBe("false");
        expect(screen.queryByTestId("compose-overlay-logo-banner")).toBeNull();

        const execute = screen.getByRole("button", {
            name: /apply overlay/i,
        }) as HTMLButtonElement;
        expect(execute.disabled).toBe(false);
    });
});
