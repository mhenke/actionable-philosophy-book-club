# Loading Skeleton Design

Date: 2026-05-18
Author: Copilot

## Summary

Replace the refresh-time loading flash with detailed skeletons for both the dashboard and the reader. The skeletons should mirror the final page structure closely enough that refresh feels intentional, not empty or shifting.

## Problem

On refresh, the dashboard briefly shows a partially built page before the cards and sections finish rendering. The screenshot shows the top banner plus section headers, but the main body content is not yet present, so the page feels collapsed and unstable. The reader also needs a loading state that matches the content it will eventually show.

## Decision

Render detailed skeletons for both modes:

- **Dashboard**: section-accurate skeleton for the entire page, including the upcoming card, Coming Up, Past, and Knowledge Base.
- **Reader**: detailed article-outline skeleton with title, metadata, section headings, paragraph blocks, and list blocks.

The skeletons should be structurally faithful to the final UI, not generic gray placeholders.

## Dashboard Skeleton

The dashboard skeleton should preserve the final section order and page rhythm:

1. Header bar and spectrum rule remain unchanged.
2. Upcoming card renders a detailed shell with:
   - session metadata line
   - title block
   - primary asset rows
   - key takeaway block
   - CTA area
   - podcast disclosure stub
3. Coming Up and Past render card-shaped placeholders that match the final archive/card grid heights.
4. Knowledge Base renders tile-shaped placeholders with icon and label slots so the lower grid does not collapse.

The skeleton should reflect the current manifest’s section density so the layout stays believable while data loads.

## Reader Skeleton

The reader skeleton should look like an in-progress article:

- title block
- metadata line
- a few section headings
- paragraph-line blocks
- a list block

This should feel like a document loading, not a dashboard placeholder. It stays separate from the dashboard skeleton, but uses the same principle of structural fidelity.

## Data Flow

1. On refresh, render skeletons immediately.
2. Load manifest and markdown data.
3. Replace skeletons in place with real content.
4. Keep section order and container sizes stable during the swap.

## Error Handling

- If manifest loading fails, keep the dashboard state explicit instead of collapsing to an empty shell.
- If reader loading fails, keep the existing reader error path, but avoid visual snapping between loading and error states.

## Testing

- Add dashboard refresh coverage that checks the skeleton appears before cards and that the real dashboard replaces it without collapsing the page.
- Add reader coverage that verifies the outline skeleton appears while markdown is loading.
- Confirm the detailed skeleton matches the final section order and does not alter the reader behavior.
