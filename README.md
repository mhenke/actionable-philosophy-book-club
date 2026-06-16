# Actionable Philosophy Book Club

This repo hosts the Actionable Philosophy Book Club, where we read *A Philosophy of Software Design* and talk about how its ideas show up in AI-assisted engineering.

---

<p align="center">
  <img src="docs/resources/book-cover.jpg" width="400" alt="A Philosophy of Software Design by John Ousterhout">
</p>

---

## Interactive dashboard

The dashboard is the easiest way to browse agendas, recordings, and slide previews on any device:

**[View the dashboard &rarr;](https://mhenke.github.io/actionable-philosophy-book-club/)**

---

## What's in this repo

*   **[`meetings/`](meetings/)**: Notes, slides, and video recaps from every session.
*   **[`docs/`](docs/)**: Design principles, glossary, and architectural decisions.
*   **[`templates/`](templates/)**: Scaffolding for new meetings and AI prompt templates.
*   **[`skills/asset-compressor/`](skills/asset-compressor/)**: Tool for shrinking PDFs, MP4s, PPTX files, and images before committing them.
*   **[`skills/vocabulary-audit/`](skills/vocabulary-audit/)**: Tool for spotting hidden semantic coupling between services.

## AI-assisted workflows

We use AI to do better work, not more busywork. Use the [prompt templates](templates/prompts/) to pull insights out of transcripts, and the [asset compressor skill](skills/asset-compressor/) to keep media files small. Install skills with `npx skills add mhenke/actionable-philosophy-book-club`.

## Local development

### Build the JS bundle

```bash
npm run build:js
```

`dist/app.js` is generated from source and manifest data, so rebuild it after either one changes.

### Preview locally

```bash
# A local server is required because fetch() doesn't work with file:// URLs
python3 -m http.server 8000

# Then open http://localhost:8000
```

> **Note:** We include a `.nojekyll` file so GitHub Pages serves the single-page app without running Jekyll on it.

### Run tests

```bash
npm install
npm test
npx playwright show-report
```

Tests cover XSS prevention, path validation, routing, and caching.

## Contributing

We care more about good content than perfect process. See [CONTRIBUTING.md](CONTRIBUTING.md) for how to upload materials and stay under the 50 MB file limit.

### Updating asset metadata

After adding or changing media files, run the metadata extractor to patch `docs/manifest.json`:

```bash
python3 scripts/extract_metadata.py --patch docs/manifest.json
npm run build:js
```

This writes duration and file size into the manifest:

- **Video (MP4):** duration + fileSize
- **Slides (PPTX):** fileSize
- **Podcasts (M4A):** duration + fileSize
- **Resources (PNG/JPG):** fileSize

The dashboard reads this data straight from the built bundle, so no extra fetch is needed.

See the [asset-compressor skill](skills/asset-compressor/) for compression and metadata extraction details, and the [vocabulary-audit skill](skills/vocabulary-audit/) if you want to check for hidden coupling.

## Architecture decision records

Decisions that affect day-to-day contribution:

- **[ADR-0002](docs/adr/0002-single-page-reader.md)**: Single-page reader architecture
- **[ADR-0008](docs/adr/0008-behavior-first-test-strategy.md)**: Behavior-first test strategy
- **[ADR-0010](docs/adr/0010-manifest-fetch-resilience.md)**: Manifest fetch resilience

Full list: **[docs/adr/](docs/adr/)**
