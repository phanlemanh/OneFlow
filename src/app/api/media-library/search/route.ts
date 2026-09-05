import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { searchVideos } from "@/lib/media-library/client.server";

export const runtime = "nodejs";

/**
 * Maps the boundary's failure taxonomy onto HTTP for the canvas. VERSION_MISMATCH
 * is 409 rather than 502: the far side is healthy, the two sides simply no longer
 * agree on the contract.
 */
const STATUS: Record<string, number> = {
    MISSING_CONFIG: 400,
    AUTH_REJECTED: 401,
    MISSING_SCOPE: 403,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    VERSION_MISMATCH: 409,
    NOT_IMPLEMENTED: 501,
    BAD_RESPONSE: 502,
    NETWORK_ERROR: 502,
    UPSTREAM_ERROR: 502,
    LOCAL_FAILURE: 500,
};

/**
 * A throw here is OneFlow's own side failing — the file store most often (disk
 * full, permission denied). Without this catch it became a Next.js 500 whose
 * body is an HTML page, the client's `response.json()` threw, and the node told
 * the user "could not reach the library" — sending them to check a key and a URL
 * that were never the problem.
 */
export async function POST(request: Request) {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { code: "BAD_REQUEST", message: "Thân yêu cầu không phải JSON." },
            { status: 400 },
        );
    }

    const intent = String((body as { intent?: unknown })?.intent ?? "").trim();
    if (!intent) {
        return NextResponse.json(
            { code: "BAD_REQUEST", message: "Cần một câu mô tả để tìm." },
            { status: 400 },
        );
    }

    let result: Awaited<ReturnType<typeof searchVideos>>;
    try {
        result = await searchVideos(intent);
    } catch (error) {
        logger.error("[media-library] search route failed:", error);
        return NextResponse.json(
            {
                code: "LOCAL_FAILURE",
                message:
                    "OneFlow không hoàn tất được việc này ở phía máy của bạn.",
            },
            { status: 500 },
        );
    }
    if (!result.ok) {
        return NextResponse.json(result.failure, {
            status: STATUS[result.failure.code] ?? 502,
        });
    }

    const { cards, candidates, skipped, warnings } = result.data;
    return NextResponse.json({ cards, candidates, skipped, warnings });
}
