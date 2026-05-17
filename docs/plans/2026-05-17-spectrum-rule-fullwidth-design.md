# Spectrum Rule — Full-width Design

Date: 2026-05-17
Owner: UX / Frontend

## Summary
Make the `.spectrum-rule` divider span the full width of the content container (not the viewport). Current implementation caps the rule to 240px. This change will ensure consistent visual rhythm and remove the half-width appearance on many headings.

## Chosen approach (Approach A — Minimal CSS)
- Replace `max-width: 240px` with `max-width: none; width: 100%; display: block;` on `.spectrum-rule`.
- Keep the gradient and height unchanged (2px). Maintain spacing by ensuring the heading and rule live in the same flex row or adjusted block layout.

## Implementation notes
- If `.spectrum-rule` sits alongside a heading in a flex container, ensure the heading retains its intrinsic width and the rule grows to fill the remaining space. If needed, explicitly set `.spectrum-rule { flex: 1 1 auto; }`.
- Avoid changing markup; keep using the existing `<span class="spectrum-rule"></span>` for minimal DOM churn.
- Update DESIGN.md to remove the hard-coded `max-width: 240px` note.

## Accessibility & semantics
- Divider is decorative. Keep it as a presentational element (`role="presentation"` not required for spans) and ensure headings remain semantic.

## Testing / Acceptance
- Visual check: heading + rule now fills the content container width on desktop and mobile.
- Playwright: add a snapshot or assert that `.spectrum-rule` computed width equals container width minus heading width for a representative heading.

## Rollout
1. Make CSS change in `index.html` (inline style block).
2. Run `npm run test:links && npm test` and spot-check pages locally.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
