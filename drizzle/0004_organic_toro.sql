CREATE TABLE `director_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`run_id` text NOT NULL,
	`kind` text NOT NULL,
	`ts` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`prompt_text` text NOT NULL,
	`plan_json` text,
	`dsl_version` integer NOT NULL,
	`canvas_was_empty` integer,
	`attempts` integer,
	`error_code` text,
	`used_memory` integer,
	`memory_block_digest` text,
	`estimate_ms` integer,
	`workflow_id` integer
);
--> statement-breakpoint
CREATE INDEX `director_events_run_id_idx` ON `director_events` (`run_id`);--> statement-breakpoint
CREATE INDEX `director_events_kind_ts_idx` ON `director_events` (`kind`,`ts`);--> statement-breakpoint
ALTER TABLE `workflows` ADD `director_run_id` text;