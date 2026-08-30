"use client";

import { AlertTriangle, Check, KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Key prompt rendered INSIDE the node that needs the key.
 *
 * The industry pattern this follows is n8n's: the credential form comes to the
 * node rather than sending the user to a settings screen. Deep-linking into
 * settings was the earlier design and is strictly weaker — it costs the user
 * their place on the canvas.
 *
 * Presentational only. Saving, and the verification that follows it, land in
 * implementation; this component only renders the four states that flow has.
 *
 * `verifying` and `invalid` exist because a saved key is checked against the
 * thing it unlocks, not against its own shape (AC-10). A component that only
 * had `idle` and `saved` would be the design that lets a well-formed but
 * expired key report success.
 */

export type KeyPromptState =
    | { phase: "needs-key" }
    | { phase: "verifying" }
    | { phase: "invalid"; reason: string }
    /**
     * Saved, but no verdict exists: there is no prober for this env key, or
     * the provider was unreachable. Distinct from `invalid` on purpose —
     * "could not ask" and "asked and was told no" are different facts, and
     * rendering the first as the second told users their working keys were
     * broken (S4 round 1 finding).
     */
    | { phase: "saved-unverified"; reason: string }
    /**
     * The key store itself could not be read, so nothing was written and the
     * provider was never asked. Distinct from `invalid` (asked and told no)
     * and from `saved-unverified` (written but unconfirmed): here the user's
     * key may be perfectly good and their existing keys are still on disk.
     */
    | { phase: "store-unreadable" }
    | { phase: "verified" };

export interface NodeKeyPromptProps {
    /** The env var this node's plugin declares, e.g. OPENAI_API_KEY. */
    envKey: string;
    /** Human name of the service the key is for, e.g. "OpenAI" — never a plugin id. */
    providerName: string;
    state: KeyPromptState;
    labels: NodeKeyPromptLabels;
    value?: string;
    onChange?: (value: string) => void;
    onSave?: () => void;
}

export interface NodeKeyPromptLabels {
    needsKey: string;
    describe: (providerName: string) => string;
    placeholder: string;
    save: string;
    verifying: string;
    invalid: string;
    verified: string;
    savedUnverified: string;
    /** Shown when the key store cannot be read — nothing was saved or checked. */
    storeUnreadable: string;
    /** Where the user can actually deal with it. */
    openSettings: string;
}

export function NodeKeyPrompt({
    envKey,
    providerName,
    state,
    labels,
    value = "",
    onChange,
    onSave,
}: NodeKeyPromptProps) {
    const inputId = `node-key-${envKey}`;
    const busy = state.phase === "verifying";

    return (
        <section
            className={cn(
                "space-y-2 rounded-md border p-3",
                state.phase === "invalid"
                    ? "border-destructive/50"
                    : "border-amber-500/50",
            )}
        >
            <header className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 shrink-0 text-amber-600" />
                <span className="text-sm font-medium">{labels.needsKey}</span>
            </header>

            <p className="text-xs text-muted-foreground">
                {labels.describe(providerName)}
            </p>

            <div className="space-y-1">
                <Label htmlFor={inputId} className="text-xs font-mono">
                    {envKey}
                </Label>
                <Input
                    id={inputId}
                    type="password"
                    autoComplete="off"
                    spellCheck={false}
                    disabled={busy}
                    placeholder={labels.placeholder}
                    value={value}
                    onChange={(e) => onChange?.(e.target.value)}
                    aria-invalid={state.phase === "invalid"}
                    aria-describedby={
                        state.phase === "invalid"
                            ? `${inputId}-error`
                            : undefined
                    }
                />
            </div>

            {state.phase === "invalid" ? (
                <p
                    id={`${inputId}-error`}
                    role="alert"
                    className="flex items-start gap-1 text-xs text-destructive"
                >
                    <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                    <span>
                        {labels.invalid} — {state.reason}
                    </span>
                </p>
            ) : null}

            {state.phase === "saved-unverified" ? (
                <p className="flex items-start gap-1 text-xs text-muted-foreground">
                    <Check className="mt-0.5 h-3 w-3 shrink-0" />
                    <span>
                        {labels.savedUnverified} — {state.reason}
                    </span>
                </p>
            ) : null}

            {state.phase === "store-unreadable" ? (
                <p
                    role="alert"
                    className="flex items-start gap-1 text-xs text-muted-foreground"
                >
                    <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                    <span>
                        {labels.storeUnreadable} {labels.openSettings}
                    </span>
                </p>
            ) : null}

            {state.phase === "verified" ? (
                <p // emerald-600 measured 3.65:1 on white — under AA. The repo has no
                    // semantic success token (see design-pass Nhom 2), so this uses the
                    // next step of the same palette rather than inventing a hex.
                    className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400"
                >
                    <Check className="h-3 w-3 shrink-0" />
                    {labels.verified}
                </p>
            ) : null}

            <Button
                size="sm"
                className="w-full"
                disabled={busy || value.length === 0}
                onClick={onSave}
            >
                {busy ? (
                    <span className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        {labels.verifying}
                    </span>
                ) : (
                    labels.save
                )}
            </Button>
        </section>
    );
}
