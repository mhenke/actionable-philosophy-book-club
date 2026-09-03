# Meeting 07: The Samurai Debate

**Date:** 16 Sep 2026

**What to Read:**
- 🎥 [LIVE: Uncle Bob on Software Fundamentals in the Age of AI](https://www.youtube.com/watch?v=zcLPGC-tvgk) — scaffolding over steering, 5-agent gauntlet, CRAP/mutation, fiddle mindset
- 🎥 [Matt Pocock — Software Fundamentals Matter More Than Ever](https://www.youtube.com/watch?v=v4F1gFy-hqg&t=6s) — specs-to-code → garbage, Grill Me, ubiquitous language, deep modules for delegation
- 💻 [GitHub: johnousterhout/aposd-vs-clean-code](https://github.com/johnousterhout/aposd-vs-clean-code) — PrimeGenerator 8 tiny methods → 3-4x slowdown, entanglement, megasyllabic names, comments vs prose
- 🎥 [Bonus: John Ousterhout and Uncle Bob Discuss Their Philosophies](https://www.youtube.com/watch?v=3Vlk6hCWBw0) — the two authors in conversation, conversational companion to the GitHub thread

## High-Level Summary
An extra session after the book — not new chapters. Three samurai in a cherry blossom garden: Matt Pocock ("Software Fundamentals Matter More Than Ever"), Uncle Bob live in the bathrobe ("Software Fundamentals in the Age of AI"), and the John Ousterhout vs Uncle Bob GitHub debate (`aposd-vs-clean-code`). A 5-to-6-minute anime refresher tells the arc — specs-to-code degrading to garbage, deep vs shallow modules through PrimeGenerator, the 5-agent scaffolding gauntlet — then the deck stages five debates where the group decides how to keep code obvious as generation speeds up.

## Agenda (60 Minutes)

- **Refresher Video (5-10 min):** Anime cherry blossom garden — the three samurai, petals drifting, the story only; no questions or insights on screen.
- **The Crucible (35 min):** Structured debate working through John and Bob's GitHub discussion, Matt's fundamentals talk, and Uncle Bob LIVE, using the samurai deck (5 essentials verbatim on their own slides).
- **Wrap-up (10 min):** Close the arc at the lantern and decide what to carry forward — glossary, scaffolding, or deeper interfaces.

## Discussion Points

### ❓ Essential Questions

- **Deep modules vs short methods:** When does splitting move complexity to interfaces instead of removing it?
- **Strategic vs tactical with agents:** What scaffolding check would have caught a cheap tactical fix before it decayed the design?
- **Comments and names:** When is a comment the missing fact the reader needs vs a failure to express it?
- **Testing that earns its keep:** What does coverage that actually affords a refactor look like?
- **What the book leaves out → the AI frontier:** Glossary, scaffolding, or deeper interfaces — what must we fix first?
- [See full details in 07-essential-questions.md](07-essential-questions.md)

### 💡 Non-Obvious Insights

- **Speed makes depth cheaper, not less needed:** Fundamentals matter more when generation is fast.
- **The bet is where we will pay:** Small steps and tests vs larger abstractions and fewer seams.
- **The reader is the validator:** Design is judged by the inheritor's effort, not the author's brevity.
- **Coverage is scaffolding, not a count:** Guardrails that make a cleaner shape feel safe.
- **Humans as strategic governors:** We set depth and scaffolding so the machine can fill it.
- [See full details in 07-non-obvious-insights.md](07-non-obvious-insights.md)

## Action Items

- [ ] Watch the two videos (Matt Pocock + Uncle Bob LIVE) and skim the `aposd-vs-clean-code` GitHub thread before the session
- [ ] Bring one file where the samurai would disagree — PrimeGenerator-style classitis vs deep-module hiding

## Meeting Materials

- [07-essential-questions.md](07-essential-questions.md)
- [07-non-obvious-insights.md](07-non-obvious-insights.md)
- [recordings/](recordings/)
- [slides/](slides/)
- [resources/](resources/)
