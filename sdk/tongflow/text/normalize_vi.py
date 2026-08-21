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
    PREFIX_PATTERNS,
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

# A hyphen BETWEEN two numbers is a range in spoken Vietnamese. The library
# leaves the bare character in place ("muoi-muoi lam"), which a voice reads as
# a pause or a minus sign.
_RANGE = re.compile(r"(?<=\d)\s*-\s*(?=\d)")

# A dash in front of a number, once ranges are gone, is a minus sign.
_NEGATIVE = re.compile(r"(?<![\w])-(?=\d)")

# What must never survive into speech: digits, a currency sign, a percent
# sign, a hyphen still standing between two digits, or a colon GLUED to what
# follows it. The colon joined after measuring "ngày 14:30" → "ngày mười
# bốn:ba mươi": the library mis-parses the clock in that context and leaves
# the colon between WORDS. A first draft flagged EVERY colon — which also
# rejected ordinary prose punctuation ("Lưu ý: khai trương"), where the
# library keeps the colon legitimately (S4 round 2 finding). The two are
# separable by spacing: punctuation is always followed by whitespace, a
# mangled clock never is. It deliberately does NOT flag a hyphen between
# letters — the library writes real Vietnamese compounds that way
# ("ki-lo-met"), and flagging those rejects correct output.
_RESIDUAL = re.compile(r"[0-9₫%]+|(?<=\d)-(?=\d)|:(?=\S)")

# "Money is present" must be a precise test, not a substring search: the letter
# "d" alone appears inside ordinary words ("do", "dep"), so `"d" in text` marks
# every second Vietnamese sentence as a price. Measured: "-7 do" and "Can ho
# dep..." both tripped it before this was tightened. VNĐ/VND carry the same
# letter-boundary anchors as the dictionary replacement — without them,
# "VNDirect" counts as money going in, no currency word comes out, and the
# relational rule rejects a perfectly clean sentence.
_MONEY = re.compile(
    rf"₫"
    rf"|(?<!{LETTER})VNĐ(?!{LETTER})"
    rf"|(?<!{LETTER})VND(?!{LETTER})"
    rf"|(?<=\d)\s*đ\b"
    rf"|(?<=\d)\s*đồng\b"
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
    """
    return _MONEY.search(unicodedata.normalize("NFC", text)) is not None


def _pre(text: str) -> str:
    # Anchored patterns, never bare str.replace: "VNDirect" must not become
    # "đồngirect" and "H.264" must not become "huyện 264" — both measured,
    # see vi_dictionary's module docstring.
    out = unicodedata.normalize("NFC", text)
    for pattern, dst in ABBREVIATION_PATTERNS:
        out = pattern.sub(dst, out)
    for pattern, dst in PREFIX_PATTERNS:
        out = pattern.sub(dst, out)
    for pattern, dst in CURRENCY_SIGN_PATTERNS:
        out = pattern.sub(dst, out)
    out = _DASH_DATE.sub(r"\1/\2/\3", out)
    out = _DAY_WORD_BEFORE_DATE.sub("", out)
    out = _RANGE.sub(" đến ", out)
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
