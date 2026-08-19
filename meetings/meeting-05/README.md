# Meeting 05: The Art of Comments

**Date:** August 5, 2026

## High-Level Summary

We continue with Chapters 12–15 of *A Philosophy of Software Design*. Ousterhout covers comments, naming, and the closing principles of the book. The main question: when are comments a design tool, not just documentation?

## Agenda (60 Minutes)

- **The Crucible (35 min):** Structured discussion on comment philosophy and naming as a design activity.
- **The Application (15 min):** Interactive discussion and exercises.
- **Wrap-up (5 min):** Path voting for next meeting.

## Discussion Points

### ❓ Essential Questions
- **The "Failure" vs. "Abstraction" Debate:** Robert Martin says comments are "failures"; Ousterhout says they're essential to abstraction. Where does the expressive-code approach stop working?
- **The Obviousness Litmus Test:** How does a team agree on what needs a comment without just repeating the code in words?
- **Megasyllabic Names vs. Shorter Names with Comments:** Does moving documentation into long names reduce cognitive load, or just make developers retype the same documentation at every call site?
- **Comments-First as a Scaffolding Tool:** If a method is "Hard to Describe" in a comment, is that a documentation failure or a design failure?
- **Balancing Precision and Intuition:** Which causes more surprises: missing low-level detail or missing high-level rationale?
- [See full details in 05-essential-questions.md](05-essential-questions.md)

### 💡 Non-Obvious Insights
- **Abstraction is impossible without prose:** Code shows how; comments show why. Without them, readers re-derive your abstractions by scanning implementation details.
- **Comments are a diagnostic for bad design:** If you can't describe a method simply, the abstraction is probably broken.
- **The "Time Pressure" excuse doesn't hold up:** Code plus comments takes roughly 10% of dev time. Writing comments first can actually speed things up.
- **Obviousness is defined by the reader, not the author:** If a first-time reader finds it confusing, it's complex.
- **High-level comments should explain "how we got here":** The best implementation comments explain reasoning, not just behavior.
- [See full details in 05-non-obvious-insights.md](05-non-obvious-insights.md)

## Action Items
- [ ] Vote on next meeting direction during wrap-up

## Meeting Materials
- [05-essential-questions.md](05-essential-questions.md)
- [05-non-obvious-insights.md](05-non-obvious-insights.md)
- [recordings/](recordings/)
  - [05-legacy-ruins-primer.mp4](recordings/05-legacy-ruins-primer.mp4)
  - [05-the-great-abstraction-debate-alternate.mp4](recordings/05-the-great-abstraction-debate-alternate.mp4) 6m 24s · 18MB — A debate on whether abstraction is a complexity sink or a complexity tax.
  - [05-names-and-comments-deep-dive.m4a](recordings/05-names-and-comments-deep-dive.m4a)
  - [05-self-documenting-code-critique.m4a](recordings/05-self-documenting-code-critique.m4a)
  - [05-self-documenting-code-debate.m4a](recordings/05-self-documenting-code-debate.m4a)
- [slides/](slides/)
  - [05-the-architecture-of-prose-slides.pptx](slides/05-the-architecture-of-prose-slides.pptx)
- [resources/](resources/)
  - [05-essential-documentation-philosophy.webp](resources/05-essential-documentation-philosophy.webp)
  - [05-the-art-of-comments-slides.pptx](resources/05-the-art-of-comments-slides.pptx)
  - [05-obviousness-litmus-test.webp](resources/05-obviousness-litmus-test.webp)
