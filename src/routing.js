/**
 * Hash router: parses window.location.hash and dispatches to registered route handlers.
 *
 * Public API:
 * - parseHash(hash) → { path, anchor } | null   (pure, testable)
 * - createRouter({ routes, fallback }) → { start(), destroy() }
 * - registerRoute(name, handler)                (legacy)
 * - handleRoute()                                (legacy)
 * - initRouting()                                (legacy)
 *
 * Dependencies (globals):
 *   window.isSafePath, window.DOMAIN, window.showToast
 */
(function() {
'use strict';

// ======================================================================
//  parseHash — pure hash parser
// ======================================================================

/**
 * Parses a hash string into path and anchor components.
 * Returns null for non-#p= hashes, decodeURIComponent failures,
 * or paths that fail isSafePath validation.
 *
 * @param {string} hash - Hash string like "#p=path/to/file.md#section"
 * @returns {{ path: string, anchor: string|null } | null}
 */
function parseHash(hash) {
    if (!hash || typeof hash !== 'string') return null;
    if (!hash.startsWith('#p=')) return null;

    let fullPath;
    try {
        fullPath = decodeURIComponent(hash.slice(3));
    } catch (_) {
        return null;
    }

    const lastHashIndex = fullPath.lastIndexOf('#');
    const path = lastHashIndex > 0 ? fullPath.substring(0, lastHashIndex) : fullPath;
    const anchor = lastHashIndex > 0 ? fullPath.substring(lastHashIndex + 1) : null;

    if (!window.isSafePath(path, window.DOMAIN.REPO)) return null;

    return { path: path, anchor: anchor };
}

// ======================================================================
//  createRouter — factory for hash-change routing lifecycle
// ======================================================================

/**
 * Creates a router instance that listens to hashchange events and
 * dispatches to route handlers based on parseHash results.
 *
 * When parseHash returns a result (valid #p= path), the 'reader'
 * route handler is called with (path, anchor). Otherwise the 'default'
 * route or fallback is called.
 *
 * @param {Object} options
 * @param {Map<string, Function>} [options.routes] - Route name → handler map
 * @param {Function} [options.fallback] - Fallback handler
 * @returns {{ start: Function, destroy: Function }}
 */
function createRouter({ routes = new Map(), fallback = null } = {}) {
    if (typeof routes?.has !== 'function') throw new Error('routes must be a Map');

    function handle() {
        const parsed = parseHash(window.location.hash);
        if (parsed) {
            const handler = routes.get('reader') || fallback;
            if (handler) handler(parsed.path, parsed.anchor);
        } else {
            const handler = routes.get('default') || fallback;
            if (handler) handler();
        }
    }

    return {
        /** Binds hashchange listener and handles the current hash immediately. */
        start: function start() {
            window.addEventListener('hashchange', handle);
            handle();
        },
        /** Removes the hashchange listener. */
        destroy: function destroy() {
            window.removeEventListener('hashchange', handle);
        },
    };
}

// ======================================================================
//  Legacy API (backward-compatible with existing callers)
// ======================================================================

var _routeHandlers = { default: null };

function registerRoute(name, handler) {
    if (typeof handler !== 'function') return;
    _routeHandlers[name] = handler;
}

function handleRoute() {
    var hash = window.location.hash;
    if (hash.startsWith('#p=')) {
        var fullPath;
        try { fullPath = decodeURIComponent(hash.slice(3)); }
        catch (e) { _routeHandlers.default?.(); return; }
        var lastHashIndex = fullPath.lastIndexOf('#');
        var path = lastHashIndex > 0 ? fullPath.substring(0, lastHashIndex) : fullPath;
        if (!window.isSafePath(path, window.DOMAIN.REPO)) {
            window.showToast('Invalid document path');
            _routeHandlers.default?.();
            return;
        }
        var anchorId = lastHashIndex > 0 ? fullPath.substring(lastHashIndex + 1) : null;
        var handler = _routeHandlers.reader || _routeHandlers.default;
        handler(path, anchorId);
    } else {
        _routeHandlers.default?.();
    }
}

function initRouting() {
    window.addEventListener('hashchange', handleRoute);
}

// ======================================================================
//  Exports
// ======================================================================

window.parseHash = parseHash;
window.createRouter = createRouter;
window.registerRoute = registerRoute;
window.handleRoute = handleRoute;
window.initRouting = initRouting;
})();
