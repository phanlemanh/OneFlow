/**
 * Prove `pluginRev` survives the join between the two halves that produce it.
 *
 * The registry manifest has exactly one producer — the Python scanner — while
 * the common install path is the TypeScript one (isomorphic-git). Testing each
 * half alone leaves the join untested, and the join is where this fails in a
 * way nothing else catches: a checkout written by isomorphic-git that the git
 * CLI cannot read, or a desktop build with no git binary at all. Either yields
 * an entry with no rev, which AC-9 defines as a legitimate state — so the
 * failure would look exactly like a hand-copied plugin and reach L1 as a
 * silently missing cache key.
 *
 * Why this writes the checkout with isomorphic-git instead of calling
 * `installPlugin`: that function clones over http(s) only, so driving it would
 * mean standing up a git server inside the check — real brittleness bought for
 * no extra fidelity. What actually needs proving is narrower and is exactly
 * what this does: a `.git` directory **written by isomorphic-git** must be
 * readable by `git rev-parse`, which is what the scanner shells out to. Those
 * are two different implementations of the same format, and the assumption that
 * one can read the other is the whole risk.
 */

import { execFileSync } from "node:child_process";
import fs, { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import git from "isomorphic-git";

const PLUGIN_ID = "oneflow-api-revcheck";

function run(cmd: string, args: string[], cwd: string): string {
    return execFileSync(cmd, args, { cwd, encoding: "utf8" }).trim();
}

function fail(message: string): never {
    console.error(`FAIL: ${message}`);
    process.exit(1);
}

/**
 * Write a plugin checkout using isomorphic-git only — the same library the
 * in-app installer uses, so the on-disk `.git` is the one a real install
 * leaves behind. The system git binary never touches it.
 */
async function writeCheckoutWithIsomorphicGit(dir: string): Promise<string> {
    fs.mkdirSync(dir, { recursive: true });
    // Minimal but genuinely scannable: the scanner only registers a plugin
    // that exposes an annotated @node_slot handler, so a bare file would make
    // this check pass for the wrong reason (nothing registered, nothing read).
    fs.writeFileSync(
        join(dir, "entry.py"),
        [
            "from tongflow.slots import node_slot, NodeSlots",
            "from tongflow.models.gen_text import GenTextInput, GenTextOutput",
            "",
            "@node_slot(NodeSlots.GEN_TEXT)",
            "def gen_text(input: GenTextInput) -> GenTextOutput:",
            "    ...",
            "",
        ].join("\n"),
        "utf8",
    );
    await git.init({ fs, dir, defaultBranch: "main" });
    await git.add({ fs, dir, filepath: "entry.py" });
    return git.commit({
        fs,
        dir,
        message: "init",
        author: { name: "revcheck", email: "revcheck@example.invalid" },
    });
}

async function main(): Promise<void> {
    const root = mkdtempSync(join(tmpdir(), "oneflow-revjoin-"));
    try {
        const pluginsDir = join(root, "plugins");
        const dir = join(pluginsDir, PLUGIN_ID);
        fs.mkdirSync(pluginsDir, { recursive: true });

        const sha = await writeCheckoutWithIsomorphicGit(dir);

        // Sanity: the system git binary must agree about HEAD before the
        // scanner's own read can mean anything.
        const cliSha = run("git", ["rev-parse", "HEAD"], dir);
        if (cliSha !== sha) {
            fail(
                `the git CLI reads HEAD as ${cliSha} but isomorphic-git wrote ${sha} — ` +
                    "the two disagree about a checkout the installer produces",
            );
        }

        // The Python scanner: the only thing that writes a registry manifest.
        const stdout = execFileSync(
            "python3",
            [
                "-m",
                "tongflow",
                "--root",
                pluginsDir,
                "--abi",
                join(process.cwd(), "config", "tongflow.abi.json"),
            ],
            {
                cwd: join(process.cwd(), "sdk"),
                env: { ...process.env, PYTHONPATH: join(process.cwd(), "sdk") },
                encoding: "utf8",
                maxBuffer: 32 * 1024 * 1024,
            },
        );

        const registry = JSON.parse(stdout) as {
            plugins?: Record<string, { pluginRev?: string }>;
        };
        const entry = registry.plugins?.[PLUGIN_ID];
        if (!entry) {
            fail(
                `the scanner did not register ${PLUGIN_ID} at all, so the rev could not be checked`,
            );
        }
        if (!entry.pluginRev) {
            fail(
                `${PLUGIN_ID} was installed through the TypeScript path but the scanner recorded no pluginRev — ` +
                    "the join is broken, and the failure is indistinguishable from a hand-copied plugin",
            );
        }
        if (entry.pluginRev !== sha) {
            fail(
                `pluginRev mismatch: scanner wrote ${entry.pluginRev}, the checkout is at ${sha}`,
            );
        }

        console.log(
            `OK: TypeScript install -> Python scan preserved pluginRev ${entry.pluginRev}`,
        );
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
}

main().catch((e: unknown) => {
    fail(e instanceof Error ? e.message : String(e));
});
