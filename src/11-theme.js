        // ── Theme toggle logic (extracted from 06-app.js) ──
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
                        localStorage.setItem('apbc:theme', 'dark');
                    } catch (e) {
                        // ignore storage errors
                    }
                }
            } else {
                document.documentElement.classList.add('light-theme');
                document.documentElement.classList.remove('dark-theme');
                if (userInitiated) {
                    try {
                        localStorage.setItem('apbc:theme', 'light');
                    } catch (e) {
                        // ignore storage errors
                    }
                }
            }

            const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';
            const toggles = document.querySelectorAll('.theme-toggle-btn');
            toggles.forEach(btn => {
                btn.setAttribute('aria-label', label);
            });

            if (userInitiated && typeof showToast === 'function') {
                showToast(isDark ? 'Dark theme enabled' : 'Light theme enabled');
            }
        }

        // Initialize theme UI states to match whatever resolved during FOUC prevention or media queries
        setTheme(isDarkTheme(), false);

        // Bind events to both theme toggle buttons
        const themeToggles = document.querySelectorAll('.theme-toggle-btn');
        themeToggles.forEach(btn => {
            btn.addEventListener('click', () => {
                const currentDark = isDarkTheme();
                setTheme(!currentDark, true);
            });
        });
