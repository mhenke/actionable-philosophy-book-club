# Design: Meeting Materials File Tree — Folder UX

Date: 2026-05-18
Author: Copilot

Summary

Make folder entries in the Meeting Materials file tree inert (non-clickable). If a folder contains a README.md, list that README as a normal file entry beneath the folder (nested list). Do not make folder headings navigable or toggleable. This keeps folder structure predictable and avoids surprising navigation to an empty reader page.

Problem

Current behavior: some folders act like links (open reader), others do not. This is inconsistent and confuses readers who expect files to be actionable and folders to be structural.

Decision

Folders are structural only. Files (including README.md) are actionable. If a folder includes README.md, expose README.md as a child file entry so authors who want folder-level content place a README and users will see it as a file to open.

Approach

- When post-processing `## Meeting Materials` lists, ensure every `li` that represents a folder is rendered as a non-interactive label (no href).
- If the folder's nested UL contains an explicit README.md list item (or the parser can detect a link ending with `README.md`), leave that child as a normal file link so it opens in the reader.
- Do NOT map trailing-slash folder links to #p=README.md. (This was attempted previously and causes surprise navigation.)
- Keep nested lists visible by default (no expand/collapse behavior).

Accessibility

- Folder labels: role="group" or use semantic `li` with no anchor; include visually-hidden text to announce "folder" where helpful.
- File links: preserve existing anchor behavior (`#p=` routing for .md, Office viewer for pptx, open assets in new tab).
- Keyboard users: file links remain tabbable; folder labels are not tabbable.

Testing

- Unit/E2E: render sample README with folder links and file links; verify folder labels are not clickable and README appears as a child file.
- Playwright: click every visible anchor under Meeting Materials and assert that only file links trigger reader opens; assert no anchors on folder labels.
- Link checker: ensure no auto-generated broken #p= links are produced.

Docs

- Update CONTRIBUTING.md templates and meeting README guidance to recommend adding README.md inside folders for folder-level content.

Rollback

- Revert the commit that changes `dist/app.js` if unintended behavior appears.


