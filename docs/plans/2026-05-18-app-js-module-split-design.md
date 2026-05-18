Title: app.js module split — Design
Date: 2026-05-18

Overview

Goal: Split the single 1056-line src/app.js into 7 focused files under src/ with a
terser-concat build step. Zero behavior changes, zero CSP changes, zero config changes.

Decision

Approach: Numbered file-split concat (recommended).

Approach rejected:
- ES modules — requires <script type="module">, more invasive, no clear benefit for global-scope code
- Internal sections only — cosmetic, doesn't solve the god-module problem

Why
- Same build pipeline (terser), same CSP, same test infrastructure, same index.html
- Function declarations hoist regardless of concat order — no dependency-ordering bugs possible
- let/const ordering is explicit via numbered prefix, and the only let/const live in 00-setup.js
- Each new file is under 200 lines with one clear responsibility

Architecture

Seven files, concatenated in order:

  src/
    00-setup.js      DOM refs + global let/const declarations (~40 lines)
    01-utils.js      Pure utility functions, no DOM dependencies (~130 lines)
    02-manifest.js   Manifest loading + asset copy registry (~55 lines)
    03-assets.js     Asset row builders (video/slides/podcast/resource) (~140 lines)
    04-dashboard.js  Dashboard rendering (~160 lines)
    05-reader.js     Reader rendering + view management (~170 lines)
    06-app.js        Init, routing, key handlers, test exposure (~80 lines)

Build script change

Current:

    "build:js": "terser src/app.js --compress --mangle --comments false -o dist/app.js"

New:

    "build:js": "terser src/00-setup.js src/01-utils.js src/02-manifest.js src/03-assets.js src/04-dashboard.js src/05-reader.js src/06-app.js --compress --mangle --comments false -o dist/app.js"

Module contents

00-setup.js

const dashboard, reader, content, readerStatus, mdCache, activeReaderController
const LS, CONFIG, RAW_CONTENT_BASE
let MEETINGS, ASSET_COPY
const DEFAULT_ASSET_COPY

01-utils.js

escapeHTML, formatDuration, formatFileSize
buildPPTXViewerURL
isSafePath, isSafeAssetPath, isSafeRepoPath
fetchMarkdownCached, prefetchMarkdown
getVideoResumeKey, getSavedVideoResumeTime, saveVideoResumePosition, clearVideoResumePosition

02-manifest.js

loadAssetCopyRegistry, getAssetCopy
loadManifest, showManifestError

03-assets.js

PODCAST_CONFIG, DL_ICON
buildVideoRow, buildVideoPlaceholder
buildSlidesRow, buildSlidesPlaceholder
buildPodcastRow, buildResourceStrip, buildPodcastSummary
buildAssetRows

04-dashboard.js

renderUpcomingMaterials, renderArchiveCards, renderHorizonCards
showDashboard, showToast
setupAssetClickDelegation, initOnboardingBanner

05-reader.js

setView, loadPage
rewriteContentLinks, applyMeetingMaterialsTree, renderFileTree
updateReaderTheme, ensureDOMPurifyHooks
openVideoPlayer

06-app.js

handleRoute, getCurrentMeetingIndex
Key handlers (ArrowLeft/Right, J/K)
window.* test exports
DOMContentLoaded handler

Edge cases

- All existing test exports (window.MEETINGS, window.ASSET_COPY, window.formatDuration,
  window.formatFileSize, etc.) move to 06-app.js
- window.__manifestLoaded assignment stays in 06-app.js
- The `'use strict'` directive stays in 00-setup.js (it applies to the entire concatenated file)
- All window.__TEST__ guards stay in 06-app.js
- Imperative setup calls (setupAssetClickDelegation, initOnboardingBanner, hashchange
  listener, back-button handler, keydown handler) stay in 06-app.js — these run at
  script load time and must be the last thing in the concatenated output
- DOMContentLoaded handler stays in 06-app.js

Testing

- npm test must pass with identical output — the dist/app.js bundle must be functionally identical
- git diff dist/app.js between old-build and new-build should show only whitespace/ordering changes,
  zero behavior changes

Rollout

- Delete src/app.js after verifying tests pass with the new split
- Update AGENTS.md architecture section to reference the new file structure
- Update package.json build:js script
