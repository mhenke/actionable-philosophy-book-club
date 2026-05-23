const CACHE_MAX = 20;
const mdCache = new Map();

/**
 * Fetches markdown with a 20-entry LRU cache. Caches promises, not just values.
 * Automatically evicts on reject to avoid caching errors.
 * @param {string} path - Validated repo path
 * @param {AbortSignal} [signal] - Optional AbortController signal
 * @returns {Promise<string>}
 */
function fetchMarkdown(path, signal) {
    if (!isSafePath(path, DOMAIN.REPO)) return Promise.reject(new Error('Unsafe path: ' + path));
    if (mdCache.has(path)) {
        const val = mdCache.get(path);
        mdCache.delete(path);
        mdCache.set(path, val);
        return val;
    }
    if (mdCache.size >= CACHE_MAX) {
        mdCache.delete(mdCache.keys().next().value);
    }
    const promise = fetch(path, { signal })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.text();
        });
    mdCache.set(path, promise);
    promise.catch(() => {
        if (mdCache.get(path) === promise) mdCache.delete(path);
    });
    return promise;
}

const _called = new WeakMap();
function callOnce(key) {
    if (_called.has(key)) return false;
    _called.set(key, true);
    return true;
}


