# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: routing.spec.js >> Routing & Navigation >> 404 shows unavailable message, not raw status code
- Location: tests/routing.spec.js:48:5

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('#markdown-content')
Timeout: 5000ms
- Expected substring  - 1
+ Received string     + 2

- Document unavailable
+
+         

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('#markdown-content')
    14 × locator resolved to <article aria-busy="false" aria-live="polite" id="markdown-content" class="prose px-6 md:px-10 pt-12 pb-24">↵        </article>
       - unexpected value "
        "

```

```yaml
- banner:
  - heading "A Philosophy of Software Design" [level=1]
  - text: John Ousterhout
- main:
  - text: Meeting 02 • Next Session
  - heading "Deep Modules & Complexity Sink" [level=2]
  - text: Upcoming
  - paragraph: Key Takeaway
  - paragraph:
    - text: "\"A well-designed module is a"
    - strong: complexity sink
    - text: ": it takes on internal implementation suffering so the rest of the system can stay simple.\""
  - link "View Agenda & Discussion Guide":
    - /url: "#p=meetings/meeting-02/README.md"
  - paragraph: Upcoming Materials
  - paragraph: Slide Deck
  - paragraph: Ready before meeting
  - paragraph: Video Recording
  - paragraph: Ready after meeting
  - heading "The Archive" [level=3]
  - heading "Knowledge Base" [level=3]
  - link "Glossary":
    - /url: "#p=docs/glossary.md"
  - link "Principles":
    - /url: "#p=docs/design-principles.md"
  - link "AI Prompts":
    - /url: "#p=templates/prompts/README.md"
  - link "Inbox":
    - /url: "#p=meetings/meeting-99-new/README.md"
- contentinfo:
  - paragraph: Actionable Philosophy Book Club • Spare Time Excellence • 2026
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Routing & Navigation', () => {
  4  | 
  5  |     test('dashboard is visible on initial load', async ({ page }) => {
  6  |         await page.goto('/');
  7  |         await expect(page.locator('#dashboard-view')).toBeVisible();
  8  |         await expect(page.locator('#reader-view')).toBeHidden();
  9  |     });
  10 | 
  11 |     test('hash route #p= loads reader view', async ({ page }) => {
  12 |         await page.route('**/meetings/meeting-01/README.md', route =>
  13 |             route.fulfill({ body: '# Deep Systems\n\nContent here.' })
  14 |         );
  15 |         await page.goto('/#p=meetings/meeting-01/README.md');
  16 |         await page.waitForSelector('#markdown-content h1');
  17 | 
  18 |         await expect(page.locator('#reader-view')).toBeVisible();
  19 |         await expect(page.locator('#dashboard-view')).toBeHidden();
  20 |         await expect(page.locator('#markdown-content h1')).toContainText('Deep Systems');
  21 |     });
  22 | 
  23 |     test('back-to-dashboard link returns to dashboard', async ({ page }) => {
  24 |         await page.route('**/meetings/meeting-01/README.md', route =>
  25 |             route.fulfill({ body: '# Test' })
  26 |         );
  27 |         await page.goto('/#p=meetings/meeting-01/README.md');
  28 |         await page.waitForSelector('#markdown-content h1');
  29 | 
  30 |         await page.click('#back-to-dashboard');
  31 | 
  32 |         await expect(page.locator('#dashboard-view')).toBeVisible();
  33 |         await expect(page.locator('#reader-view')).toBeHidden();
  34 |     });
  35 | 
  36 |     test('empty #p= shows dashboard, not reader', async ({ page }) => {
  37 |         await page.goto('/#p=');
  38 |         await expect(page.locator('#dashboard-view')).toBeVisible();
  39 |         await expect(page.locator('#reader-view')).toBeHidden();
  40 |     });
  41 | 
  42 |     test('invalid path #p=//evil.com stays on dashboard', async ({ page }) => {
  43 |         await page.goto('/#p=//evil.com/payload.md');
  44 |         await expect(page.locator('#dashboard-view')).toBeVisible();
  45 |         await expect(page.locator('#reader-view')).toBeHidden();
  46 |     });
  47 | 
  48 |     test('404 shows unavailable message, not raw status code', async ({ page }) => {
  49 |         await page.route('**/meetings/meeting-01/README.md', route =>
  50 |             route.fulfill({ status: 404, body: '' })
  51 |         );
  52 |         await page.goto('/#p=meetings/meeting-01/README.md');
  53 |         await page.waitForLoadState('networkidle');
  54 | 
> 55 |         await expect(page.locator('#markdown-content')).toContainText('Document unavailable');
     |                                                         ^ Error: expect(locator).toContainText(expected) failed
  56 |         await expect(page.locator('#reader-view')).toBeVisible();
  57 |     });
  58 | 
  59 |     test('markdown cache: same path fetched only once per session', async ({ page }) => {
  60 |         let fetchCount = 0;
  61 |         await page.route('**/meetings/meeting-01/README.md', route => {
  62 |             fetchCount++;
  63 |             route.fulfill({ body: '# Cached' });
  64 |         });
  65 | 
  66 |         await page.goto('/#p=meetings/meeting-01/README.md');
  67 |         await page.waitForSelector('#markdown-content h1');
  68 |         await page.click('#back-to-dashboard');
  69 |         await page.goto('/#p=meetings/meeting-01/README.md');
  70 |         await page.waitForSelector('#markdown-content h1');
  71 | 
  72 |         expect(fetchCount).toBe(1);
  73 |     });
  74 | 
  75 |     test('aria-busy is false after content loads', async ({ page }) => {
  76 |         await page.route('**/meetings/meeting-01/README.md', route =>
  77 |             route.fulfill({ body: '# Done' })
  78 |         );
  79 |         await page.goto('/#p=meetings/meeting-01/README.md');
  80 |         await page.waitForSelector('#markdown-content h1');
  81 | 
  82 |         await expect(page.locator('#markdown-content')).toHaveAttribute('aria-busy', 'false');
  83 |     });
  84 | 
  85 | });
  86 | 
```