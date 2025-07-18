import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';

import OrderSection from '../OrderSect';

import { useGetAvailableOrdersQuery } from '../../store/ordersApi';
import { skipToken } from '@reduxjs/toolkit/query';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import Geolocation from '@react-native-community/geolocation';
// import Geolocation from 'react-native-geolocation-service';
import UserProfileCard from '../../components/userProfileCard';

const RiderActiveOrders = () => {
  const [riderLocation, setRiderLocation] = useState<null | number[]>(null);
  const [locationError, setLocationError] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const navigation: any = useNavigation();

  // This code isn't getting rider location. Also, it used to ask for exact location and approxiamate location. Now it just asks for approximate location only. It fails all the time.
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
          },
        );
        console.log('result of location access granting:', granted);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.log('error from location access granting', err);
        // console.warn(err);
        return false;
      }
    }
  };

  const getLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      setLocationError(
        'Location permission denied. Please grant location access to this app in your settings.',
      );
      Alert.alert(
        'Permission Denied',
        'Please grant location access in your settings to find orders.',
      );
      return;
    }
    setLoadingLocation(true);
    try {
      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setRiderLocation([longitude, latitude]);
          setLocationError('');
          setLoadingLocation(false);
        },
        error => {
          // console.log(error);
          setLocationError('Could not fetch location.');
          Alert.alert(
            'Location Error',
            'Failed to get your current location. Please ensure GPS is enabled. Then click the refresh button below.',
          );
          setLoadingLocation(false);
        },
        {
          enableHighAccuracy: false,
          timeout: 50000,
          maximumAge: 10000,
          // forceRequestLocation: true,
          // showLocationDialog: true,
          // sh
        },
      );
    } catch (e) {
      console.log('Geolocation fetching Crashed', e);
      setLoadingLocation(false);
    }
  };

  const { availableOrders, notificationCount } = useSelector(
    (state: any) => state.orders,
  );

  const {
    // data: ordersResponse,
    error: ordersError,
    isFetching,
    isLoading,
    refetch: refetchOrders, // Add this
  } = useGetAvailableOrdersQuery(
    riderLocation
      ? {
          radius: 10000,
          riderLocation,
        }
      : skipToken,
  );

  // console.log(riderLocation);
  // // This will run whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (riderLocation) {
        // Only refetch if riderLocation exists
        refetchOrders();
      }
    }, [refetchOrders, riderLocation]),
  );

  useFocusEffect(
    useCallback(() => {
      getLocation();
    }, []),
  );

  if (!riderLocation) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', gap: 10, padding: 20 },
        ]}
      >
        {locationError ? (
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 10,
            }}
          >
            <Text style={{ textAlign: 'center', color: 'red' }}>
              {locationError}
            </Text>
            <TouchableOpacity
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: 10,
                alignItems: 'center',
                padding: 10,
                borderRadius: 10,
                backgroundColor: 'teal',
              }}
              onPress={() => getLocation()}
              disabled={loadingLocation}
            >
              <Text
                style={{
                  color: 'white',
                }}
              >
                {loadingLocation ? '...refreshing' : 'Refresh Location'}
              </Text>
              <Icon name="refresh" size={20} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <ActivityIndicator size="large" color="teal" />
            <Text style={{ textAlign: 'center' }}>
              Getting current location…
            </Text>
          </>
        )}
      </View>
    );
  }

  const renderOrderSection = () => {
    if (isLoading) {
      return (
        <ActivityIndicator
          size="large"
          color="teal"
          style={{ marginTop: 40 }}
        />
      );
    }

    if (ordersError) {
      return (
        <Text style={styles.errorText}>
          {ordersError?.data?.error ||
            ordersError?.data?.data ||
            'Failed to load orders.'}
        </Text>
      );
    }

    if (notificationCount === 0) {
      return (
        <Text style={styles.notification}>
          No new orders available in your location.
        </Text>
      );
    }

    return <OrderSection offers={availableOrders} />;
  };

  return (
    <View style={styles.container}>
      {/* Top Header with Profile and History Button */}
      <View style={styles.topBar}>
        <UserProfileCard />

        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigation.navigate('OrderList')}
        >
          <Icon name="time-outline" size={20} color="#008A63" />
          <Text style={styles.historyButtonText}>View Order History</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Orders Panel */}
      <View style={styles.ordersPanel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>
            {notificationCount} New Order{notificationCount !== 1 ? 's' : ''}{' '}
            Nearby
          </Text>

          {/* Orders List refresh button */}

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => refetchOrders()}
            disabled={isFetching} // Optional: disable while refreshing
          >
            {isFetching ? (
              <ActivityIndicator size="small" color="#008A63" />
            ) : (
              <Icon name="refresh" size={20} color="#008A63" />
            )}
          </TouchableOpacity>
        </View>

        {renderOrderSection()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  notification: {
    marginTop: 20,
    textAlign: 'center',
    color: '#999',
    padding: 10
  },

  topBar: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  historyButton: {
    position: 'absolute',
    right: 30,
    bottom: -150,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: 2},
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    elevation: 5,
  },
  historyButtonText: {
    marginLeft: 6,
    color: '#008A63',
    fontWeight: '600',
  },
  ordersPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
  },
  errorText: {
    color: 'tomato',
  },
});

export default RiderActiveOrders;
