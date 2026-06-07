/**
 * Theme initializer: applies saved theme classes on load (dark/light) based on
 * localStorage or prefers-color-scheme. Runs as a blocking <script> in <head>
 * to prevent FOUC (flash of unstyled content) before the main app.js loads.
 *
 * Exports THEME_CONFIG to window containing STORAGE_KEY, DARK_CLASS, LIGHT_CLASS
 * so that theme.js (which runs as part of the deferred bundle) reads the same
 * values without duplication. This module runs BEFORE theme.js loads.
 *
 * Side-effects: modifies document.documentElement classes early during page load.
 */
(function() {
    window.THEME_CONFIG = {
        STORAGE_KEY: 'apbc:theme',
        DARK_CLASS: 'dark-theme',
        LIGHT_CLASS: 'light-theme'
    };
    try {
        const theme = localStorage.getItem(window.THEME_CONFIG.STORAGE_KEY);
        if (theme === 'dark') {
            document.documentElement.classList.add(window.THEME_CONFIG.DARK_CLASS);
        } else if (theme === 'light') {
            document.documentElement.classList.add(window.THEME_CONFIG.LIGHT_CLASS);
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add(window.THEME_CONFIG.DARK_CLASS);
        }
    } catch (e) {
    }
})();
