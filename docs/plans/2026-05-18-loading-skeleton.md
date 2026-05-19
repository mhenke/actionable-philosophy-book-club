# Loading Skeleton Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace refresh-time loading flashes with detailed, section-accurate skeletons for the dashboard and reader.

**Architecture:** Render the dashboard skeleton immediately on refresh, using the same structural containers and section rhythm as the final page. Keep the reader loading state separate, but make it a detailed article outline so the page feels intentional while markdown loads. Skeletons should be structural, not generic gray blocks, and they should swap out in place when real content is ready.

**Tech Stack:** Vanilla JavaScript, HTML/CSS in `index.html`, `dist/app.js`, Playwright.

---

### Task 1: Add the dashboard skeleton renderer

**Files:**
- Modify: `dist/app.js`
- Modify: `index.html`
- Test: `tests/manifest-rendering.spec.js`

**Step 1: Write the failing test**

Add a Playwright test that refreshes the dashboard and asserts the page shows a detailed skeleton before the manifest finishes rendering. The test should check for:
- a populated upcoming-card skeleton
- placeholder content in Coming Up and Past
- placeholder tiles in Knowledge Base
- no collapsed/mostly-empty dashboard shell during the refresh window

**Step 2: Run test to verify it fails**

Run:
```bash
npx playwright test tests/manifest-rendering.spec.js --grep "skeleton"
```
Expected: FAIL because the skeleton does not exist yet.

**Step 3: Write minimal implementation**

Add dashboard skeleton markup/rendering in `dist/app.js` so the page renders a detailed loading state before the manifest data is applied. If needed, add lightweight CSS in `index.html` for skeleton blocks, card placeholders, and tile placeholders. Keep the section order identical to the final dashboard.

**Step 4: Run test to verify it passes**

Run:
```bash
npx playwright test tests/manifest-rendering.spec.js --grep "skeleton"
```
Expected: PASS.

**Step 5: Commit**

```bash
git add dist/app.js index.html tests/manifest-rendering.spec.js
git commit -m "feat: add dashboard loading skeleton"
```

### Task 2: Add the reader outline skeleton

**Files:**
- Modify: `dist/app.js`
- Modify: `index.html`
- Test: `tests/routing.spec.js`

**Step 1: Write the failing test**

Add a Playwright test that opens a markdown reader route and asserts the reader shows an article-outline skeleton while content is loading. The test should check for a title block, metadata line, section-heading placeholders, and paragraph/list blocks.

**Step 2: Run test to verify it fails**

Run:
```bash
npx playwright test tests/routing.spec.js --grep "skeleton"
```
Expected: FAIL because the reader skeleton does not exist yet.

**Step 3: Write minimal implementation**

Add the reader skeleton in `dist/app.js` so `loadPage()` shows a detailed outline while markdown fetch/render completes. Keep the current reader error path intact, but avoid abrupt visual jumps between loading and loaded states.

**Step 4: Run test to verify it passes**

Run:
```bash
npx playwright test tests/routing.spec.js --grep "skeleton"
```
Expected: PASS.

**Step 5: Commit**

```bash
git add dist/app.js index.html tests/routing.spec.js
git commit -m "feat: add reader loading skeleton"
```

### Task 3: Verify refresh stability end to end

**Files:**
- Modify: `tests/manifest-rendering.spec.js`
- Modify: `tests/routing.spec.js`

**Step 1: Write the failing test**

Add a refresh-focused test that reloads the dashboard and confirms the skeleton appears first, then real content replaces it in place without collapsing the main body. Add a reader-load check that confirms the outline skeleton is replaced by markdown content without a layout snap.

**Step 2: Run test to verify it fails**

Run:
```bash
npx playwright test tests/manifest-rendering.spec.js tests/routing.spec.js --grep "refresh|skeleton"
```
Expected: FAIL until both flows are covered.

**Step 3: Write minimal implementation**

Adjust the skeleton and swap timing if needed so both flows remain stable on refresh, including the main body sections and the reader article layout.

**Step 4: Run test to verify it passes**

Run:
```bash
npx playwright test tests/manifest-rendering.spec.js tests/routing.spec.js --grep "refresh|skeleton"
```
Expected: PASS.

**Step 5: Commit**

```bash
git add tests/manifest-rendering.spec.js tests/routing.spec.js dist/app.js index.html
git commit -m "test: cover loading skeleton refresh flow"
```

### Task 4: Full verification

**Files:**
- None

**Step 1: Run the targeted test files**

Run:
```bash
npx playwright test tests/manifest-rendering.spec.js tests/routing.spec.js
```
Expected: PASS.

**Step 2: Run the full suite**

Run:
```bash
npm test
```
Expected: all Playwright tests pass.

**Step 3: Commit**

```bash
git add .
git commit -m "feat: stabilize refresh loading states"
```
