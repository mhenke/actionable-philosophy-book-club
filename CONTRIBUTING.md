# Contributing to Actionable Philosophy Book Club

We value participation over perfect formatting. Our goal is to share knowledge and improve our craft together.

## 📁 Repository Organization
- **Meetings:** Each meeting has its own folder in `meetings/` (e.g., `meeting-01/`).
- **Notes:** The primary notes for each meeting are located in its `README.md`.
- **Assets:** Slides go in `slides/`, recordings in `recordings/`, and images/diagrams in `resources/`.

## ⬆️ Uploading Materials
- **Format:** Markdown is preferred for notes and summaries.
- **Visuals:** Place images, diagrams, or other visual assets in the `resources/` directory.
- **Slides:** Upload presentation slides to the `slides/` directory.

## 📦 Large File Policy
- **Files < 50MB:** Commit directly to the repository.
- **Files > 50MB:** Do not commit to git. Use the **`asset-compressor`** skill to shrink them first.
- **Persistent Large Files:** If a file cannot be shrunk below 50MB, upload it to AWS S3 and provide a link in the relevant meeting's `README.md`.

## ➕ How to Add a New Meeting

Follow these steps in order when a new session is ready.

### 1. Create the meeting folder

```
meetings/meeting-NN/
├── README.md          ← required (see template below)
├── slides/            ← upload .pptx here
├── recordings/        ← upload .mp4 here
└── resources/         ← images, diagrams
```

Copy `templates/meeting-README-template.md` to `meetings/meeting-NN/README.md` and fill it in.

### 2. Write the README — heading names matter

The dashboard renderer looks for specific section headings. **Use these exactly:**

| Heading | Purpose | What happens if you change it |
|---|---|---|
| `## Session Materials` | Triggers the file-tree renderer | Plain text list instead of styled tree |
| `## Discussion Points` | Standard prose section | No special behaviour |
| `## Action Items` | Renders as task list checkboxes | No special behaviour |

Links inside `## Session Materials` must be relative to the README file:
```markdown
## Session Materials
- [recordings/](recordings/)
  - [NN-video-title.mp4](recordings/NN-video-title.mp4)
- [slides/](slides/)
  - [NN-slide-title.pptx](slides/NN-slide-title.pptx)
```

### 3. Add the meeting to the dashboard manifest

Open `index.html` and find the `const MEETINGS = [...]` block near the top of the `<script>` section. Add a new entry **at the top of the array** (newest first):

```js
{
    id: 'meeting-NN',
    session: 'Session NN',
    date: 'DD Mon YY',
    title: 'Your Session Title',
    status: 'upcoming',          // change to 'done' after the session
    color: 'spectrum-2',         // pick a spectrum stop: spectrum-1 through spectrum-3
    wash: '--wash-2',            // match the number: wash-1, wash-2, or wash-3
    readmeUrl: 'meetings/meeting-NN/README.md',
    video:  { file: 'meetings/meeting-NN/recordings/NN-video-title.mp4',  label: 'Video Recap', variant: 'canonical' },
    slides: { file: 'meetings/meeting-NN/slides/NN-slide-title.pptx',     label: 'Slide Deck', variant: 'canonical' }
},

```

Change the previous "upcoming" session entry's `status` from `'upcoming'` to `'done'`.

### 4. Construct the Slide Deck viewer URL (Office Online)

The "View" link for slides uses Microsoft Office Online. The URL pattern is:

```
https://view.officeapps.live.com/op/view.aspx?src=https://raw.githubusercontent.com/mhenke/actionable-philosophy-book-club/master/PATH_TO_FILE
```

Replace `PATH_TO_FILE` with the relative path from the repo root, e.g.:
```
meetings/meeting-NN/slides/NN-slide-title.pptx
```

This URL is set automatically from the `slides.file` field in the manifest — you do not need to edit it manually in multiple places.

### 5. Run the link checker before pushing

```bash
bash tests/check-links.sh
```

This confirms every `#p=` path and asset link in `index.html` resolves to a real file.

---

## 🆕 Workflow for New Members
If you are new to GitHub or the command line, you can use these low-ceremony alternatives:
- **GitHub Web UI:** Edit or create files directly in your browser.
- **New Issue:** Post your notes or ideas as a new GitHub Issue, and a maintainer will help integrate them.

## 🤖 AI Assistance
AI-generated summaries and insights are encouraged!
- Please include the prompts used if you believe they add value or help others reproduce the result.
- Ensure you review AI output for accuracy before sharing.
