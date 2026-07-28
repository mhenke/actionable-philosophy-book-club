# Meeting 05: Essential Questions

## Chapters 12–15: A Philosophy of Software Design

1. **The "Failure" vs. "Abstraction" Debate:** Robert Martin says in *Clean Code* that "comments are always failures." Ousterhout says comments are a core part of abstraction. Code describes how things work, but the why often needs prose. When does the "expressive code" approach stop being enough?

2. **The Obviousness Litmus Test:** Ousterhout says comments should cover only what isn't obvious from reading the code. He also says obviousness is defined by the reader, not the author. So how does a team agree on what needs a comment without just repeating the code in words?

3. **Megasyllabic Names vs. Shorter Names with Comments:** Clean Code pushes long, descriptive names (like `isLeastRelevantMultipleOfLargerPrimeFactor`) instead of comments. Ousterhout prefers shorter names with header comments. Does stuffing documentation into long names actually reduce cognitive load, or does it just make developers type out the same documentation at every call site?

4. **Comments-First as a Scaffolding Tool:** Chapter 15 says to write comments before code as a way to test your abstraction. If a method is "Hard to Describe" in a short comment, is that a documentation problem or a design problem? And what does this workflow do to the developer's role?

5. **Balancing Precision and Intuition:** Good documentation gives two things: precision at the low level (units, invariants, boundary conditions) and intuition at the high level (why the code exists, what problem it solves). In our codebase, which gap causes more surprises: missing detail in declarations, or missing context about why blocks of code exist?
