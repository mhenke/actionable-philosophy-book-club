# Podcast Explanations & Asset Availability — Design

Date: 2026-05-17
Owner: UX / Frontend

## Summary
Two minor UX issues addressed:
1. Lack of contextual explanations for podcast types (Deep-Dive, Debate, Critique) on meeting cards — mobile users miss hover tooltips.
2. Broken asset links (404) present no friendly feedback for media assets; currently the browser handles failures.

Recommended solution (approved):
- Add inline short descriptions beneath podcast-type badges on meeting cards (one sentence, 1–2 lines).
- Implement a lazy availability check on user interaction: intercept clicks on media links, perform a quick fetch of the resource, and show a friendly "Unavailable" message if the response is 404 or network-failed. Do not perform HEAD requests on page load.

## Goals
- Improve discoverability and comprehension of podcast types on mobile and keyboard users.
- Avoid extra per-page network overhead while providing clear feedback when an asset is unavailable.
- Keep changes minimal, accessible, and test-covered.

## Design details
Podcast explanations
- Place a muted, small-caption line directly under podcast badges (e.g., "Deep Dive — 30–45m: focused walkthrough and analysis").
- Truncate to ~2 lines with "…" when long; include title-attribute for full text.
- On narrow screens, stack badges vertically; keep the caption directly under each badge to preserve context.
- Accessibility: captions are regular DOM text (not aria-hidden); badges retain aria-labels (e.g., "Podcast: Deep Dive — focused walkthrough").

Asset availability (lazy on-click check)
- Intercept clicks on asset links (video/audio/file) with a small JS handler bound at delegation root.
- On click: prevent default, perform fetch(url, { method: 'GET', mode: 'no-cors' })? Note: no-cors prevents inspecting status — instead use a HEAD or GET with CORS expected for same-origin files. Since assets are same-origin (assets/ or meetings/), perform a fetch with method: 'HEAD' and a short timeout (3s).
- If response.ok -> open target (same behavior as link: location.href or open in new tab depending on link target).
- If response.status === 404 or fetch throws -> show non-blocking inline toast near the asset row: "Asset unavailable — it may have been removed or is temporarily offline." The toast includes a link to report an issue (mailto or GitHub issue template).
- Cache negative results for the session to avoid repeated fetches for the same missing URL.

Notes and trade-offs
- HEAD preflight on click adds a small delay before navigation; mitigate with optimistic UI: show spinner in place of link until check completes.
- Avoid PAGE-LOAD HEAD checks to prevent additional network overhead and rate-limit concerns.
- For cross-origin assets (rare), fallback to attempting navigation and show the toast on network error.

## Accessibility
- Toasts are polite (aria-live="polite") and dismiss after 6s or via close button.
- Captions are real text for screen readers; badges maintain aria-labels.
- Keyboard behavior: Enter/Space triggers the same interception flow. If a fetch is in-flight, pressing Enter twice skips the check and performs default navigation.

## Testing / Acceptance Criteria
- Playwright E2E tests: verify captions render under badges on desktop and 390px mobile viewport.
- Verify keyboard focus order includes captions and badges.
- Simulate 404 on asset route: clicking asset shows "Asset unavailable" toast and does not navigate.
- Simulate available asset: click navigates/open as before.

## Next steps
- Implement small JS handler in `dist/app.js` and corresponding unit/e2e tests (writing-plans will create implementation todos).
- Add copy for each podcast type (short 1-line descriptions) and place in localization file if needed.


Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
