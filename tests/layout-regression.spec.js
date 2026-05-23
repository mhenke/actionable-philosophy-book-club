import { test, expect } from '@playwright/test';

test.describe('Layout Regression', () => {

    test('badge right edge aligns with download button right edge', async ({ page }) => {
        await page.goto('/');
        const badge = page.locator('#upcoming-card-header .shrink-0');
        const dl = page.locator('.asset-dl').first();
        const card = page.locator('.card').first();
        await expect(badge).toBeVisible();
        await expect(dl).toBeVisible();

        const badgeRight = await badge.evaluate(el => {
            const cardRect = el.closest('.card').getBoundingClientRect();
            return cardRect.right - el.getBoundingClientRect().right;
        });
        const dlRight = await dl.evaluate(el => {
            const cardRect = el.closest('.card').getBoundingClientRect();
            return cardRect.right - el.getBoundingClientRect().right;
        });
        expect(Math.abs(badgeRight - dlRight)).toBeLessThanOrEqual(2);
    });

    const viewports = [
        { width: 320, height: 568 },
        { width: 375, height: 667 },
        { width: 430, height: 932 },
        { width: 768, height: 1024 },
        { width: 1024, height: 768 },
        { width: 1280, height: 800 }
    ];

    for (const vp of viewports) {
        test(`toc scrolls heading below sticky header at ${vp.width}x${vp.height}`, async ({ page }) => {
            await page.setViewportSize(vp);
            const markdown = [
                '# Meeting 02: Complexity Engineering & The Architecture Case',
                '',
                '## First Section',
                'Content here.',
                new Array(50).fill('Spacer paragraph.').join('\n\n'),
                '## Second Section',
                'More content here.',
                new Array(50).fill('Spacer paragraph.').join('\n\n'),
                '## Target Section',
                'Target content here.'
            ].join('\n');
            await page.route('**/meetings/meeting-01/README.md', route =>
                route.fulfill({ body: markdown })
            );
            await page.goto('/#p=meetings/meeting-01/README.md');
            await page.waitForSelector('#markdown-content h1');

            await page.locator('a[href="#second-section"]').click();
            await page.waitForTimeout(1000);

            const result = await page.evaluate(() => {
                const header = document.querySelector('#reader-view header.sticky');
                const el = document.getElementById('second-section');
                if (!header || !el) return null;
                const hdr = header.getBoundingClientRect();
                const e = el.getBoundingClientRect();
                return {
                    headerHeight: hdr.height,
                    headerBottom: hdr.bottom,
                    elTop: e.top,
                    elVisible: e.top >= hdr.bottom - 1
                };
            });

            expect(result).not.toBeNull();
            console.log(`Viewport ${vp.width}x${vp.height} -> Header height: ${result.headerHeight}px, Header bottom: ${result.headerBottom}px, Element top: ${result.elTop}px`);
            expect(result.elVisible).toBe(true);
            expect(result.elTop).toBeGreaterThanOrEqual(result.headerBottom - 2);
        });
    }

});
