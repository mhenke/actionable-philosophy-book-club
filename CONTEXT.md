# Domain Vocabulary

Ubiquitous language for the Actionable Philosophy Book Club. Use these terms exactly when discussing domain concepts.

## Book Club Domain

| Term | Definition | Aliases to avoid |
|------|-----------|------------------|
| **Meeting** | A scheduled book club session with a README, materials, and a manifest entry. Modeled by the `Meeting` class. | Session, event, call |
| **Meeting Manifest** | `docs/manifest.json` — the single source of truth for the meeting schedule. Inlined at build time into `dist/app.js`. | Schedule, calendar, index |
| **Dashboard** | The landing view showing upcoming, past, and draft meeting cards. | Home page, landing page, grid |
| **Reader** | The document view that fetches, parses, sanitizes, and renders markdown files. | Viewer, document, page |
| **Essential Questions** | Discussion-driving questions derived from the reading material. Stored in `NN-essential-questions.md`. | Key questions, discussion questions |
| **Non-Obvious Insights** | Key takeaways from the reading that are not immediately apparent. Stored in `NN-non-obvious-insights.md`. | Insights, takeaways, key points |
| **Meeting Materials** | The canonical `## Meeting Materials` heading in a README that triggers file-tree rendering in the Reader. | Resources, assets, files |
| **Draft** | A meeting in preparation, stored in `meetings/drafts/`, excluded from the manifest. | WIP, pending, upcoming |
| **Asset** | A media file (video, slides, image, audio) associated with a meeting. | Media, file, resource |
| **Stage 1** | Upcoming meeting card state when no assets exist yet — shows placeholder text. | Empty state, placeholder |
| **Stage 2** | Upcoming meeting card state when assets are populated — shows video, slides, and additional materials. | Populated state, full card |

## APoSD Concepts

Terms from *A Philosophy of Software Design* by John Ousterhout — the core text of this book club.

| Term | Definition | Aliases to avoid |
|------|-----------|------------------|
| **Complexity** | Anything related to the structure of a software system that makes it hard to understand and modify. | Complicatedness, difficulty |
| **Cognitive Load** | The amount of mental effort required to understand a module or system. | Mental overhead, brain load |
| **Change Amplification** | A symptom of complexity where a seemingly simple change requires code modifications in many different places. | Ripple effect, cascade |
| **Information Hiding** | A design principle where each module encapsulates a few design decisions and hides them from its interface. | Encapsulation, abstraction |
| **Deep Module** | A module that provides powerful functionality through a simple interface, effectively hiding its complexity. | Rich module, fat module |
| **Shallow Module** | A module with a complex interface relative to its functionality — an anti-pattern. | Thin module, simple module |
| **Tactical Tornado** | A developer who focuses on getting things done quickly but leaves a wake of complexity and technical debt. | Cowboy coder, hacker |
| **Tactical Programming** | Getting the next feature working without regard for long-term structure. | Hacking, quick-and-dirty |
| **Strategic Programming** | Investing in good design for long-term maintainability, even if it takes longer initially. | Clean coding, proper engineering |
| **Pass-through Method** | A method that merely delegates to another method — an architectural red flag indicating shallow modules. | Wrapper, delegate |
| **Classitis** | The anti-pattern of over-splitting a system into tiny, shallow classes. | Over-engineering, premature abstraction |
| **Complexity Sink** | A well-designed module that absorbs internal complexity so the rest of the system stays simple. | Black box, abstraction layer |

## Data Model

| Term | Definition | Aliases to avoid |
|------|-----------|------------------|
| **additional_material[]** | Array of supplementary resources in a manifest entry, each with a `category` enum. | extras, resources, attachments |
| **Category Enum** | The type of additional material: `deep-dive`, `debate`, `critique`, `alternate`. | type, kind, tag |
| **Asset Copy Registry** | `assetCopy` in the manifest — maps category keys to human-readable labels and titles. | labels, titles, copy |
| **Spectrum Color** | One of six accent colors (`--spectrum-1` through `--spectrum-6`) assigned to meeting cards. | theme color, accent |
| **Wash Token** | A spectrum-tinted surface overlay (e.g., `--wash-2`) for highlighted content areas. | overlay, tint, highlight |

## Relationships

- A **Meeting** has exactly one **Meeting Manifest** entry.
- A **Meeting** produces one **Essential Questions** document and one **Non-Obvious Insights** document.
- A **Meeting** transitions from **Stage 1** to **Stage 2** when its `video`, `slides`, or `additional_material[]` fields are populated.
- **Deep Module** is the opposite of **Shallow Module**.
- **Tactical Programming** is the opposite of **Strategic Programming**.
- **Tactical Tornado** practices **Tactical Programming**.
- An **Asset** belongs to exactly one **Meeting**.
- **additional_material[]** items use the **Category Enum** for classification.

## Flagged Ambiguities

- **"Resource"** was used to mean both **Asset** (media files) and **additional_material[]** (supplementary content). Use **Asset** for media files and **additional_material[]** for supplementary documents.
- **"Session"** was used interchangeably with **Meeting**. Use **Meeting** consistently.
- **"Insights"** without qualification could mean **Non-Obvious Insights** or general observations. Use the full term **Non-Obvious Insights** for the document type.
- **"Module"** in APoSD context means a design unit with an interface and implementation. In JavaScript context, it means a source file. Clarify which domain you mean.
