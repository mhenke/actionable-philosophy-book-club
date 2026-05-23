import test from 'node:test';
import assert from 'node:assert';
import { loadSource } from './test-helper.js';

const { formatDuration, formatFileSize } = loadSource('src/format.js');

test('formatDuration formats seconds correctly', () => {
    assert.strictEqual(formatDuration(0), '0m 0s');
    assert.strictEqual(formatDuration(125), '2m 5s');
    assert.strictEqual(formatDuration(3661), '1h 1m');
    assert.strictEqual(formatDuration(Infinity), '');
    assert.strictEqual(formatDuration(-1), '');
});

test('formatFileSize formats megabytes correctly', () => {
    assert.strictEqual(formatFileSize(0.5), '512 KB');
    assert.strictEqual(formatFileSize(5.2), '5.2 MB');
    assert.strictEqual(formatFileSize(100), '100 MB');
    assert.strictEqual(formatFileSize(Infinity), '');
});
