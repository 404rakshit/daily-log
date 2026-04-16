import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("logs.db");

export const initDb = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
};
