const TOAST_DURATION_MS = 4500;
const TOAST_FADE_MS = 300;

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
