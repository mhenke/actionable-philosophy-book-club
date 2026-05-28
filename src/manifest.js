/**
 * Manifest loader: fetches or resolves inline meeting manifest data,
 * processes it through the MeetingRepository, and populates the asset copy registry.
 *
 * Public API:
 * - loadManifest()
 * - findMeetings(criteria): queries loaded meetings by criteria
 *
 * Side-effects: populates meetingRepo and ASSET_COPY via _initializeManifestState.
 */
(function() {
'use strict';
let meetingRepo = null;

/** Queries loaded meetings by criteria. Returns empty array if manifest not yet loaded. */
function findMeetings(criteria) {
    return meetingRepo ? meetingRepo.find(criteria) : [];
}

function _initializeManifestState(manifestData) {
    if (!manifestData.meetings || !Array.isArray(manifestData.meetings)) throw new Error('Invalid manifest structure');
    meetingRepo = new MeetingRepository();
    meetingRepo.setAll(manifestData.meetings);
    loadAssetCopyRegistry(manifestData.assetCopy);
}

/**
 * Loads the meeting manifest: resolves inline data (__MANIFEST_DATA / MANIFEST_DATA)
 * or fetches docs/manifest.json with an 8s timeout. Initializes the repository and
 * asset copy registry on success.
 * @returns {Promise<void>}
 */
async function loadManifest() {
    const inlineData = window.__MANIFEST_DATA || (typeof window.MANIFEST_DATA !== 'undefined' ? window.MANIFEST_DATA : null);
    if (inlineData) {
        _initializeManifestState(inlineData);
        return;
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
        const response = await fetch('docs/manifest.json', { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const manifestData = await response.json();
        _initializeManifestState(manifestData);
    } finally {
        clearTimeout(timeoutId);
    }
}

window.findMeetings = findMeetings;
window.loadManifest = loadManifest;
})();
