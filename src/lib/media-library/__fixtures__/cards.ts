/**
 * PROVENANCE: media-library packages/contracts/src/media-card.ts:15-43
 * PROVENANCE: media-library packages/contracts/src/search.ts:106-128
 * READ-ON: 2026-08-19
 *
 * Hand-built from the contract above, not recorded from a live service. The
 * guard in check-fixture-provenance.sh asserts these headers exist and that the
 * field set below still matches CARD_FIELDS — it catches fixtures DRIFTING, it
 * cannot catch a fixture that was wrong on day one. That residue is a Known
 * limit on the contract and a Gate-2 precondition.
 */
import type { MediaCard } from "@/lib/media-library/types";

/** Every field name the contract defines on a card, in contract order. */
export const CARD_FIELDS = [
    "id",
    "card_version",
    "tier",
    "media_type",
    "provenance",
    "license_label",
    "entity",
    "scene_kind",
    "subjects",
    "duration_s",
    "suggested_in_s",
    "suggested_out_s",
    "energy",
    "captured_at",
    "fresh",
    "interior_state",
    "times_used",
    "pinned",
    "curator_note",
    "caption",
    "shoot",
    "renditions",
] as const;

export const VIDEO_CARD: MediaCard = {
    id: "11111111-1111-4111-8111-111111111111",
    card_version: 1,
    tier: "project",
    media_type: "video",
    provenance: "real",
    entity: null,
    subjects: [],
    times_used: {},
    caption: "Ban công hướng ra hồ, nắng chiều",
    renditions: {
        proxy_url: "https://signed.example/proxy/1?sig=abc",
        thumb_url: "https://signed.example/thumb/1?sig=abc",
    },
};

export const CARD_WITH_LICENSE: MediaCard = {
    ...VIDEO_CARD,
    id: "22222222-2222-4222-8222-222222222222",
    license_label: "Phối cảnh 3D",
};

/**
 * The decisive card for guarantee #3: vocabulary values OneFlow has never seen,
 * including the OPEN form of provenance. A closed union or a switch would drop
 * or throw on exactly this card.
 */
export const CARD_UNKNOWN_VOCAB: MediaCard = {
    ...VIDEO_CARD,
    id: "33333333-3333-4333-8333-333333333333",
    provenance: "generated:acme@deadbeef",
    scene_kind: "mot-loai-chua-tung-co",
    energy: "mot-muc-chua-tung-co",
    caption: "Thẻ mang từ vựng OneFlow chưa từng thấy",
};

export const CARD_NULL_ENTITY: MediaCard = {
    ...VIDEO_CARD,
    id: "44444444-4444-4444-8444-444444444444",
    entity: null,
};
