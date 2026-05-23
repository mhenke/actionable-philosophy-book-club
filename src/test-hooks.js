if (window.__TEST__ === true) {
    window.Meeting = Meeting;
    window.isSafeRepoPath = function(p) { return isSafePath(p, DOMAIN.REPO); };
    window.isSafeAssetPath = function(p) { return isSafePath(p, DOMAIN.ASSET); };
    window.isSafePath = isSafePath;
    window.DOMAIN = DOMAIN;
    window.renderUpcomingMaterials = renderUpcomingMaterials;
    window.renderArchiveCards = renderArchiveCards;
    window.renderHorizonCards = renderHorizonCards;
    window.saveVideoResumePosition = saveVideoResumePosition;
    window.formatDuration = formatDuration;
    window.formatFileSize = formatFileSize;
    window.getMeetingRepository = getMeetingRepository;
    window.getAssetCopy = getAssetCopy;
    window.getAssetCopyRegistry = getAssetCopyRegistry;
    Object.defineProperty(window, 'MEETINGS', {
        get() { const repo = getMeetingRepository(); return repo ? repo.getAll() : []; }
    });
}
