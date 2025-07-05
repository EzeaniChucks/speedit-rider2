import React, { useState,useEffect } from 'react';
import { FlatList, View, StyleSheet, ActivityIndicator, Alert, PermissionsAndroid, TouchableOpacity } from 'react-native';
import { Box, Text,Button as NbButton } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import {
  useGetAvailableOrdersQuery,
  useAcceptOrderMutation,
  useCancelOrderMutation,
} from '../store/ordersApi';
import OrderCard from './OrderCard'; // Assuming OrderCard is now a separate component
import Geolocation from 'react-native-geolocation-service'; 

const AvailableOrdersScreen = () => {
  const navigation = useNavigation();
  // Example rider location and radius, replace with actual dynamic values
  const [riderLocation, setRiderLocation] = useState(null); // [latitude, longitude]
  const [locationError, setLocationError] = useState(null);
  const radius = 5000;
  // --- Geolocation Logic ---
  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      const auth = await Geolocation.requestAuthorization('whenInUse');
      if (auth === 'granted') return true;
    } else if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location to find available orders.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) return true;
    }
    return false;
  };

  const getCurrentLocation = async () => {
    setLocationError(null);
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      setLocationError('Location permission denied.');
      Alert.alert('Permission Denied', 'Location permission is required to find orders. Please enable it in settings.');
      return;
    }

    Geolocation.getCurrentPosition(
      (position) => {
        setRiderLocation([position.coords.latitude, position.coords.longitude]);
        setLocationError(null);
      },
      (error) => {
        setLocationError(error.message);
        Alert.alert('Location Error', `Could not get location: ${error.message}`);
        console.error("Geolocation error:", error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000, distanceFilter: 50 }
    );
  };

  useEffect(() => {
    getCurrentLocation(); // Get location on component mount
  }, []);
  const { data: availableOrdersData, error, isLoading, refetch } = useGetAvailableOrdersQuery({
    radius,
    riderLocation,
  });
  
  const [acceptOrder, { isLoading: isAccepting }] = useAcceptOrderMutation();
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  const handleAcceptOrder = async (orderId) => {
    try {
      await acceptOrder(orderId).unwrap();
      Alert.alert('Success', 'Order accepted!');
      // Navigate to CurrentOrderScreen or refresh current order details
      navigation.navigate('CurrentOrder'); // Or wherever the current order is shown
    } catch (err) {
      Alert.alert('Error', err.data?.message || err.message || 'Failed to accept order.');
    }
  };

  const handleIgnoreOrder = async (orderId, reason) => {
    try {
      await cancelOrder({ orderId, reason }).unwrap();
      Alert.alert('Success', 'Order ignored/cancelled.');
      refetch(); // Refetch available orders
    } catch (err) {
      Alert.alert('Error', err.data?.message || err.message || 'Failed to ignore order.');
    }
  };

   const handleCardPress = (order) => {
    navigation.navigate('OrderDetails', { orderId: order.id, orderReferenceCode: order.reference_code });
  };
  
  // Display loading/error states for location
  if (!riderLocation && !locationError ) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="teal" />
        <Text mt={2}>Fetching your location...</Text>
      </Box>
    );
  }
  
  if (locationError && !riderLocation) {
     return (
      <Box flex={1} justifyContent="center" alignItems="center" p={4}>
        <Text color="red.500" textAlign="center" mb={3}>{locationError}</Text>
        <NbButton onPress={getCurrentLocation} colorScheme="teal">Retry Location</NbButton>
      </Box>
    );
  }

  // Display loading/error states for API call
  if (isLoadingOrders && !availableOrdersData) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="teal" />
        <Text mt={2}>Loading available orders...</Text>
      </Box>
    );
  }

  if (apiError) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" p={4}>
        <Text color="red.500" textAlign="center">
          Error fetching orders: {apiError.data?.message || apiError.message || 'Unknown error'}
        </Text>
        <NbButton onPress={() => { getCurrentLocation(); refetchOrders();}} mt={2} colorScheme="teal">Try Again</NbButton>
      </Box>
    );
  }

  const orders = availableOrdersData?.results || availableOrdersData || [];

  if (orders.length === 0) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <Text>No available orders at the moment.</Text>
        <TextButton onPress={refetch} mt={2}>Refresh</TextButton>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="gray.100" pt={5}>
      <Text fontSize="2xl" fontWeight="bold" px={4} mb={2}>Available Orders</Text>
      <FlatList
        data={orders}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onAcceptPress={handleAcceptOrder}
            onIgnorePress={handleIgnoreOrder}
            onCardPress={handleCardPress}
          />
        )}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()} // Ensure ID exists
        contentContainerStyle={styles.listContent}
        onRefresh={refetch} // Pull to refresh
        refreshing={isLoading}
      />
    </Box>
  );
};

// Simple TextButton for reuse
const TextButton = ({ onPress, children, ...props }) => (
  <TouchableOpacity onPress={onPress} {...props}>
    <Text color="teal.500" fontWeight="semibold">{children}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
});

export default AvailableOrdersScreen;