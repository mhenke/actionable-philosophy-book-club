# ADR-0006: MEETINGS Manifest Location

**Status:** Superseded (2026-05-17) — manifest moved to `docs/manifest.json`
**Date:** 2026

## Decision

Keep the MEETINGS manifest as a JavaScript array inline in `dist/app.js`.

## Alternatives Considered

- `meetings/manifest.json` — would enable JSON Schema validation and non-developer contributions, but requires an async fetch at boot

## Rationale

- Zero-network-request first paint — the manifest is available immediately when the script executes
- No async loading complexity — avoids a fetch waterfall at startup
- The downsides (developer-only edits, no schema validation) are mitigated by CI checks that validate meeting directory existence and manifest structure

## Amendment (2026-05-17)

The manifest was moved from an inline JS array in `dist/app.js` to `docs/manifest.json`, inlined at build time by `scripts/inline-manifest.cjs`. This was done to:
- Enable non-developer contributions (JSON is easier to edit than JS)
- Allow JSON Schema validation in CI
- Keep the zero-network-request first paint benefit via build-time inlining

The runtime data flow is now: `docs/manifest.json` → `scripts/inline-manifest.cjs` → `src/_manifest.js` → concatenated into `dist/app.js`.
