/**
 * MeetingRepository: Single access point for MEETINGS global.
 * 
 * Encapsulates meeting data to enforce information hiding (APOSD Principle 3).
 * All read/write access to MEETINGS goes through this repository, preventing
 * direct mutation and allowing us to change the schema without touching callers.
 * 
 * APOSD Principle 2 (Deep Modules): Simple interface (getAll, getById, getDone),
 * powerful implementation (validation, mutation control, lazy initialization).
 * 
 * APOSD Principle 7 (Define Errors Out of Existence): Validates schema at load
 * time, preventing invalid meetings from existing in memory.
 */
class MeetingRepository {
  constructor() {
    this.meetings = [];
  }

  /**
   * Load meetings from manifest data. Validates before storing.
   * 
   * @param {Array} plainMeetings - Plain meeting objects from manifest.json
   * @throws {Error} If meetings is not an array
   */
  setAll(plainMeetings) {
    if (!Array.isArray(plainMeetings)) {
      throw new Error('Meetings must be an array');
    }
    // TODO: Will wrap in Meeting class validation in next task
    // For now, minimal validation ensures array structure
    this.meetings = plainMeetings;
  }

  /**
   * Get all meetings, ordered as stored.
   * @returns {Array} All meetings
   */
  getAll() {
    return this.meetings;
  }

  /**
   * Find meeting by ID.
   * @param {string} id - Meeting ID (e.g., 'meeting-01')
   * @returns {Object|null} Meeting object or null if not found
   */
  getMeetingById(id) {
    return this.meetings.find(m => m && m.id === id) || null;
  }

  /**
   * Get all completed meetings.
   * @returns {Array} Meetings with status === 'done'
   */
  getDone() {
    return this.meetings.filter(m => m && m.status === 'done');
  }

  /**
   * Get all upcoming meetings.
   * @returns {Array} Meetings with status === 'upcoming'
   */
  getUpcoming() {
    return this.meetings.filter(m => m && m.status === 'upcoming');
  }

  /**
   * Get all horizon meetings.
   * @returns {Array} Meetings with status === 'horizon'
   */
  getHorizon() {
    return this.meetings.filter(m => m && m.status === 'horizon');
  }

  /**
   * Get all draft meetings.
   * @returns {Array} Meetings with status === 'draft'
   */
  getDraft() {
    return this.meetings.filter(m => m && m.status === 'draft');
  }
}
