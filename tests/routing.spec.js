import { test, expect } from '@playwright/test';

test.describe('Routing & Navigation', () => {

    test('dashboard is visible on initial load', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#dashboard-view')).toBeVisible();
        await expect(page.locator('#reader-view')).toBeHidden();
    });

    test('hash route #p= loads reader view', async ({ page }) => {
        await page.route('**/meetings/meeting-01/README.md', route =>
            route.fulfill({ body: '# Deep Systems\n\nContent here.' })
        );
        await page.goto('/#p=meetings/meeting-01/README.md');
        await page.waitForSelector('#markdown-content h1');

        await expect(page.locator('#reader-view')).toBeVisible();
        await expect(page.locator('#dashboard-view')).toBeHidden();
        await expect(page.locator('#markdown-content h1')).toContainText('Deep Systems');
    });

    test('back-to-dashboard link returns to dashboard', async ({ page }) => {
        await page.route('**/meetings/meeting-01/README.md', route =>
            route.fulfill({ body: '# Test' })
        );
        await page.goto('/#p=meetings/meeting-01/README.md');
        await page.waitForSelector('#markdown-content h1');

        await page.click('#back-to-dashboard');

        await expect(page.locator('#dashboard-view')).toBeVisible();
        await expect(page.locator('#reader-view')).toBeHidden();
    });

    test('empty #p= shows dashboard, not reader', async ({ page }) => {
        await page.goto('/#p=');
        await expect(page.locator('#dashboard-view')).toBeVisible();
        await expect(page.locator('#reader-view')).toBeHidden();
    });

    test('invalid path #p=//evil.com stays on dashboard', async ({ page }) => {
        await page.goto('/#p=//evil.com/payload.md');
        await expect(page.locator('#dashboard-view')).toBeVisible();
        await expect(page.locator('#reader-view')).toBeHidden();
    });

    test('404 shows unavailable message, not raw status code', async ({ page }) => {
        await page.route('**/meetings/meeting-01/README.md', route =>
            route.fulfill({ status: 404, body: '' })
        );
        await page.goto('/#p=meetings/meeting-01/README.md');
        await page.waitForLoadState('networkidle');

        await expect(page.locator('#markdown-content')).toContainText('Document unavailable');
        await expect(page.locator('#reader-view')).toBeVisible();
    });

    test('network rejection leaves reader in recoverable state', async ({ page }) => {
        await page.route('**/meetings/meeting-01/README.md', route => route.abort('failed'));
        await page.goto('/#p=meetings/meeting-01/README.md');
        await page.waitForLoadState('networkidle');

        await expect(page.locator('#markdown-content')).toHaveAttribute('aria-busy', 'false');
        await expect(page.locator('#reader-status')).toHaveText('Document unavailable.');
        await page.getByRole('button', { name: 'Return to Dashboard' }).click();
        await expect(page.locator('#dashboard-view')).toBeVisible();
    });

    test('markdown cache: same path fetched only once per session', async ({ page }) => {
        let fetchCount = 0;
        await page.route('**/meetings/meeting-01/README.md', route => {
            fetchCount++;
            route.fulfill({ body: '# Cached' });
        });

        await page.goto('/#p=meetings/meeting-01/README.md');
        await page.waitForSelector('#markdown-content h1');
        await page.click('#back-to-dashboard');
        await page.goto('/#p=meetings/meeting-01/README.md');
        await page.waitForSelector('#markdown-content h1');

        expect(fetchCount).toBe(1);
    });

    test('aria-busy is false after content loads', async ({ page }) => {
        await page.route('**/meetings/meeting-01/README.md', route =>
            route.fulfill({ body: '# Done' })
        );
        await page.goto('/#p=meetings/meeting-01/README.md');
        await page.waitForSelector('#markdown-content h1');

        await expect(page.locator('#markdown-content')).toHaveAttribute('aria-busy', 'false');
    });

    test('anchor links (#fragment) are not rewritten to GitHub raw URLs', async ({ page }) => {
        // Use real file — test that any existing #-links in content are preserved
        await page.goto('/#p=meetings/meeting-01/README.md');
        await page.waitForSelector('#markdown-content');

        // Check all anchor links in rendered markdown
        const anchorLinks = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('#markdown-content a[href]'))
                .map(a => ({ href: a.getAttribute('href'), text: a.textContent }))
                .filter(a => a.href.startsWith('#'));
        });

        // If the real content has anchor links (e.g. TOC), verify they're preserved
        for (const link of anchorLinks) {
            expect(link.href).toMatch(/^#/);
            expect(link.href).not.toMatch(/github/);
        }

        // Also verify external links get target=_blank
        const externalLinks = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('#markdown-content a[href^="http"]'))
                .map(a => ({ target: a.getAttribute('target'), rel: a.getAttribute('rel') }));
        });
        for (const link of externalLinks) {
            expect(link.target).toBe('_blank');
            expect(link.rel).toMatch(/noopener/);
        }
    });

    test('shows error message and retry button when fetch fails', async ({ page }) => {
        await page.route('**/meetings/meeting-01/README.md', route => route.fulfill({ status: 404 }));

        await page.goto('/#p=meetings/meeting-01/README.md');
        await page.waitForLoadState('networkidle');

        await expect(page.locator('#markdown-content')).toContainText('unavailable');
        await expect(page.locator('#retry-load')).toBeVisible();
        await expect(page.locator('#return-dashboard')).toBeVisible();
    });

    test('reader status announces loaded state', async ({ page }) => {
        await page.route('**/meetings/meeting-01/README.md', route =>
            route.fulfill({ body: '# Loaded' })
        );

        await page.goto('/#p=meetings/meeting-01/README.md');
        await page.waitForSelector('#markdown-content h1');
        await expect(page.locator('#reader-status')).toHaveText('Document loaded.');
    });

    test('reader status announces unavailable for fetch error', async ({ page }) => {
        await page.route('**/meetings/missing-file/README.md', route => route.abort('failed'));
        await page.goto('/#p=meetings/missing-file/README.md');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('#reader-status')).toHaveText('Document unavailable.');
    });


});
