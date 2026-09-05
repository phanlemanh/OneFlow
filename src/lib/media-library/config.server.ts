import "server-only";

import {
    type EnvStoreReadReason,
    readEnvStore,
} from "@/lib/settings/env-store.server";

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
    | { ok: false; kind: "missing"; missing: string[]; message: string }
    | {
          ok: false;
          kind: "store-unreadable";
          reason: EnvStoreReadReason;
          message: string;
      };

/**
 * Resolve the media-library configuration, or say precisely why not.
 *
 * The third union member exists because "the key store is broken" and "you
 * have not configured a key" used to come out as the same sentence, and that
 * sentence tells the user to go and enter their key again — walking them
 * straight into the overwrite this dossier exists to prevent.
 *
 * ORDER IS THE WHOLE DESIGN. The `process.env` fallback runs BEFORE any verdict
 * about the store, so a single corrupt settings file cannot take down a
 * deployment that configures itself through the environment. Only once we have
 * genuinely come up short does it matter WHY.
 */
export async function resolveConfig(): Promise<ResolveConfigResult> {
    const read = await readEnvStore();
    const stored = read.state === "ok" ? read.env : {};

    const url = (stored[URL_KEY] ?? process.env[URL_KEY] ?? "").trim();
    const key = (stored[API_KEY] ?? process.env[API_KEY] ?? "").trim();
    if (url && key) {
        return {
            ok: true,
            config: { baseUrl: url.replace(/\/+$/, ""), apiKey: key },
        };
    }

    // Unreadable wins over "missing" even when the environment supplied SOME of
    // the values: the half we lack may well be sitting inside the store we
    // cannot read, and naming it as missing is the misleading half of the old
    // behaviour rather than a smaller version of it.
    if (read.state === "unreadable") {
        return {
            ok: false,
            kind: "store-unreadable",
            reason: read.reason,
            message: `Không đọc được kho khoá đã lưu (${read.reason}); chưa có gì bị thay đổi.`,
        };
    }

    const missing: string[] = [];
    if (!url) missing.push(URL_KEY);
    if (!key) missing.push(API_KEY);
    return {
        ok: false,
        kind: "missing",
        missing,
        message: `Chưa gọi được media-library: thiếu ${missing.join(" và ")}.`,
    };
}
