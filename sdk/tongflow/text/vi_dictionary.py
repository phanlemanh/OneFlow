"""Domain vocabulary the upstream library does not cover.

Measured against vietnormalizer 0.2.3 on 2026-08-19: it spells "TP.HCM" out
letter by letter ("tê pê.hát xê em") and leaves "Q.7" as "q.bảy", so
administrative abbreviations are ours to expand. Everything here is a
plugin-internal constant, never an ABI field (CLAUDE.md, ABI hygiene).
"""

from __future__ import annotations

# Longest-first: "TP.HCM" must win over the "TP." prefix rule below, which in
# turn must win over "P." — otherwise "TP.Thu Duc" becomes "T" + "phuong ...".
ABBREVIATIONS: tuple[tuple[str, str], ...] = (
    ("TP.HCM", "thành phố Hồ Chí Minh"),
    ("TPHCM", "thành phố Hồ Chí Minh"),
    ("TP.HN", "thành phố Hà Nội"),
    ("CMND", "chứng minh nhân dân"),
    ("CCCD", "căn cước công dân"),
    ("BĐS", "bất động sản"),
)

# Prefix plus a value the reader still has to read: "Q.7" -> "quan " + "7".
# Order matters for the same reason as above.
PREFIXES: tuple[tuple[str, str], ...] = (
    ("TP.", "thành phố "),
    ("TT.", "thị trấn "),
    ("Q.", "quận "),
    ("P.", "phường "),
    ("H.", "huyện "),
)

# The library understands "d" but not the currency sign, and silently drops the
# sign together with the word "dong" -- the single most expensive defect found
# in the 2026-08-19 measurement, because the result still reads as clean.
CURRENCY_SIGNS: tuple[tuple[str, str], ...] = (
    ("₫", "đ"),
    ("VNĐ", "đồng"),
    ("VND", "đồng"),
)

CURRENCY_MARKERS: tuple[str, ...] = ("₫", "đ", "VNĐ", "VND")
CURRENCY_WORD = "đồng"
