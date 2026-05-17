# Spectrum Rule Full-width Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make `.spectrum-rule` dividers span the full width of the content container so headings consistently show a full-width gradient rule.

**Architecture:** Minimal CSS tweak in `index.html`. Keep DOM unchanged; update the inline stylesheet so `.spectrum-rule` grows to fill available space in its container. Add a concise Playwright assertion to prevent regressions.

**Tech Stack:** Vanilla HTML/CSS/JS, Playwright E2E tests

---

### Task 1: Add failing Playwright assertion

**Files:**
- Modify: `tests/manifest-rendering.spec.js`

**Step 1: Write the failing test**

Add a test that measures the `.spectrum-rule` computed width and asserts it is greater than 200px for a typical content container at 1024px viewport (ensures it no longer uses 240px cap).

Example (Playwright):
```js
test('spectrum-rule spans content width', async ({ page }) => {
  await page.goto('/');
  await page.setViewportSize({ width: 1024, height: 768 });
  const ruleWidth = await page.locator('.spectrum-rule').evaluate(el => el.getBoundingClientRect().width);
  expect(ruleWidth).toBeGreaterThan(200);
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/manifest-rendering.spec.js` 
Expected: FAIL because current rule is capped at 240px and depending on heading width may be less than expectation.

**Step 3: Commit the failing test**

```bash
git add tests/manifest-rendering.spec.js
git commit -m "test: add spectrum-rule width assertion"
```

### Task 2: Update CSS to allow full-width

**Files:**
- Modify: `index.html: lines around .spectrum-rule in the inline <style>`

**Step 1: Edit CSS**

Replace `max-width: 240px;` with:
```css
.spectrum-rule {
  flex: 1 1 auto;
  max-width: none;
  width: 100%;
  display: block;
}
```

If headings and rule are inside a flex container, ensure heading has `flex: 0 0 auto;` so it doesn't shrink.

**Step 2: Run tests**

Run: `npm test -- tests/manifest-rendering.spec.js`
Expected: PASS

**Step 3: Commit change**

```bash
git add index.html
git commit -m "style: spectrum-rule span full content width"
```

### Task 3: Visual spot check & full test run

**Files:**
- No code changes

**Step 1: Run full test suite**

Run: `npm run test:links && npm test`
Expected: All tests pass.

**Step 2: Manual spot check**

Run local server: `python3 -m http.server 8000` and open:
- `http://127.0.0.1:8000/`
Confirm headings show full-width rule.

**Step 3: Commit any test adjustments**

```bash
git add .
git commit -m "test: verify spectrum-rule full-width" || true
```

---

Plan saved.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
