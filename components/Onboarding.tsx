import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  useColorScheme,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BookOpen, PenLine, CalendarDays, SunMoon } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const ONBOARDING_KEY = "@onboarding_done";

const SLIDES = [
  {
    id: "1",
    Icon: BookOpen,
    title: "Daily Log",
    subtitle:
      "Your personal space to capture thoughts, moments, and memories — one entry at a time.",
  },
  {
    id: "2",
    Icon: PenLine,
    title: "Log Instantly",
    subtitle:
      "Type anything on your mind and tap Save. Each entry is stamped with the exact time, automatically.",
  },
  {
    id: "3",
    Icon: CalendarDays,
    title: "Browse the Past",
    subtitle:
      "Tap the calendar icon to filter logs by date range and revisit any day in your history.",
  },
  {
    id: "4",
    Icon: SunMoon,
    title: "Your Comfort",
    subtitle:
      "Switch between light, dark, or system theme anytime using the toggle in the header.",
  },
];

function Dot({ active }: { active: boolean }) {
  const animStyle = useAnimatedStyle(() => ({
    width: withSpring(active ? 24 : 8, { damping: 15 }),
    backgroundColor: active ? "#007AFF" : "#cccccc",
  }));
  return (
    <Animated.View
      style={[{ height: 8, borderRadius: 4, marginHorizontal: 4 }, animStyle]}
    />
  );
}

function SlideItem({
  item,
  isActive,
  isDark,
}: {
  item: (typeof SLIDES)[0];
  isActive: boolean;
  isDark: boolean;
}) {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      scale.value = withSpring(1, { damping: 12, stiffness: 120 });
      opacity.value = withTiming(1, { duration: 280 });
    } else {
      scale.value = 0.5;
      opacity.value = 0;
    }
  }, [isActive]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const { Icon } = item;
  const textColor = isDark ? "#ffffff" : "#000000";
  const secondaryColor = isDark ? "#aaaaaa" : "#888888";

  return (
    <View
      style={{
        width: SCREEN_WIDTH,
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 40,
      }}
    >
      <Animated.View style={[{ marginBottom: 44 }, animStyle]}>
        <Icon size={80} color="#007AFF" strokeWidth={1.5} />
      </Animated.View>
      <Text
        style={{
          fontSize: 28,
          fontWeight: "700",
          color: textColor,
          textAlign: "center",
          marginBottom: 16,
        }}
      >
        {item.title}
      </Text>
      <Text
        style={{
          fontSize: 16,
          color: secondaryColor,
          textAlign: "center",
          lineHeight: 26,
        }}
      >
        {item.subtitle}
      </Text>
    </View>
  );
}

interface Props {
  onDone: () => void;
}

export default function Onboarding({ onDone }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const bg = isDark ? "#121212" : "#ffffff";
  const isLast = currentIndex === SLIDES.length - 1;

  const goTo = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (isLast) {
      AsyncStorage.setItem(ONBOARDING_KEY, "true").then(onDone);
    } else {
      goTo(currentIndex + 1);
    }
  };

  const handleSkip = () => goTo(SLIDES.length - 1);

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: bg,
        zIndex: 100,
      }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <SlideItem
              item={item}
              isActive={index === currentIndex}
              isDark={isDark}
            />
          )}
          style={{ flex: 1 }}
        />

        {/* Dots indicator */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          {SLIDES.map((_, i) => (
            <Dot key={i} active={i === currentIndex} />
          ))}
        </View>

        {/* Navigation */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 28,
            paddingBottom: 24,
          }}
        >
          {!isLast ? (
            <TouchableOpacity onPress={handleSkip} style={{ padding: 8 }}>
              <Text style={{ color: "#888888", fontSize: 16 }}>Skip</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 52 }} />
          )}

          <TouchableOpacity
            onPress={handleNext}
            style={{
              backgroundColor: "#007AFF",
              paddingHorizontal: 32,
              paddingVertical: 14,
              borderRadius: 28,
            }}
          >
            <Text style={{ color: "#ffffff", fontWeight: "600", fontSize: 16 }}>
              {isLast ? "Get Started" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
