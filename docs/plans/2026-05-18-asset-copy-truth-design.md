# Design: Asset Copy Single Source of Truth

Date: 2026-05-18
Author: Copilot

## Summary

Move asset-type copy out of `dist/app.js` into shared data so the renderer does not hardcode human wording. Keep dashboard/runtime copy separate from README/agenda copy, but make each surface read from one registry so labels do not drift.

## Problem

Today the runtime bundle owns strings like the `deep-dive` tooltip/title, while the manifest owns meeting asset data and the README templates own agenda wording. That spreads one vocabulary across multiple files and makes copy drift easy. The result is already visible: the browser showed stale or mismatched wording even when the asset type itself was correct.

## Decision

Use **two separate sources of truth**:

1. **Runtime asset copy registry** for dashboard rendering.
2. **Content wording registry** for meeting README and agenda templates.

They stay separate because the dashboard and the authored notes do not need identical phrasing, but each surface should only have one place where its labels are defined.

## Proposed Shape

### Runtime registry

Add a manifest-level registry for asset kinds, keyed by type:

```json
{
  "assetKinds": {
    "alternate": {
      "label": "Video",
      "title": "An alternate recap of the session",
      "icon": "🎬",
      "color": "var(--spectrum-2)"
    },
    "deep-dive": {
      "label": "Deep Dive",
      "title": "A two-host exploration of the session topics",
      "icon": "🔬",
      "color": "var(--spectrum-2)"
    }
  }
}
```

`dist/app.js` should read from this registry when rendering podcast rows, summaries, and tooltips. If a type is missing, it should fall back to the existing conservative default copy rather than crashing.

### Content wording registry

Keep README and agenda guidance in the authored docs layer:

- `docs/content-contract.md`
- `templates/meeting-README-template.md`
- matching meeting READMEs already in the repo

Those docs should define the canonical phrasing for agenda items and Meeting Materials labels, such as `Video Primer` and `Slides`, without sharing the runtime dashboard copy.

## Data Flow

1. `docs/manifest.json` loads at startup.
2. `dist/app.js` reads `assetKinds[type]` for display copy.
3. Meeting READMEs keep using the contract/template wording for human-authored agenda lines.
4. Tests verify that asset type labels come from the registry, not the renderer.

## Error Handling

- Unknown asset type: render a neutral fallback label and title, do not fail the page.
- Missing registry entry: keep the asset visible with its raw type name if needed, but avoid blank labels.
- Docs/templates out of sync: treat that as a content issue, not a runtime error.

## Testing

- Add a Playwright assertion that `deep-dive` renders the registry title, not a hardcoded string.
- Add a check that `alternate` and `deep-dive` still render with the expected icon/label pairing.
- Verify Meeting 02’s file tree still shows nested slides and that asset row copy remains unchanged.

## Migration Notes

- Move any remaining hardcoded asset-type titles out of `dist/app.js`.
- Update `docs/content-contract.md` so it clearly separates dashboard asset copy from README wording.
- Update the meeting README template if it still implies that dashboard labels and agenda labels share one vocabulary.

## Acceptance Criteria

- `dist/app.js` no longer hardcodes asset-type tooltip/title text.
- Dashboard copy for `alternate` and `deep-dive` comes from one registry.
- README/agenda labels remain governed by the docs/templates layer.
- No regression in Meeting Materials tree rendering or asset rows.
