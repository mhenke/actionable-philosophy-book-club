'use strict';
const dashboard = document.getElementById('dashboard-view');
const reader = document.getElementById('reader-view');
const content = document.getElementById('markdown-content');
const readerStatus = document.getElementById('reader-status');
const mdCache = new Map();  // Meeting markdown cache (Promises)

// Meeting data manifest, loaded from docs/manifest.json at startup.
let MEETINGS = [];
let ASSET_COPY = {};
function getMeetings() { return MEETINGS; }
function setMeetings(val) { MEETINGS = val; }
function getCopyData() { return ASSET_COPY; }
function setCopyData(val) { ASSET_COPY = val; }

const DEFAULT_ASSET_COPY = Object.freeze({
    alternate: { label: 'Alternate', title: 'A different take on the session topic', icon: '🎬', color: 'var(--spectrum-2)' },
    'deep-dive': { label: 'Deep Dive', title: 'An exploration of the session topic', icon: '🔬', color: 'var(--spectrum-2)' },
    critique: { label: 'Critique', title: 'A critical analysis of the key arguments and trade-offs', icon: '🔍', color: 'var(--spectrum-2)' },
    debate: { label: 'Debate', title: 'A structured debate between two design perspectives', icon: '⚔️', color: 'var(--spectrum-2)' },
});

const STORAGE_KEY_PREFIX = 'apbc:';
const CONFIG = Object.freeze({
    CACHE_MAX: 20,
    RESUME_MIN_SECONDS: 5,
    PROGRESS_SAVE_MS: 3000,
    TOAST_DURATION_MS: 4500,
    TOAST_FADE_MS: 300,
    STATUS_RESET_MS: 1000,
    PATH_MAX_LENGTH: 256,
});

