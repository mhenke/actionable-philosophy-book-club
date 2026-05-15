# Design Spec: Actionable Philosophy Book Club Repository

**Date:** 2026-05-15
**Status:** Draft
**Topic:** Bootstrapping a low-friction repository for an engineering book club.

## 1. Purpose
Create a bare-bones, AI-friendly GitHub repository structure for the "Actionable Philosophy Book Club". The repository is optimized for low contributor friction, supporting diverse media types (pptx, png, m4), and facilitating async collaboration.

## 2. Core Principles
- **Low Ceremony:** Minimal process, markdown-first.
- **AI-Friendly:** Structured headers and clear directory organization.
- **Visual & Media Support:** Specific handling for slides, recordings, and diagrams.
- **Non-Technical Friendly:** Simple workflows documented for non-Git experts.

## 3. Directory Structure
```text
/actionable-philosophy-book-club/
├── README.md                # Mission, cadence, links
├── CONTRIBUTING.md          # "Upload files here" guide, S3 policy
├── .gitignore               # Standard ignores
├── meetings/
│   ├── meeting-01/
│   │   ├── notes.md         # Meeting notes
│   │   ├── slides/          # .pptx files
│   │   ├── recordings/      # .m4 files (or links)
│   │   └── resources/       # .png files, screenshots
│   ├── meeting-02/          # Scaffolding
│   ├── meeting-03/          # Scaffolding
│   └── meeting-04/          # Scaffolding
├── templates/
│   ├── meeting-notes-template.md
│   ├── discussion-template.md
│   └── ai-prompts-template.md
└── docs/
    ├── glossary.md
    ├── design-principles.md
    └── ai-workflow-ideas.md
```

## 4. Key Documentation & Policies
### README.md
- Purpose: Bridge the gap between software design philosophy and AI-assisted development.
- Cadence: To be defined by the user.
- Quick Start: How to view notes and join discussions.

### CONTRIBUTING.md
- Tone: "Don't worry about perfect formatting."
- Large Files: Files < 50MB (pptx, png) can be committed directly. Files > 50MB (m4) should be uploaded to AWS S3 and linked in `notes.md`.
- Workflow: Simple "upload via GitHub UI" or standard Git commands.

### .gitkeep
- Placed in all empty folders (`slides/`, `recordings/`, `resources/`) to ensure the directory structure is maintained in Git.

## 5. Implementation Strategy
1. Create directory structure.
2. Initialize local Git repository.
3. Write Markdown files and templates.
4. (Optional) Create GitHub repository using `gh cli`.

## 6. Success Criteria
- [ ] Directory structure matches the spec.
- [ ] README and CONTRIBUTING are present and helpful.
- [ ] Templates are available for future meetings.
- [ ] Git repository is initialized.
