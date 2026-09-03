"use client";

import { LogIn, RotateCw, ShieldAlert, WifiOff } from "lucide-react";
import { StoreUnreadableNotice } from "@/components/settings/store-unreadable-notice";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Prototype for `khong-noi-sai-ve-kho-khoa` — the two NEW read states of the
 * key-store notice: `unauthenticated` (session gone) and `unavailable` (server
 * unreachable / timed out). Both get a Retry and NO destructive control; the
 * destructive control stays on `store-unreadable`, which is rendered here too
 * as the baseline the reviewer compares against.
 *
 * Context rung: `static-frame`, same as the parent prototype — the real
 * settings dialog fetches on open and has no seam to inject a state through.
 *
 * Material: `scaffold`. The shipped `StoreUnreadableNotice` is used AS-IS for
 * the baseline and for direction A. Direction B needs a tone the component
 * does not have yet (a non-destructive register), so that variant is composed
 * from the same primitives and the same tokens — the shape of a `tone` prop
 * this session proposes as a Nhóm-2 finding, not a hand-copied card that
 * would ship.
 *
 * The decision this prototype exists to get made is on the `divergence`
 * scene: should transient states share the destructive red of "store
 * corrupt"? The recommendation is pinned there, on the artifact.
 *
 * Fixtures only. No fetch, no key read, no write path.
 */

export const KNSK_PROTO_STATES = [
    "settings-store-unreadable",
    "settings-unauthenticated",
    "settings-unavailable",
    "panel-unauthenticated",
    "panel-unavailable",
    "divergence",
] as const;

const COPY = {
    settingsTitle: "Cài đặt — khoá API",
    panelTitle: "Bước này cần một khoá API",
    unchanged: "Chưa có gì bị thay đổi.",
    retry: "Thử lại",
    save: "Lưu",
    escape: "Thay kho khoá bằng kho trống…",
    toSettings: "Mở màn Cài đặt",
    unreadable: {
        title: "Không đọc được kho khoá đã lưu",
        reason: "Tệp settings.json đọc được nhưng nội dung không phải một map khoá → giá trị (mã: shape).",
    },
    unauthenticated: {
        title: "Phiên đăng nhập đã hết",
        reason: "Máy chủ từ chối lượt đọc vì phiên không còn hiệu lực (401). Kho khoá của bạn không bị đụng tới.",
    },
    unavailable: {
        title: "Không tới được máy chủ khoá",
        reason: "Yêu cầu không được trả lời trong 30 giây (mã: timeout). Kho khoá của bạn không bị đụng tới.",
    },
    divergenceTitle:
        "Hai hướng cho trạng thái tạm thời — cùng một ca «không tới được»",
    dirA: "Hướng A — một sắc",
    dirAMotive: "Một component, không đổi DS. Mọi sự cố đọc đều đỏ.",
    dirATrade:
        "Đỏ nói «hỏng / nguy hiểm» cho một lượt hết giờ 30 s — mắt đọc ngược lại với điều chữ nói.",
    dirB: "Hướng B — hai giọng (máy khuyên)",
    dirBMotive:
        "Đỏ chỉ dành cho state có hành động phá huỷ. Tạm thời = giọng trung tính + Thử lại.",
    dirBTrade:
        "Component cần thêm prop `tone`; tương phản giọng mới phải đo lại ở dark.",
    pinned: "Máy khuyên B: sắc màu phải mang cùng taxonomy mà chữ đang mang.",
    unknownState: "Prototype không có trạng thái này:",
};

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
            className="min-h-screen bg-background p-6 text-foreground"
        >
            <div className="mx-auto max-w-lg space-y-4">
                <h1 className="text-lg font-semibold">{title}</h1>
                {children}
            </div>
        </div>
    );
}

function RetryButton() {
    return (
        <Button type="button" variant="outline" size="sm">
            <RotateCw aria-hidden="true" className="h-4 w-4" />
            {COPY.retry}
        </Button>
    );
}

/**
 * Direction B — the non-destructive register. Same structure as
 * `StoreUnreadableNotice` (section/role=alert, header, reason, reassurance,
 * action slot) on the repo's neutral surface tokens. This is what a `tone`
 * prop on the shipped component would render; it is NOT a second component
 * to ship.
 */
function QuietNotice({
    icon: Icon,
    title,
    reason,
    children,
}: {
    icon: typeof WifiOff;
    title: string;
    reason: string;
    children?: React.ReactNode;
}) {
    return (
        <section
            role="alert"
            className="space-y-2 rounded-md border border-border bg-muted/40 p-4"
        >
            <header className="flex items-center gap-2">
                <Icon
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                />
                <h2 className="text-sm font-medium text-foreground">{title}</h2>
            </header>
            <p className="text-xs text-foreground">{reason}</p>
            <p className="text-sm font-medium text-foreground">
                {COPY.unchanged}
            </p>
            {children ? <div className="pt-1">{children}</div> : null}
        </section>
    );
}

function SettingsChrome({ blocked }: { blocked: boolean }) {
    return (
        <div className="space-y-3 rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                    OPENAI_API_KEY
                </span>
                <span className="text-xs text-muted-foreground">
                    {blocked ? "—" : "sk-…4f2a"}
                </span>
            </div>
            <div className="flex justify-end">
                <Button type="button" size="sm" disabled={blocked}>
                    {COPY.save}
                </Button>
            </div>
        </div>
    );
}

export function KhongNoiSaiVeKhoKhoaProto({ state }: { state: string }) {
    switch (state) {
        case "settings-store-unreadable":
            return (
                <Frame state={state} title={COPY.settingsTitle}>
                    <StoreUnreadableNotice
                        reason={COPY.unreadable.reason}
                        labels={{
                            title: COPY.unreadable.title,
                            unchanged: COPY.unchanged,
                        }}
                    >
                        <div className="flex flex-wrap gap-2">
                            <RetryButton />
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                            >
                                {COPY.escape}
                            </Button>
                        </div>
                    </StoreUnreadableNotice>
                    <SettingsChrome blocked />
                </Frame>
            );
        case "settings-unauthenticated":
            return (
                <Frame state={state} title={COPY.settingsTitle}>
                    <QuietNotice
                        icon={LogIn}
                        title={COPY.unauthenticated.title}
                        reason={COPY.unauthenticated.reason}
                    >
                        <RetryButton />
                    </QuietNotice>
                    <SettingsChrome blocked />
                </Frame>
            );
        case "settings-unavailable":
            return (
                <Frame state={state} title={COPY.settingsTitle}>
                    <QuietNotice
                        icon={WifiOff}
                        title={COPY.unavailable.title}
                        reason={COPY.unavailable.reason}
                    >
                        <RetryButton />
                    </QuietNotice>
                    <SettingsChrome blocked />
                </Frame>
            );
        case "panel-unauthenticated":
            return (
                <Frame state={state} title={COPY.panelTitle}>
                    <QuietNotice
                        icon={LogIn}
                        title={COPY.unauthenticated.title}
                        reason={COPY.unauthenticated.reason}
                    >
                        <RetryButton />
                    </QuietNotice>
                </Frame>
            );
        case "panel-unavailable":
            return (
                <Frame state={state} title={COPY.panelTitle}>
                    <QuietNotice
                        icon={WifiOff}
                        title={COPY.unavailable.title}
                        reason={COPY.unavailable.reason}
                    >
                        <div className="flex flex-wrap gap-2">
                            <RetryButton />
                            <Button type="button" variant="ghost" size="sm">
                                {COPY.toSettings}
                            </Button>
                        </div>
                    </QuietNotice>
                </Frame>
            );
        case "divergence":
            return (
                <Frame state={state} title={COPY.divergenceTitle}>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <h2 className="text-sm font-semibold">
                                {COPY.dirA}
                            </h2>
                            <StoreUnreadableNotice
                                reason={COPY.unavailable.reason}
                                labels={{
                                    title: COPY.unavailable.title,
                                    unchanged: COPY.unchanged,
                                }}
                            >
                                <RetryButton />
                            </StoreUnreadableNotice>
                            <p className="text-xs text-foreground">
                                {COPY.dirAMotive}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {COPY.dirATrade}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-sm font-semibold">
                                {COPY.dirB}
                            </h2>
                            <QuietNotice
                                icon={WifiOff}
                                title={COPY.unavailable.title}
                                reason={COPY.unavailable.reason}
                            >
                                <RetryButton />
                            </QuietNotice>
                            <p className="text-xs text-foreground">
                                {COPY.dirBMotive}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {COPY.dirBTrade}
                            </p>
                        </div>
                    </div>
                    <p
                        className={cn(
                            "rounded-md border border-border bg-card p-3 text-sm font-medium",
                        )}
                    >
                        <ShieldAlert
                            aria-hidden="true"
                            className="mr-2 inline h-4 w-4 text-destructive"
                        />
                        {COPY.pinned}
                    </p>
                </Frame>
            );
        default:
            return (
                <Frame state={`unknown:${state}`} title={COPY.settingsTitle}>
                    <p className="text-sm">
                        {COPY.unknownState} <code>{state}</code>
                    </p>
                </Frame>
            );
    }
}
