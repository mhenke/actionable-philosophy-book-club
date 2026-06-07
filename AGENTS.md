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
- **Skills**: `skills/asset-compressor/` compresses PDF/MP4/PPTX. `skills/vocabulary-audit/` checks shared vocabulary between decoupled services.

## Meeting README conventions

Each meeting README must follow meeting 02's section order exactly:

```
# Meeting NN: Title
**Date:**
## High-Level Summary
## Agenda (60 Minutes)
## Discussion Points
   ### ❓ Essential Questions
   ### 💡 Non-Obvious Insights
## Action Items
## Meeting Materials
   - NN-essential-questions.md
   - NN-non-obvious-insights.md
   - recordings/
   - resources/
   - slides/
```

Always include `NN-essential-questions.md` and `NN-non-obvious-insights.md` files in the meeting directory. The Meeting Materials listing order is: docs first, then recordings, then resources, then slides.

## Hard constraints

- **Never populate `video`, `slides`, or `additional_material[]` in a manifest entry until the actual media files exist on disk.** For upcoming/draft meetings with no assets committed yet: `video: null`, `slides: null`, `additional_material: []`. The code handles null gracefully ("Materials available closer to the meeting."). Adding nonexistent paths creates 404 links on the dashboard card.
- **Upcoming card has two stages:** Stage 1 (no assets) shows placeholder text. Stage 2 (assets populated) shows video, slides, and additional materials. The transition happens when `video`, `slides`, and `additional_material` are populated in the manifest entry.
- **`additional_material[]` items** use `category` enum: `deep-dive`, `debate`, `critique`, `alternate`. This replaces the old separate `podcasts`/`resources` fields.
- **`## Meeting Materials`** heading triggers file-tree rendering (case-insensitive). Use exact heading or it renders as plain list.
- **Meeting directories must have a matching manifest entry** or CI fails. Meeting IDs: `meeting-00`, `meeting-01`, etc. `drafts/` is excluded from the manifest.

## Testing

- Playwright (chromium only, `tests/*.spec.js`) + node built-in test runner (`tests/unit/*.test.js`). Tests expose internals via `window.__TEST__` — `window.isSafeRepoPath`, `window.getMeetingRepository`, `window.MEETINGS`, `window.renderUpcomingMaterials`, `window.renderArchiveCards`.

## CSP

```
script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;
frame-src https://view.officeapps.live.com; base-uri 'self'; form-action 'none';
```

No `unsafe-inline` in script-src. Inline styles allowed for Tailwind.

## CI

`.github/workflows/ci.yml`: schema validation → manifest drift → image size gate → shellcheck → asset checks → `npm ci` → build → Playwright → link check. Deploy (main only): uploads `index.html + dist/ + meetings/ + docs/ + templates/ + .nojekyll`, then smoke-tests with curl.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, invoke the `skill` tool with `skill: "graphify"` before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
