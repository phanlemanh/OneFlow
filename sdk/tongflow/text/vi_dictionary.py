"""Domain vocabulary the upstream library does not cover.

Measured against vietnormalizer 0.2.3 on 2026-08-19: it spells "TP.HCM" out
letter by letter ("tê pê.hát xê em") and leaves "Q.7" as "q.bảy", so
administrative abbreviations are ours to expand. Everything here is a
plugin-internal constant, never an ABI field (CLAUDE.md, ABI hygiene).

Every entry is applied as an ANCHORED regex, never a bare str.replace.
Measured 2026-08-20 (S4 round 1 finding): unanchored "VND" replacement turned
"VNDirect" — a real brokerage name — into "đồngirect", and every downstream
guard stayed green because the guards only assert absence (no digits left) and
presence (a currency word somewhere), both of which the corruption satisfies.
The anchor is "not adjacent to a letter": digits stay adjacent on purpose so
"500.000VND" still reads as money.
"""

from __future__ import annotations

import re

# Any Unicode letter (\w minus digits and underscore). Used as the boundary for
# every replacement: a match may touch digits or punctuation, never a letter.
LETTER = r"[^\W\d_]"

# Uppercase Vietnamese alphabet, spelled out. `[A-ZÀ-Ỹ]` is wrong here — the
# precomposed Vietnamese block interleaves cases (Ề U+1EC0, ề U+1EC1), so a
# codepoint range silently admits lowercase letters.
_UPPER = (
    "A-Z"
    "ĐÀÁẢÃẠÂẦẤẨẪẬĂẰẮẲẴẶ"
    "ÈÉẺẼẸÊỀẾỂỄỆ"
    "ÌÍỈĨỊ"
    "ÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢ"
    "ÙÚỦŨỤƯỪỨỬỮỰ"
    "ỲÝỶỸỴ"
)

# Longest-first: "TP.HCM" must win over the "TP." prefix rule below, which in
# turn must win over "P." — otherwise "TP.Thu Duc" becomes "T" + "phuong ...".
_ABBREVIATIONS: tuple[tuple[str, str], ...] = (
    ("TP.HCM", "thành phố Hồ Chí Minh"),
    ("TPHCM", "thành phố Hồ Chí Minh"),
    ("TP.HN", "thành phố Hà Nội"),
    ("CMND", "chứng minh nhân dân"),
    ("CCCD", "căn cước công dân"),
    ("BĐS", "bất động sản"),
)

ABBREVIATION_PATTERNS: tuple[tuple[re.Pattern[str], str], ...] = tuple(
    (re.compile(rf"(?<!{LETTER}){re.escape(src)}(?!{LETTER})"), dst)
    for src, dst in _ABBREVIATIONS
)

# Prefix plus a value the reader still has to read: "Q.7" -> "quan " + "7".
# Order matters for the same reason as above. The third column pins what may
# FOLLOW the prefix for it to count as administrative: districts and wards are
# numbered (Q.7, P.15), the other levels are only ever named — and "H." followed
# by digits is a video codec (H.264 → "huyện 264", measured), not a district.
_NEXT_UPPER = rf"[{_UPPER}]"
_NEXT_DIGIT_OR_UPPER = rf"[\d{_UPPER}]"
_PREFIXES: tuple[tuple[str, str, str], ...] = (
    ("TP.", "thành phố ", _NEXT_UPPER),
    ("TT.", "thị trấn ", _NEXT_UPPER),
    ("Q.", "quận ", _NEXT_DIGIT_OR_UPPER),
    ("P.", "phường ", _NEXT_DIGIT_OR_UPPER),
    ("H.", "huyện ", _NEXT_UPPER),
)

# There is deliberately NO street rule here. "Đ." looks like the sibling
# prefixes above (Q., P., TP.) but is not like them: those are followed by a
# value that cannot be anything else, while "<số> đ. <Từ>" is the shape of a
# price ending a sentence AND of an address. Three rules tried to tell them
# apart and each read something wrong (S4 rounds 6, 11, 13). The reader now
# refuses the whole family instead — see _AMBIGUOUS_D in normalize_vi.py.

PREFIX_PATTERNS: tuple[tuple[re.Pattern[str], str], ...] = tuple(
    (re.compile(rf"(?<!{LETTER}){re.escape(src)}(?={nxt})"), dst)
    for src, dst, nxt in _PREFIXES
)

# The library understands "d" but not the currency sign, and silently drops the
# sign together with the word "dong" -- the single most expensive defect found
# in the 2026-08-19 measurement, because the result still reads as clean.
_CURRENCY_SIGNS: tuple[tuple[str, str], ...] = (
    ("₫", "đ"),
    ("VNĐ", "đồng"),
    ("VND", "đồng"),
)

# Case-insensitive for the same reason the bare "đ" mark is: price copy is
# written in whatever case the seller typed. Keeping these two anchors
# case-SENSITIVE while the sibling mark was opened up in round 4 left lowercase
# copy with the money relation switched off entirely — has_money() False, so the
# money-loss guard never ran and "Giá 2 triệu vnđ" reached the voice with the
# unit unspoken (S4 round 7). The ₫ sign has no case, so the flag is harmless
# for it. The LETTER anchors still carry the whole load against "VNDirect" —
# and now against "vndirect" too.
CURRENCY_SIGN_PATTERNS: tuple[tuple[re.Pattern[str], str], ...] = tuple(
    (re.compile(rf"(?<!{LETTER}){re.escape(src)}(?!{LETTER})", re.IGNORECASE), dst)
    for src, dst in _CURRENCY_SIGNS
)

CURRENCY_WORD = "đồng"
