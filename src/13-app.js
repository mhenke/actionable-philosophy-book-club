function showDashboardRenderError(err) {
    const msg = err?.message ? 'Could not load dashboard data: ' + err.message : 'Could not load dashboard data';
    const upcomingHeader = document.getElementById('upcoming-card-header');
    if (upcomingHeader) {
        upcomingHeader.innerHTML = '<p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">' + escapeHTML(msg) + '</p>';
    }
    showToast(msg);
}

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

    if (window.__TEST__) window.__manifestLoaded = false;

    const initialHash = window.location.hash;
    if (initialHash.startsWith('#p=')) {
        dashboard.classList.add('hidden-view');
        reader.classList.remove('hidden-view');
    }
    if (typeof marked !== 'undefined') {
        marked.use({ gfm: true, breaks: true });
    }

    try {
        await loadManifest();
    } catch (err) {
        console.error('Manifest load failed:', err?.message || err);
        setupManifestRetryUI();
        return;
    }
    if (window.__TEST__) window.__manifestLoaded = true;
    try {
        renderUpcomingMaterials();
        renderArchiveCards();
        renderHorizonCards();
    } catch (err) {
        console.error('Dashboard render failed:', err?.message || err);
        showDashboardRenderError(err);
    }

    handleRoute();
})();
