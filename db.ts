import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("logs.db");

export const initDb = () => {
  // CREATE TABLE IF NOT EXISTS logs (
  //   id INTEGER PRIMARY KEY AUTOINCREMENT,
  //   content TEXT NOT NULL,
  //   timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  // );
  db.execSync("PRAGMA foreign_keys = ON;");
  db.execSync(`
    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      emoji TEXT,
      color TEXT,
      type TEXT,
      streak INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. Optimization (Don't make me wait for my data)
    CREATE INDEX IF NOT EXISTS idx_logs_habit_id ON logs(habit_id);
    CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
  `);
};
