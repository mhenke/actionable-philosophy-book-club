# Meeting 03: The Empirical Reality Check

**Date:** June 10, 2026

## High-Level Summary

Abstractions compress complexity. They do not eliminate it. This meeting pressure-tests John Ousterhout's design theories against concrete empirical data, hardware taxes, and organizational friction. Every reading and exercise has earned its place: zero academic filler, zero uncontextualized code blocks.

**Total Reading: ~28 pp required + ~9 pp optional**

| What | Pages | Materials |
|------|------:|-----------|
| **[Modular Decomposition](https://www.cs.colostate.edu/~france/CS314/Readings/Parnas-decomposition.pdf)**: Parnas (1972) | 6 | |
| **[API Friction](https://bugcounting.net/pubs/esem13.pdf)**: Piccioni (2013), sections I, II, IV | 4 | [Checklist](03-api-friction-checklist.md) |
| **[API Versioning](https://stripe.com/blog/api-versioning)**: Stripe Engineering (2017) | 7 | [API Design](03-supplement-1-api-design.md) |
| **[Measuring Coupling](https://www.inf.usi.ch/faculty/bavota/papers/icse2013_Coupling.pdf)**: Bavota et al. (2013), sections I, III, V | 5 | [Empirical](03-supplement-2-empirical.md), [Audit](03-vocabulary-audit.md) |
| **[Exception Tax](https://lemire.me/blog/2022/05/13/avoid-exception-throwing-in-performance-sensitive-code/)**: Lemire (2022) | 2 | [Runtime Tax](03-supplement-3-runtime-tax.md) |
| **[NIO](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/nio/package-summary.html)** · **[FileChannel](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/nio/channels/FileChannel.html)** | ~4 | [Runtime Tax](03-supplement-3-runtime-tax.md) |
| **[Complexity of Abstraction](https://dmtopolog.com/complexity-4-abstraction)**: Topolog (2025) (Optional) | 5 | |
| **[Abstraction That Lasts](https://dev.to/walternascimentobarroso/abstraction-designing-systems-that-dont-collapse-under-complexity-3h29)**: Barroso (2026) (Optional) | 4 | |

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
  - 🎬 [03-surviving-system-rot.mp4](recordings/03-surviving-system-rot.mp4) 6m 14s · 24MB — Recaps deep vs. shallow modules and introduces the empirical evidence gauntlet: Parnas decomposition, coupling metrics, and the exception tax
  - 🎬 [03-navigating-the-architecture-alternate.mp4](recordings/03-navigating-the-architecture-alternate.mp4) 9m 7s · 26MB — Alternate primer on abstraction collapse under hardware constraints and organizational friction
  - 🔬 [03-why-software-abstractions-fail-under-pressure-deep-dive.m4a](recordings/03-why-software-abstractions-fail-under-pressure-deep-dive.m4a) 31m 53s · 29MB — Deep analysis of Lemire's exception tax benchmarks, Java NIO Direct Buffers, and when abstractions collapse under load
  - ⚔️ [03-high-price-of-architectural-purity-debate.m4a](recordings/03-high-price-of-architectural-purity-debate.m4a) 25m 0s · 23MB — Debates whether Parnas's information hiding survives modern microservice architectures and performance demands
  - 🔍 [03-automating-semantic-coupling-performance-thresholds-critique.m4a](recordings/03-automating-semantic-coupling-performance-thresholds-critique.m4a) 7m 8s · 7MB — Critiques the gap between academic coupling metrics and practical CI/CD tooling, proposing automation thresholds
- [slides/](slides/)
  - 📊 [03-shattering-the-abstraction-illusion.pptx](slides/03-shattering-the-abstraction-illusion.pptx) — Discussion deck: Parnas decomposition, API usability tokens, Stripe versioning, Bavota coupling study, and the runtime tax evidence
- [resources/](resources/)
  - [03-temple-of-abstraction-guide.png](resources/03-temple-of-abstraction-guide.png)
  - [03-complexity-romance-learning-paths.png](resources/03-complexity-romance-learning-paths.png)
