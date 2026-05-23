/**
 * Theme initializer: applies saved theme classes on load (dark/light) based on localStorage or prefers-color-scheme.
 *
 * Side-effects: modifies document.documentElement classes early during page load.
 */
(function() {
    try {
        const theme = localStorage.getItem(window.__STORAGE_PREFIX + 'theme');
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
