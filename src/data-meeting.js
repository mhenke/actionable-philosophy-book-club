class Meeting {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.status = data.status;
    this.date = data.date;
    this.video = data.video || {};
    this.slides = data.slides || {};
    this.podcasts = data.podcasts || [];
    this.resources = data.resources || [];
    this.color = data.color;
    this.wash = data.wash;
    this.duration = data.duration;
  }

  hasVideo() {
    return this.isDone() && !!(this.video && this.video.file);
  }

  getAssets() {
    return {
      video: this.video,
      slides: this.slides,
      podcasts: this.podcasts,
      resources: this.resources
    };
  }

  isDone() {
    return this.status === 'done';
  }

  isUpcoming() {
    return this.status === 'upcoming';
  }

  isHorizon() {
    return this.status === 'horizon';
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Meeting;
}
