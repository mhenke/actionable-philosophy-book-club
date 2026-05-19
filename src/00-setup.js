        'use strict';
        const dashboard = document.getElementById('dashboard-view');
        const reader    = document.getElementById('reader-view');
        const content   = document.getElementById('markdown-content');
        const readerStatus = document.getElementById('reader-status');
        // Meeting data manifest, loaded from docs/manifest.json at startup.
        let MEETINGS = [];
        let ASSET_COPY = {};

        const DEFAULT_ASSET_COPY = Object.freeze({
            alternate: { label: 'Alternate Cut', title: 'A companion recording of the session' },
            'deep-dive': { label: 'Deep Dive', title: 'A solo exploration of the session topic' },
            critique: { label: 'Critique', title: 'A critical analysis of the key arguments and trade-offs' },
            debate: { label: 'Debate', title: 'A structured debate between two design perspectives' },
        });

        const LS = 'apbc:';
        const CONFIG = Object.freeze({
            CACHE_MAX: 20,
            RESUME_MIN_SECONDS: 5,
            PROGRESS_SAVE_MS: 3000,
            TOAST_DURATION_MS: 4500,
            TOAST_FADE_MS: 300,
            STATUS_RESET_MS: 1000,
            PATH_MAX_LENGTH: 256,
        });
        let activeReaderController = null;
        const RAW_CONTENT_BASE = 'https://raw.githubusercontent.com/mhenke/actionable-philosophy-book-club/main/';
        let videoPlayerCleanup = null;
