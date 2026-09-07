import { describe, expect, it, vi } from "vitest";

/**
 * AC-7 — a workflow staged from a Director run carries that run's id; a
 * hand-built one carries NULL. Both halves matter: if either collapsed into
 * the other, "which plan produced a favourited output" stops being answerable,
 * which is the whole point of the column.
 */
const { insertValuesMock } = vi.hoisted(() => ({ insertValuesMock: vi.fn() }));

vi.mock("@/db", () => {
    const returning = vi.fn(async () => [{ id: 1 }]);
    const values = (v: unknown) => {
        insertValuesMock(v);
        return { returning };
    };
    return {
        getDb: async () => ({
            insert: () => ({ values }),
            update: () => ({ set: () => ({ where: async () => [{ id: 1 }] }) }),
            select: () => ({
                from: () => ({ where: () => ({ limit: async () => [] }) }),
            }),
        }),
        workflows: {},
        tasks: {},
        materials: {},
        directorEvents: {},
    };
});

import { POST } from "./route";

const save = (body: unknown) =>
    POST(
        new Request("http://localhost/api/workspace/save", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(body),
        }) as never,
    );

const base = {
    name: "quy trình của tôi",
    flow: { nodes: [], edges: [] },
};

describe("workflows.directorRunId (AC-7)", () => {
    it("records the run id when the graph came from Director", async () => {
        insertValuesMock.mockClear();
        await save({ ...base, directorRunId: "run-abc" });
        expect(insertValuesMock).toHaveBeenCalledTimes(1);
        expect(insertValuesMock.mock.calls[0][0]).toMatchObject({
            directorRunId: "run-abc",
        });
    });

    it("stores NULL for a hand-built graph — never an empty string", async () => {
        // "" would read as a run id in a JOIN and silently attribute a
        // hand-built workflow to a run that never happened.
        insertValuesMock.mockClear();
        await save(base);
        expect(insertValuesMock.mock.calls[0][0]).toMatchObject({
            directorRunId: null,
        });
    });

    it("refuses a non-string run id rather than coercing it", async () => {
        insertValuesMock.mockClear();
        await save({ ...base, directorRunId: 42 });
        expect(insertValuesMock.mock.calls[0][0]).toMatchObject({
            directorRunId: null,
        });
    });
});
