# ADR-0005: Markdown Rendering with `marked` + `DOMPurify`

**Status:** Accepted  
**Date:** 2025

## Decision

Use `marked` for client-side markdown parsing and `DOMPurify` for HTML sanitization.

## Alternatives Considered

- `micromark` — smaller but less feature-complete
- `markdown-it` — comparable feature set but larger plugin surface
- Server-side rendering — would require a build step, incompatible with static SPA approach

## Rationale

- `marked` is widely used, well-maintained, and provides GFM support out of the box
- `DOMPurify` is the gold standard for HTML sanitization — critical for XSS prevention in user-authored markdown
- Both are CDN-loadable with SRI integrity hashes (originally from jsDelivr, now self-hosted in `dist/vendor/`)
- DOMPurify hooks add project-specific security rules (external link rel/attrs, invalid href stripping)
