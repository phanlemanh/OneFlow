import Workspace from "@/components/workspace/workspace";
import { seedExampleAsset } from "@/lib/onboarding/seed-example-asset.server";

export const metadata = {
    title: "Workspace - OneFlow",
    description: "Visual workflow editor",
};

export default async function WorkspacePage() {
    // The bundled example's input clip ships in `public/`, but fileKeys
    // resolve against the uploads root — so it has to be copied in before
    // anything asks for it. Seeded here rather than from a boot hook because
    // `src/instrumentation.ts` is a cloud-shell extension point the shell
    // links its own file into at build time (see .gitignore); a seed placed
    // there would be silently replaced in that build.
    //
    // This is the first surface that can reach the clip, it runs server-side,
    // and the seed is a no-op after the first call (EEXIST), so paying for it
    // per render is cheaper than the coordination any earlier hook needs.
    await seedExampleAsset();

    return <Workspace />;
}
