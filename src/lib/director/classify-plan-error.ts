/**
 * Transport-vs-plan error classification for the Anthropic `messages.parse`
 * call — extracted into its own pure, non-`server-only` module so it can be
 * unit-tested directly (constructing SDK error instances needs no network),
 * unlike `director.server.ts` itself, which the `server-only` marker keeps
 * out of reach of the test runner.
 *
 * The signal: `zodOutputFormat`'s client-side re-check (see dsl.ts's caps on
 * string length / array size the API's JSON-schema grammar can't express)
 * throws a plain `AnthropicError` when the parsed output fails validation —
 * that is a *plan* problem. A genuine transport failure (auth, rate limit,
 * connection, ...) is always an `APIError`, which extends `AnthropicError`.
 * So "plan" is the narrow case: an `AnthropicError` that is *not* also an
 * `APIError`. Anything else — including an `APIError` and any error that
 * isn't an `AnthropicError` at all (a bug elsewhere, a non-SDK throw) — is
 * "transport" and must be rethrown unchanged for `mapAnthropicError` to
 * classify; converting it to a `PlanValidationError` would misreport a real
 * failure as `PLAN_INVALID` and burn a retry on it.
 */
import Anthropic from "@anthropic-ai/sdk";

export type PlanErrorClassification = "plan" | "transport";

export function classifyPlanError(err: unknown): PlanErrorClassification {
    if (
        err instanceof Anthropic.AnthropicError &&
        !(err instanceof Anthropic.APIError)
    ) {
        return "plan";
    }
    return "transport";
}
