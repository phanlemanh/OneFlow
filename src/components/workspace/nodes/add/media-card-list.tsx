"use client";

import type { MediaCard } from "@/lib/media-library/types";

/**
 * Renders whatever the library sent.
 *
 * Every vocabulary value is printed as an opaque string: no switch, no
 * translation table, no closed union (ADR-0012 guarantee #3). When the library
 * opens a new domain — finance, insurance — this file does not change.
 *
 * `license_label` is a legally mandated disclosure the contract requires to be
 * displayed whenever present; dropping it is a compliance failure, not a
 * tidier card. It is rendered only when present, so the absent case does not
 * become an always-on empty chip.
 */
export function MediaCardList({
    cards,
    onPick,
    busyId,
}: {
    cards: MediaCard[];
    onPick: (card: MediaCard) => void;
    busyId?: string;
}) {
    return (
        <ul className="grid grid-cols-3 gap-2 list-none p-0 m-0">
            {cards.map((card) => (
                <li key={card.id}>
                    <button
                        type="button"
                        onClick={() => onPick(card)}
                        disabled={busyId === card.id}
                        className="w-full text-left rounded-lg border border-border overflow-hidden bg-card hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
                    >
                        {/*
                         * Decorative: the caption sits right below and is the
                         * button's accessible name, so repeating it in `alt`
                         * makes a screen reader say the same sentence twice
                         * (axe: image-redundant-alt, measured on all six cards).
                         */}
                        <img
                            src={card.renditions.thumb_url}
                            alt=""
                            width={160}
                            height={90}
                            loading="lazy"
                            className="w-full h-[90px] object-cover bg-muted"
                        />
                        <span className="block px-2 pt-2 text-xs text-foreground line-clamp-2">
                            {card.caption}
                        </span>
                        {card.license_label ? (
                            <span
                                data-testid="licence-chip"
                                className="block px-2 pb-2 pt-1 text-[10px] text-muted-foreground"
                            >
                                {card.license_label}
                            </span>
                        ) : null}
                    </button>
                </li>
            ))}
        </ul>
    );
}
