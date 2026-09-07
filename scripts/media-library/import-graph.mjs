/**
 * A real import graph for the two guards that claimed to have one.
 *
 * Both `check-no-dormant-fetch.sh` and `check-no-boot-dependency.sh` used to be
 * a single `grep`, while their eval text promised "resolves identifiers" and
 * "scans the import graph". The gap was not cosmetic — it decided what walked
 * past them:
 *
 *   - grepping `downloadAndSave(` misses `import { downloadAndSave as dl }`
 *     followed by `dl(url)`, misses `fileUtils.downloadAndSave (url)` (the
 *     space defeats the pattern), and misses every `.mjs` / `.js` file because
 *     the include list was `*.ts,*.tsx`.
 *   - grepping `@/lib/media-library/` misses `../../lib/media-library/client`,
 *     which is the same boot-time relationship spelled relatively — exactly
 *     what ADR-0012 guarantee #2 forbids.
 *
 * So parse instead. TypeScript is already a dependency (tsc runs in CI), and its
 * parser gives real import clauses and real call expressions. This is still not
 * a type checker: it resolves module specifiers by path, not by the full
 * resolution algorithm, and it cannot see a call made through a value passed
 * around at runtime. That limit is stated in the evals rather than papered over.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

const SOURCE_EXT = new Set([".ts", ".tsx", ".mjs", ".cjs", ".js", ".jsx"]);

export function sourceFiles(root, dir = root) {
    const out = [];
    for (const entry of readdirSync(dir)) {
        if (entry === "node_modules" || entry.startsWith(".")) continue;
        const full = path.join(dir, entry);
        if (statSync(full).isDirectory()) out.push(...sourceFiles(root, full));
        else if (SOURCE_EXT.has(path.extname(entry))) out.push(full);
    }
    return out;
}

function parse(file) {
    return ts.createSourceFile(
        file,
        readFileSync(file, "utf8"),
        ts.ScriptTarget.Latest,
        true,
        file.endsWith(".tsx") ? ts.ScriptKind.TSX : undefined,
    );
}

/**
 * Where a module specifier points, as an absolute path prefix. `@/x` is the
 * repo's alias for `src/x`; a relative specifier is resolved against the
 * importing file. Bare package names return null — they are never the target
 * of these two guards.
 */
function resolveSpecifier(specifier, fromFile, repoRoot) {
    if (specifier.startsWith("@/"))
        return path.join(repoRoot, "src", specifier.slice(2));
    if (specifier.startsWith("@ext/"))
        return path.join(repoRoot, "src", "ext-default", specifier.slice(5));
    if (specifier.startsWith("."))
        return path.resolve(path.dirname(fromFile), specifier);
    return null;
}

/** Every import in a file, with the local names each one binds. */
export function importsOf(file, repoRoot) {
    const found = [];
    const source = parse(file);
    for (const statement of source.statements) {
        if (
            !ts.isImportDeclaration(statement) ||
            !ts.isStringLiteral(statement.moduleSpecifier)
        )
            continue;
        const specifier = statement.moduleSpecifier.text;
        const named = [];
        let namespace = null;
        const clause = statement.importClause;
        if (clause?.namedBindings) {
            if (ts.isNamespaceImport(clause.namedBindings)) {
                namespace = clause.namedBindings.name.text;
            } else {
                for (const element of clause.namedBindings.elements) {
                    named.push({
                        // `import { a as b }` — `a` is what the module exports,
                        // `b` is what the calls in this file will say.
                        exported: (element.propertyName ?? element.name).text,
                        local: element.name.text,
                    });
                }
            }
        }
        found.push({
            specifier,
            resolved: resolveSpecifier(specifier, file, repoRoot),
            named,
            namespace,
            line:
                source.getLineAndCharacterOfPosition(statement.getStart(source))
                    .line + 1,
        });
    }
    return { source, imports: found };
}

/** Call sites of a set of local identifiers, plus `<ns>.<member>` calls. */
export function callSites(source, locals, namespaceMembers) {
    const hits = [];
    const visit = (node) => {
        if (ts.isCallExpression(node)) {
            const callee = node.expression;
            if (ts.isIdentifier(callee) && locals.has(callee.text)) {
                hits.push({ name: callee.text, node });
            } else if (
                ts.isPropertyAccessExpression(callee) &&
                ts.isIdentifier(callee.expression) &&
                namespaceMembers.has(
                    `${callee.expression.text}.${callee.name.text}`,
                )
            ) {
                hits.push({
                    name: `${callee.expression.text}.${callee.name.text}`,
                    node,
                });
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(source);
    return hits.map((hit) => ({
        name: hit.name,
        line:
            source.getLineAndCharacterOfPosition(hit.node.getStart(source))
                .line + 1,
    }));
}
