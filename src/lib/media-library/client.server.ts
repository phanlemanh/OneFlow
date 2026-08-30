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
        // An unreadable key store is still a configuration problem from this
        // side of the wire, so it keeps the existing code rather than adding a
        // vocabulary term the media-library boundary would have to learn. What
        // it does NOT do is claim variables are missing: `missing` stays empty
        // and the message says the store could not be read, because listing
        // variable names here is what walks the user into re-entering keys
        // they may still have.
        return {
            ok: false,
            failure: {
                code: "MISSING_CONFIG",
                message: cfg.message,
                missing: cfg.unreadable ? [] : cfg.missing,
                ...(cfg.unreadable ? { storeUnreadable: true as const } : {}),
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
    /**
     * `response.json()` rejects for two unrelated reasons and they must not
     * collapse into one message. A SyntaxError means the far side really did
     * answer in a shape this version cannot read. An AbortError or a TypeError
     * means the connection died or the timeout fired AFTER the headers arrived
     * — the body never finished. Reporting the second as BAD_RESPONSE
     * ("the library answered in a shape this version does not accept") sends
     * the user to check a contract version when the truth was a dropped
     * connection, and swallowing the cause entirely left nothing in the log to
     * tell them apart.
     */
    let parseFailure: "shape" | "transport" = "shape";
    try {
        body = await response.json();
    } catch (error) {
        parsed = false;
        body = {};
        // TypeError belongs here and was missing: the comment above named it,
        // the list did not. undici rejects `response.json()` with
        // `TypeError: terminated` (cause ECONNRESET / UND_ERR_SOCKET) when the
        // socket dies AFTER the headers arrived — the exact case this split
        // exists for. Without it a dropped connection landed in the "shape" arm
        // and told the user the library had answered in an unsupported shape,
        // sending them to check a contract version over a network fault. The
        // transport arm was only ever reachable through the timeout.
        const name = error instanceof Error ? error.name : "";
        parseFailure =
            name === "AbortError" ||
            name === "TimeoutError" ||
            name === "TypeError"
                ? "transport"
                : "shape";
        // The fetch catch above logs; this one used to stay silent, which is
        // why a truncated body was indistinguishable from a malformed one.
        logger.error(
            `[media-library] response body did not parse (${parseFailure}):`,
            error,
        );
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
        return parseFailure === "transport"
            ? {
                  ok: false,
                  failure: {
                      code: "NETWORK_ERROR",
                      message:
                          "Kết nối tới media-library đứt giữa chừng khi đang nhận dữ liệu.",
                  },
              }
            : {
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
