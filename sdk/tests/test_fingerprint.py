import base64
import hashlib
import importlib.util
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any

import pytest

from tongflow import __version__ as SDK_VERSION
from tongflow.engine.callog import normalize_call
from tongflow.engine.fingerprint import KEY_SCHEMA_VERSION, digest_form, node_fingerprint, sdk_major

_HEX64_RE = re.compile(r"^[0-9a-f]{64}$")
SDK_ROOT = Path(__file__).parent.parent
FINGERPRINT_SRC_PATH = SDK_ROOT / "tongflow" / "engine" / "fingerprint.py"
_SORT_KEYS_CALL = 'json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=True)'
_NO_SORT_KEYS_CALL = 'json.dumps(payload, separators=(",", ":"), ensure_ascii=True)'


def _assert_valid_key(key: object) -> None:
    """A cacheable fingerprint: a non-``None`` string of exactly 64 lowercase hex chars.

    Every criterion that compares two computed keys -- in either direction --
    must run both sides through this before comparing. In Python
    ``None == None`` is True and ``None != "<sha>"`` is True, so an
    implementation that unconditionally (or conditionally) returns ``None``
    can slip through a bare ``==``/``!=`` in either direction.
    """
    assert key is not None
    assert isinstance(key, str)
    assert _HEX64_RE.fullmatch(key) is not None


def _asset(raw: bytes, file_key: str) -> dict:
    return {"file_key": file_key, "bytesBase64": base64.b64encode(raw).decode("ascii")}


def _fp(**over):
    args = {
        "slot": "image-gen",
        "plugin_id": "oneflow-image",
        "plugin_rev": "a" * 40,
        "plugin_dirty": False,
        "tenant": "local",
        "abi_digest": "0" * 64,
        "model": None,
        "business_input": {"text": "a cat"},
        "workflow_scope": None,
    }
    args.update(over)
    return node_fingerprint(**args)


def _load_fingerprint_module_variant(*, strip_sort_keys: bool, tmp_dir: Path):
    """Load an independent, throwaway copy of fingerprint.py as its own module.

    Used only by the AC-16 mutation sub-guard below. digest_form() (via
    callog.normalize_call) recursively sorts every dict it touches BEFORE
    node_fingerprint ever calls json.dumps, so any assertion that goes
    through digest_form -- like the business_input equality checks in
    test_dict_key_insertion_order_does_not_change_key -- cannot discriminate
    whether node_fingerprint's OWN `sort_keys=True` does anything at all.
    Mutation-confirmed: deleting `sort_keys=True` from fingerprint.py leaves
    those assertions green. Loading a second module instance under a private
    name -- in a temp file, never the tracked one -- lets the test bypass
    digest_form entirely (by monkeypatching this loaded copy's own
    `digest_form` attribute) without ever touching the working tree or the
    real `tongflow.engine.fingerprint` module other tests rely on.
    """
    source = FINGERPRINT_SRC_PATH.read_text(encoding="utf-8")
    assert _SORT_KEYS_CALL in source, (
        "expected an exact `json.dumps(payload, sort_keys=True, ...)` call in "
        "fingerprint.py -- this sub-guard's string replacement relies on it."
    )
    if strip_sort_keys:
        source = source.replace(_SORT_KEYS_CALL, _NO_SORT_KEYS_CALL, 1)

    variant_path = tmp_dir / f"_fingerprint_variant_{'nosort' if strip_sort_keys else 'sorted'}.py"
    variant_path.write_text(source, encoding="utf-8")

    # Dotted, "tongflow.engine"-prefixed module name so importlib derives
    # `__package__ = "tongflow.engine"` automatically, letting the copy's own
    # `from .callog import normalize_call` resolve against the real,
    # already-imported callog module -- callog.py itself is never copied,
    # mutated, or re-executed.
    module_name = f"tongflow.engine.{variant_path.stem}"
    spec = importlib.util.spec_from_file_location(module_name, variant_path)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    try:
        spec.loader.exec_module(module)
    finally:
        del sys.modules[module_name]
    return module


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


def test_stable_across_processes_with_different_hashseed():
    # AC-1. Two calls inside one process share dict ordering, so they cannot
    # show stability "across runs" -- the DoD of this slice. `PYTHONHASHSEED`
    # does not reorder `dict` iteration (insertion-ordered since 3.7, never
    # hash-randomized) -- it only affects `set`/`frozenset` iteration order and
    # raw `hash()` values. Two interpreters with different seeds catch a key
    # that accidentally depends on `hash()`, `id()`, set iteration order, or
    # the system clock -- none of which are stable across processes.
    script = (
        "from tongflow.engine.fingerprint import node_fingerprint;"
        "print(node_fingerprint(slot='image-gen', plugin_id='oneflow-image',"
        "plugin_rev='a'*40, plugin_dirty=False, tenant='local',"
        "abi_digest='0'*64, model=None, workflow_scope=None,"
        "business_input={'text':'a cat','seed':7,'width':512}))"
    )
    keys = []
    for seed in ("0", "12345"):
        out = subprocess.run(
            [sys.executable, "-c", script],
            cwd=SDK_ROOT,
            capture_output=True,
            text=True,
            # Extend the parent's environment rather than replacing it: a
            # replaced env drops PATH/HOME (and, on Windows, SystemRoot,
            # which breaks CPython startup outright). `cwd=SDK_ROOT` makes
            # `PYTHONPATH=.` resolve to the sdk/ package root regardless of
            # the caller's own working directory.
            env={**os.environ, "PYTHONHASHSEED": seed, "PYTHONPATH": "."},
            check=True,
        )
        keys.append(out.stdout.strip())
    _assert_valid_key(keys[0])
    _assert_valid_key(keys[1])
    assert keys[0] == keys[1]


def test_business_input_field_diff_changes_key():
    # AC-2. The most basic discriminating face of the business_input digest.
    k1 = _fp(business_input={"text": "a cat"})
    k2 = _fp(business_input={"text": "a dog"})
    _assert_valid_key(k1)
    _assert_valid_key(k2)
    assert k1 != k2


def test_per_run_keys_stripped_do_not_change_key():
    # AC-3. Each of these keys alone was enough to blow the cache open (D2)
    # before being stripped. Test each of the five individually -- a
    # collective one-shot comparison across all five at once would still pass
    # if only four of the five were actually stripped, since the fifth key's
    # contribution could cancel out in the digest. Eval E3's prose demands
    # each key tested individually, not just collectively.
    baseline_business_input = {"text": "a cat"}
    k_baseline = _fp(business_input=baseline_business_input)
    _assert_valid_key(k_baseline)

    per_run_key_values = {
        "_tongflow": {"progressUrl": "https://example.com", "token": "tok"},
        "taskId": "task-123",
        "outputs": {"result": "out"},
        "level": 1,
        "dependencies": ["node-a", "node-b"],
    }
    for per_run_key, per_run_value in per_run_key_values.items():
        business_input_with_one_key = {**baseline_business_input, per_run_key: per_run_value}
        k_with_one_key = _fp(business_input=business_input_with_one_key)
        _assert_valid_key(k_with_one_key)
        assert k_baseline == k_with_one_key, f"per-run key {per_run_key!r} was not stripped"

    # Strictly more than the eval asks: all five at once, kept as an
    # additional assertion on top of the individual checks above.
    business_input_with_all_keys = {**baseline_business_input, **per_run_key_values}
    k_with_all_keys = _fp(business_input=business_input_with_all_keys)
    _assert_valid_key(k_with_all_keys)
    assert k_baseline == k_with_all_keys


def test_asset_same_bytes_diff_file_key_same_key():
    # AC-4. This is what D1 buys by hashing after materialize_asset_inputs.
    k1 = _fp(business_input={"text": "a cat", "image": _asset(b"asset-bytes", "uploads/a.png")})
    k2 = _fp(business_input={"text": "a cat", "image": _asset(b"asset-bytes", "uploads/b.png")})
    _assert_valid_key(k1)
    _assert_valid_key(k2)
    assert k1 == k2


def test_asset_same_file_key_diff_bytes_changes_key():
    # AC-5. The exact bug D1 exists to prevent: keying by reference would hit
    # a stale cache entry.
    k1 = _fp(business_input={"text": "a cat", "image": _asset(b"bytes-one", "uploads/a.png")})
    k2 = _fp(business_input={"text": "a cat", "image": _asset(b"bytes-two", "uploads/a.png")})
    _assert_valid_key(k1)
    _assert_valid_key(k2)
    assert k1 != k2


def test_missing_plugin_rev_is_not_cacheable():
    # AC-6. R1: without a rev, editing plugin code leaves the key unchanged
    # and the cache serves the old version's result. None forces L2's caller
    # to handle it -- pyright flags `str | None` used as `str`.
    assert _fp(plugin_rev=None) is None
    assert _fp(plugin_rev="") is None


def test_dirty_plugin_is_not_cacheable():
    # AC-7. Closes the "L1 blocking condition" conformance-l0 recorded at
    # Gate 2: `git rev-parse HEAD` cannot see an uncommitted edit, so a
    # hand-modified plugin keeps its old pluginRev and the cache serves the
    # stale result forever. plugin_dirty=True forces "not cacheable"
    # regardless of whether plugin_rev looks valid.
    assert _fp(plugin_dirty=True) is None
    assert _fp(plugin_rev=None, plugin_dirty=True) is None
    assert _fp(plugin_rev="", plugin_dirty=True) is None

    # plugin_dirty has no default -- omitting it must raise TypeError, not
    # silently degrade to False (a flag that can be forgotten is not "always
    # computed"). Every other required kwarg (including the new
    # workflow_scope) is passed explicitly so this guard stays isolated to
    # the one kwarg under test -- omitting more than one here would let a
    # missing-workflow_scope regression hide behind this same assertion.
    with pytest.raises(TypeError):
        node_fingerprint(  # type: ignore[call-arg]
            slot="image-gen",
            plugin_id="oneflow-image",
            plugin_rev="a" * 40,
            tenant="local",
            abi_digest="0" * 64,
            model=None,
            business_input={"text": "a cat"},
            workflow_scope=None,
        )

    # tenant has no default -- omitting it must raise TypeError.
    with pytest.raises(TypeError):
        node_fingerprint(  # type: ignore[call-arg]
            slot="image-gen",
            plugin_id="oneflow-image",
            plugin_rev="a" * 40,
            plugin_dirty=False,
            abi_digest="0" * 64,
            model=None,
            business_input={"text": "a cat"},
            workflow_scope=None,
        )

    # abi_digest has no default -- omitting it must raise TypeError.
    with pytest.raises(TypeError):
        node_fingerprint(  # type: ignore[call-arg]
            slot="image-gen",
            plugin_id="oneflow-image",
            plugin_rev="a" * 40,
            plugin_dirty=False,
            tenant="local",
            model=None,
            business_input={"text": "a cat"},
            workflow_scope=None,
        )

    # workflow_scope has no default -- omitting it must raise TypeError, just
    # like every other required kwarg above. This is the guard L2's Task 1
    # review caught missing: adding a new required kwarg without a dedicated
    # omit-only-this-one case leaves that kwarg's "always computed, never
    # silently assumed" contract unverified.
    with pytest.raises(TypeError):
        node_fingerprint(  # type: ignore[call-arg]
            slot="image-gen",
            plugin_id="oneflow-image",
            plugin_rev="a" * 40,
            plugin_dirty=False,
            tenant="local",
            abi_digest="0" * 64,
            model=None,
            business_input={"text": "a cat"},
        )


def test_plugin_rev_diff_changes_key():
    # AC-8. Both calls have a valid, non-dirty plugin_rev, so both must
    # return a real key.
    k1 = _fp(plugin_rev="a" * 40, plugin_dirty=False)
    k2 = _fp(plugin_rev="b" * 40, plugin_dirty=False)
    _assert_valid_key(k1)
    _assert_valid_key(k2)
    assert k1 != k2


def test_slot_diff_changes_key():
    # AC-9. If slot were dropped from the hashed dict, two different slots
    # sharing identical business input would cross-hit the cache -- a wrong
    # result at L2 that no other criterion here would catch.
    k1 = _fp(slot="image-gen")
    k2 = _fp(slot="video-gen")
    _assert_valid_key(k1)
    _assert_valid_key(k2)
    assert k1 != k2


def test_plugin_id_diff_changes_key():
    # AC-10. Same hole as AC-9, different key component: dropping pluginId
    # would let two different plugin implementations of the same slot share
    # a cache entry.
    k1 = _fp(plugin_id="oneflow-image")
    k2 = _fp(plugin_id="other-image-plugin")
    _assert_valid_key(k1)
    _assert_valid_key(k2)
    assert k1 != k2


def test_model_none_vs_value_changes_key():
    # AC-11. model=None is a valid model value (node.model | null per spec),
    # not a "not cacheable" condition -- an implementation that treats it like
    # a missing plugin_rev would make every model-less node permanently
    # uncacheable while still passing a bare k1 != k2 check.
    k1 = _fp(model=None)
    k2 = _fp(model="flux-dev")
    _assert_valid_key(k1)
    _assert_valid_key(k2)
    assert k1 != k2


def test_sdk_version_patch_same_minor_diff():
    # AC-12, three parts.
    # Part 1: a patch bump keeps the key (R6 accepts a schema-level SDK
    # change invalidating the cache, but a patch release should not).
    k_patch_a = _fp(sdk_version="0.2.17")
    k_patch_b = _fp(sdk_version="0.2.18")
    _assert_valid_key(k_patch_a)
    _assert_valid_key(k_patch_b)
    assert k_patch_a == k_patch_b

    # Part 2: a minor bump changes the key.
    k_minor_a = _fp(sdk_version="0.2.17")
    k_minor_b = _fp(sdk_version="0.3.0")
    _assert_valid_key(k_minor_a)
    _assert_valid_key(k_minor_b)
    assert k_minor_a != k_minor_b

    # Part 3: the default path (no sdk_version passed) must derive sdkMajor
    # from the real tongflow.__version__, not a meaningless fallback like
    # "0.0". Comparing against an explicit call using the actual installed
    # version -- rather than hardcoding "0.2.17" -- keeps this assertion
    # honest as the SDK version changes, while still catching a default path
    # that is broken (e.g. always returns "0.0").
    k_default = _fp()
    k_explicit_current = _fp(sdk_version=SDK_VERSION)
    _assert_valid_key(k_default)
    _assert_valid_key(k_explicit_current)
    assert k_default == k_explicit_current

    # Part 4: sdk_major() directly, not only transitively through
    # node_fingerprint(). Every assertion about sdkMajor above goes through
    # node_fingerprint(), which only makes this criterion's third clause true
    # transitively -- and leaves sdk_major()'s own ValueError branch for a
    # malformed version string untested.
    assert sdk_major("0.2.17") == "0.2"
    assert sdk_major("0.2.18") == "0.2"
    assert sdk_major("0.3.0") == "0.3"

    # Default path: derive the expectation from the real installed version
    # instead of hardcoding "0.2" -- an SDK bump must not falsely redden this.
    expected_default_major = ".".join(SDK_VERSION.split(".")[:2])
    assert sdk_major() == expected_default_major

    # A malformed version string (no "." at all) must raise, not silently
    # return a garbage major.minor.
    with pytest.raises(ValueError):
        sdk_major("1")


def test_tenant_participates_in_the_key():
    # AC-9's unit half. Two tenants, everything else identical.
    a = _fp(tenant="user:a")
    b = _fp(tenant="user:b")
    _assert_valid_key(a)
    _assert_valid_key(b)
    assert a != b


def test_missing_tenant_is_not_cacheable():
    # AC-8's unit half. Empty string and None are both "not declared"; the
    # single-tenant OSS build must send an explicit sentinel instead.
    assert _fp(tenant="") is None
    assert _fp(tenant=None) is None


def test_abi_digest_participates_in_the_key():
    # AC-13's unit half. The ABI is an input to the computation: both
    # materialize_asset_inputs and convert_asset_outputs_to_file_refs read it.
    a = _fp(abi_digest="a" * 64)
    b = _fp(abi_digest="b" * 64)
    _assert_valid_key(a)
    _assert_valid_key(b)
    assert a != b


def test_workflow_scope_emitted_unconditionally():
    # AC-7. workflow_scope is a REQUIRED keyword and None is a legitimate
    # value (tier A), not a "not cacheable" bail like `tenant` or
    # `plugin_rev`. The key schema invariant carried over from L1 is that
    # every payload component is emitted unconditionally -- no field is ever
    # *absent* depending on a value -- so tier A's canonical JSON blob must
    # contain the literal `"workflowScope":null`, not omit the key entirely.
    # A bare key-comparison (`k1 != k2`) cannot tell "field present but null"
    # apart from "field absent"; only inspecting the actual serialized string
    # before hashing can, which is why this test rebuilds that string itself
    # rather than trusting the hash alone.
    slot = "image-gen"
    plugin_id = "oneflow-image"
    plugin_rev = "a" * 40
    tenant = "local"
    abi_digest = "0" * 64
    business_input = {"text": "a cat"}

    payload_tier_a = {
        "v": KEY_SCHEMA_VERSION,
        "slot": slot,
        "pluginId": plugin_id,
        "pluginRev": plugin_rev,
        "tenant": tenant,
        "abiDigest": abi_digest,
        "model": None,
        "sdkMajor": sdk_major(SDK_VERSION),
        "input": digest_form(slot, business_input),
        "workflowScope": None,
    }
    blob_tier_a = json.dumps(payload_tier_a, sort_keys=True, separators=(",", ":"), ensure_ascii=True)
    assert '"workflowScope":null' in blob_tier_a, (
        "tier A's canonical JSON blob must contain the literal "
        '"workflowScope":null -- the field present but null -- not omit the '
        "key entirely."
    )

    k_tier_a = _fp(
        slot=slot,
        plugin_id=plugin_id,
        plugin_rev=plugin_rev,
        plugin_dirty=False,
        tenant=tenant,
        abi_digest=abi_digest,
        model=None,
        business_input=business_input,
        workflow_scope=None,
    )
    _assert_valid_key(k_tier_a)
    assert k_tier_a == hashlib.sha256(blob_tier_a.encode("utf-8")).hexdigest()

    # Same input, only workflow_scope differs (None vs a tier-B scope
    # string) -> two different keys, both passing _assert_valid_key.
    k_tier_b = _fp(
        slot=slot,
        plugin_id=plugin_id,
        plugin_rev=plugin_rev,
        plugin_dirty=False,
        tenant=tenant,
        abi_digest=abi_digest,
        model=None,
        business_input=business_input,
        workflow_scope="wf:1:node:n1",
    )
    _assert_valid_key(k_tier_b)
    assert k_tier_a != k_tier_b


def test_dict_key_insertion_order_does_not_change_key():
    # AC-16. Python dict equality ignores insertion order, but serializing
    # without sort_keys would still hash two "equal" dicts to different byte
    # strings -- a real instability that AC-15 (content parity, not
    # serialization order) does not check. This would make the key depend on
    # how the caller happened to build the object, causing permanent
    # cache-misses -- exactly what L1's "stable across runs" DoD forbids.
    bi_1 = {"text": "a cat", "seed": 7, "width": 512}
    bi_2 = {}
    bi_2["width"] = 512
    bi_2["text"] = "a cat"
    bi_2["seed"] = 7
    assert bi_1 == bi_2  # sanity: same content, different insertion order

    k1 = _fp(business_input=bi_1)
    k2 = _fp(business_input=bi_2)
    _assert_valid_key(k1)
    _assert_valid_key(k2)
    assert k1 == k2

    # Mutation sub-guard, added after mutation testing showed the assertions
    # above pass unchanged even with `sort_keys=True` deleted from
    # fingerprint.py's json.dumps call: digest_form() (via
    # callog.normalize_call) already sorts business_input's keys, recursively,
    # before node_fingerprint ever serializes anything, so the check above
    # only re-proves normalize_call's own sorting -- something conformance-l0
    # already covers -- not that node_fingerprint's OWN serialization
    # normalizes order "rather than hashing raw dict iteration order" (E16's
    # wording). To prove that specifically, bypass digest_form and hand
    # node_fingerprint's own json.dumps call two same-content,
    # different-insertion-order dicts directly.
    order_a: dict[str, Any] = {}
    order_a["zeta"] = 1
    order_a["alpha"] = 2
    order_b: dict[str, Any] = {}
    order_b["alpha"] = 2
    order_b["zeta"] = 1
    assert order_a == order_b
    assert list(order_a) != list(order_b)  # sanity: genuinely different insertion order

    def _keys_bypassing_digest_form(module) -> tuple[str | None, str | None]:
        # Bypass digest_form/normalize_call's sorting entirely: hand back
        # business_input completely unchanged, so whatever insertion order it
        # arrives in is exactly what reaches this module's own json.dumps call.
        module.digest_form = lambda slot, business_input: business_input
        key_a = module.node_fingerprint(
            slot="image-gen",
            plugin_id="oneflow-image",
            plugin_rev="a" * 40,
            plugin_dirty=False,
            tenant="local",
            abi_digest="0" * 64,
            model=None,
            workflow_scope=None,
            business_input=order_a,
        )
        key_b = module.node_fingerprint(
            slot="image-gen",
            plugin_id="oneflow-image",
            plugin_rev="a" * 40,
            plugin_dirty=False,
            tenant="local",
            abi_digest="0" * 64,
            model=None,
            workflow_scope=None,
            business_input=order_b,
        )
        return key_a, key_b

    with tempfile.TemporaryDirectory(prefix="fingerprint-ac16-") as tmp:
        tmp_path = Path(tmp)

        sorted_module = _load_fingerprint_module_variant(strip_sort_keys=False, tmp_dir=tmp_path)
        sorted_key_a, sorted_key_b = _keys_bypassing_digest_form(sorted_module)
        _assert_valid_key(sorted_key_a)
        _assert_valid_key(sorted_key_b)
        assert sorted_key_a == sorted_key_b, (
            "sort_keys=True is present but node_fingerprint still produced "
            "different keys for two dicts with identical content but "
            "different insertion order"
        )

        nosort_module = _load_fingerprint_module_variant(strip_sort_keys=True, tmp_dir=tmp_path)
        nosort_key_a, nosort_key_b = _keys_bypassing_digest_form(nosort_module)
        _assert_valid_key(nosort_key_a)
        _assert_valid_key(nosort_key_b)
        assert nosort_key_a != nosort_key_b, (
            "removing sort_keys=True from fingerprint.py's json.dumps call did "
            "not change the key for two dicts with identical content but "
            "different insertion order -- this sub-guard is vacuous"
        )
