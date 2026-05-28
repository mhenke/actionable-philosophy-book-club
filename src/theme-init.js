/**
 * Theme initializer: applies saved theme classes on load (dark/light) based on
 * localStorage or prefers-color-scheme. Runs as a blocking <script> in <head>
 * to prevent FOUC (flash of unstyled content) before the main app.js loads.
 *
 * Exports THEME_STORAGE_KEY to window so theme.js can read it without duplicating.
 * This module runs BEFORE theme.js/storage.js load, so the key is set here.
 *
 * Side-effects: modifies document.documentElement classes early during page load.
 */
(function() {
    try {
        const theme = localStorage.getItem('apbc:theme');
        if (theme === 'dark') {
            document.documentElement.classList.add('dark-theme');
        } else if (theme === 'light') {
            document.documentElement.classList.add('light-theme');
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark-theme');
        }
    } catch (e) {
        // Ignore storage access errors
    }
    window.THEME_STORAGE_KEY = 'apbc:theme';
})();
