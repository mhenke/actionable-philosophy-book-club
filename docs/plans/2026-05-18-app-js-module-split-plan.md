# app.js Module Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the 1056-line `src/app.js` into 7 focused source files under `src/` without changing any runtime behavior.

**Architecture:** Each new file is a function-based module sharing global scope via concatenation. Files are numbered (`00-` through `06-`) for explicit build order. The build:js script passes them to terser in order.

**Tech Stack:** Vanilla JS, terser (unchanged), Playwright (unchanged).

---

### Task 1: Create 00-setup.js + 01-utils.js

**Files:**
- Create: `src/00-setup.js`
- Create: `src/01-utils.js`
- Source: `src/app.js`

**Step 1: Read `src/app.js` to understand the full file**

Run: `wc -l src/app.js` — should be 1056 lines.

**Step 2: Create `src/00-setup.js`**

Extract from `src/app.js`:

```
Lines 1-6:   'use strict' + DOM element refs (dashboard, reader, content, readerStatus, mdCache)
Lines 8-10:  let MEETINGS, let ASSET_COPY
Lines 12-17: const DEFAULT_ASSET_COPY (Object.freeze)
Lines 109-119: const LS, const CONFIG, let activeReaderController
Line 190:    const RAW_CONTENT_BASE
Line 772:    let videoPlayerCleanup = null
```

The file should look like:

```js
'use strict';
const dashboard = document.getElementById('dashboard-view');
const reader    = document.getElementById('reader-view');
const content   = document.getElementById('markdown-content');
const readerStatus = document.getElementById('reader-status');
const mdCache   = new Map();

let MEETINGS = [];
let ASSET_COPY = {};

const DEFAULT_ASSET_COPY = Object.freeze({
    alternate: { label: 'Alternate', title: 'A different take on the session topic' },
    'deep-dive': { label: 'Deep Dive', title: 'An exploration of the session topic' },
    critique: { label: 'Critique', title: 'A critical analysis of the key arguments and trade-offs' },
    debate: { label: 'Debate', title: 'A structured debate between two design perspectives' },
});

const LS = 'apbc:';
const CONFIG = {
    CACHE_MAX: 20,
    RESUME_MIN_SECONDS: 5,
    PROGRESS_SAVE_MS: 3000,
    TOAST_DURATION_MS: 4500,
    TOAST_FADE_MS: 300,
    STATUS_RESET_MS: 1000,
    PATH_MAX_LENGTH: 256,
};

let activeReaderController = null;
const RAW_CONTENT_BASE = 'https://raw.githubusercontent.com/mhenke/actionable-philosophy-book-club/main/';
let videoPlayerCleanup = null;
```

**Step 3: Create `src/01-utils.js`**

Extract from `src/app.js`:

```
Lines 121-167: fetchMarkdownCached, prefetchMarkdown, escapeHTML
Lines 173-193: formatDuration, formatFileSize, buildPPTXViewerURL
Lines 196-220: isSafePath, isSafeAssetPath, isSafeRepoPath
Lines 977-1010: getVideoResumeKey, getSavedVideoResumeTime, saveVideoResumePosition, clearVideoResumePosition
```

Copy each function verbatim. Do not change any code — this is a pure extraction.

Verify the functions reference nothing outside 00-setup.js's declarations (MEETINGS, mdCache, activeReaderController, CONFIG, LS, RAW_CONTENT_BASE, dashboard).

**Step 4: Verify extraction correctness**

Run: `grep -n "function\|const \|let " src/00-setup.js | head -20` and `grep -n "function\|const \|let " src/01-utils.js | head -20`
Expected: all expected declarations present.

**Step 5: Commit**

```bash
git add src/00-setup.js src/01-utils.js
git commit -m "refactor: extract setup and utils modules from app.js"
```

---

### Task 2: Create 02-manifest.js + 03-assets.js

**Files:**
- Create: `src/02-manifest.js`
- Create: `src/03-assets.js`

**Step 1: Create `src/02-manifest.js`**

Extract from `src/app.js`:

```
Lines 19-107: loadAssetCopyRegistry, getAssetCopy, loadManifest, showManifestError
```

Copy each function verbatim. Note: `loadManifest` references `MEETINGS` and `ASSET_COPY` from 00-setup, and `fetchMarkdownCached` from 01-utils. `showManifestError` references `escapeHTML` from 01-utils and DOM refs from 00-setup.

**Step 2: Create `src/03-assets.js`**

Extract from `src/app.js`:

```
Lines 222-372: PODCAST_CONFIG, DL_ICON, buildVideoRow, buildVideoPlaceholder,
               buildSlidesRow, buildSlidesPlaceholder, buildPodcastRow,
               buildResourceStrip, buildPodcastSummary, buildAssetRows
```

Copy each function verbatim. Note: `buildPodcastRow` references `getAssetCopy` from 02-manifest and `PODCAST_CONFIG`/`DL_ICON` from this file. `buildAssetRows` references `isSafeAssetPath` from 01-utils.

**Step 3: Commit**

```bash
git add src/02-manifest.js src/03-assets.js
git commit -m "refactor: extract manifest and asset modules from app.js"
```

---

### Task 3: Create 04-dashboard.js + 05-reader.js

**Files:**
- Create: `src/04-dashboard.js`
- Create: `src/05-reader.js`

**Step 1: Create `src/04-dashboard.js`**

Extract from `src/app.js`:

```
Lines 375-511: renderUpcomingMaterials, renderArchiveCards, renderHorizonCards
Lines 739-889: showDashboard, showToast, openVideoPlayer, setupAssetClickDelegation,
               initOnboardingBanner
```

Note: `showDashboard` references `setView` from 05-reader — this is fine because function declarations hoist at script parse time. All other dependencies (buildAssetRows, isSafeAssetPath, MEETINGS, DOM refs) are in earlier files.

**Step 2: Create `src/05-reader.js`**

Extract from `src/app.js`:

```
Lines 513-737: getCurrentMeetingIndex, rewriteContentLinks, applyMeetingMaterialsTree,
               renderFileTree, updateReaderTheme, ensureDOMPurifyHooks,
               setView, loadPage
```

Note: `loadPage` references `fetchMarkdownCached`, `isSafeAssetPath` from 01-utils, `MEETINGS`, `activeReaderController`, `readerStatus`, `content`, `dashboard`, `reader` from 00-setup, `showDashboard` from 04-dashboard. `setView` references `dashboard`, `reader` from 00-setup. Function hoisting makes cross-file references work.

**Step 3: Commit**

```bash
git add src/04-dashboard.js src/05-reader.js
git commit -m "refactor: extract dashboard and reader modules from app.js"
```

---

### Task 4: Create 06-app.js (init, routing, key handlers, test exports)

**Files:**
- Create: `src/06-app.js`

**Step 1: Create `src/06-app.js`**

Extract from `src/app.js`:

```
Lines 891-1056 — everything remaining after removing the video resume functions (977-1010)
```

Specifically:

```
Lines 891-915:   handleRoute function
Lines 917-933:   Test exports (window.* assignments, gated by __TEST__)
Lines 935:       window.addEventListener('hashchange', handleRoute)
Lines 937-942:   Back button handler
Lines 944-975:   Keydown handler (ArrowLeft/Right, J/K, Escape)
Lines 1012-1018: setupAssetClickDelegation calls, initOnboardingBanner call
Lines 1021-1056: DOMContentLoaded handler
```

Note: `handleRoute` references `loadPage`, `showDashboard`, `MEETINGS`. The test exports reference functions from all modules. The DOMContentLoaded handler references `loadManifest`, `showManifestError`, `renderUpcomingMaterials`, `renderArchiveCards`, `renderHorizonCards`, `handleRoute`.

**Step 2: Verify the file is self-contained**

Check that all referenced functions and variables are defined in earlier files (00-05). The only thing 06-app.js does at the top level is register event listeners, wire up test exports, and start the DOMContentLoaded handler.

**Step 3: Commit**

```bash
git add src/06-app.js
git commit -m "refactor: extract init, routing, and test exports from app.js"
```

---

### Task 5: Update build script and rebuild

**Files:**
- Modify: `package.json`

**Step 1: Update `build:js` script**

In `package.json`, change:

```json
"build:js": "terser src/app.js --compress --mangle --comments false -o dist/app.js",
```

to:

```json
"build:js": "terser src/00-setup.js src/01-utils.js src/02-manifest.js src/03-assets.js src/04-dashboard.js src/05-reader.js src/06-app.js --compress --mangle --comments false -o dist/app.js",
```

**Step 2: Build `dist/app.js`**

Run: `npm run build:js`
Expected: exits 0, produces `dist/app.js`

**Step 3: Run the full test suite**

Run: `npm test`
Expected: all tests pass (same count as before)

**Step 4: Commit**

```bash
git add package.json dist/app.js
git commit -m "build: update build:js to use new module files"
```

---

### Task 6: Remove `src/app.js` and update docs

**Files:**
- Delete: `src/app.js`
- Modify: `AGENTS.md`

**Step 1: Delete `src/app.js`**

```bash
rm src/app.js
```

**Step 2: Verify the build still works**

Run: `npm run build:js && npm test`
Expected: exits 0, all tests pass

**Step 3: Update `AGENTS.md`**

In `AGENTS.md`, update the Architecture section to reference the new file structure. The current text says "JS loaded from `dist/app.js`" — keep that. Update the Critical Functions table to include the new module files.

Change:

```
## Architecture

- **`index.html`** — all HTML + CSS in `<style>` block. JS loaded from `dist/app.js`.
- **`dist/app.js`** — inline script extracted for CSP compliance (`script-src 'self'`).
```

Append below it:

```
- **`src/`** — JS source split into 7 numbered modules concatenated at build time:
  - `00-setup.js` — DOM refs, constants, global let/const declarations
  - `01-utils.js` — pure utility functions (formatting, path validation, fetch cache, video resume)
  - `02-manifest.js` — manifest loading and asset copy registry
  - `03-assets.js` — asset row builders (video/slides/podcast/resource)
  - `04-dashboard.js` — dashboard rendering (upcoming, archive, horizon cards)
  - `05-reader.js` — reader rendering, view management, content link rewriting
  - `06-app.js` — init, hash routing, key handlers, test exports, DOMContentLoaded
```

**Step 4: Commit**

```bash
git add AGENTS.md
git rm src/app.js
git commit -m "refactor: remove src/app.js, update AGENTS.md with new module structure"
```

---

### Task 7: Full verification

**Files:**
- None

**Step 1: Run the full test suite**

Run: `npm test`
Expected: all tests pass with identical counts to pre-refactor

**Step 2: Verify the build is reproducible**

```bash
rm dist/app.js && npm run build:js && ls -la dist/app.js
```
Expected: dist/app.js exists and is non-empty.

**Step 3: Spot-check the hash route works**

Run: `python3 -m http.server 8000` and visit `http://127.0.0.1:8000/#p=meetings/meeting-02/README.md`
Expected: reader loads, markdown renders, back button works.

**Step 4: Final commit if any cleanup needed**

```bash
git add -A && git status
```
Expected: clean working tree, no unstaged files.
