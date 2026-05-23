        // ── Onboarding banner ──
        function initOnboardingBanner() {
            const banner = document.getElementById('onboarding-banner');
            const dismissBtn = document.getElementById('onboarding-dismiss');
            if (!banner || !dismissBtn) return;

            const mainContent = document.getElementById('main-content');

            const restoreBtn = document.getElementById('restore-onboarding');
            if (restoreBtn && !restoreBtn.dataset.listenerInstalled) {
                restoreBtn.dataset.listenerInstalled = 'true';
                restoreBtn.addEventListener('click', () => {
                    localStorage.removeItem(LS + 'onboarding_dismissed');
                    if (mainContent && banner.parentNode !== mainContent) {
                        mainContent.insertBefore(banner, mainContent.firstChild);
                    }
                    banner.classList.remove('hidden-view');
                    if (typeof showToast === 'function') {
                        showToast('Welcome banner restored');
                    }
                });
            }

            if (localStorage.getItem(LS + 'onboarding_dismissed')) {
                banner.classList.add('hidden-view');
                return;
            }

            if (mainContent && banner.parentNode !== mainContent) {
                mainContent.insertBefore(banner, mainContent.firstChild);
            }
            banner.classList.remove('hidden-view');

            if (!dismissBtn.dataset.listenerInstalled) {
                dismissBtn.dataset.listenerInstalled = 'true';
                dismissBtn.addEventListener('click', () => {
                    banner.classList.add('hidden-view');
                    localStorage.setItem(LS + 'onboarding_dismissed', '1');
                });
            }
        }
