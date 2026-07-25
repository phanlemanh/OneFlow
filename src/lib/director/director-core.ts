/**
 * Transport-free Director core: plan generation is injected so the retry
 * loop and error taxonomy are unit-testable without the Anthropic SDK.
 */
import type { Edge, Node } from "@xyflow/react";
import { type CompileIssue, compilePlan } from "./compile";
import type { DirectorPlan } from "./dsl";

export type DirectorErrorCode =
    | "INVALID_PROMPT"
    | "MISSING_API_KEY"
    | "AUTH_FAILED"
    | "RATE_LIMITED"
    | "PLAN_INVALID"
    | "MISSING_PLUGIN"
    | "UPSTREAM_ERROR";

export type DirectorResult =
    | {
          ok: true;
          name: string;
          description: string;
          nodes: Node[];
          edges: Edge[];
      }
    | {
          ok: false;
          code: DirectorErrorCode;
          message: string;
          details?: CompileIssue[];
      };

export type PlanGenerator = (userTurns: string[]) => Promise<DirectorPlan>;

const MAX_ATTEMPTS = 2;

/** How many issues to surface in the top-level message; the full list is
 * always available on `details` for callers that want it. */
const MESSAGE_ISSUE_LIMIT = 3;

function failureFromIssues(issues: CompileIssue[]): DirectorResult {
    const onlyPluginIssues = issues.every((i) => i.code === "MISSING_PLUGIN");
    return {
        ok: false,
        code: onlyPluginIssues ? "MISSING_PLUGIN" : "PLAN_INVALID",
        message: issues
            .slice(0, MESSAGE_ISSUE_LIMIT)
            .map((i) => `${i.code}: ${i.message}`)
            .join("; "),
        details: issues,
    };
}

/** The retry turn fed back to the model: every issue, legible enough that a
 * model reading it can figure out what to change. */
function feedbackTurn(issues: CompileIssue[]): string {
    return `Your plan failed validation. Fix these problems and return a corrected plan:\n${issues
        .map(
            (i) =>
                `- [${i.code}]${i.stepId ? ` step "${i.stepId}":` : ""} ${i.message}`,
        )
        .join("\n")}`;
}

export async function generateWorkflow(
    prompt: string,
    generatePlan: PlanGenerator,
    slotDefaultPlugin: Partial<Record<string, string>>,
): Promise<DirectorResult> {
    const turns = [prompt];
    let lastIssues: CompileIssue[] = [];

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const plan = await generatePlan(turns);
        const { nodes, edges, issues } = compilePlan(plan, {
            slotDefaultPlugin,
        });
        if (issues.length === 0) {
            return {
                ok: true,
                name: plan.name,
                description: plan.description,
                nodes,
                edges,
            };
        }
        lastIssues = issues;
        turns.push(feedbackTurn(issues));
    }
    return failureFromIssues(lastIssues);
}
