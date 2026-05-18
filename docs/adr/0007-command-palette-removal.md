# ADR-0007: Command Palette Removed

**Status:** Accepted
**Date:** 2026-05-18

## Context

A Ctrl/Cmd+K command palette was added to allow keyboard-driven navigation between meetings. It included a fuzzy scoring algorithm (trigram similarity, weighted word matching) and a full focus-trapped dialog with CSS injection, DOM construction, and multiple event handlers — approximately 234 lines of code.

## Decision

Remove the command palette entirely.

## Alternatives Considered

- **Keep it** — Retain for desktop power users who want keyboard navigation.
- **Simplify it** — Replace the scoring algorithm with a plain `<datalist>` in the header (~10 lines).
- **Remove it** — Eliminate the feature and its complexity.

## Rationale

1. **Mobile-first product.** The primary user is a commuter on a phone. `Ctrl/Cmd+K` is not available on mobile — the feature was invisible to the primary audience.
2. **Scale mismatch.** Trigram similarity for 5 meetings is disproportionate. A user can read all meeting titles in the archive in under 3 seconds. Search adds no value at this scale.
3. **Complexity vs. value.** 234 lines, CSS injection, a focus trap, and a scoring algorithm to navigate a list a user can scroll. The complexity was not proportional to the problem.

## Consequences

- **Positive:** ~234 lines removed, keydown handler simplified, no dynamic CSS injection at startup.
- **Negative:** Desktop users lose a keyboard shortcut. If the meeting count grows to 20+, a simple search (not fuzzy scoring) may become worth adding.
- **Future note:** If search is re-added, a `<datalist>` or `<select>` element (~10 lines) should be the first option before reaching for a custom palette.
