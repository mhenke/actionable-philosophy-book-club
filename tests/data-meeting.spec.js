import { test, expect } from '@playwright/test';

test.describe('Meeting data class validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { window.__TEST__ = true; });
  });

  test('constructor throws if id is missing', async ({ page }) => {
    await page.goto('/');
    const error = await page.evaluate(() => {
      try {
        new window.Meeting({ title: 'Session 1', status: 'done' });
        return null;
      } catch (e) {
        return e.message;
      }
    });
    expect(error).toContain('id is required');
  });

  test('constructor throws if title is missing', async ({ page }) => {
    await page.goto('/');
    const error = await page.evaluate(() => {
      try {
        new window.Meeting({ id: 'meeting-01', status: 'done' });
        return null;
      } catch (e) {
        return e.message;
      }
    });
    expect(error).toContain('title is required');
  });

  test('constructor throws if status is invalid', async ({ page }) => {
    await page.goto('/');
    const error = await page.evaluate(() => {
      try {
        new window.Meeting({ id: 'meeting-01', title: 'Session 1', status: 'invalid' });
        return null;
      } catch (e) {
        return e.message;
      }
    });
    expect(error).toContain('status must be');
  });

  test('constructor succeeds with valid required fields', async ({ page }) => {
    await page.goto('/');
    const meeting = await page.evaluate(() => {
      const m = new window.Meeting({ id: 'meeting-01', title: 'Session 1', status: 'done' });
      return { id: m.id, title: m.title, status: m.status };
    });
    expect(meeting.id).toBe('meeting-01');
    expect(meeting.title).toBe('Session 1');
    expect(meeting.status).toBe('done');
  });

  test('hasVideo returns true only for done status with video.file', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate(() => {
      const done = new window.Meeting({ id: 'meeting-01', title: 'S1', status: 'done', video: { file: 'video.mp4' } });
      const upcoming = new window.Meeting({ id: 'meeting-02', title: 'S2', status: 'upcoming', video: { file: 'video.mp4' } });
      const doneNoVideo = new window.Meeting({ id: 'meeting-03', title: 'S3', status: 'done' });
      return {
        done_has_video: done.hasVideo(),
        upcoming_has_video: upcoming.hasVideo(),
        done_no_video: doneNoVideo.hasVideo()
      };
    });
    expect(result.done_has_video).toBe(true);
    expect(result.upcoming_has_video).toBe(false);
    expect(result.done_no_video).toBe(false);
  });

  test('isDone, isUpcoming, isHorizon, isDraft return correct values', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate(() => {
      const m = new window.Meeting({ id: 'meeting-01', title: 'S1', status: 'done' });
      return {
        isDone: m.isDone(),
        isUpcoming: m.isUpcoming(),
        isHorizon: m.isHorizon(),
        isDraft: m.isDraft()
      };
    });
    expect(result.isDone).toBe(true);
    expect(result.isUpcoming).toBe(false);
    expect(result.isHorizon).toBe(false);
    expect(result.isDraft).toBe(false);
  });

  test('exposes all four asset types as properties', async ({ page }) => {
    await page.goto('/');
    const assets = await page.evaluate(() => {
      const m = new window.Meeting({
        id: 'meeting-01',
        title: 'S1',
        status: 'done',
        video: { file: 'video.mp4' },
        slides: { file: 'slides.pptx' },
        podcasts: ['podcast.m4a'],
        resources: ['image.png']
      });
      return m;
    });
    expect(assets.video.file).toBe('video.mp4');
    expect(assets.slides.file).toBe('slides.pptx');
    expect(assets.podcasts).toContain('podcast.m4a');
    expect(assets.resources).toContain('image.png');
  });

  test('constructor accepts all optional fields', async ({ page }) => {
    await page.goto('/');
    const meeting = await page.evaluate(() => {
      const m = new window.Meeting({
        id: 'meeting-01',
        title: 'S1',
        status: 'done',
        date: '2024-01-01',
        video: { file: 'video.mp4', label: 'Main Recording' },
        slides: { file: 'slides.pptx' },
        podcasts: ['podcast.m4a'],
        resources: ['image.png'],
        color: 'spectrum-1',
        wash: 'wash-1',
        duration: 3600
      });
      return {
        date: m.date,
        color: m.color,
        wash: m.wash,
        duration: m.duration,
        videoLabel: m.video.label
      };
    });
    expect(meeting.date).toBe('2024-01-01');
    expect(meeting.color).toBe('spectrum-1');
    expect(meeting.wash).toBe('wash-1');
    expect(meeting.duration).toBe(3600);
    expect(meeting.videoLabel).toBe('Main Recording');
  });
});
