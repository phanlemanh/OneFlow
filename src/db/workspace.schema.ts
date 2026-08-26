import {
    index,
    integer,
    real,
    sqliteTable,
    text,
} from "drizzle-orm/sqlite-core";

export const workflows = sqliteTable(
    "workflows",
    {
        id: integer("id").primaryKey({ autoIncrement: true }),
        name: text("name").notNull(),
        description: text("description"),
        flow: text("flow").notNull(), // JSON string
        executable: text("executable"), // executable workflow JSON string
        cover: text("cover"),
        // Provenance: the Director run this workflow was staged from, or NULL
        // for a hand-built graph. Joins workflows -> director_events -> tasks ->
        // materials, which is what makes "which plan produced a favourited
        // output" answerable at all (director-wire-shape AC-7).
        directorRunId: text("director_run_id"),
        createdAt: integer("created_at", { mode: "timestamp" })
            .defaultNow()
            .notNull(),
        updatedAt: integer("updated_at", { mode: "timestamp" })
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
        deleted: integer("deleted", { mode: "boolean" })
            .default(false)
            .notNull(),
    },
    (t) => [index("workflows_deleted_idx").on(t.deleted)],
);

export const tasks = sqliteTable(
    "tasks",
    {
        id: text("id").primaryKey(),
        workflowId: integer("workflow_id").references(() => workflows.id, {
            onDelete: "set null",
        }),
        nodeId: text("node_id").notNull(),
        feature: text("feature").notNull(),
        pluginId: text("plugin_id").notNull().default(""),
        // Selected model for router-style plugins; null = plugin default
        model: text("model"),
        prompt: text("prompt").notNull(), // JSON string (business fields only)
        status: text("status").notNull().default("pending"),
        progress: integer("progress").default(0).notNull(),
        result: text("result"), // JSON string
        error: text("error"),
        // Metering. `duration_ms` is the plugin invocation only (asset
        // preparation excluded), so a GPU invoice can be attributed per node.
        // `cost_usd` / `gpu_type` stay NULL until a backend-neutral plugin
        // metadata channel exists — a derived estimate here would poison the
        // very invoice reconciliation these columns are for, and NULL keeps
        // "not measured" distinguishable from "measured as zero".
        durationMs: integer("duration_ms"),
        costUsd: real("cost_usd"),
        gpuType: text("gpu_type"),
        // % partial telemetry (cache-l4-eviction). NULL = engine reported nothing
        // (older engine, cache off, reuse="off") — never conflate with measured 0.
        cacheCallsTotal: integer("cache_calls_total"),
        cacheCallsCached: integer("cache_calls_cached"),
        createdAt: integer("created_at", { mode: "timestamp" })
            .defaultNow()
            .notNull(),
        updatedAt: integer("updated_at", { mode: "timestamp" })
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (t) => [
        index("tasks_status_idx").on(t.status),
        index("tasks_created_idx").on(t.createdAt),
    ],
);

export const materials = sqliteTable(
    "materials",
    {
        id: integer("id").primaryKey({ autoIncrement: true }),
        taskId: text("task_id"),
        workflowId: integer("workflow_id").references(() => workflows.id, {
            onDelete: "set null",
        }),
        name: text("name").notNull(),
        type: text("type").notNull(),
        content: text("content").notNull(), // JSON string
        thumbnail: text("thumbnail"),
        isFavorite: integer("is_favorite", { mode: "boolean" })
            .default(false)
            .notNull(),
        isCover: integer("is_cover", { mode: "boolean" })
            .default(false)
            .notNull(),
        createdAt: integer("created_at", { mode: "timestamp" })
            .defaultNow()
            .notNull(),
        updatedAt: integer("updated_at", { mode: "timestamp" })
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
        deleted: integer("deleted", { mode: "boolean" })
            .default(false)
            .notNull(),
    },
    (t) => [
        index("materials_deleted_idx").on(t.deleted),
        index("materials_type_deleted_idx").on(t.type, t.deleted),
        index("materials_task_id_idx").on(t.taskId),
        index("materials_workflow_id_idx").on(t.workflowId),
    ],
);

/**
 * Append-only ledger of Director runs — the substrate every `director-v2` item
 * needs ([ADR-0013](../../docs/adr/0013-director-truong-ky.md)).
 *
 * Two rules this table exists to hold:
 *
 * - **Code writes it, never the model.** Long-term memory is a deterministic
 *   aggregate over these rows; nothing a model emits reaches durable storage
 *   except a plan a user explicitly accepted. Provenance (`runId`, `ts`) rides
 *   on every row so any personalisation input can be listed with one query.
 * - **Derived columns stay NULL until measured.** `attempts`, `estimateMs`,
 *   `usedMemory` and friends are nullable for the same reason `tasks.cost_usd`
 *   is: a made-up number poisons the very metric it serves. NULL means "not
 *   measured", never "measured as zero".
 *
 * The server writes `kind='generated'` before it can know the outcome (the tab
 * may close mid-request); the client patches the outcome afterwards through
 * `POST /api/director/feedback`, once, in one direction.
 */
export const directorEvents = sqliteTable(
    "director_events",
    {
        id: integer("id").primaryKey({ autoIncrement: true }),
        /** Correlates the generated row with its later outcome patch. */
        runId: text("run_id").notNull(),
        /** generated | staged | accepted | replaced | discarded | failed */
        kind: text("kind").notNull(),
        ts: integer("ts", { mode: "timestamp" }).defaultNow().notNull(),
        /** User-authored free text. Local-first: it never leaves this machine. */
        promptText: text("prompt_text").notNull(),
        /** The DirectorPlan as returned, or NULL when the run produced none. */
        planJson: text("plan_json"),
        dslVersion: integer("dsl_version").notNull(),
        /** Was the canvas empty when the user asked? Distinguishes "build new"
         *  from "edit existing" — the numerator of director-v2's metric #1. */
        canvasWasEmpty: integer("canvas_was_empty", { mode: "boolean" }),
        /** Model round-trips this run consumed (1 or 2 today). The reason this
         *  table exists: attempt-1 yield is not observable from outside. */
        attempts: integer("attempts"),
        /** DirectorErrorCode when the run failed, else NULL. */
        errorCode: text("error_code"),
        /** Whether personalisation inputs were fed into this run. Without it,
         *  no A/B of a memory kill-switch is possible after the fact. */
        usedMemory: integer("used_memory", { mode: "boolean" }),
        /** Hash of the rendered memory block — per-run audit of what was
         *  injected, and the cache-hit measurement for a future breakpoint. */
        memoryBlockDigest: text("memory_block_digest"),
        /** Predicted duration shown before the run; compared against
         *  tasks.duration_ms to get the estimate error (director-v2 metric #2). */
        estimateMs: integer("estimate_ms"),
        workflowId: integer("workflow_id"),
    },
    (t) => [
        index("director_events_run_id_idx").on(t.runId),
        index("director_events_kind_ts_idx").on(t.kind, t.ts),
    ],
);
