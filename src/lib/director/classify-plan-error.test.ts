import Anthropic from "@anthropic-ai/sdk";
import { describe, expect, it } from "vitest";
import { classifyPlanError } from "./classify-plan-error";

describe("classifyPlanError", () => {
    it("classifies a plain AnthropicError (the zodOutputFormat re-check signal) as plan", () => {
        const err = new Anthropic.AnthropicError(
            "response did not match the expected schema",
        );
        expect(classifyPlanError(err)).toBe("plan");
    });

    it("classifies an APIError subclass (e.g. AuthenticationError) as transport, not plan", () => {
        const err = new Anthropic.AuthenticationError(
            401,
            { message: "invalid x-api-key" },
            "invalid x-api-key",
            new Headers(),
        );
        expect(classifyPlanError(err)).toBe("transport");
    });

    it("classifies a RateLimitError as transport", () => {
        const err = new Anthropic.RateLimitError(
            429,
            { message: "rate limited" },
            "rate limited",
            new Headers(),
        );
        expect(classifyPlanError(err)).toBe("transport");
    });

    it("classifies a non-Anthropic error (a genuine bug) as transport", () => {
        expect(classifyPlanError(new TypeError("boom"))).toBe("transport");
        expect(classifyPlanError(new RangeError("boom"))).toBe("transport");
        expect(classifyPlanError("not even an Error")).toBe("transport");
    });
});
