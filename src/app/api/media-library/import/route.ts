import { NextResponse } from "next/server";
import { importAsset } from "@/lib/media-library/import.server";

export const runtime = "nodejs";

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
};

/**
 * The ONLY road bytes take into the store from this feature. It delegates to
 * `importAsset`, which carries the scheme/host/size guards; going straight to a
 * download helper from here would leave those guards written but unreached,
 * which is precisely what route.test.ts measures.
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

    const assetId = String(
        (body as { assetId?: unknown })?.assetId ?? "",
    ).trim();
    if (!assetId) {
        return NextResponse.json(
            { code: "BAD_REQUEST", message: "Thiếu mã asset." },
            { status: 400 },
        );
    }

    const result = await importAsset(assetId);
    if (!result.ok) {
        return NextResponse.json(result.failure, {
            status: STATUS[result.failure.code] ?? 502,
        });
    }

    return NextResponse.json({ fileKey: result.fileKey });
}
