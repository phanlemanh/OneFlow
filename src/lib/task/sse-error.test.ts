import { describe, expect, it } from "vitest";
import { classifyFailure } from "@/lib/onboarding/failure-actions";
import type { SSEMessage } from "@/types/sse";
import { taskErrorFromSSE } from "./sse-error";

function failed(data: SSEMessage["data"]): SSEMessage {
    return { id: "t1", status: "FAILED", nodeId: "n1", data };
}

describe("taskErrorFromSSE", () => {
    it("prefers the specific error over the generic headline", () => {
        // The decisive fixture, straight from S4 round 2: the executor's
        // pre-flight throws, runner.ts wraps it as
        // { message: "Task execution failed", error: <the real sentence> }.
        // Reading `message` first is what made the node's key prompt
        // impossible to reach — the routable sentence never arrived.
        const text = taskErrorFromSSE(
            failed({
                message: "Task execution failed",
                error: "Missing required env var OPENAI_API_KEY",
            }),
        );

        expect(text).toBe("Missing required env var OPENAI_API_KEY");
        // The RELATION that matters: what arrives is routable, not merely
        // non-empty. A generic headline classifies to `none` and no recovery
        // exit is ever offered.
        expect(classifyFailure(text ?? "")).toEqual({
            kind: "enter-key",
            envKey: "OPENAI_API_KEY",
        });
    });

    it("reads a top-level error field when the backend sends one", () => {
        const message: SSEMessage = {
            id: "t1",
            status: "FAILED",
            nodeId: null,
        };
        expect(
            taskErrorFromSSE({
                ...message,
                error: "boom",
            } as SSEMessage & { error: string }),
        ).toBe("boom");
    });

    it("falls back to the headline when that is all the backend sent", () => {
        // Suppression half: preferring `error` must not become "ignore
        // everything else" — a failure with only a headline still has to
        // reach the user.
        expect(taskErrorFromSSE(failed({ message: "Task not found" }))).toBe(
            "Task not found",
        );
    });

    it("returns undefined when the payload carries no text at all", () => {
        expect(taskErrorFromSSE(failed({}))).toBeUndefined();
        expect(taskErrorFromSSE(failed(undefined))).toBeUndefined();
    });

    it("ignores blank and whitespace-only fields rather than reporting them", () => {
        expect(
            taskErrorFromSSE(failed({ error: "   ", message: "real one" })),
        ).toBe("real one");
    });
});
