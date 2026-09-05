"use client";

import Link from "next/link";
import {
    type FirstRunState,
    FirstRunStrip,
    type FirstRunStripLabels,
} from "@/components/workspace/first-run-strip";
import {
    type KeyPromptState,
    NodeKeyPrompt,
    type NodeKeyPromptLabels,
} from "@/components/workspace/node-key-prompt";

/**
 * Prototype for the `byo-key-onboarding` design-pass session.
 *
 * Context rung: `static-frame` — the real feature components render inside a
 * STATIC mock of the workspace chrome. That is deliberately one rung below
 * `host-embedded`: the real canvas needs React Flow plus its stores, which is
 * implementation work this ritual is supposed to happen before. The frame is
 * enough to answer the question the session exists for — can an observer tell
 * where the user is — while keeping the strip and the key prompt themselves
 * real, so nothing drifts on the way to implementation.
 *
 * Fixtures only. No data fetching, no install call, no write path.
 */

const STRIP_LABELS: FirstRunStripLabels = {
    missingTitle: (count, mb) =>
        `Cần tải ${count} công cụ xử lý video (~${mb} MB) để chạy ví dụ này`,
    missingBody: (capabilities) => capabilities.join(" · "),
    prepare: "Tải công cụ",
    installing: (done, total) => `Đang tải công cụ… (${done}/${total})`,
    milestone: {
        "creating-venv": "Tạo môi trường",
        "installing-sdk": "Cài SDK",
        "installing-requirements": "Cài thư viện",
    },
    // No duration promise here: ledger d-20260807T051228Z-4616 bought the real
    // milestone stream at the cost of a T3 escalation precisely so this line
    // reports elapsed fact instead of pre-announcing "a few minutes".
    elapsed: (sec) => `Đã ${sec}s. Những lần sau chạy ngay.`,
    ready: "Xong. Bấm Run trên node đầu tiên để chạy thử.",
    blocked: "Chưa chuẩn bị được",
    retry: "Thử lại",
};

const KEY_LABELS: NodeKeyPromptLabels = {
    needsKey: "Node này cần một khoá API",
    describe: (providerName) =>
        `Node này gọi tới ${providerName}. Dán khoá của chính bạn để chạy.`,
    placeholder: "Dán khoá của bạn",
    save: "Lưu và kiểm tra",
    verifying: "Đang kiểm tra khoá…",
    invalid: "Khoá không dùng được",
    verified: "Khoá hoạt động",
    savedUnverified: "Đã lưu khoá — chưa kiểm tra được",
};

// Capability labels, not plugin ids: this is what the strip shows a seller who
// has never heard of ffmpeg. Implementation resolves ABI slot -> i18n label.
const CAPABILITIES = ["Tách cảnh video", "Cắt ghép video"];

const STRIP_STATES: Record<string, FirstRunState> = {
    missing: {
        phase: "missing-plugins",
        capabilities: CAPABILITIES,
        downloadMb: 48,
    },
    installing: {
        phase: "installing",
        capabilities: CAPABILITIES,
        installed: 1,
    },
    provisioning: {
        phase: "provisioning",
        milestone: "installing-sdk",
        elapsedSec: 74,
    },
    ready: { phase: "ready" },
    blocked: {
        phase: "blocked",
        reason: "Không tải được công cụ về máy — kiểm tra kết nối mạng.",
        retryable: true,
    },
};

const KEY_STATES: Record<string, KeyPromptState> = {
    "needs-key": { phase: "needs-key" },
    "key-verifying": { phase: "verifying" },
    "key-invalid": {
        phase: "invalid",
        reason: "nhà cung cấp từ chối khoá này (hết hạn hoặc sai project)",
    },
    "key-verified": { phase: "verified" },
};

const ALL_STATES = [
    ...Object.keys(STRIP_STATES),
    "result",
    ...Object.keys(KEY_STATES),
];

/**
 * `data-proto-state` is how a scanner can tell WHICH state a page actually drew.
 *
 * The a11y guard for this prototype used to assert nothing beyond the scan
 * exiting 0: it built twenty URLs and read neither the state nor the theme back
 * off any of them. A misspelled or deleted state still answers 200 and still
 * gets scanned, so twenty visits to the same screen read as full coverage.
 * Stamping the resolved state on the root lets the guard assert twenty DISTINCT
 * (state, theme) pairs instead of twenty successful fetches. An unrecognised
 * state reports itself as `unknown:<name>` rather than quietly looking like the
 * default frame.
 */
export function ByoKeyOnboardingProto({ state }: { state: string }) {
    const strip = STRIP_STATES[state];
    const key = KEY_STATES[state];
    const showResult = state === "result";
    const known = Boolean(strip) || Boolean(key) || showResult;

    return (
        <div
            data-proto-state={known ? state : `unknown:${state}`}
            className="min-h-screen bg-gray-50 dark:bg-gray-900"
        >
            <h1 className="sr-only">
                Bản dựng onboarding — byo-key-onboarding
            </h1>
            <StateSwitcher current={state} />

            {/* Static mock of the workspace chrome — the frame, not the host. */}
            <div className="mx-auto max-w-6xl px-4 pb-16">
                <div className="mb-3 flex items-center justify-between rounded-lg border bg-card px-4 py-2 text-sm text-card-foreground shadow-sm">
                    <span className="font-medium">Ví dụ: Tách cảnh video</span>
                    <span className="text-muted-foreground">
                        Plugin · Cài đặt · Chạy
                    </span>
                </div>

                {strip ? (
                    <div className="mb-4 flex justify-center">
                        <FirstRunStrip state={strip} labels={STRIP_LABELS} />
                    </div>
                ) : null}

                <div className="relative min-h-[420px] rounded-lg border border-dashed bg-[radial-gradient(circle,rgb(203_213_225)_1px,transparent_1px)] [background-size:16px_16px] p-6 dark:border-gray-700 dark:bg-none dark:bg-gray-900">
                    <div className="flex flex-wrap gap-6">
                        <MockNode title="Video mẫu" subtitle="đầu vào">
                            <div className="flex h-24 items-center justify-center rounded bg-muted text-xs text-foreground">
                                sample.mp4
                            </div>
                        </MockNode>

                        <MockNode
                            title="Tách cảnh"
                            subtitle={
                                showResult ? "xong — 3 đoạn" : "chưa chạy"
                            }
                        >
                            {showResult ? (
                                <div className="grid grid-cols-3 gap-1">
                                    {["01", "02", "03"].map((n) => (
                                        <div
                                            key={n}
                                            className="flex h-16 items-center justify-center rounded bg-emerald-100 text-xs text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                                        >
                                            đoạn {n}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex h-24 items-center justify-center rounded bg-muted text-xs text-foreground">
                                    chưa chạy
                                </div>
                            )}
                        </MockNode>

                        {key ? (
                            <MockNode
                                title="Sinh ảnh"
                                subtitle="cần khoá OpenAI"
                            >
                                <NodeKeyPrompt
                                    envKey="OPENAI_API_KEY"
                                    providerName="OpenAI"
                                    state={key}
                                    labels={KEY_LABELS}
                                    value={
                                        key.phase === "needs-key"
                                            ? ""
                                            : "sk-proto-fixture"
                                    }
                                />
                            </MockNode>
                        ) : null}
                    </div>

                    {!known ? (
                        <p className="text-sm text-muted-foreground">
                            Chọn một trạng thái ở trên.
                        </p>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

function MockNode({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle: string;
    children: React.ReactNode;
}) {
    return (
        <div className="w-[280px] rounded-lg bg-card p-4 text-card-foreground shadow-sm">
            <div className="mb-2">
                <p className="text-sm font-medium">{title}</p>
                <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
            {children}
        </div>
    );
}

function StateSwitcher({ current }: { current: string }) {
    return (
        <nav className="mb-4 flex flex-wrap gap-1 border-b bg-card px-4 py-2 text-xs text-card-foreground">
            {ALL_STATES.map((s) => (
                <Link
                    key={s}
                    href={`/proto/byo-key-onboarding?state=${s}`}
                    className={
                        s === current
                            ? "rounded bg-gray-900 px-2 py-1 text-white dark:bg-white dark:text-gray-900"
                            : "rounded px-2 py-1 text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-700"
                    }
                >
                    {s}
                </Link>
            ))}
        </nav>
    );
}
