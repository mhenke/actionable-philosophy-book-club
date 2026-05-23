import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => { await page.addInitScript(() => { window.__TEST__ = true; }); });

test.describe('Manifest Rendering', () => {

    test('draft meetings render in drafts section, not archive', async ({ page }) => {
        await page.goto('/');
        const expectedDone = await page.evaluate(() => window.MEETINGS.filter(m => m.status === 'done').length);
        await expect(page.locator('#archive-cards-container .card')).toHaveCount(expectedDone);
        await expect(page.locator('#archive-cards-container')).not.toContainText('meeting-03');
        await expect(page.locator('#archive-cards-container')).not.toContainText('meeting-04');
    });

    test('Knowledge Base cards have accessible descriptions', async ({ page }) => {
        await page.goto('/');
        const cards = page.locator('[aria-labelledby="section-kb"] .card');
        const count = await cards.count();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
            const describedBy = await cards.nth(i).getAttribute('aria-describedby');
            expect(describedBy).toBeTruthy();
            const descEl = page.locator('#' + describedBy);
            await expect(descEl).toBeAttached();
        }
    });

});
