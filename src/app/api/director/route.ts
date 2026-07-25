import { type NextRequest, NextResponse } from "next/server";
import { runDirector } from "@/lib/director/director.server";
import type { DirectorErrorCode } from "@/lib/director/director-core";

/** Route-level cap on prompt length (spec §9's UI-facing limit). */
const MAX_PROMPT_LENGTH = 2000;

/**
 * HTTP status per Director error code (spec §9). Typed as a `Record` over
 * the full `DirectorErrorCode` union: adding a code to that union without
 * adding a status here is a compile error (a missing property on the object
 * literal), not a silent fallthrough to some default status.
 */
const STATUS_BY_CODE: Record<DirectorErrorCode, number> = {
    INVALID_PROMPT: 400,
    MISSING_API_KEY: 400,
    AUTH_FAILED: 401,
    RATE_LIMITED: 429,
    PLAN_INVALID: 422,
    MISSING_PLUGIN: 422,
    UPSTREAM_ERROR: 502,
};

function invalidPrompt(message: string): NextResponse {
    return NextResponse.json(
        {
            error: {
                code: "INVALID_PROMPT" satisfies DirectorErrorCode,
                message,
            },
        },
        { status: STATUS_BY_CODE.INVALID_PROMPT },
    );
}

/**
 * POST /api/director
 *
 * Natural-language creative intent -> importable workflow graph (spec §9).
 * `runDirector` already rejects an empty/whitespace-only prompt with
 * INVALID_PROMPT, so this route only enforces what it alone is responsible
 * for: the body must be valid JSON, must carry a string `prompt`, and that
 * string must not exceed the UI's character cap. Success payload shape
 * matches what `parseWorkflowImportJson` (src/lib/workflow/exporter.ts)
 * accepts for a root-level `{ name, description, nodes, edges }` import.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return invalidPrompt("Request body must be valid JSON");
    }

    const prompt = (body as { prompt?: unknown } | null)?.prompt;
    if (typeof prompt !== "string") {
        return invalidPrompt("prompt is required and must be a string");
    }
    if (prompt.length > MAX_PROMPT_LENGTH) {
        return invalidPrompt(
            `prompt must be at most ${MAX_PROMPT_LENGTH} characters`,
        );
    }

    const result = await runDirector(prompt);

    if (result.ok) {
        const { name, description, nodes, edges } = result;
        return NextResponse.json({ name, description, nodes, edges });
    }

    return NextResponse.json(
        {
            error: {
                code: result.code,
                message: result.message,
                details: result.details,
            },
        },
        { status: STATUS_BY_CODE[result.code] },
    );
}
