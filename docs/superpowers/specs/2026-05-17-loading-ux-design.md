# Loading UX: Hash-Route Flash Fix + PNG Skeleton

**Date:** 2026-05-17
**Scope:** Two independent, targeted fixes to loading perception in the dashboard SPA.

---

## Problem 1 — Dashboard flash on direct `#p=` navigation

### Root cause

`handleRoute()` is gated inside a `DOMContentLoaded` listener in `dist/app.js` so it waits for the deferred CDN scripts (marked, DOMPurify) before routing. Between HTML parse and that event the dashboard is the default visible state, causing users to see the full dashboard card grid before the reader takes over. The effect is most visible in the header, which snaps from "A Philosophy of Software Design" to "← Dashboard".

### Fix: `preHandleRoute()` IIFE in `dist/app.js`

Add a self-invoking function immediately after the top-level DOM variable declarations (`dashboard`, `reader`, `content`, `readerStatus`). It runs synchronously in the same pass as app initialization.

**Logic:**
1. Read `window.location.hash`.
2. If it does not start with `#p=`, return immediately — no change.
3. Decode the path. If it contains `..` or starts with `/`, return (minimal safety guard; full validation still runs in `handleRoute()`).
4. Add `hidden-view` to `#dashboard-view`, `#site-footer`.
5. Remove `hidden-view` from `#reader-view`.
6. Set `#markdown-content` to the same loading spinner markup already used in `loadPage()`.
7. Set `aria-busy="true"` on `#markdown-content`.

The actual markdown fetch and render are unchanged — they still wait for CDN scripts via `DOMContentLoaded`. Only the visible state switches immediately.

**File:** `dist/app.js` — inserted after variable declarations, before `fetchMarkdownCached`.

**No other files change.** No CSP changes required.

---

## Problem 2 — PNG thumbnail blank space while loading

### Root cause

Archive card `resource-strip` images have correct `width`/`height` attributes (no layout shift) but no visual placeholder. The image area is blank until the network request completes.

### Fix: CSS shimmer on `.resource-thumb img`

Extend the existing `.resource-thumb img` rule in `index.html` with:
- A `background` gradient that shows only while the image has not loaded (browser paints the `background` of an `<img>` until the pixel data arrives; the loaded image covers it completely).
- A `shimmer` keyframe animation that slides the gradient, matching the on-brand neutral palette.
- Add `.resource-thumb img { animation: none; }` to the existing `@media (prefers-reduced-motion)` block.

**Gradient colors:** uses `--border-low` (the same 6% charcoal tint used on card borders) and a lighter midpoint `rgb(34 34 34 / 0.02)` for the sweep, keeping it visually consistent with the rest of the surface.

**No JS changes.** No new elements. Works automatically for all current and future resource strips.

**File:** `index.html` — `<style>` block only.

---

## Out of scope

- Skeleton states for the archive card grid itself (cards render synchronously from the in-memory `MEETINGS` manifest, no network delay).
- Skeleton for the upcoming meeting materials section (same reason).
- Caching or service-worker changes.

---

## Success criteria

1. Hard-refreshing `#p=meetings/meeting-02/README.md` shows the reader loading spinner immediately — the dashboard card grid is never visible.
2. Archive card PNG thumbnails show a gentle shimmer in the image placeholder area while loading, on both mobile and desktop.
3. `prefers-reduced-motion` users see a static placeholder instead of shimmer.
4. No regressions: clicking back to dashboard from reader still works; navigating between meetings still works; hash-less loads still show the dashboard.
