# ADR-0010: Manifest Loading Resilience

**Status:** Accepted (partially superseded — manifest is now inlined at build time)
**Date:** 2026-05-18
**Updated:** 2026-05-18 — manifest data is no longer fetched at runtime

## Context

Originally, `loadManifest()` fetched `docs/manifest.json` with no timeout and no error handling in the `DOMContentLoaded` handler. If the fetch failed (network error, 404, malformed JSON) or hung (spotty mobile connection), the `renderUpcomingMaterials()`, `renderArchiveCards()`, and `renderHorizonCards()` calls never ran. The skeleton loaders in the HTML remained visible indefinitely with no user feedback and no recovery path.

The primary user persona (Casey) accesses the dashboard on mobile during commutes, where connections drop regularly. A permanent loading state with no retry is a dead end for this use case.

## Decision (original)

1. Add an 8-second `AbortController` timeout to `loadManifest()`.
2. Wrap the `loadManifest()` call in `DOMContentLoaded` in a `try/catch`.
3. On failure, call `showManifestError()` which: replaces skeleton content with a "Couldn't load sessions" message and a "Tap to retry" button; clears archive and horizon containers; hides the horizon section.
4. The retry button re-calls `loadManifest()` and, on success, runs all three render functions.

## Update (2026-05-18): Manifest Inlined

As of 2026-05-18, the manifest is no longer fetched at runtime. The `npm run build:js` step runs `scripts/inline-manifest.cjs` which reads `docs/manifest.json` and generates `src/_manifest.js` containing `const MANIFEST_DATA = {...}`. This is bundled into `dist/app.js` by terser.

`loadManifest()` now checks for the inlined `MANIFEST_DATA` constant first and returns synchronously. A fetch-based fallback is preserved for development (running without a build step). The error-handling infrastructure (`showManifestError`, retry button) is retained for the fallback path and in case the inlined data is somehow invalid.

## Rationale

**Timeout value (8 seconds):** Long enough for slow connections to succeed; short enough that a hanging fetch fails visibly rather than leaving users waiting. Browser default fetch timeouts are several minutes — far too long for a mobile commute context. (Still applies to the dev fallback fetch path.)

**AbortController over `Promise.race` with `setTimeout`:** `AbortController` cleanly cancels the in-flight request. `Promise.race` leaves the original fetch running in the background and consuming bandwidth.

**Retry on the same error state, not a page reload:** Reloading the page resets all state including any reader position or scroll. An inline retry keeps the user in context.

**Horizon section hidden on error:** When MEETINGS is empty, rendering horizon/archive produces nothing. Hiding empty-container sections avoids phantom section headings above blank space.

## Consequences

- **Positive:** Manifest loading is now synchronous in production — zero async gap, no fetch timeout.
- **Positive:** Users on spotty connections never experience a manifest loading failure.
- **Positive:** The error-handling infrastructure remains available for edge cases.
- **Positive:** The fetch fallback still works for local dev without a build step.
- **Negative:** The `retry` affordance in `showManifestError()` is no longer useful in production (the inlined data cannot fail at runtime). It is kept for the dev fallback path.
- **Convention:** The canonical manifest source is `docs/manifest.json`. After editing it, run `npm run build:js` to regenerate `dist/app.js`.
