import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => { await page.addInitScript(() => { window.__TEST__ = true; }); });

test.describe('Extracted internals', () => {

    // ── getCurrentMeetingIndex ────────────────────────────────────────────────
    test('getCurrentMeetingIndex: returns -1 on dashboard', async ({ page }) => {
        await page.goto('/');
        await page.waitForFunction(() => window.__manifestLoaded === true);
        const idx = await page.evaluate(() => window.getCurrentMeetingIndex());
        expect(idx).toBe(-1);
    });

    test('getCurrentMeetingIndex: returns valid index when reader is open', async ({ page }) => {
        await page.route('**/meetings/meeting-01/README.md', route =>
            route.fulfill({ body: '# Test' })
        );
        await page.goto('/#p=meetings/meeting-01/README.md');
        await page.waitForSelector('#markdown-content h1');
        const idx = await page.evaluate(() => window.getCurrentMeetingIndex());
        expect(idx).toBeGreaterThanOrEqual(0);
    });

    // ── rewriteContentLinks ───────────────────────────────────────────────────
    test('rewriteContentLinks: rewrites relative .md link to #p= hash', async ({ page }) => {
        await page.route('**/meetings/meeting-01/README.md', route =>
            route.fulfill({ body: '# T' })
        );
        await page.goto('/#p=meetings/meeting-01/README.md');
        await page.waitForSelector('#markdown-content h1');

        const href = await page.evaluate(() => {
            const el = document.createElement('div');
            el.innerHTML = '<a href="notes.md">Notes</a>';
            window.rewriteContentLinks(el, 'meetings/meeting-01/README.md');
            return el.querySelector('a').getAttribute('href');
        });
        expect(href).toMatch(/^#p=/);
    });

    test('rewriteContentLinks: leaves external https links untouched', async ({ page }) => {
        await page.route('**/meetings/meeting-01/README.md', route =>
            route.fulfill({ body: '# T' })
        );
        await page.goto('/#p=meetings/meeting-01/README.md');
        await page.waitForSelector('#markdown-content h1');

        const href = await page.evaluate(() => {
            const el = document.createElement('div');
            el.innerHTML = '<a href="https://example.com">Ext</a>';
            window.rewriteContentLinks(el, 'meetings/meeting-01/README.md');
            return el.querySelector('a').getAttribute('href');
        });
        expect(href).toBe('https://example.com');
    });

    test('rewriteContentLinks: disables unsafe path links', async ({ page }) => {
        await page.route('**/meetings/meeting-01/README.md', route =>
            route.fulfill({ body: '# T' })
        );
        await page.goto('/#p=meetings/meeting-01/README.md');
        await page.waitForSelector('#markdown-content h1');

        const disabled = await page.evaluate(() => {
            const el = document.createElement('div');
            el.innerHTML = '<a href="../../etc/passwd.md">Unsafe</a>';
            window.rewriteContentLinks(el, 'meetings/meeting-01/README.md');
            const a = el.querySelector('a');
            return a.getAttribute('aria-disabled');
        });
        expect(disabled).toBe('true');
    });

    // ── applyMeetingMaterialsTree ─────────────────────────────────────────────
    test('applyMeetingMaterialsTree: adds materials-panel class to UL under Meeting Materials h2', async ({ page }) => {
        await page.route('**/meetings/meeting-01/README.md', route =>
            route.fulfill({ body: '# T' })
        );
        await page.goto('/#p=meetings/meeting-01/README.md');
        await page.waitForSelector('#markdown-content h1');

        const hasClass = await page.evaluate(() => {
            const el = document.createElement('div');
            el.innerHTML = '<h2>Meeting Materials</h2><ul><li>item</li></ul>';
            window.applyMeetingMaterialsTree(el);
            return el.querySelector('ul').classList.contains('materials-panel');
        });
        expect(hasClass).toBe(true);
    });

    test('applyMeetingMaterialsTree: ignores h2 that is not Meeting Materials', async ({ page }) => {
        await page.route('**/meetings/meeting-01/README.md', route =>
            route.fulfill({ body: '# T' })
        );
        await page.goto('/#p=meetings/meeting-01/README.md');
        await page.waitForSelector('#markdown-content h1');

        const hasClass = await page.evaluate(() => {
            const el = document.createElement('div');
            el.innerHTML = '<h2>Discussion Points</h2><ul><li>item</li></ul>';
            window.applyMeetingMaterialsTree(el);
            return el.querySelector('ul').classList.contains('materials-panel');
        });
        expect(hasClass).toBe(false);
    });

});
