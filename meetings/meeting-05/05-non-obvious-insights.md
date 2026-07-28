# Meeting 05: Non-Obvious Insights

## Chapters 12–15: A Philosophy of Software Design

1. **Abstraction is impossible without prose:** A method's signature can't capture everything. Expected string formats, side effects, boundary conditions, these are invisible in the types alone. Code shows how; comments show why. Without them, readers re-derive your abstractions by scanning implementation details, which defeats the point of modular design.

2. **Comments are a diagnostic for bad design:** If you can't describe a method in a short comment, the abstraction is probably broken. Complexity shows up faster in prose than in code. A long, tangled comment about a method means the method is shallow, hiding nothing.

3. **The "Time Pressure" excuse doesn't hold up:** Developers say they don't have time to write comments, but code plus comments takes roughly 10% of development time. Writing comments first actually speeds things up because it stabilizes the abstraction before you start implementing, which means fewer rewrites.

4. **Obviousness is defined by the reader, not the author:** If someone reading your code for the first time finds it confusing, it's complex. Period. Authors lose perspective because they're too close to their own solutions. Real obviousness means a reader can guess the behavior correctly without thinking hard.

5. **High-level comments should explain "how we got here":** Low-level comments give precision (units, invariants). High-level comments give intuition (why this code exists, when you'd call it). The best implementation comments explain the reasoning behind a block of code, not just what it does.
