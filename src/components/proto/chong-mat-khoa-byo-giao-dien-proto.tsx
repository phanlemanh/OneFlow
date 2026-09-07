"use client";

import { KeyRound, Settings } from "lucide-react";
import { StoreUnreadableNotice } from "@/components/settings/store-unreadable-notice";
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
import { cn } from "@/lib/utils";

/**
 * Prototype for `chong-mat-khoa-byo-giao-dien` — the UI half of the BYO-key
 * loss guard.
 *
 * Context rung: `static-frame`. The real settings screen is a `Dialog` that
 * calls `/api/settings/env` when it opens and has no seam to inject a state
 * through; opening that seam IS the implementation, which belongs to S3, not to
 * the session that runs BEFORE gate one. So the chrome is a static model while
 * the piece carrying the compliance-bearing copy — `StoreUnreadableNotice` —
 * and every primitive around it (`ui/button`, `ui/alert-dialog`) are the real
 * ones the shipped screen uses, on the repo's own tokens.
 *
 * Improved over the parent dossier's prototype on one measured point: its
 * confirm step was a second card BELOW the screen, so a reviewer could not see
 * that the dialog covers the settings screen. Here the real `AlertDialog` is
 * held open, so the overlay relationship is the one that ships.
 *
 * Fixtures only. No fetch, no key read, no write path.
 */

const COPY = {
    settingsTitle: "Cài đặt — khoá API",
    nodeFrameTitle: "Bảng cấu hình ngay trên node",
    noticeTitle: "Không đọc được kho khoá đã lưu",
    unchanged: "Chưa có gì bị thay đổi.",
    reasonSettings:
        "Tệp settings.json đọc được nhưng nội dung không phải một map khoá → giá trị (mã: shape).",
    reasonPanel:
        "Máy chủ không trả về được danh sách khoá đang lưu (mã: shape).",
    save: "Lưu",
    escape: "Thay kho khoá bằng kho trống…",
    toSettings: "Mở màn Cài đặt",
    confirmTitle: "Thay kho khoá bằng kho trống?",
    confirmBody:
        "Mọi khoá đang lưu sẽ mất và không khôi phục được. Sau bước này bạn phải nhập lại từng khoá.",
    confirmCancel: "Để nguyên",
    confirmOk: "Tôi hiểu — thay kho",
    panelMediaTitle: "Nạp từ kho — cấu hình",
    panelAbiTitle: "Bước này cần một khoá API",
    unknownState: "Prototype không có trạng thái này:",
};

/**
 * `data-proto-state` is how a scanner can tell WHICH state a page actually drew.
 *
 * Counting URLs built and pages axe returned leaves both numbers at their
 * target when a state name is misspelled: the switch falls through, the URL
 * answers 200, and the report prints "6/6" for six visits to the same screen.
 * Stamping the RESOLVED state here lets the guard assert six distinct states
 * instead of six successful fetches — and an unrecognised name renders
 * `unknown:<name>` rather than quietly looking like the first case.
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
                    <Settings
                        aria-hidden="true"
                        className="h-5 w-5 text-muted-foreground"
                    />
                    {/*
                     * A heading, not a span: this page IS the screen, so its
                     * title is the level-one heading. In the shipped app the
                     * surrounding page owns the h1; the harness has to supply
                     * its own or every scanned page reports a missing one.
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

const NOTICE_LABELS = {
    title: COPY.noticeTitle,
    unchanged: COPY.unchanged,
};

/**
 * The settings screen in its blocked state.
 *
 * Save is present and disabled rather than hidden. Hiding it teaches nobody
 * that saving is what got blocked, and it moves every control below it between
 * renders — so the keyboard focus ring lands somewhere different depending on
 * a failure the user cannot see.
 */
function BlockedSettings() {
    return (
        <>
            <StoreUnreadableNotice
                reason={COPY.reasonSettings}
                labels={NOTICE_LABELS}
            >
                <Button variant="outline" size="sm">
                    {COPY.escape}
                </Button>
            </StoreUnreadableNotice>
            <div className="flex justify-end border-t border-border pt-3">
                <Button size="sm" disabled>
                    {COPY.save}
                </Button>
            </div>
        </>
    );
}

/** One node panel: refuses, points at settings, offers no way out of its own. */
function BlockedPanel({
    id,
    title,
    icon,
}: {
    id: string;
    title: string;
    icon: React.ReactNode;
}) {
    /*
     * `aria-labelledby` rather than a bare section: this state draws TWO panels
     * whose only control reads "Mở màn Cài đặt" in both. Measured on the running
     * prototype — two buttons, one accessible name, no way for a screen-reader
     * user moving control to control to tell which panel they are answering.
     * Naming the region restores the context sighted users get from proximity.
     */
    return (
        <section
            aria-labelledby={id}
            className="space-y-2 rounded-lg border border-dashed border-muted-foreground/40 p-3"
        >
            <header className="flex items-center gap-2">
                {icon}
                {/*
                 * A label, NOT a heading. The shipped node shells render no
                 * heading at all, so an h2 here would give the prototype an
                 * outline the product does not have — and the a11y sweep only
                 * ever scans the prototype. Measuring a structure nobody ships
                 * is the shape of error this whole dossier is about.
                 */}
                <span id={id} className="text-sm font-medium text-foreground">
                    {title}
                </span>
            </header>
            <StoreUnreadableNotice
                reason={COPY.reasonPanel}
                labels={NOTICE_LABELS}
            >
                {/*
                 * A link to settings, and nothing else. The destructive write
                 * lives only in the settings dialog, so these panels cannot
                 * offer an escape button even by accident — the function that
                 * builds that request is not in their reach.
                 */}
                <Button variant="outline" size="sm">
                    {COPY.toSettings}
                </Button>
            </StoreUnreadableNotice>
        </section>
    );
}

export function ChongMatKhoaByoGiaoDienProto({ state }: { state: string }) {
    switch (state) {
        case "store-unreadable":
            return (
                <Frame state={state} title={COPY.settingsTitle}>
                    <BlockedSettings />
                </Frame>
            );

        case "store-unreadable-confirm":
            return (
                <Frame state={state} title={COPY.settingsTitle}>
                    <BlockedSettings />
                    {/*
                     * The real AlertDialog, held open. Radix portals it to the
                     * body, so it covers the frame exactly as it will cover the
                     * settings dialog — the relationship the parent dossier's
                     * static card could not show.
                     */}
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
                                 * The repo's own destructive variant, not a
                                 * hand-copied class list. The hand-copied one
                                 * in the parent dossier's first draft dropped
                                 * both dark-mode branches and the focus ring —
                                 * exactly what the dark-theme a11y floor reads.
                                 */}
                                <AlertDialogAction
                                    className={cn(
                                        buttonVariants({
                                            variant: "destructive",
                                        }),
                                    )}
                                >
                                    {COPY.confirmOk}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </Frame>
            );

        case "panel-unreadable":
            return (
                <Frame state={state} title={COPY.nodeFrameTitle}>
                    <BlockedPanel
                        id="proto-panel-media"
                        title={COPY.panelMediaTitle}
                        icon={
                            <Settings
                                aria-hidden="true"
                                className="h-4 w-4 text-muted-foreground"
                            />
                        }
                    />
                    <BlockedPanel
                        id="proto-panel-abi"
                        title={COPY.panelAbiTitle}
                        icon={
                            <KeyRound
                                aria-hidden="true"
                                className="h-4 w-4 text-amber-600"
                            />
                        }
                    />
                </Frame>
            );

        /**
         * NOT the first case. An unrecognised state falling through to a real
         * frame is why renaming or deleting a case leaves every scanner green.
         * Naming the miss makes a typo visible instead of silently scanning the
         * same screen six times.
         */
        default:
            return (
                <Frame state={`unknown:${state}`} title={COPY.settingsTitle}>
                    <p className="text-sm text-destructive">
                        {COPY.unknownState} <code>{state}</code>
                    </p>
                </Frame>
            );
    }
}
