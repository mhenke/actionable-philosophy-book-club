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

## 🆕 Workflow for New Members
If you are new to GitHub or the command line, you can use these low-ceremony alternatives:
- **GitHub Web UI:** Edit or create files directly in your browser.
- **New Issue:** Post your notes or ideas as a new GitHub Issue, and a maintainer will help integrate them.

## 🤖 AI Assistance
AI-generated summaries and insights are encouraged!
- Please include the prompts used if you believe they add value or help others reproduce the result.
- Ensure you review AI output for accuracy before sharing.
