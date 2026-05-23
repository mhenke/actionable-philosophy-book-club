# ADR-0013: JS Extraction and Build Pipeline

**Status:** Accepted
**Date:** 2026-05-18

## Context

The original `index.html` contained a single inline `<script>` block with all application logic (~955 lines). As the codebase grew, this caused:
- CSP compliance issues (`script-src 'self'` requires external scripts)
- Poor maintainability — all logic in one monolithic block
- No module boundaries — everything shared the same scope

## Decision

Extract the inline script into `dist/app.js`, loaded via `<script defer src="dist/app.js">`. Source is maintained as 14 numbered modules in `src/` that are concatenated and minified at build time:

```
src/_manifest.js  (build-generated, inlined from docs/manifest.json)
src/00-setup.js   → DOM refs, constants, shared state
src/01-utils.js   → pure utility functions
...
src/13-app.js     → init, event setup, IIFE
src/14-test-hooks.js → test-only window exports
```

## Build Pipeline

```
docs/manifest.json  ──inline-manifest.cjs── src/_manifest.js ──┐
src/00-setup.js     ───────────────────────────────────────────┤
src/01-utils.js     ───────────────────────────────────────────┤
...                                                             ├── terser ── dist/app.js
src/13-app.js       ───────────────────────────────────────────┤
src/14-test-hooks.js───────────────────────────────────────────┘
```

`npm run build:js` runs `scripts/inline-manifest.cjs` then terser with `--compress --mangle`. The result is a gitignored generated artifact.

## Alternatives Considered

- **ES modules with bundler (Rollup/Webpack)**: Would require adding a bundler dependency and restructuring all modules to use `import`/`export`. Rejected for now to keep the build pipeline minimal.
- **Single inline script**: Original approach, rejected for CSP compliance.
- **Separate files loaded via `<script>` tags**: Would require multiple HTTP requests and careful ordering. Concatenation gives us one request.

## Consequences

- **Positive**: CSP compliant, module boundaries (file-level), build-time validation, manifest inlining avoids runtime fetch
- **Negative**: Module order is implicit (terser argument order), no tree-shaking, source maps not generated
