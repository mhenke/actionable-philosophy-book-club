const STORAGE_KEY_PREFIX = 'apbc:';
const RESUME_MIN_SECONDS = 5;
const PROGRESS_SAVE_MS = 3000;
let _onSessionStorageError = null;
let _sessionStorageWarned = false;

function setSessionStorageErrorHandler(handler) {
    _onSessionStorageError = handler;
}

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

function getVideoResumeKey(filePath) {
    return buildStorageKey('vs:' + filePath);
}

function getSavedVideoResumeTime(filePath) {
    try {
        const saved = sessionStorage.getItem(getVideoResumeKey(filePath));
        return saved ? parseFloat(saved) : 0;
    } catch (err) {
        console.warn('sessionStorage read failed:', err?.message);
        return 0;
    }
}

function saveVideoResumePosition(filePath, currentTime) {
    const key = getVideoResumeKey(filePath);
    try {
        if (currentTime > RESUME_MIN_SECONDS) {
            sessionStorage.setItem(key, `${currentTime}`);
        } else {
            sessionStorage.removeItem(key);
        }
    } catch (err) {
        console.warn('sessionStorage write failed:', err?.message);
        _sessionStorageSaveError();
    }
}

function clearVideoResumePosition(filePath) {
    try {
        sessionStorage.removeItem(getVideoResumeKey(filePath));
    } catch (err) {
        console.warn('sessionStorage clear failed:', err?.message);
    }
}
