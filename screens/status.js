import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { Dimensions, StyleSheet, View, TouchableOpacity, Text, PanResponder } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const CustomBottomSheet = forwardRef(({ children,height}, ref) => {
  const translateY = useSharedValue(SCREEN_HEIGHT);

  const rBottomSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });
const closeSheet = () => {
  translateY.value = withSpring(SCREEN_HEIGHT/3)
}
const openSheet = () => {
  translateY.value = withSpring(0)
}
  useImperativeHandle(ref, () => ({
    open: () => {
      translateY.value = withSpring(0);
    },
    close: () => {
      translateY.value = withSpring(SCREEN_HEIGHT);
    },
  }));


  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > 10; // Only respond to vertical gestures
      },
      onPanResponderMove: (evt, gestureState) => {
        // Calculate new height based on gesture
        const newHeight = Math.max(SCREEN_HEIGHT / 3, Math.min(SCREEN_HEIGHT, height.value + gestureState.dy));
        height.value = newHeight;
       // translateY.value =withSpring(screenHeight/3); // Adjust translateY based on new height
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy < -100) {
          closeSheet(); 
        } else if (gestureState.dy > 100) {
          openSheet();
        } else {
          if (isOpen.value) {
            openSheet();
          } else {
            closeSheet();
          }
        }
      },
    })
  ).current;


  return (
    <Animated.View style={[styles.container, rBottomSheetStyle,{height:height}]}{...panResponder.panHandlers}>
      <View style={styles.content}>
        {children}
        <TouchableOpacity onPress={() => translateY.value = withSpring(SCREEN_HEIGHT/3)}>
          <Text style={styles.closeButton}>Close</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
   
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
  },
  content: {
    padding: 20,
  },
  closeButton: {
    marginTop: 20,
    color: 'blue',
    fontWeight: 'bold',
  },
});

export default CustomBottomSheet;