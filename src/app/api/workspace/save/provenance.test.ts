import { describe, expect, it, vi } from "vitest";

/**
 * AC-7 — a workflow staged from a Director run carries that run's id; a
 * hand-built one carries NULL. Both halves matter: if either collapsed into
 * the other, "which plan produced a favourited output" stops being answerable,
 * which is the whole point of the column.
 *
 * Three write paths reach that column and all three are measured here: the
 * INSERT in /save, the UPDATE in /save, and PUT /workspace/[id] — the one
 * `updateWorkflow()` actually calls, and the one an edit-existing Director run
 * goes through (S4 round-2 finding: wiring only the INSERT left the whole
 * `canvas_was_empty=false` case NULL).
 */
const { insertValuesMock, updateSetMock, existing } = vi.hoisted(() => ({
    insertValuesMock: vi.fn(),
    updateSetMock: vi.fn(),
    // Mutable so a test can choose which branch of /save it exercises:
    // an empty result means "no such workflow" → INSERT.
    existing: { rows: [] as { id: number }[] },
}));

vi.mock("@/db", () => {
    const returning = vi.fn(async () => [{ id: 1 }]);
    const values = (v: unknown) => {
        insertValuesMock(v);
        return { returning };
    };
    const set = (v: unknown) => {
        updateSetMock(v);
        return { where: async () => [{ id: 1 }] };
    };
    return {
        getDb: async () => ({
            insert: () => ({ values }),
            update: () => ({ set }),
            select: () => ({
                from: () => ({
                    where: () => ({ limit: async () => existing.rows }),
                }),
            }),
        }),
        workflows: {},
        tasks: {},
        materials: {},
        directorEvents: {},
    };
});

import { PUT } from "../[id]/route";
import { POST } from "./route";

const save = (body: unknown) =>
    POST(
        new Request("http://localhost/api/workspace/save", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(body),
        }) as never,
    );

const put = (id: string, body: unknown) =>
    PUT(
        new Request(`http://localhost/api/workspace/${id}`, {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(body),
        }) as never,
        { params: Promise.resolve({ id }) },
    );

const base = {
    name: "quy trình của tôi",
    flow: { nodes: [], edges: [] },
};

function reset(rows: { id: number }[] = []) {
    insertValuesMock.mockClear();
    updateSetMock.mockClear();
    existing.rows = rows;
}

describe("workflows.directorRunId — INSERT path (AC-7)", () => {
    it("records the run id when the graph came from Director", async () => {
        reset();
        await save({ ...base, directorRunId: "run-abc" });
        expect(insertValuesMock).toHaveBeenCalledTimes(1);
        expect(insertValuesMock.mock.calls[0][0]).toMatchObject({
            directorRunId: "run-abc",
        });
    });

    it("stores NULL for a hand-built graph — never an empty string", async () => {
        // "" would read as a run id in a JOIN and silently attribute a
        // hand-built workflow to a run that never happened.
        reset();
        await save(base);
        expect(insertValuesMock.mock.calls[0][0]).toMatchObject({
            directorRunId: null,
        });
    });

    it("refuses a non-string run id rather than coercing it", async () => {
        reset();
        await save({ ...base, directorRunId: 42 });
        expect(insertValuesMock.mock.calls[0][0]).toMatchObject({
            directorRunId: null,
        });
    });
});

describe("workflows.directorRunId — UPDATE paths (AC-7)", () => {
    it("/save records the run id when a plan replaces a saved workflow", async () => {
        // The edit-existing case: workflowId is already set, so this goes
        // through UPDATE, not INSERT. Wiring only INSERT left this NULL.
        reset([{ id: 7 }]);
        await save({ ...base, workflowId: 7, directorRunId: "run-edit" });
        expect(insertValuesMock).not.toHaveBeenCalled();
        expect(updateSetMock).toHaveBeenCalledTimes(1);
        expect(updateSetMock.mock.calls[0][0]).toMatchObject({
            directorRunId: "run-edit",
        });
    });

    it("/save leaves stored provenance alone when the save carries none", async () => {
        // Absent ≠ NULL here: a rename or a hand edit of a graph that DID come
        // from a plan must not erase the lineage, so the key is not written.
        reset([{ id: 7 }]);
        await save({ ...base, workflowId: 7 });
        expect(updateSetMock.mock.calls[0][0]).not.toHaveProperty(
            "directorRunId",
        );
    });

    it("PUT /workspace/[id] records the run id — the path updateWorkflow uses", async () => {
        reset([{ id: 7 }]);
        await put("7", { name: "x", directorRunId: "run-put" });
        expect(updateSetMock).toHaveBeenCalledTimes(1);
        expect(updateSetMock.mock.calls[0][0]).toMatchObject({
            directorRunId: "run-put",
        });
    });

    it("PUT writes nothing for an absent or non-string run id", async () => {
        reset([{ id: 7 }]);
        await put("7", { name: "x" });
        expect(updateSetMock.mock.calls[0][0]).not.toHaveProperty(
            "directorRunId",
        );
        reset([{ id: 7 }]);
        await put("7", { name: "x", directorRunId: 42 });
        expect(updateSetMock.mock.calls[0][0]).not.toHaveProperty(
            "directorRunId",
        );
    });
});
