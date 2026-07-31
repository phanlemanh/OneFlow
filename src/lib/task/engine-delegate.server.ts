import "server-only";

import { spawn } from "node:child_process";
import { delimiter, join } from "node:path";
import { eq } from "drizzle-orm";
import {
    NodeStatus,
    TaskStatus,
    WorkflowStatus,
} from "@/constants/task-status";
import { getDb, tasks } from "@/db";
import { getStorage } from "@/lib/file/storage.server";
import { logger } from "@/lib/logger";
import { resolveBasePython } from "@/lib/plugins/plugin-python-env.server";
import { PYTHON_UTF8_ENV, resolvePythonLite } from "@/lib/plugins/python-lite";
import { pluginsDir, resourcesDir } from "@/lib/runtime/paths.server";
import { getScope, scopedDataDirFor } from "@/lib/runtime/scope.server";
import { withStoredEnv } from "@/lib/settings/env-store.server";
import {
    type SerializedWorkflowFailure,
    serializeTaskErrorForDb,
    workflowTaskFailureEnvelope,
} from "@/lib/task/error-envelope";
import { notifyTask, registerTask, removeTask } from "./emitter";
import {
    issueEngineAssetToken,
    revokeEngineAssetToken,
} from "./engine-asset-tokens.server";
import { mapEngineEvent } from "./engine-events";

/**
 * Delegate workflow execution to the SDK engine (`python -m tongflow.engine`),
 * the single execution core shared with standalone `run_workflow`. This keeps
 * the app's own concerns here — DB `tasks` row, SSE `notifyTask`, abort — while
 * the engine owns tier execution, binding resolution, asset handling and plugin
 * spawning.
 *
 * The engine streams NDJSON on stdout: one `{event}` line per progress event,
 * then a final `{result}` (or `{error}`) line. Outputs land under
 * `data/uploads/tasks/<taskId>` with `file_key`s relative to `data/uploads`, so
 * the canvas reads them via `/api/uploads/<file_key>` exactly as before.
 *
 * This is the single workflow execution core — the legacy in-process TS runner
 * has been removed.
 */

/**
 * Cache scope sent to the engine. The empty scope of the single-tenant build
 * becomes an explicit "local" rather than "" — the engine treats an empty
 * tenant as "not declared" and disables the cache, and a cloud whose
 * `resolveScope()` returns "" for everyone would otherwise look identical to a
 * legitimate single-tenant install while pooling every user's cache.
 */
export function tenantFor(scope: string): string {
    return scope ? `user:${scope}` : "local";
}

/** Data root for a scope. Stable across runs: the cache lives under it. */
export function dataRootFor(scope: string): string {
    return scopedDataDirFor(scope);
}

/** Non-scope-derived fields the engine request's `options` block carries. */
export interface EngineOptionsExtras {
    pluginsDir: string;
    assetOptions: Record<string, unknown>;
    autoInstall: boolean;
    taskId: string;
    /**
     * The workflow this task belongs to, or null for a non-workflow task.
     * Required (not optional) so that dropping this field from a call site is
     * a compile error rather than a silent tier-B-disabling no-op: without
     * it, `engineOptionsFor` would treat every call as workflow-less and
     * `workflow_id` would always resolve to `null` (see AC-9,
     * cache-l3-tier-b). Always emitted as `workflow_id` — a numeric string,
     * or `null`, never `""`.
     */
    workflowId: number | null;
}

/**
 * The engine request's `options` block, pure so tests can hold the WIRING —
 * not merely the helpers — to the contract: a reviewer deleted the `tenant`
 * line and hardcoded `data_dir` and both acceptance evals stayed green until
 * this seam existed. `tenant` and `data_dir` are the only fields derived from
 * `scope` here; everything else passes through `extra` untouched, so this is
 * the single place tenant/data_dir enter the options.
 */
export function engineOptionsFor(
    scope: string,
    extra: EngineOptionsExtras,
): Record<string, unknown> {
    return {
        // abi_path omitted on purpose: the engine falls back to the ABI
        // bundled in the SDK, which always exists in the resources dir.
        plugins_dir: extra.pluginsDir,
        data_dir: dataRootFor(scope),
        tenant: tenantFor(scope),
        ...extra.assetOptions,
        auto_install: extra.autoInstall,
        task_id: extra.taskId,
        workflow_id: extra.workflowId != null ? String(extra.workflowId) : null,
    };
}

function asRecord(v: unknown): Record<string, unknown> | null {
    return v && typeof v === "object" && !Array.isArray(v)
        ? (v as Record<string, unknown>)
        : null;
}

function str(v: unknown): string | undefined {
    return typeof v === "string" ? v : undefined;
}

function num(v: unknown): number | undefined {
    return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

/** Cache-counter columns from an engine final result. Each counter falls to
 *  null independently when absent or malformed; a missing `cache` block
 *  yields both null (NULL ≠ 0 — see workspace.schema.ts). */
export function cacheColumnsFrom(result: Record<string, unknown> | null): {
    cacheCallsTotal: number | null;
    cacheCallsCached: number | null;
} {
    const c = result ? asRecord(result.cache) : null;
    const total = c ? num(c.calls_total) : undefined;
    const cached = c ? num(c.calls_cached) : undefined;
    return {
        cacheCallsTotal: total ?? null,
        cacheCallsCached: cached ?? null,
    };
}

function handleEvent(taskId: string, ev: Record<string, unknown>): void {
    const type = str(ev.type);
    const nodeId = str(ev.nodeId);

    const mapped = mapEngineEvent(ev);
    if (mapped) {
        notifyTask(taskId, mapped.status, mapped.data, mapped.nodeId);
        return;
    }

    switch (type) {
        case "workflow_started":
            notifyTask(taskId, WorkflowStatus.WORKFLOW_STARTED, {
                totalNodes: num(ev.totalNodes) ?? 0,
                levels: num(ev.levels) ?? 0,
                nodes: [],
            });
            break;
        case "node_started":
            notifyTask(
                taskId,
                NodeStatus.NODE_STARTED,
                {
                    level: num(ev.level) ?? 0,
                    feature: str(ev.feature) ?? "",
                    label: str(ev.label) ?? "",
                },
                nodeId,
            );
            break;
        case "plugin_progress": {
            const percent = num(ev.percent);
            notifyTask(taskId, TaskStatus.RUNNING, {
                message: str(ev.message) ?? "",
                ...(percent != null ? { percent } : {}),
            });
            break;
        }
        case "node_completed":
            notifyTask(
                taskId,
                NodeStatus.NODE_COMPLETED,
                { output: ev.output, label: str(ev.label) ?? "" },
                nodeId,
            );
            break;
        case "node_failed":
            notifyTask(
                taskId,
                NodeStatus.NODE_FAILED,
                {
                    message: "Node execution failed",
                    error: str(ev.error) ?? "",
                    label: str(ev.label) ?? "",
                },
                nodeId,
            );
            break;
        default:
            // workflow_completed / workflow_failed / log: handled via the final
            // result line (or ignored).
            break;
    }
}

export async function executeWorkflowViaEngine(
    taskId: string,
    workflowJson: string,
    inputs: Record<string, unknown>,
    workflowId: number | null,
): Promise<void> {
    const controller = registerTask(taskId);
    let assetToken: string | null = null;

    try {
        const db = await getDb();
        await db
            .update(tasks)
            .set({ status: "processing" })
            .where(eq(tasks.id, taskId));

        const python = resolveBasePython() ?? (await resolvePythonLite());
        const sdkDir = join(resourcesDir(), "sdk");
        const scope = await getScope();
        const dataRoot = dataRootFor(scope);
        const uploadsBase = join(dataRoot, "uploads");
        const outDir = join(uploadsBase, "tasks", taskId);

        // Remote storage driver (cloud): route the engine's asset IO through
        // the /api/engine-assets loopback sink so files go straight to the
        // driver's backend and never touch the local disk. Local driver
        // (desktop / open-source default): unchanged disk contract.
        const remoteStorage = Boolean(getStorage().remote);
        assetToken = remoteStorage
            ? await issueEngineAssetToken(scope, taskId)
            : null;
        const assetOptions = assetToken
            ? {
                  asset_endpoint: `http://127.0.0.1:${process.env.PORT || "3000"}/api/engine-assets`,
                  asset_token: assetToken,
              }
            : {
                  out_dir: outDir,
                  file_key_base: uploadsBase,
                  // Disk outputs: the canvas reads results via /api/uploads/<file_key>.
                  inline_outputs: false,
              };

        const request = {
            workflow: JSON.parse(workflowJson),
            inputs,
            options: engineOptionsFor(scope, {
                pluginsDir: pluginsDir(),
                assetOptions,
                autoInstall: true,
                taskId,
                workflowId,
            }),
        };

        // In a scoped (cloud) run, point the Modal deploy cache into the
        // user's data dir so needsDeploy plugins deploy into that user's own
        // account.
        const env = await withStoredEnv({
            ...PYTHON_UTF8_ENV,
            PYTHONPATH: [sdkDir, process.env.PYTHONPATH?.trim()]
                .filter((x): x is string => Boolean(x))
                .join(delimiter),
            ...(scope
                ? {
                      TONGFLOW_MODAL_CACHE_DIR: join(dataRoot, "modal-cache"),
                  }
                : {}),
        });

        await new Promise<void>((resolve, reject) => {
            const child = spawn(python, ["-m", "tongflow.engine"], {
                cwd: resourcesDir(),
                env,
                windowsHide: true,
                stdio: ["pipe", "pipe", "pipe"],
            });

            let stdoutBuf = "";
            let finalResult: Record<string, unknown> | null = null;
            let finalError: string | null = null;

            const onLine = (line: string) => {
                const trimmed = line.trim();
                if (!trimmed) return;
                let parsed: unknown;
                try {
                    parsed = JSON.parse(trimmed);
                } catch {
                    logger.info(`[engine] ${trimmed}`);
                    return;
                }
                const rec = asRecord(parsed);
                if (!rec) return;
                if ("event" in rec) {
                    const ev = asRecord(rec.event);
                    if (ev) handleEvent(taskId, ev);
                } else if ("result" in rec) {
                    finalResult = asRecord(rec.result);
                } else if ("error" in rec) {
                    finalError = str(rec.error) ?? "Engine error";
                }
            };

            controller.signal.addEventListener(
                "abort",
                () => {
                    try {
                        child.kill();
                    } catch {
                        // ignore
                    }
                    reject(new Error("Task cancelled"));
                },
                { once: true },
            );

            child.stdout?.on("data", (b: Buffer) => {
                stdoutBuf += String(b);
                let nl = stdoutBuf.indexOf("\n");
                while (nl !== -1) {
                    onLine(stdoutBuf.slice(0, nl));
                    stdoutBuf = stdoutBuf.slice(nl + 1);
                    nl = stdoutBuf.indexOf("\n");
                }
            });

            child.stderr?.on("data", (b: Buffer) => {
                const s = String(b).trim();
                if (s) logger.info(`[engine:stderr] ${s}`);
            });

            child.on("error", (e) => reject(e));

            child.on("exit", async (code) => {
                if (controller.signal.aborted) return;
                if (stdoutBuf.trim()) onLine(stdoutBuf);

                try {
                    if (finalError) {
                        notifyTask(taskId, WorkflowStatus.WORKFLOW_FAILED, {
                            message: "Workflow execution failed",
                            error: finalError,
                        });
                        await db
                            .update(tasks)
                            .set({
                                status: "failed",
                                error: serializeTaskErrorForDb({
                                    message: finalError,
                                }),
                            })
                            .where(eq(tasks.id, taskId));
                        resolve();
                        return;
                    }

                    if (!finalResult) {
                        const msg = `Engine produced no result (exit=${code}).`;
                        notifyTask(taskId, WorkflowStatus.WORKFLOW_FAILED, {
                            message: msg,
                        });
                        await db
                            .update(tasks)
                            .set({
                                status: "failed",
                                error: serializeTaskErrorForDb({
                                    message: msg,
                                }),
                            })
                            .where(eq(tasks.id, taskId));
                        resolve();
                        return;
                    }

                    const result = finalResult as Record<string, unknown>;
                    const outputs = result.outputs ?? {};
                    if (result.status === "success") {
                        notifyTask(taskId, WorkflowStatus.WORKFLOW_COMPLETED, {
                            status: "success",
                            outputs,
                            totalDuration: 0,
                        });
                        await db
                            .update(tasks)
                            .set({
                                status: "completed",
                                result: JSON.stringify(outputs),
                                ...cacheColumnsFrom(result),
                            })
                            .where(eq(tasks.id, taskId));
                    } else {
                        const errors = Array.isArray(result.errors)
                            ? (result.errors as string[])
                            : [];
                        const failures = Array.isArray(result.failures)
                            ? (result.failures as SerializedWorkflowFailure[])
                            : [];
                        notifyTask(taskId, WorkflowStatus.WORKFLOW_FAILED, {
                            status: "failed",
                            outputs,
                            errors,
                            failures,
                        });
                        await db
                            .update(tasks)
                            .set({
                                status: "failed",
                                error: serializeTaskErrorForDb(
                                    workflowTaskFailureEnvelope(
                                        errors,
                                        failures,
                                    ),
                                ),
                                ...cacheColumnsFrom(result),
                            })
                            .where(eq(tasks.id, taskId));
                    }
                    resolve();
                } catch (e) {
                    reject(e);
                }
            });

            try {
                child.stdin?.write(JSON.stringify(request));
                child.stdin?.end();
            } catch (e) {
                try {
                    child.kill();
                } catch {
                    // ignore
                }
                reject(e);
            }
        });
    } catch (error) {
        if (controller.signal.aborted) return;
        const errorMsg =
            error instanceof Error ? error.message : "Unknown error";
        logger.error(`[engine] Task ${taskId} delegation failed: ${errorMsg}`);
        notifyTask(taskId, WorkflowStatus.WORKFLOW_FAILED, {
            message: "Workflow execution failed",
            error: errorMsg,
        });
        const db = await getDb();
        await db
            .update(tasks)
            .set({
                status: "failed",
                error: serializeTaskErrorForDb({ message: errorMsg }),
            })
            .where(eq(tasks.id, taskId));
    } finally {
        if (assetToken) await revokeEngineAssetToken(assetToken);
        removeTask(taskId);
    }
}
