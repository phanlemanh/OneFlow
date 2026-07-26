/**
 * E6 / AC-3: the CLI installer, the in-app install path, and the update checker
 * must build the same remote for the same entry.
 *
 * The expected table is re-derived here, in three deliberate lines, rather than
 * imported from the shared resolver. A guard that calls the very function it is
 * checking passes even when that function is wrong — so the expectation has to
 * be independent, even at the cost of duplicating a trivial rule inside a file
 * the single-rule guard explicitly excludes.
 *
 * The two server-side consumers live in `server-only` modules that cannot be
 * imported here, so their agreement is asserted structurally: after this change
 * no call site may build a remote from a bare org. Any that does is the second
 * copy of the rule growing back.
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

interface RawManifest {
    org: string;
    plugins: (string | { id: string; origin?: string })[];
}

/** Independent expectation model — intentionally NOT the shared resolver. */
function expectedRemotes(raw: RawManifest): Map<string, string> {
    const out = new Map<string, string>();
    for (const entry of raw.plugins) {
        const id = typeof entry === "string" ? entry : entry.id;
        const base =
            typeof entry === "string" ? raw.org : (entry.origin ?? raw.org);
        out.set(id, `${base}/${id}.git`);
    }
    return out;
}

/** What the CLI installer would actually clone from, via its own code path. */
function installerRemotes(resourcesDir: string): Map<string, string> {
    const stdout = execFileSync(
        "pnpm",
        ["tsx", "scripts/install-official-plugins.ts", "--print-remotes"],
        {
            encoding: "utf8",
            env: { ...process.env, TONGFLOW_RESOURCES_DIR: resourcesDir },
        },
    );
    const out = new Map<string, string>();
    for (const line of stdout.split("\n")) {
        if (!line.trim()) continue;
        const [id, url] = line.split("\t");
        if (id && url) out.set(id, url);
    }
    return out;
}

function compare(
    label: string,
    want: Map<string, string>,
    got: Map<string, string>,
): void {
    if (want.size !== got.size) {
        throw new Error(
            `${label}: expected ${want.size} remotes, the installer printed ${got.size}`,
        );
    }
    for (const [id, url] of want) {
        if (got.get(id) !== url) {
            throw new Error(
                `${label}: ${id} — expected ${url}, the installer printed ${got.get(id)}`,
            );
        }
    }
}

/**
 * No consumer may build a remote from a bare org.
 *
 * Two shapes are rejected: a two-argument `officialGitUrl(org, id)` call, which
 * is the signature this feature removed, and an org threaded into the update
 * checker, which is the specific call that would have left a forked plugin
 * checked against upstream.
 */
function assertNoBareOrgUrlBuild(): void {
    const files = [
        "src/lib/plugins/official-plugins.server.ts",
        "src/lib/plugins/plugins-install.server.ts",
    ];
    for (const file of files) {
        const src = readFileSync(file, "utf8");

        const pairForm = src.match(/officialGitUrl\([^)]*,[^)]*\)/);
        if (pairForm) {
            throw new Error(
                `${file}: officialGitUrl is called with two arguments — ${pairForm[0]}. It takes an entry, so that a caller holding only the default org cannot build a URL for a plugin that overrides it.`,
            );
        }

        const orgIntoChecker = src.match(/checkPluginUpdate\([^)]*\borg\b/);
        if (orgIntoChecker) {
            throw new Error(
                `${file}: an org is being threaded into the update checker — ${orgIntoChecker[0]}`,
            );
        }
    }
}

/**
 * Building the right URL is not the same as fetching from it.
 *
 * `git.pull` without `url` resolves the remote from the checkout's own
 * .git/config, so an already-installed plugin whose entry gains an `origin`
 * would keep fast-forwarding from the repository it was first cloned from —
 * while the update checker, which does use the new origin, reports an update
 * that every click fails to apply, silently and forever. Comparing the URLs
 * each consumer *builds* cannot see that, so it is asserted directly.
 */
function assertPullUsesResolvedUrl(): void {
    const files = [
        "src/lib/plugins/plugins-install.server.ts",
        "scripts/install-official-plugins.ts",
    ];
    for (const file of files) {
        const src = readFileSync(file, "utf8");
        const pullCall = src.match(/git\.pull\(\{[^}]*\}/);
        if (!pullCall) {
            throw new Error(`${file}: no git.pull call found to check`);
        }
        if (!/\burl\b/.test(pullCall[0])) {
            throw new Error(
                `${file}: git.pull does not pass \`url\`, so it fetches from the checkout's stored remote rather than the entry's resolved origin — an override would never reach an already-installed plugin.`,
            );
        }
    }
}

function main(): void {
    // 1. The shipped manifest: 38 string entries, all on the default org.
    const shipped = JSON.parse(
        readFileSync(
            join(process.cwd(), "config", "official-plugins.json"),
            "utf8",
        ),
    ) as RawManifest;
    compare(
        "shipped manifest",
        expectedRemotes(shipped),
        installerRemotes(process.cwd()),
    );

    // 2. A fixture whose entry overrides its origin — the case the shipped
    //    manifest deliberately does not exercise yet.
    const fixtureRoot = mkdtempSync(join(tmpdir(), "oneflow-parity-"));
    const fixture: RawManifest = {
        org: "https://github.com/tong-io",
        plugins: [
            "tongflow-api-gemini",
            {
                id: "oneflow-api-openai",
                origin: "https://github.com/phanlemanh",
            },
            "tongflow-api-deepseek",
        ],
    };
    mkdirSync(join(fixtureRoot, "config"), { recursive: true });
    writeFileSync(
        join(fixtureRoot, "config", "official-plugins.json"),
        JSON.stringify(fixture, null, 4),
    );
    compare(
        "override fixture",
        expectedRemotes(fixture),
        installerRemotes(fixtureRoot),
    );

    // 3. Neither server consumer may build a remote from a bare org.
    assertNoBareOrgUrlBuild();

    // 4. Both pull paths must fetch from the resolved URL, not the stored one.
    assertPullUsesResolvedUrl();

    console.log(
        "OK: the CLI installer, the in-app install path and the update checker agree, and both pull paths use the resolved origin",
    );
}

main();
