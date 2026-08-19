import { notFound } from "next/navigation";
import { AddMediaLibraryProto } from "@/components/proto/add-media-library-proto";
import { ByoKeyOnboardingProto } from "@/components/proto/byo-key-onboarding-proto";

/**
 * Clickable prototype route — the object a `design-pass` session works on.
 *
 * Gate 1 approves UI on something you can press, not on prose. This route
 * exists so that is possible before the feature's logic is built: it renders
 * REAL feature components fed by fixtures, so what the reviewer judges is the
 * shipping component's own markup and tokens, and the port cost afterwards is
 * zero.
 *
 * Development only. A prototype reachable in production would be a surface
 * nobody owns, so the route 404s outside development rather than relying on it
 * simply not being linked.
 */
export const dynamic = "force-dynamic";

const PROTOS: Record<string, (state: string) => React.ReactNode> = {
    "byo-key-onboarding": (state) => <ByoKeyOnboardingProto state={state} />,
    "add-media-library": (state) => <AddMediaLibraryProto state={state} />,
};

// Dark mode is class-based (`@custom-variant dark (&:is(.dark *))`), so the
// capture matrix can reach it by wrapping rather than by toggling a preference
// the repo's capture command cannot set.

export default async function ProtoPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ state?: string; theme?: string }>;
}) {
    if (process.env.NODE_ENV === "production") notFound();

    const { slug } = await params;
    const { state, theme } = await searchParams;
    const render = PROTOS[slug];
    if (!render) notFound();

    const body = render(state ?? "");
    return theme === "dark" ? <div className="dark">{body}</div> : body;
}
