/**
 * What the bundled first-run example needs in order to run at all.
 *
 * Detection happens when the workflow LOADS, not when the user presses Run —
 * the industry baseline for this shape of tool (ComfyUI-Manager lists missing
 * nodes at load). Everything here is a pure read of the exported workflow: no
 * network, no child process, no registry access.
 */

/** One executable node's demand on the plugin registry. */
export type ExampleRequirement = {
    pluginId: string;
    /** ABI slot the node mounts, e.g. "split-video". */
    feature: string;
};

type ExportedNode = { pluginId?: unknown; feature?: unknown };

/**
 * Unique plugin ids the workflow's executable nodes are pinned to, in first
 * -appearance order. `pluginId` is a top-level field on an exported node; it is
 * deliberately not nested inside `prompt` (see CLAUDE.md, "Wire / persistence
 * shape").
 */
export function readExampleRequirements(
    workflow: unknown,
): ExampleRequirement[] {
    const nodes = (workflow as { executableNodes?: unknown })?.executableNodes;
    if (!Array.isArray(nodes)) return [];

    const seen = new Set<string>();
    const out: ExampleRequirement[] = [];
    for (const node of nodes as ExportedNode[]) {
        const pluginId =
            typeof node?.pluginId === "string" ? node.pluginId : "";
        const feature = typeof node?.feature === "string" ? node.feature : "";
        if (!pluginId || seen.has(pluginId)) continue;
        seen.add(pluginId);
        out.push({ pluginId, feature });
    }
    return out;
}

/** Requirements with no matching installed plugin, in requirement order. */
export function missingPluginIds(
    reqs: readonly ExampleRequirement[],
    installedIds: readonly string[],
): string[] {
    const installed = new Set(installedIds);
    return reqs
        .filter((r) => !installed.has(r.pluginId))
        .map((r) => r.pluginId);
}
