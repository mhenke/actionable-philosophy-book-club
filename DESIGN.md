# Design

## Theme
Physical Scene: An engineer late at night, reading a physical copy of "A Philosophy of Software Design" under a warm desk lamp. The interface should feel like an extension of that physical object—sophisticated, dark-mode first, and authoritative.

## Colors
- **Strategy:** Sophisticated Dark (APoSD Book Palette)
- **Background (Deep Navy):** `oklch(23% 0.05 264)`
- **Surface (Dark Blue):** `oklch(28% 0.08 264)`
- **Text (Off-White):** `oklch(93% 0.01 264)`
- **Text Muted (Cool Gray):** `oklch(67% 0.04 264)`
- **Accent (Warm Amber):** `oklch(73.5% 0.12 85)`
- **Accent Secondary (Steel Blue):** `oklch(45% 0.08 264)`


## Typography
- **Headline Font:** Inter (or system sans-serif) - Bold, tight tracking.
- **Body Font:** Inter - Readable, optimized for mobile screens.
- **Scale:** 1.25 ratio (Major Third) to ensure clear hierarchy on small screens.

## Components
- **Meeting Card:** A compact, high-utility card showing status, topic, and direct-action buttons for Video/Audio/Slides.
- **Asset List:** A structured list with icons for different file types (.mp4, .m4a, .pptx, .md).
- **PowerPoint Viewer:** Use Microsoft Office Online for high-fidelity rendering of slide decks (See [ADR 001](docs/adr/0001-powerpoint-viewer-selection.md)).
- **Sticky Navigation:** A simple top-bar for quick access to the "Inbox" and "Docs".


## Layout
- Single-column flow optimized for mobile.
- Generous vertical rhythm to separate meeting sessions.
- Maximum line length of 65ch for readability.
