import { create } from "zustand";
import { Habit } from "../types";
import { db } from "../db";
import * as Haptics from "expo-haptics";

interface LogStore {
  habits: Habit[];
  recentlyCompleted: number[];
  celebrationEvent: { id: number; color: string; emoji: string } | null; // NEW: Event data
  clearEvent: () => void;
  loadHabits: () => void;
  logWin: (habit: Habit) => void;
  undoWin: (habit: Habit) => void;
  addHabit: (title: string, emoji: string, color: string) => void;
}

const useLogStore = create<LogStore>((set, get) => ({
  habits: [],
  recentlyCompleted: [], // NEW: Tracks habits completing right now

  celebrationEvent: null,
  clearEvent: () => set({ celebrationEvent: null }),

  loadHabits: () => {
    const today = new Date().toISOString().split("T")[0];
    const query = `
      SELECT h.*, 
        (SELECT COUNT(*) FROM logs l WHERE l.habit_id = h.id AND l.date_logged = '${today}') as today_progress
      FROM habits h;
    `;
    const allHabits = db.getAllSync<Habit>(query);
    set({ habits: allHabits });
  },

  logWin: (habit) => {
    // 1. Core Logic (same as before)
    if (habit.today_progress >= habit.daily_target) return;
    const today = new Date().toISOString().split("T")[0];
    db.runSync(
      "INSERT INTO logs (habit_id, date_logged) VALUES (?, ?)",
      habit.id,
      today,
    );

    const newProgress = habit.today_progress + 1;
    const isNowDone = newProgress >= habit.daily_target;

    if (isNowDone) {
      db.runSync(
        "UPDATE habits SET streak = streak + 1 WHERE id = ?",
        habit.id,
      );

      // 2. THIS IS THE TRIGGER: Emit the celebration event
      // We send the color and emoji to personalize the character/dimming.
      set({
        celebrationEvent: {
          id: habit.id,
          color: habit.color,
          emoji: habit.emoji,
        },
      });
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    get().loadHabits();
  },

  undoWin: (habit) => {
    if (habit.today_progress === 0) return;

    const today = new Date().toISOString().split("T")[0];
    db.runSync(
      "DELETE FROM logs WHERE id = (SELECT id FROM logs WHERE habit_id = ? AND date_logged = ? ORDER BY id DESC LIMIT 1)",
      habit.id,
      today,
    );

    if (habit.today_progress >= habit.daily_target) {
      db.runSync(
        "UPDATE habits SET streak = MAX(0, streak - 1) WHERE id = ?",
        habit.id,
      );
      // NEW: Instantly kill the animation state if they undo
      set((state) => ({
        recentlyCompleted: state.recentlyCompleted.filter(
          (id) => id !== habit.id,
        ),
      }));
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    get().loadHabits();
  },

  addHabit: (title, emoji, color) => {
    const result = db.runSync(
      "INSERT INTO habits (title, emoji, color, daily_target) VALUES (?, ?, ?, ?)",
      title,
      emoji,
      color,
      1,
    );
    const newHabit = {
      id: result.lastInsertRowId,
      title,
      emoji,
      color,
      daily_target: 1,
      streak: 0,
      today_progress: 0,
    };
    set((state) => ({ habits: [...state.habits, newHabit] }));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },
}));

export default useLogStore;
