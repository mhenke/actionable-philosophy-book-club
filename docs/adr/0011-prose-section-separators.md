# ADR-0011: Prose Section Separators — Whitespace Over Borders

**Status:** Accepted
**Date:** 2026-05-18

## Context

`.prose h2` had `border-top: 2px solid var(--spectrum-2)` applied uniformly. A meeting notes page contains five or more h2 sections (High-Level Summary, Agenda, Discussion Points, Action Items, Meeting Materials). Every section rendered with an identical medium-blue top border, producing visual repetition that added noise rather than hierarchy.

Three options were considered:

1. **Remove borders, rely on whitespace** — `margin-top: 3.5rem` (56px) already signals section breaks. The uppercase tracked label treatment creates visual identity without a border.
2. **Spectrum progression** — post-process h2 elements in JS to assign spectrum-1 through spectrum-6 in sequence per document.
3. **Spectrum-rule treatment** — replace solid border with the gradient fade (`spectrum-rule`) used in dashboard section headers.

## Decision

Remove `border-top` and `padding-top` from `.prose h2`. Section separation is communicated by `margin-top: 3.5rem` alone.

## Rationale

**Against spectrum progression:** The color assignment is positional, not semantic. "Discussion Points" being spectrum-3 because it happens to be the third section conveys nothing meaningful. It looks intentional but communicates nothing, which is worse than a neutral treatment.

**Against spectrum-rule:** The gradient rule is an element of the dashboard's navigation layer, not the reading layer. Applying it inside prose content blurs the visual distinction between the dashboard (navigation mode) and the reader (reading mode). The design principle is that the two modes share tokens but not decorative motifs.

**For whitespace:** The Swiss/International Style aesthetic this project references achieves hierarchy through space and weight alone. The 56px margin between sections is generous and unambiguous. The uppercase `letter-spacing: 0.2em` label is the section's visual anchor. Adding a border on top of that is redundant.

## Consequences

- **Positive:** Reader content is quieter and more readable.
- **Positive:** The dashboard's spectrum-rule motif remains exclusive to the navigation layer.
- **Negative:** Section breaks are less visually emphatic on dense pages.
- **Note:** `.prose h3` retains its `border-top: 2px solid var(--spectrum-5)` — h3 sub-sections are nested within h2 sections and benefit from a lighter visual divider at a smaller scale. The issue was five repeated identical h2 borders, not the use of borders per se.
