Design: Command Palette & Reader Navigation — Balanced Approach

Overview

This document records the approved balanced design to improve the existing command palette and add reader keyboard navigation. Goals: improve fuzzy scoring so users find meetings quickly, add Shift+Enter open-in-new-tab, and provide reader prev/next via ArrowLeft/ArrowRight and J/K. Keep changes incremental and low-risk.

Components

1. In-memory index
- Source: window.MEETINGS (id, title, readmeUrl, status, date)
- Tokenize id and title; generate small token set for each meeting.

2. Scoring
- Weighted rule-based scoring:
  - Exact id match: +300
  - id prefix: +180
  - id contains: +120
  - title word matches: +60–120 per word
  - small boost for upcoming/featured: +20
- Fallback: trigram similarity score scaled to 0–150
- Return numeric score for sorting; higher wins.

3. UI
- Palette: existing dialog improved with metadata: meeting date/status shown in results rows.
- Keyboard: Ctrl/Cmd+K to toggle; ArrowDown/Up or J/K for selection; Enter opens; Shift+Enter opens in new tab.
- Accessibility: role=dialog, role=listbox/option, aria-live for results count, focus restore on close, prefers-reduced-motion respected.

4. Reader navigation
- New global key handler when reader is open and focus is not in an input:
  - ArrowRight or J => next meeting (hash -> next.readmeUrl)
  - ArrowLeft or K => previous meeting
- If no prev/next, no-op.

Error handling

- If MEETINGS is missing or empty show "No results" and keep palette open.
- If navigation target has no readmeUrl, fall back to scrolling to card if present.
- All new keyboard handlers ignore typing contexts (inputs/textareas/contenteditable).

Testing

- Manual: toggle palette, search by id/title, Shift+Enter opens new tab, open meeting, then Left/Right and J/K navigate.
- Playwright E2E: add tests for toggle, search results, keyboard navigation, open-in-new-tab, and accessibility snapshot checks.

Rollout

- Implement directly in dist/app.js for quick iteration; consider moving to source build if repository has a source file later.
- Keep feature enabled by default; add CONFIG flag if gating required.

Estimated effort

4–8 hours of dev + tests.
