# Design Polish & TOC Features Specification

This document defines the technical specifications for four user experience improvements.

## 1. Skip Link Focus Transition

### Requirement
When a keyboard user triggers the "Skip to main content" link, focus must shift correctly depending on the active SPA view (dashboard vs reader).

### Specification
- In `src/05-reader.js` -> `setView(view)`:
  - If `view === 'dashboard'`, set the skip link `href` attribute to `#main-content`.
  - If `view === 'reader'`, set the skip link `href` attribute to `#markdown-content`.

---

## 2. Typography Styling Tuning

### Requirement
Update the system font stack to use highly legible, premium system sans-serif fonts to match the clean Swiss monograph style, while maintaining zero layout shift and zero network latency.

### Specification
- In `index.html` (CSS):
  - Change the `body` font family to:
    ```css
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    ```

---

## 3. Onboarding Banner Toggle Restore

### Requirement
Allow users who have previously dismissed the onboarding banner to restore it dynamically.

### Specification
- In `index.html` (Footer):
  - Add a `<button>` with id `restore-onboarding` next to the copyright text in the footer.
  - Style it to match the copyright text size (`text-[0.6875rem]`), font weight, and muted color.
- In `src/10-onboarding.js`:
  - Hook a click handler to `#restore-onboarding`.
  - On click:
    - Remove the local storage key `onboarding_dismissed`.
    - Check if the banner element is inside `#main-content`, and insert it at the top of `#main-content` if not.
    - Reveal the banner.
    - Call `showToast('Onboarding banner restored')` for immediate, polite feedback.

---

## 4. Table of Contents (TOC) with Anchor Links

### Requirement
Provide a dynamic, styled Table of Contents at the top of any document in reader mode that has two or more sections.

### Specification
- In `src/05-reader.js`:
  - After rendering and sanitizing the page markdown, query the container for all `h2` headings.
  - If `h2Elements.length >= 2`:
    - Loop through each `h2`. If it does not have a valid `id`, generate a URL-friendly unique `id` slug based on its text content.
    - Construct a TOC element styled using the CSS token systems (spectrum rules, materials panel backgrounds, responsive typography).
    - Insert the TOC container right after the page `h1`.
    - Intercept clicks on the TOC links, call `e.preventDefault()`, and programmatically scroll the matching `h2` element into view smoothly. Focus the element afterwards for screen reader support.
