# AGENTS.md — Actionable Philosophy Book Club

## Project

Static SPA on GitHub Pages. Single `index.html` with all CSS inline and JS in `dist/app.js`. Interactive dashboard + markdown reader for book club meetings. No framework, no server.

## Key commands

```bash
npm test              # Playwright E2E (162 tests, starts server automatically)
npm run build:css     # Tailwind rebuild → dist/tailwind.css
npm run test:links    # bash tests/check-links.sh — validates #p= and asset hrefs
python3 -m http.server 8000   # local preview (required: fetch() won't work with file://)
```

## Architecture

- **`index.html`** — all HTML + CSS in `<style>` block. JS loaded from `dist/app.js`.
- **`dist/app.js`** — inline script extracted for CSP compliance (`script-src 'self'`).
- **`src/`** — JS source concatenated at build time (order listed below):
  - `00-setup.js` — DOM refs, constants, global let/const declarations
  - `path.js` — path validation (`isSafePath`, `isSafeAssetPath`, `isSafeRepoPath`)
  - `format.js` — HTML escaping, duration and file size formatting
  - `storage.js` — video resume position via sessionStorage
  - `01-utils.js` — markdown fetch cache, one-shot guard pattern
  - `02-manifest.js` — manifest loading and asset copy registry
  - `03-assets.js` — asset row builders (video/slides/podcast/resource)
  - `04-dashboard.js` — dashboard rendering (upcoming, archive, horizon cards)
  - `reader-hooks.js` — DOMPurify hook setup for external link allowlist
  - `reader-links.js` — markdown content link rewriting
  - `reader-tree.js` — file tree rendering for Meeting Materials lists
  - `reader-toc.js` — table of contents generation from h2 elements
  - `reader-error.js` — document unavailable error UI
  - `reader-loader.js` — main reader entry point (`loadPage()`)
  - `06-view.js` — dashboard/reader view switching
  - `07-toast.js` — toast notification system
  - `08-video-player.js` — inline `<dialog>` video player with resume
  - `09-asset-delegation.js` — delegated asset link click handling
  - `10-onboarding.js` — dismissible welcome banner
  - `11-theme.js` — dark/light theme toggle, persistence, FOUC guard
  - `12-routing.js` — hash router and route handler
  - `13-app.js` — application init (event setup, asset delegation, async startup)
- **Hash router** — `#p=path/to/file.md` triggers `loadPage()` which fetches + renders markdown via marked + DOMPurify.
- **MEETINGS manifest** — JS array in `dist/app.js` with all session data (title, date, video/slides/podcasts/resources, status, color, wash).
- **Dashboard** — `renderUpcomingMaterials()` + `renderArchiveCards()` use shared `buildAssetRows()`.
- **Reader** — `loadPage()` with AbortController, link rewriting, Meeting Materials file tree, theme inheritance from meeting color. Split across `reader-hooks.js`, `reader-links.js`, `reader-tree.js`, `reader-toc.js`, `reader-error.js`, `reader-loader.js`.

## Critical functions

| Function | Location | Purpose |
|---|---|---|
| `buildAssetRows()` | `03-assets.js` | Shared renderer for video/slides/podcasts/resource rows |
| `fetchMarkdownCached()` | `01-utils.js` | Promise-based fetch cache with 20-entry LRU eviction + internal path validation + AbortController |
| `ensureDOMPurifyHooks()` | `reader-hooks.js` | Adds `rel=noopener noreferrer` to external links, strips invalid hrefs |
| `isSafeRepoPath()` | `path.js` | Validates `#p=` paths — allowlist: `meetings/`, `docs/`, `templates/` |
| `isSafeAssetPath()` | `path.js` | Validates asset hrefs — only `meetings/` and `assets/` with known extensions |
| `showDashboard()` | `04-dashboard.js` | Focuses `#main-content`, announces "Dashboard" via `role="status"`, clears stale reader content |
| `renderFileTree()` | `reader-tree.js` | Post-processes `## Meeting Materials` lists into styled file trees |

## Styling

- **Tailwind CSS v3.4.17** — pinned exact version. Config references CSS variables as single source of truth.
- **Color tokens** — `spectrum-1` through `spectrum-6` defined in `:root` in the `<style>` block. Tailwind extends via `var(--spectrum-N)`. Never hardcode hex values.
- **Spectrum wash tokens** — `--wash-1` through `--wash-5` used for card backgrounds.
- Build output: `dist/tailwind.css`. The CI freshness gate (`npm run build:css` + diff check) will fail if committed CSS is stale.

## Content conventions

- `## Meeting Materials` heading in README.md triggers file tree rendering (case-insensitive).
- Meeting directories must have a matching entry in the `MEETINGS` manifest or CI fails.
- Meeting IDs: `meeting-00`, `meeting-01`, etc. The `drafts/` directory is the Drafts staging folder: excluded from the MEETINGS manifest (see CONTRIBUTING.md and docs/adr/0009-plain-language-section-naming.md).
- `docs/content-contract.md` defines the full manifest schema.

## Testing

- Playwright E2E tests in `tests/`.
- Key test files: `path-validator.spec.js` (isSafeRepoPath), `dashboard-xss.spec.js` (4 XSS content-based tests), `routing.spec.js` (navigation + error recovery), `prefetch.spec.js` (cache behavior).
- Tests expose internal functions via `window.*` when `window.__TEST__` is set — `window.isSafeRepoPath`, `window.MEETINGS`, `window.renderUpcomingMaterials`, `window.renderArchiveCards`.
- Pre-existing test results may be stale after CSS changes — always re-run.

## CI pipeline (`.github/workflows/ci.yml`)

Checks in order: ShellCheck → manifest drift → image size gate → shellcheck → SRI hash verification → hash-route link check → `npm ci` → npm audit → Tailwind freshness → Playwright tests → link checker → asset href check. Then `deploy` job (main only) uploads `index.html + dist/ + meetings/ + docs/ + templates/ + .nojekyll`.

## Development workflow

- Branch from `main` into worktrees: `git worktree add .claude/worktrees/<branch-name> main` then `git checkout -b fix/feature`.
- All fixes merged to `main`, branches deleted after merge.
- Stale worktrees can prevent branch deletion — use `git worktree remove --force`.

## CSP

```
default-src 'none'; script-src 'self';
style-src 'self' 'unsafe-inline'; img-src 'self' data:;
frame-src https://view.officeapps.live.com; base-uri 'self';
form-action 'none'; frame-ancestors 'none';
```

No `unsafe-inline` in script-src. Inline styles are allowed for Tailwind. Office viewer is the only framed origin.

## Rollback

```bash
git revert <bad-commit-sha>
git push origin main
```

Do not force-push to `main`. Deployment takes ~1-2 minutes.
