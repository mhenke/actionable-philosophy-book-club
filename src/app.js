(function() {
'use strict';
const { reader, markdownContent } = window.DOM;
/** Shows a dashboard render error in the upcoming card header and as a toast. */
function showDashboardRenderError(err) {
    const msg = err?.message ? 'Could not load dashboard data: ' + err.message : 'Could not load dashboard data';
    const upcomingHeader = document.getElementById('upcoming-card-header');
    if (upcomingHeader) {
        upcomingHeader.innerHTML = '<p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">' + escapeHTML(msg) + '</p>';
    }
    showToast(msg);
}

/** Application entry point: initializes theme, routing, event wiring, loads manifest, renders dashboard. */
(async () => {
    initTheme();
    initRouting();
    setSessionStorageErrorHandler(showToast);
    registerRoute('reader', loadPage);
    registerRoute('default', navigateToDashboard);

    const backBtn = document.getElementById('back-to-dashboard');
    if (backBtn) backBtn.addEventListener('click', e => {
        e.preventDefault();
        window.location.hash = '';
        navigateToDashboard();
    });

    const skipLink = document.querySelector('a[href="#main-content"]');
    if (skipLink) {
        skipLink.addEventListener('click', e => {
            e.preventDefault();
            const isReaderActive = reader && !reader.classList.contains('hidden-view');
            if (isReaderActive) {
                if (markdownContent) {
                    markdownContent.focus();
                    markdownContent.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                const mainContent = document.getElementById('main-content');
                if (mainContent) {
                    mainContent.focus();
                    mainContent.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            const vp = document.getElementById('video-player-overlay');
            if (vp && vp.open) {
                const closeBtn = document.getElementById('vp-close');
                if (closeBtn) closeBtn.click();
            }
        }
    });

    setupAssetClickDelegation();

    initOnboardingBanner();

    window.__signalManifestLoaded?.(false);

    prepareInitialViewFromHash(window.location.hash);
    if (typeof marked !== 'undefined') {
        marked.use({ gfm: true, breaks: true });
    }

    try {
        await loadManifest();
    } catch (err) {
        window.ErrorHandler?.warn('Manifest load failed:', { err });
        setupManifestRetryUI();
        return;
    }
    window.__signalManifestLoaded?.(true);
    try {
        renderUpcomingMaterials();
        renderArchiveCards();
        renderDraftCards();
    } catch (err) {
        window.ErrorHandler?.warn('Dashboard render failed:', { err });
        showDashboardRenderError(err);
    }

    handleRoute();
})();
})();
