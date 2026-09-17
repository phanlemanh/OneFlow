import "server-only";
import { eq } from "drizzle-orm";
import { WorkflowStatus } from "@/constants/task-status";
import { getDb, tasks } from "@/db";
import { loadPluginsRegistry } from "@/lib/plugins/plugins-registry.server";
import { notifyTask } from "@/lib/task/emitter";
import { executeWorkflowViaEngine } from "@/lib/task/engine-delegate.server";
import { serializeTaskErrorForDb } from "@/lib/task/error-envelope";
import { getSkill } from "./catalog";
import { instantiate } from "./instantiate";
import {
    type SkillRunErrorCode,
    type SkillTaskPrompt,
    slotDefaultPluginFrom,
} from "./run.server";

async function fail(taskId: string, code: SkillRunErrorCode): Promise<void> {
    notifyTask(taskId, WorkflowStatus.WORKFLOW_FAILED, { message: code, code });
    const db = await getDb();
    await db
        .update(tasks)
        .set({
            status: "failed",
            error: serializeTaskErrorForDb({ message: code }),
        })
        .where(eq(tasks.id, taskId));
}

/** Re-instantiate a skill task from its business-only prompt and run it. */
export async function dispatchSkillTask(task: {
    id: string;
    prompt: string;
}): Promise<void> {
    const prompt = JSON.parse(task.prompt) as SkillTaskPrompt;
    const def = getSkill(prompt.skillId);
    if (!def || def.manifest.version !== prompt.skillVersion)
        return fail(task.id, "SKILL_VERSION_CHANGED");
    const inst = instantiate(
        def,
        prompt.params,
        slotDefaultPluginFrom(loadPluginsRegistry().nodePluginMap),
    );
    if (!inst.ok) return fail(task.id, "PLUGIN_NOT_INSTALLED");
    return executeWorkflowViaEngine(
        task.id,
        JSON.stringify(inst.instance.executable),
        {},
        null,
    );
}
