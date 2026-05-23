(function() {
'use strict';
/** Initializes the onboarding banner with dismiss and restore buttons. Uses localStorage for persistence. */
function initOnboardingBanner() {
    const banner = document.getElementById('onboarding-banner');
    const dismissBtn = document.getElementById('onboarding-dismiss');
    if (!banner || !dismissBtn) return;

    const mainContent = document.getElementById('main-content');

    if (callOnce(document)) {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('#restore-onboarding') || e.target.closest('.restore-onboarding-action');
            if (!btn) return;
            e.preventDefault();

            const bannerEl = document.getElementById('onboarding-banner');
            const mainContentEl = document.getElementById('main-content');
            if (!bannerEl) return;

            setOnboardingDismissed(false);
            if (mainContentEl && bannerEl.parentNode !== mainContentEl) {
                mainContentEl.insertBefore(bannerEl, mainContentEl.firstChild);
            }
            bannerEl.classList.remove('hidden-view');
            if (typeof showToast === 'function') {
                showToast('Onboarding banner restored');
            }
        });
    }

    if (getOnboardingDismissed()) {
        banner.classList.add('hidden-view');
    } else {
        if (mainContent && banner.parentNode !== mainContent) {
            mainContent.insertBefore(banner, mainContent.firstChild);
        }
        banner.classList.remove('hidden-view');
    }

    if (callOnce(dismissBtn)) {
        dismissBtn.addEventListener('click', () => {
            banner.classList.add('hidden-view');
            setOnboardingDismissed(true);
        });
    }
}

window.initOnboardingBanner = initOnboardingBanner;
})();
