# Meeting 06: The strategic finale

**Date:** September 16, 2026

## High-level summary

We close the book with Chapters 16 to 22 of *A Philosophy of Software Design*. The chapters cover how to keep complexity from returning after the initial design, why consistency and obviousness help readers move faster, how common trends look when judged only on complexity, and how to get performance without giving up clarity. The book ends on a simple test for taste: decide what matters.

## Agenda (60 minutes)

- **The Crucible (35 min):** Talk through staying strategic during changes, enforcing consistency, and judging obviousness from the reader side.
- **The Application (15 min):** Try the critical-path idea and the "what matters" frame on a real module in our codebase.
- **Wrap-up (5 min):** Look back on the series and decide where the investment mindset goes next.

## Discussion points

### ❓ Essential questions
- Strategic repair vs tactical patch. When, if ever, is a quick-and-dirty change justified, and how do you know you did the best you could within the constraints?
- Consistency as leverage. Where does "do similar things in similar ways" start to hurt, and when is it worth paying to replace a bad convention everywhere?
- Obviousness lives with the reader. What actually makes code hard to get on a first read, from generic Pair to List typed as ArrayList to a main that never exits because a constructor started threads?
- Do modern trends help or hurt. Looking at OOP, agile, TDD, patterns, and getters and setters only through complexity, which one in our stack adds complexity while appearing helpful?
- Performance, critical paths, and what matters. When does the RAMCloud Buffer example, half the time and 20 percent fewer lines with a single check for three cases, justify extra complexity, and who decides what matters on a small team?
- [See full details in 06-essential-questions.md](06-essential-questions.md)

### 💡 Non-obvious insights
- Every change is a design vote. After you are done, the system should look as if the change had been known from the start; skipping that work is debt every future reader pays.
- Proximity matters more than discipline. Comments rot fastest far from the code, so keep them next to the smallest scope they describe and check your diff before you commit.
- Consistency needs enforcement, not just a guide. Docs alone do not hold unless a checker blocks the commit, and replacing a bad convention only pays off if you fix every old use.
- Obviousness ties the earlier ideas together. When code is hard to get, the reader is missing something the author assumed was known, so you can shrink what must be known, reuse what readers already know, or put the missing fact where the reader stands.
- Coverage changes what refactors are affordable. With strong tests the Buffer work becomes plausible; without them teams keep changes small and let design issues stay.
- [See full details in 06-non-obvious-insights.md](06-non-obvious-insights.md)

## Action items
- [ ] Read Chapters 16 to 22 (docs/final-16-22.pdf), also indexed in the club NotebookLM
- [ ] Vote on the next series and book in the wrap-up

## Meeting materials
- [06-essential-questions.md](06-essential-questions.md)
- [06-non-obvious-insights.md](06-non-obvious-insights.md)
- [recordings/](recordings/)
  - 🔬 [06-staying-strategic-deep-dive.m4a](recordings/06-staying-strategic-deep-dive.m4a) 24m 00s · 22MB — Deep dive on strategic repair vs tactical patches, why consistency is leverage, and what makes code nonobvious — Pair, List vs ArrayList, event-driven handlers, and a main that never exits
  - ⚔️ [06-complexity-trends-debate.m4a](recordings/06-complexity-trends-debate.m4a) 23m 46s · 22MB — Debate on whether interface vs implementation inheritance, agile and TDD increments, and patterns or getters add complexity while looking helpful
  - 🔍 [06-consistency-obviousness-critique.m4a](recordings/06-consistency-obviousness-critique.m4a) 18m 18s · 17MB — Critique of the Buffer critical-path halve and the prominence test for what matters
- [resources/](resources/)
  - 🖼️ [06-samurai-debate-next-session.webp](resources/06-samurai-debate-next-session.webp) · 06-samurai-debate-next-session.png fallback — Anime samurai garden preview for the extra session after the book; both YouTubes and the GitHub debate housed in Meeting 06
- [slides/](slides/)
