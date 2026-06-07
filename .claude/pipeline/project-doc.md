# Project Documentation
> Generated: 2026-06-06T04:00:00Z | Mode: FULL

## Tech Stack
- **Runtime**: Browser (static SPA, no Node.js server)
- **Language**: Vanilla JavaScript (ES2022), no TypeScript
- **Framework**: None — custom hash router, no framework
- **Styling**: Tailwind CSS v3.4.17 + custom CSS vars (spectrum theme system)
- **State**: DOM as state, localStorage (theme, onboarding), sessionStorage (video resume)
- **Build**: Terser for JS minification, Tailwind CLI for CSS, custom inline-manifest script
- **CI**: GitHub Actions — schema validation, build, Playwright E2E, link check, deploy to GitHub Pages

## Dependencies
**Core** (vendored to `dist/vendor/`):
- `marked@^18.0.3` — Markdown parser (UMD, vendored)
- `dompurify@^3.4.4` — XSS sanitizer (UMD, vendored)

**Dev**:
- `tailwindcss@3.4.17` — CSS utility framework
- `terser@^5.47.1` — JS minifier
- `@playwright/test@^1.60.0` — E2E testing (chromium only)
- `caniuse-lite@^1.0.30001793` — Tailwind dependency

## Architecture Pattern
**IIFE-module SPA with hash routing**. No bundler (webpack/vite/rollup). 27 individual IIFE modules in `src/` are concatenated in explicit dependency order by terser's `--compress` into a single `dist/app.js` file. Each module attaches to `window.*` as its public API.

Key design influences: John Ousterhout's "A Philosophy of Software Design" — deep modules, information hiding, complexity sinks. The codebase explicitly follows APOSD principles (e.g., "Define Errors Out of Existence" in data validation).

## Folder Structure
```
/
├── index.html              # Single HTML entry point — all views, no SSR
├── dist/                   # Build output (app.js, tailwind.css, vendor/)
├── src/                    # 27 IIFE JS modules + input.css
│   ├── setup.js            # DOM reference hub (13 IDs → window.DOM)
│   ├── path.js             # Security-first path validation (pure)
│   ├── format.js           # Formatting utilities (pure)
│   ├── toast.js            # Toast notification + error handler
│   ├── routing.js          # Hash router
│   ├── view.js             # View toggle (dashboard/reader/meetings/actions)
│   ├── data-meeting.js     # Meeting class with validation
│   ├── data-repository.js  # MeetingRepository (compound queries)
│   ├── asset-copy.js       # i18n-ready copy for asset categories
│   ├── manifest.js         # Manifest loader (inline/fetch dual strategy)
│   ├── markdown-cache.js   # 20-entry LRU fetch cache
│   ├── retry.js            # Retry UI component
│   ├── reader-loader.js    # Markdown fetch→parse→sanitize→render pipeline
│   ├── reader-links.js     # Link rewriting for hash router
│   ├── dashboard.js        # Dashboard rendering (upcoming/archive cards)
│   ├── assets.js           # Asset row HTML builders
│   ├── viewer.js           # Viewer URL resolution (PPTX→Office Online)
│   ├── video-player.js     # <dialog> overlay video player with resume
│   ├── asset-delegation.js # Delegated click routing for asset links
│   ├── theme-init.js       # Blocking FOUC-prevention script
│   ├── theme.js            # Theme toggle/persistence
│   ├── onboarding.js       # Dismissible welcome banner
│   ├── storage.js          # sessionStorage helpers for video resume
│   ├── app.js              # Application entry point
│   ├── _manifest.js        # Build-generated inline manifest data
│   └── test-hooks.js       # Test harness export bridge
├── meetings/               # Meeting content (markdown + media assets)
│   ├── meeting-00/         # Kickoff (done)
│   ├── meeting-01/         # Deep Systems (done)
│   ├── meeting-02/         # Complexity Engineering (done)
│   ├── meeting-03/         # The Empirical Reality Check (upcoming)
│   └── meeting-04/         # TBD (draft)
├── docs/                   # Documentation + manifest
│   ├── manifest.json       # Canonical meeting schedule
│   ├── manifest.schema.json# JSON Schema for manifest validation
│   ├── onboarding.md       # New member guide
│   ├── glossary.md         # Key terms reference
│   └── design-principles.md# Design heuristics
├── templates/              # Markdown templates (prompts, README templates)
├── scripts/                # Build scripts
│   └── inline-manifest.cjs # Manifest → _manifest.js codegen
├── tests/                  # Test suite
│   ├── *.spec.js           # 8 Playwright E2E specs
│   ├── unit/               # 3 Node.js native unit tests
│   ├── check-links.sh      # Link checker (validates #p= and asset hrefs)
│   └── test-helper.js      # Shared test utilities
├── skills/                 # Agent skills
│   ├── asset-compressor/   # Python scripts for PDF/MP4/PPTX compression
│   └── vocabulary-audit/   # Semantic coupling detection skill
├── graphify-out/           # Knowledge graph output (AST-based)
├── .claude/                # Claude pipeline config
│   ├── pipeline/           # Scan results, state
│   └── skills/             # Project-specific skills
├── .github/workflows/      # CI pipeline
├── assets/                 # Static assets (favicon, social preview)
├── .opencode/              # OpenCode config + plugins
└── AGENTS.md               # Agent instructions
```

## Code Style Conventions
- **Module pattern**: IIFE wrapping `(function() { 'use strict'; ... })()` for every module
- **Exports**: Global namespace via `window.*` (e.g., `window.openVideoPlayer = openVideoPlayer`)
- **Naming**: camelCase for functions/vars, PascalCase for classes, underscore prefix for internal helpers (`_helper`)
- **JSDoc**: `@param` tags on public API functions; "Side-effects:" annotation in file header comments
- **DOM coupling**: All DOM IDs captured once in `setup.js` at module load time via `document.getElementById()`, exported as `window.DOM`. Consumers destructure (`const { reader, markdownContent } = window.DOM`).
- **Optional chaining**: Used for guard checks (`window.ErrorHandler?.warn(...)`)
- **Destructuring**: Shared DOM element references destructured at module top
- **No import statements**: Module concatenation order (`package.json` `build:js` script) guarantees dependency loading sequence

## Modularity Practices
- **Deep modules**: Each module exposes a focused public API (typically 1-3 functions) and hides internal complexity
- **Layer separation**: Data layer (`data-meeting.js`, `data-repository.js`, `manifest.js`) → Business logic (`assets.js`, `reader-loader.js`, `dashboard.js`) → UI (`view.js`, `video-player.js`, `assets.js`)
- **Repository pattern**: `MeetingRepository.find(criteria)` handles compound queries (status, date, ID), centralizes data access
- **Asset rendering delegates** to `viewer.js` for URL resolution (APOSD Principle 3: strategy pattern)
- **Validator pattern**: `path.js` and `data-meeting.js` validate at the boundary, never assume input safety

## Data Architecture
- **Canonical source**: `docs/manifest.json` — JSON file with `meetings[]` array + `assetCopy` object
- **Entity**: `Meeting` — id, session, date, title, status (done|upcoming|draft), color, wash, readmeUrl, video (obj|null), slides (obj|null), additional_material[] (with optional category: deep-dive|debate|critique|alternate)
- **Build-time inlining**: `scripts/inline-manifest.cjs` reads `docs/manifest.json` → generates `src/_manifest.js` with `window.MANIFEST_DATA`
- **Runtime fallback**: `loadManifest()` tries inline data first, then fetches `docs/manifest.json` with 8s AbortController timeout
- **Caching**: 20-entry LRU Map caching `fetch()` promises for markdown files
- **Persistence**: localStorage for theme (`apbc:theme`) and onboarding dismiss (`apbc:onboarding_dismissed`); sessionStorage for video resume position (`apbc:vs:` prefix)

## Cross-Cutting Concerns
- **Security**: CSP header (`script-src 'self'; style-src 'self' 'unsafe-inline'`); `isSafePath()` rejects protocol URLs, path traversal, absolute paths, control characters; `DOMPurify` sanitizes all rendered markdown; custom `DOMPurify.addHook()` allowlists specific external link domains (youtube.com, wikipedia.org, etc.)
- **Error handling**: `window.ErrorHandler` with `warn()` (non-fatal) and `error()` (fatal) methods; `showToast()` for user-facing notifications (4.5s auto-dismiss)
- **Accessibility**: Skip-to-content link, ARIA labels, `dialog` element for video player, `sr-only` CSS class, `prefers-reduced-motion` support, 44px minimum touch targets
- **Theme**: System-aware with manual override; priority cascade: localStorage > `prefers-color-scheme` > light default; CSS vars for all theme colors, never hardcoded hex

## Service Communication
- **None** — fully client-side SPA. All content served as static files from GitHub Pages.
- External links (YouTube, Wikipedia) are allowlisted in `DOMPurify` hooks and open in new tabs.

## Test Coverage
- **Framework**: Playwright (chromium only, E2E) + Node.js built-in `node --test` (unit)
- **Unit tests** (3 files): `format.test.js` (escapeHTML, formatDuration, formatFileSize), `path.test.js` (isSafePath), `data-meeting.test.js` (Meeting constructor validation)
- **E2E tests** (8 specs): asset-behavior, asset-meta, csp, dashboard-xss, layout-regression, manifest-rendering, routing, theme-toggle, video-resume, xss
- **Test hooks**: `window.__TEST__` flag exposes `window.isSafeRepoPath`, `window.getMeetingRepository`, `window.MEETINGS`, `window.renderUpcomingMaterials`, `window.renderArchiveCards`
- **Link checker**: `tests/check-links.sh` — validates all `#p=` routes and asset hrefs exist on disk
- Estimated coverage: ~60-70% of source modules exercised (dashboard, assets, reader-loader not independently unit-tested)

## Entry Points
- **`index.html`**: Single HTML file — all 4 views (dashboard, reader, meetings, actions) declared as `<div>` elements
- **`src/app.js`**: Async IIFE entry point — wires theme, routing, manifest loading, dashboard rendering, error handling
- **`src/theme-init.js`**: Blocking `<script>` in `<head>` — prevents FOUC by applying theme before render
- **`dist/app.js`**: Build output — concatenated and minified from all `src/*.js` modules
- **`docs/manifest.json`**: Meeting schedule — canonical data source
- **Config**: `package.json` (scripts, dependencies), `tailwind.config.cjs` (spectrum theme tokens), `playwright.config.js` (E2E config), `.github/workflows/ci.yml` (CI pipeline)

## Last Scanned
2026-06-06T04:00:00Z
