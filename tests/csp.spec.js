import { test, expect } from '@playwright/test';

test.describe('Content Security Policy', () => {

    test('CSP meta tag contains required directives', async ({ page }) => {
        await page.goto('/');
        const csp = await page.$eval('meta[http-equiv="Content-Security-Policy"]', el =>
            el.getAttribute('content')
        );
        expect(csp).toContain("default-src 'none'");
        expect(csp).toContain("script-src 'self'");
        expect(csp).toContain("style-src 'self' 'unsafe-inline'");
        expect(csp).toContain("img-src 'self' data:");
        expect(csp).toContain('form-action \'none\'');
        expect(csp).toContain('base-uri \'self\'');
    });
});
