import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  PermissionsAndroid, // For Android
  Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Geolocation from 'react-native-geolocation-service'; // You need to install this

// 1. Import hooks and thunks from your slices
import { useGetAvailableOrdersQuery } from '../store/ordersApi'; // Adjust path
import {
  fetchAvailabilityStatus,
  updateAvailabilityStatus,
} from '../store/avail'; // Adjust path

// A simple component to render each order item
const OrderItem = ({ item }) => (
  <View style={styles.orderItem}>
    <View>
      <Text style={styles.orderTitle}>New Order Request</Text>
      <Text style={styles.orderInfo}>Pickup: {item.pickupAddress.street}</Text>
      <Text style={styles.orderInfo}>Dropoff: {item.dropoffAddress.street}</Text>
      <Text style={styles.orderDistance}>{item.distance.toFixed(2)} km away</Text>
    </View>
    <View style={styles.fareContainer}>
      <Text style={styles.fareText}>${item.fare.toFixed(2)}</Text>
    </View>
  </View>
);

const AvailableRidersScreen = () => {
  const dispatch = useDispatch();

  // 2. Get availability state from the Redux store
  const {
    isAvailable,
    updateStatus: availabilityUpdateStatus,
    getStatus: availabilityGetStatus,
  } = useSelector((state) => state.availability);

  // Local state for rider's location
  const [riderLocation, setRiderLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  // --- LOCATION LOGIC ---
  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      const auth = await Geolocation.requestAuthorization('whenInUse');
      return auth === 'granted';
    }
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'We need your location to show available orders near you.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
  };

  const getLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      setLocationError('Location permission denied.');
      Alert.alert('Permission Denied', 'Please grant location access in your settings to find orders.');
      return;
    }

    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setRiderLocation([latitude, longitude]);
        setLocationError(null);
      },
      (error) => {
        console.error(error);
        setLocationError('Could not fetch location.');
        Alert.alert('Location Error', 'Failed to get your current location. Please ensure GPS is enabled.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // 3. Fetch initial availability and location on component mount
  useEffect(() => {
    dispatch(fetchAvailabilityStatus());
    getLocation();
  }, [dispatch]);

  // --- API CALL LOGIC ---
  // 4. Use the RTK Query hook to get available orders
  // 'skip' is a powerful option: it prevents the query from running if the conditions aren't met.
  const {
    data: availableOrders,
    isLoading: isLoadingOrders,
    isError: isErrorOrders,
    error: ordersError,
    refetch,
  } = useGetAvailableOrdersQuery(
    {
      radius: 10000, // 10km radius, you can make this dynamic
      riderLocation,
    },
    {
      skip: !isAvailable || !riderLocation, // Don't fetch if offline or location is not available
      pollingInterval: 30000, // Optional: automatically refetch every 30 seconds
    }
  );

  // --- HANDLERS ---
  // 5. Handle the toggle switch action
  const handleToggleAvailability = () => {
    // Prevent toggling while an update is already in progress
    if (availabilityUpdateStatus === 'loading') return;
    dispatch(updateAvailabilityStatus(!isAvailable));
  };


  // --- RENDER LOGIC ---
  const renderContent = () => {
    if (!isAvailable) {
      return (
        <View style={styles.centeredMessage}>
          <Text style={styles.messageText}>You are currently offline.</Text>
          <Text style={styles.messageSubText}>Go online to see available orders.</Text>
        </View>
      );
    }
    
    // Handle loading/error states before showing orders
    if (availabilityGetStatus === 'loading' || !riderLocation && !locationError) {
      return <ActivityIndicator size="large" color="#0000ff" style={styles.centeredMessage} />;
    }

    if (locationError) {
      return (
         <View style={styles.centeredMessage}>
            <Text style={styles.errorText}>{locationError}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={getLocation}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
        </View>
      );
    }
    
    if (isLoadingOrders) {
      return <ActivityIndicator size="large" color="#0000ff" style={styles.centeredMessage} />;
    }

    if (isErrorOrders) {
      return (
        <View style={styles.centeredMessage}>
          <Text style={styles.errorText}>
            {ordersError?.data?.message || 'Failed to load orders.'}
          </Text>
           <TouchableOpacity style={styles.retryButton} onPress={refetch}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
        </View>
      );
    }

    if (!availableOrders || availableOrders.length === 0) {
      return (
        <View style={styles.centeredMessage}>
          <Text style={styles.messageText}>No available orders at the moment.</Text>
          <Text style={styles.messageSubText}>We'll notify you when a new order comes in.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={availableOrders}
        renderItem={({ item }) => <OrderItem item={item} />}
        keyExtractor={(item) => item._id} // Use a unique ID from your data
        contentContainerStyle={styles.listContainer}
        onRefresh={refetch} // Pull-to-refresh
        refreshing={isLoadingOrders}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {isAvailable ? 'You are Online' : 'You are Offline'}
        </Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isAvailable ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={handleToggleAvailability}
          value={isAvailable}
          disabled={availabilityUpdateStatus === 'loading' || availabilityGetStatus === 'loading'}
        />
      </View>
      {renderContent()}
    </SafeAreaView>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  orderItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  orderInfo: {
    fontSize: 14,
    color: '#555',
  },
  orderDistance: {
    fontSize: 12,
    color: '#007bff',
    marginTop: 5,
    fontWeight: '600'
  },
  fareContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fareText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28a745',
  },
  centeredMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333'
  },
  messageSubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center'
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default AvailableRidersScreen;