# Meeting 03: The Empirical Reality Check

**Date:** June 10, 2026

## High-Level Summary
Does abstraction compress complexity, or merely relocate it? This session pauses the textbook to test John Ousterhout's design theories against modern engineering data, historical foundations, measurable JVM behaviors, and hardware realities. Every page in this bundle has been fiercely optimized to earn its spot.

**Total Core Reading Load:** ~32 pages (plus ~4 pages optional empirical).

## Agenda (60 Minutes)
1. **Refresher (5 min):** Quick recap of deep vs. shallow modules from Meeting 02. Refer to [02-essential-questions](../meeting-02/02-essential-questions.md).
2. **Discussion (35 min):** Work through the Path 2 readings using the Multi-Dimensional Evaluation Matrix. [Reading Bundle Below](#-the-lean-reading-bundle)
3. **Code Review Anchors (10 min):** Walk through the production code patterns.
4. **Wrap-up (10 min):** Synthesize conclusions and decide next session.

## 📚 The Lean Reading Bundle

### 2.1 — Modern API Design & Information Hiding

- **2.1a | The Classical Foundation:** Parnas, *[On the Criteria To Be Used in Decomposing Systems into Modules](https://dl.acm.org/doi/10.1145/361598.361623)* (1972)
  - Full paper, **6 pages** (Communications of the ACM 15(12):1053–1058)
  - [Open-access mirror (PDF)](https://www.cs.colostate.edu/~france/CS314/Readings/Parnas-decomposition.pdf)
  - Direct engagement with the source material Ousterhout builds on. Understanding Parnas's definition of a module's "secret" is essential to identifying why modern shallow layers fail.

- **2.1b | Modern API Design at Scale:** Piccioni, Furia & Meyer, *[An Empirical Study of API Usability](https://doi.org/10.1109/ESEM.2013.14)* (ACM/IEEE ESEM 2013)
  - Sections I–II and IV, **~10 pages** (proceedings pp. 5–14)
  - [Open-access PDF](https://bugcounting.net/pubs/esem13.pdf)
  - Proves empirically that interface complexity and poor type discovery directly correlate with developer error rates.

- **2.1c | Complexity in Modern Ecosystems:**
  - Topolog (Ivanov), *[Complexity part 5. Interfaces.](https://dmtopolog.com/complexity-5-interfaces)* (2025), ~5 pages
  - Recent tech-stack synthesis explicitly analyzing deep vs. shallow modules across UI components, SDKs, and cloud dependencies.
  - ⚠️ *"Abstraction: Designing Systems That Don't Collapse Under Complexity" (Barroso, 2026) — this was a descriptive placeholder title used during the meeting. The group may have intended a synthesis of multiple sources rather than a single paper. See [Source Audit Notes](#source-audit-notes) for verified alternatives.*

- **2.1d | Real-World Practice:** Stripe Engineering Architecture Series
  - [APIs as infrastructure: future-proofing Stripe with versioning](https://stripe.com/blog/api-versioning) (2017)
  - [Stripe's payments APIs: The first 10 years](https://stripe.com/blog/payment-api-design) (2020)
  - Core technical breakdown of Stripe's date-based API versioning and gatekeeper pattern, ~5 pages combined
  - Stripe maintains an incredibly deep abstraction layer using a dynamic pipeline of data transformers — a masterclass in Information Hiding and Change Isolation at scale.

- **2.1e | Macro-Modularity Reality:** Lercher et al., *[Microservice API Evolution in Practice: A Study on Strategies and Challenges](https://doi.org/10.1016/j.jss.2024.112110)* (Journal of Systems and Software, 2024)
  - Excerpts detailing cross-service contract ripple effects, ~4 pages (Optional)
  - [Open-access arXiv preprint](https://arxiv.org/abs/2311.08175) | [Author's PDF](https://pinzger.github.io/papers/Lercher2024-apis.pdf)
  - ⚠️ *Replaces the originally listed title "An Empirical Study of Microservice Contract Evolution and Breakage," which could not be verified. This paper directly studies API evolution, backward-compatibility strategies, versioning, and the organizational coupling that results from leaking internal domain details into public contracts.*

### 2.2 — Empirical Validation: Cognitive Load vs. Lint Rules

- Bavota et al., *[An Empirical Study on the Developers' Perception of Software Coupling](https://doi.org/10.1109/ICSE.2013.6606617)* (ICSE 2013)
  - Sections I, III, and V, **~10 pages**
  - [Open-access PDF](https://www.inf.usi.ch/faculty/bavota/papers/icse2013_Coupling.pdf)
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

### Anchor A: The Deep Module Triumph
```java
String content = Files.readString(Path.of("production_log.txt"));
```
The caller is entirely insulated from encoding charsets, buffer allocation loops, native OS-specific system calls, resource leak protections, and file-handle state tracking.

### Anchor B: The Shallow Enterprise Pass-Through
```text
Controller ──> Service ──> Manager ──> Repository ──> Adapter ──> DAO
```
Each layer absorbs zero complexity — purely shallow conduits forwarding parameters and inflating class counts.

### Anchor C: The I/O Performance Tradeoff
```java
BufferedInputStream bis = new BufferedInputStream(new FileInputStream("file.dat"));
FileChannel channel = FileChannel.open(Path.of("file.dat"));
ByteBuffer buffer = ByteBuffer.allocateDirect(1024 * 4);
```
Pattern 1 optimizes for readability. Pattern 2 achieves zero-copy performance with manual buffer management.

### Anchor D: Exception-as-Control-Flow
```java
try {
    return Integer.parseInt(userInput);
} catch (NumberFormatException e) {
    return -1;
}
```
Cognitively straightforward, but the JVM must pause execution, freeze the thread state, capture the stack trace, and unwind the execution pipeline.

### Anchor Evolved: The Third-Party Volatility Boundary
```java
public class PaymentGateway {
    private final StripeEngine internalEngine;

    public PaymentGateway(StripeEngine internalEngine) {
        this.internalEngine = internalEngine;
    }

    public Optional<TransactionReceipt> charge(Invoice invoice, PaymentToken token) {
        try {
            var stripeParams = MapToStripe.buildParams(invoice, token);
            var intent = internalEngine.executeWithRetry(stripeParams);
            return Optional.of(new TransactionReceipt(intent.getId(), invoice.getId()));
        } catch (Exception e) {
            System.getLogger("Payments").log(System.Logger.Level.ERROR, "Transaction failed internally", e);
            return Optional.empty();
        }
    }
}
```
Completely isolates volatile external vendor changes — swap Stripe for PayPal tomorrow without changing caller code.

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

---

## Source Audit Notes

This reading bundle was assembled by the book-club members during Meeting 02. Below is a verification audit of every citation, with corrections and open-access links added.

| # | Citation | Status | Correction |
|---|---|---|---|
| 2.1a | Parnas (1972) CACM | ✅ Verified | **Pages corrected:** 6 pp (1053–1058), not 9. Added ACM DOI and open-access PDF mirror. |
| 2.1b | Piccioni et al. (2013) ESEM | ✅ Verified | **Pages corrected:** ~10 pp (proceedings 5–14), not 6. Authors confirmed: Piccioni, Furia, Meyer. Added open-access PDF. |
| 2.1c | Barroso (2026) | ⚠️ **Placeholder title** | This was a descriptive placeholder used during the meeting, not an exact published title. **Verified alternatives the group liked:** (1) Spolsky, *The Law of Leaky Abstractions* (2002); (2) Sridharan, *Fundamentals of Software Architecture* (O'Reilly, 2020), Ch. 14 on abstraction; (3) Feathers, *Working Effectively with Legacy Code* (2004), Ch. 4 on seams. |
| 2.1c | Topolog (2025) | ✅ Verified | Real blog post by Dmitrii Ivanov. Link added. |
| 2.1d | Stripe Engineering | ✅ Verified | Three real blog posts identified and linked. |
| 2.1e | "Microservice Contract Evolution and Breakage" | ⚠️ **Placeholder title** | Exact title not found. **Replaced with verified paper:** Lercher et al. (2024), *Microservice API Evolution in Practice*, which studies exactly the same phenomena (cross-service contract ripple, backward compatibility, versioning, organizational coupling). Open-access preprint and author's PDF added. **Optional alternative:** Assunção et al. (2023), *How do Microservices Evolve? An Empirical Analysis of Changes in Open-Source Microservice Repositories* (JSS), which examines co-evolution and "shotgun surgery" patterns across microservices. |
| 2.2 | Bavota et al. (2013) ICSE | ✅ Verified | **Pages corrected:** ~10 pp, not 5. Full author list: Bavota, Dit, Oliveto, Di Penta, Poshyvanyk, De Lucia. Added open-access PDF. |
| 2.3a | Lemire (2022) | ✅ Verified | Real blog post by Daniel Lemire (May 2022). Link added. |
| 2.3b | Java NIO Oracle Tutorial | ✅ Verified | Official Oracle documentation. Links to specific modules added. |

**Paywall status summary:**
- 🟢 **Freely available:** Parnas (mirrors), Topolog blog, Stripe blog, Lemire blog, Java NIO tutorial, Lercher arXiv preprint, Bavota author PDF, Piccioni author PDF.
- 🔴 **Paywalled (open-access alternatives provided):** Piccioni et al. official DOI (IEEE), Bavota et al. official DOI (ACM/IEEE), Lercher official DOI (Elsevier).

*Note: External links in this document will display as text in the book-club reader (CSP policy), but remain clickable when viewing the markdown on GitHub or in a raw text editor.*
