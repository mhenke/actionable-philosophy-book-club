# P3 Low Priority Fixes Plan

**Priority:** Track in backlog; pick up when touching related areas  
**Estimated effort:** Variable — most items are 5–30 minutes each  
**Prerequisite:** P0, P1, P2 complete (or in flight)  
**Source:** `.full-review/05-final-report.md`

Items grouped by area. Pick items opportunistically when already touching related code.

---

## Group A — JavaScript Cleanup

### A1 — Remove Dead `marked.use()` Options [BP-03]

**File:** `dist/app.js:818`  
`headerIds` and `mangle` were removed in `marked@5`. They are no-ops that will produce console warnings on upgrade.

```js
// Before:
marked.use({ gfm: true, breaks: true, headerIds: false, mangle: false });

// After:
marked.use({ gfm: true, breaks: true });
```

Do this alongside the `marked` version upgrade (P1 Fix 10).

---

### A2 — Replace `.onclick` Property Assignment with `addEventListener` [L-1.5 / BP-17]

**File:** `dist/app.js:593-594`

```js
// Before:
resumeBtn.onclick = () => { ... };
startBtn.onclick = () => { ... };

// After:
resumeBtn.addEventListener('click', () => { ... }, { once: true });
startBtn.addEventListener('click', () => { ... }, { once: true });
```

`{ once: true }` auto-removes after the first click, matching the expected UX (choose resume or start fresh; choice disappears after).

---

### A3 — Add `clients.claim()` to SW Activate Handler [BP-18]

**File:** `sw.js:17-21`

Without `clients.claim()`, open tabs remain controlled by the prior SW version until they reload.

```js
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(k => k !== CACHE).map(k => caches.delete(k))
            ))
            .then(() => self.clients.claim())  // add this
    );
});
```

---

### A4 — Remove `autoprefixer` or Wire It Up [BP-14]

**File:** `package.json`

`autoprefixer` is installed but PostCSS is never configured. Pick one:

**Option A — Remove (simpler):**
```bash
npm uninstall autoprefixer
```

Tailwind v3's built-in output already handles most vendor prefix needs for modern browsers.

**Option B — Wire up PostCSS:**

Create `postcss.config.cjs`:
```js
module.exports = {
    plugins: {
        tailwindcss: {},
        autoprefixer: {},
    },
};
```

Update `package.json` build script to use PostCSS CLI instead of Tailwind CLI directly:
```json
"build:css": "postcss src/input.css -o dist/tailwind.css --env production"
```

Option A is recommended given the project's zero-build philosophy.

---

### A5 — Remove `autoprefixer` from devDependencies If Vendoring Libs [BP-21]

**File:** `package.json`

After completing P2-C1 (self-host `marked` and `DOMPurify`), they should also be listed in `devDependencies` so `npm audit` tracks them:

```json
"devDependencies": {
    "marked": "15.0.7",
    "dompurify": "3.2.4",
    ...
}
```

This means audit results will include any future CVEs in these packages, even if they're loaded from `dist/vendor/`.

---

### A6 — Implement `setView()` Helper for Footer Show/Hide [L3]

**File:** `dist/app.js`

The footer toggle is scattered across `showDashboard()` and `loadPage()`. Centralise:

```js
function setView(view) {
    const isDashboard = view === 'dashboard';
    dashboard.classList.toggle('hidden-view', !isDashboard);
    reader.classList.toggle('hidden-view', isDashboard);
    document.getElementById('site-footer').classList.toggle('hidden', !isDashboard);
}
```

Replace direct `classList` manipulation in `showDashboard` and `loadPage` with `setView('dashboard')` and `setView('reader')`.

---

## Group B — Testing Additions

### B1 — Add Test: SW Registration Succeeds [T-02]

**File:** New test in `tests/sw.spec.js`

```js
import { test, expect } from '@playwright/test';

test('service worker registers and becomes active', async ({ page }) => {
    await page.goto('/');
    // First visit registers the SW
    await page.goto('/');  // second visit — SW should now be controlling

    const swActive = await page.evaluate(() =>
        navigator.serviceWorker.controller !== null
    );
    expect(swActive).toBe(true);
});

test('SW precache includes critical assets', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);  // allow SW install

    const cached = await page.evaluate(async () => {
        const cache = await caches.open(/* CACHE name */);
        const keys = await cache.keys();
        return keys.map(r => r.url);
    });

    expect(cached.some(url => url.includes('dist/app.js'))).toBe(true);
    expect(cached.some(url => url.includes('dist/tailwind.css'))).toBe(true);
});
```

---

### B2 — Add Test: `mdCache` Eviction Order [T-08]

**File:** `tests/path-validator.spec.js` or new `tests/cache.spec.js`

```js
test('mdCache FIFO eviction keeps most recently loaded entry', async ({ page }) => {
    await page.addInitScript(() => { window.__TEST__ = true; });
    await page.goto('/');

    // Load 21 paths to trigger eviction (max is 20)
    const evicted = await page.evaluate(async () => {
        const firstPath = 'meetings/meeting-01/README.md';
        // Access firstPath first
        await window.prefetchMarkdown(firstPath);
        // Fill cache with 20 more paths
        for (let i = 2; i <= 21; i++) {
            await window.prefetchMarkdown(`meetings/meeting-0${i}/README.md`);
        }
        // firstPath should have been evicted (FIFO: first in, first out)
        return !window.mdCache.has(firstPath);
    });

    expect(evicted).toBe(true);
});
```

---

### B3 — Add Test: `#a=` Asset Permalink Route [T-11]

**File:** `tests/routing.spec.js`

```js
test('navigating to #a= permalink scrolls to and highlights the asset', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card');

    // Navigate to an asset permalink
    await page.goto('/#a=meetings/meeting-01/recordings/01-recording.mp4');

    // A card should be highlighted (or scrolled to)
    const highlightedCard = page.locator('.card.card--highlighted, .card:focus');
    await expect(highlightedCard).toBeVisible();
});
```

---

### B4 — Add Test: Onboarding Banner Dismiss and Persistence [T-15]

**File:** New `tests/onboarding.spec.js`

```js
test('onboarding banner shown on first visit', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#onboarding-banner')).toBeVisible();
});

test('onboarding banner hidden after dismiss', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-dismiss-onboarding]').click();
    await expect(page.locator('#onboarding-banner')).toBeHidden();
});

test('onboarding banner stays hidden on reload after dismiss', async ({ page }) => {
    // Simulate previously dismissed
    await page.addInitScript(() => {
        window.__TEST__ = true;
        localStorage.setItem('apbc:onboarding_dismissed', '1');
    });
    await page.goto('/');
    await expect(page.locator('#onboarding-banner')).toBeHidden();
});
```

---

## Group C — HTML & Accessibility

### C1 — Replace `<span>` Meeting Dates with `<time datetime>` [BP-26]

**File:** `index.html` and the date rendering in `dist/app.js` archive card template

For hardcoded dates in `index.html`:
```html
<!-- Before: -->
<span class="text-[0.6875rem] ...">Meeting 02 • 15 May 26</span>

<!-- After: -->
<time datetime="2026-05-15" class="text-[0.6875rem] ...">Meeting 02 • 15 May 26</time>
```

For dynamically rendered cards in `dist/app.js`, ensure the `date` field from the MEETINGS manifest is output as:
```js
`<time datetime="${meeting.date}">${meeting.displayDate}</time>`
```

Requires adding a `date` field (ISO format `YYYY-MM-DD`) to the manifest schema.

---

### C2 — Fix `<h1>` Heading Hierarchy [BP-15]

**File:** `index.html`

The `<h1>` (book title "A Philosophy of Software Design") lives in the sticky `<header>`. The `<main>` content has no `<h1>` — sections use `<h2>`. Screen reader users navigating by headings get an inverted hierarchy.

Move the book title from the `<header>` into `<main>`, or change the `<header>` element from `<h1>` to a `<p>` or `<strong>` styled to look the same:

```html
<!-- Before in <header>: -->
<h1 class="text-sm md:text-base swiss-caps ...">A Philosophy of Software Design</h1>

<!-- After in <header> (styling preserved, demoted semantically): -->
<p class="text-sm md:text-base swiss-caps ..." aria-hidden="true">A Philosophy of Software Design</p>

<!-- Add at start of <main>: -->
<h1 class="sr-only">Actionable Philosophy Book Club</h1>
```

Using `sr-only` for the `<main>` heading keeps the visual design unchanged while fixing the semantic hierarchy.

---

### C3 — Update `<article aria-label>` After Markdown Loads [BP-16]

**File:** `dist/app.js` — inside `loadPage`, after the title extraction (~line 459):

```js
const h1 = content.querySelector('h1');
if (h1) {
    document.title = h1.textContent + ' — Actionable Philosophy Book Club';
    content.setAttribute('aria-label', h1.textContent.trim());
}
```

---

### C4 — Remove Redundant `color-scheme` Declaration [BP-23]

**File:** `index.html`

`color-scheme: light` is declared in both the `<meta>` tag (line 13) and the `:root` CSS (line 27). The `<meta>` tag is the correct location (browsers adapt chrome before CSS loads). Remove from `:root`:

```css
/* Before: */
:root {
    color-scheme: light;
    ...
}

/* After: */
:root {
    /* color-scheme set via <meta> tag */
    ...
}
```

---

### C5 — Replace `<footer>` Inline Style [BP-25]

**File:** `index.html:674`

```html
<!-- Before: -->
<footer id="site-footer" class="py-8 text-center" style="border-top: 2px solid var(--spectrum-2);">

<!-- After: -->
<footer id="site-footer" class="py-8 text-center border-t-2 border-spectrum-2">
```

This removes one contributor to the `style-src 'unsafe-inline'` CSP requirement.

---

## Group D — CI/CD Housekeeping

### D1 — Add `og:image` and `<link rel="canonical">` [BP-24]

**File:** `index.html`

```html
<!-- Add to <head> after existing og: tags: -->
<meta property="og:image" content="https://mhenke.github.io/actionable-philosophy-book-club/assets/social-preview.png">
<link rel="canonical" href="https://mhenke.github.io/actionable-philosophy-book-club/">
```

For `og:image`, create a simple social preview image at `assets/social-preview.png` (1200×630 px). Use the book title and color scheme.

---

### D2 — Add `SECURITY.md` [D-10]

**File:** `SECURITY.md` (repo root)

```markdown
# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

**Do not** open a public GitHub issue for security vulnerabilities.

**Email:** [your contact email]

We will acknowledge your report within 48 hours and aim to resolve confirmed issues within 14 days.

## Scope

This is a static, client-side only site with no server-side processing, no user accounts, and no stored PII. The primary security surface is:
- Client-side XSS via rendered markdown content
- Supply-chain integrity of CDN-loaded scripts
- GitHub Actions pipeline integrity

## Out of Scope

- Denial of service
- Issues requiring physical access
- Issues in third-party services (GitHub Pages, jsDelivr)
```

---

### D3 — Add Dependabot Groups and Automerge Config [CD-11]

**File:** `.github/dependabot.yml`

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
    groups:
      dev-deps:
        patterns: ["*"]
        update-types: ["minor", "patch"]

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
```

The `groups` block batches all minor/patch npm updates into a single PR, reducing noise. Enable automerge for Dependabot patch PRs in repository Settings → General → Allow auto-merge (then Dependabot PRs that pass CI will merge automatically).

---

### D4 — Add `.playwright-mcp/` and Other Noise to `.gitignore` [L8]

**File:** `.gitignore`

```
# Playwright MCP session files
.playwright-mcp/

# Review artifacts
.full-review/
.full-review-archived-*/

# Screenshot dev scripts output
/tmp/screenshot*.png
```

---

### D5 — Add ADRs for Undocumented Decisions [D-08]

Create these three ADR files under `docs/adr/`:

**`docs/adr/0004-tailwind-css.md`**
- Decision: Use Tailwind CSS v3 for utility classes
- Alternatives considered: Plain CSS, CSS Modules, UnoCSS
- Rationale: Rapid prototyping; consistent spacing/color tokens; good Tailwind JIT → pre-built CSS migration path

**`docs/adr/0005-markdown-rendering.md`**
- Decision: Use `marked` + `DOMPurify` for client-side markdown rendering
- Alternatives considered: `micromark`, `markdown-it`, server-side rendering
- Rationale: Both are widely used; DOMPurify is the gold standard for sanitization; SRI provides integrity guarantee; CDN-loaded until self-hosted

**`docs/adr/0006-manifest-location.md`**
- Decision: [Either] Keep MEETINGS manifest in `dist/app.js` [or] Move to `meetings/manifest.json` (after P2-A12)
- Rationale and trade-offs: zero-network-request first paint (inline) vs. non-developer editability and schema validation (JSON file)

---

### D6 — Update PR Preview / Staging Consideration [CD-10]

Not a code change — evaluate whether to add a PR preview workflow.

For a GitHub Pages project page, a preview workflow would:
1. Build the site on PR
2. Deploy to `gh-pages-pr-{number}` branch or use the Surge.sh / Netlify draft deploy pattern
3. Post a comment on the PR with the preview URL
4. Clean up the preview on PR close

The main cost is workflow complexity. Given the site's simplicity (static HTML, no build step), this is a low-effort addition if visual review before merge is important.

---

## Group E — Documentation Polish

### E1 — Mark Completed Plans in `docs/plans/` [D-12]

After implementing any plan, add a `[DONE]` prefix or move to `docs/plans/archive/`:
```bash
mkdir -p docs/plans/archive
git mv docs/plans/2026-05-16-alternate-video-implementation-plan.md docs/plans/archive/
```

---

### E2 — Update Test Count in `AGENTS.md` [D-06]

After deleting the visual spec files (P0 Fix 3), recount:
```bash
npx playwright test --list 2>/dev/null | grep -c "^  "
```

Update `AGENTS.md:54` with the correct count.

---

### E3 — Add `<time datetime>` to Meeting Dates in Content Contract [D-07]

**File:** `docs/content-contract.md`

Add a note warning about the `## Meeting Materials` heading requirement:
> **Important:** The exact heading `## Meeting Materials` (case-insensitive) is required for the file-tree renderer to format this section as a structured asset list. Any other heading (e.g., `## Materials`, `## Resources`) will produce a plain unformatted list.

---

## Opportunistic Rule

When touching any file in this backlog for an unrelated reason, handle the adjacent L3 items in the same commit. Specifically:

- **When touching `index.html`:** Fix C4 (color-scheme), C5 (footer inline style), C2 (`<h1>` hierarchy)
- **When touching `dist/app.js`:** Fix A1 (dead marked options), A2 (onclick), A6 (setView helper)
- **When touching `sw.js`:** Fix A3 (clients.claim), BP-22 (.nojekyll precache)
- **When touching `.github/workflows/`:** Fix D2 (deploy timeout), D3 (Dependabot groups)
- **When touching `AGENTS.md`:** Fix E2 (test count)
- **When touching `docs/`:** Fix E3 (content-contract warning), add ADRs (D5)
