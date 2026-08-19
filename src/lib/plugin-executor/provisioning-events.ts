/**
 * Provisioning milestones streamed to the client while a plugin's Python
 * environment is built.
 *
 * These are NOT a progress bar. Each event is emitted at the moment the thing
 * it names actually starts or actually finishes, and a step that is skipped
 * (cached venv, no requirements.txt) emits nothing at all. With a wait that can
 * run into minutes, the difference between "installing the third dependency"
 * and silence is the difference between waiting and force-quitting — but a bar
 * that advances on a timer would be a promise, not a fact.
 */

export type ProvisioningStep =
    | "create-venv"
    | "install-sdk"
    | "install-requirements";

export type ProvisioningEvent = {
    step: ProvisioningStep;
    /** `started` means the work began; `completed` means it exited cleanly. */
    phase: "started" | "completed";
};

export type OnMilestone = (event: ProvisioningEvent) => void;

const STARTED_TEXT: Readonly<Record<ProvisioningStep, string>> = {
    "create-venv": "Đang tạo môi trường Python",
    "install-sdk": "Đang cài bộ thư viện lõi",
    "install-requirements": "Đang cài thư viện của công cụ",
};

const COMPLETED_TEXT: Readonly<Record<ProvisioningStep, string>> = {
    "create-venv": "Đã tạo xong môi trường Python",
    "install-sdk": "Đã cài xong bộ thư viện lõi",
    "install-requirements": "Đã cài xong thư viện của công cụ",
};

/** Human sentence for a milestone; the client displays this verbatim. */
export function provisioningMessage(event: ProvisioningEvent): string {
    return event.phase === "started"
        ? STARTED_TEXT[event.step]
        : COMPLETED_TEXT[event.step];
}
