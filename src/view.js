/**
 * View toggling helpers: switch between dashboard and reader views and update skip-link targets.
 *
 * Public API:
 * - setView(view): 'dashboard'|'reader'
 * - prepareInitialViewFromHash(hash): sets the initial view based on hash before manifest loads
 *
 * Side-effects: mutates DOM elements: dashboard, reader, and skip-link href.
 */
const STATUS_RESET_MS = 1000;

/** Sets the initial dashboard/reader visibility based on the hash, before the manifest loads. Prevents a flash of dashboard content when navigating to a reader page directly. */
function prepareInitialViewFromHash(hash) {
    if (hash.startsWith('#p=')) {
        dashboard.classList.add('hidden-view');
        reader.classList.remove('hidden-view');
    }
}

/** Toggles visibility between dashboard and reader views. Updates skip-link target. */
function setView(view) {
    if (view !== 'dashboard') view = 'reader';
    const isDashboard = view === 'dashboard';
    dashboard.classList.toggle('hidden-view', !isDashboard);
    reader.classList.toggle('hidden-view', isDashboard);

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
