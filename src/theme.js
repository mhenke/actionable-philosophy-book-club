(function() {
'use strict';

const { STORAGE_KEY, DARK_CLASS, LIGHT_CLASS } = window.THEME_CONFIG;

/** Reads saved theme preference from localStorage. */
function getSavedTheme() {
    try {
        return localStorage.getItem(STORAGE_KEY);
    } catch (err) {
        window.ErrorHandler?.warn('localStorage read failed:', { err });
        return null;
    }
}

/** Saves theme preference to localStorage. */
function saveTheme(theme) {
    try {
        localStorage.setItem(STORAGE_KEY, theme);
    } catch (err) {
        window.ErrorHandler?.warn('localStorage write failed:', { err });
    }
}

/** Returns true if the current theme is dark (checks classes, falls back to prefers-color-scheme). */
function isDarkTheme() {
    if (document.documentElement.classList.contains(DARK_CLASS)) return true;
    if (document.documentElement.classList.contains(LIGHT_CLASS)) return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function _persistThemePreference(isDark) {
    saveTheme(isDark ? 'dark' : 'light');
}

/** Applies dark/light theme classes, persists to localStorage if user-initiated, syncs toggle labels, shows toast. */
function setTheme(isDark, userInitiated = false) {
    if (isDark) {
        document.documentElement.classList.add(DARK_CLASS);
        document.documentElement.classList.remove(LIGHT_CLASS);
    } else {
        document.documentElement.classList.add(LIGHT_CLASS);
        document.documentElement.classList.remove(DARK_CLASS);
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
window.getSavedTheme = getSavedTheme;
window.saveTheme = saveTheme;
})();
