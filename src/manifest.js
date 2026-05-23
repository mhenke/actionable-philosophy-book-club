let ASSET_COPY = {};
let RAW_ASSET_COPY = {}; // preserves raw sanitized registry from manifest (used by tests)

const DEFAULT_ASSET_COPY = Object.freeze({
    alternate: { label: 'Alternate', title: 'A different take on the session topic', icon: '🎬', color: 'var(--spectrum-2)' },
    'deep-dive': { label: 'Deep Dive', title: 'An exploration of the session topic', icon: '🔬', color: 'var(--spectrum-2)' },
    critique: { label: 'Critique', title: 'A critical analysis of the key arguments and trade-offs', icon: '🔍', color: 'var(--spectrum-2)' },
    debate: { label: 'Debate', title: 'A structured debate between two design perspectives', icon: '⚔️', color: 'var(--spectrum-2)' },
});

function loadAssetCopyRegistry(assetCopy) {
    const registry = {};
    if (!assetCopy || typeof assetCopy !== 'object' || Array.isArray(assetCopy)) {
        console.warn('Invalid manifest asset copy registry: expected an object. Falling back to defaults.');
        return registry;
    }
    const expectedKeys = Object.keys(DEFAULT_ASSET_COPY);
    const expectedSet = new Set(expectedKeys);
    const missing = expectedKeys.filter(key => !(key in assetCopy));
    const extra = Object.keys(assetCopy).filter(key => !expectedSet.has(key));
    if (missing.length || extra.length) {
        console.warn(`Invalid manifest asset copy registry: ${[
            missing.length ? `missing ${missing.join(', ')}` : '',
            extra.length ? `unexpected ${extra.join(', ')}` : ''
        ].filter(Boolean).join('; ')}. Using defaults at render time for missing entries.`);
    }
    for (const key of expectedKeys) {
        const entry = assetCopy[key];
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
        const sanitized = {};
        if (typeof entry.label === 'string' && entry.label.trim()) sanitized.label = entry.label;
        if (typeof entry.title === 'string' && entry.title.trim()) sanitized.title = entry.title;
        if (Object.keys(sanitized).length > 0) registry[key] = sanitized;
    }
    return registry;
}

/** Returns the raw asset copy registry (test exposure only). */
function getAssetCopyRegistry() {
    return ASSET_COPY;
}

/**
 * MeetingRepository: Single access point for meeting data.
 */
function getAssetCopy(type) {
    const entry = ASSET_COPY[type];
    if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
        return { ...(DEFAULT_ASSET_COPY[type] || {}), ...entry };
    }
    return DEFAULT_ASSET_COPY[type] || {};
}

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
    RAW_ASSET_COPY = assetCopy;
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
