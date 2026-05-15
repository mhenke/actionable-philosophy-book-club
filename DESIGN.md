# Design

## Theme
Physical Scene: An engineer standing on a train platform at 8:00 AM, looking at their phone in bright morning light, trying to quickly download the latest podcast episode before their commute begins.

## Colors
- **Strategy:** Restrained (with high-contrast accents for utility)
- **Primary (Accent):** `oklch(65% 0.15 250)` (A technical, engaging blue)
- **Neutral (Surface):** `oklch(98% 0.005 250)` (Light mode primary for high-visibility)
- **Neutral (Text):** `oklch(20% 0.01 250)` (Deep indigo-tinted dark gray)
- **Status (Done):** `oklch(70% 0.12 145)` (Clear, value-driven green)

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
