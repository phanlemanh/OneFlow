import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { loadEnvStore } from "@/lib/settings/env-store.server";
import { type DirectorResult, generateWorkflow } from "./director-core";
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
  "name": "<short title>",
  "description": "<one sentence>",
  "steps": [ <step>, ... ]
}

A step is either:
- a text source: {"id": "<id>", "kind": "text", "text": "<literal text>"}
- a generation step: {"id": "<id>", "kind": "gen", "slot": "<slot>", "inputs": [...], "params": [...]}

"text" steps are the ONLY source of literal content in a plan — there is no
other step kind that introduces new material.

Rules for steps:
- "id" must start with a letter and contain only letters, digits, "_", "-"
  (max 24 chars), and must be unique across the plan.
- "slot" must be exactly one of the slot names in the vocabulary below — no
  other slots exist, and field names for that slot come only from its
  vocabulary line.
- "inputs" is an array of {"field", "value"} pairs, one per HANDLE field of
  that slot (the "inputs(...)" list in the slot's vocabulary line). "value" is:
    - "@<stepId>" — a reference to an earlier step's output, valid for any
      handle field, or
    - a literal string — valid ONLY for a "text"-typed handle field (a step
      that outputs image/video/audio/file can never be replaced by a
      literal; reference it with "@id" instead), or
    - an array of the above — ONLY for a field marked "[]" in the vocabulary,
      one entry per connection.
  A field tagged "(manual)" also accepts a literal string the same way; the
  only difference is that a non-manual literal spawns its own "text" step
  while a manual one is stored directly on the field.
- "params" is an array of {"field", "value"} pairs, one per CONFIG field of
  that slot (the "params(...)" list in the slot's vocabulary line — things
  like width, height, duration, seed). "value" is always a literal string,
  number, or boolean — NEVER an "@id" reference. Always supply a value for a
  param tagged "(required)". Omit params you have no opinion about; the node's
  own defaults apply.
- A step may only reference ("@id") a step that appears earlier in "steps".
- Prefer independent parallel branches over needless chains — only connect
  steps that actually depend on each other's output.
- Keep prompts for generative steps (both "text" steps and literal text on
  handle fields) in English for best model performance, even if the user
  wrote in another language.

Example — "${FEW_SHOT_EXAMPLE_PROMPT}":
${FEW_SHOT_EXAMPLE_JSON}`;

async function resolveApiKey(): Promise<string | undefined> {
    const stored = await loadEnvStore();
    return stored.ANTHROPIC_API_KEY ?? process.env.ANTHROPIC_API_KEY;
}

function mapAnthropicError(err: unknown): DirectorResult {
    if (err instanceof Anthropic.AuthenticationError) {
        return {
            ok: false,
            code: "AUTH_FAILED",
            message: "Anthropic API key was rejected",
        };
    }
    if (err instanceof Anthropic.RateLimitError) {
        return {
            ok: false,
            code: "RATE_LIMITED",
            message: "Anthropic rate limit hit — retry shortly",
        };
    }
    return {
        ok: false,
        code: "UPSTREAM_ERROR",
        message:
            err instanceof Error ? err.message : "Anthropic request failed",
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

    const apiKey = await resolveApiKey();
    if (!apiKey) {
        return {
            ok: false,
            code: "MISSING_API_KEY",
            message: "Set ANTHROPIC_API_KEY in Settings",
        };
    }

    const { vocab, slotDefaultPlugin } = buildDirectorCatalog();
    const client = new Anthropic({ apiKey });

    try {
        return await generateWorkflow(
            prompt,
            async (userTurns) => {
                const response = await client.messages.parse({
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
                    messages: userTurns.map((text) => ({
                        role: "user" as const,
                        content: text,
                    })),
                    output_config: {
                        format: zodOutputFormat(DirectorPlanSchema),
                    },
                });
                if (!response.parsed_output) {
                    throw new Error("model returned no parsable plan");
                }
                return response.parsed_output;
            },
            slotDefaultPlugin,
        );
    } catch (err) {
        return mapAnthropicError(err);
    }
}
