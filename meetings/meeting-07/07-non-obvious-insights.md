# Meeting 07: Non-obvious insights

## The Samurai Debate — Matt, John, and Bob in the Cherry Blossom Garden

1. **Generation speed makes depth cheaper, not less needed.** Pocock shows treating code as cheap specs-to-code without architecture collapses into garbage and entropy; both Matt and Bob LIVE agree fundamentals matter more when generation is fast. A deep module lets you delegate the implementation to the machine and still keep the garden walkable.

2. **The debate is about where to pay.** Bob pays in small steps and tests (One Thing, tiny methods), John pays in larger abstractions and fewer seams (deep modules, bundling). Both are bets on where future readers will spend time — classitis and entanglement vs information hiding and bundling.

3. **The reader — not the author — is the design validator.** Even when they disagree on comments, both judge code by how much effort it asks from the reader who inherits it. John is explicit: the goal is to make the system easy to understand and modify, code cannot represent the why, only prose captures intent, and the cost of missing comments outweighs stale ones; Bob's megasyllabic names trade reading cost for writing cost.

4. **Coverage that matters is scaffolding, not a count.** Bob's LIVE Hardener and Cleaner, plus the GitHub thread's common ground, frame tests as deterministic scaffolding — mutation, CRAP, and deliberate checks that let a cleaner shape feel safe to attempt. Coverage that never makes a refactor feel safe is a shallow metric.

5. **Humans must act as strategic complexity governors, not code writers.** AI is a tactical force blind to long-term architecture; without ubiquitous language and scaffolding, it thrashes and widens seams. Matt's Grill Me and shared design concept plus Bob's Specifier→Coder→Cleaner→Hardener→QA gauntlet and John's deep interfaces all point the same way: we design the depth so the machine can fill it without flooding the garden.
