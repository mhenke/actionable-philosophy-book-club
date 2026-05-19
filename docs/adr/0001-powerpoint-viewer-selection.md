# ADR 001: Choice of PowerPoint Viewer

## Status
Accepted — using **Microsoft Office Online Viewer**

## Context
We need a way for book club members to preview `.pptx` files directly in the browser from the GitHub Pages dashboard. PPTX files are not natively renderable by most browsers. We evaluated two primary options: **Google Docs Viewer** and **Microsoft Office Online Viewer**.

## Decision
We chose the **Microsoft Office Online Viewer** (`https://view.officeapps.live.com/op/view.aspx?src=…`) for all PowerPoint previews.

## Rationale
While Google Docs Viewer is lighter and loads approximately 2x faster, we prioritized **fidelity** and **design accuracy**.

1.  **Rendering Accuracy:** Microsoft provides the "Gold Standard" for PPTX rendering.
2.  **Professional Polish:** Broken layouts or missing fonts in the Google viewer would degrade the learning experience.
3.  **CSP alignment:** The Microsoft viewer works cleanly with `frame-src https://view.officeapps.live.com` in our Content Security Policy.

## Consequences
- **Positive:** High-fidelity rendering of all PowerPoint slides.
- **Negative:** Slower initial load compared to Google Docs Viewer, especially on mobile.
- **CSP note:** Only `https://view.officeapps.live.com` is allowed as a framed origin — no other viewers are permitted without CSP changes.
