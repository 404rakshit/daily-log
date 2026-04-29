import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// 1. FOREGROUND BEHAVIOR
Notifications.setNotificationHandler({
  handleNotification:
    async (): Promise<Notifications.NotificationBehavior> => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
});

// 2. SETUP & PERMISSIONS (No Expo Push Tokens needed!)
export async function setupLocalNotifications() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("habit-reminders", {
      name: "Habit Reminders",
      importance: Notifications.AndroidImportance.MAX, // High priority
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#3b82f6",
      sound: "classic-alarm.wav",
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true, // Optional: Allows alarm to ring during DND
    });

    // CRITICAL: Check for Exact Alarm permission on Android 13+
    const { status: exactAlarmStatus } =
      await Notifications.getPermissionsAsync();
    if (exactAlarmStatus !== "granted") {
      await Notifications.requestPermissionsAsync();
    }
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === "granted";
}

export async function scheduleHabitReminders(
  habitId: number,
  title: string,
  emoji: string,
  frequencyType: string,
  daysOfWeek: string | null,
  reminders: string[],
): Promise<string[]> {
  const scheduledIds: string[] = [];

  for (const time of reminders) {
    const [hourStr, minuteStr] = time.split(":");
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    const content: Notifications.NotificationContentInput = {
      title: `${emoji} Time to ${title}!`,
      body: `Tap to mark it as complete.`,
      sound: true,
      data: { habitId },
      // android: {
      //   channelId: "habit-reminders",
      //   // Ensures the notification appears as a "Heads-up" alarm
      //   priority: Notifications.AndroidNotificationPriority.MAX,
      // },
    };

    if (frequencyType === "DAILY") {
      const id = await Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY, // Works reliably on both
          hour,
          minute,
        },
      });
      scheduledIds.push(id);
    } else if (frequencyType === "SPECIFIC_DAYS" && daysOfWeek) {
      const days = daysOfWeek.split(",").map(Number);

      for (const day of days) {
        // iOS: Weekday 1 is Sunday. Android: Weekday 1 is Sunday.
        // We use CALENDAR type for both, but note the Android limitation below.
        const id = await Notifications.scheduleNotificationAsync({
          content,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            weekday: day + 1,
            hour,
            minute,
            repeats: true,
          },
        });
        scheduledIds.push(id);
      }
    }
  }
  return scheduledIds;
}

export async function cancelHabitNotifications(notificationIds: string[]) {
  if (!notificationIds) return;
  for (const id of notificationIds) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch (e) {
      console.error("Failed to cancel:", id);
    }
  }
}
