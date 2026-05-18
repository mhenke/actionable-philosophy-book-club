# Content Contract

This document defines the expected format for meeting notes and materials. Adhering to these conventions ensures the dashboard renderer and automated tooling work correctly.

## Markdown Heading Requirements

The dashboard uses specific heading names as markers for rendering. **Heading names are case-insensitive but the specific text must match exactly.**

### Required Heading: `## Meeting Materials`

> **Important:** The exact heading `## Meeting Materials` (case-insensitive) is required for the file-tree renderer. Any other heading (e.g., `## Materials`, `## Resources`) will produce a plain unformatted list.

The dashboard looks for this heading and transforms the list beneath it into a styled file tree with icons.

**What you write:**
```markdown
## Meeting Materials
- [recordings/](recordings/)
  - [01-governance.mp4](recordings/01-governance.mp4) (Displayed as "Video Recap")
  - [01-governance-alt.mp4](recordings/01-governance-alt.mp4) (Displayed as "Video Recap Alt")
- [slides/](slides/)
  - [01-slides.pptx](slides/01-slides.pptx)
```

**What the reader sees:**
A styled, expandable tree view with folder icons and file descriptors.

### Why the heading name matters
- **If you use `## Recap` instead:** The file list renders as plain text, not a styled tree
- **If you use `## Materials`:** Same—the renderer won't recognize it
- **If you use `## session materials` (lowercase in markdown):** Still works (matching is case-insensitive)

### Other common headings (no special behavior)
- `## Discussion Points` — rendered as regular prose
- `## Action Items` — rendered as regular prose
- `## Key Takeaways` — rendered as regular prose
- `## Next Steps` — rendered as regular prose

These headings have no automated behavior; they're just readable structure for humans.

**Empty section rule:** If a section has no content, either omit the heading entirely or write `None.` as the body. Never leave a heading with no content beneath it — it renders as a hanging label with nothing below it.

---

## Asset Link Format

Links in **Meeting Materials** must be:
1. **Relative to the README file location**, not absolute
2. **Point to actual files** that exist in the repository

### Valid examples
```markdown
[recordings/01-video.mp4](recordings/01-video.mp4)
[../slides/01-deck.pptx](../slides/01-deck.pptx)
[../resources/diagram.png](../resources/diagram.png)
```

### Invalid examples (will break the link checker)
```markdown
[https://github.com/mhenke/actionable-philosophy-book-club/raw/main/meetings/meeting-01/recordings/01-video.mp4](...) ← too long
[recordings/VIDEO_NOT_UPLOADED.mp4](...) ← file doesn't exist
[../missing.mp4](...) ← file doesn't exist
```

---

## File Organization

Each meeting folder must follow this structure:

```
meetings/meeting-NN/
├── README.md              ← contains meeting notes and Section Materials
├── recordings/
│   └── NN-*.mp4          ← video recap file(s)
├── slides/
│   └── NN-*.pptx         ← presentation file(s)
└── resources/
    └── *.png|.jpg        ← supporting images or diagrams
```

---

## Link Rewriting Behavior

The dashboard automatically rewrites relative markdown links to use the hash-based router. For example:

**In your README:**
```markdown
[Deep Design Principles](../philosophy.md)
```

**In the rendered reader view:**
```markdown
<a href="#p=docs/philosophy.md">Deep Design Principles</a>
```

This ensures that clicking links from within a meeting note navigates within the dashboard without page reloads.

**Important:** This rewriting only happens for `.md` files. Other file types (`.mp4`, `.pptx`, `.png`) download or open directly.

---

## Asset Manifest Files (`asset-manifest.json`)

Each meeting directory may contain an `asset-manifest.json` file written by `rename_asset.sh` when alternate asset variants are organized.

This file is a provenance log — it is not read by `index.html`. The dashboard reads only the `MEETINGS` array in `index.html`. The manifest does not need to match `index.html` and is not validated by CI.

Schema:

```json
{
  "<target-filename>": {
    "variant": "alternate",
    "source_filename": "<original-filename>"
  }
}
```

---

## Special Characters & URL Safety

Heading and file names should:
- Use alphanumerics, hyphens, and underscores
- Avoid spaces (use hyphens instead: `01-my-meeting.md`)
- Avoid special characters (`@`, `!`, `~`, etc.)

This keeps URLs clean and prevents encoding issues on older systems.

---

## Content Security

All Markdown content is sanitized before rendering:
- `<script>` tags are removed (XSS protection)
- `onclick`, `onerror`, `onload` attributes are stripped
- `<iframe>`, `<embed>`, `<form>`, `<object>` tags are forbidden
- `style` attributes are removed (inline styles blocked)

You can write HTML in Markdown if needed, but dynamic content will be stripped. Use plain Markdown for compatibility.

---

## Testing Your Content

Before pushing, run the link checker to ensure all paths resolve:

```bash
# Uses grep to verify #p= paths and asset hrefs exist
npm run test:links
```

The GitHub Actions CI pipeline also runs this check on every push.

---

## Dashboard Manifest Fields

The manifest lives at **`docs/manifest.json`** and is loaded at runtime. Add new meetings at the top of the `meetings` array (newest first). Change the previous upcoming entry's `status` from `'upcoming'` to `'done'` when rotating meetings.

### Required fields
- `id` — `'meeting-NN'` matching the directory name
- `session` — display label e.g. `'Meeting 01'`
- `date` — display date e.g. `'01 May 2026'` (full four-digit year)
- `title` — short session title
- `status` — `'done'` | `'upcoming'` | `'draft'`
- `color` — **only** `'spectrum-1'`, `'spectrum-2'`, or `'spectrum-3'` (other values silently break card styling)
- `wash` — CSS variable name: `'--wash-1'` through `'--wash-5'`
- `readmeUrl` — relative path e.g. `'meetings/meeting-01/README.md'`

### Optional fields
- `keyTakeaway` — plain-text string. When present on an `upcoming` meeting, renders as a highlighted quote block on the dashboard card below the asset rows. Omit for archive/draft meetings (has no effect). Example:
  ```json
  "keyTakeaway": "A well-designed module is a complexity sink: it takes on internal implementation suffering so the rest of the system can stay simple."
  ```

### Asset fields
- `video` — `{ file, label, duration, fileSize }` or `null` for upcoming/no-recording
- `slides` — `{ file, label, fileSize }` or `null`
- `podcasts` — array of `{ type, label, file, duration, fileSize }` where `type` is one of:
  - `'deep-dive'` — 🔬 badge, steel blue
  - `'critique'` — 🔍 badge, navy
  - `'debate'` — ⚔️ badge, medium blue
  - `'alternate'` — 🎬 badge, alternate recording (appears in the podcast disclosure, not primary rows)
- `resources` — array of `{ label, file, fileSize }` for PNG/image thumbnails shown in cards

### Asset copy registry
`assetCopy` is a top-level manifest object used by the dashboard runtime for podcast labels and descriptions.

The runtime treats it as a source of truth where values exist, but missing or partial entries fall back to built-in defaults per type. Unknown podcast kinds still use the existing safe fallback behavior.

---

## Agenda Link Conventions

Links in the `## Agenda` section of a meeting README must follow a consistent pattern so the reader view and dashboard vocabulary stay aligned.

### Rules

1. **End-appended, never inline.** The link follows the agenda item description. It does not replace the descriptive text or appear mid-sentence.
2. **Labels match the dashboard.** Use the same label the manifest assigns to the asset. Do not use the video's descriptive subtitle as the link text.
3. **No em dashes before links.** Append the link directly after the sentence ends, or after a period.

### Canonical labels

| Asset type | Link label |
|---|---|
| Video recording | `Video Primer` |
| Slide deck | `Slides` |
| Resource image | The image's title (e.g., `Choose Your Adventure`) |

Podcast badge labels (e.g. `Deep Dive`, `Critique`) are sourced from the `assetCopy` registry in the manifest.

### Template

```markdown
1. **Refresher Video (5-10 min):** One-sentence description of what it covers. [Video Primer](recordings/NN-filename.mp4)
2. **Discussion (30 min):** One-sentence description of the discussion focus. [Slides](slides/NN-filename.pptx)
3. **Wrap-up (Last 10 min):**
   - **Future Planning:** Brief description. [Resource Title](resources/NN-filename.png)
```

### Why

The dashboard asset rows display "Video Primer" and "Slides" (from manifest labels). Using different vocabulary in the agenda (e.g., the video's full subtitle) creates a mismatch — a user sees one name on the card and a different name in the notes for the same file.

---

## Questions?

If a heading or link structure isn't working as expected:
1. Check the exact spelling of the heading (case doesn't matter, but punctuation does)
2. Verify all asset paths are relative and point to files that exist
3. Run the link checker locally before pushing
4. Open an issue with the file path and what behavior you expected
