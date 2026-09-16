/**
 * Shared helpers for skill route tests. Tests only — never imported by a
 * route. Every caller has already pointed TONGFLOW_DATA_DIR at a temp dir
 * (see temp-env.ts) before the first getDb().
 */
import { sql } from "drizzle-orm";
import { getDb, tasks } from "@/db";
import type { PluginsRegistry } from "@/lib/plugins/plugins-registry-schema";

/** Registry stand-in: slot -> installed plugin ids. */
export function registryWith(slots: string[]): PluginsRegistry {
    return {
        version: 1,
        generatedAt: "2026-09-16T00:00:00.000Z",
        nodePluginMap: Object.fromEntries(
            slots.map((s) => [s, [`oneflow-api-fake-${s}`]]),
        ),
        plugins: {},
    } as PluginsRegistry;
}

export async function countTasks(): Promise<number> {
    const db = await getDb();
    const [row] = await db.select({ n: sql<number>`count(*)` }).from(tasks);
    return Number(row?.n ?? 0);
}

export async function insertTask(values: {
    id: string;
    feature: string;
    prompt: unknown;
    status: string;
    result?: unknown;
    error?: string;
}): Promise<void> {
    const db = await getDb();
    await db.insert(tasks).values({
        id: values.id,
        nodeId: values.feature,
        feature: values.feature,
        pluginId: "",
        prompt: JSON.stringify(values.prompt),
        status: values.status,
        progress: 0,
        result:
            values.result === undefined ? null : JSON.stringify(values.result),
        error: values.error ?? null,
    });
}

export function jsonRequest(url: string, body: unknown): Request {
    return new Request(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
    });
}
