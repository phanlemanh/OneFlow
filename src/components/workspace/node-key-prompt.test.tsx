// @vitest-environment jsdom
/**
 * What the node key field SHOWS when the key store cannot be read.
 *
 * Round 1 of this feature stopped the write and called it done: the save path
 * threw a typed error, no PUT went out, and the test asserted exactly that. The
 * user meanwhile saw "Khoá chưa dùng được — ENV_STORE_UNREADABLE" — the field
 * asserting their key was rejected when no provider had been asked, with a raw
 * machine code as copy. Measuring the throw is not measuring the screen, so
 * this file measures the screen.
 */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { type KeyPromptState, NodeKeyPrompt } from "./node-key-prompt";

const LABELS = {
    needsKey: "Bước này cần một khoá API",
    describe: (p: string) => `Nhập khoá của ${p}.`,
    placeholder: "Dán khoá vào đây",
    save: "Lưu và kiểm tra",
    verifying: "Đang kiểm tra khoá…",
    invalid: "Khoá chưa dùng được",
    verified: "Khoá đã dùng được",
    savedUnverified: "Đã lưu khoá — chưa kiểm tra được",
    storeUnreadable:
        "Không đọc được kho khoá đang lưu nên chưa thể lưu thêm khoá nào.",
    openSettings: "Mở Cài đặt để xử lý",
};

const mount = (state: KeyPromptState) =>
    render(
        <NodeKeyPrompt
            envKey="OPENAI_API_KEY"
            providerName="OpenAI"
            state={state}
            labels={LABELS}
        />,
    );

afterEach(cleanup);

describe("node key prompt: unreadable store", () => {
    it("does not claim the key is invalid, and points at Settings", () => {
        mount({ phase: "store-unreadable" });

        expect(screen.getByText(/không đọc được kho khoá/i)).toBeTruthy();
        expect(screen.getByText(/mở cài đặt/i)).toBeTruthy();

        // The two things round 1 got wrong, pinned:
        expect(screen.queryByText(new RegExp(LABELS.invalid, "i"))).toBeNull();
        expect(screen.queryByText(/ENV_STORE_UNREADABLE/)).toBeNull();

        // Not a destructive/invalid field: nothing was written and nothing was
        // rejected, so the input must not be marked invalid.
        const input = screen.getByPlaceholderText(LABELS.placeholder);
        expect(input.getAttribute("aria-invalid")).not.toBe("true");
    });

    it("still marks a genuinely rejected key as invalid", () => {
        // Positive control. A prompt that never says "invalid" would pass every
        // assertion above while destroying the case that phase exists for.
        mount({ phase: "invalid", reason: "provider said no" });

        expect(screen.getByText(new RegExp(LABELS.invalid, "i"))).toBeTruthy();
        const input = screen.getByPlaceholderText(LABELS.placeholder);
        expect(input.getAttribute("aria-invalid")).toBe("true");
    });
});
