'use strict';
const dashboard = document.getElementById('dashboard-view');
const reader = document.getElementById('reader-view');
const markdownContent = document.getElementById('markdown-content');
const readerStatus = document.getElementById('reader-status');
const mdCache = new Map();

let MEETINGS = [];
let ASSET_COPY = {};

const DEFAULT_ASSET_COPY = Object.freeze({
    alternate: { label: 'Alternate', title: 'A different take on the session topic', icon: '🎬', color: 'var(--spectrum-2)' },
    'deep-dive': { label: 'Deep Dive', title: 'An exploration of the session topic', icon: '🔬', color: 'var(--spectrum-2)' },
    critique: { label: 'Critique', title: 'A critical analysis of the key arguments and trade-offs', icon: '🔍', color: 'var(--spectrum-2)' },
    debate: { label: 'Debate', title: 'A structured debate between two design perspectives', icon: '⚔️', color: 'var(--spectrum-2)' },
});
