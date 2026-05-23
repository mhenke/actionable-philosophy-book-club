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
let meetingRepo = null;

function getMeetingRepository() {
    return meetingRepo;
}

function _processManifestData(data) {
    if (!data.meetings || !Array.isArray(data.meetings)) throw new Error('Invalid manifest structure');
    const assetCopy = loadAssetCopyRegistry(data.assetCopy);
    meetingRepo = new MeetingRepository();
    meetingRepo.setAll(data.meetings);
    ASSET_COPY = assetCopy;
}

async function loadManifest() {
    const inlineData = window.__MANIFEST_DATA || (typeof MANIFEST_DATA !== 'undefined' ? MANIFEST_DATA : null);
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
