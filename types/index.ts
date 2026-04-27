interface Habit {
  id: number;
  title: string;
  emoji: string;
  color: string;
  daily_target: number;
  streak: number;
  today_progress: number; // dynamically calculated
}

export { Habit };
