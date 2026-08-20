import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
    output: "standalone",
    // `next build` and `next dev` write incompatible layouts into the SAME
    // directory, so a build that runs while a dev server is serving pulls the
    // chunks out from under it and every route starts returning 500. That is
    // not hypothetical here: `pnpm build && pnpm typecheck` sits in
    // `feature_loop.suite_keys`, so it runs on every verify round — alongside
    // the ui-check evals, which need a live dev server. Measured on both lanes
    // of the N=2 pilot: it killed 9 ui-check runs before anyone found it.
    // Default is unchanged, so CI and the desktop assemble script see `.next`
    // exactly as before; a capture run opts out with NEXT_DIST_DIR=.next-dev.
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
