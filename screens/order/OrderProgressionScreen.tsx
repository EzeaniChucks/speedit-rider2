import React from 'react';
import {
  StyleSheet,
  Linking,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import {ScrollView} from 'react-native';
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Badge,
  Icon,
  Progress,
} from 'native-base';
import {
  useAcceptOrderMutation,
  useConfirmVendorPaymentMutation,
  useUpdateOrderStatusMutation,
} from '../../store/ordersApi';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useDispatch, useSelector} from 'react-redux';
import {setSelectedOrder} from '../../store/ordersSlice';
import DeliveryAnimation from '../../components/animatedDelivery';
import Header from '../../components/header';
// import type {Order} from '../types/orderTypes'; // Assuming you have this type

type OrderProgressScreenProps = {
  route: any;
  navigation: any;
};

type StatusFlowItem = {
  next: string | null;
  action: string;
  color: string;
};

const OrderProgressScreen: React.FC<OrderProgressScreenProps> = ({
  route,
  navigation,
}) => {
  const {selectedOrder: order} = useSelector((state: any) => state.orders);
  const dispatch = useDispatch();

  // RTK Query mutations
  const [acceptOrder, {isLoading: isAccepting}] = useAcceptOrderMutation();
  const [updateStatus, {isLoading: isUpdating}] =
    useUpdateOrderStatusMutation();
  const [confirmPayment, {isLoading: isConfirming}] =
    useConfirmVendorPaymentMutation();

  // Updated status progression configuration
  const STATUS_FLOW: Record<string, StatusFlowItem> = {
    pending: {next: 'accepted', action: 'Accept', color: 'warning'},
    accepted: {
      next: 'heading_to_restaurant',
      action: 'Start Trip',
      color: 'info',
    },
    heading_to_restaurant: {
      next: 'arrived_at_restaurant',
      action: 'Arrived at Restaurant',
      color: 'info',
    },
    arrived_at_restaurant: {
      next: 'picked_up',
      action: 'Pick Up Order',
      color: 'primary',
    },
    picked_up: {
      next: 'in_transit',
      action: 'Start Delivery',
      color: 'primary',
    },
    in_transit: {
      next: 'delivered',
      action: 'Complete Delivery',
      color: 'success',
    },
    delivered: {next: null, action: 'Done', color: 'success'},
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      if (newStatus === 'accepted') {
        const result = await acceptOrder(order.id).unwrap();
        dispatch(setSelectedOrder(result?.data));
      } else {
        const result = await updateStatus({
          orderId: order.id,
          status: newStatus,
        }).unwrap();
        dispatch(setSelectedOrder(result?.data));

        if (newStatus === 'delivered') {
          navigation.replace('DeliveryAcknowledgement', {
            order: result.data,
            animation: 'fade',
          });
        }
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.data?.data ||
          error.data?.error ||
          'Failed to update order status',
      );
    }
  };

  const handleConfirmPayment = async () => {
    try {
      const result = await confirmPayment(order.id).unwrap();
      dispatch(setSelectedOrder(result?.data));
      Alert.alert('Success', 'Vendor payment confirmed!');
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.data?.data || error.data?.error || 'Failed to confirm payment',
      );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'accepted':
        return 'checkmark-circle';
      case 'heading_to_restaurant':
        return 'car';
      case 'arrived_at_restaurant':
        return 'location';
      case 'picked_up':
        return 'fast-food';
      case 'in_transit':
        return 'bicycle';
      case 'delivered':
        return 'checkmark-done';
      default:
        return 'alert-circle';
    }
  };

  const renderActionButton = () => {
    const currentStatus = STATUS_FLOW[order.status];
    if (!currentStatus?.next) return null;

    return (
      <Button
        colorScheme={currentStatus.color}
        leftIcon={<Icon as={Ionicons} name={getStatusIcon(order.status)} />}
        onPress={() => handleStatusUpdate(currentStatus.next as string)}
        isLoading={isAccepting || isUpdating}
        mt={1}>
        {currentStatus.action}
      </Button>
    );
  };

  const renderProgressSteps = () => {
    const steps = [
      'accepted',
      'heading_to_restaurant',
      'arrived_at_restaurant',
      'picked_up',
      'in_transit',
      'delivered',
    ];
    const currentIndex = steps.indexOf(order.status);

    return (
      <VStack space={2} mt={4}>
        <Progress
          value={Math.round(((currentIndex + 1) / steps.length) * 100)}
          colorScheme="teal"
        />
        <HStack justifyContent="space-between">
          {steps.map((step, index) => (
            <VStack
              alignItems="center"
              key={step}
              flex={index === currentIndex ? 2 : 1} // Current step takes more space
            >
              <Icon
                as={Ionicons}
                name={getStatusIcon(step)}
                color={index <= currentIndex ? 'teal.500' : 'gray.300'}
                size={index === currentIndex ? 'md' : 'sm'}
              />
              <Text
                fontSize={index === currentIndex ? 'xs' : '2xs'}
                numberOfLines={1}
                color={index <= currentIndex ? 'teal.500' : 'gray.400'}>
                {index === currentIndex
                  ? step.split('_').join(' ')
                  : // step.split('_').map(w => w[0]).join('')
                    ''}
              </Text>
            </VStack>
          ))}
        </HStack>
      </VStack>
    );
  };

  const statusImages = {
    pending: require('../../assests/orderStatusImages/pending.png'),
    accepted: require('../../assests/orderStatusImages/accepted.png'),
    heading_to_restaurant: require('../../assests/orderStatusImages/in_transit.png'),
    arrived_at_restaurant: require('../../assests/orderStatusImages/accepted.png'),
    picked_up: require('../../assests/orderStatusImages/picked_up.png'),
    in_transit: require('../../assests/orderStatusImages/in_transit.png'),
    delivered: require('../../assests/orderStatusImages/delivered.png'),
  };

  const getStatusImage = (status: string) =>
    statusImages[status as keyof typeof statusImages] || statusImages.pending;

  const riderHasReachedOrLeftRestaurant =
    order.status === 'arrived_at_restaurant' ||
    order.status === 'picked_up' ||
    order.status === 'in_transit' ||
    order.status === 'delivered';

  return (
    <Box flex={1} bg="white">
      <Header title={'Order Progress'} />

      {/* Animated Delivery Image Section */}
      <Box alignItems="center" justifyContent="center" height="20%" px={4}>
        {order.status === 'in_transit' ||
        order.status === 'heading_to_restaurant' ? (
          <DeliveryAnimation status={order.status} />
        ) : (
          <Image
            source={getStatusImage(order.status)}
            style={styles.statusImage}
          />
        )}
      </Box>

      {/* Content Section */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <VStack space={4}>
          {/* Order Status */}
          <Badge
            colorScheme={STATUS_FLOW[order.status]?.color || 'coolGray'}
            alignSelf="flex-start">
            {order.status.toUpperCase().split('_').join(' ')}
          </Badge>

          {/* Progress Tracker */}
          {renderProgressSteps()}

          {/* Order Summary */}
          <Box bg="gray.50" p={3} borderRadius="md">
            <HStack justifyContent="space-between">
              <Text fontWeight="bold">Order ID:</Text>
              <Text>{order.id.substring(0, 8)}...</Text>
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

          {/* Vendor Cash Payment */}
          {order.requiresVendorCashPayment && !order.vendorCashPaid && (
            <Box bg="red.50" p={3} borderRadius="md">
              <Text fontWeight="bold" color="red.700">
                This Restaurant Requires Cash From You
              </Text>
              <Text mt={1}>
                Please give ₦{order?.subTotal} to the restaurant
              </Text>
              <Text color="gray.500" mt={1}>
                Speedit will settle this amount to your wallet on order
                completion
              </Text>
              <Button
                colorScheme="amber"
                mt={2}
                onPress={handleConfirmPayment}
                disabled={isConfirming}
                leftIcon={<Icon as={Ionicons} name="cash" />}>
                {isConfirming ? (
                  <HStack space={2}>
                    <ActivityIndicator color="white" />
                    <Text color="white">Confirming</Text>
                  </HStack>
                ) : (
                  'Confirm Cash Payment'
                )}
              </Button>
            </Box>
          )}

          {/* Secondary Actions */}
          <VStack space={2} mt={1}>
            <HStack space={2}>
              <Button
                variant="outline"
                flex={1}
                leftIcon={<Icon as={Ionicons} name="call" />}
                onPress={() =>
                  Linking.openURL(
                    `tel:${
                      order?.deliveryLocation?.customer?.phone || '08067268692'
                    }`,
                  )
                }>
                Call Customer
              </Button>
              <Button
                variant="outline"
                flex={1}
                leftIcon={<Icon as={Ionicons} name="call" />}
                onPress={() =>
                  Linking.openURL(
                    `tel:${
                      order?.pickupLocation?.restaurant?.phone || '08067268692'
                    }`,
                  )
                }>
                Call Restaurant
              </Button>
            </HStack>
            <HStack>
              <Button
                variant="outline"
                flex={1}
                leftIcon={<Icon as={Ionicons} name="navigate" />}
                onPress={() => {
                  const coords = riderHasReachedOrLeftRestaurant
                    ? order.deliveryLocation.coordinates
                    : order.pickupLocation.coordinates;
                  Linking.openURL(
                    `https://www.google.com/maps/dir/?api=1&destination=${coords[0]},${coords[1]}`,
                  );
                }}>
                {riderHasReachedOrLeftRestaurant
                  ? 'To Customer'
                  : 'To Restaurant'}
              </Button>
            </HStack>
          </VStack>

          {/* Primary Action Button */}
          {renderActionButton()}
        </VStack>
      </ScrollView>
    </Box>
  );
};

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
  },
  scrollContent: {
    flex: 1,
    flexGrow: 1,
    padding: 20,
    paddingBottom: 24,
  },
  statusImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    borderRadius: 12,
  },
});

export default OrderProgressScreen;
