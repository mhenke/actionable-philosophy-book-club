# Meeting 03: The Empirical Reality Check

**Date:** June 10, 2026

## Why This Meeting Exists

Abstractions compress complexity, not eliminate it. This meeting pressure-tests John Ousterhout's design theories against empirical data, hardware costs, and organizational reality. Every reading and exercise earns its place: no academic filler, no uncontextualized code.

**Total reading:** ~43 pages core (~47 with optional Lercher), plus three 2-minute supplement reference cards in this directory.

## Agenda (60 Minutes)

1. **Refresher (5 min):** Quick recap of deep vs. shallow modules from Meeting 02. Refer to 02-essential-questions.
2. **Discussion (35 min):** Work through the readings below using the Multi-Dimensional Evaluation Matrix.
3. **Supplement & Exercise (10 min):** Walk through the API Friction Checklist and the Vocabulary Audit from the supplement cards.
4. **Wrap-up (10 min):** Synthesize conclusions, decide next session.

## The Lean Reading Bundle

### 1. Modern API Design & Information Hiding

**Parnas, *On the Criteria To Be Used in Decomposing Systems into Modules* (1972).** [9 pages.](https://www.cs.colostate.edu/~france/CS314/Readings/Parnas-decomposition.pdf) Classical foundation. A module's "secret" is the boundary between maintainable and unmaintainable systems. Without this, nothing else holds. Ousterhout's deep modules trace directly to this paper.

**Piccioni, Furia & Meyer, *An Empirical Study of API Usability* (2013).** [Sections I, II, IV, ~6 pages.](https://bugcounting.net/pubs/esem13.pdf) Historical data and experimental setup trimmed; action core preserved. API error rates are a measured function of interface complexity and poor type discovery. Read this alongside the **API Friction Checklist** in [03-supplement-1-api-design.md](03-supplement-1-api-design.md).

**Topolog, *Complexity part 4: Abstractions* (2025) & Barroso, *Abstraction: Designing Systems That Don't Collapse Under Complexity* (2026).** [~9 pages combined.](https://dmtopolog.com/complexity-4-abstraction) Synthesized with Lercher's cross-service ripple effects below. Deep vs. shallow module analysis across UI components, SDKs, and cloud dependencies. Barroso follows with dependency inversion and volatility isolation.

**Stripe Engineering.** *[APIs as infrastructure: future-proofing Stripe with versioning](https://stripe.com/blog/api-versioning)* (2017) and *[Stripe's payments APIs: The first 10 years](https://stripe.com/blog/payment-api-design)* (2020). [~5 pages combined.] Information Hiding at organizational scale: date-based API versioning through a dynamic pipeline of data transformers. Read this alongside the **Closed-Laptop Pattern** in [03-supplement-1-api-design.md](03-supplement-1-api-design.md).

**Lercher et al., *Microservice API Evolution in Practice* (2024).** [~4 pages, optional.](https://pinzger.github.io/papers/Lercher2024-apis.pdf) Cross-service contract ripple effects. What happens when Information Hiding fails across team boundaries.

### 2. Empirical Validation: Cognitive Load vs. Lint Rules

**Bavota et al., *An Empirical Study on the Developers' Perception of Software Coupling* (ICSE 2013).** [Sections I, III, V, ~5 pages.](https://www.inf.usi.ch/faculty/bavota/papers/icse2013_Coupling.pdf) Parametric formulas, clustering metrics, and effect sizes pruned. Raw data only: semantic coupling governs mental models more than structural links. Structural coupling (what code calls what) matters less than semantic coupling (what developers name things). Shared vocabulary across supposedly decoupled modules is the hidden coupling that breaks systems.

Before reading, skim the **Temple Analogy** and **Vocabulary Audit** in [03-supplement-2-empirical.md](03-supplement-2-empirical.md).

### 3. Runtime & Abstraction Tax

**Lemire, *Avoid exception throwing in performance-sensitive code* (2022).** [~3 pages.](https://lemire.me/blog/2022/05/13/avoid-exception-throwing-in-performance-sensitive-code/) When a thrown exception crosses module boundaries, the $10,000\times$ performance drop is the physical manifestation of encapsulation breaking. Read with the **Boundary Leak Penalty** callout in [03-supplement-3-runtime-tax.md](03-supplement-3-runtime-tax.md).

**Java NIO Core: Buffered Streams, Channels, Byte Buffers.** [~6 pages.](https://docs.oracle.com/javase/tutorial/essential/io/buffers.html) The triumph and collapse of abstraction. BufferedStreams successfully hide hardware complexity until performance demands expose the illusion. Read with the **Useful Fiction of the Stream Abstraction** case study in [03-supplement-3-runtime-tax.md](03-supplement-3-runtime-tax.md).

## Production Code Anchors

[03-code-anchors.md](03-code-anchors.md): five code patterns covering the Deep Module Triumph, Shallow Enterprise Pass-Through, I/O Performance Tradeoff, Exception-as-Control-Flow, and Third-Party Volatility Boundary.

## Evaluation Matrix

| Dimension | Core Tension |
|---|---|
| **Cognitive** | Does this design lower mental overhead, or hide the mess where linters cannot see it? |
| **Changeability** | If an internal detail changes, does the modification ripple across packages? |
| **Semantic** | Do two decoupled modules share dense domain vocabulary without a schema contract? |
| **Runtime** | What is the exact cost in heap allocations, indirect lookups, and cache misses? |
| **Observability** | Does this interface make the application harder to profile, trace, or debug? |
| **AI-Generation** | Is this boundary easier or harder for an LLM to reason about safely? |
| **Organizational** | Do our module boundaries enable autonomous teams or force step-locked deployments? |

## Action Items
- [ ] Read the Lean Reading Bundle (~32 pp core)
- [ ] Review the three supplement reference cards
- [ ] Run the Vocabulary Audit on one of your own codebases
- [ ] Review the code anchors for the code-review segment
