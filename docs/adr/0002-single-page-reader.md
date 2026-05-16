# ADR 002: Single-Page Markdown Reader vs. Jekyll

## Status
Accepted — Partially superseded by ADR-0003 (2026-05-16)

The "Zero Ceremony / No Pipeline" principle applies to the deployed site, which remains a single HTML file requiring no server-side build. ADR-0003 introduced npm-based tooling for CI validation only (tests, CSS build, link checking). The site functions for end users without npm; npm is required only for contributors running tests or building CSS.

## Context
Initially, we implemented a Jekyll-based approach to style meeting subpages (e.g., `meetings/meeting-02/`). While effective for GitHub Pages, this introduced "infrastructure ceremony" to the repository in the form of `_layouts/` and `_config.yml` files. Our core mandate is **"Zero Ceremony"** and **"No Pipeline."**

## Decision
We will remove all Jekyll-specific files and implement a **Single-Page Markdown Reader** directly within the root `index.html`. 

## Rationale
1.  **Zero Ceremony:** The repository remains focused purely on content. No hidden build-system files are required.
2.  **Single Source of Truth:** All visual styling, logic, and navigation are centralized in `index.html`. This simplifies maintenance and ensures absolute design consistency.
3.  **Impeccable UX:** By using client-side rendering, we can create smooth transitions between the "Dashboard" and "Reading Room" views, providing a more modern, cohesive experience than full-page reloads.
4.  **Technical Alignment:** This approach honors the "Single File index.html" constraint originally set for the project.

## Implementation Details
- Use **Marked.js** (via CDN) for client-side Markdown to HTML conversion.
- Implement a simple hash-based router (`#p=path/to/file.md`) to handle navigation.
- Dynamic `fetch()` calls will retrieve content from the repository.

## Consequences
- **Positive:** Pristine repository structure; centralized theme management; improved transition aesthetics.
- **Negative:** Dependent on JavaScript for content viewing; URLs use hash/query parameters instead of direct directory paths.
