/**
 * The save-request fragment that carries a graph's Director provenance.
 *
 * Kept as one pure function so both save paths (the title menu and the
 * run-then-save hook) send exactly the same shape, and so the rule "a
 * hand-built graph sends NO field, not an empty one" is testable without a
 * component: `workflows.director_run_id` must stay NULL for hand-built graphs
 * (director-wire-shape AC-7), and an empty string would not be NULL.
 */
export function provenanceFields(directorRunId: string | null | undefined): {
    directorRunId?: string;
} {
    return directorRunId ? { directorRunId } : {};
}
