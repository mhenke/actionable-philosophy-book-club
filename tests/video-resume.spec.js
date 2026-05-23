import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => { await page.addInitScript(() => { window.__TEST__ = true; }); });

test('formatDuration formats seconds correctly', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate(() => {
        if (typeof window.formatDuration !== 'function') return { missing: true };
        return {
            zero: window.formatDuration(0),
            minutes: window.formatDuration(125),
            hours: window.formatDuration(3661),
            nonFinite: window.formatDuration(Infinity),
            negative: window.formatDuration(-1),
        };
    });
    expect(result.missing).toBeFalsy();
    expect(result.zero).toBe('0m 0s');
    expect(result.minutes).toBe('2m 5s');
    expect(result.hours).toBe('1h 1m');
    expect(result.nonFinite).toBe('');
    expect(result.negative).toBe('');
});

test('formatFileSize formats megabytes correctly', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate(() => {
        if (typeof window.formatFileSize !== 'function') return { missing: true };
        return {
            kb: window.formatFileSize(0.5),
            mb: window.formatFileSize(5.2),
            large: window.formatFileSize(100),
            nonFinite: window.formatFileSize(Infinity),
        };
    });
    expect(result.missing).toBeFalsy();
    expect(result.kb).toBe('512 KB');
    expect(result.mb).toBe('5.2 MB');
    expect(result.large).toBe('100 MB');
    expect(result.nonFinite).toBe('');
});

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
