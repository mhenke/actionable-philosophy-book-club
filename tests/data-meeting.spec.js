describe('Meeting data class', () => {
  test('constructor initializes from plain object', () => {
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
    const meeting = new Meeting(plainObj);
    expect(meeting.id).toBe('meeting-01');
    expect(meeting.title).toBe('Session 1');
  });

  test('hasVideo returns true only if video.file exists and status is done', () => {
    const meeting = new Meeting({
      status: 'done',
      video: { file: 'recordings/meeting-01.mp4', label: 'Video Recap' }
    });
    expect(meeting.hasVideo()).toBe(true);
  });

  test('hasVideo returns false if status is not done', () => {
    const meeting = new Meeting({
      status: 'upcoming',
      video: { file: 'recordings/meeting-01.mp4', label: 'Video Recap' }
    });
    expect(meeting.hasVideo()).toBe(false);
  });

  test('hasVideo returns false if video.file is missing', () => {
    const meeting = new Meeting({
      status: 'done',
      video: { label: 'Video Recap' }
    });
    expect(meeting.hasVideo()).toBe(false);
  });

  test('getAssets returns object with video, slides, podcasts, resources', () => {
    const meeting = new Meeting({
      status: 'done',
      video: { file: 'recordings/meeting-01.mp4', label: 'Video Recap' },
      slides: { file: 'slides/meeting-01.pptx' },
      podcasts: ['podcast-01.mp3'],
      resources: ['resource-01.png']
    });
    const assets = meeting.getAssets();
    expect(assets.video).toEqual({ file: 'recordings/meeting-01.mp4', label: 'Video Recap' });
    expect(assets.slides).toEqual({ file: 'slides/meeting-01.pptx' });
    expect(assets.podcasts).toEqual(['podcast-01.mp3']);
    expect(assets.resources).toEqual(['resource-01.png']);
  });

  test('isDone returns true only for done status', () => {
    const done = new Meeting({ status: 'done' });
    const upcoming = new Meeting({ status: 'upcoming' });
    const horizon = new Meeting({ status: 'horizon' });
    
    expect(done.isDone()).toBe(true);
    expect(upcoming.isDone()).toBe(false);
    expect(horizon.isDone()).toBe(false);
  });

  test('isUpcoming returns true only for upcoming status', () => {
    const upcoming = new Meeting({ status: 'upcoming' });
    const done = new Meeting({ status: 'done' });
    
    expect(upcoming.isUpcoming()).toBe(true);
    expect(done.isUpcoming()).toBe(false);
  });

  test('isHorizon returns true only for horizon status', () => {
    const horizon = new Meeting({ status: 'horizon' });
    const done = new Meeting({ status: 'done' });
    
    expect(horizon.isHorizon()).toBe(true);
    expect(done.isHorizon()).toBe(false);
  });
});
