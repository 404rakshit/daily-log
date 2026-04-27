import * as SQLite from "expo-sqlite";

// --- 1. LOCAL DATABASE LAYER ---
const db = SQLite.openDatabaseSync("dailylog.db");

const initDB = () => {
  // NUKE OLD TABLES FOR THIS SCHEMA UPGRADE
  db.execSync(`
    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      emoji TEXT,
      color TEXT,
      daily_target INTEGER DEFAULT 1,
      streak INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER,
      date_logged TEXT -- YYYY-MM-DD for easy querying
    );
  `);
};

export { initDB, db };
