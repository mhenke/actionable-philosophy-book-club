/**
 * Meeting: Immutable data class for meeting session metadata.
 *
 * Validates schema at construction time (APOSD Principle 7: Define Errors Out of Existence).
 * Provides typed accessors to reduce information leakage across rendering functions.
 * Callers should use getter methods (getVideoFile(), getSession(), etc.) instead of
 * accessing raw properties directly.
 */
class Meeting {
  constructor(data) {
    if (!data?.id || typeof data.id !== 'string') {
      throw new Error('Meeting: id is required and must be a string');
    }
    if (!data?.title || typeof data.title !== 'string') {
      throw new Error(`Meeting ${data.id}: title is required and must be a string`);
    }
    const validStatuses = ['done', 'upcoming', 'horizon', 'draft'];
    if (!validStatuses.includes(data?.status)) {
      throw new Error(`Meeting ${data.id}: status must be one of [${validStatuses.join(', ')}], got '${data.status}'`);
    }

    this.id = data.id;
    this.title = data.title;
    this.session = data.session || '';
    this.status = data.status;
    this.date = data.date || '';
    this.video = data.video || {};
    this.slides = data.slides || {};
    this.podcasts = Array.isArray(data.podcasts) ? data.podcasts : [];
    this.resources = Array.isArray(data.resources) ? data.resources : [];
    this.color = data.color || '';
    this.wash = data.wash || '';
    this.duration = data.duration || 0;
    this.readmeUrl = data.readmeUrl || '';
    this.keyTakeaway = data.keyTakeaway || '';
  }

  hasVideo() {
    return this.status === 'done' && !!(this.video && this.video.file);
  }

  isDone() { return this.status === 'done'; }
  isUpcoming() { return this.status === 'upcoming'; }
  isHorizon() { return this.status === 'horizon'; }
  isDraft() { return this.status === 'draft'; }

  getId() { return this.id; }
  getTitle() { return this.title; }
  getSession() { return this.session; }
  getStatus() { return this.status; }
  getDate() { return this.date; }
  getReadmeUrl() { return this.readmeUrl; }
  getKeyTakeaway() { return this.keyTakeaway; }
  getColor() { return this.color; }
  getWash() { return this.wash; }
  getDuration() { return this.duration; }
  getPodcasts() { return this.podcasts; }
  getResources() { return this.resources; }

  getVideoFile() { return (this.video && this.video.file) || ''; }
  getVideoLabel() { return (this.video && this.video.label) || ''; }
  getVideoDuration() { return (this.video && this.video.duration) || 0; }
  getVideoFileSize() { return (this.video && this.video.fileSize) || 0; }
  getSlidesFile() { return (this.slides && this.slides.file) || ''; }
  getSlidesLabel() { return (this.slides && this.slides.label) || ''; }
  getSlidesFileSize() { return (this.slides && this.slides.fileSize) || 0; }

  getAssets() {
    return {
      video: this.video,
      slides: this.slides,
      podcasts: this.podcasts,
      resources: this.resources
    };
  }
}
