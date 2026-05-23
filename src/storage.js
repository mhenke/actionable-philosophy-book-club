/**
 * Storage helpers: build keys, persist resume positions and onboarding state.
 *
 * Public API:
 * - buildStorageKey(suffix): returns namespaced storage key
 * - setSessionStorageErrorHandler(handler): installs handler for storage errors
 *
 * Side-effects: uses localStorage/sessionStorage and may call provided error handler.
 */
const STORAGE_KEY_PREFIX = window.__STORAGE_PREFIX || 'apbc:';
const RESUME_MIN_SECONDS = 5;
const PROGRESS_SAVE_MS = 3000;
const STORAGE_VIDEO_PREFIX = 'vs:';
let _onSessionStorageError = null;
let _sessionStorageWarned = false;

/** Installs a handler called when sessionStorage operations fail. */
function setSessionStorageErrorHandler(handler) {
    _onSessionStorageError = handler;
}

/** Returns a namespaced storage key by concatenating the shared prefix and suffix. */
function buildStorageKey(suffix) {
    return STORAGE_KEY_PREFIX + suffix;
}

function _sessionStorageSaveError() {
    if (_sessionStorageWarned) return;
    _sessionStorageWarned = true;
    if (_onSessionStorageError) {
        _onSessionStorageError('Could not save video progress');
    }
}

/** Builds the sessionStorage key for a video file's resume position. */
function getVideoResumeKey(filePath) {
    return buildStorageKey(STORAGE_VIDEO_PREFIX + filePath);
}

/** Reads saved resume time from sessionStorage; returns 0 if none found. */
function getSavedVideoResumeTime(filePath) {
    try {
        const saved = sessionStorage.getItem(getVideoResumeKey(filePath));
        return saved ? parseFloat(saved) : 0;
    } catch (err) {
        window.ErrorHandler?.warn('sessionStorage read failed:', { err });
        return 0;
    }
}

/** Saves current video time to sessionStorage if above RESUME_MIN_SECONDS, otherwise clears the key. */
function saveVideoResumePosition(filePath, currentTime) {
    const key = getVideoResumeKey(filePath);
    try {
        if (currentTime > RESUME_MIN_SECONDS) {
            sessionStorage.setItem(key, `${currentTime}`);
        } else {
            sessionStorage.removeItem(key);
        }
    } catch (err) {
        window.ErrorHandler?.warn('sessionStorage write failed:', { err });
        _sessionStorageSaveError();
    }
}

/** Removes the resume position key for a video from sessionStorage. */
function clearVideoResumePosition(filePath) {
    try {
        sessionStorage.removeItem(getVideoResumeKey(filePath));
    } catch (err) {
        window.ErrorHandler?.warn('sessionStorage clear failed:', { err });
    }
}
