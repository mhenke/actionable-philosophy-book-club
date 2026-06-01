# Meeting 03: The Empirical Reality Check

**Date:** June 10, 2026

## High-Level Summary

Abstractions compress complexity. They do not eliminate it. This meeting pressure-tests John Ousterhout's design theories against concrete empirical data, hardware taxes, and organizational friction. Every reading and exercise has earned its place: zero academic filler, zero uncontextualized code blocks.

**Total Reading: ~28 pp required + ~9 pp optional**

| What | Pages |
|------|------:|
| [Parnas (1972)](https://www.cs.colostate.edu/~france/CS314/Readings/Parnas-decomposition.pdf) | 6 |
| [Piccioni (2013)](https://bugcounting.net/pubs/esem13.pdf) sections I, II, IV  ·  [Checklist](03-api-friction-checklist.md) | 4 |
| [Stripe Engineering (2017)](https://stripe.com/blog/api-versioning)  ·  [API Design](03-supplement-1-api-design.md) | 7 |
| [Bavota et al. (2013)](https://www.inf.usi.ch/faculty/bavota/papers/icse2013_Coupling.pdf) sections I, III, V  ·  [Audit](03-vocabulary-audit.md)  ·  [Empirical](03-supplement-2-empirical.md) | 5 |
| [Lemire (2022)](https://lemire.me/blog/2022/05/13/avoid-exception-throwing-in-performance-sensitive-code/)  ·  [Runtime Tax](03-supplement-3-runtime-tax.md) | 2 |
| [Java NIO javadoc](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/nio/package-summary.html)  ·  [FileChannel](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/nio/channels/FileChannel.html)  ·  [Runtime Tax](03-supplement-3-runtime-tax.md) | ~4 |
| [Topolog (2025)](https://dmtopolog.com/complexity-4-abstraction) (Optional) | 5 |
| [Barroso (2026)](https://dev.to/walternascimentobarroso/abstraction-designing-systems-that-dont-collapse-under-complexity-3h29) (Optional) | 4 |

<br>

Plus **3 supplement reference cards** (2 min each)  ·  [API Design](03-supplement-1-api-design.md)  ·  [Empirical](03-supplement-2-empirical.md)  ·  [Runtime Tax](03-supplement-3-runtime-tax.md)

See the [Lean Reading Bundle Syllabus](03-lean-reading-bundle.md) for full descriptions, companion foils, and reading context.

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

## Choose Your Next Direction

Options will be added here when finalized. The group votes during wrap-up.

## Action Items
- [ ] Vote on next meeting direction during wrap-up

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
