        let _videoPlayerCleanup = null;

        /**
         * @param {string} filePath - Safe asset path to a .mp4 video file
         * @param {string} label - Human-readable label for the title bar
         *
         * Opens a <dialog> with the video, optional VTT subtitles, and a
         * resume bar if a previous position is saved. Saves progress on an
         * interval and on close. Registers all event listeners; the cleanup
         * closure (_videoPlayerCleanup) removes them on close.
         */
        function openVideoPlayer(filePath, label) {
            if (_videoPlayerCleanup) {
                _videoPlayerCleanup();
                _videoPlayerCleanup = null;
            }

            const overlay = document.getElementById('video-player-overlay');
            const video = document.getElementById('vp-video');
            const title = document.getElementById('vp-title');
            const resumeBar = document.getElementById('vp-resume-bar');
            const resumeText = document.getElementById('vp-resume-text');
            const resumeBtn = document.getElementById('vp-resume-btn');
            const startBtn = document.getElementById('vp-start-btn');
            if (!overlay || !video) return;

            const lastFocusBeforeVideo = document.activeElement;

            const existingTracks = video.querySelectorAll('track');
            existingTracks.forEach(t => t.remove());

            title.textContent = label || filePath;
            video.src = filePath;
            video.load();

            const dotIndex = filePath.lastIndexOf('.');
            if (dotIndex !== -1) {
                const vttPath = filePath.substring(0, dotIndex) + '.vtt';
                fetch(vttPath, { method: 'HEAD' })
                    .then(res => {
                        if (res.ok) {
                            const track = document.createElement('track');
                            track.kind = 'captions';
                            track.label = 'English';
                            track.srclang = 'en';
                            track.src = vttPath;
                            track.default = true;
                            video.appendChild(track);
                        }
                    })
                    .catch(err => console.warn('VTT caption check failed:', err?.message));
            }

            const savedTime = getSavedVideoResumeTime(filePath);

            resumeBar.style.display = 'none';
            if (savedTime > CONFIG.RESUME_MIN_SECONDS) {
                const mins = Math.floor(savedTime / 60);
                const secs = Math.floor(savedTime % 60);
                resumeText.textContent = `Resume from ${mins}:${secs.toString().padStart(2, '0')}?`;
                if (resumeBtn) resumeBtn.setAttribute('aria-label', 'Resume ' + (label || filePath));
                if (startBtn) startBtn.setAttribute('aria-label', 'Start ' + (label || filePath) + ' from the beginning');
                resumeBar.style.display = 'flex';
                resumeBtn.addEventListener('click', () => { video.currentTime = savedTime; resumeBar.style.display = 'none'; video.play(); }, { once: true });
                startBtn.addEventListener('click', () => { clearVideoResumePosition(filePath); resumeBar.style.display = 'none'; video.play(); }, { once: true });
            }

            const saveProgress = () => saveVideoResumePosition(filePath, video.currentTime);
            const vpInterval = setInterval(saveProgress, CONFIG.PROGRESS_SAVE_MS);

            const onClose = () => {
                if (!overlay.open) return;
                saveProgress();
                video.pause();
                video.removeAttribute('src');
                video.load();
                overlay.close();
                if (lastFocusBeforeVideo && typeof lastFocusBeforeVideo.focus === 'function') {
                    try { lastFocusBeforeVideo.focus(); } catch(e) { /* ignore */ }
                }
                if (_videoPlayerCleanup) {
                    _videoPlayerCleanup();
                    _videoPlayerCleanup = null;
                }
            };

            const cancelListener = (e) => { e.preventDefault(); onClose(); };
            overlay.addEventListener('cancel', cancelListener);

            const hashChangeListener = onClose;
            window.addEventListener('hashchange', hashChangeListener);

            const closeBtn = document.getElementById('vp-close');
            const overlayClickHandler = (e) => { if (e.target === overlay) onClose(); };
            closeBtn.addEventListener('click', onClose);
            overlay.addEventListener('click', overlayClickHandler);

            const errorHandler = () => {
                onClose();
                showToast('This file is not available yet. Materials appear closer to the meeting date.');
            };
            video.addEventListener('error', errorHandler, { once: true });

            _videoPlayerCleanup = () => {
                clearInterval(vpInterval);
                overlay.removeEventListener('cancel', cancelListener);
                window.removeEventListener('hashchange', hashChangeListener);
                closeBtn.removeEventListener('click', onClose);
                overlay.removeEventListener('click', overlayClickHandler);
                video.removeEventListener('error', errorHandler);
                _videoPlayerCleanup = null;
            };

            overlay.showModal();
        }

        /** Closes the video dialog overlay and runs cleanup. */
        function closeVideoPlayer() {
            if (_videoPlayerCleanup) {
                _videoPlayerCleanup();
            }
            const overlay = document.getElementById('video-player-overlay');
            if (overlay && overlay.open) {
                overlay.close();
            }
        }
