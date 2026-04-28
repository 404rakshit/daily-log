import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// 1. FOREGROUND BEHAVIOR
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // Replaces shouldShowBanner
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: false,
    shouldShowList: false,
  }),
});

// 2. SETUP & PERMISSIONS (No Expo Push Tokens needed!)
export async function setupLocalNotifications() {
  // A. Set up the Android Channel (Required for Android 8.0+)
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("habit-reminders", {
      name: "Habit Reminders",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#3b82f6", // Your brand color
    });
  }

  // B. Request Local Permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("Failed to get permissions for local notifications!");
    return false;
  }
  return true;
}

// 3. THE LOCAL SCHEDULING ENGINE
export async function scheduleHabitReminders(
  habitId: number, // We pass the ID now so the notification knows which habit it belongs to
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

    const content = {
      title: `${emoji} Time to ${title}!`,
      body: `Tap to mark it as complete.`,
      sound: true,
      data: { habitId }, // Hidden data payload!
    };

    if (frequencyType === "DAILY") {
      const id = await Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour,
          minute,
          repeats: true,
          channelId: "habit-reminders", // Map to Android channel
        },
      });
      scheduledIds.push(id);
    } else if (frequencyType === "SPECIFIC_DAYS" && daysOfWeek) {
      const days = daysOfWeek.split(",").map(Number);
      for (const day of days) {
        const id = await Notifications.scheduleNotificationAsync({
          content,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            weekday: day + 1,
            hour,
            minute,
            repeats: true,
            channelId: "habit-reminders",
          },
        });
        scheduledIds.push(id);
      }
    }
  }
  return scheduledIds;
}

// 4. CLEANUP
export async function cancelHabitNotifications(notificationIds: string[]) {
  for (const id of notificationIds) {
    await Notifications.cancelScheduledNotificationAsync(id);
  }
}
