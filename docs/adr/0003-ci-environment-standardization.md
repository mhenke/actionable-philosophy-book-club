# ADR 0003: CI Environment Standardization

**Date:** 2026-05-16
**Status:** Accepted

## Context
The project adheres to "Zero Pipeline" and "Zero Ceremony" principles. However, it utilizes `npm` for two specific safety and optimization tasks:
1.  **Automated Validation:** Using Playwright to verify that 50+ links, icons, and routes in the manifest are functional.
2.  **CSS Optimization:** Using Tailwind CLI to generate a performant, CSP-compliant stylesheet.

Recently, the GitHub Actions build failed because of "Environment Drift." The local `package-lock.json` (generated on the developer machine) was slightly incompatible with the default Node/npm environment provided by the GitHub runner (`ubuntu-latest`). This caused `npm ci` to error out during dependency installation, violating the goal of a frictionless development experience.

## Decision
We will standardize the CI environment by explicitly pinning the Node.js version in the workflow. This ensures that the environment used to validate the project matches the environment used to develop it.

Specifically:
-   Added `actions/setup-node@v4` to `.github/workflows/ci.yml`.
-   Pinned the version to `Node.js 22` (current LTS).
-   Enabled npm caching to speed up subsequent runs.

## Alternatives Considered
-   **Remove npm Entirely:** This would achieve pure "Zero Ceremony" but would force us to rely on manual visual inspection for all 50+ meeting assets, leading to high regression risk as the book club continues.
-   **Relax Lockfile Strictness:** Using `npm install` instead of `npm ci` in CI would bypass the error but could lead to "it works on my machine" bugs where the runner uses different versions of Playwright than the developer.

## Consequences
-   **Stable CI:** The build is now green and resilient to runner-image updates.
-   **Reduced Friction:** Developers no longer need to debug obscure `devtools-protocol` integrity errors.
-   **Explicit Dependency:** We now have a declared dependency on Node.js 22 for validation, though the **site remains functional without it** (true to the "Zero Pipeline" spirit).
