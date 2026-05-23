/**
 * Manifest loader: fetches or resolves inline meeting manifest data,
 * processes it through the MeetingRepository, and populates the asset copy registry.
 *
 * Public API:
 * - loadManifest()
 * - getMeetingRepository()
 *
 * Side-effects: populates meetingRepo and ASSET_COPY via _processManifestData.
 */
(function() {
'use strict';
let meetingRepo = null;

function getMeetingRepository() {
    return meetingRepo;
}

function _processManifestData(manifestData) {
    if (!manifestData.meetings || !Array.isArray(manifestData.meetings)) throw new Error('Invalid manifest structure');
    meetingRepo = new MeetingRepository();
    meetingRepo.setAll(manifestData.meetings);
    setAssetCopyRegistry(loadAssetCopyRegistry(manifestData.assetCopy));
}

async function loadManifest() {
    const inlineData = window.__MANIFEST_DATA || (typeof window.MANIFEST_DATA !== 'undefined' ? window.MANIFEST_DATA : null);
    if (inlineData) {
        _processManifestData(inlineData);
        return;
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
        const response = await fetch('docs/manifest.json', { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        _processManifestData(data);
    } finally {
        clearTimeout(timeoutId);
    }
}

window.getMeetingRepository = getMeetingRepository;
window.loadManifest = loadManifest;
})();
