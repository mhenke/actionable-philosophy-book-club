(function() {
'use strict';
/** Returns true if the current theme is dark (checks classes, falls back to prefers-color-scheme). */
function isDarkTheme() {
    if (document.documentElement.classList.contains('dark-theme')) return true;
    if (document.documentElement.classList.contains('light-theme')) return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function _persistThemePreference(isDark) {
    try { localStorage.setItem(buildStorageKey('theme'), isDark ? 'dark' : 'light'); }
    catch (e) { window.ErrorHandler?.warn('localStorage write failed:', { err: e }); }
}

/** Applies dark/light theme classes, persists to localStorage if user-initiated, syncs toggle labels, shows toast. */
function setTheme(isDark, userInitiated = false) {
    if (isDark) {
        document.documentElement.classList.add('dark-theme');
        document.documentElement.classList.remove('light-theme');
    } else {
        document.documentElement.classList.add('light-theme');
        document.documentElement.classList.remove('dark-theme');
    }
    if (userInitiated) _persistThemePreference(isDark);

    const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';
    const toggles = document.querySelectorAll('.theme-toggle-btn');
    toggles.forEach(btn => {
        btn.setAttribute('aria-label', label);
    });

    if (userInitiated) {
        showToast(isDark ? 'Dark theme enabled' : 'Light theme enabled');
    }
}

/** Initializes theme from stored preference or system preference, binds toggle buttons. */
function initTheme() {
    setTheme(isDarkTheme(), false);
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setTheme(!isDarkTheme(), true);
        });
    });
}

window.initTheme = initTheme;
})();
