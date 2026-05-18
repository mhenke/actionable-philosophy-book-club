# Asset Copy Single Source of Truth Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move asset-type copy out of the renderer and into shared registries so dashboard labels, tooltips, and README wording stop drifting.

**Architecture:** Keep runtime asset copy and authored README/agenda copy separate, but make each surface read from one registry. The manifest will own dashboard-facing asset metadata, while the docs/template layer will own human-facing agenda vocabulary. The renderer should become a dumb consumer of the runtime registry.

**Tech Stack:** Vanilla JS, JSON manifest data, Markdown templates, Playwright tests.

---

### Task 1: Add the runtime asset copy registry

**Files:**
- Modify: `docs/manifest.json`
- Modify: `dist/app.js:161-166`

**Step 1: Write the failing test**

Add an assertion in `tests/asset-behavior.spec.js` that reads the upcoming `deep-dive` row and expects the copied title to come from shared data, not a hardcoded string in the renderer.

**Step 2: Run test to verify it fails**

Run:
```bash
npx playwright test tests/asset-behavior.spec.js --grep "deep-dive"
```
Expected: FAIL because the registry entry does not exist yet, or the renderer still resolves the old literal string.

**Step 3: Write minimal implementation**

Add an `assetKinds` object to `docs/manifest.json` with entries for `alternate` and `deep-dive`. Keep labels, tooltips, icons, and colors there. Update `dist/app.js` so podcast row rendering reads `assetKinds[pod.type]` and falls back to the current safe defaults when a type is missing.

**Step 4: Run test to verify it passes**

Run:
```bash
npx playwright test tests/asset-behavior.spec.js --grep "deep-dive"
```
Expected: PASS.

**Step 5: Commit**

```bash
git add docs/manifest.json dist/app.js tests/asset-behavior.spec.js
git commit -m "feat: centralize asset type copy"
```

### Task 2: Separate dashboard copy from agenda wording

**Files:**
- Modify: `docs/content-contract.md:159-220`
- Modify: `templates/meeting-README-template.md:1-36`

**Step 1: Write the failing test**

Add a small content check in `tests/manifest-rendering.spec.js` that confirms the dashboard label registry and README wording are separate concepts, not one shared string table.

**Step 2: Run test to verify it fails**

Run:
```bash
npx playwright test tests/manifest-rendering.spec.js --grep "copy"
```
Expected: FAIL until the docs clearly spell out the separation.

**Step 3: Write minimal implementation**

Update `docs/content-contract.md` so it explicitly says:
- dashboard/runtime copy comes from the manifest registry
- README/agenda copy stays in the docs/template layer

Update `templates/meeting-README-template.md` so the agenda labels keep the authored wording and do not imply they are sourced from the runtime bundle.

**Step 4: Run test to verify it passes**

Run:
```bash
npx playwright test tests/manifest-rendering.spec.js --grep "copy"
```
Expected: PASS.

**Step 5: Commit**

```bash
git add docs/content-contract.md templates/meeting-README-template.md tests/manifest-rendering.spec.js
git commit -m "docs: separate asset and agenda vocabularies"
```

### Task 3: Verify the browser renders the new source of truth

**Files:**
- Modify: `tests/asset-behavior.spec.js`

**Step 1: Write the failing test**

Add a Playwright assertion that loads Meeting 02 and checks the deep-dive row title matches the manifest-provided copy.

**Step 2: Run test to verify it fails**

Run:
```bash
npx playwright test tests/asset-behavior.spec.js --grep "deep-dive|Meeting 02"
```
Expected: FAIL until the browser picks up the new registry mapping.

**Step 3: Write minimal implementation**

If needed, adjust the renderer to resolve the runtime registry before building the podcast disclosure, and keep the fallback path unchanged for unknown types.

**Step 4: Run test to verify it passes**

Run:
```bash
npx playwright test tests/asset-behavior.spec.js --grep "deep-dive|Meeting 02"
```
Expected: PASS.

**Step 5: Commit**

```bash
git add tests/asset-behavior.spec.js dist/app.js
git commit -m "test: cover asset copy registry rendering"
```

### Task 4: Full verification

**Files:**
- None

**Step 1: Run the targeted test files**

Run:
```bash
npx playwright test tests/asset-behavior.spec.js tests/manifest-rendering.spec.js
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
git commit -m "feat: unify asset copy sources"
```
