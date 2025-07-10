import React, {useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {Text, Button, Box} from 'native-base';

const {width} = Dimensions.get('window');

const slides = [
  {
    key: '1',
    title: 'Welcome to Speedit Delivery',
    description: 'Deliver food from your favorite restaurants to customers.',
    image: require('../../assests/onboarding1.jpg'),
  },
  {
    key: '2',
    title: 'Easy Navigation',
    description: 'Navigate easily to pick up and drop off locations.',
    image: require('../../assests/onboarding2.jpg'),
  },
  {
    key: '3',
    title: 'Track Your Earnings',
    description: 'Keep track of your earnings and tips in real-time.',
    image: require('../../assests/onboarding3.jpg'),
  },
];

const OnboardingScreen = ({navigation}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef(null);

  const handleNext = () => {
    const nextSlide = currentSlide + 1;
    if (nextSlide < slides.length) {
      scrollToSlide(nextSlide);
    } else {
      navigation.navigate('Login');
    }
  };

  const handleBack = () => {
    const prevSlide = currentSlide - 1;
    if (prevSlide >= 0) {
      scrollToSlide(prevSlide);
    }
  };

  const scrollToSlide = index => {
    setCurrentSlide(index);
    scrollViewRef.current?.scrollTo({
      x: width * index,
      animated: true,
    });
  };

  const handleScroll = event => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentSlide(index);
  };

  const SignUp = () => {
    navigation.navigate('RegisterPersonalInfo');
  };

  return (
    <Box flex={1} backgroundColor="white">
      {/* Back button (only shown when not on first slide) */}
      {currentSlide > 0 && (
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.7}>
          <Text style={{fontSize: 40}}> ‹ </Text>
        </TouchableOpacity>
      )}

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentOffset={{x: width * currentSlide, y: 0}}>
        {slides.map(slide => (
          <View key={slide.key} style={[styles.slide, {width}]}>
            <Image source={slide.image} style={styles.image} />
            <Text
              fontSize="2xl"
              fontWeight="bold"
              mt={4}
              textAlign="center"
              px={8}>
              {slide.title}
            </Text>
            <Text
              fontSize="md"
              textAlign="center"
              mt={2}
              px={8}
              color="gray.600">
              {slide.description}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Slide indicators */}
      <Box style={styles.indicatorContainer}>
        {slides.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => scrollToSlide(index)}
            activeOpacity={0.6}>
            <View
              style={[
                styles.indicator,
                currentSlide === index && styles.activeIndicator,
              ]}
            />
          </TouchableOpacity>
        ))}
      </Box>

      {/* Action buttons */}
      <Box style={styles.buttonGroup}>
        <Button
          onPress={handleNext}
          style={styles.button}
          backgroundColor="teal.500"
          _text={{color: 'white', fontWeight: 'semibold'}}
          _pressed={{opacity: 0.8}}>
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
        </Button>

        {currentSlide === slides.length - 1 && (
          <Button
            onPress={SignUp}
            style={styles.secondaryButton}
            variant="outline"
            borderColor="teal.500"
            _text={{color: 'teal.500', fontWeight: 'semibold'}}
            _pressed={{bg: 'teal.100'}}>
            Sign Up
          </Button>
        )}
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create({
  slide: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: '80%',
    height: 300,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  buttonGroup: {
    position: 'absolute',
    bottom: 40,
    width: '90%',
    alignSelf: 'center',
  },
  button: {
    marginBottom: 12,
    borderRadius: 8,
    height: 50,
  },
  secondaryButton: {
    borderRadius: 8,
    height: 50,
    borderWidth: 1.5,
  },
  indicatorContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: 'grey',
    width: 20,
  },
});

export default OnboardingScreen;
