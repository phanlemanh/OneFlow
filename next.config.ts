import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
    output: "standalone",
    // `next build` run WHILE a dev server is live deletes the chunk files that
    // server is still serving from. The dev server keeps its in-memory module
    // graph pointing at paths that no longer exist, so page renders die with
    // "Could not find the module ... in the React Client Manifest" and
    // "__webpack_modules__[moduleId] is not a function". An acceptance round
    // does exactly this: the verify suite has `pnpm build` in its suite keys, so
    // it runs every round, with a dev server up for the UI checks.
    //
    // Measured three ways rather than assumed, because the obvious wider story
    // ("the two layouts can't share a directory at all") is FALSE and would have
    // justified the same fix for the wrong reason:
    //   build while dev runs   -> page 500, chunk 404 on disk    (breaks)
    //   build first, dev after -> 200 everywhere                 (fine)
    //   dev on its own distDir -> 200 through a full build       (fine)
    // Two refinements worth keeping: the collision needs CONCURRENCY, not merely
    // a shared directory; and only PAGES break — route handlers keep compiling
    // and answering, which is why a round can lose every UI check while its API
    // evals still pass and look like proof the tree was healthy.
    //
    // So the dev server can be handed its own directory. Point it at `build`,
    // which .gitignore and biome.json already exclude — no new ignore entry, no
    // config loosened. Unset (the default, and what CI and the desktop build
    // use) nothing changes.
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
