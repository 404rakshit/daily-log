import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { PlusIcon } from 'lucide-react-native';

export default function CustomFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  // Function to handle the toggle animation
  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    
    Animated.spring(animation, {
      toValue,
      friction: 5, // Controls the "bounciness"
      useNativeDriver: true,
    }).start();
    
    setIsOpen(!isOpen);
  };

  // Interpolate animation value for rotating the plus icon (0 to 45 degrees)
  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  // Interpolate animation value for fading in the menu
  const menuOpacity = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  // Interpolate animation value for sliding the menu up slightly
  const menuTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  // Your predefined preset options
  const presets = [
    { id: 1, name: 'Gym', icon: 'dumbbell', color: '#E74C3C' },
    { id: 2, name: 'Medicine', icon: 'pill', color: '#9B59B6' },
    { id: 3, name: 'Water', icon: 'water', color: '#3498DB' },
    { id: 4, name: 'Protein', icon: 'shaker-outline', color: '#F1C40F' },
  ];

  return (
    <View style={styles.container}>
      
      {/* Floating Menu Popup */}
      <Animated.View 
        style={[
          styles.menuContainer, 
          { 
            opacity: menuOpacity,
            transform: [{ translateY: menuTranslateY }],
            // Prevents clicking invisible buttons when the menu is closed
            pointerEvents: isOpen ? 'auto' : 'none' 
          }
        ]}
      >
        {presets.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.menuItem} 
            onPress={() => console.log(`${item.name} clicked!`)}
          >
             <Text style={styles.menuText}>{item.name}</Text>
             <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                <MaterialCommunityIcons name={item.icon as any} size={20} color="white" />
             </View>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {/* Main Action Button */}
      <TouchableOpacity
        onPress={toggleMenu}
        activeOpacity={0.8}
        style={styles.mainButton}
      >
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          {/* You can replace this with your custom <PlusIcon /> if you prefer */}
          <PlusIcon size={30} color="white" />
        </Animated.View>
      </TouchableOpacity>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 30,
  },
  mainButton: {
    padding: 15, 
    backgroundColor: '#4a4848',
    borderRadius: 50,
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadows for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  menuContainer: {
    position: 'absolute',
    bottom: 90, 
    right: 30,
    alignItems: 'flex-end',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  menuText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  }
});