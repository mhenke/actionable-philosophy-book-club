(function() {
'use strict';

class Meeting {
  /**
   * Validates and stores meeting manifest entry data.
   * @param {object} manifestEntry - Raw meeting object from manifest
   * @throws {Error} If id, title, or status are missing/invalid
   */
  constructor(manifestEntry) {
    if (!manifestEntry?.id || typeof manifestEntry.id !== 'string') {
      throw new Error('Meeting: id is required and must be a string');
    }
    if (!manifestEntry?.title || typeof manifestEntry.title !== 'string') {
      throw new Error(`Meeting ${manifestEntry.id}: title is required and must be a string`);
    }
    const validStatuses = ['done', 'upcoming', 'draft'];
    if (!validStatuses.includes(manifestEntry?.status)) {
      throw new Error(`Meeting ${manifestEntry.id}: status must be one of [${validStatuses.join(', ')}], got '${manifestEntry.status}'`);
    }

    this.id = manifestEntry.id;
    this.title = manifestEntry.title;
    this.session = manifestEntry.session || '';
    this.status = manifestEntry.status;
    this.date = manifestEntry.date || '';
    this.video = manifestEntry.video || {};
    this.slides = manifestEntry.slides || {};
    this.podcasts = Array.isArray(manifestEntry.podcasts) ? manifestEntry.podcasts : [];
    this.resources = Array.isArray(manifestEntry.resources) ? manifestEntry.resources : [];
    this.color = manifestEntry.color || '';
    this.wash = manifestEntry.wash || '';
    this.duration = manifestEntry.duration || 0;
    this.readmeUrl = manifestEntry.readmeUrl || '';
    this.keyTakeaway = manifestEntry.keyTakeaway || '';
  }

  /** Returns true when the meeting has a video asset and status is done. */
  hasVideo() {
    return this.status === 'done' && !!(this.video && this.video.file);
  }

  isDone() { return this.status === 'done'; }
  isUpcoming() { return this.status === 'upcoming'; }
  isDraft() { return this.status === 'draft'; }

}

window.Meeting = Meeting;
})();
