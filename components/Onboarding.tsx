import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";

import * as Haptics from "expo-haptics";
import { styles } from "../styles";

export const ONBOARDING_KEY = "@onboarding_done";

interface Props {
  onDone: () => void;
}

const PRESETS = [
  { title: "Water Intake", emoji: "💧", color: "#38bdf8", target: 4 },
  { title: "Book Reading", emoji: "📖", color: "#a78bfa", target: 2 },
  { title: "Gym Routine", emoji: "🏋️", color: "#f87171", target: 1 },
  { title: "Daily Walk", emoji: "👟", color: "#34d399", target: 1 },
  { title: "Meditation", emoji: "🧘", color: "#818cf8", target: 1 },
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
      <Text style={styles.headerSubtitle}>Design your day.</Text>
      <Text style={styles.onboardingDesc}>
        Select the habits you want to build.
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
                isSelected && {
                  borderColor: preset.color,
                  backgroundColor: "#1e293b",
                },
              ]}
            >
              <Text style={styles.emoji}>{preset.emoji}</Text>
              <Text
                style={[
                  styles.presetTitle,
                  { color: isSelected ? "#ffffff" : "#64748b" },
                ]}
              >
                {preset.title}
              </Text>
              {/* Show the target during selection */}
              <Text style={styles.presetTarget}>Goal: {preset.target}/day</Text>
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
