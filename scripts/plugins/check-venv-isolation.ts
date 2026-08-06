/**
 * E4 / AC-3 — two plugins with conflicting pins each get their own version.
 *
 * Drives the REAL `ensurePluginPython`, not a reimplementation of what it is
 * supposed to do. Two throwaway plugins pin the same package to two different
 * versions; both are provisioned concurrently (which also exercises the
 * per-id serialization chain), and each must end up with its own pin.
 *
 * Then the counterfactual: the same two requirement sets installed into ONE
 * shared venv, where the second silently overwrites the first. That is the
 * failure this change exists to remove, and asserting it here is what makes
 * the green above mean "isolation fixed it" rather than "it happened to work".
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, sep } from "node:path";

const PACKAGE = "six";
const PIN_A = "1.16.0";
const PIN_B = "1.17.0";

const work = mkdtempSync(join(tmpdir(), "oneflow-venv-isolation-"));
process.env.TONGFLOW_DATA_DIR = join(work, "data");

function fail(message: string): never {
    console.error(`FAIL: ${message}`);
    rmSync(work, { recursive: true, force: true });
    process.exit(1);
}

function makePlugin(id: string, pin: string): string {
    const dir = join(work, "plugins", id);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "requirements.txt"), `${PACKAGE}==${pin}\n`);
    return dir;
}

function installedVersion(python: string): string {
    return execFileSync(
        python,
        ["-c", `import ${PACKAGE}; print(${PACKAGE}.__version__)`],
        { encoding: "utf8" },
    ).trim();
}

async function main(): Promise<void> {
    const { ensurePluginPython, venvDirFor, resolveBasePython } = await import(
        "../../src/lib/plugins/plugin-python-env.server"
    );

    const idA = "isolation-probe-a";
    const idB = "isolation-probe-b";
    const dirA = makePlugin(idA, PIN_A);
    const dirB = makePlugin(idB, PIN_B);

    console.log(`provisioning ${idA} (${PACKAGE}==${PIN_A}) and ${idB} (${PACKAGE}==${PIN_B}) concurrently`);
    const [pyA, pyB] = await Promise.all([
        ensurePluginPython(idA, dirA),
        ensurePluginPython(idB, dirB),
    ]);

    // A provisioning failure falls back to a plain interpreter, which would
    // make the assertions below meaningless — catch that rather than read it
    // as a pass.
    for (const [id, py] of [
        [idA, pyA],
        [idB, pyB],
    ] as const) {
        if (!py.startsWith(venvDirFor(id) + sep)) {
            fail(
                `${id} did not get its own venv interpreter (got ${py}); ` +
                    `provisioning fell back to a plain python, so nothing below is proven`,
            );
        }
    }

    if (venvDirFor(idA) === venvDirFor(idB)) {
        fail("the two plugins resolved to the same venv directory");
    }

    const versionA = installedVersion(pyA);
    const versionB = installedVersion(pyB);
    console.log(`  ${idA} -> ${PACKAGE} ${versionA}`);
    console.log(`  ${idB} -> ${PACKAGE} ${versionB}`);

    if (versionA !== PIN_A) fail(`${idA} resolved ${PACKAGE} ${versionA}, expected ${PIN_A}`);
    if (versionB !== PIN_B) fail(`${idB} resolved ${PACKAGE} ${versionB}, expected ${PIN_B}`);

    // ---- Counterfactual: one shared venv loses a pin, silently. ----
    const base = resolveBasePython();
    if (!base) fail("no base python available for the shared-venv counterfactual");
    const shared = join(work, "shared-venv");
    execFileSync(base, ["-m", "venv", shared], { stdio: "ignore" });
    const sharedPy =
        process.platform === "win32"
            ? join(shared, "Scripts", "python.exe")
            : join(shared, "bin", "python");
    for (const pin of [PIN_A, PIN_B]) {
        execFileSync(sharedPy, ["-m", "pip", "install", "-q", `${PACKAGE}==${pin}`], {
            stdio: "ignore",
        });
    }
    const sharedVersion = installedVersion(sharedPy);
    console.log(`  shared venv after both installs -> ${PACKAGE} ${sharedVersion}`);
    if (sharedVersion === PIN_A) {
        fail(
            "the shared-venv counterfactual kept both pins, so this eval proves nothing " +
                "— pick two versions that genuinely conflict",
        );
    }

    console.log(
        `OK: each plugin resolved its own pin (${PIN_A} / ${PIN_B}); ` +
            `one shared venv would have left only ${sharedVersion}`,
    );
    rmSync(work, { recursive: true, force: true });
}

main().catch((e) => fail(e instanceof Error ? e.message : String(e)));
