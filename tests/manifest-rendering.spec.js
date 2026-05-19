import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => { await page.addInitScript(() => { window.__TEST__ = true; }); });

test.describe('Dashboard skeleton', () => {

    async function withDelayedManifest(page, fn) {
        await page.addInitScript(() => {
            window.__TEST__ = true;
            window.__TEST_DELAY_MANIFEST = new Promise(resolve => { window.__releaseManifest = resolve; });
        });
        await page.goto('/');
        await fn();
        await page.evaluate(() => window.__releaseManifest());
        await page.waitForFunction(() => window.__manifestLoaded === true);
    }

    test('skeleton appears in upcoming card while manifest loads', async ({ page }) => {
        await withDelayedManifest(page, async () => {
            await expect(page.locator('#upcoming-materials-container .sk-block').first()).toBeVisible();
        });
        await expect(page.locator('#upcoming-materials-container .sk-block')).toHaveCount(0);
    });

    test('skeleton appears in archive while manifest loads', async ({ page }) => {
        await withDelayedManifest(page, async () => {
            await expect(page.locator('#archive-cards-container .sk-block').first()).toBeVisible();
        });
        await expect(page.locator('#archive-cards-container .sk-block')).toHaveCount(0);
    });

});

test.describe('Manifest Rendering', () => {

    test('draft meetings render in horizon, not archive', async ({ page }) => {
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
