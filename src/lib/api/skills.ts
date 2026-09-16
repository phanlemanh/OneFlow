/**
 * Client fetchers for the skill routes. They never throw on 4xx: the panel
 * branches on the status (field errors, missing plugin, busy), so a status is
 * data here, not an exception.
 */
import type { SkillOutput, SkillParam } from "@/lib/skills/types";

export interface SkillListItem {
    id: string;
    version: string;
    params: SkillParam[];
    outputs: SkillOutput[];
    missingSlots: string[];
}

export type SkillStepStatus = "pending" | "running" | "done" | "failed";

export interface SkillRunView {
    taskId: string;
    skillId: string;
    status: "pending" | "processing" | "completed" | "failed";
    steps: { nodeId: string; slot: string; status: SkillStepStatus }[];
    outputs: Record<string, { type: SkillOutput["type"]; values: string[] }>;
    error: null | {
        code: "SKILL_VERSION_CHANGED" | "PLUGIN_NOT_INSTALLED" | "RUN_FAILED";
        failedNodeIds: string[];
    };
}

export interface SkillPlan {
    name: string;
    nodes: unknown[];
    edges: unknown[];
}

export interface HttpResult<T> {
    status: number;
    body: T;
}

async function readJson<T>(res: Response): Promise<HttpResult<T>> {
    let body: unknown = null;
    try {
        body = await res.json();
    } catch {
        body = null;
    }
    return { status: res.status, body: body as T };
}

export async function fetchSkills(): Promise<
    HttpResult<{ skills: SkillListItem[] }>
> {
    return readJson(await fetch("/api/skills"));
}

export type SubmitSkillBody =
    | { taskId: string }
    | {
          code: "SKILL_PARAMS_INVALID";
          errors: { param: string; reason: string }[];
      }
    | { code: "PLUGIN_NOT_INSTALLED"; missingSlots: string[] }
    | { code: "CONCURRENT_TASK_LIMIT_EXCEEDED"; current: number; max: number }
    | { code: "SKILL_NOT_FOUND" };

export async function submitSkillRun(
    skillId: string,
    params: Record<string, unknown>,
): Promise<HttpResult<SubmitSkillBody>> {
    return readJson(
        await fetch(`/api/skills/${encodeURIComponent(skillId)}/run`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ params }),
        }),
    );
}

export async function fetchSkillRun(
    taskId: string,
): Promise<HttpResult<SkillRunView>> {
    return readJson(
        await fetch(`/api/skills/runs/${encodeURIComponent(taskId)}`),
    );
}

export async function fetchSkillPlan(
    taskId: string,
): Promise<HttpResult<SkillPlan>> {
    return readJson(
        await fetch(`/api/skills/runs/${encodeURIComponent(taskId)}/plan`),
    );
}
