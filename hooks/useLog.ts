import { SectionList, useColorScheme } from "react-native";
import { Themes } from "../constants/theme";
import { useEffect, useRef, useState } from "react";
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

  const deleteLog = (id: number) => {
    db.runSync("DELETE FROM logs WHERE id = ?", [id]);
    refreshLogs();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const clearAllLogs = () => {
    db.runSync("DELETE FROM logs");
    refreshLogs();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const addLog = () => {
    if (!text.trim()) return;
    // Date.now() gets the exact local milliseconds
    db.runSync("INSERT INTO logs (content, timestamp) VALUES (?, ?)", [
      text,
      Date.now(),
    ]);
    setText("");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    refreshLogs();
  };

  const handleAddLog = () => {
    addLog();
    // Use a tiny timeout to ensure the list has updated before scrolling
    setTimeout(() => scrollToTop(), 100);
  };

  const sectionedLogs = groupLogsByDay(logs);

  const isDarkThemed = activeScheme === "dark" ? "light" : "dark";

  const sectionListRef = useRef<SectionList>(null);

  const scrollToTop = () => {
    if (sectionedLogs.length > 0 && sectionedLogs[0].data.length > 0) {
      sectionListRef.current?.scrollToLocation({
        sectionIndex: 0,
        itemIndex: 0,
        animated: true,
      });
    }
  };

  const isEmpty = logs.length === 0;

  return {
    theme,
    systemScheme,

    isDarkThemed,

    themeMode,
    setThemeMode,
    toggleTheme,

    isEmpty,
    deleteLog,
    clearAllLogs,

    handleAddLog,
    refreshLogs,
    activeScheme,

    sectionedLogs,
    sectionListRef,

    logs,
    setLogs,
    text,
    setText,
  };
}
