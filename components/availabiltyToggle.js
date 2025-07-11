import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAvailabilityStatus, updateAvailabilityStatus } from '../store/avail';

const AvailabilityToggle = () => {
  const dispatch = useDispatch();
  const { isAvailable, getStatus, getError, updateStatus, updateError } =
    useSelector(state => state.availability);

  const [localIsEnabled, setLocalIsEnabled] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;

  // Fetch initial status on mount
  useEffect(() => {
    const resultAction = dispatch(fetchAvailabilityStatus());
    return () => {
      // Cleanup if needed
    };
  }, [dispatch]);

  // Update local state when Redux state changes
  useEffect(() => {
    if (getStatus === 'succeeded') {
      setLocalIsEnabled(isAvailable);
      updateAnimation(isAvailable);
    }
  }, [isAvailable, getStatus]);

  // Handle errors
  useEffect(() => {
    if (getStatus === 'failed' && getError) {
      Alert.alert('Error', getError);
    }
    if (updateStatus === 'failed' && updateError) {
      Alert.alert('Error', updateError);
      // Revert to last known good state
      setLocalIsEnabled(isAvailable);
      updateAnimation(isAvailable);
    }
  }, [getStatus, getError, updateStatus, updateError, isAvailable]);

  // Animation helper
  const updateAnimation = useCallback(
    enabled => {
      Animated.timing(translateX, {
        toValue: enabled ? 17 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    },
    [translateX],
  );

  // Handle successful update
  useEffect(() => {
    if (updateStatus === 'succeeded') {
      const message = localIsEnabled
        ? 'You are now marked as available!'
        : 'You are now marked as unavailable.';
      // Toast.show({ description: message, duration: 3000 });
    }
  }, [updateStatus, localIsEnabled]);

  // Toggle function - ONLY place where dispatch happens
  const toggleSwitch = useCallback(() => {
    if (updateStatus === 'loading' || getStatus === 'loading') return;

    const newApiStatus = !localIsEnabled;

    // Optimistic UI update
    setLocalIsEnabled(newApiStatus);
    updateAnimation(newApiStatus);

    // ONLY dispatch happens here
    dispatch(updateAvailabilityStatus(newApiStatus));
  }, [localIsEnabled, updateStatus, getStatus, dispatch, updateAnimation]);

  if (getStatus === 'loading' && isAvailable === null) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color="#513DB0" />
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.switchContainer}
      onPress={toggleSwitch}
      disabled={updateStatus === 'loading'}
    >
      <Animated.View
        style={[styles.track, localIsEnabled && styles.trackEnabled]}
      >
        <Animated.View
          style={[styles.thumb, { transform: [{ translateX }] }]}
        />
      </Animated.View>
      {updateStatus === 'loading' && (
        <ActivityIndicator
          size="small"
          color="#fff"
          style={styles.thumbLoader}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    // For initial loading
    width: 40,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    marginTop: 0,
    marginLeft: -10,
  },
  switchContainer: {
    width: 40,
    height: 25,
    justifyContent: 'center', // Changed from 'left'
    alignItems: 'center', // Ensures track is centered if smaller
    marginBottom: 5,
    marginTop: 0,
    marginLeft: -10, // This might need adjustment based on parent layout
  },
  track: {
    width: 40, // Make track full width of container
    height: 24, // Full height
    borderRadius: 12,
    backgroundColor: '#ccc',
    justifyContent: 'center', // Center thumb vertically if track is taller
    // padding: 2, // Removed padding as thumb is positioned absolutely
  },
  trackEnabled: {
    backgroundColor: '#513DB0',
  },
  thumb: {
    width: 20, // Slightly smaller than track height
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    position: 'absolute',
    left: 2, // Initial position for 'off' state
    // top: 2, // Centered by track's justifyContent: 'center' now
  },
  thumbLoader: {
    // For loading indicator on the thumb during update
    position: 'absolute',
  },
});

export default AvailabilityToggle;
