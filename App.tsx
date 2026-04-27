import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as SQLite from "expo-sqlite";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { create } from "zustand";
import Onboarding from "./components/Onboarding";

const { width } = Dimensions.get("window");

// --- 1. LOCAL DATABASE LAYER ---
const db = SQLite.openDatabaseSync("dailylog.db");

const initDB = () => {
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
  `);

  // const count: any = db.getFirstSync("SELECT COUNT(*) as count FROM habits");
  // if (count.count === 0) {
  //   db.execSync(`
  //     INSERT INTO habits (title, emoji, color, type) VALUES
  //     ('Book Reading', '📖', '#3b82f6', 'binary'),
  //     ('Water Intake', '💧', '#0ea5e9', 'counter'),
  //     ('Gym Routine', '🏋️', '#ef4444', 'binary');
  //   `);
  // }
};

// --- 2. STATE MANAGEMENT ---
interface Habit {
  id: number;
  title: string;
  emoji: string;
  color: string;
  type: string;
  streak: number;
}

interface LogStore {
  habits: Habit[];
  loadHabits: () => void;
  logWin: (habit: Habit) => void;
  addHabit: (title: string, emoji: string, color: string) => void;
}

const useLogStore = create<LogStore>((set, get) => ({
  habits: [],
  loadHabits: () => {
    const allHabits = db.getAllSync<Habit>("SELECT * FROM habits");
    set({ habits: allHabits });
  },
  logWin: (habit) => {
    db.runSync("INSERT INTO logs (habit_id) VALUES (?)", habit.id);
    db.runSync("UPDATE habits SET streak = streak + 1 WHERE id = ?", habit.id);

    if (habit.type === "counter") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    const updatedHabits = get().habits.map((h) =>
      h.id === habit.id ? { ...h, streak: h.streak + 1 } : h,
    );
    set({ habits: updatedHabits });
  },
  addHabit: (title, emoji, color) => {
    const result = db.runSync(
      "INSERT INTO habits (title, emoji, color, type) VALUES (?, ?, ?, ?)",
      title,
      emoji,
      color,
      "binary",
    );
    const newHabit = {
      id: result.lastInsertRowId,
      title,
      emoji,
      color,
      type: "binary",
      streak: 0,
    };
    set((state) => ({ habits: [...state.habits, newHabit] }));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },
}));

// --- 3. UI COMPONENTS ---
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const HabitCard = ({ habit }: { habit: Habit }) => {
  const logWin = useLogStore((state) => state.logWin);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.92, { damping: 12, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 10, stiffness: 200 });
        logWin(habit);
      }}
      style={[styles.card, animatedStyle, { borderTopColor: habit.color }]}
    >
      <Text style={styles.emoji}>{habit.emoji}</Text>
      <View style={styles.cardData}>
        <Text style={styles.title}>{habit.title}</Text>
        <Text style={[styles.streak, { color: habit.color }]}>
          🔥 {habit.streak} Wins
        </Text>
      </View>
    </AnimatedPressable>
  );
};

// --- 4. MAIN APP MOUNT ---
export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newEmoji, setNewEmoji] = useState("");
  const [newColor, setNewColor] = useState("#8b5cf6"); // Default purple

  const { habits, loadHabits, addHabit } = useLogStore();

  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

  useEffect(() => {
    // nukeDB()
    initDB();
    loadHabits();
    setIsReady(true);
  }, []);

  const handleCreate = () => {
    console.log({ newTitle, newEmoji });
    if (!newTitle.trim() || !newEmoji.trim()) return;
    console.log("ehlo2");
    addHabit(newTitle, newEmoji, newColor);
    setModalVisible(false);
    setNewTitle("");
    setNewEmoji("");
  };

  const handleOnboardingComplete = (selectedPresets: any[]) => {
    // Insert all selected presets into SQLite synchronously
    selectedPresets.forEach((preset) => {
      db.runSync(
        "INSERT INTO habits (title, emoji, color, type) VALUES (?, ?, ?, ?)",
        preset.title,
        preset.emoji,
        preset.color,
        "binary",
      );
    });
    // Reload state to transition UI to dashboard
    loadHabits();
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  if (!isReady) return null;

  // ROUTING LOGIC: If no habits exist, show onboarding
  if (habits.length === 0) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <View style={styles.container}>
      {/* REPLACE YOUR EXISTING <View style={styles.header}> WITH THIS WIDGET */}
      <View style={styles.header}>
        <Text style={styles.dateText}>{today}</Text>
        <Text style={styles.headerSubtitle}>Today's Log</Text>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>
            You are tracking{" "}
            <Text style={styles.summaryHighlight}>{habits.length} habits</Text>.
            Let's get to work.
          </Text>
        </View>
      </View>

      <View style={styles.grid}>
        {habits.map((habit) => (
          <HabitCard key={habit.id} habit={habit} />
        ))}
      </View>

      {/* THE FAB */}
      <Pressable
        style={styles.fab}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setModalVisible(true);
        }}
      >
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>

      {/* CREATION MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Habit</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Text style={styles.closeText}>Cancel</Text>
              </Pressable>
            </View>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.emojiInput}
                placeholder="🚀"
                placeholderTextColor="#475569"
                maxLength={2}
                value={newEmoji}
                onChangeText={setNewEmoji}
              />
              <TextInput
                style={styles.titleInput}
                placeholder="Habit Name"
                placeholderTextColor="#475569"
                value={newTitle}
                onChangeText={setNewTitle}
                autoFocus
              />
            </View>

            <View style={styles.colorRow}>
              {colors.map((c) => (
                <Pressable
                  key={c}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: c },
                    newColor === c && styles.colorSelected,
                  ]}
                  onPress={() => setNewColor(c)}
                />
              ))}
            </View>

            <Pressable style={styles.createBtn} onPress={handleCreate}>
              <Text style={styles.createBtnText}>Create Habit</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// --- STYLES ---
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "800",
    opacity: 0.5,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  emoji: { fontSize: 48 },
  cardData: { gap: 4 },
  title: { color: "#ffffff", fontSize: 16, fontWeight: "700" },

  // FAB Styles
  fab: {
    position: "absolute",
    bottom: 60,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  fabIcon: { fontSize: 32, fontWeight: "400", color: "#0f172a", marginTop: -4 },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#1e293b",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: { color: "#ffffff", fontSize: 20, fontWeight: "800" },
  closeText: { color: "#94a3b8", fontSize: 16, fontWeight: "600" },
  inputRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  emojiInput: {
    backgroundColor: "#0f172a",
    color: "#ffffff",
    fontSize: 32,
    width: 64,
    height: 64,
    borderRadius: 16,
    textAlign: "center",
  },
  titleInput: {
    flex: 1,
    backgroundColor: "#0f172a",
    color: "#ffffff",
    fontSize: 18,
    borderRadius: 16,
    paddingHorizontal: 20,
    fontWeight: "600",
  },
  colorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  colorSwatch: { width: 40, height: 40, borderRadius: 20, opacity: 0.5 },
  colorSelected: { opacity: 1, borderWidth: 3, borderColor: "#ffffff" },
  createBtn: {
    backgroundColor: "#ffffff",
    paddingVertical: 18,
    borderRadius: 100,
    alignItems: "center",
  },
  createBtnText: { color: "#0f172a", fontSize: 16, fontWeight: "800" },
  onboardingContainer: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  onboardingDesc: {
    color: "#94a3b8",
    fontSize: 18,
    marginTop: 12,
    marginBottom: 40,
  },
  presetCardSelected: {
    borderColor: "rgba(255,255,255,0.5)",
    transform: [{ scale: 1.05 }],
  },
  presetTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 12,
    textAlign: "center",
  },
  startBtn: {
    backgroundColor: "#ffffff",
    paddingVertical: 20,
    borderRadius: 100,
    alignItems: "center",
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  startBtnDisabled: { backgroundColor: "#334155", shadowOpacity: 0 },
  startBtnText: { color: "#0f172a", fontSize: 18, fontWeight: "900" },

  // OVERWRITE THESE HEADER STYLES
  header: { marginBottom: 32 },
  dateText: {
    color: "#64748b",
    fontSize: 16,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: "#ffffff",
    fontSize: 36,
    fontWeight: "900",
    marginTop: 4,
    letterSpacing: -1,
  },
  summaryBox: {
    marginTop: 16,
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  summaryText: {
    color: "#94a3b8",
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 22,
  },
  summaryHighlight: { color: "#ffffff", fontWeight: "800" },

  // OVERWRITE THESE CARD STYLES
  card: {
    width: (width - 56) / 2,
    aspectRatio: 1,
    borderRadius: 24,
    padding: 20,
    justifyContent: "space-between",
    backgroundColor: "#1e293b",
    borderTopWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  streak: { fontSize: 14, fontWeight: "800" },

  // OVERWRITE THE ONBOARDING PRESET CARD STYLE
  presetCard: {
    width: (width - 56) / 2,
    aspectRatio: 1.2,
    borderRadius: 20,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1e293b",
    backgroundColor: "#0f172a",
  },
});

const nukeDB = () => {
  db.execSync("DROP TABLE IF EXISTS habits;");
  db.execSync("DROP TABLE IF EXISTS logs;");
  useLogStore.setState({ habits: [] }); // Reset Zustand state
  console.log("☢️ DB Nuked. Reload the app.");
};
