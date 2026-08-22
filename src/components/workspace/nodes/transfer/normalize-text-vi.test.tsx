// @vitest-environment jsdom
/**
 * E9a — the normalize-text-vi canvas node (AC-9).
 *
 * Two claims:
 *  - the node renders exactly the two ABI handles (`in:text`, `out:text`);
 *  - its fan-out spec is IDENTICAL to the TTS nodes it feeds. That is asserted
 *    against the TTS node's own spec rather than a copied literal — the promise
 *    is "same as TTS", so TTS is the oracle. A literal would keep passing on the
 *    day someone changes how TTS fans out.
 */

import { cleanup, render, waitFor } from "@testing-library/react";
import {
    type Edge,
    Handle,
    type Node,
    Position,
    ReactFlow,
    ReactFlowProvider,
} from "@xyflow/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import useFlow from "@/hooks/use-flow";
import messages from "@/i18n/messages/en.json";
import { NODE_TYPE_SOURCE_SPEC } from "@/lib/abi/node-feature-registry";
import {
    getAbiNodeRegistration,
    unregisterAbiNode,
} from "@/lib/abi/node-registry";

import NormalizeTextViNode from "./normalize-text-vi";

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
/* Harness                                                             */
/* ------------------------------------------------------------------ */

const StubTextNode = () => (
    <div>
        <Handle type="source" position={Position.Right} id="out:textNode" />
    </div>
);

const NODE_TYPES = {
    normalizeTextViNode: NormalizeTextViNode,
    textNode: StubTextNode,
};

const NODE_ID = "nv1";

function renderNode() {
    const nodes: Node[] = [
        {
            id: "t1",
            type: "textNode",
            position: { x: 0, y: 0 },
            data: { texts: ["Giá 1.999.000₫"] },
        },
        {
            id: NODE_ID,
            type: "normalizeTextViNode",
            position: { x: 300, y: 0 },
            data: { texts: ["Giá 1.999.000₫"] },
        },
    ];
    const edges: Edge[] = [
        {
            id: "e1",
            source: "t1",
            sourceHandle: "out:textNode",
            target: NODE_ID,
            targetHandle: "in:text",
        },
    ];

    // Seed the flow store BEFORE render: without it useAbiForm reads no
    // upstream data and the node mounts empty.
    useFlow.getState().setNodes(nodes);
    useFlow.getState().setEdges(edges);

    return render(
        <NextIntlClientProvider locale="en" messages={messages}>
            <ReactFlowProvider>
                <ReactFlow nodes={nodes} edges={edges} nodeTypes={NODE_TYPES} />
            </ReactFlowProvider>
        </NextIntlClientProvider>,
    );
}

afterEach(() => {
    unregisterAbiNode(NODE_ID);
    cleanup();
});

describe("normalize-text-vi node", () => {
    it("renders exactly the two ABI handles", async () => {
        renderNode();
        await waitFor(() => {
            expect(
                document.querySelector('[data-handleid="in:text"]'),
            ).toBeTruthy();
            expect(
                document.querySelector('[data-handleid="out:text"]'),
            ).toBeTruthy();
        });
        // No third handle: the slot declares exactly one input and one output.
        // React Flow puts `data-nodeid` on the handle element itself, not on a
        // wrapper — a descendant selector here silently matches nothing and
        // would turn this count into a vacuous assertion.
        const handles = document.querySelectorAll(
            `[data-handleid][data-nodeid="${NODE_ID}"]`,
        );
        expect(
            Array.from(handles)
                .map((h) => h.getAttribute("data-handleid"))
                .sort(),
        ).toEqual(["in:text", "out:text"]);
    });

    it("fans out exactly like the TTS nodes it feeds", () => {
        expect(NODE_TYPE_SOURCE_SPEC.normalizeTextViNode).toEqual(
            NODE_TYPE_SOURCE_SPEC.textGenSpeechPresetNode,
        );
    });

    it("registers under the right ABI feature when mounted", async () => {
        // MOUNT the node and let the real write path run. The previous shape of
        // this test called registerAbiNode() itself with hand-written arguments
        // and then read them back, so it asserted only that the registry stores
        // what you put in it — the production writer (registerAbiNode inside
        // AbiNodeShell's useAbiExecution) was never executed, and deleting it
        // left this green (measured, S4 round 5 finding). The registry is
        // cleared in afterEach, so an empty read here means nothing wrote.
        expect(getAbiNodeRegistration(NODE_ID)).toBeUndefined();

        renderNode();

        await waitFor(() => {
            const registration = getAbiNodeRegistration(NODE_ID);
            expect(registration?.feature).toBe("normalize-text-vi");
            expect(registration?.sourceSpec).toEqual(
                NODE_TYPE_SOURCE_SPEC.normalizeTextViNode,
            );
        });
    });
});
