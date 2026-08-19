"""Golden corpus and invariants for the Vietnamese reader (AC-2..AC-8).

Every expected string here is what VIETNAMESE says, checked against the pinned
library rather than copied from it. Where the two disagree the fix goes into
tongflow/text/, never into a case: a corpus edited to match the library is a
corpus that can no longer catch the library.
"""

from __future__ import annotations

import unicodedata

from tongflow.text.normalize_vi import has_money, normalize_vi

# --------------------------------------------------------------------------
# AC-2 — numbers and money, as a full matrix declared BEFORE the cases.
# --------------------------------------------------------------------------

MONEY_VARIANTS = ("linh", "lẻ", "mốt", "lăm", "mươi")
MONEY_POSITIONS = ("chục", "trăm", "nghìn", "triệu", "tỷ")

CORPUS_MONEY: tuple[tuple[str, str], ...] = (
    ("41 căn hộ", "bốn mươi mốt căn hộ"),
    ("21 tầng", "hai mươi mốt tầng"),
    ("15 phút", "mười lăm phút"),
    ("105 m2", "một trăm lẻ năm mét vuông"),
    ("125.000 đồng", "một trăm hai mươi lăm nghìn đồng"),
    ("1.999.000₫", "một triệu chín trăm chín mươi chín nghìn đồng"),
    ("50.000đ", "năm mươi nghìn đồng"),
    ("3 tỷ 2", "ba tỷ hai"),
    ("2,5 tỷ", "hai phẩy năm tỷ"),
    ("-7 độ", "âm bảy độ"),
    ("15%", "mười lăm phần trăm"),
)
MONEY_COUNT = 11

# Which matrix cells each case is claimed to cover. Written by hand: deriving
# this from the expected string would only make the matrix agree with itself.
MONEY_MATRIX_CELLS: dict[str, tuple[tuple[str, str], ...]] = {
    "41 căn hộ": (("mốt", "chục"),),
    "21 tầng": (("mốt", "chục"),),
    "15 phút": (("lăm", "chục"),),
    "105 m2": (("lẻ", "trăm"), ("linh", "trăm")),
    "125.000 đồng": (("lăm", "nghìn"), ("mươi", "chục")),
    "1.999.000₫": (("mươi", "triệu"), ("mươi", "trăm")),
    "50.000đ": (("mươi", "nghìn"),),
    "3 tỷ 2": (("mươi", "tỷ"),),
}

# Cells that cannot exist in Vietnamese — "mốt" never lands on a bare hundred,
# "linh"/"lẻ" only bridge a missing tens digit. Listed explicitly so the matrix
# stays honest instead of quietly shrinking to whatever the corpus happens to
# cover.
KNOWN_EMPTY_MONEY_CELLS: frozenset[tuple[str, str]] = frozenset(
    {
        ("linh", "chục"),
        ("linh", "nghìn"),
        ("linh", "triệu"),
        ("linh", "tỷ"),
        ("lẻ", "chục"),
        ("lẻ", "nghìn"),
        ("lẻ", "triệu"),
        ("lẻ", "tỷ"),
        ("mốt", "trăm"),
        ("mốt", "nghìn"),
        ("mốt", "triệu"),
        ("mốt", "tỷ"),
        ("lăm", "trăm"),
        ("lăm", "triệu"),
        ("lăm", "tỷ"),
    }
)


def test_numbers_and_money_golden() -> None:
    assert len(CORPUS_MONEY) == MONEY_COUNT

    covered = {cell for cells in MONEY_MATRIX_CELLS.values() for cell in cells}
    missing = [
        (variant, position)
        for variant in MONEY_VARIANTS
        for position in MONEY_POSITIONS
        if (variant, position) not in covered
        and (variant, position) not in KNOWN_EMPTY_MONEY_CELLS
    ]
    assert not missing, f"Ô ma trận chưa có ca nào: {missing}"

    for raw, expected in CORPUS_MONEY:
        got = normalize_vi(raw)
        assert got.ok is True, f"{raw!r} → {got.error}"
        assert got.text == expected, f"{raw!r}: mong {expected!r}, nhận {got.text!r}"


# --------------------------------------------------------------------------
# AC-3 / AC-4 — time, identifiers, units, administrative abbreviations.
# --------------------------------------------------------------------------

CORPUS_TIME: tuple[tuple[str, str], ...] = (
    (
        "19/8/2026",
        "ngày mười chín tháng tám năm hai nghìn không trăm hai mươi sáu",
    ),
    (
        "19-08-2026",
        "ngày mười chín tháng tám năm hai nghìn không trăm hai mươi sáu",
    ),
    ("14:30", "mười bốn giờ ba mươi phút"),
    ("25-26/12", "hai mươi lăm đến hai mươi sáu tháng mười hai"),
)
TIME_COUNT = 4

CORPUS_ID: tuple[tuple[str, str], ...] = (
    ("0901234567", "không chín không một hai ba bốn năm sáu bảy"),
    ("85m2", "tám mươi lăm mét vuông"),
    ("60 km/h", "sáu mươi ki lô mét trên giờ"),
    ("TP.HCM", "thành phố hồ chí minh"),
    ("TP.Thủ Đức", "thành phố thủ đức"),
    ("Q.7", "quận bảy"),
    ("P.Bến Nghé", "phường bến nghé"),
)
ID_COUNT = 7


def test_datetime_golden() -> None:
    assert len(CORPUS_TIME) == TIME_COUNT
    for raw, expected in CORPUS_TIME:
        got = normalize_vi(raw)
        assert got.ok is True, f"{raw!r} → {got.error}"
        assert got.text == expected, f"{raw!r}: mong {expected!r}, nhận {got.text!r}"


def test_identifiers_units_abbrev_golden() -> None:
    assert len(CORPUS_ID) == ID_COUNT
    for raw, expected in CORPUS_ID:
        got = normalize_vi(raw)
        assert got.ok is True, f"{raw!r} → {got.error}"
        assert got.text == expected, f"{raw!r}: mong {expected!r}, nhận {got.text!r}"
        # No abbreviation dot may survive into speech.
        assert "." not in got.text, f"{raw!r}: còn dấu chấm viết tắt trong {got.text!r}"


# --------------------------------------------------------------------------
# AC-5 — the three ambiguous readings, pinned as product constants.
# --------------------------------------------------------------------------

CORPUS_AMBIGUOUS: tuple[tuple[str, str], ...] = (
    ("5/3", "năm tháng ba"),
    ("1.500", "một nghìn năm trăm"),
    ("10-15", "mười đến mười lăm"),
)

AMBIGUOUS_CARRIERS = ("Khai trương {}", "Giá {} nhé anh", "{}")


def test_ambiguous_policy_pinned() -> None:
    for raw, expected in CORPUS_AMBIGUOUS:
        assert normalize_vi(raw).text == expected

    # The contract calls these CONSTANTS, so the same fragment must read the
    # same way in every carrier sentence — that is the measurable half of
    # "does not depend on sentence context".
    for raw, expected in CORPUS_AMBIGUOUS:
        counts = {
            normalize_vi(carrier.format(raw)).text.count(expected)
            for carrier in AMBIGUOUS_CARRIERS
        }
        assert counts == {1}, f"{raw!r} đọc khác nhau theo câu: {counts}"


# --------------------------------------------------------------------------
# AC-6 — the two halves of the post-check, on ONE fixture family.
# --------------------------------------------------------------------------

# A real string the library mis-parses: it reads "9001:2015" as a clock time and
# leaves two digit runs behind. Product codes like this appear in sales copy.
RESIDUAL_FIXTURE_BROKEN = "Đạt chuẩn ISO 9001:2015"
RESIDUAL_FIXTURE_CLEAN = "Căn hộ giá 1.999.000₫"


def test_residual_tokens_fail_and_are_listed() -> None:
    got = normalize_vi(RESIDUAL_FIXTURE_BROKEN)
    assert got.ok is False
    # Compared as a SET of tokens, not as a substring of the message: "the error
    # mentions it somewhere" is a weaker promise than "the error names exactly
    # what was left over".
    assert set(got.residual) == {"90", "15"}
    for token in got.residual:
        assert token in (got.error or "")


def test_clean_input_has_no_digits_left() -> None:
    got = normalize_vi(RESIDUAL_FIXTURE_CLEAN)
    assert got.ok is True
    assert not any(ch.isdigit() for ch in got.text)
    assert "₫" not in got.text and "%" not in got.text
    # Relational half. A pure absence rule stays green when the library silently
    # EATS the currency word, which is the measured 0.2.3 defect: "1.999.000₫"
    # came back as "...chin muoi chin nghin" with no "dong" and no digits.
    assert "đồng" in got.text
    # Uses the implementation's own money test on purpose. Re-deciding "is this
    # a price?" inside the test is how the first draft of this file repeated the
    # exact bug it was meant to catch: `"đ" in raw` calls "-7 độ" a price.
    for raw, _ in CORPUS_MONEY:
        result = normalize_vi(raw)
        if result.ok and has_money(raw):
            assert "đồng" in result.text, f"{raw!r} mất đơn vị tiền"


# --------------------------------------------------------------------------
# AC-7 — determinism and idempotence over the WHOLE corpus.
# --------------------------------------------------------------------------

ALL_CORPUS = CORPUS_MONEY + CORPUS_TIME + CORPUS_ID + CORPUS_AMBIGUOUS


def test_idempotent_and_byte_identical() -> None:
    for raw, _ in ALL_CORPUS:
        once = normalize_vi(raw)
        assert normalize_vi(raw).text == once.text, f"{raw!r} không tất định"
        twice = normalize_vi(once.text)
        assert twice.text == once.text, f"{raw!r} không idempotent: {twice.text!r}"


# --------------------------------------------------------------------------
# AC-8 — edges, and the Unicode form the voice actually receives.
# --------------------------------------------------------------------------

PLAIN = "Căn hộ đẹp không có số nào cả"
LONG_INPUT = "Giá 5 tỷ. " * 1000


def test_edge_inputs() -> None:
    for empty in ("", "   ", "\n\t"):
        got = normalize_vi(empty)
        assert got.ok is False and "rỗng" in (got.error or "")

    # Plain prose comes back unchanged EXCEPT for case: the library lowercases,
    # and capital letters carry no sound. Compared byte-for-byte, not "roughly".
    plain = normalize_vi(PLAIN)
    assert plain.ok is True
    assert plain.text == PLAIN.lower()

    assert normalize_vi(LONG_INPUT).ok is True

    for messy in ("Xem tại https://a.vn nhé", "Mail: a@b.vn", "Đẹp quá 😍"):
        normalize_vi(messy)  # must not raise

    # Unicode form is the other half of Gate G1's "no broken diacritics", so it
    # is asserted as a RELATION between the two encodings — not as "did not
    # crash". A fixture typed on the same machine as the reader would otherwise
    # agree with itself in whichever form that machine happens to use.
    for raw, _ in ALL_CORPUS + ((PLAIN, ""),):
        got = normalize_vi(raw)
        assert unicodedata.is_normalized("NFC", got.text), f"{raw!r} ra không phải NFC"
        decomposed = unicodedata.normalize("NFD", raw)
        assert normalize_vi(decomposed).text == got.text, f"{raw!r} lệch giữa NFC và NFD"
