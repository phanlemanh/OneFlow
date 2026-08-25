"""Deterministic Vietnamese text normalisation for the TTS hand-off.

Three layers: an OneFlow pre-pass that fixes what the pinned library
measurably gets wrong, the library itself, and a post-check that refuses to
hand a half-read string to a voice.

See docs/superpowers/specs/2026-08-19-normalize-text-vi-design.md for the
measurement this design is built on.
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass

from vietnormalizer import VietnameseNormalizer

from .vi_dictionary import (
    ABBREVIATION_PATTERNS,
    CURRENCY_SIGN_PATTERNS,
    CURRENCY_WORD,
    LETTER,
    AMBIGUOUS_D_PATTERN,
    PREFIX_PATTERNS,
    STREET_PATTERN,
)

_NORMALIZER = VietnameseNormalizer()

# A dash-separated date must be rewritten BEFORE the range rule below, or
# "19-08-2026" reads as "muoi chin den tam den hai nghin..." — measured.
_DASH_DATE = re.compile(r"\b(\d{1,2})-(\d{1,2})-(\d{4})\b")

# The library prefixes its OWN "ngày" when reading a full d/m/y date, so the
# extremely common written form "ngày 19/8/2026" came back as "ngày ngày mười
# chín..." — a voice says the word twice (measured, S4 round 2 finding). Drop
# the written word and let the library re-add it. Full dates only: a bare d/m
# reads WITHOUT the word (measured), so there the written "ngày" must stay.
_DAY_WORD_BEFORE_DATE = re.compile(r"(?i)\bngày\s+(?=\d{1,2}[/-]\d{1,2}[/-]\d{4}\b)")

# The SPACED price form "500 đ". has_money deliberately counts it as money
# ((?<=\d)\s*đ\b), but the pinned library only expands the GLUED form —
# measured: "50.000đ" → "…nghìn đồng" while "500 đ" leaves the "đ" verbatim.
# So without this rewrite every spaced-đ price failed the money-loss rule with
# ok=False, for one of the most common ways Vietnamese prices are written
# (S4 round 2 finding). Rewrite to the word the library understands.
# The magnitude words a price may carry between its digits and its currency
# mark. "5 tỷ đ" is ordinary sales copy, and every money rule below used to
# anchor on a digit IMMEDIATELY left of the "đ", so one word in between made
# all three layers miss at once (S4 round 5 finding, measured on this branch:
# "Giá 5 tỷ đ" → "giá năm tỷ đ", ok=True, price unspoken). Kept as one shared
# constant so the pre-pass, the money test and any later rule cannot drift
# apart the way the unit LIST did for ranges in round 4.
_MAGNITUDE_WORDS = ("nghìn", "ngàn", "triệu", "tỷ", "tỉ")
_MAGNITUDE = "(?:" + "|".join(_MAGNITUDE_WORDS) + ")"
# A lookbehind must be fixed-width, so the alternation is over whole lookbehind
# groups rather than inside one. BUILT from the tuple above, not retyped: the
# first version of this rule listed the five words a second time here, which is
# precisely the drift the comment above claims is structurally impossible
# (S4 round 6 finding — the reviewer read the claim and checked it).
_MAGNITUDE_BEHIND = "|".join(f"(?<={w})" for w in _MAGNITUDE_WORDS)

_SPACED_DONG = re.compile(
    rf"(?<=\d)\s+(?i:đ)\b"
    rf"|(?i:{_MAGNITUDE_BEHIND})\s*(?i:đ)\b"
)

# A hyphen BETWEEN two numbers is a range in spoken Vietnamese. The library
# leaves the bare character in place ("muoi-muoi lam"), which a voice reads as
# a pause or a minus sign, and "5%-10%" fell through to the MINUS rule below
# and read as "năm phần trămâm mười phần trăm" (measured, S4 round 2).
#
# Anchored on the NUMBER, with whatever unit token follows it carried along —
# NOT on a list of known unit signs. Two rounds in a row the sign list was the
# bug: "5%-10%" then "1.000 đ-2.000 đ" each had to be added by hand, and the
# corpus grew by CASE while AC-5 promises a CLASS, so the next member stayed
# silent. Measured before this rewrite, all with ok=True: "5 triệu - 10 triệu"
# → "năm triệu mười triệu", "5 tỷ - 10 tỷ", "5kg-10kg", "5 người - 10 người"
# (S4 round 4 finding). The unit group is any single letter-word, so a unit
# spelled as a sign (%, ₫), an abbreviation (đ) or a full word (triệu, kg,
# người) all take the same path; the right side still requires a digit, so a
# letter compound ("ki-lô-mét") cannot match.
_RANGE = re.compile(r"(?<=\d)(?P<unit>[ \t]*(?:%|₫|[^\W\d_][^\W_]{0,15})?)[ \t]*-[ \t]*(?=\d)")

# A dash in front of a number, once ranges are gone, is a minus sign.
# Amounts written the standard Vietnamese way. The pinned library reads the
# THOUSAND DOT correctly on its own ("1.999.000 ₫" → "một triệu chín trăm chín
# mươi chín nghìn đồng"); what it cannot read is the DECIMAL COMMA, and it
# fails silently in two different directions, neither leaving a digit behind
# for the post-check:
#   "3.000.000,00 đ" -> "ba.không.không đồng"   (words around a literal dot)
#   "3000000,00 đ"   -> "ba trăm triệu đồng"    (right shape, wrong SCALE)
# The second is the dangerous one — a confident, order-of-magnitude-wrong price
# spoken as success. Measured S4 round 5; owner raised scope 2026-08-22 rather
# than filing it as a known limit, because invoice copy is written this way and
# the failure direction is "speaks a wrong number", not "refuses to speak".
#
# Lifting the decimal part out into the word the library DOES read ("phẩy") is
# enough on its own; a companion rule stripping the thousand dots was written
# first and then deleted, because removing it left every matrix cell green —
# a rule no case can turn red is the exact shape of defect this feature keeps
# shipping (measured while proving the red direction, same day).
#
# One or two decimal places only. Three would be ambiguous with the ENGLISH
# thousand separator ("1,000"), which this rule must not silently re-scale.
_DECIMAL_COMMA = re.compile(r"(?<=\d),(\d{1,2})(?!\d)")


def _decimal_tail(match: re.Match[str]) -> str:
    # An all-zero fraction is not spoken in a Vietnamese price: "3.000.000,00 đ"
    # is read "ba triệu đồng", never "ba triệu phẩy không đồng".
    digits = match.group(1)
    return "" if set(digits) == {"0"} else f" phẩy {digits}"


_NEGATIVE = re.compile(r"(?<![\w])-(?=\d)")

# What must never survive into speech: digits, a currency sign, a percent sign,
# or a hyphen still standing between two digits. It deliberately does NOT flag a
# hyphen between letters — the library writes real Vietnamese compounds that way
# ("ki-lo-met"), and flagging those rejects correct output. The surviving-colon
# rule used to live here as a shape test; it is relational now, just below.
_RESIDUAL = re.compile(r"[0-9₫%]+|(?<=\d)-(?=\d)")

# The colon left over from a MANGLED CLOCK, decided relationally instead of by
# shape. The shape test `:(?=\S)` could not tell "mười bốn:ba mươi" (a clock the
# library mis-parsed) from "Ghi chú:Xem thêm" (a missing space after a colon in
# ordinary prose) — both are a colon glued between words — so it failed whole
# TTS chains over a typo in text carrying no number at all (S4 round 4 finding).
# What separates them is not the OUTPUT alone but the pair: a clock puts DIGITS
# on both sides of the colon going in, and when the library mis-parses it the
# colon comes back sitting between two WORDS. Both halves are required.
# Known imperfection, stated rather than hidden: an input that carries BOTH a
# real clock and a glued prose colon ("Ghi chú:Xem thêm lúc 14:30") still trips
# it. That errs toward refusing to speak, never toward speaking wrong content.
_CLOCK_IN = re.compile(r"\d\s*:\s*\d")
_COLON_BETWEEN_WORDS = re.compile(r"(?<=[^\W\d_]):(?=[^\W\d_])")

# "Money is present" must be a precise test, not a substring search: the letter
# "d" alone appears inside ordinary words ("do", "dep"), so `"d" in text` marks
# every second Vietnamese sentence as a price. Measured: "-7 do" and "Can ho
# dep..." both tripped it before this was tightened. VNĐ/VND carry the same
# letter-boundary anchors as the dictionary replacement — without them,
# "VNDirect" counts as money going in, no currency word comes out, and the
# relational rule rejects a perfectly clean sentence.
_MONEY = re.compile(
    rf"₫"
    # Case-insensitive, matching CURRENCY_SIGN_PATTERNS: these two anchors were
    # the last case-SENSITIVE money marks left, so lowercase price copy turned
    # the relational guard off entirely (S4 round 7).
    rf"|(?<!{LETTER})(?i:VNĐ)(?!{LETTER})"
    rf"|(?<!{LETTER})(?i:VND)(?!{LETTER})"
    # Case-insensitive on purpose, and only on these two: the sibling anchors
    # above always covered uppercase (VNĐ/VND), while "Giá 500 Đ" reported no
    # money at all — so the relational money-loss rule never ran and a bare "đ"
    # reached the voice with ok=True (S4 round 4 finding). ALL-CAPS price copy
    # is ordinary in the sales text this node exists for.
    rf"|(?<=\d)\s*(?i:đ)\b"
    # ...and the same mark standing after a magnitude word ("5 tỷ đ"), which
    # is a price by every reader's eye but had no digit to its left.
    rf"|(?i:{_MAGNITUDE})\s*(?i:đ)\b"
    rf"|(?<=\d)\s*(?i:đồng)\b"
)

# The library writes compound loanwords with hyphens ("ki-lo-met"), and reading
# its own output back splits them again ("ki lo met") — so the hyphen makes the
# function non-idempotent, which AC-7 forbids for a node that sits in every
# chain and may run twice. Settle it here, in the direction the library itself
# converges to.
_LETTER_HYPHEN = re.compile(r"(?<=[^\W\d_])-(?=[^\W\d_])")


@dataclass(frozen=True)
class NormalizeResult:
    """Outcome of one normalisation.

    `ok` is False whenever the text cannot be handed to a voice as-is; `residual`
    then names the exact tokens that stopped it, so the error message can be
    compared as a set rather than searched as a substring.
    """

    ok: bool
    text: str
    residual: tuple[str, ...]
    error: str | None = None


def has_money(text: str) -> bool:
    """True when the text really carries a price.

    Public because the corpus asserts the money relation and must use the SAME
    rule: a test that re-implements it loosely repeats the very bug this
    replaced — `"đ" in text` marks "độ" and "đẹp" as prices.

    Normalizes to NFC first: the `_MONEY` patterns are NFC literals, and this
    runs on the RAW input (before `_pre`'s own NFC step). Without it, an NFD
    string carrying a real price reports no money, and the relational
    money-loss rule below is silently skipped for exactly the inputs macOS
    tools like to produce — measured, S4 round 1 finding.

    Address abbreviations are removed FIRST, for the same reason the pre-pass
    consumes them before the currency rules: "Số 5 Đ. Lê Lợi" carries a digit
    followed by "Đ" and matched the money test, so the relational money-loss
    rule demanded a currency word from an address and rejected it (measured
    while fixing S4 round 6 — the street rewrite alone fixed the OUTPUT but
    left this test reading the raw string).
    """
    nfc = unicodedata.normalize("NFC", text)
    return _MONEY.search(STREET_PATTERN[0].sub(" ", nfc)) is not None


def _pre(text: str) -> str:
    # Anchored patterns, never bare str.replace: "VNDirect" must not become
    # "đồngirect" and "H.264" must not become "huyện 264" — both measured,
    # see vi_dictionary's module docstring.
    out = unicodedata.normalize("NFC", text)
    for pattern, dst in ABBREVIATION_PATTERNS:
        out = pattern.sub(dst, out)
    for pattern, dst in PREFIX_PATTERNS:
        out = pattern.sub(dst, out)
    # Before the currency rules on purpose — see STREET_PATTERN's comment.
    out = STREET_PATTERN[0].sub(STREET_PATTERN[1], out)
    for pattern, dst in CURRENCY_SIGN_PATTERNS:
        out = pattern.sub(dst, out)
    # Before every digit rule below: lift the decimal part into a word the
    # library can read. Runs early so the range and minus rules downstream see
    # plain digits either side of any dash.
    out = _DECIMAL_COMMA.sub(_decimal_tail, out)
    out = _DASH_DATE.sub(r"\1/\2/\3", out)
    out = _DAY_WORD_BEFORE_DATE.sub("", out)
    # ORDER IS LOAD-BEARING: the range rule runs BEFORE the spaced-đồng rewrite.
    # Reversed (as it shipped in 0.2.21) the rewrite turns "1.000 đ" into
    # "1.000 đồng" and destroys the very "đ" the range rule anchors on, so
    # "1.000 đ-2.000 đ" came back as "một nghìn đồng hai nghìn đồng" — range
    # word gone, ok=True, nothing red. Measured, S4 round 3 finding.
    out = _RANGE.sub(lambda m: f"{m.group('unit')} đến ", out)
    out = _SPACED_DONG.sub(" đồng", out)
    # Ranges are resolved first, so any dash still sitting in front of a number
    # is a minus sign. The library reads the digits but leaves the dash, and a
    # voice says nothing at all for it ("-bay do" — measured).
    return _NEGATIVE.sub("âm ", out)


def normalize_vi(text: str) -> NormalizeResult:
    """Read Vietnamese numbers, prices and dates out as words.

    Deterministic: the same input always yields the same bytes, and normalising
    an already-normalised string is a no-op.
    """
    if not text or not text.strip():
        return NormalizeResult(
            ok=False,
            text="",
            residual=(),
            error="Chuỗi vào rỗng — không có gì để đọc",
        )

    had_money = has_money(text)
    out = _LETTER_HYPHEN.sub(" ", _NORMALIZER.normalize(_pre(text)))
    out = unicodedata.normalize("NFC", out)

    residual = tuple(dict.fromkeys(m.group(0) for m in _RESIDUAL.finditer(out)))
    if _COLON_BETWEEN_WORDS.search(out) and _CLOCK_IN.search(text):
        residual = residual + (":",)
    # Relational, like the clock-colon rule above: decided on the INPUT, because
    # the output is lower-cased and the capital that makes "<số> Đ <TênHoa>"
    # ambiguous is gone by then.
    if AMBIGUOUS_D_PATTERN.search(unicodedata.normalize("NFC", text)):
        residual = residual + ("Đ",)
    if residual:
        return NormalizeResult(
            ok=False,
            text=out,
            residual=residual,
            error="Chưa đọc được: " + ", ".join(residual),
        )

    # Relational rule, not an absence rule. Money in must mean money word out:
    # the library drops the currency sign together with the word, and a pure
    # "no digits left" check stays green on exactly that failure.
    if had_money and CURRENCY_WORD not in out:
        return NormalizeResult(
            ok=False,
            text=out,
            residual=("<đơn vị tiền>",),
            error=(
                "Mất đơn vị tiền: chuỗi vào có ký hiệu tiền, "
                "chuỗi ra không có chữ 'đồng'"
            ),
        )

    return NormalizeResult(ok=True, text=out, residual=(), error=None)
