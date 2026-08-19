import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
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

    for (const id of ids) {
        if (isPluginInstalled(id)) {
            skipped.push(id);
            continue;
        }
        try {
            await installPlugin({ id });
            installed.push(id);
        } catch {
            failed.push(id);
        }
    }

    return { installed, skipped, failed };
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
