/**
 * Test hooks: exposes constructors and functions to the test harness when window.__TEST__ is true.
 * Minimized to only what tests actually exercise.
 *
 * Side-effects: mutates window when enabled.
 */
(function() {
'use strict';
if (window.__TEST__ === true) {
    window.isSafeRepoPath = function(p) { return window.isSafePath(p, window.DOMAIN.REPO); };
    window.__signalManifestLoaded = function(loaded) { window.__manifestLoaded = loaded; };
    Object.defineProperty(window, 'MEETINGS', {
        get() { return window.findMeetings ? window.findMeetings() : []; }
    });
}
})();
