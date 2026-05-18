# Section / h2 Spacing Adjustment

**Date:** 2026-05-18
**Status:** Approved

## Problem

Dashboard sections (Coming Up, Past, Knowledge Base) look visually too close together. The h2 label has a 28px gap below it to its own content, which is too loose for a label that is meant to sit close to what it introduces.

## Decision

Keep the section element as the semantic owner of inter-section separation. Increase that gap and tighten the label-to-content gap.

## Changes

### `index.html`

| Element | Class change |
|---|---|
| `<section>` — Horizon (Coming Up) | `mt-14` → `mt-20` |
| `<section>` — Archive (Past) | `mt-14` → `mt-20` |
| `<section>` — Knowledge Base | `mt-14` → `mt-20` |
| `<h2>` inside all three sections | Remove `pt-2`, change `mb-7` → `mb-4` |

### `DESIGN.md`

Update Dashboard Spacing Model section:
- Section top margin: `mt-20` (80px), not `mt-14` (56px)
- h2 label: no `pt-2`, bottom margin `mb-4` (16px), not `mb-7` (28px)

## Resulting spacing

```
[Previous section's content ends]
——— 80px (section mt-20) ———
[h2 section label]
——— 16px (h2 mb-4) ———
[Section content (cards / grid)]
```

Gap between sections increases from 64px to 80px. Label-to-content gap tightens from 28px to 16px.

## Out of scope

- The upcoming meeting card (no top margin — sits at container padding distance from header). Unchanged.
- Prose h2 inside the reader. Unchanged.
