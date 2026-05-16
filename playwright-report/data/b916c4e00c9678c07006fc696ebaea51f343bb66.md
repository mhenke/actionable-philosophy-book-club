# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: routing.spec.js >> Routing & Navigation >> back-to-dashboard link returns to dashboard
- Location: tests/routing.spec.js:23:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForSelector: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('#markdown-content h1') to be visible

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - heading "A Philosophy of Software Design" [level=1] [ref=e5]
        - generic [ref=e6]: John Ousterhout
    - main [ref=e8]:
      - generic [ref=e9]:
        - generic [ref=e10]:
          - generic [ref=e11]:
            - generic [ref=e12]: Meeting 02 • Next Session
            - heading "Deep Modules & Complexity Sink" [level=2] [ref=e13]
          - generic [ref=e14]: Upcoming
        - generic [ref=e15]:
          - paragraph [ref=e16]: Key Takeaway
          - paragraph [ref=e17]:
            - text: "\"A well-designed module is a"
            - strong [ref=e18]: complexity sink
            - text: ": it takes on internal implementation suffering so the rest of the system can stay simple.\""
        - generic [ref=e19]:
          - link "View Agenda & Discussion Guide" [ref=e20] [cursor=pointer]:
            - /url: "#p=meetings/meeting-02/README.md"
            - text: View Agenda & Discussion Guide
            - img [ref=e21]
          - generic [ref=e23]:
            - paragraph [ref=e24]: Upcoming Materials
            - generic [ref=e25]:
              - generic [ref=e26]:
                - generic [ref=e27]: 📊
                - generic [ref=e28]:
                  - paragraph [ref=e29]: Slide Deck
                  - paragraph [ref=e30]: Ready before meeting
              - generic [ref=e31]:
                - generic [ref=e32]: 🎬
                - generic [ref=e33]:
                  - paragraph [ref=e34]: Video Recording
                  - paragraph [ref=e35]: Ready after meeting
      - heading "The Archive" [level=3] [ref=e37]: The Archive
      - generic [ref=e39]:
        - heading "Knowledge Base" [level=3] [ref=e40]: Knowledge Base
        - generic [ref=e42]:
          - link "Glossary" [ref=e43] [cursor=pointer]:
            - /url: "#p=docs/glossary.md"
            - generic [ref=e44]: 📚
            - generic [ref=e45]: Glossary
          - link "Principles" [ref=e46] [cursor=pointer]:
            - /url: "#p=docs/design-principles.md"
            - generic [ref=e47]: ⚖️
            - generic [ref=e48]: Principles
          - link "AI Prompts" [ref=e49] [cursor=pointer]:
            - /url: "#p=templates/prompts/README.md"
            - generic [ref=e50]: 🤖
            - generic [ref=e51]: AI Prompts
          - link "Inbox" [ref=e52] [cursor=pointer]:
            - /url: "#p=meetings/meeting-99-new/README.md"
            - generic [ref=e53]: 📂
            - generic [ref=e54]: Inbox
  - contentinfo [ref=e55]:
    - paragraph [ref=e56]: Actionable Philosophy Book Club • Spare Time Excellence • 2026
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
> 28 |         await page.waitForSelector('#markdown-content h1');
     |                    ^ Error: page.waitForSelector: Test timeout of 30000ms exceeded.
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
  55 |         await expect(page.locator('#markdown-content')).toContainText('Document unavailable');
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