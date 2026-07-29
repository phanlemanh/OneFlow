import base64

from tongflow.engine.callog import normalize_call
from tongflow.engine.fingerprint import digest_form


def _asset(raw: bytes, file_key: str) -> dict:
    return {"file_key": file_key, "bytesBase64": base64.b64encode(raw).decode("ascii")}


def test_digest_form_matches_normalize_call():
    # AC-15. digest_form() must match normalize_call(...)["input"] across a
    # spread of input shapes, not just one simple case: an asset (digested as
    # {"__asset": "<sha256>"}, per callog.ASSET_DIGEST_KEY -- not the
    # {"__sha256": ...} shape D2 describes, which the Notes section records
    # as superseded by the shipped code), a None/empty field that gets
    # dropped, a nested list of assets, and at least two different slots. If
    # digest_form ever drifts from normalize_call, the conformance suite
    # polices one shape while the cache key uses another.

    # Shape 1: a plain asset field, a None field, and an empty-string field --
    # both of the latter must be omitted from the normalized output.
    bi_with_asset = {
        "text": "hello",
        "image": _asset(b"asset-bytes", "uploads/a.png"),
        "caption": None,
        "note": "",
    }
    assert digest_form("image-gen-video", bi_with_asset) == normalize_call("image-gen-video", bi_with_asset)["input"]

    # Shape 2: a nested list of assets under a different slot.
    bi_with_asset_list = {
        "images": [
            _asset(b"first-asset", "uploads/first.png"),
            _asset(b"second-asset", "uploads/second.png"),
        ],
        "prompt": "a gallery",
    }
    assert digest_form("image-compose", bi_with_asset_list) == normalize_call("image-compose", bi_with_asset_list)["input"]

    # Shape 3: a third slot, no assets at all, to confirm parity is not
    # accidental to shapes that happen to contain an asset.
    bi_plain = {"text": "hello", "duration": 5}
    assert digest_form("gen-text", bi_plain) == normalize_call("gen-text", bi_plain)["input"]

    # Shape 4: empty business_input.
    assert digest_form("gen-text", {}) == normalize_call("gen-text", {})["input"]
