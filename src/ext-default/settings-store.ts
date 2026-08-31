import {
    mkdirSync,
    readFileSync,
    renameSync,
    rmSync,
    writeFileSync,
} from "node:fs";
import path from "node:path";
import { scopedDataDir } from "@/lib/runtime/scope.server";

/**
 * Default settings persistence: `settings.json` in the scoped data dir.
 * A cloud shell substitutes its own `src/ext/settings-store.ts` (e.g. a
 * per-user Durable Object). The blob is the raw (possibly codec-encoded)
 * file contents; parsing/validation stays in env-store.server.ts.
 */

async function storeFile(): Promise<string> {
    return path.join(await scopedDataDir(), "settings.json");
}

/**
 * Raw settings blob for the current scope, or null when absent.
 *
 * `null` means one thing only: nothing has been stored yet. Every other errno
 * is a store we cannot read, and it is rethrown. Collapsing those into `null`
 * here is what let one unreadable file masquerade as an empty one all the way
 * up to the write path, where the next save replaced the keys it could not
 * see. A cloud shell substituting its own `src/ext/settings-store.ts` owes the
 * same contract; the signature is unchanged so it keeps compiling either way.
 */
export async function readSettingsBlob(): Promise<string | null> {
    try {
        return readFileSync(await storeFile(), "utf8");
    } catch (error) {
        if ((error as NodeJS.ErrnoException)?.code === "ENOENT") return null;
        throw error;
    }
}

/**
 * Persist the raw settings blob for the current scope.
 *
 * Temp file in the SAME directory, then rename. Rename is atomic within one
 * filesystem, so a concurrent reader sees either the whole old file or the
 * whole new one — never a truncated one.
 *
 * The previous version wrote straight onto settings.json. Measured on this
 * machine 2026-08-31 with a 6 MB blob and a reader in a separate process:
 * 19,775 samples, of which ONE came back at length 0 — a reader catching the
 * file mid-truncation. That empty file is exactly the corrupt store
 * `chong-mat-khoa-byo` taught the reader to refuse; that feature treated the
 * symptom, this removes the source.
 *
 * Same directory is load-bearing, not tidiness: rename across filesystems is
 * a copy, and a copy is not atomic.
 *
 * SIGNATURE FROZEN — this is the `@ext/settings-store` seam, and the cloud
 * shell ships its own copy of this module in another repo where no test here
 * runs.
 */
export async function writeSettingsBlob(blob: string): Promise<void> {
    const dir = await scopedDataDir();
    mkdirSync(dir, { recursive: true });
    const target = path.join(dir, "settings.json");
    const tmp = path.join(
        dir,
        `.settings.json.${process.pid}.${Date.now()}.tmp`,
    );
    try {
        writeFileSync(tmp, blob, "utf8");
        renameSync(tmp, target);
    } catch (err) {
        // Leave no orphan behind on the failure path either.
        rmSync(tmp, { force: true });
        throw err;
    }
}
