# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

**Do not** open a public GitHub issue for security vulnerabilities.

We will acknowledge your report within 48 hours and aim to resolve confirmed issues within 14 days.

## Scope

This is a static, client-side only site with no server-side processing, no user accounts, and no stored PII. The primary security surface is:
- Client-side XSS via rendered markdown content
- Supply-chain integrity of CDN-loaded scripts
- GitHub Actions pipeline integrity

## Out of Scope

- Denial of service
- Issues requiring physical access
- Issues in third-party services (GitHub Pages, jsDelivr)
