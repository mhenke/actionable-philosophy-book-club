# Meeting 03: The Empirical Reality Check

**Date:** June 10, 2026

## Why This Meeting Exists

Abstractions compress complexity, not eliminate it. This meeting pressure-tests John Ousterhout's design theories against empirical data, hardware costs, and organizational reality. Every reading and exercise earns its place: no academic filler, no uncontextualized code.

**Total reading:** ~42 pages core, plus three 2-minute supplement reference cards in this directory.

## Agenda (60 Minutes)

1. **Refresher (5 min):** Quick recap of deep vs. shallow modules from Meeting 02. Refer to 02-essential-questions.
2. **Discussion (40 min):** Work through the readings below.
3. **Supplement & Exercise (15 min):** Walk through the API Friction Checklist and the Vocabulary Audit from the supplement cards.
4. **Wrap-up (10 min):** Synthesize conclusions, decide next session.

## The Lean Reading Bundle

### 1. Modern API Design & Information Hiding

**Parnas, *On the Criteria To Be Used in Decomposing Systems into Modules* (1972).** [6 pages.](https://www.cs.colostate.edu/~france/CS314/Readings/Parnas-decomposition.pdf) Classical foundation. A module's "secret" is the boundary between maintainable and unmaintainable systems. Without this, nothing else holds. Ousterhout's deep modules trace directly to this paper.

**Piccioni, Furia & Meyer, *An Empirical Study of API Usability* (2013).** [Sections I, II, IV, ~10 pages.](https://bugcounting.net/pubs/esem13.pdf) Historical data and experimental setup trimmed; action core preserved. API error rates are a measured function of interface complexity and poor type discovery. Read this alongside the **API Friction Checklist** in [03-supplement-1-api-design.md](03-supplement-1-api-design.md).

**Stripe Engineering.** *[APIs as infrastructure: future-proofing Stripe with versioning](https://stripe.com/blog/api-versioning)* (2017, ~6pp). Full read. Date-based rolling versions, version change modules as encapsulated transformations, and the Principles of Change. Information Hiding at scale.

**Stripe Engineering.** *[Stripe's payments APIs: The first 10 years](https://stripe.com/blog/payment-api-design)* (2020, ~12pp). Read: condensed history (card-first abstractions collapsing under global payment methods), the Lynx conference room section (source material for the Closed-Laptop Pattern), and "Keep it simple, Stripe" (`error_on_requires_action` packaging as API surface design). Skip payment method taxonomy tables and launch logistics. Read alongside the **Closed-Laptop Pattern** in [03-supplement-1-api-design.md](03-supplement-1-api-design.md).

### 2. Empirical Validation: Cognitive Load vs. Lint Rules

**Bavota et al., *An Empirical Study on the Developers' Perception of Software Coupling* (ICSE 2013).** [Sections I, III, V, ~5 pages.](https://www.inf.usi.ch/faculty/bavota/papers/icse2013_Coupling.pdf) Parametric formulas, clustering metrics, and effect sizes pruned. Raw data only: semantic coupling governs mental models more than structural links. Structural coupling (what code calls what) matters less than semantic coupling (what developers name things). Shared vocabulary across supposedly decoupled modules is the hidden coupling that breaks systems.

Before reading, skim the **Temple Analogy** and **Vocabulary Audit** in [03-supplement-2-empirical.md](03-supplement-2-empirical.md).

### 3. Runtime & Abstraction Tax

**Lemire, *Avoid exception throwing in performance-sensitive code* (2022).** [~3 pages.](https://lemire.me/blog/2022/05/13/avoid-exception-throwing-in-performance-sensitive-code/) When a thrown exception crosses module boundaries, the $10,000\times$ performance drop is the physical manifestation of encapsulation breaking. Read with [03-supplement-3-runtime-tax.md](03-supplement-3-runtime-tax.md).

## Action Items
- [ ] Read the Lean Reading Bundle (~42 pp core)
- [ ] Review the three supplement reference cards
- [ ] Run the Vocabulary Audit on one of your own codebases
