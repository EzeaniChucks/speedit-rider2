// screens/DeliveryAcknowledgement.js
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Box, Text, Button, VStack, HStack, Badge, Icon} from 'native-base';
import Ionicons from '@react-native-vector-icons/ionicons';

const DeliveryAcknowledgement = ({route, navigation}) => {
  const {order} = route.params || {};

  // Calculate total earnings
  const totalEarnings =
    Number(order.riderEarnings) +
    Number(order.deliveryFee) +
    (order.requiresVendorCashPayment ? Number(order?.subTotal) : 0);
  const formattedEarnings = totalEarnings.toLocaleString();

  return (
    <Box flex={1} bg="white" p={6}>
      {/* Celebration Header */}
      <VStack alignItems="center" space={4} mb={8}>
        <Box bg="green.100" p={4} borderRadius="full">
          <Icon
            as={Ionicons}
            name="checkmark-done"
            size="2xl"
            color="green.600"
          />
        </Box>
        <Text fontSize="2xl" fontWeight="bold">
          Delivery Completed!
        </Text>
        {/* Fun Celebration Element */}
        <Box mb={2} alignItems="center">
          <Text fontSize="sm" color="gray.400">
            {getRandomCelebrationMessage()}
          </Text>
        </Box>
        <Text color="gray.500" textAlign="center">
          You've successfully delivered the order to{' '}
          {order.deliveryLocation.customer.name}
        </Text>
      </VStack>

      {/* Earnings Breakdown */}
      <Box bg="gray.50" p={4} borderRadius="md" mb={6}>
        <Text fontSize="lg" fontWeight="bold" mb={3}>
          Earnings Summary
        </Text>

        <VStack space={3}>
          <HStack justifyContent="space-between">
            <Text>Delivery Fee</Text>
            <Text fontWeight="medium">
              ₦{order.deliveryFee.toLocaleString()}
            </Text>
          </HStack>
          <HStack justifyContent="space-between">
            <Text>Rider Earnings</Text>
            <Text fontWeight="medium">
              ₦{order.riderEarnings.toLocaleString()}
            </Text>
          </HStack>
          {order.requiresVendorCashPayment && (
            <HStack justifyContent="space-between">
              <Text>Vendor Cashback Settlement</Text>
              <Text fontWeight="medium">
                ₦{Number(order?.subTotal).toLocaleString()}
              </Text>
            </HStack>
          )}
          <HStack justifyContent="space-between" mt={2}>
            <Text fontWeight="bold">Total</Text>
            <Text fontWeight="bold" color="green.600">
              ₦{formattedEarnings}
            </Text>
          </HStack>
        </VStack>
      </Box>

      {/* Rating Impact */}
      <Box bg="blue.50" p={4} borderRadius="md" mb={6}>
        <HStack alignItems="center" space={2}>
          <Icon as={Ionicons} name="star" color="amber.400" />
          <Text fontWeight="medium">
            +{order.riderRatingImpact} Rating Points
          </Text>
        </HStack>
        <Text mt={2} fontSize="sm" color="gray.500">
          Your excellent service has improved your rider profile
        </Text>
      </Box>

      {/* Next Steps */}
      <VStack space={3} mt={4}>
        <Button
          colorScheme="teal"
          leftIcon={<Icon as={Ionicons} name="home" />}
          onPress={() => navigation.navigate('MainApp', {screen: 'Home'})}>
          Back to Home
        </Button>

        <Button
          variant="outline"
          leftIcon={<Icon as={Ionicons} name="wallet" />}
          onPress={() => navigation.navigate('MainApp', {screen: 'Analytics'})}>
          View Wallet Balance
        </Button>

        <Button
          variant="ghost"
          leftIcon={<Icon as={Ionicons} name="list" />}
          onPress={() => navigation.navigate('OrderList')}>
          See Order History
        </Button>
      </VStack>
    </Box>
  );
};

// Helper function for fun messages
function getRandomCelebrationMessage() {
  const messages = [
    'Another happy customer delivered!',
    'Guy, na correct man you be!',
    'Bro, you too much! Twale!',
    "You're on a roll! Keep it up!",
    'The road to success is paved with deliveries!',
    'Earnings unlocked! 🎉',
    'Your dedication is delivering results!',
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default DeliveryAcknowledgement;
