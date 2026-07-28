# Meeting 05: Essential Questions

## Chapters 12–15: A Philosophy of Software Design

1. **The "Failure" vs. "Abstraction" Debate:** Robert Martin argues in *Clean Code* that "comments are always failures," whereas Ousterhout maintains that comments are an irreplaceable pillar of system design and abstraction. If code primarily describes the "how" and prose is better suited to explain the qualitative "why," at what point does the "expressive code" philosophy fail to capture essential design rationale?

2. **The Obviousness Litmus Test:** Ousterhout's guiding principle is that comments should only describe things that are **not** obvious from the code. Given his rule that "obvious" is defined by the person reading the code for the first time rather than the author, how can a team establish a shared standard for what needs a comment without falling into the "Comment Repeats Code" trap?

3. **Megasyllabic Names vs. Shorter Names with Comments:** There is a sharp tension between the *Clean Code* practice of using extremely long, specific names (e.g., `isLeastRelevantMultipleOfLargerPrimeFactor`) to replace comments and Ousterhout's preference for shorter names supplemented by descriptive header blocks. Does the practice of moving documentation into "megasyllabic" names reduce cognitive load, or does it merely force developers to "retype the documentation" in every invocation?

4. **Comments-First as a Scaffolding Tool:** Chapter 15 argues for writing comments *before* the code as a design tool to test abstraction boundaries. If a developer finds a method "Hard to Describe" in a simple comment, should they view it as a failure of documentation or a fundamental failure of the design itself, and how does this "Comments-First" workflow shift the role of the developer from a code producer to a complexity governor?

5. **Balancing Precision and Intuition:** Good documentation should augment code by providing **precision** at a lower level (units, invariants, boundary conditions) and **intuition** at a higher level (overall intent and conceptual frameworks). In our current codebase, which of these two missing elements causes more "unknown unknowns"—a lack of low-level detail in variable declarations or a lack of high-level intuition about why specific code blocks exist?
