import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
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

/** Persist the raw settings blob for the current scope. */
export async function writeSettingsBlob(blob: string): Promise<void> {
    const dir = await scopedDataDir();
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, "settings.json"), blob, "utf8");
}
