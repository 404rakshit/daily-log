import { useColorScheme } from "react-native";
import { Themes } from "../constants/theme";
import { useEffect, useState } from "react";
import { db, initDb } from "../db";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format, isToday, isYesterday } from "date-fns";
import { groupLogsByDay } from "../helper/format/date";

type ThemeMode = "system" | "light" | "dark";

export default function useLog() {
  const systemScheme = useColorScheme(); // 'light' or 'dark'
  const [logs, setLogs] = useState<unknown[]>([]);
  const [text, setText] = useState("");
  const [themeMode, setThemeMode] = useState<"system" | "light" | "dark">(
    "system",
  );

  const activeScheme =
    themeMode === "system" ? (systemScheme ?? "light") : themeMode;
  const theme = Themes[activeScheme ?? "light"];

  const toggleTheme = () => {
    const modes: ("system" | "light" | "dark")[] = ["system", "light", "dark"];
    const nextMode = modes[(modes.indexOf(themeMode) + 1) % modes.length];
    setThemeMode(nextMode);
    saveTheme(nextMode);
  };

  useEffect(() => {
    initDb();
    refreshLogs();
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const savedTheme = await AsyncStorage.getItem("@theme_mode");
    if (savedTheme) setThemeMode(savedTheme as ThemeMode);
  };

  const saveTheme = async (mode: ThemeMode) => {
    setThemeMode(mode);
    await AsyncStorage.setItem("@theme_mode", mode);
  };

  const refreshLogs = () => {
    const results = db.getAllSync("SELECT * FROM logs ORDER BY id DESC");
    setLogs(results);
  };

  const addLog = () => {
    if (!text.trim()) return;
    db.runSync("INSERT INTO logs (content) VALUES (?)", text);
    setText("");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    refreshLogs();
  };

  const sectionedLogs = groupLogsByDay(logs);

  const isDarkThemed = activeScheme === "dark" ? "light" : "dark";

  return {
    theme,
    systemScheme,

    isDarkThemed,

    themeMode,
    setThemeMode,
    toggleTheme,

    addLog,
    refreshLogs,
    activeScheme,

    sectionedLogs,

    logs,
    setLogs,
    text,
    setText,
  };
}
