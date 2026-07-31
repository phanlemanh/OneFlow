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
