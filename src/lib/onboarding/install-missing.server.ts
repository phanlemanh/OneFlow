import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { logger } from "@/lib/logger";
import { readExampleRequirements } from "@/lib/onboarding/example-requirements";
import {
    installPlugin,
    isPluginInstalled,
} from "@/lib/plugins/plugins-install.server";
import { resourcesDir } from "@/lib/runtime/paths.server";

export type InstallMissingResult = {
    installed: string[];
    /** Already present — never re-cloned. */
    skipped: string[];
    failed: string[];
    /**
     * Why each failed id failed, in the same order. A bare id told the user
     * "something went wrong" and told the log nothing at all.
     */
    failureReasons: Record<string, string>;
};

/**
 * Install every plugin in `ids` that is not already present.
 *
 * One call for the whole set: the strip's single action hands the full list
 * here, so "one press installs everything" is a property of this function plus
 * one call site, not of a loop the view maintains.
 */
export async function installMissingForExample(
    ids: readonly string[],
): Promise<InstallMissingResult> {
    const installed: string[] = [];
    const skipped: string[] = [];
    const failed: string[] = [];
    const failureReasons: Record<string, string> = {};

    for (const id of ids) {
        if (isPluginInstalled(id)) {
            skipped.push(id);
            continue;
        }
        try {
            const result = await installPlugin({ id });
            if (!result.recognized) {
                // Cloned, but the scanner found no slots in it — the plugin is
                // on disk and still cannot run a node. Counting that as
                // "installed" is how the strip reports success while the run
                // fails afterwards with "no plugin installed for nodeSlot".
                failed.push(id);
                failureReasons[id] =
                    "downloaded but not recognized by the plugin scanner";
                logger.warn(
                    `[onboarding] ${id} cloned but unrecognized by the scanner`,
                );
                continue;
            }
            installed.push(id);
        } catch (error) {
            const message =
                error instanceof Error ? error.message : String(error);
            failed.push(id);
            failureReasons[id] = message;
            logger.error(`[onboarding] install failed for ${id}: ${message}`);
        }
    }

    return { installed, skipped, failed, failureReasons };
}

/**
 * The plugin ids the bundled example is pinned to, read from the shipped
 * `example.json` — the same file the client's readiness hook reads, so the
 * set the button installs is BY CONSTRUCTION the set the strip named (AC-5).
 */
export async function exampleRequirementIds(): Promise<string[]> {
    const workflowPath = path.join(resourcesDir(), "public", "example.json");
    const workflow = JSON.parse(await readFile(workflowPath, "utf8"));
    return readExampleRequirements(workflow).map((r) => r.pluginId);
}
