import "server-only";

import { loadEnvStore } from "@/lib/settings/env-store.server";

/**
 * ADR-0012 guarantee #2: media-library is a BYO-key service, not a hard
 * dependency. Nothing here runs at boot; it runs when the node asks. When
 * configuration is absent the caller gets the VARIABLE NAMES back, because
 * "chưa cấu hình dịch vụ" leaves the user with nothing to act on.
 */
export const URL_KEY = "MEDIA_LIBRARY_URL";
export const API_KEY = "MEDIA_LIBRARY_API_KEY";

export interface MediaLibraryConfig {
    baseUrl: string;
    apiKey: string;
}

export type ResolveConfigResult =
    | { ok: true; config: MediaLibraryConfig }
    | { ok: false; missing: string[]; message: string };

export async function resolveConfig(): Promise<ResolveConfigResult> {
    const env = await loadEnvStore();
    const url = (env[URL_KEY] ?? process.env[URL_KEY] ?? "").trim();
    const key = (env[API_KEY] ?? process.env[API_KEY] ?? "").trim();

    const missing: string[] = [];
    if (!url) missing.push(URL_KEY);
    if (!key) missing.push(API_KEY);
    if (missing.length > 0) {
        return {
            ok: false,
            missing,
            message: `Chưa gọi được media-library: thiếu ${missing.join(" và ")}.`,
        };
    }

    return {
        ok: true,
        config: { baseUrl: url.replace(/\/+$/, ""), apiKey: key },
    };
}
