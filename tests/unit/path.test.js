import test from 'node:test';
import assert from 'node:assert';
import { loadSource } from './test-helper.js';

const { isSafePath, DOMAIN } = loadSource('src/path.js');

test('isSafePath - valid paths', () => {
    const valid = [
        'meetings/meeting-01/README.md',
        'meetings/meeting-00/README.md',
        'docs/glossary.md',
        'docs/design-principles.md',
        'templates/prompts/README.md',
        'meetings/drafts/README.md',
        'docs/why-book-now.md',
        'meetings/meeting-01/design_principles.md',
        'templates/discussion.md',
    ];
    for (const path of valid) {
        assert.strictEqual(isSafePath(path, DOMAIN.REPO), true, `should accept: ${path}`);
    }
});

test('isSafePath - rejected paths', () => {
    const invalid = [
        ['//evil.com/x.md',                   'protocol-relative URL'],
        ['https://evil.com/x.md',             'https scheme'],
        ['http://evil.com/x.md',              'http scheme'],
        ['javascript:alert(1)',               'javascript scheme'],
        ['data:text/html,<script>',           'data scheme'],
        ['ftp://evil.com/x.md',              'ftp scheme'],
        ['../../../etc/passwd',               'path traversal'],
        ['meetings/../../../etc/passwd',      'embedded traversal'],
        ['/etc/passwd',                       'absolute path'],
        ['/meetings/README.md',               'leading slash'],
        ['',                                  'empty string'],
        ['meetings/meeting-01/notes.txt',     'non-.md extension'],
        ['meetings/meeting-01/script.js',     'js extension'],
        ['meetings/meeting-01/',              'directory, no file'],
        ['meetings/meeting-01/README.md.exe', 'double extension'],
        ['a'.repeat(257) + '.md',             'path over 256 chars'],
        ['.hidden/README.md',                 'starts with dot'],
        ['node_modules/lodash/README.md',     'node_modules directory'],
        ['dist/something.md',                 'dist build artifact'],
        ['assets/fonts/something.md',         'assets directory not in allowlist'],
        ['package-lock.md',                   'root-level file (no directory)'],
        ['a.md',                              'single-file root path'],
        ['a/b/c.md',                          'not in allowed top-level directory'],
    ];

    for (const [path, reason] of invalid) {
        assert.strictEqual(isSafePath(path, DOMAIN.REPO), false, `should reject ${reason}: ${path}`);
    }

    assert.strictEqual(isSafePath(null, DOMAIN.REPO), false, 'should reject null');
    assert.strictEqual(isSafePath(undefined, DOMAIN.REPO), false, 'should reject undefined');
    assert.strictEqual(isSafePath(42, DOMAIN.REPO), false, 'should reject number');
});
