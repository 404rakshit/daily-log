import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";

import * as Haptics from "expo-haptics";
import { styles } from "../App";

export const ONBOARDING_KEY = "@onboarding_done";

interface Props {
  onDone: () => void;
}

const PRESETS = [
  { title: "Water Intake", emoji: "💧", color: "#38bdf8" }, // Soft Sky Blue
  { title: "Book Reading", emoji: "📖", color: "#a78bfa" }, // Muted Purple
  { title: "Gym Routine", emoji: "🏋️", color: "#f87171" }, // Soft Crimson
  { title: "Daily Walk", emoji: "👟", color: "#34d399" }, // Emerald Pastel
  { title: "Meditation", emoji: "🧘", color: "#818cf8" }, // Soft Indigo
  { title: "Journaling", emoji: "✍️", color: "#fbbf24" }, // Amber
];

const Onboarding = ({
  onComplete,
}: {
  onComplete: (selected: typeof PRESETS) => void;
}) => {
  const [selected, setSelected] = useState<typeof PRESETS>([]);

  const togglePreset = (preset: (typeof PRESETS)[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selected.find((s) => s.title === preset.title)) {
      setSelected(selected.filter((s) => s.title !== preset.title));
    } else {
      setSelected([...selected, preset]);
    }
  };

  return (
    <View style={styles.onboardingContainer}>
      <Text style={styles.headerSubtitle}>What do you want to track?</Text>
      <Text style={styles.onboardingDesc}>
        Select a few habits to get started.
      </Text>

      <View style={styles.grid}>
        {PRESETS.map((preset) => {
          const isSelected = !!selected.find((s) => s.title === preset.title);
          return (
            <Pressable
              key={preset.title}
              onPress={() => togglePreset(preset)}
              style={[
                styles.presetCard,
                { backgroundColor: isSelected ? preset.color : "#1e293b" },
                isSelected && styles.presetCardSelected,
              ]}
            >
              <Text style={styles.emoji}>{preset.emoji}</Text>
              <Text
                style={[
                  styles.presetTitle,
                  { color: isSelected ? "#fff" : "#94a3b8" },
                ]}
              >
                {preset.title}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={[
          styles.startBtn,
          selected.length === 0 && styles.startBtnDisabled,
        ]}
        disabled={selected.length === 0}
        onPress={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onComplete(selected);
        }}
      >
        <Text style={styles.startBtnText}>
          {selected.length === 0
            ? "Select a habit"
            : `Start Tracking (${selected.length})`}
        </Text>
      </Pressable>
    </View>
  );
};

export default Onboarding;
