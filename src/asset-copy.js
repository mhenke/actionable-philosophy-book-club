/**
 * Asset copy registry: resolves labels, icons, and descriptions for asset types
 * (alternate video, deep dive, critique, debate). Populated from manifest data
 * at load time; falls back to defaults when entries are missing.
 *
 * Public API:
 * - loadAssetCopyRegistry(assetCopy)
 * - getAssetCopyRegistry()
 * - getAssetCopy(type)
 *
 * Side-effects: populates ASSET_COPY used by asset renderers.
 */
(function() {
'use strict';
let ASSET_COPY = {};

function setAssetCopyRegistry(data) {
    ASSET_COPY = data;
}

const DEFAULT_ASSET_COPY = Object.freeze({
    alternate: { label: 'Alternate', title: 'A different take on the session topic', icon: '🎬', color: 'var(--spectrum-2)' },
    'deep-dive': { label: 'Deep Dive', title: 'An exploration of the session topic', icon: '🔬', color: 'var(--spectrum-2)' },
    critique: { label: 'Critique', title: 'A critical analysis of the key arguments and trade-offs', icon: '🔍', color: 'var(--spectrum-2)' },
    debate: { label: 'Debate', title: 'A structured debate between two design perspectives', icon: '⚔️', color: 'var(--spectrum-2)' },
});

/** Validates manifest asset copy entries against expected keys, returns a sanitized registry. Falls back to defaults for missing entries. */
function loadAssetCopyRegistry(assetCopy) {
    const registry = {};
    if (!assetCopy || typeof assetCopy !== 'object' || Array.isArray(assetCopy)) {
        window.ErrorHandler?.warn('Invalid manifest asset copy registry: expected an object. Falling back to defaults.');
        return registry;
    }
    const expectedKeys = Object.keys(DEFAULT_ASSET_COPY);
    const expectedSet = new Set(expectedKeys);
    const missing = expectedKeys.filter(key => !(key in assetCopy));
    const extra = Object.keys(assetCopy).filter(key => !expectedSet.has(key));
    if (missing.length || extra.length) {
        window.ErrorHandler?.warn(`Invalid manifest asset copy registry: ${[
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

/** Returns the current asset copy registry (may be empty before manifest loads). */
function getAssetCopyRegistry() {
    return ASSET_COPY;
}

/**
 * Returns merged entry for a copy type: overrides defaults with manifest-provided values.
 * Falls back to default entry if type is not found in registry.
 */
function getAssetCopy(type) {
    const entry = ASSET_COPY[type];
    if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
        return { ...(DEFAULT_ASSET_COPY[type] || {}), ...entry };
    }
    return DEFAULT_ASSET_COPY[type] || {};
}

window.setAssetCopyRegistry = setAssetCopyRegistry;
window.loadAssetCopyRegistry = loadAssetCopyRegistry;
window.getAssetCopyRegistry = getAssetCopyRegistry;
window.getAssetCopy = getAssetCopy;
window.DEFAULT_ASSET_COPY = DEFAULT_ASSET_COPY;
})();
