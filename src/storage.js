/**
 * Storage helpers: build keys, persist video resume positions.
 *
 * Theme and onboarding persistence live in their respective modules (theme.js, onboarding.js).
 *
 * Public API:
 * - buildStorageKey(suffix): returns namespaced storage key
 * - setSessionStorageErrorHandler(handler): installs handler for storage errors
 *
 * Side-effects: uses sessionStorage and may call provided error handler.
 */
(function() {
'use strict';
const STORAGE_KEY_PREFIX = 'apbc:';
const RESUME_MIN_SECONDS = 5;
const PROGRESS_SAVE_MS = 3000;
const STORAGE_VIDEO_PREFIX = 'vs:';
let _onSessionStorageError = null;
let _sessionStorageWarned = false;

/** Installs a handler called when sessionStorage operations fail. Silently ignores non-function handlers. */
function setSessionStorageErrorHandler(handler) {
    if (typeof handler !== 'function') return;
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

/** Video resume threshold and save interval — consumed as bare globals by video-player.js. */
window.RESUME_MIN_SECONDS = RESUME_MIN_SECONDS;
window.PROGRESS_SAVE_MS = PROGRESS_SAVE_MS;
window.buildStorageKey = buildStorageKey;
window.setSessionStorageErrorHandler = setSessionStorageErrorHandler;
window.getSavedVideoResumeTime = getSavedVideoResumeTime;
window.saveVideoResumePosition = saveVideoResumePosition;
window.clearVideoResumePosition = clearVideoResumePosition;
})();
