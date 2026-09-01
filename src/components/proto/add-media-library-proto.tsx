"use client";

import { Library } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaCardList } from "@/components/workspace/nodes/add/media-card-list";
import { MediaLibraryConfigPanel } from "@/components/workspace/nodes/add/media-library-config-panel";
import { failureMessageKey } from "@/components/workspace/nodes/add/media-library-outcome";
import type { MediaCard } from "@/lib/media-library/types";

/**
 * Prototype for the `add-media-library` node.
 *
 * Context rung: `static-frame` — the real card list and the real config panel
 * render inside a STATIC mock of the node chrome. One rung below
 * `host-embedded` on purpose: the shipped node lives inside React Flow, whose
 * stores are implementation this harness is meant to precede. The frame is
 * enough for the question this surface must answer — can someone tell where
 * they are and whether they are moving — while the two components that carry
 * the compliance-bearing copy stay real.
 *
 * Fixtures only. No fetch, no key read, no write path.
 */

const COPY = {
    title: "Nạp từ kho",
    searchPlaceholder: "Mô tả cảnh bạn cần, ví dụ: phòng khách ngập nắng",
    search: "Tìm",
    searching: "Đang tìm…",
    importing:
        "Đang nạp clip về kho file của bạn… Xong sẽ hiện thành node video trên canvas.",
    thinShelf:
        "Không clip nào dựng được thẻ cho mô tả này (kho có 37 clip qua bộ lọc). Thử mô tả khác hoặc nới yêu cầu.",
    unranked:
        "Kết quả chưa xếp hạng theo ngữ nghĩa: kho đang thiếu embedding. Danh sách vẫn đúng bộ lọc, thứ tự không phản ánh độ hợp.",
    missingConfig:
        "Chưa gọi được media-library: thiếu MEDIA_LIBRARY_URL và MEDIA_LIBRARY_API_KEY.",
    error: "Khoá media-library không được chấp nhận. Kiểm tra MEDIA_LIBRARY_API_KEY.",
    imported:
        "Đã nạp xong. Clip nằm trong kho file của bạn — từ giờ nó không còn phụ thuộc vào kho ngoài hay URL ký nào nữa.",
    importedNodeTitle: "Node video mới trên canvas",
    importedFileKey: "file_key: aH8xK2m9qP.mp4",
    unknownState: "Prototype không có trạng thái này:",
};

const CONFIG_LABELS = {
    urlLabel: "https://kho.vidu.com",
    keyLabel: "Khoá có scope search",
    save: "Lưu rồi tìm lại",
    saving: "Đang lưu…",
    readFailed: "Không đọc được kho khoá đang lưu nên chưa đổi gì — thử lại.",
    writeFailed: "Không lưu được khoá. Chưa có gì thay đổi.",
    storeUnreadableTitle: "Không đọc được kho khoá đã lưu",
    storeUnreadableUnchanged: "Chưa có gì bị thay đổi.",
    storeUnreadableReason: (detail: string) =>
        `Máy chủ không trả về được danh sách khoá đang lưu (${detail}).`,
    toSettings: "Mở màn Cài đặt",
};

const THUMB =
    "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20width%3D'160'%20height%3D'90'%3E%3Crect%20width%3D'160'%20height%3D'90'%20fill%3D'%23d8d4e8'%2F%3E%3C%2Fsvg%3E";

const card = (id: string, caption: string, license?: string): MediaCard => ({
    id,
    card_version: 1,
    tier: "project",
    media_type: "video",
    provenance: "real",
    license_label: license,
    entity: null,
    subjects: [],
    times_used: {},
    caption,
    renditions: { proxy_url: THUMB, thumb_url: THUMB },
});

const CARDS: MediaCard[] = [
    card("a", "Ban công hướng ra hồ, nắng chiều", "CC-BY"),
    card("b", "Sảnh chờ, máy lia chậm"),
    card("c", "Toàn cảnh từ flycam lúc hoàng hôn", "Phối cảnh 3D"),
];

/**
 * `data-proto-state` is how a scanner can tell WHICH state a page actually drew.
 *
 * The a11y guard used to count URLs it could reach and pages axe returned, both
 * of which stay at sixteen when a state name is misspelled or deleted: the
 * switch below falls through to a default frame, the URL still answers 200, and
 * the report still says 16/16 while sixteen visits landed on the same screen.
 * Stamping the resolved state on the root lets the guard assert sixteen
 * DISTINCT states instead of sixteen successful fetches.
 */
function Frame({
    state,
    children,
}: {
    state: string;
    children: React.ReactNode;
}) {
    return (
        <div
            data-proto-state={state}
            className="min-h-screen bg-background p-8"
        >
            <div className="mx-auto w-[460px] rounded-xl border border-border bg-card shadow-sm">
                <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                    <Library className="h-5 w-5 text-muted-foreground" />
                    {/*
                     * A heading, not a span: this page IS the node, so the node
                     * title is its level-one heading. In the shipped canvas the
                     * surrounding page owns the h1; the harness has to supply
                     * its own or every scanned page reports a missing one.
                     */}
                    <h1 className="text-sm font-medium text-foreground">
                        {COPY.title}
                    </h1>
                    <span className="ml-auto font-mono text-xs text-muted-foreground">
                        add/media-library
                    </span>
                </div>
                <div className="space-y-3 p-4">{children}</div>
            </div>
        </div>
    );
}

function SearchRow({ busy = false }: { busy?: boolean }) {
    return (
        <div className="flex gap-2">
            <label className="sr-only" htmlFor="proto-intent">
                {COPY.searchPlaceholder}
            </label>
            <Input
                id="proto-intent"
                placeholder={COPY.searchPlaceholder}
                readOnly
            />
            <Button size="sm" disabled={busy}>
                {busy ? COPY.searching : COPY.search}
            </Button>
        </div>
    );
}

function FailureFrame({ state, code }: { state: string; code: string }) {
    const t = useTranslations("Workspace.nodes.addMediaLibrary");
    return (
        <Frame state={state}>
            <SearchRow />
            <p className="text-sm text-destructive">
                {t(failureMessageKey(code))}
            </p>
        </Frame>
    );
}

export function AddMediaLibraryProto({ state }: { state: string }) {
    switch (state) {
        case "missing-config":
            return (
                <Frame state="missing-config">
                    <SearchRow />
                    <MediaLibraryConfigPanel
                        missing={["MEDIA_LIBRARY_URL", "MEDIA_LIBRARY_API_KEY"]}
                        message={COPY.missingConfig}
                        labels={CONFIG_LABELS}
                        onSaved={() => {}}
                    />
                </Frame>
            );
        case "searching":
            return (
                <Frame state="searching">
                    <SearchRow busy />
                    <p className="text-sm text-muted-foreground">
                        {COPY.searching} Có thể mất vài giây.
                    </p>
                </Frame>
            );
        case "results":
            return (
                <Frame state="results">
                    <SearchRow />
                    <p className="text-sm text-muted-foreground">
                        {CARDS.length} clip khớp mô tả. Chọn một clip để nạp về
                        workspace.
                    </p>
                    <MediaCardList cards={CARDS} onPick={() => {}} />
                </Frame>
            );
        case "thin-shelf":
            return (
                <Frame state="thin-shelf">
                    <SearchRow />
                    <p className="text-sm text-muted-foreground">
                        {COPY.thinShelf}
                    </p>
                </Frame>
            );
        case "unranked":
            return (
                <Frame state="unranked">
                    <SearchRow />
                    <p className="rounded-md border border-amber-500/60 bg-amber-50 px-2 py-1 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
                        {COPY.unranked}
                    </p>
                    <MediaCardList cards={CARDS} onPick={() => {}} />
                </Frame>
            );
        case "importing":
            return (
                <Frame state="importing">
                    <SearchRow />
                    <MediaCardList cards={CARDS} onPick={() => {}} busyId="a" />
                    <p className="text-sm text-muted-foreground">
                        {COPY.importing}
                    </p>
                </Frame>
            );
        /**
         * The failure frames resolve their sentence the way the node does —
         * `failureMessageKey(code)` then `t()` — instead of printing a constant
         * typed into this file.
         *
         * A hand-written constant made the AC-13 frame prove nothing: it showed
         * the AUTH_REJECTED sentence under the name "error", so the version
         * mismatch path was never rendered, and the capture stayed green even if
         * VERSION_MISMATCH had no translation at all or could never reach the
         * screen. Same defect the previous round fixed for E16, still standing
         * here.
         */
        case "error":
            return <FailureFrame state="error" code="AUTH_REJECTED" />;
        case "version-mismatch":
            return (
                <FailureFrame
                    state="version-mismatch"
                    code="VERSION_MISMATCH"
                />
            );
        /**
         * The stage AC-9 promises and this prototype did not have.
         *
         * `state=results` was standing in for "done", and it is the screen from
         * BEFORE the import — the same three library thumbnails, nothing about
         * the store. So the one transition the criterion is about ("it is in
         * your workspace now") could not be seen anywhere, and a judge asked to
         * check it had only the pre-import list to look at.
         */
        case "imported":
            return (
                <Frame state="imported">
                    <SearchRow />
                    <p className="rounded-md border border-emerald-600/60 bg-emerald-50 px-2 py-1 text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
                        {COPY.imported}
                    </p>
                    <div className="rounded-lg border border-border bg-muted/40 p-3">
                        <p className="text-xs font-medium text-foreground">
                            {COPY.importedNodeTitle}
                        </p>
                        <p className="mt-1 font-mono text-xs text-muted-foreground">
                            {COPY.importedFileKey}
                        </p>
                    </div>
                </Frame>
            );
        case "":
        case "idle":
            return (
                <Frame state="idle">
                    <SearchRow />
                    <p className="text-sm text-muted-foreground">
                        {COPY.searchPlaceholder}
                    </p>
                </Frame>
            );
        /**
         * NOT idle. An unrecognised state used to fall through to the idle
         * frame, which is why renaming or deleting a case left every scanner
         * green: the URL answered 200, axe scanned a real page, and the report
         * counted it. Naming the miss makes a typo visible instead of silently
         * scanning idle sixteen times.
         */
        default:
            return (
                <Frame state={`unknown:${state}`}>
                    <SearchRow />
                    <p className="text-sm text-destructive">
                        {COPY.unknownState} <code>{state}</code>
                    </p>
                </Frame>
            );
    }
}
