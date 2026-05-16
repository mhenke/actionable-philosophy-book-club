# Alternate Video Labeling Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Surface canonical and alternate meeting media in the MEETINGS manifest, update asset-compressor to detect/label alternates, and add tests and release steps to verify behavior.

**Architecture:** Minimal schema extension to MEETINGS (asset.variant), rendering changes in renderArchiveCards()/renderUpcomingMaterials(), and upgrades to asset-compressor rename/compress scripts to preserve provenance and write variant metadata.

**Tech Stack:** Vanilla JS single-file SPA (index.html), Node-based asset-compressor skill scripts (asset-compressor/), Playwright tests, npx impeccable audit.

---

### Task 1: Add variant field to manifest and update examples

**Files:**
- Modify: `index.html` (MEETINGS manifest block, lines around existing meeting entries)
- Modify: `CONTRIBUTING.md` (asset examples)

**Step 1: Write the failing test**
- Create: `tests/manifest-variant.spec.js`

```js
import { test, expect } from '@playwright/test';

test('manifest entries include variant for alternates', async ({ page }) => {
  await page.goto('http://localhost:5000');
  // fetch the MEETINGS JSON object from the page script
  const meetings = await page.evaluate(() => window.MEETINGS);
  const m = meetings.find(m => m.id === 'meeting-01');
  expect(m).toBeTruthy();
  expect(m.video.variant).toBeDefined();
});
```

**Step 2: Run test to verify it fails**
Run: `npx playwright test tests/manifest-variant.spec.js -g manifest -v`
Expected: FAIL (no variant property)

**Step 3: Add variant fields to index.html manifest**
- Edit meeting entries to include `variant: 'canonical'` on canonical assets and `variant: 'alternate'` on alternates.

**Step 4: Run test to verify it passes**
Run: `npx playwright test tests/manifest-variant.spec.js -g manifest -v`
Expected: PASS

**Step 5: Commit**

```bash
git add index.html tests/manifest-variant.spec.js CONTRIBUTING.md
git commit -m "feat: add asset.variant to MEETINGS manifest (canonical|alternate)\n\nCo-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Task 2: Render alternates in UI under canonical asset

**Files:**
- Modify: `index.html: renderArchiveCards()` (function body)
- Modify: `index.html: renderUpcomingMaterials()` (if exists)
- Test: `tests/manifest-variant.spec.js` (extend to check DOM rendering)

**Step 1: Write failing UI test**
Update `tests/manifest-variant.spec.js` to add DOM checks:

```js
// after loading page
const canonicalRow = await page.locator(`data-testid=meeting-01-canonical`).first();
const altRow = await page.locator(`data-testid=meeting-01-alternate`).first();
expect(canonicalRow).toBeTruthy();
expect(altRow).toBeTruthy();
```

Run: `npx playwright test tests/manifest-variant.spec.js -g manifest-ui -v`
Expected: FAIL

**Step 2: Implement minimal rendering changes**
- In renderArchiveCards(), when mapping assets, if variant==='alternate', append a small sub-row under the canonical asset with `data-testid="meeting-<NN>-alternate"`.
- Use existing CSS token classes; no visual overhaul.

**Step 3: Run tests**
Expected: PASS

**Step 4: Commit**

```bash
git add index.html tests/manifest-variant.spec.js
git commit -m "feat: render alternate assets under canonical rows + tests\n\nCo-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Task 3: Update asset-compressor rename helper to detect alternates

**Files:**
- Modify/Create: `asset-compressor/rename_asset.sh` (or corresponding script)
- Modify: `asset-compressor/README.md` (docs)
- Test: manual script run and unit test (if present)

**Step 1: Add detection logic**
- Detect filename patterns `-alt`, `_alt`, `-alternate`, `_alternate`.
- When detected, output target filename with `-alternate` suffix and write `variant: 'alternate'` to manifest entry.
- Preserve `source_filename` in manifest.

**Step 2: Run script on sample files in ~/Downloads/aposd and assert manifest updates**
Expected: manifest contains variant entries and normalized filenames.

**Step 3: Commit**

```bash
git add asset-compressor/* index.html
git commit -m "feat(asset-compressor): detect and label alternate assets; preserve source_filename\n\nCo-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Task 4: Tests & Audit

**Files:**
- Modify: `tests/manifest-variant.spec.js` (additional assertions)

Steps:
- Run: `npx playwright test` (full suite)
- Run: `npx impeccable harden` and `npx impeccable audit`
- Fix regressions if any
- Commit fixes

### Task 5: Release steps

Steps:
- Ensure all tests pass and audit green
- Confirm Pages settings
- Create tag: `git tag -a v1.0.1 -m "release: alternate asset labeling + hardening"`
- Push tag: `git push origin --tags`
- Draft GitHub release via web UI or `gh release create`

---

Plan saved to `docs/plans/2026-05-16-alternate-video-implementation-plan.md`.

Execution options:
1) Subagent-driven (this session) — dispatch implementers for each Task sequentially
2) Parallel session — run in separate executing-plans session

Which execution approach? Reply with "subagent" or "parallel".