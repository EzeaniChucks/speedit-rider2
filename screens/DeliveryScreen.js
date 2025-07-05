import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import MaterialIcons from '@react-native-vector-icons/ionicons'; // Ensure you have this package installed
import {HStack, Pressable} from 'native-base';
import Icon from '@react-native-vector-icons/ant-design';
import {useUpdateOrderStatusMutation} from '../store/api'; // Adjust path
const DeliveryScreen = ({navigation}) => {
  // const navigation = useNavigation();
  const route = useRoute();
  const {order} = route.params; // Get the full order object from the previous screen

  const [updateStatus, {isLoading: isUpdatingStatus}] =
    useUpdateOrderStatusMutation();

  const handleMarkDelivered = async () => {
    try {
      await updateStatus({orderId: order.id, status: 'delivered'}).unwrap();
      Alert.alert(
        'Order Complete!',
        'You have successfully delivered the order.',
        [
          {text: 'OK', onPress: () => navigation.navigate('RiderActiveOrders')}, // Go back to the main screen
        ],
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to mark order as delivered.');
    }
  };

  const renderItem = (item, index) => (
    <View style={styles.itemContainer} key={index}>
      <Text style={styles.itemName}>
        {item.quantity}x {item.name}
      </Text>
    </View>
  );
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <HStack justifyContent={'space-between'} alignItems="center" mb={4}>
          <Pressable onPress={() => navigation.goBack()} p={2}>
            <Icon name="arrowleft" size={24} color="teal" />
          </Pressable>
          <Text style={styles.header} numberOfLines={1}>
            Deliver: {order.id}
          </Text>
        </HStack>
        <Text style={styles.deliveryTitle}>Deliver to:</Text>

        <View style={styles.card}>
          <Text style={styles.deliverName}>
            {order.customer.firstName} {order.customer.lastName}
          </Text>
          <TouchableOpacity style={styles.contactContainer}>
            <MaterialIcons name="phone" size={24} color="teal" />
          </TouchableOpacity>
          <Text style={styles.address}>{order.deliveryAddress}</Text>
        </View>
        <Text style={styles.itemsTitle}>Items ({order.items.length})</Text>

        {order.items.map(renderItem)}

        <Text style={styles.greenText}>
          Given {order.items.length} item(s) to customer
        </Text>
        <Text style={styles.infoText}>
          {order.specialInstructions
            ? `Special Instructions: ${order.specialInstructions}`
            : 'No special instructions for delivery.'}
        </Text>
      </ScrollView>

      <TouchableOpacity
        style={styles.button}
        onPress={handleMarkDelivered}
        disabled={isUpdatingStatus}>
        {isUpdatingStatus ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Mark Order Delivered</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const renderItem = (itemName, itemCount) => (
  <View style={styles.itemContainer}>
    <Text style={styles.itemName}>{itemName}</Text>
    <Text style={styles.itemCount}>Items: {itemCount}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  scrollContainer: {padding: 16},
  header: {flex: 1, fontSize: 16, fontWeight: 'bold', textAlign: 'center'},
  deliveryTitle: {fontSize: 16, fontWeight: 'bold', marginTop: 10},
  card: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  deliverName: {fontSize: 18, fontWeight: 'bold'},
  contactContainer: {position: 'absolute', right: 16, top: 16},
  address: {fontSize: 14, color: 'gray', marginTop: 5},
  itemsTitle: {fontSize: 16, fontWeight: 'bold', marginTop: 16},
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 12,
  },
  itemName: {fontSize: 16},
  greenText: {color: 'green', marginVertical: 8, fontWeight: 'bold'},
  infoText: {
    fontSize: 12,
    color: 'gray',
    marginVertical: 8,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#FF3D00',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    margin: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 16,
  },
  timeStamp: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  deliveryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderID: {
    fontSize: 12,
    color: 'gray',
  },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  deliverName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactContainer: {
    marginVertical: 4,
  },
  address: {
    fontSize: 14,
    color: 'gray',
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 8,
  },
  itemName: {
    fontSize: 14,
  },
  itemCount: {
    fontSize: 14,
    color: 'gray',
  },
  greenText: {
    color: 'green',
    marginVertical: 8,
  },
  infoText: {
    fontSize: 12,
    color: 'gray',
    marginVertical: 8,
  },
  button: {
    backgroundColor: '#FF3D00',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    margin: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default DeliveryScreen;
