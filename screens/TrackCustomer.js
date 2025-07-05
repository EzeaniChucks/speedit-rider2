import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
// import MapView, { Marker, Polyline } from 'react-native-maps';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useUpdateRiderLocationMutation } from '../store/ordersApi'; // Adjust path
import Geolocation from '@react-native-community/geolocation'; // For real location
import { navigate } from '../NavigationService';

const TrackCustomer = () => {
    const navigation = useNavigation();
  const route = useRoute();
  const { order } = route.params;

  const [riderLocation, setRiderLocation] = useState(null);
  const [updateLocation] = useUpdateRiderLocationMutation();

  const customerLocation = {
    latitude: order.deliveryLocation.coordinates[1], // Assuming [lng, lat] format
    longitude: order.deliveryLocation.coordinates[0],
  };
 useEffect(() => {
    // --- Start tracking rider's location ---
    const watchId = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { latitude, longitude };
        setRiderLocation(newLocation);
        // Fire-and-forget update to the backend
        updateLocation({ lat: latitude, lng: longitude });
      },
      (error) => Alert.alert('Location Error', error.message),
      { enableHighAccuracy: true, distanceFilter: 10 } // Update every 10 meters
    );

    return () => {
      // --- Stop tracking when the component unmounts ---
      Geolocation.clearWatch(watchId);
    };
  }, [updateLocation]);

  const handleReachedCustomer = () => {
      // No status update here, this is just a navigation trigger
      navigation.navigate('DeliveryScreen', { order });
  };

  return (
   <View style={styles.container}>
      {/* <MapView
        style={styles.map}
        initialRegion={riderLocation ? {
          ...riderLocation,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        } : {
          ...customerLocation,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        }}
        showsUserLocation
      >
        Customer Marker
        <Marker coordinate={customerLocation} title="Customer" pinColor="blue" />
        
        Rider Marker (can be replaced by showsUserLocation)
        {riderLocation && <Marker coordinate={riderLocation} title="You" />}

        Polyline from Rider to Customer
        {riderLocation && (
            <Polyline
                coordinates={[riderLocation, customerLocation]}
                strokeColor="teal"
                strokeWidth={5}
            />
        )}
      </MapView> */}
      
      {/* Info Card */}
     <View style={styles.card}>
        <Text style={styles.name}>{order.customer.firstName} {order.customer.lastName}</Text>
        <Text style={styles.orderId}>Order ID #{order.id.substring(0, 8)}...</Text>
        <Text style={styles.addressTitle}>Deliver to</Text>
        <Text style={styles.address}>{order.deliveryAddress}</Text>
        
        <TouchableOpacity onPress={handleReachedCustomer} style={styles.button}>
          <Text style={styles.buttonText}>Reached Customer's Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },  container: { flex: 1 },
  map: { flex: 1 },
  card: {
    position: 'absolute', bottom: 20, left: 15, right: 15, backgroundColor: '#fff',
    borderRadius: 10, padding: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 4, elevation: 5,
  },
  name: { fontSize: 18, fontWeight: 'bold' },
  orderId: { color: '#888' },
  addressTitle: { fontWeight: 'bold', marginTop: 10 },
  address: { marginTop: 5 },
  button: { marginTop: 15, backgroundColor: 'teal', padding: 12, borderRadius: 5, alignItems: 'center' },
  card: {
    position: 'absolute',
    bottom: 20,
    left: 15,
    right: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderId: {
    color: '#888',
  },
  addressTitle: {
    fontWeight: 'bold',
    marginTop: 10,
  },
  address: {
    marginTop: 5,
  },
  button: {
    marginTop: 15,
    backgroundColor: '#f00',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default TrackCustomer;