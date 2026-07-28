# Meeting 05: The Art of Comments

**Date:** August 5, 2026

## High-Level Summary

We continue with Chapters 12–15 of *A Philosophy of Software Design*, where Ousterhout shifts focus to the quieter side of software design: comments, naming, and the concluding principles that tie the book together. The session explores why good comments are a design tool, not just documentation.

## Agenda (60 Minutes)

- **The Crucible (35 min):** Structured discussion on comment philosophy and naming as a design activity.
- **The Application (15 min):** Interactive discussion and exercises.
- **Wrap-up (5 min):** Path voting for next meeting.

## Discussion Points

### ❓ Essential Questions
- **The "Failure" vs. "Abstraction" Debate:** Robert Martin argues comments are "failures"; Ousterhout says they're essential to abstraction. Where does the expressive-code philosophy fail?
- **The Obviousness Litmus Test:** How can a team establish a shared standard for what needs a comment without falling into the "Comment Repeats Code" trap?
- **Megasyllabic Names vs. Shorter Names with Comments:** Does moving documentation into long names reduce cognitive load, or just retype the documentation at every invocation?
- **Comments-First as a Scaffolding Tool:** If a method is "Hard to Describe" in a comment, is that a documentation failure or a design failure?
- **Balancing Precision and Intuition:** Which causes more "unknown unknowns"—missing low-level detail or missing high-level rationale?
- [See full details in 05-essential-questions.md](05-essential-questions.md)

### 💡 Non-Obvious Insights
- **Abstraction is impossible without prose:** Code describes *how*; only comments can explain the *why* that defines a module's contract.
- **Comments are a diagnostic "Canary" for bad design:** If you can't describe a method simply, the abstraction is broken.
- **The "Time Pressure" excuse is a mathematical myth:** Code + comments is ~10% of dev time; comments-first can actually speed up development.
- **Obviousness is defined by the reader, not the author:** If a first-time reader finds it confusing, it *is* complex.
- **High-level comments should prioritize "How we got here":** The best implementation comments explain rationale, not just behavior.
- [See full details in 05-non-obvious-insights.md](05-non-obvious-insights.md)

## Action Items
- [ ] Vote on next meeting direction during wrap-up

## Meeting Materials
- [05-essential-questions.md](05-essential-questions.md)
- [05-non-obvious-insights.md](05-non-obvious-insights.md)
- [recordings/](recordings/)
  - 🎬 [05-legacy-ruins-primer.mp4](recordings/05-legacy-ruins-primer.mp4) 4m 36s · 18MB — Chapters 12–15: comments, naming, and concluding design principles
  - 🔬 [05-names-and-comments-deep-dive.m4a](recordings/05-names-and-comments-deep-dive.m4a) 19m 31s · 9MB — Deep dive into how naming and comments shape software design beyond surface-level documentation
  - 🔍 [05-self-documenting-code-critique.m4a](recordings/05-self-documenting-code-critique.m4a) 14m 32s · 7MB — Challenging the self-documenting code myth: when comments are essential and when they're noise
  - ⚔️ [05-self-documenting-code-debate.m4a](recordings/05-self-documenting-code-debate.m4a) 24m 39s · 12MB — Structured debate on whether self-documenting code can replace comments in modern codebases
- [slides/](slides/)
  - 📊 [05-the-lost-wisdom-of-software-design.pptx](slides/05-the-lost-wisdom-of-software-design.pptx) — The Art of Comments: comment philosophy, naming as design, and balancing precision with intuition
- [resources/](resources/)
  - [05-essential-documentation-philosophy.webp](resources/05-essential-documentation-philosophy.webp) — Documentation philosophy infographic
