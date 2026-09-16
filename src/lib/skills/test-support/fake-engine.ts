/**
 * A stand-in for the Python engine child process: the REAL engine delegate
 * spawns it and parses what it writes, so the events and the persisted result
 * a test sees are produced by the product's own parsing, not typed by hand.
 * Tests only. The caller mocks `node:child_process` so `spawn` returns
 * `fakeEngineChild(lines)`.
 */
import { EventEmitter } from "node:events";

export type EngineLine =
    | { event: Record<string, unknown> }
    | { result: Record<string, unknown> }
    | { error: string };

export function fakeEngineChild(lines: EngineLine[]) {
    const child = new EventEmitter() as EventEmitter & {
        stdout: EventEmitter;
        stderr: EventEmitter;
        stdin: { write: (s: string) => void; end: () => void };
        kill: () => void;
    };
    child.stdout = new EventEmitter();
    child.stderr = new EventEmitter();
    child.kill = () => {};
    child.stdin = {
        write: () => {},
        // The delegate ends stdin once the request is written; emit afterwards.
        end: () => {
            setTimeout(() => {
                for (const line of lines) {
                    child.stdout.emit(
                        "data",
                        Buffer.from(`${JSON.stringify(line)}\n`),
                    );
                }
                child.emit("exit", 0);
            }, 0);
        },
    };
    return child;
}

/**
 * NDJSON for a run where every node succeeds. `nodeOutputs` is in the shape
 * the real engine returns and the delegate persists: node id -> list of raw
 * plugin outputs (see fixtures/tach-tieng-video.engine-result.json).
 */
export function succeedingRun(
    nodeIds: string[],
    nodeOutputs: Record<string, Record<string, unknown>[]>,
): EngineLine[] {
    return [
        {
            event: {
                type: "workflow_started",
                totalNodes: nodeIds.length,
                levels: 1,
            },
        },
        ...nodeIds.flatMap((id): EngineLine[] => [
            { event: { type: "node_started", nodeId: id } },
            { event: { type: "node_completed", nodeId: id } },
        ]),
        { result: { status: "success", outputs: nodeOutputs } },
    ];
}

/** NDJSON for a run where `failId` fails after the nodes before it succeed. */
export function failingRun(nodeIds: string[], failId: string): EngineLine[] {
    const lines: EngineLine[] = [
        {
            event: {
                type: "workflow_started",
                totalNodes: nodeIds.length,
                levels: 1,
            },
        },
    ];
    for (const id of nodeIds) {
        lines.push({ event: { type: "node_started", nodeId: id } });
        if (id === failId) {
            lines.push({
                event: { type: "node_failed", nodeId: id, error: "boom" },
            });
            break;
        }
        lines.push({ event: { type: "node_completed", nodeId: id } });
    }
    lines.push({
        result: {
            status: "failed",
            outputs: {},
            errors: ["boom"],
            failures: [{ nodeId: failId, summary: "boom" }],
        },
    });
    return lines;
}
