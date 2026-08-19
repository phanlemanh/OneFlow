import "server-only";

import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
    existsSync,
    mkdirSync,
    readFileSync,
    rmSync,
    writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { logger } from "@/lib/logger";
import type { OnMilestone } from "@/lib/plugin-executor/provisioning-events";
import { PYTHON_UTF8_ENV, resolvePythonLite } from "@/lib/plugins/python-lite";
import { dataDir, resourcesDir } from "@/lib/runtime/paths.server";

/**
 * Per-plugin Python environment for local plugin entries.
 *
 * In the unified plugin model the platform spawns every plugin's local entry as
 * a subprocess. Each plugin gets its own managed venv holding the tongflow SDK
 * (+ its deps) and, layered on top, that plugin's optional `requirements.txt`.
 *
 * These entries used to share ONE venv, on the assumption — documented in this
 * header until 2026-08-06 — that they are thin adapters whose heavy compute runs
 * in a remote Modal image. ADR-0011 makes the user's machine the default
 * execution substrate, so the heavy dependencies land here instead, where a
 * shared venv is a place for version conflicts that `pip check` only *warns*
 * about: the loser is silently overwritten and the conflict surfaces at run time
 * as wrong behaviour rather than at install time as an error. Isolation is the
 * fix. Cost accepted: one SDK copy per venv and a slower first run.
 *
 * Installs are cumulative and cached by content hash.
 */

const VENV_ROOT = () => join(dataDir(), ".tongflow", "plugin-venv");

/**
 * Remove the pre-2026-08-07 shared venv, which lived AT the path that is now
 * the root holding one venv per plugin.
 *
 * Without this its corpse — `bin/`, `lib/`, `include/`, `pyvenv.cfg` — sits
 * inside the root forever, and anything enumerating `plugin-venv/*` to evict
 * stale environments reads those directories as if they were plugins. Detected
 * by the `pyvenv.cfg` that only a venv root has; a directory of venvs has none.
 *
 * Exported for the test that pins the migration: driving it through
 * `ensurePluginPython` would mean provisioning a real venv first.
 */
export function removeLegacySharedVenv(): void {
    const root = VENV_ROOT();
    if (!existsSync(join(root, "pyvenv.cfg"))) return;
    logger.info(
        "[plugin-env] removing the legacy shared venv; each plugin now gets its own",
    );
    rmSync(root, { recursive: true, force: true });
}

/**
 * The venv directory for one plugin id.
 *
 * The id reaches this function from a directory name on disk and is
 * concatenated into a filesystem path, so it is validated rather than trusted:
 * anything with a separator, a leading dot, or no characters at all would let a
 * venv be created outside the root that eviction scans.
 */
export function venvDirFor(pluginId: string): string {
    if (!/^[a-zA-Z0-9._-]+$/.test(pluginId) || pluginId.startsWith(".")) {
        throw new Error(`unsafe plugin id for a venv path: ${pluginId}`);
    }
    return join(VENV_ROOT(), pluginId);
}

// Markers live inside the venv they describe, so they need no plugin id in the
// filename — and they are discarded with the venv when it is evicted.
const MARKERS_DIR = (pluginId: string) =>
    join(venvDirFor(pluginId), ".markers");

function venvPython(pluginId: string): string {
    const dir = venvDirFor(pluginId);
    return process.platform === "win32"
        ? join(dir, "Scripts", "python.exe")
        : join(dir, "bin", "python");
}

function pythonIsModern(exe: string): boolean {
    try {
        const r = spawnSync(
            exe,
            [
                "-c",
                "import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)",
            ],
            { windowsHide: true },
        );
        return r.status === 0;
    } catch {
        return false;
    }
}

/** First interpreter that runs AND is >= 3.10 (the SDK's minimum). */
export function resolveBasePython(): string | null {
    const candidates = [
        process.env.PYTHON?.trim(),
        "python3.13",
        "python3.12",
        "python3.11",
        "python3.10",
        "python3",
        "python",
    ].filter((x): x is string => Boolean(x));
    for (const cmd of candidates) {
        if (pythonIsModern(cmd)) return cmd;
    }
    return null;
}

function runCmd(
    exe: string,
    args: string[],
    cwd: string,
): Promise<{ code: number; out: string }> {
    return new Promise((resolve) => {
        const child = spawn(exe, args, {
            cwd,
            windowsHide: true,
            env: { ...process.env, ...PYTHON_UTF8_ENV },
        });
        let out = "";
        child.stdout?.on("data", (b: Buffer) => {
            out += String(b);
        });
        child.stderr?.on("data", (b: Buffer) => {
            out += String(b);
        });
        child.on("error", (e) => resolve({ code: 1, out: String(e) }));
        child.on("exit", (code) => resolve({ code: code ?? 1, out }));
    });
}

function hashFile(path: string): string | null {
    try {
        return createHash("sha256").update(readFileSync(path)).digest("hex");
    } catch {
        return null;
    }
}

function readMarker(pluginId: string, name: string): string | null {
    try {
        return readFileSync(join(MARKERS_DIR(pluginId), name), "utf8").trim();
    } catch {
        return null;
    }
}

function writeMarker(pluginId: string, name: string, value: string): void {
    mkdirSync(MARKERS_DIR(pluginId), { recursive: true });
    writeFileSync(join(MARKERS_DIR(pluginId), name), value);
}

/**
 * Serialize venv mutations for ONE plugin.
 *
 * pip is not safe to run concurrently against the same environment. Separate
 * venvs have no such constraint, so the chain is keyed per plugin id rather than
 * global: two plugins now provision at the same time instead of queueing behind
 * each other. Exported for the test that pins that behaviour.
 */
const venvChains = new Map<string, Promise<void>>();

export function serializeVenvMutation<T>(
    pluginId: string,
    fn: () => Promise<T>,
): Promise<T> {
    const prev = venvChains.get(pluginId) ?? Promise.resolve();
    const next = prev.then(fn, fn);
    venvChains.set(
        pluginId,
        next.then(
            () => undefined,
            () => undefined,
        ),
    );
    return next;
}

async function pipCheck(pluginId: string, py: string): Promise<void> {
    const { code, out } = await runCmd(
        py,
        ["-m", "pip", "check"],
        venvDirFor(pluginId),
    );
    if (code !== 0) {
        logger.warn(
            `[plugin-env] pip dependency conflicts inside ${pluginId}'s venv ` +
                `— this venv is private to that plugin, so the conflict is ` +
                `between its own requirements.txt and the SDK:\n${out.trim()}`,
        );
    }
}

async function ensureVenv(
    pluginId: string,
    onMilestone?: OnMilestone,
): Promise<string> {
    const py = venvPython(pluginId);
    const sdkDir = join(resourcesDir(), "sdk");
    const sdkPyproject = join(sdkDir, "pyproject.toml");
    const sdkHash = hashFile(sdkPyproject) ?? "none";

    // Venv + SDK install are cached against the SDK's pyproject (its declared
    // deps). Live SDK *code* still comes via PYTHONPATH in the runner.
    if (existsSync(py) && readMarker(pluginId, "sdk.hash") === sdkHash) {
        return py;
    }

    const base = resolveBasePython();
    if (!base) {
        throw new Error(
            "No Python >= 3.10 found for the plugin venv. Install python3.12 " +
                "(or set PYTHON to a 3.10+ interpreter).",
        );
    }

    if (!existsSync(py)) {
        removeLegacySharedVenv();
        logger.info(`[plugin-env] creating venv for ${pluginId} with ${base}`);
        // The root must exist before it can be a cwd; `python -m venv` creates
        // the leaf itself.
        mkdirSync(VENV_ROOT(), { recursive: true });
        // Emitted inside this branch, so a venv that already exists reports
        // neither a start nor a completion for work nobody did.
        onMilestone?.({ step: "create-venv", phase: "started" });
        const mk = await runCmd(
            base,
            ["-m", "venv", venvDirFor(pluginId)],
            VENV_ROOT(),
        );
        if (mk.code !== 0) {
            throw new Error(
                `failed to create plugin venv for ${pluginId}: ${mk.out.trim()}`,
            );
        }
        onMilestone?.({ step: "create-venv", phase: "completed" });
    }

    logger.info(`[plugin-env] installing tongflow SDK into ${pluginId}'s venv`);
    // Reached only past the cache check above, so a venv whose SDK is already
    // current emits nothing here either.
    onMilestone?.({ step: "install-sdk", phase: "started" });
    const ins = await runCmd(
        py,
        ["-m", "pip", "install", "--upgrade", sdkDir],
        venvDirFor(pluginId),
    );
    if (ins.code !== 0) {
        throw new Error(
            `failed to install SDK into ${pluginId}'s venv: ${ins.out.trim()}`,
        );
    }
    onMilestone?.({ step: "install-sdk", phase: "completed" });

    writeMarker(pluginId, "sdk.hash", sdkHash);
    return py;
}

async function ensurePluginRequirements(
    pluginId: string,
    pluginDir: string,
    py: string,
    onMilestone?: OnMilestone,
): Promise<void> {
    const reqPath = join(pluginDir, "requirements.txt");
    if (!existsSync(reqPath)) return;

    const hash = hashFile(reqPath) ?? "none";
    const markerName = "requirements.hash";
    if (readMarker(pluginId, markerName) === hash) return;

    logger.info(`[plugin-env] installing requirements.txt for ${pluginId}`);
    // Past both early returns: an absent or unchanged requirements.txt says
    // nothing rather than announcing an install that never runs.
    onMilestone?.({ step: "install-requirements", phase: "started" });
    const ins = await runCmd(
        py,
        ["-m", "pip", "install", "-r", reqPath],
        pluginDir,
    );
    if (ins.code !== 0) {
        throw new Error(
            `failed to install requirements for ${pluginId}: ${ins.out.trim()}`,
        );
    }
    await pipCheck(pluginId, py);
    writeMarker(pluginId, markerName, hash);
    onMilestone?.({ step: "install-requirements", phase: "completed" });
}

/**
 * Ensure this plugin's own venv exists with the SDK + its requirements
 * installed, and return the interpreter to run the entry with.
 *
 * `onMilestone` is optional and third, so callers that only want the
 * interpreter keep working unchanged. When it is passed, each real step
 * announces itself twice — once when the work begins, once when it exits
 * cleanly — and a step that is skipped (cached venv, current SDK, absent or
 * unchanged requirements.txt) announces nothing at all. That silence is the
 * point: a milestone fired on a code path that did no work would be a
 * simulated progress bar wearing the clothes of a fact.
 *
 * A provisioning failure is only survivable for a plugin that declares no
 * `requirements.txt`: it needs nothing from the venv beyond the SDK, which the
 * runner puts on PYTHONPATH anyway, so a plain interpreter is genuinely
 * equivalent. For a plugin that DOES declare requirements, the old blanket
 * fallback handed back an interpreter missing every dependency the plugin was
 * about to import — turning an install error with a fixable cause into an
 * ImportError several seconds later, in a subprocess, with no mention of pip.
 * ADR-0011 makes this machine the substrate; failing loudly is the whole point.
 */
export async function ensurePluginPython(
    pluginId: string,
    pluginDir: string,
    onMilestone?: OnMilestone,
): Promise<string> {
    try {
        return await serializeVenvMutation(pluginId, async () => {
            const py = await ensureVenv(pluginId, onMilestone);
            await ensurePluginRequirements(
                pluginId,
                pluginDir,
                py,
                onMilestone,
            );
            return py;
        });
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (!existsSync(join(pluginDir, "requirements.txt"))) {
            logger.warn(
                `[plugin-env] provisioning failed for ${pluginId} (${msg}); it ` +
                    `declares no requirements.txt, so falling back to plain python`,
            );
            return resolvePythonLite();
        }
        throw new Error(
            `could not provision a Python environment for ${pluginId}: ${msg}\n` +
                `${pluginId} declares a requirements.txt, so running it on a plain ` +
                `interpreter would fail later with an ImportError that never mentions ` +
                `pip. Fix the environment — a Python >= 3.10 with working venv and ` +
                `pip — and run the plugin again.`,
        );
    }
}
