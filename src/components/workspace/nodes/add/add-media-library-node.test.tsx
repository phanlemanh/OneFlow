// @vitest-environment jsdom
/**
 * E7 / E13 / E14 — the card surface and the thin-shelf rule.
 *
 * The node itself is exercised end-to-end by the ui-check evals; what is worth
 * measuring here is the part that a screenshot cannot prove: that unseen
 * vocabulary survives, that the mandatory licence label is printed, and that a
 * thin shelf is worded differently from a failure.
 */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ReactFlow, ReactFlowProvider } from "@xyflow/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeAll, describe, expect, it, vi as vi_ } from "vitest";
import en from "@/i18n/messages/en.json";
import ja from "@/i18n/messages/ja.json";
import ko from "@/i18n/messages/ko.json";
import vi from "@/i18n/messages/vi.json";
import zh from "@/i18n/messages/zh.json";
import {
    CARD_NULL_ENTITY,
    CARD_UNKNOWN_VOCAB,
    CARD_WITH_LICENSE,
    VIDEO_CARD,
} from "@/lib/media-library/__fixtures__/cards";
import { MEDIA_LIBRARY_ERROR_CODES } from "@/lib/media-library/errors";
import AddMediaLibraryNode, {
    readImportedFileKey,
} from "./add-media-library-node";
import { MediaCardList } from "./media-card-list";
import {
    codeForStatus,
    failureMessageKey,
    isUnranked,
    outcomeMessageKey,
} from "./media-library-outcome";

/* ------------------------------------------------------------------ */
/* jsdom shims + node harness, per the xyflow testing guidance the      */
/* repo already follows in transfer/normalize-text-vi.test.tsx.         */
/* ------------------------------------------------------------------ */

class ResizeObserverStub {
    private readonly callback: ResizeObserverCallback;
    constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
    }
    observe(target: Element) {
        const contentRect = {
            width: 1200,
            height: 800,
            x: 0,
            y: 0,
            top: 0,
            left: 0,
            right: 1200,
            bottom: 800,
        };
        this.callback(
            [{ target, contentRect } as unknown as ResizeObserverEntry],
            this as unknown as ResizeObserver,
        );
    }
    unobserve() {}
    disconnect() {}
}

class DOMMatrixReadOnlyStub {
    m22 = 1;
}

beforeAll(() => {
    globalThis.ResizeObserver =
        ResizeObserverStub as unknown as typeof ResizeObserver;
    globalThis.DOMMatrixReadOnly =
        DOMMatrixReadOnlyStub as unknown as typeof DOMMatrixReadOnly;
    Object.defineProperties(HTMLElement.prototype, {
        offsetHeight: {
            get(): number {
                return 60;
            },
        },
        offsetWidth: {
            get(): number {
                return 340;
            },
        },
    });
    (SVGElement.prototype as unknown as { getBBox: () => DOMRect }).getBBox =
        () => ({ x: 0, y: 0, width: 0, height: 0 }) as unknown as DOMRect;
});

const NODE_TYPES = { addMediaLibraryNode: AddMediaLibraryNode };

function renderNode() {
    const nodes = [
        {
            id: "aml1",
            type: "addMediaLibraryNode",
            position: { x: 0, y: 0 },
            data: {},
        },
    ];
    return render(
        <NextIntlClientProvider locale="en" messages={en}>
            <ReactFlowProvider>
                <ReactFlow nodes={nodes} edges={[]} nodeTypes={NODE_TYPES} />
            </ReactFlowProvider>
        </NextIntlClientProvider>,
    );
}

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

/**
 * The assertions above stop at the KEY. AC-6 is about the SENTENCES a user
 * reads, and `expect(new Set(keys).size).toBe(n)` only proves that ten strings
 * spelling `"failure.<CODE>"` differ from each other — no message file is ever
 * loaded. If a `failure.<CODE>` were missing from a locale, or two codes were
 * translated to the same sentence, every one of those assertions stays green
 * while the screen shows a raw key or the wrong cause.
 *
 * So resolve through the real message files, and check every locale: this is
 * the only thing standing between "the code is distinct" and "the user is told
 * something different".
 */
describe("every failure code reaches a real, distinct sentence (AC-6)", () => {
    /**
     * Read ONLY the branch this feature owns.
     *
     * Collecting the five imports into one object literal makes TypeScript
     * unify five whole message files, and they genuinely differ — in another
     * feature's namespace, several keys exist in some locales and not others.
     * That is a real drift worth someone's attention, but it is not this
     * criterion's, and letting it break the build here would say nothing about
     * media-library copy. Narrowing to the branch actually read keeps the
     * assertion pointed at its own subject.
     */
    type AmlMessages = {
        thinShelf: string;
        failure: Record<string, string>;
    } & Record<string, unknown>;
    const branchOf = (m: unknown): AmlMessages =>
        (m as { Workspace: { nodes: { addMediaLibrary: AmlMessages } } })
            .Workspace.nodes.addMediaLibrary;

    const LOCALES: Record<string, AmlMessages> = {
        en: branchOf(en),
        ja: branchOf(ja),
        ko: branchOf(ko),
        vi: branchOf(vi),
        zh: branchOf(zh),
    };
    const failureCodes = MEDIA_LIBRARY_ERROR_CODES.filter(
        (code) => code !== "MISSING_CONFIG",
    );

    const copyFor = (node: AmlMessages, code: string): string | undefined => {
        const [head, tail] = failureMessageKey(code).split(".");
        const branch = node[head];
        return tail
            ? (branch as Record<string, string> | undefined)?.[tail]
            : (branch as string | undefined);
    };

    for (const [locale, messages] of Object.entries(LOCALES)) {
        it(`${locale}: every code has a sentence, and no two share one`, () => {
            const sentences = failureCodes.map((code) => {
                const copy = copyFor(messages, code);
                // Names the missing code rather than failing on a count.
                expect(copy, `${locale} is missing failure.${code}`).toBeTypeOf(
                    "string",
                );
                return copy as string;
            });

            expect(new Set(sentences).size).toBe(failureCodes.length);
            for (const sentence of sentences) {
                // NOT a character-count floor. The first version asserted
                // `length > 10` and zh failed at 8 — a correct, complete
                // Chinese sentence. A length threshold silently holds CJK
                // locales to a stricter bar than Latin ones for no reason
                // anyone would defend out loud, so it measures the alphabet
                // rather than the copy. Non-empty, and not a leaked key.
                expect(sentence.trim()).not.toBe("");
                expect(sentence).not.toMatch(/^failure\./);
            }
        });
    }

    /**
     * The thin shelf is the one AC-4/AC-6 pair most likely to collapse: it must
     * read as "the shelf is thin", never as "something broke". Compared as
     * SENTENCES, not as keys.
     */
    it("words a thin shelf differently from every failure", () => {
        const thin = LOCALES.en.thinShelf;
        expect(typeof thin).toBe("string");
        for (const code of failureCodes) {
            expect(copyFor(LOCALES.en, code)).not.toBe(thin);
        }
    });
});

/**
 * The import SUCCESS path (S4 round 7).
 *
 * Both halves below shipped because nothing exercised them: the node cannot be
 * driven from a unit test, so the 2xx branch was the one response the feature
 * read without checking. The reader is now a pure function for exactly that
 * reason — the branch that has no test is the branch that rots.
 */
function jsonResponse(body: string): Response {
    return new Response(body, {
        status: 200,
        headers: { "content-type": "application/json" },
    });
}

describe("the import success body is read, not assumed (AC-9 / AC-10)", () => {
    it("returns the file key when the body carries one", async () => {
        const got = await readImportedFileKey(
            jsonResponse(JSON.stringify({ fileKey: "uploads/abc.mp4" })),
        );
        expect(got).toBe("uploads/abc.mp4");
    });

    it("refuses a 200 whose body will not parse, instead of throwing", async () => {
        // A dev-server or proxy error page answers HTML with a 200. Letting
        // this reject sent the failure to the caller's network branch, which
        // told the user to check MEDIA_LIBRARY_URL over a local fault.
        const got = await readImportedFileKey(
            jsonResponse("<!doctype html><title>oops</title>"),
        );
        expect(got).toBeNull();
    });

    it.each([
        ["thiếu hẳn fileKey", "{}"],
        ["fileKey null", JSON.stringify({ fileKey: null })],
        ["fileKey rỗng", JSON.stringify({ fileKey: "" })],
        ["fileKey không phải chuỗi", JSON.stringify({ fileKey: 42 })],
    ])("refuses a 200 with %s", async (_kind, body) => {
        // String(undefined) used to yield the literal "undefined", so the canvas
        // gained a videoNode pointing at nothing while the node reported plain
        // success — the wrong reading spoken confidently.
        const got = await readImportedFileKey(jsonResponse(body));
        expect(got).toBeNull();
    });

    it("never returns the string 'undefined'", async () => {
        for (const body of ["{}", JSON.stringify({ fileKey: undefined })]) {
            expect(await readImportedFileKey(jsonResponse(body))).not.toBe(
                "undefined",
            );
        }
    });
});

describe("the not-yet-configured panel speaks the viewer's language (AC-1)", () => {
    const CATALOGUES = { en, vi, ja, ko, zh } as const;

    it("has a translated sentence in every locale", () => {
        for (const [locale, cat] of Object.entries(CATALOGUES)) {
            const line = (cat as typeof en).Workspace.nodes.addMediaLibrary
                .missingConfig;
            expect(
                typeof line === "string" && line.trim().length > 0,
                `${locale}.json thiếu câu missingConfig — người dùng locale này sẽ thấy câu tiếng Việt của máy chủ`,
            ).toBe(true);
        }
    });

    // Rendered, not grepped. The first version of this test matched a regex
    // against the component's SOURCE TEXT, which measures the INSTRUCTION
    // rather than the OUTPUT: it would stay green if the panel dropped the
    // prop on the floor, and red on a rename that changed nothing a user can
    // see. The repo already had a harness for mounting a node inside
    // ReactFlow + NextIntl under jsdom (see
    // src/components/workspace/nodes/transfer/normalize-text-vi.test.tsx), so
    // grepping the file was never the only option available.
    //
    // Driving the node here also closes the gap S4 round 7 named — that
    // nothing exercised this component at all.
    it("renders the viewer's sentence, not the server's, when config is missing", async () => {
        const SERVER_SENTENCE =
            "Chưa gọi được media-library: thiếu MEDIA_LIBRARY_URL.";
        vi_.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(
                JSON.stringify({
                    code: "MISSING_CONFIG",
                    missing: ["MEDIA_LIBRARY_URL"],
                    message: SERVER_SENTENCE,
                }),
                {
                    status: 503,
                    headers: { "content-type": "application/json" },
                },
            ) as Response,
        );

        renderNode();
        const box = await screen.findByPlaceholderText(
            en.Workspace.nodes.addMediaLibrary.searchPlaceholder,
        );
        fireEvent.change(box, { target: { value: "mèo con" } });
        fireEvent.click(
            screen.getByRole("button", {
                name: en.Workspace.nodes.addMediaLibrary.search,
            }),
        );

        // The translated sentence is on screen...
        expect(
            await screen.findByText(
                en.Workspace.nodes.addMediaLibrary.missingConfig,
            ),
        ).toBeTruthy();
        // ...and the server's Vietnamese one is nowhere on it. The variable
        // NAME still is, because that half is data, not prose.
        expect(screen.queryByText(SERVER_SENTENCE)).toBeNull();
        expect(screen.getByText("MEDIA_LIBRARY_URL")).toBeTruthy();
    });
});
