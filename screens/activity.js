import React, {useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Icon from '@react-native-vector-icons/evil-icons'; // Make sure this is correct, or use another icon set
import AntDesignIcon from '@react-native-vector-icons/ant-design';
import {HStack, Pressable} from 'native-base';
import {useDispatch, useSelector} from 'react-redux';
import {fetchWalletTransactions} from '../store/wallet';
import {useNavigation, useFocusEffect} from '@react-navigation/native';

const RecentActivity = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {transactions, transactionStatus, transactionError} = useSelector(
    state => state.wallet,
  );
  console.log(
    'Transactions:',
    transactions,
    'Status:',
    transactionStatus,
    'Error:',
    transactionError,
  );
  // Fetch only a few recent transactions for the dashboard
  useFocusEffect(
    useCallback(() => {
      dispatch(fetchWalletTransactions({limit: 5, page: 1}));
    }, [dispatch]),
  );

  const renderActivityItem = ({item}) => (
    <TouchableOpacity
      style={styles.activityItem}
      // onPress={() => navigation.navigate('TransactionDetails', { transactionId: item.id })} // Optional: navigate to details
    >
      <AntDesignIcon
        name={item.type === 'credit' ? 'pluscircleo' : 'minuscircleo'}
        size={24}
        color={item.type === 'credit' ? 'teal' : 'crimson'}
      />
      <View style={styles.activityDetails}>
        <Text style={styles.activityTitle} numberOfLines={1}>
          {item.description || `Transaction ${item.id}`}
        </Text>
        <Text style={styles.activityAmount}>
          {item.type === 'credit' ? '+' : '-'} $
          {parseFloat(item.amount).toFixed(2)}
        </Text>
      </View>
      <Text style={styles.activityDate}>
        {new Date(item.createdAt || item.date).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <HStack justifyContent={'space-between'} alignItems={'center'} mb={2}>
        <Text style={styles.header}>Recent Activity</Text>
        <Pressable
          p={2}
          onPress={() => navigation.navigate('TransactionHistory')} // Navigate to full list
          _pressed={{bg: 'teal.200'}} // NativeBase specific
          rounded="md">
          <Text style={{fontSize: 14, color: 'teal', fontWeight: 'bold'}}>
            Show More
          </Text>
        </Pressable>
      </HStack>
      {transactionStatus === 'loading' && transactions.length === 0 && (
        <ActivityIndicator color="teal" />
      )}
      {transactionError && transactions.length === 0 && (
        <Text>Error loading activities.</Text>
      )}
      {transactions.length > 0 && (
        <FlatList
          data={transactions.slice(0, 5)} // Show only first 5 or so
          renderItem={renderActivityItem}
          keyExtractor={(item, index) =>
            item.id?.toString() || `recent-${index}`
          }
          scrollEnabled={false} // If it's a short list within a ScrollView
        />
      )}
      {transactionStatus !== 'loading' && transactions.length === 0 && (
        <Text>No recent activity.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 3,
    marginTop: 20,
  },
  header: {fontSize: 20, fontWeight: 'bold', marginBottom: 10},
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  activityDetails: {marginLeft: 12, flex: 1},
  activityTitle: {fontSize: 15, fontWeight: '500'},
  activityAmount: {fontSize: 14, color: '#555'},
  activityDate: {fontSize: 12, color: '#888'},
});

export default RecentActivity;
