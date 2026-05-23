/**
 * Toast and error notification system: shows temporary toast notifications
 * and provides centralized warning/error reporting.
 *
 * Public API:
 * - showToast(message)
 * - window.ErrorHandler.warn(message, ...)
 * - window.ErrorHandler.error(err, userMessage)
 *
 * Side-effects: appends/removes elements under #toast-container; logs to console.
 */

const TOAST_DURATION_MS = 4500;
const TOAST_FADE_MS = 300;

/** Shows a temporary notification toast. Auto-dismisses after TOAST_DURATION_MS with fade. */
function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) {
        console.warn('showToast: #toast-container not found');
        return;
    }
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    container.appendChild(el);
    requestAnimationFrame(() => el.classList.add('toast--visible'));
    setTimeout(() => {
        el.classList.remove('toast--visible');
        setTimeout(() => el.remove(), TOAST_FADE_MS);
    }, TOAST_DURATION_MS);
}

/**
 * ErrorHandler: centralizes warning and error reporting.
 * Callers should use window.ErrorHandler?.warn(...) to stay resilient to load order.
 */
(function () {
    const ErrorHandler = {
        warn(message, err = null) {
            try { console.warn('ErrorHandler:', message, err); } catch (e) { /* best-effort */ }
        },
        error(err, userMessage) {
            try { console.error('ErrorHandler:', err); } catch (e) { /* ignore */ }
            if (userMessage && typeof showToast === 'function') {
                try { showToast(String(userMessage)); } catch (e) { /* ignore */ }
            }
        },
    };
    window.ErrorHandler = ErrorHandler;
})();
