// AvailabilityToggle.js
import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Text,
  Alert,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {Toast} from 'native-base'; // Assuming you still want to use NativeBase Toast
// import { ToastSuccess } from './your-toast-components'; // Your custom toast component if any
import {
  fetchAvailabilityStatus,
  updateAvailabilityStatus,
  resetAvailabilityState,
} from '../store/avail'; // Adjust path

const AvailabilityToggle = () => {
  const dispatch = useDispatch();
  const {isAvailable, getStatus, getError, updateStatus, updateError} =
    useSelector(state => state.availability);

  // Local state for animation, driven by Redux's isAvailable
  const [localIsEnabled, setLocalIsEnabled] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;

  // Fetch initial status on mount
  useEffect(() => {
    const resultAction = dispatch(fetchAvailabilityStatus());
    if (fetchAvailabilityStatus.fulfilled.match(resultAction)) {
      setLocalIsEnabled(resultAction.payload.data.isAvailable); // Assuming the API
    }
    // setLocalIsEnabled()
    return () => {
      // Optional: reset state if component unmounts and you want to clear errors/status
      // dispatch(resetAvailabilityState());
    };
  }, [dispatch]);

  // Update local state and animation when Redux state changes
  useEffect(() => {
    if (getStatus === 'succeeded') {
      setLocalIsEnabled(isAvailable);
      Animated.timing(translateX, {
        toValue: isAvailable ? 17 : 0, // 17 when enabled (thumb moves right), 0 when disabled
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isAvailable, getStatus, translateX]);

  // Handle API call errors
  useEffect(() => {
    if (getStatus === 'failed' && getError) {
      Alert.alert('Error', getError || 'Could not fetch availability status.');
    }
    if (updateStatus === 'failed' && updateError) {
      Alert.alert(
        'Error',
        updateError || 'Could not update availability status.',
      );
      // Revert optimistic update if you had one, by re-fetching or setting localIsEnabled
      setLocalIsEnabled(isAvailable); // Revert to last known good state from Redux
      Animated.timing(translateX, {
        toValue: isAvailable ? 17 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [getStatus, getError, updateStatus, updateError, isAvailable, translateX]);

  // Handle successful update (e.g., show toast)
  useEffect(() => {
    if (updateStatus === 'succeeded') {
      // The API call in your original component was for notifications,
      // this new API is for availability. Adjust toast message accordingly.
      const message = localIsEnabled
        ? 'You are now marked as available!'
        : 'You are now marked as unavailable.';
      // Toast.show({
      //   description: message,
      //   duration: 3000,
      //   // render: () => {return <ToastSuccess  title='Status Updated' status={'success'}  message={message} /> }
      // });
    }
  }, [updateStatus, localIsEnabled]);

  const toggleSwitch = () => {
    if (updateStatus === 'loading' || getStatus === 'loading') {
      return; // Prevent multiple quick toggles while an operation is in progress
    }

    const newApiStatus = !localIsEnabled; // The status we want to send to the API

    // Optimistically update UI (optional, but can make it feel snappier)
    // The useEffect for [isAvailable] will correct this if API fails and state reverts.
    setLocalIsEnabled(newApiStatus);
    Animated.timing(translateX, {
      toValue: newApiStatus ? 17 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    dispatch(updateAvailabilityStatus(newApiStatus));
  };

  if (getStatus === 'loading' && isAvailable === null) {
    // Show loader only on initial load
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
      disabled={updateStatus === 'loading'} // Disable while updating
    >
      <Animated.View
        style={[styles.track, localIsEnabled && styles.trackEnabled]}>
        <Animated.View style={[styles.thumb, {transform: [{translateX}]}]} />
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
