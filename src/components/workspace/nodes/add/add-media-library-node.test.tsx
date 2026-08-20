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
import { MEDIA_LIBRARY_ERROR_CODES } from "@/lib/media-library/errors";
import { MediaCardList } from "./media-card-list";
import {
    codeForStatus,
    failureMessageKey,
    isUnranked,
    outcomeMessageKey,
} from "./media-library-outcome";

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
    it("never labels any failure code in the taxonomy as a thin shelf", () => {
        for (const code of MEDIA_LIBRARY_ERROR_CODES) {
            expect(
                outcomeMessageKey({ kind: "failure", code, message: "x" }),
            ).not.toBe("thinShelf");
        }
    });

    /**
     * The assertion above looks like it covers the taxonomy, and does not:
     * `outcomeMessageKey` switches on `outcome.kind` and never reads
     * `outcome.code`, so every code walks the same line and returns "error".
     * Eleven iterations, one code path, none of them able to fail alone. The
     * list was hand-copied too, and had gone stale at eight — missing
     * VERSION_MISMATCH and LOCAL_FAILURE, the two codes `codeForStatus` mints
     * for 409 and 500, i.e. two the node is certain to meet.
     *
     * Distinctness actually lives in `failureMessageKey`, so that is what gets
     * measured here — against the taxonomy itself, never a copy of it.
     */
    it("gives every failure code its OWN sentence, none shared", () => {
        const failureCodes = MEDIA_LIBRARY_ERROR_CODES.filter(
            (code) => code !== "MISSING_CONFIG",
        );
        const keys = failureCodes.map((code) => failureMessageKey(code));

        expect(new Set(keys).size).toBe(failureCodes.length);
        expect(keys).not.toContain("error");
        // MISSING_CONFIG is the deliberate exception: its own outcome kind and
        // its own panel, so it must NOT resolve to a failure sentence.
        expect(failureMessageKey("MISSING_CONFIG")).toBe("error");
    });

    /**
     * SUPPRESSION for the pair above: an unknown code must fall back to the
     * generic line rather than inventing a key no locale file carries. Without
     * this, `failureMessageKey` could satisfy "all distinct" by returning
     * `failure.${code}` for literally anything handed to it.
     */
    it("falls back to the generic line for a code outside the taxonomy", () => {
        expect(failureMessageKey("SOMETHING_NEW")).toBe("error");
    });

    /**
     * Every status the node can turn into a code must land INSIDE the taxonomy,
     * otherwise `codeForStatus` mints keys with no translation behind them.
     */
    it("only mints codes that exist in the taxonomy", () => {
        const known = new Set<string>(MEDIA_LIBRARY_ERROR_CODES);
        for (const status of [400, 401, 403, 404, 409, 500, 501, 502, 418]) {
            expect(known).toContain(codeForStatus(status));
        }
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
