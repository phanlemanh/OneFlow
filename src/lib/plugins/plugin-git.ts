/**
 * Git identity shared by the two plugin-install paths.
 *
 * Lives outside `plugins-install.server.ts` for the same reason the manifest
 * resolver does: that file is `server-only`, so the CLI installer cannot import
 * from it and would otherwise keep its own copy — which is how the two paths
 * came to sign as `tongflow` and `oneflow` respectively.
 *
 * Both paths pull with `fastForwardOnly`, which writes no commit, so this
 * identity is never actually recorded anywhere today. isomorphic-git still
 * requires the field, and one wrong-but-unused value is better than two.
 */
export const PLUGIN_GIT_AUTHOR = {
    name: "oneflow",
    email: "oneflow@local",
} as const;
