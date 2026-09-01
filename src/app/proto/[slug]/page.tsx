import { notFound } from "next/navigation";
import { AddMediaLibraryProto } from "@/components/proto/add-media-library-proto";
import { ByoKeyOnboardingProto } from "@/components/proto/byo-key-onboarding-proto";
import { ChongMatKhoaByoGiaoDienProto } from "@/components/proto/chong-mat-khoa-byo-giao-dien-proto";
import { NormalizeTextViProto } from "@/components/proto/normalize-text-vi-proto";

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
    "normalize-text-vi": (state) => <NormalizeTextViProto state={state} />,
    "chong-mat-khoa-byo-giao-dien": (state) => (
        <ChongMatKhoaByoGiaoDienProto state={state} />
    ),
};

// Dark mode is class-based (`@custom-variant dark (&:is(.dark *))`), so the
// capture matrix can reach it by wrapping rather than by toggling a preference
// the repo's capture command cannot set.
//
// The wrapper alone is not enough, and the gap was measured (2026-09-01).
// `layout.tsx` ships a boot script that adds `.dark` to <html> when
// localStorage has no theme AND the OS prefers dark. A headless Chrome has no
// localStorage, so on a machine set to dark EVERY proto page renders dark —
// including the half a capture matrix or an a11y sweep calls "light". The
// served HTML still differs between the two URLs, so a guard that reads
// `class="dark"` back out of `curl` output sees two distinct themes and passes
// while the browser drew the same one twice.
//
// So an EXPLICIT `theme` pins the root class, overriding that guess. Absent
// `theme` is left alone: three older prototypes and their guards predate this
// and are not this route's to re-measure.
const THEME_PIN = `
  (function() {
    try {
      var t = new URLSearchParams(location.search).get('theme');
      if (t === 'dark') document.documentElement.classList.add('dark');
      else if (t === 'light') document.documentElement.classList.remove('dark');
    } catch (e) {}
  })();
`;

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
    const pinned = (
        <>
            {/* biome-ignore lint/security/noDangerouslySetInnerHtml: pins the
                theme before paint; a component effect would run after the boot
                script and flash the wrong theme into the capture. */}
            <script dangerouslySetInnerHTML={{ __html: THEME_PIN }} />
            {body}
        </>
    );
    return theme === "dark" ? <div className="dark">{pinned}</div> : pinned;
}
