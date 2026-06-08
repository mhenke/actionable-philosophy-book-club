import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../../');

/**
 * Loads the meeting data stack (data-meeting.js, asset-copy.js, manifest-loader.js,
 * meeting-repository.js) into a fresh VM context. Returns the window object the
 * modules attach to.
 *
 * The test injects __MANIFEST_DATA into the window before each test so that
 * loadManifest() resolves inline data deterministically (no fetch).
 */
function loadMeetingStack({ manifestData = null, manifestFetch = null } = {}) {
    const dataMeetingCode = fs.readFileSync(path.resolve(PROJECT_ROOT, 'src/data-meeting.js'), 'utf8');
    const assetCopyCode = fs.readFileSync(path.resolve(PROJECT_ROOT, 'src/asset-copy.js'), 'utf8');
    const manifestLoaderCode = fs.readFileSync(path.resolve(PROJECT_ROOT, 'src/manifest-loader.js'), 'utf8');
    const meetingRepoCode = fs.readFileSync(path.resolve(PROJECT_ROOT, 'src/meeting-repository.js'), 'utf8');

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
    vm.runInContext(manifestLoaderCode, context);
    vm.runInContext(meetingRepoCode, context);

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

test('loadManifest: returns manifest data from inline __MANIFEST_DATA', async () => {
    const { window } = loadMeetingStack({ manifestData: VALID_MANIFEST });

    const manifest = await window.loadManifest();

    assert.ok(manifest);
    assert.strictEqual(manifest.meetings.length, 3);
    assert.strictEqual(manifest.meetings[0].id, 'meeting-01');
    assert.strictEqual(manifest.meetings[1].status, 'upcoming');
    assert.strictEqual(manifest.meetings[2].title, 'Draft Topic');
});

test('loadManifest + MeetingRepository.setAll: populates findMeetings', async () => {
    const { window } = loadMeetingStack({ manifestData: VALID_MANIFEST });

    const manifest = await window.loadManifest();
    window.MeetingRepository.setAll(manifest.meetings);

    const done = window.findMeetings({ status: 'done' });
    assert.strictEqual(done.length, 1);
    assert.strictEqual(done[0].id, 'meeting-01');

    const upcoming = window.findMeetings({ status: 'upcoming' });
    assert.strictEqual(upcoming.length, 1);
    assert.strictEqual(upcoming[0].id, 'meeting-02');

    const byId = window.findMeetings({ id: 'meeting-03' });
    assert.strictEqual(byId.id, 'meeting-03');
});

test('loadManifest: throws when manifest has no meetings array', async () => {
    const { window } = loadMeetingStack({ manifestData: { assetCopy: {} } });

    await assert.rejects(
        window.loadManifest(),
        /Invalid manifest structure/
    );
});

test('loadManifest: throws when manifest meetings is not an array', async () => {
    const { window } = loadMeetingStack({ manifestData: { meetings: 'not-an-array' } });

    await assert.rejects(
        window.loadManifest(),
        /Invalid manifest structure/
    );
});

test('loadManifest: fetches docs/manifest.json when no inline data is present', async () => {
    const { window, fetchedUrls } = loadMeetingStack({ manifestData: VALID_MANIFEST, manifestFetch: null });

    delete window.__MANIFEST_DATA;
    const manifest = await window.loadManifest();

    assert.strictEqual(fetchedUrls.length, 1);
    assert.strictEqual(fetchedUrls[0], 'docs/manifest.json');
    assert.strictEqual(manifest.meetings.length, 3);
});

test('findMeetings: returns empty array when repository has not been loaded', () => {
    const { window } = loadMeetingStack({ manifestData: null });

    delete window.__MANIFEST_DATA;

    assert.strictEqual(window.findMeetings({ status: 'done' }).length, 0);
    assert.strictEqual(window.findMeetings({ id: 'meeting-01' }), null);
});

test('MeetingRepository.setAll: throws when passed a non-array', () => {
    const { window } = loadMeetingStack({ manifestData: null });

    assert.throws(
        () => window.MeetingRepository.setAll('not-an-array'),
        /MeetingRepository.setAll requires an array/
    );
    assert.throws(
        () => window.MeetingRepository.setAll({}),
        /MeetingRepository.setAll requires an array/
    );
});

test('Meeting: video and slides default to null when not provided', () => {
    const { window } = loadMeetingStack({ manifestData: null });

    const meeting = new window.Meeting({
        id: 'test-01',
        title: 'Test Meeting',
        status: 'done',
    });

    assert.strictEqual(meeting.video, null);
    assert.strictEqual(meeting.slides, null);
});

test('Meeting: hasVideo returns false when video is null or has no file', () => {
    const { window } = loadMeetingStack({ manifestData: null });

    const meeting1 = new window.Meeting({
        id: 'test-01',
        title: 'No Video',
        status: 'done',
    });
    assert.strictEqual(meeting1.hasVideo(), false);

    const meeting2 = new window.Meeting({
        id: 'test-02',
        title: 'Empty Video',
        status: 'done',
        video: {},
    });
    assert.strictEqual(meeting2.hasVideo(), false);

    const meeting3 = new window.Meeting({
        id: 'test-03',
        title: 'Has Video',
        status: 'done',
        video: { file: 'recording.mp4' },
    });
    assert.strictEqual(meeting3.hasVideo(), true);
});
