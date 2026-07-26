import { describe, expect, it } from "vitest";
import { aggregateCogs, type TaskRow } from "./cogs";

const rows = (...specs: [string, string, number | null][]): TaskRow[] =>
    specs.map(([pluginId, feature, durationMs]) => ({
        pluginId,
        feature,
        durationMs,
    }));

describe("grouping and statistics (AC-11)", () => {
    it("groups by plugin and slot", () => {
        const out = aggregateCogs(
            rows(
                ["p-a", "image-gen", 100],
                ["p-a", "image-gen", 300],
                ["p-a", "image-edit", 50],
                ["p-b", "image-gen", 90],
            ),
        );
        expect(out).toHaveLength(3);
        const imageGenA = out.find(
            (g) => g.pluginId === "p-a" && g.feature === "image-gen",
        );
        expect(imageGenA?.count).toBe(2);
        expect(imageGenA?.totalDurationMs).toBe(400);
    });

    it("matches hand-computed median and p95", () => {
        const [g] = aggregateCogs(
            rows(["p", "s", 100], ["p", "s", 300], ["p", "s", 200]),
        );
        expect(g.medianMs).toBe(200);
        // Nearest-rank: ceil(0.95 * 3) = 3 → the largest value.
        expect(g.p95Ms).toBe(300);
    });

    it("averages the middle pair for an even count", () => {
        const [g] = aggregateCogs(rows(["p", "s", 100], ["p", "s", 200]));
        expect(g.medianMs).toBe(150);
    });

    it("sorts the heaviest groups first", () => {
        const out = aggregateCogs(
            rows(["cheap", "s", 10], ["expensive", "s", 9000]),
        );
        expect(out[0].pluginId).toBe("expensive");
    });
});

describe("unmeasured rows are counted, not averaged (AC-12) — suppression half", () => {
    it("keeps NULL durations out of the statistics", () => {
        const [g] = aggregateCogs(
            rows(["p", "s", 200], ["p", "s", null], ["p", "s", 400]),
        );
        expect(g.count).toBe(3);
        expect(g.measured).toBe(2);
        expect(g.unmeasured).toBe(1);
        expect(g.totalDurationMs).toBe(600);
        // Treating the NULL as zero would drag this to 200.
        expect(g.medianMs).toBe(300);
    });

    it("reports a group with nothing measured without inventing zeros", () => {
        const [g] = aggregateCogs(rows(["p", "s", null], ["p", "s", null]));
        expect(g.measured).toBe(0);
        expect(g.unmeasured).toBe(2);
        expect(g.medianMs).toBeNull();
        expect(g.p95Ms).toBeNull();
        expect(g.totalDurationMs).toBe(0);
    });
});

describe("cost is applied, never invented (AC-13) — suppression half", () => {
    it("omits the cost field entirely when no rates are supplied", () => {
        const [g] = aggregateCogs(rows(["p", "s", 1000]));
        // Absent, not zero: "no rate supplied" must stay distinguishable from
        // "this costs nothing".
        expect(g).not.toHaveProperty("costUsd");
    });

    it("applies exactly the supplied rate", () => {
        const [g] = aggregateCogs(rows(["p", "s", 1000], ["p", "s", 2000]), {
            p: 0.5,
        });
        // 3 seconds of plugin time at 0.5 USD/s.
        expect(g.costUsd).toBeCloseTo(1.5, 10);
    });

    it("leaves plugins absent from the rate table without a cost", () => {
        const out = aggregateCogs(
            rows(["priced", "s", 1000], ["unpriced", "s", 1000]),
            { priced: 1 },
        );
        expect(out.find((g) => g.pluginId === "priced")?.costUsd).toBe(1);
        expect(out.find((g) => g.pluginId === "unpriced")).not.toHaveProperty(
            "costUsd",
        );
    });
});
