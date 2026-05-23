/** Initializes the welcome banner with dismiss and restore buttons. Uses localStorage for persistence. */
function initOnboardingBanner() {
    const banner = document.getElementById('onboarding-banner');
    const dismissBtn = document.getElementById('onboarding-dismiss');
    if (!banner || !dismissBtn) return;

    const mainContent = document.getElementById('main-content');

    const restoreBtn = document.getElementById('restore-onboarding');
    if (restoreBtn && callOnce(restoreBtn)) {
        restoreBtn.addEventListener('click', () => {
            localStorage.removeItem(buildStorageKey('onboarding_dismissed'));
            if (mainContent && banner.parentNode !== mainContent) {
                mainContent.insertBefore(banner, mainContent.firstChild);
            }
            banner.classList.remove('hidden-view');
            if (typeof showToast === 'function') {
                showToast('Welcome banner restored');
            }
        });
    }

    if (localStorage.getItem(buildStorageKey('onboarding_dismissed'))) {
        banner.classList.add('hidden-view');
        return;
    }

    if (mainContent && banner.parentNode !== mainContent) {
        mainContent.insertBefore(banner, mainContent.firstChild);
    }
    banner.classList.remove('hidden-view');

    if (callOnce(dismissBtn)) {
        dismissBtn.addEventListener('click', () => {
            banner.classList.add('hidden-view');
            localStorage.setItem(buildStorageKey('onboarding_dismissed'), '1');
        });
    }
}
