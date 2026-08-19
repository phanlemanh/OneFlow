"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * The way out of the missing-configuration state.
 *
 * Naming the missing variable is only half of ADR-0012 guarantee #2: a product
 * that names it and then leaves the user with nowhere to type it is still a
 * dead end. The form comes to the node — the same pattern the key prompt uses —
 * rather than sending the user to a settings screen and costing them their
 * place on the canvas.
 */
export function MediaLibraryConfigPanel({
    missing,
    message,
    labels,
    onSaved,
}: {
    missing: string[];
    message: string;
    labels: {
        urlLabel: string;
        keyLabel: string;
        save: string;
        saving: string;
    };
    onSaved: () => void;
}) {
    const [url, setUrl] = useState("");
    const [key, setKey] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const save = async () => {
        setSaving(true);
        setError("");
        try {
            const current = await fetch("/api/settings/env");
            const { env } = (await current.json()) as {
                env: Record<string, string>;
            };
            const next = { ...env };
            if (url.trim()) next.MEDIA_LIBRARY_URL = url.trim();
            if (key.trim()) next.MEDIA_LIBRARY_API_KEY = key.trim();

            const saved = await fetch("/api/settings/env", {
                method: "PUT",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ env: next }),
            });
            if (!saved.ok) throw new Error(String(saved.status));
            onSaved();
        } catch (cause) {
            setError(String(cause));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="w-full space-y-3 rounded-lg border border-dashed border-muted-foreground/40 p-3 nodrag">
            <p className="text-sm text-foreground">{message}</p>
            <ul className="list-none p-0 m-0 space-y-2">
                {missing.includes("MEDIA_LIBRARY_URL") ? (
                    <li className="space-y-1">
                        <Label
                            htmlFor="media-library-url"
                            className="font-mono text-xs"
                        >
                            MEDIA_LIBRARY_URL
                        </Label>
                        <Input
                            id="media-library-url"
                            value={url}
                            placeholder={labels.urlLabel}
                            onChange={(e) => setUrl(e.target.value)}
                            onPointerDown={(e) => e.stopPropagation()}
                        />
                    </li>
                ) : null}
                {missing.includes("MEDIA_LIBRARY_API_KEY") ? (
                    <li className="space-y-1">
                        <Label
                            htmlFor="media-library-key"
                            className="font-mono text-xs"
                        >
                            MEDIA_LIBRARY_API_KEY
                        </Label>
                        <Input
                            id="media-library-key"
                            type="password"
                            value={key}
                            placeholder={labels.keyLabel}
                            onChange={(e) => setKey(e.target.value)}
                            onPointerDown={(e) => e.stopPropagation()}
                        />
                    </li>
                ) : null}
            </ul>
            {error ? <p className="text-xs text-destructive">{error}</p> : null}
            <Button size="sm" onClick={save} disabled={saving}>
                {saving ? labels.saving : labels.save}
            </Button>
        </div>
    );
}
