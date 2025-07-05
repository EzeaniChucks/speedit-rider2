import React, {useEffect, useRef} from 'react';
import {Animated, Easing, View, StyleSheet} from 'react-native';

const WindLine = ({delay, index}) => {
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(translateX, {
          toValue: 1,
          duration: 1500 + index * 300,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop(); // Clean up animation on unmount
    };
  }, [delay, index, translateX]);

  const movement = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 300],
  });

  const opacity = translateX.interpolate({
    inputRange: [0, 0.3, 0.7, 1],
    outputRange: [0, 0.8, 0.8, 0],
  });

  const lineTop = 30 + index * 15;
  const lineLength = 40 + index * 10;

  return (
    <Animated.View
      style={[
        styles.windLine,
        {
          top: lineTop, // Changed from percentage to absolute value
          width: lineLength,
          transform: [{translateX: movement}],
          opacity,
        },
      ]}
    />
  );
};

const DeliveryAnimation = ({status}) => {
  const bobAnim = useRef(new Animated.Value(0)).current;
  const swayAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef(null);

  useEffect(() => {
    if (status === 'in_transit') {
      animationRef.current = Animated.parallel([
        // Bobbing animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(bobAnim, {
              toValue: 1,
              duration: 2000,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(bobAnim, {
              toValue: 0,
              duration: 2000,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        ),
        // Sway animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(swayAnim, {
              toValue: 1,
              duration: 4000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(swayAnim, {
              toValue: -1,
              duration: 4000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]),
        ),
      ]);

      animationRef.current.start();
    } else {
      bobAnim.setValue(0);
      swayAnim.setValue(0);
      if (animationRef.current) {
        animationRef.current.stop();
      }
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [status, bobAnim, swayAnim]);

  const bobTransform = bobAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const swayTransform = swayAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-8, 0, 8],
  });

  const rotateTransform = swayAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-5deg', '0deg', '5deg'],
  });

  return (
    <View style={styles.container}>
      {status === 'in_transit' && (
        <>
          <WindLine delay={0} index={0} />
          <WindLine delay={200} index={1} />
          <WindLine delay={400} index={2} />
          <WindLine delay={600} index={3} />
        </>
      )}
      <Animated.Image
        source={require('../assests/orderStatusImages/in_transit.png')}
        style={[
          styles.rider,
          {
            transform: [
              {translateY: bobTransform},
              {translateX: swayTransform},
              {rotate: rotateTransform},
            ],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  rider: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
    position: 'absolute',
  },
  windLine: {
    position: 'absolute',
    height: 4,
    backgroundColor: 'rgba(150, 210, 255, 1)', // Brighter color
    left: 0,
  },
});

export default DeliveryAnimation;
