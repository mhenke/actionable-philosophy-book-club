# Actionable Philosophy Book Club Bootstrap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the initial directory structure, documentation, and templates for the Actionable Philosophy Book Club repository and initialize it as a Git repository.

**Architecture:** A flat, folder-per-meeting directory structure with Markdown-first documentation and templates for consistency.

**Tech Stack:** Markdown, Git, GitHub CLI (gh).

---

### Task 1: Repository Initialization & Structure

**Files:**
- Create: `.gitignore`
- Create: `meetings/meeting-0{1..4}/.gitkeep`
- Create: `meetings/meeting-01/{slides,recordings,resources}/.gitkeep`

- [ ] **Step 1: Initialize Git repository**

Run: `git init /home/mhenke/Projects/actionable-philosophy-book-club`
Expected: "Initialized empty Git repository"

- [ ] **Step 2: Create .gitignore**

```text
# OS files
.DS_Store
Thumbs.db

# Media files that should be on S3 (Optional example)
# recordings/*.m4
# recordings/*.mp4

# Temporary files
*.tmp
*.log
```

- [ ] **Step 3: Create directory structure with .gitkeep files**

Run:
```bash
cd /home/mhenke/Projects/actionable-philosophy-book-club
mkdir -p meetings/meeting-01/{slides,recordings,resources}
mkdir -p meetings/meeting-0{2,3,4}
mkdir -p templates
mkdir -p docs
touch meetings/meeting-01/{slides,recordings,resources}/.gitkeep
touch meetings/meeting-0{2,3,4}/.gitkeep
```

- [ ] **Step 4: Verify structure**

Run: `ls -R /home/mhenke/Projects/actionable-philosophy-book-club/meetings`
Expected: Folders for meeting-01 to meeting-04 exist with .gitkeep files.

- [ ] **Step 5: Commit initial structure**

```bash
git add .
git commit -m "chore: initialize repository structure"
```

---

### Task 2: Core Documentation

**Files:**
- Create: `README.md`
- Create: `CONTRIBUTING.md`

- [ ] **Step 1: Create README.md**

```markdown
# Actionable Philosophy Book Club

## Purpose
A space for engineering book club members to bridge software design philosophy with modern AI-assisted development practices. We focus on actionable insights that can be applied to our daily workflows.

## Meeting Cadence
- **Frequency:** [TBD]
- **Time:** [TBD]
- **Location:** [TBD]

## How to Contribute
1. Check the `meetings/` folder for upcoming or past sessions.
2. Read `CONTRIBUTING.md` for guidance on uploading slides, recordings, and notes.
3. Use the templates in `templates/` to start new meeting artifacts.

## Resources
- [Glossary](docs/glossary.md)
- [Design Principles](docs/design-principles.md)
- [AI Workflow Ideas](docs/ai-workflow-ideas.md)
```

- [ ] **Step 2: Create CONTRIBUTING.md**

```markdown
# Contributing to the Book Club

We value participation over perfect formatting. Don't let the tools get in the way of sharing insights!

## Uploading Materials
- **Markdown Notes:** Preferred for discussion summaries.
- **Visuals (png, screenshots):** Upload to the `resources/` folder of the respective meeting.
- **Slides (pptx, pdf):** Upload to the `slides/` folder.
- **Recordings (m4, mp4):**
  - Files **under 50MB** can be committed directly to the `recordings/` folder.
  - Files **over 50MB** should be uploaded to our **AWS S3** bucket and linked in the meeting's `notes.md`.

## Workflow for New Members
If you aren't familiar with Git, you can:
1. Upload files directly through the GitHub web interface.
2. Use a "New Issue" to paste notes or links.

## AI Assistance
Feel free to use AI to summarize meetings or format notes, but please include the original prompts in `notes.md` if they added significant value.
```

- [ ] **Step 3: Commit documentation**

```bash
git add README.md CONTRIBUTING.md
git commit -m "docs: add README and CONTRIBUTING"
```

---

### Task 3: Templates & Initial Docs

**Files:**
- Create: `templates/meeting-notes-template.md`
- Create: `templates/discussion-template.md`
- Create: `templates/ai-prompts-template.md`
- Create: `docs/glossary.md`
- Create: `docs/design-principles.md`
- Create: `docs/ai-workflow-ideas.md`
- Create: `meetings/meeting-01/notes.md`

- [ ] **Step 1: Create meeting templates**

(Meeting Notes Template)
```markdown
# Meeting Notes: [Topic]
**Date:** [YYYY-MM-DD]
**Facilitator:** [Name]

## High-Level Summary
[3-5 sentences]

## Discussion Points
- [Point 1]
- [Point 2]

## Action Items
- [ ] [Item 1]

## Resources
- [Slides](slides/)
- [Recording](recordings/)
```

- [ ] **Step 2: Create initial docs**

(Glossary, Principles, etc. as empty/starter files)

- [ ] **Step 3: Create Meeting 01 Notes (Starter)**

```markdown
# Meeting 01: Initial Setup & Vision
**Date:** 2026-05-15

## Goal
Kick off the Actionable Philosophy Book Club and establish the repository structure.

## Minutes
- Bootstrapped repository with AI assistance.
- Defined structure for meetings and documentation.
```

- [ ] **Step 4: Commit templates and docs**

```bash
git add templates/ docs/ meetings/meeting-01/notes.md
git commit -m "feat: add templates and initial meeting notes"
```

---

### Task 4: GitHub Repository Creation (Optional/Final)

**Files:**
- N/A

- [ ] **Step 1: Create remote repository via gh cli**

Run: `gh repo create actionable-philosophy-book-club --public --source=. --remote=origin --push`
Expected: Repository created on GitHub and local changes pushed.

- [ ] **Step 2: Verify GitHub URL**

Run: `gh repo view --web`
Expected: Browser opens the new repository page.
