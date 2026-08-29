/**
 * Wire types for the media-library REST boundary (ADR-0012).
 *
 * Domain vocabulary crosses this boundary as DATA, never as code: provenance,
 * scene_kind, entity.kind, entity.specificity, energy and interior_state are
 * plain `string` on purpose. `provenance` in particular is an OPEN union on the
 * far side (`generated:${provider}@${hash}` alongside a fixed set), so a closed
 * TS union here would be wrong by construction and a `switch` on it could never
 * be exhaustive. When the library opens a new domain, this file does not change.
 *
 * Shape source: media-library packages/contracts/src/media-card.ts:15-43 and
 * packages/contracts/src/search.ts:106-128, read 2026-08-19.
 */

export interface MediaCardEntity {
    id: string;
    kind: string;
    name: string;
    specificity: string;
    relation_text: string;
}

export interface MediaCard {
    id: string;
    card_version: 1;
    tier: string;
    media_type: string;
    provenance: string;
    /** Legally mandated disclosure — must be displayed whenever present. */
    license_label?: string;
    entity: MediaCardEntity | null;
    scene_kind?: string;
    subjects: string[];
    duration_s?: number;
    suggested_in_s?: number;
    suggested_out_s?: number;
    energy?: string;
    captured_at?: string;
    fresh?: boolean;
    interior_state?: string;
    times_used: Record<string, number>;
    pinned?: boolean;
    curator_note?: string;
    caption: string;
    shoot?: { group: string; index: number };
    renditions: { proxy_url: string; thumb_url: string };
}

export interface SearchResponse {
    cards: MediaCard[];
    /** Rows that passed the hard filters — a non-zero value with zero cards is a thin shelf, not a failure. */
    candidates: number;
    skipped: number;
    /** e.g. "embedding_unavailable": the result set came back semantically UNRANKED. */
    warnings: string[];
    contracts_version: string;
}

export interface AssetDetail {
    card: MediaCard;
    /**
     * `original` is the signed download URL and is never null — when there is no
     * original object the whole endpoint answers 404 instead. No mime, size or
     * filename accompanies it; see extension.ts for how the suffix is inferred.
     */
    urls: { original: string; proxy: string | null; thumb: string | null };
    expires_in_s: number;
    contracts_version: string;
}
