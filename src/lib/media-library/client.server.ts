import "server-only";

import { logger } from "@/lib/logger";
import { resolveConfig } from "@/lib/media-library/config.server";
import { classify, type MediaLibraryFailure } from "@/lib/media-library/errors";
import type { AssetDetail, SearchResponse } from "@/lib/media-library/types";
import {
    checkContractsVersion,
    SUPPORTED_CONTRACTS,
} from "@/lib/media-library/version";

export type ClientResult<T> =
    | { ok: true; data: T }
    | { ok: false; failure: MediaLibraryFailure };

/** The contract caps `limit` at 20; ask for a screenful, not the cap. */
const SEARCH_LIMIT = 12;
const TIMEOUT_MS = 15_000;

async function call<T>(
    path: string,
    init: RequestInit,
): Promise<ClientResult<T>> {
    const cfg = await resolveConfig();
    if (!cfg.ok) {
        return {
            ok: false,
            failure: {
                code: "MISSING_CONFIG",
                message: cfg.message,
                missing: cfg.missing,
            },
        };
    }

    let response: Response;
    try {
        response = await fetch(`${cfg.config.baseUrl}${path}`, {
            ...init,
            headers: {
                ...(init.headers ?? {}),
                authorization: `Bearer ${cfg.config.apiKey}`,
                "content-type": "application/json",
            },
            signal: AbortSignal.timeout(TIMEOUT_MS),
        });
    } catch (error) {
        // The key is only ever a request header we send; it is never echoed
        // back, so the error object is safe to log server-side. It does not
        // cross into the response.
        logger.error("[media-library] request failed:", error);
        return {
            ok: false,
            failure: {
                code: "NETWORK_ERROR",
                message: "Không gọi được tới media-library.",
            },
        };
    }

    let body: unknown;
    let parsed = true;
    try {
        body = await response.json();
    } catch {
        parsed = false;
        body = {};
    }

    // A body that will not parse is only fatal on a SUCCESS response. On an
    // error response the status is the information that matters, and losing it
    // is worse than losing the body: infrastructure in front of the service —
    // nginx, a CDN, an API gateway — answers 401/403/404/502 with an HTML page,
    // never JSON. Returning BAD_RESPONSE there told the user "the library
    // answered in a shape this version does not accept" when the truth was a
    // rejected key, and pointed them at the wrong fix. Parsing before looking at
    // the status is what made that unreachable.
    if (!parsed && response.ok) {
        return {
            ok: false,
            failure: {
                code: "BAD_RESPONSE",
                message: "media-library trả về thân không phải JSON.",
            },
        };
    }

    const record = (body ?? {}) as Record<string, unknown>;
    const version =
        typeof record.contracts_version === "string"
            ? record.contracts_version
            : "";

    // Version is checked BEFORE status: once the contract line differs, every
    // other reading of this body — including the error shape — is a guess.
    //
    // An ABSENT field is a mismatch too, not a pass. The contract declares
    // contracts_version required on every success body, so a 200 without it is
    // a service OneFlow does not recognise — treating it as compatible is
    // exactly the guessing guarantee #7 forbids. Error bodies are the one place
    // the field may legitimately be missing (a proxy's own 502 page), so the
    // requirement is scoped to successful responses.
    if (version) {
        const verdict = checkContractsVersion(version);
        if (!verdict.ok) {
            return {
                ok: false,
                failure: {
                    code: "VERSION_MISMATCH",
                    message: verdict.message,
                },
            };
        }
    } else if (response.ok) {
        return {
            ok: false,
            failure: {
                code: "VERSION_MISMATCH",
                message: `Phản hồi thành công nhưng thiếu hẳn contracts_version — OneFlow ghim ${SUPPORTED_CONTRACTS} và không đoán hình dạng dữ liệu.`,
            },
        };
    }

    if (!response.ok) {
        const errorField = typeof record.error === "string" ? record.error : "";
        return { ok: false, failure: classify(response.status, errorField) };
    }

    return { ok: true, data: body as T };
}

export function searchVideos(
    intent: string,
    limit = SEARCH_LIMIT,
): Promise<ClientResult<SearchResponse>> {
    return call<SearchResponse>("/v1/search", {
        method: "POST",
        body: JSON.stringify({
            intent,
            media_type: "video",
            limit: Math.min(limit, 20),
        }),
    });
}

export function getAsset(assetId: string): Promise<ClientResult<AssetDetail>> {
    return call<AssetDetail>(`/v1/assets/${encodeURIComponent(assetId)}`, {
        method: "GET",
    });
}
