# ADR 001: Choice of PowerPoint Viewer

## Status
Accepted

## Context
We need a way for book club members to preview `.pptx` files directly in the browser from the GitHub Pages dashboard. PPTX files are not natively renderable by most browsers. We evaluated two primary options: **Google Docs Viewer** and **Microsoft Office Online Viewer**.

## Decision
We chose the **Microsoft Office Online Viewer** for all PowerPoint previews.

## Rationale
While Google Docs Viewer is lighter and loads approximately 2x faster, we prioritized **fidelity** and **design accuracy**. 

1.  **Rendering Accuracy:** Microsoft provides the "Gold Standard" for PPTX rendering. Every diagram, font choice, and complex layout is guaranteed to look exactly as the author intended.
2.  **Professional Polish:** As a "Technical" and "Value-Driven" club, we value high-quality materials. Broken layouts or missing fonts in the Google viewer would degrade the learning experience.
3.  **Mitigation:** To offset the "heavier" load time of the Microsoft viewer, we use our custom **`asset-compressor`** skill to keep the source files small, ensuring that even the "heavy" viewer remains usable on mobile devices.

## Consequences
- **Positive:** High-fidelity viewing experience; consistent branding; no layout breakage.
- **Negative:** Slightly slower initial load times (~2-3s delay compared to Google); higher RAM usage on mobile devices.
