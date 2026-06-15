# Meeting 04: The Complexity Romance

**Date:** June 24, 2026

## High-Level Summary

We continue through the book, moving into Chapters 9–11 where Ousterhout tackles the tension between "different" and "better." This session examines why tiny functions can ruin software architecture, and whether the romance of simplicity is a design principle or a mirage.

## Agenda (60 Minutes)

- [Slides](slides/04-the-complexity-romance.pptx). **The Crucible (35 min):** Structured debate working through the core tension between deep modules and small functions.
- **The Application (15 min):** Interactive discussion and exercises.
- **Wrap-up (5 min):** Path voting for next meeting.

## Discussion Points

### ❓ Essential Questions
- **Combining vs. Separating:** When should functionality be combined, and what red flags indicate a poor modularization decision?
- **Module Depth vs. Clean Code:** Why does "module depth" conflict with short-method heuristics, and what are the risks of over-fragmentation?
- **Exception Handling Complexity:** Why is exception handling a primary driver of complexity, and what four techniques minimize its damage?
- **Defining Errors Out of Existence:** How does Unix's file deletion approach illustrate eliminating error categories by redesigning semantics?
- **Design it Twice:** Why is sketching two alternative designs critical for overcoming the "smart person" trap?
- [See full details in 04-essential-questions.md](04-essential-questions.md)

### 💡 Non-Obvious Insights
- **Conservation of Complexity:** Subdividing a system shifts complexity to interfaces and coordination logic — it does not disappear.
- **The Ego Hurdle:** High achievers conflate speed with skill, making "Design it Twice" psychologically difficult.
- **Design as Deletion:** Great abstractions eliminate entire categories of behavior rather than adding error paths.
- **Redundancy as Diagnostic:** Repeated code patterns signal a missing abstraction layer, not just a DRY violation.
- [See full details in 04-non-obvious-insights.md](04-non-obvious-insights.md)

## Action Items
- [ ] Vote on next meeting direction during wrap-up

## Meeting Materials
- [04-essential-questions.md](04-essential-questions.md)
- [04-non-obvious-insights.md](04-non-obvious-insights.md)
- [recordings/](recordings/)
  - [04-the-dogma-disruption-unlearning-clean-code.mp4](recordings/04-the-dogma-disruption-unlearning-clean-code.mp4)
  - [04-the-contrarian-coder.mp4](recordings/04-the-contrarian-coder.mp4) (alternate primer)
  - [04-why-tiny-functions-ruin-software-architecture-deep-dive.m4a](recordings/04-why-tiny-functions-ruin-software-architecture-deep-dive.m4a)
  - [04-ousterhout-versus-martin-physical-evidence-critique.m4a](recordings/04-ousterhout-versus-martin-physical-evidence-critique.m4a)
- [slides/](slides/)
  - [04-the-complexity-romance.pptx](slides/04-the-complexity-romance.pptx)
- [resources/](resources/)
  - [04-the-complexity-romance-infographic.png](resources/04-the-complexity-romance-infographic.png)
