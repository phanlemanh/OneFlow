import "server-only";

import { saveFile } from "@/lib/file/file-utils";
import { logger } from "@/lib/logger";
import { getAsset } from "@/lib/media-library/client.server";
import type { MediaLibraryFailure } from "@/lib/media-library/errors";
import { extensionFor } from "@/lib/media-library/extension";

/**
 * Bytes cross the boundary ONLY over the signed URL (ADR-0012 guarantee #1),
 * and they are fetched here rather than through `downloadAndSave()` in
 * file-utils: that helper takes any URL with no scheme, host or size check and
 * has zero callers. Wiring a feature that receives URLs from an outside service
 * into it would inherit an SSRF hole wholesale, so it stays dead and this path
 * carries its own three guards — scheme, host, and size.
 */
const MAX_BYTES = 2 * 1024 * 1024 * 1024;
const DOWNLOAD_TIMEOUT_MS = 120_000;

export type ImportResult =
    | { ok: true; fileKey: string }
    | { ok: false; failure: MediaLibraryFailure };

const PRIVATE_HOST =
    /^(localhost$|127\.|0\.0\.0\.0$|169\.254\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1)/i;

function guardUrl(raw: string): MediaLibraryFailure | null {
    let url: URL;
    try {
        url = new URL(raw);
    } catch {
        return {
            code: "BAD_RESPONSE",
            message: "URL ký của media-library không hợp lệ.",
        };
    }

    // http is tolerated only for a localhost dev instance of the library, which
    // is the single case where the private-host rule below would also fire.
    const devLocal =
        PRIVATE_HOST.test(url.hostname) &&
        process.env.NODE_ENV !== "production" &&
        (url.hostname === "localhost" || url.hostname.startsWith("127."));

    if (url.protocol !== "https:" && !devLocal) {
        return {
            code: "BAD_RESPONSE",
            message: `Từ chối tải: URL ký không dùng https (${url.protocol}//).`,
        };
    }
    if (PRIVATE_HOST.test(url.hostname) && !devLocal) {
        return {
            code: "BAD_RESPONSE",
            message: `Từ chối tải: URL ký trỏ tới host nội bộ (${url.hostname}).`,
        };
    }
    return null;
}

export async function importAsset(assetId: string): Promise<ImportResult> {
    const detail = await getAsset(assetId);
    if (!detail.ok) return { ok: false, failure: detail.failure };

    const original = detail.data.urls?.original ?? "";
    const refusal = guardUrl(original);
    if (refusal) return { ok: false, failure: refusal };

    let response: Response;
    try {
        response = await fetch(original, {
            signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
        });
    } catch (error) {
        logger.error("[media-library] byte download failed:", error);
        return {
            ok: false,
            failure: {
                code: "NETWORK_ERROR",
                message: "Không tải được bytes của clip.",
            },
        };
    }

    if (!response.ok) {
        return {
            ok: false,
            failure: {
                code: "UPSTREAM_ERROR",
                message: `Tải bytes thất bại (HTTP ${response.status}).`,
            },
        };
    }

    // Declared size first, so an oversize body is refused before it is read.
    const declared = Number(response.headers.get("content-length") ?? "0");
    if (declared > MAX_BYTES) {
        return {
            ok: false,
            failure: {
                code: "BAD_RESPONSE",
                message: "Clip vượt trần kích thước cho phép.",
            },
        };
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength > MAX_BYTES) {
        return {
            ok: false,
            failure: {
                code: "BAD_RESPONSE",
                message: "Clip vượt trần kích thước cho phép.",
            },
        };
    }

    const ext = extensionFor(original, response.headers.get("content-type"));
    const fileKey = await saveFile(buffer, ext);
    return { ok: true, fileKey };
}
