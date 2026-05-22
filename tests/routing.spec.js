import { test, expect } from '@playwright/test';

test.describe('Routing & Navigation', () => {

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


    test('aria-busy is false after content loads', async ({ page }) => {
        await page.route('**/meetings/meeting-01/README.md', route =>
            route.fulfill({ body: '# Done' })
        );
        await page.goto('/#p=meetings/meeting-01/README.md');
        await page.waitForSelector('#markdown-content h1');

        await expect(page.locator('#markdown-content')).toHaveAttribute('aria-busy', 'false');
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

    test('mobile video: asset links are clickable on small viewport', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');
        const videoLink = page.locator('#archive-cards-container [id*="-video-"] .asset-link').first();
        await expect(videoLink).toBeVisible();
        await expect(videoLink).toBeEnabled();
    });

    test('hash route #a= is ignored', async ({ page }) => {
        await page.goto('/#a=meetings/meeting-01/recordings/01-The-Architects-of-Complexity.mp4');
        await expect(page.locator('#dashboard-view')).toBeVisible();
        await expect(page.locator('#reader-view')).toBeHidden();
    });

    test('safe-anchoring: reader ignores trailing hash fragment', async ({ page }) => {
        await page.route('**/meetings/meeting-01/README.md', route =>
            route.fulfill({ body: '# Deep Systems\n\nContent here.' })
        );
        // Trailing content after last # is treated as anchor, stripped from path validation
        await page.goto('/#p=meetings/meeting-01/README.md#extra-fragment');
        await page.waitForSelector('#markdown-content', { state: 'attached' });
        await expect(page.locator('#reader-view')).toBeVisible();
    });

    test('renders compact file tree for Meeting Materials list', async ({ page }) => {
        const markdown = [
            '# Document Title',
            '',
            '## Meeting Materials',
            '- [folder/](folder/)',
            '  - [file1.md](file1.md)',
            '  - [file2.md](file2.md)'
        ].join('\n');

        await page.route('**/meetings/meeting-01/README.md', route =>
            route.fulfill({ body: markdown })
        );

        await page.goto('/#p=meetings/meeting-01/README.md');
        await page.waitForSelector('.materials-panel');

        const panel = page.locator('.materials-panel');
        await expect(panel).toBeVisible();

        const connectors = page.locator('.tree-connector');
        await expect(connectors.first()).toBeVisible();

        // Verify that tree connectors and file tree link elements are compact (under 30px height)
        const height = await connectors.first().evaluate(el => el.getBoundingClientRect().height);
        expect(height).toBeLessThan(30);

        const link = page.locator('.materials-panel a').first();
        const linkHeight = await link.evaluate(el => el.getBoundingClientRect().height);
        expect(linkHeight).toBeLessThan(30);
    });

});
