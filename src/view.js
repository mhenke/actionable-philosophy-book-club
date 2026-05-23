const STATUS_RESET_MS = 1000;

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
