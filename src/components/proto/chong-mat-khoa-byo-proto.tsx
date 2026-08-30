"use client";

import { KeyRound, TriangleAlert } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Prototype for `chong-mat-khoa-byo` — the states a key store shows when it
 * cannot be read.
 *
 * Context rung: `static-frame`. The settings surface is a Dialog whose real
 * component fetches `/api/settings/env` on open and exposes no seam for
 * injected state; giving it one is implementation, which belongs to S3, not to
 * the pass that must run BEFORE Gate 1. So the chrome is a static mock and the
 * panels inside it are composed from the same primitives the shipped screen
 * uses (`ui/button`, `ui/input`, `ui/alert-dialog`) with the repo's own
 * tokens — no new component, no new hex, no webfont.
 *
 * Fixtures only. No fetch, no key read, and deliberately no write path: the
 * whole point of the feature is that one write path must stop firing.
 */

const COPY = {
    settingsTitle: "Cài đặt",
    settingsSection: "Khoá nhà cung cấp",
    unreadableTitle: "Không đọc được kho khoá đã lưu",
    // Two sentences, in this order on purpose. The reassurance comes first
    // because the fear a user arrives with is "did I just lose them?", and the
    // answer is no — nothing has been touched yet.
    unreadableBody:
        "Chưa có gì bị thay đổi. Các khoá đang lưu vẫn nằm nguyên trên máy, nhưng ứng dụng không giải được nội dung của tệp nên chưa hiện ra được.",
    unreadableReasonLabel: "Lý do kỹ thuật",
    unreadableReason: "settings.json — không giải mã được nội dung (decode)",
    save: "Lưu",
    escape: "Bỏ kho cũ và nhập lại",
    confirmTitle: "Bỏ toàn bộ kho khoá đang lưu?",
    // The contract refuses a bare "are you sure?" — decision 4 removed the
    // backup, so this sentence is the entire guard rail and it has to name the
    // price out loud.
    confirmBody:
        "Mọi khoá đang lưu sẽ mất và không khôi phục được. Sau khi bỏ, bạn phải nhập lại từng khoá của từng nhà cung cấp.",
    confirmCancel: "Huỷ",
    confirmOk: "Bỏ và nhập lại",
    panelHint: "Mở Cài đặt để xử lý",
    panelError:
        "Không đọc được kho khoá đang lưu nên chưa thể lưu thêm khoá nào.",
    mediaPanelTitle: "Nạp từ kho — cấu hình",
    abiPanelTitle: "Khoá nhà cung cấp",
    panelsFrameTitle: "Bảng cấu hình ngay trên node",
    unknownState: "Prototype không có trạng thái này:",
};

/**
 * `data-proto-state` on the root: a scanner can then assert it drew N DISTINCT
 * states rather than N successful fetches. A misspelt state name otherwise
 * falls through to a default frame that still answers 200.
 */
function Frame({
    state,
    title,
    children,
}: {
    state: string;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div
            data-proto-state={state}
            className="min-h-screen bg-background p-8"
        >
            <div className="mx-auto w-[520px] rounded-xl border border-border bg-card shadow-sm">
                <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                    <KeyRound
                        className="h-5 w-5 text-muted-foreground"
                        aria-hidden="true"
                    />
                    {/*
                     * The shipped dialog sits inside a page that owns the h1;
                     * a bare harness page has to supply its own or every
                     * scanned frame reports a missing heading.
                     */}
                    <h1 className="text-sm font-medium text-foreground">
                        {title}
                    </h1>
                </div>
                <div className="space-y-4 p-4">{children}</div>
            </div>
        </div>
    );
}

/**
 * The panel that REPLACES the key form — it does not sit on top of it. A form
 * left rendered underneath is a form the user can still type into, and typing
 * into it is the first half of the data loss this feature exists to stop.
 */
function UnreadablePanel() {
    return (
        <div
            role="alert"
            className="rounded-lg border border-destructive/40 bg-destructive/5 p-4"
        >
            <div className="flex gap-3">
                <TriangleAlert
                    className="mt-0.5 h-5 w-5 shrink-0 text-destructive"
                    aria-hidden="true"
                />
                <div className="space-y-2">
                    <h2 className="text-sm font-medium text-foreground">
                        {COPY.unreadableTitle}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {COPY.unreadableBody}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        <span className="font-medium">
                            {COPY.unreadableReasonLabel}:{" "}
                        </span>
                        <span className="font-mono">
                            {COPY.unreadableReason}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}

/**
 * Save stays MOUNTED and disabled rather than disappearing: a control that
 * vanishes reads as "I clicked the wrong place", while a dimmed one reads as
 * "not right now" — and the contract asks for the second.
 */
function SettingsActions() {
    return (
        <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
            <Button type="button" disabled>
                {COPY.save}
            </Button>
            <Button type="button" variant="destructive">
                {COPY.escape}
            </Button>
        </div>
    );
}

function SettingsUnreadable({ confirming }: { confirming: boolean }) {
    return (
        <Frame
            state={confirming ? "store-unreadable-confirm" : "store-unreadable"}
            title={COPY.settingsTitle}
        >
            <h2 className="sr-only">{COPY.settingsSection}</h2>
            <UnreadablePanel />
            <SettingsActions />
            {confirming ? (
                <AlertDialog open>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {COPY.confirmTitle}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {COPY.confirmBody}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>
                                {COPY.confirmCancel}
                            </AlertDialogCancel>
                            {/*
                             * buttonVariants, not hand-written colour classes:
                             * AlertDialogAction applies buttonVariants() with
                             * the DEFAULT variant, and the repo's destructive
                             * variant carries two dark-mode branches plus a
                             * focus ring that a copied class string silently
                             * drops — which is exactly what the dark-theme
                             * accessibility floor measures.
                             */}
                            <AlertDialogAction
                                className={buttonVariants({
                                    variant: "destructive",
                                })}
                            >
                                {COPY.confirmOk}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            ) : null}
        </Frame>
    );
}

/**
 * Both node panels refuse, and NEITHER carries an escape button — that button
 * belongs to the settings screen alone (owner decision 3). A destructive action
 * in an inline node panel is a destructive action offered where the user has
 * the least context to understand what it costs.
 */
function NodePanel({ title, slot }: { title: string; slot: React.ReactNode }) {
    return (
        <section className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-medium text-foreground">
                {title}
            </h2>
            <div className="space-y-3 opacity-60">{slot}</div>
            <p
                role="alert"
                className="mt-3 flex flex-wrap items-center gap-1 text-sm text-destructive"
            >
                <TriangleAlert className="h-4 w-4" aria-hidden="true" />
                {COPY.panelError}{" "}
                <a
                    href="#settings"
                    className="font-medium underline underline-offset-2"
                >
                    {COPY.panelHint}
                </a>
            </p>
            <div className="mt-3">
                <Button type="button" size="sm" disabled>
                    {COPY.save}
                </Button>
            </div>
        </section>
    );
}

function PanelsUnreadable() {
    return (
        <Frame state="panel-unreadable" title={COPY.panelsFrameTitle}>
            <NodePanel
                title={COPY.mediaPanelTitle}
                slot={
                    <>
                        <label
                            className="block text-xs text-muted-foreground"
                            htmlFor="proto-aml-url"
                        >
                            MEDIA_LIBRARY_URL
                        </label>
                        <Input id="proto-aml-url" disabled defaultValue="" />
                        <label
                            className="block text-xs text-muted-foreground"
                            htmlFor="proto-aml-key"
                        >
                            MEDIA_LIBRARY_API_KEY
                        </label>
                        <Input id="proto-aml-key" disabled defaultValue="" />
                    </>
                }
            />
            <NodePanel
                title={COPY.abiPanelTitle}
                slot={
                    <>
                        <label
                            className="block text-xs text-muted-foreground"
                            htmlFor="proto-abi-key"
                        >
                            ELEVENLABS_API_KEY
                        </label>
                        <Input id="proto-abi-key" disabled defaultValue="" />
                    </>
                }
            />
        </Frame>
    );
}

export function ChongMatKhoaByoProto({ state }: { state: string }) {
    switch (state) {
        case "store-unreadable":
            return <SettingsUnreadable confirming={false} />;
        case "store-unreadable-confirm":
            return <SettingsUnreadable confirming />;
        case "panel-unreadable":
            return <PanelsUnreadable />;
        default:
            return (
                <Frame state={`unknown:${state}`} title={COPY.settingsTitle}>
                    <p className="text-sm text-muted-foreground">
                        {COPY.unknownState} <code>{state || "(trống)"}</code>
                    </p>
                </Frame>
            );
    }
}
