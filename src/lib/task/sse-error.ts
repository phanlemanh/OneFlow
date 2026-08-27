import type { SSEMessageData } from "@/types/sse";

/**
 * The most specific failure sentence an SSE task message carries.
 *
 * Order is the whole point. `runner.ts` reports a thrown execution error as
 * `{ message: "Task execution failed", error: <the real sentence> }` — the
 * headline is a constant, the `error` is what actually happened. Reading the
 * headline first hands every consumer the same useless string: the failure
 * toast showed "Task execution failed", and the node's key prompt (which
 * routes on this text via `classifyFailure`) could never open, because a
 * generic headline classifies to `kind: "none"`.
 *
 * One function, three call sites — the two task hooks and the failure toast.
 * They disagreed before, which is how the batch path silently dropped
 * `data.error` while its sibling read it correctly.
 */
export function taskErrorFromSSE(message: {
    /** Some backends put the sentence at the top level; most nest it in data. */
    error?: unknown;
    data?: SSEMessageData;
}): string | undefined {
    const candidates = [
        message.error,
        message.data?.error,
        message.data?.message,
    ];
    for (const candidate of candidates) {
        if (typeof candidate !== "string") continue;
        const trimmed = candidate.trim();
        if (trimmed) return trimmed;
    }
    return undefined;
}
