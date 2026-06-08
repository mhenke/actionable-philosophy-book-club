/**
 * View toggling helpers: switch between dashboard and reader views and update skip-link targets.
 *
 * Public API:
 * - setView(view): 'dashboard'|'reader'
 * - prepareInitialViewFromHash(hash): sets the initial view based on hash before manifest loads
 *
 * Side-effects: mutates DOM elements: dashboard, reader, and skip-link href.
 */
(function() {
'use strict';
const { dashboard, reader, readerStatus, markdownContent } = window.DOM;
const STATUS_RESET_MS = 1000;

/** Sets the initial dashboard/reader visibility based on the hash, before the manifest loads. Prevents a flash of dashboard content when navigating to a reader page directly. */
function prepareInitialViewFromHash(hash) {
    if (hash.startsWith('#p=')) {
        dashboard.classList.add('hidden-view');
        reader.classList.remove('hidden-view');
        dashboard.setAttribute('aria-hidden', 'true');
        reader.setAttribute('aria-hidden', 'false');
    }
}

/** Toggles visibility between dashboard and reader views. Updates skip-link target and aria-hidden. */
function setView(view) {
    if (view !== 'dashboard') view = 'reader';
    const isDashboard = view === 'dashboard';
    dashboard.classList.toggle('hidden-view', !isDashboard);
    reader.classList.toggle('hidden-view', isDashboard);
    dashboard.setAttribute('aria-hidden', isDashboard ? 'false' : 'true');
    reader.setAttribute('aria-hidden', isDashboard ? 'true' : 'false');

    const skipLink = document.querySelector('a[href^="#"]');
    if (skipLink) {
        skipLink.setAttribute('href', isDashboard ? '#main-content' : '#markdown-content');
    }
}

/** Closes video player, switches to dashboard view, resets reader content and focus. */
function navigateToDashboard() {
    closeVideoPlayer();
    document.title = 'Actionable Philosophy Book Club Dashboard';
    const readerDocLabel = document.getElementById('reader-doc-label');
    if (readerDocLabel) readerDocLabel.textContent = 'Session Notes';
    setView('dashboard');
    readerStatus.textContent = '';
    markdownContent.innerHTML = '';
    window.scrollTo(0, 0);
    const mainEl = document.getElementById('main-content');
    if (mainEl) mainEl.focus({ preventScroll: true });
    if (readerStatus) {
        readerStatus.textContent = 'Dashboard';
        setTimeout(() => { if (readerStatus) readerStatus.textContent = ''; }, STATUS_RESET_MS);
    }
}

window.setView = setView;
window.prepareInitialViewFromHash = prepareInitialViewFromHash;
window.navigateToDashboard = navigateToDashboard;
})();

/**
 * Retry UI helper: wires a button to an async retry handler with optimistic disabled state.
 *
 * Public API:
 * - bindRetryButton(btn, handler, options)
 * - showRetryUI(container, opts)
 *
 * Side-effects: mutates button text and disabled state during retry attempts.
 */
(function() {
'use strict';
/**
 * Wires a click listener that runs an async handler, disables the button during the attempt,
 * and restores it on failure so the user can retry.
 */
function bindRetryButton(btn, handler, { retryText, retryDisabledText } = {}) {
    btn.addEventListener('click', async () => {
        btn.textContent = retryDisabledText || 'Retrying...';
        btn.disabled = true;
        try {
            await handler();
        } catch {
            btn.textContent = retryText || 'Try again';
            btn.disabled = false;
        }
    });
}

/**
 * Renders a centered retry panel with optional retry and back buttons.
 * Wires click handlers via bindRetryButton for the retry case.
 */
function showRetryUI(container, { message, retryLabel, onRetry, backLabel, onBack }) {
    container.innerHTML = `
                <div class="py-12 text-center">
                    <p class="text-sm uppercase tracking-widest text-muted mb-4">${escapeHTML(message)}</p>
                    <div class="flex gap-4 justify-center">
                        ${onRetry ? `<button class="retry-btn text-sm uppercase tracking-widest text-spectrum-2 underline">${escapeHTML(retryLabel || 'Try again')}</button>` : ''}
                        ${onBack ? `<button class="back-btn text-sm uppercase tracking-widest text-muted underline">${escapeHTML(backLabel || 'Return to Dashboard')}</button>` : ''}
                    </div>
                </div>`;
    const retryBtn = container.querySelector('.retry-btn');
    if (retryBtn && onRetry) bindRetryButton(retryBtn, onRetry);
    const backBtn = container.querySelector('.back-btn');
    if (backBtn && onBack) backBtn.addEventListener('click', onBack);
}

window.bindRetryButton = bindRetryButton;
window.showRetryUI = showRetryUI;
})();

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

    setupMediaInteraction(document.body);

    initOnboardingBanner();

    window.__signalManifestLoaded?.(false);

    prepareInitialViewFromHash(window.location.hash);
    if (typeof marked !== 'undefined') {
        marked.use({ gfm: true, breaks: true });
    }

    try {
        const manifest = await loadManifest();
        MeetingRepository.setAll(manifest.meetings);
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

    var router = createRouter({
        routes: new Map([['reader', loadMarkdownPage], ['default', navigateToDashboard]]),
        fallback: navigateToDashboard,
    });
    router.start();
})();
})();
