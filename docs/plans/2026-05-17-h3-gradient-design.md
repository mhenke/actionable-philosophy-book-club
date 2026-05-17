# H3 Spectrum Gradient Rule — Design

Date: 2026-05-17
Owner: UX / Frontend

## Summary
Replace the current prose H3 styling which uses a single color and a border-top with a decorative spectrum gradient rule above the heading. This mirrors the site header's spectrum treatment and reduces the reliance on single-color accents.

## Chosen approach
- Use a ::before pseudo-element on `.prose h3` to render a thin gradient bar (2–4px) above the heading text.
- Keep heading text color neutral (no gradient text). The gradient is purely decorative and does not convey semantic meaning.
- Update other matching decorative border-top rules where appropriate to use the same motif (e.g., replace `--prose-h3-border` usage; do not change functional borders like form controls).

## CSS snippet (recommended)
```css
.prose h3 {
  position: relative;
  padding-top: 0.75rem; /* room for the gradient bar */
  margin-top: 2rem;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 700;
}
.prose h3::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.25rem; /* sits visually above the text baseline */
  height: 3px; /* 2–4px range acceptable */
  width: 50%; /* aligns with existing rule motif */
  border-radius: 2px;
  background: linear-gradient(90deg,
    var(--spectrum-1) 0%,
    var(--spectrum-2) 20%,
    var(--spectrum-3) 40%,
    var(--spectrum-4) 60%,
    var(--spectrum-5) 80%,
    var(--spectrum-6) 95%,
    rgba(168,216,185,0) 100%);
}
```

Notes:
- `width: 50%` keeps the decorative element restrained; adjust to 40% or 60% if visual tuning requires.
- Use `position: relative` on the heading so the pseudo-element is positioned correctly.
- Avoid animating the pseudo-element to keep motion minimal.

## Files to update
- Modify: `index.html` (inline <style> block) — add the new `.prose h3::before` rules and remove or deprecate `.prose h3 { border-top: 1px solid var(--prose-h3-border); }`.
- Modify: any other inline styles or components that use `--prose-h3-border` (search repo for occurrences) and decide per-case whether to switch to the motif or keep as-is.

## Testing / Acceptance
- Playwright E2E: add a test that selects a `.prose h3` and checks the computed style of the `::before` pseudo-element:
```js
const h3 = page.locator('.prose h3').first();
const before = await h3.evaluate(el => window.getComputedStyle(el, '::before'));
expect(before.backgroundImage).toMatch(/gradient/);
expect(parseFloat(before.width || '0')).toBeGreaterThan(0);
```
- Visual check: sample pages with multiple h3 elements (desktop and 390px mobile) should show the thin spectrum bar above headings.

## Accessibility
- The pseudo-element is decorative; no impact on semantics. Headings remain accessible.
- Ensure color contrast of heading text remains sufficient.

## Rollout plan
1. Implement CSS change in `index.html` (inline style block) and remove the old border-top rule.
2. Search repository for `--prose-h3-border` and other `border-top` uses in prose; update only matching decorative instances.
3. Add Playwright test and run full test suite.
4. Tune width/height if visual review suggests.

## Next steps
- If approved, create a small implementation plan (TDD steps) and execute changes in the feature worktree.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
