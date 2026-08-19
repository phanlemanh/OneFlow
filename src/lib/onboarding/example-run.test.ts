import { createHash } from "node:crypto";
import {
    existsSync,
    mkdtempSync,
    readdirSync,
    readFileSync,
    rmSync,
    statSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
// `@ext/*` are cloud-shell seams vitest's resolver does not carry. Each maps
// to the identical module the OSS build resolves — real code, not stubs.
vi.mock("@ext/scope", () => import("../../ext-default/scope"));
vi.mock("@ext/db", () => import("../../ext-default/db"));
vi.mock(
    "@ext/plugin-registry",
    () => import("../../ext-default/plugin-registry"),
);
vi.mock("@ext/plugin-env", () => import("../../ext-default/plugin-env"));
vi.mock(
    "@ext/storage-driver",
    () => import("../../ext-default/storage-driver"),
);
vi.mock(
    "@ext/settings-codec",
    () => import("../../ext-default/settings-codec"),
);
vi.mock(
    "@ext/settings-store",
    () => import("../../ext-default/settings-store"),
);
vi.mock("@ext/asset-token", () => import("../../ext-default/asset-token"));
vi.mock("@ext/task-dispatch", () => import("../../ext-default/task-dispatch"));
vi.mock("@ext/task-events", () => import("../../ext-default/task-events"));

/**
 * E22 / AC-2, backend half — the bundled example RUN, end to end, under its
 * own nonce (fresh data dir, fresh plugins dir, real clones, real venvs, the
 * real SDK engine).
 *
 * What makes this eval load-bearing rather than a smoke test: the bundled
 * input clip is a plausible-looking DECOY. A run that silently fails leaves
 * the sample on screen looking exactly like success. So the assertion is a
 * hash RELATION — the run must produce an asset whose bytes differ from every
 * file shipped in public/example-assets/ — and the suppression half pins the
 * reverse: a failed run must leave NO asset masquerading as output.
 *
 * HEAVY (network clones + venv provisioning, minutes on first run), so it
 * only runs under BKO_E22=1 — which is exactly how the eval invokes it
 * (config:executors.test.unit_example_run_produces_new_asset). In the plain
 * unit suite it reports as skipped.
 */

const RUN_TIMEOUT_MS = 900_000;

const EXAMPLE_CLIP_KEY = "example-assets/two-scenes.mp4";

function sha256(path: string): string {
    return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function* filesUnder(dir: string): Generator<string> {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) yield* filesUnder(full);
        else yield full;
    }
}

describe.runIf(process.env.BKO_E22 === "1")("bundled example run (E22)", () => {
    let pluginsRoot: string;
    const dataRoots: string[] = [];
    const bundledHashes = new Set<string>();

    beforeAll(async () => {
        // One plugins dir for the whole file: the second test reuses the
        // clones and venvs the first test provisioned.
        pluginsRoot = mkdtempSync(join(tmpdir(), "bko-e22-plugins-"));
        process.env.TONGFLOW_PLUGINS_DIR = pluginsRoot;

        for (const f of filesUnder(join("public", "example-assets"))) {
            bundledHashes.add(sha256(f));
        }
        expect(bundledHashes.size).toBeGreaterThan(0);

        const { exampleRequirementIds, installMissingForExample } =
            await import("./install-missing.server");
        const ids = await exampleRequirementIds();
        const res = await installMissingForExample(ids);
        expect(res.failed).toEqual([]);
    }, RUN_TIMEOUT_MS);

    afterAll(() => {
        rmSync(pluginsRoot, { recursive: true, force: true });
        for (const d of dataRoots) {
            rmSync(d, { recursive: true, force: true });
        }
        delete process.env.TONGFLOW_PLUGINS_DIR;
        delete process.env.TONGFLOW_DATA_DIR;
    });

    async function runExample(executableJson: string): Promise<{
        status: string;
        producedFiles: string[];
        dataRoot: string;
    }> {
        const dataRoot = mkdtempSync(join(tmpdir(), "bko-e22-data-"));
        dataRoots.push(dataRoot);
        process.env.TONGFLOW_DATA_DIR = dataRoot;
        vi.resetModules();

        const { seedExampleAsset } = await import(
            "./seed-example-asset.server"
        );
        expect(await seedExampleAsset()).toBe(EXAMPLE_CLIP_KEY);

        const { getDb, tasks, workflows } = await import("@/db");
        const { dispatchTask } = await import("@/lib/task/runner");
        const { eq } = await import("drizzle-orm");

        const db = await getDb();
        const [wf] = await db
            .insert(workflows)
            .values({
                name: "bko-e22",
                // The canvas JSON is irrelevant to execution; only the
                // executable matters here. Empty object satisfies NOT NULL.
                flow: "{}",
                executable: executableJson,
            })
            .returning({ id: workflows.id });

        const taskId = `bko-e22-${Math.random().toString(36).slice(2)}`;
        await db.insert(tasks).values({
            id: taskId,
            nodeId: "workflow",
            feature: "workflow",
            prompt: JSON.stringify({ workflowId: wf.id }),
            status: "pending",
            progress: 0,
            workflowId: wf.id,
        });

        await dispatchTask(taskId);

        const row = await db.query.tasks.findFirst({
            where: eq(tasks.id, taskId),
        });
        expect(row).toBeTruthy();

        return {
            status: String(row?.status ?? ""),
            producedFiles: [...filesUnder(join(dataRoot, "uploads", "tasks"))],
            dataRoot,
        };
    }

    it(
        "completes and produces an asset provably distinct from the bundled sample",
        async () => {
            const executable = readFileSync("public/example.json", "utf8");
            const run = await runExample(executable);

            expect(run.status.toLowerCase()).toBe("completed");

            // At least one produced file, and it must not BE the decoy:
            // an output that hashes equal to the bundled input is the
            // bundled input wearing an output's clothes.
            expect(run.producedFiles.length).toBeGreaterThan(0);
            const distinct = run.producedFiles.filter(
                (f) => !bundledHashes.has(sha256(f)),
            );
            expect(distinct.length).toBeGreaterThan(0);
            for (const f of run.producedFiles) {
                expect(bundledHashes.has(sha256(f))).toBe(false);
            }
        },
        RUN_TIMEOUT_MS,
    );

    it(
        "a failed run leaves NO asset that could read as success",
        async () => {
            // Same workflow, input pointed at a fileKey that resolves to
            // nothing — the engine must fail, and failure must not leave
            // anything hash-equal to the bundled sample among outputs.
            const sabotaged = readFileSync(
                "public/example.json",
                "utf8",
            ).replaceAll(EXAMPLE_CLIP_KEY, "example-assets/missing.mp4");
            expect(sabotaged).not.toContain(EXAMPLE_CLIP_KEY);

            const run = await runExample(sabotaged);

            expect(run.status.toLowerCase()).not.toBe("completed");
            for (const f of run.producedFiles) {
                expect(bundledHashes.has(sha256(f))).toBe(false);
            }
        },
        RUN_TIMEOUT_MS,
    );
});
