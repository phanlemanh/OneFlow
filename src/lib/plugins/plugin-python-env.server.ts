import "server-only";

import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { logger } from "@/lib/logger";
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

async function ensureVenv(pluginId: string): Promise<string> {
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
        logger.info(`[plugin-env] creating venv for ${pluginId} with ${base}`);
        // The root must exist before it can be a cwd; `python -m venv` creates
        // the leaf itself.
        mkdirSync(VENV_ROOT(), { recursive: true });
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
    }

    logger.info(`[plugin-env] installing tongflow SDK into ${pluginId}'s venv`);
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

    writeMarker(pluginId, "sdk.hash", sdkHash);
    return py;
}

async function ensurePluginRequirements(
    pluginId: string,
    pluginDir: string,
    py: string,
): Promise<void> {
    const reqPath = join(pluginDir, "requirements.txt");
    if (!existsSync(reqPath)) return;

    const hash = hashFile(reqPath) ?? "none";
    const markerName = "requirements.hash";
    if (readMarker(pluginId, markerName) === hash) return;

    logger.info(`[plugin-env] installing requirements.txt for ${pluginId}`);
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
}

/**
 * Ensure this plugin's own venv exists with the SDK + its requirements
 * installed, and return the interpreter to run the entry with.
 *
 * The signature is deliberately unchanged: `runners/generic.ts` is the only
 * caller and lives under a t3 path this change must not touch.
 *
 * On any provisioning failure, falls back to the lightweight resolver so an
 * environment without venv/pip still runs plugins that need no extra deps.
 */
export async function ensurePluginPython(
    pluginId: string,
    pluginDir: string,
): Promise<string> {
    try {
        return await serializeVenvMutation(pluginId, async () => {
            const py = await ensureVenv(pluginId);
            await ensurePluginRequirements(pluginId, pluginDir, py);
            return py;
        });
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        logger.warn(
            `[plugin-env] provisioning failed (${msg}); falling back to plain python`,
        );
        return resolvePythonLite();
    }
}
