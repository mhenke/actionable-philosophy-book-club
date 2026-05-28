/**
 * Video player overlay dialog: opens video overlay, loads video, checks captions, and manages resume.
 *
 * Public API:
 * - openVideoPlayer(filePath, label): opens overlay and initializes playback
 *
 * Side-effects: manipulates #video-player-overlay, #vp-video, #vp-title DOM nodes.
 */
(function() {
'use strict';
let _activePlayerController = null;

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

function _clearExistingTracks(video) {
    video.querySelectorAll('track').forEach(t => t.remove());
}

function _tryLoadCaptionTrack(video, filePath) {
    const dotIndex = filePath.lastIndexOf('.');
    if (dotIndex === -1) return;
    const vttPath = filePath.substring(0, dotIndex) + '.vtt';
    fetch(vttPath, { method: 'HEAD' })
        .then(res => {
            if (!res.ok) return;
            const track = document.createElement('track');
            track.kind = 'captions';
            track.label = 'English';
            track.srclang = 'en';
            track.src = vttPath;
            track.default = true;
            video.appendChild(track);
        })
        .catch(err => window.ErrorHandler?.warn('VTT caption check failed:', { err }));
}

function _setupResumeBar(resumeBar, resumeText, resumeBtn, startBtn, video, filePath, label, signal) {
    resumeBar.style.display = 'none';
    const savedTime = getSavedVideoResumeTime(filePath);
    if (savedTime <= RESUME_MIN_SECONDS) return;

    const mins = Math.floor(savedTime / 60);
    const secs = Math.floor(savedTime % 60);
    resumeText.textContent = `Resume from ${mins}:${secs.toString().padStart(2, '0')}?`;
    if (resumeBtn) resumeBtn.setAttribute('aria-label', 'Resume ' + (label || filePath));
    if (startBtn) startBtn.setAttribute('aria-label', 'Start ' + (label || filePath) + ' from the beginning');
    resumeBar.style.display = 'flex';

    const onResume = () => {
        video.currentTime = savedTime;
        resumeBar.style.display = 'none';
        video.play();
    };
    const onStart = () => {
        clearVideoResumePosition(filePath);
        resumeBar.style.display = 'none';
        video.play();
    };

    resumeBtn.addEventListener('click', onResume, { once: true, signal });
    startBtn.addEventListener('click', onStart, { once: true, signal });
}

function _wireVideoEvents(els, lastFocus, filePath, signal) {
    const saveProgress = () => saveVideoResumePosition(filePath, els.video.currentTime);
    const vpInterval = setInterval(saveProgress, PROGRESS_SAVE_MS);
    signal.addEventListener('abort', () => clearInterval(vpInterval), { once: true });

    const onClose = () => {
        if (!els.overlay.open) return;
        saveProgress();
        els.video.pause();
        els.video.removeAttribute('src');
        els.video.load();
        els.overlay.close();
        if (lastFocus && typeof lastFocus.focus === 'function') {
            try { lastFocus.focus(); } catch(e) { /* ignore */ }
        }
    };

    els.overlay.addEventListener('cancel', (e) => { e.preventDefault(); onClose(); }, { signal });
    window.addEventListener('hashchange', onClose, { signal });
    els.closeBtn.addEventListener('click', onClose, { signal });
    els.overlay.addEventListener('click', (e) => { if (e.target === els.overlay) onClose(); }, { signal });
    els.video.addEventListener('error', () => { onClose(); showToast('This file is not available yet. Materials appear closer to the meeting date.'); }, { once: true, signal });
}

/** Opens the video overlay dialog, loads the video, checks for VTT captions, shows resume bar if position saved. */
function openVideoPlayer(filePath, label) {
    if (_activePlayerController) {
        _activePlayerController.abort();
    }

    const els = _getVideoPlayerElements();
    if (!els.overlay || !els.video) return;

    const lastFocusBeforeVideo = document.activeElement;
    const controller = new AbortController();
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

/** Closes the video player dialog and cleans up event listeners. */
function closeVideoPlayer() {
    if (_activePlayerController) {
        _activePlayerController.abort();
        _activePlayerController = null;
    }
    const overlay = document.getElementById('video-player-overlay');
    if (overlay && overlay.open) {
        overlay.close();
    }
}

window.openVideoPlayer = openVideoPlayer;
window.closeVideoPlayer = closeVideoPlayer;
})();
