// Service B - Calendar Events
class CalendarEvent {
    constructor(title, startDate, endDate, location) {
        this.title = title;
        this.startDate = startDate;
        this.endDate = endDate;
        this.location = location;
    }
}

function scheduleReminder(eventId, reminderMinutes) {
    const now = Date.now();
    const reminderDate = new Date(now + reminderMinutes * 60000);
    return { eventId, reminderDate, status: "scheduled" };
}
