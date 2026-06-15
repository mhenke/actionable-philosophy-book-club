# Non-Obvious Insights: The Complexity Romance

Based on Chapters 9-11 of *A Philosophy of Software Design*. The most surprising findings here are about how splitting code shifts complexity instead of removing it, why smart people are often their own worst enemy, how good design can mean deleting things instead of adding them, and what repeated code really tells you.

## 1. Complexity is a conservation of mass problem

Break a system into tiny components and you make each one simpler to read. But the complexity does not go away. It moves. It shows up in the interfaces between components and in all the code you need to wire them together. Every split creates new burdens: more files to track, more interfaces to maintain, more connections to remember.

**The common view:** Splitting a big function into many small ones makes the code easier to understand because each piece is trivial.

**What actually happens:** That complexity reappears as the mental cost of tracing connections between fragments and understanding how they fit together.

**The takeaway:** Every split needs to earn its keep. The question is not whether the individual pieces look clean. It is whether the system as a whole is easier to hold in your head.

## 2. Design is a psychological hurdle for high achievers

The biggest barrier to good design is not technical. It is ego. People who are used to being right on the first try learn to equate speed with skill. They do not realize that software problems are too hard for anyone to solve on the first pass. The belief that you do not need a second draft is confidence masquerading as expertise.

**The common view:** Great designers produce great designs on the first try because they have experience and good intuition.

**What actually happens:** Large problems are too complex for anyone to nail on the first attempt. The idea that you can is a blind spot, not a talent.

**The takeaway:** The "Design it Twice" principle is about building a habit. Treat your first design as a hypothesis. The best designers are the ones who routinely throw their first ideas away.

## 3. Abstractions are as much about deleting as they are about creating

The most valuable design move is often subtractive. Change what an operation means so whole categories of behavior no longer exist. Instead of a "delete" that fails if the file is open, make it a "delete" that just removes the name from the directory. No error handling needed because the error case was eliminated, not caught.

**The common view:** Good abstractions give you more functionality and more flexibility.

**What actually happens:** The most powerful abstractions take things away. They redefine the operation so edge cases are structurally impossible.

**The takeaway:** When you reach for error handling, stop and ask whether you can change the operation so the error never happens. The Unix file deletion model is the textbook example.

## 4. Redundancy is a diagnostic tool for missing layers

When the same code keeps showing up, do not just extract it into a shared function. That is treating the symptom. Ask what concept keeps getting expressed. The repetition exists because no module captures that concept.

**The common view:** Repeated code is just a DRY violation. Extract the duplicate into a shared function and move on.

**What actually happens:** Repetition is a symptom. The real problem is a missing abstraction. The right fix is not a shared function. It is a new layer that makes the repetition structurally impossible.

**The takeaway:** Before you extract a helper, figure out what idea the repeated code represents. The best fix is often a new module, not a shared utility.

## Tensions and Contradictions

### Ousterhout vs. Clean Code (The Fragmentation War)

This is a direct collision between two schools of thought. Martin says keep functions tiny. Ousterhout says that fragments your logic into pieces no one can follow without jumping between files. The tension is not resolvable by looking at a single method. You have to decide where your team can best absorb complexity: in the wiring between tiny functions or inside a deeper method.

### Defensive Programming vs. Simplicity

Standard engineering training says catch every possible error. Ousterhout says this makes your classes shallower by pushing the burden onto the caller. If an edge case is rare and the system cannot meaningfully recover, handling it just adds surface area for bugs.

### The Masking Paradox

TCP masking dropped packets is good. A network library silently discarding errors the application needs is bad. The book does not give a clean rule for telling them apart. That feels like a gap: the difference between helpful masking and dangerous hiding is exactly where the hard judgment lives.

## Summary: The So What

If you take one thing from this, it is this: prioritize system depth over local readability. Making individual functions tiny is a trap if it increases the total cognitive load of the system. A longer method that hides real complexity behind a clean interface beats ten shallow methods that force you to trace wires between them. Depth shrinks dependencies. Fragmentation grows them.

## What's Missing

### Quantitative Metrics for Depth

Ousterhout gives you red flags like having to flip between files. But there is no formula for measuring the ratio of interface complexity to implementation power. How do you tell during code review whether a module is deep enough?

### Legacy System Migration

The book is about designing systems from scratch or refactoring them. It does not say much about how to handle the messy middle when a system is half shallow and half deep.

### The Cost of Designing it Twice

Ousterhout says sketching two designs takes an hour or two. In a shop with two-week sprints and velocity tracking, how do you explain that time to a product manager who counts shipped stories?
