import { test, expect } from '@playwright/test';

// isSafeRepoPath is exposed on window via index.html for testing
const check = (page, path) => page.evaluate(p => window.isSafeRepoPath(p), path);

test.describe('isSafeRepoPath — valid paths', () => {
    const valid = [
        'meetings/meeting-01/README.md',
        'meetings/meeting-00/README.md',
        'docs/glossary.md',
        'docs/design-principles.md',
        'templates/prompts/README.md',
        'meetings/meeting-99-new/README.md',
        'meetings/meeting-01/design_principles.md',
        'templates/discussion.md',
        'a.md',
        'a/b/c.md',
    ];

    for (const path of valid) {
        test(`accepts: ${path}`, async ({ page }) => {
            await page.goto('/');
            expect(await check(page, path)).toBe(true);
        });
    }
});

test.describe('isSafeRepoPath — rejected paths', () => {
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
    ];

    for (const [path, reason] of invalid) {
        test(`rejects (${reason})`, async ({ page }) => {
            await page.goto('/');
            expect(await check(page, path)).toBe(false);
        });
    }

    test('rejects null', async ({ page }) => {
        await page.goto('/');
        expect(await page.evaluate(() => window.isSafeRepoPath(null))).toBe(false);
    });

    test('rejects undefined', async ({ page }) => {
        await page.goto('/');
        expect(await page.evaluate(() => window.isSafeRepoPath(undefined))).toBe(false);
    });

    test('rejects number', async ({ page }) => {
        await page.goto('/');
        expect(await page.evaluate(() => window.isSafeRepoPath(42))).toBe(false);
    });
});
