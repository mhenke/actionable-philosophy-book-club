# Architecture Vocabulary

Shared vocabulary for every architectural discussion about this codebase. Use these terms exactly.

## Core Terms

**Module**
A JavaScript file wrapped in an IIFE that exports to `window.*`. The project has 25 such modules concatenated in explicit order. Deliberately scale-agnostic — applies to a function, class, or file.

**IIFE Module**
The pattern `(function() { ... })()` used throughout `src/`. Each module registers itself on the global `window` object to avoid ES6 module overhead in a zero-ceremony build.

**Concat Order**
The explicit file list in `package.json`'s `build:js` script. Acts as an implicit dependency graph — files must appear after their dependencies. The order is: setup → data → manifest → repository → path → format → primitives → cache → UI → router → app.

**Zero Ceremony**
The minimal-tooling principle: no build framework (no webpack/vite), no server, no runtime dependencies. Only static files served by GitHub Pages.

**Inline Constant**
A build-generated constant such as `MANIFEST_DATA` or `__MANIFEST_DATA`, produced by `scripts/inline-manifest.cjs` from `docs/manifest.json` and embedded directly into `dist/app.js`.

**Hash Router**
Client-side routing via `window.location.hash` using the `#p=path/to/file.md` convention. No server-side routing or history API.

**Static SPA**
Single-page application composed of a single `index.html` with all CSS inline and JS concatenated into `dist/app.js`. Hosted statically on GitHub Pages.

## Security & Safety

**Defense in Depth**
Four independent security layers: path validation (`path.js`), DOMPurify sanitization, CSP headers, and viewer safety (`viewer.js`). No single layer is trusted alone.

**Safe Path**
A path validated by `isSafeRepoPath()` in `path.js`. Must be relative, within the repository, and free of traversal attempts. The first layer of defense.

**Sanitization Pipeline**
The 5-step markdown processing chain in `reader-loader.js`: fetch → parse (`marked`) → sanitize (`DOMPurify`) → link-rewrite → file-tree.

**CSP**
Content Security Policy: `script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-src https://view.officeapps.live.com; base-uri 'self'; form-action 'none'`. No `unsafe-inline` in `script-src`.

## Data & State

**Repository Pattern**
`MeetingRepository` in `data-repository.js` — encapsulates all meeting data queries and transformations. The single source of truth for meeting access in the application layer.

**LRU Cache**
The 20-entry markdown cache in `markdown-cache.js`. Stores fetched and parsed markdown documents to avoid redundant network requests.

**Manifest Drift**
When `docs/manifest.json` and the generated `src/_manifest.js` are out of sync. Checked by CI to ensure the inlined constant matches the source manifest.

**Test Hooks**
`test-hooks.js` conditionally exposes internals on `window.__TEST__` only when running under Playwright or node:test. Not available in production.

## Build & Deployment

**Build Pipeline**
Three-step process: `build:js` (inline manifest + terser concat), `build:css` (Tailwind CLI), `build:vendor` (minify marked/purify). No bundler.

**Asset Compression**
The `skills/asset-compressor/` tool using FFmpeg to reduce PDF/MP4/PPTX file sizes before commit. Runs unconditionally — no size gate.

**Smoke Test**
Post-deployment curl check in CI that verifies the live site returns HTTP 200 and contains expected content.

## UI & Interaction

**FOUC Prevention**
Flash of Unstyled Content prevention via `theme-init.js`, a blocking `<script>` in `<head>` that applies the dark/light class before first paint.

**Spectrum Colors**
The six-color accent palette (`--spectrum-1` through `--spectrum-6`), a blue→teal→sage gradient. Never hardcoded hex — always referenced via CSS custom properties.

**Wash Token**
A spectrum-tinted surface overlay (e.g., `--wash-2`, `--wash-2-border`) for highlighted content areas. Derived from spectrum colors at reduced opacity.

**Toast**
The notification system in `toast.js` — ephemeral messages that appear at the bottom of the viewport and auto-dismiss.

## Relationships

- A **Module** is implemented as an **IIFE Module** in this codebase.
- **Concat Order** determines the load order of **Modules**.
- An **Inline Constant** is generated from the **Meeting Manifest** at build time.
- The **Hash Router** dispatches to either the **Dashboard** or the **Reader**.
- The **Sanitization Pipeline** processes markdown before it reaches the **Reader**.
- **Defense in Depth** relies on **Safe Path**, **Sanitization Pipeline**, **CSP**, and **Viewer Safety** as independent layers.
- The **Repository Pattern** encapsulates access to the **Meeting Manifest** data.
- **Test Hooks** expose internals for testing without affecting production **Modules**.

## Rejected Framings

- **"Component"**: Too vague — implies React/Vue-style components. Use **Module** or **IIFE Module**.
- **"Service"**: Overloaded with microservices and DDD terminology. Use **Module** or **Repository**.
- **"Bundle"**: Implies a bundler like webpack. We concatenate files with Terser. Use **Concat Order** or **dist/app.js**.
- **"Route"**: Implies server-side or history API routing. We use **Hash Router**.
- **"Plugin"**: Implies an extension system. Our skills are standalone tools, not plugins. Use **Skill**.
- **"API"**: We have no backend API. Data is inlined or fetched as static files. Use **Manifest** or **Inline Constant**.
