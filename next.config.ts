import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
    output: "standalone",
    // `next build` and `next dev` share `.next` and write incompatible layouts
    // into it. Harmless in normal use — you rarely run both at once — but an
    // acceptance round does exactly that: the verify suite runs `pnpm build`
    // while a dev server is up for the UI checks, which replaces the chunks the
    // running server is serving and turns every route into a 500 ("Cannot find
    // module './6471.js'"). Measured on two consecutive rounds.
    //
    // So the dev server can be handed its own directory. Unset — the default,
    // and what CI and the desktop build use — nothing changes.
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
