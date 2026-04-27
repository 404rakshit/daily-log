import React, { useRef } from "react";
import { StyleSheet, View, Text } from "react-native";
import LottieView from "lottie-react-native";

export default function EmptyState() {
  const animation = useRef<LottieView>(null);

  return (
    <View style={styles.emptyStateBox}>
      
      {/* THE HERO ANIMATION */}
      <LottieView
        autoPlay
        loop
        ref={animation}
        style={styles.lottieGraphic}
        source={require("../assets/star.json")}
      />

      {/* THE CONTENT */}
      <Text style={styles.emptyStateTitle}>All caught up!</Text>
      <Text style={styles.emptyStateText}>
        You've crushed every single target for today. Enjoy the rest of your day!
      </Text>
      
    </View>
  );
}

const styles = StyleSheet.create({
  emptyStateBox: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    // marginTop: 8,
    // Removed the dashed border for a cleaner, premium look
  },
  lottieGraphic: {
    width: 200,
    height: 200,
    // Often Lottie files have internal empty padding. 
    // This negative margin pulls the graphic slightly up so it feels balanced.
    marginTop: -20, 
  },
  emptyStateTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
    letterSpacing: -0.5,
    marginTop: -20, // Pulls the text closer to the base of the star
  },
  emptyStateText: {
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
});