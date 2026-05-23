/**
 * Meeting: Immutable data class for meeting session metadata.
 * 
 * Validates schema at construction time (APOSD Principle 7: Define Errors Out of Existence).
 * Provides typed accessors to reduce information leakage across rendering functions.
 * 
 * APOSD Principle 3 (Information Hiding): Callers use methods like hasVideo(), isDone()
 * instead of accessing nested properties like meeting.video.file or meeting.status directly.
 * 
 * APOSD Principle 5 (Comments First): This comment defines the contract:
 * - A Meeting is created from a plain object (from manifest.json)
 * - Constructor validates: id, title, and status are required + valid
 * - Invalid data throws; valid meetings cannot fail at render time
 * - All assets (video, slides, podcasts, resources) are optional
 */
class Meeting {
  /**
   * Construct a Meeting from a plain object.
   * 
   * Validates required fields and status value. Throws if invalid.
   * This ensures only valid meetings can exist in the repository.
   * 
   * @param {Object} data - Plain meeting object from manifest.json
   * @param {string} data.id - Unique ID (required). E.g., 'meeting-01'
   * @param {string} data.title - Display title (required). E.g., 'Session 1: Design Philosophy'
   * @param {string} data.status - Status (required, must be 'done'|'upcoming'|'horizon'|'draft')
   * @param {string} [data.date] - ISO date string. Optional.
   * @param {Object} [data.video] - Video metadata { file, label }. Optional.
   * @param {Object} [data.slides] - Slides metadata { file }. Optional.
   * @param {Array} [data.podcasts] - Array of podcast file paths. Optional.
   * @param {Array} [data.resources] - Array of resource file paths. Optional.
   * @param {string} [data.color] - Spectrum color token (e.g., 'spectrum-1'). Optional.
   * @param {string} [data.wash] - Spectrum wash token (e.g., 'wash-1'). Optional.
   * @param {number} [data.duration] - Duration in seconds. Optional.
   * 
   * @throws {Error} If id, title, or status are missing or invalid.
   */
  constructor(data) {
    // Validate required fields (APOSD Rule 7: Define errors out of existence)
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

    // Store data (immutable by convention)
    this.id = data.id;
    this.title = data.title;
    this.status = data.status;
    this.date = data.date || '';
    this.video = data.video || {};
    this.slides = data.slides || {};
    this.podcasts = Array.isArray(data.podcasts) ? data.podcasts : [];
    this.resources = Array.isArray(data.resources) ? data.resources : [];
    this.color = data.color || '';
    this.wash = data.wash || '';
    this.duration = data.duration || 0;
  }

  /**
   * Whether this meeting has a completed video recording.
   * Returns true only if status is 'done' AND video.file exists.
   * 
   * Encapsulates the business logic: only finished meetings display videos.
   * Callers don't repeat `m.status === 'done' && m.video.file` everywhere.
   * 
   * @returns {boolean}
   */
  hasVideo() {
    return this.status === 'done' && !!(this.video && this.video.file);
  }

  /**
   * Whether this meeting has a completed status.
   * @returns {boolean}
   */
  isDone() {
    return this.status === 'done';
  }

  /**
   * Whether this meeting is upcoming (not yet started).
   * @returns {boolean}
   */
  isUpcoming() {
    return this.status === 'upcoming';
  }

  /**
   * Whether this meeting is on the horizon (future, exploratory).
   * @returns {boolean}
   */
  isHorizon() {
    return this.status === 'horizon';
  }

  /**
   * Whether this meeting is in draft (staging, not yet public).
   * @returns {boolean}
   */
  isDraft() {
    return this.status === 'draft';
  }

  /**
   * Get all assets for this meeting.
   * Consolidates access to video, slides, podcasts, resources.
   * 
   * @returns {Object} Object with keys: video, slides, podcasts, resources
   */
  getAssets() {
    return {
      video: this.video,
      slides: this.slides,
      podcasts: this.podcasts,
      resources: this.resources
    };
  }
}
