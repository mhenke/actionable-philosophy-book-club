# 📖 Actionable Philosophy Book Club

A low-friction repository for the **Actionable Philosophy Book Club**, focusing on software design philosophy and AI-assisted engineering.

---

<p align="center">
  <img src="docs/resources/book-cover.jpg" width="400" alt="A Philosophy of Software Design by John Ousterhout">
</p>

---

## 🚀 Interactive Dashboard
For the best experience, including mobile-optimized navigation, meeting agendas, and instant slide previews, visit our dashboard:

**[View the High-Fidelity Dashboard &rarr;](https://mhenke.github.io/actionable-philosophy-book-club/)**

---

## 📂 Repository at a Glance

*   **[`meetings/`](meetings/)**: Historical notes, slides, and video recaps for every session.
*   **[`docs/`](docs/)**: Design principles, glossary, and architectural decisions.
*   **[`templates/`](templates/)**: Scaffolding for new meetings and AI prompt templates.
*   **[`asset-compressor/`](asset-compressor/)**: Custom AI tool for optimizing repository media.

## 🤖 AI-Assisted Workflows
We leverage AI to sharpen our craft. Use our [Prompt Templates](templates/prompts/) to extract insights, and the [Asset Compressor Skill](asset-compressor.skill) to both compress media files and automatically extract file metadata for the dashboard.

## 💻 Local Development

### Preview locally
```bash
# Start a local web server (required for fetch() to work)
python3 -m http.server 8000

# Open browser to http://localhost:8000
```

> **Note:** `file://` URLs block fetch(). Use a local server instead. We also include a `.nojekyll` file in the root to ensure GitHub Pages correctly serves our single-page application without Jekyll processing.

### Run tests
```bash
# Install dependencies once
npm install

# Run all tests (starts server automatically)
npm test

# View test results
npx playwright show-report
```

Tests verify XSS prevention, path validation, routing, and caching behavior.

## 🛠 Contributing
We value **content over ceremony**. See [CONTRIBUTING.md](CONTRIBUTING.md) for details on uploading materials and staying under the 50MB file limit.

### Managing Asset Metadata
After adding or updating media files (videos, slides, podcasts, images), extract and update the manifest with file metadata:

```bash
# Extract duration and file size for all assets, patch docs/manifest.json
python3 scripts/extract_metadata.py --patch docs/manifest.json

# Rebuild the JS bundle to inline the updated manifest
npm run build:js
```

This updates the meetings manifest with:
- **Duration** (seconds) for videos and audio files
- **File size** (MB) for videos, slides, podcasts, and resource images

The manifest data is inlined into `dist/app.js` at build time. The dashboard reads the inlined data synchronously — no fetch required.

**Supported formats:**
- Video (MP4): duration + fileSize
- Slides (PPTX): fileSize
- Podcasts (M4A): duration + fileSize
- Resources (PNG/JPG): fileSize

See the [asset-compressor skill](asset-compressor.skill) for full compression and metadata extraction capabilities.

## 📐 Architecture Decision Records

Key decisions affecting day-to-day contribution:

- **[ADR-0002](docs/adr/0002-single-page-reader.md)** — Single-Page Reader Architecture
- **[ADR-0008](docs/adr/0008-behavior-first-test-strategy.md)** — Behavior-First Test Strategy
- **[ADR-0010](docs/adr/0010-manifest-fetch-resilience.md)** — Manifest Fetch Resilience

Full list: **[docs/adr/](docs/adr/)**
