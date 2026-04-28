import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";

const { width } = Dimensions.get("window");

const PRESETS = [
  { title: "Read a Book", emoji: "📖", color: "#3b82f6", dailyTarget: 1 },
  { title: "Drink Water", emoji: "💧", color: "#06b6d4", dailyTarget: 3 },
  { title: "Workout", emoji: "💪", color: "#f59e0b", dailyTarget: 1 },
];

const ONBOARDING_STEPS = [
  {
    icon: "star",
    title: "Welcome to Your Next Chapter",
    description:
      "A beautiful, frictionless way to build habits, maintain streaks, and track your daily progress without the clutter.",
  },
  {
    icon: "target", // Visual cue for mechanics
    title: "Tactile Controls",
    description:
      "Tap any habit card to log a win.\n\nMade a mistake or need to adjust the schedule? Just long-press the card to Edit or Delete it.",
  },
  {
    icon: "zap",
    title: "Start Strong",
    description:
      "Pick a preset habit below to instantly add it to your dashboard, or skip to create your own from scratch.",
  },
];

interface OnboardingProps {
  onComplete: (selectedPresets: any[]) => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [selectedPresets, setSelectedPresets] = useState<number[]>([]);

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < ONBOARDING_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      // Finish Onboarding! Map the selected indices back to the actual preset objects
      const habitsToCreate = selectedPresets.map((index) => PRESETS[index]);
      onComplete(habitsToCreate);
    }
  };

  const togglePreset = (index: number) => {
    Haptics.selectionAsync();
    setSelectedPresets((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const currentData = ONBOARDING_STEPS[step];

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        {/* Dynamic Progress Dots */}
        <View style={styles.progressRow}>
          {ONBOARDING_STEPS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, step === i && styles.dotActive]}
            />
          ))}
        </View>

        {/* The Animated Content */}
        <Animated.View
          key={step} // Changing the key forces Reanimated to run the enter/exit animations
          entering={FadeInRight.duration(400)}
          exiting={FadeOutLeft.duration(300)}
          style={styles.contentContainer}
        >
          <View style={styles.iconCircle}>
            <Feather name={currentData.icon as any} size={40} color="#3b82f6" />
          </View>

          <Text style={styles.title}>{currentData.title}</Text>
          <Text style={styles.description}>{currentData.description}</Text>

          {/* STEP 3 ONLY: Show the Presets */}
          {step === 2 && (
            <View style={styles.presetGrid}>
              {PRESETS.map((preset, index) => {
                const isSelected = selectedPresets.includes(index);
                return (
                  <Pressable
                    key={index}
                    style={[
                      styles.presetCard,
                      isSelected && {
                        borderColor: preset.color,
                        backgroundColor: `${preset.color}15`,
                      },
                    ]}
                    onPress={() => togglePreset(index)}
                  >
                    <Text style={styles.presetEmoji}>{preset.emoji}</Text>
                    <Text style={styles.presetTitle}>{preset.title}</Text>
                    {isSelected && (
                      <View
                        style={[
                          styles.checkCircle,
                          { backgroundColor: preset.color },
                        ]}
                      >
                        <Feather name="check" size={14} color="#fff" />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}
        </Animated.View>

        {/* Bottom Action Button */}
        <View style={styles.footer}>
          <Pressable style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextBtnText}>
              {step === 2
                ? selectedPresets.length > 0
                  ? `Start with ${selectedPresets.length} Habit(s)`
                  : "Skip & Create My Own"
                : "Continue"}
            </Text>
            <Feather
              name="arrow-right"
              size={20}
              color="#fff"
              style={{ marginLeft: 8 }}
            />
          </Pressable>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0f172a", // Your dark background color
  },
  container: { flex: 1, backgroundColor: "#0f172a" },
  progressRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    gap: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#334155" },
  dotActive: { width: 24, backgroundColor: "#3b82f6" },
  contentContainer: {
    flex: 1,
    padding: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 24,
  },

  presetGrid: { width: "100%", marginTop: 32, gap: 12 },
  presetCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  presetEmoji: { fontSize: 24, marginRight: 16 },
  presetTitle: { fontSize: 18, color: "#fff", fontWeight: "600", flex: 1 },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  footer: { padding: 32, paddingBottom: 40 },
  nextBtn: {
    flexDirection: "row",
    backgroundColor: "#3b82f6",
    paddingVertical: 18,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  nextBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
