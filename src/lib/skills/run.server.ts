import "server-only";
import type { Edge, Node } from "@xyflow/react";
import { eq, inArray, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getDb, tasks } from "@/db";
import { loadPluginsRegistry } from "@/lib/plugins/plugins-registry.server";
import type { SerializedTaskError } from "@/lib/task/error-envelope";
import { getSkill, SKILLS } from "./catalog";
import { instantiate } from "./instantiate";
import { validateParams } from "./params";
import type { SkillParamValue } from "./types";

export const SKILL_TASK_FEATURE = "skill";
export const SKILL_CONCURRENCY_MAX = 3;
export const SKILL_RUN_ERROR_CODES = [
    "SKILL_VERSION_CHANGED",
    "PLUGIN_NOT_INSTALLED",
    "RUN_FAILED",
] as const;
export type SkillRunErrorCode = (typeof SKILL_RUN_ERROR_CODES)[number];

export interface SkillTaskPrompt {
    skillId: string;
    skillVersion: string;
    params: Record<string, SkillParamValue>;
}

export function slotDefaultPluginFrom(
    map: Record<string, string[]>,
): Partial<Record<string, string>> {
    const out: Partial<Record<string, string>> = {};
    for (const [slot, ids] of Object.entries(map))
        if (ids?.[0]) out[slot] = ids[0];
    return out;
}

export function listSkills() {
    const defaults = slotDefaultPluginFrom(loadPluginsRegistry().nodePluginMap);
    return SKILLS.map(({ manifest }) => ({
        id: manifest.id,
        version: manifest.version,
        params: manifest.params,
        outputs: manifest.outputs,
        missingSlots: [...new Set(manifest.requires)]
            .filter((s) => !defaults[s])
            .sort(),
    }));
}

export async function submitSkillRun(id: string, raw: unknown) {
    const def = getSkill(id);
    if (!def) return { status: 404 as const, code: "SKILL_NOT_FOUND" as const };
    const v = validateParams(def.manifest, raw);
    if (!v.ok)
        return {
            status: 400 as const,
            code: "SKILL_PARAMS_INVALID" as const,
            errors: v.errors,
        };
    const inst = instantiate(
        def,
        v.params,
        slotDefaultPluginFrom(loadPluginsRegistry().nodePluginMap),
    );
    if (!inst.ok)
        return {
            status: 400 as const,
            code: "PLUGIN_NOT_INSTALLED" as const,
            missingSlots: inst.missingSlots,
        };
    const db = await getDb();
    const [{ n }] = await db
        .select({ n: sql<number>`count(*)` })
        .from(tasks)
        .where(inArray(tasks.status, ["pending", "processing"]));
    const current = Number(n ?? 0);
    if (current >= SKILL_CONCURRENCY_MAX) {
        return {
            status: 429 as const,
            code: "CONCURRENT_TASK_LIMIT_EXCEEDED" as const,
            current,
            max: SKILL_CONCURRENCY_MAX,
        };
    }
    const taskId = nanoid();
    const prompt: SkillTaskPrompt = {
        skillId: id,
        skillVersion: def.manifest.version,
        params: v.params,
    };
    await db.insert(tasks).values({
        id: taskId,
        nodeId: SKILL_TASK_FEATURE,
        feature: SKILL_TASK_FEATURE,
        pluginId: "",
        prompt: JSON.stringify(prompt),
        status: "pending",
        progress: 0,
    });
    return { status: 200 as const, taskId };
}

async function loadSkillTask(taskId: string) {
    const db = await getDb();
    const task = await db.query.tasks.findFirst({
        where: eq(tasks.id, taskId),
    });
    if (!task || task.feature !== SKILL_TASK_FEATURE) return null;
    const prompt = JSON.parse(task.prompt) as SkillTaskPrompt;
    const def = getSkill(prompt.skillId);
    if (!def) return null;
    return { task, prompt, def };
}

export async function readSkillRun(taskId: string) {
    const loaded = await loadSkillTask(taskId);
    if (!loaded) return null;
    const { task, prompt, def } = loaded;
    const status = task.status as
        | "pending"
        | "processing"
        | "completed"
        | "failed";
    let err: SerializedTaskError | null = null;
    if (task.error) {
        try {
            err = JSON.parse(task.error) as SerializedTaskError;
        } catch {
            err = { message: task.error };
        }
    }
    const failedNodeIds = (err?.failures ?? []).map((f) => f.nodeId);
    const steps = def.template.executable.executableNodes.map((n) => ({
        nodeId: n.id,
        slot: n.feature,
        status:
            status === "completed"
                ? "done"
                : status === "failed"
                  ? failedNodeIds.includes(n.id)
                      ? "failed"
                      : "done"
                  : status === "processing"
                    ? "running"
                    : "pending",
    }));
    const result = task.result
        ? (JSON.parse(task.result) as Record<string, string[]>)
        : {};
    const outputs = Object.fromEntries(
        def.manifest.outputs.map((o) => [
            o.key,
            { type: o.type, values: result[o.from] ?? [] },
        ]),
    );
    const code: SkillRunErrorCode | null =
        status !== "failed"
            ? null
            : (SKILL_RUN_ERROR_CODES as readonly string[]).includes(
                    err?.message ?? "",
                )
              ? (err?.message as SkillRunErrorCode)
              : "RUN_FAILED";
    return {
        taskId,
        skillId: prompt.skillId,
        status,
        steps,
        outputs: status === "completed" ? outputs : {},
        error: code ? { code, failedNodeIds } : null,
    };
}

export async function readSkillPlan(
    taskId: string,
): Promise<{ name: string; nodes: Node[]; edges: Edge[] } | null> {
    const loaded = await loadSkillTask(taskId);
    if (!loaded) return null;
    const { prompt, def } = loaded;
    const inst = instantiate(
        def,
        prompt.params,
        slotDefaultPluginFrom(loadPluginsRegistry().nodePluginMap),
    );
    // A plugin uninstalled after the run still lets the person see the plan.
    const flow = inst.ok
        ? inst.instance.originalFlow
        : def.template.originalFlow;
    return { name: prompt.skillId, nodes: flow.nodes, edges: flow.edges };
}
