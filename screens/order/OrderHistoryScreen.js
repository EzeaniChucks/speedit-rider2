import React from 'react';
import {StyleSheet, FlatList, ActivityIndicator} from 'react-native';
import {Text, Box, VStack, HStack, Pressable, Badge} from 'native-base';
import Icon from '@react-native-vector-icons/ionicons';
import Header from '../../components/header';
import { useGetOrderHistoryQuery } from '../../store/ordersApi';

const OrderHistoryScreen = ({navigation}) => {
  const {
    data: orderHistory,
    isLoading,
    isError,
    refetch,
  } = useGetOrderHistoryQuery({
    page: 1,
    limit: 10,
  });

  // console.log("order history", orderHistory)

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = value => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `₦${num.toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getStatusColor = status => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return 'success';
      case 'cancelled':
      case 'rejected':
        return 'error';
      case 'in_transit':
        return 'warning';
      default:
        return 'info';
    }
  };

  const renderItem = ({item}) => {
    // Calculate total amount (riderEarnings + deliveryFee)
    const amount = (
      parseFloat(item.riderEarnings) + parseFloat(item.deliveryFee)
    ).toFixed(2);

    return (
      <Pressable
        onPress={() => {
          navigation.navigate('OrderDetails', {
            orderId: item.id,
            isHistory: item.status === 'delivered',
          });
        }}
        borderWidth={1}
        borderColor="gray.200"
        borderRadius="lg"
        p={4}
        mb={3}
        bg="white"
        shadow={1}>
        <VStack space={2}>
          <HStack justifyContent="space-between" alignItems="center">
            <Text fontSize="lg" fontWeight="bold" color="primary.600">
              {item?.restaurant?.name || 'Unknown Restaurant'}
            </Text>
            <Badge colorScheme={getStatusColor(item?.status)}>
              {item?.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </HStack>

          <HStack space={2} alignItems="center">
            <Icon name="location-outline" size={16} color="#666" />
            <Text color="gray.600">
              {item?.restaurant?.address || 'No address provided'}
            </Text>
          </HStack>

          <HStack space={2} alignItems="center">
            <Icon name="calendar-outline" size={16} color="#666" />
            <Text color="gray.600">{formatDate(item?.createdAt)}</Text>
          </HStack>

          <HStack justifyContent="space-between" mt={2}>
            <Box>
              <Text fontSize="sm" color="gray.500">
                Items:
              </Text>
              <Text fontSize="sm">
                {item?.items?.map(i => i.name).join(', ') || 'No items listed'}
              </Text>
            </Box>
            <Text fontSize="lg" fontWeight="bold">
              {formatCurrency(amount)}
            </Text>
          </HStack>
        </VStack>
      </Pressable>
    );
  };

  if (isLoading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size={40} color={'teal'} />
        <Text>Loading order history...</Text>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <Text color="danger.500">Failed to load order history</Text>
        <Pressable onPress={refetch} mt={4}>
          <Text color="primary.600">Try Again</Text>
        </Pressable>
      </Box>
    );
  }

  return (
    <Box flex={1} p={4} bg="gray.50">
      <Header title="Order History" />

      {orderHistory?.data?.data?.length === 0 ? (
        <Box flex={1} justifyContent="center" alignItems="center">
          <Icon name="time-outline" size={48} color="#ccc" />
          <Text mt={4} color="gray.500">
            No order history yet
          </Text>
        </Box>
      ) : (
        <FlatList
          data={orderHistory?.data?.data || []}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 20}}
          refreshing={isLoading}
          onRefresh={refetch}
        />
      )}
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});

export default OrderHistoryScreen;
