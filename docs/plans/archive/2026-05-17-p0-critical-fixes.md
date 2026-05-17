# P0 Critical Fixes Plan

**Priority:** Must fix before next deploy  
**Estimated effort:** ~30 minutes total  
**Source:** `.full-review/05-final-report.md`

> **Note on `dist/app.js`:** Despite the `dist/` path, `dist/app.js` is the **canonical source file** for all application JS. It was extracted from an inline `<script>` block for CSP compliance and is hand-edited directly — there is no build step or upstream source. Edits to `dist/app.js` are permanent and will not be overwritten.

---

## Fix 1 — Service Worker Never Deploys [CD-01 / P-SW-1]

**Root cause:** Two independent failures. `sw.js` is never copied to the deploy artifact, AND the registration path resolves to the wrong origin on GitHub Pages.

### Step 1a — Add `sw.js` to CI deploy artifact

**File:** `.github/workflows/ci.yml`  
**Line:** 167

Find:
```yaml
cp index.html deploy/
cp -r dist/ meetings/ docs/ templates/ .nojekyll deploy/
```

Change to:
```yaml
cp index.html sw.js deploy/
cp -r dist/ meetings/ docs/ templates/ .nojekyll deploy/
```

### Step 1b — Fix registration path

**File:** `dist/app.js`  
**Line:** 720

Find:
```js
navigator.serviceWorker.register('/sw.js').catch(() => {});
```

Change to:
```js
navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(console.warn);
```

**Why `./` matters:** The live site is at `https://mhenke.github.io/actionable-philosophy-book-club/`. Absolute `/sw.js` resolves to `https://mhenke.github.io/sw.js` (404). Relative `./sw.js` resolves correctly under any subpath.

**Why remove the silent catch:** The silent `.catch(() => {})` hid this failure in production. Using `console.warn` surfaces registration errors in DevTools without breaking the page.

### Step 1c — Fix SW precache paths

**File:** `sw.js`  
**Lines:** 3-9

The precache list also uses absolute paths that are wrong for GitHub Pages. Change:
```js
const PRECACHE = [
  '/',
  '/index.html',
  '/dist/app.js',
  '/dist/tailwind.css',
  '/.nojekyll',
];
```

To:
```js
const PRECACHE = [
  './',
  './index.html',
  './dist/app.js',
  './dist/tailwind.css',
];
```

Note: Remove `/.nojekyll` — it is a deployment signal file, not an app resource, and wastes a precache entry.

### Step 1d — Verify

After deploying:
1. Open `https://mhenke.github.io/actionable-philosophy-book-club/` in Chrome
2. DevTools → Application → Service Workers — confirm the SW is registered and active
3. DevTools → Application → Cache Storage — confirm `dist/app.js`, `dist/tailwind.css`, `index.html` appear
4. Go offline (DevTools → Network → Offline) and reload — the page should still load

---

## Fix 2 — Delete Duplicate `handleRoute` Function [C1 / F-01]

**Root cause:** Two `function handleRoute()` declarations at the top level of `dist/app.js`. The second (line 687) silently overrides the first (line 513) in non-strict mode. The first is dead code.

**File:** `dist/app.js`

### Step 2a — Delete the dead definition

Delete lines 513–530 entirely:
```js
// DELETE THIS ENTIRE BLOCK (lines 513-530):
function handleRoute() {
    const hash = window.location.hash;
    if (hash.startsWith('#p=')) {
        const path = decodeURIComponent(hash.slice(3));
        if (isSafeRepoPath(path)) {
            loadPage(path);
        } else {
            showDashboard();
        }
    } else {
        showDashboard();
    }
}
```

The live version at line 687 handles both `#p=` and `#a=` routes correctly. The dead version only handles `#p=` routes — it was superseded when asset permalinks were added.

### Step 2b — Add `'use strict'` to prevent future silent overrides

At the very top of `dist/app.js`, add:
```js
'use strict';
```

This causes any future duplicate function declaration to throw a `SyntaxError` at parse time rather than silently overriding.

### Step 2c — Verify

```bash
# Confirm only one handleRoute definition remains
grep -n "function handleRoute" dist/app.js
# Should print exactly one line
```

Run existing tests:
```bash
npm test
```

---

## Fix 3 — Delete Visual Spec Files That Will Crash CI [T-01]

**Root cause:** `tests/visual.spec.js` and `tests/visual.spec.mjs` are uncommitted dev scripts with no assertions. Once present on disk, Playwright's `testDir: './tests'` picks them up. Under `"type": "module"`, if either file ever uses `require()`, the entire test suite crashes.

**File:** Both files are currently untracked (`??` in git status).

### Step 3a — Delete the files

```bash
rm tests/visual.spec.js tests/visual.spec.mjs
```

### Step 3b — Add to `.gitignore` to prevent accidental future commits

Add to `.gitignore`:
```
tests/visual.spec.*
.playwright-mcp/
```

The `.playwright-mcp/` YAML files (9 untracked files in git status) are also noise that should be excluded.

### Step 3c — If screenshot capability is needed later

Create `scripts/screenshot.mjs` as a standalone script (not in `tests/`):
```js
// scripts/screenshot.mjs — run manually: node scripts/screenshot.mjs
import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:8000');
await page.screenshot({ path: '/tmp/screenshot.png', fullPage: true });
await browser.close();
```

---

## Verification Checklist

After all three fixes:

- [ ] `grep -n "function handleRoute" dist/app.js` returns exactly one line
- [ ] `grep -n "register('/sw.js')" dist/app.js` returns zero lines
- [ ] `grep -n "register('./sw.js')" dist/app.js` returns one line
- [ ] `grep "sw.js" .github/workflows/ci.yml` shows sw.js in the copy command
- [ ] `ls tests/visual.spec.*` returns "No such file"
- [ ] `npm test` passes
- [ ] CI passes on push
- [ ] On the deployed site: DevTools → Application → Service Workers shows active SW
