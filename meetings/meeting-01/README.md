# Meeting 01: Deep Systems

**Date:** May 13, 2026

## High-Level Summary
A foundational deep dive into Chapters 1 through 4 of "A Philosophy of Software Design." This session explored the "Complexity Waterfall": identifying the symptoms of unknown unknowns and cognitive load, and established the critical distinction between tactical speed and strategic depth.

## Agenda (60 Minutes)
1. [Video Primer](recordings/01-The-Architects-of-Complexity.mp4). **Refresher Video (5-10 min):** Visualizing the shallow vs. deep module gap.
2. [Slides](slides/01-Architecting-Deep-Systems.pptx). **Discussion (30 min):** Core debate on "Classitis" and why small functions aren't always clean.
3. **Wrap-up (Last 10 min):**
   - [Choose Your Adventure](resources/01-choose-your-adventure.png). **Future Planning:** Group selected Path 2 for Meeting 02's direction.
   - **Retrospective:** Moving beyond tactical tornados in our PRs.

## Discussion Points

### ❓ Essential Questions
*   **The Complexity Waterfall:** How does it redefine the goal of a developer?
*   **Classitis:** Is the "Clean Code" heuristic of small functions actually hurting us?
*   **The Tactical Tornado:** Why is this person rewarded in modern engineering cultures?
*   **Unknown Unknowns:** How do we proactively eliminate the most dangerous symptom of complexity?
*   **AI Ownership:** Who owns "Structural Integrity" when LLMs write the implementation?
*   [See full details in 01-essential-questions.md](01-essential-questions.md)

### 💡 Non-Obvious Insights
*   **Shallow Modules:** Why "clean-looking" code can be a symptom of a failing system.
*   **The Cost of Speed:** Why the fastest coder might be the most expensive person on the team.
*   **Deep Class Paradox:** Can a 500-line class be "simpler" than ten 50-line classes?
*   **Fragmentation Crisis:** Is AI-generated code creating a long-term modularity debt?
*   [See full details in 01-non-obvious-insights.md](01-non-obvious-insights.md)

## Meeting Materials
- [01-essential-questions.md](01-essential-questions.md)
- [01-non-obvious-insights.md](01-non-obvious-insights.md)
- [recordings/](recordings/)
  - 🎬 [01-The-Architects-of-Complexity.mp4](recordings/01-The-Architects-of-Complexity.mp4) 4m 46s · 17MB — Introduces the complexity waterfall, tactical tornados, and the cost of shallow modules (Chapters 1–4 primer)
  - 🔬 [01-strategic-software-design-and-deep-modules-deep-dive.m4a](recordings/01-strategic-software-design-and-deep-modules-deep-dive.m4a) 17m 45s · 16MB — Explores how strategic design differs from tactical coding and why deep modules reduce cognitive load
  - ⚔️ [01-deep-modules-versus-clean-code-for-ai-debate.m4a](recordings/01-deep-modules-versus-clean-code-for-ai-debate.m4a) 23m 34s · 22MB — Debates whether clean code heuristics hold up when LLMs generate the implementation
  - 🔍 [01-tactical-programming-complexity-critique.m4a](recordings/01-tactical-programming-complexity-critique.m4a) 17m 59s · 17MB — Critiques the tactical tornado mindset and its hidden cost to long-term system integrity
- [resources/](resources/)
  - [01-architecture-of-simplicity.png](resources/01-architecture-of-simplicity.png)
  - [01-choose-your-adventure.png](resources/01-choose-your-adventure.png)
- [slides/](slides/)
  - 📊 [01-Architecting-Deep-Systems.pptx](slides/01-Architecting-Deep-Systems.pptx) — Discussion deck: classitis, unknown unknowns, shallow vs. deep, and AI modularity debt
