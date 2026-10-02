import * as Notifications from 'expo-notifications';
import {SchedulableTriggerInputTypes} from 'expo-notifications';

type ScheduleRequest = Parameters<typeof Notifications.scheduleNotificationAsync>[0];
type NotificationContent = ScheduleRequest['content'];

function parseClockTime(time: string): {hour: number; minute: number} {
  const [hour, minute] = time.split(':').map(Number);
  return {hour, minute};
}

export function applyClockTime(date: Date, time: string): Date {
  const nextDate = new Date(date);
  const {hour, minute} = parseClockTime(time);
  nextDate.setHours(hour, minute, 0, 0);
  return nextDate;
}

export async function scheduleImmediateNotification(content: NotificationContent): Promise<string> {
  return await Notifications.scheduleNotificationAsync({
    content,
    trigger: null,
  });
}

export async function scheduleDateNotification(
  content: NotificationContent,
  date: Date,
): Promise<string> {
  return await Notifications.scheduleNotificationAsync({
    content,
    trigger: {
      type: SchedulableTriggerInputTypes.DATE,
      date,
    },
  });
}

export async function scheduleDailyNotification(
  content: NotificationContent,
  time: string,
): Promise<string> {
  const {hour, minute} = parseClockTime(time);

  return await Notifications.scheduleNotificationAsync({
    content,
    trigger: {
      type: SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function scheduleWeeklyNotification(
  content: NotificationContent,
  weekdayIndex: number,
  time: string,
): Promise<string> {
  const {hour, minute} = parseClockTime(time);

  return await Notifications.scheduleNotificationAsync({
    content,
    trigger: {
      type: SchedulableTriggerInputTypes.WEEKLY,
      weekday: weekdayIndex + 1,
      hour,
      minute,
    },
  });
}
