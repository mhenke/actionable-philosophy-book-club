# Domain Vocabulary (lazily maintained)

## Core domain terms
- **Meeting**: A book club session with a README, materials, and schedule. Modeled by `Meeting` class in `data-meeting.js`.
- **Meeting manifest**: `docs/manifest.json` — single source of truth for the meeting schedule. Inlined at build time.
- **Static SPA**: Single-page application hosted on GitHub Pages. Single `index.html`, hash router (`#p=`).
- **Dashboard**: The landing view showing upcoming and past meeting cards.
- **Reader**: The document view that fetches, parses, sanitizes, and renders markdown.
- **Zero Ceremony**: Minimal tooling principle — no build framework, no server.

## Architecture vocabulary
- **IIFE module**: A file wrapped in `(function() { ... })()` that exports to `window.*`. 25 such modules concatenated in explicit order.
- **Concat order**: The explicit file order in `package.json` `build:js` — acts as an implicit dependency graph.
- **Inline constant**: `MANIFEST_DATA` or `__MANIFEST_DATA` — build-generated from `docs/manifest.json` via `inline-manifest.cjs`.
- **FOUC prevention**: Blocking `<script>` in `<head>` (`theme-init.js`) that applies theme classes before paint.
- **Repository pattern**: `MeetingRepository` in `data-repository.js` — encapsulates meeting data queries.
- **Asset registry**: `assetCopyRegistry` in `asset-copy.js` — maps meeting assets to their copy destinations.
- **Pipeline**: reader-loader's 5-step markdown processing chain (fetch → parse → sanitize → link-rewrite → file-tree).
- **Defense in depth**: 4 independent security layers — path validation (`path.js`), DOMPurify sanitization, CSP headers, viewer safety (`viewer.js`).

## Meeting structure
- **Essential Questions** (`NN-essential-questions.md`): Discussion-driving questions for each meeting.
- **Non-Obvious Insights** (`NN-non-obvious-insights.md`): Key takeaways from the reading.
- **Meeting Materials**: Section heading that triggers file-tree rendering in the reader.

## Data model
- **additional_material[]**: Array of supplementary resources with `category` enum: `deep-dive`, `debate`, `critique`, `alternate`.
- **Stage 1/Stage 2**: Upcoming card has two stages — Stage 1 (no assets) shows placeholder, Stage 2 (assets populated) shows links.
- **Category enum**: `book`, `article`, `video`, `podcast`, `web` — used in `buildAssetRows()` to determine rendering.

## Testing
- **Behavior-first**: Tests should verify what users can do, not implementation details (ADR-0008).
- **Test hooks**: `test-hooks.js` conditionally exposes internals on `window.__TEST__`.
- **vm.createContext()**: Unit test pattern that loads source files into a VM context without a DOM.

## Skills
- **info** (verb): Look something up without modifying files. Used for investigating, checking status, or gathering context.
- **edit** (verb): Make a change to one or more files. Used for implementing features, fixing bugs, or refactoring.
