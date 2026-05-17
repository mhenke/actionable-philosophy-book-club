# Podcast summary icon deduplication — design

Date: 2026-05-17

Summary

Podcast disclosure summaries currently show an icon-pill emoji and also inline emoji glyphs in the summary text (e.g., "📦🎬 1 Video · 🎧 3 Podcasts"). This duplicates visual affordances and can be noisy. Keep the first icon-pill only and remove additional inline emoji glyphs from podcast disclosure summaries while preserving accessible textual counts for screen readers.

Scope

- Target: podcast disclosure summaries only (the <details class="podcast-disclosure"> summary markup).
- Keep the icon-pill (first emoji in the summary) as the single visible icon (aria-hidden="true").
- Strip other inline emoji characters from the summary text; show plain counts like "1 Video · 3 Podcasts".
- Ensure accessible name: the summary should expose a descriptive text such as "Podcasts — 1 video, 3 podcasts" for screen readers (via aria-label or a visually-hidden element).

Design

1. Data flow
- When building podcastSummary (where individual asset labels are concatenated), sanitize the string used inside the <summary> so that any leading/trailing emoji glyphs outside the icon-pill are removed before escapeHTML is applied.
- Keep the icon-pill markup unchanged: <span class="icon-pill" aria-hidden="true">{emoji}</span>.

2. Implementation details (high level)
- Edit the code that constructs the disclosure summary (dist/app.js lines around the existing podcast-disclosure templates).
- Before inserting podcastSummary into the summary markup, run a small normalization step that strips emoji characters used as inline icons. Keep textual words and numerals.
- Add an explicit accessible label on the <summary> element (e.g., aria-label="Podcasts — 1 video, 3 podcasts") or prepend a visually-hidden span with the same text. The icon-pill remains aria-hidden so it does not pollute the accessible label.

3. Accessibility
- Screen readers must read a clear textual summary: e.g., "Podcasts — 1 video, 3 podcasts".
- Emoji icon-pill must be aria-hidden.
- Contrast and focus styles unchanged.

4. Tests
- Playwright: add/adjust tests to assert the summary text does NOT start with emoji characters (except the icon-pill), and that the visible text contains counts formatted as "{N} Video(s) · {M} Podcast(s)".
- Add an accessibility check: ensure the summary has the expected accessible name (using page.getByRole or accessibleName checks).

Files to change

- Primary: dist/app.js — where podcast summary HTML is constructed (two template strings currently at ~lines 295 and 309).
- Tests: tests/* (routing or podcast tests) — update to assert new summary formatting.

Rollout & verification

1. Commit design doc (this file).
2. Create an implementation plan (writing-plans skill) and get approval.
3. Implement change in source (dist/app.js or source builder if available), run `npm test` (Playwright) and `npm run test:links`.
4. Verify in browser (python3 -m http.server 8000) that podcast disclosures show a single icon-pill and textual counts.

Acceptance criteria

- Podcast disclosure summary displays a single icon-pill followed by plain counts: e.g., "📦1 Video · 3 Podcasts" (icon-pill then counts).
- No duplicate inline emoji glyphs remain in the visible summary text.
- Screen readers announce a clear textual summary (e.g., "Podcasts — 1 video, 3 podcasts").

Notes

- This change is intentionally narrow per the user's request. If later desired, the same normalization can be applied globally.

