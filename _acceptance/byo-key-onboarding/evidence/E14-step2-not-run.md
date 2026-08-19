# E14 step 4 — not run (by design, per this eval's own note)

The eval's Expected text says explicitly: "obtaining a genuine working provider credential is
out of this verifier's reach (it must never read or type the user's real API keys), so the
'correct key confirmed' half may be reported as not-run — that is expected and is carried to
the human gate, not a defect to work around."

This verifier session has no real OpenAI API key available, and the safety rules governing this
verifier prohibit entering any API key/credential into a field under any circumstance, including
one supplied by the operator. No `evidence/E14-step2.png` was produced.

What step 1-3 DID establish (see evidence/E14-step1.html and evidence/E14-network.txt):
- A deliberately wrong but well-formed key (`sk-proj-FAKEKEY1234...`) was entered at the node's
  inline key form and saved.
- The save triggered a real server round-trip: `PUT /api/settings/env` (200 OK), which internally
  called `POST https://api.openai.com/v1/models` with the fake key and got back HTTP 401.
- The UI rendered the `invalid` phase (red border, role="alert", text: "Khoá chưa dùng được — Nhà
  cung cấp từ chối khoá này (HTTP 401).") — i.e. it reported the SERVER's verdict, not an
  optimistic client-side toast. This is the "provider that answered and rejected" branch named in
  this eval's Expected text.
- The "saved-unverified" branch (no prober / provider unreachable) was not separately exercised
  this round because OPENAI_API_KEY has a live prober in src/lib/onboarding/key-verify.ts and the
  sandbox had outbound network reachability to api.openai.com, so the call was actually answered.
