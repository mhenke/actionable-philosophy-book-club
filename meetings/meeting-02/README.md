# Meeting 02: Complexity Engineering

**Date:** May 27, 2026

## High-Level Summary
A deep dive into Chapters 5 through 8 of "A Philosophy of Software Design," focusing on deep modules as complexity sinks (selected as Path 2 during Meeting 01's wrap-up). The session concluded with the group selecting **Path 2: The Empirical Reality Check (Modernized)**. This reading bundle pauses the textbook to test Ousterhout's design theories against modern engineering data, historical foundations, measurable JVM behaviors, and hardware realities.

## Agenda (60 Minutes)
1. [Video Primer](recordings/02-complexity-governance-the-four-pillars-of-deep-modules.mp4). **Refresher Video (5-10 min):** Why great modules take on complexity so the rest of the system stays simple.
2. [Slides](slides/02-the-complexity-case.pptx). **Discussion (30 min):** Identifying "pass-through methods" and "decorators" in our current codebase.
3. **Wrap-up (Last 10 min):**
   - **Path Voting:** Group selected Path 2 (modified). The Empirical Reality Check.
   - **Action Item Review:** Book club book thank you cards, review web application.

## Discussion Points

### ❓ Essential Questions
*   **Information Hiding:** Why is "Temporal Decomposition" the most common way to leak details?
*   **The "Somewhat General" Sweet Spot:** Why is hyper-specialization a primary cause of complexity?
*   **Layered Abstraction:** Why are "pass-through methods" and "decorators" architectural red flags?
*   **The Responsibility of Suffering:** Why "pulling complexity downwards" is the hallmark of a great designer.
*   **Complexity Sinks:** How do we allocate responsibility to keep the global system simple?
*   [See full details in 02-essential-questions.md](02-essential-questions.md)

### 💡 Non-Obvious Insights
*   **Documentation as Litmus Test:** If you can't describe it simply in prose, the design is broken.
*   **Generality as Deletion:** How a general interface allows you to reduce total API surface area.
*   **The Sacrificial Developer:** Moving from "author-centric" code to "consumer-centric" deep modules.
*   **The Philosophical Tensions:** Ousterhout vs. YAGNI and the "Clean Code" fragmentation crisis.
*   [See full details in 02-non-obvious-insights.md](02-non-obvious-insights.md)

## Path Chosen: The Empirical Reality Check

The group selected Path 2 (with modifications) to test Ousterhout's abstractions against real-world evidence before continuing the textbook. The reading bundle includes:

- **Parnas (1972):** *"On the Criteria To Be Used in Decomposing Systems into Modules"*, the original module/secrecy foundation (~9 pp)
- **Piccioni et al. (2013):** *"An Empirical Study of API Usability"*, quantified cognitive load data (~6 pp)
- **Barroso (2026)** & **Topolog (2025):** modern ecosystem complexity synthesis (~9 pp)
- **Stripe Engineering:** API versioning gatekeeper pattern as deep abstraction case study (~5 pp)
- **Bavota et al. (2013):** developer perception of coupling vs. static analysis (~5 pp)
- **Lemire (2022):** exception throwing performance benchmarks (~3 pp)
- **Java NIO Core:** abstraction collapse under hardware constraints (~6 pp)
- **Microservice Contract Evolution:** cross-service ripple effects (~4 pp optional)

### Code Anchors for Next Session
- Deep Module Triumph: `Files.readString()`. Tiny interface, massive orchestration.
- Shallow Pass-Through: Controller, Service, Manager, Repository, Adapter, DAO
- I/O Tradeoff: `BufferedInputStream` vs. `FileChannel` + `ByteBuffer.allocateDirect()`
- Exception-as-Control-Flow: `parseInt()` catch pattern vs. cost
- Payment Gateway deep boundary isolating Stripe volatility

## Action Items
- [ ] Sign thank you card for books
- [ ] Review web application
- [ ] Read Path 2 bundle for Meeting 03

## Meeting Materials
- [02-essential-questions.md](02-essential-questions.md)
- [02-non-obvious-insights.md](02-non-obvious-insights.md)
- [02-complexity-case-options.md](02-complexity-case-options.md)
- [recordings/](recordings/)
  - [02-complexity-governance-the-four-pillars-of-deep-modules.mp4](recordings/02-complexity-governance-the-four-pillars-of-deep-modules.mp4)
  - [02-Clean-Code-Paradox-deep-dive.mp4](recordings/02-Clean-Code-Paradox-deep-dive.mp4)
  - [02-clean-code-rots-codebase-deep-dive.m4a](recordings/02-clean-code-rots-codebase-deep-dive.m4a)
  - [02-deep-modules-vs-small-functions-debate.m4a](recordings/02-deep-modules-vs-small-functions-debate.m4a)
  - [02-info-leaks-general-purpose-critique.m4a](recordings/02-info-leaks-general-purpose-critique.m4a)
- [resources/](resources/)
  - [02-four-strategies.png](resources/02-four-strategies.png)
  - [02-choose-your-next-meeting.png](resources/02-choose-your-next-meeting.png)
- [slides/](slides/)
  - [02-the-complexity-case.pptx](slides/02-the-complexity-case.pptx)
