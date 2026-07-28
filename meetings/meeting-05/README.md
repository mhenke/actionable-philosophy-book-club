# Meeting 05: The Art of Comments

**Date:** August 5, 2026

## High-Level Summary

We continue with Chapters 11–15 of *A Philosophy of Software Design*, where Ousterhout shifts focus to the quieter side of software design: comments, naming, and the concluding principles that tie the book together. The session explores why good comments are a design tool, not just documentation.

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
  - [05-comments-as-abstraction-deep-dive.m4a](recordings/05-comments-as-abstraction-deep-dive.m4a) 21m 18s · 39MB — Why comments are essential to abstraction, the four excuses debunked, and comments as a diagnostic canary for bad design
  - [05-comments-brief.m4a](recordings/05-comments-brief.m4a) 1m 58s · 4MB — Quick overview of the 5 essential questions and non-obvious insights from chapters 12-15
  - [05-comments-critique.m4a](recordings/05-comments-critique.m4a) 19m 9s · 35MB — Challenging Ousterhout's positions: is 'comments are essential' too strong in an era of TypeScript? Is 'obviousness' subjective?
