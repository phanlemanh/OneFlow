"use client";

import { KeyRound, ShieldAlert, WifiOff } from "lucide-react";
import { StoreUnreadableNotice } from "@/components/settings/store-unreadable-notice";
import { Button } from "@/components/ui/button";
import type { EnvReadFailure } from "@/lib/settings/env-client";
import {
    readFailureText,
    unavailableReasonText,
} from "@/lib/settings/read-failure-text";

/**
 * ONE place turns a read state into a card.
 *
 * The mechanism this dossier exists to close is three surfaces each writing
 * their own key-store error handling and each getting it wrong differently.
 * Giving every surface its own state-to-tone-to-copy mapping would rebuild
 * that mechanism one layer up: three tables, drifting apart on the next state
 * anyone adds. So the table lives here, once, and the surfaces supply only
 * what is genuinely theirs — their i18n namespace, their retry, and whatever
 * extra way out they alone can offer.
 *
 * The retry button lives INSIDE this component on purpose. "Every non-ok cell
 * offers a way to try again" is then true by construction; as a rule applied
 * by three callers it would be true by discipline, which is the weaker claim
 * and the one that already failed here once.
 */

type Translator = (
    key: string,
    values?: Record<string, string | number>,
) => string;

/**
 * State -> presentation. Each row is a claim about what happened, and the tone
 * is part of the claim: red says the user's stored data is at risk, and only
 * the first row is entitled to say that.
 */
const SHAPE = {
    "store-unreadable": {
        group: "storeUnreadable",
        tone: "destructive",
        icon: ShieldAlert,
        testId: "store-unreadable-notice",
    },
    unauthenticated: {
        group: "unauthenticated",
        tone: "quiet",
        icon: KeyRound,
        testId: "unauthenticated-notice",
    },
    unavailable: {
        group: "unavailable",
        tone: "quiet",
        icon: WifiOff,
        testId: "unavailable-notice",
    },
} as const;

export function ReadStateNotice({
    read,
    t,
    onRetry,
    retrying = false,
    headingLevel,
    className,
    children,
}: {
    read: EnvReadFailure;
    /**
     * Scoped to the SURFACE's namespace (`Settings` or `Workspace`), not to
     * one state's group. Both namespaces carry all three groups, and scoping
     * here is what lets one component serve surfaces that translate the same
     * situation with different words.
     */
    t: Translator;
    onRetry?: () => void;
    /** Retry is in flight. Disables the button so one click stays one read. */
    retrying?: boolean;
    headingLevel?: 2 | 3;
    className?: string;
    /**
     * The surface's own extra way out. Only the settings screen can replace a
     * broken store, and only the canvas surfaces need a link to settings; both
     * belong to the caller, not to this table.
     */
    children?: React.ReactNode;
}) {
    const shape = SHAPE[read.state];
    const key = (name: string) => `${shape.group}.${name}`;
    // Scoped down to the group so the shared `cause.*` renderer resolves.
    const groupT: Translator = (name, values) => t(key(name), values);

    let reason: string | null = null;
    if (read.state === "store-unreadable") {
        reason = t(key("reason"), {
            reason: readFailureText(groupT, read.reason),
        });
    } else if (read.state === "unavailable") {
        // `cause.*` lives under storeUnreadable in both namespaces; the CAUSE
        // reads the same whichever claim sits above it.
        reason = t(key("reason"), {
            code: unavailableReasonText(
                (name, values) => t(`storeUnreadable.${name}`, values),
                read.reason,
            ),
        });
    }

    return (
        <StoreUnreadableNotice
            tone={shape.tone}
            icon={shape.icon}
            testId={shape.testId}
            headingLevel={headingLevel}
            className={className}
            reason={reason}
            labels={{
                title: t(key("title")),
                unchanged: t(key("unchanged")),
            }}
        >
            {onRetry ? (
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={retrying}
                    onClick={onRetry}
                >
                    {t(key("retry"))}
                </Button>
            ) : null}
            {children}
        </StoreUnreadableNotice>
    );
}
