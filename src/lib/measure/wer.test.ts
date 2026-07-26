import { describe, expect, it } from "vitest";
import { scoreCorpus, scoreTranscript, tokenize } from "./wer";

describe("WER arithmetic (AC-1)", () => {
    it("scores an identical transcript as zero", () => {
        const r = scoreTranscript("một hai ba", "một hai ba");
        expect(r.wer).toBe(0);
        expect(r.substitutions + r.deletions + r.insertions).toBe(0);
    });

    it("scores an empty hypothesis as one", () => {
        const r = scoreTranscript("một hai ba", "");
        expect(r.deletions).toBe(3);
        expect(r.wer).toBe(1);
    });

    it("counts substitutions, deletions and insertions separately", () => {
        expect(scoreTranscript("một hai ba", "một sáu ba").substitutions).toBe(
            1,
        );
        expect(scoreTranscript("một hai ba bốn", "một hai ba").deletions).toBe(
            1,
        );
        expect(scoreTranscript("một hai ba", "một hai ba bốn").insertions).toBe(
            1,
        );
        // (S + D + I) / N
        expect(scoreTranscript("một hai ba bốn", "một hai ba").wer).toBe(0.25);
    });

    it("refuses an empty reference rather than dividing by zero", () => {
        expect(() => scoreTranscript("   ", "gì đó")).toThrow(/empty/i);
    });
});

describe("diacritics are preserved (AC-2) — suppression half", () => {
    it("treats a missing tone mark as an error", () => {
        const r = scoreTranscript("không phải", "khong phai");
        expect(r.substitutions).toBe(2);
        expect(r.wer).toBe(1);
    });

    it("does not fold distinct Vietnamese words together", () => {
        // A scorer that stripped diacritics would score these identical.
        expect(scoreTranscript("má", "mà").wer).toBeGreaterThan(0);
        expect(scoreTranscript("bán", "bàn").wer).toBeGreaterThan(0);
    });
});

describe("Unicode composition (AC-3)", () => {
    it("scores precomposed and decomposed text as equal", () => {
        const precomposed = "tiếng việt";
        const decomposed = precomposed.normalize("NFD");
        // Same to a human reading both files; different code points.
        expect(decomposed).not.toBe(precomposed);
        expect(scoreTranscript(precomposed, decomposed).wer).toBe(0);
        expect(tokenize(decomposed)).toEqual(tokenize(precomposed));
    });
});

describe("case and punctuation are not word errors (AC-4)", () => {
    it("ignores letter case", () => {
        expect(scoreTranscript("Xin Chào", "xin chào").wer).toBe(0);
    });

    it("ignores surrounding punctuation", () => {
        expect(scoreTranscript("xin chào, bạn!", "xin chào bạn").wer).toBe(0);
    });

    it("still keeps letters that punctuation stripping could eat", () => {
        // A naive ASCII \w filter would destroy these.
        expect(tokenize("đường phố")).toEqual(["đường", "phố"]);
    });
});

describe("numbers are reported, never converted (AC-5) — suppression half", () => {
    const ref = "giá 120000 đồng";
    const hyp = "giá một trăm hai mươi nghìn đồng";

    it("counts a digits-versus-words price as an error", () => {
        const r = scoreTranscript(ref, hyp);
        // The suppression half: no automatic conversion, so this is NOT free.
        expect(r.substitutions + r.deletions + r.insertions).toBeGreaterThan(0);
    });

    it("breaks digit-bearing edits out so a human can judge them", () => {
        expect(scoreTranscript(ref, hyp).digitTokenErrors).toBe(1);
        expect(scoreTranscript(hyp, ref).digitTokenErrors).toBe(1);
    });

    it("reports zero digit errors when no digits are involved", () => {
        expect(
            scoreTranscript("xin chào", "xin tạm biệt").digitTokenErrors,
        ).toBe(0);
    });
});

describe("corpus scoring (AC-6)", () => {
    it("aggregates over total words, not the mean of per-clip rates", () => {
        const report = scoreCorpus([
            {
                name: "long",
                ref: "một hai ba bốn năm sáu bảy tám",
                hyp: "một hai ba bốn năm sáu bảy tám",
            },
            { name: "short", ref: "một hai", hyp: "chín mười" },
        ]);
        // 2 errors over 10 reference words. A mean of per-clip rates would say 0.5.
        expect(report.aggregate.refWords).toBe(10);
        expect(report.aggregate.wer).toBeCloseTo(0.2, 10);
        expect(report.perClip).toHaveLength(2);
    });

    it("reports a missing hypothesis instead of averaging over fewer clips", () => {
        const report = scoreCorpus([
            { name: "a", ref: "một hai", hyp: "một hai" },
            { name: "b", ref: "ba bốn", hyp: null },
        ]);
        expect(report.missing).toEqual(["b"]);
        // The suppression half: the surviving clip is still scored, but the
        // caller can see the corpus was incomplete and fail the run.
        expect(report.perClip).toHaveLength(1);
    });
});
