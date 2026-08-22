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

# Đ. / Đ = Đường (street). Its siblings above expand a prefix GLUED to its
# value ("Q.7"), but a street name is separated by a space ("Đ. Lê Lợi"), so it
# needs a pattern that consumes that space instead of a lookahead.
#
# Placed with the address abbreviations, not as an exclusion inside the currency
# rules, because this pass runs BEFORE them: consuming the address form is what
# keeps it from reaching the money rewrite at all. Without it, the round-4
# case-insensitive currency mark read every such address as a price — measured
# on this branch, "Số 5 Đ. Lê Lợi" -> "số năm đồng. lê lợi" with ok=True, and
# both guards stayed green because nothing numeric survived and the money-loss
# relation found the "đồng" the rewrite had just injected (S4 round 6).
#
# The DOTTED form counts in either case, because "đ. Nguyễn Huệ" is ordinary
# listing copy. The UNDOTTED form is accepted only capitalised: a lowercase "đ"
# followed by a capitalised word is far more likely a price followed by a new
# sentence ("Giá 500 đ Bao gồm VAT") than a street.
#
# Known imperfection, stated rather than hidden: ALL-CAPS price copy that puts a
# capitalised word straight after the mark ("GIÁ 500 Đ MỘT THÁNG") reads as a
# street. The slash form the contract pins ("Đ/THÁNG") is unaffected.
STREET_PATTERN: tuple[re.Pattern[str], str] = (
    re.compile(rf"(?<!{LETTER})(?:(?i:đ)\.|Đ)[ \t]+(?=[{_UPPER}])"),
    "đường ",
)

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

CURRENCY_SIGN_PATTERNS: tuple[tuple[re.Pattern[str], str], ...] = tuple(
    (re.compile(rf"(?<!{LETTER}){re.escape(src)}(?!{LETTER})"), dst)
    for src, dst in _CURRENCY_SIGNS
)

CURRENCY_WORD = "đồng"
