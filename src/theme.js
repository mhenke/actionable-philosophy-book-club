function isDarkTheme() {
    if (document.documentElement.classList.contains('dark-theme')) return true;
    if (document.documentElement.classList.contains('light-theme')) return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function setTheme(isDark, userInitiated = false) {
    if (isDark) {
        document.documentElement.classList.add('dark-theme');
        document.documentElement.classList.remove('light-theme');
        if (userInitiated) {
            try { localStorage.setItem(buildStorageKey('theme'), 'dark'); }
            catch (e) { console.warn('localStorage write failed:', e?.message); }
        }
    } else {
        document.documentElement.classList.add('light-theme');
        document.documentElement.classList.remove('dark-theme');
        if (userInitiated) {
            try { localStorage.setItem(buildStorageKey('theme'), 'light'); }
            catch (e) { console.warn('localStorage write failed:', e?.message); }
        }
    }

    const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';
    const toggles = document.querySelectorAll('.theme-toggle-btn');
    toggles.forEach(btn => {
        btn.setAttribute('aria-label', label);
    });

    if (userInitiated) {
        showToast(isDark ? 'Dark theme enabled' : 'Light theme enabled');
    }
}

function initTheme() {
    setTheme(isDarkTheme(), false);
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setTheme(!isDarkTheme(), true);
        });
    });
}
