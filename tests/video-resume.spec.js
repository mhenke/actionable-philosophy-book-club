import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => { await page.addInitScript(() => { window.__TEST__ = true; }); });

test('video resume persistence uses sessionStorage only', async ({ page }) => {
    await page.goto('/');

    const result = await page.evaluate(() => {
        sessionStorage.clear();
        localStorage.clear();

        if (typeof window.saveVideoResumePosition !== 'function') {
            return { missing: true };
        }

        window.saveVideoResumePosition('meetings/meeting-01/recordings/01-The-Architects-of-Complexity.mp4', 42);
        return {
            session: sessionStorage.getItem('apbc:vs:meetings/meeting-01/recordings/01-The-Architects-of-Complexity.mp4'),
            local: localStorage.getItem('apbc:vp:meetings/meeting-01/recordings/01-The-Architects-of-Complexity.mp4'),
        };
    });

    expect(result.missing).toBeFalsy();
    expect(result.session).toBe('42');
    expect(result.local).toBeNull();
});
