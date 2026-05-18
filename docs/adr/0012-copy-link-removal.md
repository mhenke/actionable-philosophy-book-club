# ADR-0012: Copy Link Button Removed from Reader Header

**Status:** Accepted
**Date:** 2026-05-18

## Context

The reader header contained a Copy Link button that copied the current hash URL (e.g., `#p=meetings/meeting-01/README.md`) to the clipboard. It went through two iterations: first as an icon + "Copy Link" text label, then reduced to icon-only after a critique identified the text as redundant.

The question of whether the feature earned its place in the header was raised: the button occupied prime real estate in the reader's top navigation alongside the back link and the document title label.

## Decision

Remove the Copy Link button entirely. This includes the HTML element, the JavaScript click handler, and the two Playwright tests that covered it.

## Rationale

**The dashboard is the canonical entry point.** Members access content by visiting the dashboard, finding the session card, and navigating from there. No observed workflow involves sharing a direct deep link to a specific document.

**The hash URL has limited shareability.** A URL like `https://mhenke.github.io/actionable-philosophy-book-club/#p=meetings/meeting-01/README.md` works, but the dashboard surfaces the same content more clearly for anyone who receives it. The link saves no meaningful steps.

**Header real estate is finite.** The reader header has one job: orient the user (document title) and provide an exit (back to dashboard). A tertiary utility button that serves a marginal use case competes with that job without earning its place.

**Iterative reduction confirmed the direction.** Removing the text label (icon-only) was an intermediate step that made the button less prominent but did not resolve the underlying question of value. The logical conclusion was removal.

## Consequences

- **Positive:** Reader header is cleaner — back link on the left, document title on the right, nothing else.
- **Positive:** Two tests deleted that were testing a removed feature rather than user behavior.
- **Negative:** Users cannot copy a direct link to a specific document from within the reader. If this becomes a real workflow need, it can be reintroduced — the hash URL format already supports it.
- **Convention:** Features in the reader header must serve orientation or navigation. Utilities that serve neither should not be placed there.
