# Additional Resources — Design

Date: 2026-05-17
Author: Copilot (brainstorming)

Summary

Add an "Additional Resources" qualifier to asset summary disclosures so the summary reads:

<span class="asset-link"><span class="icon-pill" aria-hidden="true">📦</span>Additional Resources: 1 Video · 3 Podcasts</span>

This keeps the existing icon-pill visual affordance, makes the scope explicit, and provides a stable accessible label.

HTML pattern

Use the same structure as existing summaries, with the icon-pill aria-hidden and visible text immediately following it:

<summary>
  <span class="asset-link">
    <span class="icon-pill" style="background:var(--wash-3-border);" aria-hidden="true">📦</span>
    Additional Resources: 1 Video · 3 Podcasts
  </span>
  <svg class="podcast-chevron" ...></svg>
</summary>

Accessibility

- Keep the icon-pill aria-hidden so screen readers do not announce emoji.
- The visible text ("Additional Resources: ...") acts as the accessible label for the disclosure.
- Ensure any concatenation logic that generated podcastSummary/resource summaries strips leading/trailing emoji before escaping (see existing plans for podcast-summary sanitization).

Where to change

- Primary implemention point: buildAssetRows in dist/app.js where podcastSummary and resourceStrip are assembled (search for `podcast-disclosure`, `podcastSummary`, `resourceStrip`).
- Update the string builder to prepend the literal label `"Additional Resources: "` to the summary when resource counts are present.

Tests

- Playwright: assert that disclosure summary text begins with `Additional Resources:` and that the visible text contains counts formatted like `"1 Video · 3 Podcasts"`.
- Ensure there are no duplicate emoji glyphs in the visible summary (only the icon-pill emoji should be visible).

Rollout

1. Add design doc and commit.
2. Implement minimal change in buildAssetRows: prepend label when non-primary resources exist; sanitize emoji in summary construction.
3. Run Playwright tests and update any expectations.

Notes

- Label choice: "Additional Resources" chosen for clarity and translatability.
- Keep visual style and icon-pill tokens (`--wash-*-border`) consistent with existing asset pills.
