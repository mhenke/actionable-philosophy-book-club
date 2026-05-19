# GEMINI.md

## Project Overview
A high-utility, mobile-first dashboard and reader for the **Actionable Philosophy Book Club**. This project serves as a central hub for session agendas, video recaps, slide decks, and discussion podcasts, focusing on software design philosophy (primarily *A Philosophy of Software Design* by John Ousterhout).

The project is built as a "Zero Ceremony" static SPA, meaning it requires no complex build pipeline to function. It is designed to be hosted on GitHub Pages and remains fully functional even without `npm` installed (though `npm` is used for validation and optimization).

## Tech Stack
- **Core:** Vanilla JavaScript, HTML5, CSS3.
- **Styling:** Tailwind CSS (v3) via CLI.
- **Testing:** Playwright for E2E, XSS, and routing verification.
- **Fonts:** System font stack (Swiss/International Style) for zero-latency rendering.
- **Utilities:** FFmpeg-based compression scripts (`asset-compressor/`), Python simple server for local preview.

## Core Architecture
The application logic is driven by a central **MEETINGS manifest** in `docs/manifest.json`. This manifest defines:
- **Session Metadata:** Title, date, status (`upcoming` vs `done`).
- **Asset Links:** Paths to `README.md`, video recordings, and slide decks.
- **UI Theming:** Spectrum colors (`spectrum-1` through `spectrum-6`) and background washes.

The UI is divided into two main modes:
1.  **Dashboard Mode:** A high-density grid of meeting cards.
2.  **Reader Mode:** A focused markdown reader that fetches meeting `README.md` files and renders them as prose.

## Building and Running

### Local Development
```bash
# Start a local web server (required for fetch() to work)
python3 -m http.server 8000
```
Open `http://localhost:8000` in your browser. Note: `file://` URLs will not work due to CORS restrictions on `fetch()`.

### Build Commands
```bash
# Optimize CSS (Minifies Tailwind into dist/tailwind.css)
npm run build:css

# Build JS bundle (inlines manifest from docs/manifest.json, minifies src/ modules into dist/app.js)
npm run build:js

# Run Playwright tests
npm test
```

## Development Conventions

### Aesthetic Vision (Swiss/International Style)
- **Functional Minimalism:** No decorative type, no side-stripe borders, no gradient text.
- **Weight Contrast:** Hierarchy is achieved through bold/light weights rather than color or excessive size.
- **Line Length:** Capped at **75ch** for legibility.
- **Colors:** OKLCH-based palette centered around `#F7F7F7` (Background) and `#222222` (Charcoal).

### Terminology
- **Canonical Label:** Use "Video Recap" for session recordings.
- **Alternate Labels:** Use "Video Recap Alt" for secondary recordings.

### Asset Management
- **Size Limit:** No single file should exceed **50MB**.
- **Compression:** Use the scripts in `asset-compressor/` (FFmpeg) to shrink recordings and slides before committing.
- **Directory Structure:**
  - `meetings/meeting-NN/`
    - `README.md` (Main agenda/notes)
    - `slides/` (.pptx files)
    - `recordings/` (.mp4 files)
    - `resources/` (Images/diagrams)

## Contribution Workflow
1.  Create a new meeting directory following the standard structure.
2.  Populate the `README.md` using the template in `templates/`.
3.  Add a new entry to the `meetings` array in `docs/manifest.json` (newest first).
4.  Run `npm run build:js && npm test` to rebuild the JS bundle and verify integrity.

## Key Files
- `index.html`: Main SPA shell (inline CSS in `<style>`, static sections like Knowledge Base).
- `docs/manifest.json`: Canonical meeting data manifest (inlined into `dist/app.js` at build time).
- `src/`: JS source modules (00-setup.js through 06-app.js) concatenated into `dist/app.js` via `npm run build:js`.
- `PRODUCT.md` / `DESIGN.md`: High-level product and aesthetic goals.
- `asset-compressor/`: Authoritative FFmpeg scripts for asset optimization.
- `docs/adr/`: Architectural Decision Records (e.g., Office Online for PPTX viewing).
