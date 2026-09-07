/**
 * E27 — `downloadAndSave()` must stay dead.
 *
 * It fetches ANY url and persists the bytes with no scheme, host or size check
 * (src/lib/file/file-utils.ts). A caller anywhere inherits that hole, and this
 * feature is precisely the kind of caller it has been waiting for: it receives
 * URLs from an outside service.
 *
 * Callers are found by resolving the import that binds the name — so a renamed
 * import (`{ downloadAndSave as dl }`) and a namespace call
 * (`fileUtils.downloadAndSave(...)`) both count, in `.ts`, `.tsx`, `.mjs`,
 * `.cjs` and `.js` alike. The previous `grep "downloadAndSave("` saw none of
 * those.
 */
import path from "node:path";
import { callSites, importsOf, sourceFiles } from "./import-graph.mjs";

const repoRoot = path.resolve(import.meta.dirname, "../..");
const target = path.resolve(repoRoot, process.argv[2] ?? "src");
const OWNER = path.join(repoRoot, "src/lib/file/file-utils");
const EXPORT_NAME = "downloadAndSave";

const files = sourceFiles(target);
if (files.length === 0) {
    console.error(
        `FAIL: scanned 0 files under ${target} — nothing was checked`,
    );
    process.exit(2);
}

const callers = [];
for (const file of files) {
    if (path.resolve(file).startsWith(OWNER)) continue; // its own definition
    const { source, imports } = importsOf(file, repoRoot);

    const locals = new Set();
    const namespaceMembers = new Set();
    for (const entry of imports) {
        if (!entry.resolved || !entry.resolved.startsWith(OWNER)) continue;
        for (const binding of entry.named) {
            if (binding.exported === EXPORT_NAME) locals.add(binding.local);
        }
        if (entry.namespace)
            namespaceMembers.add(`${entry.namespace}.${EXPORT_NAME}`);
    }
    if (locals.size === 0 && namespaceMembers.size === 0) continue;

    for (const hit of callSites(source, locals, namespaceMembers)) {
        callers.push(
            `${path.relative(repoRoot, file)}:${hit.line}: ${hit.name}(...)`,
        );
    }
}

if (callers.length > 0) {
    console.error(`FAIL: ${EXPORT_NAME}() has callers — it must stay unused:`);
    for (const caller of callers) console.error(`  ${caller}`);
    process.exit(1);
}

console.log(
    `${EXPORT_NAME}() callers: (none) — ${files.length} files parsed under ${path.relative(repoRoot, target)}`,
);
