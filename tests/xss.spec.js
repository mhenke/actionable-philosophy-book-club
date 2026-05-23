import { test, expect } from '@playwright/test';

test.describe('XSS Prevention (DOMPurify)', () => {

    test('script tags in markdown are stripped before render', async ({ page }) => {
        await page.route('**/meetings/meeting-01/README.md', route =>
            route.fulfill({ body: '# Test\n<script>window.__xss=1</script>\n<p>Hello</p>' })
        );
        await page.goto('/#p=meetings/meeting-01/README.md');
        await page.waitForSelector('#markdown-content h1');

        const executed = await page.evaluate(() => window.__xss);
        expect(executed).toBeUndefined();

        // Content itself should still render
        await expect(page.locator('#markdown-content')).toContainText('Hello');
    });

    test('img onerror payload does not execute', async ({ page }) => {
        await page.route('**/meetings/meeting-01/README.md', route =>
            route.fulfill({ body: '<img src=x onerror="window.__onerror=1">' })
        );
        await page.goto('/#p=meetings/meeting-01/README.md');
        await page.waitForLoadState('networkidle');

        const fired = await page.evaluate(() => window.__onerror);
        expect(fired).toBeUndefined();
    });

    test('svg onload payload does not execute', async ({ page }) => {
        await page.route('**/meetings/meeting-01/README.md', route =>
            route.fulfill({ body: '<svg><script>window.__svgxss=1</script></svg>' })
        );
        await page.goto('/#p=meetings/meeting-01/README.md');
        await page.waitForLoadState('networkidle');

        expect(await page.evaluate(() => window.__svgxss)).toBeUndefined();
    });

    test('error path does not inject HTML via textContent', async ({ page }) => {
        await page.route('**/meetings/meeting-01/README.md', route =>
            route.fulfill({ status: 500, body: '' })
        );
        await page.goto('/#p=meetings/meeting-01/README.md');
        await page.waitForLoadState('networkidle');

        // Error message must be plain text, not parsed as markup
        const scripts = await page.locator('#markdown-content script').count();
        expect(scripts).toBe(0);
        await expect(page.locator('#markdown-content')).toContainText('Document unavailable');
    });

    test('external links outside allowlist are stripped by DOMPurify hook', async ({ page }) => {
        await page.route('**/meetings/meeting-01/README.md', route =>
            route.fulfill({ body: '# Test\n<a href="https://evil.com/phish">Click</a>\n<a href="https://mhenke.github.io/actionable-philosophy-book-club/">Safe</a>' })
        );
        await page.goto('/#p=meetings/meeting-01/README.md');
        await page.waitForSelector('#markdown-content h1');

        const links = await page.locator('#markdown-content a').evaluateAll(as =>
            as.map(a => ({ href: a.getAttribute('href'), text: a.textContent }))
        );
        const evil = links.find(l => l.text === 'Click');
        expect(evil?.href).toBeNull();

        const safe = links.find(l => l.text === 'Safe');
        expect(safe?.href).toBe('https://mhenke.github.io/actionable-philosophy-book-club/');
    });

    test('no script elements present in rendered content', async ({ page }) => {
        await page.route('**/meetings/meeting-01/README.md', route =>
            route.fulfill({ body: '# Safe\n\nPlain paragraph.' })
        );
        await page.goto('/#p=meetings/meeting-01/README.md');
        await page.waitForSelector('#markdown-content h1');

        const scripts = await page.locator('#markdown-content script').count();
        expect(scripts).toBe(0);
    });

});
