/**
 * E3 — ADR-0012 guarantee #2: OneFlow runs fully without media-library set up.
 *
 * That guarantee does not break with a crash; it breaks with an IMPORT. Once a
 * layout, a provider or an instrumentation file pulls the module in, the studio
 * has a boot-time relationship with a service the user may never configure.
 *
 * Two things the previous `grep "@/lib/media-library/"` got wrong:
 *   1. it only saw the `@/` alias, so a relative import from a layout
 *      (`../../lib/media-library/client.server`) — the same violation, spelled
 *      differently — passed silently;
 *   2. its allow-list matched a FILENAME PREFIX (`media-`), so any future file
 *      dropped in that directory whose name started with `media-` exempted
 *      itself without anyone declaring it.
 *
 * Now specifiers are resolved to paths, and the allow-list is exact.
 */
import path from "node:path";
import { importsOf, sourceFiles } from "./import-graph.mjs";

const repoRoot = path.resolve(import.meta.dirname, "../..");
const target = path.resolve(repoRoot, process.argv[2] ?? "src");
const MODULE_ROOT = path.join(repoRoot, "src/lib/media-library");

/** Exact files allowed to import the module — the feature's own surface. */
const ALLOWED = new Set(
    [
        "src/app/api/media-library/search/route.ts",
        "src/app/api/media-library/import/route.ts",
        "src/app/api/media-library/route.test.ts",
        "src/components/workspace/nodes/add/add-media-library-node.tsx",
        "src/components/workspace/nodes/add/add-media-library-node.test.tsx",
        "src/components/workspace/nodes/add/media-card-list.tsx",
        "src/components/workspace/nodes/add/media-library-config-panel.tsx",
        "src/components/workspace/nodes/add/media-library-outcome.ts",
        "src/components/proto/add-media-library-proto.tsx",
    ].map((p) => path.join(repoRoot, p)),
);

const files = sourceFiles(target);
if (files.length === 0) {
    console.error(
        `FAIL: scanned 0 files under ${target} — nothing was checked`,
    );
    process.exit(2);
}

const offenders = [];
for (const file of files) {
    const resolvedFile = path.resolve(file);
    if (resolvedFile.startsWith(MODULE_ROOT)) continue; // the module itself
    if (ALLOWED.has(resolvedFile)) continue;

    const { imports } = importsOf(file, repoRoot);
    for (const entry of imports) {
        if (!entry.resolved || !entry.resolved.startsWith(MODULE_ROOT))
            continue;
        offenders.push(
            `${path.relative(repoRoot, file)}:${entry.line}: imports "${entry.specifier}"`,
        );
    }
}

if (offenders.length > 0) {
    console.error("FAIL: media-library is imported outside its own surface:");
    for (const line of offenders) console.error(`  ${line}`);
    process.exit(1);
}

console.log(
    `media-library imported only by its ${ALLOWED.size} declared files — ${files.length} files parsed under ${path.relative(repoRoot, target)}`,
);
