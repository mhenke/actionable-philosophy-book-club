(function() {
'use strict';

const VALID_STATUSES = Object.freeze(['done', 'upcoming', 'draft']);
const STATUS = Object.freeze({ DONE: 'done', UPCOMING: 'upcoming', DRAFT: 'draft' });

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
    if (!VALID_STATUSES.includes(manifestEntry?.status)) {
      throw new Error(`Meeting ${manifestEntry.id}: status must be one of [${VALID_STATUSES.join(', ')}], got '${manifestEntry.status}'`);
    }

    this.id = manifestEntry.id;
    this.title = manifestEntry.title;
    this.session = manifestEntry.session || '';
    this.status = manifestEntry.status;
    this.date = manifestEntry.date || '';
    this.video = manifestEntry.video ?? null;
    this.slides = manifestEntry.slides ?? null;
    this.additional_material = Array.isArray(manifestEntry.additional_material) ? manifestEntry.additional_material : [];
    this.color = manifestEntry.color || '';
    this.wash = manifestEntry.wash || '';
    this.duration = manifestEntry.duration || 0;
    this.readmeUrl = manifestEntry.readmeUrl || '';
    this.keyTakeaway = manifestEntry.keyTakeaway || '';
    this.whatToRead = manifestEntry.whatToRead || '';
  }

  /** Returns true when the meeting has a video asset and status is done. */
  hasVideo() {
    return this.status === 'done' && !!(this.video?.file);
  }

}

window.Meeting = Meeting;
window.STATUS = STATUS;
})();
