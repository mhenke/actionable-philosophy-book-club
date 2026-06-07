import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../../');

function loadModule(filePath) {
    const code = fs.readFileSync(path.resolve(PROJECT_ROOT, filePath), 'utf8');
    const windowObject = { __TEST__: true };
    const context = { window: windowObject, setTimeout, clearTimeout };
    vm.createContext(context);
    vm.runInContext(code, context);
    return { window: context.window, source: code };
}

function readSource(filePath) {
    return fs.readFileSync(path.resolve(PROJECT_ROOT, filePath), 'utf8');
}

test('storage.js exposes VideoResumeConfig as a frozen object with documented values', () => {
    const { window } = loadModule('src/storage.js');
    assert.ok(window.VideoResumeConfig, 'VideoResumeConfig should be set on window');
    assert.strictEqual(window.VideoResumeConfig.MIN_SECONDS, 5);
    assert.strictEqual(window.VideoResumeConfig.SAVE_INTERVAL_MS, 3000);
    assert.strictEqual(Object.isFrozen(window.VideoResumeConfig), true, 'config should be frozen so the contract is clear');
});

test('viewer.js exposes ExternalLinkConfig as a frozen object with documented values', () => {
    const { window } = loadModule('src/viewer.js');
    assert.ok(window.ExternalLinkConfig, 'ExternalLinkConfig should be set on window');
    assert.strictEqual(window.ExternalLinkConfig.REL, 'noopener noreferrer');
    assert.strictEqual(window.ExternalLinkConfig.OFFICE_VIEWER_ORIGIN, 'https://view.officeapps.live.com');
    assert.strictEqual(Object.isFrozen(window.ExternalLinkConfig), true, 'config should be frozen so the contract is clear');
});

test('storage.js no longer sets bare RESUME_MIN_SECONDS / PROGRESS_SAVE_MS globals', () => {
    const { window, source } = loadModule('src/storage.js');
    assert.strictEqual(window.RESUME_MIN_SECONDS, undefined, 'window.RESUME_MIN_SECONDS should be gone');
    assert.strictEqual(window.PROGRESS_SAVE_MS, undefined, 'window.PROGRESS_SAVE_MS should be gone');
    assert.ok(!/window\.RESUME_MIN_SECONDS\s*=/.test(source), 'source should not assign to window.RESUME_MIN_SECONDS');
    assert.ok(!/window\.PROGRESS_SAVE_MS\s*=/.test(source), 'source should not assign to window.PROGRESS_SAVE_MS');
});

test('viewer.js no longer sets bare REL_EXTERNAL / OFFICE_VIEWER_ORIGIN globals', () => {
    const { window, source } = loadModule('src/viewer.js');
    assert.strictEqual(window.REL_EXTERNAL, undefined, 'window.REL_EXTERNAL should be gone');
    assert.strictEqual(window.OFFICE_VIEWER_ORIGIN, undefined, 'window.OFFICE_VIEWER_ORIGIN should be gone');
    assert.ok(!/window\.REL_EXTERNAL\s*=/.test(source), 'source should not assign to window.REL_EXTERNAL');
    assert.ok(!/window\.OFFICE_VIEWER_ORIGIN\s*=/.test(source), 'source should not assign to window.OFFICE_VIEWER_ORIGIN');
});

test('video-player.js reads from VideoResumeConfig (not bare RESUME_MIN_SECONDS / PROGRESS_SAVE_MS)', () => {
    const code = readSource('src/video-player.js');
    assert.ok(/VideoResumeConfig\./.test(code), 'video-player should reference VideoResumeConfig');
    assert.ok(!/\bRESUME_MIN_SECONDS\b/.test(code), 'video-player should not reference bare RESUME_MIN_SECONDS');
    assert.ok(!/\bPROGRESS_SAVE_MS\b/.test(code), 'video-player should not reference bare PROGRESS_SAVE_MS');
});

test('assets.js reads from ExternalLinkConfig.REL (not bare REL_EXTERNAL)', () => {
    const code = readSource('src/assets.js');
    assert.ok(/ExternalLinkConfig\./.test(code), 'assets should reference ExternalLinkConfig');
    assert.ok(!/\bREL_EXTERNAL\b/.test(code), 'assets should not reference bare REL_EXTERNAL');
});

test('reader-loader.js reads from ExternalLinkConfig (not bare REL_EXTERNAL / OFFICE_VIEWER_ORIGIN)', () => {
    const code = readSource('src/reader-loader.js');
    assert.ok(/ExternalLinkConfig\./.test(code), 'reader-loader should reference ExternalLinkConfig');
    assert.ok(!/\bREL_EXTERNAL\b/.test(code), 'reader-loader should not reference bare REL_EXTERNAL');
    assert.ok(!/window\.OFFICE_VIEWER_ORIGIN\b/.test(code), 'reader-loader should not reference bare window.OFFICE_VIEWER_ORIGIN');
});
