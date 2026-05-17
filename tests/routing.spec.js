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

    test('reader status announces loaded and unavailable states', async ({ page }) => {
        await page.route('**/meetings/meeting-01/README.md', route =>
            route.fulfill({ body: '# Loaded' })
        );

        await page.goto('/#p=meetings/meeting-01/README.md');
        await page.waitForSelector('#markdown-content h1');
        await expect(page.locator('#reader-status')).toHaveText('Document loaded.');

        await page.route('**/meetings/meeting-00/README.md', route =>
            route.fulfill({ status: 404, body: '' })
        );
        await page.goto('/#p=meetings/meeting-00/README.md');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('#reader-status')).toHaveText('Document unavailable.');
    });


});
