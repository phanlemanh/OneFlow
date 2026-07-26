/**
 * Plugin directory naming convention.
 *
 * Lives outside `plugins-install.server.ts` so it can be tested directly — that
 * file is `server-only` and cannot be imported from vitest.
 *
 * `oneflow-` is the convention for new plugins. `tongflow-` is accepted as
 * legacy and is not going away soon: the 38 official plugins in
 * `config/official-plugins.json` are upstream repos under an org we do not
 * control, and the install path derives the directory name from the git repo
 * basename. Rejecting `tongflow-` would reject every official plugin the
 * product ships with. Tightening to `oneflow-` alone becomes possible once
 * those repos are forked into our own namespace — one at a time, as reasons to
 * fork appear, not in one sweep.
 *
 * The prefix does not select an execution backend; every plugin runs the same
 * way. It is a label in the node's plugin picker — a hint about where the work
 * tends to run. See docs/plugins.md §5.
 */

/** Accepted directory names: `oneflow-` (current) or `tongflow-` (legacy). */
export const PLUGIN_ID_RE = /^(one|tong)flow-(modal|api)-[a-z0-9][a-z0-9-]*$/;

export function isValidPluginId(id: string): boolean {
    return PLUGIN_ID_RE.test(id);
}

/**
 * Message for a rejected directory name. Names `oneflow-` first so a developer
 * reading it learns which convention to use for new work, rather than copying
 * the legacy one out of the error text.
 */
export function pluginIdError(id: string): string {
    return (
        `Plugin directory "${id}" must match the oneflow-modal-* or oneflow-api-* convention ` +
        `(the legacy tongflow-modal-* / tongflow-api-* names are still accepted for upstream ` +
        `official plugins), otherwise the scanner cannot detect it.`
    );
}

/** Vendor prefixes, longest-lived first. Kept beside the regex on purpose. */
const VENDOR_PREFIXES = ["oneflow", "tongflow"];

/**
 * Label for the plugin picker: the id without its vendor prefix
 * (`oneflow-api-openai` → `api-openai`).
 *
 * Both conventions are stripped. Two plugins differing only in prefix must not
 * render under different labels — otherwise the prefix, which the scanner
 * stopped treating as a distinction, leaks back out as a visible one. This
 * function lived next to the picker and knew only about `tongflow`, which is
 * how that happened; it sits here now so the naming convention has one home.
 */
export function pluginDisplayName(pluginId: string): string {
    const parts = pluginId.split("-").filter(Boolean);
    const semantic = VENDOR_PREFIXES.includes(parts[0] ?? "")
        ? parts.slice(1)
        : parts;
    return semantic.join("-");
}
