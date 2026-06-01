# Meeting 03: The Empirical Reality Check

**Date:** June 10, 2026

## High-Level Summary

Abstractions compress complexity. They do not eliminate it. This meeting pressure-tests John Ousterhout's design theories against concrete empirical data, hardware taxes, and organizational friction. Every reading and exercise has earned its place: zero academic filler, zero uncontextualized code blocks.

**Total Reading: ~28 pp required + ~9 pp optional**

| Tier | What | Pages | External | Internal |
|------|------|-------|----------|----------|
| Core | Parnas (1972) | 6 | [Read](https://www.cs.colostate.edu/~france/CS314/Readings/Parnas-decomposition.pdf) | [Bundle](03-lean-reading-bundle.md) |
| Core | Piccioni (2013) sections I, II, IV | 4 | [Read](https://bugcounting.net/pubs/esem13.pdf) | [Checklist](03-api-friction-checklist.md) · [Bundle](03-lean-reading-bundle.md) |
| Core | Stripe Engineering (2017) | 7 | [Read](https://stripe.com/blog/api-versioning) | [Supplement 1](03-supplement-1-api-design.md) · [Bundle](03-lean-reading-bundle.md) |
| Core | Bavota et al. (2013) sections I, III, V | 5 | [Read](https://www.inf.usi.ch/faculty/bavota/papers/icse2013_Coupling.pdf) | [Audit](03-vocabulary-audit.md) · [Supplement 2](03-supplement-2-empirical.md) · [Bundle](03-lean-reading-bundle.md) |
| Core | Lemire (2022) | 2 | [Read](https://lemire.me/blog/2022/05/13/avoid-exception-throwing-in-performance-sensitive-code/) | [Supplement 3](03-supplement-3-runtime-tax.md) · [Bundle](03-lean-reading-bundle.md) |
| Focused | Java NIO javadoc | ~4 | [Spec](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/nio/package-summary.html) · [FileChannel](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/nio/channels/FileChannel.html) | [Supplement 3](03-supplement-3-runtime-tax.md) · [Bundle](03-lean-reading-bundle.md) |
| Optional | Topolog (2025) | 5 | [Read](https://dmtopolog.com/complexity-4-abstraction) | [Bundle](03-lean-reading-bundle.md) |
| Optional | Barroso (2026) | 4 | [Read](https://dev.to/walternascimentobarroso/abstraction-designing-systems-that-dont-collapse-under-complexity-3h29) | [Bundle](03-lean-reading-bundle.md) |

Plus **3 supplement reference cards** (2 min each): [API Design](03-supplement-1-api-design.md), [Empirical](03-supplement-2-empirical.md), [Runtime Tax](03-supplement-3-runtime-tax.md).

---

## Agenda (60 Minutes)

- [Video Primer](recordings/03-empirical-reality-check.mp4). **The Refresher (5 min):** Quick tactical recap of deep vs. shallow modules from Meeting 02.
- [Slides](slides/03-shattering-the-abstraction-illusion.pptx). **The Crucible (35 min):** Structured debate working through the three segments of the [Lean Reading Bundle](03-lean-reading-bundle.md).
- **The Application (15 min):** Interactive walkthrough of the [**API Friction Checklist**](03-api-friction-checklist.md) and [**Vocabulary Audit**](03-vocabulary-audit.md) using the supplement cards.
- **Wrap-up (5 min):** Path voting for next meeting.

---

## Discussion Points

### ❓ Essential Questions
- **Information Hiding:** Why must software decomposition be driven by hidden design decisions rather than processing steps?
- **Semantic Coupling:** Why does shared vocabulary dictate system fragility more than any import statement?
- **Abstraction Failure:** How do "surprise tokens" and "wrong-level abstractions" systematically reveal where an API's design is broken?
- **APIs as Infrastructure:** Why does Stripe reject major versioning, and how do "version change modules" hide history from internal developers?
- **The Runtime Tax:** When does an elegant abstraction force the CPU to pay a 10,000x penalty?
- [See full details in 03-essential-questions.md](03-essential-questions.md)

### 💡 Non-Obvious Insights
- **Naming as Architecture:** Shared domain vocabulary between microservices is coupling that no static analysis tool detects.
- **Hiding History:** Stripe's date-based versioning proves you can encapsulate time itself as a design decision.
- **The Hardware Tax:** A 10,000x performance penalty is the CPU's way of telling you your abstraction is leaking.
- **Flexibility as Friction:** Empirical usability tokens prove that API flexibility actively harms developer learnability.
- [See full details in 03-non-obvious-insights.md](03-non-obvious-insights.md)

## Path Chosen: The Empirical Reality Check

This meeting executes **Path 2** (chosen in Meeting 02). The [Lean Reading Bundle](03-lean-reading-bundle.md) replaces textbook progression with direct engagement with empirical data: Parnas' module foundation, modern API usability studies, coupling perception, and runtime performance taxes. The three supplement reference cards and two exercises (API Friction Checklist, Vocabulary Audit) provide structured take-home tools derived from the readings.

## Action Items
- [ ] Read the [Lean Reading Bundle](03-lean-reading-bundle.md) (~28 pp total: Core + Focused tiers)
- [ ] Review the three supplement reference cards: [API Design](03-supplement-1-api-design.md), [Empirical](03-supplement-2-empirical.md), [Runtime Tax](03-supplement-3-runtime-tax.md)
- [ ] Execute: Run the [**Vocabulary Audit**](03-vocabulary-audit.md) on an internal repository before June 10, and bring your identified hidden ley lines to the group session

## Meeting Materials
- [03-lean-reading-bundle.md](03-lean-reading-bundle.md)
- [03-essential-questions.md](03-essential-questions.md)
- [03-non-obvious-insights.md](03-non-obvious-insights.md)
- [03-api-friction-checklist.md](03-api-friction-checklist.md)
- [03-vocabulary-audit.md](03-vocabulary-audit.md)
- [03-supplement-1-api-design.md](03-supplement-1-api-design.md)
- [03-supplement-2-empirical.md](03-supplement-2-empirical.md)
- [03-supplement-3-runtime-tax.md](03-supplement-3-runtime-tax.md)
- [recordings/](recordings/)
  - [03-empirical-reality-check.mp4](recordings/03-empirical-reality-check.mp4)
  - [03-navigating-the-architecture-alternate.mp4](recordings/03-navigating-the-architecture-alternate.mp4)
  - [03-why-software-abstractions-fail-under-pressure-deep-dive.m4a](recordings/03-why-software-abstractions-fail-under-pressure-deep-dive.m4a)
  - [03-high-price-of-architectural-purity-debate.m4a](recordings/03-high-price-of-architectural-purity-debate.m4a)
  - [03-automating-semantic-coupling-performance-thresholds-critique.m4a](recordings/03-automating-semantic-coupling-performance-thresholds-critique.m4a)
- [slides/](slides/)
  - [03-shattering-the-abstraction-illusion.pptx](slides/03-shattering-the-abstraction-illusion.pptx)
- [resources/](resources/)
  - [03-temple-of-abstraction-guide.png](resources/03-temple-of-abstraction-guide.png)
