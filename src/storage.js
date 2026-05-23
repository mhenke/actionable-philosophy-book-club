let _onSessionStorageError = null;
let _sessionStorageWarned = false;

/** Registers a callback for sessionStorage write failures (shown as toast). */
function setSessionStorageErrorHandler(handler) {
    _onSessionStorageError = handler;
}

function _sessionStorageSaveError() {
    if (_sessionStorageWarned) return;
    _sessionStorageWarned = true;
    if (_onSessionStorageError) {
        _onSessionStorageError('Could not save video progress');
    }
}

/** Returns the sessionStorage key for a video file's resume position. */
function getVideoResumeKey(filePath) {
    return STORAGE_KEY_PREFIX + 'vs:' + filePath;
}

/** Reads saved resume time from sessionStorage. Returns 0 on failure. */
function getSavedVideoResumeTime(filePath) {
    try {
        const saved = sessionStorage.getItem(getVideoResumeKey(filePath));
        return saved ? parseFloat(saved) : 0;
    } catch (err) {
        console.warn('sessionStorage read failed:', err?.message);
        return 0;
    }
}

/** Writes resume position to sessionStorage. Removes key if below RESUME_MIN_SECONDS. */
function saveVideoResumePosition(filePath, currentTime) {
    const key = getVideoResumeKey(filePath);
    try {
        if (currentTime > CONFIG.RESUME_MIN_SECONDS) {
            sessionStorage.setItem(key, `${currentTime}`);
        } else {
            sessionStorage.removeItem(key);
        }
    } catch (err) {
        console.warn('sessionStorage write failed:', err?.message);
        _sessionStorageSaveError();
    }
}

/** Removes the resume position key for a video file. */
function clearVideoResumePosition(filePath) {
    try {
        sessionStorage.removeItem(getVideoResumeKey(filePath));
    } catch (err) {
        console.warn('sessionStorage clear failed:', err?.message);
    }
}
