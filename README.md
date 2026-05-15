# 📖 Actionable Philosophy Book Club

A low-friction repository for the **Actionable Philosophy Book Club**, focusing on "A Philosophy of Software Design" and AI-assisted engineering.

---

## 📅 Meeting Dashboard

| Meeting | Topic | Materials | Status |
| :--- | :--- | :--- | :--- |
| **[00](meetings/meeting-00/)** | **Kickoff & Goals** | [Slides](meetings/meeting-00/slides/) / [Video](meetings/meeting-00/recordings/) | ✅ Done |
| **[01](meetings/meeting-01/)** | **Deep Systems & Complexity** | [Slides](meetings/meeting-01/slides/) / [Video](meetings/meeting-01/recordings/) | 📅 Next |
| **[02](meetings/meeting-02/)** | **[TBD]** | [Resources](meetings/meeting-02/resources/) | ⏳ Scheduled |
| **[03](meetings/meeting-03/)** | **[TBD]** | - | ⏳ Scheduled |
| **[04](meetings/meeting-04/)** | **[TBD]** | - | ⏳ Scheduled |
| **[99](meetings/meeting-99-new/)** | **Unsorted Resources** | [Media](meetings/meeting-99-new/recordings/) | 📂 Inbox |

---

## 📂 Repository Roadmap

*   **[`meetings/`](meetings/)**: The heart of the repo. Each folder contains a `README.md` with notes, slides, and recordings for that session.
*   **[`templates/`](templates/)**: 
    *   [`meeting-README-template.md`](templates/meeting-README-template.md): Use this for new meeting folders.
    *   [`prompts/`](templates/prompts/): AI prompts for generating summaries and insights.
*   **[`docs/`](docs/)**: Strategic documents, principles, and a project glossary.
*   **[`asset-compressor/`](asset-compressor/)**: A custom skill for Gemini CLI to help keep repo size down by shrinking PDFs and Videos.

---

## 🤖 AI-Assisted Workflows

We use AI to summarize discussions and optimize materials.

### 1. Compression Skill
If you have large slides or recordings, use the **`asset-compressor`** skill.
1. Install: `gemini skills install asset-compressor.skill`
2. Usage: Ask the CLI to *"Compress the videos in meeting-02"*

### 2. Prompt Templates
Visit [`templates/prompts/`](templates/prompts/) for optimized prompts that help:
*   Extract **non-obvious insights** from meeting notes.
*   Identify **five essential questions** for any chapter.
*   Structure **slide deck summaries**.

---

## 🛠 Contributing
1. **Low Ceremony:** We value content over formatting.
2. **File Limits:** Try to keep files under **50MB**. If they are larger, use the compression skill or link to an external S3 bucket.
3. **Async First:** If you can't make a meeting, contribute your thoughts to the `README.md` or start a Discussion.

See [CONTRIBUTING.md](CONTRIBUTING.md) for more details.
