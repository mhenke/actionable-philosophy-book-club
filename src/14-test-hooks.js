        if (window.__TEST__ === true) {
            window.isSafeRepoPath = isSafeRepoPath;
            window.isSafeAssetPath = isSafeAssetPath;
            window.isSafePath = isSafePath;
            window.renderUpcomingMaterials = renderUpcomingMaterials;
            window.renderArchiveCards = renderArchiveCards;
            window.renderHorizonCards = renderHorizonCards;
            window.saveVideoResumePosition = saveVideoResumePosition;
            window.formatDuration = formatDuration;
            window.formatFileSize = formatFileSize;
            window.MEETINGS = getMeetings();
            window.ASSET_COPY = getCopyData();
        }
