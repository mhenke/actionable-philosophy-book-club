/**
 * Viewer routing: resolves file paths to viewer destinations (URL, target, rel).
 * Consolidates all file-type→viewer mapping in one place (APOSD Principle 3).
 *
 * Public API:
 * - setRawContentBase(url)
 * - buildPPTXViewerURL(path)
 * - getViewerDestination(path)
 * - classifyAssetPath(path): returns 'slides'|'image'|'video'|'other'
 *
 * Side-effects: reads window.location; may set raw content base URL.
 */
let _rawContentBase = null;

function setRawContentBase(url) {
    _rawContentBase = url;
}

function _getRawContentBase() {
    if (_rawContentBase) return _rawContentBase;
    const hostParts = window.location.hostname.split('.');
    if (hostParts.length >= 2 && hostParts[1] === 'github') {
        const owner = hostParts[0];
        const repo = window.location.pathname.replace(/^\/|\/+$/g, '').split('/')[0] || 'actionable-philosophy-book-club';
        return `https://raw.githubusercontent.com/${owner}/${repo}/main/`;
    }
    return 'https://raw.githubusercontent.com/mhenke/actionable-philosophy-book-club/main/';
}

function buildPPTXViewerURL(path) {
    if (!isSafePath(path, DOMAIN.ASSET)) return null;
    return 'https://view.officeapps.live.com/op/view.aspx?src=' + encodeURIComponent(_getRawContentBase() + path);
}

/** Classifies a file path by extension: 'slides', 'image', 'video', or 'other'. Single source of truth for file-type decisions. */
function classifyAssetPath(path) {
    if (/\.pptx?$/i.test(path)) return 'slides';
    if (/\.(png|jpe?g|gif|webp|svg)$/i.test(path)) return 'image';
    if (/\.mp4$/i.test(path)) return 'video';
    return 'other';
}

/**
 * Resolves viewer destination config for a given file path.
 * Centralizes file-type→viewer mapping: pptx→Office viewer, images→direct with new tab,
 * other assets→direct link without new tab.
 * @param {string} path - Relative path to an asset (caller must validate path safety)
 * @returns {{ url: string, target?: string, rel?: string }}
 */
function getViewerDestination(path) {
    const type = classifyAssetPath(path);
    if (type === 'slides') {
        return {
            url: buildPPTXViewerURL(path),
            target: '_blank',
            rel: 'noopener noreferrer'
        };
    }
    if (type === 'image') {
        return { url: path, target: '_blank', rel: 'noopener noreferrer' };
    }
    return { url: path };
}
