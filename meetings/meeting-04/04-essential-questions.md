# Five Essential Questions: The Complexity Romance

Based on Chapters 9-11 of *A Philosophy of Software Design*. These questions cover when to split code versus keep it together, why fragmentation costs more than it saves, how to manage exceptions without drowning in error handling, what it means to design errors away, and why your first design idea is probably wrong.

## 1. When should functionality be combined into a single module versus being separated into multiple components?

Every time you split code, you add new interfaces, more glue logic, and a separation between things that used to be in the same place. That is new complexity. The question is whether the split pays for itself.

Functionality belongs together when the pieces share the same data or syntax, when using one means you will probably use the other, when they fall under a simple higher-level category, or when understanding one means looking at the other anyway.

Signs you split badly: the same code appears in multiple places (you missed the real abstraction), a general-purpose module has a special case baked in (information leaks through), or you cannot understand one method without reading another (they should be merged).

**What this means in practice:** Most teams default to splitting because small files feel cleaner. But every split adds a file to navigate, an interface to maintain, and a mental wire to trace. The better question is not "can we split this?" but "does this split reduce what a developer needs to hold in their head?"

## 2. How does "module depth" conflict with the "Clean Code" movement's emphasis on short methods?

Robert Martin says functions should be a few lines long. Ousterhout says length alone is not a reason to split. He cares about module depth: how much functionality sits behind a simple interface.

Split too much and you get classitis. Lots of shallow modules where the interface is as complex as the implementation. You end up flipping between files just to follow one logical operation. A single deep method is often easier to read than five tiny ones that pass data between them.

**What this means in practice:** The fight is not about method length. It is about where you let complexity live. Martin puts it in the wiring between tiny methods. Ousterhout puts it inside one deeper method with a clean surface. Which approach your team should pick depends on which kind of complexity you are better at managing.

## 3. Why is exception handling one of the primary drivers of software complexity?

Exceptions break normal control flow. They force you to think about inconsistent states. One study found that over 90% of catastrophic failures in distributed systems came from bad error handling.

Four ways to reduce the damage:

**Define errors out of existence.** Change the API so the "error" case is just normal behavior.

**Mask exceptions.** Handle the problem at a low level so higher layers never see it. TCP does this when it retransmits dropped packets.

**Exception aggregation.** One high-level handler catches many error types. A web server dispatcher that catches all request errors is an example.

**Just crash.** For something like running out of memory, print a diagnostic and stop. Adding recovery code to an unrecoverable situation just creates more places for bugs.

**What this means in practice:** The "just crash" advice bothers experienced developers because it goes against a lifetime of defensive programming training. The key question is whether the system can actually continue. If it cannot, error-handling code is just a place for bugs to hide.

## 4. What does it mean to "define errors out of existence," and how do Unix and Windows file deletion illustrate this?

Instead of handling an error, redesign the API so the situation is not an error in the first place.

Windows will not let you delete an open file. You have to find and kill the process holding it. This is a constant source of frustration. Unix handles it differently: deleting an open file removes it from the directory but the process keeps reading and writing until it closes. The delete succeeds immediately. The space frees later. By deferring the actual cleanup, Unix eliminates two errors at once: the delete can never fail because a file is open, and no process crashes because its file disappeared.

Java's `substring` method throws when the indices are out of range. Python's version just returns whatever characters overlap. Which interface feels deeper?

**What this means in practice:** Redesigning an operation so errors do not exist is the most effective technique in the book. It prevents complexity instead of managing it. The catch is that it forces you to rethink basic assumptions about what an operation means, which is harder than adding an `if` statement.

## 5. What is the "Design it Twice" principle, and why does it overcome the "smart person" trap?

For any major design decision, sketch at least two completely different approaches. Then compare them on usability, interface simplicity, and performance.

This is harder than it sounds. Smart people learn early that their first idea is usually good enough. That becomes a blind spot: needing a second design feels like admitting failure. But software problems are too hard for anyone to solve right the first time. Building the habit of designing twice produces better architecture and improves your judgment over the long run.

**What this means in practice:** Designing twice is as much about psychology as technique. It forces you to separate your ego from your output. The first design is a hypothesis, not a conclusion. Teams that require at least two proposals in design reviews tend to produce better architectures than teams that reward whoever types the fastest.
