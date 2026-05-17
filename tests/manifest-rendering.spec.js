import { test, expect } from '@playwright/test';

test.describe('Manifest Rendering', () => {

    test('dashboard renders upcoming and archive containers', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#upcoming-materials-container')).toBeVisible();
        await expect(page.locator('#archive-cards-container')).toBeVisible();
        await expect(page.locator('#horizon-cards-container')).toBeAttached();
    });

    test('draft meetings render in horizon, not archive', async ({ page }) => {
        await page.goto('/');
        const expectedDone = await page.evaluate(() => window.MEETINGS.filter(m => m.status === 'done').length);
        await expect(page.locator('#archive-cards-container .card')).toHaveCount(expectedDone);
        await expect(page.locator('#archive-cards-container')).not.toContainText('meeting-03');
        await expect(page.locator('#archive-cards-container')).not.toContainText('meeting-04');
    });

});
