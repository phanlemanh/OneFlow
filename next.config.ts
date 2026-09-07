import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
    output: "standalone",
    // A build that lands WHILE a dev server is serving from the same directory
    // deletes the chunk files that server is still handing out. Measured, three
    // arms, 2026-08-20:
    //   · build during serving  → served page 500s, its static chunk 404s
    //   · build first, dev after (same dir, no overlap) → 200; the dev server
    //     rebuilds what it needs, so the two layouts CAN share a directory —
    //     the failure is about timing, not about layout incompatibility
    //   · dev in its own dir, build into .next → 200 throughout
    // Pinned message from the broken arm: `Could not find the module
    // "…/segment-explorer-node.js#SegmentViewNode" in the React Client Manifest`.
    //
    // Scope, and this is the part that misleads: only PAGES die. Route handlers
    // kept answering correctly in every arm, so a verify round can lose all of
    // its UI evidence while the API evals stay green — and that green cluster
    // reads exactly like a healthy tree.
    //
    // Not hypothetical here: `pnpm build && pnpm typecheck` sits in
    // `feature_loop.suite_keys`, so it runs on every verify round, alongside the
    // ui-check evals that need a live dev server. It killed 9 capture runs
    // across the N=2 pilot before anyone found it.
    // Default is unchanged, so CI and the desktop assemble script see `.next`
    // exactly as before; a capture run opts out with NEXT_DIST_DIR=build, which
    // .gitignore and biome.json already exclude, so it needs no config change of
    // its own.
    //
    // KNOWN COST, measured: Next rewrites tsconfig.json on every start whose
    // dist dir differs from the one recorded there — it changes CONTENT, not
    // just formatting (`include` points at <distDir>/types). So switching modes
    // flips that file back and forth, and a capture run must restore it
    // afterwards or the same round's lint goes red on an otherwise clean tree.
    // The capture eval (E15) carries that cleanup as an explicit final step.
    distDir: process.env.NEXT_DIST_DIR || ".next",
    // NOTE: do not add outputFileTracingExcludes for data//plugins//desktop
    // here — its glob matching is unanchored, so "data/**" (even as
    // "./data/**") also strips next/dist/lib/metadata/** from the standalone
    // server and breaks it at startup. Tracing may pull those mutable dev
    // dirs into .next/standalone on dev machines; the desktop assemble script
    // (desktop/scripts/assemble-app.mjs) skips them when bundling instead.
    webpack: (config) => {
        // @sparkjsdev/spark (Gaussian-splat renderer) references its WASM module
        // via `new URL(...)`. Webpack's URL asset parser mis-resolves it and
        // breaks the build, so disable that parsing — Spark resolves the module
        // itself at runtime. (Official fix from sparkjsdev/spark-react-nextjs.)
        config.module.parser = {
            ...config.module.parser,
            javascript: {
                ...config.module.parser?.javascript,
                url: false,
            },
        };
        return config;
    },
};

export default withNextIntl(nextConfig);
