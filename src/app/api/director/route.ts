import { type NextRequest, NextResponse } from "next/server";
import { runDirector } from "@/lib/director/director.server";
import type { DirectorErrorCode } from "@/lib/director/director-core";
import { recordGenerated } from "@/lib/director/events/director-events.server";
import { parseDirectorBody } from "@/lib/director/request-body";

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

    const parsed = parseDirectorBody(body);
    if (!parsed.ok) return invalidPrompt(parsed.error.message);
    const { prompt, canvas, options } = parsed.value;

    const result = await runDirector(prompt);

    // Recorded here rather than by the client: a tab that closes mid-request
    // would otherwise take the row with it, and a user who gives up halfway is
    // exactly the signal worth having. Failure cases are recorded too — a run
    // that never produced a plan is a data point, not a non-event.
    await recordGenerated({
        runId: result.ok ? result.runId : crypto.randomUUID(),
        promptText: prompt,
        dslVersion: result.ok ? result.dslVersion : 0,
        planJson: result.ok ? result.planJson : undefined,
        attempts: result.attempts,
        errorCode: result.ok ? undefined : result.code,
        canvasWasEmpty: canvas ? (canvas.nodes?.length ?? 0) === 0 : undefined,
        usedMemory: options?.useMemory,
    });

    if (result.ok) {
        const { name, description, nodes, edges, planJson, runId, dslVersion } =
            result;
        // Additive: the first four fields keep their name and shape, so a
        // client that does not know the last three is unaffected (AC-2).
        return NextResponse.json({
            name,
            description,
            nodes,
            edges,
            planJson,
            runId,
            dslVersion,
        });
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
