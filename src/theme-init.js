/**
 * Theme initializer: applies saved theme classes on load (dark/light) based on
 * localStorage or prefers-color-scheme. Runs as a blocking <script> in <head>
 * to prevent FOUC (flash of unstyled content) before the main app.js loads.
 *
 * NOTE: This duplicates localStorage key logic from getSavedTheme() in theme.js.
 * This is intentional — this module runs BEFORE theme.js/storage.js load, so
 * it cannot import buildStorageKey(). Both paths produce 'apbc:theme'.
 * If you change the key here, update getSavedTheme() in theme.js too.
 *
 * Side-effects: modifies document.documentElement classes early during page load.
 */
(function() {
    // NOTE: 'apbc:theme' must match STORAGE_KEY_PREFIX + 'theme' from storage.js.
    // If changing the prefix in storage.js, update this string too.
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
})();
