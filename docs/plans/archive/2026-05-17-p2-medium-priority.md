# P2 Medium Priority Fixes Plan

**Priority:** Plan for next sprint  
**Estimated effort:** ~2–3 days total  
**Prerequisite:** P0 and P1 complete  
**Source:** `.full-review/05-final-report.md`

Items are grouped by theme and ordered within each group by effort (smallest first).

---

## Group A — Architecture & Code Structure

### A1 — Add `dist/app.js` to Tailwind Content Scan; Shrink Safelist [BP-07]

**Effort:** Small (~15 min)

**File:** `tailwind.config.cjs` (after P1 rename)

```js
// Before:
content: ['index.html'],

// After:
content: ['index.html', 'dist/app.js'],
```

Then remove the `safelist` entries one-by-one. For each entry, confirm the class name now appears in either `index.html` or `dist/app.js` directly (not computed at runtime). Classes assembled from variables (e.g., `text-${color}` where `color` is a runtime value) must stay in the safelist. Classes that are hardcoded strings in template literals can be removed.

Run `npm run build:css` after each removal and verify the class still appears in `dist/tailwind.css`.

---

### A2 — Remove `document.execCommand` Fallback and Fix `--content` Flag [BP-12]

**Effort:** Small (~10 min)

**File:** `package.json:7`

```json
// Before:
"build:css": "tailwindcss -i src/input.css -o dist/tailwind.css --minify --content index.html"

// After:
"build:css": "tailwindcss -i src/input.css -o dist/tailwind.css --minify"
```

The `--content` CLI flag overrides the config's `content` array. Now that `tailwind.config.cjs` defines content correctly (after A1), the CLI flag is redundant and will conflict with the new `dist/app.js` entry.

---

### A3 — Remove Dead Code: `.filter(() => false).forEach(...)` [H3]

**Effort:** Small (~5 min)

**File:** `dist/app.js:185-190`

Delete the entire chain:
```js
// DELETE:
(meeting.podcasts || [])
    .filter(() => false)
    .forEach(alt => {
        /* alternate recordings intentionally excluded from primaryRows */
    });
```

Move the explanatory comment to the video block above it:
```js
// Alternate recordings render in the podcast disclosure below, not in primaryRows.
```

---

### A4 — Fix Hardcoded `mhenke/...main/` GitHub Raw URL [A-2.2]

**Effort:** Small (~15 min)

**File:** `dist/app.js` — `buildOfficeViewerURL` function (~line 148)

Extract the hardcoded URL to a named constant near the top of the file alongside other config:

```js
// Near top of dist/app.js, after the MEETINGS manifest:
const RAW_CONTENT_BASE = 'https://raw.githubusercontent.com/mhenke/actionable-philosophy-book-club/main/';
```

Then in `buildOfficeViewerURL`:
```js
function buildOfficeViewerURL(path) {
    if (!isSafeAssetPath(path)) return '#';
    const src = RAW_CONTENT_BASE + path;
    return 'https://view.officeapps.live.com/op/view.aspx?src=' + encodeURIComponent(src);
}
```

This makes the repo name/branch a single change point rather than a hardcoded string buried in a function.

---

### A5 — Add `'use strict'` and Extract Magic Numbers to CONFIG [M1 / L1]

**Effort:** Small (~20 min)

**File:** `dist/app.js`

Step 1 — Add `'use strict'` at top (already done in P0 Fix 2, but listed here for groups that skip P0):
```js
'use strict';
```

Step 2 — Extract magic numbers to a CONFIG object near the top of the file:
```js
const CONFIG = {
    CACHE_MAX: 20,
    RESUME_MIN_SECONDS: 5,
    PROGRESS_SAVE_MS: 3000,
    TOAST_DURATION_MS: 4500,
    TOAST_FADE_MS: 300,
    HIGHLIGHT_DURATION_MS: 2000,
    STATUS_RESET_MS: 1000,
    PATH_MAX_LENGTH: 256,
};
```

Replace all literal occurrences:
- `20` (cache size) → `CONFIG.CACHE_MAX`
- `5` (resume threshold) → `CONFIG.RESUME_MIN_SECONDS`
- `3000` (save interval) → `CONFIG.PROGRESS_SAVE_MS`
- `4500` / `300` (toast) → `CONFIG.TOAST_DURATION_MS` / `CONFIG.TOAST_FADE_MS`
- `2000` (highlight) → `CONFIG.HIGHLIGHT_DURATION_MS`
- `1000` (status reset) → `CONFIG.STATUS_RESET_MS`
- `256` (path length) → `CONFIG.PATH_MAX_LENGTH`

---

### A6 — Migrate Archive Render to `DocumentFragment` [P-07]

**Effort:** Small (~20 min)  
**Critical at:** N=20 archived meetings (~200–400 ms jank)

**File:** `dist/app.js` — `renderArchiveCards` function

```js
function renderArchiveCards() {
    const archiveContainer = document.getElementById('archive-cards-container');
    const done = MEETINGS.filter(m => m.status === 'done');

    const fragment = document.createDocumentFragment();
    done.forEach(meeting => {
        const card = document.createElement('div');
        card.className = 'card p-6 md:p-8 border-t-2 flex flex-col';
        card.innerHTML = buildAssetRows(meeting);  // existing render logic
        fragment.appendChild(card);
    });

    archiveContainer.innerHTML = '';
    archiveContainer.appendChild(fragment);  // single DOM write
}
```

Apply the same pattern to `renderHorizonCards`.

---

### A7 — Migrate Prefetch Listeners to Event Delegation [M5 / P-09]

**Effort:** Small (~15 min)

**File:** `dist/app.js`

Replace the `attachPrefetchListeners` function with a single delegated listener on `document`:

```js
// Replace attachPrefetchListeners() entirely with this at boot:
document.addEventListener('pointerenter', (e) => {
    const el = e.target.closest('[data-prefetch-path]');
    if (!el) return;
    const path = el.dataset.prefetchPath;
    if (path && isSafeRepoPath(path)) prefetchMarkdown(path);
}, true);  // capture phase — pointerenter doesn't bubble
```

Remove the `attachPrefetchListeners` function and its call at boot.

---

### A8 — Fix `isSafeAssetPath` to Structurally Forbid `..` [F-10]

**Effort:** Small (~15 min)

**File:** `dist/app.js:154-158`

The regex character class `[A-Za-z0-9._/-]+` permits `..`. The only protection is the explicit `path.includes('..')` check. Make the regex structurally forbid it by requiring each path segment to start with a non-dot character:

```js
function isSafeAssetPath(path) {
    if (typeof path !== 'string' || path.length === 0 || path.length > CONFIG.PATH_MAX_LENGTH) return false;
    const segments = path.split('/');
    if (segments.some(s => s === '' || s === '.' || s === '..')) return false;
    return /^(meetings|assets)(\/[A-Za-z0-9_][A-Za-z0-9._-]*)+\.(mp4|m4a|pptx|pdf|png|jpg|jpeg)$/i.test(path);
}
```

The segment-based check replaces the `path.includes('..')` substring match and also handles encoded forms.

---

### A9 — Gate Test Instrumentation Behind `window.__TEST__` [F-12]

**Effort:** Small (~15 min)

**File:** `dist/app.js:723-731`

```js
// Before:
window.isSafeRepoPath = isSafeRepoPath;
window.prefetchMarkdown = prefetchMarkdown;
window.mdCache = mdCache;
// ... etc

// After:
if (window.__TEST__ === true) {
    window.isSafeRepoPath = isSafeRepoPath;
    window.prefetchMarkdown = prefetchMarkdown;
    window.mdCache = mdCache;
    window.renderUpcomingMaterials = renderUpcomingMaterials;
    window.renderArchiveCards = renderArchiveCards;
    window.renderHorizonCards = renderHorizonCards;
    window.MEETINGS = MEETINGS;
    window.showToast = showToast;
}
```

**File:** All test files that use `window.*` — add `addInitScript` before navigation:
```js
// In each Playwright test file's beforeEach or at test start:
await page.addInitScript(() => { window.__TEST__ = true; });
```

Check: `tests/dashboard-xss.spec.js`, `tests/manifest-rendering.spec.js`, `tests/path-validator.spec.js`, `tests/prefetch.spec.js`, `tests/routing.spec.js`.

---

### A10 — Add `fetchMarkdownCached` Internal Path Validation [F-08 / M10]

**Effort:** Small (~5 min)

**File:** `dist/app.js` — top of `fetchMarkdownCached`:

```js
function fetchMarkdownCached(path, { isReaderLoad = false } = {}) {
    if (!isSafeRepoPath(path)) {
        return Promise.reject(new Error('Unsafe path: ' + path));
    }
    // ... rest unchanged
```

---

### A11 — Fix `mdCache` to Implement Actual LRU Eviction [M6]

**Effort:** Small (~10 min)

**File:** `dist/app.js` — inside `fetchMarkdownCached`, the cache hit path:

```js
// Before:
if (mdCache.has(path)) return mdCache.get(path);

// After (re-insert to bump recency):
if (mdCache.has(path)) {
    const val = mdCache.get(path);
    mdCache.delete(path);
    mdCache.set(path, val);  // re-insert at end (most recent)
    return val;
}
```

Also update `AGENTS.md:31` to accurately describe the eviction strategy (now correctly LRU after this change).

---

### A12 — Move MEETINGS Manifest to `meetings/manifest.json` [A-3.1]

**Effort:** Large (~2–3 hours including CI update)  
**Payoff:** Eliminates 3 brittle CI grep steps; enables non-developer contributions; enables JSON Schema validation

**Step 1 — Create `meetings/manifest.json`**

Extract the `MEETINGS` array from `dist/app.js:8-95` into `meetings/manifest.json`:
```json
[
  {
    "id": "meeting-01",
    "title": "...",
    "status": "done",
    ...
  }
]
```

**Step 2 — Fetch the manifest at boot**

In `dist/app.js`, replace the hardcoded `const MEETINGS = [...]` with an async load:
```js
let MEETINGS = [];

async function loadManifest() {
    const resp = await fetch('./meetings/manifest.json');
    if (!resp.ok) throw new Error('Failed to load manifest');
    MEETINGS = await resp.json();
}
```

Call `loadManifest()` before rendering:
```js
document.addEventListener('DOMContentLoaded', async () => {
    await loadManifest();
    renderUpcomingMaterials();
    renderArchiveCards();
    renderHorizonCards();
    attachPrefetchListeners();
    handleRoute();
});
```

**Step 3 — Add JSON Schema to CI**

Create `meetings/manifest.schema.json` defining required fields and allowed values.

In `.github/workflows/ci.yml`, add a validation step:
```yaml
- name: Validate manifest schema
  run: npx ajv-cli validate -s meetings/manifest.schema.json -d meetings/manifest.json
```

**Step 4 — Remove CI grep steps that are now redundant**

The manifest-drift grep at `ci.yml` that checks `id: '${id}'` in `dist/app.js` can be deleted — the manifest is now a separate validated file.

**Step 5 — Update CONTRIBUTING.md**

Replace the "edit the JS array" instructions with "edit `meetings/manifest.json`".

---

## Group B — Testing Gaps

### B1 — Fix `playwright.config.js` Timeout [T-04]

**Effort:** Small (~5 min)

**File:** `playwright.config.js`

```js
// Before (timeout under `use:` is ignored):
use: {
    baseURL: 'http://localhost:8000',
    timeout: 40000,  // silently ignored here
    trace: 'on-first-retry',
},

// After:
export default defineConfig({
    testDir: './tests',
    timeout: 40_000,   // per-test timeout — top-level key
    use: {
        baseURL: 'http://localhost:8000',
        actionTimeout: 10_000,
        navigationTimeout: 15_000,
        trace: 'on-first-retry',
    },
    // ... rest unchanged
```

---

### B2 — Add Test: Anchor Links Preserved in Markdown Link Rewriter [T-05]

**Effort:** Small (~20 min)

**File:** `tests/routing.spec.js` or new `tests/reader.spec.js`

```js
test('anchor links (#fragment) are not rewritten to GitHub raw URLs', async ({ page }) => {
    await page.goto('/#p=meetings/meeting-01/README.md');
    await page.waitForSelector('#markdown-content h1');

    // Find any anchor link in the rendered markdown
    const anchorLink = page.locator('#markdown-content a[href^="#"]').first();
    const href = await anchorLink.getAttribute('href');

    // Should start with '#', not with 'https://raw.githubusercontent.com'
    expect(href).toMatch(/^#/);
    expect(href).not.toMatch(/github/);
});
```

---

### B3 — Add Test: Fetch Error Path and Retry Button [T-09]

**Effort:** Small (~30 min)

**File:** `tests/routing.spec.js` or new `tests/reader.spec.js`

```js
test('shows error message and retry button when fetch fails', async ({ page }) => {
    // Intercept the README fetch and force a 404
    await page.route('**/meetings/meeting-01/README.md', route => route.fulfill({ status: 404 }));

    await page.goto('/#p=meetings/meeting-01/README.md');
    await page.waitForSelector('#markdown-content');

    // Error message should be visible
    await expect(page.locator('#markdown-content')).toContainText('unavailable');

    // Retry button should exist
    await expect(page.locator('#markdown-content button')).toBeVisible();
});
```

---

### B4 — Add Test: Link Checker Extensions [T-10]

**File:** `tests/check-links.sh`

Extend the grep pattern from line 21:
```bash
# Before:
grep -oP '(?<=href=")[^"]+(mp4|pptx|png)(?=")' index.html

# After:
grep -oP '(?<=href=")[^"]+(mp4|m4a|pptx|pdf|png|jpg|jpeg)(?=")' index.html
```

Also update the CI inline step at `.github/workflows/ci.yml:148` to match. Then remove the inline step entirely and rely on `npm run test:links` only — the duplicate is a maintenance split.

---

### B5 — Decouple Test Fixtures from Production Manifest [T-07]

**Effort:** Medium (~1 hour)

After completing A9 (gate `window.*` behind `__TEST__`), update tests to inject a controlled manifest instead of relying on the production MEETINGS array:

**File:** `tests/dashboard-xss.spec.js`

```js
// Add before page.goto:
await page.addInitScript(() => {
    window.__TEST__ = true;
    window.__TEST_MEETINGS__ = [
        {
            id: 'test-upcoming',
            status: 'upcoming',
            title: 'Test Meeting',
            video: { file: 'meetings/test/recording.mp4', label: 'Test Recording' },
            podcasts: [],
            resources: [],
        }
    ];
});
```

Then update `dist/app.js` to prefer `window.__TEST_MEETINGS__` in test mode:
```js
async function loadManifest() {
    if (window.__TEST__ && window.__TEST_MEETINGS__) {
        MEETINGS = window.__TEST_MEETINGS__;
        return;
    }
    // normal fetch path...
}
```

---

## Group C — Security

### C1 — Self-Host `marked` and `DOMPurify` [F-04]

**Effort:** Medium (~45 min)  
**Payoff:** Eliminates CDN SPOF, enables SW precaching of reader, allows tightening `script-src 'self'`

**Step 1 — Add to `package.json` devDependencies**

```json
"devDependencies": {
    "marked": "15.0.7",
    "dompurify": "3.2.4",
    ...
}
```

**Step 2 — Copy to `dist/` at build time**

Add to `package.json` scripts:
```json
"build:vendor": "cp node_modules/marked/marked.min.js dist/vendor/marked.min.js && cp node_modules/dompurify/dist/purify.min.js dist/vendor/purify.min.js",
"build": "npm run build:css && npm run build:vendor"
```

Create `dist/vendor/` directory (`touch dist/vendor/.gitkeep`).

**Step 3 — Update `index.html`**

```html
<!-- Before: -->
<script defer src="https://cdn.jsdelivr.net/npm/marked@5.1.2/marked.min.js" integrity="..." crossorigin="anonymous"></script>
<script defer src="https://cdn.jsdelivr.net/npm/dompurify@3.2.4/dist/purify.min.js" integrity="..." crossorigin="anonymous"></script>

<!-- After: -->
<script defer src="dist/vendor/marked.min.js"></script>
<script defer src="dist/vendor/purify.min.js"></script>
```

**Step 4 — Update CSP**

Remove `https://cdn.jsdelivr.net` from `script-src`:
```
script-src 'self';
```

**Step 5 — Update SW precache**

```js
const PRECACHE = [
    './',
    './index.html',
    './dist/app.js',
    './dist/tailwind.css',
    './dist/vendor/marked.min.js',
    './dist/vendor/purify.min.js',
];
```

**Step 6 — Remove CI SRI verification job**

The `ci.yml` step that downloads CDN scripts and verifies SRI hashes (lines 77-97) is now unnecessary — the files are vendored and tracked in the repo. Remove it. Add a simpler check instead:
```yaml
- name: Verify vendor files exist
  run: |
    test -f dist/vendor/marked.min.js || (echo "Missing dist/vendor/marked.min.js" && exit 1)
    test -f dist/vendor/purify.min.js || (echo "Missing dist/vendor/purify.min.js" && exit 1)
```

---

### C2 — Add Missing Security Meta Tags [F-06]

**Effort:** Small (~10 min)

**File:** `index.html` — add to `<head>` after the CSP meta tag:

```html
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta name="referrer" content="strict-origin-when-cross-origin">
```

Also add `frame-ancestors 'none'` to the existing CSP meta tag to prevent clickjacking:
```
Content-Security-Policy: ...; frame-ancestors 'none';
```

Note: `frame-ancestors` is not supported in `<meta>` CSP in all browsers (it requires an HTTP header to be fully enforced). Add it anyway as defense-in-depth; document the GitHub Pages header limitation.

---

### C3 — Add `localStorage` Namespace Prefix [F-14]

**Effort:** Small (~15 min)

**File:** `dist/app.js` — find all `localStorage.setItem` / `getItem` / `removeItem` calls.

Add a constant:
```js
const LS = 'apbc:';
```

Replace all key strings:
```js
// Before:
localStorage.setItem('vp_resume_' + filePath, String(t));
localStorage.getItem('vp_resume_' + filePath);
localStorage.setItem('onboarding_dismissed', '1');
localStorage.getItem('onboarding_dismissed');

// After:
localStorage.setItem(LS + 'vp:' + filePath, String(t));
localStorage.getItem(LS + 'vp:' + filePath);
localStorage.setItem(LS + 'onboarding_dismissed', '1');
localStorage.getItem(LS + 'onboarding_dismissed');
```

Note: Existing users will lose their video resume positions (one-time migration cost). If preserving positions matters, add a migration that reads the old key format and writes to the new one on first boot.

---

## Group D — CI/CD

### D1 — Extend Link Checker + Remove Redundant Inline Step [CD-07]

See B4 above (grouped with tests for convenience).

### D2 — Add Deploy Job Timeout [CD-12]

**Effort:** Tiny (~2 min)

**File:** `.github/workflows/ci.yml:151`

```yaml
deploy:
  timeout-minutes: 10   # add this line
  needs: validate
```

---

### D3 — Add Post-Deploy Smoke Test [CD-09]

**Effort:** Small (~20 min)

**File:** `.github/workflows/ci.yml` — add step after `actions/deploy-pages`:

```yaml
- name: Smoke test deployed site
  run: |
    sleep 15  # allow CDN propagation
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://mhenke.github.io/actionable-philosophy-book-club/)
    if [ "$STATUS" != "200" ]; then
      echo "Smoke test failed: HTTP $STATUS"
      exit 1
    fi
    # Verify key content is present
    curl -sf https://mhenke.github.io/actionable-philosophy-book-club/ | \
      grep -q "A Philosophy of Software Design" || \
      (echo "Smoke test failed: expected content not found" && exit 1)
    echo "Smoke test passed"
```

---

## Group E — Documentation

### E1 — Fix `AGENTS.md` Inaccuracies [D-01 / D-02 / D-03]

**File:** `AGENTS.md`

1. **Line ~19** — Change "compiled artifact" to "hand-authored JS module (extracted from inline `<script>` for CSP compliance — edit `dist/app.js` directly)"
2. **Line ~31** — Change "LRU eviction" to "LRU eviction" (correct after A11 fix) or leave as "FIFO eviction, bounded at 20 entries" if not fixing the code
3. **Any mention of offline support** — Remove until the SW deploy fix (P0) is confirmed working

### E2 — Fix `CONTRIBUTING.md` Meeting Addition Flow [D-04]

**File:** `CONTRIBUTING.md:56-75`

After completing A12 (manifest to JSON), update the contribution flow to reference `meetings/manifest.json` instead of `dist/app.js`. Add a JSON template block:

```json
{
  "id": "meeting-XX",
  "title": "Book Title Here",
  "status": "upcoming",
  "date": "YYYY-MM-DD",
  "color": "spectrum-1",
  "wash": "--wash-1",
  "readmeUrl": "meetings/meeting-XX/README.md",
  "video": null,
  "podcasts": [],
  "resources": []
}
```

### E3 — Remove or Complete Dead Font Integration [D-05]

**Effort:** Small (delete path, ~5 min) or Medium (complete integration, ~1 hour)

**Option A (recommended) — Delete:**
```bash
git rm -r assets/fonts/
git rm scripts/download-inter.sh
```

Remove any README references to self-hosted Inter fonts.

**Option B — Complete the integration:**
1. Install `ttf2woff2` or use Fonttools to convert TTFs to woff2
2. Generate correct `@font-face` rules in `assets/fonts/fonts.css`
3. Link in `index.html`: `<link rel="stylesheet" href="assets/fonts/fonts.css">`
4. Add `font-display: swap` to each `@font-face`
5. Add fonts to SW precache list

---

## Verification Checklist

- [ ] `npm run build:css` succeeds with updated content config
- [ ] Tailwind safelist reduced (count entries before and after)
- [ ] `grep "filter\(\(\) => false\)" dist/app.js` returns 0
- [ ] `grep "RAW_CONTENT_BASE" dist/app.js` returns 1 (constant defined)
- [ ] `grep "__TEST__" dist/app.js` shows the gate block
- [ ] `npx playwright test` passes with `addInitScript` fixtures
- [ ] `playwright.config.js` timeout at top-level key
- [ ] `grep "execCommand\|currentFetch" dist/app.js` returns 0
- [ ] Archive renders correctly with DocumentFragment (verify in browser)
- [ ] Video resume positions use `apbc:` prefix in DevTools > Application > Local Storage
- [ ] CI smoke test step passes on a test push
- [ ] `AGENTS.md` no longer mentions "compiled artifact" or false LRU claim
