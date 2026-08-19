import "server-only";

import { resolveConfig } from "@/lib/media-library/config.server";
import {
    classify,
    type MediaLibraryFailure,
} from "@/lib/media-library/errors";
import type { AssetDetail, SearchResponse } from "@/lib/media-library/types";
import { checkContractsVersion } from "@/lib/media-library/version";
import { logger } from "@/lib/logger";

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
            failure: { code: "MISSING_CONFIG", message: cfg.message },
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
    try {
        body = await response.json();
    } catch {
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
    }

    if (!response.ok) {
        const errorField =
            typeof record.error === "string" ? record.error : "";
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
