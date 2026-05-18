# Section / h2 Spacing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Increase visual separation between dashboard sections and tighten the h2 label-to-content gap.

**Architecture:** Six Tailwind class changes in `index.html` (three sections, three h2s) and one documentation update in `DESIGN.md`. No JavaScript changes. No new files.

**Tech Stack:** Tailwind CSS utility classes, static HTML

---

## File Map

| File | Change |
|---|---|
| `index.html` | `mt-14` → `mt-20` on 3 `<section>` elements; remove `pt-2`, change `mb-7` → `mb-4` on 3 `<h2>` elements |
| `DESIGN.md` | Update Dashboard Spacing Model to document new values |

---

### Task 1: Update section and h2 spacing in index.html

**Files:**
- Modify: `index.html:585-609`

> Note: This is a visual-only change. The existing Playwright tests cover routing and behavior — none assert CSS classes. No new tests required.

- [ ] **Step 1: Update the Horizon section**

In `index.html`, find line ~585:
```html
<section aria-labelledby="section-horizon" class="mt-14">
    <h2 id="section-horizon" class="text-[0.6875rem] font-semibold uppercase tracking-[0.35em] text-muted pt-2 mb-7 flex items-center gap-4">
```

Change to:
```html
<section aria-labelledby="section-horizon" class="mt-20">
    <h2 id="section-horizon" class="text-[0.6875rem] font-semibold uppercase tracking-[0.35em] text-muted mb-4 flex items-center gap-4">
```

- [ ] **Step 2: Update the Archive section**

In `index.html`, find line ~596:
```html
<section aria-labelledby="section-archive" class="mt-14">
    <h2 id="section-archive" class="text-[0.6875rem] font-semibold uppercase tracking-[0.35em] text-muted pt-2 mb-7 flex items-center gap-4">
```

Change to:
```html
<section aria-labelledby="section-archive" class="mt-20">
    <h2 id="section-archive" class="text-[0.6875rem] font-semibold uppercase tracking-[0.35em] text-muted mb-4 flex items-center gap-4">
```

- [ ] **Step 3: Update the Knowledge Base section**

In `index.html`, find line ~608:
```html
<section aria-labelledby="section-kb" class="mt-14 sm:-order-3">
    <h2 id="section-kb" class="text-[0.6875rem] font-semibold uppercase tracking-[0.35em] text-muted pt-2 mb-7 flex items-center gap-4">
```

Change to:
```html
<section aria-labelledby="section-kb" class="mt-20 sm:-order-3">
    <h2 id="section-kb" class="text-[0.6875rem] font-semibold uppercase tracking-[0.35em] text-muted mb-4 flex items-center gap-4">
```

- [ ] **Step 4: Verify visually**

Open `index.html` in a browser. Confirm:
- There is visible increased breathing room between the upcoming meeting card and the "Coming Up" / "Past" / "Knowledge Base" labels
- Each section label sits noticeably closer to its own content (cards / KB grid) than before
- No section is smashed against the one above it

---

### Task 2: Update DESIGN.md

**Files:**
- Modify: `DESIGN.md:99-104`

- [ ] **Step 1: Update Dashboard Spacing Model**

In `DESIGN.md`, find the Dashboard Spacing Model block (line ~99):
```markdown
No `space-y` utility on `<main>`. Spacing is explicit:
- **Upcoming card:** no top margin — sits at the container's padding distance from the header (20px mobile, 40px desktop via `p-5`/`md:p-10`).
- **Horizon, Archive, Knowledge Base sections:** `mt-14` (56px) — intentional section separation. Each section `<h2>` label also has `pt-2` (8px) so the label text breathes from the content above within the 56px gap.
- **Onboarding banner (when visible):** `mb-6` (24px) below the banner to the upcoming card — tighter than section gaps since the banner is a utility element, not a major section.
```

Change to:
```markdown
No `space-y` utility on `<main>`. Spacing is explicit:
- **Upcoming card:** no top margin — sits at the container's padding distance from the header (20px mobile, 40px desktop via `p-5`/`md:p-10`).
- **Horizon, Archive, Knowledge Base sections:** `mt-20` (80px) — intentional section separation. Each section `<h2>` label has `mb-4` (16px) below it to its content. No top padding on the h2 — the section margin provides all breathing room above.
- **Onboarding banner (when visible):** `mb-6` (24px) below the banner to the upcoming card — tighter than section gaps since the banner is a utility element, not a major section.
```

- [ ] **Step 2: Commit both files**

```bash
git add index.html DESIGN.md
git commit -m "fix: increase section separation mt-14→mt-20, tighten h2 bottom mb-7→mb-4"
```
