// @vitest-environment jsdom
import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The outcome-reporting path, measured through the REAL dialog.
 *
 * Both facts under test are wiring facts, not logic facts, so a unit test of a
 * policy function could not see either of them:
 *
 *   AC-14 a run leaves `generated` exactly once (AC-5), so the single patch
 *         must carry the user's DECISION. Reporting when the dialog merely
 *         opens spends it on a non-decision and every later report is refused
 *         409 and dropped in silence.
 *   AC-15 Radix's AlertDialogAction is itself a close trigger, so confirming
 *         also runs the root's onOpenChange(false). One click must still
 *         produce exactly one report.
 *
 * Hence: real @radix-ui alert dialog, real zustand store, real component. Only
 * the edges that reach the network or the canvas renderer are stubbed.
 */

const reportOutcome = vi.hoisted(() => vi.fn());
vi.mock("@/lib/director/report-outcome", () => ({ reportOutcome }));

vi.mock("next-intl", () => ({ useTranslations: () => (k: string) => k }));

vi.mock("@xyflow/react", async (importOriginal) => ({
    ...(await importOriginal<Record<string, unknown>>()),
    useReactFlow: () => ({ fitView: vi.fn() }),
}));

vi.mock("react-hot-toast", () => ({
    default: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("@/components/ui/error-toast", () => ({ showErrorToast: vi.fn() }));

// The importer needs the ABI mount registry, which only exists once the canvas
// has mounted its nodes; the graph it returns is irrelevant to these two facts.
vi.mock("@/lib/workflow/exporter", () => ({
    parseWorkflowImportJson: () => ({
        nodes: [],
        edges: [],
        name: "kế hoạch",
        description: "",
    }),
}));

import { useFlow } from "@/hooks/use-flow";
import DirectorPrompt from "./director-prompt";

const PLAN = {
    name: "kế hoạch",
    description: "",
    nodes: [],
    edges: [],
    runId: "run-1",
};

/** Open the panel, type a prompt, submit — the path a user actually takes. */
async function askDirector() {
    fireEvent.click(screen.getByRole("button", { name: "open" }));
    const box = await screen.findByPlaceholderText("placeholder");
    fireEvent.change(box, { target: { value: "dựng giúp tôi một quy trình" } });
    fireEvent.submit(box.closest("form") as HTMLFormElement);
}

beforeEach(() => {
    reportOutcome.mockClear();
    // A non-empty canvas is what makes the panel stage the plan behind the
    // confirm dialog instead of applying it outright.
    useFlow.setState({ nodes: [{ id: "n1" }] as never, edges: [] });
    vi.stubGlobal(
        "fetch",
        vi.fn(async () => new Response(JSON.stringify(PLAN), { status: 200 })),
    );
});

afterEach(() => {
    // vitest runs without globals here, so testing-library's auto-cleanup is
    // never registered; without this every render stacks in the same document
    // and the queries below match the previous test's panel.
    cleanup();
    vi.unstubAllGlobals();
});

describe("Director outcome reporting (AC-14, AC-15)", () => {
    it("reports nothing while the plan is only staged", async () => {
        render(<DirectorPrompt />);
        await askDirector();
        await screen.findByRole("alertdialog");
        // The dialog is open and the user has decided nothing. Spending the
        // run's one patch here is what made `replaced`/`discarded` unrecordable.
        expect(reportOutcome).not.toHaveBeenCalled();
    });

    it("confirming reports `replaced` exactly once", async () => {
        render(<DirectorPrompt />);
        await askDirector();
        await screen.findByRole("alertdialog");
        fireEvent.click(screen.getByRole("button", { name: "replaceConfirm" }));
        await waitFor(() => expect(reportOutcome).toHaveBeenCalledTimes(1));
        expect(reportOutcome).toHaveBeenCalledWith("run-1", "replaced");
    });

    it("cancelling reports `discarded` exactly once", async () => {
        render(<DirectorPrompt />);
        await askDirector();
        await screen.findByRole("alertdialog");
        fireEvent.click(screen.getByRole("button", { name: "replaceCancel" }));
        await waitFor(() => expect(reportOutcome).toHaveBeenCalledTimes(1));
        expect(reportOutcome).toHaveBeenCalledWith("run-1", "discarded");
    });

    it("dismissing with Escape reports `discarded` exactly once", async () => {
        render(<DirectorPrompt />);
        await askDirector();
        const dialog = await screen.findByRole("alertdialog");
        fireEvent.keyDown(dialog, { key: "Escape" });
        await waitFor(() => expect(reportOutcome).toHaveBeenCalledTimes(1));
        expect(reportOutcome).toHaveBeenCalledWith("run-1", "discarded");
    });

    it("applies the plan straight away on an empty canvas", async () => {
        // The other branch, kept honest: with nothing to replace there is no
        // dialog, so the single patch carries `accepted` at once.
        useFlow.setState({ nodes: [] as never, edges: [] });
        render(<DirectorPrompt />);
        await askDirector();
        await waitFor(() => expect(reportOutcome).toHaveBeenCalledTimes(1));
        expect(reportOutcome).toHaveBeenCalledWith("run-1", "accepted");
    });
});
