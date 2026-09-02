"use client";

import { Handle, type NodeProps, Position, useNodeId } from "@xyflow/react";
import { Library } from "lucide-react";
import { useTranslations } from "next-intl";
import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useFlow from "@/hooks/use-flow";
import { logger } from "@/lib/logger";
import type { MediaCard } from "@/lib/media-library/types";
import type { ReadFailure } from "@/lib/settings/env-client";
import { readFailureText } from "@/lib/settings/read-failure-text";
import { BaseNodeShell } from "../base/base-node-shell";
import { MediaCardList } from "./media-card-list";
import { MediaLibraryConfigPanel } from "./media-library-config-panel";
import {
    codeForStatus,
    failureMessageKey,
    isUnranked,
    type Outcome,
    outcomeMessageKey,
} from "./media-library-outcome";

/**
 * Stage A of ADR-0012: search the shared library, pick one clip, and pull its
 * bytes into OneFlow's own file store.
 *
 * Deliberately tab-less. The exporter treats an add node with `activeTab ===
 * undefined` as a pure data node; introducing a tab name here would mean
 * editing that allow-list too, for no gain — this node does one thing.
 */
/**
 * Read a failing response WITHOUT trusting it to be JSON.
 *
 * The old shape called `response.json()` first, inside a try whose only handler
 * said "could not reach the library" — so a Next.js HTML error page (which is
 * what a server-side throw produces) was reported as a network problem with the
 * remote service. The status is the part that always exists; the body is a bonus.
 */
/**
 * Read a SUCCESSFUL search response without trusting its shape.
 *
 * `readFailure` closed this gap on the failing branch and the 2xx branch kept
 * both halves of it. First, `await response.json()` sat inside a try whose only
 * catch said "could not reach the library", so a 200 whose body will not parse —
 * a dev-server or proxy interposing — was reported as a network problem with the
 * remote service. Second, `body.cards as MediaCard[]` was an unchecked cast:
 * `NextResponse.json` drops `undefined` keys, so a 200 carrying a valid
 * `contracts_version` but no `cards` produced `cards: undefined`, and the very
 * next render evaluated `outcome.cards.length` and threw inside React — taking
 * the node down rather than showing the BAD_RESPONSE state the taxonomy already
 * defines for exactly this.
 *
 * This is the narrow fix at the consumer. Validating the payload once at the
 * boundary in `client.server.ts` is the better shape and is a confirmed
 * out-of-contract finding; it goes to Gate 2 rather than being widened here.
 */
async function readResults(response: Response): Promise<Outcome> {
    let body: unknown;
    try {
        body = await response.json();
    } catch {
        return {
            kind: "failure",
            code: "BAD_RESPONSE",
            message: "",
        };
    }
    const record = (body ?? {}) as Record<string, unknown>;
    if (!Array.isArray(record.cards)) {
        return { kind: "failure", code: "BAD_RESPONSE", message: "" };
    }
    return {
        kind: "results",
        cards: record.cards as MediaCard[],
        candidates: Number(record.candidates ?? 0),
        warnings: Array.isArray(record.warnings)
            ? (record.warnings as string[])
            : [],
    };
}

/**
 * The import SUCCESS body, read as defensively as `readResults` reads the
 * search one. Exported because the node cannot be driven from a unit test, and
 * an unexercised branch is how both halves below shipped unnoticed (S4 round 7):
 *
 *   · a 200 whose body will not parse (a dev-server or proxy HTML page) used to
 *     reject into the caller's outer catch and come back NETWORK_ERROR — telling
 *     the user to check MEDIA_LIBRARY_URL over a fault that has nothing to do
 *     with the remote service;
 *   · an absent `fileKey` became the literal string "undefined" via String(),
 *     so the canvas gained a videoNode pointing at nothing while the node
 *     reported plain success. Every downstream consumer then failed far from
 *     the cause.
 *
 * Returns the file key on success, or null when the body cannot back one.
 */
export async function readImportedFileKey(
    response: Response,
): Promise<string | null> {
    let body: unknown;
    try {
        body = await response.json();
    } catch {
        return null;
    }
    const fileKey = (body as Record<string, unknown> | null)?.fileKey;
    return typeof fileKey === "string" && fileKey ? fileKey : null;
}

async function readFailure(
    response: Response,
): Promise<{ code: string; message: string; missing: string[] }> {
    const fallback = codeForStatus(response.status);
    try {
        const body = await response.json();
        return {
            code: typeof body.code === "string" ? body.code : fallback,
            message: typeof body.message === "string" ? body.message : "",
            missing: Array.isArray(body.missing)
                ? (body.missing as string[])
                : [],
        };
    } catch {
        return { code: fallback, message: "", missing: [] };
    }
}

const AddMediaLibraryNode = ({ selected, data }: NodeProps) => {
    const t = useTranslations("Workspace.nodes.addMediaLibrary");
    const tStore = useTranslations("Workspace.storeUnreadable");
    const id = useNodeId();
    const expands = useFlow((s) => s.expands);

    const [intent, setIntent] = useState("");
    const [outcome, setOutcome] = useState<Outcome>({ kind: "idle" });

    const search = async () => {
        const query = intent.trim();
        if (!query) return;
        setOutcome({ kind: "searching" });
        try {
            const response = await fetch("/api/media-library/search", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ intent: query }),
            });
            if (!response.ok) {
                const failure = await readFailure(response);
                setOutcome(
                    failure.code === "MISSING_CONFIG"
                        ? {
                              kind: "missing-config",
                              // The server sends the names as DATA; the node
                              // renders one field per name and never parses
                              // them back out of the sentence.
                              missing: failure.missing,
                              message: failure.message,
                          }
                        : {
                              kind: "failure",
                              code: failure.code,
                              message: failure.message,
                          },
                );
                return;
            }
            const results = await readResults(response);
            setOutcome(results);
        } catch (error) {
            logger.error("[media-library] search failed:", error);
            setOutcome({
                kind: "failure",
                code: "NETWORK_ERROR",
                message: t("error"),
            });
        }
    };

    const pick = async (card: MediaCard) => {
        // Keep the result set on screen while the import runs; the chosen card
        // is disabled rather than the whole list disappearing.
        const from = outcome.kind === "results" ? outcome : null;
        setOutcome({
            kind: "importing",
            cardId: card.id,
            cards: from?.cards ?? [card],
            candidates: from?.candidates ?? 0,
            warnings: from?.warnings ?? [],
        });
        try {
            const response = await fetch("/api/media-library/import", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ assetId: card.id }),
            });
            if (!response.ok) {
                const failure = await readFailure(response);
                setOutcome({
                    kind: "failure",
                    code: failure.code,
                    message: failure.message,
                });
                return;
            }
            const fileKey = await readImportedFileKey(response);
            if (fileKey === null) {
                setOutcome({
                    kind: "failure",
                    code: "BAD_RESPONSE",
                    message: t("error"),
                });
                return;
            }
            if (id) {
                // Same shape every add node uses: the asset becomes a modality
                // node downstream, this node keeps nothing.
                expands(id, [
                    { type: "videoNode", data: { fileKeys: [fileKey] } },
                ]);
            }
            setOutcome({ kind: "idle" });
        } catch (error) {
            logger.error("[media-library] import failed:", error);
            setOutcome({
                kind: "failure",
                code: "NETWORK_ERROR",
                message: t("error"),
            });
        }
    };

    const messageKey = outcomeMessageKey(outcome);

    return (
        <BaseNodeShell
            selected={selected}
            className="min-w-[460px]"
            data={data}
            title={t("title")}
            icon={<Library className="h-5 w-5" />}
            isInputNode
            showPluginSelect={false}
        >
            <Handle
                type="source"
                position={Position.Right}
                id="out:videoNode"
                isConnectableStart={false}
            />
            <div className="p-4 space-y-3">
                <div className="flex gap-2 nodrag">
                    <Input
                        value={intent}
                        placeholder={t("searchPlaceholder")}
                        onChange={(e) => setIntent(e.target.value)}
                        onPointerDown={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") void search();
                        }}
                    />
                    <Button
                        size="sm"
                        onClick={() => void search()}
                        disabled={outcome.kind === "searching"}
                    >
                        {outcome.kind === "searching"
                            ? t("searching")
                            : t("search")}
                    </Button>
                </div>

                {outcome.kind === "missing-config" ? (
                    <MediaLibraryConfigPanel
                        missing={outcome.missing}
                        // The viewer's own language, not the server's sentence.
                        // The server's `message` is Vietnamese and stays a log
                        // artefact — the same rule the `failure` branch already
                        // follows via failureMessageKey(). This branch passed it
                        // through, so an en/ja/ko/zh user met Vietnamese in the
                        // FIRST state they ever see, while the translated key
                        // sat unused in all five message files (S4 round 7).
                        // The variable NAMES stay data and are rendered from
                        // `missing`, so nothing about "name it exactly" is lost.
                        message={t("missingConfig")}
                        labels={{
                            urlLabel: t("urlLabel"),
                            keyLabel: t("keyLabel"),
                            save: t("saveConfig"),
                            saving: t("savingConfig"),
                            writeFailed: t("writeFailed"),
                            storeUnreadableTitle: tStore("title"),
                            storeUnreadableUnchanged: tStore("unchanged"),
                            storeUnreadableReason: (cause: ReadFailure) =>
                                tStore("reason", {
                                    reason: readFailureText(tStore, cause),
                                }),
                            toSettings: tStore("toSettings"),
                        }}
                        onSaved={() => void search()}
                    />
                ) : null}

                {isUnranked(outcome) ? (
                    <p
                        data-testid="unranked-banner"
                        className="text-xs rounded-md border border-amber-500/60 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 text-amber-900 dark:text-amber-100"
                    >
                        {t("unranked")}
                    </p>
                ) : null}

                {(outcome.kind === "results" || outcome.kind === "importing") &&
                outcome.cards.length > 0 ? (
                    <>
                        <p className="text-sm text-muted-foreground">
                            {t("results", { count: outcome.cards.length })}
                        </p>
                        <MediaCardList
                            cards={outcome.cards}
                            onPick={(card) => void pick(card)}
                            busyId={
                                outcome.kind === "importing"
                                    ? outcome.cardId
                                    : undefined
                            }
                        />
                    </>
                ) : null}

                {outcome.kind === "importing" ? (
                    <p className="text-sm text-muted-foreground">
                        {t("importing")}
                    </p>
                ) : null}

                {messageKey === "thinShelf" ? (
                    <p className="text-sm text-muted-foreground">
                        {t("thinShelf", {
                            candidates:
                                outcome.kind === "results"
                                    ? outcome.candidates
                                    : 0,
                        })}
                    </p>
                ) : null}

                {outcome.kind === "failure" ? (
                    <p className="text-sm text-destructive">
                        {/*
                         * The translated sentence, keyed off the machine-readable
                         * code. The server's own message is Vietnamese and stays
                         * where it belongs — the server log — instead of landing
                         * in front of an en/ja/ko/zh user.
                         */}
                        {t(failureMessageKey(outcome.code))}
                    </p>
                ) : null}
            </div>
        </BaseNodeShell>
    );
};

AddMediaLibraryNode.displayName = "AddMediaLibraryNode";

export default memo(AddMediaLibraryNode);
