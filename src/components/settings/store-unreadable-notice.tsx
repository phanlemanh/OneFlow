"use client";

import type { LucideIcon } from "lucide-react";
import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The one card every surface shows when the key store cannot be read.
 *
 * Three surfaces need this sentence — the settings dialog, the media-library
 * config panel, and the key box inside `abi-node-shell`. Each of them already
 * rolled its own error handling once, and all three got it wrong in a different
 * way; rendering the message three more times is the same mechanism that
 * produced the bug. So the card is one component and the WORDS come in as
 * props, because each surface reads them from its own i18n namespace.
 *
 * Presentational only. It never fetches and never writes — a component that
 * could write would be a fourth road to the failure it exists to describe.
 */

export type NoticeTone = "destructive" | "quiet";

const TONE = {
    destructive: {
        frame: "border-destructive/50 bg-destructive/5",
        icon: "text-destructive",
    },
    /**
     * A transient failure is not a broken store. Red says "danger, something is
     * wrong with your data"; a 30-second timeout and an expired session are
     * neither. Colour has to carry the same taxonomy the words carry — this
     * dossier's invariant applied to the visual channel.
     */
    quiet: {
        frame: "border-border bg-muted/40",
        icon: "text-muted-foreground",
    },
} as const;

export interface StoreUnreadableLabels {
    /** Headline, e.g. "Không đọc được kho khoá đã lưu". */
    title: string;
    /**
     * The promise that makes this card safe to show: nothing was touched.
     * Load-bearing copy — the criterion names this sentence, because without it
     * the card reads as "something broke" and the user's next move is to retype
     * their keys, which is the data-loss path.
     */
    unchanged: string;
}

export function StoreUnreadableNotice({
    reason,
    labels,
    tone = "destructive",
    icon: Icon = ShieldAlert,
    testId = "store-unreadable-notice",
    headingLevel = 2,
    className,
    children,
}: {
    /**
     * Machine-derived cause, already turned into a sentence by the caller.
     *
     * `null` renders NO line rather than an empty one. An expired session has
     * no cause worth a second sentence, and an empty paragraph inside a
     * `role="alert"` is a node a screen reader walks into and finds nothing in.
     */
    reason: string | null;
    labels: StoreUnreadableLabels;
    /**
     * How loud the card is. Defaults to `destructive` so the caller that
     * already exists keeps its exact appearance; the two read states added by
     * this dossier pass `quiet`.
     */
    tone?: NoticeTone;
    /** The glyph beside the headline. Never decides the tone — the tone does. */
    icon?: LucideIcon;
    /**
     * Distinguishes the four cards a surface may render. Defaults to the value
     * the previous dossier's evals already pin, so those keep passing.
     */
    testId?: string;
    /**
     * Where this card sits in the page outline.
     *
     * Both current callers leave it at 2: the settings screen shows the card
     * directly under the screen title, and the node surfaces render no heading
     * of their own (measured 2026-09-01 across base-node-shell, abi-node-shell,
     * add-media-library-node, media-library-config-panel and node-key-prompt —
     * zero headings between them), so there the card is also the first heading
     * under the page. The prop stays because a future caller may sit deeper,
     * but a value of 3 has to be earned by a real h2 above it.
     *
     * Not cosmetic. Hardcoded to h3, the settings screen rendered h1 -> h3 and
     * skipped a level — measured on the running prototype, both settings
     * states. Heading order is how a screen-reader user builds a map of the
     * page; a skip tells them a section is missing.
     */
    headingLevel?: 2 | 3;
    className?: string;
    /**
     * The way out, supplied by the surface. The settings dialog passes its one
     * escape button; the node panels pass a link to settings and NOTHING else.
     * Keeping the action outside this component is why "the panels have no
     * escape button" is true by construction rather than by discipline.
     */
    children?: React.ReactNode;
}) {
    const Heading = headingLevel === 3 ? "h3" : "h2";
    return (
        <section
            role="alert"
            /*
             * The identity stamp. Three shipping surfaces and the prototype all
             * have to render THIS component, not their own hand-copy of it —
             * otherwise the a11y floor measured on the prototype says nothing
             * about the settings screen, which is the surface the floor exists
             * to protect. Each surface's eval asserts exactly one of these, so
             * a hand-copied card fails by absence rather than by review.
             */
            data-testid={testId}
            /*
             * One marker for prototype and shipping surfaces alike. The a11y
             * floor is measured on the prototype; without a shared marker that
             * measurement proves nothing about the real screens.
             */
            data-proto-component="store-unreadable-notice"
            className={cn(
                "space-y-2 rounded-md border p-4",
                TONE[tone].frame,
                className,
            )}
        >
            <header className="flex items-center gap-2">
                <Icon
                    aria-hidden="true"
                    className={cn("h-4 w-4 shrink-0", TONE[tone].icon)}
                />
                <Heading className="text-sm font-medium text-foreground">
                    {labels.title}
                </Heading>
            </header>
            {/*
             * `text-foreground`, not `text-muted-foreground`. Measured by axe
             * in real Chrome on 2026-09-01: muted (#737373) on this card's
             * `bg-destructive/5` tint (#fef2f3) at 12px is 4.33:1 — under the
             * 4.5:1 floor, a SERIOUS violation, and only in the light theme.
             * The muted token is calibrated against `background`/`card`, not
             * against a tinted surface.
             *
             * So hierarchy is carried by SIZE and WEIGHT instead of by colour:
             * the reassurance below is the load-bearing sentence and is the
             * larger, heavier one. Nothing here invents a hex.
             */}
            {reason === null ? null : (
                <p className="text-xs text-foreground">{reason}</p>
            )}
            <p className="text-sm font-medium text-foreground">
                {labels.unchanged}
            </p>
            {children ? <div className="pt-1">{children}</div> : null}
        </section>
    );
}
