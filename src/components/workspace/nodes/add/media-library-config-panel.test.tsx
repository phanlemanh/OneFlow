// @vitest-environment jsdom
/**
 * The inline config panel, when the key store cannot be read.
 *
 * Two halves, and the second is the one that would rot quietly: this panel must
 * refuse to save, AND it must not grow a way to discard the store. That button
 * belongs to the settings screen alone — offering it here puts an irreversible
 * action in the surface with the least context around it.
 */

import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MediaLibraryConfigPanel } from "./media-library-config-panel";

type Call = { url: string; method: string };
let calls: Call[] = [];

const LABELS = {
    urlLabel: "https://kho.example",
    keyLabel: "Khoá",
    save: "Lưu",
    saving: "Đang lưu…",
    readFailed: "Không đọc được kho khoá đang lưu nên chưa đổi gì — thử lại.",
    storeUnreadable:
        "Không đọc được kho khoá đang lưu nên chưa thể lưu thêm khoá nào.",
    writeFailed: "Không lưu được khoá. Chưa có gì thay đổi.",
};

function stubFetch(status: number) {
    calls = [];
    globalThis.fetch = vi.fn(
        async (input: RequestInfo | URL, init?: RequestInit) => {
            calls.push({
                url: String(input),
                method: (init?.method ?? "GET").toUpperCase(),
            });
            return new Response(
                JSON.stringify(status === 503 ? {} : { env: {} }),
                {
                    status,
                    headers: { "content-type": "application/json" },
                },
            );
        },
    ) as typeof fetch;
}

const mount = () =>
    render(
        <MediaLibraryConfigPanel
            missing={["MEDIA_LIBRARY_URL"]}
            message="thiếu cấu hình"
            labels={LABELS}
            onSaved={() => {}}
        />,
    );

beforeEach(() => {
    calls = [];
});
afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe("media-library config panel: unreadable store", () => {
    it("sends no PUT at all", async () => {
        stubFetch(503);
        mount();
        fireEvent.change(screen.getByPlaceholderText(LABELS.urlLabel), {
            target: { value: "https://lib.example" },
        });
        fireEvent.click(screen.getByRole("button", { name: LABELS.save }));

        await waitFor(() =>
            expect(screen.getByText(LABELS.storeUnreadable)).toBeTruthy(),
        );
        // The read happened; the write must not have. An empty map is a valid
        // object, so the panel's own shape guard could never catch this — only
        // the status can.
        expect(calls.filter((c) => c.method === "PUT")).toHaveLength(0);
    });

    it("offers no way to drop the store", async () => {
        stubFetch(503);
        mount();
        fireEvent.click(screen.getByRole("button", { name: LABELS.save }));
        await waitFor(() =>
            expect(screen.getByText(LABELS.storeUnreadable)).toBeTruthy(),
        );
        expect(
            screen.queryAllByRole("button", {
                name: /bỏ kho cũ|nhập lại|discard/i,
            }),
        ).toHaveLength(0);
    });

    it("still saves when the store is healthy", async () => {
        // Positive control: a panel that always refuses passes both cases
        // above and is useless.
        stubFetch(200);
        mount();
        fireEvent.change(screen.getByPlaceholderText(LABELS.urlLabel), {
            target: { value: "https://lib.example" },
        });
        fireEvent.click(screen.getByRole("button", { name: LABELS.save }));

        await waitFor(() =>
            expect(calls.filter((c) => c.method === "PUT")).toHaveLength(1),
        );
    });
});
