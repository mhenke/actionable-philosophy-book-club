# Content Contract

This document defines the expected format for meeting notes and materials. Adhering to these conventions ensures the dashboard renderer and automated tooling work correctly.

## Markdown Heading Requirements

The dashboard uses specific heading names as markers for rendering. **Heading names are case-insensitive but the specific text must match exactly.**

### Required Heading: `## Session Materials`

The dashboard looks for this heading and transforms the list beneath it into a styled file tree with icons.

**What you write:**
```markdown
## Session Materials
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

---

## Asset Link Format

Links in **Session Materials** must be:
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
├── README.md              ← contains session notes and Section Materials
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

## Questions?

If a heading or link structure isn't working as expected:
1. Check the exact spelling of the heading (case doesn't matter, but punctuation does)
2. Verify all asset paths are relative and point to files that exist
3. Run the link checker locally before pushing
4. Open an issue with the file path and what behavior you expected

