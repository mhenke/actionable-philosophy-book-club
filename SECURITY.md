# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

**Do not** open a public GitHub issue for security vulnerabilities.

Contact: henke.mike@gmail.com — or use GitHub Security Advisories:
https://github.com/mhenke/actionable-philosophy-book-club/security/advisories/new

We will acknowledge your report within 48 hours and aim to resolve confirmed issues within 14 days.
Coordinated disclosure default: 90 days from acknowledgement.

## Supported Versions

Only the `main` branch is actively maintained. All prior releases are unsupported.

## Scope

This is a static, client-side only site with no server-side processing, no user accounts, and no stored PII. The primary security surface is:

- **Client-side XSS via rendered markdown content** — mitigated by DOMPurify 3.x (vendored, not CDN-loaded) with a strict `afterSanitizeAttributes` hook that strips all hrefs not matching the internal path allowlist.
- **Path traversal via manifest-driven asset URLs** — mitigated by a single unified `isSafePath(p, kind)` validator applied at every fetch and link-rewrite site.
- **GitHub Actions pipeline integrity** — all Actions are pinned by full commit SHA to defeat tag-mutation supply-chain attacks.

## Content Security Policy

The CSP (`index.html`) uses `style-src 'self' 'unsafe-inline'`. The `unsafe-inline` directive is required because the JavaScript renderer injects `style="..."` attributes into dashboard cards (meeting colors, tints). DOMPurify is configured to strip `style` attributes from all markdown-rendered content, closing the primary XSS vector through that path. Removing `unsafe-inline` would require refactoring all dynamic inline styles to CSS custom-property classes — tracked as a future improvement.

## Out of Scope

- Denial of service
- Issues requiring physical access
- Issues in third-party services (GitHub Pages, Microsoft Office Online Viewer)

## Past Advisories

None.
