/**
 * Test hooks: exposes constructors and functions to the test harness when window.__TEST__ is true.
 * Minimized to only what tests actually exercise.
 *
 * Side-effects: mutates window when enabled.
 */
(function() {
'use strict';
if (window.__TEST__ === true) {
    window.Meeting = window.Meeting;
    window.isSafeRepoPath = function(p) { return window.isSafePath(p, window.DOMAIN.REPO); };
    window.renderUpcomingMaterials = window.renderUpcomingMaterials;
    window.renderArchiveCards = window.renderArchiveCards;
    window.saveVideoResumePosition = window.saveVideoResumePosition;
    window.formatDuration = window.formatDuration;
    window.formatFileSize = window.formatFileSize;
    window.getAssetCopyRegistry = window.getAssetCopyRegistry;
    Object.defineProperty(window, 'MEETINGS', {
        get() { const repo = window.getMeetingRepository(); return repo ? repo.find() : []; }
    });
}
})();
