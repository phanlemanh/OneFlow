import "server-only";

import { saveFile } from "@/lib/file/file-utils";
import { logger } from "@/lib/logger";
import { getAsset } from "@/lib/media-library/client.server";
import { resolveConfig } from "@/lib/media-library/config.server";
import type { MediaLibraryFailure } from "@/lib/media-library/errors";
import { extensionFor } from "@/lib/media-library/extension";
import {
    checkFetchTarget,
    isPrivateHost,
} from "@/lib/media-library/url-safety";

/**
 * Bytes cross the boundary ONLY over the signed URL (ADR-0012 guarantee #1),
 * and they are fetched here rather than through `downloadAndSave()` in
 * file-utils: that helper takes any URL with no scheme, host or size check and
 * has zero callers. Wiring a feature that receives URLs from an outside service
 * into it would inherit an SSRF hole wholesale, so it stays dead and this path
 * carries its own three guards — scheme, host, and size.
 */
/**
 * 1 GiB, not 2: the body is accumulated into a single Buffer, and 2 GiB sits at
 * Node's practical ceiling for one — so the legitimate large-clip case would
 * fail in an unhelpful way rather than being refused cleanly.
 */
const MAX_BYTES = 1024 * 1024 * 1024;
const DOWNLOAD_TIMEOUT_MS = 120_000;
/** Redirects are followed by hand so each hop can be re-guarded; bound the chain. */
const MAX_REDIRECTS = 5;

export type ImportResult =
    | { ok: true; fileKey: string }
    | { ok: false; failure: MediaLibraryFailure };

/** The configured library's host:port, but only if it is a local dev instance. */
function devLocalHostOf(baseUrl: string): string | null {
    if (process.env.NODE_ENV === "production") return null;
    try {
        const url = new URL(baseUrl);
        return isPrivateHost(url.hostname) ? url.host : null;
    } catch {
        return null;
    }
}

const REFUSAL: Record<string, (detail: string) => string> = {
    malformed: () => "URL ký của media-library không hợp lệ.",
    scheme: (d) => `Từ chối tải: URL ký không dùng https (${d}//).`,
    "private-host": (d) => `Từ chối tải: URL ký trỏ tới host nội bộ (${d}).`,
};

function guardUrl(
    raw: string,
    devLocalHost: string | null,
): MediaLibraryFailure | null {
    const verdict = checkFetchTarget(raw, devLocalHost);
    if (verdict.ok) return null;
    return {
        code: "BAD_RESPONSE",
        message: REFUSAL[verdict.reason](verdict.detail),
    };
}

/**
 * Follow redirects BY HAND, re-guarding every hop.
 *
 * `fetch` defaults to `redirect: "follow"`, which would make every guard above
 * apply to the first URL only: a signed URL that passes can 302 to
 * http://169.254.169.254/... and the bytes come back anyway. The guards were
 * written, they were simply never reached past hop one.
 */
async function fetchGuarded(
    startUrl: string,
    devLocalHost: string | null,
): Promise<
    | { ok: true; response: Response; finalUrl: string }
    | { ok: false; failure: MediaLibraryFailure }
> {
    let current = startUrl;
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
        const refusal = guardUrl(current, devLocalHost);
        if (refusal) return { ok: false, failure: refusal };

        let response: Response;
        try {
            response = await fetch(current, {
                redirect: "manual",
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

        if (response.status < 300 || response.status >= 400) {
            return { ok: true, response, finalUrl: current };
        }

        const location = response.headers.get("location");
        if (!location) {
            return {
                ok: false,
                failure: {
                    code: "BAD_RESPONSE",
                    message: `Chuyển hướng ${response.status} nhưng không có Location.`,
                },
            };
        }
        current = new URL(location, current).toString();
    }

    return {
        ok: false,
        failure: {
            code: "BAD_RESPONSE",
            message: `Từ chối tải: quá ${MAX_REDIRECTS} lần chuyển hướng.`,
        },
    };
}

/**
 * Read the body with a running byte count so an upstream that omits
 * content-length cannot push unbounded bytes into memory. The declared header
 * is still checked first — it refuses the honest oversize case one round-trip
 * earlier — but it is no longer the only cap.
 */
export async function readCapped(
    response: Response,
    maxBytes: number = MAX_BYTES,
): Promise<
    { ok: true; buffer: Buffer } | { ok: false; failure: MediaLibraryFailure }
> {
    const tooBig: MediaLibraryFailure = {
        code: "BAD_RESPONSE",
        message: "Clip vượt trần kích thước cho phép.",
    };

    const declared = Number(response.headers.get("content-length") ?? "0");
    if (declared > maxBytes) return { ok: false, failure: tooBig };

    const body = response.body;
    if (!body) {
        const buffer = Buffer.from(await response.arrayBuffer());
        return buffer.byteLength > maxBytes
            ? { ok: false, failure: tooBig }
            : { ok: true, buffer };
    }

    const chunks: Buffer[] = [];
    let total = 0;
    const reader = body.getReader();
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.byteLength;
        if (total > maxBytes) {
            await reader.cancel();
            return { ok: false, failure: tooBig };
        }
        chunks.push(Buffer.from(value));
    }
    return { ok: true, buffer: Buffer.concat(chunks) };
}

export async function importAsset(assetId: string): Promise<ImportResult> {
    const detail = await getAsset(assetId);
    if (!detail.ok) return { ok: false, failure: detail.failure };

    const original = detail.data.urls?.original ?? "";

    // The dev exemption is scoped to the CONFIGURED library, so read the config
    // rather than trusting any localhost URL the response happens to carry.
    const cfg = await resolveConfig();
    const devLocalHost = cfg.ok ? devLocalHostOf(cfg.config.baseUrl) : null;

    const fetched = await fetchGuarded(original, devLocalHost);
    if (!fetched.ok) return { ok: false, failure: fetched.failure };
    const { response, finalUrl } = fetched;

    if (!response.ok) {
        return {
            ok: false,
            failure: {
                code: "UPSTREAM_ERROR",
                message: `Tải bytes thất bại (HTTP ${response.status}).`,
            },
        };
    }

    const read = await readCapped(response, MAX_BYTES);
    if (!read.ok) return { ok: false, failure: read.failure };

    // The extension is derived from the URL actually fetched, not the one the
    // library first named: after a redirect those differ.
    const ext = extensionFor(finalUrl, response.headers.get("content-type"));
    const fileKey = await saveFile(read.buffer, ext);
    return { ok: true, fileKey };
}
