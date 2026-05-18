# ADR-0010: Manifest Fetch Resilience

**Status:** Accepted
**Date:** 2026-05-18

## Context

`loadManifest()` fetched `docs/manifest.json` with no timeout and no error handling in the `DOMContentLoaded` handler. If the fetch failed (network error, 404, malformed JSON) or hung (spotty mobile connection), the `renderUpcomingMaterials()`, `renderArchiveCards()`, and `renderHorizonCards()` calls never ran. The skeleton loaders in the HTML remained visible indefinitely with no user feedback and no recovery path.

The primary user persona (Casey) accesses the dashboard on mobile during commutes, where connections drop regularly. A permanent loading state with no retry is a dead end for this use case.

## Decision

1. Add an 8-second `AbortController` timeout to `loadManifest()`.
2. Wrap the `loadManifest()` call in `DOMContentLoaded` in a `try/catch`.
3. On failure, call `showManifestError()` which: replaces skeleton content with a "Couldn't load sessions" message and a "Tap to retry" button; clears archive and horizon containers; hides the horizon section.
4. The retry button re-calls `loadManifest()` and, on success, runs all three render functions.

## Rationale

**Timeout value (8 seconds):** Long enough for slow connections to succeed; short enough that a hanging fetch fails visibly rather than leaving users waiting. Browser default fetch timeouts are several minutes — far too long for a mobile commute context.

**AbortController over `Promise.race` with `setTimeout`:** `AbortController` cleanly cancels the in-flight request. `Promise.race` leaves the original fetch running in the background and consuming bandwidth.

**Retry on the same error state, not a page reload:** Reloading the page resets all state including any reader position or scroll. An inline retry keeps the user in context.

**Horizon section hidden on error:** When MEETINGS is empty, rendering horizon/archive produces nothing. Hiding empty-container sections avoids phantom section headings above blank space.

## Consequences

- **Positive:** Users on spotty connections see a recoverable error state instead of an infinite skeleton.
- **Positive:** Fetch hangs are bounded to 8 seconds.
- **Negative:** An 8-second timeout may prematurely fail on unusually slow but valid connections. This is acceptable given the mobile-first use case where a response that takes more than 8 seconds is effectively unusable anyway.
- **Convention:** All top-level fetch calls in `DOMContentLoaded` must have an `AbortController` timeout and a visible error state with a retry affordance.
