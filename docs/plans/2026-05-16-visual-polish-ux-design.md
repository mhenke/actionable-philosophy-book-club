# Design: Visual polish and UX refinement

Date: 2026-05-16

## Summary

Refine the dashboard and reader so the site feels more intentional on first load, smoother when moving into a meeting, and more polished in its interactive states.

## Problem

The site already works well, but a few UX seams reduce the perceived quality:

- The dashboard hierarchy could be clearer, especially on small screens.
- The dashboard-to-reader handoff can feel like a flash or snap during refresh and route changes.
- Hover, focus, and active states are functional but could feel more deliberate and consistent.

## Goals

- Make the next meeting the most obvious action on the page.
- Reduce visual churn when the reader loads.
- Improve micro-interactions without changing the site’s overall character.
- Keep the implementation surgical and low-risk.

## Non-goals

- No content rewrite.
- No new pages or navigation model.
- No major color-system change.
- No framework or architecture changes.

## Approach

### 1. Hierarchy and spacing

Tighten the landing view so the primary meeting card reads first, the archive reads as secondary, and the knowledge base reads as utility.

Proposed adjustments:

- Reduce vertical gaps between dashboard sections.
- Slightly rebalance card padding and heading spacing.
- Strengthen the visual separation between primary action and supporting links.
- Keep the existing Swiss minimalism, but remove any wasted whitespace that delays comprehension.

### 2. Reader handoff

Make the route transition feel intentional rather than jarring.

Proposed adjustments:

- Keep a stable shell visible while the reader content loads.
- Use a restrained loading state instead of a full visual swap.
- Avoid showing stale dashboard content after the route changes.
- Ensure the reader’s theme switch happens in a way that feels synchronized with content arrival.

### 3. Interaction polish

Improve the small moments that users touch repeatedly.

Proposed adjustments:

- Make hover, focus, and active states more consistent across cards and links.
- Preserve keyboard clarity and visible focus rings.
- Use small, purposeful motion only where it communicates state.
- Keep transitions short and unobtrusive.

## Risks

- Over-tuning spacing could make the dashboard feel too sparse or too dense.
- Over-animating the reader transition could make it feel theatrical instead of efficient.
- Micro-interaction changes should not introduce visual inconsistency across existing card types.

## Success criteria

- The dashboard’s primary action is immediately obvious.
- Reader navigation feels smoother and less flickery.
- Link and card interactions feel consistent and deliberate.
- The overall visual identity stays the same, just sharper.

