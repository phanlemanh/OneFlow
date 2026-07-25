import { describe, expect, it, vi } from "vitest";
import { parseWorkflowImportJson } from "@/lib/workflow/exporter";

const { runDirectorMock } = vi.hoisted(() => ({
    runDirectorMock: vi.fn(),
}));

vi.mock("@/lib/director/director.server", () => ({
    runDirector: runDirectorMock,
}));

import { POST } from "./route";

function req(body: unknown): Request {
    return new Request("http://localhost/api/director", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
    });
}

function rawReq(rawBody: string): Request {
    return new Request("http://localhost/api/director", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: rawBody,
    });
}

describe("POST /api/director", () => {
    it("400 INVALID_PROMPT on missing prompt, without calling runDirector", async () => {
        const res = await POST(req({}) as never);
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error.code).toBe("INVALID_PROMPT");
        expect(runDirectorMock).not.toHaveBeenCalled();
    });

    it("400 INVALID_PROMPT when prompt is not a string", async () => {
        const res = await POST(req({ prompt: 42 }) as never);
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error.code).toBe("INVALID_PROMPT");
        expect(runDirectorMock).not.toHaveBeenCalled();
    });

    it("400 INVALID_PROMPT on a body that is not valid JSON", async () => {
        const res = await POST(rawReq("not json") as never);
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error.code).toBe("INVALID_PROMPT");
        expect(runDirectorMock).not.toHaveBeenCalled();
    });

    it("400 INVALID_PROMPT on >2000 chars, without calling runDirector", async () => {
        const res = await POST(req({ prompt: "x".repeat(2001) }) as never);
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error.code).toBe("INVALID_PROMPT");
        expect(runDirectorMock).not.toHaveBeenCalled();
    });

    it("200 with workflow payload on success", async () => {
        runDirectorMock.mockResolvedValueOnce({
            ok: true,
            name: "n",
            description: "d",
            nodes: [],
            edges: [],
        });
        const res = await POST(req({ prompt: "a cat" }) as never);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json).toEqual({
            name: "n",
            description: "d",
            nodes: [],
            edges: [],
        });
        expect(runDirectorMock).toHaveBeenCalledWith("a cat");
    });

    it("success payload satisfies parseWorkflowImportJson's root-level shape", async () => {
        const nodes = [
            {
                id: "s1",
                type: "genTextNode",
                position: { x: 0, y: 0 },
                data: {},
            },
        ];
        runDirectorMock.mockResolvedValueOnce({
            ok: true,
            name: "n",
            description: "d",
            nodes,
            edges: [],
        });
        const res = await POST(req({ prompt: "a cat" }) as never);
        const json = await res.json();
        const parsed = parseWorkflowImportJson(json);
        expect(parsed.name).toBe("n");
        expect(parsed.description).toBe("d");
        expect(parsed.nodes).toEqual(nodes);
        expect(parsed.edges).toEqual([]);
    });

    it.each([
        ["INVALID_PROMPT", 400],
        ["MISSING_API_KEY", 400],
        ["AUTH_FAILED", 401],
        ["RATE_LIMITED", 429],
        ["PLAN_INVALID", 422],
        ["MISSING_PLUGIN", 422],
        ["UPSTREAM_ERROR", 502],
    ] as const)("maps %s to HTTP %d", async (code, status) => {
        runDirectorMock.mockResolvedValueOnce({
            ok: false,
            code,
            message: "nope",
        });
        const res = await POST(req({ prompt: "boom" }) as never);
        expect(res.status).toBe(status);
        const json = await res.json();
        expect(json.error.code).toBe(code);
        expect(json.error.message).toBe("nope");
    });

    it("forwards details on failure when runDirector supplies them", async () => {
        const details = [{ code: "MISSING_PLUGIN", message: "no plugin" }];
        runDirectorMock.mockResolvedValueOnce({
            ok: false,
            code: "MISSING_PLUGIN",
            message: "nope",
            details,
        });
        const res = await POST(req({ prompt: "boom" }) as never);
        const json = await res.json();
        expect(json.error.details).toEqual(details);
    });
});
