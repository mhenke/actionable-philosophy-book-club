/**
 * Manifest loader: resolves meeting manifest data from inline __MANIFEST_DATA
 * or fetches docs/manifest.json with an 8s timeout.
 *
 * Public API:
 * - loadManifest(): resolves and validates the manifest, returns raw manifest JSON
 *
 * Side-effects: calls window.loadAssetCopyRegistry?.(manifestData.assetCopy) when present
 */
(function() {
'use strict';

/**
 * Loads the meeting manifest: resolves inline data (__MANIFEST_DATA) or
 * fetches docs/manifest.json with an 8s timeout.
 * @returns {Promise<object>} The manifest JSON object with at minimum a `meetings` array
 * @throws {Error} If the manifest structure is invalid or fetch fails
 */
async function loadManifest() {
  const inlineData = window.__MANIFEST_DATA;
  let manifestData = inlineData;
  if (!manifestData) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch('docs/manifest.json', { signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      manifestData = await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }
  if (!manifestData.meetings || !Array.isArray(manifestData.meetings)) {
    throw new Error('Invalid manifest structure');
  }
  window.loadAssetCopyRegistry?.(manifestData.assetCopy);
  return manifestData;
}

window.loadManifest = loadManifest;
})();
