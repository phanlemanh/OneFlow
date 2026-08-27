import "server-only";

import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { logger } from "@/lib/logger";
import { resourcesDir } from "@/lib/runtime/paths.server";
import { scopedDataDir } from "@/lib/runtime/scope.server";

/**
 * The fileKey `public/example.json` points its input video at.
 *
 * It is a CONSTANT, not a generated key, and that is the whole point. The
 * bundled workflow ships in git; the clip it consumes has to resolve on a
 * machine that has never uploaded anything, so the reference cannot be a
 * nanoid minted by `saveFile()` at upload time.
 */
export const EXAMPLE_VIDEO_FILE_KEY = "example-assets/two-scenes.mp4";

/** Where the clip ships: read-only resources, next to the rest of `public/`. */
function shippedClipPath(): string {
    return path.join(
        resourcesDir(),
        "public",
        "example-assets",
        "two-scenes.mp4",
    );
}

/**
 * Copy the bundled sample clip into the uploads root so the example
 * workflow's input resolves.
 *
 * fileKeys are read against `<scopedDataDir>/uploads/`, never against
 * `public/`, so a clip that only exists in the repo is invisible to both the
 * canvas preview and the engine. Without this copy the bundled example opens
 * with a dead pointer where its input video should be — and a dead input
 * fails the run *silently*, leaving the sample thumbnail on screen looking
 * exactly like success. That confusion is what AC-2 exists to prevent.
 *
 * Idempotent, and deliberately non-destructive: an existing file is left
 * alone rather than overwritten, so a user who replaced the sample keeps
 * their copy across restarts.
 *
 * Returns the fileKey, or null when the clip is not shipped. Null rather
 * than a throw: a missing sample must never take the workspace down with it.
 */
export async function seedExampleAsset(): Promise<string | null> {
    const destination = path.join(
        await scopedDataDir(),
        "uploads",
        EXAMPLE_VIDEO_FILE_KEY,
    );

    try {
        await mkdir(path.dirname(destination), { recursive: true });
        // COPYFILE_EXCL makes "already there" an errno rather than a race:
        // checking existence first and copying after would let two concurrent
        // renders interleave between the check and the write.
        await copyFile(
            shippedClipPath(),
            destination,
            // node:constants COPYFILE_EXCL
            1,
        );
        return EXAMPLE_VIDEO_FILE_KEY;
    } catch (error) {
        const code = (error as NodeJS.ErrnoException).code;
        if (code === "EEXIST") return EXAMPLE_VIDEO_FILE_KEY;
        if (code === "ENOENT") {
            logger.warn(
                `[onboarding] bundled example clip missing at ${shippedClipPath()}; the example workflow will open without its input`,
            );
            return null;
        }
        throw error;
    }
}
