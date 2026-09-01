# Meeting 06: Essential questions

## Chapters 16 to 22: A Philosophy of Software Design

1. **Strategic repair vs tactical patch (Ch. 16).** Every change should leave code as if the new requirement was known from the start. Many teams pick the smallest edit because it feels safer. When is a quick patch the right call, and how do you know you did your best before you ship?

2. **Consistency as leverage (Ch. 17).** Doing similar things in similar ways lets readers reuse what they learned. That needs written rules, a checker, and When in Rome. Forcing different things to look the same hurts too. When does consistency cause harm, and when is it worth fixing a bad convention everywhere?

3. **Obviousness lives with the reader (Ch. 18).** Code is obvious when a first read guesses right. Pair hides meaning, List as ArrayList misleads, handlers hide callers, and a main can outlive its constructor. Which fix fits: shrink what must be known, reuse familiar names, or place the missing fact nearby?

4. **Do modern trends help or hurt complexity (Ch. 19).** Judged only on complexity, interface inheritance can deepen an abstraction, implementation inheritance leaks state, small feature increments push toward tactical work while strong tests make refactors affordable, and patterns help only when they fit. Which trend in our stack looks helpful but adds complexity?

5. **Performance and what matters (Ch. 20 to 21).** Simple code is often fast. When it is not, design around the critical path and keep the common case clean. Buffer went from three layers to one method and one check, 410 fewer lines, 8.8 to 4.75 ns, and you must measure before and after. When is that gain worth added complexity, and who decides what counts?
