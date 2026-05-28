# AGENTS.md — Actionable Philosophy Book Club

## Project

Static SPA on GitHub Pages. Single `index.html` with all CSS inline and JS in `dist/app.js`. No framework, no server. Hash router (`#p=path/to/file.md`) fetches markdown via `marked` + `DOMPurify`.

## Key commands

```bash
npm test              # unit → E2E → link check (sequential)
npm run test:unit     # node --test tests/unit/*.test.js
npm run test:links    # validates #p= and asset hrefs exist on disk
npm run build         # build:css → build:vendor → build:js
npm run build:js      # inlines manifest.json → concats src/*.js → terser
python3 -m http.server 8000   # local preview (fetch() requires HTTP)
```

## Architecture

- **`docs/manifest.json`** is the canonical meeting schedule. Add meetings here, then `npm run build:js` regenerates `src/_manifest.js` and `dist/app.js`. Field schema defined in `docs/manifest.schema.json`.
- **JS build chain**: `scripts/inline-manifest.cjs` reads `docs/manifest.json` → generates `src/_manifest.js`. Then terser concatenates all `src/*.js` (in the order listed in `package.json` `build:js` script) → `dist/app.js`.
- **CSS**: Tailwind v3.4.17. Build output `dist/tailwind.css`. Color tokens are CSS vars (`--spectrum-1` through `--spectrum-6`), never hardcoded hex. CI checks freshness via `npm run build:css` + diff.
- **Theme**: `src/theme-init.js` runs as blocking `<script>` in `<head>` to prevent FOUC. `src/theme.js` handles toggle/persistence.
- **Reader**: `loadPage()` in `reader-loader.js` — fetches via `fetchMarkdown()` (20-entry LRU cache), parses with `marked`, sanitizes with `DOMPurify`, then rewrites links and builds file tree from `## Meeting Materials` heading.
- **Dashboard**: `renderUpcomingMaterials()` + `renderArchiveCards()` in `dashboard.js` share `buildAssetRows()` in `assets.js`.

## Hard constraints

- **Never populate `video`, `slides`, `podcasts`, or `resources` in a manifest entry until the actual media files exist on disk.** For upcoming/draft meetings with no assets committed yet: `video: null`, `slides: null`, `podcasts: []`. The code handles null gracefully ("Materials available closer to the meeting."). Adding nonexistent paths creates 404 links on the dashboard card.
- **`## Meeting Materials`** heading triggers file-tree rendering (case-insensitive). Use exact heading or it renders as plain list.
- **Meeting directories must have a matching manifest entry** or CI fails. Meeting IDs: `meeting-00`, `meeting-01`, etc. `drafts/` is excluded from the manifest.

## Testing

- Playwright (chromium only, `tests/*.spec.js`) + node built-in test runner (`tests/unit/*.test.js`). Total: ~46 E2E + 16 unit.
- Tests expose internals via `window.__TEST__` — `window.isSafeRepoPath`, `window.getMeetingRepository`, `window.MEETINGS`, `window.renderUpcomingMaterials`, `window.renderArchiveCards`.

## CSP

```
script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;
frame-src https://view.officeapps.live.com; base-uri 'self'; form-action 'none';
```

No `unsafe-inline` in script-src. Inline styles allowed for Tailwind.

## CI

`.github/workflows/ci.yml`: schema validation → manifest drift → image size gate → shellcheck → asset checks → `npm ci` → build → Playwright → link check. Deploy (main only): uploads `index.html + dist/ + meetings/ + docs/ + templates/ + .nojekyll`, then smoke-tests with curl.
