# Additional Resources Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prepend the label "Additional Resources:" to asset summary disclosures (icon-pill + counts) and update tests to assert the new visible summary text and accessibility behavior.

**Architecture:** Modify the summary-construction in buildAssetRows so that when non-primary resource counts exist, the summary starts with the literal label. Keep the icon-pill aria-hidden and sanitize concatenated labels to remove duplicate emoji.

**Tech Stack:** Vanilla JS, Playwright E2E tests, simple static site (no build step required beyond committing dist/app.js).

---

### Task 1: Add failing Playwright tests

**Files:**
- Modify: `tests/podcast-summary.spec.js` (or equivalent tests referencing podcast-summary assertions)
- Create: `tests/additional-resources-summary.spec.js`

**Step 1: Write failing test**

Add a test asserting the disclosure summary text begins with "Additional Resources:" and contains counts like "1 Video · 3 Podcasts", and that the icon-pill emoji is present but not repeated in the text.

```js
// tests/additional-resources-summary.spec.js
const { test, expect } = require('@playwright/test');

test('disclosure summary shows Additional Resources prefix and no duplicate emoji', async ({ page }) => {
  await page.goto('http://localhost:8000');
  // navigate to a card that has podcasts + other resources
  const summary = page.locator('.podcast-disclosure summary .asset-link').first();
  await expect(summary).toContainText(/^Additional Resources:/);
  await expect(summary).toContainText(/\d+ Video/);
  await expect(summary).toContainText(/\d+ Podcast/);
  // ensure summary text doesn't start with emoji characters except icon-pill (visual only)
  const text = await summary.innerText();
  expect(text.trim().charAt(0)).not.toMatch(/\p{Emoji}/u);
});
```

**Step 2: Run test to verify it fails**

Run: `npm test tests/additional-resources-summary.spec.js -g Additional -w 1`
Expected: FAIL because summary does not start with prefix.

**Step 3: Commit test**

```bash
git add tests/additional-resources-summary.spec.js
git commit -m "test: assert Additional Resources prefix in asset summaries" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Task 2: Update buildAssetRows summary builder

**Files:**
- Modify: `dist/app.js: buildAssetRows` (exact ranges below)

**Step 1: Edit code**

- Locate where `podcastSummary` and `resourceStrip` are built.
- Prepend `"Additional Resources: "` when resource counts are present.
- Strip emoji from concatenated labels before `escapeHTML`.

**Pseudo-patch:**
```js
let podcastSummary = buildPodcastSummary(...); // existing
podcastSummary = podcastSummary.replace(/^\p{Emoji}+/u, '').trim();
if (hasNonPrimaryResources) {
  podcastSummary = `Additional Resources: ${podcastSummary}`;
}
```

**Step 2: Run site locally and smoke-check**

Run: `python3 -m http.server 8000` and open `http://localhost:8000`.
Verify visually that the summary shows `Additional Resources:` and no duplicate emoji.

**Step 3: Commit change**

```bash
git add dist/app.js
git commit -m "feat: prepend Additional Resources label to asset summaries" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Task 3: Run Playwright tests and fix expectations

**Step 1: Run tests**

Run: `npm test` (Playwright)

Expected: New test should pass along with suite, or some tests updated.

**Step 2: If failures appear, update tests**

- Fix any tests that expected previous summary format.

**Step 3: Commit test fixes**

```bash
git add tests/**
git commit -m "test: update expectations for Additional Resources summary" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Task 4: Clean up & docs

- Update docs/plans design doc with implementation notes (append small section) — `docs/plans/2026-05-17-additional-resources-design.md`
- Commit doc update

---

Plan saved to `docs/plans/2026-05-17-additional-resources-implementation.md`.

Choose execution mode:
- Subagent-Driven (execute here, step-by-step)
- Parallel Session (open new session)

Which approach?