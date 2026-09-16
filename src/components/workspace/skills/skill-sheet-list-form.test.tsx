// @vitest-environment jsdom
/**
 * E9 (AC-9) — the list comes from the real GET /api/skills: names and
 * descriptions are the vi.json values for each registered skill; a skill whose
 * slot has no plugin carries «Cần cài plugin cho bước: <step label>» and cannot
 * open its form; an available skill opens a form generated from its manifest
 * (one field per param, required marked) whose Run stays disabled until the
 * required values are present.
 */
import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { pointDataDirAtTemp } from "@/lib/skills/test-support/temp-env";

vi.mock("server-only", () => ({}));
const hoisted = vi.hoisted(() => ({ registry: { current: null as unknown } }));
vi.mock("@/lib/plugins/plugins-registry.server", () => ({
    loadPluginsRegistry: () => hoisted.registry.current,
    getPluginConfig: () => null,
}));
vi.mock("@/lib/api/upload", () => ({
    getPresignedUploadUrl: async (file: File) => ({
        fileKey: `uploads/${file.name}`,
        url: "",
        uploadUrl: "",
        expiresIn: 0,
    }),
}));

pointDataDirAtTemp("panel-list");

import { SKILLS } from "@/lib/skills/catalog";
import {
    type FetchLog,
    installRouteFetch,
    messages,
    ViIntl,
} from "@/lib/skills/test-support/panel-harness";
import { registryWith } from "@/lib/skills/test-support/route-harness";
import { SkillPanel } from "./skill-sheet";

const log: FetchLog = { runBodies: [], contractErrors: [] };
const S = messages.Skills as unknown as {
    skills: Record<
        string,
        { name: string; description: string; steps: Record<string, string> }
    >;
    missingPlugin: string;
    run: string;
    required: string;
};

beforeAll(async () => {
    await installRouteFetch(log);
});
afterEach(() => cleanup());

const open = () =>
    render(
        <ViIntl>
            <SkillPanel onClose={() => {}} />
        </ViIntl>,
    );

describe("skill panel list and form (E9)", () => {
    it("lists every registered skill by its vi.json name and description", async () => {
        hoisted.registry.current = registryWith(
            SKILLS.flatMap((s) => s.manifest.requires),
        );
        open();
        for (const def of SKILLS) {
            const copy = S.skills[def.manifest.id];
            expect(copy, `${def.manifest.id} has no copy`).toBeDefined();
            expect(await screen.findByText(copy.name)).toBeTruthy();
            expect(screen.getByText(copy.description)).toBeTruthy();
        }
    });

    it("a skill missing a plugin names the step and cannot open its form", async () => {
        const blocked = SKILLS[0];
        const [missingSlot] = blocked.manifest.requires;
        hoisted.registry.current = registryWith(
            SKILLS.flatMap((s) => s.manifest.requires).filter(
                (slot) => slot !== missingSlot,
            ),
        );
        open();
        const id = blocked.manifest.id;
        const label = S.missingPlugin.replace(
            "{steps}",
            S.skills[id].steps[missingSlot],
        );
        const card = await waitFor(() => {
            const el = document.querySelector(
                `[data-testid="skill-card-${id}"]`,
            );
            if (!el) throw new Error(`card ${id} missing`);
            return el as HTMLElement;
        });
        await waitFor(() =>
            expect(card.textContent, `label for ${id}`).toContain(label),
        );
        const button = card.querySelector("button") as HTMLButtonElement;
        expect(button.disabled, `${id} still clickable`).toBe(true);
    });

    it("an available skill opens a manifest-generated form; Run waits for required values", async () => {
        hoisted.registry.current = registryWith(
            SKILLS.flatMap((s) => s.manifest.requires),
        );
        const def = SKILLS[0];
        open();
        fireEvent.click(
            await screen.findByText(S.skills[def.manifest.id].name),
        );
        await screen.findByRole("button", { name: S.run });
        const fields = document.querySelectorAll("[data-param]");
        expect(
            Array.from(fields).map((f) => f.getAttribute("data-param")),
            "fields vs manifest params",
        ).toEqual(def.manifest.params.map((p) => p.key));
        for (const p of def.manifest.params) {
            const field = document.querySelector(`[data-param="${p.key}"]`);
            const marked =
                field?.textContent?.includes(`(${S.required})`) ?? false;
            expect(marked, `required mark on ${p.key}`).toBe(p.required);
        }
        const run = screen.getByRole("button", {
            name: S.run,
        }) as HTMLButtonElement;
        expect(run.disabled, "Run enabled before required values").toBe(true);
        for (const p of def.manifest.params.filter((x) => x.required)) {
            const input = document.querySelector(
                `[data-param="${p.key}"] input`,
            ) as HTMLInputElement;
            if (
                p.type === "video" ||
                p.type === "image" ||
                p.type === "audio"
            ) {
                fireEvent.change(input, {
                    target: { files: [new File(["x"], "a.mp4")] },
                });
            } else {
                fireEvent.change(input, { target: { value: "5" } });
            }
        }
        await waitFor(() =>
            expect(run.disabled, "Run still disabled after filling").toBe(
                false,
            ),
        );
    });
});
