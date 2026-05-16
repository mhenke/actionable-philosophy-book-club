# Design Spec: Terminology Shift — "Video Recording" to "Video Recap"

**Date:** 2026-05-16
**Status:** Approved
**Scope:** UI and Supporting Templates (Documentation-only)

## 1. Purpose
Align the application's terminology with the "Recap" concept, moving away from "Recording" to emphasize high-utility, refresher-style content as defined in the brand personality (Technical, Engaging, Value-driven).

## 2. UI Changes (`index.html`)

### 2.1 Session Data Update
The `meetings` array in `index.html` contains meeting objects with asset definitions. All instances of the label "Video Recording" will be changed to "Video Recap".

*   **Target:** `meetings` array in the `<script>` tag of `index.html`.
*   **Old:** `label: 'Video Recording'`
*   **New:** `label: 'Video Recap'`

### 2.2 Template Literal Updates
The `renderMeetings` function uses template literals to generate HTML.
*   **Active Assets:** The header `<p>` for video assets will be updated to "Video Recap".
*   **Aria Labels:** `aria-label="Download video recording"` will be changed to `aria-label="Download video recap"`.
*   **Placeholders:** The `placeholderRow` call for missing videos will be updated from `Video Recording` to `Video Recap`.

## 3. Supporting Documentation & Templates

### 3.1 `CONTRIBUTING.md`
Update instructions to ensure contributors use the correct label when adding new meetings.
*   Update the "Assets" bullet point descriptions.
*   Update the example JSON block in the "Adding a Meeting" section to use `label: 'Video Recap'`.

### 3.2 `templates/discussion-template.md`
*   Update placeholder text or examples that refer to "Video Recording" to "Video Recap".

### 3.3 `PRODUCT.md`
*   Update "Product Purpose" and "Design Principles" (specifically Principle 2) to use "Video Recap".

## 4. Constraints
*   **File Paths:** The underlying directory `meetings/meeting-NN/recordings/` remains unchanged to avoid breaking existing file references and automation scripts.
*   **Filename Conventions:** Filenames (e.g., `NN-<Slug>.mp4`) remain unchanged.

## 5. Verification Plan
1.  **Manual UI Check:** Open `index.html` in a browser and verify all video-related labels show "Video Recap".
2.  **Grepping:** Run `grep -r "Video Recording" .` to ensure no user-facing strings were missed in the target files.
3.  **Template Validation:** Verify that a new meeting created using the updated `CONTRIBUTING.md` guide would correctly display "Video Recap" in the UI.
