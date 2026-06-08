/**
 * Primitive utilities: one-shot guard utility.
 *
 * Public API:
 * - callOnce(key): one-shot guard keyed by function reference identity
 *
 * Side-effects: uses WeakMap for guard state.
 */
(function() {
'use strict';

/** One-shot guard keyed by function reference identity. Returns true only the first time a given key is passed. */
const _called = new WeakMap();
function callOnce(key) {
    if (_called.has(key)) return false;
    _called.set(key, true);
    return true;
}

window.callOnce = callOnce;
})();
