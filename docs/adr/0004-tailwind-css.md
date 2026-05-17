# ADR-0004: Tailwind CSS for Utility Styles

**Status:** Accepted  
**Date:** 2025

## Decision

Use Tailwind CSS v3 for utility classes, pinned to exact version `3.4.17`.

## Alternatives Considered

- Plain CSS — would work but requires manual maintenance of spacing/color scales
- CSS Modules — adds build tooling overhead without benefit for a single-file SPA
- UnoCSS — less mature ecosystem at time of decision

## Rationale

- Rapid prototyping of consistent UI with pre-built spacing and typography scales
- `:root` CSS variables define the design tokens; Tailwind config references them via `var()` — single source of truth
- JIT mode in v3 produces small builds; the committed `dist/tailwind.css` is stable and cacheable
- No runtime cost — all Tailwind generates static CSS classes
