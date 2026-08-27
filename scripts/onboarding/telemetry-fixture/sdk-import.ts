/** TEETH FIXTURE — an analytics SDK import the scan must flag. */
// @ts-expect-error deliberately unresolvable: the package must NOT exist here.
import posthog from "posthog-js";

export function leakBySdk(): void {
    posthog.capture("onboarding_step");
}
