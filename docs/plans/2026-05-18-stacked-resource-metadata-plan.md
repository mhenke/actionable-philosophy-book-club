# Stacked Resource Metadata Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move duration·size metadata out of the inline label line into a dedicated `.asset-meta` line above the caption, across canonical video, slides, and podcast rows.

**Architecture:** Three small, independent function edits in `src/app.js` (`buildVideoRow`, `buildSlidesRow`, `buildPodcastRow`) plus one CSS addition in `index.html`. Each function converts its flat inline metadata to a stacked `.asset-meta` element.

**Tech Stack:** Vanilla JS, no framework.

---

### Task 1: Add `.asset-meta` CSS

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add `.asset-meta` rule after `.podcast-caption`**

In `index.html`, after the `.podcast-caption` block (line 186), add:

```css
        .asset-meta {
            font-size: 0.6875rem;
            font-weight: 400;
            color: var(--text-muted);
            line-height: 1.3;
            padding-left: 2.5rem;
        }
```

- [ ] **Step 2: Verify CSS insertion**

Run: `grep -n "asset-meta" index.html`
Expected: shows the new rule at line 187+

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "style: add .asset-meta CSS for stacked metadata line"
```

---

### Task 2: Update `buildVideoRow` — convert inline metadata to `.asset-meta`

**Files:**
- Modify: `src/app.js:187-204`

- [ ] **Step 1: Modify `buildVideoRow` to use stacked layout**

Current code (lines 194-203):
```js
            return `
                    <div class="asset-row" data-testid="${escapeHTML(meeting.id)}-canonical" data-canonical="true" id="${videoAssetId}">
                        <a href="${escapeHTML(meeting.video.file)}" class="asset-link" aria-label="${escapeHTML(meeting.video.label)}${videoDuration ? ', ' + videoDuration : ''} — ${escapeHTML(meeting.session)}">
                            <span class="icon-pill" style="background: var(--wash-3-border);" aria-hidden="true">🎬</span>
                            ${escapeHTML(meeting.video.label)}${metaSpan}
                        </a>
                        <a href="${escapeHTML(meeting.video.file)}" download
                           aria-label="Download ${escapeHTML(meeting.video.label)}${videoDuration ? ', ' + videoDuration : ''} — ${escapeHTML(meeting.session)}"
                           class="asset-dl">${DL_ICON}</a>
                    </div>`;
```

Replace with:
```js
            const metaLine = videoMeta ? `<span class="asset-meta">${videoMeta}</span>` : '';
            return `
                    <div class="asset-row" data-testid="${escapeHTML(meeting.id)}-canonical" data-canonical="true" id="${videoAssetId}">
                        <a href="${escapeHTML(meeting.video.file)}" class="asset-link asset-link--stacked" aria-label="${escapeHTML(meeting.video.label)}${videoDuration ? ', ' + videoDuration : ''} — ${escapeHTML(meeting.session)}">
                            <span class="asset-link-top">
                                <span class="icon-pill" style="background: var(--wash-3-border);" aria-hidden="true">🎬</span>
                                ${escapeHTML(meeting.video.label)}
                            </span>
                            ${metaLine}
                        </a>
                        <a href="${escapeHTML(meeting.video.file)}" download
                           aria-label="Download ${escapeHTML(meeting.video.label)}${videoDuration ? ', ' + videoDuration : ''} — ${escapeHTML(meeting.session)}"
                           class="asset-dl">${DL_ICON}</a>
                    </div>`;
```

Also remove the now-unused `metaSpan` variable on line 191:
```js
            const metaSpan = videoMeta ? `<span class="font-normal text-[11px] tracking-wide" style="color:var(--text-muted)">${videoMeta}</span>` : '';
```
→ delete this line entirely (the `videoMeta` variable is still needed for `metaLine` and `aria-label`).

- [ ] **Step 2: Commit**

```bash
git add src/app.js
git commit -m "feat: convert buildVideoRow to stacked .asset-meta layout"
```

---

### Task 3: Update `buildSlidesRow` — convert inline metadata to `.asset-meta`

**Files:**
- Modify: `src/app.js:216-229`

- [ ] **Step 1: Modify `buildSlidesRow` to use stacked layout**

Current code (lines 219-228):
```js
            return `
                    <div class="asset-row">
                        <a href="${buildPPTXViewerURL(meeting.slides.file)}" target="_blank" rel="noopener noreferrer" class="asset-link">
                            <span class="icon-pill" style="background: var(--wash-2-border);" aria-hidden="true">📊</span>
                            ${escapeHTML(meeting.slides.label)}${slidesMetaSpan}
                        </a>
                        <a href="${escapeHTML(meeting.slides.file)}" download
                           aria-label="Download slides — ${escapeHTML(meeting.session)}"
                           class="asset-dl">${DL_ICON}</a>
                    </div>`;
```

Replace with:
```js
            const metaLine = slidesSize ? `<span class="asset-meta">${slidesSize}</span>` : '';
            return `
                    <div class="asset-row">
                        <a href="${buildPPTXViewerURL(meeting.slides.file)}" target="_blank" rel="noopener noreferrer" class="asset-link asset-link--stacked">
                            <span class="asset-link-top">
                                <span class="icon-pill" style="background: var(--wash-2-border);" aria-hidden="true">📊</span>
                                ${escapeHTML(meeting.slides.label)}
                            </span>
                            ${metaLine}
                        </a>
                        <a href="${escapeHTML(meeting.slides.file)}" download
                           aria-label="Download slides — ${escapeHTML(meeting.session)}"
                           class="asset-dl">${DL_ICON}</a>
                    </div>`;
```

Also remove the now-unused `slidesMetaSpan` variable on line 218:
```js
            const slidesMetaSpan = slidesSize ? `<span class="font-normal text-[11px] tracking-wide" style="color:var(--text-muted)">${slidesSize}</span>` : '';
```
→ delete this line.

- [ ] **Step 2: Commit**

```bash
git add src/app.js
git commit -m "feat: convert buildSlidesRow to stacked .asset-meta layout"
```

---

### Task 4: Update `buildPodcastRow` — move metadata out of `.asset-link-top` into `.asset-meta`

**Files:**
- Modify: `src/app.js:241-265`

- [ ] **Step 1: Modify `buildPodcastRow` to use `.asset-meta`**

Current code (lines 251-264):
```js
            return `
                    <div class="asset-row" id="${podAssetId}">
                        <a href="${escapeHTML(pod.file)}" class="asset-link asset-link--stacked">
                            <span class="asset-link-top">
                                <span class="icon-pill" style="background: var(--wash-3-border);" aria-hidden="true">${cfg.icon}</span>
                                ${escapeHTML(pod.label)}${podMetaSpan}
                                <span class="podcast-badge" style="color:${cfg.color}">${escapeHTML(cfg.label)}</span>
                            </span>
                            <span class="podcast-caption">${escapeHTML(cfg.title || '')}</span>
                        </a>
                        <a href="${escapeHTML(pod.file)}" download
                           aria-label="${downloadLabel}"
                           class="asset-dl">${DL_ICON}</a>
                    </div>`;
```

Replace with:
```js
            const metaLine = podMeta ? `<span class="asset-meta">${podMeta}</span>` : '';
            return `
                    <div class="asset-row" id="${podAssetId}">
                        <a href="${escapeHTML(pod.file)}" class="asset-link asset-link--stacked">
                            <span class="asset-link-top">
                                <span class="icon-pill" style="background: var(--wash-3-border);" aria-hidden="true">${cfg.icon}</span>
                                ${escapeHTML(pod.label)}
                                <span class="podcast-badge" style="color:${cfg.color}">${escapeHTML(cfg.label)}</span>
                            </span>
                            ${metaLine}
                            <span class="podcast-caption">${escapeHTML(cfg.title || '')}</span>
                        </a>
                        <a href="${escapeHTML(pod.file)}" download
                           aria-label="${downloadLabel}"
                           class="asset-dl">${DL_ICON}</a>
                    </div>`;
```

Also remove the now-unused `podMetaSpan` variable on line 246:
```js
            const podMetaSpan = podMeta ? `<span class="font-normal text-[11px] tracking-wide" style="color:var(--text-muted)">${podMeta}</span>` : '';
```
→ delete this line.

- [ ] **Step 2: Commit**

```bash
git add src/app.js
git commit -m "feat: convert buildPodcastRow to stacked .asset-meta layout"
```

---

### Task 5: Build `dist/app.js`

**Files:**
- Build output: `dist/app.js`

- [ ] **Step 1: Run the JS build**

Run: `npm run build:js`
Expected: exits 0, regenerates `dist/app.js` from `src/app.js`

- [ ] **Step 2: Verify the build included changes**

Run: `grep -o 'asset-meta' dist/app.js | wc -l`
Expected: 3 (for .asset-meta in video, slides, and podcast rows) — or whatever the minifier produces. Should appear at least 3 times.

- [ ] **Step 3: Commit**

```bash
git add dist/app.js
git commit -m "build: regenerate dist/app.js after stacked metadata changes"
```

---

### Task 6: Add test for `.asset-meta` in rendered output

**Files:**
- Create: `tests/asset-meta.spec.js`

- [ ] **Step 1: Write the test**

```js
const { test, expect } = require('@playwright/test');

test.describe('Asset meta line', () => {

  test('canonical video row renders .asset-meta with duration and size', async ({ page }) => {
    await page.goto('/');
    const container = page.locator('#upcoming-materials-container');
    await expect(container).toBeVisible();

    const meta = container.locator('.asset-meta').first();
    await expect(meta).toBeVisible();
    const text = await meta.textContent();
    expect(text).toMatch(/\d+m\s+\d+s/);  // e.g. "3m 9s · 31 MB"
    expect(text).toMatch(/MB/);
  });

  test('slides row renders .asset-meta with file size', async ({ page }) => {
    await page.goto('/');
    const container = page.locator('#upcoming-materials-container');
    const meta = container.locator('.asset-meta').nth(1);  // slides is second primary row
    await expect(meta).toBeVisible();
    const text = await meta.textContent();
    expect(text).toMatch(/MB/);
  });

  test('podcast row renders .asset-meta with duration and size', async ({ page }) => {
    await page.goto('/');
    // Open the Additional Resources disclosure
    const summary = page.locator('.podcast-disclosure summary');
    await summary.click();

    const meta = page.locator('.podcast-disclosure .asset-meta').first();
    await expect(meta).toBeVisible();
    const text = await meta.textContent();
    expect(text).toMatch(/\d+m\s+\d+s/);
    expect(text).toMatch(/MB/);
  });
});
```

- [ ] **Step 2: Run tests**

Run: `npx playwright test tests/asset-meta.spec.js --reporter=list`
Expected: All 3 tests PASS

- [ ] **Step 3: Run full test suite**

Run: `npm test`
Expected: All 71+ tests PASS (no regressions from existing tests)

- [ ] **Step 4: Commit**

```bash
git add tests/asset-meta.spec.js
git commit -m "test: asset-meta element rendered for video, slides, and podcast rows"
```
