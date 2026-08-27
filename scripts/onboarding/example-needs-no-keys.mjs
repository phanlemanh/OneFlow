#!/usr/bin/env node
/* Resolve the example's plugins and assert none declares a required env key.
 *
 * Reads each plugin's `tongflow.plugin.json` from the local plugins dir. A
 * plugin that is not installed is a hard error rather than a skip: a silent
 * skip is how "no plugin needs a key" becomes true by not looking. */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const workflowPath = process.argv[2] ?? "public/example.json";
const workflow = JSON.parse(readFileSync(workflowPath, "utf8"));

const ids = [
    ...new Set(
        (workflow.executableNodes ?? [])
            .map((n) => n?.pluginId)
            .filter((id) => typeof id === "string" && id),
    ),
];

console.log(`example: ${workflowPath}`);
console.log(`plugins (literal list): ${JSON.stringify(ids)}`);

if (ids.length < 2) {
    console.error(
        `FAIL: expected >= 2 plugin ids, got ${ids.length}. An empty or ` +
            `single-element set would make the no-key claim vacuous.`,
    );
    process.exit(1);
}

let bad = 0;
for (const id of ids) {
    const manifestPath = join("plugins", id, "tongflow.plugin.json");
    if (!existsSync(manifestPath)) {
        console.error(
            `FAIL: ${id} is not installed, so its env manifest cannot be read. ` +
                `Install it and re-run — skipping it would prove nothing.`,
        );
        bad++;
        continue;
    }
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const required = (manifest.env ?? []).filter((v) => v?.required === true);
    if (required.length > 0) {
        console.error(
            `FAIL: ${id} declares required env key(s): ` +
                required.map((v) => v.key).join(", "),
        );
        bad++;
    } else {
        console.log(`  ok  ${id} — no required env key`);
    }
}

process.exit(bad === 0 ? 0 : 1);
