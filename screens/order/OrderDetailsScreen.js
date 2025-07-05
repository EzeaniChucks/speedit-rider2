import React, {useEffect} from 'react';
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {
  Box,
  ScrollView,
  Text,
  VStack,
  HStack,
  Button,
  Divider,
  Badge,
  Icon,
  // useToast,
} from 'native-base';
import Ionicons from '@react-native-vector-icons/ionicons';
import {
  useAcceptOrderMutation,
  useGetOrderDetailsQuery,
} from '../../store/ordersApi';
import {useSelector} from 'react-redux';
import {skipToken} from '@reduxjs/toolkit/query';
import Ionicon from '@react-native-vector-icons/ionicons';
import Header from '../../components/header';

const OrderDetailsScreen = ({route, navigation}) => {
  // const toast = useToast();
  // RTK Query mutations
  const [acceptOrder, {isLoading: isAccepting}] = useAcceptOrderMutation();

  const {orderId, isHistory = false} = route.params || {};
  // 1. Properly use the query hook and get the data
  const {
    data: apiResponse,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useGetOrderDetailsQuery(orderId || skipToken);

  // 2. Get order from Redux (if needed)
  const reduxOrder = useSelector(state => state.orders.selectedOrder);

  // 3. Determine which order to display
  const order = apiResponse?.data || reduxOrder;

  // 4. Handle loading state
  if (isLoading && !order) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" />
      </Box>
    );
  }

  // 5. Handle error state
  if (error) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <Text>Error loading order details</Text>
        <Button onPress={() => refetch()}>Retry</Button>
      </Box>
    );
  }

  // 6. Handle case where no order is found
  if (!order) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <Text>No order data available</Text>
        <Button onPress={() => navigation.goBack()}>Go Back</Button>
      </Box>
    );
  }

  // console.log('newly fetched order details', orderId, order);

  // Manual refresh only when needed (e.g button press, pull-to-refresh)
  const handleRefresh = () => {
    if (orderId) refetch();
  };

  // 7. Safe coordinate access
  const pickupCoords = {
    latitude: order?.pickupLocation?.coordinates[0] || 0,
    longitude: order?.pickupLocation?.coordinates[1] || 0,
  };

  const deliveryCoords = {
    latitude: order?.deliveryLocation?.coordinates[0] || 0,
    longitude: order?.deliveryLocation?.coordinates[1] || 0,
  };

  const handleAccept = async () => {
    const result = await acceptOrder(order.id).unwrap();

    // console.log('result from order accept: orderdetailsscreen:61: ', result);

    // Alert
    Alert.alert('Order Accepted', 'Order accepted successfully!', [
      {
        text: 'OK',
        onPress: () => {
          navigation.replace('OrderProgress', {
            order: {
              ...order,
              acceptedAt: new Date().toISOString(),
              status: 'accepted',
            },
          });
        },
      },
    ]);
  };

  const handleDecline = () => {
    // Alert
    Alert.alert(
      'Order Declined',
      `Order declined. Rating impact: -${order.riderRatingImpact} points`,
      [{text: 'OK', onPress: () => navigation.navigate('RiderActiveOrders')}],
    );
  };

  const renderActionButtons = () => {
    if (isHistory) return null;

    return (
      <VStack space={2} mt={4}>
        {!order.acceptedAt ? (
          <>
            <Button
              colorScheme="green"
              leftIcon={<Icon as={Ionicons} name="checkmark-circle" />}
              onPress={handleAccept}
              isLoading={isAccepting}>
              Accept Order
            </Button>
            <Text textAlign="center" color="gray.500" fontSize="xs">
              Expires in{' '}
              {Math.floor((new Date(order.expiresAt) - new Date()) / 60000)}{' '}
              mins
            </Text>
          </>
        ) : (
          <>
            <Button
              colorScheme="blue"
              leftIcon={<Icon as={Ionicons} name="bicycle-outline" />}
              onPress={() => {
                navigation.navigate('OrderProgress', {
                  order,
                });
              }}>
              Go to Order Progress
            </Button>
            <Button
              mt={2}
              colorScheme="orange"
              variant="solid"
              leftIcon={<Icon as={Ionicons} size={7} name="close-circle" />}
              onPress={handleDecline}>
              <Text style={{color: 'white'}}>
                Cancel Delivery (- {order.riderRatingImpact} rating impact)
              </Text>
            </Button>
          </>
        )}
      </VStack>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
      <Header title="Order Details" />
      {/* Scrollable Content */}
      <ScrollView
        flex={1}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Box p={4} mt={3}>
          <VStack space={4}>
            <HStack space={7} style={{justifyContent: 'space-between'}}>
              {/* Order Status */}
              <Badge
                colorScheme={order.acceptedAt ? 'success' : 'warning'}
                alignSelf="flex-start">
                {order?.status?.toUpperCase()?.split('_').join(' ')}
              </Badge>
              <HStack space={2}>
                <Text>Refresh</Text>
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={handleRefresh}
                  disabled={isFetching} // Optional: disable while refreshing
                >
                  {isFetching ? (
                    <ActivityIndicator size="small" color="#008A63" />
                  ) : (
                    <Ionicon name="refresh" size={20} color="#008A63" />
                  )}
                </TouchableOpacity>
              </HStack>
            </HStack>

            {/* Order Summary */}
            <Box bg="gray.50" p={3} borderRadius="md">
              <HStack justifyContent="space-between">
                <Text fontWeight="bold">Order ID:</Text>
                <Text fontFamily="monospace">
                  {order.id?.substring(0, 8)}...
                </Text>
              </HStack>

              <HStack justifyContent="space-between" mt={2}>
                <Text fontWeight="bold">Distance:</Text>
                <Text>{order.distance} km</Text>
              </HStack>

              <HStack justifyContent="space-between" mt={2}>
                <Text fontWeight="bold">Earnings:</Text>
                <Text color="green.600" fontWeight="bold">
                  ₦
                  {(
                    Number(order.riderEarnings) + Number(order.deliveryFee)
                  ).toLocaleString()}
                </Text>
              </HStack>
            </Box>

            {/* Order Items */}
            <Box>
              <Text fontWeight="bold" mb={2}>
                Items:
              </Text>
              {order.items.map((item, index) => (
                <Text key={index} ml={2}>
                  • {item.quantity}x {item.name}
                </Text>
              ))}
            </Box>

            {/* Special Instructions */}
            {order.specialInstructions && (
              <Box bg="amber.50" p={3} borderRadius="md">
                <Text fontWeight="bold" color="amber.700">
                  Special Instructions:
                </Text>
                <Text mt={1}>{order.specialInstructions}</Text>
              </Box>
            )}

            {/* Pickup Information */}
            <LocationSection
              title="Pickup Location"
              address={order?.pickupLocation?.address}
              name={order?.pickupLocation?.restaurant?.name}
              phone={order?.pickupLocation?.restaurant?.phone}
              coords={pickupCoords}
            />

            {/* Delivery Information */}
            <LocationSection
              title="Delivery Location"
              address={order?.deliveryLocation?.address}
              name={order?.deliveryLocation?.customer?.name}
              phone={order?.deliveryLocation?.customer?.phone}
              coords={deliveryCoords}
            />

            {renderActionButtons()}
          </VStack>
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Reusable Location Component remains the same as previous example
// ... (LocationSection component code from previous example)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
    padding: 10,
  },
  header: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
});

export default OrderDetailsScreen;

// Reusable Location Component
export const LocationSection = ({title, address, name, phone, coords}) => {
  const handleGetDirections = coords => {
    const {latitude, longitude} = coords;

    if (Platform.OS === 'ios') {
      // Try Apple Maps first
      const appleMapsUrl = `http://maps.apple.com/?daddr=${latitude},${longitude}`;
      Linking.openURL(appleMapsUrl).catch(() => {
        // Fallback to Google Maps if Apple Maps fails
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        Linking.openURL(googleMapsUrl);
      });
    } else {
      // Default to Google Maps for Android
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      Linking.openURL(googleMapsUrl);
    }
  };

  const handleContact = phone => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <>
      <Divider my={2} />
      <Box>
        <Text fontSize="lg" fontWeight="bold" mb={2}>
          {title}
        </Text>
        <Text>{address}</Text>
        <Text color="gray.500" mt={1}>
          {name}
        </Text>
        <HStack space={2} mt={3}>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Icon as={Ionicons} name="navigate" />}
            onPress={() => handleGetDirections(coords)}
            flex={1}>
            Directions
          </Button>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Icon as={Ionicons} name="call" />}
            onPress={() => handleContact(phone)}
            flex={1}
            isDisabled={!phone}>
            Call
          </Button>
        </HStack>
      </Box>
    </>
  );
};
