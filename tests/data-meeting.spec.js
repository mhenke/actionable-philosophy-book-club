import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => { 
  await page.addInitScript(() => { window.__TEST__ = true; }); 
});

test.describe('Meeting data class', () => {
  test('constructor initializes from plain object', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate(() => {
      const plainObj = {
        id: 'meeting-01',
        title: 'Session 1',
        status: 'done',
        date: '2025-01-15',
        video: { file: 'recordings/meeting-01.mp4', label: 'Video Recap' },
        slides: { file: 'slides/meeting-01.pptx' },
        podcasts: ['podcast-01.mp3'],
        resources: ['resource-01.png'],
        color: 'spectrum-1',
        wash: 'wash-1',
        duration: 189
      };
      const meeting = new window.Meeting(plainObj);
      return {
        id: meeting.id,
        title: meeting.title
      };
    });
    expect(result.id).toBe('meeting-01');
    expect(result.title).toBe('Session 1');
  });

  test('hasVideo returns true only if video.file exists and status is done', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate(() => {
      const meeting = new window.Meeting({
        status: 'done',
        video: { file: 'recordings/meeting-01.mp4', label: 'Video Recap' }
      });
      return meeting.hasVideo();
    });
    expect(result).toBe(true);
  });

  test('hasVideo returns false if status is not done', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate(() => {
      const meeting = new window.Meeting({
        status: 'upcoming',
        video: { file: 'recordings/meeting-01.mp4', label: 'Video Recap' }
      });
      return meeting.hasVideo();
    });
    expect(result).toBe(false);
  });

  test('hasVideo returns false if video.file is missing', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate(() => {
      const meeting = new window.Meeting({
        status: 'done',
        video: { label: 'Video Recap' }
      });
      return meeting.hasVideo();
    });
    expect(result).toBe(false);
  });

  test('getAssets returns object with video, slides, podcasts, resources', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate(() => {
      const meeting = new window.Meeting({
        status: 'done',
        video: { file: 'recordings/meeting-01.mp4', label: 'Video Recap' },
        slides: { file: 'slides/meeting-01.pptx' },
        podcasts: ['podcast-01.mp3'],
        resources: ['resource-01.png']
      });
      return meeting.getAssets();
    });
    expect(result.video).toEqual({ file: 'recordings/meeting-01.mp4', label: 'Video Recap' });
    expect(result.slides).toEqual({ file: 'slides/meeting-01.pptx' });
    expect(result.podcasts).toEqual(['podcast-01.mp3']);
    expect(result.resources).toEqual(['resource-01.png']);
  });

  test('isDone returns true only for done status', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate(() => {
      const done = new window.Meeting({ status: 'done' });
      const upcoming = new window.Meeting({ status: 'upcoming' });
      const horizon = new window.Meeting({ status: 'horizon' });
      return {
        done: done.isDone(),
        upcoming: upcoming.isDone(),
        horizon: horizon.isDone()
      };
    });
    expect(result.done).toBe(true);
    expect(result.upcoming).toBe(false);
    expect(result.horizon).toBe(false);
  });

  test('isUpcoming returns true only for upcoming status', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate(() => {
      const upcoming = new window.Meeting({ status: 'upcoming' });
      const done = new window.Meeting({ status: 'done' });
      return {
        upcoming: upcoming.isUpcoming(),
        done: done.isUpcoming()
      };
    });
    expect(result.upcoming).toBe(true);
    expect(result.done).toBe(false);
  });

  test('isHorizon returns true only for horizon status', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate(() => {
      const horizon = new window.Meeting({ status: 'horizon' });
      const done = new window.Meeting({ status: 'done' });
      return {
        horizon: horizon.isHorizon(),
        done: done.isHorizon()
      };
    });
    expect(result.horizon).toBe(true);
    expect(result.done).toBe(false);
  });
});

