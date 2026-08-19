"use client";

import { Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaCardList } from "@/components/workspace/nodes/add/media-card-list";
import { MediaLibraryConfigPanel } from "@/components/workspace/nodes/add/media-library-config-panel";
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
};

const CONFIG_LABELS = {
    urlLabel: "https://kho.vidu.com",
    keyLabel: "Khoá có scope search",
    save: "Lưu rồi tìm lại",
    saving: "Đang lưu…",
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

function Frame({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background p-8">
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

export function AddMediaLibraryProto({ state }: { state: string }) {
    switch (state) {
        case "missing-config":
            return (
                <Frame>
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
                <Frame>
                    <SearchRow busy />
                    <p className="text-sm text-muted-foreground">
                        {COPY.searching} Có thể mất vài giây.
                    </p>
                </Frame>
            );
        case "results":
            return (
                <Frame>
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
                <Frame>
                    <SearchRow />
                    <p className="text-sm text-muted-foreground">
                        {COPY.thinShelf}
                    </p>
                </Frame>
            );
        case "unranked":
            return (
                <Frame>
                    <SearchRow />
                    <p className="rounded-md border border-amber-500/60 bg-amber-50 px-2 py-1 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
                        {COPY.unranked}
                    </p>
                    <MediaCardList cards={CARDS} onPick={() => {}} />
                </Frame>
            );
        case "importing":
            return (
                <Frame>
                    <SearchRow />
                    <MediaCardList cards={CARDS} onPick={() => {}} busyId="a" />
                    <p className="text-sm text-muted-foreground">
                        {COPY.importing}
                    </p>
                </Frame>
            );
        case "error":
            return (
                <Frame>
                    <SearchRow />
                    <p className="text-sm text-destructive">{COPY.error}</p>
                </Frame>
            );
        default:
            return (
                <Frame>
                    <SearchRow />
                    <p className="text-sm text-muted-foreground">
                        {COPY.searchPlaceholder}
                    </p>
                </Frame>
            );
    }
}
