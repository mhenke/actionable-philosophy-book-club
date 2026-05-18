Title: Distinguish canonical vs alternate video rows — Design
Date: 2026-05-18

Overview

Goal: Make it visually and semantically clear which video is the canonical (primary) recording and which are alternate cuts, improving discoverability and accessibility without large layout changes.

Decision

Implementation approved: Option 1 — Visual + semantic (badge + color token + aria-label + data-attribute).

Why
- Low-risk and incremental: small DOM and CSS changes, minimal JS adjustments.
- Accessibility-first: aria-labels and data attributes provide semantics for screen readers and test automation.
- Keeps layout parity across index and reader pages.

Design details

DOM changes
- For canonical video (meeting.video): add data-canonical="true" attribute on the outer .asset-row (e.g., <div class="asset-row" data-canonical="true" ...>).
- Ensure the canonical asset-link has an explicit aria-label: aria-label="Canonical video — <session title>".
- Alternate recordings (podcasts with type 'alternate') remain in the podcast disclosure; their podcast-badge retains cfg.label but gains data-alternate="true" on the containing .asset-row.

CSS
- Add token-driven styling in index.html CSS block:
  .asset-row[data-canonical="true"] { border-left: 3px solid var(--spectrum-1); padding-left: 0.75rem; }
  .asset-row[data-canonical="true"] .icon-pill { background: var(--wash-1); }
  .podcast-badge { font-weight: 600; padding-left: 0.5rem; }
- Keep contrast and token usage consistent with DESIGN.md.

JS
- Minor change in buildAssetRows: include data-canonical attribute when rendering primaryRows and ensure aria-label is present.
- For podcastRows alternate entries, add data-alternate attribute for testability.

Acceptance criteria
- Visual: canonical rows show left accent and stronger hierarchy; badge present on alternate rows in disclosure.
- Semantic: canonical .asset-row has data-canonical="true" and asset-link includes aria-label mentioning "Canonical".
- Automated: Add Playwright checks asserting presence of data-canonical on canonical assets and that screen-reader accessible name includes "Canonical".

Testing
- Playwright: renderUpcomingMaterials and renderArchiveCards snapshots; keyboard navigation; axe checks for contrast and semantics.
- Unit: string/template tests for buildAssetRows output include data-canonical and aria-label.

Rollout
- Implement in dist/app.js and index.html CSS tokens; run npm test and check-links.sh.
- Keep change small and behind visual QA; revert if layout regressions appear.

If approved, the next step is to generate a granular implementation plan with tasks (writing-plans).
