        // ── Theme toggle logic (extracted from 06-app.js) ──
        /** Returns true if dark-theme class is active, false for light-theme, falls back to prefers-color-scheme. */
        function isDarkTheme() {
            if (document.documentElement.classList.contains('dark-theme')) return true;
            if (document.documentElement.classList.contains('light-theme')) return false;
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }

        /**
         * @param {boolean} isDark - Whether to apply dark theme
         * @param {boolean} [userInitiated=false] - If true, persist preference to localStorage and show toast
         *
         * Applies dark or light theme classes to <html>. Updates aria-labels on all
         * theme toggle buttons. When user-initiated, persists the choice and announces
         * the change.
         */
        function setTheme(isDark, userInitiated = false) {
            if (isDark) {
                document.documentElement.classList.add('dark-theme');
                document.documentElement.classList.remove('light-theme');
                if (userInitiated) {
                    try {
                        localStorage.setItem(STORAGE_KEY_PREFIX + 'theme', 'dark');
                    } catch (e) {
                        console.debug('localStorage write failed:', e?.message);
                    }
                }
            } else {
                document.documentElement.classList.add('light-theme');
                document.documentElement.classList.remove('dark-theme');
                if (userInitiated) {
                    try {
                        localStorage.setItem(STORAGE_KEY_PREFIX + 'theme', 'light');
                    } catch (e) {
                        console.debug('localStorage write failed:', e?.message);
                    }
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

        /** Initializes theme UI: applies resolved theme, binds toggle button events. Called once from app init. */
        function initTheme() {
            setTheme(isDarkTheme(), false);
            document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    setTheme(!isDarkTheme(), true);
                });
            });
        }
