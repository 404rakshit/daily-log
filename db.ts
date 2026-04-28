import * as SQLite from "expo-sqlite";
import { scheduleHabitReminders } from "./helper/notifications";

// --- 1. LOCAL DATABASE LAYER ---
const db = SQLite.openDatabaseSync("dailylog.db");

db.execSync("PRAGMA foreign_keys = ON;");

const initDB = () => {
  // NUKE OLD TABLES FOR THIS SCHEMA UPGRADE
  db.execSync(`
    
    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      emoji TEXT,
      color TEXT,
      daily_target INTEGER DEFAULT 1,
      streak INTEGER DEFAULT 0,
      notification_ids TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS habit_schedules (
    habit_id INTEGER PRIMARY KEY,
    frequency_type TEXT NOT NULL, -- 'DAILY', 'SPECIFIC_DAYS', 'INTERVAL'
    days_of_week TEXT,            -- Stored as comma-separated integers: "0,6" (Sun, Sat)
    interval_days INTEGER,        -- For "Every X days" logic
    FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS habit_reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL,
    time_of_day TEXT NOT NULL,    -- Stored in 24h format: "09:00", "14:30"
    is_enabled BOOLEAN DEFAULT 1, -- Allows toggling without deleting the row
    FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER,
      date_logged TEXT -- YYYY-MM-DD for easy querying
    );
  `);
};

export const createHabitTransaction = async (payload: any) => {
  try {
    await db.withTransactionAsync(async () => {
      // 1. INSERT CORE HABIT FIRST (Leave notification_ids null for exactly one millisecond)
      const habitResult = await db.runAsync(
        `INSERT INTO habits (title, emoji, color, daily_target) VALUES (?, ?, ?, ?);`,
        [payload.title, payload.emoji, payload.color, payload.dailyTarget],
      );

      // BOOM: We now have our database-generated ID!
      const newHabitId = habitResult.lastInsertRowId;

      // 2. NOW SCHEDULE THE NOTIFICATIONS (Passing the newHabitId as the 1st argument)
      const scheduledIds = await scheduleHabitReminders(
        newHabitId, // <-- We now have the 6th argument!
        payload.title,
        payload.emoji,
        payload.schedule.frequencyType,
        payload.schedule.daysOfWeek,
        payload.reminders,
      );

      // 3. UPDATE THE HABIT ROW TO SAVE THE EXPO IDS
      if (scheduledIds.length > 0) {
        const idsString = scheduledIds.join(",");
        await db.runAsync(
          `UPDATE habits SET notification_ids = ? WHERE id = ?;`,
          [idsString, newHabitId],
        );
      }

      // 4. INSERT SCHEDULE
      await db.runAsync(
        `INSERT INTO habit_schedules (habit_id, frequency_type, days_of_week) VALUES (?, ?, ?);`,
        [
          newHabitId,
          payload.schedule.frequencyType,
          payload.schedule.daysOfWeek,
        ],
      );

      // 5. INSERT REMINDERS
      if (payload.reminders && payload.reminders.length > 0) {
        for (const time of payload.reminders) {
          await db.runAsync(
            `INSERT INTO habit_reminders (habit_id, time_of_day) VALUES (?, ?);`,
            [newHabitId, time],
          );
        }
      }

      console.log(
        `✅ Habit created and scheduled successfully with ID: ${newHabitId}`,
      );
    });

    return true;
  } catch (error) {
    console.error("❌ Failed to create habit transaction:", error);
    return false;
  }
};
// db.ts
export const deleteHabit = async (habitId: number) => {
  try {
    // Because of 'ON DELETE CASCADE' in our schema, this single query
    // safely wipes the habit AND its schedules AND its reminders automatically!
    await db.runAsync(`DELETE FROM habits WHERE id = ?;`, [habitId]);
    console.log(`🗑️ Habit ${habitId} permanently deleted.`);
    return true;
  } catch (error) {
    console.error("❌ Failed to delete habit:", error);
    return false;
  }
};

// db.ts
export const updateHabitTransaction = async (habitId: number, payload: any) => {
  try {
    await db.withTransactionAsync(async () => {
      // 1. UPDATE CORE HABIT
      await db.runAsync(
        `UPDATE habits SET title = ?, emoji = ?, color = ?, daily_target = ? WHERE id = ?;`,
        [
          payload.title,
          payload.emoji,
          payload.color,
          payload.dailyTarget,
          habitId,
        ],
      );

      // 2. WIPE EXISTING SCHEDULES & REMINDERS
      await db.runAsync(`DELETE FROM habit_schedules WHERE habit_id = ?;`, [
        habitId,
      ]);
      await db.runAsync(`DELETE FROM habit_reminders WHERE habit_id = ?;`, [
        habitId,
      ]);

      // 3. RE-INSERT NEW SCHEDULE
      await db.runAsync(
        `INSERT INTO habit_schedules (habit_id, frequency_type, days_of_week) VALUES (?, ?, ?);`,
        [habitId, payload.schedule.frequencyType, payload.schedule.daysOfWeek],
      );

      // 4. RE-INSERT NEW REMINDERS
      if (payload.reminders && payload.reminders.length > 0) {
        for (const time of payload.reminders) {
          await db.runAsync(
            `INSERT INTO habit_reminders (habit_id, time_of_day) VALUES (?, ?);`,
            [habitId, time],
          );
        }
      }
      console.log(`✅ Habit ${habitId} updated successfully.`);
    });
    return true;
  } catch (error) {
    console.error("❌ Failed to update habit:", error);
    return false;
  }
};

export { initDB, db };
