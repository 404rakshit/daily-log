import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import Onboarding from "./components/Onboarding";
import { styles } from "./styles";
import { Habit } from "./types";
import useLogStore from "./store/logState";
import { db, initDB } from "./db";
import { CelebrationOverlay } from "./components/Celebration";
import EmptyView from "./components/EmptyView";

// --- 3. UI COMPONENTS ---
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const HabitCard = ({ habit, isGrid }: { habit: Habit; isGrid: boolean }) => {
  const { logWin, undoWin, recentlyCompleted } = useLogStore();
  const scale = useSharedValue(1);

  // New animation values for the shockwave
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);

  const isDone = habit.today_progress >= habit.daily_target;
  const isRecent = recentlyCompleted.includes(habit.id);
  const showUndo = habit.today_progress > 0;

  // FIRE THE DOPAMINE HIT
  useEffect(() => {
    if (isRecent) {
      // 1. The Shockwave (Scales to 1.3x and fades out)
      pulseScale.value = 1;
      pulseOpacity.value = 0.8;
      pulseScale.value = withTiming(1.3, { duration: 600 });
      pulseOpacity.value = withTiming(0, { duration: 600 });

      // 2. The Card Bounce (Swells up slightly, then snaps back)
      scale.value = withSequence(
        withSpring(1.05, { damping: 10, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 200 }),
      );
    }
  }, [isRecent]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  // Ensure boxes max out at 10 to protect UI
  const visualBoxesCount = Math.min(habit.daily_target, 10);

  return (
    <View style={isGrid ? styles.cardWrapperGrid : styles.cardWrapperList}>
      {/* THE SHOCKWAVE RING */}
      <Animated.View
        style={[styles.pulseRing, { borderColor: habit.color }, pulseStyle]}
        pointerEvents="none"
      />

      <AnimatedPressable
        onPressIn={() => {
          if (!isDone)
            scale.value = withSpring(0.92, { damping: 12, stiffness: 300 });
        }}
        onPressOut={() => {
          if (!isDone)
            scale.value = withSpring(1, { damping: 10, stiffness: 200 });
        }}
        onPress={() => {
          if (!isDone) logWin(habit);
        }}
        style={[
          styles.cardBase, // Shared base styles (colors, shadows, corners)
          isGrid ? styles.cardGrid : styles.cardList, // Explicit layout split
          isGrid
            ? { borderTopColor: habit.color }
            : { borderLeftColor: habit.color },
          isDone && !isRecent && styles.cardDone,
        ]}
      >
        {isGrid ? (
          // --- GRID VIEW INTERNAL LAYOUT (Keep your existing grid layout here) ---
          <>
            <View style={styles.actionRow}>
              {showUndo && (
                <Pressable
                  style={styles.iconBtn}
                  hitSlop={10}
                  onPress={() => undoWin(habit)}
                >
                  <Text style={styles.undoText}>-</Text>
                </Pressable>
              )}
              <View style={{ flex: 1 }} />
              {!isDone && (
                <Pressable
                  style={[styles.iconBtn, styles.addBtn]}
                  hitSlop={10}
                  onPress={() => logWin(habit)}
                >
                  <Text style={styles.addText}>+</Text>
                </Pressable>
              )}
            </View>
            <Text
              style={[styles.emoji, isDone && !isRecent && { opacity: 0.5 }]}
            >
              {habit.emoji}
            </Text>
            <View style={styles.cardData}>
              <Text
                style={[
                  styles.title,
                  isDone && !isRecent && { color: "#64748b" },
                ]}
              >
                {habit.title}
              </Text>
              {isDone ? (
                <Text style={[styles.streak, { color: habit.color }]}>
                  ✅ Done (🔥 {habit.streak})
                </Text>
              ) : (
                <View style={styles.progressWrapper}>
                  <View style={styles.pipsContainer}>
                    {Array.from({ length: visualBoxesCount }).map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.pip,
                          i < habit.today_progress
                            ? {
                                backgroundColor: habit.color,
                                borderColor: habit.color,
                              }
                            : { borderColor: "#334155" },
                        ]}
                      />
                    ))}
                    {habit.daily_target > 10 && (
                      <Text style={styles.pipOverflowText}>+</Text>
                    )}
                  </View>
                  <Text style={styles.smallProgressText}>
                    {habit.today_progress}/{habit.daily_target}
                  </Text>
                </View>
              )}
            </View>
          </>
        ) : (
          // --- NEW: LIST VIEW INTERNAL LAYOUT ---
          <View style={styles.listInner}>
            <Text
              style={[
                styles.emojiList,
                isDone && !isRecent && { opacity: 0.5 },
              ]}
            >
              {habit.emoji}
            </Text>

            <View style={styles.cardDataList}>
              <Text
                style={[
                  styles.title,
                  isDone && !isRecent && { color: "#64748b" },
                ]}
              >
                {habit.title}
              </Text>
              {isDone ? (
                <Text style={[styles.streak, { color: habit.color }]}>
                  ✅ Done (🔥 {habit.streak})
                </Text>
              ) : (
                <View style={styles.progressWrapper}>
                  <View style={styles.pipsContainer}>
                    {Array.from({ length: visualBoxesCount }).map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.pip,
                          i < habit.today_progress
                            ? {
                                backgroundColor: habit.color,
                                borderColor: habit.color,
                              }
                            : { borderColor: "#334155" },
                        ]}
                      />
                    ))}
                  </View>
                </View>
              )}
            </View>

            <View style={styles.actionRowList}>
              {showUndo && (
                <Pressable
                  style={styles.iconBtn}
                  hitSlop={15}
                  onPress={() => undoWin(habit)}
                >
                  <Text style={styles.undoText}>-</Text>
                </Pressable>
              )}
              {!isDone && (
                <Pressable
                  style={[styles.iconBtn, styles.addBtn]}
                  hitSlop={15}
                  onPress={() => logWin(habit)}
                >
                  <Text style={styles.addText}>+</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}
      </AnimatedPressable>
    </View>
  );
};

// --- 4. MAIN APP MOUNT ---
export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newEmoji, setNewEmoji] = useState("🚀");
  const [newColor, setNewColor] = useState("#8b5cf6"); // Default purple

  const { habits, loadHabits, addHabit } = useLogStore();
  const [isCompletedCollapsed, setIsCompletedCollapsed] = useState(false);

  const [isGrid, setIsGrid] = useState(true);

  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

  useEffect(() => {
    nukeDB()
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
    selectedPresets.forEach((preset) => {
      db.runSync(
        "INSERT INTO habits (title, emoji, color, daily_target) VALUES (?, ?, ?, ?)",
        preset.title,
        preset.emoji,
        preset.color,
        preset.target,
      );
    });
    loadHabits();
  };

  if (!isReady) return null;

  if (habits.length === 0) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  const ongoingHabits = habits.filter(
    (h) =>
      h.today_progress < h.daily_target ||
      useLogStore.getState().recentlyCompleted.includes(h.id),
  );

  const completedHabits = habits.filter(
    (h) =>
      h.today_progress >= h.daily_target &&
      !useLogStore.getState().recentlyCompleted.includes(h.id),
  );

  return (
    <View style={styles.container}>
      <CelebrationOverlay />
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.dateText}>{today}</Text>
            <Text style={styles.headerSubtitle}>Today's Log</Text>
          </View>

          {/* THE VIEW TOGGLE BUTTON */}
          <Pressable
            style={styles.viewToggleBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsGrid(!isGrid);
            }}
          >
            <Text style={styles.viewToggleText}>{isGrid ? "☰" : "▦"}</Text>
          </Pressable>
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>
            You've crushed{" "}
            <Text style={styles.summaryHighlight}>
              {completedHabits.length} of {habits.length}
            </Text>{" "}
            daily targets. Keep pushing.
          </Text>
        </View>
      </View>

      {/* ONGOING SECTION */}
      {ongoingHabits.length === 0 ? (
        <EmptyView />
      ) : (
        <View style={styles.grid}>
          {ongoingHabits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} isGrid={isGrid} />
          ))}
        </View>
      )}

      {/* COMPLETED COLLAPSIBLE SECTION */}
      {completedHabits.length > 0 && (
        <View style={styles.completedSection}>
          <Pressable
            style={styles.completedHeader}
            onPress={() => setIsCompletedCollapsed(!isCompletedCollapsed)}
          >
            <Text style={styles.completedHeaderText}>
              Completed ({completedHabits.length})
            </Text>
            <Text style={styles.completedHeaderIcon}>
              {isCompletedCollapsed ? "▼" : "▲"}
            </Text>
          </Pressable>

          {!isCompletedCollapsed && (
            <View style={[styles.grid, { opacity: 0.8 }]}>
              {completedHabits.map((habit) => (
                <HabitCard key={habit.id} habit={habit} isGrid={isGrid} />
              ))}
            </View>
          )}
        </View>
      )}

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

const nukeDB = () => {
  db.execSync("DROP TABLE IF EXISTS habits;");
  db.execSync("DROP TABLE IF EXISTS logs;");
  useLogStore.setState({ habits: [] }); // Reset Zustand state
  console.log("☢️ DB Nuked. Reload the app.");
};
