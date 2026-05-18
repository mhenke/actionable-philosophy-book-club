# Distinguish canonical vs alternate video rows — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make canonical (primary) video rows visually and semantically distinct from alternate recordings, improving discoverability and accessibility with minimal layout changes.

**Architecture:** Small JS template change in buildAssetRows to add data attributes and aria-labels; small CSS token additions in index.html for visual accents; Playwright tests to assert DOM attributes and accessible names.

**Tech Stack:** Vanilla JS, Tailwind CSS utility classes, Playwright E2E tests (existing), inline CSS tokens in index.html.

---

### Task 1: Add data attributes and aria-labels in buildAssetRows

**Files:**
- Modify: `dist/app.js: lines around buildAssetRows` (exact patch applied in step)
- Test: `tests/asset-behavior.spec.js`

Step 1: Write failing Playwright test snippet (asset-behavior.spec.js)
- Add test: assert that canonical asset has `data-canonical="true"` and its link includes `Canonical` in accessible name.

Run: `npm test -- tests/asset-behavior.spec.js -g "canonical"` (expected: fail)

Step 2: Implement minimal JS change in `dist/app.js`:
- When rendering meeting.video primaryRows, add `data-canonical="true"` to the .asset-row div and ensure the anchor has `aria-label="Canonical video — ${meeting.session}"`.

Step 3: Run the test and iterate until it passes.

Step 4: Commit changes with message: `feat(reader): mark canonical video rows with data-canonical and aria-label\n\nCo-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`

---

### Task 2: Add CSS tokens for visual accent

**Files:**
- Modify: `index.html: add CSS rules in the <style> :root or component CSS block`
- Test: visual verification + Playwright screenshot assertion (optional)

Steps:
1. Add CSS rules:
```
.asset-row[data-canonical="true"] { border-left: 3px solid var(--spectrum-1); padding-left: .75rem; }
.asset-row[data-canonical="true"] .icon-pill { background: var(--wash-1); }
.podcast-badge { font-weight: 600; padding-left: .5rem; }
```
2. Run `npm test` and visually confirm UI.
3. Commit with message: `style: accent canonical video rows using tokens\n\nCo-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`

---

### Task 3: Add data-alternate for podcastRows and aria-labels for accessibility

**Files:**
- Modify: `dist/app.js` (podcastRows creation)
- Test: `tests/asset-behavior.spec.js` (add tests for alternate rows)

Steps:
1. Update podcastRows template to add `data-alternate="true"` on asset-row and ensure the download button aria-label remains descriptive.
2. Add tests that assert `data-alternate` exists for podcast rows of type 'alternate'.
3. Run tests and commit.

---

### Task 4: Playwright E2E and accessibility checks

**Files:**
- Run existing Playwright tests

Steps:
1. Run `npm test` (Playwright). Expect core tests to pass; fix any regressions.
2. Run `node ./tests/check-links.sh` to ensure no broken links.
3. Run `npx axe-core` or existing Impeccable scripts for accessibility smoke checks.
4. Commit any minor fixes.

---

### Task 5: Documentation & release notes

**Files:**
- Modify: `docs/plans/2026-05-18-distinguish-video-rows-design.md` (link to implementation)
- Create: small changelog entry in `CHANGELOG.md` (if present) or a commit message.

Steps:
1. Add a short note in the design doc referencing the implemented change.
2. Commit the doc update.

---

Plan saved to `docs/plans/2026-05-18-distinguish-video-rows-plan.md`.

Choose execution option:
1. Subagent-driven (implement now, task-by-task in this session)
2. Create a separate execution session (parallel)

Respond with `1` or `2`. If `1`, the writing-plans skill will dispatch and implement the first task.
