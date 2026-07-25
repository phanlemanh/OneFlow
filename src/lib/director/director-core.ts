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

/**
 * Thrown by a `PlanGenerator` when the model's response could not be turned
 * into a schema-valid `DirectorPlan` — e.g. `zodOutputFormat`'s client-side
 * re-check rejects a plan whose step count / name / description length
 * exceeds a bound the API's own grammar can't express (see dsl.ts's caps),
 * or the model returned no parsable text at all. This is a *plan* problem,
 * not a *transport* problem: `generateWorkflow` catches it below and feeds
 * it back into the same retry loop used for compiler issues, instead of
 * letting a raw throw escape and get mapped to a generic upstream error.
 *
 * `director.server.ts` is responsible for telling this apart from a genuine
 * Anthropic API failure (auth, rate limit, connection — all `APIError`
 * subclasses) before throwing it; see its own comment on that
 * classification. Anything a `PlanGenerator` throws that is *not* this class
 * is assumed to be a real transport failure and is rethrown unchanged so the
 * caller (director.server.ts's `mapAnthropicError`) can classify it.
 */
export class PlanValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "PlanValidationError";
    }
}

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

/** The retry turn fed back to the model after a compile failure: the failed
 * plan itself (so a model reading the turn has something to locate the
 * offending step ids against — the plan text otherwise never appears
 * anywhere in the visible conversation) followed by every issue, legible
 * enough that a model reading it can figure out what to change. */
function feedbackTurn(plan: DirectorPlan, issues: CompileIssue[]): string {
    return `Your previous plan failed validation:\n${JSON.stringify(plan)}\n\nFix these problems and return a corrected plan:\n${issues
        .map(
            (i) =>
                `- [${i.code}]${i.stepId ? ` step "${i.stepId}":` : ""} ${i.message}`,
        )
        .join("\n")}`;
}

/** The retry turn fed back after a `PlanValidationError` — there is no
 * schema-valid plan object to echo back (that's exactly what failed), so
 * the model gets the raw validation message instead. */
function feedbackTurnFromValidationError(message: string): string {
    return `Your previous response could not be parsed as a valid plan: ${message}\nReturn a corrected plan matching the schema.`;
}

export async function generateWorkflow(
    prompt: string,
    generatePlan: PlanGenerator,
    slotDefaultPlugin: Partial<Record<string, string>>,
): Promise<DirectorResult> {
    const turns = [prompt];
    let lastIssues: CompileIssue[] = [];

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const isLastAttempt = attempt === MAX_ATTEMPTS - 1;

        let plan: DirectorPlan;
        try {
            plan = await generatePlan(turns);
        } catch (err) {
            // Only a plan-validation failure is retried here; anything else
            // is not ours to interpret — let it propagate to the caller
            // (director.server.ts's mapAnthropicError classifies it).
            if (!(err instanceof PlanValidationError)) {
                throw err;
            }
            if (isLastAttempt) {
                return {
                    ok: false,
                    code: "PLAN_INVALID",
                    message: err.message,
                };
            }
            turns.push(feedbackTurnFromValidationError(err.message));
            continue;
        }

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
        // Every issue is MISSING_PLUGIN: no installed plugin serves the
        // slot, and no amount of replanning changes that — short-circuit
        // instead of burning a second model call on a guaranteed-useless
        // retry (and instead of letting a later attempt's differently-shaped
        // issue list flip the user-facing code away from MISSING_PLUGIN).
        if (issues.every((i) => i.code === "MISSING_PLUGIN")) {
            return failureFromIssues(issues);
        }
        if (!isLastAttempt) {
            turns.push(feedbackTurn(plan, issues));
        }
    }
    return failureFromIssues(lastIssues);
}
