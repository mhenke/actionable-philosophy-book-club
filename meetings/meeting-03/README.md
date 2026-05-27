# Meeting 03: The Empirical Reality Check

**Date:** June 10, 2026

## High-Level Summary
Does abstraction compress complexity, or merely relocate it? This session pauses the textbook to test John Ousterhout's design theories against modern engineering data, historical foundations, measurable JVM behaviors, and hardware realities. Every page in this bundle has been fiercely optimized to earn its spot.

**Total Core Reading Load:** ~32 pages (plus ~4 pages optional empirical).

## Agenda (60 Minutes)
1. **Refresher (5 min):** Quick recap of deep vs. shallow modules from Meeting 02. Refer to 02-essential-questions.
2. **Discussion (35 min):** Work through the Path 2 readings using the Multi-Dimensional Evaluation Matrix. Reading Bundle Below
3. **Code Review Anchors (10 min):** Walk through the production code patterns.
4. **Wrap-up (10 min):** Synthesize conclusions and decide next session.

## 📚 The Lean Reading Bundle

### 2.1 — Modern API Design & Information Hiding

- **2.1a | The Classical Foundation:** Parnas, *[On the Criteria To Be Used in Decomposing Systems into Modules](https://www.cs.colostate.edu/~france/CS314/Readings/Parnas-decomposition.pdf)* (1972)
  - Full paper, **6 pages** (Communications of the ACM 15(12):1053–1058)
  - Direct engagement with the source material Ousterhout builds on. Understanding Parnas's definition of a module's "secret" is essential to identifying why modern shallow layers fail.

- **2.1b | Modern API Design at Scale:** Piccioni, Furia & Meyer, *[An Empirical Study of API Usability](https://bugcounting.net/pubs/esem13.pdf)* (ACM/IEEE ESEM 2013)
  - Sections I–II and IV, **~10 pages** (proceedings pp. 5–14)
  - Proves empirically that interface complexity and poor type discovery directly correlate with developer error rates.

- **2.1c | Complexity in Modern Ecosystems:**
  - Topolog (Ivanov), *[Complexity part 4. Abstractions.](https://dmtopolog.com/complexity-4-abstraction)* (2025), ~5 pages
  - Recent tech-stack synthesis explicitly analyzing deep vs. shallow modules across UI components, SDKs, and cloud dependencies.
  - Barroso, *[Abstraction: Designing Systems That Don't Collapse Under Complexity](https://dev.to/walternascimentobarroso/abstraction-designing-systems-that-dont-collapse-under-complexity-3h29)* (DEV, Feb 2026), ~5 pages
  - Practical OOP-focused follow-up on dependency inversion and volatility isolation.

- **2.1d | Real-World Practice:** Stripe Engineering Architecture Series
  - [APIs as infrastructure: future-proofing Stripe with versioning](https://stripe.com/blog/api-versioning) (2017)
  - [Stripe's payments APIs: The first 10 years](https://stripe.com/blog/payment-api-design) (2020)
  - Core technical breakdown of Stripe's date-based API versioning and gatekeeper pattern, ~5 pages combined
  - Stripe maintains an incredibly deep abstraction layer using a dynamic pipeline of data transformers — a masterclass in Information Hiding and Change Isolation at scale.

- **2.1e | Macro-Modularity Reality:** Lercher et al., *[Microservice API Evolution in Practice: A Study on Strategies and Challenges](https://pinzger.github.io/papers/Lercher2024-apis.pdf)* (Journal of Systems and Software, 2024)
  - Excerpts detailing cross-service contract ripple effects, ~4 pages (Optional)

### 2.2 — Empirical Validation: Cognitive Load vs. Lint Rules

- Bavota et al., *[An Empirical Study on the Developers' Perception of Software Coupling](https://www.inf.usi.ch/faculty/bavota/papers/icse2013_Coupling.pdf)* (ICSE 2013)
  - Sections I, III, and V, **~10 pages**
  - Data contrasting what static analysis tools flag as "bad coupling" versus what actually increases cognitive load.

### 2.3 — Runtime & Abstraction Tax: The Cost of the Layer

- **Source A:** Lemire, *[Avoid exception throwing in performance-sensitive code](https://lemire.me/blog/2022/05/13/avoid-exception-throwing-in-performance-sensitive-code/)* (2022)
  - Full benchmark post, ~3 pages
  - A stark, benchmark-driven look at how a "cleanly abstracted" syntactic choice imposes massive operational penalty.

- **Source B:** *Java NIO Core Documentation* ([Oracle Tutorial](https://docs.oracle.com/javase/tutorial/essential/io/))
  - Targeted modules on [Buffered Streams](https://docs.oracle.com/javase/tutorial/essential/io/buffers.html), [Channels](https://docs.oracle.com/javase/tutorial/essential/io/channels.html), and [Byte Buffers](https://docs.oracle.com/javase/tutorial/essential/io/bytestreams.html), ~6 pages
  - The ultimate case study for APoSD — both the triumph of deep modularity and the moment abstraction layers collapse under hardware constraints.

## 💻 Production Code Anchors

Review these patterns alongside your reading to prepare for the code-review segment:

[03-code-anchors.md](03-code-anchors.md) — five code anchors covering the Deep Module Triumph, Shallow Enterprise Pass-Through, I/O Performance Tradeoff, Exception-as-Control-Flow, and the Third-Party Volatility Boundary.

## 📊 Evaluation Matrix

Every reading and code anchor will be passed through this diagnostic framework:

| Dimension | Core Tension |
|---|---|
| **Cognitive** | Does this design lower developer mental overhead, or just hide the mess where linters can't see it? |
| **Changeability** | If an internal detail or external dependency changes, does the modification ripple across packages? |
| **Runtime** | What is the exact cost in heap allocations, indirect lookups, and cache misses? |
| **Observability** | Does this interface make the application harder to profile, trace, or debug in production? |
| **AI-Generation** | Is this boundary easier or harder for an LLM to reason about safely? |
| **Organizational** | Do our module boundaries enable autonomous teams or force step-locked deployments? |

## Action Items
- [ ] Read the Path 2 bundle (~32 pp core)
- [ ] Review the code anchors for the code-review segment

## Meeting Materials
- Coming Soon


