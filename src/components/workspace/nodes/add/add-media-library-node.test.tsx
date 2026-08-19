// @vitest-environment jsdom
/**
 * E7 / E13 / E14 — the card surface and the thin-shelf rule.
 *
 * The node itself is exercised end-to-end by the ui-check evals; what is worth
 * measuring here is the part that a screenshot cannot prove: that unseen
 * vocabulary survives, that the mandatory licence label is printed, and that a
 * thin shelf is worded differently from a failure.
 */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
    CARD_NULL_ENTITY,
    CARD_UNKNOWN_VOCAB,
    CARD_WITH_LICENSE,
    VIDEO_CARD,
} from "@/lib/media-library/__fixtures__/cards";
import { MediaCardList } from "./media-card-list";
import { isUnranked, outcomeMessageKey } from "./media-library-outcome";

afterEach(cleanup);

describe("MediaCardList — domain vocabulary is opaque data (E13)", () => {
    it("renders a card whose vocabulary values OneFlow has never seen", () => {
        render(
            <MediaCardList cards={[CARD_UNKNOWN_VOCAB]} onPick={() => {}} />,
        );
        expect(screen.queryByText(CARD_UNKNOWN_VOCAB.caption)).not.toBeNull();
        expect(screen.queryByText(/undefined/)).toBeNull();
    });

    it("renders a card with entity: null", () => {
        render(<MediaCardList cards={[CARD_NULL_ENTITY]} onPick={() => {}} />);
        expect(screen.queryByText(CARD_NULL_ENTITY.caption)).not.toBeNull();
    });
});

describe("MediaCardList — the licence label is mandatory when present (E14)", () => {
    it("shows the label verbatim", () => {
        render(<MediaCardList cards={[CARD_WITH_LICENSE]} onPick={() => {}} />);
        expect(screen.queryByText("Phối cảnh 3D")).not.toBeNull();
    });

    /**
     * SUPPRESSION: mandatory-when-present must not become an always-on empty
     * chip — an empty label is noise on every card that has no rights notice.
     */
    it("renders no licence chip when the card has none", () => {
        render(<MediaCardList cards={[VIDEO_CARD]} onPick={() => {}} />);
        expect(screen.queryByTestId("licence-chip")).toBeNull();
    });
});

describe("a thin shelf is not a failure (E7)", () => {
    it("uses a different message from the failure case", () => {
        const thin = outcomeMessageKey({
            kind: "results",
            cards: [],
            candidates: 12,
            warnings: [],
        });
        expect(thin).toBe("thinShelf");
        expect(
            outcomeMessageKey({
                kind: "failure",
                code: "UPSTREAM_ERROR",
                message: "x",
            }),
        ).not.toBe("thinShelf");
    });

    /**
     * SUPPRESSION — the load-bearing half: this is the 501-read-as-empty-shelf
     * scenario. NONE of the eight failure codes may be worded as a thin shelf.
     */
    it("never labels any of the eight failure codes as a thin shelf", () => {
        const codes = [
            "AUTH_REJECTED",
            "MISSING_SCOPE",
            "BAD_REQUEST",
            "NOT_FOUND",
            "UPSTREAM_ERROR",
            "NOT_IMPLEMENTED",
            "BAD_RESPONSE",
            "NETWORK_ERROR",
        ];
        for (const code of codes) {
            expect(
                outcomeMessageKey({ kind: "failure", code, message: "x" }),
            ).not.toBe("thinShelf");
        }
        expect(codes).toHaveLength(8);
    });

    it("still calls a shelf with cards a result, not a thin shelf", () => {
        expect(
            outcomeMessageKey({
                kind: "results",
                cards: [VIDEO_CARD],
                candidates: 1,
                warnings: [],
            }),
        ).toBe("results");
    });
});

describe("a degraded 200 is announced (E9 backing)", () => {
    it("flags a result set that came back unranked", () => {
        expect(
            isUnranked({
                kind: "results",
                cards: [VIDEO_CARD],
                candidates: 1,
                warnings: ["embedding_unavailable"],
            }),
        ).toBe(true);
    });

    /** SUPPRESSION: a node that always warns is as useless as one that never does. */
    it("does not flag a clean result set", () => {
        expect(
            isUnranked({
                kind: "results",
                cards: [VIDEO_CARD],
                candidates: 1,
                warnings: [],
            }),
        ).toBe(false);
    });
});
