import React, { useEffect } from "react";
import { View, Text, StyleSheet, Modal, Dimensions } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import { useAudioPlayer } from "expo-audio";
import useLogStore from "../store/logState";

import LottieView from "lottie-react-native";

const { width, height } = Dimensions.get("window");

export const CelebrationOverlay = () => {
  const celebrationEvent = useLogStore((state) => state.celebrationEvent);
  const clearEvent = useLogStore((state) => state.clearEvent);

  const sfxPlayer = useAudioPlayer(require("../assets/mystery-sfx.wav"));

  // Animation values
  const bgOpacity = useSharedValue(0);
  const charY = useSharedValue(height / 2 + 200);
  const textScale = useSharedValue(0);

  useEffect(() => {
    if (celebrationEvent) {
      sfxPlayer.seekTo(0);
      sfxPlayer.play();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // --- 1. ENTER PHASE (Softer, loftier entrance) ---
      bgOpacity.value = withTiming(0.4, { duration: 800 }); // Luxurious 800ms fade
      textScale.value = withDelay(
        150,
        withSpring(1, { damping: 10, stiffness: 150 }),
      ); // Softer bounce
      charY.value = withSpring(0, { damping: 12, stiffness: 90 }); // Hangs in the air nicely

      // --- 2. EXIT PHASE (Stretched out to 2.5 seconds) ---
      const exitTimer = setTimeout(() => {
        // A. Character & Text glide out smoothly (350ms instead of 150ms)
        charY.value = withTiming(height / 2 + 200, { duration: 350 });
        textScale.value = withTiming(0, { duration: 550 });

        // B. Background lingers and fades elegantly (600ms)
        bgOpacity.value = withTiming(0, { duration: 1200 }, (finished) => {
          if (finished) runOnJS(clearEvent)();
        });
      }, 3200); // <-- The 2.5 Second Dopamine Hold

      return () => clearTimeout(exitTimer);
    }
  }, [celebrationEvent]);

  // STYLES MAPPING
  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  const charStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: charY.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    transform: [{ scale: textScale.value }],
  }));

  if (!celebrationEvent) return null;

  return (
    <Modal visible={true} transparent={true} animationType="none">
      {/* THE FIX: This flex: 1 wrapper forces the modal to take up the whole screen */}
      <View style={styles.modalWrapper}>
        {/* THE DIM COLORED OVERLAY */}
        <Animated.View
          style={[
            styles.overlay,
            { backgroundColor: celebrationEvent.color },
            bgStyle,
          ]}
        />
        {/* pointerEvents="none" ensures taps pass through if they mash the screen */}
        {/* THE REWARD LAYER */}
        <View style={styles.content} pointerEvents="none">
          {/* THE MASTER BOUNCE WRAPPER */}
          <Animated.View style={[styles.jumpWrapper, charStyle]}>
            {/* MOVED: Lottie is now inside the wrapper so it jumps with the character */}
            <View style={styles.lottieContainer}>
              <LottieView
                source={require("../assets/reward-light-effect.json")}
                autoPlay
                loop
                style={styles.lottieLight}
                resizeMode="cover"
              />
            </View>

            <Animated.View style={[styles.hurrayTextWrapper, textStyle]}>
              <Text style={styles.hurrayText}>HURRAY!</Text>
            </Animated.View>

            <View style={styles.character}>
              <Text style={styles.characterEmoji}>
                {celebrationEvent.emoji}
              </Text>
              <Text style={styles.characterHands}>🙌</Text>
            </View>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalWrapper: {
    flex: 1,
    width: width, // Explicitly pull from Dimensions
    height: height, // Explicitly pull from Dimensions
    zIndex: 999,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width,
    height: height,
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  // character: {
  //   flexDirection: "row",
  //   position: "absolute",
  //   alignItems: "center",
  //   gap: -10, // Overlap the emoji slightly for cute look
  // },
  // characterEmoji: {
  //   fontSize: 100, // Massive mascot size
  // },
  // characterHands: {
  //   fontSize: 50,
  //   marginTop: -60, // Sits above the 'head'
  // },
  jumpWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  hurrayTextWrapper: {
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
    marginBottom: 20, // Pushes the character down slightly
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 10, // Ensures text stays above the emoji
  },
  hurrayText: {
    color: "#0f172a",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -1,
  },
  character: {
    alignItems: "center",
    justifyContent: "center",
  },
  characterEmoji: {
    fontSize: 100,
  },
  characterHands: {
    position: "absolute",
    fontSize: 50,
    top: -20, // Perfectly rests the hands on top of the emoji
    right: -10,
    transform: [{ rotate: "15deg" }], // Adds a little celebratory tilt
  },
  lottieContainer: {
    position: "absolute", // Anchors it directly to the center of the jumpWrapper
    alignItems: "center",
    justifyContent: "center",
    zIndex: -1, // Ensures it stays strictly behind the emoji and text
  },
  lottieLight: {
    width: width * 1.5, // Massively scaled to fill the background
    height: width * 1.5,
    opacity: 0.8, // Slight transparency so it blends with the colored background
  },
});
