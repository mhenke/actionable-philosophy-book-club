/**
 * Test hooks: exposes constructors and functions to the test harness when window.__TEST__ is true.
 * Minimized to only what tests actually exercise.
 *
 * Side-effects: mutates window when enabled.
 */
(function() {
'use strict';
if (window.__TEST__ === true) {
    window.Meeting = Meeting;
    window.isSafeRepoPath = function(p) { return isSafePath(p, DOMAIN.REPO); };
    window.renderUpcomingMaterials = renderUpcomingMaterials;
    window.renderArchiveCards = renderArchiveCards;
    window.saveVideoResumePosition = saveVideoResumePosition;
    window.formatDuration = formatDuration;
    window.formatFileSize = formatFileSize;
    window.getAssetCopyRegistry = getAssetCopyRegistry;
    Object.defineProperty(window, 'MEETINGS', {
        get() { const repo = getMeetingRepository(); return repo ? repo.getAll() : []; }
    });
}
})();
