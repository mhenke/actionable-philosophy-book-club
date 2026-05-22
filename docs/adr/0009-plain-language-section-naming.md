# ADR-0009: Plain Language Section Naming

**Status:** Accepted
**Date:** 2026-05-18

## Context

The dashboard originally used evocative section labels: "The Horizon" for upcoming sessions beyond the next meeting, and "The Archive" for completed sessions. These names were intentionally styled, borrowing from the Swiss/APoSD typographic aesthetic to give the interface a distinct, non-generic feel.

In practice, first-time users (Marcus persona) encountered "The Horizon" and could not immediately determine what it contained. "Horizon" is ambiguous: it could mean future goals, a reading list, or sessions far in the future. The "The" prefix added to "The Archive" became stylistically inconsistent once "The Horizon" was renamed, meaning the two sections had different registers.

The Knowledge Base "Inbox" tile pointed to the `meetings/drafts/` staging area. In engineering contexts, "Inbox" implies email or a notification queue. The actual content is draft/pre-confirmed meeting materials.

## Decision

- Rename **"The Horizon"** → **"Coming Up"**
- Rename **"The Archive"** → **"Past"**
- Rename KB tile **"Inbox"** → **"Drafts"**

## Rationale

Plain language reduces cognitive load for first-time visitors without sacrificing the aesthetic. The temporal pair "Coming Up / Past" is symmetric, unambiguous, and article-free: consistent register across both sections. The uppercase tracked label treatment retains the Swiss typographic identity regardless of the words used.

"Drafts" accurately describes staging-area content (materials being prepared before a session is confirmed) and avoids the email-inbox mental model.

Aesthetic distinctiveness lives in the *treatment* (uppercase, tracking, spectrum-rule, system font), not in choosing unusual nouns. Unusual nouns that obscure meaning are a UX cost, not a design asset.

## Consequences

- **Positive:** New members understand section contents without prior knowledge of the dashboard.
- **Positive:** Sections share a consistent naming register (no "The" prefix on some but not others).
- **Negative:** Members who internalized "The Archive" and "The Horizon" as labels experience a small transition.
- **Convention:** Future section names should prefer plain, time-oriented or function-oriented nouns over evocative metaphors.
- **Status:** Documentation updated: docs/design-principles.md and CONTRIBUTING.md now use the **"Drafts"** label for the staging folder (`meetings/drafts/`).
