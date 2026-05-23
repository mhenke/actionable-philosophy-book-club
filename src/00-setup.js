'use strict';
const dashboard = document.getElementById('dashboard-view');
const reader = document.getElementById('reader-view');
const content = document.getElementById('markdown-content');
const readerStatus = document.getElementById('reader-status');
const mdCache = new Map();  // Meeting markdown cache (Promises)

// Meeting data manifest, loaded from docs/manifest.json at startup.
let MEETINGS = [];
let ASSET_COPY = {};

const DEFAULT_ASSET_COPY = Object.freeze({
    alternate: { label: 'Alternate', title: 'A different take on the session topic' },
    'deep-dive': { label: 'Deep Dive', title: 'An exploration of the session topic' },
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
const RAW_CONTENT_BASE = (() => {
    const hostParts = window.location.hostname.split('.');
    if (hostParts.length >= 2 && hostParts[1] === 'github') {
        const owner = hostParts[0];
        const repo = window.location.pathname.replace(/^\/|\/+$/g, '').split('/')[0] || 'actionable-philosophy-book-club';
        return `https://raw.githubusercontent.com/${owner}/${repo}/main/`;
    }
    return 'https://raw.githubusercontent.com/mhenke/actionable-philosophy-book-club/main/';
})();
let videoPlayerCleanup = null;
