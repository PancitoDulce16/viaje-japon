/** @typedef {'activity'|'flight'|'checkin'|'checkout'|'reservation'|'task_due'|'task_overdue'|'settlement'|'budget'|'document'|'trip_start'|'daily_summary'|'manual'} ReminderType */
/** @typedef {{type:ReminderType,title:string,message:string,tripId:string,recipientId:string,resourceId:string,scheduledAt:string,read:boolean,hidden:boolean,channels:string[],deduplicationId:string,actionPath:string}} UserNotification */
/** @typedef {{timeZone:string,leadMinutes:number,quietStart:string,quietEnd:string,mutedTripIds:string[],push:boolean}} NotificationPreferences */
export {};
