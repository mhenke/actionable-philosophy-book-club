# Meeting 06: Non-obvious insights

## Chapters 16 to 22: A Philosophy of Software Design

1. **Every change is a design decision.** Chapter 16 treats fixes and features the same way: after you are done, the code should look as if you knew about the change from the beginning. The extra time is not overhead, it is the work that keeps future reading and change cheap.

2. **Distance, not willpower, keeps comments honest (Ch. 16).** Comments go stale fastest when they live away from the code they describe, in a header or in commit history that no one will search. They stay accurate more often when they sit next to the smallest scope they describe, with a brief strategy note at the top, and get a quick check in the diff before you commit. Document once, link from the other places.

3. **Consistency needs a checker, not a memo (Ch. 17).** The newline versus CRLF episode shows that a written convention does not hold unless a tool can block a bad commit. "When in Rome" carries the most weight because it requires no central meeting, but the book's test for replacing a bad convention is strict: only when you have new information and you are willing to fix every old use, because inconsistency costs more than living with a choice you do not love.

4. **Obviousness is the thread that ties the book together (Ch. 18).** The point of Chapter 18 is that hard-to-read code is often a gap in information the author took for granted, for example a Pair.getKey that is quietly a term number, or a RaftClient constructor that keeps running after main returns. That framing maps cleanly to the rest of the book: remove some things readers would have to learn, reuse what readers already learned elsewhere, or place the missing fact right where the reader will look.

5. **Coverage shifts which design moves are affordable (Ch. 19).** The Tcl bytecode compiler story is not just that tests find bugs but that good coverage changes what refactors a team will attempt. Without it, teams keep changes small and let design issues stay because the risk feels too high. With it, work like the Buffer rewrite that cuts time in half while removing about a fifth of the code becomes a reasonable bet. The related worry about test-driven development, on this view, is that increments built around small features leave no point where designing a full abstraction feels due.
