import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { logger } from "@/lib/logger";
import { loadEnvStore } from "@/lib/settings/env-store.server";
import { classifyPlanError } from "./classify-plan-error";
import {
    type DirectorResult,
    generateWorkflow,
    PlanValidationError,
} from "./director-core";
import { DIRECTOR_DSL_VERSION, DirectorPlanSchema } from "./dsl";
import {
    FEW_SHOT_EXAMPLE_JSON,
    FEW_SHOT_EXAMPLE_PROMPT,
} from "./few-shot-example";
import { buildDirectorCatalog } from "./vocabulary.server";

const MODEL = "claude-opus-4-8";
const MAX_TOKENS = 16000;

/**
 * Static rules block — first system block, never varies per request, sits
 * before the vocabulary block so the cache breakpoint (placed after the
 * vocabulary) covers both as one stable prefix.
 */
const RULES = `You are the TongFlow Director. Turn the user's creative intent into a
workflow plan expressed in Director DSL v${DIRECTOR_DSL_VERSION} (JSON matching the schema
below). Return ONLY the plan — no prose, no markdown fences.

Plan shape:
{
  "dslVersion": ${DIRECTOR_DSL_VERSION},
  "name": "<short title, max 120 chars>",
  "description": "<one sentence, max 500 chars>",
  "steps": [ <step>, ... ]   // 1-60 steps
}

A step is either:
- a text source: {"id": "<id>", "kind": "text", "text": "<literal text>"}
- a generation step: {"id": "<id>", "kind": "gen", "slot": "<slot>", "inputs": [...], "params": [...]}

"text" steps are the ONLY source of literal content in a plan — there is no
other step kind that introduces new material.

Vocabulary line format (see "Available slots" below): each line is
  - slot "<slot>": inputs(<list>) params(<list>) -> <modality>
- An inputs(...) entry is "<field>: <modality>", optionally followed by "[]"
  (this field accepts more than one connection — an array of values, one per
  connection) and optionally followed by one parenthesized, comma-separated
  tag group, e.g. "(required, manual)" — tags never appear as separate
  groups.
- A params(...) entry is "<field>: <type>", optionally followed by
  "(required)".
- The trailing "-> <modality>" is what a "gen" step using that slot
  produces — the modality carried by "@<thatStepId>" wherever it is
  referenced elsewhere in the plan. "-> none" means the step produces
  nothing referenceable; such a step can never be the target of "@id".

Rules for steps:
- "id" must start with a letter and contain only letters, digits, "_", "-"
  (max 24 chars), and must be unique across the plan.
- "slot" must be exactly one of the slot names in the vocabulary below — no
  other slots exist, and field names for that slot come only from its
  vocabulary line.
- "inputs" is an array of {"field", "value"} pairs, at most one per HANDLE
  field of that slot (the "inputs(...)" list in the slot's vocabulary line).
  "value" is:
    - "@<stepId>" — a reference to an earlier step's output. The referenced
      step's modality MUST match this field's modality: a "text" step's
      modality is "text"; a "gen" step's modality is the "-> <modality>" its
      slot's vocabulary line ends with. A field whose vocabulary entry names
      modality "image" only accepts a ref to a step whose modality is
      "image" — a mismatched ref is rejected, and a "-> none" step can never
      be referenced at all (see "Vocabulary line format" above), or
    - a literal string — valid ONLY for a "text"-typed handle field (a step
      that outputs image/video/audio/file can never be replaced by a
      literal; reference it with "@id" instead), or
    - an array of the above — ONLY for a field marked "[]" in the vocabulary,
      one entry per connection.
  A field tagged "manual" (part of the combined tag group, e.g.
  "(required, manual)") also accepts a literal string the same way; the only
  difference is that a non-manual literal spawns its own "text" step while a
  manual one is stored directly on the field.
  A handle field tagged "required" but NOT "manual" MUST be given an entry
  (by ref or literal) — leaving it unfed makes the plan invalid. A field
  tagged both "required" and "manual" does NOT need an entry — its node's
  own form default satisfies the requirement even with nothing connected. A
  handle field without the "required" tag is always optional and may be
  omitted.
- "params" is an array of {"field", "value"} pairs, one per CONFIG field of
  that slot (the "params(...)" list in the slot's vocabulary line — things
  like width, height, duration, seed). "value" is always a literal string,
  number, or boolean — NEVER an "@id" reference. A param tagged "(required)"
  is NOT checked at plan-validation time (only a required, non-manual handle
  field is, see above) — but the step needs a value for it to run correctly,
  so always supply one. Omit params you have no opinion about; the node's
  own defaults apply.
- A step may only reference ("@id") a step that appears earlier in "steps".
- Prefer independent parallel branches over needless chains — only connect
  steps that actually depend on each other's output.
- Keep prompts for generative steps (both "text" steps and literal text on
  handle fields) in English for best model performance, even if the user
  wrote in another language.

The example below is illustrative only and may name slots absent from the
"Available slots" vocabulary on a partial plugin install — the vocabulary
always wins.

Example — "${FEW_SHOT_EXAMPLE_PROMPT}":
${FEW_SHOT_EXAMPLE_JSON}`;

async function resolveApiKey(): Promise<string | undefined> {
    const stored = await loadEnvStore();
    return stored.ANTHROPIC_API_KEY ?? process.env.ANTHROPIC_API_KEY;
}

/**
 * Maps an SDK exception (or any other throw reaching `runDirector`'s catch —
 * e.g. `buildDirectorCatalog()`'s filesystem scan) to the client-facing error
 * taxonomy (spec §9). Every branch logs the real error server-side first:
 * `err` is the Anthropic SDK's own response-side error object (or a plain
 * `Error`), which never carries the API key (that's only ever a request
 * header we send, never echoed back) but can carry detail — a stack trace,
 * an absolute filesystem path from a fs failure — that must not cross into
 * the HTTP response. The generic branch below returns a fixed message
 * instead of `err.message` for exactly that reason (Fix 11); the real detail
 * is only ever a `logger.error` call away.
 */
function mapAnthropicError(err: unknown): DirectorResult {
    if (err instanceof Anthropic.AuthenticationError) {
        logger.error("[Director] Anthropic authentication failed:", err);
        return {
            ok: false,
            code: "AUTH_FAILED",
            message: "Anthropic API key was rejected",
        };
    }
    if (err instanceof Anthropic.PermissionDeniedError) {
        logger.error("[Director] Anthropic permission denied:", err);
        return {
            ok: false,
            code: "AUTH_FAILED",
            message: "Anthropic API key lacks permission for this request",
        };
    }
    if (err instanceof Anthropic.RateLimitError) {
        logger.error("[Director] Anthropic rate limit hit:", err);
        return {
            ok: false,
            code: "RATE_LIMITED",
            message: "Anthropic rate limit hit — retry shortly",
        };
    }
    // Connection failures, 5xx APIStatusError, and any non-SDK throw (most
    // notably buildDirectorCatalog()'s filesystem scan, per the comment at
    // its call site below) all land here.
    logger.error("[Director] upstream request failed:", err);
    return {
        ok: false,
        code: "UPSTREAM_ERROR",
        message: "Anthropic request failed",
    };
}

export async function runDirector(prompt: string): Promise<DirectorResult> {
    if (!prompt.trim()) {
        return {
            ok: false,
            code: "INVALID_PROMPT",
            message: "Prompt must not be empty",
        };
    }

    try {
        const apiKey = await resolveApiKey();
        if (!apiKey) {
            return {
                ok: false,
                code: "MISSING_API_KEY",
                message: "Set ANTHROPIC_API_KEY in Settings",
            };
        }

        // Filesystem scan behind an extension seam (plugin registry) — kept
        // inside this `try` so a throw here is mapped to a `DirectorResult`
        // by `mapAnthropicError` below instead of rejecting the promise and
        // breaking the `Promise<DirectorResult>` contract callers rely on.
        const { vocab, slotDefaultPlugin } = buildDirectorCatalog();
        const client = new Anthropic({ apiKey });

        const result = await generateWorkflow(
            prompt,
            async (turns) => {
                // `zodOutputFormat` strips constraints the API's JSON-schema
                // grammar can't express (string pattern/length, array
                // maxItems — see dsl.ts) and re-checks them client-side
                // inside `.parse()`; a failure there throws a plain
                // `AnthropicError`, not an `APIError`. That's the SDK's own
                // distinguishable signal for "the model's plan didn't pass
                // validation" versus "the request itself failed" (auth, rate
                // limit, connection, ... — all `APIError` subclasses), so
                // `classifyPlanError` (classify-plan-error.ts) keys off
                // `instanceof Anthropic.APIError` rather than matching on
                // error message text: a transport failure is rethrown
                // unchanged for mapAnthropicError below to classify, while
                // only the narrow "plan" signal becomes a
                // `PlanValidationError` the retry loop in director-core.ts
                // can absorb.
                const response = await client.messages
                    .parse({
                        model: MODEL,
                        max_tokens: MAX_TOKENS,
                        thinking: { type: "adaptive" },
                        system: [
                            { type: "text", text: RULES },
                            {
                                type: "text",
                                text: `Available slots:\n${vocab}`,
                                cache_control: { type: "ephemeral" },
                            },
                        ],
                        messages: turns.map((turn) => ({
                            role: turn.role,
                            content: turn.text,
                        })),
                        output_config: {
                            format: zodOutputFormat(DirectorPlanSchema),
                        },
                    })
                    .catch((err) => {
                        if (classifyPlanError(err) !== "plan") {
                            throw err;
                        }
                        throw new PlanValidationError(
                            err instanceof Error ? err.message : String(err),
                        );
                    });
                if (!response.parsed_output) {
                    throw new PlanValidationError(
                        "model returned no parsable plan",
                    );
                }
                return response.parsed_output;
            },
            slotDefaultPlugin,
        );

        // PLAN_INVALID / MISSING_PLUGIN: the compiler's structured
        // `CompileIssue[]` taxonomy (`result.details`) is exactly what an
        // operator needs to diagnose a user-reported failure, and is
        // otherwise discarded at this boundary. Not an operator-facing
        // *error* — the model/compiler behaved correctly by rejecting a bad
        // plan — so this logs at `warn`, matching `mapAnthropicError`'s
        // `error` level being reserved for genuine request/transport
        // failures.
        if (
            !result.ok &&
            (result.code === "PLAN_INVALID" || result.code === "MISSING_PLUGIN")
        ) {
            logger.warn("[Director] plan compile failed:", {
                code: result.code,
                message: result.message,
                issues: result.details,
            });
            // Dev-only trace of the actual prompt text (see logger.ts:
            // `debug` no-ops outside NODE_ENV=development). The prompt is
            // arbitrary user-authored free text — logging it unconditionally
            // in production would put whatever the user typed into the
            // server's always-on logs merely because their plan failed to
            // compile, which is a routine, expected outcome (a hallucinated
            // slot, a modality mismatch), not an incident. Local development
            // still gets the full picture for debugging.
            logger.debug("[Director] prompt:", prompt);
        }
        return result;
    } catch (err) {
        return mapAnthropicError(err);
    }
}
