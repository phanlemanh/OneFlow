"use client";

import { useState } from "react";
import { StoreUnreadableNotice } from "@/components/settings/store-unreadable-notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type ReadFailure, saveEnvKeys } from "@/lib/settings/env-client";
import { legacyReadDetail } from "@/lib/settings/read-failure-text";
import { requestOpenSettings } from "@/lib/settings/settings-events";

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
        writeFailed: string;
        storeUnreadableTitle: string;
        storeUnreadableUnchanged: string;
        storeUnreadableReason: (cause: ReadFailure) => string;
        toSettings: string;
    };
    onSaved: () => void;
}) {
    const [url, setUrl] = useState("");
    const [key, setKey] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    /** Why the store could not be read, or null. Blocks the form entirely. */
    const [blocked, setBlocked] = useState<ReadFailure | null>(null);

    const save = async () => {
        setSaving(true);
        setError("");
        try {
            // One shared writer, which reads first and refuses when that read
            // did not produce a usable map. The panel used to do its own
            // read-then-write pair; PUT replaces the whole map, so merging onto
            // an untrustworthy read is how other keys got deleted.
            const patch: Record<string, string> = {};
            if (url.trim()) patch.MEDIA_LIBRARY_URL = url.trim();
            if (key.trim()) patch.MEDIA_LIBRARY_API_KEY = key.trim();
            const out = await saveEnvKeys(patch);
            if (!out.ok) {
                if (out.reason === "read-failed") {
                    // Not "we could not read" and then a form to try again in:
                    // this panel has no way to repair a broken store, so it
                    // says so and points at the screen that does.
                    setBlocked(legacyReadDetail(out.read));
                    return;
                }
                setError(labels.writeFailed);
                return;
            }
            onSaved();
        } finally {
            setSaving(false);
        }
    };

    if (blocked) {
        return (
            <div className="w-full nodrag">
                <StoreUnreadableNotice
                    reason={labels.storeUnreadableReason(blocked)}
                    labels={{
                        title: labels.storeUnreadableTitle,
                        unchanged: labels.storeUnreadableUnchanged,
                    }}
                >
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={requestOpenSettings}
                    >
                        {labels.toSettings}
                    </Button>
                </StoreUnreadableNotice>
            </div>
        );
    }

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
