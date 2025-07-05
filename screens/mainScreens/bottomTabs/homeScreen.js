import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import FontAwesome from '@react-native-vector-icons/fontawesome6';
import { navigate } from '../../../NavigationService';
import {
  useGetWalletBalanceQuery,
  useGetWalletTransactionsQuery,
} from '../../../store/ordersApi';
import { formatDate } from '../../../util/date';
import UserProfileCard from '../../../components/userProfileCard';
import { useFocusEffect } from '@react-navigation/native';
import { formatCurrency } from '../../../util/helpers';
import { useDispatch, useSelector } from 'react-redux';
import { updateFcmToken } from '../../../store/authSlice';

const DashboardScreen = () => {
  // const {user} = useSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const { fcmToken, token, user } = useSelector(state => state.auth);

  // Add refetch functions from the queries
  const {
    data: balanceData,
    refetch: refetchBalance,
    isFetching: balanceIsFetching,
  } = useGetWalletBalanceQuery();

  const {
    data: transactions,
    refetch: refetchTransactions,
    isFetching: transactionsIsFetching,
  } = useGetWalletTransactionsQuery({
    page: 1,
    limit: 3,
  });

  const wallet = balanceData?.data;

  const briefTransactionHistory = transactions?.data?.transactions;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Refetch both wallet balance and transactions
      await Promise.all([refetchBalance(), refetchTransactions()]);
    } finally {
      setRefreshing(false);
    }
  };

  // // This will run whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (wallet) {
        // Only refetch if wallet exists
        handleRefresh();
      }
      setIsLoading(false);
    }, [wallet]),
  );

  useEffect(() => {
    if (fcmToken && token) {
      // console.log('from my hone screen', fcmToken, token);
      //send rider's fcmToken to server during every Home Screen visit
      dispatch(updateFcmToken({ fcmToken, token }));
      // This is necessary to keep database value updated in case user changes devices
    }
  }, [fcmToken, token]);

  if (isLoading || balanceIsFetching || transactionsIsFetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#008080" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#00796B']} // Teal color to match your theme
            tintColor="#00796B"
          />
        }
      >
        {/* Header with Profile and Refresh Button */}
        <View style={styles.header}>
          <UserProfileCard />
        </View>

        <View style={styles.mainSection}>
          {/* Wallet Balance Section */}
          <View style={styles.balanceContainer}>
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceLabel}>Wallet Balance</Text>
              <Text
                onPress={() => navigate('MainApp', { screen: 'Analytics' })}
                style={styles.analytics}
              >
                View analytics
              </Text>
            </View>
            {/* <Text style={styles.balanceAmount}>
              ₦{wallet?.balance?.toLocaleString() || '0'}
            </Text>
            <Text style={styles.balanceAmount}>
              ₦{wallet?.pendingBalance?.toLocaleString() || '0'}
            </Text> */}
            <View style={styles.walletAmountContainer}>
              <Text style={styles.walletAmount}>
                {formatCurrency(wallet?.balance || 0)}
              </Text>
              <View style={styles.walletTrendIndicator}>
                <Icon name="trending-up" size={16} color="#4CAF50" />
                <Text style={styles.trendText}>2.5% this week</Text>
              </View>
            </View>

            <View style={styles.pendingBalanceContainer}>
              <View style={styles.pendingBalancePill}>
                <Text style={styles.pendingLabel}>Pending:</Text>
                <Text style={styles.pendingAmount}>
                  {formatCurrency(wallet?.pendingBalance || 0)}
                </Text>
                <View style={styles.pendingTooltip}>
                  <Icon name="information-circle" size={14} color="#666" />
                </View>
              </View>
            </View>

            <View style={styles.walletActions}>
              <TouchableOpacity
                style={[styles.walletButton, styles.fundButton]}
                onPress={() => navigate('WalletFund')}
              >
                <FontAwesome
                  name="money-bill-transfer"
                  size={16}
                  color="white"
                  iconStyle="solid"
                />
                <Text style={styles.walletButtonText}>Fund Wallet</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.walletButton, styles.withdrawButton]}
                onPress={() => navigate('WalletWithdrawal')}
              >
                <FontAwesome
                  name="money-bill-trend-up"
                  size={16}
                  color="white"
                  iconStyle="solid"
                />
                <Text style={styles.walletButtonText}>Withdraw</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Get Orders Button */}
          <TouchableOpacity
            onPress={() => navigate('RiderActiveOrders')}
            style={styles.primaryButton}
          >
            <Text style={styles.buttonText}>Get Nearby Orders</Text>
            <Icon
              name="arrow-forward-circle"
              size={20}
              color="white"
              style={styles.buttonIcon}
            />
          </TouchableOpacity>

          {/* Transactions History */}
          <View style={styles.transactionsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              <View style={styles.transactionHeaderActions}>
                {balanceIsFetching ? (
                  <ActivityIndicator />
                ) : (
                  <TouchableOpacity onPress={handleRefresh}>
                    <Icon name="refresh" size={18} color="#00796B" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => navigate('TransactionHistory')}
                >
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Transactions list */}
            <View style={styles.transactionList}>
              {briefTransactionHistory?.map(item => (
                <View key={item.id} style={styles.transactionItem}>
                  <View style={styles.transactionIcon}>
                    <FontAwesome
                      name={
                        item.purpose === 'wallet_funding'
                          ? 'money-bill-wave'
                          : 'truck-fast'
                      }
                      size={20}
                      color="#00796B"
                      iconStyle="solid"
                    />
                  </View>
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionTitle}>
                      {item?.purpose?.split('_').join(' ')}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {formatDate(item.createdAt)}
                    </Text>
                  </View>
                  <View style={styles.transactionInfoContainer}>
                    <Text
                      style={
                        item.type === 'credit'
                          ? styles.transactionCreditAmount
                          : styles.transactionDebitAmount
                      }
                    >
                      {item.type === 'credit'
                        ? `₦${item?.amount}`
                        : `- ₦${item.amount}`}
                    </Text>
                    <Text
                      style={{
                        color: 'gray',
                        textTransform: 'capitalize',
                        marginRight: 3,
                        fontSize: 12,
                      }}
                    >
                      {item?.status}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#008080',
    marginBottom: 16,
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    marginBottom: 80,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButton: {
    padding: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  refreshIcon: {
    padding: 4,
  },
  mainSection: {
    flex: 1,
    gap: 10,
    justifyContent: 'space-between',
  },
  balanceContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#616161',
    marginBottom: 5,
  },
  analytics: {
    fontSize: 14,
    color: 'teal',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#00796B',
    marginBottom: 20,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  walletTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#008080',
    marginLeft: 8,
  },
  walletAmountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 5,
  },
  walletAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    letterSpacing: 0.5,
  },
  walletTrendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
  },
  pendingBalanceContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
    paddingTop: 12,
    paddingBottom: 16,
  },
  pendingBalancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 128, 128, 0.08)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  pendingLabel: {
    fontSize: 13,
    color: '#666',
    marginRight: 6,
  },
  pendingAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#008080',
  },
  pendingTooltip: {
    marginLeft: 6,
    opacity: 0.7,
  },
  walletActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    width: '48%',
  },
  fundButton: {
    backgroundColor: '#00796B',
  },
  withdrawButton: {
    backgroundColor: '#00897B',
  },
  walletButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  primaryButton: {
    backgroundColor: '#00796B',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  transactionsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 25,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
  },
  seeAllText: {
    color: '#00796B',
    fontWeight: '600',
  },
  transactionList: {
    marginTop: 10,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionIcon: {
    backgroundColor: '#e0f2f1',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '600',
    textTransform: 'capitalize',
    color: '#212121',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#757575',
  },
  transactionInfoContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    paddingLeft: 3,
  },
  transactionCreditAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00796B',
  },
  transactionDebitAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: 'tomato',
  },
});

export default DashboardScreen;
