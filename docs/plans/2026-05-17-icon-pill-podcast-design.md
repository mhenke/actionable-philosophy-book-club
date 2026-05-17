# Icon Pill & Podcasts Header — Design

Date: 2026-05-17
Owner: UX / Frontend

## Summary
Normalize the decorative treatment for media icon pills and adjust the Podcasts disclosure summary label.

Changes:
1. Use the existing `--wash-*-border` tokens for icon-pill backgrounds (e.g., `--wash-2-border`) instead of `--wash-*-icon` for podcast icons so they visually match Video and Slides icons.
2. Change the podcasts disclosure summary from a prefixed count (e.g., "3 Podcasts") to simply "Podcasts" so it matches the Video Recap label styling.

Rationale
- Visual consistency: Video/Slides icons use `--wash-*-border` giving a slightly stronger, centered tint; podcast used a weaker `--wash-*-icon` token which reads visually different.
- Copy clarity: the numeric prefix is noisy and duplicates information that can be surfaced another way (e.g., aria-label or disclosure summary count in screen reader text if needed).

Implementation details
- Edit: `dist/app.js` where podcast summary HTML is built (search for `podcast-disclosure` and `--wash-2-icon`). Replace `style="background:var(--wash-2-icon);"` with `style="background:var(--wash-2-border);"` and similarly for any other `--wash-*-icon` usage in icon-pills.
- Edit: `dist/app.js` summary markup that currently uses `${podcastRows.length} Podcast(s)` — replace with `Podcasts`.
- Also update `index.html` CSS tokens if needed (the repo already defines `--wash-*-border` and `--wash-*-icon`; no token changes required).

Testing / Acceptance
- Playwright E2E: check that the podcast disclosure summary contains the text `Podcasts` (no leading numeral) and that the icon-pill in the summary and podcast rows uses a background computed from `--wash-*-border`.
- Visual spot check: ensure the pill's tint reads visually similar in hue/weight to the Video/Slides icon pills.

Files touched
- Modify: `dist/app.js` (two small string replacements in renderUpcomingMaterials/renderArchiveCards)
- Optionally: update tests if they depended on the numeric prefix in the summary text (search tests for "Podcast" count assertions)

Rollout
- Make changes in feature worktree, run `npm test`, and visually verify in browser.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
