/**
 * Media module: consolidated video/audio handling.
 *
 * Self-contained module that inlines video resume (sessionStorage), VTT caption
 * loading, asset path classification, and click delegation from the former
 * video-player.js, storage.js, asset-delegation.js, and viewer.js.
 *
 * Public API:
 *   setupMediaInteraction(containerEl) → void   // wires click delegation
 *   classify(path) → 'video' | 'audio' | 'slides' | 'image' | 'other'
 *   playVideo(filePath, label) → void            // opens video overlay dialog
 *   closeVideoPlayer() → void                    // closes video overlay
 *
 * Dependencies (global): window.callOnce, window.isSafePath, window.DOMAIN,
 *   window.ErrorHandler, window.showToast
 *
 * Side-effects: manipulates #video-player-overlay, #vp-video, #vp-title DOM
 *   nodes; reads/writes sessionStorage.
 */
(function() {
'use strict';

/* ───── Constants ───── */

const MIN_SECONDS = 5;
const SAVE_INTERVAL_MS = 3000;
const STORAGE_KEY_PREFIX = 'apbc:';
const STORAGE_VIDEO_PREFIX = 'vs:';
const OFFICE_VIEWER_ORIGIN = 'https://view.officeapps.live.com';
let _rawContentBase = null;

/* ───── Internal: raw content base for PPTX viewer URL ───── */

function _getRawContentBase() {
    if (_rawContentBase) return _rawContentBase;
    const hostParts = window.location.hostname.split('.');
    if (hostParts.length >= 2 && hostParts[1] === 'github') {
        const owner = hostParts[0];
        const repo = window.location.pathname.replace(/^\/|\/+$/g, '').split('/')[0] || 'actionable-philosophy-book-club';
        return 'https://raw.githubusercontent.com/' + owner + '/' + repo + '/main/';
    }
    return 'https://raw.githubusercontent.com/mhenke/actionable-philosophy-book-club/main/';
}

/* ───── Internal: video resume (sessionStorage) ───── */

function _buildStorageKey(suffix) {
    return STORAGE_KEY_PREFIX + suffix;
}

function _getVideoResumeKey(filePath) {
    return _buildStorageKey(STORAGE_VIDEO_PREFIX + filePath);
}

function _getSavedVideoResumeTime(filePath) {
    try {
        const saved = sessionStorage.getItem(_getVideoResumeKey(filePath));
        return saved ? parseFloat(saved) : 0;
    } catch (err) {
        window.ErrorHandler?.warn('sessionStorage read failed:', { err });
        return 0;
    }
}

function _saveVideoResumePosition(filePath, currentTime) {
    const key = _getVideoResumeKey(filePath);
    try {
        if (currentTime > MIN_SECONDS) {
            sessionStorage.setItem(key, '' + currentTime);
        } else {
            sessionStorage.removeItem(key);
        }
    } catch (err) {
        window.ErrorHandler?.warn('sessionStorage write failed:', { err });
    }
}

function _clearVideoResumePosition(filePath) {
    try {
        sessionStorage.removeItem(_getVideoResumeKey(filePath));
    } catch (err) {
        window.ErrorHandler?.warn('sessionStorage clear failed:', { err });
    }
}

/* ───── Internal: VTT caption loading ───── */

function _clearExistingTracks(video) {
    video.querySelectorAll('track').forEach(function(t) { t.remove(); });
}

function _tryLoadCaptionTrack(video, filePath) {
    var dotIndex = filePath.lastIndexOf('.');
    if (dotIndex === -1) return;
    var vttPath = filePath.substring(0, dotIndex) + '.vtt';
    fetch(vttPath, { method: 'HEAD' })
        .then(function(res) {
            if (!res.ok) return;
            var track = document.createElement('track');
            track.kind = 'captions';
            track.label = 'English';
            track.srclang = 'en';
            track.src = vttPath;
            track.default = true;
            video.appendChild(track);
        })
        .catch(function(err) {
            window.ErrorHandler?.warn('VTT caption check failed:', { err: err });
        });
}

/* ───── Internal: video player elements ───── */

function _getVideoPlayerElements() {
    return {
        overlay: document.getElementById('video-player-overlay'),
        video: document.getElementById('vp-video'),
        title: document.getElementById('vp-title'),
        resumeBar: document.getElementById('vp-resume-bar'),
        resumeText: document.getElementById('vp-resume-text'),
        resumeBtn: document.getElementById('vp-resume-btn'),
        startBtn: document.getElementById('vp-start-btn'),
        closeBtn: document.getElementById('vp-close'),
    };
}

/* ───── Internal: resume bar ───── */

function _setupResumeBar(resumeBar, resumeText, resumeBtn, startBtn, video, filePath, label, signal) {
    resumeBar.style.display = 'none';
    var savedTime = _getSavedVideoResumeTime(filePath);
    if (savedTime <= MIN_SECONDS) return;

    var mins = Math.floor(savedTime / 60);
    var secs = Math.floor(savedTime % 60);
    resumeText.textContent = 'Resume from ' + mins + ':' + secs.toString().padStart(2, '0') + '?';
    if (resumeBtn) resumeBtn.setAttribute('aria-label', 'Resume ' + (label || filePath));
    if (startBtn) startBtn.setAttribute('aria-label', 'Start ' + (label || filePath) + ' from the beginning');
    resumeBar.style.display = 'flex';

    function onResume() {
        video.currentTime = savedTime;
        resumeBar.style.display = 'none';
        video.play();
    }
    function onStart() {
        _clearVideoResumePosition(filePath);
        resumeBar.style.display = 'none';
        video.play();
    }

    resumeBtn.addEventListener('click', onResume, { once: true, signal: signal });
    startBtn.addEventListener('click', onStart, { once: true, signal: signal });
}

/* ───── Internal: event wiring ───── */

function _wireVideoEvents(els, lastFocus, filePath, signal) {
    function saveProgress() {
        _saveVideoResumePosition(filePath, els.video.currentTime);
    }
    var vpInterval = setInterval(saveProgress, SAVE_INTERVAL_MS);
    signal.addEventListener('abort', function() { clearInterval(vpInterval); }, { once: true });

    function onClose() {
        if (!els.overlay.open) return;
        saveProgress();
        els.video.pause();
        els.video.removeAttribute('src');
        els.video.load();
        els.overlay.close();
        if (lastFocus && typeof lastFocus.focus === 'function') {
            try { lastFocus.focus(); } catch (e) { /* ignore */ }
        }
    }

    els.overlay.addEventListener('cancel', function(e) { e.preventDefault(); onClose(); }, { signal: signal });
    window.addEventListener('hashchange', onClose, { signal: signal });
    els.closeBtn.addEventListener('click', onClose, { signal: signal });
    els.overlay.addEventListener('click', function(e) { if (e.target === els.overlay) onClose(); }, { signal: signal });
    els.video.addEventListener('error', function() {
        onClose();
        window.showToast('This file is not available yet. Materials appear closer to the meeting date.');
    }, { once: true, signal: signal });
}

/* ───── Private state ───── */

var _activePlayerController = null;

/* ══════════════════════════════════════════════════════════════════════════
   Public API
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Classifies a file path by extension. Single source of truth for
 * file-type decisions across the application.
 *
 * @param {string} path - File path string.
 * @returns {'video'|'audio'|'slides'|'image'|'other'}
 */
function classify(path) {
    if (/\.pptx?$/i.test(path)) return 'slides';
    if (/\.(png|jpe?g|gif|webp|svg)$/i.test(path)) return 'image';
    if (/\.mp4$/i.test(path)) return 'video';
    if (/\.(m4a|mp3|wav|ogg)$/i.test(path)) return 'audio';
    return 'other';
}

/**
 * Builds an Office Online viewer URL for a PPTX file path.
 * Returns null if the path is unsafe.
 *
 * @param {string} path - Relative path to the PPTX file.
 * @returns {string|null}
 */
function buildPPTXViewerURL(path) {
    if (!window.isSafePath(path, window.DOMAIN.ASSET)) return null;
    return OFFICE_VIEWER_ORIGIN + '/op/view.aspx?src=' + encodeURIComponent(_getRawContentBase() + path);
}

/**
 * Opens the video overlay dialog, loads the video, checks for VTT captions,
 * and shows the resume bar if a position was saved.
 *
 * @param {string} filePath - Path to the video file.
 * @param {string} [label] - Display label for the video.
 */
function playVideo(filePath, label) {
    if (_activePlayerController) {
        _activePlayerController.abort();
    }

    var els = _getVideoPlayerElements();
    if (!els.overlay || !els.video) return;

    var lastFocusBeforeVideo = document.activeElement;
    var controller = new AbortController();
    _activePlayerController = controller;

    _clearExistingTracks(els.video);
    els.title.textContent = label || filePath;
    els.video.src = filePath;
    els.video.load();

    _tryLoadCaptionTrack(els.video, filePath);
    _setupResumeBar(els.resumeBar, els.resumeText, els.resumeBtn, els.startBtn, els.video, filePath, label, controller.signal);
    _wireVideoEvents(els, lastFocusBeforeVideo, filePath, controller.signal);

    els.overlay.showModal();
}

/**
 * Closes the video player dialog and cleans up event listeners.
 */
function closeVideoPlayer() {
    if (_activePlayerController) {
        _activePlayerController.abort();
        _activePlayerController = null;
    }
    var overlay = document.getElementById('video-player-overlay');
    if (overlay && overlay.open) {
        overlay.close();
    }
}

/**
 * Sets up delegated click handlers on a container with [data-asset-container].
 * Routes video clicks to the overlay player, all others to navigation.
 *
 * @param {HTMLElement} containerEl - Container element (must have data-asset-container attribute).
 */
function setupMediaInteraction(containerEl) {
    if (!window.callOnce(containerEl)) return;

    containerEl.addEventListener('click', function(e) {
        var link = e.target.closest('.asset-link');
        if (!link) return;

        var dl = e.target.closest('.asset-dl');
        if (dl) return;

        var href = link.getAttribute('href');
        if (!href || !window.isSafePath(href, window.DOMAIN.ASSET)) return;
        e.preventDefault();

        if (classify(href) === 'video') {
            var labelEl = link.querySelector('.asset-link-top') || link;
            playVideo(href, (labelEl.textContent || '').trim() || href);
        } else {
            window.location.href = href;
        }
    });
}

/* ───── Export ───── */

window.setupMediaInteraction = setupMediaInteraction;
window.classify = classify;
window.playVideo = playVideo;
window.closeVideoPlayer = closeVideoPlayer;
window.buildPPTXViewerURL = buildPPTXViewerURL;

/* ───── Backward-compat exports (formerly in storage.js) ───── */

window.getSavedVideoResumeTime = _getSavedVideoResumeTime;
window.saveVideoResumePosition = _saveVideoResumePosition;
window.clearVideoResumePosition = _clearVideoResumePosition;
window.VideoResumeConfig = Object.freeze({
    MIN_SECONDS: MIN_SECONDS,
    SAVE_INTERVAL_MS: SAVE_INTERVAL_MS,
});
window.buildStorageKey = _buildStorageKey;

})();
