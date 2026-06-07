import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../../');

function loadAssets(overrides = {}) {
  const absolutePath = path.resolve(PROJECT_ROOT, 'src/assets.js');
  const code = fs.readFileSync(absolutePath, 'utf8');

  const safePaths = new Set(overrides.safePaths || []);
  const escapeHTML = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const formatDuration = (secs) => `${Math.floor(secs / 60)}m${secs % 60}s`;
  const formatFileSize = (bytes) => `${bytes}B`;
  const classifyAssetPath = (p) => {
    if (/\.pptx?$/i.test(p)) return 'slides';
    if (/\.(png|jpe?g|gif|webp|svg)$/i.test(p)) return 'image';
    if (/\.mp4$/i.test(p)) return 'video';
    return 'other';
  };
  const isSafePath = (p) => safePaths.has(p);
  const DOMAIN = { ASSET: 'asset' };
  const ExternalLinkConfig = Object.freeze({ REL: 'noopener noreferrer', OFFICE_VIEWER_ORIGIN: 'https://view.officeapps.live.com' });
  const getAssetCopy = (type) => ({ icon: '🎬', color: 'var(--spectrum-2)', label: type, title: 'default' });
  const buildPPTXViewerURL = (p) => safePaths.has(p) ? `https://viewer.example/?src=${encodeURIComponent(p)}` : null;

  const windowObject = {
    __TEST__: true,
    escapeHTML, formatDuration, formatFileSize, classifyAssetPath, isSafePath, DOMAIN, ExternalLinkConfig, getAssetCopy, buildPPTXViewerURL,
    ...overrides.window,
  };

  const context = {
    window: windowObject,
    document: { createElement: () => ({}) },
    URL,
    setTimeout,
    clearTimeout,
    escapeHTML, formatDuration, formatFileSize, classifyAssetPath, isSafePath, DOMAIN, ExternalLinkConfig, getAssetCopy, buildPPTXViewerURL,
  };

  vm.createContext(context);
  vm.runInContext(code, context);
  return context.window;
}

test('assets module exposes test hooks when __TEST__ is enabled', () => {
  const win = loadAssets();
  assert.ok(win.__assetsTestHooks);
  assert.strictEqual(typeof win.__assetsTestHooks.buildAssetRows, 'function');
  assert.strictEqual(typeof win.__assetsTestHooks.buildPodcastDisclosure, 'function');
  assert.strictEqual(typeof win.__assetsTestHooks.buildAdditionalRow, 'function');
  assert.strictEqual(typeof win.__assetsTestHooks.buildAdditionalSummary, 'function');
});

test('buildAssetRows: archive meeting with no video and includePlaceholders=true renders video placeholder in primaryRows', () => {
  const win = loadAssets({ safePaths: new Set() });
  const meeting = { id: 'meeting-99', session: 'S99', video: {}, slides: {}, additional_material: [] };
  const { primaryRows } = win.__assetsTestHooks.buildAssetRows(meeting, { includePlaceholders: true });
  assert.ok(primaryRows.length === 2, `expected 2 placeholder rows, got ${primaryRows.length}`);
  assert.ok(primaryRows[0].includes('Video Recording'), 'expected first placeholder to be Video Recording');
  assert.ok(primaryRows[1].includes('Slides'), 'expected second placeholder to be Slides');
});

test('buildAssetRows: archive meeting with no video and includePlaceholders=false returns empty primaryRows', () => {
  const win = loadAssets({ safePaths: new Set() });
  const meeting = { id: 'meeting-99', session: 'S99', video: {}, slides: {}, additional_material: [] };
  const { primaryRows } = win.__assetsTestHooks.buildAssetRows(meeting);
  assert.strictEqual(primaryRows.length, 0);
});

test('buildAssetRows: slides row is omitted when file path fails isSafePath', () => {
  const win = loadAssets({ safePaths: new Set() });
  const meeting = { id: 'meeting-99', session: 'S99', video: {}, slides: { file: 'unsafe.pptx' }, additional_material: [] };
  const { primaryRows } = win.__assetsTestHooks.buildAssetRows(meeting);
  assert.strictEqual(primaryRows.length, 0, 'unsafe slides path should produce no rows');
});

test('buildAssetRows: resource strip is empty string when no images pass safety check', () => {
  const win = loadAssets({ safePaths: new Set() });
  const meeting = {
    id: 'meeting-99',
    session: 'S99',
    video: {},
    slides: {},
    additional_material: [{ file: 'safe.mp4', label: 'A video' }],
  };
  const { resourceStrip } = win.__assetsTestHooks.buildAssetRows(meeting);
  assert.strictEqual(resourceStrip, '');
});

test('buildAssetRows: safe video path produces one row in primaryRows', () => {
  const win = loadAssets({ safePaths: new Set(['meetings/meeting-99/video.mp4']) });
  const meeting = {
    id: 'meeting-99',
    session: 'S99',
    video: { file: 'meetings/meeting-99/video.mp4', label: 'Talk', duration: 1800, fileSize: 1024 },
    slides: {},
    additional_material: [],
  };
  const { primaryRows } = win.__assetsTestHooks.buildAssetRows(meeting);
  assert.strictEqual(primaryRows.length, 1);
  assert.ok(primaryRows[0].includes('Talk'), 'video row should contain the label');
  assert.ok(primaryRows[0].includes('asset-meeting-99-video-video'), 'video row should use slugified id derived from filename');
});
