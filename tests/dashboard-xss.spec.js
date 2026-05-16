import { test, expect } from '@playwright/test';

test.describe('Dashboard Renderer XSS', () => {
    test('video label with HTML payload does not execute handler', async ({ page }) => {
        await page.goto('/');
        const fired = await page.evaluate(async () => {
            window.__dashxss_video = undefined;
            const m = window.MEETINGS.find(m => m.status === 'upcoming');
            if (m && m.video) {
                m.video.label = '<img src=x onerror="window.__dashxss_video=1">';
            }
            const c = document.getElementById('upcoming-materials-container');
            if (c) c.innerHTML = '';
            if (typeof window.renderUpcomingMaterials === 'function') window.renderUpcomingMaterials();
            await new Promise(r => setTimeout(r, 100));
            return window.__dashxss_video;
        });
        expect(fired).toBeUndefined();
    });

    test('archive card title with HTML payload does not execute handler', async ({ page }) => {
        await page.goto('/');
        const fired = await page.evaluate(async () => {
            window.__dashxss_title = undefined;
            const m = window.MEETINGS.find(m => m.status === 'done');
            if (m) m.title = '<img src=x onerror="window.__dashxss_title=2">';
            const c = document.getElementById('archive-cards-container');
            if (c) c.innerHTML = '';
            if (typeof window.renderArchiveCards === 'function') window.renderArchiveCards();
            await new Promise(r => setTimeout(r, 100));
            return window.__dashxss_title;
        });
        expect(fired).toBeUndefined();
    });

    test('podcast label with attribute injection does not execute handler', async ({ page }) => {
        await page.goto('/');
        const fired = await page.evaluate(async () => {
            window.__dashxss_pod = undefined;
            const m = window.MEETINGS.find(m => m.status === 'done' && m.podcasts && m.podcasts.length > 0);
            if (m) {
                const pod = m.podcasts.find(p => p.variant !== 'alternate' && p.type !== 'alternate');
                if (pod) pod.label = '"><img src=x onerror="window.__dashxss_pod=3">';
            }
            const c = document.getElementById('archive-cards-container');
            if (c) c.innerHTML = '';
            if (typeof window.renderArchiveCards === 'function') window.renderArchiveCards();
            await new Promise(r => setTimeout(r, 100));
            return window.__dashxss_pod;
        });
        expect(fired).toBeUndefined();
    });

    test('resource label with HTML payload does not execute handler', async ({ page }) => {
        await page.goto('/');
        const fired = await page.evaluate(async () => {
            window.__dashxss_res = undefined;
            const m = window.MEETINGS.find(m => m.status === 'done' && m.resources && m.resources.length > 0);
            if (m && m.resources[0]) {
                m.resources[0].label = '<img src=x onerror="window.__dashxss_res=4">';
            }
            const c = document.getElementById('archive-cards-container');
            if (c) c.innerHTML = '';
            if (typeof window.renderArchiveCards === 'function') window.renderArchiveCards();
            await new Promise(r => setTimeout(r, 100));
            return window.__dashxss_res;
        });
        expect(fired).toBeUndefined();
    });
});
