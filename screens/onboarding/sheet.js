import React, { useState } from 'react';
import { useColorScheme } from 'react-native'; // Correct import
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

function BottomSheet({ isOpen, toggleSheet, duration = 500, children }) {
  const colorScheme = useColorScheme(); // Use the correct hook
  const height = useSharedValue(0);
 
  const progress = useDerivedValue(() => {
    'worklet'; // Indicate that this is a worklet
    return withTiming(isOpen.value ? 0 : 1, { duration: 500 });
  });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: progress.value * height.value }],
  }));

  const backgroundColorSheetStyle = {
    backgroundColor: colorScheme === 'light' ? '#f8f9ff' : '#272B3C',
  };

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    zIndex: isOpen ? 1 : -1,
  }));

  return (
    <>
      <Animated.View style={[sheetStyles.backdrop, backdropStyle]}>
        <TouchableOpacity style={styles.flex} onPress={toggleSheet} />
      </Animated.View>
      <Animated.View
        onLayout={(e) => {
          height.value = e.nativeEvent.layout.height;
        }}
        style={[sheetStyles.sheet, sheetStyle, backgroundColorSheetStyle]}>
        {children}
      </Animated.View>
    </>
  );
}

const sheetStyles = StyleSheet.create({
  sheet: {
    padding: 16,
    height: 150,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});

export default BottomSheet;