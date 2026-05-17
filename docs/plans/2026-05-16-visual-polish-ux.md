# Visual Polish and UX Refinement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the dashboard hierarchy clearer, smooth the dashboard-to-reader transition, and polish interaction states without changing the site’s core structure.

**Architecture:** Keep the existing single-page shell and update only the minimum HTML/CSS/JS needed to improve perceived quality. Focus on spacing and hierarchy in `index.html`, loading and route behavior in `dist/app.js`, and small-state consistency across cards and links. Add or adjust tests around the visible behavior so the changes stay stable.

**Tech Stack:** Vanilla HTML, CSS, JavaScript, Playwright, GitHub Pages

---

### Task 1: Tighten dashboard hierarchy and spacing

**Files:**
- Modify: `index.html:315-390`
- Test: `tests/manifest-rendering.spec.js`

**Step 1: Write the failing test**

Add a Playwright assertion that the dashboard’s primary meeting card is the first prominent interactive surface and that the archive and knowledge base still render below it in the expected order.

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/manifest-rendering.spec.js`

Expected: the new assertion fails before spacing/order changes are made.

**Step 3: Write minimal implementation**

Adjust the dashboard layout in `index.html` by reducing excess section spacing, keeping the next-meeting card visually dominant, and preserving the existing archive/knowledge-base structure.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/manifest-rendering.spec.js`

Expected: PASS.

**Step 5: Commit**

```bash
git add index.html tests/manifest-rendering.spec.js
git commit -m "refine: tighten dashboard hierarchy"
```

### Task 2: Smooth the reader handoff

**Files:**
- Modify: `dist/app.js:372-475`
- Modify: `index.html:395-423`
- Test: `tests/routing.spec.js`

**Step 1: Write the failing test**

Add a routing test that checks the reader transition keeps a stable shell during load, shows a deliberate loading state, and leaves no stale dashboard content visible after route change.

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/routing.spec.js`

Expected: the new transition assertion fails with the current flash/swap behavior.

**Step 3: Write minimal implementation**

Keep the dashboard/footer shell behavior stable, adjust the reader loading sequence so the loading state is visible before content swap, and make sure route/theme updates happen in a single predictable pass.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/routing.spec.js`

Expected: PASS.

**Step 5: Commit**

```bash
git add dist/app.js index.html tests/routing.spec.js
git commit -m "fix: smooth reader transition"
```

### Task 3: Polish hover, focus, and active states

**Files:**
- Modify: `index.html:68-306`
- Modify: `dist/app.js:506-515`
- Test: `tests/path-validator.spec.js` and `tests/dashboard-xss.spec.js` if interaction changes touch links

**Step 1: Write the failing test**

Add or extend Playwright coverage for visible focus behavior and pressed/hovered interaction state on key dashboard links and card surfaces.

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/path-validator.spec.js tests/dashboard-xss.spec.js`

Expected: the new interaction assertions fail until the state styling is updated.

**Step 3: Write minimal implementation**

Normalize transition durations, focus visibility, and active-state feedback across cards, buttons, asset links, and knowledge-base tiles while keeping the existing palette and motion restraint.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/path-validator.spec.js tests/dashboard-xss.spec.js`

Expected: PASS.

**Step 5: Commit**

```bash
git add index.html dist/app.js tests/path-validator.spec.js tests/dashboard-xss.spec.js
git commit -m "style: polish interaction states"
```

### Task 4: Verify the full site after the UX pass

**Files:**
- No code changes

**Step 1: Run the full validation suite**

Run: `npm run build:css && npm run test:links && npm test`

Expected: CSS build succeeds, link check passes, and the full Playwright suite passes.

**Step 2: Spot-check the live experience**

Run: `python3 -m http.server 8000` and load:

- `http://127.0.0.1:8000/`
- `http://127.0.0.1:8000/#p=meetings/meeting-02/README.md`

Expected: dashboard hierarchy is clearer, reader entry feels smoother, and interaction states are consistent.

**Step 3: Commit any test or doc cleanup**

```bash
git add .
git commit -m "test: verify ux refinements"
```

