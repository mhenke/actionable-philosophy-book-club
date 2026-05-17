# ADR 001: Choice of PowerPoint Viewer

## Status
Superseded (2026-05-17) — switched to Google Docs Viewer

## Context
We need a way for book club members to preview `.pptx` files directly in the browser from the GitHub Pages dashboard. PPTX files are not natively renderable by most browsers. We evaluated two primary options: **Google Docs Viewer** and **Microsoft Office Online Viewer**.

## Decision
~~We chose the **Microsoft Office Online Viewer** for all PowerPoint previews.~~

We switched to the **Google Docs Viewer** (`https://docs.google.com/viewer?url=…`).

## Rationale for original decision
While Google Docs Viewer is lighter and loads approximately 2x faster, we prioritized **fidelity** and **design accuracy**.

1.  **Rendering Accuracy:** Microsoft provides the "Gold Standard" for PPTX rendering.
2.  **Professional Polish:** Broken layouts or missing fonts in the Google viewer would degrade the learning experience.

## Rationale for reversal
In practice the Microsoft Office Online Viewer proved **bulky and unreliable** — features were flaky and load times were noticeably worse on mobile. Google Docs Viewer is lighter, faster, and consistent enough for our use case.

## Consequences
- **Positive:** Faster, lighter viewer; more reliable across devices.
- **Negative:** Rendering fidelity may be slightly lower for complex slide layouts.
