import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => { await page.addInitScript(() => { window.__TEST__ = true; }); });

async function rerenderUpcoming(page) {
    await page.evaluate(() => {
        if (typeof renderUpcomingMaterials === 'function') renderUpcomingMaterials();
    });
}

async function rerenderArchive(page) {
    await page.evaluate(() => {
        if (typeof renderArchiveCards === 'function') renderArchiveCards();
    });
}

async function waitForManifest(page) {
    await page.waitForFunction(() => window.__manifestLoaded === true);
}

test.describe('Dashboard Renderer XSS Prevention', () => {

    test('XSS in video label is escaped in upcoming section', async ({ page }) => {
        await page.goto('/');
        await waitForManifest(page);
        await page.evaluate(() => {
            const upcoming = window.MEETINGS.find(m => m.status === 'upcoming');
            if (upcoming) upcoming.video.label = '<img src=x onerror=alert(1)>';
        });
        await rerenderUpcoming(page);
        const html = await page.evaluate(() =>
            document.getElementById('upcoming-materials-container').innerHTML
        );
        expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    });

    test('XSS in archive title is escaped', async ({ page }) => {
        await page.goto('/');
        await waitForManifest(page);
        await page.evaluate(() => {
            const done = window.MEETINGS.find(m => m.status === 'done');
            if (done) done.title = '<script>alert("xss")</script>';
        });
        await rerenderArchive(page);
        const html = await page.evaluate(() =>
            document.getElementById('archive-cards-container').innerHTML
        );
        expect(html).toContain('&lt;script&gt;alert(');
        expect(html).not.toContain('<script>alert');
    });

    test('XSS in podcast label is escaped', async ({ page }) => {
        await page.goto('/');
        await waitForManifest(page);
        await page.evaluate(() => {
            const done = window.MEETINGS.find(m => m.status === 'done' && m.podcasts?.length > 0);
            if (done && done.podcasts[0]) done.podcasts[0].label = '<b onmouseover=alert(1)>click</b>';
        });
        await rerenderArchive(page);
        const html = await page.evaluate(() =>
            document.getElementById('archive-cards-container').innerHTML
        );
        expect(html).toContain('&lt;b onmouseover=alert(1)&gt;click&lt;/b&gt;');
    });

    test('XSS in resource label is escaped', async ({ page }) => {
        await page.goto('/');
        await waitForManifest(page);
        await page.evaluate(() => {
            const done = window.MEETINGS.find(m => m.status === 'done' && m.resources?.length > 0);
            if (done && done.resources[0]) done.resources[0].label = '<img src=x onerror=alert(1)>';
        });
        await rerenderArchive(page);
        const html = await page.evaluate(() =>
            document.getElementById('archive-cards-container').innerHTML
        );
        expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    });

});
