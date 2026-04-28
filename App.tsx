import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import * as Haptics from "expo-haptics";
import Onboarding from "./components/Onboarding";
import { styles } from "./styles";
import useLogStore from "./store/logState";
import { createHabitTransaction, db, initDB } from "./db";
import { CelebrationOverlay } from "./components/Celebration";
import EmptyView from "./components/EmptyView";
import CreateHabitModal from "./components/CreationHabitModal";
import HabitCard from "./components/HabitCard";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const { habits, loadHabits } = useLogStore();
  const [isCompletedCollapsed, setIsCompletedCollapsed] = useState(false);

  const [isGrid, setIsGrid] = useState(true);

  useEffect(() => {
    // nukeDB()
    initDB();
    loadHabits();
    setIsReady(true);
  }, []);

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
    // <View style={styles.container}>
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <CelebrationOverlay />

        {/* REPLACED <View> WITH <ScrollView> */}
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent} // Padding goes here!
          showsVerticalScrollIndicator={false} // Hides the ugly scrollbar
        >
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
        </ScrollView>

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
        <CreateHabitModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSave={async (payload) => {
            // 1. Run the safe transaction
            const success = await createHabitTransaction(payload);

            if (success) {
              // 2. Close the modal
              setModalVisible(false);
              loadHabits();
            } else {
              alert(
                "Something went wrong saving your habit. Please try again.",
              );
            }
          }}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const nukeDB = () => {
  db.execSync("DROP TABLE IF EXISTS habits;");
  db.execSync("DROP TABLE IF EXISTS logs;");
  useLogStore.setState({ habits: [] });
  console.log("☢️ DB Nuked. Reload the app.");
};
