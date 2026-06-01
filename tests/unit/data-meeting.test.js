import test from 'node:test';
import assert from 'node:assert';
import { loadSource } from './test-helper.js';

const { Meeting } = loadSource('src/data-meeting.js');

test('Meeting constructor - required fields validation', () => {
    assert.throws(() => {
        new Meeting({ title: 'Session 1', status: 'done' });
    }, /id is required/);

    assert.throws(() => {
        new Meeting({ id: 'meeting-01', status: 'done' });
    }, /title is required/);

    assert.throws(() => {
        new Meeting({ id: 'meeting-01', title: 'Session 1', status: 'invalid' });
    }, /status must be/);
});

test('Meeting constructor - succeeds with valid fields', () => {
    const m = new Meeting({ id: 'meeting-01', title: 'Session 1', status: 'done' });
    assert.strictEqual(m.id, 'meeting-01');
    assert.strictEqual(m.title, 'Session 1');
    assert.strictEqual(m.status, 'done');
});

test('Meeting methods - hasVideo validation', () => {
    const done = new Meeting({ id: 'meeting-01', title: 'S1', status: 'done', video: { file: 'video.mp4' } });
    const upcoming = new Meeting({ id: 'meeting-02', title: 'S2', status: 'upcoming', video: { file: 'video.mp4' } });
    const doneNoVideo = new Meeting({ id: 'meeting-03', title: 'S3', status: 'done' });

    assert.strictEqual(done.hasVideo(), true);
    assert.strictEqual(upcoming.hasVideo(), false);
    assert.strictEqual(doneNoVideo.hasVideo(), false);
});

test('Meeting methods - status getters', () => {
    const m = new Meeting({ id: 'meeting-01', title: 'S1', status: 'done' });
    assert.strictEqual(m.status, 'done');
});

test('Meeting constructor - assets mapping', () => {
    const m = new Meeting({
        id: 'meeting-01',
        title: 'S1',
        status: 'done',
        video: { file: 'video.mp4' },
        slides: { file: 'slides.pptx' },
        additional_material: [
            { label: 'Deep Dive', file: 'podcast.m4a', category: 'deep-dive' },
            { label: 'Guide', file: 'image.png' }
        ]
    });
    assert.strictEqual(m.video.file, 'video.mp4');
    assert.strictEqual(m.slides.file, 'slides.pptx');
    assert.strictEqual(m.additional_material.length, 2);
    assert.strictEqual(m.additional_material[0].category, 'deep-dive');
    assert.strictEqual(m.additional_material[1].file, 'image.png');
});

test('Meeting constructor - optional fields mapping', () => {
    const m = new Meeting({
        id: 'meeting-01',
        title: 'S1',
        status: 'done',
        date: '2024-01-01',
        video: { file: 'video.mp4', label: 'Main Recording' },
        slides: { file: 'slides.pptx' },
        additional_material: [
            { label: 'Deep Dive', file: 'podcast.m4a', category: 'deep-dive' }
        ],
        color: 'spectrum-1',
        wash: 'wash-1',
        duration: 3600
    });
    assert.strictEqual(m.date, '2024-01-01');
    assert.strictEqual(m.color, 'spectrum-1');
    assert.strictEqual(m.wash, 'wash-1');
    assert.strictEqual(m.duration, 3600);
    assert.strictEqual(m.video.label, 'Main Recording');
    assert.strictEqual(m.additional_material.length, 1);
});
