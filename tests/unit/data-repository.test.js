import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../../');

/**
 * Loads the repository stack (data-meeting.js, asset-copy.js, data-repository.js)
 * into a fresh VM context. Returns the window object the modules attach to.
 *
 * The test injects __MANIFEST_DATA into the window before each test so that
 * loadRepository() resolves inline data deterministically (no fetch).
 */
function loadRepositoryStack({ manifestData = null, manifestFetch = null } = {}) {
    const dataMeetingCode = fs.readFileSync(path.resolve(PROJECT_ROOT, 'src/data-meeting.js'), 'utf8');
    const assetCopyCode = fs.readFileSync(path.resolve(PROJECT_ROOT, 'src/asset-copy.js'), 'utf8');
    const dataRepoCode = fs.readFileSync(path.resolve(PROJECT_ROOT, 'src/data-repository.js'), 'utf8');

    const fetchedUrls = [];
    const windowObject = {
        __TEST__: true,
        ErrorHandler: { warn() {} },
        __MANIFEST_DATA: manifestData,
    };
    const context = {
        window: windowObject,
        fetch: manifestFetch || (async (url) => {
            fetchedUrls.push(url);
            return { ok: true, json: async () => manifestData };
        }),
        AbortController,
        setTimeout,
        clearTimeout,
    };
    vm.createContext(context);

    vm.runInContext(dataMeetingCode, context);
    vm.runInContext(assetCopyCode, context);
    vm.runInContext(dataRepoCode, context);

    return { window: context.window, context, fetchedUrls };
}

const VALID_MANIFEST = {
    meetings: [
        { id: 'meeting-01', title: 'Deep Work', status: 'done' },
        { id: 'meeting-02', title: 'Philosophy of Software Design', status: 'upcoming' },
        { id: 'meeting-03', title: 'Draft Topic', status: 'draft' },
    ],
    assetCopy: { 'deep-dive': { label: 'Deep Dive' } },
};

test('loadRepository: returns a MeetingRepository populated from inline manifest data', async () => {
    const { window } = loadRepositoryStack({ manifestData: VALID_MANIFEST });

    const repo = await window.loadRepository();

    assert.ok(repo instanceof window.MeetingRepository);
    assert.strictEqual(repo.meetings.length, 3);
    assert.strictEqual(repo.meetings[0].id, 'meeting-01');
    assert.strictEqual(repo.meetings[1].status, 'upcoming');
    assert.strictEqual(repo.meetings[2].title, 'Draft Topic');
});

test('loadRepository: populates findMeetings so the dashboard sees meetings', async () => {
    const { window } = loadRepositoryStack({ manifestData: VALID_MANIFEST });

    await window.loadRepository();

    const done = window.findMeetings({ status: 'done' });
    assert.strictEqual(done.length, 1);
    assert.strictEqual(done[0].id, 'meeting-01');

    const upcoming = window.findMeetings({ status: 'upcoming' });
    assert.strictEqual(upcoming.length, 1);
    assert.strictEqual(upcoming[0].id, 'meeting-02');

    const byId = window.findMeetings({ id: 'meeting-03' });
    assert.strictEqual(byId.id, 'meeting-03');
});

test('loadRepository: throws when manifest has no meetings array', async () => {
    const { window } = loadRepositoryStack({ manifestData: { assetCopy: {} } });

    await assert.rejects(
        window.loadRepository(),
        /Invalid manifest structure/
    );
});

test('loadRepository: throws when manifest meetings is not an array', async () => {
    const { window } = loadRepositoryStack({ manifestData: { meetings: 'not-an-array' } });

    await assert.rejects(
        window.loadRepository(),
        /Invalid manifest structure/
    );
});

test('loadRepository: fetches docs/manifest.json when no inline data is present', async () => {
    const { window, fetchedUrls } = loadRepositoryStack({ manifestData: VALID_MANIFEST, manifestFetch: null });

    delete window.__MANIFEST_DATA;
    const repo = await window.loadRepository();

    assert.strictEqual(fetchedUrls.length, 1);
    assert.strictEqual(fetchedUrls[0], 'docs/manifest.json');
    assert.strictEqual(repo.meetings.length, 3);
});

test('findMeetings: returns empty array when repository has not been loaded', () => {
    const { window } = loadRepositoryStack({ manifestData: null });

    delete window.__MANIFEST_DATA;

    assert.strictEqual(window.findMeetings({ status: 'done' }).length, 0);
    assert.strictEqual(window.findMeetings({ id: 'meeting-01' }), null);
});
