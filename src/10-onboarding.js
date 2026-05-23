        function initOnboardingBanner() {
            const banner = document.getElementById('onboarding-banner');
            const dismissBtn = document.getElementById('onboarding-dismiss');
            if (!banner || !dismissBtn) return;

            const mainContent = document.getElementById('main-content');

            const restoreBtn = document.getElementById('restore-onboarding');
            if (restoreBtn && guard(restoreBtn)) {
                restoreBtn.addEventListener('click', () => {
                    localStorage.removeItem(STORAGE_KEY_PREFIX + 'onboarding_dismissed');
                    if (mainContent && banner.parentNode !== mainContent) {
                        mainContent.insertBefore(banner, mainContent.firstChild);
                    }
                    banner.classList.remove('hidden-view');
                    if (typeof showToast === 'function') {
                        showToast('Welcome banner restored');
                    }
                });
            }

            if (localStorage.getItem(STORAGE_KEY_PREFIX + 'onboarding_dismissed')) {
                banner.classList.add('hidden-view');
                return;
            }

            if (mainContent && banner.parentNode !== mainContent) {
                mainContent.insertBefore(banner, mainContent.firstChild);
            }
            banner.classList.remove('hidden-view');

            if (guard(dismissBtn)) {
                dismissBtn.addEventListener('click', () => {
                    banner.classList.add('hidden-view');
                    localStorage.setItem(STORAGE_KEY_PREFIX + 'onboarding_dismissed', '1');
                });
            }
        }
