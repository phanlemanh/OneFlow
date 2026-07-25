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

/** One turn of the conversation sent to the model. The sequence must always
 * alternate `user`/`assistant` and end on a `user` turn (a trailing
 * `assistant` turn is a prefill and is rejected by the model). */
export interface DirectorTurn {
    role: "user" | "assistant";
    text: string;
}

export type PlanGenerator = (turns: DirectorTurn[]) => Promise<DirectorPlan>;

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

/** True when every issue in a non-empty list is MISSING_PLUGIN — the only
 * shape `failureFromIssues` and the final-attempt `PlanValidationError`
 * branch both treat as "the real problem is a missing plugin". */
function isOnlyMissingPlugin(issues: CompileIssue[]): boolean {
    return (
        issues.length > 0 && issues.every((i) => i.code === "MISSING_PLUGIN")
    );
}

function failureFromIssues(issues: CompileIssue[]): DirectorResult {
    return {
        ok: false,
        code: isOnlyMissingPlugin(issues) ? "MISSING_PLUGIN" : "PLAN_INVALID",
        message: issues
            .slice(0, MESSAGE_ISSUE_LIMIT)
            .map((i) => `${i.code}: ${i.message}`)
            .join("; "),
        details: issues,
    };
}

/** The compiler-issue critique: the failed plan itself is echoed back as its
 * own `assistant` turn (see `generateWorkflow`) so this text only needs to
 * carry the issues, legible enough that a model reading it can figure out
 * what to change. */
function issuesFeedback(issues: CompileIssue[]): string {
    return `That plan failed validation. Fix these problems and return a corrected plan:\n${issues
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

/** Appends a `user` turn, merging into the trailing turn instead of pushing a
 * new one when that trailing turn is already `user` — the only way to add
 * critique text without ever producing two consecutive same-role turns. By
 * construction the sequence handed to a `PlanGenerator` always ends on
 * `user` (see below), so this is the sole append point the retry loop needs. */
function appendUserTurn(turns: DirectorTurn[], text: string): void {
    const last = turns[turns.length - 1];
    if (last?.role === "user") {
        last.text = `${last.text}\n\n${text}`;
    } else {
        turns.push({ role: "user", text });
    }
}

export async function generateWorkflow(
    prompt: string,
    generatePlan: PlanGenerator,
    slotDefaultPlugin: Partial<Record<string, string>>,
): Promise<DirectorResult> {
    const turns: DirectorTurn[] = [{ role: "user", text: prompt }];
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
                // No compile-issue list from *this* attempt — it never got
                // as far as compiling — so the only signal available is
                // `lastIssues` from the prior attempt. Route it through the
                // same MISSING_PLUGIN-vs-PLAN_INVALID rule `failureFromIssues`
                // applies everywhere else: if the prior attempt's problem
                // really was a missing plugin, a differently-shaped (here:
                // absent) issue list from the retry must not silently
                // downgrade the user-facing code to a generic PLAN_INVALID
                // (Fix 8).
                return {
                    ok: false,
                    code: isOnlyMissingPlugin(lastIssues)
                        ? "MISSING_PLUGIN"
                        : "PLAN_INVALID",
                    message: err.message,
                    details: lastIssues.length > 0 ? lastIssues : undefined,
                };
            }
            appendUserTurn(turns, feedbackTurnFromValidationError(err.message));
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
        // MISSING_PLUGIN means the model named a slot the vocabulary never
        // listed (it only lists installed slots) — a hallucination, not a
        // structural dead end. The retry's feedback names the offending
        // slot directly ("no installed plugin serves slot ..."), which is
        // exactly the nudge that gets a model to pick a listed one instead
        // (Fix 8) — so this no longer short-circuits before the last
        // attempt. `failureFromIssues` below still resolves the final code
        // to MISSING_PLUGIN when that turns out to be the whole story.
        if (!isLastAttempt) {
            // The model's failed plan becomes its own `assistant` turn (so a
            // model reading the turn has something to locate the offending
            // step ids against — the plan text otherwise never appears
            // anywhere in the visible conversation), and the critique
            // follows as the next `user` turn — keeping the sequence
            // alternating, ending on `user`.
            turns.push({ role: "assistant", text: JSON.stringify(plan) });
            appendUserTurn(turns, issuesFeedback(issues));
        }
    }
    return failureFromIssues(lastIssues);
}
