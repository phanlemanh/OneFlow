import { describe, expect, it, vi } from "vitest";

const { runDirectorMock, recordGeneratedMock } = vi.hoisted(() => ({
    runDirectorMock: vi.fn(),
    recordGeneratedMock: vi.fn(async (_event: Record<string, unknown>) => {}),
}));
vi.mock("@/lib/director/director.server", () => ({
    runDirector: runDirectorMock,
}));
vi.mock("@/lib/director/events/director-events.server", () => ({
    recordGenerated: recordGeneratedMock,
}));

import { POST } from "./route";

const PLAN = {
    dslVersion: 1,
    name: "One image",
    description: "d",
    steps: [{ id: "s1", kind: "text", text: "xin chào" }],
};

function okResult() {
    return {
        ok: true as const,
        name: "One image",
        description: "d",
        nodes: [{ id: "n1" }],
        edges: [],
        planJson: JSON.stringify(PLAN),
        runId: "run-abc",
        dslVersion: 1,
        attempts: 1,
    };
}
const req = (body: unknown) =>
    new Request("http://localhost/api/director", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
    });

describe("AC-1 — the accepted plan reaches the client", () => {
    it("returns planJson, runId and dslVersion on success", async () => {
        runDirectorMock.mockResolvedValueOnce(okResult());
        const body = await (await POST(req({ prompt: "p" }) as never)).json();

        expect(body.runId).toBe("run-abc");
        expect(body.dslVersion).toBe(1);
        // planJson must be a *string* the client can hand back verbatim as an
        // assistant turn — not a re-serialized object, which would change bytes.
        expect(typeof body.planJson).toBe("string");
        expect(JSON.parse(body.planJson)).toEqual(PLAN);
    });

    it("round-trips a plan the compiler would still accept", async () => {
        // The point of returning the plan is replay. A payload that parses but
        // has lost `steps` would satisfy a shallow check and be useless.
        runDirectorMock.mockResolvedValueOnce(okResult());
        const body = await (await POST(req({ prompt: "p" }) as never)).json();
        const back = JSON.parse(body.planJson);
        expect(back.steps).toHaveLength(1);
        expect(back.steps[0].id).toBe("s1");
        expect(back.dslVersion).toBe(body.dslVersion);
    });
});

describe("AC-2 — a client that does not know the new fields is unaffected", () => {
    it("keeps the four original fields under their original names and shapes", async () => {
        runDirectorMock.mockResolvedValueOnce(okResult());
        const res = await POST(req({ prompt: "p" }) as never);
        const body = await res.json();

        // Destructured exactly the way the pre-existing client does.
        const { name, description, nodes, edges } = body;
        expect(name).toBe("One image");
        expect(description).toBe("d");
        expect(Array.isArray(nodes)).toBe(true);
        expect(Array.isArray(edges)).toBe(true);
        expect(res.status).toBe(200);
    });

    it("adds fields, never renames or removes one", async () => {
        runDirectorMock.mockResolvedValueOnce(okResult());
        const body = await (await POST(req({ prompt: "p" }) as never)).json();
        // A literal superset check: renaming `nodes` to `graph` would keep the
        // count identical, so assert the names themselves.
        expect(Object.keys(body).sort()).toEqual(
            [
                "description",
                "dslVersion",
                "edges",
                "name",
                "nodes",
                "planJson",
                "runId",
            ].sort(),
        );
    });
});

describe("AC-4 — every run is recorded server-side", () => {
    it("records a successful run with its plan and attempt count", async () => {
        recordGeneratedMock.mockClear();
        runDirectorMock.mockResolvedValueOnce(okResult());
        await POST(req({ prompt: "ghi lại tôi" }) as never);

        expect(recordGeneratedMock).toHaveBeenCalledTimes(1);
        const arg = recordGeneratedMock.mock.calls[0][0] as Record<
            string,
            unknown
        >;
        expect(arg.runId).toBe("run-abc");
        expect(arg.promptText).toBe("ghi lại tôi");
        expect(arg.attempts).toBe(1);
        expect(arg.errorCode).toBeUndefined();
    });

    it("records a FAILED run too — a run that produced no plan is a data point", async () => {
        recordGeneratedMock.mockClear();
        runDirectorMock.mockResolvedValueOnce({
            ok: false as const,
            code: "PLAN_INVALID" as const,
            message: "nope",
            attempts: 2,
        });
        const res = await POST(req({ prompt: "hỏng đi" }) as never);

        expect(res.status).toBe(422);
        expect(recordGeneratedMock).toHaveBeenCalledTimes(1);
        const arg = recordGeneratedMock.mock.calls[0][0] as Record<
            string,
            unknown
        >;
        expect(arg.errorCode).toBe("PLAN_INVALID");
        expect(arg.attempts).toBe(2);
        expect(arg.planJson).toBeUndefined();
    });

    it("does not record a run rejected before the model was reached", async () => {
        // A body that never becomes a run is not a run. Recording it would
        // inflate the denominator of every rate computed from this ledger.
        recordGeneratedMock.mockClear();
        const res = await POST(req({ prompt: 42 }) as never);
        expect(res.status).toBe(400);
        expect(recordGeneratedMock).not.toHaveBeenCalled();
    });
});
