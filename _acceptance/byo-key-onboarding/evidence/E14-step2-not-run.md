# E14 step 4 ("correct key confirmed") — not run, per this eval's own note

This verifier's assigned task says explicitly: "If and only if a legitimate real provider
credential is available to this run, enter it and capture evidence/E14-step2.png ... otherwise
report that half as not-run with the reason", and: "The 'correct key confirmed' half is out of a
verifier's reach (it must never read or type the user's real API keys), and is carried to the
human gate as a known limit, not treated as a defect."

This verifier session has no real OpenAI API key available. The safety rules governing this
verifier also independently prohibit entering any API key/credential into any field under any
circumstance, including one the operator might supply. No `evidence/E14-step2.png` was produced
this round.

## What step 1-3 DID establish (see evidence/E14-step1.png, E14-step1-dom.html, E14-network.txt)

- Reached the node's inline key form the same way as E12: a "Text" node feeding a "Text to Image"
  node (Implementation: OpenAI, Model: gpt-image-2) was added to the canvas, the OPENAI_API_KEY
  entry in the env store was reset to blank as the E12-style precondition, and pressing the node's
  own "Generate Image" run button surfaced the inline `node-key-OPENAI_API_KEY` form on the node
  itself (evidence/E14-precondition-needs-key.png) — no Settings dialog was ever opened.
- A deliberately wrong but WELL-FORMED key (`sk-proj-WRONGKEY9876543210zyxwvutsrqponmlkjihgfedcba9876`)
  was typed into that inline form and "Lưu và kiểm tra" (Save and verify) was pressed.
- The save triggered a real server round-trip: `PUT /api/settings/env` returned 200 in 428ms (dev
  server access log), which internally called `key-verify.ts`'s OpenAI prober
  (`fetch("https://api.openai.com/v1/models", ...)`) with the typed key and got back a real
  HTTP 401 from the provider.
- The UI rendered the `invalid` phase — `aria-invalid="true"` on the input, a `role="alert"`
  paragraph reading "Khoá chưa dùng được — Nhà cung cấp từ chối khoá này (HTTP 401)." — i.e. it
  reported the SERVER's verdict, not an optimistic client-side toast or a shape/regex check. This
  is the "provider that answered and rejected" branch named in this eval's Expected text.
- The "saved-unverified" branch (no prober / provider unreachable) was not separately exercised
  this round because OPENAI_API_KEY has a live prober in src/lib/onboarding/key-verify.ts and the
  sandbox had outbound network reachability to api.openai.com, so the call was actually answered.
